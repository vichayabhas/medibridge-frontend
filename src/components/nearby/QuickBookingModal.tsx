"use client";
import React from "react";
import { Button } from "../ui/button";
import { AlertCircle, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Coins, MessageCircle, Phone, Timer, Video, X, Zap } from "lucide-react";
import { cn, getBackendUrl } from "../utility/setup";
import { PharmacistType } from "../../../interface";
import { PHARMACIST_PHOTOS } from "./NearbyPage";
import { Avatar } from "../ui/avatar";
type ConsultMethod = "chat" | "phone" | "video";
const CONSULT_METHODS: {
  id: ConsultMethod;
  label: string;
  sublabel: string;
  icon: typeof MessageCircle;
}[] = [
  { id: "chat", label: "แชท", sublabel: "ส่งข้อความ", icon: MessageCircle },
  { id: "phone", label: "โทรศัพท์", sublabel: "สนทนาสด", icon: Phone },
  { id: "video", label: "วิดีโอคอล", sublabel: "หน้าจอต่อหน้า", icon: Video },
];

export function toMins(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function buildQuickSlots(
  interval: number,
  duration: number,
  bookedSlots: string[],
): { value: string; label: string; isNow: boolean; occupied: boolean }[] {
  const now = new Date();
  const next = new Date(now);
  next.setSeconds(0, 0);
  const totalMins = next.getHours() * 60 + next.getMinutes();
  const nextAligned = Math.ceil((totalMins + 1) / interval) * interval;
  next.setHours(Math.floor(nextAligned / 60), nextAligned % 60, 0, 0);
  const bookedMins = bookedSlots.map(toMins);
  const slots: {
    value: string;
    label: string;
    isNow: boolean;
    occupied: boolean;
  }[] = [];
  for (let i = 0; i < 9; i++) {
    const h = next.getHours().toString().padStart(2, "0");
    const m = next.getMinutes().toString().padStart(2, "0");
    const value = `${h}:${m}`;
    const startM = toMins(value);
    const endM = startM + duration;
    const occupied = bookedMins.some(
      (b) => b - 1 < endM && b + duration + 1 > startM,
    );
    slots.push({
      value,
      label: i === 0 ? `ตอนนี้ · ${value}` : value,
      isNow: i === 0,
      occupied,
    });
    next.setMinutes(next.getMinutes() + interval);
  }
  return slots;
}
export default function QuickBookingModal({
  pharmacist,
  onClose,
}: {
  pharmacist: PharmacistType;
  onClose: () => void;
}) {
  const [method, setMethod] = React.useState<ConsultMethod>("chat");
  const [duration, setDuration] = React.useState(
    () => pharmacist.consultDurations[0],
  );

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [selectedDate, setSelectedDate] = React.useState<Date>(today);
  const [calMonth, setCalMonth] = React.useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isSameDate = (a: Date, b: Date) =>
    a.toDateString() === b.toDateString();
  const dayOffset = Math.round(
    (selectedDate.getTime() - today.getTime()) / 86400000,
  );

  const MONTH_NAMES = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const DAY_NAMES_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const calDays = React.useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calMonth]);

  const maxDate = React.useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 60);
    return d;
  }, [today]);

  const handleDateSelect = (d: Date) => {
    setSelectedDate(d);
    const offset = Math.round((d.getTime() - today.getTime()) / 86400000);
    const s = buildQuickSlots(
      duration,
      duration,
      offset === 0 ? pharmacist.bookedSlots : [],
    );
    setSlot((s.find((x) => !x.occupied) ?? s[0]).value);
  };

  const selectedDateLabel = isSameDate(selectedDate, today)
    ? "วันนี้"
    : `${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear() + 543}`;

  const quickSlots = React.useMemo(
    () =>
      buildQuickSlots(
        duration,
        duration,
        dayOffset === 0 ? pharmacist.bookedSlots : [],
      ),
    [duration, dayOffset, pharmacist.bookedSlots],
  );
  const [slot, setSlot] = React.useState<string>(
    () => (quickSlots.find((s) => !s.occupied) ?? quickSlots[0]).value,
  );
  const [note, setNote] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);
  const isNowSlot = React.useMemo(() => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const slotMins = toMins(slot);
    return dayOffset === 0 && Math.abs(slotMins - nowMins) < duration;
  }, [slot, duration, dayOffset]);
  const isOccupied = React.useMemo(() => {
    if (dayOffset !== 0) return false;
    const startM = toMins(slot);
    const endM = startM + duration;
    return pharmacist.bookedSlots.some((b) => {
      const bM = toMins(b);
      return bM - 1 < endM && bM + duration + 1 > startM;
    });
  }, [slot, duration, dayOffset, pharmacist.bookedSlots]);
  const isPast = React.useMemo(() => {
    if (dayOffset !== 0) return false;
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return toMins(slot) < nowMins + 5;
  }, [slot, dayOffset]);
  const rateNow = pharmacist.methodRates[method];
  const totalTokens = duration * rateNow;

  const endTimeLabel = React.useMemo(() => {
    const [h, m] = slot.split(":").map(Number);
    const end = new Date();
    end.setHours(h, m + duration, 0, 0);
    return `${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
  }, [slot, duration]);

  const [confirmError, setConfirmError] = React.useState<string | null>(null);
  const [errorDetails, setErrorDetails] = React.useState<string | null>(null);

  const handleConfirm = async () => {
    setConfirmError(null);
    setErrorDetails(null);
    setConfirming(true);
    try {
      const apiUrl = getBackendUrl()
      const res = await fetch(`${apiUrl}/api/bookings/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pharmacistId: pharmacist._id,
          slot,
          duration,
          dayOffset,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setConfirmError(data.error ?? "ไม่สามารถจองได้ กรุณาลองใหม่");
        setConfirming(false);
        return;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setConfirmError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
      setErrorDetails(
        `(${errorMsg}) ตรวจสอบว่า backend server กำลังทำงานที่ http://localhost:3001 โดยรัน 'npm run dev:server'`,
      );
      setConfirming(false);
      return;
    }
    setTimeout(() => {
      setConfirming(false);
      setConfirmed(true);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92svh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-border/50 shrink-0">
          <Avatar
            src={PHARMACIST_PHOTOS[pharmacist._id]}
            name={pharmacist.name}
            size="md"
            className="ring-2 ring-background shadow-md shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-snug truncate">
              {pharmacist.name}
            </p>
            <p className="text-xs text-primary font-semibold truncate">
              {pharmacist.specialties[0]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {confirmed ? (
            /* ─ Success state ─ */
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              <div className="relative mx-auto mb-5 w-20 h-20 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full bg-success/10 animate-ping"
                  style={{ animationDuration: "2s" }}
                />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success/10 border-2 border-success/30">
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-1">จองคิวสำเร็จ!</h2>
              <p className="text-sm text-muted-foreground mb-1">
                นัดปรึกษากับ{" "}
                <span className="font-semibold text-foreground">
                  {pharmacist.name}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {isNowSlot ? (
                  <span className="font-black text-primary text-lg">
                    เริ่มปรึกษาทันที
                  </span>
                ) : (
                  <>
                    {selectedDateLabel} เวลา{" "}
                    <span className="font-black text-primary text-lg">
                      {slot} น.
                    </span>
                  </>
                )}
              </p>
              <div className="flex items-center gap-2 mb-5 px-4 py-2.5 rounded-xl bg-primary/8 border border-primary/20">
                <Coins className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  โทเคนที่ใช้:
                </span>
                <span className="font-black text-primary text-lg">
                  {totalTokens}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({duration} นาที × {rateNow}/นาที)
                </span>
              </div>
              <div className="w-full rounded-2xl border border-border/40 bg-muted/30 p-4 text-left mb-5 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  {(() => {
                    const M = CONSULT_METHODS.find((m) => m.id === method)!;
                    return (
                      <M.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    );
                  })()}
                  <span className="text-muted-foreground">ช่องทาง:</span>
                  <span className="font-semibold">
                    {CONSULT_METHODS.find((m) => m.id === method)!.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-muted-foreground">เวลา:</span>
                  <span className="font-semibold">
                    {dayOffset > 0 ? `${selectedDateLabel} ` : ""}
                    {isNowSlot ? "ตอนนี้" : `${slot} น.`}
                  </span>
                </div>
                {note.trim() && (
                  <div className="flex items-start gap-2 text-xs">
                    <MessageCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-relaxed">
                      {note}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mb-6">
                เภสัชกรจะติดต่อกลับอีกครั้งเพื่อยืนยันและเตรียมเชื่อมต่อ
              </p>
              <Button className="w-full h-11 rounded-xl" onClick={onClose}>
                เสร็จ
              </Button>
            </div>
          ) : (
            <div className="px-5 py-5 space-y-5">
              {/* Consult method */}
              <div>
                <p className="text-xs font-bold mb-3">ช่องทางการปรึกษา</p>
                <div className="grid grid-cols-3 gap-2">
                  {CONSULT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200",
                        method === m.id
                          ? "border-primary bg-primary/8 shadow-sm"
                          : "border-border/40 bg-muted/30 hover:border-primary/40",
                      )}
                    >
                      <m.icon
                        className={cn(
                          "h-5 w-5",
                          method === m.id
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-bold",
                          method === m.id ? "text-primary" : "text-foreground",
                        )}
                      >
                        {m.label}
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Coins
                          className={cn(
                            "h-3 w-3",
                            method === m.id
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            "text-[11px] font-bold",
                            method === m.id
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        >
                          {pharmacist.methodRates[m.id]}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          /นาที
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Unified schedule block ── */}
              <div className="rounded-2xl border-2 border-primary/20 bg-muted/20 p-4 space-y-4">
                {/* Row 1: live timeline pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Start badge */}
                    <span className="shrink-0 px-2.5 py-1 rounded-lg bg-primary text-white text-xs font-bold">
                      {isNowSlot
                        ? `ตอนนี้ · ${slot}`
                        : `${selectedDateLabel} · ${slot}`}
                    </span>
                    {/* Arrow line */}
                    <div className="flex-1 flex items-center gap-1 min-w-0">
                      <div className="h-px flex-1 bg-primary/30" />
                      <span className="shrink-0 text-[10px] text-primary font-semibold px-1">
                        {duration} นาที
                      </span>
                      <div className="h-px flex-1 bg-primary/30" />
                      <ChevronRight className="h-3 w-3 text-primary shrink-0" />
                    </div>
                    {/* End badge */}
                    <span className="shrink-0 px-2.5 py-1 rounded-lg bg-primary/15 text-primary text-xs font-bold border border-primary/30">
                      {endTimeLabel}
                    </span>
                  </div>
                  {/* Token cost */}
                  <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-border/40">
                    <Coins className="h-3.5 w-3.5 text-primary" />
                    <span className="text-base font-black text-primary">
                      {totalTokens}
                    </span>
                  </div>
                </div>

                {/* Calendar picker */}
                <div>
                  {/* Month nav header */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCalMonth(
                          new Date(
                            calMonth.getFullYear(),
                            calMonth.getMonth() - 1,
                            1,
                          ),
                        )
                      }
                      disabled={
                        calMonth.getFullYear() === today.getFullYear() &&
                        calMonth.getMonth() === today.getMonth()
                      }
                      className="p-1 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-bold">
                      {MONTH_NAMES[calMonth.getMonth()]}{" "}
                      {calMonth.getFullYear() + 543}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCalMonth(
                          new Date(
                            calMonth.getFullYear(),
                            calMonth.getMonth() + 1,
                            1,
                          ),
                        )
                      }
                      className="p-1 rounded-lg hover:bg-muted transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {DAY_NAMES_SHORT.map((n) => (
                      <div
                        key={n}
                        className="text-center text-[10px] font-semibold text-muted-foreground py-1"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                  {/* Date grid */}
                  <div className="grid grid-cols-7 gap-y-1">
                    {calDays.map((d, i) => {
                      if (!d) return <div key={i} />;
                      const isPast = d < today;
                      const isFuture = d > maxDate;
                      const disabled = isPast || isFuture;
                      const selected = isSameDate(d, selectedDate);
                      const todayCell = isToday(d);
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleDateSelect(d)}
                          className={cn(
                            "mx-auto w-8 h-8 rounded-full text-xs font-semibold transition-all duration-150",
                            disabled
                              ? "text-muted-foreground/30 cursor-not-allowed"
                              : selected
                                ? "bg-primary text-white shadow-md shadow-primary/30 scale-110"
                                : todayCell
                                  ? "border-2 border-success text-success hover:bg-success/10"
                                  : "hover:bg-primary/10 hover:text-primary",
                          )}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                  {/* Selected date summary */}
                  <p className="text-center text-[11px] font-semibold text-primary mt-2">
                    {selectedDateLabel}
                  </p>
                </div>

                {/* Row 2: start time picker */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2">
                    เวลาเริ่ม
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const totalM = (toMins(slot) - 1 + 1440) % 1440;
                        setSlot(
                          `${Math.floor(totalM / 60)
                            .toString()
                            .padStart(
                              2,
                              "0",
                            )}:${(totalM % 60).toString().padStart(2, "0")}`,
                        );
                      }}
                      className="h-10 w-10 rounded-xl border border-border/50 bg-background flex items-center justify-center text-lg font-bold hover:border-primary/50 hover:text-primary transition-all shrink-0"
                    >
                      −
                    </button>
                    <input
                      type="time"
                      value={slot}
                      onChange={(e) => {
                        if (e.target.value) setSlot(e.target.value);
                      }}
                      className={cn(
                        "flex-1 text-center rounded-xl border-2 px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 transition-all",
                        isPast || isOccupied
                          ? "border-destructive/60 bg-destructive/8 focus:ring-destructive/30 focus:border-destructive/60"
                          : "border-primary/30 bg-primary/5 focus:ring-primary/30 focus:border-primary/50",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const totalM = (toMins(slot) + 1) % 1440;
                        setSlot(
                          `${Math.floor(totalM / 60)
                            .toString()
                            .padStart(
                              2,
                              "0",
                            )}:${(totalM % 60).toString().padStart(2, "0")}`,
                        );
                      }}
                      className="h-10 w-10 rounded-xl border border-border/50 bg-background flex items-center justify-center text-lg font-bold hover:border-primary/50 hover:text-primary transition-all shrink-0"
                    >
                      +
                    </button>
                  </div>
                  {isPast ? (
                    <p className="text-center text-[10px] font-semibold text-destructive mt-1.5 flex items-center justify-center gap-1">
                      <span>🔒</span> ต้องจองล่วงหน้าอย่างน้อย 5 นาที
                    </p>
                  ) : isOccupied ? (
                    <p className="text-center text-[10px] font-semibold text-destructive mt-1.5 flex items-center justify-center gap-1">
                      <span>⚠</span> ช่วงเวลานี้ถูกจองแล้ว กรุณาเลือกเวลาอื่น
                    </p>
                  ) : (
                    <p className="text-center text-[10px] text-muted-foreground mt-1.5">
                      กด − / + เพื่อปรับทีละ 1 นาที
                    </p>
                  )}

                  {/* 24-hour availability bar */}
                  {(() => {
                    const bookedMins =
                      dayOffset === 0 ? pharmacist.bookedSlots.map(toMins) : [];
                    const slotStart = toMins(slot);
                    const slotEnd = slotStart + duration;
                    const now = new Date();
                    const cutoffMins =
                      dayOffset === 0
                        ? now.getHours() * 60 + now.getMinutes() + 5
                        : 0;
                    const stops: string[] = [];
                    const prev = 0;
                    type Seg = { start: number; end: number; color: string };
                    const segments: Seg[] = [];
                    for (let m = 0; m < 1440; m++) {
                      const inPast = dayOffset === 0 && m < cutoffMins;
                      const inBooked = bookedMins.some(
                        (b) => m >= b - 1 && m < b + duration + 1,
                      );
                      const inSelected = m >= slotStart && m < slotEnd;
                      const color = inPast
                        ? "past"
                        : inBooked
                          ? "destructive"
                          : inSelected
                            ? "primary"
                            : "free";
                      if (
                        segments.length === 0 ||
                        segments[segments.length - 1].color !== color
                      ) {
                        segments.push({ start: m, end: m + 1, color });
                      } else {
                        segments[segments.length - 1].end = m + 1;
                      }
                    }
                    void prev;
                    void stops;
                    const colorMap: Record<string, string> = {
                      past: "rgba(100,116,139,0.35)",
                      destructive: "rgba(239,68,68,0.75)",
                      primary: "rgba(var(--primary-rgb, 99,102,241),0.85)",
                      free: "rgba(148,163,184,0.18)",
                    };
                    const gradientStops = segments
                      .map(
                        (s) =>
                          `${colorMap[s.color]} ${((s.start / 1440) * 100).toFixed(2)}% ${((s.end / 1440) * 100).toFixed(2)}%`,
                      )
                      .join(", ");
                    const markerPct = ((slotStart / 1440) * 100).toFixed(2);
                    return (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[9px] text-muted-foreground px-0.5">
                          <span>00:00</span>
                          <span>06:00</span>
                          <span>12:00</span>
                          <span>18:00</span>
                          <span>24:00</span>
                        </div>
                        <div
                          className="relative h-4 w-full rounded-full overflow-hidden cursor-pointer select-none"
                          onClick={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const pct = Math.max(
                              0,
                              Math.min(1, (e.clientX - rect.left) / rect.width),
                            );
                            const mins = Math.round(pct * 1440);
                            const clamped = Math.min(mins, 1439);
                            setSlot(
                              `${Math.floor(clamped / 60)
                                .toString()
                                .padStart(
                                  2,
                                  "0",
                                )}:${(clamped % 60).toString().padStart(2, "0")}`,
                            );
                          }}
                          onMouseMove={(e) => {
                            if (e.buttons !== 1) return;
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const pct = Math.max(
                              0,
                              Math.min(1, (e.clientX - rect.left) / rect.width),
                            );
                            const mins = Math.round(pct * 1440);
                            const clamped = Math.min(mins, 1439);
                            setSlot(
                              `${Math.floor(clamped / 60)
                                .toString()
                                .padStart(
                                  2,
                                  "0",
                                )}:${(clamped % 60).toString().padStart(2, "0")}`,
                            );
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `linear-gradient(to right, ${gradientStops})`,
                            }}
                          />
                          {/* selected position marker */}
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow"
                            style={{ left: `${markerPct}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-3 justify-center flex-wrap">
                          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                            <span className="inline-block w-2 h-2 rounded-sm bg-slate-500/35" />{" "}
                            ผ่านแล้ว
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                            <span className="inline-block w-2 h-2 rounded-sm bg-red-400/75" />{" "}
                            ถูกจอง
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                            <span className="inline-block w-2 h-2 rounded-sm bg-indigo-500/80" />{" "}
                            ที่เลือก
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                            <span className="inline-block w-2 h-2 rounded-sm bg-slate-400/30 border border-slate-300/40" />{" "}
                            ว่าง
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border/50" />
                  <Timer className="h-3 w-3 text-muted-foreground" />
                  <div className="flex-1 h-px bg-border/50" />
                </div>

                {/* Row 3: duration picker */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2">
                    ระยะเวลา
                  </p>
                  <div
                    className={cn("grid gap-1.5", {
                      "grid-cols-2": pharmacist.consultDurations.length === 2,
                      "grid-cols-3": pharmacist.consultDurations.length === 3,
                      "grid-cols-4": pharmacist.consultDurations.length >= 4,
                    })}
                  >
                    {pharmacist.consultDurations.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const s = buildQuickSlots(
                            d,
                            d,
                            pharmacist.bookedSlots,
                          );
                          setDuration(d);
                          setSlot((s.find((x) => !x.occupied) ?? s[0]).value);
                        }}
                        className={cn(
                          "py-2 rounded-xl text-xs font-semibold border transition-all duration-200",
                          duration === d
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/25 scale-[1.02]"
                            : "bg-background border-border/50 hover:border-primary/40 hover:text-primary",
                        )}
                      >
                        {d} นาที
                      </button>
                    ))}
                  </div>
                </div>

                {/* Token breakdown */}
                <p className="text-[11px] text-center text-muted-foreground">
                  {duration} นาที × {rateNow} โทเคน/นาที ={" "}
                  <span className="font-bold text-primary">
                    {totalTokens} โทเคน
                  </span>
                </p>
              </div>

              {/* Note */}
              <div>
                <p className="text-xs font-bold mb-1.5">
                  หมายเหตุเพิ่มเติม{" "}
                  <span className="text-muted-foreground font-normal">
                    (ไม่บังคับ)
                  </span>
                </p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น อาการหรือยาที่ใช้อยู่โดยสังเขพ"
                  rows={2}
                  className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-xs resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Backend error with troubleshooting */}
              {confirmError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-destructive">
                        {confirmError}
                      </p>
                      {errorDetails && (
                        <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
                          {errorDetails}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8"
                    onClick={handleConfirm}
                    disabled={confirming}
                  >
                    {confirming ? "กำลังลองใหม่..." : "ลองใหม่"}
                  </Button>
                </div>
              )}

              {/* Confirm button */}
              <Button
                className="w-full h-12 rounded-xl gap-2 shadow-md shadow-primary/20 disabled:shadow-none"
                disabled={confirming || isOccupied || isPast}
                onClick={handleConfirm}
              >
                {confirming ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{" "}
                    กำลังจอง...
                  </>
                ) : isNowSlot ? (
                  <>
                    <Zap className="h-4 w-4" /> เริ่มปรึกษาทันที
                  </>
                ) : (
                  <>
                    <CalendarDays className="h-4 w-4" /> ยืนยันนัด{" "}
                    {selectedDateLabel} {slot} น.
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}