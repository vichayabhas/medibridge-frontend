import { ArrowRight, BadgeCheck, Lock, MapPin, Sparkles } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1600&q=80&auto=format&fit=crop";
const stats = [
  { value: "24 ชม.", label: "พร้อมให้บริการตลอดเวลา" },
  { value: "6+", label: "ร้านยาพันธมิตรที่ร่วมระบบ" },
  { value: "4.8", label: "คะแนนความพึงพอใจเฉลี่ย" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,hsl(204_55%_98%),hsl(0_0%_100%)_72%)] pt-24 md:pt-28">
      <div className="container relative grid min-h-[calc(100svh-4rem)] items-center gap-10 pb-12 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:pb-16">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/15 bg-white px-3.5 py-2 text-xs font-bold text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">MediBridge — เชื่อมคนไข้กับเภสัชกร</span>
          </div>
          <h1 className="max-w-[12ch] text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            ปรึกษาเภสัชกร
            <span className="block text-primary">ก่อนถึงร้านยา</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">
            สรุปอาการ เลือกร้านยาใกล้คุณ และส่งข้อมูลให้เภสัชกรล่วงหน้าใน flow
            เดียว เพื่อให้การรับคำแนะนำเรื่องยาเป็นระบบและไม่ต้องเล่าซ้ำ
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground/70 shadow-sm">
              <BadgeCheck className="h-3.5 w-3.5 text-success" />
              เภสัชกรมีใบอนุญาต
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-foreground/70 shadow-sm">
              <Lock className="h-3.5 w-3.5 text-primary" />
              ขอความยินยอมก่อนส่ง
            </span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/nearby?tab=pharmacist">
                เริ่มปรึกษา
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full bg-white/80 sm:w-auto"
            >
              <Link href="/nearby">
                <MapPin className="h-4 w-4" />
                ดูร้านยาใกล้ฉัน
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid max-w-xl divide-y divide-border/70 rounded-2xl border border-border/70 bg-white/80 shadow-[var(--shadow-card)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((item) => (
              <div key={item.label} className="p-4">
                <p className="text-xl font-bold text-foreground sm:text-2xl">
                  {item.value}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[1.75rem] border border-white bg-white p-2 shadow-[var(--shadow-elevated)]">
            <div className="relative h-[min(72svh,620px)] min-h-[440px] overflow-hidden rounded-[1.35rem] bg-muted md:h-[min(68vh,640px)] md:min-h-[560px]">
              <img
                src={HERO_IMAGE}
                alt="เภสัชกรกำลังให้คำแนะนำในร้านยา"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(215_28%_13%/0.06),hsl(215_28%_13%/0.28))]" />
              <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                <div className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold text-success shadow-md">
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    เภสัชกรออนไลน์
                  </div>
                  <h2 className="sr-only">
                    เลือกร้านยาใกล้บ้าน แล้วคุยกับเภสัชกรได้ตรงประเด็น
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
