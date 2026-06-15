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
import { Card } from "@/components/ui/card";
import { fetchTelemedicineMeetingToken } from "@/libs/oldApi/daily";
import { useAISuggestions } from "./support/useAISuggestions";
import { cn } from "../utility/setup";
import ParticipantView from "../common/ParticipantView";
import  AISuggestionPanel  from "./AISuggestionPanel";
import CallControls from "./CallControls";
// import { cn } from "@/lib/utils";
// import ParticipantView from "./ParticipantView";
// import CallControls from "./CallControls";
// import { AISuggestionPanel } from "./AISuggestionPanel";
// import { useAISuggestions } from "@/hooks/useAISuggestions";
// import { fetchTelemedicineMeetingToken } from "@/lib/daily";

interface PharmacistCallViewProps {
  roomUrl: string;
  onLeaveCall?: () => void;
  participantName?: string;
  handoffId?: string; // For AI suggestions
  showAIPanel?: boolean;
  isEmbedded?: boolean; // For modal embedding
}

/**
 * Inner component that uses Daily hooks
 * Must be wrapped by DailyProvider
 */
function PharmacistCallViewInner({
  onLeaveCall,
  participantName = "Pharmacist",
  roomUrl,
  handoffId,
  showAIPanel = true,
  isEmbedded = false,
}: PharmacistCallViewProps) {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({
    filter: "remote",
  });
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef<number | null>(null);
  const isDestroyedRef = useRef(false);

  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000; // 3 seconds

  // Get the first remote participant (typically the patient)
  const patientId = remoteParticipantIds[0];

  // Join room function (extracted for reuse in retry)
  const joinRoom = useCallback(async () => {
    if (!daily || !handoffId || isDestroyedRef.current) return;
    
    // Check if already joined to avoid rejoining
    try {
      const meetingState = daily.meetingState();
      if (meetingState === "joined-meeting") {
        setIsJoined(true);
        return;
      }
    } catch (e) {
      // Instance may be destroyed, don't proceed
      console.warn("Daily instance check failed:", e);
      return;
    }
    
    try {
      const { token } = await fetchTelemedicineMeetingToken({
        handoffId,
        participantName,
        role: "pharmacist",
        audioOnly: false,
      });

      await daily.join({ 
        url: roomUrl, 
        token,
        subscribeToTracksAutomatically: true,
      });
      try {
        await daily.setLocalAudio(true);
      } catch (e) {
        console.warn("Could not enable local audio after join", e);
      }
      // Ensure we're subscribed to all remote participants' audio
      try {
        const participants = daily.participants();
        Object.values(participants).forEach((participant) => {
          if (participant.local) return;
          daily.updateParticipant(participant.session_id, {
            setSubscribedTracks: { audio: true, video: true },
          });
        });
      } catch (e) {
        console.warn("Could not subscribe to participants:", e);
      }
      if (!isDestroyedRef.current) {
        setIsJoined(true);
        setError(null);
      }
    } catch (joinError) {
      if (!isDestroyedRef.current) {
        setError(joinError instanceof Error ? joinError.message : "Failed to join call");
      }
    }
  }, [daily, handoffId, participantName, roomUrl]);

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
    patientData: undefined, // Will be populated when patient context is available
  });

  // Start/stop AI listening based on call state
  useEffect(() => {
    if (isJoined && showAIPanel) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [isJoined, showAIPanel, startListening, stopListening]);

  // Initial join
  useEffect(() => {
    if (!daily || !handoffId) {
      if (!handoffId) setError("Missing handoff ID for secure meeting access");
      return;
    }
    
    joinRoom();
  }, [joinRoom, daily, handoffId]);

  useDailyEvent("joined-meeting", () => {
    setIsJoined(true);
  });

  useDailyEvent("left-meeting", () => {
    setIsJoined(false);
  });

  useDailyEvent("error", (event) => {
    setError(event?.errorMsg || "Daily call error");
  });

  // Monitor connection by tracking participant count changes
  useEffect(() => {
    const checkConnection = () => {
      if (!daily || !isJoined) return;
      
      // Check if we've lost connection to the meeting server
      const isConnected = daily.meetingState() === "joined-meeting";
      if (!isConnected && isJoined) {
        setIsReconnecting(true);
        setError("การเชื่อมต่อขาดหาย กำลังพยายามเชื่อมต่อใหม่...");
        
        // Auto-retry join
        if (retryCount < MAX_RETRIES && handoffId) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            joinRoom();
          }, RETRY_DELAY);
        } else if (retryCount >= MAX_RETRIES) {
          setError("ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่ภายหลัง");
        }
      } else if (isConnected && isReconnecting) {
        setIsReconnecting(false);
        setError(null);
        setRetryCount(0);
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkConnection, 5000);
    return () => {
      clearInterval(interval);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [daily, isJoined, isReconnecting, retryCount, handoffId, joinRoom]);

  const handleLeaveCall = async () => {
    isDestroyedRef.current = true;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (daily) {
      try {
        await daily.leave();
      } catch (err) {
        console.error("Error leaving call:", err);
      }
    }
    setIsJoined(false);
    onLeaveCall?.();
  };

  if (!isJoined || !localSessionId || isReconnecting) {
    return (
      <div className={cn("flex items-center justify-center bg-slate-950", isEmbedded ? "h-full" : "h-screen")}>
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-4">
            {isReconnecting ? "กำลังเชื่อมต่อใหม่..." : "Connecting..."}
          </h2>
          <p className="text-slate-600 mb-4">
            {isReconnecting 
              ? `พยายามเชื่อมต่อใหม่ (ครั้งที่ ${retryCount}/${MAX_RETRIES})`
              : "Initializing video call session"
            }
          </p>
          {error && (
            <>
              <p className="text-red-500 text-sm mb-4">{error}</p>
              {isReconnecting && (
                <button
                  onClick={() => {
                    setIsReconnecting(false);
                    setError(null);
                    setRetryCount(0);
                    onLeaveCall?.();
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm hover:bg-slate-300"
                >
                  ยกเลิก
                </button>
              )}
            </>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full bg-slate-950", isEmbedded ? "h-full rounded-2xl" : "h-screen")}>
      {/* Main video area - Patient/Remote participant */}
      <div className="h-[calc(100%-80px)] relative bg-slate-900 overflow-hidden rounded-t-2xl">
        {patientId ? (
          <ParticipantView
            participantId={patientId}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-400 text-lg">
                Waiting for patient to join...
              </p>
            </div>
          </div>
        )}

        {/* Picture-in-Picture (Local participant - Pharmacist) */}
        {localSessionId && (
          <div className="absolute bottom-4 right-4 w-32 h-40 rounded-lg overflow-hidden shadow-lg border-2 border-slate-700 bg-slate-900">
            <ParticipantView
              participantId={localSessionId}
              isLocal={true}
              className="w-full h-full"
            />
            <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-1 rounded text-xs font-semibold text-white">
              {participantName} (You)
            </div>
          </div>
        )}

        {/* Call info overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-2 rounded-lg text-white">
          <p className="text-sm font-semibold">Telepharmacy Session</p>
          <p className="text-xs text-slate-300">
            {patientId ? "Patient Connected" : "Waiting for patient..."}
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="absolute top-4 right-4 bg-red-900/80 backdrop-blur px-3 py-2 rounded-lg text-white max-w-sm">
            <p className="text-sm font-semibold">Connection Error</p>
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}
      </div>

      {/* Call controls at bottom - outside overflow container */}
      <div className="h-[80px] flex justify-center items-center bg-slate-950 border-t border-slate-800">
        <CallControls onLeaveCall={handleLeaveCall} />
      </div>

      {/* Participant info panel - hidden when embedded */}
      {!isEmbedded && (
      <div className="hidden sm:block absolute bottom-6 left-6 max-h-32 overflow-y-auto bg-slate-900/80 backdrop-blur px-4 py-3 rounded-lg text-white border border-slate-700 max-w-xs">
        <p className="text-xs font-semibold mb-2 text-slate-300">
          PARTICIPANTS
        </p>
        <div className="space-y-1 text-xs">
          <p className="text-slate-200">You (Pharmacist)</p>
          {patientId && (
            <p className="text-slate-200">
              Patient {remoteParticipantIds.length > 1 && `+ ${remoteParticipantIds.length - 1}`}
            </p>
          )}
        </div>
      </div>
      )}

      {/* AI Suggestion Panel - hidden when embedded */}
      {showAIPanel && !isEmbedded && (
        <AISuggestionPanel
          suggestions={suggestions}
          isListening={isListening}
          isProcessing={isProcessing}
          isTranscribing={isTranscribing}
          transcript={transcript}
          transcriptionMethod={transcriptionMethod}
          onDismiss={dismissSuggestion}
          onAcceptAutoFill={acceptAutoFill}
          onSimulateTranscript={simulateTranscript}
          className="hidden lg:flex"
        />
      )}
    </div>
  );
}

/**
 * PharmacistCallView Component
 * 
 * A professional video calling interface for pharmacists to conduct
 * telepharmacy sessions with patients.
 *
 * Features:
 * - Large main video area for remote participant (Patient)
 * - Picture-in-Picture video for local participant (Pharmacist)
 * - Responsive Tailwind CSS layout
 * - Call control buttons (Mute, Camera Toggle, Leave Call)
 * - Participant information display
 * - Connection status indicators
 *
 * @param roomUrl - Daily.co room URL to join
 * @param onLeaveCall - Callback fired when pharmacist leaves the call
 * @param participantName - Display name for the pharmacist (default: "Pharmacist")
 *
 * @example
 * ```tsx
 * <PharmacistCallView
 *   roomUrl="https://your-daily-domain.daily.co/your-room"
 *   onLeaveCall={() => navigate('/pharmacy-role')}
 *   participantName="Dr. Sarah"
 * />
 * ```
 */
export default function PharmacistCallView({
  roomUrl,
  onLeaveCall,
  participantName = "Pharmacist",
  handoffId,
  showAIPanel = true,
  isEmbedded = false,
}: PharmacistCallViewProps) {
  return (
    <DailyProvider
      userName={participantName}
      dailyConfig={{}}
    >
      <PharmacistCallViewInner
        roomUrl={roomUrl}
        onLeaveCall={onLeaveCall}
        participantName={participantName}
        handoffId={handoffId}
        showAIPanel={showAIPanel}
        isEmbedded={isEmbedded}
      />
    </DailyProvider>
  );
}
