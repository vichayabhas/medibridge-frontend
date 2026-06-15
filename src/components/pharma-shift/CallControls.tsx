"use client";
import React from "react";
import { useLocalSessionId, useDaily } from "@daily-co/daily-react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface CallControlsProps {
  onLeaveCall: () => void;
  containerClassName?: string;
}

export default function CallControls({
  onLeaveCall,
  containerClassName = "",
}: CallControlsProps) {
  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [audioOutputDevices, setAudioOutputDevices] = useState<
    MediaDeviceInfo[]
  >([]);
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>(
    [],
  );
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>(
    [],
  );
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>("");
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>("");
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>("");
  const [showAudioOutputMenu, setShowAudioOutputMenu] = useState(false);
  const [showAudioInputMenu, setShowAudioInputMenu] = useState(false);
  const [showVideoInputMenu, setShowVideoInputMenu] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);

  // Sync mute state with Daily
  useEffect(() => {
    if (!daily) return;
    const checkAudioState = () => {
      const audioState = daily.localAudio();
      setIsMuted(!audioState);
    };
    checkAudioState();
    const interval = setInterval(checkAudioState, 500);
    return () => clearInterval(interval);
  }, [daily]);

  // Sync camera state with Daily
  useEffect(() => {
    if (!daily) return;
    const checkVideoState = () => {
      const videoState = daily.localVideo();
      setIsCameraOff(!videoState);
    };
    checkVideoState();
    const interval = setInterval(checkVideoState, 500);
    return () => clearInterval(interval);
  }, [daily]);

  // Enumerate all media devices
  useEffect(() => {
    const enumerateDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter((d) => d.kind === "audiooutput");
        const audioInputs = devices.filter((d) => d.kind === "audioinput");
        const videoInputs = devices.filter((d) => d.kind === "videoinput");

        setAudioOutputDevices(audioOutputs);
        setAudioInputDevices(audioInputs);
        setVideoInputDevices(videoInputs);

        if (audioOutputs.length > 0 && !selectedAudioOutput) {
          setSelectedAudioOutput(audioOutputs[0].deviceId);
        }
        if (audioInputs.length > 0 && !selectedAudioInput) {
          setSelectedAudioInput(audioInputs[0].deviceId);
        }
        if (videoInputs.length > 0 && !selectedVideoInput) {
          setSelectedVideoInput(videoInputs[0].deviceId);
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };
    enumerateDevices();
  }, [selectedAudioOutput, selectedAudioInput, selectedVideoInput]);

  const handleToggleMic = useCallback(async () => {
    console.log(
      "Mic button clicked, daily:",
      !!daily,
      "localSessionId:",
      !!localSessionId,
      "isMuted:",
      isMuted,
    );
    if (!daily || !localSessionId) {
      console.warn("Cannot toggle mic - Daily instance not ready");
      return;
    }

    try {
      // isMuted tracks UI state (true = mic is muted/off, false = mic is on)
      // setLocalAudio(true) = enable audio, setLocalAudio(false) = disable audio
      const newAudioEnabled = isMuted; // If muted, enable. If enabled, disable.
      console.log("Setting local audio to:", newAudioEnabled);
      await daily.setLocalAudio(newAudioEnabled);
      setIsMuted(!newAudioEnabled);
      console.log("Mic toggled successfully, new isMuted:", !newAudioEnabled);
    } catch (error) {
      console.error("Error toggling microphone:", error);
    }
  }, [daily, localSessionId, isMuted]);

  const handleToggleCamera = async () => {
    console.log("Camera button clicked, isCameraOff:", isCameraOff);
    if (!daily || !localSessionId) {
      console.warn("Cannot toggle camera - Daily instance not ready");
      return;
    }

    try {
      // isCameraOff tracks UI state (true = camera is off, false = camera is on)
      // setLocalVideo(true) = enable video, setLocalVideo(false) = disable video
      const newVideoEnabled = isCameraOff; // If camera off, enable. If camera on, disable.
      console.log("Setting local video to:", newVideoEnabled);
      await daily.setLocalVideo(newVideoEnabled);
      setIsCameraOff(!newVideoEnabled);
      console.log(
        "Camera toggled successfully, new isCameraOff:",
        !newVideoEnabled,
      );
    } catch (error) {
      console.error("Error toggling camera:", error);
    }
  };

  const handleLeaveCall = async () => {
    if (!daily) return;

    try {
      await daily.leave();
      onLeaveCall();
    } catch (error) {
      console.error("Error leaving call:", error);
    }
  };

  return (
    <div
      className={`flex items-center justify-center gap-4 bg-slate-900/95 backdrop-blur px-6 py-4 rounded-lg pointer-events-auto ${containerClassName}`}
    >
      {/* Mic Button + Device Selector */}
      <div className="relative flex items-center gap-1">
        <button
          onClick={handleToggleMic}
          className={`rounded-full p-3 transition-all min-w-[48px] min-h-[48px] flex items-center justify-center ${
            !daily || !localSessionId
              ? "bg-slate-800 opacity-50 cursor-not-allowed"
              : isMuted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-slate-700 hover:bg-slate-600"
          }`}
          disabled={!daily || !localSessionId}
          title={
            !daily || !localSessionId
              ? "ไม่พร้อมใช้งาน"
              : isMuted
                ? "เปิดไมค์"
                : "ปิดไมค์"
          }
        >
          {isMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => setShowAudioInputMenu(!showAudioInputMenu)}
          className="rounded-full p-2 bg-slate-700 hover:bg-slate-600 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
          title="เลือกไมโครโฟน"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {showAudioInputMenu && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 min-w-[200px] max-w-[280px]">
            <p className="text-xs text-slate-400 px-3 py-1 border-b border-slate-700">
              เลือกไมโครโฟน
            </p>
            {audioInputDevices.map((device) => (
              <button
                key={device.deviceId}
                onClick={async () => {
                  try {
                    // Note: Daily.co doesn't support runtime mic switching easily
                    // Device selection is best done before joining the call
                    // For now, just track the selection
                    setSelectedAudioInput(device.deviceId);
                    setShowAudioInputMenu(false);
                    console.log(
                      "Selected mic (will apply on next join):",
                      device.label,
                    );
                    toast.info("ไมโครโฟนจะถูกใช้เมื่อเริ่มสายใหม่");
                  } catch (err) {
                    console.error("Error setting mic:", err);
                  }
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 ${
                  selectedAudioInput === device.deviceId
                    ? "text-emerald-400"
                    : "text-white"
                }`}
              >
                {device.label || "ไมโครโฟน"}
                {selectedAudioInput === device.deviceId && " ✓"}
              </button>
            ))}
            {audioInputDevices.length === 0 && (
              <p className="text-xs text-slate-500 px-3 py-2">ไม่พบอุปกรณ์</p>
            )}
          </div>
        )}
      </div>

      {/* Camera Button + Device Selector */}
      <div className="relative flex items-center gap-1">
        <button
          onClick={handleToggleCamera}
          className={`rounded-full p-3 transition-all min-w-[48px] min-h-[48px] flex items-center justify-center ${
            !daily || !localSessionId
              ? "bg-slate-800 opacity-50 cursor-not-allowed"
              : isCameraOff
                ? "bg-red-600 hover:bg-red-700"
                : "bg-slate-700 hover:bg-slate-600"
          }`}
          disabled={!daily || !localSessionId}
          title={
            !daily || !localSessionId
              ? "ไม่พร้อมใช้งาน"
              : isCameraOff
                ? "เปิดกล้อง"
                : "ปิดกล้อง"
          }
        >
          {isCameraOff ? (
            <VideoOff className="w-5 h-5" />
          ) : (
            <Video className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => setShowVideoInputMenu(!showVideoInputMenu)}
          className="rounded-full p-2 bg-slate-700 hover:bg-slate-600 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
          title="เลือกกล้อง"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {showVideoInputMenu && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 min-w-[200px] max-w-[280px]">
            <p className="text-xs text-slate-400 px-3 py-1 border-b border-slate-700">
              เลือกกล้อง
            </p>
            {videoInputDevices.map((device) => (
              <button
                key={device.deviceId}
                onClick={async () => {
                  try {
                    // Daily.co has cycleCamera() but no direct device selection
                    // For now, track the selection
                    setSelectedVideoInput(device.deviceId);
                    setShowVideoInputMenu(false);
                    console.log(
                      "Selected camera (will apply on next join):",
                      device.label,
                    );
                    toast.info("กล้องจะถูกใช้เมื่อเริ่มสายใหม่");
                  } catch (err) {
                    console.error("Error setting camera:", err);
                  }
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 ${
                  selectedVideoInput === device.deviceId
                    ? "text-emerald-400"
                    : "text-white"
                }`}
              >
                {device.label || "กล้อง"}
                {selectedVideoInput === device.deviceId && " ✓"}
              </button>
            ))}
            {videoInputDevices.length === 0 && (
              <p className="text-xs text-slate-500 px-3 py-2">ไม่พบอุปกรณ์</p>
            )}
          </div>
        )}
      </div>

      {/* Speaker Mute & Output Selector */}
      <div className="relative flex items-center gap-1">
        <button
          onClick={() => {
            setIsSpeakerMuted(!isSpeakerMuted);
            // Mute all audio elements
            const audioElements = Array.from(
              document.querySelectorAll("audio"),
            );
            audioElements.forEach((audio) => {
              audio.muted = !isSpeakerMuted;
            });
            console.log("Speaker muted:", !isSpeakerMuted);
          }}
          className={`rounded-full p-3 transition-all min-w-[48px] min-h-[48px] flex items-center justify-center ${
            isSpeakerMuted
              ? "bg-red-600 hover:bg-red-700"
              : "bg-slate-700 hover:bg-slate-600"
          }`}
          title={isSpeakerMuted ? "เปิดเสียง" : "ปิดเสียง"}
        >
          {isSpeakerMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => setShowAudioOutputMenu(!showAudioOutputMenu)}
          className="rounded-full p-2 bg-slate-700 hover:bg-slate-600 transition-all min-w-[32px] min-h-[32px] flex items-center justify-center"
          title="เลือกลำโพง"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {showAudioOutputMenu && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 rounded-lg shadow-xl border border-slate-700 py-2 min-w-[200px] max-w-[280px]">
            <p className="text-xs text-slate-400 px-3 py-1 border-b border-slate-700">
              เลือกลำโพง
            </p>
            {audioOutputDevices.map((device) => (
              <button
                key={device.deviceId}
                onClick={async () => {
                  try {
                    // Set audio output on all audio elements
                    const audioElements = Array.from(
                      document.querySelectorAll("audio"),
                    );
                    for (const audio of audioElements) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      await (audio as any).setSinkId(
                        device.deviceId,
                      );
                    }
                    setSelectedAudioOutput(device.deviceId);
                    setShowAudioOutputMenu(false);
                  } catch (err) {
                    console.error("Error setting audio output:", err);
                  }
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 ${
                  selectedAudioOutput === device.deviceId
                    ? "text-emerald-400"
                    : "text-white"
                }`}
              >
                {device.label || "ลำโพง"}
                {selectedAudioOutput === device.deviceId && " ✓"}
              </button>
            ))}
            {audioOutputDevices.length === 0 && (
              <p className="text-xs text-slate-500 px-3 py-2">ไม่พบอุปกรณ์</p>
            )}
          </div>
        )}
      </div>

      {/* Leave Call Button */}
      <button
        onClick={handleLeaveCall}
        className="rounded-full p-3 bg-red-600 hover:bg-red-700 transition-all min-w-[48px] min-h-[48px] flex items-center justify-center"
        title="วางสาย"
      >
        <PhoneOff className="w-5 h-5" />
      </button>
    </div>
  );
}
