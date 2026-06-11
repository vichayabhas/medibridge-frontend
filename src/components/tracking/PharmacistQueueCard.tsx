'use client'
import React from "react";
import { PatientHandoffStatus, PatientHandoffType } from "../../../interface";
import updatePatientHandoff from "@/libs/patientHandoff/updatePatientHandoff";
import { Card, CardContent } from "../ui/card";
import {
  CHANNEL_LABEL,
  ChannelIcon,
  cn,
  REQUEST_TYPE_LABEL,
  SocketReady,
  STATUS_VARIANT,
} from "../utility/setup";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Loader2,
  Store,
  XCircle,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
const QUEUE_STATUS_LABEL: Record<PatientHandoffStatus, string> = {
  sent: "รอรับเรื่อง",
  accepted: "กำลังดำเนินการ",
  ready: "ยาพร้อมรับ",
  completed: "เสร็จสิ้น",
  rejected: "ยกเลิก",
};

const NEXT_STATUS: Partial<Record<PatientHandoffStatus, PatientHandoffStatus>> =
  {
    sent: "accepted",
    accepted: "ready",
    ready: "completed",
  };

const NEXT_LABEL: Partial<Record<PatientHandoffStatus, string>> = {
  sent: "รับเรื่อง",
  accepted: "ยาพร้อมแล้ว",
  ready: "เสร็จสิ้น",
};
export default function PharmacistQueueCard({
  h,
  pharmacyNameStr,
  // onStatusChange,
  pharmacistHandoffSocket,
}: {
  h: PatientHandoffType;
  pharmacyNameStr: string;
  // onStatusChange: (id: string, status: PatientHandoffStatus) => void;
  pharmacistHandoffSocket: SocketReady<PatientHandoffType[]>;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [updating, setUpdating] = React.useState(false);
  const isTele = h.requestType === "telemedicine";
  const isActive = ["sent", "accepted", "ready"].includes(h.status);
  const nextStatus = NEXT_STATUS[h.status];

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    const patientHandoff = await updatePatientHandoff(h._id, {
      status: nextStatus,
    });
    pharmacistHandoffSocket.trigger(patientHandoff);
    // onStatusChange(h._id, nextStatus);
    setUpdating(false);
  };

  const handleReject = async () => {
    setUpdating(true);
    const patientHandoff = await updatePatientHandoff(h._id, {
      status: "rejected",
    });
    pharmacistHandoffSocket.trigger(patientHandoff);
    // onStatusChange(h._id, "rejected");
    setUpdating(false);
  };

  const createdAt = h.createAt
    ? new Intl.DateTimeFormat("th-TH", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(h.createAt))
    : "—";

  return (
    <Card
      className={cn(
        "border-2 overflow-hidden transition-all duration-300",
        h.status === "sent"
          ? "border-warning/40 bg-warning/5"
          : h.status === "accepted"
            ? "border-primary/30 bg-primary/5"
            : h.status === "ready"
              ? "border-success/30 bg-success/5"
              : "border-border/40 bg-muted/20",
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <p className="font-bold text-sm leading-tight">{h.patientName}</p>
              {h.age && (
                <span className="text-[10px] text-muted-foreground">
                  {h.age} ปี
                </span>
              )}
              {h.gender && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/40">
                  {h.gender === "male"
                    ? "ชาย"
                    : h.gender === "female"
                      ? "หญิง"
                      : h.gender}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Store className="h-3 w-3" />
              {pharmacyNameStr}
              <span className="mx-1">•</span>
              <Clock className="h-3 w-3" />
              {createdAt}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={STATUS_VARIANT[h.status]}>
              {QUEUE_STATUS_LABEL[h.status]}
            </Badge>
            {isTele && h.telemedicineChannel && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border",
                  h.telemedicineChannel === "video"
                    ? "bg-violet-500/10 text-violet-600 border-violet-400/25"
                    : h.telemedicineChannel === "phone"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-400/25"
                      : "bg-blue-500/10 text-blue-600 border-blue-400/25",
                )}
              >
                <ChannelIcon
                  channel={h.telemedicineChannel}
                  className="h-3 w-3"
                />
                {CHANNEL_LABEL[h.telemedicineChannel]}
              </span>
            )}
            {!isTele && h.requestType && (
              <span className="inline-flex text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                {REQUEST_TYPE_LABEL[h.requestType]}
              </span>
            )}
          </div>
        </div>

        {/* Symptoms */}
        {h.symptoms.length > 0 && (
          <div className="rounded-lg bg-background/60 border border-border/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground font-medium">อาการ: </span>
            <span>{h.symptoms.join(", ")}</span>
          </div>
        )}

        {/* Expandable details */}
        <button
          className="w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setExpanded((v) => !v)}
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-200",
              expanded && "rotate-180",
            )}
          />
          {expanded ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
        </button>

        {expanded && (
          <div className="space-y-2 text-xs pt-1 border-t border-border/30">
            {h.conditions && h.conditions.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">โรคประจำตัว</span>
                <span className="font-medium">{h.conditions.join(", ")}</span>
              </div>
            )}
            {h.allergies && h.allergies.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">การแพ้</span>
                <span className="font-medium text-destructive">
                  {h.allergies.join(", ")}
                </span>
              </div>
            )}
            {h.medications && h.medications.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ยาที่ใช้อยู่</span>
                <span className="font-medium">{h.medications.join(", ")}</span>
              </div>
            )}
            {h.telemedicinePatientNote && (
              <div>
                <span className="text-muted-foreground">หมายเหตุผู้ป่วย</span>
                <p className="mt-1 rounded-lg bg-muted/50 px-3 py-2 leading-relaxed">
                  {h.telemedicinePatientNote}
                </p>
              </div>
            )}
            {(h.aiSummary || h.patientSummary) && (
              <div>
                <span className="text-muted-foreground">สรุป AI</span>
                <p className="mt-1 rounded-lg bg-muted/50 px-3 py-2 leading-relaxed">
                  {h.aiSummary || h.patientSummary}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {isActive && (
          <div className="flex gap-2">
            {nextStatus && (
              <Button
                size="sm"
                className="flex-1 rounded-xl gap-1.5"
                disabled={updating}
                onClick={handleAdvance}
              >
                {updating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                {NEXT_LABEL[h.status]}
              </Button>
            )}
            {h.status === "sent" && (
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10"
                disabled={updating}
                onClick={handleReject}
              >
                <XCircle className="h-3.5 w-3.5" />
                ปฏิเสธ
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
