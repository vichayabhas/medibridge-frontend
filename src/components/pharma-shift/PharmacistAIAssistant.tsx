/**
 * PharmacistAIAssistant Component
 *
 * Persistent AI sidebar on the pharmacist dashboard (/pharmacy-role).
 * Shows AI suggestions across all active consultations.
 *
 * Features:
 * - Cross-consultation suggestion aggregation
 * - Active consultation counter
 * - Voice transcription status indicator
 * - Quick navigation to specific patient consultation
 * - AI quota tracking (Gemini free tier)
 * - Collapsible sidebar
 */
'use client'
import { useState } from "react";
import {
  Bot,
  Sparkles,
  ChevronRight,
  Mic,
  AlertCircle,
  Plus,
  Pill,
  Gauge,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import React from "react";
import { Suggestion, SuggestionType } from "./support/useAISuggestions";
import { cn } from "../utility/setup";

interface ActiveConsultation {
  id: string;
  patientName: string;
  suggestionCount: number;
  hasCriticalAlert: boolean;
  isTranscribing: boolean;
}

interface PharmacistAIAssistantProps {
  activeConsultations: ActiveConsultation[];
  allSuggestions: Suggestion[];
  quotaRemaining: number;
  quotaTotal?: number;
  onNavigateToConsultation?: (handoffIndex: number) => void;
  onDismissSuggestion?: (id: string) => void;
  className?: string;
}

const SUGGESTION_ICONS: Record<SuggestionType, typeof AlertCircle> = {
  question: MessageSquare,
  info: FileText,
  alert: AlertTriangle,
  auto_fill: Plus,
  follow_up: CheckCircle2,
  interaction: Pill,
  dosage: Gauge,
  drug_recommendation: Pill,
  contraindication: AlertCircle,
  documentation: FileText,
};

const SUGGESTION_COLORS: Record<SuggestionType, string> = {
  question: "bg-blue-50 border-blue-200 text-blue-700",
  info: "bg-emerald-50 border-emerald-200 text-emerald-700",
  alert: "bg-red-50 border-red-200 text-red-700",
  auto_fill: "bg-violet-50 border-violet-200 text-violet-700",
  follow_up: "bg-slate-50 border-slate-200 text-slate-700",
  interaction: "bg-red-50 border-red-200 text-red-700",
  dosage: "bg-cyan-50 border-cyan-200 text-cyan-700",
  drug_recommendation: "bg-emerald-50 border-emerald-200 text-emerald-700",
  contraindication: "bg-red-50 border-red-200 text-red-700",
  documentation: "bg-slate-50 border-slate-200 text-slate-700",
};

export function PharmacistAIAssistant({
  activeConsultations,
  allSuggestions,
  quotaRemaining,
  quotaTotal = 1500,
  onNavigateToConsultation,
  onDismissSuggestion,
  className,
}: PharmacistAIAssistantProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);

  // Calculate quota percentage
  const quotaUsed = quotaTotal - quotaRemaining;
  const quotaPercent = Math.round((quotaUsed / quotaTotal) * 100);

  // Filter suggestions for selected consultation or show all
  const displayedSuggestions = selectedConsultation
    ? allSuggestions.filter((s) => s.id.includes(selectedConsultation))
    : allSuggestions;

  // Group suggestions by type
  const criticalSuggestions = displayedSuggestions.filter(
    (s) => s.type === "alert" || s.type === "interaction" || s.type === "contraindication"
  );
  const dataSuggestions = displayedSuggestions.filter(
    (s) => s.type === "auto_fill" || s.type === "documentation"
  );
  const guidanceSuggestions = displayedSuggestions.filter(
    (s) => s.type === "question" || s.type === "info" || s.type === "dosage" || s.type === "drug_recommendation" || s.type === "follow_up"
  );

  if (isCollapsed) {
    return (
      <div className={cn("fixed right-4 top-20 z-40", className)}>
        <Button
          onClick={() => setIsCollapsed(false)}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg rounded-full px-4"
        >
          <Bot className="h-4 w-4 mr-2" />
          AI ผู้ช่วย
          {allSuggestions.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
              {allSuggestions.length}
            </Badge>
          )}
          {criticalSuggestions.length > 0 && (
            <span className="ml-1.5 h-2 w-2 rounded-full bg-red-400 animate-pulse" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn(
      "fixed right-4 top-20 z-40 w-80 max-h-[calc(100vh-6rem)] flex flex-col bg-white shadow-xl border-0 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-semibold">AI ผู้ช่วยเภสัชกร</span>
        </div>
        <div className="flex items-center gap-1">
          {activeConsultations.some((c) => c.isTranscribing) && (
            <div className="flex items-center gap-0.5 mr-2">
              <Mic className="h-3 w-3 text-white/80" />
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={() => setIsCollapsed(true)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Consultations */}
      {activeConsultations.length > 0 && (
        <div className="border-b">
          <div className="px-4 py-2 bg-slate-50 border-b">
            <p className="text-xs font-medium text-slate-500">
              การปรึกษาที่กำลังดำเนินการ ({activeConsultations.length})
            </p>
          </div>
          <div className="p-2 space-y-1 max-h-32 overflow-y-auto">
            <button
              onClick={() => setSelectedConsultation(null)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                selectedConsultation === null
                  ? "bg-violet-50 text-violet-700 border border-violet-200"
                  : "hover:bg-slate-50 text-slate-700"
              )}
            >
              <span className="font-medium">ทั้งหมด</span>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                {allSuggestions.length}
              </Badge>
            </button>
            {activeConsultations.map((consultation,i) => (
              <button
                key={consultation.id}
                onClick={() => {
                  setSelectedConsultation(consultation.id);
                  onNavigateToConsultation?.(i);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                  selectedConsultation === consultation.id
                    ? "bg-violet-50 text-violet-700 border border-violet-200"
                    : "hover:bg-slate-50 text-slate-700"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{consultation.patientName}</span>
                  {consultation.isTranscribing && (
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {consultation.hasCriticalAlert && (
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  )}
                  {consultation.suggestionCount > 0 && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                      {consultation.suggestionCount}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Critical Alerts */}
        {criticalSuggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              คำเตือนสำคัญ ({criticalSuggestions.length})
            </p>
            {criticalSuggestions.slice(0, 3).map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onDismiss={onDismissSuggestion}
              />
            ))}
          </div>
        )}

        {/* Data Capture */}
        {dataSuggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-violet-600 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              บันทึกข้อมูล ({dataSuggestions.length})
            </p>
            {dataSuggestions.slice(0, 3).map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onDismiss={onDismissSuggestion}
              />
            ))}
          </div>
        )}

        {/* Clinical Guidance */}
        {guidanceSuggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              คำแนะนำ ({guidanceSuggestions.length})
            </p>
            {guidanceSuggestions.slice(0, 3).map((suggestion) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onDismiss={onDismissSuggestion}
              />
            ))}
          </div>
        )}

        {displayedSuggestions.length === 0 && (
          <div className="text-center py-6">
            <Bot className="h-10 w-10 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-500">ยังไม่มีคำแนะนำ</p>
            <p className="text-xs text-slate-400 mt-1">
              AI จะวิเคราะห์อัตโนมัติเมื่อมีการสนทนา
            </p>
          </div>
        )}
      </div>

      {/* Quota Footer */}
      <div className="px-4 py-2 border-t bg-slate-50 shrink-0">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">โควต้า AI</span>
          <span className={cn(
            "font-medium",
            quotaPercent > 80 ? "text-red-600" : "text-slate-600"
          )}>
            {quotaUsed}/{quotaTotal}
          </span>
        </div>
        <div className="mt-1 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              quotaPercent > 80 ? "bg-red-500" : "bg-violet-500"
            )}
            style={{ width: `${quotaPercent}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

// Suggestion Card Component
interface SuggestionCardProps {
  suggestion: Suggestion;
  onDismiss?: (id: string) => void;
}

function SuggestionCard({ suggestion, onDismiss }: SuggestionCardProps) {
  const Icon = SUGGESTION_ICONS[suggestion.type];
  const colors = SUGGESTION_COLORS[suggestion.type];

  return (
    <div className={cn(
      "rounded-lg border p-2.5 text-sm",
      colors
    )}>
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium">{suggestion.title}</p>
          <p className="text-xs opacity-90 mt-0.5 line-clamp-2">
            {suggestion.content}
          </p>
          {suggestion.confidence > 0 && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="h-1 flex-1 bg-black/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-current rounded-full"
                  style={{ width: `${suggestion.confidence * 100}%`, opacity: 0.6 }}
                />
              </div>
              <span className="text-[10px] opacity-70">
                {Math.round(suggestion.confidence * 100)}%
              </span>
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={() => onDismiss(suggestion.id)}
            className="p-1 hover:bg-black/5 rounded shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export default PharmacistAIAssistant;
