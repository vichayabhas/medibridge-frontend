"use client";
import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { patientBasics } from "./support/utils";
import { useTelepharmacyState } from "./support/useTelepharmacyState";
// import { PharmacistCallView, PharmacistVoiceView } from "@/components/video-call";
// import { DevicePermissionCheck } from "@/components/video-call/DevicePermissionCheck";
// import { PatientInfoBoard } from "@/components/pharmacy/PatientInfoBoard";
// import { InlineAISuggestions } from "@/components/pharmacy/InlineAISuggestions";
// import { useAISuggestions, type Suggestion, type TranscriptionMethod } from "@/hooks/useAISuggestions";
import {
  Bot,
  ImagePlus,
  Maximize2,
  MessageCircle,
  MessageSquare,
  Mic,
  Paperclip,
  Phone,
  PhoneOff,
  Sparkles,
  ScreenShare,
  Video,
  Volume2,
  X,
} from "lucide-react";

import type { TelepharmacyEvent } from "./support/types";
import {
  HandoffWithMessages,
  PatientHandoffType,
  TelemedicineChannel,
} from "../../../interface";
import {
  Suggestion,
  TranscriptionMethod,
  useAISuggestions,
} from "./support/useAISuggestions";
import { cn, setTextToString } from "../utility/setup";
import PatientInfoBoard from "./PatientInfoBoard";
import InlineAISuggestions from "./InlineAISuggestions";
import DevicePermissionCheck from "../common/DevicePermissionCheck";
import PharmacistCallView from "./PharmacistCallView";
import PharmacistVoiceView from "./PharmacistVoiceView";
// import { DevicePermissionCheck } from "./DevicePermissionCheck";
// import PharmacistVoiceView from "./PharmacistVoiceView";
// import PharmacistCallView from "./PharmacistCallView";

interface InfoPanelProps {
  activeTelepharmacy: PatientHandoffType;
  suggestions: Suggestion[];
  acceptAutoFill: (
    suggestion: Suggestion,
    onSave?: (data: { field: string; value: string }) => Promise<void>,
  ) => Promise<void>;
  dismissSuggestion: (id: string) => void;
  // updateHandoff: (handoffId: string, patch: Record<string, unknown>,index:number) => Promise<void>;
  telepharmacyEvents:  TelepharmacyEvent[];
  onClose: () => void;
  // Transcription state
  isTranscribing?: boolean;
  transcript?: string;
  transcriptionMethod?: TranscriptionMethod;
  isListening?: boolean;
  isProcessing?: boolean;
}

const INFO_TABS = [
  { key: "patient", label: "ข้อมูลผู้ป่วย" },
  { key: "assessment", label: "การประเมิน" },
  { key: "timeline", label: "ไทม์ไลน์" },
] as const;

type InfoTab = (typeof INFO_TABS)[number]["key"];

