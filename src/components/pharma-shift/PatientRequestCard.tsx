"use client";
import {
  Phone,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// import { PatientInfoBoard } from "@/components/pharmacy/PatientInfoBoard";
// import { analyzeMedicalText, isGeminiAvailable } from "@/lib/gemini";
import React from "react";
import {
  ChatMessage,
  HandoffWithMessages,
  PatientHandoffType,
  TelemedicineChannel,
} from "../../../interface";
import { cn, modifyElementInUseStateArray } from "../utility/setup";
import { analyzeMedicalText, isGeminiAvailable } from "./support/gemini";
import PatientInfoBoard from "./PatientInfoBoard";

type PatientRequestCardProps = {
  handoff: PatientHandoffType;
  mode: "waiting" | "ongoing" | "finished";
  updateHandoff: (
    handoffId: string,
    patch: Partial<PatientHandoffType>,
    index: number,
  ) => Promise<void>;
  // newSymptomInputs: Record<string, string>;
  // setNewSymptomInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  // newAllergyInputs: Record<string, string>;
  // setNewAllergyInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setTelepharmacyTargetIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setTelepharmacyChannel: (channel: TelemedicineChannel) => void;
  handleWaitingDecision?: (
    requestId: string,
    decision: "accepted" | "rejected",
    index: number,
  ) => void;
  setPatientRequests: React.Dispatch<
    React.SetStateAction<HandoffWithMessages[]>
  >;
  telepharmacyMessages: ChatMessage[];
  patientBasics: (handoff: { age?: number; gender?: string }) => string;
  index: number;
};

function CommunicationBadge({ method }: { method?: string }) {
  if (!method) return null;
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider inline-flex items-center gap-2",
        method === "chat" && "border-blue-200 bg-blue-50 text-blue-700",
        method === "phone" && "border-green-200 bg-green-50 text-green-700",
        method === "video" && "border-purple-200 bg-purple-50 text-purple-700",
      )}
    >
      {method === "chat" && <span>💬 Chat</span>}
      {method === "phone" && (
        <>
          <Phone className="h-4 w-4 text-green-700" /> <span>Phone</span>
        </>
      )}
      {method === "video" && <span>📹 Video</span>}
    </Badge>
  );
}

// function formatSubmissionValue(value: unknown): string {
//   if (value === null || value === undefined || value === "") return "-";
//   if (typeof value === "string") return value;
//   if (typeof value === "number" || typeof value === "boolean") return String(value);
//   return JSON.stringify(value);
// }

// const SUBMISSION_LABELS: Record<string, string> = {
//   patientName: "ชื่อผู้ป่วย",
//   symptoms: "อาการ",
//   duration: "ระยะเวลา",
//   conditions: "โรคประจำตัว",
//   medications: "ยาที่ใช้อยู่",
//   allergies: "ประวัติแพ้ยา",
//   pharmacy: "ร้านยา",
//   pharmacist: "เภสัชกร",
//   licenseNo: "เลขใบอนุญาต",
//   requestType: "รูปแบบคำขอ",
//   telemedicineChannel: "ช่องทาง",
//   appointmentTime: "เวลานัดหมาย",
//   selectedTime: "ช่วงเวลาที่เลือก",
//   patientNote: "หมายเหตุจากผู้ป่วย",
// };

// function formatSubmissionLabel(key: string): string {
//   return SUBMISSION_LABELS[key] ?? key;
// }

// function formatSubmissionFieldValue(key: string, value: unknown): string {
//   if (Array.isArray(value)) {
//     if (value.length === 0) return "-";
//     return value.map((item) => formatSubmissionValue(item)).join(", ");
//   }

//   if (key === "appointmentTime" && typeof value === "string") {
//     return new Date(value).toLocaleString("th-TH", {
//       dateStyle: "medium",
//       timeStyle: "short",
//     });
//   }

//   if (key === "requestType") {
//     return value === "telemedicine" ? "Telemedicine" : "มาที่ร้าน";
//   }

//   if (key === "telemedicineChannel") {
//     return value === "video" ? "วิดีโอ" : value === "phone" ? "โทรศัพท์" : value === "chat" ? "แชท" : formatSubmissionValue(value);
//   }

//   return formatSubmissionValue(value);
// }

// function SubmissionDetails({ handoff }: { handoff: PatientHandoff }) {
//   const collectedData = handoff.telemedicineCollectedData;
//   const entries = collectedData && typeof collectedData === "object" && !Array.isArray(collectedData)
//     ? Object.entries(collectedData as Record<string, unknown>)
//         .filter(([, value]) => value !== null && value !== undefined && value !== "")
//     : [];

//   if (!handoff.telemedicinePatientNote && entries.length === 0) return null;

