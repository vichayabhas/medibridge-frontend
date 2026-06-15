// /**
//  * useSmartTranscription Hook
//  *
//  * Unified transcription hook with automatic fallback:
//  * 1. Web Speech API (Chrome/Edge - best performance, free)
//  * 2. Gemini Audio (Firefox/Safari - free tier)
//  * 3. Keyword simulation (fallback if both fail)
//  *
//  * Features:
//  * - Automatic browser detection and method selection
//  * - PII masking for all methods
//  * - Unified transcript interface
//  * - Rate limiting and quota tracking
//  */
'use client'
import React from "react";
import { useCallback } from "react";
import useVoiceTranscription, { TranscriptSegment } from "./useVoiceTranscription";

// import { useState, useCallback, useEffect, useRef } from "react";
// import { useVoiceTranscription, type TranscriptSegment } from "./useVoiceTranscription";
import { useGeminiAudio } from "./useGeminiAudio";

export type TranscriptionMethod = "web-speech" | "gemini-audio" | "simulated" | null;

interface UseSmartTranscriptionOptions {
  isActive: boolean;
  geminiApiKey: string;
  onTranscript?: (text: string, method: TranscriptionMethod) => void;
  onError?: (error: string) => void;
  chunkDurationMs?: number;
  enablePIIMasking?: boolean;
}

interface UseSmartTranscriptionReturn {
  // Unified transcript state
  transcript: string;
  segments: TranscriptSegment[];
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  
  // Method info
  activeMethod: TranscriptionMethod;
  fallbackReason: string | null;
  
  // Quota tracking (for Gemini)
  quotaRemaining: number;
  
  // Controls
  restart: () => void;
  clearTranscript: () => void;
}

// Check browser capabilities
const detectBestMethod = (): TranscriptionMethod => {
  if (typeof window === "undefined") return null;
  
  // Check secure context (HTTPS required for microphone)
  if (!window.isSecureContext && location.protocol !== "https:") {
    return null;
  }

  // Check Web Speech API support
  const hasSpeechRecognition = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
  
  if (hasSpeechRecognition) {
    return "web-speech";
  }

  // Fallback to Gemini Audio
  return "gemini-audio";
};

// // Simulated keyword detection for emergency fallback
// // const detectMedicalKeywords = (text: string): string[] => {
// //   const keywords: string[] = [];
// //   const lowerText = text.toLowerCase();
  
// //   const patterns: Record<string, string[]> = {
// //     "ปวดหัว": ["ปวดหัว", "headache"],
// //     "ปวดท้อง": ["ปวดท้อง", "stomach pain"],
// //     "มีไข้": ["มีไข้", "ไข้", "fever"],
// //     "ไอ": ["ไอ", "cough"],
// //     "เจ็บคอ": ["เจ็บคอ", "sore throat"],
// //     "คัดจมูก": ["คัดจมูก", "stuffy nose"],
// //     "แพ้": ["แพ้", "allergic", "allergy"],
// //     "เบาหวาน": ["เบาหวาน", "diabetes"],
// //     "ความดัน": ["ความดัน", "hypertension", "blood pressure"],
// //     "หัวใจ": ["หัวใจ", "heart"],
// //     "หอบ": ["หอบ", "หอบหืด", "asthma"],
// //     "ยา": ["ยา", "medication", "medicine"],
// //     "พารา": ["พารา", "พาราเซตามอล", "paracetamol"],
// //     "แอสไพริน": ["แอสไพริน", "aspirin"],
// //     "แก้ปวด": ["แก้ปวด", "painkiller"],
// //     "แก้ไข้": ["แก้ไข้", "antipyretic"],
// //     "คลื่นไส้": ["คลื่นไส้", "nausea"],
// //     "อาเจียน": ["อาเจียน", "vomit"],
// //     "ท้องเสีย": ["ท้องเสีย", "diarrhea"],
// //     "ผื่น": ["ผื่น", "rash"],
// //     "คัน": ["คัน", "itch"],
// //   };

// //   Object.entries(patterns).forEach(([symptom, words]) => {
// //     if (words.some(word => lowerText.includes(word))) {
// //       keywords.push(symptom);
// //     }
// //   });

// //   return [...new Set(keywords)]; // Remove duplicates
// // };

