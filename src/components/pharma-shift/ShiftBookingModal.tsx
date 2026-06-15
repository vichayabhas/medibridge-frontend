'use client'
import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Pharmacist, profileMeta } from "./support/utils";
import { ChevronLeft, ChevronRight, Clock3, X } from "lucide-react";
import { cn, PHARMACIST_PHOTOS } from "../utility/setup";
const pharmacistPhotos=PHARMACIST_PHOTOS


interface ShiftBookingModalProps {
  showBookingModal: boolean;
  bookingPharmacist: Pharmacist | null;
  calMonth: Date;
  setCalMonth: React.Dispatch<React.SetStateAction<Date>>;
  calDays: (Date | null)[];
  shiftToday: Date;
  shiftMaxDate: Date;
  shiftIsToday: (d: Date) => boolean;
  SHIFT_MONTH_NAMES: string[];
  SHIFT_DAY_SHORT: string[];
  shiftDateKey: (d: Date) => string;
  bookedShiftDates: Set<string>;
  selectedShiftDate: string | null;
  setSelectedShiftDate: React.Dispatch<React.SetStateAction<string | null>>;
  selectedShiftTime: string;
  setSelectedShiftTime: React.Dispatch<React.SetStateAction<string>>;
  handleConfirmBooking: (date: string, time: string) => void;
  setShowBookingModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ShiftBookingModal(props: ShiftBookingModalProps) {
  const {
    showBookingModal,
    bookingPharmacist,
    calMonth,
    setCalMonth,
    calDays,
    shiftToday,
    shiftMaxDate,
    shiftIsToday,
    SHIFT_MONTH_NAMES,
    SHIFT_DAY_SHORT,
    shiftDateKey,
    bookedShiftDates,
    selectedShiftDate,
    setSelectedShiftDate,
    selectedShiftTime,
    setSelectedShiftTime,
    handleConfirmBooking,
    setShowBookingModal,
  } = props;

  if (!showBookingModal || !bookingPharmacist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md overflow-hidden border-slate-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-950">เชิญเข้ากะ</h2>
          <button
            onClick={() => setShowBookingModal(false)}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <CardContent className="space-y-4 p-6">
          {/* Pharmacist info */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <Avatar
              src={pharmacistPhotos[bookingPharmacist._id]}
              name={bookingPharmacist.name}
              size="lg"
            />
            <div>
              <p className="font-bold text-slate-950">{bookingPharmacist.name}</p>
              <p className="text-xs text-slate-500">{profileMeta[bookingPharmacist._id]?.hourlyRate ?? "$60/ชม."}</p>
            </div>
          </div>

          {/* Date selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">เลือกวันเข้ากะ</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                  disabled={calMonth.getFullYear() === shiftToday.getFullYear() && calMonth.getMonth() === shiftToday.getMonth()}
                  className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />
                </button>
                <span className="text-xs font-bold text-slate-600 min-w-[90px] text-center">
                  {SHIFT_MONTH_NAMES[calMonth.getMonth()].slice(0,3)} {calMonth.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                  className="p-1 rounded-md hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {SHIFT_DAY_SHORT.map((n) => (
                <div key={n} className="text-center text-[10px] font-semibold text-slate-400 py-0.5">{n}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((d, index) => {
                if (!d) return <div key={index} />;
                const isPastDay = d < shiftToday;
                const isFutureDay = d > shiftMaxDate;
                const disabled = isPastDay || isFutureDay;
                const key = shiftDateKey(d);
                const isBooked = bookedShiftDates.has(key);
                const isSelected = selectedShiftDate === key;
                const todayCell = shiftIsToday(d);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (!disabled && !isBooked) setSelectedShiftDate(isSelected ? null : key);
                    }}
                    disabled={disabled || isBooked}
                    className={cn(
                      "relative flex items-center justify-center rounded-lg border-2 py-1.5 text-center text-xs font-black transition",
                      !disabled && !isBooked && !isSelected && "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50",
                      !disabled && !isBooked && isSelected && "border-sky-400 bg-sky-100 text-sky-900",
                      isBooked && "border-amber-100 bg-amber-50 text-amber-400 cursor-not-allowed",
                      disabled && !isBooked && "border-transparent text-slate-300 cursor-not-allowed"
                    )}
                  >
                    <span className={cn(todayCell && "text-sky-600 underline underline-offset-2")}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time selection */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">เวลาเข้ากะ</label>
            <div className="space-y-2">
              {["08:00-16:00", "12:00-20:00", "16:00-00:00", "00:00-08:00"].map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedShiftTime(time)}
                  className={cn(
                    "w-full rounded-xl border-2 px-4 py-2.5 text-left text-sm font-semibold transition",
                    selectedShiftTime === time
                      ? "border-sky-400 bg-sky-50 text-sky-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                  )}
                >
                  <Clock3 className="mb-1 inline-block h-4 w-4 mr-2" />
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedShiftDate && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-[0.15em]">สรุปการจอง</p>
              <p className="mt-1.5 text-sm font-bold text-emerald-900">
                {bookingPharmacist.name} • {selectedShiftDate} • {selectedShiftTime}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowBookingModal(false)}
            >
              ยกเลิก
            </Button>
            <Button
              className="flex-1"
              disabled={!selectedShiftDate}
              onClick={() => handleConfirmBooking(selectedShiftDate ?? "", selectedShiftTime)}
            >
              ยืนยันการเชิญ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
