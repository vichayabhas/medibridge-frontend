/**
 * AISuggestionPanel Component
 * 
 * Real-time AI assistant panel for pharmacists during video/voice calls.
 * 
 * Features:
 * - Real-time suggestions display
 * - Auto-fill data recommendations
 * - Transcript viewer (placeholder)
 * - Thai language UI
 * - Collapsible sidebar
 */
'use client'
import React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  FileText, 
  AlertTriangle,
  Plus,
  Mic,
  Bot,
  Minimize2,
  Pill,
  Gauge,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Suggestion, SuggestionType } from "./support/useAISuggestions";
import { cn } from "../utility/setup";
// import { cn } from "@/lib/utils";
// import type { Suggestion, SuggestionType } from "@/hooks/useAISuggestions";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "suggestion";
}

interface AISuggestionPanelProps {
  suggestions: Suggestion[];
  isListening: boolean;
  isProcessing: boolean;
  isTranscribing?: boolean;
  transcript?: string;
  transcriptionMethod?: "web-speech" | "gemini-audio" | "simulated" | null;
  patientName?: string;
  patientContext?: {
    age?: number;
    allergies?: string[];
    conditions?: string[];
    medications?: string[];
  };
  onDismiss: (id: string) => void;
  onAcceptAutoFill: (suggestion: Suggestion, onSave?: (data: { field: string; value: string }) => Promise<void>) => Promise<void>;
  onSimulateTranscript?: (text: string) => void; // For testing
  onSaveToHandoff?: (data: { field: string; value: string }) => Promise<void>; // NEW: Save to handoff
  className?: string;
}

