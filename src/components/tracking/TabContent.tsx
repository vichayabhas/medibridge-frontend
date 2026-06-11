'use client'
import React from "react";
import HistoryRow from "./HistoryRow";
import { computeTokens } from "./TrackingPage";
import { Card, CardContent } from "../ui/card";
import { PatientHandoffType, PharmacistType } from "../../../interface";
import { cn } from "../utility/setup";
import ActiveCard from "./ActiveCard";
import { History } from "lucide-react";
export default function TabContent({
  active,
  history,
  pharmacistLookup,
  pharmacyName,
  emptyIcon: EmptyIcon,
  emptyLabel,
  emptySubLabel,
  emptyAction,
}: {
  active: PatientHandoffType[];
  history: PatientHandoffType[];
  pharmacistLookup: Record<string, PharmacistType>;
  pharmacyName: (id?: string) => string;
  emptyIcon: React.FC<{ className?: string }>;
  emptyLabel: string;
  emptySubLabel: string;
  emptyAction: React.ReactNode;
}) {
  const [subTab, setSubTab] = React.useState<"active" | "history">("active");

  return (
    <>
      {/* Sub-tab: กำลังดำเนินการ / ประวัติ */}
      <div className="flex gap-2 mb-4">
        {(
          [
            { id: "active", label: "กำลังดำเนินการ", count: active.length },
            { id: "history", label: "ประวัติ", count: history.length },
          ] as const
        ).map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setSubTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
              subTab === id
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-background text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
            )}
          >
            {label}
            {count > 0 && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                  subTab === id
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {subTab === "active" ? (
 active.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-muted/20">
            <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                <EmptyIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold">{emptyLabel}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {emptySubLabel}
                </p>
              </div>
              {emptyAction}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {active.map((h) => {
              const rph = h.pharmacistId
                ? pharmacistLookup[h.pharmacistId]
                : null;
              return (
                <ActiveCard
                  key={h._id}
                  h={h}
                  rph={rph}
                  hTokens={computeTokens(h, rph)}
                  pharmacyNameStr={pharmacyName(h.pharmacyId)}
                />
              );
            })}
          </div>
        )
      )  : history.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-muted/20">
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
              <History className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">ยังไม่มีประวัติ</p>
              <p className="text-xs text-muted-foreground mt-1">
                ประวัติจะแสดงที่นี่หลังจากเสร็จสิ้น
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((h) => {
            const rph = h.pharmacistId
              ? pharmacistLookup[h.pharmacistId]
              : null;
            return (
              <HistoryRow
                key={h._id}
                h={h}
                hTokens={computeTokens(h, rph)}
                pharmacyNameStr={pharmacyName(h.pharmacyId)}
              />
            );
          })}
        </div>
      )}
    </>
  );
}