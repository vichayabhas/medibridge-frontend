/**
 * InlineAISuggestions Component
 * 
 * Shows AI suggestions inline within patient data sections.
 * Allows accepting suggestions directly into the data fields.
 */
'use client'
import React from "react";

import { useState } from "react";
import { Check, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Suggestion } from "./support/useAISuggestions";
import { cn } from "../utility/setup";

interface InlineAISuggestionsProps {
  suggestions: Suggestion[];
  onAccept: (suggestion: Suggestion) => Promise<void>;
  onDismiss: (id: string) => void;
  className?: string;
}

export default function InlineAISuggestions({ 
  suggestions, 
  onAccept, 
  onDismiss,
  className 
}: InlineAISuggestionsProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleAccept = async (suggestion: Suggestion) => {
    setProcessing(suggestion.id);
    try {
      await onAccept(suggestion);
    } finally {
      setProcessing(null);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg border animate-in fade-in slide-in-from-top-1",
            suggestion.type === "alert" && "bg-red-50 border-red-200",
            suggestion.type === "interaction" && "bg-red-50 border-red-200",
            suggestion.type === "auto_fill" && "bg-violet-50 border-violet-200",
            suggestion.type === "dosage" && "bg-cyan-50 border-cyan-200",
            suggestion.type === "question" && "bg-blue-50 border-blue-200",
            suggestion.type === "follow_up" && "bg-slate-50 border-slate-200",
            suggestion.type === "info" && "bg-emerald-50 border-emerald-200"
          )}
        >
          <Sparkles className={cn(
            "h-3.5 w-3.5 shrink-0",
            suggestion.type === "alert" && "text-red-500",
            suggestion.type === "interaction" && "text-red-500",
            suggestion.type === "auto_fill" && "text-violet-500",
            suggestion.type === "dosage" && "text-cyan-500"
          )} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-700">
                {suggestion.autoFillData?.value || suggestion.content}
              </span>
              <Badge variant="outline" className="text-[9px] px-1 py-0 border-slate-200">
                AI {Math.round(suggestion.confidence * 100)}%
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 truncate">
              {suggestion.title}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {suggestion.autoFillData && (
              <button
                onClick={() => handleAccept(suggestion)}
                disabled={processing === suggestion.id}
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                  suggestion.type === "auto_fill" 
                    ? "bg-violet-600 text-white hover:bg-violet-700" 
                    : "bg-emerald-600 text-white hover:bg-emerald-700",
                  processing === suggestion.id && "opacity-50 cursor-not-allowed"
                )}
                title="ยอมรับ"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={() => onDismiss(suggestion.id)}
              className="h-6 w-6 rounded-full flex items-center justify-center bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
              title="ปฏิเสธ"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
