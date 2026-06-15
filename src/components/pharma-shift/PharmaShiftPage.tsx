"use client";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  LogOut,
  Pill,
  Search,
  Sparkles,
  Store,
  UserRound,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// Full-page video/voice views removed - calls now embedded in TelepharmacyModal
// import { updatePatientHandoff, getFilteredPatientHandoffs, getHandoffStatusCounts, type PatientHandoff, type PatientHandoffStatus } from "@/lib/patientHandoffs";
import "./pharma-shift.css";
import {
  cn,
  modifyElementInUseStateArray,
  PHARMACIST_PHOTOS,
} from "../utility/setup";
import { signOut } from "next-auth/react";
import {
  // GetPharmacistData,
  HandoffWithMessages,
  PatientHandoffStatus,
  PatientHandoffType,
  PharmaShiftData,
  TelemedicineChannel,
  // TelemedicineChannel,
} from "../../../interface";
import {
  createSidebarDraft,
  loadSidebarDrafts,
  patientBasics,
  Pharmacist,
  profileMeta,
  statusTone,
} from "./support/utils";
import { BookingSession, SIDEBAR_DRAFTS_KEY, SidebarDraft } from "./support/types";
import updatePatientHandoff from "@/libs/patientHandoff/updatePatientHandoff";
// import TelepharmacyModal from "./TelepharmacyModal";
// import ShiftBookingModal from "./ShiftBookingModal";
// import { useTelepharmacyState } from "./useTelepharmacyState";
import Link from "next/link";
// import FilterBar from "./FilterBar";
// import { allCertifications } from "./constants";
import PatientRequestCard from "./PatientRequestCard";
import { allCertifications } from "./support/constants";
import FilterBar from "./FilterBar";
// import { useTelepharmacyState } from "./useTelepharmacyState";
import PharmacistSidebar from "./PharmacistSidebar";
import TelepharmacyModal from "./TelepharmacyModal";
import ShiftBookingModal from "./ShiftBookingModal";
import PharmacistAIAssistant from "./PharmacistAIAssistant";
// import PharmacistSidebar from "./PharmacistSidebar";
// import PharmacistAIAssistant from "./PharmacistAIAssistant";
const pharmacistPhotos = PHARMACIST_PHOTOS;
export default function PharmaShiftPage({ data }: { data: PharmaShiftData }) {
  const logoutFn = signOut;
  // const [searchQuery] = useState("");
  // const [locationQuery, ] = useState("Downtown Pharmacy, Bangkok");
  // // const [dateRange, setDateRange] = useState("Apr 20, 2026 - Apr 22, 2026");
  // const [minRating, ] = useState(4.4);
  // const [availability, ] = useState<Availability>("all");
  const [activeCertification, setActiveCertification] = useState<string>("All");
  // const allPharmacists = [data.pharmacist]
  // const allPharmacies = [data.pharmacy];
  // const pharmacyLookup = Object.fromEntries(
  //   allPharmacies.map((p) => [p._id, p]),
  // );
  // const [selectedId, setSelectedId] = useState<Pharmacist["_id"]>("rph-001");
  const [requestTab, setRequestTab] = useState<
    "waiting" | "ongoing" | "finished"
  >("waiting");
  const [patientRequests, setPatientRequests] = useState<HandoffWithMessages[]>(
    [],
  );
  const [handoffsLoading, setHandoffsLoading] = useState(false);
  const [handoffsPage, setHandoffsPage] = useState(1);
  const [handoffsHasMore, setHandoffsHasMore] = useState(false);
  const [tabCounts, setTabCounts] = useState({
    waiting: 0,
    ongoing: 0,
    finished: 0,
  });
  // inline add-inputs for symptoms/allergies per handoff (keyed by handoff id)
  // const [newSymptomInputs, setNewSymptomInputs] = useState<
  //   Record<string, string>
  // >({});
  // const [newAllergyInputs, setNewAllergyInputs] = useState<
  //   Record<string, string>
  // >({});
  const [requestSearch, setRequestSearch] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState<
    Array<"telemedicine" | "in_store">
  >(["in_store", "telemedicine"]);
  const [presence, setPresence] = useState<"available" | "vacation">(
    "available",
  );
  const [telepharmacyTargetIndex, setTelepharmacyTargetIndex] = useState<
    number | null
  >(null);
  const [telepharmacyChannel, setTelepharmacyChannel] =
    useState<TelemedicineChannel>("chat");

  // Review refresh logic - reviews refresh every 15th of the month
  // const getReviewRefreshInfo = () => {
  //   const now = new Date();
  //   const currentDay = now.getDate();
  //   const currentMonth = now.getMonth();
  //   const currentYear = now.getFullYear();

  //   // Calculate days until next refresh (15th of month)
  //   let daysUntilRefresh: number;
  //   let lastRefreshDate: Date;

  //   if (currentDay >= 15) {
  //     // Next refresh is 15th of next month
  //     const nextMonth = new Date(currentYear, currentMonth + 1, 15);
  //     daysUntilRefresh = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  //     lastRefreshDate = new Date(currentYear, currentMonth, 15);
  //   } else {
  //     // Next refresh is 15th of this month
  //     const thisMonth15th = new Date(currentYear, currentMonth, 15);
  //     daysUntilRefresh = Math.ceil((thisMonth15th.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  //     lastRefreshDate = new Date(currentYear, currentMonth - 1, 15);
  //   }

  //   return { daysUntilRefresh, lastRefreshDate, currentDay };
  // };

  // const getRotatedReviews = (reviews: typeof selectedMeta.reviews) => {
  //   const now = new Date();
  //   const currentMonth = now.getMonth();
  //   const currentYear = now.getFullYear();

  //   // Use month+year as seed for rotation
  //   const rotationSeed = currentMonth + currentYear * 12;
  //   const offset = rotationSeed % Math.max(1, reviews.length);

  //   // Rotate reviews array
  //   return [...reviews.slice(offset), ...reviews.slice(0, offset)];
  // };

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingPharmacist, setBookingPharmacist] = useState<Pharmacist | null>(
    null,
  );
  const [selectedShiftDate, setSelectedShiftDate] = useState<string | null>(
    null,
  );
  const [selectedShiftTime, setSelectedShiftTime] =
    useState<string>("08:00-16:00");
  const [bookedShifts, setBookedShifts] = useState<BookingSession[]>([]);
  const [sidebarDrafts, setSidebarDrafts] = useState<
    Record<string, SidebarDraft>
  >({});
  const [isSidebarEditing, setIsSidebarEditing] = useState(false);

  // AI Assistant state
  // const [showAIAssistant] = useState(true);

  // const fallbackPharmacist: Pharmacist = {
  //   _id: "rph-fallback",
  //   pharmacyId: "",
  //   name: "เภสัชกร",
  //   licenseNo: "",
  //   // avatar: "",
  //   availability: "offline",
  //   rating: 0,
  //   reviewCount: 0,
  //   specialties: [],
  //   // money: 0,
  //   methodRates: { chat: 0, phone: 0, video: 0 },
  //   bookedSlots: [],
  //   consultDurations: [15],
  //   experience: 0,
  //   workplace: "",
  //   languages: [],
  //   insurance: [],
  //   bio: "",
  //   nextAvailable: "",
  // };

  // const filteredPharmacists = useMemo(() => {
  //   const normalizedQuery = searchQuery.trim().toLowerCase();
  //   const normalizedLocation = locationQuery.trim().toLowerCase();

  //   return allPharmacists.filter((pharmacist) => {
  //     const pharmacy = pharmacyLookup[pharmacist.pharmacyId];
  //     const searchable = [
  //       pharmacist.name,
  //       pharmacist.licenseNo,
  //       pharmacist.specialties.join(" "),
  //       pharmacy?.name ?? "",
  //       pharmacy?.address ?? "",
  //     ]
  //       .join(" ")
  //       .toLowerCase();

  //     if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;
  //     if (normalizedLocation && !searchable.includes(normalizedLocation)) return false;
  //     if (availability !== "all" && pharmacist.availability !== availability) return false;
  //     if (activeCertification !== "All" && !pharmacist.specialties.includes(activeCertification)) return false;
  //     if (pharmacist.rating < minRating) return false;
  //     return true;
  //   });
  // }, [activeCertification, allPharmacists, availability, locationQuery, minRating, pharmacyLookup, searchQuery]);

  const selectedPharmacist = data.pharmacist;
  // filteredPharmacists.find((pharmacist) => pharmacist._id === selectedId) ?? filteredPharmacists[0] ?? allPharmacists[0] ?? fallbackPharmacist;
  //// eslint-disable-next-line prefer-const
  const TAB_STATUSES: Record<
    "waiting" | "ongoing" | "finished",
    PatientHandoffStatus[]
  > = {
    waiting: ["sent"],
    ongoing: ["accepted", "ready"],
    finished: ["completed"],
  };

  const PAGE_SIZE = 3;

  // Fetch status counts for badge numbers (lightweight, head: true)
  // useEffect(() => {
  //   const pharmacistId = selectedPharmacist?._id;
  //   if (!pharmacistId || pharmacistId === 'rph-fallback') return;
  //   // getHandoffStatusCounts(pharmacistId).then(setTabCounts);
  // }, [selectedPharmacist?._id]);
  // Fetch data for current tab + page
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const pharmacistId = selectedPharmacist?._id;
    if (!pharmacistId || pharmacistId === "rph-fallback") return;

    const fetchId = ++fetchIdRef.current;
    setHandoffsLoading(true);

    let filteredData = data.arrayHandoffWithMessages;
    const statuses = TAB_STATUSES[requestTab];

    // 1. Filter by statuses locally if they are provided
    if (statuses && statuses.length > 0) {
      filteredData = data.arrayHandoffWithMessages.filter((handoff) =>
        statuses.includes(handoff.handoff.status),
      );
    }

    // 2. Sort by createdAt descending (newest first)
    // Note: If your array is already sorted, you can skip this step.
    filteredData.sort(
      (a, b) =>
        new Date(b.handoff.createAt).getTime() -
        new Date(a.handoff.createAt).getTime(),
    );

    // 3. Calculate total count of the filtered results
    const count = filteredData.length;

    // 4. Paginate using .slice()
    const skip = (handoffsPage - 1) * PAGE_SIZE;
    const limit = PAGE_SIZE;
    const rows = filteredData.slice(skip, skip + limit);
    if (fetchId !== fetchIdRef.current) return;
    setPatientRequests((prev) =>
      handoffsPage === 1 ? rows : [...prev, ...rows],
    );
    setHandoffsHasMore(handoffsPage * PAGE_SIZE < count);
    setHandoffsLoading(false);
    setTabCounts((prev) => ({ ...prev, [requestTab]: count }));
  }, [selectedPharmacist?._id, requestTab, handoffsPage]);

  const handleTabChange = (tab: "waiting" | "ongoing" | "finished") => {
    if (tab === requestTab) return;
    setPatientRequests([]);
    setHandoffsPage(1);
    setRequestTab(tab);
  };

  const handleLoadMore = () => {
    setHandoffsPage((prev) => prev + 1);
  };

  const updateHandoff = async (
    handoffId: string,
    patch: Partial<PatientHandoffType>,
    i: number,
  ) => {
    setPatientRequests((prev) =>
      modifyElementInUseStateArray<HandoffWithMessages>(i)(
        {
          messages: prev[i].messages,
          handoff: { ...prev[i].handoff, ...patch },
        },
        prev,
      ),
    );
    await updatePatientHandoff(handoffId, patch);
  };

  // const handleStatusChange = (id: string, status: string) => {
  //   updateHandoff(id, { status });
  // };

  // const telepharmacy = useTelepharmacyState({
  //   patientRequests,
  //   pharmacistName: selectedPharmacist.name,
  // });

  // useEffect(() => {
  //   if (!filteredPharmacists.length) return;
  //   const exists = filteredPharmacists.some((pharmacist) => pharmacist._id === selectedId);
  //   if (!exists) {
  //     setSelectedId(filteredPharmacists[0]._id);
  //   }
  // }, [filteredPharmacists, selectedId]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_DRAFTS_KEY, JSON.stringify(sidebarDrafts));
    } catch (error) {
      console.error("Failed to persist sidebar drafts", error);
    }
  }, [sidebarDrafts]);

  // const hasPharmacistData = filteredPharmacists.length > 0 || allPharmacists.length > 0;

  const selectedMeta =
    profileMeta[selectedPharmacist._id] ?? profileMeta["rph-001"];
  // const selectedPharmacy = pharmacyLookup[selectedPharmacist.pharmacyId] ?? {
  //   name: "Unknown Pharmacy",
  // };
  const selectedAvailabilityTone = statusTone(selectedPharmacist.availability);
  const selectedSidebarDraft =
    sidebarDrafts[selectedPharmacist._id] ??
    createSidebarDraft(selectedPharmacist, selectedMeta);
  // const resultCount = filteredPharmacists.length;

  const updateSidebarDraft = (patch: Partial<SidebarDraft>) => {
    setSidebarDrafts((current) => {
      const currentDraft =
        current[selectedPharmacist._id] ??
        createSidebarDraft(selectedPharmacist, selectedMeta);
      return {
        ...current,
        [selectedPharmacist._id]: { ...currentDraft, ...patch },
      };
    });
  };

  const resetSidebarDraft = () => {
    setSidebarDrafts((current) => {
      if (!current[selectedPharmacist._id]) return current;
      const next = { ...current };
      delete next[selectedPharmacist._id];
      return next;
    });
    toast.success("รีเซ็ตข้อมูลด้านขวาแล้ว");
  };

  const filteredRequests = useMemo(() => {
    const q = requestSearch.trim().toLowerCase();
    const base = patientRequests.filter((r) => {
      if (requestTypeFilter.length === 0) return true;
      let matched = false;
      if (
        requestTypeFilter.includes("telemedicine") &&
        r.handoff.requestType === "telemedicine"
      )
        matched = true;
      if (
        requestTypeFilter.includes("in_store") &&
        (r.handoff.requestType === "in_store" ||
          r.handoff.fulfillment === "pickup")
      )
        matched = true;
      return matched;
    });
    if (!q) return base;
    return base.filter((r) => {
      const hay =
        `${r.handoff._id} ${r.handoff.patientName} ${r.handoff.symptoms?.join(" ") ?? ""} ${r.handoff.patientSummary ?? ""} ${(r.handoff.allergies || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [requestSearch, requestTypeFilter, patientRequests]);

  const handleWaitingDecision = async (
    requestId: string,
    decision: "accepted" | "rejected",
    i: number,
  ) => {
    try {
      await updateHandoff(requestId, { status: decision }, i);

      if (decision === "accepted") {
        toast.success("รับคำขอแล้ว");
        handleTabChange("ongoing");
        return;
      }

      setPatientRequests((prev) =>
        prev.filter((request) => request.handoff._id !== requestId),
      );
      toast.success("ปฏิเสธคำขอแล้ว");
    } catch (error) {
      console.error("Failed updating waiting decision", error);
      toast.error("อัปเดตสถานะคำขอไม่สำเร็จ");
    }
  };

  // const handleStartTelepharmacy = (requestId: string) => {
  //   setPatientRequests((prev) =>
  //     prev.map((request) =>
  //       request.id === requestId
  //         ? {
  //             ...request,
  //             requestType: "telemedicine",
  //             telemedicineChannel: telepharmacy.telepharmacyChannel,
  //             telemedicineStartTime: request.telemedicineStartTime ?? new Date().toISOString(),
  //           }
  //         : request
  //     )
  //   );
  //   telepharmacy.setTelepharmacyTargetId(requestId);
  //   toast.success(`เริ่มเภสัชทางไกลผ่าน ${telepharmacy.telepharmacyChannel === "chat" ? "แชท" : telepharmacy.telepharmacyChannel === "phone" ? "โทรศัพท์" : "วิดีโอ"}`);
  // };

  // const handleInvite = (pharmacist: Pharmacist) => {
  //   setBookingPharmacist(pharmacist);
  //   setShowBookingModal(true);
  // };

  const handleConfirmBooking = (date: string, time: string) => {
    if (!bookingPharmacist) return;

    const booking: BookingSession = {
      pharmacistId: bookingPharmacist._id,
      pharmacistName: bookingPharmacist.name,
      shiftDate: date,
      shiftTime: time,
      status: "confirmed",
      timestamp: Date.now(),
    };

    const updated = [...bookedShifts, booking];
    setBookedShifts(updated);
    localStorage.setItem("medibridge.bookedShifts", JSON.stringify(updated));

    toast.success(`✓ จองกะกับ ${bookingPharmacist.name} วันที่ ${date} แล้ว`);
    setShowBookingModal(false);
    setBookingPharmacist(null);
  };

  const shiftToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [calMonth, setCalMonth] = useState(
    () => new Date(shiftToday.getFullYear(), shiftToday.getMonth(), 1),
  );
  const SHIFT_MONTH_NAMES = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  const SHIFT_DAY_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
  const shiftMaxDate = useMemo(() => {
    const d = new Date(shiftToday);
    d.setDate(d.getDate() + 60);
    return d;
  }, [shiftToday]);
  const shiftIsToday = (d: Date) =>
    d.toDateString() === shiftToday.toDateString();

  const calDays = useMemo(() => {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calMonth]);

  const shiftDateKey = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const bookedShiftDates = useMemo(
    () => new Set(bookedShifts.map((s) => s.shiftDate)),
    [bookedShifts],
  );

  // const calendarDates = useMemo(() => {
  //   const dates: { date: string; day: string; availability: "available" | "booked" | "unavailable" }[] = [];
  //   for (let i = 0; i < 28; i++) {
  //     const d = new Date(shiftToday);
  //     d.setDate(d.getDate() + i);
  //     const key = shiftDateKey(d);
  //     const status = bookedShiftDates.has(key) ? "booked" : "available";
  //     dates.push({ date: key, day: d.toLocaleDateString("en-US", { weekday: "short" }), availability: status });
  //   }
  //   return dates;
  // }, [shiftToday, bookedShiftDates]);

  useEffect(() => {
    const saved = localStorage.getItem("medibridge.bookedShifts");
    if (saved) {
      setBookedShifts(JSON.parse(saved));
    } else {
      const seedData: BookingSession[] = [
        {
          pharmacistId: "rph-001",
          pharmacistName: "Elena Rodriguez",
          shiftDate: "Apr 20",
          shiftTime: "08:00-16:00",
          status: "confirmed",
          timestamp: Date.now() - 86400000 * 2,
        },
        {
          pharmacistId: "rph-003",
          pharmacistName: "Nattawadee Khamphirun",
          shiftDate: "Apr 21",
          shiftTime: "09:00-17:00",
          status: "confirmed",
          timestamp: Date.now() - 86400000,
        },
        {
          pharmacistId: "rph-006",
          pharmacistName: "Thanakorn Siriporn",
          shiftDate: "Apr 22",
          shiftTime: "08:00-16:00",
          status: "confirmed",
          timestamp: Date.now(),
        },
      ];
      localStorage.setItem("medibridge.bookedShifts", JSON.stringify(seedData));
      setBookedShifts(seedData);
    }
  }, []);

  useEffect(() => {
    setSidebarDrafts(loadSidebarDrafts());
  }, []);

  // const handleMessage = (pharmacist: Pharmacist) => {
  //   toast.message(`📧 เปิดร่างข้อความสำหรับ ${pharmacist.name}`, {
  //     description: "พร้อมส่งข้อความโดยตรงหรือสอบถาม"
  //   });
  // };

  const navItems = [
    { label: "หน้าแรก", href: "/", icon: Home },
    { label: "ร้านยา", href: "/pharmacy-role", icon: Store, active: true },
    { label: "เภสัชกร", href: "/pharmacy-role", icon: UserRound },
  ];

  // handoffsLoading skeleton is now rendered inline within the requests section
  // so the rest of the page (navbar, header, sidebar) appears instantly

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(204_55%_98%),hsl(0_0%_100%)_72%)] text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white">
                <Pill className="h-4 w-4" />
              </div>
              <span className="hidden font-bold text-slate-800 sm:inline">
                MediBridge
              </span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    item.active
                      ? "bg-sky-50 text-sky-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {tabCounts.ongoing > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                  {tabCounts.ongoing}
                </span>
              )}
              <button
                onClick={async () => {
                  await logoutFn();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                title="ออกจากระบบ"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
        {/* Booked shifts notification removed */}

        <section className="mb-6 overflow-hidden rounded-[1.75rem] border border-white bg-white/85 p-6 shadow-[var(--shadow-card)] backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/15 bg-white px-3.5 py-2 text-xs font-bold text-primary shadow-sm">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">MediBridge — dashboard เภสัชกร</span>
              </div>
              <h1 className="max-w-[12ch] text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
                แดชบอร์ด
                <span className="block text-primary">เภสัชกร</span>
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-8 text-slate-600 sm:text-lg">
                ภาพรวมคำขอของผู้ป่วย เซสชั่นเภสัชทางไกล
                และการมอบหมายกะสำหรับร้านยาของคุณในหน้าที่อ่านง่ายและเป็นระบบเดียวกัน
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[var(--shadow-card)] lg:min-w-[280px]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-5 text-slate-900">
                  พาร์ทเนอร์ MediBridge
                </p>
                <p className="truncate text-xs text-slate-500">
                  ตลาดเภสัชกรและเจ้าหน้าที่ร้านยา
                </p>
              </div>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2 text-xs font-bold text-white">
                2
              </span>
            </div>
          </div>
        </section>

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div />

          <div />
        </div>

        {/* Location/Date/Min Rating card removed per request */}

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.9fr]">
          <section className="space-y-3">
            <FilterBar
              presence={presence}
              setPresence={setPresence}
              activeCertification={activeCertification}
              setActiveCertification={setActiveCertification}
              allCertifications={allCertifications}
              requestTypeFilter={requestTypeFilter}
              setRequestTypeFilter={setRequestTypeFilter}
              requestSearch={requestSearch}
              setRequestSearch={setRequestSearch}
              requestTab={requestTab}
              onTabChange={handleTabChange}
              waitingCount={tabCounts.waiting}
              ongoingCount={tabCounts.ongoing}
              finishedCount={tabCounts.finished}
            />

            <div className="space-y-3">
              {handoffsLoading ? (
                <>
                  <div className="mb-1 flex items-center gap-3">
                    <div className="skeleton h-8 w-24 rounded-lg" />
                    <div className="skeleton h-8 w-20 rounded-lg" />
                    <div className="skeleton h-8 w-20 rounded-lg" />
                    <div className="ml-auto skeleton h-4 w-32 rounded" />
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="slide-in-bottom rounded-2xl border border-slate-200/60 bg-white p-5"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="skeleton h-12 w-12 shrink-0 rounded-xl" />
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="skeleton h-4 w-32 rounded" />
                            <div className="skeleton h-6 w-20 rounded-full" />
                          </div>
                          <div className="space-y-2">
                            <div
                              className="skeleton h-3 rounded"
                              style={{ width: `${90 + i * 5}%` }}
                            />
                            <div
                              className="skeleton h-3 rounded"
                              style={{ width: `${60 + i * 10}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="skeleton h-3 w-16 rounded-full" />
                            <div className="skeleton h-3 w-12 rounded-full" />
                            <div className="skeleton h-3 w-14 rounded-full" />
                            <div className="ml-auto skeleton h-9 w-28 rounded-xl" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : filteredRequests.length > 0 ? (
                <>
                  {filteredRequests.map((handoffWithMessage, i) => (
                    <PatientRequestCard
                      key={handoffWithMessage.handoff._id}
                      handoff={handoffWithMessage.handoff}
                      mode={requestTab}
                      updateHandoff={updateHandoff}
                      // newSymptomInputs={newSymptomInputs}
                      // setNewSymptomInputs={setNewSymptomInputs}
                      // newAllergyInputs={newAllergyInputs}
                      // setNewAllergyInputs={setNewAllergyInputs}
                      setTelepharmacyTargetIndex={setTelepharmacyTargetIndex}
                      setTelepharmacyChannel={setTelepharmacyChannel}
                      handleWaitingDecision={
                        requestTab === "waiting"
                          ? handleWaitingDecision
                          : undefined
                      }
                      setPatientRequests={setPatientRequests}
                      telepharmacyMessages={handoffWithMessage.messages}
                      patientBasics={patientBasics}
                      index={i}
                    />
                  ))}
                  {handoffsHasMore && (
                    <div className="flex justify-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLoadMore}
                        disabled={handoffsLoading}
                        className="gap-2"
                      >
                        {handoffsLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        โหลดเพิ่มเติม
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <Card className="border-slate-200 bg-white shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Search className="mb-4 h-10 w-10 text-slate-300" />
                    <h3 className="text-lg font-bold text-slate-900">
                      {requestTab === "waiting"
                        ? "ไม่พบคำขอ"
                        : requestTab === "ongoing"
                          ? "ไม่มีการปรึกษาที่กำลังดำเนินการ"
                          : "ไม่มีคำขอที่เสร็จสิ้น"}
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
                      {requestTab === "waiting"
                        ? "คำขอใหม่จากผู้ป่วยจะปรากฏที่นี่"
                        : requestTab === "ongoing"
                          ? "คำขอที่ได้รับการยอมรับและกำลังดำเนินการจะปรากฏที่นี่"
                          : "การปรึกษาที่เสร็จสิ้นจะปรากฏที่นี่"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          <PharmacistSidebar
            selectedPharmacist={selectedPharmacist}
            selectedMeta={selectedMeta}
            selectedPharmacy={data.pharmacy}
            selectedAvailabilityTone={selectedAvailabilityTone}
            selectedSidebarDraft={selectedSidebarDraft}
            isSidebarEditing={isSidebarEditing}
            setIsSidebarEditing={setIsSidebarEditing}
            resetSidebarDraft={resetSidebarDraft}
            updateSidebarDraft={updateSidebarDraft}
            pharmacistRating={null}
            pharmacistPhotos={pharmacistPhotos}
            SHIFT_DAY_SHORT={SHIFT_DAY_SHORT}
          />
        </div>
      </div>

      {telepharmacyTargetIndex != null && (
        <TelepharmacyModal
          // state={telepharmacy}
          onClose={() => setTelepharmacyTargetIndex(null)}
          updateHandoff={updateHandoff}
          requestTab={requestTab}
          index={telepharmacyTargetIndex}
          telepharmacyChannel={telepharmacyChannel}
          handoffWithMessages={patientRequests[telepharmacyTargetIndex]}
          setTelepharmacyChannel={setTelepharmacyChannel}
          pharmacistName={data.pharmacist.name}
        />
      )}

      {/* Shift Booking Modal */}
      <ShiftBookingModal
        showBookingModal={showBookingModal}
        bookingPharmacist={bookingPharmacist}
        calMonth={calMonth}
        setCalMonth={setCalMonth}
        calDays={calDays}
        shiftToday={shiftToday}
        shiftMaxDate={shiftMaxDate}
        shiftIsToday={shiftIsToday}
        SHIFT_MONTH_NAMES={SHIFT_MONTH_NAMES}
        SHIFT_DAY_SHORT={SHIFT_DAY_SHORT}
        shiftDateKey={shiftDateKey}
        bookedShiftDates={bookedShiftDates}
        selectedShiftDate={selectedShiftDate}
        setSelectedShiftDate={setSelectedShiftDate}
        selectedShiftTime={selectedShiftTime}
        setSelectedShiftTime={setSelectedShiftTime}
        handleConfirmBooking={handleConfirmBooking}
        setShowBookingModal={setShowBookingModal}
      />

      {/* AI Assistant Sidebar */}
      {requestTab === "ongoing" && (
        <PharmacistAIAssistant
          activeConsultations={patientRequests
            .filter(
              (r) =>
                r.handoff.status === "accepted" || r.handoff.status === "ready",
            )
            .map((r) => ({
              id: r.handoff._id,
              patientName: r.handoff.patientName,
              suggestionCount: 0, // Will be populated from actual AI state
              hasCriticalAlert: false,
              isTranscribing: false,
            }))}
          allSuggestions={[]}
          quotaRemaining={1500}
          onNavigateToConsultation={setTelepharmacyTargetIndex}
        />
      )}
    </div>
  );
}
