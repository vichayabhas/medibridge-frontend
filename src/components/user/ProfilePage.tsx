"use client";
import React from "react";
import { useEffect, useState } from "react";
import {
  User,
  Store,
  Stethoscope,
  RefreshCw,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

import { signOut } from "next-auth/react";
import {
  AuthUser,
  PatientHandoffType,
  PharmacistType,
  PharmacyWithDistance,
} from "../../../interface";
import Link from "next/link";
import { cn, getBackendUrl, SocketReady } from "../utility/setup";
import { HistoryCard } from "./HandoffSection";
import { ProfileSection } from "./ProfileSection";
import getPatientHandoffs from "@/libs/patientHandoff/getPatientHandoffs";
import { io } from "socket.io-client";
import updateProfile from "@/libs/user/updateProfile";
// import { useRouter } from "next/navigation";

// ─── Main page ────────────────────────────────────────────────────────────────

type TabType = "store" | "consult" | "profile";

export default function ProfilePage({
  user,
  data: { pharmacies, pharmacists },
  token,
}: {
  user: AuthUser;
  data: { pharmacies: PharmacyWithDistance[]; pharmacists: PharmacistType[] };
  token: string;
}) {
  const socket = io(getBackendUrl());
  const currentUser = user;
  const logout = signOut;
  const pharmacistLookup = Object.fromEntries(
    pharmacists.map((p) => [p._id, p]),
  );

  const [activeTab, setActiveTab] = useState<TabType>("store");
  const [handoffs, setHandoffs] = useState<PatientHandoffType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveProfile, setLiveProfile] = useState(currentUser);
  // const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">("synced");
  const [autoSyncClipboard, setAutoSyncClipboard] = useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const data = await getPatientHandoffs();
    setHandoffs(data.rows);
    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") load(true);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);
  // const router = useRouter();

  // Real-time profile sync from Supabase
  const userSocket = new SocketReady<AuthUser>(
    socket,
    "profile-sync",
    currentUser._id,
  );
  useEffect(() => {
    userSocket.listen(setLiveProfile);
    // if (!currentUser?._id) return;

    // setLiveProfile(currentUser);

    // const channel = supabase
    //   .channel("profile-sync")
    //   .on(
    //     "postgres_changes",
    //     {
    //       event: "*",
    //       schema: "public",
    //       table: "profiles",
    //       filter: `id=eq.${currentUser._id}`,
    //     },
    //     (payload) => {
    //       const newData = payload.new as any;
    //       const updatedProfile = {
    //         _id: newData.id,
    //         name: newData.full_name,
    //         email: newData.email,
    //         phone: newData.phone,
    //         role: newData.role,
    //         createdAt: newData.created_at,
    //         money: (newData.money as number) ?? 0,
    //       };
    //       setLiveProfile(updatedProfile);
    //       setSyncStatus("synced");

    //       // Auto-sync to clipboard if enabled
    //       if (autoSyncClipboard) {
    //         navigator.clipboard.writeText(JSON.stringify(updatedProfile, null, 2));
    //       }
    //     }
    //   )
    //   .subscribe((status) => {
    //     setSyncStatus(status === "SUBSCRIBED" ? "synced" : "error");
    //   });

    return () => {
      userSocket.disconnect();
      // channel.unsubscribe();
    };
  }, [currentUser?._id, autoSyncClipboard]);

  const pharmacyName = (id?: string) => {
    if (!id) return "ร้านยา";
    return pharmacies.find((p) => p._id === id)?.name ?? id;
  };

  const activeHandoffs = handoffs.filter((h) =>
    ["sent", "accepted", "ready"].includes(h.status),
  );
  const historyHandoffs = handoffs.filter((h) =>
    ["completed", "rejected"].includes(h.status),
  );

  // Pharmacy consultations (telemedicine only)
  const consultationHandoffs = handoffs.filter(
    (h) => h.requestType === "telemedicine",
  );
  const activeConsultations = consultationHandoffs.filter((h) =>
    ["sent", "accepted", "ready"].includes(h.status),
  );
  const pastConsultations = consultationHandoffs.filter((h) =>
    ["completed", "rejected"].includes(h.status),
  );

  // Store orders only (no consultations)
  const storeHandoffs = handoffs.filter((h) =>
    ["pickup", "delivery", "in_store"].includes(h.requestType ?? ""),
  );
  const activeStoreHandoffs = storeHandoffs.filter((h) =>
    ["sent", "accepted", "ready"].includes(h.status),
  );
  const historyStoreHandoffs = storeHandoffs.filter((h) =>
    ["completed", "rejected"].includes(h.status),
  );

  // Real stats from handoff data
  const completedCount = historyHandoffs.filter(
    (h) => h.status === "completed",
  ).length;

  // const handleSyncClick = async () => {
  //   setSyncStatus("syncing");
  //   const { data } = await supabase
  //     .from("profiles")
  //     .select("*")
  //     .eq("id", currentUser?._id)
  //     .maybeSingle();
  //   if (data) {
  //     setLiveProfile({
  //       _id: data.id,
  //       name: data.full_name,
  //       email: data.email,
  //       phone: data.phone,
  //       role: data.role,
  //       createdAt: data.created_at,
  //       // money: (data.money as number) ?? 0,
  //     });
  //     setSyncStatus("synced");
  //     navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  //     toast.success("ซิงค์ข้อมูลล่าสุดแล้ว");
  //   }
  // };

  if (!currentUser) {
    return (
      <div className="pt-20 pb-24 md:pb-10 min-h-screen bg-background">
        <div className="container max-w-md py-10">
          <Card className="border-border/50">
            <CardContent className="p-6 text-center">
              <h1 className="text-xl font-bold mb-2">ยังไม่ได้เข้าสู่ระบบ</h1>
              <p className="text-sm text-muted-foreground mb-5">
                กรุณาเข้าสู่ระบบเพื่อดูข้อมูลโปรไฟล์
              </p>
              <Link href="/login">
                <Button className="w-full rounded-xl">ไปหน้าเข้าสู่ระบบ</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 md:pb-10 min-h-screen bg-background">
      <div className="container max-w-2xl py-6">
        {/* Profile header */}
        <Card className="mb-6 border-border/50 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary to-secondary" />
          <CardContent className="p-6 -mt-10">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div className="flex items-end gap-4">
                <div className="relative">
                  <Avatar
                    name={currentUser.name}
                    size="xl"
                    className="ring-4 ring-background shadow-xl"
                  />
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-success border-2 border-background" />
                </div>
                <div className="pb-2">
                  <h1 className="text-xl font-bold">{currentUser.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </div>
              <button
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
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
              {[
                {
                  value: activeHandoffs.length.toString(),
                  label: "คำขอที่รอ",
                  color: "text-warning",
                },
                {
                  value: completedCount.toString(),
                  label: "เสร็จสิ้น",
                  color: "text-success",
                },
                {
                  value: handoffs.length.toString(),
                  label: "คำขอทั้งหมด",
                  color: "text-primary",
                },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tab Switcher */}
        <div className="flex p-1 mb-6 bg-muted/50 rounded-xl">
          {[
            { id: "store", label: "คำขอที่ร้านยา", icon: Store },
            { id: "consult", label: "คำขอปรึกษา", icon: Stethoscope },
            { id: "profile", label: "ข้อมูลส่วนตัว", icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as TabType)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                activeTab === id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === "store" ? (
          <>
            {/* ── Link to dedicated pharmacy tracking page ── */}
            <Card className="mb-6 border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <Link href="/tracking" className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">ติดตามคำขอร้านยา</p>
                    <p className="text-xs text-muted-foreground">
                      ดูสถานะคำขอที่กำลังดำเนินการอยู่
                      {activeStoreHandoffs.length > 0 && (
                        <span className="ml-1.5 font-bold text-primary">
                          ({activeStoreHandoffs.length} รายการ)
                        </span>
                      )}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              </CardContent>
            </Card>

            {/* ── History section ── */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-base flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  ประวัติการใช้บริการ
                  {historyStoreHandoffs.length > 0 && (
                    <Badge variant="muted" className="text-[11px] px-2 py-0.5">
                      {historyStoreHandoffs.length}
                    </Badge>
                  )}
                </h2>
              </div>

              {loading ? (
                <Card className="border-border/40">
                  <CardContent className="p-8 flex justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </CardContent>
                </Card>
              ) : historyStoreHandoffs.length === 0 ? (
                <Card className="border-dashed border-border/60 bg-muted/20">
                  <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                      <Store className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        ยังไม่มีประวัติการใช้บริการ
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ประวัติการใช้ร้านยาจะแสดงที่นี่หลังจากเสร็จสิ้นการบริการ
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {historyStoreHandoffs.map((h) => (
                    <HistoryCard
                      key={h._id}
                      handoff={h}
                      pharmacyName={pharmacyName(h.pharmacyId)}
                      pharmacist={
                        h.pharmacistId ? pharmacistLookup[h.pharmacistId] : null
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : activeTab === "consult" ? (
          <>
            {/* ── Link to dedicated tracking page ── */}
            <Card className="mb-6 border-secondary/30 bg-secondary/5 hover:border-secondary/50 transition-colors">
              <CardContent className="p-4">
                <Link href="/tracking" className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Stethoscope className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">ติดตามการปรึกษา</p>
                    <p className="text-xs text-muted-foreground">
                      ดูสถานะคำขอที่กำลังดำเนินการอยู่
                      {activeConsultations.length > 0 && (
                        <span className="ml-1.5 font-bold text-secondary">
                          ({activeConsultations.length} รายการ)
                        </span>
                      )}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              </CardContent>
            </Card>

            {/* ── Consultation History section ── */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  ประวัติการปรึกษา
                  {pastConsultations.length > 0 && (
                    <Badge variant="muted" className="text-[11px] px-2 py-0.5">
                      {pastConsultations.length}
                    </Badge>
                  )}
                </h2>
              </div>

              {loading ? (
                <Card className="border-border/40">
                  <CardContent className="p-8 flex justify-center text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </CardContent>
                </Card>
              ) : pastConsultations.length === 0 ? (
                <Card className="border-dashed border-border/60 bg-muted/20">
                  <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                      <Stethoscope className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        ยังไม่มีประวัติการปรึกษา
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ประวัติการปรึกษาจะแสดงที่นี่หลังจากเสร็จสิ้น
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {pastConsultations.map((h) => (
                    <HistoryCard
                      key={h._id}
                      handoff={h}
                      pharmacyName={pharmacyName(h.pharmacyId)}
                      pharmacist={
                        h.pharmacistId ? pharmacistLookup[h.pharmacistId] : null
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <ProfileSection
              currentUser={currentUser}
              // syncStatus={syncStatus}
              autoSyncClipboard={autoSyncClipboard}
              setAutoSyncClipboard={setAutoSyncClipboard}
              liveProfile={liveProfile}
              logout={logout}
              // onSyncClick={handleSyncClick}
              handleUpdate={(data) => {
                updateProfile(data, token);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
