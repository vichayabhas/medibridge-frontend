'use client'
import { useVideoTrack, useAudioTrack } from "@daily-co/daily-react";
import React from "react";

interface ParticipantViewProps {
  participantId: string;
  isLocal?: boolean;
  className?: string;
}

export default function ParticipantView({
  participantId,
  isLocal = false,
  className = "",
}: ParticipantViewProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const videoTrack = useVideoTrack(participantId);
  const audioTrack = useAudioTrack(participantId);

  // Attach video track to video element
  React.useEffect(() => {
    if (!videoRef.current || !videoTrack.track) return;

    const videoStream = new MediaStream([videoTrack.track]);
    videoRef.current.srcObject = videoStream;
  }, [videoTrack.track]);

  // Attach audio track to audio element (only for remote participants)
  React.useEffect(() => {
    if (!audioRef.current || !audioTrack.track || isLocal) return;

    const audioStream = new MediaStream([audioTrack.track]);
    audioRef.current.srcObject = audioStream;
    
    // Explicitly play audio to overcome browser autoplay restrictions
    const playAudio = async () => {
      try {
        await audioRef.current?.play();
      } catch (err) {
        console.warn("Could not auto-play remote audio:", err);
      }
    };
    playAudio();
  }, [audioTrack.track, isLocal]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted={isLocal}
        playsInline
        className={`w-full h-full object-cover bg-slate-900 ${className}`}
      />
      {!isLocal && <audio ref={audioRef} autoPlay />}
    </>
  );
}
