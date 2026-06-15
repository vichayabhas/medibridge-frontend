'use client'
import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Inbox,
  Package,
  Pill,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import { cn } from "../utility/setup";
import { HandoffItem, HandoffStatus } from "./PharmacistDashboard";
const statusConfig: Record<
  HandoffStatus,
  {
    label: string;
    variant:
      | "default"
      | "warning"
      | "secondary"
      | "success"
      | "destructive"
      | "muted";
    icon: typeof Inbox;
    dot?: "online" | "busy" | "offline";
    rowBg?: string;
  }
> = {
  sent: {
    label: "รอรับเรื่อง",
    variant: "default",
    icon: Inbox,
    rowBg: "border-l-primary/60 bg-primary/2",
  },
  accepted: {
    label: "รับเรื่องแล้ว",
    variant: "warning",
    icon: Clock,
    rowBg: "border-l-warning/60 bg-warning/2",
  },
  ready: {
    label: "ยาพร้อม",
    variant: "secondary",
    icon: Package,
    rowBg: "border-l-secondary/60 bg-secondary/2",
  },
  completed: {
    label: "เสร็จสิ้น",
    variant: "success",
    icon: CheckCircle2,
    rowBg: "",
  },
  rejected: {
    label: "ปฏิเสธ",
    variant: "destructive",
    icon: Circle,
    rowBg: "",
  },
};

const nextAction: Partial<
  Record<HandoffStatus, { label: string; next: HandoffStatus }>
> = {
  sent: { label: "รับเรื่อง", next: "accepted" },
  accepted: { label: "ยาพร้อม", next: "ready" },
  ready: { label: "เสร็จสิ้น", next: "completed" },
};

const chatbotRecommendations: Partial<Record<HandoffStatus, string>> = {
  sent: "ตรวจประวัติแพ้ยา ยาที่ใช้อยู่ และ red flag ก่อนแนะนำยา",
  accepted: "เตรียมคำแนะนำแบบสั้น ชัดเจน และเน้นวิธีใช้ยาที่ปลอดภัย",
  ready: "ยืนยันวิธีรับยาและเตือนอาการที่ควรกลับมาพบแพทย์",
};

export default function HandoffCard({
  item,
  onStatusChange,
}: {
  item: HandoffItem;
  onStatusChange: (id: string, status: HandoffStatus) => void;
}) {
  const status = item.status as HandoffStatus;
  const [expanded, setExpanded] = React.useState(status === "sent");
  const config = statusConfig[status];
  const action = nextAction[status];

  const apptTime = new Date(item.appointmentTime).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className={cn(
        "border-l-4 transition-all duration-300",
        status === "sent" && "border-l-primary",
        status === "accepted" && "border-l-warning",
        status === "ready" && "border-l-secondary",
        status === "completed" && "border-l-success opacity-75",
        status === "rejected" && "border-l-destructive opacity-60",
        "border-border/40",
      )}
    >
      <CardContent className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar name={item.patientName} size="md" className="shrink-0" />
            <div>
              <h3 className="font-bold text-sm">{item.patientName}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3" />
                รับยา {apptTime} น.
              </p>
            </div>
          </div>
          <Badge
            variant={config.variant}
            className="shrink-0 text-xs whitespace-nowrap"
          >
            {config.label}
          </Badge>
        </div>

        {/* Symptoms */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.symptoms.map((s) => (
            <Badge key={s} variant="muted" className="text-[10px] gap-1">
              <Activity className="h-2.5 w-2.5" />
              {s}
            </Badge>
          ))}
        </div>

        {/* Allergy alert */}
        {item.allergies.length > 0 && item.allergies[0] !== "ไม่แพ้" && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-destructive/8 border border-destructive/20">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
            <span className="text-xs text-destructive font-semibold">
              แพ้ยา: {item.allergies.join(", ")}
            </span>
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 pt-4 border-t border-border/40 space-y-2.5 text-xs text-muted-foreground slide-in-bottom">
            <div className="flex gap-2">
              <span className="text-foreground font-semibold w-24 shrink-0">
                ระยะเวลา
              </span>
              <span>{item.duration}</span>
            </div>
            {item.conditions.length > 0 && item.conditions[0] !== "ไม่มี" && (
              <div className="flex gap-2">
                <span className="text-foreground font-semibold w-24 shrink-0">
                  โรคประจำตัว
                </span>
                <span>{item.conditions.join(", ")}</span>
              </div>
            )}
            {item.medications.length > 0 &&
              item.medications[0] !== "ไม่ได้กิน" && (
                <div className="flex gap-2">
                  <span className="text-foreground font-semibold w-24 shrink-0">
                    ยาที่กิน
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Pill className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span>{item.medications.join(", ")}</span>
                  </div>
                </div>
              )}

            {/* Bot summary */}
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-muted border border-border/40 p-3.5">
                <p className="text-foreground font-semibold mb-1.5 flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                  สรุปจากบอท
                </p>
                <p className="leading-[1.85] text-muted-foreground">
                  {item.patientSummary}
                </p>
              </div>

              {status !== "completed" && status !== "rejected" && (
                <div className="rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                  <p className="text-foreground font-semibold mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-primary" />
                    คำแนะนำจากบอท
                  </p>
                  <p className="leading-[1.85] text-muted-foreground">
                    {item.suggestedAction ??
                      chatbotRecommendations[status] ??
                      "ทบทวนข้อมูลผู้ป่วยและยืนยันรายละเอียดก่อนดำเนินการ"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors tap-target"
          >
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {expanded ? "ย่อ" : "ดูรายละเอียด"}
          </button>

          {action && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs rounded-xl text-destructive border-destructive/20 hover:bg-destructive/6 px-3"
                onClick={() => onStatusChange(item._id, "rejected")}
              >
                ปฏิเสธ
              </Button>
              <Button
                size="sm"
                className="h-9 text-xs rounded-xl px-4 shadow-sm shadow-primary/20"
                onClick={() => onStatusChange(item._id, action.next)}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
