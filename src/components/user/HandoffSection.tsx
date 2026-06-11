import { useState } from "react";
import {
  MessageCircle,
  Clock,
  ChevronRight,
  CheckCircle2,
  Video,
  Phone,
  Store,
  AlertCircle,
  Loader2,
  Activity,
  ShieldCheck,
  Timer,
  FileText,
  CalendarDays,
  Info,
  Coins,
  Star,
  Globe2,
  Building2,
  BadgeCheck,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import React from "react";
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
import { PatientHandoffType, PharmacistType } from "../../../interface";
import { ConsultationModal } from "../common/ConsultationModal";

export function computeTokens(
  handoff: PatientHandoffType,
  pharmacist?: PharmacistType | null,
) {
  if (!pharmacist || !handoff.telemedicineChannel) return null;
  const rate =
    pharmacist.methodRates[
      handoff.telemedicineChannel as keyof typeof pharmacist.methodRates
    ] ?? 0;
  if (rate === 0) return null;
  if (handoff.telemedicineStartTime && handoff.telemedicineEndTime) {
    const mins = Math.round(
      (new Date(handoff.telemedicineEndTime).getTime() -
        new Date(handoff.telemedicineStartTime).getTime()) /
        60000,
    );
    return { rate, duration: mins, total: mins * rate, isActual: true };
  }
  const duration =
    handoff.consultDurationMinutes ?? pharmacist.consultDurations?.[0] ?? 30;
  return { rate, duration, total: duration * rate, isActual: false };
}

export function ActiveHandoffCard({
  handoff,
  pharmacyName,
  pharmacist,
}: {
  handoff: PatientHandoffType;
  pharmacyName: string;
  pharmacist?: PharmacistType | null;
}) {
  const current = stepIndex(handoff.status);
  const isRejected = handoff.status === "rejected";
  const isTele = handoff.requestType === "telemedicine";
  const [showConsult, setShowConsult] = useState(false);

  const requestedAt = formatThaiDateTime(
    handoff.telemedicineRequestTime ?? handoff.createAt,
  );
  const appointmentAt = formatThaiDateTime(handoff.appointmentTime);
  const startedAt = formatThaiDateTime(
    handoff.telemedicineStartTime,
  );
  const tokens = computeTokens(handoff, pharmacist);

  return (
    <Card
      className={cn(
        "mb-4 border-2 overflow-hidden transition-all duration-300",
        isRejected
          ? "border-destructive/40 bg-destructive/5"
          : "border-primary/30 bg-primary/5",
      )}
    >
      <CardContent className="p-5">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <p className="font-bold text-base leading-tight">
                {isTele ? "เภสัชทางไกล" : "คำขอที่ร้านยา"}
              </p>
              {handoff.requestType && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold border border-primary/20">
                  {REQUEST_TYPE_LABEL[handoff.requestType]}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Store className="h-3 w-3" />
              {pharmacyName || "ร้านยา"}
            </p>
          </div>
          <Badge
            variant={
              isRejected ? "destructive" : STATUS_VARIANT[handoff.status]
            }
          >
            {STATUS_LABEL[handoff.status]}
          </Badge>
        </div>

        {/* ── Progress stepper ── */}
        {!isRejected && (
          <div className="mb-4">
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
          </div>
        )}

        {/* ── Channel banner ── */}
        {(handoff.telemedicineChannel || handoff.requestType) && (
          <div className="flex items-center gap-2 mb-3">
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border",
                handoff.telemedicineChannel === "video"
                  ? "bg-violet-500/10 text-violet-600 border-violet-400/25"
                  : handoff.telemedicineChannel === "phone"
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-400/25"
                    : handoff.telemedicineChannel === "chat"
                      ? "bg-blue-500/10 text-blue-600 border-blue-400/25"
                      : "bg-muted text-muted-foreground border-border/40",
              )}
            >
              <ChannelIcon
                channel={handoff.telemedicineChannel}
                className="h-3.5 w-3.5"
              />
              {handoff.telemedicineChannel
                ? CHANNEL_LABEL[handoff.telemedicineChannel]
                : REQUEST_TYPE_LABEL[handoff.requestType ?? "in_store"]}
            </div>
          </div>
        )}

        {/* ── Detail grid ── */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div className="rounded-lg bg-background/60 p-3 border border-border/40">
            <p className="text-muted-foreground mb-1 font-medium">อาการ</p>
            <p className="text-foreground line-clamp-2">
              {handoff.symptoms.join(", ") || "—"}
            </p>
          </div>
          <div className="rounded-lg bg-background/60 p-3 border border-border/40">
            <p className="text-muted-foreground mb-1 font-medium">ช่องทาง</p>
            <div className="flex items-center gap-1.5">
              <ChannelIcon
                channel={handoff.telemedicineChannel}
                className="h-3.5 w-3.5 text-primary"
              />
              <span className="font-semibold">
                {handoff.telemedicineChannel
                  ? CHANNEL_LABEL[handoff.telemedicineChannel]
                  : REQUEST_TYPE_LABEL[handoff.requestType ?? "in_store"]}
              </span>
            </div>
          </div>
          {requestedAt && (
            <div className="rounded-lg bg-background/60 p-3 border border-border/40">
              <p className="text-muted-foreground mb-1 font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" /> ส่งคำขอ
              </p>
              <p className="text-foreground">{requestedAt}</p>
            </div>
          )}
          {appointmentAt ? (
            <div className="rounded-lg bg-background/60 p-3 border border-border/40">
              <p className="text-muted-foreground mb-1 font-medium flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> นัดหมาย
              </p>
              <p className="text-foreground font-semibold">{appointmentAt}</p>
              {tokens &&
                handoff.appointmentTime &&
                (() => {
                  const start = new Date(handoff.appointmentTime);
                  const end = new Date(
                    start.getTime() + tokens.duration * 60000,
                  );
                  const fmt = (d: Date) =>
                    `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
                  return (
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {fmt(start)} – {fmt(end)}
                      <span className="text-muted-foreground ml-1">
                        ({tokens.duration} นาที)
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

        {/* ── Token cost ── */}
        {isTele && tokens && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/8 border border-primary/20 px-3 py-2.5 text-xs mb-3">
            <Coins className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">
              {tokens.isActual ? "โทเคนที่ใช้:" : "ประมาณการ:"}
            </span>
            <span className="font-black text-primary text-sm">
              {tokens.total}
            </span>
            <span className="text-muted-foreground">
              ({tokens.duration} นาที × {tokens.rate}/นาที)
            </span>
            {!tokens.isActual && (
              <span className="ml-auto text-[10px] text-muted-foreground/70 italic">
                ยังไม่ยืนยัน
              </span>
            )}
          </div>
        )}

        {/* ── Patient note ── */}
        {handoff.telemedicinePatientNote && (
          <div className="rounded-lg bg-muted/40 border border-border/40 px-3 py-2 text-xs mb-3 flex items-start gap-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground leading-relaxed line-clamp-2">
              {handoff.telemedicinePatientNote}
            </span>
          </div>
        )}

        {/* ── Status banners ── */}
        {handoff.status === "sent" && (
          <div className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 px-3 py-2 text-xs text-warning">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
            <span>รอเภสัชกรรับเรื่อง — โดยปกติใช้เวลาไม่เกิน 5 นาที</span>
          </div>
        )}
        {handoff.status === "accepted" && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-xs text-primary">
            <Activity className="h-3.5 w-3.5 animate-pulse shrink-0" />
            <span>เภสัชกรกำลังตรวจสอบข้อมูลของคุณ</span>
          </div>
        )}
        {handoff.status === "ready" && (
          <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-3 py-2 text-xs text-success font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>ยาพร้อมรับแล้ว — กรุณามารับที่ร้าน</span>
          </div>
        )}
        {handoff.status === "rejected" && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>คำขอถูกปฏิเสธ — กรุณาลองใหม่หรือเลือกร้านอื่น</span>
          </div>
        )}

        {isTele && handoff.status === "accepted" && (
          <>
            <Button
              size="sm"
              className="w-full rounded-xl gap-2 mt-3"
              onClick={() => setShowConsult(true)}
            >
              <ChannelIcon
                channel={handoff.telemedicineChannel}
                className="h-4 w-4"
              />
              เข้าร่วมการปรึกษา
            </Button>
            {showConsult && (
              <ConsultationModal
                handoffId={handoff._id}
                channel={handoff.telemedicineChannel ?? "chat"}
                pharmacyName={pharmacyName}
                patientName={handoff.patientName}
                appointmentTime={handoff.appointmentTime}
                onClose={() => setShowConsult(false)}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ConsultCard({
  h,
  rph,
  hTokens,
  pharmacyNameStr,
}: {
  h: PatientHandoffType;
  rph: PharmacistType | null | undefined;
  hTokens: ReturnType<typeof computeTokens>;
  pharmacyNameStr: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showConsult, setShowConsult] = useState(false);
  const reqAt = formatThaiDateTime(
    h.telemedicineRequestTime ?? h.createAt,
  );
  const apptAt = formatThaiDateTime(h.appointmentTime);

  return (
    <Card className="border-secondary/30 bg-secondary/5 overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Row 1: avatar + name + status */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Avatar
                src={rph ? PHARMACIST_PHOTOS[rph._id] : undefined}
                name={rph?.name ?? pharmacyNameStr}
                size="md"
                className="ring-2 ring-background shadow-md"
              />
              {rph && (
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                    rph.availability === "online"
                      ? "bg-success"
                      : rph.availability === "busy"
                        ? "bg-warning"
                        : "bg-muted-foreground",
                  )}
                />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <p className="font-semibold text-sm leading-tight">
                  {rph?.name ?? pharmacyNameStr}
                </p>
                {rph && (
                  <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                )}
              </div>
              {rph && (
                <p className="text-[11px] text-primary font-semibold">
                  {rph.specialties[0]}
                </p>
              )}
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                {h.telemedicineChannel && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary font-semibold border border-secondary/25 flex items-center gap-1">
                    <ChannelIcon
                      channel={h.telemedicineChannel}
                      className="h-2.5 w-2.5"
                    />
                    {CHANNEL_LABEL[h.telemedicineChannel]}
                  </span>
                )}
                {h.requestType && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border border-border/40">
                    {REQUEST_TYPE_LABEL[h.requestType]}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge variant={STATUS_VARIANT[h.status]} className="shrink-0">
            {STATUS_LABEL[h.status]}
          </Badge>
        </div>

        {/* Pharmacist stats row */}
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

        {/* Pharmacist specialties */}
        {rph && (
          <div className="flex flex-wrap gap-1">
            {rph.specialties.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Time info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {reqAt && (
            <div className="rounded-lg bg-background/70 border border-border/40 px-2.5 py-2">
              <p className="text-muted-foreground flex items-center gap-1 mb-0.5">
                <Clock className="h-3 w-3" /> ส่งคำขอ
              </p>
              <p className="font-medium">{reqAt}</p>
            </div>
          )}
          {apptAt ? (
            <div className="rounded-lg bg-background/70 border border-border/40 px-2.5 py-2">
              <p className="text-muted-foreground flex items-center gap-1 mb-0.5">
                <CalendarDays className="h-3 w-3" /> นัดหมาย
              </p>
              <p className="font-semibold text-primary">{apptAt}</p>
              {hTokens &&
                h.appointmentTime &&
                (() => {
                  const start = new Date(h.appointmentTime);
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
          ) : (
            <div className="rounded-lg bg-background/70 border border-border/40 px-2.5 py-2">
              <p className="text-muted-foreground flex items-center gap-1 mb-0.5">
                <Info className="h-3 w-3" /> อาการ
              </p>
              <p className="font-medium line-clamp-1">
                {h.symptoms.join(", ") || "—"}
              </p>
            </div>
          )}
        </div>

        {/* Token cost */}
        {hTokens && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/8 border border-primary/20 px-3 py-2 text-xs">
            <Coins className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground">
              {hTokens.isActual ? "โทเคนที่ใช้:" : "ประมาณการ:"}
            </span>
            <span className="font-black text-primary">{hTokens.total}</span>
            <span className="text-muted-foreground">
              ({hTokens.duration} นาที × {hTokens.rate}/นาที)
            </span>
            {!hTokens.isActual && (
              <span className="ml-auto text-[10px] text-muted-foreground/60 italic">
                ยังไม่ยืนยัน
              </span>
            )}
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
                {/* All 3 channel rates */}
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
                            h.telemedicineChannel === k
                              ? "bg-primary/10 border-primary/30"
                              : "bg-muted/40 border-border/40",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-3.5 w-3.5",
                              h.telemedicineChannel === k
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
                                h.telemedicineChannel === k
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

                {/* Languages & Insurance */}
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

                {/* License + workplace */}
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

                {/* Bio */}
                {rph.bio && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {rph.bio}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Patient note */}
        {h.telemedicinePatientNote && (
          <div className="flex items-start gap-2 rounded-lg bg-muted/40 border border-border/40 px-2.5 py-2 text-xs">
            <FileText className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-muted-foreground line-clamp-2 leading-relaxed">
              {h.telemedicinePatientNote}
            </span>
          </div>
        )}

        {/* Status banner */}
        {h.status === "sent" && (
          <div className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 px-2.5 py-2 text-xs text-warning">
            <Loader2 className="h-3 w-3 animate-spin shrink-0" />
            <span>รอเภสัชกรรับเรื่อง</span>
          </div>
        )}
        {h.status === "accepted" && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-2 text-xs text-primary">
            <Activity className="h-3 w-3 animate-pulse shrink-0" />
            <span>เภสัชกรกำลังตรวจสอบข้อมูลของคุณ</span>
          </div>
        )}

        {h.requestType === "telemedicine" && h.status === "accepted" && (
          <>
            <Button
              size="sm"
              className="w-full rounded-xl gap-2"
              onClick={() => setShowConsult(true)}
            >
              <ChannelIcon
                channel={h.telemedicineChannel}
                className="h-4 w-4"
              />
              เข้าร่วมการปรึกษา
            </Button>
            {showConsult && (
              <ConsultationModal
                handoffId={h._id}
                channel={h.telemedicineChannel ?? "chat"}
                pharmacyName={pharmacyNameStr}
                patientName={h.patientName}
                appointmentTime={h.appointmentTime}
                onClose={() => setShowConsult(false)}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ConsultTabJoinButton({
  handoff,
  pName,
}: {
  handoff: PatientHandoffType;
  pName: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <Button
        size="sm"
        className="w-full rounded-xl gap-2"
        onClick={() => setShow(true)}
      >
        <ChannelIcon
          channel={handoff.telemedicineChannel}
          className="h-4 w-4"
        />
        เข้าร่วมการปรึกษา
      </Button>
      {show && (
        <ConsultationModal
          handoffId={handoff._id}
          channel={handoff.telemedicineChannel ?? "chat"}
          pharmacyName={pName}
          patientName={handoff.patientName}
          appointmentTime={handoff.appointmentTime}
          onClose={() => setShow(false)}
        />
      )}
    </>
  );
}

export function HistoryCard({
  handoff,
  pharmacyName,
  pharmacist,
}: {
  handoff: PatientHandoffType;
  pharmacyName: string;
  pharmacist?: PharmacistType | null;
}) {
  const tokens = computeTokens(handoff, pharmacist);
  const [expanded, setExpanded] = useState(false);
  const isTele = handoff.requestType === "telemedicine";

  const date = handoff.createAt
    ? new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(handoff.createAt))
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
                  channel={handoff.telemedicineChannel}
                  className="h-5 w-5 text-secondary"
                />
              ) : (
                <Store className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="font-semibold text-sm truncate">
                  {pharmacyName || "ร้านยา"}
                </p>
                <Badge
                  variant={STATUS_VARIANT[handoff.status]}
                  className="text-[10px] shrink-0"
                >
                  {STATUS_LABEL[handoff.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5 mb-0.5">
                <p className="text-xs text-muted-foreground">{date}</p>
                {handoff.telemedicineChannel && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/12 text-secondary font-semibold border border-secondary/25">
                    <ChannelIcon
                      channel={handoff.telemedicineChannel}
                      className="h-2.5 w-2.5"
                    />
                    {CHANNEL_LABEL[handoff.telemedicineChannel]}
                  </span>
                )}
                {!handoff.telemedicineChannel &&
                  handoff.requestType &&
                  handoff.requestType !== "telemedicine" && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium border border-border/40">
                      {REQUEST_TYPE_LABEL[handoff.requestType]}
                    </span>
                  )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                อาการ: {handoff.symptoms.join(", ") || "—"}
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
            {handoff.requestType && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ประเภทคำขอ</span>
                <span className="font-medium">
                  {REQUEST_TYPE_LABEL[handoff.requestType]}
                </span>
              </div>
            )}
            {handoff.telemedicineChannel && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ช่องทางการปรึกษา</span>
                <span className="font-medium flex items-center gap-1">
                  <ChannelIcon
                    channel={handoff.telemedicineChannel}
                    className="h-3 w-3"
                  />
                  {CHANNEL_LABEL[handoff.telemedicineChannel]}
                </span>
              </div>
            )}
            {tokens && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {tokens.isActual ? "โทเคนที่ใช้" : "ประมาณการโทเคน"}
                </span>
                <span className="font-bold text-primary flex items-center gap-1">
                  {tokens.total}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    ({tokens.duration}นาที × {tokens.rate})
                  </span>
                </span>
              </div>
            )}
            {handoff.allergies && handoff.allergies.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">การแพ้</span>
                <span className="font-medium">
                  {handoff.allergies.join(", ")}
                </span>
              </div>
            )}
            {handoff.conditions && handoff.conditions.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">โรคประจำตัว</span>
                <span className="font-medium">
                  {handoff.conditions.join(", ")}
                </span>
              </div>
            )}
            {handoff.medications && handoff.medications.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">ยาที่ใช้อยู่</span>
                <span className="font-medium">
                  {handoff.medications.join(", ")}
                </span>
              </div>
            )}
            {handoff.aiSummary && (
              <div>
                <p className="text-muted-foreground mb-1">สรุป AI</p>
                <p className="rounded-lg bg-muted/50 px-3 py-2 leading-relaxed">
                  {handoff.aiSummary}
                </p>
              </div>
            )}
            {handoff.fulfillment && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">การจัดยา</span>
                <span className="font-medium">{handoff.fulfillment}</span>
              </div>
            )}
            {handoff.appointmentTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">เวลานัดหมาย</span>
                <span className="font-medium">
                  {handoff.appointmentTime.toString()}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
