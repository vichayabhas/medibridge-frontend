/**
 * useVoiceTranscription Hook
 *
 * Real-time Thai speech-to-text using Web Speech API.
 * Production-grade with error handling, browser fallbacks, and PDPA compliance.
 *
 * Features:
 * - Web Speech API (th-TH) for Chrome/Edge
 * - Automatic browser detection and fallback
 * - PII masking for Thai phone numbers and IDs
 * - Secure context enforcement (HTTPS only)
 * - Memory-efficient transcript management
 */

import { useState, useCallback, useRef, useEffect } from "react";

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// Browser compatibility check
const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
};

// Secure context check (HTTPS required for microphone)
const isSecureContext = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.isSecureContext || location.protocol === "https:";
};

// PII masking patterns for Thai data
const PII_PATTERNS = {
  // Thai mobile numbers: 08x-xxx-xxxx, 09x-xxx-xxxx, 06x-xxx-xxxx
  phone: /0[689]\d{1}[-.]?\d{3}[-.]?\d{4}/g,
  // Thai national ID: x-xxxx-xxxxx-xx-x (13 digits)
  idCard: /\d{1}[-]?\d{4}[-]?\d{5}[-]?\d{2}[-]?\d{1}/g,
  // Email addresses
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
};

/**
 * Mask PII in transcript text
 * Replaces sensitive data with [MASKED]
 */
const maskPII = (text: string): string => {
  let masked = text;
  masked = masked.replace(PII_PATTERNS.phone, "[เบอร์โทร]");
  masked = masked.replace(PII_PATTERNS.idCard, "[เลขบัตร]");
  masked = masked.replace(PII_PATTERNS.email, "[อีเมล]");
  return masked;
};

export interface TranscriptSegment {
  id: string;
  text: string;
  isFinal: boolean;
  confidence: number;
  timestamp: number;
  speaker?: "pharmacist" | "patient";
}

interface UseVoiceTranscriptionOptions {
  isActive: boolean;
  language?: string;
  onTranscript?: (segments: TranscriptSegment[]) => void;
  onError?: (error: string) => void;
  enablePIIMasking?: boolean;
  maxSegments?: number;
}

interface UseVoiceTranscriptionReturn {
  segments: TranscriptSegment[];
  isRecording: boolean;
  isSupported: boolean;
  error: string | null;
  permissionDenied: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearTranscripts: () => void;
  lastTranscript: string;
}

export function useVoiceTranscription({
  isActive,
  language = "th-TH",
  onTranscript,
  onError,
  enablePIIMasking = true,
  maxSegments = 100,
}: UseVoiceTranscriptionOptions): UseVoiceTranscriptionReturn {
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const segmentsRef = useRef<TranscriptSegment[]>([]);
  const isSupported = isSpeechRecognitionSupported();

  // Keep ref in sync with state
  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  // Initialize Speech Recognition
  const initializeRecognition = useCallback(() => {
    if (!isSupported || !isSecureContext()) return null;

    const SpeechRecognitionConstructor =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) return null;

    const recognition = new SpeechRecognitionConstructor() as SpeechRecognition;
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
      setPermissionDenied(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results;
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < results.length; i++) {
        const result = results[i];
        const alternative = result[0];
        const transcript = enablePIIMasking
          ? maskPII(alternative.transcript)
          : alternative.transcript;

        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Create new segments
      const newSegments: TranscriptSegment[] = [];
      const timestamp = Date.now();

      if (finalTranscript.trim()) {
        const segment: TranscriptSegment = {
          id: `stt-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
          text: finalTranscript.trim(),
          isFinal: true,
          confidence: results[results.length - 1]?.[0]?.confidence ?? 0.9,
          timestamp,
        };
        newSegments.push(segment);
        setLastTranscript(finalTranscript.trim());
      }

      if (interimTranscript.trim() && newSegments.length === 0) {
        // Only add interim if no final in this batch
        const segment: TranscriptSegment = {
          id: `stt-${timestamp}-interim`,
          text: interimTranscript.trim(),
          isFinal: false,
          confidence: 0.7,
          timestamp,
        };
        newSegments.push(segment);
      }

      if (newSegments.length > 0) {
        setSegments((prev) => {
          // Remove previous interim result
          const filtered = prev.filter((s) => s.isFinal);
          // Add new segments
          const updated = [...filtered, ...newSegments];
          // FIFO cleanup if exceeding max
          if (updated.length > maxSegments) {
            return updated.slice(updated.length - maxSegments);
          }
          return updated;
        });

        onTranscript?.(newSegments);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMsg = event.error;
      let userError = "เกิดข้อผิดพลาดในการบันทึกเสียง";

      switch (errorMsg) {
        case "not-allowed":
        case "service-not-allowed":
          userError = "ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน กรุณาตรวจสอบการตั้งค่า";
          setPermissionDenied(true);
          break;
        case "no-speech":
          userError = "ไม่พบเสียงพูด กรุณาลองอีกครั้ง";
          break;
        case "network":
          userError = "ปัญหาเครือข่าย กรุณาตรวจสอบการเชื่อมต่อ";
          break;
        case "aborted":
          // User aborted, not an error
          return;
        default:
          userError = `ข้อผิดพลาด: ${errorMsg}`;
      }

      setError(userError);
      onError?.(userError);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      // Auto-restart if still active and not permission denied (for continuous listening)
      if (isActive && !error && !permissionDenied) {
        setTimeout(() => {
          try {
            // Check again before starting to avoid race conditions
            if (isActive && recognitionRef.current === recognition) {
              recognition.start();
            }
          } catch {
            // Already started or destroyed
          }
        }, 500); // Increased delay to prevent rapid toggling
      }
    };

    return recognition;
  }, [isSupported, language, enablePIIMasking, maxSegments, onTranscript, onError, isActive, error, permissionDenied]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError("เบราว์เซอร์นี้ไม่รองรับการบันทึกเสียง");
      return;
    }

    if (!isSecureContext()) {
      setError("ต้องใช้ HTTPS เพื่อบันทึกเสียง");
      return;
    }

    try {
      // Request microphone permission explicitly
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("ไม่ได้รับอนุญาตให้ใช้ไมโครโฟน");
      setPermissionDenied(true);
      return;
    }

    // Clean up previous instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
    }

    const recognition = initializeRecognition();
    if (!recognition) {
      setError("ไม่สามารถเริ่มการบันทึกเสียงได้");
      return;
    }

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch  {
      setError("ไม่สามารถเริ่มการบันทึกได้");
    }
  }, [isSupported, initializeRecognition]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Already stopped
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const clearTranscripts = useCallback(() => {
    setSegments([]);
    segmentsRef.current = [];
    setLastTranscript("");
  }, []);

  // Auto-start/stop based on isActive
  useEffect(() => {
    if (isActive) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      stopRecording();
    };
  }, [isActive, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
      }
    };
  }, []);

  return {
    segments,
    isRecording,
    isSupported,
    error,
    permissionDenied,
    startRecording,
    stopRecording,
    clearTranscripts,
    lastTranscript,
  };
}

export default useVoiceTranscription;
