/**
 * PatientCallPage
 *
 * Dedicated full-screen call page for patients.
 * Optimized for mobile with:
 * - Device permission check
 * - Reconnect logic
 * - Network quality indicator
 * - Thai language UI
 */
"use client";

import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
import { DailyProvider } from "@daily-co/daily-react";
import { AlertCircle, ChevronLeft } from "lucide-react";
// import { getRoomUrlForHandoff, updateTelemedicineData, type TelemedicineChannel } from "@/lib/patientHandoffs";
// import { DevicePermissionCheck } from "@/components/video-call/DevicePermissionCheck";
// import ParticipantView from "@/components/video-call/ParticipantView";
// import { useCallDuration, type ConnectionState } from "@/hooks/useDailyCall";
// import { useTelepharmacyChat } from "@/hooks/useTelepharmacyChat";
// import { supabase } from "@/lib/supabase";
// import { fetchTelemedicineMeetingToken } from "@/lib/daily";
import React from "react";
import { PatientCallData } from "../../../interface";
import { useRouter } from "next/navigation";
import CallInner from "./CallInner";
import updatePatientHandoff from "@/libs/patientHandoff/updatePatientHandoff";
import DevicePermissionCheck from "../common/DevicePermissionCheck";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

// ─── Network Quality Indicator ──────────────────────────────────────────────────

// ─── Call Duration Display ────────────────────────────────────────────────────

// ─── Reconnect Overlay ─────────────────────────────────────────────────────────

// ─── Error Overlay ───────────────────────────────────────────────────────────

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function PatientCallPage({
  data,
  room: { roomUrl, token },
}: {
  data: PatientCallData;
  room: {
    roomUrl: string;
    token: string;
  };
}) {
  // const { handoffId } = useParams<keyof CallPageParams>() as CallPageParams;
  const navigate = useRouter();
  // const roomRetryTimeoutRef = useRef<number | null>(null);

  // const [roomUrl, setRoomUrl] = useState<string | null>(null);
  // const [channel, setChannel] = useState<TelemedicineChannel>("video");
  // const [pharmacyName, setPharmacyName] = useState<string>("ร้านยา");
  // const [loading, setLoading] = useState(true);
  // const [loadingMessage, setLoadingMessage] = useState("กำลังโหลด...");
  // const [error, setError] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  // const [roomToken, setRoomToken] = useState<string | null>(null);

  // Load handoff data
  // useEffect(() => {
  //   let cancelled = false;

  //   // const clearRetry = () => {
  //   //   if (roomRetryTimeoutRef.current !== null) {
  //   //     window.clearTimeout(roomRetryTimeoutRef.current);
  //   //     roomRetryTimeoutRef.current = null;
  //   //   }
  //   // };

  //   const loadHandoff = async () => {
  //     try {
  //       const { data: handoff, error: handoffError } = await supabase
  //         .from("patient_handoffs")
  //         .select("*, pharmacies:pharmacy_id(name)")
  //         .eq("id", handoffId)
  //         .single();

  //       if (handoffError || !handoff) {
  //         setError("ไม่พบข้อมูลการปรึกษา");
  //         setLoading(false);
  //         return;
  //       }

  //       if (handoff.status !== "accepted") {
  //         setError("การปรึกษายังไม่พร้อม กรุณารอเภสัชกรรับเรื่อง");
  //         setLoading(false);
  //         return;
  //       }

  //       setChannel(handoff.telemedicine_channel || "video");
  //       setPharmacyName(handoff.pharmacies?.name || "ร้านยา");
  //       setLoadingMessage("กำลังรอเภสัชกรเริ่มการปรึกษา...");

  //       // Get room URL
  //       const url = await getRoomUrlForHandoff(handoffId);

  //       // if (!url) {
  //       //   if (cancelled) return;
  //       //   setLoading(true);
  //       //   roomRetryTimeoutRef.current = window.setTimeout(() => {
  //       //     void loadHandoff();
  //       //   }, 4000);
  //       //   return;
  //       // }

  //       const { token } = await fetchTelemedicineMeetingToken({
  //         handoffId,
  //         participantName: handoff.patient_name || "ผู้ป่วย",
  //         role: "patient",
  //         audioOnly: (handoff.telemedicine_channel || "video") === "phone",
  //       });

  //       // clearRetry();
  //       setRoomToken(token);
  //       setRoomUrl(url);
  //       setLoadingMessage("กำลังเชื่อมต่อ...");
  //       setLoading(false);
  //     } catch (err) {
  //       if (cancelled) return;
  //       setLoading(true);
  //       setLoadingMessage("กำลังเชื่อมต่อใหม่...");
  //       // roomRetryTimeoutRef.current = window.setTimeout(() => {
  //       //   void loadHandoff();
  //       // }, 4000);
  //     }
  //   };

  //   loadHandoff();

  //   return () => {
  //     cancelled = true;
  //     // clearRetry();
  //   };
  // }, [handoffId]);

  // Update telemedicine start time
  const handleCallStart = async () => {
    await updatePatientHandoff(data.handoff._id, {
      telemedicineStartTime: new Date(),
    });
  };

  // Update telemedicine end time
  const handleCallEnd = async () => {
    if (callEnded) return;
    setCallEnded(true);

    await updatePatientHandoff(data.handoff._id, {
      telemedicineEndTime: new Date(),
    });

    navigate.push("/tracking");
  };

  // Loading state
  // if (loading) {
  //   return (
  //     <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
  //       <div className="text-center">
  //         <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
  //         <p className="text-white">กำลังโหลด...</p>
  //         <p className="mt-2 text-sm text-slate-400">{loadingMessage}</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Error state
  if (data.error) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6">
        <Card className="max-w-sm w-full p-6 text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="font-semibold text-slate-900 mb-2">
            ไม่สามารถเข้าร่วมได้
          </h2>
          <p className="text-sm text-slate-500 mb-4">{data.error}</p>
          <Button onClick={() => navigate.push("/tracking")} className="w-full">
            กลับไปหน้าติดตาม
          </Button>
        </Card>
      </div>
    );
  }

  // Permission check
  if (!permissionsGranted) {
    return (
      <div className="fixed inset-0 bg-background">
        <div className="h-full max-w-md mx-auto flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate.push("/tracking")}>
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="font-semibold">ตรวจสอบอุปกรณ์</h1>
            </div>
          </div>
          <div className="flex-1">
            <DevicePermissionCheck
              audioOnly={data.handoff.telemedicineChannel === "phone"}
              onPermissionGranted={() => {
                setPermissionsGranted(true);
                handleCallStart();
              }}
              onCancel={() => navigate.push("/tracking")}
            />
          </div>
        </div>
      </div>
    );
  }

  // Active call
  return (
    <div className="fixed inset-0 bg-slate-950">
      <DailyProvider userName="Patient" dailyConfig={{}}>
        <CallInner
          roomUrl={roomUrl}
          roomToken={token}
          channel={data.handoff.telemedicineChannel}
          pharmacyName={data.pharmacyName}
          handoffId={data.handoff._id}
          onLeave={handleCallEnd}
          messageInputs={data.messageInputs}
        />
      </DailyProvider>
    </div>
  );
}
