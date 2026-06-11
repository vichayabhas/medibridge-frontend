"use client";
import React from "react";
import { Button } from "../ui/button";
import {
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  Coins,
  Globe2,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Timer,
  Video,
} from "lucide-react";
import { PharmacistType } from "../../../interface";
import { Avatar } from "../ui/avatar";
import { PHARMACIST_PHOTOS } from "./NearbyPage";
import AvailabilityHeatmap from "./AvailabilityHeatmap";
export default function PharmacistDetailPanel({
  pharmacist,
  onBook,
}: {
  pharmacist: PharmacistType;
  onBook: () => void;
}) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex gap-4">
          <Avatar
            src={PHARMACIST_PHOTOS[pharmacist._id]}
            name={pharmacist.name}
            size="xl"
            className="ring-2 ring-background shadow-lg shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h2 className="font-bold text-base leading-snug">
                {pharmacist.name}
              </h2>
              <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
            </div>
            <p className="text-xs text-primary font-semibold mb-0.5">
              {pharmacist.specialties[0]}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              <CalendarDays className="h-3 w-3 inline mr-1" />
              พร้อมให้บริการ:{" "}
              <span className="text-foreground font-semibold">
                {pharmacist.nextAvailable}
              </span>
            </p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {pharmacist.bio}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
            <div className="flex items-center gap-1 mb-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold">{pharmacist.rating}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {pharmacist.reviewCount} รีวิว
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
            <div className="flex items-center gap-1 mb-1">
              <Globe2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-bold">
                {pharmacist.languages.length}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {pharmacist.languages.join(", ")}
            </p>
          </div>
        </div>

        {/* Tokens per min + session durations */}
        <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
          <p className="text-[11px] text-muted-foreground mb-2">
            อัตราโทเคน (ต่อนาที)
          </p>
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {(["chat", "phone", "video"] as const).map((k) => {
              const icons = { chat: MessageCircle, phone: Phone, video: Video };
              const labels = { chat: "แชท", phone: "โทร", video: "วิดีโอ" };
              const Icon = icons[k];
              return (
                <div
                  key={k}
                  className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/40 border border-border/40 py-1.5"
                >
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {labels[k]}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Coins className="h-3 w-3 text-primary" />
                    <span className="text-xs font-bold text-primary">
                      {pharmacist.methodRates[k]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <Timer className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-[11px] text-muted-foreground">
              ช่วงเวลาปรึกษา:
            </span>
            <div className="flex gap-1 flex-wrap">
              {pharmacist.consultDurations.map((d) => (
                <span
                  key={d}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold"
                >
                  {d} นาที
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Availability heatmap */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold">ตารางว่าง 7 วันข้างหน้า</span>
          </div>
          <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
            <AvailabilityHeatmap pharmacist={pharmacist} />
          </div>
        </div>

        {/* Workplace & License — Legal Compliance */}
        <div className="rounded-xl border-2 border-success/30 bg-gradient-to-br from-success/8 via-background to-success/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/15 shrink-0">
              <ShieldCheck className="h-4 w-4 text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-success mb-0.5">
                ที่ทำงาน (ลิขสิทธิ์และกฎหมาย)
              </p>
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-xs font-semibold text-foreground">
                  {pharmacist.workplace}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-3 w-3 text-success shrink-0" />
                <span className="text-[10px] text-muted-foreground">
                  ใบอนุญาต:
                  <span
                    title="หนังสือรับรองจากสำนัก งานคณะกรรมการเภสัชศาสตร์แห่งประเทศไทย ที่ยืนยันว่าบุคคลนี้มีคุณวุฒิและสิทธิ์ในการประกอบวิชาชีพเภสัชกรตามกฎหมายไทย"
                    className="font-bold text-foreground cursor-help border-b border-dotted border-success/50 hover:border-success"
                  >
                    {pharmacist.licenseNo}
                  </span>
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1.5 leading-tight flex items-start gap-1">
                <span className="shrink-0">ℹ️</span>
                <span>
                  ยืนยันว่าเป็นเภสัชกรที่ได้รับใบอนุญาตตามกฎหมายไทย
                  (ตามพระราชบัญญัติวิชาชีพเภสัชกร พ.ศ. 2560)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="space-y-2">
          <Button
            className="w-full h-11 rounded-xl gap-2 shadow-md shadow-primary/20"
            onClick={onBook}
          >
            <CalendarDays className="h-4 w-4" />
            จองปรึกษาเภสัชกร
          </Button>
        </div>

        {/* Quick tips */}
        <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
          <p className="text-xs font-bold mb-2">เคล็ดลับก่อนปรึกษา</p>
          <ul className="space-y-1.5">
            {[
              "เตรียมรายชื่อยาและขนาดยาที่ใช้อยู่",
              "แจ้งประวัติการแพ้ยาหรือผลข้างเคียงที่เคยเกิด",
              "นำข้อมูลประกันสุขภาพมาด้วยหากต้องการเบิก",
            ].map((tip) => (
              <li
                key={tip}
                className="flex items-start gap-2 text-[11px] text-muted-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
