'use client'
import { BookOpen, CalendarClock, Home, MapPin, MessageCircle, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { AuthUser } from "../../../interface";
import React from "react";
import Link from "next/link";
import { cn } from "../utility/setup";

type BottomNavItem = {
  href: string;
  icon: typeof Home;
  label: string;
  primary?: boolean;
};

const items: BottomNavItem[] = [
  { href: "/", icon: Home, label: "หน้าแรก" },
  { href: "/nearby", icon: MapPin, label: "ร้านยา", primary: true },
  { href: "/tracking", icon: CalendarClock, label: "ติดตาม" },
  { href: "/profile", icon: User, label: "โปรไฟล์" },
];

const pharmacistItems: BottomNavItem[] = [
  { href: "/pharmacy-role", icon: MessageCircle, label: "แดชบอร์ด", primary: true },
  { href: "/articles", icon: BookOpen, label: "บทความ" },
  { href: "/profile", icon: User, label: "โปรไฟล์" },
];

const adminItems: BottomNavItem[] = [
  { href: "/admin", icon: MessageCircle, label: "แอดมิน", primary: true },
  { href: "/articles", icon: BookOpen, label: "บทความ" },
  { href: "/profile", icon: User, label: "โปรไฟล์" },
];

const pharmacyAdminItems: BottomNavItem[] = [
  { href: "/pharmacy-dashboard", icon: MessageCircle, label: "ร้านยา", primary: true },
  { href: "/articles", icon: BookOpen, label: "บทความ" },
  { href: "/profile", icon: User, label: "โปรไฟล์" },
];

export default function BottomNav({user}:{user:AuthUser|null}) {
  const location = usePathname()
  const currentUser=user
  const isPharmacist = currentUser?.role === "pharmacist";
  const isAdmin = currentUser?.role === "admin";
  const isPharmacyAdmin = currentUser?.role === "pharmacy_admin";

  const navItems = isPharmacist
    ? pharmacistItems
    : isAdmin
    ? adminItems
    : isPharmacyAdmin
    ? pharmacyAdminItems
    : items;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/96 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_hsl(215_28%_13%/0.08)] backdrop-blur-xl md:hidden">
      <div 
        className="grid h-16 items-center px-1"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
      >
        {navItems.map(({ href, icon: Icon, label, primary }) => {
          const active = location === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold leading-none transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-2xl transition-all",
                  primary
                    ? active
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-gradient-to-br from-primary to-secondary text-white shadow-md shadow-primary/25"
                    : active
                      ? "bg-primary/10"
                      : "bg-transparent"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="max-w-full truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
