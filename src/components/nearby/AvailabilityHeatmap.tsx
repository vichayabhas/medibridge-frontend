"use client";
import React from "react";
import { PharmacistAvailability, PharmacistType } from "../../../interface";
import { cn } from "../utility/setup";
type MinuteWindow = { start: number; end: number };
function mergeWindows(windows: MinuteWindow[]) {
  if (windows.length <= 1) return windows;
  const sorted = [...windows].sort((a, b) => a.start - b.start);
  const merged: MinuteWindow[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = sorted[i];
    if (cur.start <= prev.end) {
      prev.end = Math.max(prev.end, cur.end);
      continue;
    }
    merged.push({ ...cur });
  }
  return merged;
}
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
function getWorkingWindow(
  availability: PharmacistAvailability,
  isWeekend: boolean,
): MinuteWindow {
  if (availability === "offline") {
    return isWeekend
      ? { start: 13 * 60, end: 16 * 60 }
      : { start: 12 * 60, end: 17 * 60 };
  }
  if (availability === "busy") {
    return isWeekend
      ? { start: 10 * 60, end: 18 * 60 }
      : { start: 9 * 60, end: 19 * 60 };
  }
  return isWeekend
    ? { start: 9 * 60, end: 19 * 60 }
    : { start: 8 * 60 + 30, end: 20 * 60 };
}
function toMins(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
const THAI_DAY_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
function buildDayBookings(
  pharmacist: PharmacistType,
  dayOffset: number,
  isWeekend: boolean,
  sessionDuration: number,
  idSeed: number,
) {
  const baseSlots = pharmacist.bookedSlots.map(toMins).sort((a, b) => a - b);
  if (baseSlots.length === 0) return [] as MinuteWindow[];

  const countFactorByStatus: Record<string, number> = {
    online: 0.65,
    busy: 0.9,
    offline: 1.1,
  };

  const statusFactor = countFactorByStatus[pharmacist.availability] ?? 1;
  const weekendFactor = isWeekend ? 0.85 : 1;
  const targetCount =
    dayOffset === 0
      ? baseSlots.length
      : clamp(
          Math.round(baseSlots.length * statusFactor * weekendFactor),
          1,
          baseSlots.length + 2,
        );

  const windows: MinuteWindow[] = [];
  for (let i = 0; i < targetCount; i++) {
    const src = baseSlots[i % baseSlots.length];
    const shiftA = (((idSeed + dayOffset * 13 + i * 7) % 11) - 5) * 5;
    const shiftB = dayOffset * (isWeekend ? 6 : 10);
    const shifted = clamp(
      src + shiftA + shiftB,
      8 * 60,
      21 * 60 - sessionDuration,
    );
    windows.push({ start: shifted - 1, end: shifted + sessionDuration + 1 });
  }

  if (
    pharmacist.availability !== "online" &&
    dayOffset > 0 &&
    dayOffset % 2 === 0
  ) {
    const extraStart = clamp(
      16 * 60 + ((idSeed + dayOffset) % 5) * 5,
      8 * 60,
      21 * 60 - sessionDuration,
    );
    windows.push({
      start: extraStart - 1,
      end: extraStart + sessionDuration + 1,
    });
  }

  return mergeWindows(windows);
}
export default function AvailabilityHeatmap({
  pharmacist,
}: {
  pharmacist: PharmacistType;
}) {
  const slots = ["09", "11", "13", "15", "17"];
  const dayColumns = React.useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() + idx);
      return {
        offset: idx,
        label: THAI_DAY_SHORT[d.getDay()],
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      };
    });
  }, []);

  // available[row][col]: true = at least some free time in that 2-hr block, false = fully unavailable
  const available = React.useMemo(() => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const avgDuration = Math.round(
      pharmacist.consultDurations.reduce((sum, d) => sum + d, 0) /
        pharmacist.consultDurations.length,
    );
    const sessionDuration = Math.max(5, avgDuration);
    const lunchBreak: MinuteWindow = { start: 12 * 60, end: 13 * 60 };
    const timeStep = 15;
    const bucketSize = 120;

    const idSeed = pharmacist._id
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

    return slots.map((slot, rowIdx) => {
      const blockStart = Number(slot) * 60;
      const blockEnd = blockStart + bucketSize;

      return dayColumns.map((day) => {
        const workWindow = getWorkingWindow(
          pharmacist.availability,
          day.isWeekend,
        );
        const bookedWindows = buildDayBookings(
          pharmacist,
          day.offset,
          day.isWeekend,
          sessionDuration,
          idSeed + rowIdx * 3,
        );

        for (let t = blockStart; t < blockEnd; t += timeStep) {
          const sampleMid = t + timeStep / 2;
          const outsideWorkingHours =
            sampleMid < workWindow.start || sampleMid >= workWindow.end;
          const onLunchBreak =
            sampleMid >= lunchBreak.start && sampleMid < lunchBreak.end;
          const pastLocked = day.offset === 0 && sampleMid < nowMins + 5;
          const occupiedByBooking = bookedWindows.some(
            (w) => sampleMid >= w.start && sampleMid < w.end,
          );
          if (
            !outsideWorkingHours &&
            !onLunchBreak &&
            !pastLocked &&
            !occupiedByBooking
          ) {
            return true; // at least one free sample found
          }
        }
        return false;
      });
    });
  }, [pharmacist, dayColumns]);

  return (
    <div>
      <div className="flex gap-1 mb-1 pl-6">
        {dayColumns.map((d, idx) => (
          <div
            key={`${d.label}-${idx}`}
            className="flex-1 text-center text-[9px] text-muted-foreground font-semibold"
          >
            {d.label}
          </div>
        ))}
      </div>
      {slots.map((slot, si) => (
        <div key={slot} className="flex items-center gap-1 mb-1">
          <span className="text-[9px] text-muted-foreground w-5 shrink-0">
            {slot}:00
          </span>
          {dayColumns.map((d, di) => (
            <div
              key={`${d.label}-${di}`}
              className={cn(
                "flex-1 h-4 rounded-sm",
                available[si][di] ? "bg-success/60" : "bg-border/30",
              )}
            />
          ))}
        </div>
      ))}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <div className="h-2.5 w-2.5 rounded-sm bg-success/60" />
        <span className="text-[9px] text-muted-foreground">ว่าง</span>
        <div className="h-2.5 w-2.5 rounded-sm bg-border/30 ml-1" />
        <span className="text-[9px] text-muted-foreground">ไม่ว่าง</span>
      </div>
    </div>
  );
}
