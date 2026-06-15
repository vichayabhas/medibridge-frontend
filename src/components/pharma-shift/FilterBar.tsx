'use client'
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import React from "react";
import { cn } from "../utility/setup";

interface FilterBarProps {
  presence: "available" | "vacation";
  setPresence: React.Dispatch<React.SetStateAction<"available" | "vacation">>;
  activeCertification: string;
  setActiveCertification: React.Dispatch<React.SetStateAction<string>>;
  allCertifications: string[];
  requestTypeFilter: Array<"telemedicine" | "in_store">;
  setRequestTypeFilter: React.Dispatch<React.SetStateAction<Array<"telemedicine" | "in_store">>>;
  requestSearch: string;
  setRequestSearch: React.Dispatch<React.SetStateAction<string>>;
  requestTab: "waiting" | "ongoing" | "finished";
  onTabChange: (tab: "waiting" | "ongoing" | "finished") => void;
  waitingCount: number;
  ongoingCount: number;
  finishedCount: number;
}

export default function FilterBar(props: FilterBarProps) {
  const {
    presence,
    setPresence,
    activeCertification,
    setActiveCertification,
    allCertifications,
    requestTypeFilter,
    setRequestTypeFilter,
    requestSearch,
    setRequestSearch,
    requestTab,
    onTabChange,
    waitingCount,
    ongoingCount,
    finishedCount,
  } = props;

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-bold text-slate-900">คำขอของผู้ป่วย</p>
          <p className="text-xs text-slate-500">{waitingCount} รอการตรวจสอบ</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn(
                "inline-block h-3 w-3 rounded-full",
                presence === "available" ? "bg-emerald-400" : "bg-amber-400"
              )}
            />
            <select
              value={presence}
              onChange={(e) => {
                const v = e.target.value as "available" | "vacation";
                setPresence(v);
              }}
              className={cn(
                "h-8 rounded-2xl border px-3 text-xs font-medium shadow-sm",
                presence === "available"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              )}
            >
              <option value="available">พร้อมให้บริการ</option>
              <option value="vacation">ลาพัก</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex flex-wrap gap-2 items-center mr-2">
            {allCertifications.map((certification) => (
              <Badge
                key={certification}
                variant={activeCertification === certification ? "default" : "outline"}
                className={cn("cursor-pointer text-xs", activeCertification !== certification && "bg-white text-slate-600")}
                onClick={() => setActiveCertification(certification)}
              >
                {certification}
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 rounded-full px-2 text-xs text-slate-500"
              onClick={() => {
                setActiveCertification("All");
              }}
            >
              รีเซ็ต
            </Button>
          </div>
          {(["in_store", "telemedicine"] as const).map((opt) => {
            const label = opt === "in_store" ? "ที่ร้าน" : "เภสัชทางไกล";
            const selected = requestTypeFilter.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => {
                  setRequestTypeFilter((curr) => {
                    const next = new Set(curr);
                    if (next.has(opt)) next.delete(opt);
                    else next.add(opt);
                    if (next.size === 0) return ["in_store", "telemedicine"];
                    return Array.from(next) as Array<"telemedicine" | "in_store">;
                  });
                }}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  selected ? (opt === "telemedicine" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800") : "bg-white text-slate-600 border border-slate-100"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={requestSearch}
            onChange={(e) => setRequestSearch(e.target.value)}
            placeholder="ค้นหาผู้ป่วย อาการ หรือรหัสคำขอ"
            className="h-10 rounded-2xl border-slate-200 bg-white pl-10 pr-3 shadow-sm"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm flex gap-2">
        <button
          className={cn(
            "flex-1 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition",
            requestTab === "waiting" ? "bg-sky-100 text-sky-800" : "text-slate-600"
          )}
          onClick={() => onTabChange("waiting")}
        >
          รอดำเนินการ ({waitingCount})
        </button>

        <button
          className={cn(
            "flex-1 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition",
            requestTab === "ongoing" ? "bg-amber-100 text-amber-800" : "text-slate-600"
          )}
          onClick={() => onTabChange("ongoing")}
        >
          กำลังดำเนินการ ({ongoingCount})
        </button>

        <button
          className={cn(
            "flex-1 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition",
            requestTab === "finished" ? "bg-emerald-100 text-emerald-800" : "text-slate-600"
          )}
          onClick={() => onTabChange("finished")}
        >
          เสร็จสิ้น ({finishedCount})
        </button>
      </div>
    </>
  );
}
