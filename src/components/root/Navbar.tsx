'use client'
import { useEffect, useState } from "react";
import { ClipboardList, CalendarClock, Menu, Pill, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { selectCurrentUser, useAuthStore } from "@/stores/auth";
// import PatientDataCard, { getStoredPatientData } from "@/components/PatientDataCard";
import React from "react";
import { cn } from "../utility/setup";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthUser } from "../../../interface";

const guestLinks = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/nearby", label: "ร้านยาใกล้ฉัน" },
  { href: "/articles", label: "บทความ" },
];

const patientLinks = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/nearby", label: "ร้านยาใกล้ฉัน" },
  { href: "/articles", label: "บทความ" },
];

const pharmacistLinks = [
  { href: "/pharmacy-role", label: "แดชบอร์ดร้านยา" },
  { href: "/articles", label: "บทความ" },
];

const adminLinks = [
  { href: "/admin", label: "แดชบอร์ดแอดมิน" },
  { href: "/articles", label: "บทความ" },
];

const pharmacyAdminLinks = [
  { href: "/pharmacy-dashboard", label: "แดชบอร์ดร้านยา" },
  { href: "/articles", label: "บทความ" },
];

export default function Navbar({user}:{user:AuthUser|null}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showPatientCard, setShowPatientCard] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasPatientData, setHasPatientData] = useState(false);
  const location = usePathname()
  const currentUser = user
  const isPharmacist = currentUser?.role === "pharmacist";
  const isAdmin = currentUser?.role === "admin";
  const isPharmacyAdmin = currentUser?.role === "pharmacy_admin";
  const isHome = location === "/";
  const solid = scrolled || !isHome || open;
  const navLinks = isPharmacist
    ? pharmacistLinks
    : isAdmin
    ? adminLinks
    : isPharmacyAdmin
    ? pharmacyAdminLinks
    : currentUser
    ? patientLinks
    : guestLinks;

//   useEffect(() => {
//     setHasPatientData(!!getStoredPatientData());
//   }, [showPatientCard]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
//   return(<div></div>)

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        solid ? "border-b border-border/60 bg-background/92 shadow-sm backdrop-blur-xl" : "bg-background/78 backdrop-blur-xl"
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-href-br from-primary href-secondary shadow-md shadow-primary/25">
            <Pill className="h-5 w-5 text-white" />
          </span>
          <span className="truncate text-xl font-bold tracking-tight text-foreground">
            Medi<span className="text-primary">Bridge</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : solid
                      ? "text-foreground/70 hover:bg-muted hover:text-foreground"
                      : "text-white/82 hover:bg-white/12 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-1 md:flex">
          {currentUser && !isPharmacist && !isAdmin && !isPharmacyAdmin && (
            <button
              onClick={() => setShowPatientCard(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                hasPatientData
                  ? "text-emerald-600 hover:bg-emerald-50"
                  : "text-slate-600 hover:bg-slate-100",
                hasPatientData && "relative after:absolute after:-top-0.5 after:-right-0.5 after:h-2 after:w-2 after:rounded-full after:bg-emerald-500"
              )}
            >
              <ClipboardList className="h-4 w-4" />
              <span>กระดานข้อมูล</span>
            </button>
          )}
          {currentUser ? (
            <>
              {!isPharmacist && !isAdmin && !isPharmacyAdmin && (
                <Link
                  href="/tracking"
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <CalendarClock className="h-4 w-4 shrink-0" />
                  ติดตามคำขอ
                </Link>
              )}
              <Link
                href="/profile"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <User className="h-4 w-4 shrink-0" />
                {currentUser.name.split(" ")[0]}
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors md:hidden",
            solid ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/12"
          )}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-border/60 bg-background/96 px-4 py-4 shadow-lg backdrop-blur-xl md:hidden">
          <div className="mx-auto grid max-w-sm gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-semibold",
                  location === link.href ? "bg-primary/10 text-primary" : "text-foreground/75 hover:bg-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            {currentUser && !isPharmacist && !isAdmin && !isPharmacyAdmin && (
              <button
                onClick={() => {
                  setShowPatientCard(true);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-semibold text-left flex items-center gap-2",
                  hasPatientData
                    ? "text-emerald-600 hover:bg-emerald-50"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <ClipboardList className="h-4 w-4" />
                <span>กระดานข้อมูล</span>
                {hasPatientData && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
                )}
              </button>
            )}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {currentUser ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/profile" onClick={() => setOpen(false)}>โปรไฟล์</Link>
                  </Button>
                  {isPharmacist ? (
                    <Button asChild size="sm">
                      <Link href="/pharmacy-role" onClick={() => setOpen(false)}>
                        แดชบอร์ด
                      </Link>
                    </Button>
                  ) : isAdmin ? (
                    <Button asChild size="sm">
                      <Link href="/admin" onClick={() => setOpen(false)}>
                        แอดมิน
                      </Link>
                    </Button>
                  ) : isPharmacyAdmin ? (
                    <Button asChild size="sm">
                      <Link href="/pharmacy-dashboard" onClick={() => setOpen(false)}>
                        ร้านขายยา
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm">
                      <Link href="/profile" onClick={() => setOpen(false)}>
                        โปรไฟล์
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <Button asChild size="sm" className="col-span-2">
                  <Link href="/login" onClick={() => setOpen(false)}>เข้าสู่ระบบ</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* <PatientDataCard
        isOpen={showPatientCard}
        onClose={() => setShowPatientCard(false)}
      /> */}
    </header>
  );
}
