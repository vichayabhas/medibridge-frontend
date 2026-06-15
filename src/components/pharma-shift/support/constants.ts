import { TelemedicineChannel } from "../../../../interface";
import type { Availability } from "./utils";

export const allCertifications = ["Immunizations", "Compounding", "MTM", "E-Prescribing"];

export const availabilityLabel: Record<Availability, string> = {
  all: "ทั้งหมด",
  online: "พร้อมให้บริการ",
  busy: "กำลังเข้ากะ",
  offline: "ออฟไลน์",
};

export const availabilityTone: Record<Availability, "success" | "warning" | "muted" | "default"> = {
  all: "default",
  online: "success",
  busy: "warning",
  offline: "muted",
};

export const telemedicineChannels: Array<{ key: TelemedicineChannel; label: string }> = [
  { key: "chat", label: "แชท" },
  { key: "phone", label: "โทรศัพท์" },
  { key: "video", label: "วิดีโอ" },
];
