"use client";
import {
  Stethoscope,
  Pill,
  CalendarClock,
  ArrowRight,
  PackageCheck,
} from "lucide-react";
import React from "react";
import { cn } from "../utility/setup";
import {
  PatientHandoffType,
  PharmacistType,
  PharmacyWithDistance,
} from "../../../interface";
import TabContent from "./TabContent";
import Link from "next/link";
import { Button } from "../ui/button";
type MainTab = "consult" | "store";
export default function ParentView({
  pharmacies,
  pharmacists,
  handoffs,
}: {
  pharmacies: PharmacyWithDistance[];
  pharmacists: PharmacistType[];
  handoffs: PatientHandoffType[];
}) {
  const pharmacistLookup = Object.fromEntries(
    pharmacists.map((p) => [p._id, p]),
  );

  // const [handoffs, setHandoffs] = useState<PatientHandoff[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [refreshing, setRefreshing] = useState(false);
  const [mainTab, setMainTab] = React.useState<MainTab>("consult");
  const pharmacyName = (id?: string) => {
    if (!id) return "ร้านยา";
    return pharmacies.find((p) => p._id === id)?.name ?? id;
  };

  const consultHandoffs = handoffs.filter(
    (h) => h.requestType === "telemedicine",
  );
  const storeHandoffs = handoffs.filter((h) =>
    ["pickup", "delivery", "in_store"].includes(h.requestType ?? ""),
  );
  const activeConsult = consultHandoffs.filter((h) =>
    ["sent", "accepted", "ready"].includes(h.status),
  );
  const historyConsult = consultHandoffs.filter((h) =>
    ["completed", "rejected"].includes(h.status),
  );
  const activeStore = storeHandoffs.filter((h) =>
    ["sent", "accepted", "ready"].includes(h.status),
  );
  const historyStore = storeHandoffs.filter((h) =>
    ["completed", "rejected"].includes(h.status),
  );
  // ── Patient view ──
  return (
    <div className="pt-20 pb-24 md:pb-10 min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarClock className="h-6 w-6 text-primary" />
              ติดตามคำขอ
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              ดูสถานะคำขอทั้งหมดของคุณ
            </p>
          </div>
          {/* {<button
            onClick={() => load(true)}
            className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors shrink-0"
            title="รีเฟรช"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4 text-muted-foreground",
                refreshing && "animate-spin",
              )}
            />
          </button>} */}
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            {
              value: activeConsult.length,
              label: "ปรึกษา",
              color: "text-secondary",
              bg: "bg-secondary/8",
            },
            {
              value: activeStore.length,
              label: "ร้านยา",
              color: "text-primary",
              bg: "bg-primary/8",
            },
            {
              value: handoffs.filter((h) => h.status === "ready").length,
              label: "ยาพร้อม",
              color: "text-success",
              bg: "bg-success/8",
            },
            {
              value: handoffs.filter((h) => h.status === "completed").length,
              label: "เสร็จสิ้น",
              color: "text-muted-foreground",
              bg: "bg-muted/40",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={cn(
                "rounded-xl border border-border/40 p-2.5 text-center",
                s.bg,
              )}
            >
              <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Main tab switcher: ปรึกษา vs ร้านยา */}
        <div className="flex p-1 mb-6 bg-muted/50 rounded-xl">
          {[
            {
              id: "consult" as MainTab,
              label: "ปรึกษาเภสัชกร",
              icon: Stethoscope,
              active: activeConsult.length,
            },
            {
              id: "store" as MainTab,
              label: "คำขอร้านยา",
              icon: PackageCheck,
              active: activeStore.length,
            },
          ].map(({ id, label, icon: Icon, active }) => (
            <button
              key={id}
              onClick={() => setMainTab(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                mainTab === id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
              {active > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    mainTab === id
                      ? "bg-warning/20 text-warning"
                      : "bg-muted/80 text-muted-foreground",
                  )}
                >
                  {active}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {mainTab === "consult" ? (
          <TabContent
            active={activeConsult}
            history={historyConsult}
            pharmacistLookup={pharmacistLookup}
            pharmacyName={pharmacyName}
            emptyIcon={({ className }) => <Stethoscope className={className} />}
            emptyLabel="ไม่มีคำขอที่กำลังดำเนินการ"
            emptySubLabel="เมื่อส่งคำขอปรึกษาใหม่ สถานะจะปรากฏที่นี่"
            emptyAction={
              <Link href="/nearby?tab=pharmacist">
                <Button size="sm" className="rounded-xl gap-2 mt-1">
                  <Pill className="h-4 w-4" />
                  หาเภสัชกร
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            }
          />
        ) : (
          <TabContent
            active={activeStore}
            history={historyStore}
            pharmacistLookup={pharmacistLookup}
            pharmacyName={pharmacyName}
            emptyIcon={({ className }) => (
              <PackageCheck className={className} />
            )}
            emptyLabel="ไม่มีคำขอที่กำลังดำเนินการ"
            emptySubLabel="เมื่อส่งคำขอที่ร้านยาใหม่ สถานะจะปรากฏที่นี่"
            emptyAction={
              <Link href="/nearby">
                <Button size="sm" className="rounded-xl gap-2 mt-1">
                  <Pill className="h-4 w-4" />
                  หาร้านยา
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
