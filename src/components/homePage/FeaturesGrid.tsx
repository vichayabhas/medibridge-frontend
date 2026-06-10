import React from "react";
import { Card, CardContent } from "../ui/card";
import {
  Clock,
  MapPin,
  MessageCircle,
  Package,
  Send,
  Star,
} from "lucide-react";
const features = [
  {
    icon: MessageCircle,
    title: "แชทบอทคัดกรองอาการ",
    desc: "บอทถามทีละข้อ รวบรวมชื่อ อาการ โรคประจำตัว ยาที่กิน และข้อมูลแพ้ยา แล้วสรุปให้เภสัชกรในรูปแบบที่ชัดเจน",
    badge: "AI-Powered",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: MapPin,
    title: "ค้นหาร้านยาใกล้เคียง",
    desc: "แผนที่แสดงร้านยาพันธมิตรในรัศมีใกล้บ้าน เรียงตามระยะทาง พร้อมสถานะออนไลน์ของเภสัชกร",
    badge: "Leaflet Map",
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
  },
  {
    icon: Send,
    title: "ส่งข้อมูลล่วงหน้า",
    desc: "ส่งสรุปอาการไปให้ร้านยาที่เลือก เภสัชกรเห็นข้อมูลก่อน เตรียมยาล่วงหน้า ไม่ต้องรอเล่าซ้ำที่ร้าน",
    badge: "Handoff",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Clock,
    title: "นัดรับยา",
    desc: "เลือกเวลารับยาที่สะดวก เภสัชกรยืนยันและเตรียมยาให้พร้อมก่อนคุณมาถึง",
    badge: "Scheduling",
    color: "text-secondary",
    bg: "bg-secondary/10",
    border: "border-secondary/20",
  },
  {
    icon: Star,
    title: "รีวิวหลังใช้บริการ",
    desc: "ให้คะแนนและรีวิวเภสัชกรหลังรับยา ช่วยให้ชุมชนเลือกผู้เชี่ยวชาญที่ดีที่สุด",
    badge: "Reviews",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  {
    icon: Package,
    title: "บทความสุขภาพ",
    desc: "บทความจากเภสัชกรและ AI เกี่ยวกับสินค้า รีวิวยา และเคล็ดลับสุขภาพ",
    badge: "Articles",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
];
export default function FeaturesGrid() {
  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-3">
            ฟีเจอร์
          </p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            สิ่งที่ MediBridge มีให้
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card
              key={f.title}
              className="reveal-up group hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/8 transition-all duration-500 border-border/50"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <CardContent className="p-7">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.bg} border ${f.border} mb-5 group-hover:scale-110 transition-transform duration-500`}
                >
                  <f.icon className={`h-6 w-6 ${f.color}`} />
                </div>
                <div className="flex items-start justify-between mb-3 gap-2">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">
                    {f.title}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${f.bg} ${f.color} border ${f.border} font-semibold whitespace-nowrap`}
                  >
                    {f.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
