// /**
//  * useAISuggestions Hook
//  * 
//  * Real-time AI suggestions for pharmacists during calls.
//  * 
//  * Features:
//  * - Google Gemini AI integration for real medical analysis
//  * - Patient context-aware suggestions (allergies, conditions, meds)
//  * - Drug interaction warnings
//  * - Auto data append recommendations
//  * - Thai language support
//  * 
//  * Suggestion Types:
//  * 1. question - Questions to ask patient
//  * 2. info - Information to provide to patient
//  * 3. alert - Drug interactions, allergy warnings
//  * 4. auto_fill - Auto data append recommendations
//  * 5. follow_up - Follow-up recommendations
//  * 6. interaction - Drug-drug interaction warnings
//  * 7. dosage - Dosage adjustment recommendations
//  */
// 'use client'
// import { useState, useCallback, useRef, useEffect } from "react";
import { useSmartTranscription, type TranscriptionMethod } from "./useSmartTranscription";
// import { PatientHandoffType } from "../../../interface";
// import { analyzeMedicalText, isGeminiAvailable } from "./gemini";
import { TranscriptSegment } from "./useVoiceTranscription";

import { useCallback, useState } from "react";
import { analyzeMedicalText, isGeminiAvailable } from "./gemini";
import { PatientHandoffType } from "../../../../interface";
import React from "react";

// // Extended suggestion types with new clinical recommendations
export type SuggestionType = 
  | "question" 
  | "info" 
  | "alert" 
  | "auto_fill" 
  | "follow_up" 
  | "interaction" 
  | "dosage"
  | "drug_recommendation"
  | "contraindication"
  | "documentation";

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  content: string;
  context?: string;
  confidence: number;
  timestamp: Date;
  autoFillData?: {
    field: string;
    value: string;
    source: string;
  };
}

interface UseAISuggestionsOptions {
  handoffId: string;
  isActive: boolean;
  patientData?: PatientHandoffType; // Patient context for smart suggestions
  aiProvider?: "gemini" | "simulated";
  enableTranscription?: boolean; // Enable real-time voice transcription
  geminiApiKey?: string; // Required for transcription fallback
  analysisIntervalMs?: number; // How often to analyze (default: 10000ms)
  onTranscript?: (text: string, method: TranscriptionMethod) => void;
}

interface UseAISuggestionsReturn {
  suggestions: Suggestion[];
  isListening: boolean;
  isProcessing: boolean;
  isTranscribing: boolean;
  error: string | null;
  
  // Transcription
  transcript: string;
  transcriptionMethod: TranscriptionMethod;
  transcriptSegments: TranscriptSegment[]
  
  // Actions
  dismissSuggestion: (id: string) => void;
  acceptAutoFill: (suggestion: Suggestion, onSave?: (data: { field: string; value: string }) => Promise<void>) => Promise<void>;
  startListening: () => void;
  stopListening: () => void;
  simulateTranscript: (text: string) => void; // For testing
  clearTranscript: () => void;
  
  // Stats
  suggestionCount: number;
  acceptedCount: number;
  quotaRemaining: number; // Gemini quota tracking
  
  // Patient context
  patientContext: PatientHandoffType | null;
  
  // Conversation history
  conversationHistory: string[];
}

// // Simulated suggestions for free tier / development
const SIMULATED_SUGGESTIONS: Partial<Suggestion>[] = [
  {
    type: "question",
    title: "สอบถามอาการแพ้",
    content: "คุณมีประวัติแพ้ยาอะไรไหมครับ?",
    context: "ยังไม่มีข้อมูลการแพ้",
    confidence: 0.95,
  },
  {
    type: "question",
    title: "สอบถามโรคประจำตัว",
    content: "คุณมีโรคประจำตัวอะไรบ้างครับ?",
    context: "ยังไม่มีข้อมูลโรคประจำตัว",
    confidence: 0.9,
  },
  {
    type: "info",
    title: "แจ้งวิธีใช้ยา",
    content: "รับประทานยาก่อนอาหาร 30 นาที วันละ 3 ครั้ง",
    confidence: 0.85,
  },
  {
    type: "alert",
    title: "คำเตือนการใช้ยา",
    content: "ห้ามใช้ร่วมกับแอลกอฮอล์",
    confidence: 0.98,
  },
  {
    type: "follow_up",
    title: "นัดติดตามอาการ",
    content: "แนะนำให้กลับมาติดตามอาการใน 3 วัน",
    confidence: 0.8,
  },
  {
    type: "auto_fill",
    title: "บันทึกอาการ",
    content: "ปวดหัว, มีไข้ต่ำ",
    autoFillData: {
      field: "symptoms",
      value: "ปวดหัว, มีไข้ต่ำ",
      source: "จากการสนทนา",
    },
    confidence: 0.88,
  },
];

