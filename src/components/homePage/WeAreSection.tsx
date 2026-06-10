import React from "react";
import { Card, CardContent } from "../ui/card";
import { CheckCircle2 } from "lucide-react";
const notWeAre = [
  "ร้านขายยาออนไลน์",
  "บริการส่งยาถึงบ้าน",
  "ระบบชำระเงินออนไลน์",
  "ผู้วินิจฉัยโรค",
];

const weAre = [
  "ตัวกลางเชื่อมคนไข้กับเภสัชกร",
  "ระบบรวบรวมและส่งต่อข้อมูล",
  "ช่องทางค้นหาร้านยาใกล้บ้าน",
  "แพลตฟอร์มรีวิวเภสัชกร",
];
export default function WeAreSection() {
  return (
    <section className="py-16 bg-muted/40">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <Card className="border-success/30 bg-success/5">
            <CardContent className="p-6">
              <h3 className="font-bold text-success mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> เราคือ
              </h3>
              <ul className="space-y-3">
                {weAre.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-6">
              <h3 className="font-bold text-destructive mb-4 flex items-center gap-2">
                <span className="h-5 w-5 flex items-center justify-center rounded-full border-2 border-destructive text-xs font-black">✕</span>
                เราไม่ใช่
              </h3>
              <ul className="space-y-3">
                {notWeAre.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground line-through">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive/50 shrink-0 no-underline" style={{ textDecoration: "none" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}