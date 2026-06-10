import React from "react";
import { Badge } from "../ui/badge";
import { Pill, Star } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
const mockPharmacies = [
  {
    name: "สุขใจเภสัช",
    area: "ลาดพร้าว",
    distance: "0.8 กม.",
    status: "ออนไลน์",
    rating: "4.9",
  },
  {
    name: "บ้านยาใกล้ฉัน",
    area: "ห้วยขวาง",
    distance: "1.4 กม.",
    status: "ว่างใน 10 นาที",
    rating: "4.7",
  },
  {
    name: "เภสัชกรชุมชน",
    area: "รัชดา",
    distance: "2.1 กม.",
    status: "รับนัดหมาย",
    rating: "4.8",
  },
];

export default function PharmacyPreview() {
  return (
    <section className="bg-muted/45 py-16 md:py-24">
      <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge variant="default" className="mb-4 bg-background">
            ร้านยาพันธมิตร
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            เลือกร้านจากข้อมูลที่อ่านง่าย
          </h2>
          <p className="mt-4 max-w-xl leading-8 text-muted-foreground">
            ดูข้อมูลร้านยาที่ครบถ้วน ทั้งระยะทาง สถานะเภสัชกร และคะแนนรีวิว
            ช่วยให้คุณตัดสินใจเลือกร้านได้อย่างมั่นใจ
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge variant="success" dot="online">
              ออนไลน์
            </Badge>
            <Badge variant="warning">มีเภสัชกรประจำ</Badge>
            <Badge variant="muted">รับยาที่ร้านโดยตรง</Badge>
          </div>
        </div>
        <div className="grid gap-4">
          {mockPharmacies.map((pharmacy) => (
            <Card key={pharmacy.name} className="border-white bg-white">
              <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/10">
                    <Pill className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold">
                      {pharmacy.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {pharmacy.area} · {pharmacy.distance}
                    </p>
                    <p className="mt-2 text-sm text-success">
                      {pharmacy.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1 text-sm font-bold text-warning">
                    <Star className="h-4 w-4 fill-warning" />
                    {pharmacy.rating}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/nearby">ดูรายละเอียด</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
