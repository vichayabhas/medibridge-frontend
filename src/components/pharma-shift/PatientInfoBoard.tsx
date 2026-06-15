/**
 * PatientInfoBoard Component
 *
 * Reusable patient information display for pharmacist views.
 * Shows patient data in organized sections with visual hierarchy.
 *
 * Used in:
 * - PatientRequestCard (dashboard view)
 * - TelepharmacyModal (call view)
 */
"use client";
import { useState } from "react";
import {
  User,
  Stethoscope,
  AlertTriangle,
  Pill,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PatientHandoffType } from "../../../interface";
import { Suggestion } from "./support/useAISuggestions";
import React from "react";
import { cn } from "../utility/setup";
import  InlineAISuggestions  from "./InlineAISuggestions";

interface PatientInfoBoardProps {
  handoff: PatientHandoffType;
  className?: string;
  compact?: boolean;
  showAiSummary?: boolean;
  showHeader?: boolean; // Show patient name/age/gender card (default true)
  showAllergies?: boolean; // Show allergy warning card (default true)
  showSymptoms?: boolean; // Show symptoms inside medical history (default true)
  suggestions?: Suggestion[];
  onAcceptSuggestion?: (suggestion: Suggestion) => Promise<void>;
  onDismissSuggestion?: (id: string) => void;
}

// Format collected data key to Thai label
const COLLECTED_DATA_LABELS: Record<string, string> = {
  patientName: "ชื่อผู้ป่วย",
  symptoms: "อาการ",
  duration: "ระยะเวลา",
  conditions: "โรคประจำตัว",
  medications: "ยาที่ใช้อยู่",
  allergies: "ประวัติแพ้ยา",
  pharmacy: "ร้านยา",
  pharmacist: "เภสัชกร",
  licenseNo: "เลขใบอนุญาต",
  requestType: "รูปแบบคำขอ",
  telemedicineChannel: "ช่องทาง",
  appointmentTime: "เวลานัดหมาย",
  selectedTime: "ช่วงเวลาที่เลือก",
  patientNote: "หมายเหตุจากผู้ป่วย",
  painLevel: "ระดับความปวด",
  urgencyLevel: "ความเร่งด่วน",
  age: "อายุ",
  gender: "เพศ",
};

function formatCollectedValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "-";
    return value.join(", ");
  }
  return JSON.stringify(value);
}

function formatCollectedLabel(key: string): string {
  return COLLECTED_DATA_LABELS[key] || key;
}

function SectionCard({
  title,
  icon: Icon,
  children,
  className,
  alert = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        alert
          ? "border-red-200 bg-gradient-to-br from-red-50 to-white"
          : "border-slate-200 bg-white",
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon
          className={cn("h-4 w-4", alert ? "text-red-600" : "text-slate-600")}
        />
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.16em]",
            alert ? "text-red-600" : "text-slate-500",
          )}
        >
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

