/**
 * DevicePermissionCheck Component
 *
 * Pre-call device permission check with:
 * - Camera/microphone permission detection
 * - Device test preview
 * - Permission request flow
 * - Thai language support
 */
"use client";
import React from "react";
import { useState, useRef, useEffect } from "react";
import {
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "../utility/setup";

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: "audioinput" | "audiooutput" | "videoinput";
}

interface DevicePermissionCheckProps {
  audioOnly?: boolean;
  onPermissionGranted: () => void;
  onCancel?: () => void;
}

export default function DevicePermissionCheck({
  audioOnly = false,
  onPermissionGranted,
  onCancel,
}: DevicePermissionCheckProps) {
  const [step, setStep] = useState<
    "checking" | "requesting" | "preview" | "error" | "success"
  >("checking");
  const [error, setError] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  // Device selection state
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>(
    [],
  );
  const [audioOutputDevices, setAudioOutputDevices] = useState<
    MediaDeviceInfo[]
  >([]);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>(
    [],
  );
  const [selectedAudioInput, setSelectedAudioInput] = useState<string>("");
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>("");
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>("");
  const [showDeviceSelectors, setShowDeviceSelectors] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // Check initial permissions and enumerate devices
  useEffect(() => {
    checkPermissions();
    enumerateDevices();
    return () => {
      cleanup();
    };
  }, []);

  // Enumerate available devices
  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioInputs = devices
        .filter((d) => d.kind === "audioinput")
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `ไมโครโฟน ${d.deviceId.slice(0, 8)}...`,
          kind: d.kind as "audioinput",
        }));
      const audioOutputs = devices
        .filter((d) => d.kind === "audiooutput")
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `ลำโพง ${d.deviceId.slice(0, 8)}...`,
          kind: d.kind as "audiooutput",
        }));
      const videoInputs = devices
        .filter((d) => d.kind === "videoinput")
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `กล้อง ${d.deviceId.slice(0, 8)}...`,
          kind: d.kind as "videoinput",
        }));

      setAudioInputDevices(audioInputs);
      setAudioOutputDevices(audioOutputs);
      setVideoInputDevices(videoInputs);

      // Set defaults if not already selected
      if (!selectedAudioInput && audioInputs.length > 0) {
        setSelectedAudioInput(audioInputs[0].deviceId);
      }
      if (!selectedAudioOutput && audioOutputs.length > 0) {
        setSelectedAudioOutput(audioOutputs[0].deviceId);
      }
      if (!selectedVideoInput && videoInputs.length > 0) {
        setSelectedVideoInput(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.error("Failed to enumerate devices:", err);
    }
  };

  // Apply selected devices
  const applyDeviceSelection = async () => {
    try {
      cleanup();

      const constraints: MediaStreamConstraints = {
        audio: selectedAudioInput
          ? { deviceId: { exact: selectedAudioInput } }
          : true,
        video: audioOnly
          ? false
          : selectedVideoInput
            ? { deviceId: { exact: selectedVideoInput } }
            : { facingMode: "user" },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!audioOnly && stream.getVideoTracks().length > 0) {
        setVideoStream(stream);
        setIsCameraEnabled(stream.getVideoTracks()[0]?.enabled ?? true);
        setIsMicEnabled(stream.getAudioTracks()[0]?.enabled ?? true);
      } else {
        startAudioMonitoring(stream);
        setIsMicEnabled(stream.getAudioTracks()[0]?.enabled ?? true);
      }
    } catch (err) {
      console.error("Failed to apply device selection:", err);
      setError("ไม่สามารถใช้อุปกรณ์ที่เลือกได้ กรุณาลองใหม่");
    }
  };

  const cleanup = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const checkPermissions = async () => {
    setStep("checking");
    setError(null);

    try {
      // Try to get media
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: audioOnly ? false : { facingMode: "user" },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!audioOnly && stream.getVideoTracks().length > 0) {
        setVideoStream(stream);
        setIsCameraEnabled(stream.getVideoTracks()[0]?.enabled ?? true);
        setIsMicEnabled(stream.getAudioTracks()[0]?.enabled ?? true);
        setStep("preview");
      } else {
        // Audio only - start audio level monitoring
        startAudioMonitoring(stream);
        setIsMicEnabled(stream.getAudioTracks()[0]?.enabled ?? true);
        setStep("preview");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";

      if (
        errorMsg.includes("Permission denied") ||
        errorMsg.includes("NotAllowedError")
      ) {
        setError("ไม่ได้รับอนุญาตให้ใช้กล้อง/ไมโครโฟน");
        setStep("requesting");
      } else if (errorMsg.includes("NotFoundError")) {
        setError(
          audioOnly
            ? "ไม่พบไมโครโฟน กรุณาตรวจสอบอุปกรณ์"
            : "ไม่พบกล้องหรือไมโครโฟน กรุณาตรวจสอบอุปกรณ์",
        );
        setStep("error");
      } else {
        setError("เกิดข้อผิดพลาดในการตรวจสอบอุปกรณ์: " + errorMsg);
        setStep("error");
      }
    }
  };

  // const requestPermissions = async () => {
  //   setStep("requesting");
  //   setError(null);

  //   try {
  //     const constraints: MediaStreamConstraints = {
  //       audio: true,
  //       video: audioOnly ? false : { facingMode: "user" },
  //     };

  //     const stream = await navigator.mediaDevices.getUserMedia(constraints);

  //     if (!audioOnly && stream.getVideoTracks().length > 0) {
  //       setVideoStream(stream);
  //       setIsCameraEnabled(stream.getVideoTracks()[0]?.enabled ?? true);
  //       setIsMicEnabled(stream.getAudioTracks()[0]?.enabled ?? true);
  //       setStep("preview");
  //     } else {
  //       startAudioMonitoring(stream);
  //       setIsMicEnabled(stream.getAudioTracks()[0]?.enabled ?? true);
  //       setStep("preview");
  //     }
  //   } catch (err) {
  //     const errorMsg = err instanceof Error ? err.message : "Unknown error";

  //     if (errorMsg.includes("Permission denied")) {
  //       setError(
  //         "ไม่ได้รับอนุญาต กรุณาอนุญาตให้ใช้กล้องและไมโครโฟนในการตั้งค่าเบราว์เซอร์",
  //       );
  //     } else {
  //       setError(errorMsg);
  //     }
  //     setStep("error");
  //   }
  // };

  const startAudioMonitoring = (stream: MediaStream) => {
    try {
      const audioContext = new (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 256;

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(average);

        animationRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch {
      // Audio monitoring not critical
    }
  };

  // Attach video stream to element
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const handleContinue = () => {
    cleanup();
    setStep("success");
    onPermissionGranted();
  };

  const toggleMic = () => {
    if (videoStream) {
      const audioTrack = videoStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicEnabled;
        setIsMicEnabled(!isMicEnabled);
      }
    }
  };

  const toggleCamera = () => {
    if (videoStream) {
      const videoTrack = videoStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraEnabled;
        setIsCameraEnabled(!isCameraEnabled);
      }
    }
  };

  // Rendering based on step
  if (step === "checking" || step === "requesting") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-slate-600">
          {step === "checking"
            ? "กำลังตรวจสอบอุปกรณ์..."
            : "กำลังขออนุญาตใช้งาน..."}
        </p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 mb-1">
            ไม่สามารถเข้าถึงอุปกรณ์ได้
          </p>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button onClick={checkPermissions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองอีกครั้ง
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-4 max-w-xs">
          หากยังไม่สามารถใช้งานได้
          กรุณาตรวจสอบว่าได้อนุญาตให้ใช้กล้องและไมโครโฟนในการตั้งค่าเบราว์เซอร์
        </p>
      </div>
    );
  }

  if (step === "preview") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
          {/* Header */}
          <div className="text-center">
            <p className="font-semibold text-slate-900">
              ตรวจสอบอุปกรณ์ก่อนเริ่ม
            </p>
            <p className="text-sm text-slate-500">ตรวจสอบว่าอุปกรณ์ทำงานปกติ</p>
          </div>

          {/* Video Preview or Audio Indicator */}
          {!audioOnly ? (
            <div className="relative w-full max-w-sm aspect-video bg-slate-900 rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded text-xs text-white">
                <div className="flex items-center gap-1.5">
                  <Camera className="h-3 w-3" />
                  <span>กล้องทำงาน</span>
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mic className="h-10 w-10 text-primary" />
                </div>
              </div>
              <p className="font-medium mb-2">ทดสอบไมโครโฟน</p>
              <p className="text-sm text-slate-500 mb-4">
                พูดอะไรสักอย่างเพื่อตรวจสอบ
              </p>

              {/* Audio Level Indicator */}
              <div className="flex items-center gap-1 h-8 justify-center">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 rounded-full transition-all duration-100",
                      audioLevel > i * 5
                        ? "bg-primary h-6"
                        : "bg-slate-200 h-2",
                    )}
                  />
                ))}
              </div>

              {audioLevel > 10 && (
                <p className="text-xs text-emerald-600 mt-2 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  ได้ยินเสียงแล้ว
                </p>
              )}
            </Card>
          )}

          {/* Device Controls */}
          <div className="flex gap-3">
            <button
              onClick={toggleMic}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                isMicEnabled
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-red-50 border-red-200 text-red-700",
              )}
            >
              {isMicEnabled ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {isMicEnabled ? "ไมค์เปิด" : "ไมค์ปิด"}
              </span>
            </button>
            {!audioOnly && (
              <button
                onClick={toggleCamera}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
                  isCameraEnabled
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-700",
                )}
              >
                {isCameraEnabled ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <VideoOff className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {isCameraEnabled ? "กล้องเปิด" : "กล้องปิด"}
                </span>
              </button>
            )}
          </div>

          {/* Device Selection */}
          <div className="border rounded-xl border-slate-200 overflow-hidden">
            <button
              onClick={() => setShowDeviceSelectors(!showDeviceSelectors)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition"
            >
              <span className="text-sm font-medium text-slate-700">
                เลือกอุปกรณ์ (ขั้นสูง)
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-500 transition",
                  showDeviceSelectors && "rotate-180",
                )}
              />
            </button>

            {showDeviceSelectors && (
              <div className="p-4 space-y-3 bg-white">
                {/* Audio Input (Microphone) */}
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                    ไมโครโฟน
                  </label>
                  <select
                    value={selectedAudioInput}
                    onChange={(e) => {
                      setSelectedAudioInput(e.target.value);
                      applyDeviceSelection();
                    }}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {audioInputDevices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audio Output (Speaker) */}
                {audioOutputDevices.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      ลำโพง
                    </label>
                    <select
                      value={selectedAudioOutput}
                      onChange={(e) => setSelectedAudioOutput(e.target.value)}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {audioOutputDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Video Input (Camera) */}
                {!audioOnly && videoInputDevices.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1.5 block">
                      กล้อง
                    </label>
                    <select
                      value={selectedVideoInput}
                      onChange={(e) => {
                        setSelectedVideoInput(e.target.value);
                        applyDeviceSelection();
                      }}
                      className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {videoInputDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t">
          <p className="text-xs text-slate-500 text-center mb-3">
            คุณสามารถเปิด/ปิดกล้องและไมค์ได้ก่อนและระหว่างการปรึกษา
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              ยกเลิก
            </Button>
            <Button className="flex-1" onClick={handleContinue}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              เข้าร่วมการปรึกษา
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
