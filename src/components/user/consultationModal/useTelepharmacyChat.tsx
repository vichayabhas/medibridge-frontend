import {
  addItemInUseStateArray,
  getBackendUrl,
  SocketReady,
} from "@/components/utility/setup";
import React, { useCallback, useState } from "react";
import { io } from "socket.io-client";
import { ChatMessage, SenderType } from "../../../../interface";
import createTextMessage from "@/libs/message/createTextMessage";

// export type ChatSenderType = "patient" | "pharmacist" | "system";
const socket = io(getBackendUrl());

interface UseTelepharmacyChatOptions {
  handoffId: string;
  senderType: SenderType;
  senderName: string;
  // enabled?: boolean;
}

export function useTelepharmacyChat({
  handoffId,
  senderType,
  senderName,
  // enabled = true,
}: UseTelepharmacyChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // const fromRow = (row: Record<string, unknown>): ChatMessage => {
  //   const raw = row.content as string;
  //   let imageUrl: string | undefined;
  //   let attachmentUrl: string | undefined;
  //   let fileName: string | undefined;
  //   let displayContent = raw;
  //   try {
  //     const parsed = JSON.parse(raw) as { type?: string; data?: string; name?: string };
  //     if (parsed.type === "image") {
  //       imageUrl = parsed.data;
  //       fileName = parsed.name;
  //       displayContent = "";
  //     } else if (parsed.type === "file") {
  //       attachmentUrl = parsed.data;
  //       fileName = parsed.name ?? "ไฟล์แนบ";
  //       displayContent = "";
  //     }
  //   } catch { /* plain text */ }
  //   return {
  //     id: row.id as string,
  //     handoffId: row.handoff_id as string,
  //     senderType: row.sender_type as ChatSenderType,
  //     senderName: row.sender_name as string | undefined,
  //     content: displayContent,
  //     createdAt: row.created_at as string,
  //     imageUrl,
  //     attachmentUrl,
  //     fileName,
  //   };
  // };

  // Derive effective enabled: skip if handoffId is empty/falsy
  // const effectiveEnabled = enabled && !!handoffId;
  const newMessageSocket = new SocketReady<ChatMessage>(
    socket,
    "new_message",
    handoffId,
  );
  React.useEffect(() => {
    newMessageSocket.listen((data) => {
      setMessages(addItemInUseStateArray(data));
    });
    return () => {
      newMessageSocket.disconnect();
    };
  });

  // useEffect(() => {
  //   // if (!effectiveEnabled) {
  //   //   if (channelRef.current) {
  //   //     supabase.removeChannel(channelRef.current);
  //   //     channelRef.current = null;
  //   //   }
  //   //   setMessages([]);
  //   //   setIsLoading(false);
  //   //   return;
  //   // }

  //   // let cancelled = false;

  //   // const loadHistory = async () => {
  //   //   setIsLoading(true);
  //   //   const { data, error } = await supabase
  //   //     .from("telemedicine_messages")
  //   //     .select("*")
  //   //     .eq("handoff_id", handoffId)
  //   //     .order("created_at", { ascending: true });

  //   //   if (!cancelled) {
  //   //     if (!error && data) setMessages(data);
  //   //     setIsLoading(false);
  //   //   }
  //   // };

  //   // loadHistory();

  //   // const channel = supabase
  //   //   .channel(`chat:${handoffId}`)
  //   //   // .on(
  //   //   //   "postgres_changes",
  //   //   //   { event: "INSERT", schema: "public", table: "telemedicine_messages", filter: `handoff_id=eq.${handoffId}` },
  //   //   //   (payload) => {
  //   //   //     const msg = fromRow(payload.new as Record<string, unknown>);
  //   //   //     setMessages((prev) => {
  //   //   //       if (prev.some((m) => m.id === msg.id)) return prev;
  //   //   //       return [...prev, msg];
  //   //   //     });
  //   //   //   }
  //   //   // )
  //   //   .on(
  //   //     "broadcast",
  //   //     { event: "new_message" },
  //   //     (payload) => {
  //   //       const raw = payload.payload as ChatMessage;
  //   //       const msg = fromRow({ id: raw.id, handoff_id: raw.handoffId, sender_type: raw.senderType, sender_name: raw.senderName, content: raw.content, created_at: raw.createdAt });
  //   //       setMessages((prev) => {
  //   //         if (prev.some((m) => m.id === msg.id)) return prev;
  //   //         return [...prev, msg];
  //   //       });
  //   //     }
  //   //   )
  //   //   .subscribe();

  //   // channelRef.current = channel;

  //   // return () => {
  //   //   cancelled = true;
  //   //   supabase.removeChannel(channel);
  //   //   channelRef.current = null;
  //   // };
  // }, [handoffId, effectiveEnabled]);

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      const trimmed = content.trim();
      if (!trimmed || !handoffId) return false;

      // Optimistic update — append immediately before DB round-trip
      // const optimisticId = `optimistic-${Date.now()}`;
      // const optimisticMsg: ChatMessage = {
      //   id: optimisticId,
      //   handoffId,
      //   senderType,
      //   senderName,
      //   content: trimmed,
      //   createdAt: new Date().toISOString(),
      // };
      // setMessages((prev) => [...prev, optimisticMsg]);

      // const { data, error } = await supabase
      //   .from("telemedicine_messages")
      //   .insert({
      //     handoff_id: handoffId,
      //     sender_type: senderType,
      //     sender_name: senderName ?? null,
      //     content: trimmed,
      //     message_type: "text",
      //   })
      //   .select()
      //   .single();
      const data = await createTextMessage({
        handoffId,
        senderName,
        senderType,
        content: trimmed,
      });
      newMessageSocket.trigger(data);

      // if (error) {
      //   console.error("Failed to send chat message", error);
      //   // Roll back optimistic message
      //   setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      //   return false;
      // }

      // Replace optimistic message with real one from DB and broadcast to all subscribers
      // if (data) {
      //   const real = fromRow(data as Record<string, unknown>);
      //   setMessages((prev) =>
      //     prev.map((m) => (m.id === optimisticId ? real : m)),
      //   );

      //   // Broadcast so the other side (pharmacist/patient) receives it in real-time
      //   if (channelRef.current) {
      //     channelRef.current.send({
      //       type: "broadcast",
      //       event: "new_message",
      //       payload: real,
      //     });
      //   }
      // }

      return true;
    },
    [handoffId, senderType, senderName],
  );

  return { messages, sendMessage };
}
