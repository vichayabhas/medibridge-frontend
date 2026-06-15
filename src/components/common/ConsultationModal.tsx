"use client";
import React, { useEffect, useRef, useState } from "react";
import { ConsultationData, TelemedicineChannel } from "../../../interface";
import { cn } from "../utility/setup";
import ChatConsult from "./consultationModal/ChatConsult";
import WaitingScreen from "./consultationModal/WaitingScreen";
import PhoneConsult from "./consultationModal/PhoneConsult";
import VideoConsult from "./consultationModal/VideoConsult";

interface ConsultationModalProps {
  onClose: () => void;
  data: ConsultationData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CHANNEL_LABEL: Record<TelemedicineChannel, string> = {
  chat: "แชทกับเภสัชกร",
  phone: "โทรหาเภสัชกร",
  video: "วิดีโอคอล",
};

// ─── Chat UI ─────────────────────────────────────────────────────────────────

// ─── Real Daily.co call inner (reusable for phone+video) ─────────────────────

// ─── Phone UI ─────────────────────────────────────────────────────────────────

// ─── Video UI ─────────────────────────────────────────────────────────────────

// ─── Modal shell ─────────────────────────────────────────────────────────────

export function ConsultationModal({ onClose, data }: ConsultationModalProps) {
  // const isChat = channel === "chat";
  // const isPhone = channel === "phone";
  // const isVideo = channel === "video";
  const modalRef = useRef<HTMLDivElement>(null);

  const isFuture = data.handoff.appointmentTime
    ? new Date(data.handoff.appointmentTime).getTime() > Date.now()
    : false;
  const [waiting, setWaiting] = useState(isFuture);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Close on click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
    >
      <div
        className={cn(
          "w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col",
          data.isChat && !waiting
            ? "h-[85svh] sm:h-[600px] bg-background"
            : "h-[85svh] sm:h-[560px] bg-slate-950",
        )}
      >
        {/* Waiting gate */}
        {waiting && data.handoff.appointmentTime && (
          <WaitingScreen
            channel={data.handoff.telemedicineChannel}
            pharmacyName={data.pharmacy.name}
            appointmentTime={data.handoff.appointmentTime}
            onClose={onClose}
            onReady={() => setWaiting(false)}
          />
        )}

        {/* Channel header — only for phone/video once past waiting */}
        {!waiting && !data.isChat && (
          <div className="absolute top-4 left-4 z-10">
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full font-semibold",
                data.isPhone
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-violet-500/20 text-violet-300",
              )}
            >
              {CHANNEL_LABEL[data.handoff.telemedicineChannel]}
            </span>
          </div>
        )}

        {!waiting && data.isChat && (
          <ChatConsult
            handoffId={data.handoff._id}
            patientName={data.handoff.patientName}
            onClose={onClose}
            messageInputs={data.messages}
          />
        )}
        {!waiting && data.isPhone && (
          <PhoneConsult
            handoffId={data.handoff._id}
            pharmacyName={data.pharmacy.name}
            onClose={onClose}
            roomUrl={data.roomUrl}
            messagesInputs={data.messages}
          />
        )}
        {!waiting && data.isVideo && (
          <VideoConsult
            handoffId={data.handoff._id}
            pharmacyName={data.pharmacy.name}
            onClose={onClose}
            roomUrl={data.roomUrl}
            messagesInputs={data.messages}
          />
        )}
      </div>
    </div>
  );
}
