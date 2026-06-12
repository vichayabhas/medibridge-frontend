import React from "react";
import { TelemedicineChannel } from "../../../../interface";
import {
  CalendarClock,
  Clock,
  MessageCircle,
  Phone,
  Video,
  X,
} from "lucide-react";
function useCountdown(targetIso?: Date) {
  const getSecsLeft = () => {
    if (!targetIso) return 0;
    return Math.max(
      0,
      Math.floor((new Date(targetIso.toString()).getTime() - Date.now()) / 1000),
    );
  };
  const [secs, setSecs] = React.useState(getSecsLeft);
  React.useEffect(() => {
    if (!targetIso) return;
    const t = setInterval(() => setSecs(getSecsLeft()), 1000);
    return () => clearInterval(t);
  }, [targetIso]);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const label =
    h > 0
      ? `${h} ชม. ${String(m).padStart(2, "0")} นาที`
      : m > 0
        ? `${m} นาที ${String(s).padStart(2, "0")} วินาที`
        : `${s} วินาที`;
  return { secsLeft: secs, label };
}
export default function WaitingScreen({
  channel,
  pharmacyName,
  appointmentTime,
  onClose,
  onReady,
}: {
  channel: TelemedicineChannel;
  pharmacyName: string;
  appointmentTime: Date;
  onClose: () => void;
  onReady: () => void;
}) {
  const { secsLeft, label } = useCountdown(appointmentTime);
  const apptDate = new Date(appointmentTime);
  const apptLabel = apptDate.toLocaleString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const channelColor =
    channel === "video"
      ? {
          ring: "border-violet-400/40",
          icon: "text-violet-400",
          badge: "bg-violet-500/15 text-violet-300",
        }
      : channel === "phone"
        ? {
            ring: "border-emerald-400/40",
            icon: "text-emerald-400",
            badge: "bg-emerald-500/15 text-emerald-300",
          }
        : {
            ring: "border-primary/40",
            icon: "text-primary",
            badge: "bg-primary/15 text-primary",
          };

  React.useEffect(() => {
    if (secsLeft === 0) onReady();
  }, [secsLeft]);

  const CHANNEL_ICON: Record<TelemedicineChannel, React.ReactNode> = {
    video: <Video className={`h-10 w-10 ${channelColor.icon}`} />,
    phone: <Phone className={`h-10 w-10 ${channelColor.icon}`} />,
    chat: <MessageCircle className={`h-10 w-10 ${channelColor.icon}`} />,
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${channelColor.badge}`}
        >
          {channel === "video"
            ? "วิดีโอคอล"
            : channel === "phone"
              ? "โทรศัพท์"
              : "แชท"}
        </span>
        <button
          onClick={onClose}
          className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        {/* Pulsing icon ring */}
        <div
          className={`relative h-28 w-28 rounded-full border-4 ${channelColor.ring} bg-white/5 flex items-center justify-center`}
        >
          <div
            className={`absolute inset-0 rounded-full border-4 ${channelColor.ring} animate-ping opacity-30`}
          />
          {CHANNEL_ICON[channel]}
        </div>

        <div className="text-center space-y-1">
          <p className="text-xl font-bold">{pharmacyName}</p>
          <p className="text-slate-400 text-sm">เภสัชกรผู้ดูแล</p>
        </div>

        {/* Appointment time box */}
        <div className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 flex items-center gap-4">
          <CalendarClock className="h-8 w-8 text-slate-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-400 mb-0.5">เวลานัดหมาย</p>
            <p className="text-sm font-semibold text-white">{apptLabel}</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Clock className="h-3.5 w-3.5" />
            อีก
          </div>
          <p className="text-3xl font-mono font-bold text-white tracking-wide">
            {label}
          </p>
          <p className="text-xs text-slate-500">
            ระบบจะเชื่อมต่ออัตโนมัติเมื่อถึงเวลา
          </p>
        </div>
      </div>

      {/* Early join note */}
      <div className="px-5 pb-6">
        <button
          onClick={onReady}
          className="w-full rounded-xl py-3 bg-white/10 hover:bg-white/15 text-sm text-slate-300 transition-colors font-medium"
        >
          เข้าร่วมก่อนเวลา
        </button>
      </div>
    </div>
  );
}
