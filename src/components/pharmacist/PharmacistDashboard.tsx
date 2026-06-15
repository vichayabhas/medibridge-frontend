"use client";
import { Inbox, Package, Clock, User, Bell, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
// import { supabase } from "@/lib/supabase";
import React from "react";
import { cn, getBackendUrl, SocketReady } from "../utility/setup";
import HandoffCard from "./HandoffCard";
import EmptyActive from "./EmptyActive";
import EmptyCompleted from "./EmptyCompleted";
import {
  GetPharmacistData,
  PatientHandoffType,
  PharmacistType,
} from "../../../interface";
import { io } from "socket.io-client";
import updatePatientHandoff from "@/libs/patientHandoff/updatePatientHandoff";
import updatePharmacistProfile from "@/libs/user/updatePharmacistProfile";
const socket = io(getBackendUrl());

export type HandoffStatus =
  | "sent"
  | "accepted"
  | "ready"
  | "completed"
  | "rejected";

// export interface HandoffItem {
//   id: string;
//   patientName: string;
//   symptoms: string[];
//   duration: string;
//   conditions: string[];
//   medications: string[];
//   allergies: string[];
//   patientSummary: string;
//   pharmacyId: string;
//   pharmacistId: string | null;
//   appointmentTime: string;
//   fulfillment: string;
//   suggestedAction?: string;
//   status: string;
//   createdAt: string;
// }
export type HandoffItem = PatientHandoffType;

/* ─── Handoff card ────────────────────────────────────────────────────── */

/* ─── Empty states ────────────────────────────────────────────────────── */

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function PharmacistDashboard({
  data,
  token,
}: {
  data: GetPharmacistData;
  token: string;
}) {
  const [pharmacist, setPharmacist] = React.useState(data.pharmacist);
  const [handoffs, setHandoffs] = React.useState<PatientHandoffType[]>(
    data.handoffs,
  );
  const [activeTab, setActiveTab] = React.useState<"active" | "completed">(
    "active",
  );
  const [editProfile, setEditProfile] = React.useState(false);
  // const [pharmacistName, setPharmacistName] = useState(data.pharmacist.name);
  // const [pharmacistLicense, setPharmacistLicense] = useState(
  //   data.pharmacist.licenseNo,
  // );
  // const [isOnline, setIsOnline] = useState(true);
  const [name, setDraftName] = React.useState(pharmacist.name);
  const [licenseNo, setDraftLicense] = React.useState(pharmacist.licenseNo);
  const [availability, setDraftOnline] = React.useState(
    pharmacist.availability,
  );
  const handoffSocket = new SocketReady<PatientHandoffType[]>(
    socket,
    "handoff",
    data.pharmacist._id,
  );
  const pharmacistSocket = new SocketReady<PharmacistType>(
    socket,
    "update-pharmacistProfile",
    data.pharmacist._id,
  );
  React.useEffect(() => {
    handoffSocket.listen(setHandoffs);
    pharmacistSocket.listen(setPharmacist);
    return () => {
      handoffSocket.disconnect();
      pharmacistSocket.disconnect();
    };
  });

  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem("medibridge.pharmacistProfile");
  //     if (!raw) return;
  //     const parsed = JSON.parse(raw) as {
  //       name?: string;
  //       license?: string;
  //       online?: boolean;
  //     };
  //     if (parsed.name) setPharmacistName(parsed.name);
  //     if (parsed.license) setPharmacistLicense(parsed.license);
  //     if (typeof parsed.online === "boolean") setIsOnline(parsed.online);
  //   } catch {
  //     // ignore invalid local storage format
  //   }
  // }, []);

  // useEffect(() => {
  //   if (!editProfile) {
  //     setDraftName(pharmacistName);
  //     setDraftLicense(pharmacistLicense);
  //     setDraftOnline(isOnline);
  //   }
  // }, [editProfile, pharmacistName, pharmacistLicense, isOnline]);

  // useEffect(() => {
  //   supabase
  //     .from("patient_handoffs")
  //     .select("*")
  //     .order("created_at", { ascending: false })
  //     .then(({ data }) => {
  //       if (data) {
  //         setHandoffs(
  //           data.map((row) => ({
  //             id: row.id,
  //             patientName: row.patient_name,
  //             symptoms: row.symptoms ?? [],
  //             duration: row.duration ?? "",
  //             conditions: row.conditions ?? [],
  //             medications: row.medications ?? [],
  //             allergies: row.allergies ?? [],
  //             patientSummary: row.patient_summary ?? row.ai_summary ?? "",
  //             pharmacyId: row.pharmacy_id ?? "",
  //             pharmacistId: row.pharmacist_id ?? null,
  //             appointmentTime: row.appointment_time ?? "",
  //             fulfillment: row.fulfillment ?? "",
  //             suggestedAction: row.suggested_action ?? "",
  //             status: row.status,
  //             createdAt: row.created_at,
  //           }))
  //         );
  //       }
  //     });
  // }, []);

  const handleStatusChange = async (id: string, newStatus: HandoffStatus) => {
    // setHandoffs((prev) =>
    //   prev.map((h) => (h._id === id ? { ...h, status: newStatus } : h)),
    // );
    const newData = await updatePatientHandoff(id, { status: newStatus });
    handoffSocket.trigger(newData);
  };

  // const handleSaveProfile = () => {
  //   const nextName = draftName.trim() || pharmacistName;
  //   const nextLicense = draftLicense.trim() || pharmacistLicense;
  //   setPharmacistName(nextName);
  //   setPharmacistLicense(nextLicense);
  //   setIsOnline(draftOnline);
  //   localStorage.setItem(
  //     "medibridge.pharmacistProfile",
  //     JSON.stringify({
  //       name: nextName,
  //       license: nextLicense,
  //       online: draftOnline,
  //     }),
  //   );
  //   setEditProfile(false);
  // };

  const handleCancelEdit = () => {
    setDraftName(pharmacist.name);
    setDraftLicense(pharmacist.licenseNo);
    setDraftOnline(pharmacist.availability);
    setEditProfile(false);
  };

  const active = handoffs.filter(
    (h) => !["completed", "rejected"].includes(h.status),
  );
  const completed = handoffs.filter((h) =>
    ["completed", "rejected"].includes(h.status),
  );
  const pending = handoffs.filter((h) => h.status === "sent").length;
  const ready = handoffs.filter((h) => h.status === "ready").length;
  const inProgress = handoffs.filter((h) => h.status === "accepted").length;

  return (
    <div className="pt-16 pb-24 md:pb-10 min-h-screen bg-muted/25">
      {/* ── Top bar ── */}
      <div className="sticky top-16 z-30 border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-sm">
        <div className="container max-w-2xl py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-0.5">
                <h1 className="text-xl font-bold tracking-tight">
                  แดชบอร์ดเภสัชกร
                </h1>
                {pending > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white text-[10px] font-bold pulse-ring">
                    {pending}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                ฟาสซิโน ฟาร์มาซี · สาขาสยามสแควร์
              </p>
            </div>

            <div className="relative">
              <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/40 hover:bg-muted transition-colors shadow-sm tap-target">
                <Bell className="h-4.5 w-4.5 text-muted-foreground" />
              </button>
              {pending > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive border-2 border-background" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-2xl py-6">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "รอรับเรื่อง",
              value: pending,
              color: "text-primary",
              bg: "bg-primary/8 border-primary/15",
              icon: Inbox,
            },
            {
              label: "กำลังเตรียม",
              value: inProgress,
              color: "text-warning",
              bg: "bg-warning/8 border-warning/15",
              icon: Clock,
            },
            {
              label: "ยาพร้อมรับ",
              value: ready,
              color: "text-secondary",
              bg: "bg-secondary/8 border-secondary/15",
              icon: Package,
            },
          ].map((s) => (
            <Card
              key={s.label}
              className="border-border/40 shadow-[var(--shadow-card)]"
            >
              <CardContent className="p-4 text-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl border mx-auto mb-2.5",
                    s.bg,
                  )}
                >
                  <s.icon className={cn("h-4.5 w-4.5", s.color)} />
                </div>
                <p
                  className={cn(
                    "text-3xl font-black mb-0.5 tabular-nums",
                    s.color,
                  )}
                >
                  {s.value}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {s.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex rounded-2xl border border-border/50 bg-muted/50 p-1 mb-5">
          {[
            { key: "active" as const, label: `งานที่รอ (${active.length})` },
            {
              key: "completed" as const,
              label: `เสร็จสิ้น (${completed.length})`,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 tap-target",
                activeTab === t.key
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Handoff list ── */}
        <div className="space-y-3 mb-8">
          {activeTab === "active" ? (
            active.length > 0 ? (
              active.map((h) => (
                <HandoffCard
                  key={h._id}
                  item={h}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <EmptyActive />
            )
          ) : completed.length > 0 ? (
            completed.map((h) => (
              <HandoffCard
                key={h._id}
                item={h}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <EmptyCompleted />
          )}
        </div>

        {/* ── Pharmacist info card ── */}
        <Card className="border-border/40 shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-4">
              ข้อมูลเภสัชกร
            </p>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80"
                  name={pharmacist.name}
                  size="lg"
                  className="ring-2 ring-background shadow-md"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-success border-2 border-background" />
              </div>
              <div className="flex-1 min-w-0">
                {editProfile ? (
                  <div className="space-y-2">
                    <Input
                      value={name}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      value={licenseNo}
                      onChange={(e) => setDraftLicense(e.target.value)}
                      className="w-44"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={availability ? "default" : "outline"}
                        className="rounded-xl"
                        onClick={() => setDraftOnline("online")}
                      >
                        ออนไลน์
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!availability ? "default" : "outline"}
                        className="rounded-xl"
                        onClick={() => setDraftOnline("offline")}
                      >
                        ออฟไลน์
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={!availability ? "default" : "outline"}
                        className="rounded-xl"
                        onClick={() => setDraftOnline("busy")}
                      >
                        ไม่ว่าง
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        className="rounded-xl"
                        onClick={async () => {
                          const newData = await updatePharmacistProfile(
                            { licenseNo, name, availability },
                            token,
                          );
                          pharmacistSocket.trigger(newData);
                        }}
                      >
                        บันทึก
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={handleCancelEdit}
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold">{pharmacist.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-primary mt-0.5">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      <span className="font-semibold">
                        เภสัชเลขที่ {pharmacist.licenseNo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="success"
                        dot={pharmacist.availability ? "online" : undefined}
                        className="text-[10px]"
                      >
                        {pharmacist.availability == "online"
                          ? "ออนไลน์"
                          : pharmacist.availability == "busy"
                            ? "ไม่ว่าง"
                            : "ออฟไลน์"}
                      </Badge>
                    </div>
                  </>
                )}
              </div>

              {!editProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl shrink-0 shadow-sm"
                  onClick={() => {
                    setEditProfile(true);
                    setDraftLicense(pharmacist.licenseNo);
                    setDraftName(pharmacist.name);
                    setDraftOnline(pharmacist.availability);
                  }}
                >
                  <User className="h-4 w-4 mr-1.5" />
                  แก้ไข
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
