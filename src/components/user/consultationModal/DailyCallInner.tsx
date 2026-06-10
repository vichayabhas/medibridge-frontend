import {
  AlertCircle,
  ImagePlus,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import React from "react";
import { Button } from "../../ui/button";
import {
  useDaily,
  useDailyEvent,
  useLocalSessionId,
  useParticipantIds,
} from "@daily-co/daily-react";
import { cn } from "@/components/utility/setup";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ParticipantView from "./ParticipantView";
import { useTelepharmacyChat } from "./useTelepharmacyChat";
import { fetchTelemedicineMeetingToken } from "@/libs/oldApi/daily";
interface DailyCallInnerProps {
  roomUrl: string;
  audioOnly: boolean;
  pharmacyName: string;
  onClose: () => void;
  handoffId: string;
}
function useDuration(active: boolean) {
  const [secs, setSecs] = React.useState(0);
  React.useEffect(() => {
    if (!active) {
      setSecs(0);
      return;
    }
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function DailyCallInner({
  roomUrl,
  audioOnly,
  pharmacyName,
  onClose,
  handoffId,
}: DailyCallInnerProps) {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const remoteIds = useParticipantIds({ filter: "remote" });
  const [isJoined, setIsJoined] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isCameraOff, setIsCameraOff] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showChat, setShowChat] = React.useState(false);
  const [chatDraft, setChatDraft] = React.useState("");
  const [isReconnecting, setIsReconnecting] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const retryTimeoutRef = React.useRef<number | null>(null);
  const isDestroyedRef = React.useRef(false);
  const duration = useDuration(isJoined);

  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000;

  // Chat hook
  const { messages, sendMessage } = useTelepharmacyChat({
    handoffId,
    senderType: "patient",
    senderName: "ผู้ป่วย",
  });

  // Join room with retry logic
  const joinRoom = async () => {
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
        participantName: pharmacyName,
        role: "pharmacist",
        audioOnly,
      });

      await daily.join({ url: roomUrl, token, startVideoOff: audioOnly });
      try {
        daily.setLocalAudio(true);
      } catch (e) {
        console.warn("Could not enable local audio after join", e);
      }
      if (!isDestroyedRef.current) {
        setIsJoined(true);
        setError(null);
        setRetryCount(0);
        setIsReconnecting(false);
      }
    } catch (e) {
      if (!isDestroyedRef.current) {
        const msg = e instanceof Error ? e.message : "Connection error";
        // Filter out destroyed instance errors
        if (!msg.toLowerCase().includes("destroyed")) {
          setError(msg);
        }
        // Auto retry on join error
        if (
          retryCount < MAX_RETRIES &&
          !isReconnecting &&
          !msg.toLowerCase().includes("destroyed")
        ) {
          setIsReconnecting(true);
          retryTimeoutRef.current = window.setTimeout(() => {
            if (!isDestroyedRef.current) {
              setRetryCount((prev) => prev + 1);
              joinRoom();
            }
          }, RETRY_DELAY);
        }
      }
    }
  };

  React.useEffect(() => {
    if (!daily || !handoffId) return;
    joinRoom();
  }, [daily, handoffId, roomUrl]);

  // Monitor connection and auto-retry
  React.useEffect(() => {
    if (!daily || !isJoined || isDestroyedRef.current) return;

    const checkConnection = () => {
      if (!daily || isDestroyedRef.current) return;

      let isConnected = false;
      try {
        isConnected = daily.meetingState() === "joined-meeting";
      } catch {
        console.warn("Cannot check meeting state - instance destroyed");
        return;
      }

      if (!isConnected && !isReconnecting) {
        setIsReconnecting(true);
        setError("การเชื่อมต่อขาดหาย กำลังพยายามเชื่อมต่อใหม่...");

        if (retryCount < MAX_RETRIES) {
          retryTimeoutRef.current = window.setTimeout(() => {
            if (!isDestroyedRef.current) {
              setRetryCount((prev) => prev + 1);
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
  }, [daily, isJoined, isReconnecting, retryCount]);

  useDailyEvent("joined-meeting", () => setIsJoined(true));
  useDailyEvent("left-meeting", () => {
    setIsJoined(false);
    onClose();
  });
  useDailyEvent("error", (ev) => {
    const msg = ev?.errorMsg || "Connection error";
    // Filter out destroyed instance errors
    if (
      msg.toLowerCase().includes("destroyed") ||
      msg.toLowerCase().includes("use of a destroyed")
    ) {
      console.warn("Daily instance destroyed, ignoring error:", msg);
      return;
    }
    if (!isDestroyedRef.current) {
      setError(msg);
    }
  });

  // Sync mic and camera state with Daily
  React.useEffect(() => {
    if (!daily || isDestroyedRef.current) return;
    const checkStates = () => {
      if (isDestroyedRef.current) return;
      try {
        const audioState = daily.localAudio();
        const videoState = daily.localVideo();
        setIsMuted(!audioState);
        setIsCameraOff(!videoState);
      } catch {
        // Instance destroyed, ignore
      }
    };
    checkStates();
    const interval = setInterval(checkStates, 500);
    return () => clearInterval(interval);
  }, [daily]);

  // Cleanup: end call when component unmounts
  React.useEffect(() => {
    return () => {
      if (!isDestroyedRef.current && daily) {
        isDestroyedRef.current = true;
        daily.leave().catch(() => {});
        console.log("DailyCallInner unmounted, call ended");
      }
    };
  }, [daily]);

  const toggleMic = async () => {
    if (!daily || !localSessionId || isDestroyedRef.current) return;
    try {
      // isMuted: true = mic is off, false = mic is on
      // setLocalAudio(true) = enable, setLocalAudio(false) = disable
      const newAudioEnabled = isMuted;
      await daily.setLocalAudio(newAudioEnabled);
      setIsMuted(!newAudioEnabled);
    } catch (err) {
      console.error("Error toggling microphone:", err);
    }
  };

  const toggleCamera = async () => {
    if (!daily || !localSessionId || audioOnly || isDestroyedRef.current)
      return;
    try {
      // isCameraOff: true = camera is off, false = camera is on
      // setLocalVideo(true) = enable, setLocalVideo(false) = disable
      const newVideoEnabled = isCameraOff;
      await daily.setLocalVideo(newVideoEnabled);
      setIsCameraOff(!newVideoEnabled);
    } catch (err) {
      console.error("Error toggling camera:", err);
    }
  };

  const leave = async () => {
    isDestroyedRef.current = true;
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (daily) await daily.leave().catch(() => {});
    onClose();
  };

  const pharmacistConnected = remoteIds.length > 0;

  if (!isJoined || !localSessionId || isReconnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-white gap-4 px-6">
        {error ? (
          <>
            <AlertCircle className="h-12 w-12 text-red-400" />
            <p className="text-center text-sm text-red-300">{error}</p>
            {isReconnecting ? (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm hover:bg-slate-300"
              >
                ยกเลิก
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setRetryCount(0);
                    setError(null);
                    joinRoom();
                  }}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90"
                >
                  ลองใหม่
                </button>
                <button
                  onClick={onClose}
                  className="text-xs text-slate-400 underline"
                >
                  ปิด
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-slate-400">
              {isReconnecting
                ? `กำลังเชื่อมต่อใหม่ (ครั้งที่ ${retryCount}/${MAX_RETRIES})`
                : "กำลังเชื่อมต่อ..."}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full bg-slate-950 text-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={leave}
            className="h-10 w-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60"
          >
            <X className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-medium text-white">{pharmacyName}</p>
            <p className="text-xs text-slate-300">
              {pharmacistConnected ? "เชื่อมต่อแล้ว" : "รอเภสัชกร..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-lg font-mono font-bold">{duration}</p>
          {/* Chat toggle */}
          <button
            onClick={() => setShowChat((s) => !s)}
            className={cn(
              "h-10 w-10 rounded-full backdrop-blur flex items-center justify-center transition",
              showChat
                ? "bg-indigo-600 text-white"
                : "bg-black/40 text-white hover:bg-black/60",
            )}
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Video/Audio Area */}
      <div className="flex-1 relative bg-slate-900 flex items-center justify-center">
        {audioOnly ? (
          /* Audio Only View */
          <div className="flex flex-col items-center">
            <div className="h-32 w-32 rounded-full bg-emerald-500/20 border-4 border-emerald-400/40 flex items-center justify-center mb-6 relative">
              {pharmacistConnected && (
                <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-25" />
              )}
              <div className="h-24 w-24 rounded-full bg-slate-800 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {pharmacyName.charAt(0)}
                </span>
              </div>
              {pharmacistConnected && (
                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
              )}
            </div>

            <p className="text-xl font-bold text-white mb-2">{pharmacyName}</p>
            <p className="text-slate-400">
              {pharmacistConnected ? "สายโทรศัพท์" : "กำลังเชื่อมต่อ..."}
            </p>

            {pharmacistConnected && (
              <div className="flex items-end gap-1 h-8 mt-6">
                {[4, 7, 5, 9, 6, 8, 4, 6, 7, 5].map((h, i) => (
                  <span
                    key={i}
                    className="w-1.5 rounded-full bg-emerald-500 animate-pulse"
                    style={{
                      height: `${h * 3}px`,
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Video View */
          <>
            {/* Remote video (pharmacist) */}
            <div className="w-full h-full">
              {pharmacistConnected && remoteIds[0] ? (
                <ParticipantView
                  participantId={remoteIds[0]}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">รอเภสัชกรเข้าร่วม...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Local video (picture-in-picture) */}
            {localSessionId && (
              <div className="absolute bottom-24 right-4 w-28 h-36 rounded-xl overflow-hidden shadow-lg border-2 border-slate-700 bg-slate-800">
                {isCameraOff ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <VideoOff className="h-8 w-8 text-slate-500" />
                  </div>
                ) : (
                  <ParticipantView
                    participantId={localSessionId}
                    isLocal={true}
                    className="w-full h-full"
                  />
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs text-white">
                  คุณ
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="absolute bottom-24 left-4 right-4 z-20 rounded-2xl border border-slate-700 bg-slate-900/95 backdrop-blur overflow-hidden shadow-2xl">
          <div className="h-[180px] space-y-2 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">
                ยังไม่มีข้อความ
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={cn(
                    "flex",
                    message.senderType === "patient"
                      ? "justify-end"
                      : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-3 py-2 text-xs shadow-sm",
                      message.senderType === "patient"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700 text-white",
                    )}
                  >
                    <p className="font-semibold text-[10px] opacity-80 mb-0.5">
                      {message.senderType === "patient" ? "คุณ" : "เภสัชกร"}
                    </p>
                    {message.imageUrl ? (
                      <img
                        src={message.imageUrl}
                        alt={message.fileName ?? "Attached"}
                        className="max-w-[180px] max-h-[130px] rounded-lg object-cover mt-1"
                      />
                    ) : message.attachmentUrl ? (
                      <a
                        href={message.attachmentUrl}
                        download={message.fileName}
                        className="flex items-center gap-1 underline opacity-90 text-xs mt-1"
                      >
                        📎 {message.fileName ?? "ไฟล์แนบ"}
                      </a>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-2 border-t border-slate-700 flex gap-2 bg-slate-950">
            <Input
              placeholder="พิมพ์ข้อความ..."
              value={chatDraft}
              onChange={(e) => setChatDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && chatDraft.trim()) {
                  e.preventDefault();
                  sendMessage(chatDraft);
                  setChatDraft("");
                }
              }}
              className="h-10 flex-1 rounded-lg bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
            />
            <input
              id="modal-chat-image"
              type="file"
              accept="image/*,application/pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !handoffId) return;
                if (file.size > 10 * 1024 * 1024) {
                  toast.error(`ไฟล์ใหญ่เกิน 10 MB`);
                  return;
                }
                // const ext = file.name.split(".").pop() ?? "bin";
                // const path = `${handoffId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                // const { error: uploadError } = await supabase.storage.from("chat-attachments").upload(path, file, { cacheControl: "3600", upsert: false });
                // if (uploadError) { toast.error(`ส่งไฟล์ไม่สำเร็จ`); return; }
                // const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(path);
                // const isImage = file.type.startsWith("image/");
                // const envelope = JSON.stringify({ type: isImage ? "image" : "file", data: urlData.publicUrl, name: file.name });
                // await sendMessage(envelope);
                e.target.value = "";
              }}
            />
            <label
              htmlFor="modal-chat-image"
              className="inline-flex cursor-pointer items-center justify-center h-10 w-10 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              <ImagePlus className="h-5 w-5" />
            </label>
            <Button
              size="sm"
              className="h-10 px-4"
              onClick={() => {
                if (chatDraft.trim()) {
                  sendMessage(chatDraft);
                  setChatDraft("");
                }
              }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 pb-safe bg-slate-950">
        <div className="flex items-center justify-center gap-4">
          {/* Mic */}
          <button
            onClick={toggleMic}
            className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center transition-colors",
              isMuted
                ? "bg-red-500/20 text-red-400 border-2 border-red-500/50"
                : "bg-white/10 text-white hover:bg-white/20",
            )}
          >
            {isMuted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </button>

          {/* Camera (video only) */}
          {!audioOnly && (
            <button
              onClick={toggleCamera}
              className={cn(
                "h-14 w-14 rounded-full flex items-center justify-center transition-colors",
                isCameraOff
                  ? "bg-red-500/20 text-red-400 border-2 border-red-500/50"
                  : "bg-white/10 text-white hover:bg-white/20",
              )}
            >
              {isCameraOff ? (
                <VideoOff className="h-6 w-6" />
              ) : (
                <Video className="h-6 w-6" />
              )}
            </button>
          )}

          {/* Leave */}
          <button
            onClick={leave}
            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 transition-colors"
          >
            <PhoneOff className="h-7 w-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
