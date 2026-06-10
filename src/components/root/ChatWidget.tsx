'use client'
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Pill,
  X,
  RotateCcw,
  ShieldCheck,
  Info,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "../utility/setup";
import React from "react";
import { useRouter } from "next/navigation";

// ─── Types & bot logic (self-contained) ──────────────────────────────────────

interface Message {
  id: number;
  role: "bot" | "user";
  content: string;
  options?: string[];
}

interface CollectedData {
  firstName?: string;
  symptoms: string[];
  duration?: string;
  conditions: string[];
  medications: string[];
  allergies: string[];
}

type Step = "name" | "symptom" | "duration" | "conditions" | "medications" | "allergies" | "done";

const BOT_Q: Record<Step, { text: string; options?: string[] }> = {
  name: { text: "สวัสดีครับ!\nผมจะช่วยรวบรวมอาการของคุณ เพื่อส่งให้เภสัชกรล่วงหน้า\n\nกรุณาบอกชื่อของคุณครับ" },
  symptom: {
    text: "มีอาการอะไรบ้างครับ?",
    options: ["ปวดหัว", "ไข้", "ไอ / เจ็บคอ", "ปวดท้อง", "ผื่นคัน", "ปวดเมื่อย", "อื่นๆ"],
  },
  duration: {
    text: "เป็นมานานแค่ไหนแล้วครับ?",
    options: ["< 1 วัน", "1–3 วัน", "3–7 วัน", "> 1 สัปดาห์"],
  },
  conditions: {
    text: "มีโรคประจำตัวไหมครับ?",
    options: ["เบาหวาน", "ความดันสูง", "โรคหัวใจ", "ภูมิแพ้", "ไม่มี"],
  },
  medications: { text: "กินยาอะไรอยู่บ้างครับ? (หรือพิมพ์ 'ไม่ได้กิน')" },
  allergies: { text: "แพ้ยาอะไรบ้างไหมครับ? (หรือพิมพ์ 'ไม่แพ้')" },
  done: { text: "" },
};

