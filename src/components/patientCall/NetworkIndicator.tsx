"use client";
import React from "react";
import { cn } from "../utility/setup";
import { Wifi, WifiOff } from "lucide-react";
import { useNetwork } from "@daily-co/daily-react";
export default function NetworkIndicator() {
  const network = useNetwork();

  const getQuality = () => {
    if (!network)
      return { label: "ไม่ทราบ", color: "text-slate-400", icon: WifiOff };

    // Daily.co network quality is 0-100 (thresholds: <30 bad, <70 warn, >=70 good)
    const score = network.quality ?? 0;
    if (score >= 70)
      return { label: "ดี", color: "text-emerald-500", icon: Wifi };
    if (score >= 30)
      return { label: "ปานกลาง", color: "text-amber-500", icon: Wifi };
    return { label: "อ่อน", color: "text-red-500", icon: WifiOff };
  };

  const { label, color, icon: Icon } = getQuality();

  return (
    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur px-2 py-1 rounded-full">
      <Icon className={cn("h-3.5 w-3.5", color)} />
      <span className={cn("text-xs font-medium", color)}>{label}</span>
    </div>
  );
}
