import { DailyProvider } from "@daily-co/daily-react";
import { AlertCircle, Loader2 } from "lucide-react";
import React from "react";
import DailyCallInner from "./DailyCallInner";
import getRoomUrlForHandoff from "@/libs/patientHandoff/getRoomUrlForHandoff";
export default 
function PhoneConsult({ handoffId, pharmacyName, onClose }: { handoffId: string; pharmacyName: string; onClose: () => void }) {
  const [roomUrl, setRoomUrl] = React.useState<string | null | undefined>(undefined);

  React.useEffect(() => {
    getRoomUrlForHandoff(handoffId).then(setRoomUrl);
  }, [handoffId]);

  if (roomUrl === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-white gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-slate-400">กำลังโหลดข้อมูลสาย...</p>
      </div>
    );
  }

  if (!roomUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-white gap-4 px-6">
        <AlertCircle className="h-12 w-12 text-amber-400" />
        <p className="text-center text-sm text-slate-300">เภสัชกรยังไม่ได้เริ่มสาย<br />กรุณารอสักครู่แล้วลองใหม่</p>
        <button onClick={onClose} className="text-xs text-slate-400 underline mt-2">ปิด</button>
      </div>
    );
  }

  return (
    <DailyProvider userName="Patient" dailyConfig={{}}>
      <DailyCallInner roomUrl={roomUrl} audioOnly={true} pharmacyName={pharmacyName} onClose={onClose} handoffId={handoffId} />
    </DailyProvider>
  );
}