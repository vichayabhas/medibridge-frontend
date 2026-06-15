import { PharmacistType } from "../../../../interface";
import type { SidebarDraft } from "./types";
import { SIDEBAR_DRAFTS_KEY } from "./types";

export type Pharmacist = PharmacistType;
export type Availability = Pharmacist["availability"] | "all";

export type PharmacistMeta = {
  title: string;
  specialtyLine: string;
  hourlyRate: string;
  shiftWindow: string;
  responseTime: string;
  acceptance: string;
  lastShift: string;
  inviteCopy: string;
  reviews: Array<{
    name: string;
    date: string;
    rating: number;
    comment: string;
  }>;
  performance: Array<{
    label: string;
    value: string;
    bar: number;
  }>;
  calendar: Array<"success" | "warning" | "muted" | "default">;
};

export const profileMeta: Record<string, PharmacistMeta> = {
  "rph-001": {
    title: "เภสัชทางไกล • พร้อมให้บริการ 20-22 เม.ย.",
    specialtyLine: "เภสัชกรผู้เชี่ยวชาญด้านยาสามัญประจำบ้าน โรคเรื้อรัง และเวชสำอาง ประสบการณ์ 10 ปี โรงพยาบาลศิริราช",
    hourlyRate: "฿240/ชม.",
    shiftWindow: "20 เม.ย. • 08:00-16:00",
    responseTime: "เฉลี่ย 12 นาที",
    acceptance: "92%",
    lastShift: "18 เม.ย. • 08:00-16:00",
    inviteCopy: "เชิญ ภญ.สุธิดา วงศ์สิริมงคล เข้ากะ 20 เม.ย. • 08:00-16:00",
    reviews: [
      {
        name: "ผู้ใช้งาน",
        date: "18 เม.ย. 2026",
        rating: 5,
        comment: "ให้คำปรึกษาชัดเจน ดูแลรายการยาที่ซับซ้อนและประสานการเติมยาอย่างทันท่วงที",
      },
      {
        name: "ผู้ใช้งาน",
        date: "29 มี.ค. 2026",
        rating: 5,
        comment: "ปรึกษาทางไกลยอดเยี่ยม ตรงเวลาและละเอียดครบถ้วนในการรีวิว MTM",
      },
      {
        name: "ผู้ใช้งาน",
        date: "8 ก.พ. 2026",
        rating: 4,
        comment: "ดีกับผู้ป่วย ช่วยเหลือได้ดีในคลินิกไข้หวัดที่ยุ่ง",
      },
    ],
    performance: [
      { label: "การตอบสนอง", value: "12 นาที", bar: 72 },
      { label: "อัตรารับ", value: "92%", bar: 92 },
      { label: "คำขอซ้ำ", value: "18", bar: 58 },
    ],
    calendar: [
      "muted", "success", "success", "warning", "muted", "success", "default",
      "muted", "success", "warning", "success", "muted", "success", "default",
      "muted", "muted", "success", "success", "warning", "success", "default",
      "muted", "success", "muted", "success", "warning", "success", "default",
    ],
  },
  "rph-002": {
    title: "Compounding • Flexible coverage",
    specialtyLine: "Reliable production pharmacist with solid inpatient and compounding support experience.",
    hourlyRate: "$55/hr",
    shiftWindow: "Apr 20 • 12:00-20:00",
    responseTime: "Avg 18 min",
    acceptance: "86%",
    lastShift: "Apr 12 • 09:00-17:00",
    inviteCopy: "Invite Marcus for Apr 20 • 12:00-20:00",
    reviews: [
      { name: "Olivia Chen", date: "Apr 12, 2026", rating: 5, comment: "Very detail oriented and dependable for busy compounding days." },
      { name: "Jasper Moore", date: "Mar 21, 2026", rating: 4, comment: "Strong shift coverage and clear communication with the team." },
      { name: "Nina Patel", date: "Feb 27, 2026", rating: 5, comment: "Handled medication reconciliation with excellent precision." },
    ],
    performance: [
      { label: "Response", value: "18 min", bar: 58 },
      { label: "Acceptance", value: "86%", bar: 86 },
      { label: "Repeat requests", value: "11", bar: 44 },
    ],
    calendar: [
      "muted", "warning", "success", "muted", "success", "muted", "default",
      "success", "success", "warning", "muted", "success", "muted", "default",
      "muted", "success", "success", "muted", "success", "warning", "default",
      "muted", "success", "muted", "warning", "success", "muted", "default",
    ],
  },
  "rph-003": {
    title: "Telehealth + MTM",
    specialtyLine: "High patient-satisfaction pharmacist for telehealth, dermatology, and pediatric counseling.",
    hourlyRate: "$68/hr",
    shiftWindow: "Apr 21 • 09:00-17:00",
    responseTime: "Avg 9 min",
    acceptance: "95%",
    lastShift: "Apr 16 • 10:00-18:00",
    inviteCopy: "Invite Nattawadee for Apr 21 • 09:00-17:00",
    reviews: [
      { name: "Sarah Johnson", date: "Apr 16, 2026", rating: 5, comment: "Excellent counseling for allergy cases and quick triage support." },
      { name: "Mika Tan", date: "Mar 25, 2026", rating: 5, comment: "Very calm and responsive during an unusually busy telehealth block." },
      { name: "Krit S.", date: "Feb 14, 2026", rating: 4, comment: "Clear medication advice and excellent follow-up." },
    ],
    performance: [
      { label: "Response", value: "9 min", bar: 86 },
      { label: "Acceptance", value: "95%", bar: 95 },
      { label: "Repeat requests", value: "24", bar: 78 },
    ],
    calendar: [
      "success", "success", "muted", "success", "warning", "success", "default",
      "success", "muted", "success", "success", "warning", "success", "default",
      "success", "muted", "success", "success", "muted", "success", "default",
      "warning", "success", "muted", "success", "success", "muted", "default",
    ],
  },
  "rph-004": {
    title: "Weekend coverage • OTC specialist",
    specialtyLine: "Clear medication selection and counseling for pain, GI, and allergy requests.",
    hourlyRate: "$52/hr",
    shiftWindow: "Apr 22 • 10:00-18:00",
    responseTime: "Avg 15 min",
    acceptance: "89%",
    lastShift: "Apr 10 • 08:00-16:00",
    inviteCopy: "Invite Anuwat for Apr 22 • 10:00-18:00",
    reviews: [
      { name: "Ken Wong", date: "Apr 10, 2026", rating: 4, comment: "Solid support for OTC cases and very practical counseling." },
      { name: "June Lim", date: "Mar 19, 2026", rating: 5, comment: "Friendly, efficient, and very easy to work with on a busy counter." },
      { name: "Araya P.", date: "Feb 3, 2026", rating: 4, comment: "Good at balancing pace with patient education." },
    ],
    performance: [
      { label: "Response", value: "15 min", bar: 64 },
      { label: "Acceptance", value: "89%", bar: 89 },
      { label: "Repeat requests", value: "14", bar: 52 },
    ],
    calendar: [
      "muted", "success", "warning", "success", "muted", "success", "default",
      "success", "muted", "success", "warning", "success", "muted", "default",
      "success", "success", "muted", "success", "warning", "success", "default",
      "muted", "success", "success", "muted", "success", "warning", "default",
    ],
  },
  "rph-005": {
    title: "Senior care specialist",
    specialtyLine: "Trusted for older-adult counseling, med sync, and high-touch support.",
    hourlyRate: "$60/hr",
    shiftWindow: "Apr 23 • 08:00-16:00",
    responseTime: "Avg 14 min",
    acceptance: "90%",
    lastShift: "Apr 9 • 08:00-16:00",
    inviteCopy: "Invite Wiphawee for Apr 23 • 08:00-16:00",
    reviews: [
      { name: "Tom H.", date: "Apr 9, 2026", rating: 5, comment: "Excellent with older adults and very reassuring." },
      { name: "Paula R.", date: "Mar 14, 2026", rating: 4, comment: "Detailed, warm, and strong at follow-up reminders." },
      { name: "Mei Lin", date: "Feb 22, 2026", rating: 4, comment: "Great at guiding patients through complex schedules." },
    ],
    performance: [
      { label: "Response", value: "14 min", bar: 68 },
      { label: "Acceptance", value: "90%", bar: 90 },
      { label: "Repeat requests", value: "16", bar: 56 },
    ],
    calendar: [
      "muted", "muted", "success", "success", "warning", "success", "default",
      "muted", "success", "muted", "success", "warning", "success", "default",
      "success", "muted", "success", "success", "warning", "muted", "default",
      "success", "success", "muted", "warning", "success", "muted", "default",
    ],
  },
  "rph-006": {
    title: "Chronic care & diabetes",
    specialtyLine: "Strong in medication reconciliation, chronic disease counseling, and adherence planning.",
    hourlyRate: "$72/hr",
    shiftWindow: "Apr 20 • 08:00-16:00",
    responseTime: "Avg 11 min",
    acceptance: "94%",
    lastShift: "Apr 17 • 08:00-16:00",
    inviteCopy: "Invite Thanakorn for Apr 20 • 08:00-16:00",
    reviews: [
      { name: "Amit K.", date: "Apr 17, 2026", rating: 5, comment: "Very strong chronic disease counseling and exceptionally calm." },
      { name: "Dina S.", date: "Mar 30, 2026", rating: 5, comment: "Great with diabetes education and follow-up plans." },
      { name: "Robert F.", date: "Feb 11, 2026", rating: 4, comment: "Reliable coverage and excellent patient rapport." },
    ],
    performance: [
      { label: "Response", value: "11 min", bar: 78 },
      { label: "Acceptance", value: "94%", bar: 94 },
      { label: "Repeat requests", value: "21", bar: 74 },
    ],
    calendar: [
      "success", "muted", "success", "warning", "success", "success", "default",
      "success", "muted", "success", "success", "warning", "success", "default",
      "muted", "success", "success", "warning", "success", "muted", "default",
      "success", "success", "muted", "success", "warning", "success", "default",
    ],
  },
  "rph-007": {
    title: "Pediatrics & respiratory",
    specialtyLine: "Helpful in pediatric OTC, colds/flu triage, and quick respiratory advice.",
    hourlyRate: "$58/hr",
    shiftWindow: "Apr 24 • 09:00-17:00",
    responseTime: "Avg 16 min",
    acceptance: "88%",
    lastShift: "Apr 8 • 09:00-17:00",
    inviteCopy: "Invite Paveena for Apr 24 • 09:00-17:00",
    reviews: [
      { name: "Sophie D.", date: "Apr 8, 2026", rating: 4, comment: "Great with parents and fast with respiratory questions." },
      { name: "Ethan W.", date: "Mar 18, 2026", rating: 5, comment: "Clear advice, especially for cough and cold cases." },
      { name: "Nok J.", date: "Feb 28, 2026", rating: 4, comment: "Excellent bedside manner and calm explanations." },
    ],
    performance: [
      { label: "Response", value: "16 min", bar: 62 },
      { label: "Acceptance", value: "88%", bar: 88 },
      { label: "Repeat requests", value: "12", bar: 46 },
    ],
    calendar: [
      "muted", "success", "muted", "success", "warning", "success", "default",
      "muted", "success", "success", "muted", "warning", "success", "default",
      "success", "muted", "success", "muted", "success", "warning", "default",
      "success", "muted", "success", "success", "muted", "success", "default",
    ],
  },
};