//   return (
//     <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-3 space-y-3 shadow-sm shadow-indigo-100/40">
//       <div className="flex items-center justify-between gap-2">
//         <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-700">ข้อมูลที่ผู้ป่วยส่ง</p>
//         <span className="text-[10px] text-slate-500">พร้อมใช้งาน</span>
//       </div>

//       {handoff.telemedicinePatientNote && (
//         <div className="rounded-xl border border-indigo-100 bg-white/90 px-3 py-2.5">
//           <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">หมายเหตุ</p>
//           <p className="mt-1 text-xs leading-6 text-slate-700 whitespace-pre-wrap">
//             {handoff.telemedicinePatientNote}
//           </p>
//         </div>
//       )}

//       {entries.length > 0 && (
//         <div className="grid gap-2 sm:grid-cols-2">
//           {entries.map(([key, value]) => (
//             <div key={key} className="rounded-xl border border-indigo-100 bg-white/95 px-3 py-2.5">
//               <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
//                 {formatSubmissionLabel(key)}
//               </p>
//               <p className="mt-1 text-xs text-slate-700 break-words">
//                 {formatSubmissionFieldValue(key, value)}
//               </p>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

function useHandoffAISummary(handoff: PatientHandoffType) {
  const [aiSummary, setAiSummary] = useState<string | null>(
    handoff.aiSummary ?? null,
  );
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(
    handoff.suggestedAction ?? null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If DB already has aiSummary, skip calling Gemini
    if (handoff.aiSummary && handoff.suggestedAction) return;
    if (!isGeminiAvailable()) return;

    const patientText = [
      handoff.patientSummary || "",
      handoff.telemedicinePatientNote || "",
      handoff.symptoms?.join(", ") || "",
    ]
      .filter(Boolean)
      .join(" — ");

    if (!patientText.trim()) return;

    setLoading(true);
    analyzeMedicalText(patientText, handoff)
      .then((result) => {
        if (result) {
          if (!handoff.aiSummary && result.pharmacistAssessment)
            setAiSummary(result.pharmacistAssessment);
          if (!handoff.suggestedAction && result.suggestions?.[0])
            setAiSuggestion(result.suggestions[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [handoff._id]); // run once per handoff

  return { aiSummary, aiSuggestion, loading };
}

export default function PatientRequestCard(props: PatientRequestCardProps) {
  const {
    handoff,
    mode,
    updateHandoff,
    // newSymptomInputs,
    // setNewSymptomInputs,
    // newAllergyInputs,
    // setNewAllergyInputs,
    setTelepharmacyTargetIndex,
    setTelepharmacyChannel,
    handleWaitingDecision,
    setPatientRequests,
    telepharmacyMessages,
    patientBasics,
    index,
  } = props;
  const communicationMethod = handoff.telemedicineChannel;
  const {
    aiSummary,
    aiSuggestion,
    loading: aiLoading,
  } = useHandoffAISummary(handoff);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [finishing, setFinishing] = useState(false);

  if (mode === "waiting") {
    return (
      <Card
        key={handoff._id}
        className={cn(
          "border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]",
        )}
      >
        <CardContent className="p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-slate-950">
                  {handoff.patientName}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {handoff.age ? `${handoff.age} yrs` : ""}
                  {handoff.gender
                    ? (handoff.age ? " • " : "") +
                      (handoff.gender === "male"
                        ? "Male"
                        : handoff.gender === "female"
                          ? "Female"
                          : handoff.gender)
                    : ""}
                </p>
              </div>
              <CommunicationBadge method={communicationMethod} />
            </div>

            <PatientInfoBoard
              handoff={handoff}
              showAiSummary={false}
              showHeader={false}
            />

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  {aiLoading ? (
                    <Loader2 className="h-3 w-3 text-violet-400 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 text-violet-500" />
                  )}
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-600">
                    สรุป AI
                  </p>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {aiLoading && !aiSummary
                    ? "กำลังวิเคราะห์..."
                    : (aiSummary ??
                      ([
                        handoff.symptoms?.slice(0, 3).join(", ") || "",
                        handoff.duration || "",
                      ]
                        .filter(Boolean)
                        .join(" • ") ||
                        "—"))}
                </p>
              </div>

              <div className="rounded-lg border border-violet-100 bg-white p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  {aiLoading ? (
                    <Loader2 className="h-3 w-3 text-violet-400 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 text-violet-400" />
                  )}
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-500">
                    คำแนะนำ AI
                  </p>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {aiLoading && !aiSuggestion
                    ? "กำลังวิเคราะห์..."
                    : (aiSuggestion ?? "ไม่มีคำแนะนำ")}
                </p>
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                className="rounded-lg"
                onClick={() =>
                  handleWaitingDecision?.(handoff._id, "accepted", index)
                }
              >
                รับคำขอ
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
                onClick={() =>
                  handleWaitingDecision?.(handoff._id, "rejected", index)
                }
              >
                ปฏิเสธ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mode === "ongoing") {
    return (
      <Card
        key={handoff._id}
        className="overflow-hidden border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
      >
        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400" />
        <CardContent className="p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-lg font-bold tracking-tight text-slate-950">
                  {handoff.patientName}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {patientBasics(handoff)}
                </p>
              </div>
              <CommunicationBadge method={communicationMethod} />
            </div>

            {/* Patient Info Board - Unified patient data display (AI summary handled by grid below) */}
            <PatientInfoBoard
              handoff={handoff}
              showAiSummary={false}
              showHeader={false}
            />

            {handoff.duration && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Duration
                </p>
                <p className="mt-1 text-xs text-slate-700">
                  {handoff.duration}
                </p>
              </div>
            )}

            {handoff.conditions && handoff.conditions.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Conditions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(handoff.conditions)
                    ? handoff.conditions
                    : [handoff.conditions]
                  ).map((condition: string) => (
                    <Badge
                      key={condition}
                      variant="outline"
                      className="text-xs"
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {handoff.medications && handoff.medications.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Current meds
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {handoff.medications.map((med: string) => (
                    <Badge key={med} variant="outline" className="text-xs">
                      {med}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Assessment &amp; Plan
              </p>
              <p className="mt-1 text-xs text-slate-700">{handoff.symptoms}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  AI Summary
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-700">
                  {(handoff.patientSummary || handoff.aiSummary) ??
                    (() => {
                      const parts = [
                        handoff.symptoms?.slice(0, 3).join(", ") || "",
                        handoff.duration || "",
                        (Array.isArray(handoff.conditions)
                          ? handoff.conditions.join(", ")
                          : handoff.conditions) || "",
                      ].filter(Boolean);
                      return parts.join(" • ");
                    })()}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  AI Suggestions
                </p>
                <p className="mt-1 text-xs leading-6 text-slate-700">
                  {handoff.suggestedAction ?? "No suggestions available."}
                </p>
              </div>
            </div>

            {/* <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Pharmacist Note</p>
              <textarea
                value={handoff.n ?? ""}
                onChange={(event) => updateHandoff(handoff.id, { pharmacistNote: event.target.value })}
                rows={2}
                className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 outline-none transition focus:border-indigo-300"
                placeholder="Add follow-up notes"
              />
            </div> */}

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-700">
                    เภสัชทางไกล
                  </p>
                  <p className="mt-1 text-xs leading-6 text-slate-600">
                    เปลี่ยนการปรึกษานี้เป็นเซสชั่นเภสัชทางไกลออนไลน์
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full bg-indigo-600 px-4 shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
                  onClick={() => {
                    setTelepharmacyTargetIndex(index);
                    setTelepharmacyChannel(
                      handoff.telemedicineChannel ?? "chat",
                    );
                  }}
                >
                  เริ่มเภสัชทางไกล
                </Button>
              </div>
            </div>

            {(handoff.status === "accepted" || handoff.status === "ready") && (
              <div
                className={cn(
                  "rounded-2xl border p-4 transition-all duration-200",
                  confirmFinish
                    ? "border-amber-200 bg-amber-50"
                    : "border-slate-100 bg-slate-50",
                )}
              >
                {confirmFinish ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          ยืนยันการเสร็จสิ้น?
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{`การดำเนินการนี้จะย้ายคำขอไปยังแท็บ "เสร็จสิ้น" และไม่สามารถย้อนกลับได้`}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={finishing}
                        onClick={async () => {
                          setFinishing(true);
                          await updateHandoff(
                            handoff._id,
                            { status: "completed" },
                            index,
                          );
                          setPatientRequests((prev) =>
                            modifyElementInUseStateArray<HandoffWithMessages>(
                              index,
                            )(
                              {
                                messages: prev[index].messages,
                                handoff: {
                                  ...prev[index].handoff,
                                  status: "completed",
                                },
                              },
                              prev,
                            ),
                          );
                          toast.success("เสร็จสิ้นการให้บริการแล้ว");
                          setFinishing(false);
                          setConfirmFinish(false);
                        }}
                      >
                        {finishing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            ยืนยัน
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-xl"
                        disabled={finishing}
                        onClick={() => setConfirmFinish(false)}
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      บริการเสร็จสิ้นแล้วใช่ไหม?
                    </p>
                    <Button
                      size="sm"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5"
                      onClick={() => setConfirmFinish(true)}
                    >
                      เสร็จสิ้น
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // mode === "finished"
  return (
    <Card key={handoff._id} className="border-slate-200 bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-950">
              {handoff.patientName}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {handoff.age ? `${handoff.age} yrs` : ""}
              {handoff.gender
                ? (handoff.age ? " • " : "") +
                  (handoff.gender === "male"
                    ? "Male"
                    : handoff.gender === "female"
                      ? "Female"
                      : handoff.gender)
                : ""}
            </p>
          </div>
          <CommunicationBadge method={communicationMethod} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              อาการ
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {handoff.symptoms.map((symptom: string) => (
                <Badge
                  key={symptom}
                  variant="outline"
                  className="rounded-full border-slate-200 bg-white px-2.5 py-0.5 text-xs text-slate-700"
                >
                  {symptom}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              การแพ้และข้อควรระวัง
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(handoff.allergies?.length ?? 0) > 0 ? (
                (handoff.allergies || []).map((allergy: string) => (
                  <Badge
                    key={allergy}
                    variant="destructive"
                    className="rounded-full text-xs"
                  >
                    {allergy}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-500">-</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              ยาที่ใช้อยู่
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(handoff.medications?.length ?? 0) > 0 ? (
                (handoff.medications || []).map((med: string) => (
                  <Badge
                    key={med}
                    variant="outline"
                    className="rounded-full border-slate-200 bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
                  >
                    {med}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-500">-</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              โรคประจำตัว
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {handoff.conditions && handoff.conditions.length > 0 ? (
                (Array.isArray(handoff.conditions)
                  ? handoff.conditions
                  : [handoff.conditions]
                ).map((condition: string) => (
                  <Badge
                    key={condition}
                    variant="outline"
                    className="rounded-full border-slate-200 bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700"
                  >
                    {condition}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-500">-</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              ระยะเวลา
            </p>
            <p className="mt-1 text-xs text-slate-700">
              {handoff.duration || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              การจัดยา
            </p>
            <p className="mt-1 text-xs text-slate-700">
              {handoff.fulfillment || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              ช่องทางการสื่อสาร
            </p>
            <p className="mt-1 text-xs text-slate-700">
              {communicationMethod || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              ช่องทางเภสัชทางไกล
            </p>
            <p className="mt-1 text-xs text-slate-700">
              {handoff.telemedicineChannel || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              เวลานัดหมาย
            </p>
            <p className="mt-1 text-xs text-slate-700">
              {handoff.appointmentTime
                ? new Date(handoff.appointmentTime).toLocaleString()
                : "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              สร้างเมื่อ
            </p>
            <p className="mt-1 text-xs text-slate-700">
              {handoff.createAt
                ? new Date(handoff.createAt).toLocaleString()
                : "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              รหัสร้านยา
            </p>
            <p className="mt-1 text-xs text-slate-700">
              {handoff.pharmacyId || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              รหัสเภสัชกร
            </p>
            <p className="mt-1 text-xs text-slate-700">
              {handoff.pharmacistId || "-"}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            สรุปผู้ป่วย
          </p>
          <p className="mt-1 text-xs leading-6 text-slate-700">
            {handoff.patientSummary || "-"}
          </p>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              สรุป AI
            </p>
            <p className="mt-1 text-xs leading-6 text-slate-700">
              {(handoff.patientSummary || handoff.aiSummary) ??
                (() => {
                  const parts = [
                    handoff.symptoms?.slice(0, 3).join(", ") || "",
                    handoff.duration || "",
                    (Array.isArray(handoff.conditions)
                      ? handoff.conditions.join(", ")
                      : handoff.conditions) || "",
                  ].filter(Boolean);
                  return parts.join(" • ");
                })()}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              คำแนะนำ AI
            </p>
            <p className="mt-1 text-xs leading-6 text-slate-700">
              {handoff.suggestedAction ?? "No suggestions available."}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            การประเมินและแผนการรักษา
          </p>
          <p className="mt-1 text-xs text-slate-700">{handoff.symptoms}</p>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            ไทม์ไลน์เซสชั่น
          </p>
          <div className="mt-1 text-xs text-slate-600">
            {telepharmacyMessages.length === 0 && (
              <p className="text-xs text-slate-500">ไม่มีบันทึกเหตุการณ์</p>
            )}
            {telepharmacyMessages.map((m) => (
              <div key={m._id} className="flex items-start gap-2 py-1">
                <div className="text-[11px] font-semibold text-slate-700">
                  {m.senderType === "pharmacist"
                    ? "เภสัชกร"
                    : m.senderType === "patient"
                      ? "ผู้ป่วย"
                      : "ระบบ"}
                </div>
                <div className="text-[11px] text-slate-600">
                  {m.content}{" "}
                  <span className="text-[10px] text-slate-400">
                    • {new Date(m.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            บันทึกเภสัชกร
          </p>
          {/* <textarea
            value={handoff.pharmacistNote ?? ""}
            onChange={(event) => updateHandoff(handoff._id, { pharmacistNote: event.target.value })}
            rows={2}
            className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700 outline-none transition focus:border-indigo-300"
            placeholder="เพิ่มบันทึกการติดตาม"
          /> */}
        </div>
      </CardContent>
    </Card>
  );
}
