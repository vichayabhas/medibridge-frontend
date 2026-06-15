'use client'
import React from "react";
import {
  DailyProvider,
  useDaily,
  useDailyEvent,
  useParticipantIds,
  useLocalSessionId,
} from "@daily-co/daily-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { Mic, MicOff, PhoneOff, Bot } from "lucide-react";
// import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { fetchTelemedicineMeetingToken } from "@/lib/daily";
// import { useAISuggestions } from "@/hooks/useAISuggestions";
import  AISuggestionPanel  from "./AISuggestionPanel";
import { useAISuggestions } from "./support/useAISuggestions";
import { fetchTelemedicineMeetingToken } from "@/libs/oldApi/daily";
import { cn } from "../utility/setup";

interface PharmacistVoiceViewProps {
  roomUrl: string;
  onLeaveCall?: () => void;
  participantName?: string;
  patientName?: string;
  handoffId?: string;
  isEmbedded?: boolean;
}

function PharmacistVoiceViewInner({
  onLeaveCall,
  participantName = "Pharmacist",
  patientName = "Patient",
  roomUrl,
  handoffId,
  isEmbedded = false,
}: PharmacistVoiceViewProps) {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const retryTimeoutRef = useRef<number | null>(null);
  const isDestroyedRef = useRef(false);

  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000;
  
  // AI Suggestions with real-time transcription
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
    handoffId: handoffId || "",
    isActive: isJoined && showAIPanel,
    aiProvider: "gemini",
    enableTranscription: true,
    geminiApiKey,
  });

  const patientConnected = remoteParticipantIds.length > 0;

  // Join room function
  const joinRoom = useCallback(async () => {
    if (!daily || !handoffId || isDestroyedRef.current) return;
    
    // Check if already joined
    try {
      const meetingState = daily.meetingState();
      if (meetingState === "joined-meeting") {
        setIsJoined(true);
        return;
      }
    } catch (e) {
      console.warn("Daily instance check failed:", e);
      return;
    }
    
    try {
      const { token } = await fetchTelemedicineMeetingToken({
        handoffId,
        participantName,
        role: "pharmacist",
        audioOnly: true,
      });

      await daily.join({
        url: roomUrl,
        token,
        startVideoOff: true,
      });
      try {
        await daily.setLocalAudio(true);
      } catch (e) {
        console.warn("Could not enable local audio after join", e);
      }
      if (!isDestroyedRef.current) {
        setIsJoined(true);
        setError(null);
        setRetryCount(0);
        setIsReconnecting(false);
      }
    } catch (joinError) {
      if (!isDestroyedRef.current) {
        setError(joinError instanceof Error ? joinError.message : "Failed to join call");
        // Auto retry
        if (retryCount < MAX_RETRIES && !isReconnecting) {
          setIsReconnecting(true);
          retryTimeoutRef.current = window.setTimeout(() => {
            if (!isDestroyedRef.current) {
              setRetryCount(prev => prev + 1);
              joinRoom();
            }
          }, RETRY_DELAY);
        }
      }
    }
  }, [daily, handoffId, participantName, roomUrl, retryCount, isReconnecting]);

  // Initial join
  useEffect(() => {
    if (!daily || !handoffId) {
      if (!handoffId) setError("Missing handoff ID for secure meeting access");
      return;
    }
    joinRoom();
  }, [joinRoom, daily, handoffId]);

  // Start/stop AI listening based on call state
  useEffect(() => {
    if (isJoined && showAIPanel) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [isJoined, showAIPanel, startListening, stopListening]);

  // Monitor connection and auto-retry
  useEffect(() => {
    if (!daily || !isJoined || isDestroyedRef.current) return;
    
    const checkConnection = () => {
      if (!daily || isDestroyedRef.current) return;
      
      let isConnected = false;
      try {
        isConnected = daily.meetingState() === "joined-meeting";
      } catch  {
        console.warn("Cannot check meeting state - instance destroyed");
        return;
      }
      
      if (!isConnected && !isReconnecting) {
        setIsReconnecting(true);
        setError("การเชื่อมต่อขาดหาย กำลังพยายามเชื่อมต่อใหม่...");
        
        if (retryCount < MAX_RETRIES) {
          retryTimeoutRef.current = window.setTimeout(() => {
            if (!isDestroyedRef.current) {
              setRetryCount(prev => prev + 1);
              joinRoom();
            }
          }, RETRY_DELAY);
        } else {
          setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่ภายหลัง");
        }
      } else if (isConnected && isReconnecting) {
        setIsReconnecting(false);
        setError(null);
        setRetryCount(0);
      }
    };

    const interval = setInterval(checkConnection, 5000);
    return () => {
      clearInterval(interval);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [daily, isJoined, isReconnecting, retryCount, joinRoom]);

  useEffect(() => {
    if (!isJoined) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isJoined]);

  useDailyEvent("joined-meeting", () => setIsJoined(true));
  useDailyEvent("left-meeting", () => setIsJoined(false));
  useDailyEvent("error", (event) => setError(event?.errorMsg || "Daily call error"));

  const handleToggleMic = async () => {
    if (!daily || !localSessionId) return;
    try {
      await daily.setLocalAudio(!isMuted);
      setIsMuted((m) => !m);
    } catch (err) {
      console.error("Error toggling microphone:", err);
    }
  };

  const handleLeaveCall = async () => {
    isDestroyedRef.current = true;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (!daily) return;
    try {
      await daily.leave();
    } catch (err) {
      console.error("Error leaving call:", err);
    }
    onLeaveCall?.();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isJoined || !localSessionId || isReconnecting) {
    return (
      <div className={cn("flex items-center justify-center bg-slate-50", isEmbedded ? "h-full" : "min-h-screen")}>
        <Card className={cn("p-8 text-center shadow-lg", isEmbedded ? "w-full h-full flex flex-col justify-center" : "max-w-sm w-full")}>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg mx-auto mb-4">
            <Mic className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            {isReconnecting ? "กำลังเชื่อมต่อใหม่..." : "กำลังเชื่อมต่อ..."}
          </h2>
          <p className="text-slate-500 text-sm">
            {isReconnecting 
              ? `พยายามเชื่อมต่อใหม่ (ครั้งที่ ${retryCount}/${MAX_RETRIES})`
              : "กำลังเตรียมสายโทรศัพท์"
            }
          </p>
          {error && (
            <>
              <p className="text-red-500 text-sm mt-3">{error}</p>
              {isReconnecting ? (
                <button
                  onClick={handleLeaveCall}
                  className="mt-3 px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm hover:bg-slate-300"
                >
                  ยกเลิก
                </button>
              ) : (
                <button
                  onClick={() => {
                    setRetryCount(0);
                    setError(null);
                    joinRoom();
                  }}
                  className="mt-3 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90"
                >
                  ลองใหม่
                </button>
              )}
            </>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center bg-slate-50", isEmbedded ? "h-full" : "min-h-screen")}>
      <Card className={cn("shadow-xl flex flex-col items-center gap-6", isEmbedded ? "w-full h-full p-6 justify-center" : "w-full max-w-sm p-8")}>
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg text-4xl font-bold">
            {patientName.charAt(0).toUpperCase()}
          </div>
          {patientConnected && (
            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>

        {/* Status */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {patientConnected ? "เชื่อมต่อแล้ว" : "รอผู้ป่วย..."}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{patientName}</p>
          <p className="mt-1 text-sm text-slate-500">
            {patientConnected
              ? `สายโทรศัพท์ • ${formatTime(elapsedSeconds)}`
              : "Waiting for patient to join..."}
          </p>
        </div>

        {/* Audio indicator bars */}
        {patientConnected && (
          <div className="flex items-end gap-1 h-8">
            {[4, 7, 5, 9, 6, 8, 4, 6, 7, 5].map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-emerald-500 animate-pulse"
                style={{ height: `${h * 3}px`, animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleToggleMic}
            size="lg"
            className={`rounded-full p-4 transition-all ${
              isMuted
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-800"
            }`}
            title={isMuted ? "เปิดไมค์" : "ปิดไมค์"}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            onClick={handleLeaveCall}
            size="lg"
            className="rounded-full p-4 bg-red-600 hover:bg-red-700 text-white transition-all"
            title="วางสาย"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
          
          {/* AI Toggle */}
          <Button
            onClick={() => setShowAIPanel(!showAIPanel)}
            size="lg"
            className={`rounded-full p-4 transition-all ${
              showAIPanel
                ? "bg-violet-600 hover:bg-violet-700 text-white"
                : "bg-slate-200 hover:bg-slate-300 text-slate-800"
            }`}
            title={showAIPanel ? "ซ่อน AI" : "แสดง AI"}
          >
            <Bot className="h-5 w-5" />
            {suggestions.length > 0 && (
              <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-white text-violet-600 text-xs">
                {suggestions.length}
              </Badge>
            )}
          </Button>
        </div>

        <p className="text-xs text-slate-400">{participantName} (คุณ) • เสียงเท่านั้น</p>

        {error && (
          <p className="text-red-500 text-xs text-center">{error}</p>
        )}
      </Card>
      
      {/* AI Suggestion Panel */}
      {showAIPanel && !isEmbedded && (
        <AISuggestionPanel
          suggestions={suggestions}
          isListening={isListening}
          isProcessing={isProcessing}
          isTranscribing={isTranscribing}
          transcript={transcript}
          transcriptionMethod={transcriptionMethod}
          patientName={patientName}
          onDismiss={dismissSuggestion}
          onAcceptAutoFill={acceptAutoFill}
          onSimulateTranscript={simulateTranscript}
          className="hidden lg:flex"
        />
      )}
    </div>
  );
}

export default function PharmacistVoiceView({
  roomUrl,
  onLeaveCall,
  participantName = "Pharmacist",
  patientName = "Patient",
  isEmbedded = false,
}: PharmacistVoiceViewProps) {
  return (
    <DailyProvider userName={participantName} dailyConfig={{}}>
      <PharmacistVoiceViewInner
        roomUrl={roomUrl}
        onLeaveCall={onLeaveCall}
        participantName={participantName}
        patientName={patientName}
        isEmbedded={isEmbedded}
      />
    </DailyProvider>
  );
}
