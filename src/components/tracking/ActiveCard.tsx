"use client";
import React from "react";
import { ConsultationData } from "../../../interface";
import { computeTokens } from "./TrackingPage";
import { useRouter } from "next/navigation";
import {
  CHANNEL_LABEL,
  ChannelIcon,
  cn,
  formatThaiDateTime,
  PHARMACIST_PHOTOS,
  REQUEST_TYPE_LABEL,
  STATUS_LABEL,
  STATUS_VARIANT,
  stepIndex,
  WAIT_STEPS,
} from "../utility/setup";
import { Card, CardContent } from "../ui/card";
import { Avatar } from "../ui/avatar";
import {
  Activity,
  AlertCircle,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coins,
  FileText,
  Globe2,
  Loader2,
  Maximize2,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Store,
  Timer,
  Video,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ConsultationModal } from "../common/ConsultationModal";
export default function ActiveCard({
  h,
  hTokens,
}: {
  h: ConsultationData;
  hTokens: ReturnType<typeof computeTokens>;
}) {
  const navigate = useRouter();
  const [expanded, setExpanded] = React.useState(false);
  const [showConsult, setShowConsult] = React.useState(false);
  const current = stepIndex(h.handoff.status);
  const isRejected = h.handoff.status === "rejected";
  const isTele = h.handoff.requestType === "telemedicine";
  const reqAt = formatThaiDateTime(
    h.handoff.telemedicineRequestTime ?? h.handoff.createAt,
  );
  const apptAt = formatThaiDateTime(h.handoff.appointmentTime);
  const startedAt = formatThaiDateTime(h.handoff.telemedicineStartTime);
  const rph=h.pharmacist

  return (
    <Card
      className={cn(
        "border-2 overflow-hidden transition-all duration-300",
        isRejected
          ? "border-destructive/40 bg-destructive/5"
          : "border-primary/30 bg-primary/5",
      )}
    >
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative shrink-0">
              <Avatar
                src={
                  h.pharmacist ? PHARMACIST_PHOTOS[h.pharmacist._id] : undefined
                }
                name={h.pharmacist?.name ?? h.pharmacy.name}
                size="md"
                className="ring-2 ring-background shadow-md"
              />
              {h.pharmacist && (
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                    h.pharmacist.availability === "online"
                      ? "bg-success"
                      : h.pharmacist.availability === "busy"
                        ? "bg-warning"
                        : "bg-muted-foreground",
                  )}
                />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p className="font-bold text-sm leading-tight">
                  {isTele ? "เภสัชทางไกล" : "คำขอที่ร้านยา"}
                </p>
                {h.handoff.requestType && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20 shrink-0">
                    {REQUEST_TYPE_LABEL[h.handoff.requestType]}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Store className="h-3 w-3" />
                {h.pharmacy.name || "ร้านยา"}
              </p>
              {rph && (
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-[11px] text-primary font-semibold truncate">
                    {rph.name}
                  </p>
                  <BadgeCheck className="h-3 w-3 text-primary shrink-0" />
                </div>
              )}
            </div>
          </div>
          <Badge
            variant={
              isRejected ? "destructive" : STATUS_VARIANT[h.handoff.status]
            }
            className="shrink-0"
          >
            {STATUS_LABEL[h.handoff.status]}
          </Badge>
        </div>

        {/* Pharmacist stats */}
        {rph && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-bold text-foreground">{rph.rating}</span>
              <span>({rph.reviewCount})</span>
            </div>
            <span>•</span>
            <span>{rph.experience} ปี</span>
            <span>•</span>
            <span className="truncate">{rph.workplace}</span>
          </div>
        )}

        {/* Progress stepper */}
        {!isRejected && (
          <div className="flex items-center gap-0">
            {WAIT_STEPS.map((step, i) => {
              const done = i <= current;
              const active = i === current;
              return (
                <div
                  key={step.status}
                  className="flex-1 flex flex-col items-center"
                >
                  <div className="flex items-center w-full">
                    {i > 0 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 transition-colors duration-500",
                          done ? "bg-primary" : "bg-border",
                        )}
                      />
                    )}
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 shrink-0",
                        done
                          ? active
                            ? "bg-primary border-primary text-white shadow-md shadow-primary/30 animate-pulse"
                            : "bg-primary border-primary text-white"
                          : "bg-background border-border text-muted-foreground",
                      )}
                    >
                      {done && !active ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    {i < WAIT_STEPS.length - 1 && (
                      <div
                        className={cn(
                          "flex-1 h-0.5 transition-colors duration-500",
                          i < current ? "bg-primary" : "bg-border",
                        )}
                      />
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-[10px] mt-1 font-medium",
                      done ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Channel banner */}
        {(h.handoff.telemedicineChannel || h.handoff.requestType) && (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border",
              h.handoff.telemedicineChannel === "video"
                ? "bg-violet-500/10 text-violet-600 border-violet-400/25"
                : h.handoff.telemedicineChannel === "phone"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-400/25"
                  : h.handoff.telemedicineChannel === "chat"
                    ? "bg-blue-500/10 text-blue-600 border-blue-400/25"
                    : "bg-muted text-muted-foreground border-border/40",
            )}
          >
            <ChannelIcon
              channel={h.handoff.telemedicineChannel}
              className="h-3.5 w-3.5"
            />
            {h.handoff.telemedicineChannel
              ? CHANNEL_LABEL[h.handoff.telemedicineChannel]
              : REQUEST_TYPE_LABEL[h.handoff.requestType ?? "in_store"]}
          </div>
        )}

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-background/60 p-3 border border-border/40">
            <p className="text-muted-foreground mb-1 font-medium">อาการ</p>
            <p className="text-foreground line-clamp-2">
              {h.handoff.symptoms.join(", ") || "—"}
            </p>
          </div>
          <div className="rounded-lg bg-background/60 p-3 border border-border/40">
            <p className="text-muted-foreground mb-1 font-medium">ช่องทาง</p>
            <div className="flex items-center gap-1.5">
              <ChannelIcon
                channel={h.handoff.telemedicineChannel}
                className="h-3.5 w-3.5 text-primary"
              />
              <span className="font-semibold">
                {h.handoff.telemedicineChannel
                  ? CHANNEL_LABEL[h.handoff.telemedicineChannel]
                  : REQUEST_TYPE_LABEL[h.handoff.requestType ?? "in_store"]}
              </span>
            </div>
          </div>
          {reqAt && (
            <div className="rounded-lg bg-background/60 p-3 border border-border/40">
              <p className="text-muted-foreground mb-1 font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" /> ส่งคำขอ
              </p>
              <p className="text-foreground">{reqAt}</p>
            </div>
          )}
          {apptAt ? (
            <div className="rounded-lg bg-background/60 p-3 border border-border/40">
              <p className="text-muted-foreground mb-1 font-medium flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> นัดหมาย
              </p>
              <p className="text-foreground font-semibold">{apptAt}</p>
              {hTokens &&
                h.handoff.appointmentTime &&
                (() => {
                  const start = new Date(h.handoff.appointmentTime);
                  const end = new Date(
                    start.getTime() + hTokens.duration * 60000,
                  );
                  const fmt = (d: Date) =>
                    `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
                  return (
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {fmt(start)} – {fmt(end)}
                      <span className="text-muted-foreground ml-1">
                        ({hTokens.duration} นาที)
                      </span>
                    </p>
                  );
                })()}
            </div>
          ) : startedAt ? (
            <div className="rounded-lg bg-background/60 p-3 border border-border/40">
              <p className="text-muted-foreground mb-1 font-medium flex items-center gap-1">
                <Timer className="h-3 w-3" /> เริ่มปรึกษา
              </p>
              <p className="text-foreground font-semibold">{startedAt}</p>
            </div>
          ) : null}
        </div>

        {/* Token cost */}
        {isTele && hTokens && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/8 border border-primary/20 px-3 py-2.5 text-xs">
            <Coins className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              {hTokens.isActual ? "โทเคนที่ใช้:" : "ประมาณการ:"}
            </span>
            <span className="font-black text-primary text-sm">
              {hTokens.total}
            </span>
            <span className="text-muted-foreground">
              ({hTokens.duration} นาที × {hTokens.rate}/นาที)
            </span>
            {!hTokens.isActual && (
              <span className="ml-auto text-[10px] text-muted-foreground/70 italic">
                ยังไม่ยืนยัน
              </span>
            )}
          </div>
        )}

        {/* Patient note */}
        {h.handoff.telemedicinePatientNote && (
          <div className="rounded-lg bg-muted/40 border border-border/40 px-3 py-2 text-xs flex items-start gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground leading-relaxed line-clamp-2">
              {h.handoff.telemedicinePatientNote}
            </span>
          </div>
        )}

        {/* Expandable pharmacist details */}
        {rph && (
          <>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors py-0.5"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  expanded && "rotate-180",
                )}
              />
              {expanded ? "ซ่อนข้อมูลเภสัชกร" : "ดูข้อมูลเภสัชกร"}
            </button>
            {expanded && (
              <div className="space-y-3 pt-1 border-t border-border/30">
                <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                  <p className="text-[11px] text-muted-foreground mb-2">
                    อัตราโทเคน (ต่อนาที)
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 mb-2">
                    {(["chat", "phone", "video"] as const).map((k) => {
                      const icons = {
                        chat: MessageCircle,
                        phone: Phone,
                        video: Video,
                      };
                      const labels = {
                        chat: "แชท",
                        phone: "โทร",
                        video: "วิดีโอ",
                      };
                      const Icon = icons[k];
                      return (
                        <div
                          key={k}
                          className={cn(
                            "flex flex-col items-center gap-0.5 rounded-lg border py-1.5",
                            h.handoff.telemedicineChannel === k
                              ? "bg-primary/10 border-primary/30"
                              : "bg-muted/40 border-border/40",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-3.5 w-3.5",
                              h.handoff.telemedicineChannel === k
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {labels[k]}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <Coins className="h-3 w-3 text-primary" />
                            <span
                              className={cn(
                                "text-xs font-bold",
                                h.handoff.telemedicineChannel === k
                                  ? "text-primary"
                                  : "text-foreground",
                              )}
                            >
                              {rph.methodRates[k]}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Timer className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-[11px] text-muted-foreground">
                      ช่วงเวลาปรึกษา:
                    </span>
                    <div className="flex gap-1 flex-wrap">
                      {rph.consultDurations.map((d) => (
                        <span
                          key={d}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold"
                        >
                          {d} นาที
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-border/40 bg-muted/30 p-2.5">
                    <div className="flex items-center gap-1 mb-1">
                      <Globe2 className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        ภาษา
                      </span>
                    </div>
                    <p className="text-[11px] font-medium">
                      {rph.languages.join(", ")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-muted/30 p-2.5">
                    <div className="flex items-center gap-1 mb-1">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        ประกัน
                      </span>
                    </div>
                    <p className="text-[11px] font-medium">
                      {rph.insurance.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border-2 border-success/30 bg-success/5 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs font-semibold">
                      {rph.workplace}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-3 w-3 text-success shrink-0" />
                    <span className="text-[10px] text-muted-foreground">
                      ใบอนุญาต:{" "}
                      <span className="font-bold text-foreground">
                        {rph.licenseNo}
                      </span>
                    </span>
                  </div>
                </div>
                {rph.bio && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {rph.bio}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Status banners */}
        {h.handoff.status === "sent" && (
          <div className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 px-3 py-2 text-xs text-warning">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span>
              {isTele ? "รอเภสัชกรรับเรื่อง" : "รอร้านยารับเรื่อง"} —
              โดยปกติใช้เวลาไม่เกิน 5 นาที
            </span>
          </div>
        )}
        {h.handoff.status === "accepted" && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary">
            <Activity className="h-3.5 w-3.5 animate-pulse shrink-0" />
            <span>
              {isTele
                ? "เภสัชกรกำลังตรวจสอบข้อมูลของคุณ"
                : "ร้านยากำลังจัดเตรียมยาของคุณ"}
            </span>
          </div>
        )}
        {h.handoff.status === "ready" && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-3 py-2 text-xs text-success font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>ยาพร้อมรับแล้ว — กรุณามารับที่ร้าน</span>
          </div>
        )}
        {h.handoff.status === "rejected" && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>คำขอถูกปฏิเสธ — กรุณาลองใหม่หรือเลือกร้านอื่น</span>
          </div>
        )}

        {/* Buttons for active handoffs */}
        {["sent", "accepted", "ready"].includes(h.handoff.status) && (
          <div className="flex gap-2">
            {isTele && h.handoff.status === "accepted" && (
              <>
                <Button
                  size="sm"
                  className="flex-1 rounded-xl gap-2"
                  onClick={() => setShowConsult(true)}
                >
                  <ChannelIcon
                    channel={h.handoff.telemedicineChannel}
                    className="h-4 w-4"
                  />
                  เข้าร่วมการปรึกษา
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-2"
                  onClick={() => navigate.push(`/call/${h.handoff._id}`)}
                  title="เปิดเต็มจอ"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </>
            )}
            {!(isTele && h.handoff.status === "accepted") && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 rounded-xl gap-2"
                onClick={() => setShowConsult(true)}
              >
                <MessageCircle className="h-4 w-4" />
                แชทกับเภสัชกร
              </Button>
            )}
          </div>
        )}

        {showConsult && (
          <ConsultationModal
            onClose={() => setShowConsult(false)}
            data={h}
          />
        )}
      </CardContent>
    </Card>
  );
}
