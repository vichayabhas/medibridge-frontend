/**
 * useGeminiAudio Hook
 *
 * Fallback STT using Gemini 2.0 Flash audio input.
 * For browsers without Web Speech API (Firefox, older Safari).
 *
 * Features:
 * - Audio chunk recording (5-10 seconds)
 * - Gemini audio analysis for transcription
 * - PII masking
 * - Rate limiting (respects free tier)
 */

import { useState, useCallback, useRef, useEffect } from "react";
// Using native fetch API - consistent with src/lib/gemini.ts

// Rate limiting for free tier: 60 requests/min, 1,500/day
const RATE_LIMIT = {
  requestsPerMinute: 60,
  requestsPerDay: 1500,
  minIntervalMs: 1000, // 1 second between requests minimum
};

interface UseGeminiAudioOptions {
  isActive: boolean;
  apiKey: string;
  chunkDurationMs?: number;
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  enablePIIMasking?: boolean;
}

interface UseGeminiAudioReturn {
  isRecording: boolean;
  isProcessing: boolean;
  lastTranscript: string;
  error: string | null;
  quotaRemaining: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

// PII masking (same as useVoiceTranscription)
const maskPII = (text: string): string => {
  const patterns = {
    phone: /0[689]\d{1}[-.]?\d{3}[-.]?\d{4}/g,
    idCard: /\d{1}[-]?\d{4}[-]?\d{5}[-]?\d{2}[-]?\d{1}/g,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  };

  let masked = text;
  masked = masked.replace(patterns.phone, "[เบอร์โทร]");
  masked = masked.replace(patterns.idCard, "[เลขบัตร]");
  masked = masked.replace(patterns.email, "[อีเมล]");
  return masked;
};

export function useGeminiAudio({
  isActive,
  apiKey,
  chunkDurationMs = 10000, // 10 seconds default
  onTranscript,
  onError,
  enablePIIMasking = true,
}: UseGeminiAudioOptions): UseGeminiAudioReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState(RATE_LIMIT.requestsPerDay);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
// Use stable gemini-2.0-flash (1,500 requests/day free tier)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const apiKeyRef = useRef<string>(apiKey);
  const lastRequestTimeRef = useRef<number>(0);
  const dailyRequestsRef = useRef<number>(0);
  const lastResetRef = useRef<number>(Date.now());

  // Update API key ref when prop changes
  useEffect(() => {
    apiKeyRef.current = apiKey;
  }, [apiKey]);

  // Reset daily counter at midnight
  useEffect(() => {
    const checkReset = () => {
      const now = Date.now();
      const lastReset = lastResetRef.current;
      const dayInMs = 24 * 60 * 60 * 1000;

      if (now - lastReset > dayInMs) {
        dailyRequestsRef.current = 0;
        lastResetRef.current = now;
        setQuotaRemaining(RATE_LIMIT.requestsPerDay);
      }
    };

    const interval = window.setInterval(checkReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const processAudioChunk = useCallback(
    async (audioBlob: Blob) => {
      if (!apiKeyRef.current || apiKeyRef.current === "your_gemini_api_key_here") {
        setError("Gemini API key ไม่ถูกต้อง");
        return;
      }

      // Rate limiting check
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTimeRef.current;

      if (timeSinceLastRequest < RATE_LIMIT.minIntervalMs) {
        // Too soon, skip this chunk
        return;
      }

      if (dailyRequestsRef.current >= RATE_LIMIT.requestsPerDay) {
        setError("โควต้า Gemini หมดแล้ว (1,500 ครั้ง/วัน)");
        onError?.("Quota exceeded");
        return;
      }

      setIsProcessing(true);
      lastRequestTimeRef.current = now;

      try {
        // Convert blob to base64
        const reader = new FileReader();
        const base64Audio = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        });

        const prompt = `Transcribe this Thai audio to text. Only return the transcribed text, nothing else.
If you cannot understand or it's not Thai, return "[ไม่สามารถถอดความได้]".

Transcription:`;

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKeyRef.current}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(30000), // 30 second timeout
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: audioBlob.type || "audio/webm",
                    data: base64Audio,
                  },
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1024,
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          
          // Check for quota/rate limit errors
          if (response.status === 429 || errorText.includes("quota") || errorText.includes("RESOURCE_EXHAUSTED")) {
            dailyRequestsRef.current = RATE_LIMIT.requestsPerDay; // Mark as exhausted
            setQuotaRemaining(0);
            throw new Error("โควต้า Gemini หมดแล้ว (20 ครั้งต่อวันสำหรับโมเดลนี้). กรุณาลองใหม่พรุ่งนี้ หรือใช้ Chrome/Edge สำหรับการถอดความด้วย Web Speech API");
          }
          
          throw new Error(`Gemini API error: ${errorText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        if (text && text !== "[ไม่สามารถถอดความได้]") {
          const masked = enablePIIMasking ? maskPII(text) : text;
          setLastTranscript(masked);
          onTranscript?.(masked);
        }

        dailyRequestsRef.current++;
        setQuotaRemaining(RATE_LIMIT.requestsPerDay - dailyRequestsRef.current);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "ไม่สามารถถอดความเสียงได้";
        setError(errorMsg);
        onError?.(errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },
    [enablePIIMasking, onTranscript, onError]
  );

  const startRecording = useCallback(async () => {
    try {
      // Check quota first
      if (dailyRequestsRef.current >= RATE_LIMIT.requestsPerDay) {
        setError("โควต้า Gemini หมดแล้ว");
        return;
      }

      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 16000,
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          // Process when we have enough data
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          if (blob.size > 5000) {
            // Minimum 5KB
            processAudioChunk(blob);
            audioChunksRef.current = []; // Reset for next chunk
          }
        }
      };

      mediaRecorder.onerror = () => {
        setError("ข้อผิดพลาดในการบันทึกเสียง");
        onError?.("Recorder error");
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect 1-second chunks

      setIsRecording(true);
      setError(null);

      // Set up periodic processing interval
      intervalRef.current = window.setInterval(() => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          processAudioChunk(blob);
          audioChunksRef.current = [];
        }
      }, chunkDurationMs);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "ไม่สามารถเข้าถึงไมโครโฟนได้";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [chunkDurationMs, processAudioChunk, onError]);

  const stopRecording = useCallback(() => {
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Process any remaining audio
    if (audioChunksRef.current.length > 0) {
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";
      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      processAudioChunk(blob);
      audioChunksRef.current = [];
    }

    setIsRecording(false);
  }, [processAudioChunk]);

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

  return {
    isRecording,
    isProcessing,
    lastTranscript,
    error,
    quotaRemaining,
    startRecording,
    stopRecording,
  };
}

export default useGeminiAudio;