export function useAISuggestions({ 
  // handoffId, 
  isActive,
  patientData,
  aiProvider = "gemini",
  enableTranscription = true,
  geminiApiKey = "",
  analysisIntervalMs = 10000,
  onTranscript,
}: UseAISuggestionsOptions): UseAISuggestionsReturn {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  
  // Smart transcription hook
  const transcription = useSmartTranscription({
    isActive: isActive && enableTranscription,
    geminiApiKey,
    chunkDurationMs: analysisIntervalMs,
    onTranscript: (text, method) => {
      transcriptRef.current = text;
      onTranscript?.(text, method);
      
      // Add to conversation history
      setConversationHistory(prev => {
        const updated = [...prev, text];
        // Keep only last 10 utterances
        return updated.slice(-10);
      });
      
      // Trigger analysis on new transcript
      processTranscript(text);
    },
    onError: (err) => {
      setError(`Transcription error: ${err}`);
    },
  });
  
  const transcriptRef = React.useRef<string>("");
  const intervalRef = React.useRef<number | null>(null);
  const simulationIndexRef = React.useRef(0);
  const analysisTimeoutRef = React.useRef<number | null>(null);
  const consecutiveErrorsRef = React.useRef(0);
  const circuitBreakerUntilRef = React.useRef<number>(0);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, []);

  // Generate initial suggestions from existing patient data when call becomes active
  React.useEffect(() => {
    if (isActive && patientData) {
      const initialSuggestions: Suggestion[] = [];
      
      // Analyze existing conditions and generate alerts
      if (patientData.conditions && patientData.conditions.length > 0) {
        const conditions = patientData.conditions;
        
        // Diabetes alert
        if (conditions.some(c => c.includes("เบาหวาน") || c.includes("diabetes"))) {
          initialSuggestions.push({
            id: `initial-diabetes-${Date.now()}`,
            type: "info",
            title: "โรคเบาหวานตรวจพบ",
            content: `ผู้ป่วยมีประวัติเบาหวาน: ${conditions.filter(c => c.includes("เบาหวาน") || c.includes("diabetes")).join(", ")}. ควรสอบถามระดับน้ำตาลล่าสุด`,
            confidence: 0.95,
            timestamp: new Date(),
          });
        }
        
        // Hypertension alert
        if (conditions.some(c => c.includes("ความดัน") || c.includes("hypertension"))) {
          initialSuggestions.push({
            id: `initial-hypertension-${Date.now()}`,
            type: "info",
            title: "โรคความดันโลหิตสูง",
            content: "ผู้ป่วยมีประวัติความดันโลหิตสูง ควรตรวจสอบการใช้ยาลดความดันอย่างสม่ำเสมอ",
            confidence: 0.9,
            timestamp: new Date(),
          });
        }
      }
      
      // Analyze allergies and generate warnings
      if (patientData.allergies && patientData.allergies.length > 0) {
        initialSuggestions.push({
          id: `initial-allergies-${Date.now()}`,
          type: "alert",
          title: "⚠️ ข้อควรระวังเรื่องการแพ้",
          content: `ผู้ป่วยแพ้: ${patientData.allergies.join(", ")}. ตรวจสอบยาที่สั่งไม่ให้มีส่วนผสมที่แพ้`,
          confidence: 0.98,
          timestamp: new Date(),
        });
      }
      
      // Age-based dosage suggestions
      if (patientData.age && patientData.age > 65) {
        initialSuggestions.push({
          id: `initial-elderly-${Date.now()}`,
          type: "dosage",
          title: "การปรับขนาดยาสำหรับผู้สูงอายุ",
          content: `ผู้ป่วยอายุ ${patientData.age} ปี ควรพิจารณาขนาดยาต่ำกว่าปกติ 50% และเฝ้าระวังอาการไม่พึงประสงค์`,
          confidence: 0.85,
          timestamp: new Date(),
        });
      }
      
      // Drug interaction check for existing medications
      if (patientData.medications && patientData.medications.length > 1) {
        const meds = patientData.medications;
        // Common interaction: Metformin + certain antibiotics
        if (meds.some(m => m.includes("เม็ทฟอร์มิน") || m.includes("metformin")) &&
            meds.some(m => m.includes("แอสไพริน") || m.includes("aspirin"))) {
          initialSuggestions.push({
            id: `initial-interaction-${Date.now()}`,
            type: "interaction",
            title: "⚠️ ปฏิกิริยายาที่ต้องระวัง",
            content: "เม็ทฟอร์มิน + แอสไพริน: อาจเพิ่มความเสี่ยงต่อภาวะกรดแลคติก ควรตรวจสอบการใช้ร่วมกัน",
            confidence: 0.88,
            timestamp: new Date(),
          });
        }
      }
      
      // Pregnancy check for women of childbearing age
      if (patientData.gender === "female" && patientData.age && patientData.age >= 15 && patientData.age <= 50) {
        initialSuggestions.push({
          id: `initial-pregnancy-${Date.now()}`,
          type: "question",
          title: "ตรวจสอบความปลอดภัยในการตั้งครรภ์",
          content: "สอบถามสถานะการตั้งครรภ์หรือการวางแผนตั้งครรภ์ก่อนสั่งยา",
          confidence: 0.8,
          timestamp: new Date(),
        });
      }
      
      // Kidney function check for certain medications
      if (patientData.medications?.some(m => 
        m.includes("เม็ทฟอร์มิน") || m.includes("metformin") ||
        m.includes("เอซีอี") || m.includes("ACE")
      )) {
        initialSuggestions.push({
          id: `initial-kidney-${Date.now()}`,
          type: "follow_up",
          title: "ตรวจสอบการทำงานของไต",
          content: "ยาที่ใช้อยู่ต้องการตรวจสอบการทำงานของไต ควรสอบถามประวัติการตรวจ eGFR ล่าสุด",
          confidence: 0.82,
          timestamp: new Date(),
        });
      }
      
      // Add initial suggestions if any found
      if (initialSuggestions.length > 0) {
        setSuggestions(initialSuggestions);
      }
    }
  }, [isActive, patientData]);

  // Simulated AI processing (free tier / development mode)
  const processWithSimulatedAI = useCallback((transcript: string): Suggestion | null => {
    // Simple keyword matching for demonstration
    const lowerTranscript = transcript.toLowerCase();
    
    // Check for symptoms
    if (lowerTranscript.includes("ปวด") || lowerTranscript.includes("ไข้")) {
      return {
        id: `symptom-${Date.now()}`,
        type: "auto_fill",
        title: "บันทึกอาการที่พบ",
        content: "ตรวจพบอาการจากการสนทนา",
        autoFillData: {
          field: "symptoms",
          value: extractSymptoms(lowerTranscript),
          source: "AI วิเคราะห์จากการสนทนา",
        },
        confidence: 0.85,
        timestamp: new Date(),
      };
    }
    
    // Check for allergies
    if (lowerTranscript.includes("แพ้") || lowerTranscript.includes("แพ้ยา")) {
      return {
        id: `allergy-${Date.now()}`,
        type: "auto_fill",
        title: "บันทึกการแพ้",
        content: "พบข้อมูลการแพ้จากการสนทนา",
        autoFillData: {
          field: "allergies",
          value: extractAllergies(lowerTranscript),
          source: "AI วิเคราะห์จากการสนทนา",
        },
        confidence: 0.9,
        timestamp: new Date(),
      };
    }
    
    // Check for conditions
    if (lowerTranscript.includes("โรค") || lowerTranscript.includes("เป็น")) {
      return {
        id: `condition-${Date.now()}`,
        type: "auto_fill",
        title: "บันทึกโรคประจำตัว",
        content: "พบข้อมูลโรคประจำตัวจากการสนทนา",
        autoFillData: {
          field: "conditions",
          value: extractConditions(lowerTranscript),
          source: "AI วิเคราะห์จากการสนทนา",
        },
        confidence: 0.8,
        timestamp: new Date(),
      };
    }

    return null;
  }, []);

  // Extract symptoms from Thai text (simplified)
  const extractSymptoms = (text: string): string => {
    const symptoms: string[] = [];
    const symptomKeywords: Record<string, string> = {
      "ปวดหัว": "ปวดหัว",
      "ปวดท้อง": "ปวดท้อง",
      "มีไข้": "มีไข้",
      "ไข้": "มีไข้",
      "ไอ": "ไอ",
      "เจ็บคอ": "เจ็บคอ",
      "คัดจมูก": "คัดจมูก",
      "น้ำมูก": "มีน้ำมูก",
      "ปวดกล้ามเนื้อ": "ปวดกล้ามเนื้อ",
      "เหนื่อย": "เหนื่อยหอบ",
      "คลื่นไส้": "คลื่นไส้",
      "อาเจียน": "อาเจียน",
      "ท้องเสีย": "ท้องเสีย",
      "ท้องร่วง": "ท้องร่วง",
    };

    Object.entries(symptomKeywords).forEach(([keyword, symptom]) => {
      if (text.includes(keyword)) {
        symptoms.push(symptom);
      }
    });

    return symptoms.join(", ") || "ไม่พบอาการเฉพาะ";
  };

  // Extract allergies from Thai text
  const extractAllergies = (text: string): string => {
    const allergies: string[] = [];
    const allergyKeywords = [
      "แพ้ยา", "แพ้อาหาร", "แพ้ฝุ่น", "แพ้ละออง", "แพ้แมว", "แพ้หมา",
      "แพ้นม", "แพ้ไข่", "แพ้ถั่ว", "แพ้อากาศ"
    ];

    allergyKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        allergies.push(keyword);
      }
    });

    return allergies.join(", ") || "ไม่พบข้อมูลการแพ้เฉพาะ";
  };

  // Extract conditions from Thai text
  const extractConditions = (text: string): string => {
    const conditions: string[] = [];
    const conditionKeywords: Record<string, string> = {
      "เบาหวาน": "เบาหวาน",
      "ความดัน": "ความดันโลหิตสูง",
      "หัวใจ": "โรคหัวใจ",
      "ภูมิแพ้": "ภูมิแพ้",
      "หอบหืด": "หอบหืด",
      "ไต": "โรคไต",
      "ตับ": "โรคตับ",
      "หอบ": "หอบหืด",
      "เส้นเลือด": "โรคหลอดเลือด",
    };

    Object.entries(conditionKeywords).forEach(([keyword, condition]) => {
      if (text.includes(keyword)) {
        conditions.push(condition);
      }
    });

    return conditions.join(", ") || "ไม่พบโรคประจำตัวเฉพาะ";
  };

  const startListening = useCallback(() => {
    if (!isActive) return;
    
    setIsListening(true);
    setError(null);
    
    if (aiProvider === "simulated") {
      // In simulation mode, periodically add suggestions
      intervalRef.current = window.setInterval(() => {
        if (simulationIndexRef.current < SIMULATED_SUGGESTIONS.length) {
          const template = SIMULATED_SUGGESTIONS[simulationIndexRef.current];
          const suggestion: Suggestion = {
            id: `sim-${Date.now()}-${simulationIndexRef.current}`,
            type: template.type as SuggestionType,
            title: template.title || "",
            content: template.content || "",
            context: template.context,
            confidence: template.confidence || 0.8,
            timestamp: new Date(),
            autoFillData: template.autoFillData,
          };
          
          setSuggestions(prev => {
            // Don't add duplicates
            const exists = prev.some(s => s.content === suggestion.content);
            if (exists) return prev;
            return [suggestion, ...prev].slice(0, 10); // Keep max 10 suggestions
          });
          
          simulationIndexRef.current++;
        }
      }, 8000); // Add suggestion every 8 seconds
    }
    
    // TODO: Future Botnoi AI integration
    // - Connect to WebSocket for real-time transcription
    // - Stream audio to Botnoi AI
    // - Process Thai language with Botnoi's NLP
    
  }, [isActive, aiProvider]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const dismissSuggestion = useCallback((id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }, []);

  const acceptAutoFill = useCallback(async (suggestion: Suggestion, onSave?: (data: { field: string; value: string }) => Promise<void>) => {
    if (suggestion.autoFillData) {
      setAcceptedCount(prev => prev + 1);
      
      // Call the save callback if provided
      if (onSave) {
        try {
          await onSave({
            field: suggestion.autoFillData.field,
            value: suggestion.autoFillData.value,
          });
          console.log("Auto-fill saved to handoff:", suggestion.autoFillData);
        } catch (err) {
          console.error("Failed to save auto-fill:", err);
        }
      } else {
        console.log("Auto-fill accepted (no save handler):", suggestion.autoFillData);
      }
    }
    dismissSuggestion(suggestion.id);
  }, [dismissSuggestion]);

  // Circuit breaker check
  const isCircuitBreakerActive = useCallback(() => {
    const now = Date.now();
    if (now < circuitBreakerUntilRef.current) {
      return true;
    }
    // Reset if time has passed
    if (consecutiveErrorsRef.current > 0 && now >= circuitBreakerUntilRef.current) {
      consecutiveErrorsRef.current = 0;
    }
    return false;
  }, []);

  // Process transcript with Gemini or simulated AI
  const processTranscript = useCallback(async (text: string) => {
    // Circuit breaker check
    if (isCircuitBreakerActive()) {
      console.log("AI analysis paused due to circuit breaker");
      return;
    }
    
    // Debounce: clear pending analysis
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }
    
    // Debounce 500ms before processing
    analysisTimeoutRef.current = window.setTimeout(async () => {
      setIsProcessing(true);
      
      try {
        if (aiProvider === "gemini" && isGeminiAvailable()) {
        // Use Gemini AI for real analysis
        const result = await analyzeMedicalText(text, patientData);
        
        if (result) {
          const newSuggestions: Suggestion[] = [];
          
          // Add extraction suggestions for each field with data
          if (result.extractedData.symptoms.length > 0) {
            newSuggestions.push({
              id: `gemini-symptoms-${Date.now()}`,
              type: "auto_fill",
              title: "บันทึกอาการที่พบ",
              content: result.extractedData.symptoms.join(", "),
              autoFillData: {
                field: "symptoms",
                value: result.extractedData.symptoms.join(", "),
                source: "AI วิเคราะห์จากการสนทนา",
              },
              confidence: 0.9,
              timestamp: new Date(),
            });
          }
          
          if (result.extractedData.allergies.length > 0) {
            newSuggestions.push({
              id: `gemini-allergies-${Date.now()}`,
              type: "auto_fill",
              title: "บันทึกการแพ้",
              content: result.extractedData.allergies.join(", "),
              autoFillData: {
                field: "allergies",
                value: result.extractedData.allergies.join(", "),
                source: "AI วิเคราะห์จากการสนทนา",
              },
              confidence: 0.92,
              timestamp: new Date(),
            });
          }
          
          if (result.extractedData.conditions.length > 0) {
            newSuggestions.push({
              id: `gemini-conditions-${Date.now()}`,
              type: "auto_fill",
              title: "บันทึกโรคประจำตัว",
              content: result.extractedData.conditions.join(", "),
              autoFillData: {
                field: "conditions",
                value: result.extractedData.conditions.join(", "),
                source: "AI วิเคราะห์จากการสนทนา",
              },
              confidence: 0.88,
              timestamp: new Date(),
            });
          }
          
          // Add alerts (with context)
          result.alerts.forEach((alert, index) => {
            newSuggestions.push({
              id: `gemini-alert-${Date.now()}-${index}`,
              type: "alert",
              title: "คำเตือนสำคัญ",
              content: alert,
              confidence: 0.95,
              timestamp: new Date(),
            });
          });
          
          // Add drug interaction warnings
          result.drugInteractionWarnings.forEach((warning, index) => {
            newSuggestions.push({
              id: `gemini-interaction-${Date.now()}-${index}`,
              type: "interaction",
              title: "คำเตือนการใช้ยาร่วมกัน",
              content: warning,
              confidence: 0.96,
              timestamp: new Date(),
            });
          });
          
          // Add dosage adjustments
          result.dosageAdjustments.forEach((adjustment, index) => {
            newSuggestions.push({
              id: `gemini-dosage-${Date.now()}-${index}`,
              type: "dosage",
              title: "คำแนะนำขนาดยา",
              content: adjustment,
              confidence: 0.9,
              timestamp: new Date(),
            });
          });
          
          // Add follow-up suggestions
          if (result.followUpNeeded) {
            newSuggestions.push({
              id: `gemini-followup-${Date.now()}`,
              type: "follow_up",
              title: "แนะนำการติดตาม",
              content: "ควรนัดติดตามอาการตามโรคประจำตัวของผู้ป่วย",
              confidence: 0.85,
              timestamp: new Date(),
            });
          }
          
          // Add pharmacist assessment suggestion (การประเมินและแผนการรักษา)
          if (result.pharmacistAssessment && result.pharmacistAssessment.trim()) {
            newSuggestions.push({
              id: `gemini-assessment-${Date.now()}`,
              type: "auto_fill",
              title: "การประเมินและแผนการรักษา",
              content: result.pharmacistAssessment.slice(0, 100) + (result.pharmacistAssessment.length > 100 ? "..." : ""),
              autoFillData: {
                field: "pharmacistAction",
                value: result.pharmacistAssessment,
                source: "AI วิเคราะห์การสนทนา",
              },
              confidence: 0.87,
              timestamp: new Date(),
            });
          }
          
          // Add patient note suggestion (บันทึกเภสัชกร - sent to patient)
          if (result.patientNote && result.patientNote.trim()) {
            newSuggestions.push({
              id: `gemini-patient-note-${Date.now()}`,
              type: "auto_fill",
              title: "บันทึกสำหรับผู้ป่วย",
              content: result.patientNote.slice(0, 100) + (result.patientNote.length > 100 ? "..." : ""),
              autoFillData: {
                field: "pharmacistNote",
                value: result.patientNote,
                source: "AI สร้างบันทึกสำหรับผู้ป่วย",
              },
              confidence: 0.88,
              timestamp: new Date(),
            });
          }
          
          setSuggestions(prev => [...newSuggestions, ...prev].slice(0, 15));
        }
        
        // Reset error count on success
        consecutiveErrorsRef.current = 0;
        
      } else {
        // Fallback to simulated AI
        const suggestion = processWithSimulatedAI(text);
        if (suggestion) {
          setSuggestions(prev => [suggestion, ...prev].slice(0, 10));
        }
      }
    } catch (err) {
      console.error("Error processing transcript:", err);
      
      // Circuit breaker logic
      consecutiveErrorsRef.current++;
      if (consecutiveErrorsRef.current >= 5) {
        circuitBreakerUntilRef.current = Date.now() + 60000; // 60 second pause
        setError("AI analysis temporarily paused due to errors. Using keyword-based suggestions.");
      } else {
        setError("Failed to analyze text");
      }
    } finally {
      setIsProcessing(false);
    }
    }, 500); // 500ms debounce
  }, [aiProvider, patientData, processWithSimulatedAI, isCircuitBreakerActive]);

  // Manual transcript injection for testing
  const simulateTranscript = useCallback((text: string) => {
    transcriptRef.current += " " + text;
    processTranscript(text);
  }, [processTranscript]);

  // Clear transcript helper
  const clearTranscript = useCallback(() => {
    transcriptRef.current = "";
    transcription.clearTranscript();
    setConversationHistory([]);
  }, [transcription]);

  return {
    suggestions,
    isListening,
    isProcessing,
    isTranscribing: transcription.isRecording,
    error: error || transcription.error,
    
    // Transcription
    transcript: transcription.transcript,
    transcriptionMethod: transcription.activeMethod,
    transcriptSegments: transcription.segments,
    
    // Actions
    dismissSuggestion,
    acceptAutoFill,
    startListening,
    stopListening,
    simulateTranscript,
    clearTranscript,
    
    // Stats
    suggestionCount: suggestions.length,
    acceptedCount,
    quotaRemaining: transcription.quotaRemaining,
    
    // Patient context
    patientContext: patientData || null,
    
    // Conversation history
    conversationHistory,
  };
}


export { TranscriptionMethod };
// Re-export types for convenience
// export type { TranscriptionMethod } from "./useSmartTranscription";
// export type { TranscriptSegment } from './useVoiceTranscription'