function InfoPanel({
  activeTelepharmacy,
  suggestions,
  acceptAutoFill,
  dismissSuggestion,
  // updateHandoff,
  telepharmacyEvents,
  onClose,
  isTranscribing,
  transcript,
  transcriptionMethod,
  isListening,
  isProcessing,
}: InfoPanelProps) {
  const [activeTab, setActiveTab] = useState<InfoTab>("patient");

  return (
    <div className="flex flex-col max-h-[70vh] overflow-hidden">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-100 px-4 pt-4 shrink-0">
        {INFO_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "rounded-t-lg px-4 py-2 text-xs font-semibold transition-colors",
              activeTab === tab.key
                ? "border border-b-white border-slate-200 bg-white text-indigo-600 -mb-px"
                : "text-slate-500 hover:text-slate-800",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 🎤 Listening Status Card - Stable indicator, no flickering */}
        {(isTranscribing || isListening || transcript) && (
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">
                  บันทึกการสนทนา
                </span>
              </div>
              {/* Stable indicator - doesn't flicker */}
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-600">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                กำลังทำงาน
              </span>
            </div>

            {transcript && (
              <div className="rounded-lg bg-white/80 border border-emerald-100 p-2">
                <p className="text-xs text-slate-700 line-clamp-3">
                  {transcript}
                </p>
              </div>
            )}

            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                {transcriptionMethod === "web-speech"
                  ? "Web Speech API"
                  : transcriptionMethod === "gemini-audio"
                    ? "Gemini AI"
                    : transcriptionMethod === "simulated"
                      ? "Simulated"
                      : "ไม่ระบุ"}
              </span>
              {isProcessing && (
                <span className="text-[10px] text-violet-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                  กำลังวิเคราะห์...
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === "patient" && (
          <PatientInfoBoard
            handoff={activeTelepharmacy}
            compact={true}
            suggestions={suggestions}
            onAcceptSuggestion={acceptAutoFill}
            onDismissSuggestion={dismissSuggestion}
          />
        )}

        {activeTab === "assessment" && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                การประเมินและแผนการรักษา
              </p>
              {suggestions.filter(
                (s) => s.autoFillData?.field === "pharmacistAction",
              ).length > 0 && (
                <InlineAISuggestions
                  suggestions={suggestions.filter(
                    (s) => s.autoFillData?.field === "pharmacistAction",
                  )}
                  onAccept={acceptAutoFill}
                  onDismiss={dismissSuggestion}
                  className="mt-2"
                />
              )}
              {/* <textarea
                value={activeTelepharmacy.pharmacistAction ?? ""}
                onChange={(event) => updateHandoff(activeTelepharmacy._id, { pharmacistAction: event.target.value })}
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
                placeholder="บันทึกการประเมิน คำแนะนำ และแผนการรักษา"
              /> */}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                บันทึกเภสัชกร
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                บันทึกนี้จะส่งให้ผู้ป่วยหลังจบการปรึกษา
              </p>
              {suggestions.filter(
                (s) => s.autoFillData?.field === "pharmacistNote",
              ).length > 0 && (
                <InlineAISuggestions
                  suggestions={suggestions.filter(
                    (s) => s.autoFillData?.field === "pharmacistNote",
                  )}
                  onAccept={acceptAutoFill}
                  onDismiss={dismissSuggestion}
                  className="mt-2"
                />
              )}
              {/* <textarea
                value={activeTelepharmacy.pharmacistNote ?? ""}
                onChange={(event) => updateHandoff(activeTelepharmacy._id, { pharmacistNote: event.target.value })}
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white"
                placeholder="เพิ่มบันทึกทางคลินิกหรือการแจ้งเตือนติดตาม"
              /> */}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={onClose}
              >
                ปิด
              </Button>
              <Button
                className="rounded-xl bg-slate-900 hover:bg-slate-800"
                onClick={() => toast.success("บันทึกเภสัชทางไกลแล้ว")}
              >
                บันทึก
              </Button>
            </div>
          </>
        )}

        {activeTab === "timeline" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
              ไทม์ไลน์เซสชั่น
            </p>
            <div className="space-y-2">
              {(telepharmacyEvents ?? [])
                .slice()
                .reverse()
                .map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <p className="text-xs font-semibold text-slate-700">
                      {event.channel.toUpperCase()} •{" "}
                      {event.status === "idle"
                        ? "รอ"
                        : event.status === "calling"
                          ? "กำลังโทร"
                          : event.status === "connected"
                            ? "เชื่อมต่อแล้ว"
                            : "สิ้นสุด"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {new Date(event.timestamp).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {event.note ? ` • ${event.note}` : ""}
                    </p>
                  </div>
                ))}
              {(telepharmacyEvents?? []).length ===
                0 && (
                <p className="text-xs text-slate-500">
                  ยังไม่มีเหตุการณ์ในเซสชั่น
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TelepharmacyModalProps {
  // state: ReturnType<typeof useTelepharmacyState>;
  onClose: () => void;
  updateHandoff: (
    handoffId: string,
    patch: Partial<PatientHandoffType>,
    i: number,
  ) => Promise<void>;
  requestTab: "waiting" | "ongoing" | "finished";
  index: number;
  telepharmacyChannel: TelemedicineChannel;
  handoffWithMessages: HandoffWithMessages;
  setTelepharmacyChannel: React.Dispatch<
    React.SetStateAction<TelemedicineChannel>
  >;
  pharmacistName: string;
}

export default function TelepharmacyModal({
  onClose,
  updateHandoff,
  requestTab,
  index,
  telepharmacyChannel,
  handoffWithMessages,
  pharmacistName,
  setTelepharmacyChannel,
}: TelepharmacyModalProps) {
  const [showDeviceCheck, setShowDeviceCheck] = useState<
    false | "video" | "phone"
  >(false);
  const [pendingCallType, setPendingCallType] = useState<
    "video" | "phone" | null
  >(null);
  const [showChat, setShowChat] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  // Draggable popup positions - centered on screen initially
  const [aiChatPosition, setAiChatPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 160 : 400,
    y: 200,
  });
  const [patientChatPosition, setPatientChatPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth / 2 - 160 : 400,
    y: 250,
  });
  const [isDraggingAI, setIsDraggingAI] = useState(false);
  const [isDraggingPatient, setIsDraggingPatient] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const state = useTelepharmacyState({
    pharmacistName,
    handoffWithMessages,
    telemedicineChannel: telepharmacyChannel,
  });

  const {
    activeTelepharmacy,
    activeTelemedicineRoom,

    availableTelepharmacyChannels,
    getTelepharmacyCallState,
    telepharmacyCallConnectedAt,
    formatElapsedTime,
    videoCallState,
    phoneCallState,
    startTelepharmacyCall,
    endTelepharmacyCall,
    addTelepharmacyAttachments,
    activeTelepharmacyAttachments,
    getAttachmentIcon,
    removeTelepharmacyAttachment,
    formatAttachmentSize,
    chatScrollRef,
    telepharmacyMessages,
    telepharmacyDrafts,
    setTelepharmacyDrafts,
    sendTelepharmacyMessage,
    // aiRecommendationText,
    // aiRecommendationStreaming,
    telepharmacyEvents,
  } = state;

  // Auto-close modal when call ends (user hangs up or leaves)
  useEffect(() => {
    if (!activeTelepharmacy) return;

    const wasConnected =
      videoCallState === "connected" || phoneCallState === "connected";
    const nowIdle = videoCallState === "idle" && phoneCallState === "idle";

    // If we were in a call and now both are idle, close the modal
    if (wasConnected && nowIdle) {
      onClose();
    }
  }, [activeTelepharmacy, videoCallState, phoneCallState, onClose]);

  // AI suggestions hook with patient context and real-time transcription
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const {
    suggestions,
    isListening,
    isProcessing,
    isTranscribing,
    transcript,
    transcriptionMethod,
    dismissSuggestion,
    acceptAutoFill,
    startListening,
    stopListening,
    simulateTranscript,
  } = useAISuggestions({
    handoffId: activeTelepharmacy?._id || "",
    isActive: !!activeTelepharmacy && requestTab === "ongoing",
    patientData: activeTelepharmacy || undefined,
    aiProvider: "gemini",
    enableTranscription: true,
    geminiApiKey,
  });

  // Start/stop AI listening based on active consultation
  useEffect(() => {
    if (activeTelepharmacy && requestTab === "ongoing") {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [activeTelepharmacy, requestTab, startListening, stopListening]);

  // Global drag handlers for popups
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingAI) {
        setAiChatPosition({
          x: e.clientX - dragOffsetRef.current.x,
          y: e.clientY - dragOffsetRef.current.y,
        });
      }
      if (isDraggingPatient) {
        setPatientChatPosition({
          x: e.clientX - dragOffsetRef.current.x,
          y: e.clientY - dragOffsetRef.current.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingAI(false);
      setIsDraggingPatient(false);
    };

    if (isDraggingAI || isDraggingPatient) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDraggingAI, isDraggingPatient]);

  // Save AI-extracted data to handoff
  // const handleSaveToHandoff = async (data: { field: string; value: string }) => {
  //   if (!activeTelepharmacy) return;

  //   const { field, value } = data;

  //   // Array fields (symptoms, allergies, conditions, medications)
  //   const arrayFields = ["symptoms", "allergies", "conditions", "medications"];

  //   if (arrayFields.includes(field)) {
  //     const currentValues = (activeTelepharmacy as Record<string, unknown>)[field] as string[] || [];
  //     // Parse comma-separated values
  //     const newValues = value.split(/[,，]/).map(v => v.trim()).filter(Boolean);
  //     // Merge with existing (avoid duplicates)
  //     const mergedValues = [...new Set([...currentValues, ...newValues])];
  //     await updateHandoff(activeTelepharmacy._id, { [field]: mergedValues });
  //   } else {
  //     // Text fields (pharmacistAction, pharmacistNote) - replace content
  //     const currentText = ((activeTelepharmacy as Record<string, unknown>)[field] as string) || "";
  //     // Append AI suggestion to existing text with separator
  //     const mergedText = currentText
  //       ? `${currentText}\n\n--- AI Suggestion ---\n${value}`
  //       : value;
  //     await updateHandoff(activeTelepharmacy._id, { [field]: mergedText });
  //   }

  //   const fieldLabels: Record<string, string> = {
  //     symptoms: "อาการ",
  //     allergies: "การแพ้",
  //     conditions: "โรคประจำตัว",
  //     medications: "ยาที่ใช้อยู่",
  //     pharmacistAction: "การประเมิน",
  //     pharmacistNote: "บันทึกเภสัชกร",
  //   };
  //   toast.success(`บันทึก${fieldLabels[field] || "ข้อมูล"}แล้ว`);
  // };

  const handleStartCall = (type: "video" | "phone") => {
    setPendingCallType(type);
    setShowDeviceCheck(type);
  };

  const handleDeviceCheckGranted = () => {
    if (pendingCallType && activeTelepharmacy) {
      startTelepharmacyCall(activeTelepharmacy._id, pendingCallType);
    }
    setShowDeviceCheck(false);
    setPendingCallType(null);
  };

  // Handle modal close - end any active call first
  const handleCloseWithCallEnd = useCallback(() => {
    // Check if there's an active call and end it
    if (activeTelepharmacy) {
      // End video call if connected or still connecting
      if (videoCallState === "connected" || videoCallState === "calling") {
        endTelepharmacyCall(activeTelepharmacy._id, "video");
      }
      // End phone call if connected or still connecting
      if (phoneCallState === "connected" || phoneCallState === "calling") {
        endTelepharmacyCall(activeTelepharmacy._id, "phone");
      }
    }
    onClose();
  }, [
    activeTelepharmacy,
    videoCallState,
    phoneCallState,
    endTelepharmacyCall,
    onClose,
  ]);

  if (!activeTelepharmacy) return null;

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseWithCallEnd();
    }
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseWithCallEnd();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleCloseWithCallEnd]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-[95vw] max-h-[90vh] overflow-visible rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Telepharmacy Session
            </p>
            <h2 className="text-xl font-bold text-slate-950">
              {activeTelepharmacy.patientName}
            </h2>
            <p className="text-xs text-slate-500">
              {patientBasics(activeTelepharmacy)} • {activeTelepharmacy._id}
            </p>
          </div>
          <button
            onClick={handleCloseWithCallEnd}
            className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-slate-300 hover:text-slate-600"
            aria-label="Close telepharmacy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr] overflow-visible">
          <div className="border-b border-slate-100 p-6 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Communication
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  Live channel and patient updates
                </p>
              </div>
              <div className="flex gap-2">
                {/* AI Assistant Button - Always visible for active consultations */}
                <button
                  onClick={() => setShowAIChat((s) => !s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition",
                    showAIChat
                      ? "bg-violet-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-violet-300",
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {showAIChat ? "ซ่อน AI" : "AI ช่วยแนะนำ"}
                  {suggestions.length > 0 && !showAIChat && (
                    <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-100 text-[10px] text-violet-700">
                      {suggestions.length}
                    </span>
                  )}
                </button>
                {availableTelepharmacyChannels.map((channel) =>
                  (() => {
                    const channelState = getTelepharmacyCallState(channel.key);
                    const startedAt =
                      telepharmacyCallConnectedAt?.[channel.key];
                    return (
                      <button
                        key={channel.key}
                        onClick={() => setTelepharmacyChannel(channel.key)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold transition",
                          telepharmacyChannel === channel.key
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300",
                        )}
                      >
                        <span>{channel.label}</span>
                        {channelState === "connected" && (
                          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                            {formatElapsedTime(startedAt)}
                          </span>
                        )}
                        {channelState === "calling" && (
                          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                            กำลังโทร
                          </span>
                        )}
                        {channelState === "error" && (
                          <span className="rounded-full bg-red-500/80 px-1.5 py-0.5 text-[10px] font-bold">
                            ผิดพลาด
                          </span>
                        )}
                      </button>
                    );
                  })(),
                )}
              </div>
            </div>

            {/* Pre-call device permission check */}
            {showDeviceCheck === "video" && videoCallState === "idle" ? (
              <div className="h-[560px] overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                <DevicePermissionCheck
                  audioOnly={false}
                  onPermissionGranted={handleDeviceCheckGranted}
                  onCancel={() => setShowDeviceCheck(false)}
                />
              </div>
            ) : showDeviceCheck === "phone" && phoneCallState === "idle" ? (
              <div className="h-[560px] overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                <DevicePermissionCheck
                  audioOnly={true}
                  onPermissionGranted={handleDeviceCheckGranted}
                  onCancel={() => setShowDeviceCheck(false)}
                />
              </div>
            ) : telepharmacyChannel === "video" ? (
              <div className="space-y-4">
                {videoCallState === "idle" ? (
                  <div className="relative h-[280px] lg:h-[320px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(129,140,248,0.25),transparent_50%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.95))]" />
                    <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white">
                      <div className="rounded-full bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                        พร้อมปรึกษาทางวิดีโอ
                      </div>
                      <p className="text-lg font-semibold">เริ่มสายวิดีโอ</p>
                      <p className="text-xs text-white/70">
                        คุณจะเชื่อมต่อกับ {activeTelepharmacy.patientName}{" "}
                        เมื่อพร้อม
                      </p>
                      <Button
                        className="rounded-full bg-white/10 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/20"
                        onClick={() => handleStartCall("video")}
                      >
                        เริ่มวิดีโอ
                      </Button>
                    </div>
                  </div>
                ) : videoCallState === "calling" ? (
                  <div className="relative h-[280px] lg:h-[320px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(129,140,248,0.25),transparent_60%),linear-gradient(135deg,rgba(2,6,23,0.95),rgba(15,23,42,0.95))]" />
                    <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 text-center text-white">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10">
                        <Video className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                        กำลังโทร
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:120ms]" />
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:240ms]" />
                      </div>
                      <p className="text-xs text-slate-500">
                        Dialing {activeTelepharmacy.patientName}...
                      </p>
                      <Button
                        variant="outline"
                        className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20"
                        onClick={() =>
                          endTelepharmacyCall(activeTelepharmacy._id, "video")
                        }
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                ) : activeTelemedicineRoom?.roomUrl ? (
                  // Live video call with Daily.co + Chat + AI Chat
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Live Video Call
                      </p>
                      <div className="flex items-center gap-2">
                        {/* AI Chat Button */}
                        <button
                          onClick={() => setShowAIChat((s) => !s)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                            showAIChat
                              ? "bg-violet-600 text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:border-violet-300",
                          )}
                        >
                          <Bot className="h-4 w-4" />
                          {showAIChat ? "ซ่อน AI" : "คุยกับ AI"}
                        </button>
                        {/* Patient Chat Button */}
                        <button
                          onClick={() => setShowChat((s) => !s)}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                            showChat
                              ? "bg-indigo-600 text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300",
                          )}
                        >
                          <MessageSquare className="h-4 w-4" />
                          {showChat ? "ซ่อนแชท" : "เปิดแชท"}
                        </button>
                      </div>
                    </div>

                    {showChat && (
                      <div
                        className="fixed w-[360px] min-w-[320px] min-h-[300px] resize rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-50 flex flex-col"
                        style={{
                          left: `${patientChatPosition.x}px`,
                          top: `${patientChatPosition.y}px`,
                          resize: "both",
                        }}
                      >
                        {/* Header */}
                        <div
                          className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white cursor-move select-none"
                          onMouseDown={(e) => {
                            setIsDraggingPatient(true);
                            dragOffsetRef.current = {
                              x: e.clientX - patientChatPosition.x,
                              y: e.clientY - patientChatPosition.y,
                            };
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            <span className="font-semibold">แชทกับผู้ป่วย</span>
                            <span className="text-xs text-white/70">
                              (ลากเพื่อย้าย)
                            </span>
                          </div>
                          <button
                            onClick={() => setShowChat(false)}
                            className="p-1.5 rounded-full hover:bg-white/20 text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Messages - flex-1 to fill space */}
                        <div
                          ref={chatScrollRef}
                          className="flex-1 space-y-3 overflow-y-auto p-4 bg-slate-50"
                        >
                          {(telepharmacyMessages ?? []).length === 0 ? (
                            <div className="text-center py-8">
                              <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                              <p className="text-sm text-slate-500">
                                ยังไม่มีข้อความ
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                เริ่มสนทนากับผู้ป่วย
                              </p>
                            </div>
                          ) : (
                            (telepharmacyMessages ?? []).map((message) => (
                              <div
                                key={message._id}
                                className={cn(
                                  "flex",
                                  message.senderType === "pharmacist"
                                    ? "justify-end"
                                    : "justify-start",
                                )}
                              >
                                <div
                                  className={cn(
                                    "max-w-[85%] rounded-2xl px-3 py-2.5 text-sm shadow-sm",
                                    message.senderType === "pharmacist"
                                      ? "bg-indigo-600 text-white"
                                      : "bg-white text-slate-700 border border-slate-200",
                                  )}
                                >
                                  <p className="text-[10px] opacity-70 mb-1">
                                    {message.senderType === "pharmacist"
                                      ? "คุณ"
                                      : "ผู้ป่วย"}{" "}
                                    •{" "}
                                    {new Date(
                                      message.createdAt,
                                    ).toLocaleTimeString("th-TH", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                  {message.imageUrl ? (
                                    <div className="space-y-1">
                                      <img
                                        src={message.imageUrl}
                                        alt="Attached"
                                        className="max-w-[200px] max-h-[150px] rounded-lg object-cover"
                                      />
                                      {message.content && (
                                        <p>{message.content}</p>
                                      )}
                                    </div>
                                  ) : (
                                    // ) : (message.imageUrl ?? []).length > 0 ? (
                                    //   <div className="space-y-1">
                                    //     {(message.attachments ?? []).map(
                                    //       (url, i) => (
                                    //         <a
                                    //           key={i}
                                    //           href={url}
                                    //           download={message.text || "file"}
                                    //           className="flex items-center gap-1.5 underline opacity-90 text-xs"
                                    //         >
                                    //           <Paperclip className="h-3 w-3 shrink-0" />
                                    //           {message. || "ไฟล์แนบ"}
                                    //         </a>
                                    //       ),
                                    //     )}
                                    //   </div>
                                    <p>{message.content}</p>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Attached Files Preview */}
                        {activeTelepharmacyAttachments.length > 0 && (
                          <div className="px-3 py-2 bg-white border-t border-slate-100">
                            <p className="text-[10px] text-slate-400 mb-1">
                              ไฟล์ที่แนบ:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {activeTelepharmacyAttachments.map(
                                (file, index) => (
                                  <div
                                    key={`${file.name}-${index}`}
                                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-lg text-xs"
                                  >
                                    <span className="truncate max-w-[100px]">
                                      {file.name}
                                    </span>
                                    <button
                                      onClick={() =>
                                        removeTelepharmacyAttachment(index)
                                      }
                                      className="text-slate-400 hover:text-red-500"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                        {/* Input - always at bottom */}
                        <div className="p-3 border-t border-slate-200 bg-white">
                          <div className="flex gap-2">
                            <input
                              id={`chat-file-${activeTelepharmacy._id}`}
                              type="file"
                              accept="image/*,application/pdf,.doc,.docx,.txt"
                              multiple
                              className="hidden"
                              onChange={(event) => {
                                if (
                                  event.target.files &&
                                  event.target.files.length > 0
                                ) {
                                  addTelepharmacyAttachments(
                                    event.target.files,
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={`chat-file-${activeTelepharmacy._id}`}
                              className="inline-flex cursor-pointer items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition flex-shrink-0"
                              title="แนบรูป/ไฟล์"
                            >
                              <Paperclip className="h-5 w-5" />
                            </label>
                            <Input
                              placeholder="พิมพ์ข้อความ..."
                              value={telepharmacyDrafts ?? ""}
                              onChange={setTextToString(setTelepharmacyDrafts)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                  event.preventDefault();
                                  sendTelepharmacyMessage(
                                    activeTelepharmacy._id,
                                  );
                                }
                              }}
                              className="h-10 flex-1 rounded-xl bg-slate-50 border-slate-200 text-sm"
                            />
                            <Button
                              size="sm"
                              className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
                              onClick={() =>
                                sendTelepharmacyMessage(activeTelepharmacy._id)
                              }
                              disabled={
                                !telepharmacyDrafts?.trim() &&
                                activeTelepharmacyAttachments.length === 0
                              }
                            >
                              ส่ง
                            </Button>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                            รูปภาพและไฟล์จะแสดงในแชท
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="h-[460px] lg:h-[520px] overflow-visible rounded-2xl border border-slate-800">
                      <PharmacistCallView
                        roomUrl={activeTelemedicineRoom.roomUrl}
                        handoffId={activeTelepharmacy._id}
                        participantName="Pharmacist"
                        isEmbedded={true}
                        showAIPanel={false}
                        onLeaveCall={() =>
                          endTelepharmacyCall(activeTelepharmacy._id, "video")
                        }
                      />
                    </div>
                  </div>
                ) : (
                  // Connecting placeholder (room creating)
                  <>
                    <div className="relative h-[280px] lg:h-[320px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_80%_10%,rgba(129,140,248,0.25),transparent_50%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.95))]" />
                      <div className="relative z-10 flex h-full flex-col justify-between p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                            <span className="h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
                            กำลังสร้างห้อง...
                          </div>
                          <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70">
                            {`Connected ${formatElapsedTime(state.connectedVideoAt)}`}
                          </div>
                        </div>

                        <div className="text-white">
                          <p className="text-sm font-semibold">
                            {activeTelepharmacy.patientName}
                          </p>
                          <p className="text-xs text-slate-500">
                            Live session • Video ready
                          </p>
                        </div>
                      </div>

                      <div className="absolute bottom-4 right-4 w-36 rounded-2xl border border-white/20 bg-white/10 p-2 text-white/80 shadow-lg">
                        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em]">
                          คุณ
                          <span className="text-emerald-300">HD</span>
                        </div>
                        <div className="mt-2 h-16 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300">
                          <Mic className="h-4 w-4" />
                          เปิดไมค์
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300">
                          <Video className="h-4 w-4" />
                          เปิดกล้อง
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300">
                          <ScreenShare className="h-4 w-4" />
                          แชร์หน้าจอ
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300">
                          <Volume2 className="h-4 w-4" />
                          ลำโพง
                        </button>
                      </div>
                      <button
                        className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-rose-700"
                        onClick={() =>
                          endTelepharmacyCall(activeTelepharmacy._id, "video")
                        }
                      >
                        <PhoneOff className="h-4 w-4" />
                        จบสาย
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        แชร์กับผู้ป่วย
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <input
                          id={`telepharmacy-image-${activeTelepharmacy._id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) =>
                            addTelepharmacyAttachments(event.target.files)
                          }
                        />
                        <label
                          htmlFor={`telepharmacy-image-${activeTelepharmacy._id}`}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300"
                        >
                          <ImagePlus className="h-4 w-4" />
                          เพิ่มรูปภาพ
                        </label>
                        <input
                          id={`telepharmacy-file-${activeTelepharmacy._id}`}
                          type="file"
                          className="hidden"
                          onChange={(event) =>
                            addTelepharmacyAttachments(event.target.files)
                          }
                        />
                        <label
                          htmlFor={`telepharmacy-file-${activeTelepharmacy._id}`}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300"
                        >
                          <Paperclip className="h-4 w-4" />
                          เพิ่มไฟล์
                        </label>
                      </div>
                    </div>

                    {activeTelepharmacyAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {activeTelepharmacyAttachments.map((file, index) => {
                          const Icon = getAttachmentIcon(file);
                          return (
                            <button
                              key={`${file.name}-${index}`}
                              type="button"
                              onClick={() =>
                                removeTelepharmacyAttachment(index)
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span>{file.name}</span>
                              <span className="text-[10px] font-bold uppercase text-slate-400">
                                {formatAttachmentSize(file.size)}
                              </span>
                              <X className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : telepharmacyChannel === "phone" ? (
              <div className="space-y-4">
                {phoneCallState === "idle" ? (
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(148,163,184,0.22),transparent_55%),radial-gradient(circle_at_85%_20%,rgba(186,230,253,0.35),transparent_60%)]" />
                    <div className="relative z-10 flex flex-col items-center gap-3 px-6 py-10 text-center">
                      <div
                        className={cn(
                          "rounded-full p-4 text-white shadow-lg",
                          requestTab === "ongoing"
                            ? "bg-emerald-600"
                            : "bg-slate-900/90",
                        )}
                      >
                        <Phone className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        พร้อมโทร
                      </p>
                      <p className="text-lg font-bold text-slate-950">
                        เริ่มสายโทรศัพท์
                      </p>
                      <p className="text-xs text-slate-500">
                        เราจะโทรหา {activeTelepharmacy.patientName}
                      </p>
                      <Button
                        className="rounded-full bg-slate-900 px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-slate-800"
                        onClick={() => handleStartCall("phone")}
                      >
                        เริ่มโทร
                      </Button>
                    </div>
                  </div>
                ) : phoneCallState === "calling" ? (
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_35%,rgba(15,23,42,0.12),transparent_60%)]" />
                    <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-10 text-center">
                      <div
                        className={cn(
                          "flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg",
                          requestTab === "ongoing"
                            ? "bg-emerald-600"
                            : "bg-slate-900",
                        )}
                      >
                        <Phone className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                        กำลังโทร
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:120ms]" />
                        <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:240ms]" />
                      </div>
                      <p className="text-xs text-slate-500">
                        Dialing {activeTelepharmacy.patientName}...
                      </p>
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() =>
                          endTelepharmacyCall(activeTelepharmacy._id, "phone")
                        }
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                ) : activeTelemedicineRoom?.roomUrl ? (
                  // Live voice call with Daily.co + Chat
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Live Voice Call
                      </p>
                      <button
                        onClick={() => setShowChat((s) => !s)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                          showChat
                            ? "bg-indigo-600 text-white"
                            : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300",
                        )}
                      >
                        <MessageSquare className="h-4 w-4" />
                        {showChat ? "ซ่อนแชท" : "เปิดแชท"}
                      </button>
                    </div>
                    <div className="h-[460px] lg:h-[520px] overflow-visible rounded-2xl border border-slate-200">
                      <PharmacistVoiceView
                        roomUrl={activeTelemedicineRoom.roomUrl}
                        handoffId={activeTelepharmacy._id}
                        participantName="Pharmacist"
                        patientName={activeTelepharmacy.patientName}
                        isEmbedded={true}
                        onLeaveCall={() =>
                          endTelepharmacyCall(activeTelepharmacy._id, "phone")
                        }
                      />
                    </div>
                    {/* In-call chat panel */}
                    {showChat && (
                      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                        <div
                          ref={chatScrollRef}
                          className="h-[140px] space-y-2 overflow-y-auto p-3 bg-slate-50"
                        >
                          {(telepharmacyMessages ?? []).length === 0 ? (
                            <p className="text-center text-xs text-slate-400 py-4">
                              ยังไม่มีข้อความ
                            </p>
                          ) : (
                            (telepharmacyMessages ?? []).map((message) => (
                              <div
                                key={message._id}
                                className={cn(
                                  "flex",
                                  message.senderType === "pharmacist"
                                    ? "justify-end"
                                    : "justify-start",
                                )}
                              >
                                <div
                                  className={cn(
                                    "max-w-[80%] rounded-xl px-3 py-2 text-xs shadow-sm",
                                    message.senderType === "pharmacist"
                                      ? "bg-indigo-600 text-white"
                                      : "bg-white text-slate-700 border border-slate-200",
                                  )}
                                >
                                  <p className="font-semibold text-[10px] opacity-80 mb-0.5">
                                    {message.senderType === "pharmacist"
                                      ? "คุณ"
                                      : "ผู้ป่วย"}
                                  </p>
                                  {message.content}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="p-2 border-t border-slate-100 flex gap-2">
                          <Input
                            placeholder="พิมพ์ข้อความ..."
                            value={telepharmacyDrafts ?? ""}
                            onChange={setTextToString(
                              setTelepharmacyDrafts,
                              true,
                            )}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                sendTelepharmacyMessage(activeTelepharmacy._id);
                              }
                            }}
                            className="h-9 flex-1 rounded-lg bg-white text-sm"
                          />
                          <input
                            id={`voice-chat-image-${activeTelepharmacy._id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) =>
                              addTelepharmacyAttachments(
                                event.target.files,
                              )
                            }
                          />
                          <label
                            htmlFor={`voice-chat-image-${activeTelepharmacy._id}`}
                            className="inline-flex cursor-pointer items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                          >
                            <ImagePlus className="h-4 w-4" />
                          </label>
                          <Button
                            size="sm"
                            className="h-9 px-3"
                            onClick={() =>
                              sendTelepharmacyMessage(activeTelepharmacy._id)
                            }
                          >
                            ส่ง
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Connecting placeholder (room creating)
                  <>
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(148,163,184,0.22),transparent_55%),radial-gradient(circle_at_85%_20%,rgba(186,230,253,0.35),transparent_60%)]" />
                      <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg">
                          <Phone className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            กำลังสร้างห้อง...
                          </p>
                          <p className="mt-2 text-lg font-bold text-slate-950">
                            {activeTelepharmacy.patientName}
                          </p>
                          <p className="text-sm text-slate-500">
                            Call status: Connected •{" "}
                            {formatElapsedTime(state.connectedPhoneAt)}
                          </p>
                        </div>
                        <div className="grid w-full gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Audio
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              Clear
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Recording
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              Not started
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                              Next step
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              Counseling
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300">
                          <Mic className="h-4 w-4" />
                          ปิดไมค์
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300">
                          <Volume2 className="h-4 w-4" />
                          ลำโพง
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300">
                          <MessageCircle className="h-4 w-4" />
                          ส่ง SMS
                        </button>
                      </div>
                      <button
                        className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-rose-700"
                        onClick={() =>
                          endTelepharmacyCall(activeTelepharmacy._id, "phone")
                        }
                      >
                        <PhoneOff className="h-4 w-4" />
                        จบสาย
                      </button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        แชร์กับผู้ป่วย
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <input
                          id={`telepharmacy-image-${activeTelepharmacy._id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) =>
                            addTelepharmacyAttachments(
                              event.target.files,
                            )
                          }
                        />
                        <label
                          htmlFor={`telepharmacy-image-${activeTelepharmacy._id}`}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300"
                        >
                          <ImagePlus className="h-4 w-4" />
                          เพิ่มรูปภาพ
                        </label>
                        <input
                          id={`telepharmacy-file-${activeTelepharmacy._id}`}
                          type="file"
                          className="hidden"
                          onChange={(event) =>
                            addTelepharmacyAttachments(
                              event.target.files,
                            )
                          }
                        />
                        <label
                          htmlFor={`telepharmacy-file-${activeTelepharmacy._id}`}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300"
                        >
                          <Paperclip className="h-4 w-4" />
                          เพิ่มไฟล์
                        </label>
                      </div>
                    </div>

                    {activeTelepharmacyAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {activeTelepharmacyAttachments.map((file, index) => {
                          const Icon = getAttachmentIcon(file);
                          return (
                            <button
                              key={`${file.name}-${index}`}
                              type="button"
                              onClick={() =>
                                removeTelepharmacyAttachment(
                                  index,
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span>{file.name}</span>
                              <span className="text-[10px] font-bold uppercase text-slate-400">
                                {formatAttachmentSize(file.size)}
                              </span>
                              <X className="h-3.5 w-3.5 text-slate-400" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
                <div
                  ref={chatScrollRef}
                  className="h-[280px] lg:h-[320px] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  {(telepharmacyMessages ?? []).map(
                    (message) => (
                      <div
                        key={message._id}
                        className={cn(
                          "flex",
                          message._id === "pharmacist"
                            ? "justify-end"
                            : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-2xl p-3 text-xs leading-6 shadow-sm space-y-1",
                            message.senderType === "pharmacist"
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-slate-700",
                          )}
                        >
                          {message.imageUrl && (
                            <img
                              src={message.imageUrl}
                              alt="Attached"
                              className="max-w-[200px] max-h-[150px] rounded-lg object-cover"
                            />
                          )}
                          {/* {(message.attachments ?? []).map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              download={message.text || "file"}
                              className="flex items-center gap-1.5 underline opacity-90"
                            >
                              <Paperclip className="h-3 w-3 shrink-0" />
                              {message.text || "ไฟล์แนบ"}
                            </a>
                          ))} */}
                          {/* {message.text && !message.attachments?.length && ( */}
                            <p>{message.content}</p>
                          {/* )} */}
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Input
                    placeholder="พิมพ์ข้อความถึงผู้ป่วย..."
                    value={telepharmacyDrafts?? ""}
                    onChange={setTextToString(setTelepharmacyDrafts,true)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        sendTelepharmacyMessage(activeTelepharmacy._id);
                      }
                    }}
                    className="h-11 flex-1 rounded-xl bg-white"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      id={`telepharmacy-image-${activeTelepharmacy._id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        addTelepharmacyAttachments(
                          event.target.files,
                        )
                      }
                    />
                    <label
                      htmlFor={`telepharmacy-image-${activeTelepharmacy._id}`}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Add photo
                    </label>
                    <input
                      id={`telepharmacy-file-${activeTelepharmacy._id}`}
                      type="file"
                      className="hidden"
                      onChange={(event) =>
                        addTelepharmacyAttachments(
                          event.target.files,
                        )
                      }
                    />
                    <label
                      htmlFor={`telepharmacy-file-${activeTelepharmacy._id}`}
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-300"
                    >
                      <Paperclip className="h-4 w-4" />
                      เพิ่มไฟล์
                    </label>
                    <Button
                      className="rounded-xl bg-slate-900 px-5 hover:bg-slate-800"
                      onClick={() =>
                        sendTelepharmacyMessage(activeTelepharmacy._id)
                      }
                    >
                      ส่ง
                    </Button>
                  </div>
                </div>

                {activeTelepharmacyAttachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeTelepharmacyAttachments.map((file, index) => {
                      const Icon = getAttachmentIcon(file);
                      return (
                        <button
                          key={`${file.name}-${index}`}
                          type="button"
                          onClick={() =>
                            removeTelepharmacyAttachment(
                              index,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{file.name}</span>
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            {formatAttachmentSize(file.size)}
                          </span>
                          <X className="h-3.5 w-3.5 text-slate-400" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <InfoPanel
            activeTelepharmacy={activeTelepharmacy}
            suggestions={suggestions}
            acceptAutoFill={acceptAutoFill}
            dismissSuggestion={dismissSuggestion}
            // updateHandoff={updateHandoff}
            telepharmacyEvents={telepharmacyEvents}
            onClose={onClose}
            isTranscribing={isTranscribing}
            transcript={transcript}
            transcriptionMethod={transcriptionMethod}
            isListening={isListening}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* AI Chat Popup - Always available for active consultations */}
      {showAIChat && activeTelepharmacy && (
        <div
          className="fixed w-[360px] min-w-[320px] min-h-[400px] resize rounded-2xl border border-violet-300 bg-white shadow-2xl overflow-hidden z-50 flex flex-col"
          style={{
            left: `${aiChatPosition.x}px`,
            top: `${aiChatPosition.y}px`,
            resize: "both",
          }}
        >
          {/* Purple Gradient Header */}
          <div
            className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white cursor-move select-none"
            onMouseDown={(e) => {
              setIsDraggingAI(true);
              dragOffsetRef.current = {
                x: e.clientX - aiChatPosition.x,
                y: e.clientY - aiChatPosition.y,
              };
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">AI เภสัชกร</p>
                <p className="text-[10px] text-white/80">
                  ช่วยวิเคราะห์การสนทนา
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setAiChatPosition({
                    x: Math.max(20, aiChatPosition.x - 50),
                    y: Math.max(20, aiChatPosition.y),
                  })
                }
                className="p-1.5 rounded-full hover:bg-white/20 text-white"
                title="Reset position"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowAIChat(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* AI Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Test Input for AI Analysis */}
            <div className="p-3 border-b border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-500 mb-2">
                ทดสอบ (สำหรับการพัฒนา)
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="พิมพ์ข้อความให้ AI วิเคราะห์..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-violet-300 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      simulateTranscript(e.currentTarget.value.trim());
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget
                      .previousElementSibling as HTMLInputElement;
                    if (input?.value.trim()) {
                      simulateTranscript(input.value.trim());
                      input.value = "";
                    }
                  }}
                  className="px-3 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700"
                >
                  ทดสอบ
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => simulateTranscript("ปวดหัว มีไข้")}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 hover:border-violet-300"
                >
                  ปวดหัว มีไข้
                </button>
                <button
                  onClick={() => simulateTranscript("แพ้เพนิซิลิน")}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 hover:border-violet-300"
                >
                  แพ้เพนิซิลิน
                </button>
                <button
                  onClick={() => simulateTranscript("เป็นเบาหวาน")}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 hover:border-violet-300"
                >
                  เป็นเบาหวาน
                </button>
              </div>
            </div>

            {/* AI Status - Simplified, no flickering */}
            <div className="px-3 py-2 bg-white border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <span className="text-xs font-medium text-slate-700">
                    {suggestions.length > 0
                      ? `มี ${suggestions.length} คำแนะนำ`
                      : "รอการวิเคราะห์"}
                  </span>
                </div>
                {/* Stable transcription indicator */}
                {(isTranscribing || isListening) && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                    <Mic className="h-3 w-3" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>กำลังฟัง</span>
                  </div>
                )}
                {isProcessing && (
                  <div className="flex items-center gap-1.5 text-xs text-violet-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                    <span>กำลังวิเคราะห์...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Suggestions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
              {suggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-10 w-10 text-violet-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">ยังไม่มีคำแนะนำ</p>
                  <p className="text-xs text-slate-400 mt-1">
                    AI จะแนะนำอัตโนมัติเมื่อมีการสนทนา
                  </p>
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-700">
                          {suggestion.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {suggestion.content}
                        </p>
                        {suggestion.autoFillData && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() =>
                                acceptAutoFill(suggestion, async (data) => {
                                  await updateHandoff(
                                    activeTelepharmacy._id,
                                    { [data.field]: data.value },
                                    index,
                                  );
                                })
                              }
                              className="px-2 py-1 bg-violet-50 text-violet-700 rounded text-xs hover:bg-violet-100"
                            >
                              ยอมรับ
                            </button>
                            <button
                              onClick={() => dismissSuggestion(suggestion.id)}
                              className="px-2 py-1 text-slate-400 hover:text-slate-600 text-xs"
                            >
                              ปฏิเสธ
                            </button>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => dismissSuggestion(suggestion.id)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-slate-100 bg-slate-50">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-3 w-3 text-violet-400" />
                <span className="text-[10px] text-slate-400">
                  AI โดย MediBridge
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
