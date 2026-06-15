import { TelemedicineChannel } from "../../../../interface";

export type BookingSession = {
  pharmacistId: string;
  pharmacistName: string;
  shiftDate: string;
  shiftTime: string;
  status: "pending" | "confirmed" | "completed";
  timestamp: number;
};

export type TelepharmacyMessage = {
  id: string;
  sender: "pharmacist" | "patient" | "system";
  text: string;
  timestamp: string;
  imageUrl?: string;
  attachments?: string[];
};

export type TelepharmacyEvent = {
  id: string;
  channel: TelemedicineChannel;
  status: "idle" | "calling" | "connected" | "ended" | "error";
  timestamp: string;
  note?: string;
};

export type SidebarDraft = {
  name: string;
  licenseNo: string;
  title: string;
  specialtyLine: string;
  responseTime: string;
  acceptance: string;
  specialties: string;
  experience: string;
  workplace: string;
  availability: "online" | "busy" | "offline";
  chatRate: string;
  phoneRate: string;
  videoRate: string;
  performance: Array<{
    label: string;
    value: string;
    bar: number;
  }>;
};

// export const TELEPHARMACY_SESSION_KEY = "medibridge.telepharmacySessions";
export const TELEPHARMACY_CALL_STATE_KEY = "medibridge.telepharmacyCallState";
export const SIDEBAR_DRAFTS_KEY = "medibridge.pharmaShiftSidebarDrafts";