export function PatientInfoBoard({
  handoff,
  className,
  // compact = false,
  showAiSummary = true,
  showHeader = true,
  showAllergies = true,
  showSymptoms = true,
  suggestions = [],
  onAcceptSuggestion,
  onDismissSuggestion,
}: PatientInfoBoardProps) {
  const [showCollectedData, setShowCollectedData] = useState(false);

  // Filter suggestions by type for inline display
  const symptomSuggestions = suggestions.filter(
    (s) => s.type === "auto_fill" && s.autoFillData?.field === "symptoms",
  );
  const allergySuggestions = suggestions.filter(
    (s) => s.type === "auto_fill" && s.autoFillData?.field === "allergies",
  );
  const conditionSuggestions = suggestions.filter(
    (s) => s.type === "auto_fill" && s.autoFillData?.field === "conditions",
  );
  const alertSuggestions = suggestions.filter(
    (s) =>
      s.type === "alert" || s.type === "interaction" || s.type === "dosage",
  );
  const collectedData = handoff.telemedicineCollectedData;
  const collectedEntries =
    collectedData &&
    typeof collectedData === "object" &&
    !Array.isArray(collectedData)
      ? Object.entries(collectedData).filter(
          ([, value]) =>
            value !== null &&
            value !== undefined &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0),
        )
      : [];

  const hasAllergies = handoff.allergies && handoff.allergies.length > 0;
  const hasConditions = handoff.conditions && handoff.conditions.length > 0;
  const hasMedications = handoff.medications && handoff.medications.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* 👤 Patient Profile */}
      {showHeader && (
        <SectionCard title="ข้อมูลผู้ป่วย" icon={User}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-bold text-slate-950">
                {handoff.patientName}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                {handoff.age ? `${handoff.age} ปี` : ""}
                {handoff.age && handoff.gender ? " • " : ""}
                {handoff.gender === "male"
                  ? "ชาย"
                  : handoff.gender === "female"
                    ? "หญิง"
                    : handoff.gender || ""}
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              ID: {handoff._id.slice(0, 8)}
            </Badge>
          </div>
        </SectionCard>
      )}

      {/* 🤖 AI-Suggested Actions - Real-time Recommendations */}
      {suggestions.length > 0 && onAcceptSuggestion && onDismissSuggestion && (
        <SectionCard
          title="คำแนะนำจาก AI"
          icon={Sparkles}
          className="border-violet-200 bg-gradient-to-br from-violet-50/80 to-white"
        >
          <div className="space-y-2">
            {suggestions.slice(0, 5).map((suggestion) => (
              <div
                key={suggestion.id}
                className={cn(
                  "rounded-lg border p-2.5 text-sm transition-all",
                  suggestion.type === "alert" ||
                    suggestion.type === "contraindication" ||
                    suggestion.type === "interaction"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : suggestion.type === "auto_fill"
                      ? "bg-violet-50 border-violet-200 text-violet-700"
                      : suggestion.type === "drug_recommendation" ||
                          suggestion.type === "dosage"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-blue-50 border-blue-200 text-blue-700",
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {suggestion.type === "alert" && (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {suggestion.type === "auto_fill" && (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {suggestion.type === "drug_recommendation" && (
                      <Pill className="h-4 w-4" />
                    )}
                    {suggestion.type === "dosage" && (
                      <Zap className="h-4 w-4" />
                    )}
                    {suggestion.type === "interaction" && (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {suggestion.type === "contraindication" && (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {(suggestion.type === "question" ||
                      suggestion.type === "info" ||
                      suggestion.type === "follow_up" ||
                      suggestion.type === "documentation") && (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{suggestion.title}</p>
                    <p className="text-xs opacity-90 mt-0.5 line-clamp-2">
                      {suggestion.content}
                    </p>

                    {/* Confidence indicator */}
                    {suggestion.confidence > 0 && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="h-1 flex-1 bg-black/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-current rounded-full"
                            style={{
                              width: `${suggestion.confidence * 100}%`,
                              opacity: 0.6,
                            }}
                          />
                        </div>
                        <span className="text-[10px] opacity-70">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                    )}

                    {/* Action buttons for auto_fill */}
                    {suggestion.type === "auto_fill" &&
                      suggestion.autoFillData && (
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => onAcceptSuggestion(suggestion)}
                            className="px-2.5 py-1 text-xs bg-white border border-current rounded hover:bg-white/80 transition-colors"
                          >
                            ยอมรับ
                          </button>
                          <button
                            onClick={() => onDismissSuggestion(suggestion.id)}
                            className="px-2.5 py-1 text-xs bg-transparent border border-current/30 rounded hover:bg-black/5 transition-colors"
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      )}
                  </div>

                  {/* Dismiss button for non-actionable suggestions */}
                  {suggestion.type !== "auto_fill" && (
                    <button
                      onClick={() => onDismissSuggestion(suggestion.id)}
                      className="p-1 hover:bg-black/5 rounded shrink-0 opacity-60 hover:opacity-100"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}

            {suggestions.length > 5 && (
              <p className="text-xs text-center text-violet-500">
                +{suggestions.length - 5} คำแนะนำเพิ่มเติมในแท็บ AI
              </p>
            )}
          </div>
        </SectionCard>
      )}

      {/* ⚠️ Critical: Allergies */}
      {showAllergies && (hasAllergies || allergySuggestions.length > 0) && (
        <SectionCard title="⚠️ การแพ้และข้อควรระวัง" icon={AlertTriangle} alert>
          <div className="flex flex-wrap gap-2">
            {handoff.allergies!.map((allergy) => (
              <Badge
                key={allergy}
                variant="destructive"
                className="rounded-full text-xs font-semibold"
              >
                {allergy}
              </Badge>
            ))}
          </div>
          {/* Inline AI suggestions for allergies */}
          {allergySuggestions.length > 0 &&
            onAcceptSuggestion &&
            onDismissSuggestion && (
              <InlineAISuggestions
                suggestions={allergySuggestions}
                onAccept={onAcceptSuggestion}
                onDismiss={onDismissSuggestion}
                className="mt-2"
              />
            )}
          <p className="text-xs text-red-600 mt-2">
            ตรวจสอบยาที่สั่งให้ผู้ป่วยไม่ให้มีส่วนผสมที่แพ้
          </p>
        </SectionCard>
      )}

      {/* 🏥 Medical History */}
      <SectionCard title="ประวัติทางการแพทย์" icon={Stethoscope}>
        {/* AI Alerts at top */}
        {alertSuggestions.length > 0 &&
          onAcceptSuggestion &&
          onDismissSuggestion && (
            <div className="mb-3">
              <InlineAISuggestions
                suggestions={alertSuggestions}
                onAccept={onAcceptSuggestion}
                onDismiss={onDismissSuggestion}
              />
            </div>
          )}

        {/* Symptoms - Primary info */}
        {showSymptoms && (
          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-2">
              อาการ
            </p>
            <div className="flex flex-wrap gap-1.5">
              {handoff.symptoms.length > 0 ? (
                handoff.symptoms.map((symptom) => (
                  <Badge
                    key={symptom}
                    variant="outline"
                    className="rounded-full border-blue-200 bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs"
                  >
                    {symptom}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-400">ไม่มีข้อมูลอาการ</span>
              )}
            </div>
            {/* Inline AI suggestions for symptoms */}
            {symptomSuggestions.length > 0 &&
              onAcceptSuggestion &&
              onDismissSuggestion && (
                <InlineAISuggestions
                  suggestions={symptomSuggestions}
                  onAccept={onAcceptSuggestion}
                  onDismiss={onDismissSuggestion}
                  className="mt-2"
                />
              )}
          </div>
        )}

        {/* Conditions */}
        {(hasConditions || conditionSuggestions.length > 0) && (
          <div className="mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-2">
              โรคประจำตัว
            </p>
            <div className="flex flex-wrap gap-1.5">
              {handoff.conditions!.map((condition) => (
                <Badge
                  key={condition}
                  variant="outline"
                  className="rounded-full border-amber-200 bg-amber-50 text-amber-700 px-2.5 py-0.5 text-xs"
                >
                  {condition}
                </Badge>
              ))}
            </div>
            {/* Inline AI suggestions for conditions */}
            {conditionSuggestions.length > 0 &&
              onAcceptSuggestion &&
              onDismissSuggestion && (
                <InlineAISuggestions
                  suggestions={conditionSuggestions}
                  onAccept={onAcceptSuggestion}
                  onDismiss={onDismissSuggestion}
                  className="mt-2"
                />
              )}
          </div>
        )}

        {/* Current Medications */}
        {hasMedications && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-2">
              ยาที่ใช้อยู่ปัจจุบัน
            </p>
            <div className="flex flex-wrap gap-1.5">
              {handoff.medications!.map((med) => (
                <Badge
                  key={med}
                  variant="outline"
                  className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs"
                >
                  <Pill className="h-3 w-3 mr-1" />
                  {med}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Duration if present */}
        {handoff.duration && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              <span className="font-semibold">ระยะเวลา:</span>{" "}
              {handoff.duration}
            </p>
          </div>
        )}
      </SectionCard>

      {/* 📝 Booking Details */}
      <SectionCard title="ข้อมูลการนัดหมาย" icon={Calendar}>
        <div className="space-y-2 text-sm">
          {handoff.appointmentTime && (
            <p className="text-slate-700">
              <span className="font-semibold text-slate-500">เวลานัด:</span>{" "}
              {new Date(handoff.appointmentTime).toLocaleString("th-TH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}
          {handoff.telemedicineChannel && (
            <p className="text-slate-700">
              <span className="font-semibold text-slate-500">ช่องทาง:</span>{" "}
              {handoff.telemedicineChannel === "video"
                ? "วิดีโอ"
                : handoff.telemedicineChannel === "phone"
                  ? "โทรศัพท์"
                  : "แชท"}
            </p>
          )}
          {handoff.requestType && (
            <p className="text-slate-700">
              <span className="font-semibold text-slate-500">รูปแบบ:</span>{" "}
              {handoff.requestType === "telemedicine"
                ? "เภสัชทางไกล"
                : handoff.requestType === "in_store"
                  ? "มาที่ร้าน"
                  : handoff.requestType === "delivery"
                    ? "จัดส่ง"
                    : "รับเอง"}
            </p>
          )}
        </div>
      </SectionCard>

      {/*  กระดานข้อมูล (Collected Data) */}
      {collectedEntries.length > 0 && (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white overflow-hidden">
          <button
            onClick={() => setShowCollectedData(!showCollectedData)}
            className="w-full flex items-center justify-between p-4 hover:bg-indigo-50/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-indigo-600" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                ข้อมูลที่ผู้ป่วยส่ง
              </p>
            </div>
            {showCollectedData ? (
              <ChevronUp className="h-4 w-4 text-indigo-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {showCollectedData && (
            <div className="px-4 pb-4 space-y-2">
              <div className="grid gap-2 sm:grid-cols-2">
                {collectedEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-xl border border-indigo-100 bg-white/95 px-3 py-2.5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {formatCollectedLabel(key)}
                    </p>
                    <p className="mt-1 text-xs text-slate-700 break-words">
                      {formatCollectedValue(key, value)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Patient booking note (optional) — shown only if present and different from aiSummary */}
      {handoff.patientSummary &&
        handoff.patientSummary !== handoff.aiSummary && (
          <SectionCard
            title="หมายเหตุเมื่อจอง"
            icon={MessageSquare}
            className="border-amber-100 bg-gradient-to-br from-amber-50 to-white"
          >
            <p className="text-sm text-slate-700 leading-relaxed italic">
              {handoff.patientSummary}
            </p>
          </SectionCard>
        )}

      {/* AI Summary — only show if prop enabled and aiSummary is present */}
      {showAiSummary && handoff.aiSummary && (
        <SectionCard
          title="สรุป AI"
          icon={Stethoscope}
          className="border-violet-100 bg-gradient-to-br from-violet-50 to-white"
        >
          <p className="text-sm text-slate-700 leading-relaxed">
            {handoff.aiSummary}
          </p>
        </SectionCard>
      )}
    </div>
  );
}

export default PatientInfoBoard;
