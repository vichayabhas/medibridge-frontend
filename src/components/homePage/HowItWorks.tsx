import React from "react";
import { Card, CardContent } from "../ui/card";
import { BadgeCheck, MapPin, MessageCircle } from "lucide-react";
const steps = [
  {
    icon: MessageCircle,
    title: "เล่าอาการให้บอทช่วยสรุป",
    desc: "กรอกอาการ ยาที่ใช้อยู่ โรคประจำตัว และประวัติแพ้ยาเป็นขั้นตอนสั้นๆ",
  },
  {
    icon: MapPin,
    title: "เลือกร้านยาใกล้บ้าน",
    desc: "ดูสถานะเภสัชกร รีวิว ระยะทาง และเวลาที่สะดวกสำหรับไปรับคำแนะนำ",
  },
  {
    icon: BadgeCheck,
    title: "ส่งข้อมูลให้เภสัชกร",
    desc: "เภสัชกรเห็นข้อมูลล่วงหน้า เตรียมคำแนะนำและลดการเล่าซ้ำที่หน้าร้าน",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Workflow
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            ขั้นตอนสั้นๆ ก่อนพบเภสัชกร
          </h2>
          <p className="mt-3 text-muted-foreground">
            เพียงไม่กี่ขั้นตอน
            คุณก็สามารถรับคำแนะนำจากเภสัชกรได้อย่างรวดเร็วและมีประสิทธิภาพ
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="h-full border-border/60">
              <CardContent className="flex h-full flex-col p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-black leading-none text-primary/10">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold leading-7">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {step.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
