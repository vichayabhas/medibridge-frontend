'use client'
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

// ─── Active tracking card (used for both consult + store tabs) ────────────────

// ─── History row (collapsed by default) ──────────────────────────────────────

// ─── Tab content: list of active cards + history ──────────────────────────────

// import { PharmacistQueueView } from "./pharmacist/PharmacistQueueView";
import { PatientHandoffType, PharmacistType } from "../../../interface";
import Link from "next/link";
import { PharmacistQueueView } from "./PharmacistQueueView";
import ParentView from "./ParentView";
import loadAllPharmacyAndPharmacist from "@/libs/main/loadAllPharmacyAndPharmacist";
import getPatientHandoffs from "@/libs/patientHandoff/getPatientHandoffs";
import { Session } from "next-auth";
import getUserProfile from "@/libs/user/getUserProfile";
import getPharmacistData from "@/libs/user/getPharmacistData";

// ─── Main page (role-based) ───────────────────────────────────────────────────

export default async function TrackingPage({
  session,
}: {
  session: Session | null;
}) {
  if (!session) {
    return (
      <div className="pt-20 pb-24 md:pb-10 min-h-screen bg-background">
        <div className="container max-w-md py-10">
          <Card className="border-border/50">
            <CardContent className="p-6 text-center">
              <h1 className="text-xl font-bold mb-2">ยังไม่ได้เข้าสู่ระบบ</h1>
              <p className="text-sm text-muted-foreground mb-5">
                กรุณาเข้าสู่ระบบเพื่อติดตามคำขอ
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
  // const pharmacies = usePharmacyStore((s) => s.pharmacies);
  // const pharmacists = usePharmacyStore((s) => s.pharmacists);

  // const load = async (isRefresh = false) => {
  //   if (isRefresh) setRefreshing(true);
  //   else setLoading(true);
  //   const data = await getPatientHandoffs();
  //   setHandoffs(data.rows);
  //   if (isRefresh) setRefreshing(false);
  //   else setLoading(false);
  // };

  // useEffect(() => {
  //   load();
  //   const interval = setInterval(() => {
  //     if (document.visibilityState === "visible") load(true);
  //   }, 30_000);
  //   return () => clearInterval(interval);
  // }, []);

  // ── Pharmacist view ──
  //
  const currentUser = await getUserProfile(session.user.token);
  if (currentUser.role === "pharmacist") {
    const data = await getPharmacistData(session.user.token);
    return <PharmacistQueueView data={data} />;
  } else {
    const handoffs = await getPatientHandoffs(session.user.token);
    const { pharmacies, pharmacists } = await loadAllPharmacyAndPharmacist();
    return (
      <ParentView
        pharmacies={pharmacies}
        pharmacists={pharmacists}
        handoffs={handoffs}
      />
    );
  }
}
