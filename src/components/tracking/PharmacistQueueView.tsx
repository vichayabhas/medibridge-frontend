'use client'
import React from "react";
import { Stethoscope, Activity, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GetPharmacistData, PatientHandoffType } from "../../../interface";
import { cn, getBackendUrl, SocketReady } from "../utility/setup";
import PharmacistQueueCard from "./PharmacistQueueCard";
import { io } from "socket.io-client";

type QueueTab = "waiting" | "active" | "done";
const socket = io(getBackendUrl());

export function PharmacistQueueView({ data }: { data: GetPharmacistData }) {
  const [queueTab, setQueueTab] = React.useState<QueueTab>("waiting");

  // const allHandoffs = data.handoffs;
  const [allHandoffs, setAllHandoff] = React.useState(data.handoffs);
  const pharmacistHandoffSocket = new SocketReady<PatientHandoffType[]>(
    socket,
    "handoff",
    data.pharmacist._id,
  );
  React.useEffect(() => {
    pharmacistHandoffSocket.listen(setAllHandoff);
    return () => {
      pharmacistHandoffSocket.disconnect();
    };
  });

  const myRphName = data.pharmacist.name;

  const waiting = allHandoffs.filter((h) => h.status === "sent");
  const active = allHandoffs.filter((h) =>
    ["accepted", "ready"].includes(h.status),
  );
  const done = allHandoffs.filter((h) =>
    ["completed", "rejected"].includes(h.status),
  );

  const TABS: { id: QueueTab; label: string; count: number; color: string }[] =
    [
      {
        id: "waiting",
        label: "รอรับเรื่อง",
        count: waiting.length,
        color: "text-warning",
      },
      {
        id: "active",
        label: "กำลังดำเนินการ",
        count: active.length,
        color: "text-primary",
      },
      {
        id: "done",
        label: "เสร็จสิ้น",
        count: done.length,
        color: "text-muted-foreground",
      },
    ];

  const displayList =
    queueTab === "waiting" ? waiting : queueTab === "active" ? active : done;

  return (
    <div className="pt-20 pb-24 md:pb-10 min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              คิวผู้ป่วย
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{myRphName}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {TABS.map((t) => (
            <div
              key={t.id}
              className={cn(
                "rounded-xl border border-border/40 p-3 text-center cursor-pointer transition-all",
                queueTab === t.id
                  ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                  : "bg-muted/30 hover:bg-muted/50",
              )}
              onClick={() => setQueueTab(t.id)}
            >
              <p className={cn("text-2xl font-bold", t.color)}>{t.count}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 mb-6 bg-muted/50 rounded-xl">
          {TABS.map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setQueueTab(id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium rounded-lg transition-all",
                queueTab === id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {label}
              {count > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    queueTab === id
                      ? "bg-warning/20 text-warning"
                      : "bg-muted/80 text-muted-foreground",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Queue list */}
        {displayList.length === 0 ? (
          <Card className="border-dashed border-border/60 bg-muted/20">
            <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                {queueTab === "waiting" ? (
                  <Activity className="h-7 w-7 text-muted-foreground" />
                ) : (
                  <History className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {queueTab === "waiting"
                    ? "ไม่มีคิวรอ"
                    : queueTab === "active"
                      ? "ไม่มีรายการที่กำลังดำเนินการ"
                      : "ยังไม่มีประวัติ"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  อัปเดตอัตโนมัติทุก 20 วินาที
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayList.map((h) => (
              <PharmacistQueueCard
                key={h._id}
                h={h}
                pharmacyNameStr={data.pharmacy.name}
                pharmacistHandoffSocket={pharmacistHandoffSocket}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
