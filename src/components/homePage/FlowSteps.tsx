import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
const flowSteps = [
  {
    step: "1",
    title: "เปิดแอป + บอทถามอาการ",
    desc: "ตอบคำถามทีละข้อ ใช้เวลา 3–5 นาที",
  },
  {
    step: "2",
    title: "เลือกร้านยาใกล้บ้าน",
    desc: "ดูแผนที่ เปรียบเทียบรีวิว เลือกเภสัชกร",
  },
  {
    step: "3",
    title: "ส่งข้อมูลและนัดเวลา",
    desc: "เลือกเวลารับยา กดส่งข้อมูลให้ร้าน",
  },
  {
    step: "4",
    title: "ไปรับยาที่ร้าน",
    desc: "เภสัชกรเตรียมไว้แล้ว แค่แจ้งชื่อและรับยา",
  },
  {
    step: "5",
    title: "รีวิวและบันทึกประวัติ",
    desc: "ให้คะแนน ดูประวัติการปรึกษาในโปรไฟล์",
  },
];
export default function FlowSteps() {
  return (
    <section className="py-20 bg-muted/40">
      <div className="container">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-3">
            ขั้นตอน
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            ใช้งานอย่างไร?
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-4">
          {flowSteps.map((s, i) => (
            <div
              key={s.step}
              className="reveal-up flex items-start gap-5 p-5 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white font-bold text-sm">
                {s.step}
              </div>
              <div>
                <h4 className="font-bold mb-1">{s.title}</h4>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/nearby?tab=pharmacist">
            <Button size="lg" className="rounded-2xl px-10 h-14 text-base">
              เริ่มต้นตอนนี้ <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
