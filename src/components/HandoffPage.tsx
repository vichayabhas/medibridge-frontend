"use client";
import React from "react";
import {
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Video,
  MessageSquareText,
  User,
  AlertTriangle,
  ChevronLeft,
  Shield,
  Lock,
  BadgeCheck,
  Pill,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { type PatientRequestType, type TelemedicineChannel, savePatientHandoff, hasPendingHandoff } from "@/lib/patientHandoffs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCachedOverpassPharmacy } from "./nearby/overpassPharmacies";
import { PatientRequestType, TelemedicineChannel } from "../../interface";
import { cn, getBackendUrl, SocketReady } from "./utility/setup";
import savePatientHandoff from "@/libs/patientHandoff/savePatientHandoff";
import hasPendingHandoff from "@/libs/patientHandoff/hasPendingHandoff";
import { io } from "socket.io-client";

const MOCK_SUMMARY = {
  name: "นายสมชาย ใจดี",
  symptoms: ["ปวดหัว", "ไข้ 38.5°C", "เจ็บคอ"],
  duration: "2 วัน",
  conditions: ["ความดันโลหิตสูง"],
  medications: ["Amlodipine 5mg"],
  allergies: ["Penicillin"],
  pharmacy: "ฟาสซิโน ฟาร์มาซี สาขาสยามสแควร์",
  pharmacist: "ภญ.สุธิดา วงศ์สิริมงคล",
  licenseNo: "ภ.12345",
};

const TIME_SLOTS = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

/* ─── Success state ───────────────────────────────────────────────────── */
function SuccessState({
  pharmacy,
  selectedTime,
  requestType,
}: {
  pharmacy: string;
  selectedTime: string;
  requestType: PatientRequestType;
}) {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-sm w-full reveal-up">
        {/* Success icon with rings */}
        <div className="relative mx-auto mb-8 w-24 h-24 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-success/8 animate-ping"
            style={{ animationDuration: "2s" }}
          />
          <div className="absolute inset-2 rounded-full bg-success/12" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success/10 border-2 border-success/30">
            <CheckCircle2 className="h-9 w-9 text-success" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2 tracking-tight">
          ส่งข้อมูลสำเร็จ!
        </h1>
        <p className="text-muted-foreground mb-2 leading-[1.85]">
          เภสัชกรที่{" "}
          <span className="font-semibold text-foreground">{pharmacy}</span>{" "}
          ได้รับข้อมูลของคุณแล้ว
        </p>
        <p className="text-muted-foreground mb-8">
          {requestType === "telemedicine"
            ? "นัดหมาย Telemedicine เวลา "
            : "นัดรับยาเวลา "}
          <span className="font-black text-primary text-xl">
            {selectedTime} น.
          </span>
        </p>

        {/* Pharmacist confirmed */}
        <Card className="mb-6 border-primary/20 bg-mint/50 text-left">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 font-bold text-primary text-sm">
                ภ
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{MOCK_SUMMARY.pharmacist}</p>
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <BadgeCheck className="h-3 w-3" />
                  {MOCK_SUMMARY.licenseNo} · กำลังรับทราบข้อมูล
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next steps */}
        <Card className="mb-6 border-border/40 text-left">
          <CardContent className="p-5">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              ขั้นตอนถัดไป
            </h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              {[
                "เภสัชกรจะรีวิวข้อมูลและเตรียมคำแนะนำตามอาการ",
                requestType === "telemedicine"
                  ? `เภสัชกรจะติดต่อผ่านช่องทางที่เลือกในเวลา ${selectedTime} น.`
                  : `ไปถึงร้านตามเวลานัด ${selectedTime} น. แจ้งชื่อ-นามสกุล`,
                requestType === "telemedicine"
                  ? "หลังคุยจบสามารถนัดรับยาที่ร้านหรือรับคำแนะนำต่อได้"
                  : "รับยาและชำระเงินที่ร้าน (ไม่มีการจ่ายเงินออนไลน์)",
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-[1.75]">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Privacy confirmation */}
        <div className="flex items-center gap-2 justify-center mb-8 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-success" />
          ข้อมูลถูกส่งเข้ารหัสอย่างปลอดภัย
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button className="w-full rounded-2xl shadow-md shadow-primary/20">
              กลับหน้าหลัก
            </Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline" className="w-full rounded-2xl">
              ดูประวัติการปรึกษา
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
const socket = io(getBackendUrl());
/* ─── Main page ───────────────────────────────────────────────────────── */
export default function HandoffPage({ token }: { token: string }) {
  const searchParams = useSearchParams();

  // 1. Get initial state from URL

  const navigate = useRouter();
  // const [searchParams] = useSearchParams();
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
  const [requestType, setRequestType] =
    React.useState<PatientRequestType>("in_store");
  const [telemedicineChannel, setTelemedicineChannel] =
    React.useState<TelemedicineChannel>("chat");
  const [telemedicinePatientNote, setTelemedicinePatientNote] =
    React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [pendingError, setPendingError] = React.useState<string | null>(null);
  // const [checkingPending, setCheckingPending] = useState(true);
  const pharmacyId = searchParams.get("pharmacyId");
  const osmPharmacy = pharmacyId ? getCachedOverpassPharmacy(pharmacyId) : null;
  const destination = {
    id: osmPharmacy?._id ?? "pharm-001",
    name: osmPharmacy?.name ?? MOCK_SUMMARY.pharmacy,
    pharmacist: osmPharmacy ? "เภสัชกรประจำร้าน" : MOCK_SUMMARY.pharmacist,
    licenseNo: osmPharmacy ? "OpenStreetMap" : MOCK_SUMMARY.licenseNo,
  };

  // Check for pending handoffs on page load
  React.useEffect(() => {
    const checkPending = async () => {
      const hasPending = await hasPendingHandoff(token);
      if (hasPending) {
        setPendingError(
          "คุณมีคำขอที่กำลังดำเนินการอยู่แล้ว กรุณารอให้เสร็จสิ้นก่อนส่งคำขอใหม่",
        );
      }
      // setCheckingPending(false);
    };
    checkPending();
  }, []);

  const handleSend = async () => {
    if (!selectedTime) return;
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const appointmentDate = new Date();
    appointmentDate.setHours(hours, minutes, 0, 0);
    const telemedicineCollectedData = {
      patientName: MOCK_SUMMARY.name,
      symptoms: MOCK_SUMMARY.symptoms,
      duration: MOCK_SUMMARY.duration,
      conditions: MOCK_SUMMARY.conditions,
      medications: MOCK_SUMMARY.medications,
      allergies: MOCK_SUMMARY.allergies,
      pharmacy: destination.name,
      pharmacist: destination.pharmacist,
      licenseNo: destination.licenseNo,
      requestType,
      telemedicineChannel:
        requestType === "telemedicine" ? telemedicineChannel : null,
      appointmentTime: appointmentDate.toISOString(),
      selectedTime,
      patientNote:
        requestType === "telemedicine"
          ? telemedicinePatientNote.trim() || null
          : null,
    };

    // Check for pending handoffs before sending
    const hasPending = await hasPendingHandoff(token);
    if (hasPending) {
      setPendingError(
        "คุณมีคำขอที่กำลังดำเนินการอยู่แล้ว กรุณารอให้เสร็จสิ้นก่อนส่งคำขอใหม่",
      );
      return;
    }

    setSending(true);
    const result = await savePatientHandoff(
      {
        patientName: "คุณสมชาย ใจดี",
        age: 34,
        symptoms: ["ปวดหัว", "ไข้ 38.5°C", "เจ็บคอ"],
        duration: "2 วัน",
        allergies: ["Penicillin"],
        conditions: ["ความดันโลหิตสูง"],
        appointmentTime: appointmentDate,
        requestType,
        telemedicineChannel,
        telemedicinePatientNote: telemedicinePatientNote.trim(),
        telemedicineCollectedData,
        patientSummary: `${MOCK_SUMMARY.symptoms.join(", ")} · ${MOCK_SUMMARY.duration}`,
        status: "sent",
        aiSummary:
          "ผู้ใช้มีอาการปวดหัว ไข้ประมาณ 38.5°C และเจ็บคอมา 2 วัน มีโรคประจำตัวความดันโลหิตสูง และแจ้งประวัติแพ้ Penicillin",
        suggestedAction:
          "เภสัชกรควรตรวจประวัติแพ้ยาและยาความดันที่ใช้อยู่ก่อนแนะนำยา ลดไข้/บรรเทาอาการ และประเมิน red flag ซ้ำ",
        pharmacyId: destination.id,
        gender: "",
        medications: [],
        pharmacistId: "",
        fulfillment: "",
        telemedicineRequestTime: new Date(),
        telemedicineStartTime: new Date(),
        telemedicineEndTime: new Date(),
        consultDurationMinutes: 0,
      },
      token,
    );
    setSending(false);

    if (!(result instanceof Array)) {
      setPendingError(result.error || "ไม่สามารถส่งคำขอได้");
      return;
    }
    SocketReady.trigger(result, "handoff", destination.id, socket);

    setSent(true);
  };

  if (sent) {
    return (
      <SuccessState
        pharmacy={destination.name}
        selectedTime={selectedTime!}
        requestType={requestType}
      />
    );
  }

  return (
    <div className="pt-20 pb-28 md:pb-12 min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        {/* Back */}
        <button
          onClick={() => navigate.push("../")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          กลับ
        </button>

        {/* Page title */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            ยืนยันและส่งข้อมูล
          </h1>
          <p className="text-muted-foreground leading-[1.85]">
            ตรวจสอบข้อมูลให้ถูกต้องก่อนส่งให้เภสัชกร
          </p>
        </div>

        {/* ── Pending request warning ── */}
        {pendingError && (
          <Card className="mb-5 border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-destructive">
                    ไม่สามารถส่งคำขอได้
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pendingError}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Patient summary card ── */}
        <Card className="mb-5 border-border/40 shadow-[var(--shadow-card)]">
          <CardContent className="p-6">
            <h2 className="font-bold text-base mb-5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              สรุปข้อมูลผู้ป่วย
            </h2>

            <div className="space-y-3.5 text-sm">
              {/* Name */}
              <div className="flex items-start gap-3">
                <span className="text-muted-foreground w-28 shrink-0 pt-0.5">
                  ชื่อ
                </span>
                <span className="font-semibold">{MOCK_SUMMARY.name}</span>
              </div>

              {/* Symptoms */}
              <div className="flex items-start gap-3">
                <span className="text-muted-foreground w-28 shrink-0 pt-1">
                  อาการ
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {MOCK_SUMMARY.symptoms.map((s) => (
                    <Badge key={s} variant="default" className="text-xs">
                      <Activity className="h-2.5 w-2.5 mr-1" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-start gap-3">
                <span className="text-muted-foreground w-28 shrink-0 pt-0.5">
                  ระยะเวลา
                </span>
                <span className="font-semibold">{MOCK_SUMMARY.duration}</span>
              </div>

              {/* Conditions */}
              {MOCK_SUMMARY.conditions.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground w-28 shrink-0 pt-1">
                    โรคประจำตัว
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_SUMMARY.conditions.map((c) => (
                      <Badge key={c} variant="secondary" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Medications */}
              {MOCK_SUMMARY.medications.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-muted-foreground w-28 shrink-0 pt-0.5">
                    ยาที่กิน
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Pill className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold">
                      {MOCK_SUMMARY.medications.join(", ")}
                    </span>
                  </div>
                </div>
              )}

              {/* Allergies — highlighted */}
              {MOCK_SUMMARY.allergies.length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/6 border border-destructive/15">
                  <span className="text-muted-foreground w-28 shrink-0 pt-1">
                    แพ้ยา
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {MOCK_SUMMARY.allergies.map((a) => (
                      <Badge
                        key={a}
                        variant="destructive"
                        className="text-xs gap-1"
                      >
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Destination pharmacy ── */}
        <Card className="mb-5 border-border/40 shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <h2 className="font-bold text-sm mb-4 text-muted-foreground uppercase tracking-wide text-xs">
              ส่งข้อมูลไปที่
            </h2>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold mb-1">{destination.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  <span className="font-semibold">
                    {destination.pharmacist}
                  </span>
                  <span className="text-muted-foreground">
                    · {MOCK_SUMMARY.licenseNo}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Time picker ── */}
        <Card className="mb-5 border-border/40 shadow-[var(--shadow-card)]">
          <CardContent className="p-6">
            <h2 className="font-bold text-base mb-4">รูปแบบการขอคำปรึกษา</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => setRequestType("in_store")}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all",
                  requestType === "in_store"
                    ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                    : "border-border/50 hover:border-primary/35",
                )}
              >
                <p className="font-semibold text-sm">ไปรับคำปรึกษาที่ร้านยา</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  เภสัชกรเตรียมข้อมูลก่อนคุณถึงร้าน
                </p>
              </button>
              <button
                onClick={() => setRequestType("telemedicine")}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all",
                  requestType === "telemedicine"
                    ? "border-primary bg-primary/8 ring-1 ring-primary/20"
                    : "border-border/50 hover:border-primary/35",
                )}
              >
                <p className="font-semibold text-sm">Telemedicine</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  คุยกับเภสัชกรผ่านออนไลน์ก่อน
                </p>
              </button>
            </div>

            {requestType === "telemedicine" && (
              <div className="mt-4 space-y-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                <p className="text-xs font-semibold text-muted-foreground">
                  ช่องทางติดต่อที่ต้องการ
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      key: "chat" as const,
                      label: "แชท",
                      icon: MessageSquareText,
                    },
                    { key: "phone" as const, label: "โทรศัพท์", icon: Phone },
                    { key: "video" as const, label: "วิดีโอ", icon: Video },
                  ].map((channel) => (
                    <button
                      key={channel.key}
                      onClick={() => setTelemedicineChannel(channel.key)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all",
                        telemedicineChannel === channel.key
                          ? "border-primary bg-primary text-white"
                          : "border-border/50 bg-background text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <channel.icon className="h-3.5 w-3.5" />
                      {channel.label}
                    </button>
                  ))}
                </div>

                <textarea
                  className="w-full rounded-xl border border-border/50 bg-background px-3 py-2 text-sm focus:border-primary/40 focus:outline-none"
                  rows={3}
                  placeholder="ข้อมูลเพิ่มเติมสำหรับ Telemedicine (เช่น เวลาที่สะดวก, วิธีติดต่อ)"
                  value={telemedicinePatientNote}
                  onChange={(event) =>
                    setTelemedicinePatientNote(event.target.value)
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Time picker ── */}
        <Card className="mb-5 border-border/40 shadow-[var(--shadow-card)]">
          <CardContent className="p-6">
            <h2 className="font-bold text-base mb-5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
              {requestType === "telemedicine"
                ? "เลือกเวลานัด Telemedicine"
                : "เลือกเวลารับยา (วันนี้)"}
            </h2>

            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={cn(
                    "py-3 rounded-xl text-sm font-semibold border transition-all duration-200 tap-target",
                    selectedTime === t
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/25 scale-[1.02]"
                      : "bg-background border-border/50 hover:border-primary/35 hover:text-primary hover:bg-primary/4",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {selectedTime && (
              <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/8 border border-primary/20 slide-in-bottom">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-semibold text-primary">
                  {requestType === "telemedicine"
                    ? `เลือกเวลานัด ${selectedTime} น. แล้ว`
                    : `เลือกรับยา ${selectedTime} น. แล้ว`}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Data-use notice ── */}
        <Card className="mb-6 border-trust/20 bg-gradient-to-br from-mint/60 to-accent/20">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-trust/10 border border-trust/20">
                <Shield className="h-4 w-4 text-trust" />
              </div>
              <div>
                <p className="font-bold text-sm mb-1.5">การใช้ข้อมูลของคุณ</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground leading-[1.75]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                    ข้อมูลส่งให้เฉพาะร้านยาที่คุณเลือกเท่านั้น
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                    MediBridge เป็นตัวกลางส่งข้อมูล ไม่ขาย ไม่แชร์ข้อมูลส่วนตัว
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                    การจ่ายยาและชำระเงินเกิดขึ้นที่ร้านเท่านั้น
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Submit ── */}
        <Button
          size="lg"
          className={cn(
            "w-full h-14 rounded-2xl gap-2.5 text-base font-bold transition-all duration-300",
            "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35",
            !selectedTime && "opacity-50 cursor-not-allowed",
          )}
          onClick={handleSend}
          disabled={!selectedTime || sending || !!pendingError}
        >
          {sending ? (
            <span className="flex items-center gap-2.5">
              <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              กำลังส่งข้อมูล...
            </span>
          ) : (
            <span className="flex items-center gap-2.5">
              <Send className="h-5 w-5" />
              {requestType === "telemedicine"
                ? "ส่งคำขอ Telemedicine"
                : "ส่งข้อมูลให้ร้านยา"}
              {selectedTime && (
                <span className="text-sm font-normal text-white/70">
                  · {selectedTime} น.
                </span>
              )}
            </span>
          )}
        </Button>

        {!selectedTime && (
          <p className="text-center text-xs text-muted-foreground mt-3">
            {requestType === "telemedicine"
              ? "กรุณาเลือกเวลานัดหมายก่อน"
              : "กรุณาเลือกเวลารับยาก่อน"}
          </p>
        )}

        {pendingError && (
          <p className="text-center text-xs text-destructive mt-3">
            กรุณารอให้คำขอปัจจุบันเสร็จสิ้นก่อนส่งคำขอใหม่
          </p>
        )}
      </div>
    </div>
  );
}