const STEP_ORDER: Step[] = ["name", "symptom", "duration", "conditions", "medications", "allergies", "done"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function BotAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <div className={cn(
      "shrink-0 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/20",
      size === "sm" ? "h-7 w-7" : "h-8 w-8"
    )}>
      <Pill className={cn("text-white", size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4")} />
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div className="rounded-2xl rounded-bl-sm bg-muted border border-border/40 px-3 py-2.5 shadow-sm">
        <div className="flex gap-1 items-center h-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary/50 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function BotBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2 max-w-[85%]">
      <BotAvatar />
      <div className="rounded-2xl rounded-bl-sm bg-card border border-border/40 px-3 py-2.5 text-xs leading-relaxed whitespace-pre-line shadow-sm">
        {text}
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="rounded-2xl rounded-br-sm bg-gradient-to-br from-primary to-[hsl(190_75%_44%)] text-white px-3 py-2.5 text-xs max-w-[85%] leading-relaxed shadow-md shadow-primary/20">
        {text}
      </div>
    </div>
  );
}

function QuickReplies({ options, onSelect, disabled }: { options: string[]; onSelect: (v: string) => void; disabled?: boolean }) {
  return (
    <div className="pl-9 flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => !disabled && onSelect(opt)}
          disabled={disabled}
          className="px-2.5 py-1 rounded-full border border-primary/25 bg-background text-primary text-[11px] font-semibold hover:bg-primary hover:text-white hover:border-primary active:scale-95 transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SummaryCard({ data, onConfirm }: { data: CollectedData; onConfirm: () => void }) {
  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div className="rounded-2xl rounded-bl-sm border border-primary/25 bg-gradient-to-br from-primary/5 to-secondary/5 p-3.5 max-w-[85%] shadow-sm">
        <div className="flex items-center gap-1.5 mb-3">
          <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          <p className="font-bold text-xs text-primary">สรุปข้อมูลของคุณ</p>
        </div>
        <div className="space-y-1.5 text-[11px] mb-3">
          {data.firstName && <div className="flex gap-1.5"><span className="text-muted-foreground w-16 shrink-0">ชื่อ:</span><span className="font-semibold">{data.firstName}</span></div>}
          {data.symptoms.length > 0 && <div className="flex gap-1.5"><span className="text-muted-foreground w-16 shrink-0">อาการ:</span><span className="font-semibold">{data.symptoms.join(", ")}</span></div>}
          {data.duration && <div className="flex gap-1.5"><span className="text-muted-foreground w-16 shrink-0">ระยะเวลา:</span><span className="font-semibold">{data.duration}</span></div>}
          {data.allergies[0] && data.allergies[0] !== "ไม่แพ้" && <div className="flex gap-1.5"><span className="text-muted-foreground w-16 shrink-0">แพ้ยา:</span><span className="font-semibold text-destructive">{data.allergies.join(", ")}</span></div>}
        </div>
        <div className="flex items-start gap-1.5 mb-3 p-2 rounded-lg bg-background/60 border border-border/40">
          <Info className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">ส่งให้เฉพาะร้านยาที่คุณเลือกเท่านั้น</p>
        </div>
        <Button size="sm" className="w-full rounded-xl gap-1.5 h-8 text-xs" onClick={onConfirm}>
          <MapPin className="h-3 w-3" />
          เลือกร้านยา
        </Button>
      </div>
    </div>
  );
}

// ─── Dismiss hint banner ──────────────────────────────────────────────────────

const HINT_DISMISS_KEY = "medibridge.chatHintDismissed";

function HintBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="absolute bottom-[72px] right-0 w-64 animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="relative rounded-2xl bg-card border border-border/60 shadow-[var(--shadow-elevated)] p-3.5">
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
        <div className="flex items-start gap-2.5 pr-4">
          <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/20">
            <Pill className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-xs mb-0.5">ผู้ช่วย MediBridge</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              ต้องการปรึกษาเภสัชกร? ให้ผมช่วยรวบรวมอาการก่อนไปร้านยา
            </p>
          </div>
        </div>
        {/* tail */}
        <div className="absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 bg-card border-b border-r border-border/60" />
      </div>
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Messages / bot state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("name");
  const [isTyping, setIsTyping] = useState(false);
  const [collected, setCollected] = useState<CollectedData>({ symptoms: [], conditions: [], medications: [], allergies: [] });
  const [showSummary, setShowSummary] = useState(false);
  const [started, setStarted] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const msgId = useRef(0);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const newId = () => ++msgId.current;
  const router=useRouter()

  // Show hint after 4 seconds, auto-dismiss after 8 more seconds
  useEffect(() => {
    const dismissed = localStorage.getItem(HINT_DISMISS_KEY);
    if (dismissed) return;
    hintTimer.current = setTimeout(() => {
      setShowHint(true);
      hintTimer.current = setTimeout(() => setShowHint(false), 8000);
    }, 4000);
    return () => { if (hintTimer.current) clearTimeout(hintTimer.current); };
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem(HINT_DISMISS_KEY, "1");
    if (hintTimer.current) clearTimeout(hintTimer.current);
  };

  // Start bot on first open
  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      addBotMessage(BOT_Q.name.text);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, showSummary, open]);

  const addBotMessage = (text: string, options?: string[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((m) => [...m, { id: newId(), role: "bot", content: text, options }]);
    }, 700 + Math.random() * 400);
  };

  const handleSend = (value: string) => {
    if (!value.trim()) return;
    setMessages((m) => [...m, { id: newId(), role: "user", content: value }]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);

    const nextStep = STEP_ORDER[STEP_ORDER.indexOf(step) + 1] as Step;

    switch (step) {
      case "name": setCollected((c) => ({ ...c, firstName: value })); break;
      case "symptom": setCollected((c) => ({ ...c, symptoms: [...c.symptoms, value] })); break;
      case "duration": setCollected((c) => ({ ...c, duration: value })); break;
      case "conditions": setCollected((c) => ({ ...c, conditions: value === "ไม่มี" ? ["ไม่มี"] : [...c.conditions, value] })); break;
      case "medications": setCollected((c) => ({ ...c, medications: [value] })); break;
      case "allergies": setCollected((c) => ({ ...c, allergies: [value] })); break;
    }

    if (nextStep && nextStep !== "done") {
      addBotMessage(BOT_Q[nextStep].text, BOT_Q[nextStep].options);
      setStep(nextStep);
    } else if (nextStep === "done") {
      setStep("done");
      setTimeout(() => setShowSummary(true), 800);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setStep("name");
    setInput("");
    setCollected({ symptoms: [], conditions: [], medications: [], allergies: [] });
    setShowSummary(false);
    msgId.current = 0;
    setTimeout(() => addBotMessage(BOT_Q.name.text), 300);
  };

  const currentOptions = messages[messages.length - 1]?.options;
  const PROGRESS_TOTAL = STEP_ORDER.length - 1;
  const progressPct = Math.round((STEP_ORDER.indexOf(step) / (PROGRESS_TOTAL - 1)) * 100);

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6 flex flex-col items-end gap-3">

      {/* ── Hint banner ── */}
      {showHint && !open && <HintBanner onDismiss={dismissHint} />}

      {/* ── Chat popup ── */}
      {open && (
        <div className="w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-border/60 bg-background shadow-[var(--shadow-elevated)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-md shadow-primary/20 shrink-0">
              <Pill className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs leading-none mb-0.5">ผู้ช่วย MediBridge</p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                ออนไลน์
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleReset} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="เริ่มใหม่">
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setOpen(false)} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="shrink-0 px-3.5 pt-2 pb-1.5 border-b border-border/30 bg-background/95">
            <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
              <span>รวบรวมข้อมูล</span>
              <span>{Math.min(STEP_ORDER.indexOf(step) + 1, PROGRESS_TOTAL)} / {PROGRESS_TOTAL}</span>
            </div>
            <div className="h-0.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-warning/5 border-b border-warning/15">
            <Info className="h-3 w-3 text-warning shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              <span className="font-semibold text-warning">ไม่ใช่การวินิจฉัยโรค</span> — รวบรวมข้อมูลให้เภสัชกรเท่านั้น
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5">
            {messages.map((m) => (
              <div key={m.id}>
                {m.role === "bot" ? <BotBubble text={m.content} /> : <UserBubble text={m.content} />}
              </div>
            ))}
            {isTyping && <TypingBubble />}
            {!isTyping && currentOptions && step !== "done" && (
              <QuickReplies options={currentOptions} onSelect={handleSend} />
            )}
            {showSummary && !isTyping && (
              <SummaryCard
                data={collected}
                onConfirm={() => { setOpen(false); router.push("/nearby"); }}
              />
            )}
            <div ref={bottomRef} className="h-1" />
          </div>

          {/* Input */}
          {!showSummary && step !== "done" && (
            <div className="shrink-0 border-t border-border/50 bg-background/95 px-3 py-2.5">
              <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="พิมพ์คำตอบ..."
                  className="flex-1 rounded-xl h-9 text-xs bg-muted/40 border-border/40"
                  disabled={isTyping}
                />
                <Button type="submit" size="icon" className="rounded-xl h-9 w-9 shrink-0 shadow-md shadow-primary/20" disabled={!input.trim() || isTyping}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── FAB button ── */}
      <button
        onClick={() => { setOpen((v) => !v); dismissHint(); }}
        className={cn(
          "relative h-14 w-14 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center",
          open
            ? "bg-muted text-foreground shadow-md"
            : "bg-gradient-to-br from-primary to-secondary text-white shadow-primary/40 hover:scale-105 active:scale-95"
        )}
        aria-label="เปิดผู้ช่วย MediBridge"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {/* Pulse ring animation */}
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
            {/* Unread dot */}
            <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-success border-2 border-background" />
          </>
        )}
      </button>
    </div>
  );
}
