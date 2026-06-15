/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// import { TELEPHARMACY_CALL_STATE_KEY, TELEPHARMACY_SESSION_KEY, type TelepharmacyMessage, type TelepharmacyEvent } from "./types";
import { telemedicineChannels } from "./constants";
import {
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Paperclip,
} from "lucide-react";
import { addItemInUseStateArray, supabase } from "../../utility/setup";
import {
  ChatMessage,
  HandoffWithMessages,
  PatientHandoffType,
  TelemedicineChannel,
} from "../../../../interface";
// import { useTelepharmacyChat } from "./useTelepharmacyChat";
import { useTelemedicineRoom } from "./useTelemedicineRoom";
import createTextMessage from "@/libs/message/createTextMessage";
import { TelepharmacyEvent, TelepharmacyMessage } from "./types";

interface UseTelepharmacyStateInput {
  // patientRequests: HandoffWithMessages[];
  pharmacistName: string;
  handoffWithMessages: HandoffWithMessages;
  telemedicineChannel: TelemedicineChannel;
}

export function useTelepharmacyState({
  pharmacistName,
  handoffWithMessages,
  telemedicineChannel,
}: UseTelepharmacyStateInput) {
  const activeTelepharmacy = handoffWithMessages.handoff;

  const [telepharmacyCallState, setTelepharmacyCallState] = useState<
    Partial<
      Record<TelemedicineChannel, "idle" | "calling" | "connected" | "error">
    >
  >({});
  const [telepharmacyMessages, setTelepharmacyMessages] = useState<
    ChatMessage[]
  >([]);
  const [telepharmacyDrafts, setTelepharmacyDrafts] = useState<string>();
  const [telepharmacyEvents, setTelepharmacyEvents] = useState<
    TelepharmacyEvent[]
  >([]);
  const [telemedicineRooms, setTelemedicineRooms] = useState<{
    roomId: string;
    roomUrl: string;
    expiresAt?: string;
  }>();
  const [telepharmacyCallConnectedAt, setTelepharmacyCallConnectedAt] =
    useState<Partial<Record<TelemedicineChannel, number>>>({});
  const [tickerNow, setTickerNow] = useState(() => Date.now());
  // const [telepharmacyAiText, setTelepharmacyAiText] = useState<Record<string, string>>({});
  // const [telepharmacyAiStreaming, setTelepharmacyAiStreaming] = useState<Record<string, boolean>>({});
  // const aiStreamTimerRef = useRef<number | null>(null);
  // const aiStreamDebounceRef = useRef<number | null>(null);
  // const aiStreamKeyRef = useRef<Record<string, string>>({});
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const [telepharmacyAttachments, setTelepharmacyAttachments] = useState<
    File[]
  >([]);
  const {
    createRoom,
    completeSession,
    reset: resetTelemedicineRoom,
  } = useTelemedicineRoom();

  // const activeTelepharmacy = telepharmacyTargetId
  //   ? patientRequests.find((handoff) => handoff._id === telepharmacyTargetId)
  //   : null;
  const activeTelemedicineRoom = activeTelepharmacy ? telemedicineRooms : null;
  const activeTelepharmacyAttachments = activeTelepharmacy
    ? (telepharmacyAttachments ?? [])
    : [];
  const videoCallState = activeTelepharmacy
    ? getTelepharmacyCallState("video")
    : "idle";
  const phoneCallState = activeTelepharmacy
    ? getTelepharmacyCallState("phone")
    : "idle";
  // const aiRecommendationText = activeTelepharmacy
  //   ? telepharmacyAiText[activeTelepharmacy._id] ?? ""
  //   : "";
  // const aiRecommendationStreaming = activeTelepharmacy
  //   ? telepharmacyAiStreaming[activeTelepharmacy._id] ?? false
  //   : false;

  const connectedVideoAt = activeTelepharmacy
    ? telepharmacyCallConnectedAt?.video
    : undefined;
  const connectedPhoneAt = activeTelepharmacy
    ? telepharmacyCallConnectedAt?.phone
    : undefined;

  const formatElapsedTime = (startedAt?: number) => {
    if (!startedAt) return "00:00";
    const elapsedSeconds = Math.max(
      0,
      Math.floor((tickerNow - startedAt) / 1000),
    );
    const minutes = Math.floor(elapsedSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const formatAttachmentSize = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
  };

  const getAttachmentIcon = (file: File) => {
    if (file.type.startsWith("image/")) return FileImage;
    if (file.type.startsWith("video/")) return FileVideo;
    if (file.type.startsWith("audio/")) return FileAudio;
    if (file.type.includes("pdf") || file.type.startsWith("text/"))
      return FileText;
    return Paperclip;
  };
  // createTextMessage({senderType:'pharmacist',handoffId:'',senderName:pharmacistName,content:''})

  // const { messages: realtimeMessages, sendMessage: sendRealtimeMessage } = useTelepharmacyChat({
  //   handoffId: activeTelepharmacy?._id ?? "",
  //   senderType: "pharmacist",
  //   senderName: pharmacistName,
  //   enabled: !!activeTelepharmacy,
  // });

  // const decodeRealtimeMessage = (m: { id: string; senderType: string; content: string; createdAt: string }): TelepharmacyMessage => {
  //   try {
  //     const parsed = JSON.parse(m.content) as { type: string; data?: string; name?: string; text?: string };
  //     if (parsed.type === "image") {
  //       return { id: m.id, sender: m.senderType as "pharmacist" | "patient" | "system", text: parsed.name ?? "", timestamp: m.createdAt, imageUrl: parsed.data };
  //     }
  //     if (parsed.type === "file") {
  //       return { id: m.id, sender: m.senderType as "pharmacist" | "patient" | "system", text: parsed.name ?? "ไฟล์แนบ", timestamp: m.createdAt, attachments: [parsed.data ?? ""] };
  //     }
  //   } catch {
  //     // not JSON, plain text
  //   }
  //   return { id: m.id, sender: m.senderType as "pharmacist" | "patient" | "system", text: m.content, timestamp: m.createdAt };
  // };

  // useEffect(() => {
  //   if (!activeTelepharmacy || realtimeMessages.length === 0) return;
  //   setTelepharmacyMessages((current) => ({
  //     ...current,
  //     [activeTelepharmacy._id]: realtimeMessages.map(decodeRealtimeMessage),
  //   }));
  // }, [realtimeMessages, activeTelepharmacy?._id]);

  // const buildAiRecommendationText = (handoff: any) => {
  //   const action = handoff.pharmacistAction ?? "";
  //   const note = handoff.pharmacistNote ?? "";
  //   const base = handoff.suggestedAction || "No recommendation available.";
  //   const context = [action && `Plan noted: ${action}`, note && `Notes: ${note}`]
  //     .filter(Boolean)
  //     .join(" ");
  //   return `${base}${context ? ` ${context}` : ""}`.trim();
  // };

  // useEffect(() => {
  //   if (!activeTelepharmacy) return;
  //   autoSaveTelepharmacySession(activeTelepharmacy._id, telepharmacyChannel);
  // }, [
  //   activeTelepharmacy,
  //   telepharmacyChannel,
  //   telepharmacyMessages,
  //   telepharmacyEvents,
  //   telepharmacyAttachments,
  //   patientRequests,
  // ]);

  // useEffect(() => {
  //   if (!activeTelepharmacy) return;
  //   const messageCount = telepharmacyMessages[activeTelepharmacy.id]?.length ?? 0;
  //   const fullText = buildAiRecommendationText(activeTelepharmacy);
  //   const streamKey = `${activeTelepharmacy.id}-${messageCount}-${fullText.length}`;

  //   if (aiStreamKeyRef.current[activeTelepharmacy.id] === streamKey) return;
  //   aiStreamKeyRef.current[activeTelepharmacy.id] = streamKey;

  //   if (aiStreamDebounceRef.current) {
  //     window.clearTimeout(aiStreamDebounceRef.current);
  //   }
  //   aiStreamDebounceRef.current = window.setTimeout(() => {
  //     streamTelepharmacyRecommendation(activeTelepharmacy.id, fullText);
  //   }, 400);
  // }, [activeTelepharmacy, telepharmacyMessages, patientRequests]);

  // useEffect(() => {
  //   if (!activeTelepharmacy) return;
  //   const isConnected = videoCallState === "connected" || phoneCallState === "connected";
  //   if (!isConnected) return;

  //   const intervalId = window.setInterval(() => {
  //     streamTelepharmacyRecommendation(
  //       activeTelepharmacy._id,
  //       buildAiRecommendationText(activeTelepharmacy)
  //     );
  //   }, 45000);

  //   return () => window.clearInterval(intervalId);
  // }, [activeTelepharmacy, videoCallState, phoneCallState]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTickerNow(Date.now());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  // useEffect(() => {
  //   try {
  //     localStorage.setItem(
  //       TELEPHARMACY_CALL_STATE_KEY,
  //       JSON.stringify({
  //         callState: telepharmacyCallState,
  //         connectedAt: telepharmacyCallConnectedAt,
  //       })
  //     );
  //   } catch (error) {
  //     console.error("Failed to persist telepharmacy call state", error);
  //   }
  // }, [telepharmacyCallConnectedAt, telepharmacyCallState]);

  // useEffect(() => {
  //   try {
  //     const stored = localStorage.getItem(TELEPHARMACY_CALL_STATE_KEY);
  //     if (!stored) return;
  //     const parsed = JSON.parse(stored) as {
  //       callState?: Record<string, Partial<Record<TelemedicineChannel, "idle" | "calling" | "connected" | "error">>>;
  //       connectedAt?: Record<string, Partial<Record<TelemedicineChannel, number>>>;
  //     };
  //     if (parsed.callState) setTelepharmacyCallState(parsed.callState);
  //     if (parsed.connectedAt) setTelepharmacyCallConnectedAt(parsed.connectedAt);
  //   } catch {
  //     // ignore
  //   }
  // }, []);

  // useEffect(() => {
  //   if (!activeTelepharmacy || telepharmacyChannel !== "chat") return;
  //   const messagePane = chatScrollRef.current;
  //   if (!messagePane) return;
  //   messagePane.scrollTop = messagePane.scrollHeight;
  // }, [activeTelepharmacy, telepharmacyChannel, telepharmacyMessages]);

  const addTelepharmacyAttachments = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setTelepharmacyAttachments((current) => {
      const existing = current ?? [];
      return [...existing, ...Array.from(files)];
    });
  };

  const removeTelepharmacyAttachment = (indexToRemove: number) => {
    setTelepharmacyAttachments((current) => {
      const existing = current ?? [];
      return existing.filter((_, index) => index !== indexToRemove);
    });
  };

  // const streamTelepharmacyRecommendation = (handoffId: string, text: string) => {
  //   if (aiStreamTimerRef.current) {
  //     window.clearInterval(aiStreamTimerRef.current);
  //   }
  //   setTelepharmacyAiStreaming((current) => ({ ...current, [handoffId]: true }));
  //   setTelepharmacyAiText((current) => ({ ...current, [handoffId]: "" }));
  //   const words = text.split(" ");
  //   let index = 0;
  //   aiStreamTimerRef.current = window.setInterval(() => {
  //     index += 1;
  //     setTelepharmacyAiText((current) => ({
  //       ...current,
  //       [handoffId]: words.slice(0, index).join(" "),
  //     }));
  //     if (index >= words.length) {
  //       if (aiStreamTimerRef.current) window.clearInterval(aiStreamTimerRef.current);
  //       aiStreamTimerRef.current = null;
  //       setTelepharmacyAiStreaming((current) => ({ ...current, [handoffId]: false }));
  //     }
  //   }, 80);
  // };

  const appendTelepharmacyEvent = (
    channel: TelemedicineChannel,
    status: TelepharmacyEvent["status"],
    note?: string,
  ) => {
    const timestamp = new Date().toISOString();
    setTelepharmacyEvents((current) => {
      const existing = current ?? [];
      return [
        ...existing,
        {
          id: `evt-${timestamp}-${existing.length}`,
          channel,
          status,
          timestamp,
          note,
        },
      ];
    });
  };

  const availableTelepharmacyChannels = useMemo(() => {
    if (!activeTelepharmacy?.telemedicineChannel) {
      return telemedicineChannels;
    }
    return telemedicineChannels.filter(
      (channel) => channel.key === activeTelepharmacy.telemedicineChannel,
    );
  }, [activeTelepharmacy.telemedicineChannel]);

  // useEffect(() => {
  //   if (
  //     activeTelepharmacy?.communicationMethod &&
  //     telepharmacyChannel !== activeTelepharmacy.communicationMethod
  //   ) {
  //     setTelepharmacyChannel(activeTelepharmacy.communicationMethod as TelemedicineChannel);
  //   }
  // }, [activeTelepharmacy?.communicationMethod, activeTelepharmacy?.id]);

  const sendTelepharmacyMessage = async (handoffId: string) => {
    const draft = telepharmacyDrafts?.trim() || "";
    const attachments = telepharmacyAttachments ?? [];
    if (!draft && attachments.length === 0) return;

    setTelepharmacyDrafts(undefined);
    setTelepharmacyAttachments((current) => ({ ...current, [handoffId]: [] }));

    // Send text message if present
    if (draft) {
      const newMessages = await createTextMessage({
        content: draft,
        handoffId,
        senderType: "pharmacist",
        senderName: pharmacistName,
      });
      setTelepharmacyMessages(addItemInUseStateArray(newMessages));
    }
  };

  //   // Upload each attachment to Supabase Storage and send public URL
  //   for (const file of attachments) {
  //     if (file.size > 10 * 1024 * 1024) {
  //       toast.error(`ไฟล์ "${file.name}" ใหญ่เกิน 10 MB`);
  //       continue;
  //     }
  //     const ext = file.name.split(".").pop() ?? "bin";
  //     const path = `${handoffId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  //     const { error: uploadError } = await supabase.storage
  //       .from("chat-attachments")
  //       .upload(path, file, { cacheControl: "3600", upsert: false });
  //     if (uploadError) {
  //       toast.error(`ส่งไฟล์ "${file.name}" ไม่สำเร็จ`);
  //       continue;
  //     }
  //     const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(path);
  //     const publicUrl = urlData.publicUrl;
  //     const isImage = file.type.startsWith("image/");
  //     const envelope = JSON.stringify({ type: isImage ? "image" : "file", data: publicUrl, name: file.name });
  //     await sendRealtimeMessage(envelope);
  //   }
  // };

  // const buildTelepharmacySession = (handoffId: string, channel: TelemedicineChannel) => {
  //   const handoff = patientRequests.find((item) => item.id === handoffId);
  //   if (!handoff) return;
  //   const savedAt = new Date().toISOString();
  //   const attachments = (telepharmacyAttachments[handoffId] ?? []).map((file) => ({
  //     name: file.name,
  //     type: file.type,
  //     size: file.size,
  //   }));
  //   return {
  //     id: `session-${handoffId}-${savedAt}`,
  //     handoffId,
  //     patientName: handoff.patientName,
  //     channel,
  //     savedAt,
  //     notes: {
  //       pharmacistNote: handoff.pharmacistNote ?? "",
  //       pharmacistAction: handoff.pharmacistAction ?? "",
  //     },
  //     messages: telepharmacyMessages[handoffId] ?? [],
  //     events: telepharmacyEvents[handoffId] ?? [],
  //     attachments,
  //   };
  // };

  // const autoSaveTelepharmacySession = (handoffId: string, channel: TelemedicineChannel) => {
  //   const payload = buildTelepharmacySession(handoffId, channel);
  //   if (!payload) return;
  //   try {
  //     const existingRaw = localStorage.getItem(TELEPHARMACY_SESSION_KEY);
  //     const existing = existingRaw ? (JSON.parse(existingRaw) as typeof payload[]) : [];
  //     const next = [payload, ...existing].slice(0, 50);
  //     localStorage.setItem(TELEPHARMACY_SESSION_KEY, JSON.stringify(next));
  //   } catch (error) {
  //     console.error("Failed to auto-save telepharmacy session", error);
  //   }
  // };

  function getTelepharmacyCallState(channel: TelemedicineChannel) {
    return telepharmacyCallState[channel] ?? "idle";
  }

  const startTelepharmacyCall = async (
    handoffId: string,
    channel: TelemedicineChannel,
  ) => {
    setTelepharmacyCallState((current) => ({
      ...current,
      [channel]: "calling",
    }));
    appendTelepharmacyEvent(channel, "calling");

    if (channel === "video" || channel === "phone") {
      try {
        const room = await createRoom({
          taskId: handoffId,
          pharmacistName: pharmacistName,
          expiresInHours: 2,
        });

        setTelemedicineRooms({
          roomId: room.roomId,
          roomUrl: room.roomUrl,
          expiresAt: room.expiresAt,
        });

        setTelepharmacyCallState((current) => ({
          ...current,
          [channel]: "connected",
        }));
        setTelepharmacyCallConnectedAt((current) => ({
          ...current,
          [channel]: Date.now(),
        }));
        appendTelepharmacyEvent(channel, "connected");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`Failed to create ${channel} room:`, errorMessage);

        setTelepharmacyCallState((current) => ({
          ...current,
          [channel]: "error",
        }));

        if (
          errorMessage.includes("fetch") ||
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("NetworkError")
        ) {
          toast.error(
            `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (พอร์ต 3001)\nกรุณาเริ่มเซิร์ฟเวอร์ Express: npm run server`,
            { duration: 8000 },
          );
        } else if (errorMessage.includes("Daily")) {
          toast.error(
            `Daily API error: ${errorMessage}. กรุณาตรวจสอบ DAILY_API_KEY`,
          );
        } else {
          toast.error(
            `ไม่สามารถเริ่ม ${channel === "video" ? "วิดีโอ" : "เสียง"}ได้: ${errorMessage}`,
          );
        }
      }
      return;
    }
  };

  const endTelepharmacyCall = async (
    handoffId: string,
    channel: TelemedicineChannel,
  ) => {
    const room = telemedicineRooms;

    if ((channel === "video" || channel === "phone") && room) {
      const connectedAt = telepharmacyCallConnectedAt?.[channel];

      try {
        await completeSession({
          taskId: handoffId,
          roomId: room.roomId,
          duration: connectedAt
            ? Math.max(0, Math.floor((Date.now() - connectedAt) / 1000))
            : undefined,
          notes: `Telemedicine ${channel} session completed from pharmacy dashboard.`,
        });
      } catch (error) {
        console.error("Failed to complete telemedicine session", error);
      }

      resetTelemedicineRoom();
      setTelemedicineRooms(undefined);
    }

    setTelepharmacyCallState((current) => ({
      ...current,
      [channel]: "idle",
    }));
    setTelepharmacyCallConnectedAt((current) => ({
      ...current,
      [channel]: undefined,
    }));
    appendTelepharmacyEvent(channel, "ended");
  };

  return {
    // telepharmacyTargetId,
    // setTelepharmacyTargetId,
    // telepharmacyChannel,
    // setTelepharmacyChannel,
    // videoCallState,
    // phoneCallState,
    // activeTelepharmacy,
    // activeTelemedicineRoom,
    // telepharmacyMessages,
    // telepharmacyDrafts,
    // setTelepharmacyDrafts,
    // telepharmacyEvents,
    // telepharmacyAiText,
    // telepharmacyAiStreaming,
    // telepharmacyAttachments,
    // addTelepharmacyAttachments,
    // removeTelepharmacyAttachment,
    connectedVideoAt,
    connectedPhoneAt,
    // tickerNow,
    // formatAttachmentSize,
    // getAttachmentIcon,
    // sendTelepharmacyMessage,
    // startTelepharmacyCall,
    // endTelepharmacyCall,
    // activeTelepharmacyAttachments,
    // aiRecommendationText,
    // aiRecommendationStreaming,
    // formatElapsedTime,
    // getTelepharmacyCallState,
    // availableTelepharmacyChannels,
    // chatScrollRef,
    // telepharmacyCallConnectedAt,
    // telepharmacyTargetIndex,
    // setTelepharmacyTargetIndex,
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
  };
}
