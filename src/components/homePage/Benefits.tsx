import { Clock, Shield, Lock } from "lucide-react";
import React from "react";
const benefits = [
  {
    icon: Shield,
    title: "ปลอดภัยกว่าแชททั่วไป",
    desc: "ข้อมูลถูกจัดเป็นแบบฟอร์มอ่านง่าย พร้อมแจ้งข้อจำกัดว่าไม่ใช่การวินิจฉัยโรค",
  },
  {
    icon: Clock,
    title: "ลดเวลารอที่ร้าน",
    desc: "เภสัชกรเห็นบริบทก่อนคุณไปถึง ทำให้คุยต่อได้ตรงประเด็นกว่าเดิม",
  },
  {
    icon: Lock,
    title: "ควบคุมข้อมูลได้",
    desc: "ส่งข้อมูลให้เฉพาะร้านที่เลือก และออกแบบ flow ให้ขอความยินยอมก่อนเสมอ",
  },
];

export default function Benefits() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border/60 bg-background p-6"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