const SUGGESTION_CONFIG: Record<SuggestionType, {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  question: {
    icon: <MessageSquare className="h-4 w-4" />,
    label: "คำถาม",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  info: {
    icon: <FileText className="h-4 w-4" />,
    label: "ข้อมูล",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  alert: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "คำเตือน",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  auto_fill: {
    icon: <Plus className="h-4 w-4" />,
    label: "บันทึกข้อมูล",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  follow_up: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "ติดตาม",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
  },
  interaction: {
    icon: <Pill className="h-4 w-4" />,
    label: "ปฏิกิริยายา",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  dosage: {
    icon: <Gauge className="h-4 w-4" />,
    label: "ขนาดยา",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
  },
  drug_recommendation: {
    icon: <Pill className="h-4 w-4" />,
    label: "แนะนำยา",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  contraindication: {
    icon: <AlertCircle className="h-4 w-4" />,
    label: "ห้ามใช้",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  documentation: {
    icon: <FileText className="h-4 w-4" />,
    label: "บันทึก",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
  },
};

export default function AISuggestionPanel({
  suggestions,
  isListening,
  isProcessing,
  isTranscribing = false,
  transcript = "",
  transcriptionMethod = null,
  patientName,
  patientContext,
  onDismiss,
  onAcceptAutoFill,
  onSimulateTranscript,
  onSaveToHandoff,
  className,
}: AISuggestionPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"suggestions" | "transcript" | "chat">("suggestions");
  const [testInput, setTestInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Add welcome message on first load
  useEffect(() => {
    if (chatMessages.length === 0 && patientName) {
      setChatMessages([{
        id: "welcome",
        role: "assistant",
        content: `สวัสดีครับ ผมคือ AI ผู้ช่วยเภสัชกร วันนี้ต้องการให้ช่วยเหลือเรื่องใดครับ?\n\nคุณสามารถ:\n• พิมพ์ถามคำถามเกี่ยวกับยา/อาการ\n• พิมพ์บันทึกการสนทนากับผู้ป่วยเพื่อให้ AI วิเคราะห์\n• รอ AI วิเคราะห์อัตโนมัติจากการสนทนา`,
        timestamp: new Date(),
        type: "text"
      }]);
    }
  }, [patientName, chatMessages.length]);

  const handleTestSubmit = useCallback(() => {
    if (testInput.trim() && onSimulateTranscript) {
      onSimulateTranscript(testInput.trim());
      setTestInput("");
    }
  }, [testInput, onSimulateTranscript]);

  const handleChatSubmit = useCallback(async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatInput("");
    
    // Add user message
    setChatMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: new Date(),
      type: "text"
    }]);
    
    setIsAIResponding(true);
    
    // Simulate AI response (in production, this would call Gemini API)
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: `ได้รับข้อความ: "${userMessage}"\n\nในเวอร์ชั่นเต็ม AI จะวิเคราะห์และตอบคำถามนี้โดยอ้างอิงจากฐานข้อมูลทางการแพทย์ที่เชื่อถือได้`,
        timestamp: new Date(),
        type: "text"
      }]);
      setIsAIResponding(false);
      
      // Also process as transcript for suggestions
      if (onSimulateTranscript) {
        onSimulateTranscript(userMessage);
      }
    }, 1000);
  }, [chatInput, onSimulateTranscript]);

  if (isCollapsed) {
    return (
      <div className={cn("absolute right-4 top-4 z-20", className)}>
        <Button
          variant="default"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg"
        >
          <Bot className="h-4 w-4 mr-2" />
          AI ผู้ช่วย
          {suggestions.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
              {suggestions.length}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "absolute right-4 top-4 bottom-4 w-80 z-20 flex flex-col",
      className
    )}>
      <Card className="flex flex-col h-full bg-white/95 backdrop-blur shadow-xl border-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-semibold">AI ผู้ช่วยเภสัชกร</span>
          </div>
          <div className="flex items-center gap-1">
            {isListening && (
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <div className="flex items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse delay-75" />
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse delay-150" />
                </div>
                <span>ฟังอยู่</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={() => setIsCollapsed(true)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "suggestions"
                ? "bg-violet-50 text-violet-700 border-b-2 border-violet-600"
                : "text-slate-600 hover:bg-slate-50"
            )}
            onClick={() => setActiveTab("suggestions")}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4" />
              คำแนะนำ
              {suggestions.length > 0 && (
                <Badge variant="secondary" className="bg-violet-100 text-violet-700">
                  {suggestions.length}
                </Badge>
              )}
            </div>
          </button>
          <button
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "chat"
                ? "bg-violet-50 text-violet-700 border-b-2 border-violet-600"
                : "text-slate-600 hover:bg-slate-50"
            )}
            onClick={() => setActiveTab("chat")}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="h-4 w-4" />
              คุยกับ AI
            </div>
          </button>
          <button
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === "transcript"
                ? "bg-violet-50 text-violet-700 border-b-2 border-violet-600"
                : "text-slate-600 hover:bg-slate-50"
            )}
            onClick={() => setActiveTab("transcript")}
          >
            <div className="flex items-center justify-center gap-2">
              <Mic className="h-4 w-4" />
              บันทึก
            </div>
          </button>
        </div>

        {/* Patient Context Header */}
        {patientName && (
          <div className="px-3 py-2 bg-gradient-to-r from-slate-50 to-white border-b">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-6 w-6 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="text-xs font-bold text-violet-700">
                  {patientName.charAt(0)}
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-700">
                {patientName}
                {patientContext?.age && `, ${patientContext.age}ปี`}
              </span>
            </div>
            {patientContext && (patientContext.allergies?.length || patientContext.conditions?.length) && (
              <div className="flex flex-wrap gap-1 text-xs">
                {patientContext.allergies?.map(allergy => (
                  <span key={allergy} className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                    แพ้{allergy}
                  </span>
                ))}
                {patientContext.conditions?.map(condition => (
                  <span key={condition} className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                    {condition}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {activeTab === "suggestions" ? (
            <>
              {/* Processing indicator */}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 py-4 text-slate-500 text-sm">
                  <div className="flex items-center gap-0.5">
                    <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce delay-75" />
                    <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce delay-150" />
                  </div>
                  <span>AI กำลังวิเคราะห์...</span>
                </div>
              )}

              {/* Suggestions list */}
              {suggestions.length === 0 && !isProcessing ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500 mb-1">ยังไม่มีคำแนะนำ</p>
                  <p className="text-xs text-slate-400">AI จะแนะนำเมื่อได้ยินการสนทนา</p>
                  
                  {/* Test input for development */}
                  {onSimulateTranscript && (
                    <div className="mt-4 px-4">
                      <p className="text-xs text-slate-400 mb-2">ทดสอบ (สำหรับการพัฒนา)</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="พิมพ์ข้อความจำลอง..."
                          className="flex-1 text-xs px-2 py-1.5 rounded border border-slate-200"
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleTestSubmit()}
                        />
                        <Button size="sm" variant="outline" onClick={handleTestSubmit}>
                          ทดสอบ
                        </Button>
                      </div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {["ปวดหัว มีไข้", "แพ้ยาแอสไพริน", "เป็นเบาหวาน"].map((text) => (
                          <button
                            key={text}
                            onClick={() => onSimulateTranscript?.(text)}
                            className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                          >
                            {text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion) => {
                    const config = SUGGESTION_CONFIG[suggestion.type];
                    const isAutoFill = suggestion.type === "auto_fill";

                    return (
                      <div
                        key={suggestion.id}
                        className={cn(
                          "rounded-lg border p-3 transition-all hover:shadow-md",
                          config.bgColor,
                          config.borderColor
                        )}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className={cn("flex items-center gap-1.5", config.color)}>
                            {config.icon}
                            <span className="text-xs font-semibold">{config.label}</span>
                          </div>
                          <button
                            onClick={() => onDismiss(suggestion.id)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Title */}
                        <p className="font-medium text-sm mt-2 text-slate-900">
                          {suggestion.title}
                        </p>

                        {/* Content */}
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                          {suggestion.content}
                        </p>

                        {/* Context */}
                        {suggestion.context && (
                          <p className="text-xs text-slate-500 mt-2 italic">
                            {suggestion.context}
                          </p>
                        )}

                        {/* Auto-fill data preview */}
                        {isAutoFill && suggestion.autoFillData && (
                          <div className="mt-3 bg-white/80 rounded-lg p-2 border border-white/50">
                            <p className="text-xs text-slate-500 mb-1">
                              บันทึก: {suggestion.autoFillData.field}
                            </p>
                            <p className="text-sm font-medium text-slate-800">
                              {suggestion.autoFillData.value}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              ที่มา: {suggestion.autoFillData.source}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                suggestion.confidence > 0.9
                                  ? "bg-emerald-500"
                                  : suggestion.confidence > 0.8
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                              )}
                            />
                            <span className="text-xs text-slate-500">
                              ความมั่นใจ {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </div>

                          {isAutoFill ? (
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 text-xs bg-violet-600 hover:bg-violet-700"
                              onClick={() => onAcceptAutoFill(suggestion, onSaveToHandoff)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                              บันทึก
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => onDismiss(suggestion.id)}
                            >
                              เข้าใจแล้ว
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : activeTab === "chat" ? (
            /* Chat Tab */
            <div className="flex flex-col h-full">
              {/* Chat Messages */}
              <div 
                ref={chatScrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50"
              >
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="h-8 w-8 text-violet-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">เริ่มสนทนากับ AI</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm",
                          message.role === "user"
                            ? "bg-violet-600 text-white"
                            : "bg-white text-slate-700 border border-slate-200"
                        )}
                      >
                        <p className="text-[10px] opacity-70 mb-1">
                          {message.role === "user" ? "คุณ" : "AI ผู้ช่วย"} • {message.timestamp.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isAIResponding && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse delay-75" />
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse delay-150" />
                        <span className="text-xs text-slate-400 ml-1">AI กำลังพิมพ์...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="p-3 border-t bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChatSubmit()}
                    placeholder="ถาม AI หรือบันทึกการสนทนากับผู้ป่วย..."
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-violet-300 focus:outline-none"
                  />
                  <Button
                    size="sm"
                    onClick={handleChatSubmit}
                    disabled={isAIResponding || !chatInput.trim()}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                  AI จะวิเคราะห์และสร้างคำแนะนำอัตโนมัติ
                </p>
              </div>
            </div>
          ) : (
            /* Transcript Tab */
            <div className="space-y-3">
              {/* Transcription Status */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  {isTranscribing ? (
                    <div className="flex items-center gap-1.5 text-violet-600 text-xs">
                      <div className="flex items-center gap-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse delay-75" />
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse delay-150" />
                      </div>
                      <span>กำลังบันทึก...</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">รอการบันทึก</span>
                  )}
                </div>
                {transcriptionMethod && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {transcriptionMethod === "web-speech" && "Web Speech"}
                    {transcriptionMethod === "gemini-audio" && "Gemini AI"}
                    {transcriptionMethod === "simulated" && "Simulated"}
                  </Badge>
                )}
              </div>

              {/* Transcript Content */}
              <div className="bg-slate-50 rounded-lg p-3 min-h-[120px]">
                {transcript ? (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {transcript}
                  </p>
                ) : (
                  <div className="text-center py-6">
                    <Mic className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">
                      {isTranscribing 
                        ? "กำลังฟัง... พูดเพื่อเริ่มบันทึก" 
                        : "เริ่มการสนทนาเพื่อบันทึกข้อความ"}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Test Buttons (Development) */}
              {onSimulateTranscript && (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400">ทดสอบ (สำหรับการพัฒนา)</p>
                  <div className="flex flex-wrap gap-1">
                    {["ปวดหัว มีไข้", "แพ้เพนิซิลิน", "เป็นเบาหวาน", "กินยาอะไรดี"].map((text) => (
                      <button
                        key={text}
                        onClick={() => onSimulateTranscript(text)}
                        className="px-2 py-1 text-xs bg-white border border-slate-200 rounded hover:border-violet-300 transition-colors"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-slate-50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "h-2 w-2 rounded-full",
                isListening ? "bg-emerald-500" : "bg-slate-300"
              )} />
              <span>{isListening ? "กำลังทำงาน" : "หยุดทำงาน"}</span>
            </div>
            <span>AI โดย MediBridge</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
