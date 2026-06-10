import { BadgeCheck, Lock, Phone, Pill, Shield } from "lucide-react";
import Link from "next/link";
import React from "react";

const serviceLinks = [
  { href: "/nearby?tab=pharmacist", label: "ปรึกษาเภสัชกร" },
  { href: "/nearby", label: "ร้านยาใกล้ฉัน" },
  { href: "/articles", label: "บทความสุขภาพ" },
];

const accountLinks = [
  { href: "/login", label: "เข้าสู่ระบบ" },
  { href: "/register", label: "สมัครสมาชิก" },
  { href: "/profile", label: "โปรไฟล์ของฉัน" },
  { href: "/dashboard", label: "แดชบอร์ดเภสัชกร" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 pb-16 md:pb-0">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-sm shadow-primary/20">
                <Pill className="h-5 w-5 text-white" />
              </span>
              <span className="text-xl font-bold">
                Medi<span className="text-primary">Bridge</span>
              </span>
            </Link>
            <p className="max-w-md text-sm leading-7 text-muted-foreground">
              ตัวกลางช่วยให้ผู้ใช้สรุปอาการ เลือกร้านยา และส่งข้อมูลให้เภสัชกรล่วงหน้า
              โดยเน้นความชัดเจน ความยินยอม และความปลอดภัยของข้อมูล
            </p>
            <div className="mt-5 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3 md:max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-xl bg-background px-3 py-2">
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
                เภสัชกรมีใบอนุญาต
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-background px-3 py-2">
                <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
                ขอความยินยอมก่อนส่ง
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-background px-3 py-2">
                <Shield className="h-3.5 w-3.5 shrink-0 text-primary" />
                ไม่ใช่การวินิจฉัยโรค
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold">บริการ</h4>
            <ul className="grid gap-2.5 text-sm text-muted-foreground">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold">บัญชี</h4>
            <ul className="grid gap-2.5 text-sm text-muted-foreground">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border/50 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2026 MediBridge. สงวนลิขสิทธิ์</p>
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            02-000-0000
          </p>
        </div>
      </div>
    </footer>
  );
}
