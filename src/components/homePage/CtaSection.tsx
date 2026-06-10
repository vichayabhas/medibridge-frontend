import { CheckCircle2 } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
export default function CtaSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="rounded-[2rem] bg-gradient-to-br from-primary to-secondary p-7 text-white shadow-[var(--shadow-hover)] sm:p-10 md:p-14">
          <div className="mx-auto max-w-3xl text-center">
            <CheckCircle2 className="mx-auto mb-5 h-10 w-10" />
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              พร้อมเริ่มใช้ MediBridge
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-8 text-white/82">
              ปรึกษาเภสัชกรก่อนถึงร้านยา สรุปอาการ เลือกร้านยาใกล้คุณ
              และส่งข้อมูลให้เภสัชกรล่วงหน้า
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
              >
                <Link href="/nearby?tab=pharmacist">เริ่มปรึกษาเภสัชกร</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/35 bg-white/10 text-white hover:bg-white/20"
              >
                <Link href="/nearby">ดูร้านยาใกล้ฉัน</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