export function starCount(rating: number) {
  return Array.from({ length: 5 }, (_, index) => index < Math.round(rating));
}

export function statusDot(availability: Pharmacist["availability"]) {
  if (availability === "online") return "bg-success";
  if (availability === "busy") return "bg-warning";
  return "bg-muted-foreground";
}

export function statusTone(availability: Pharmacist["availability"]) {
  if (availability === "online") return "success" as const;
  if (availability === "busy") return "warning" as const;
  return "muted" as const;
}

export function patientBasics(handoff: { age?: number; gender?: string }) {
  const parts = [handoff.age ? `${handoff.age} ปี` : "", handoff.gender === "male" ? "ชาย" : handoff.gender === "female" ? "หญิง" : handoff.gender ?? ""].filter(Boolean);
  return parts.join(" • ");
}

export function createSidebarDraft(pharmacist: Pharmacist, meta: PharmacistMeta): SidebarDraft {
  return {
    name: pharmacist.name,
    licenseNo: pharmacist.licenseNo,
    title: meta.title,
    specialtyLine: meta.specialtyLine,
    responseTime: meta.responseTime,
    acceptance: meta.acceptance,
    specialties: pharmacist.specialties.join(", "),
    experience: String(pharmacist.experience),
    workplace: pharmacist.workplace,
    availability: pharmacist.availability,
    chatRate: String(pharmacist.methodRates.chat),
    phoneRate: String(pharmacist.methodRates.phone),
    videoRate: String(pharmacist.methodRates.video),
    performance: meta.performance.map((metric) => ({ ...metric })),
  };
}

export function loadSidebarDrafts() {
  try {
    const stored = localStorage.getItem(SIDEBAR_DRAFTS_KEY);
    if (!stored) return {};
    return JSON.parse(stored) as Record<string, SidebarDraft>;
  } catch {
    return {};
  }
}