export function useSmartTranscription({
  isActive,
  geminiApiKey,
  onTranscript,
  onError,
  chunkDurationMs = 10000,
  enablePIIMasking = true,
}: UseSmartTranscriptionOptions): UseSmartTranscriptionReturn {
  const [activeMethod, setActiveMethod] = React.useState<TranscriptionMethod>(null);
  const [fallbackReason, setFallbackReason] = React.useState<string | null>(null);
  const [combinedTranscript, setCombinedTranscript] = React.useState("");
  const transcriptRef = React.useRef("");
  const lastFallbackTime = React.useRef<number>(0);
  const fallbackAttempts = React.useRef<number>(0);
  const MAX_FALLBACK_ATTEMPTS = 2; // Max 2 fallbacks (web-speech → gemini → simulated)
  const FALLBACK_COOLDOWN_MS = 5000; // 5 seconds between fallbacks

  // Detect best method on mount
  React.useEffect(() => {
    const method = detectBestMethod();
    setActiveMethod(method);
    if (!method) {
      setFallbackReason("เบราว์เซอร์หรือสภาพแวดล้อมไม่รองรับการบันทึกเสียง");
    }
  }, []);

  // Reset fallback counter when isActive changes
  React.useEffect(() => {
    if (isActive) {
      fallbackAttempts.current = 0;
      lastFallbackTime.current = 0;
    }
  }, [isActive]);

  // Web Speech API hook
  const webSpeech = useVoiceTranscription({
    isActive: isActive && activeMethod === "web-speech",
    language: "th-TH",
    enablePIIMasking,
    onTranscript: (segments) => {
      const text = segments.filter(s => s.isFinal).map(s => s.text).join(" ");
      if (text) {
        transcriptRef.current = text;
        setCombinedTranscript(text);
        onTranscript?.(text, "web-speech");
      }
    },
    onError: (error) => {
      const now = Date.now();
      const timeSinceLastFallback = now - lastFallbackTime.current;
      
      // Prevent rapid fallback switching
      if (timeSinceLastFallback < FALLBACK_COOLDOWN_MS || fallbackAttempts.current >= MAX_FALLBACK_ATTEMPTS) {
        console.log("Fallback prevented: cooldown active or max attempts reached");
        onError?.(error);
        return;
      }
      
      // If Web Speech fails, fallback to Gemini
      if (activeMethod === "web-speech" && geminiApiKey) {
        lastFallbackTime.current = now;
        fallbackAttempts.current++;
        setActiveMethod("gemini-audio");
        setFallbackReason(`Web Speech ไม่ทำงาน: ${error}`);
      } else {
        onError?.(error);
      }
    },
  });

  // Gemini Audio hook
  const geminiAudio = useGeminiAudio({
    isActive: isActive && activeMethod === "gemini-audio",
    apiKey: geminiApiKey,
    chunkDurationMs,
    enablePIIMasking,
    onTranscript: (text) => {
      transcriptRef.current = text;
      setCombinedTranscript(text);
      onTranscript?.(text, "gemini-audio");
    },
    onError: (error) => {
      const now = Date.now();
      const timeSinceLastFallback = now - lastFallbackTime.current;
      
      // Prevent rapid fallback switching
      if (timeSinceLastFallback < FALLBACK_COOLDOWN_MS || fallbackAttempts.current >= MAX_FALLBACK_ATTEMPTS) {
        console.log("Fallback prevented: cooldown active or max attempts reached");
        onError?.(error);
        return;
      }
      
      // If Gemini fails, try simulated
      if (activeMethod === "gemini-audio") {
        lastFallbackTime.current = now;
        fallbackAttempts.current++;
        setActiveMethod("simulated");
        setFallbackReason(`Gemini ไม่ทำงาน: ${error}`);
      }
      onError?.(error);
    },
  });

  // Simulated mode - just capture input for keyword detection
  const [simulatedActive, setSimulatedActive] = React.useState(false);
  
  React.useEffect(() => {
    if (isActive && activeMethod === "simulated") {
      setSimulatedActive(true);
    } else {
      setSimulatedActive(false);
    }
  }, [isActive, activeMethod]);

  // Unified state
  const isRecording = activeMethod === "web-speech" 
    ? webSpeech.isRecording 
    : activeMethod === "gemini-audio" 
    ? geminiAudio.isRecording 
    : simulatedActive;

  const isProcessing = activeMethod === "web-speech" 
    ? false 
    : activeMethod === "gemini-audio" 
    ? geminiAudio.isProcessing 
    : false;

  const error = activeMethod === "web-speech" 
    ? webSpeech.error 
    : activeMethod === "gemini-audio" 
    ? geminiAudio.error 
    : fallbackReason;

  const quotaRemaining = activeMethod === "gemini-audio" 
    ? geminiAudio.quotaRemaining 
    : RATE_LIMIT.requestsPerDay;

  const restart = useCallback(() => {
    const method = detectBestMethod();
    setActiveMethod(method);
    setFallbackReason(null);
    setCombinedTranscript("");
    transcriptRef.current = "";
  }, []);

  const clearTranscript = useCallback(() => {
    setCombinedTranscript("");
    transcriptRef.current = "";
    webSpeech.clearTranscripts?.();
  }, [webSpeech]);

  // Helper to add simulated text (for testing or manual input)
  // const addSimulatedText = useCallback((text: string) => {
  //   if (activeMethod === "simulated") {
  //     const keywords = detectMedicalKeywords(text);
  //     const enhanced = keywords.length > 0 
  //       ? `${text} [พบคำสำคัญ: ${keywords.join(", ")}]`
  //       : text;
      
  //     transcriptRef.current = enhanced;
  //     setCombinedTranscript(enhanced);
  //     onTranscript?.(enhanced, "simulated");
  //   }
  // }, [activeMethod, onTranscript]);

  return {
    transcript: combinedTranscript,
    segments: webSpeech.segments || [],
    isRecording,
    isProcessing,
    error,
    activeMethod,
    fallbackReason,
    quotaRemaining,
    restart,
    clearTranscript,
  };
}

// Re-export rate limits for use in UI
const RATE_LIMIT = {
  requestsPerMinute: 60,
  requestsPerDay: 1500,
};

// export { RATE_LIMIT };
// export default useSmartTranscription;
