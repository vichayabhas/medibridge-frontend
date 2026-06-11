"use client";
import {
  CalendarDays,
  CheckCircle2,
  Globe2,
  MessageCircle,
  Phone,
  Pill,
  Star,
  Video,
  X,
} from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import { cn } from "../utility/setup";
import { Badge } from "../ui/badge";
import { PharmacistFilters } from "./NearbyPage";
const ALL_SPECIALTIES = [
  "ยาสามัญประจำบ้าน",
  "โรคเรื้อรัง",
  "เวชสำอาง",
  "สมุนไพรไทย",
  "ยาเด็ก",
  "ยาผู้สูงอายุ",
  "อาหารเสริม",
  "การคุมกำเนิด",
  "สุขภาพจิต",
  "อายุรกรรม",
];

const ALL_LANGUAGES = ["ไทย", "English", "中文", "日本語", "한국어"];

const EXPERIENCE_OPTIONS = [
  { value: 0, label: "ทั้งหมด" },
  { value: 1, label: "1+ ปี" },
  { value: 3, label: "3+ ปี" },
  { value: 5, label: "5+ ปี" },
  { value: 10, label: "10+ ปี" },
];

const RATING_OPTIONS = [
  { value: 0, label: "ทั้งหมด" },
  { value: 4, label: "4+ ดาว" },
  { value: 4.5, label: "4.5+ ดาว" },
];

const CONSULT_METHOD_OPTIONS = [
  { key: "chat", label: "แชท", icon: MessageCircle },
  { key: "phone", label: "โทร", icon: Phone },
  { key: "video", label: "วิดีโอ", icon: Video },
] as const;

export default function FilterPanel({
  filters,
  onChange,
  onClose,
  onClear,
}: {
  filters: PharmacistFilters;
  onChange: (f: PharmacistFilters) => void;
  onClose: () => void;
  onClear: () => void;
}) {
  const toggleSpecialty = (s: string) => {
    const next = filters.specialties.includes(s)
      ? filters.specialties.filter((x) => x !== s)
      : [...filters.specialties, s];
    onChange({ ...filters, specialties: next });
  };

  const toggleLanguage = (l: string) => {
    const next = filters.languages.includes(l)
      ? filters.languages.filter((x) => x !== l)
      : [...filters.languages, l];
    onChange({ ...filters, languages: next });
  };

  const toggleMethod = (m: "chat" | "phone" | "video") => {
    const next = filters.consultMethods.includes(m)
      ? filters.consultMethods.filter((x) => x !== m)
      : [...filters.consultMethods, m];
    onChange({ ...filters, consultMethods: next });
  };

  const hasAnyFilter =
    filters.specialties.length > 0 ||
    filters.languages.length > 0 ||
    filters.minExperience > 0 ||
    filters.minRating > 0 ||
    filters.consultMethods.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85svh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50 shrink-0">
          <div>
            <h3 className="font-bold text-base">ตัวกรองเภสัชกร</h3>
            <p className="text-[11px] text-muted-foreground">
              เลือกเงื่อนไขเพื่อค้นหาเภสัชกรที่ตรงกับความต้องการ
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

        {/* Filter content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Specialty filter */}
          <div>
            <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
              <Pill className="h-3.5 w-3.5 text-primary" />
              ความเชี่ยวชาญ
              {filters.specialties.length > 0 && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {filters.specialties.length}
                </Badge>
              )}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SPECIALTIES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialty(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all",
                    filters.specialties.includes(s)
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-muted-foreground border-border/50 hover:border-primary/40",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Consult method filter */}
          <div>
            <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-primary" />
              ช่องทางปรึกษา
              {filters.consultMethods.length > 0 && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {filters.consultMethods.length}
                </Badge>
              )}
            </h4>
            <div className="flex gap-2">
              {CONSULT_METHOD_OPTIONS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleMethod(key)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
                    filters.consultMethods.includes(key)
                      ? "border-primary bg-primary/8"
                      : "border-border/40 bg-muted/30 hover:border-primary/30",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      filters.consultMethods.includes(key)
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      filters.consultMethods.includes(key)
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Language filter */}
          <div>
            <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
              <Globe2 className="h-3.5 w-3.5 text-primary" />
              ภาษา
              {filters.languages.length > 0 && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {filters.languages.length}
                </Badge>
              )}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {ALL_LANGUAGES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => toggleLanguage(l)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all",
                    filters.languages.includes(l)
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-muted-foreground border-border/50 hover:border-primary/40",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Experience filter */}
          <div>
            <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              ประสบการณ์
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    onChange({ ...filters, minExperience: opt.value })
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all",
                    filters.minExperience === opt.value
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-muted-foreground border-border/50 hover:border-primary/40",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating filter */}
          <div>
            <h4 className="text-xs font-bold mb-3 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-primary" />
              คะแนนรีวิว
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange({ ...filters, minRating: opt.value })}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    filters.minRating === opt.value
                      ? "bg-primary text-white border-primary"
                      : "bg-background text-muted-foreground border-border/50 hover:border-primary/40",
                  )}
                >
                  {opt.value > 0 && <Star className="h-3 w-3 fill-current" />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 px-5 py-4 border-t border-border/50 bg-muted/20 flex items-center gap-3">
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-xl text-xs"
            onClick={onClear}
            disabled={!hasAnyFilter}
          >
            ล้างตัวกรอง
          </Button>
          <Button
            className="flex-1 h-10 rounded-xl text-xs gap-1.5"
            onClick={onClose}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            เสร็จสิ้น
          </Button>
        </div>
      </div>
    </div>
  );
}
