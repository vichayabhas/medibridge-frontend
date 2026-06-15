import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Store,
  Video,
  Volume2,
  PencilLine,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Pharmacist, PharmacistMeta } from "./support/utils";
import type { SidebarDraft } from "./support/types";
import React from "react";
import { cn } from "../utility/setup";

type PharmacistSidebarProps = {
  selectedPharmacist: Pharmacist;
  selectedMeta: PharmacistMeta;
  selectedPharmacy: { name: string };
  selectedAvailabilityTone: "success" | "warning" | "muted";
  selectedSidebarDraft: SidebarDraft;
  isSidebarEditing: boolean;
  setIsSidebarEditing: (editing: boolean) => void;
  resetSidebarDraft: () => void;
  updateSidebarDraft: (patch: Partial<SidebarDraft>) => void;
  pharmacistRating: {
    average_rating: number;
    review_count: number;
    reviews: Array<{ rating: number; comment: string; user_name: string; created_at: string }>;
  } | null;
  pharmacistPhotos: Record<string, string>;
  SHIFT_DAY_SHORT: string[];
};

export default function PharmacistSidebar(props: PharmacistSidebarProps) {
  const {
    selectedPharmacist,
    selectedMeta,
    selectedAvailabilityTone,
    selectedSidebarDraft,
    isSidebarEditing,
    setIsSidebarEditing,
    resetSidebarDraft,
    updateSidebarDraft,
    pharmacistRating,
    pharmacistPhotos,
    SHIFT_DAY_SHORT,
  } = props;

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">ข้อมูลด้านขวา</p>
          <h3 className="text-sm font-bold text-slate-900">โปรไฟล์ของคุณที่ผู้ป่วยเห็น</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={isSidebarEditing ? "default" : "outline"}
            onClick={() => setIsSidebarEditing(!isSidebarEditing)}
            className="h-8 gap-1.5 rounded-xl px-3 text-xs"
          >
            <PencilLine className="h-3.5 w-3.5" />
            {isSidebarEditing ? "เสร็จสิ้น" : "แก้ไข"}
          </Button>
          {isSidebarEditing && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={resetSidebarDraft}
              className="h-8 rounded-xl px-2 text-xs text-slate-500 hover:text-slate-900"
            >
              รีเซ็ต
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Header Profile */}
        <div className="flex gap-4">
          <Avatar
            src={pharmacistPhotos[selectedPharmacist._id]}
            name={selectedPharmacist.name}
            size="xl"
            className="ring-2 ring-slate-100 shadow-lg shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 mb-1">
                <h2 className="font-bold text-base leading-snug text-slate-950 truncate">{selectedPharmacist.name}</h2>
                <BadgeCheck className="h-4 w-4 text-sky-500 shrink-0" />
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <p className="font-bold text-sm">
                  {pharmacistRating ? pharmacistRating.average_rating.toFixed(1) : selectedPharmacist.rating.toFixed(1)}
                </p>
                <p className="text-xs text-slate-500">
                  ({pharmacistRating ? pharmacistRating.review_count : selectedPharmacist.reviewCount})
                </p>
              </div>
            </div>
            <p className="text-xs text-sky-600 font-semibold mb-1 truncate">{selectedSidebarDraft.specialties.split(",")[0] || selectedPharmacist.specialties?.[0] || "Pharmacist"}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <CalendarDays className="h-3 w-3" />
              <span>ใบอนุญาต:</span>
              <span className="font-bold text-slate-700">{selectedPharmacist.licenseNo}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant={selectedAvailabilityTone} dot={selectedPharmacist.availability} className="text-[10px] px-2 py-0.5">
                {selectedMeta.title}
              </Badge>
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        {isSidebarEditing ? (
           <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">ความเชี่ยวชาญ (คั่นด้วยจุลภาค)</label>
                <textarea
                  value={selectedSidebarDraft.specialties}
                  onChange={(event) => updateSidebarDraft({ specialties: event.target.value })}
                  rows={2}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-700 outline-none transition focus:border-sky-300 focus:bg-white"
                  placeholder="เช่น ยาสามัญประจำบ้าน, โรคเรื้อรัง"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">ประสบการณ์ (ปี)</span>
                  <Input
                    value={selectedSidebarDraft.experience}
                    onChange={(e) => updateSidebarDraft({ experience: e.target.value })}
                    className="h-9 rounded-xl bg-slate-50 px-3 text-xs font-bold text-slate-950"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">ที่ทำงานหลัก</span>
                  <Input
                    value={selectedSidebarDraft.workplace}
                    onChange={(e) => updateSidebarDraft({ workplace: e.target.value })}
                    className="h-9 rounded-xl bg-slate-50 px-3 text-xs font-medium text-slate-950"
                  />
                </label>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">อัตราค่าบริการ (โทเคน/นาที)</p>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-center text-slate-400">Chat</span>
                    <Input
                      value={selectedSidebarDraft.chatRate}
                      onChange={(e) => updateSidebarDraft({ chatRate: e.target.value })}
                      className="h-8 rounded-lg bg-slate-50 px-2 text-center text-xs font-bold text-slate-950"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-center text-slate-400">Phone</span>
                    <Input
                      value={selectedSidebarDraft.phoneRate}
                      onChange={(e) => updateSidebarDraft({ phoneRate: e.target.value })}
                      className="h-8 rounded-lg bg-slate-50 px-2 text-center text-xs font-bold text-slate-950"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[10px] text-center text-slate-400">Video</span>
                    <Input
                      value={selectedSidebarDraft.videoRate}
                      onChange={(e) => updateSidebarDraft({ videoRate: e.target.value })}
                      className="h-8 rounded-lg bg-slate-50 px-2 text-center text-xs font-bold text-slate-950"
                    />
                  </label>
                </div>
              </div>
           </div>
        ) : (
           <p className="text-xs text-slate-600 leading-relaxed border-l-2 border-sky-400 pl-3">
             {selectedMeta.specialtyLine}
           </p>
        )}

        {/* Stats Row (Reviews, Languages) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-1 mb-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span className="text-sm font-bold text-slate-900">{pharmacistRating ? pharmacistRating.average_rating.toFixed(1) : selectedPharmacist.rating.toFixed(1)}</span>
            </div>
            <p className="text-[11px] text-slate-500">{pharmacistRating ? pharmacistRating.review_count : selectedPharmacist.reviewCount} รีวิว</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Volume2 className="h-3.5 w-3.5 text-sky-500" />
              <span className="text-sm font-bold text-slate-900">ตอบกลับ</span>
            </div>
            <p className="text-[11px] text-slate-500">{selectedMeta.responseTime}</p>
          </div>
        </div>

        {/* Tokens per min grid matching NearbyPage */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-[11px] font-bold text-slate-500 mb-2.5">อัตราโทเคน (ต่อนาที)</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-white border border-slate-100 py-2 shadow-sm">
              <MessageCircle className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-medium">แชท</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-black text-sky-600">{selectedSidebarDraft.chatRate}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-white border border-slate-100 py-2 shadow-sm">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-medium">โทร</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-black text-sky-600">{selectedSidebarDraft.phoneRate}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-white border border-slate-100 py-2 shadow-sm">
              <Video className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] text-slate-500 font-medium">วิดีโอ</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-black text-sky-600">{selectedSidebarDraft.videoRate}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-500 font-medium">ช่วงเวลาปกติ:</span>
            <div className="flex gap-1.5 flex-wrap">
              {selectedPharmacist.consultDurations.map((d) => (
                <span key={d} className="text-[10px] px-1.5 py-0.5 rounded-md bg-sky-100/50 text-sky-700 font-bold">{d} นาที</span>
              ))}
            </div>
          </div>
        </div>

        {/* Specialties / Tags Map */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 mb-2">ความเชี่ยวชาญ</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedSidebarDraft.specialties
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => (
                <Badge key={s} variant="outline" className="border-slate-200 bg-white text-[10px] text-slate-700 px-2 py-0.5">
                  {s}
                </Badge>
              ))}
          </div>
        </div>

        {/* Availability Heatmap (7 days) */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <CalendarDays className="h-3.5 w-3.5 text-sky-500" />
            <span className="text-xs font-bold text-slate-900">ตารางกะล่วงหน้า (7 วัน)</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <div className="space-y-2">
              <div className="flex gap-1 pl-7">
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(); d.setDate(d.getDate() + i);
                  return (
                    <div key={i} className="flex-1 text-center">
                      <div className="text-[8px] text-slate-400 uppercase font-bold">{SHIFT_DAY_SHORT[d.getDay()]}</div>
                    </div>
                  );
                })}
              </div>
              {["09:00", "12:00", "15:00", "18:00"].map((slot) => (
                <div key={slot} className="flex items-center gap-1.5">
                  <span className="text-[9px] text-slate-400 w-6 shrink-0 font-medium text-right">{slot.split(":")[0]}</span>
                  {Array.from({ length: 7 }, (_, dayIdx) => {
                    const level = selectedPharmacist.availability === "offline" ? 3 : dayIdx === 0 ? 0 : 1; 
                    const colors = ["bg-slate-200", "bg-emerald-300", "bg-amber-300", "bg-rose-200"];
                    return (
                      <div
                        key={`${slot}-${dayIdx}`}
                        className={cn("flex-1 h-3 rounded-[3px]", colors[level])}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Compliance Box */}
        <div className="rounded-2xl border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 shrink-0">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-emerald-700 mb-1">ลิขสิทธิ์และประวัติวิชาชีพ</p>
              <div className="flex items-center gap-2 mb-1.5">
                <Store className="h-3 w-3 text-emerald-600/70 shrink-0" />
                <span className="text-xs font-semibold text-slate-900">{selectedSidebarDraft.workplace || "ระบุที่ทำงาน"}</span>
              </div>
              <div className="flex justify-between items-center bg-white/60 rounded-lg px-2 py-1.5 border border-emerald-100/50">
                <span className="text-[10px] font-medium text-slate-500">ใบอนุญาตเภสัชกรรม:</span>
                <span className="text-[11px] font-bold text-slate-800 tracking-wider">
                  {selectedPharmacist.licenseNo}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
