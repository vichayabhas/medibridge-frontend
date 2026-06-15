/**
 * Google Gemini AI Service
 * 
 * Real-time Thai medical text analysis for pharmacist AI suggestions.
 * Free tier: 60 requests/min, 1M tokens/min
 * 
 * Get API key: https://ai.google.dev
 */

import { PatientHandoffType } from "../../../../interface";


export interface GeminiAnalysisResult {
  extractedData: {
    symptoms: string[];
    allergies: string[];
    conditions: string[];
    medications: string[];
    notes: string[];
  };
  alerts: string[];
  suggestions: string[];
  questionsToAsk: string[];
  followUpNeeded: boolean;
  pharmacistAssessment?: string; // การประเมินและแผนการรักษา
  patientNote?: string; // บันทึกเภสัชกร - sent to patient after call
}

export interface GeminiWithContextResult extends GeminiAnalysisResult {
  drugInteractionWarnings: string[];
  contraindications: string[];
  dosageAdjustments: string[];
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
// Use gemini-2.0-flash for higher free tier limits (1,500 requests/day vs 20 for 2.5-flash)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Rate limit tracking
let lastQuotaError = 0;
const QUOTA_COOLDOWN_MS = 60000; // 1 minute cooldown after quota error

/**
 * Check if we're in quota cooldown period
 */
export function isInQuotaCooldown(): boolean {
  return Date.now() - lastQuotaError < QUOTA_COOLDOWN_MS;
}

/**
 * Mark that we hit a quota error
 */
export function markQuotaError(): void {
  lastQuotaError = Date.now();
}

/**
 * Check if Gemini API is configured and available
 */
export function isGeminiAvailable(): boolean {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    return false;
  }
  // Don't try if we're in quota cooldown
  if (isInQuotaCooldown()) {
    return false;
  }
  return true;
}

/**
 * Analyze Thai medical conversation text using Gemini
 */
export async function analyzeMedicalText(
  text: string,
  patientData?: PatientHandoffType
): Promise<GeminiWithContextResult | null> {
  if (!isGeminiAvailable()) {
    console.warn("Gemini API key not configured");
    return null;
  }

  const hasPatientContext = patientData && (
    patientData.age || 
    patientData.conditions?.length || 
    patientData.allergies?.length || 
    patientData.medications?.length
  );

  const patientContext = hasPatientContext ? `
Patient Context:
- Name: ${patientData?.patientName || "Unknown"}
- Age: ${patientData?.age || "Unknown"} years
- Gender: ${patientData?.gender || "Unknown"}
- Conditions: ${patientData?.conditions?.join(", ") || "None"}
- Allergies: ${patientData?.allergies?.join(", ") || "None"} ⚠️
- Current Medications: ${patientData?.medications?.join(", ") || "None"}
` : "";

  const prompt = `You are an AI assistant helping Thai pharmacists during patient consultations.

${patientContext}

Conversation to analyze (Thai):
"${text}"

Task: Analyze this medical conversation and extract structured information. If patient context is provided, check for drug interactions, contraindications, and provide contextual warnings.

Return ONLY a valid JSON object in this exact format:

{
  "extractedData": {
    "symptoms": ["list of symptoms mentioned in Thai"],
    "allergies": ["list of allergies mentioned in Thai"],
    "conditions": ["list of medical conditions mentioned in Thai"],
    "medications": ["list of medications mentioned in Thai"],
    "notes": ["additional important notes in Thai"]
  },
  "alerts": ["critical warnings in Thai, e.g., drug interactions, allergy conflicts"],
  "suggestions": ["helpful suggestions for pharmacist in Thai"],
  "questionsToAsk": ["follow-up questions to ask patient in Thai"],
  "followUpNeeded": true/false,
  "drugInteractionWarnings": ["specific drug interaction warnings"],
  "contraindications": ["contraindications based on patient conditions"],
  "dosageAdjustments": ["dosage recommendations considering age/conditions"],
  "pharmacistAssessment": "การประเมินผู้ป่วยและแผนการรักษา รวมถึงยาที่แนะนำ ขนาดยา วิธีใช้ ในรูปแบบข้อความสรุปสำหรับเภสัชกร",
  "patientNote": "บันทึกสำหรับผู้ป่วย อธิบายอาการ คำแนะนำการดูแลตนเอง ยาที่ได้รับ ข้อควรระวัง ในรูปแบบที่ผู้ป่วยเข้าใจง่าย จะส่งให้ผู้ป่วยหลังจบการปรึกษา"
}

Important:
- Use Thai language for all medical terms and extracted text
- Be precise and only extract what is actually mentioned
- If patient has allergies, ALWAYS flag medications containing those allergens
- Consider age for dosage adjustments (elderly = reduce dose, pediatric = weight-based)
- Check for drug-drug interactions with current medications
- If nothing found in a category, return empty array []
- followUpNeeded should be true if patient has chronic conditions or needs monitoring
- pharmacistAssessment: Write professional assessment for pharmacist records (diagnosis, treatment plan, medications prescribed)
- patientNote: Write patient-friendly summary they can understand (symptoms explained, self-care advice, medications, warnings)
- Return valid JSON only, no markdown formatting, no code blocks`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      
      // Check for rate limit / quota errors
      if (response.status === 429 || errorText.includes("quota") || errorText.includes("RESOURCE_EXHAUSTED")) {
        markQuotaError();
        console.warn("Gemini quota exceeded. Cooling down for 1 minute. Falling back to simulated suggestions.");
      }
      
      return null;
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      console.error("No content in Gemini response");
      return null;
    }

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || 
                      content.match(/```\n?([\s\S]*?)\n?```/) ||
                      [null, content];
    
    const jsonStr = jsonMatch[1] || content;
    const result = JSON.parse(jsonStr.trim()) as GeminiWithContextResult;
    
    console.log("Gemini analysis result:", result);
    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}

/**
 * Quick analysis for single text input (for testing)
 */
export async function quickAnalyze(text: string): Promise<string[]> {
  const result = await analyzeMedicalText(text);
  if (!result) return [];
  
  return [
    ...result.extractedData.symptoms,
    ...result.extractedData.allergies,
    ...result.extractedData.conditions
  ];
}
