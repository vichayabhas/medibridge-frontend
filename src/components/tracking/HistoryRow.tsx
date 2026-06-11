'use client'
import React from "react";
import { Card, CardContent } from "../ui/card";
import { CHANNEL_LABEL, ChannelIcon, cn, REQUEST_TYPE_LABEL, STATUS_LABEL, STATUS_VARIANT } from "../utility/setup";
import { ChevronRight, Coins, Store } from "lucide-react";
import { Badge } from "../ui/badge";
import { PatientHandoffType } from "../../../interface";
import { computeTokens } from "./TrackingPage";
export default function HistoryRow({
  h,
  hTokens,
  pharmacyNameStr,
}: {
  h: PatientHandoffType;
  hTokens: ReturnType<typeof computeTokens>;
  pharmacyNameStr: string;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const isTele = h.requestType === "telemedicine";
  const date = h.createAt
    ? new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(h.createAt))
    : "—";

  return (
    <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300">
      <CardContent className="p-4">
        <button
          className="w-full text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                isTele ? "bg-secondary/10" : "bg-primary/10",
              )}
            >
              {isTele ? (
                <ChannelIcon
                  channel={h.telemedicineChannel}
                  className="h-5 w-5 text-secondary"
                />
              ) : (
                <Store className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="font-semibold text-sm truncate">
                  {pharmacyNameStr}
                </p>
                <Badge
                  variant={STATUS_VARIANT[h.status]}
                  className="text-[10px] shrink-0"
                >
                  {STATUS_LABEL[h.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5 mb-0.5">
                <p className="text-xs text-muted-foreground">{date}</p>
                {h.telemedicineChannel && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/12 text-secondary font-semibold border border-secondary/25">
                    <ChannelIcon
                      channel={h.telemedicineChannel}
                      className="h-2.5 w-2.5"
                    />
                    {CHANNEL_LABEL[h.telemedicineChannel]}
                  </span>
                )}
                {!h.telemedicineChannel &&
                  h.requestType &&
                  h.requestType !== "telemedicine" && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border border-border/40">
                      {REQUEST_TYPE_LABEL[h.requestType]}
                    </span>
                  )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                อาการ: {h.symptoms.join(", ") || "—"}
              </p>
            </div>
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
                expanded && "rotate-90",
              )}
            />
          </div>
        </button>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border/40 space-y-2 text-xs">
            {h.requestType && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ประเภทคำขอ</span>
                <span className="font-medium">
                  {REQUEST_TYPE_LABEL[h.requestType]}
                </span>
              </div>
            )}
            {h.telemedicineChannel && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ช่องทางการปรึกษา</span>
                <span className="font-medium flex items-center gap-1">
                  <ChannelIcon
                    channel={h.telemedicineChannel}
                    className="h-3 w-3"
                  />
                  {CHANNEL_LABEL[h.telemedicineChannel]}
                </span>
              </div>
            )}
            {hTokens && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {hTokens.isActual ? "โทเคนที่ใช้" : "ประมาณการโทเคน"}
                </span>
                <span className="font-bold text-primary flex items-center gap-1">
                  {hTokens.total}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    ({hTokens.duration}นาที × {hTokens.rate})
                  </span>
                </span>
              </div>
            )}
            {h.allergies && h.allergies.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">การแพ้</span>
                <span className="font-medium">{h.allergies.join(", ")}</span>
              </div>
            )}
            {h.conditions && h.conditions.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">โรคประจำตัว</span>
                <span className="font-medium">{h.conditions.join(", ")}</span>
              </div>
            )}
            {h.aiSummary && (
              <div>
                <p className="text-muted-foreground mb-1">สรุป AI</p>
                <p className="rounded-lg bg-muted/50 px-3 py-2 leading-relaxed">
                  {h.aiSummary}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}