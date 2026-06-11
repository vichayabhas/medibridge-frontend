"use client";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import React from "react";
import {
  LayoutList,
  Map as MapIcon,
  AlertCircle,
  BadgeCheck,
  ChevronRight,
  Clock,
  Store,
  Crosshair,
  Globe2,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Pill,
  Search,
  SlidersHorizontal,
  Star,
  Stethoscope,
  Truck,
  Video,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "../utility/setup";
import { PharmacistType, PharmacyWithDistance } from "../../../interface";
import "./NearbyPage.css";
import QuickMatchBanner from "./QuickMatchBanner";
import PharmacyCard from "./PharmacyCard";
import EmptyState from "./EmptyState";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  cacheOverpassPharmacies,
  DEFAULT_LOCATION,
  fetchNearbyPharmacies,
  getCachedOverpassPharmacy,
  OverpassPharmacy,
} from "./overpassPharmacies";
import QuickBookingModal from "./QuickBookingModal";
import PharmacistDetailPanel from "./PharmacistDetailPanel";
import PharmacistCard from "./PharmacistCard";
import FilterPanel from "./FilterPanel";
import PharmacyDetailPanel from "./PharmacyDetailPanel";
import PharmacyMap from "./PharmacyMap";

type FilterType = "all" | "hours" | "phone" | "open";

// const filterOptions: { key: FilterType; label: string }[] = [
//   { key: "all", label: "ทั้งหมด" },
//   { key: "hours", label: "มีเวลาเปิด" },
//   { key: "phone", label: "มีเบอร์โทร" },
// ];

/* ─── Pharmacist helpers ───────────────────────────────────────────────── */
export const PHARMACIST_PHOTOS: Record<string, string> = {
  "rph-001":
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
  "rph-002":
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80",
  "rph-003":
    "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80",
  "rph-004":
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&q=80",
  "rph-005":
    "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&q=80",
  "rph-006":
    "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=200&q=80",
  "rph-007":
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&q=80",
};

// type AvailabilityFilter = "all" | "online" | "busy";

export interface PharmacistFilters {
  specialties: string[];
  languages: string[];
  minExperience: number;
  minRating: number;
  consultMethods: ("chat" | "phone" | "video")[];
}

/* ─── Quick Booking Modal ──────────────────────────────────────────── */

/* ─── Main tabs ─────────────────────────────────────────────────────── */
type TabKey = "pharmacy" | "pharmacist";

export default function NearbyPage({
  pharmacists,
  allPharmacies
}: {
  pharmacists: PharmacistType[];
  allPharmacies:PharmacyWithDistance[]
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Get initial state from URL
  const initialTab =
    searchParams.get("tab") === "pharmacist" ? "pharmacist" : "pharmacy";
  const [activeTab, setActiveTab] = React.useState<TabKey>(initialTab);

  // 2. Sync tab changes to URL using Next.js navigation primitives
  const handleTabChange = useCallback(
    (tab: TabKey) => {
      setActiveTab(tab);

      // Create a mutable copy of current params so you don't lose other existing query params
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);

      // Equivalent to setSearchParams({ tab }, { replace: true })
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  // Pharmacy state
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [pharmacies, setPharmacies] = React.useState<OverpassPharmacy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [location, setLocation] = React.useState(DEFAULT_LOCATION);
  const [isRealLocation, setIsRealLocation] = React.useState(false);
  const [locating, setLocating] = React.useState(true); // Start as true to show loading immediately
  const [locationReady, setLocationReady] = React.useState(false); // Don't show map until location is determined
  const [searchQuery, setSearchQuery] = React.useState("");
  const [mobileView, setMobileView] = React.useState<"list" | "map">("list");
  const [panelId, setPanelId] = React.useState<string | null>(null);
  const [hasOnlineFilter, setHasOnlineFilter] = React.useState(false);
  const [nearbyFilter, setNearbyFilter] = React.useState(false);
  const [verifiedFilter, setVerifiedFilter] = React.useState(false);
  const [hasDeliveryFilter, setHasDeliveryFilter] = React.useState(false);
  const [hasPhoneFilter, setHasPhoneFilter] = React.useState(false);
  const [maxDistance, setMaxDistance] = React.useState<string>("");
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = React.useState(false);
  const [manualAddress, setManualAddress] = React.useState("");
  const [recenterKey, setRecenterKey] = React.useState(0);
  const [mapSelectionMode, setMapSelectionMode] = React.useState(false);

  // Pharmacist state
  const allPharmacists = pharmacists;
  const [rphSearch, setRphSearch] = React.useState("");
  const [selectedRphId, setSelectedRphId] = React.useState<string | null>(null);
  const [bookingPharmacistId, setBookingPharmacistId] = React.useState<
    string | null
  >(null);
  const [showFilterPanel, setShowFilterPanel] = React.useState(false);
  const [pharmacistFilters, setPharmacistFilters] =
    React.useState<PharmacistFilters>({
      specialties: [],
      languages: [],
      minExperience: 0,
      minRating: 0,
      consultMethods: [],
    });

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (pharmacistFilters.specialties.length > 0) count++;
    if (pharmacistFilters.languages.length > 0) count++;
    if (pharmacistFilters.minExperience > 0) count++;
    if (pharmacistFilters.minRating > 0) count++;
    if (pharmacistFilters.consultMethods.length > 0) count++;
    return count;
  }, [pharmacistFilters]);

  // Tooltip state - only show on first visit
  const TOOLTIP_DISMISSED_KEY = "medibridge.tooltipDismissed";
  const [showTooltip, setShowTooltip] = React.useState(() => {
    try {
      return !localStorage.getItem(TOOLTIP_DISMISSED_KEY);
    } catch {
      return true;
    }
  });
  const [tooltipExiting, setTooltipExiting] = React.useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPharmacies(lat: number, lng: number) {
      setLoading(true);
      setError(null);
      try {
        const results = await fetchNearbyPharmacies(lat, lng);
        if (!cancelled) {
          cacheOverpassPharmacies(results, lat, lng);
          setPharmacies(results);
          setSelectedId(results[0]?._id ?? null);
        }
      } catch {
        if (!cancelled) {
          setPharmacies([]);
          setError(
            "เรียก Overpass API ไม่สำเร็จ อาจถูกจำกัดชั่วคราวหรือเครือข่ายไม่พร้อม",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Try real GPS first, fall back to Bangkok
    const requestLocation = () => {
      setLocating(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (cancelled) return;
            const { latitude: lat, longitude: lng, accuracy } = pos.coords;
            console.log("[GPS] Got position:", lat, lng, "accuracy:", accuracy);
            setLocation({
              lat,
              lng,
              label: `ตำแหน่งของคุณ (${accuracy.toFixed(0)}ม.)`,
            });
            setIsRealLocation(true);
            setLocating(false);
            setLocationReady(true);
            void loadPharmacies(lat, lng);
          },
          (err) => {
            // Permission denied or unavailable — don't show Bangkok, show location modal instead
            console.error("[GPS] Error:", err.code, err.message);
            let errorMsg = "ไม่สามารถเข้าถึงตำแหน่งได้";
            if (err.code === 1)
              errorMsg = "กรุณาอนุญาตให้เข้าถึงตำแหน่งในเบราว์เซอร์";
            if (err.code === 2) errorMsg = "ตำแหน่งไม่พร้อมใช้งาน";
            if (err.code === 3) errorMsg = "หมดเวลารอตำแหน่ง";
            if (cancelled) return;
            setLocation({
              ...DEFAULT_LOCATION,
              label: `กรุงเทพมหานคร (${errorMsg})`,
            });
            setIsRealLocation(false);
            setLocating(false);
            setLocationError(errorMsg);
            // Don't set locationReady - keep showing loading + location modal
            setShowLocationModal(true);
            // Still load Bangkok pharmacies in background so they're ready if needed
            void loadPharmacies(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
          },
          { timeout: 15000, maximumAge: 0, enableHighAccuracy: true },
        );
      } else {
        console.error("[GPS] navigator.geolocation not available");
        setLocation({
          ...DEFAULT_LOCATION,
          label: "กรุงเทพมหานคร (เบราว์เซอร์ไม่รองรับ GPS)",
        });
        setIsRealLocation(false);
        setLocating(false);
        setLocationError("เบราว์เซอร์ไม่รองรับการระบุตำแหน่ง");
        // Don't set locationReady - show location modal instead
        setShowLocationModal(true);
        void loadPharmacies(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng);
      }
    };

    requestLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  // Manual refresh location
  const refreshLocation = useCallback(() => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng, accuracy } = pos.coords;
          setLocation({
            lat,
            lng,
            label: `ตำแหน่งของคุณ (${accuracy.toFixed(0)}ม.)`,
          });
          setIsRealLocation(true);
          setLocating(false);
          // Reload pharmacies with new location
          void (async () => {
            setLoading(true);
            try {
              const results = await fetchNearbyPharmacies(lat, lng);
              cacheOverpassPharmacies(results, lat, lng);
              setPharmacies(results);
              setSelectedId(results[0]?._id ?? null);
            } catch {
              setError("เรียก Overpass API ไม่สำเร็จ");
            } finally {
              setLoading(false);
            }
          })();
        },
        () => {
          setLocating(false);
        },
        { timeout: 10000, maximumAge: 0, enableHighAccuracy: true },
      );
    }
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return pharmacies.filter((p) => {
      if (activeFilter === "hours" && !p.openingHoursText) return false;
      if (activeFilter === "phone" && !p.phone) return false;
      if (activeFilter === "open" && !p.isOpen) return false;
      if (q) {
        const searchable = `${p.name} ${p.address} ${p.phone}`.toLowerCase();
        return searchable.includes(q);
      }
      return true;
    });
  }, [activeFilter, pharmacies, searchQuery]);

  // Enhanced filtered with quick filters
  const maxDistanceKm =
    maxDistance.trim() !== "" ? parseFloat(maxDistance) : null;
  const enhancedFiltered = useMemo(() => {
    return filtered.filter((p) => {
      // Max distance filter (user-entered value in km)
      if (
        maxDistanceKm !== null &&
        !isNaN(maxDistanceKm) &&
        maxDistanceKm > 0 &&
        p.distance > maxDistanceKm
      )
        return false;
      // Nearby < 1km filter
      if (nearbyFilter && p.distance >= 1) return false;
      // Has phone filter
      if (hasPhoneFilter && !p.phone) return false;
      // Verified pharmacy filter
      if (verifiedFilter && p.verificationStatus !== "verified") return false;
      // Has delivery filter
      if (hasDeliveryFilter && !p.hasDelivery) return false;
      // Has online pharmacist filter (OSM pharmacies don't carry this data — skip)
      if (hasOnlineFilter) return false;

      return true;
    });
  }, [
    filtered,
    nearbyFilter,
    hasPhoneFilter,
    verifiedFilter,
    hasDeliveryFilter,
    hasOnlineFilter,
    maxDistanceKm,
  ]);

  // Pharmacist filtering
  const filteredRph = useMemo(() => {
    const q = rphSearch.trim().toLowerCase();
    return allPharmacists.filter((p) => {
      // Availability filter
      if (p.availability === "offline") return false;

      // Specialty filter (AND logic - must have all selected specialties)
      if (pharmacistFilters.specialties.length > 0) {
        const hasAllSpecialties = pharmacistFilters.specialties.every((s) =>
          p.specialties.includes(s),
        );
        if (!hasAllSpecialties) return false;
      }

      // Language filter (OR logic - must have at least one selected language)
      if (pharmacistFilters.languages.length > 0) {
        const hasAnyLanguage = pharmacistFilters.languages.some((l) =>
          p.languages.includes(l),
        );
        if (!hasAnyLanguage) return false;
      }

      // Experience filter
      if (
        pharmacistFilters.minExperience > 0 &&
        p.experience < pharmacistFilters.minExperience
      ) {
        return false;
      }

      // Rating filter
      if (
        pharmacistFilters.minRating > 0 &&
        p.rating < pharmacistFilters.minRating
      ) {
        return false;
      }

      // Consult method filter (must support at least one selected method with rate > 0)
      if (pharmacistFilters.consultMethods.length > 0) {
        const supportsAnyMethod = pharmacistFilters.consultMethods.some(
          (m) => p.methodRates[m] > 0,
        );
        if (!supportsAnyMethod) return false;
      }

      // Search query
      if (q) {
        const searchable =
          `${p.name} ${p.licenseNo} ${p.specialties.join(" ")} ${p.workplace}`.toLowerCase();
        return searchable.includes(q);
      }
      return true;
    });
  }, [rphSearch, allPharmacists, pharmacistFilters]);

  const selectedRph =
    filteredRph.find((p) => p._id === selectedRphId) ?? filteredRph[0];
  const bookingPharmacist =
    allPharmacists.find((p) => p._id === bookingPharmacistId) ?? null;

  const handleConfirmConsult = () => {
    const id = selectedRphId ?? selectedRph?._id;
    if (!id) return;
    setBookingPharmacistId(id);
  };

  return (
    <div className="flex flex-col h-[100svh] pt-16">
      {/* ── Tab switcher ── */}
      <div className="shrink-0 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="grid grid-cols-2">
          {[
            { key: "pharmacy" as TabKey, label: "ร้านยา", icon: Pill },
            {
              key: "pharmacist" as TabKey,
              label: "เภสัชกร",
              icon: Stethoscope,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                handleTabChange(tab.key);
                if (tab.key === "pharmacist") {
                  try {
                    localStorage.setItem(TOOLTIP_DISMISSED_KEY, "1");
                    // eslint-disable-next-line no-empty
                  } catch {}
                  setTooltipExiting(true);
                }
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all duration-200 border-b-2",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dismissible tooltip pointing at เภสัชกร tab ── */}
      {showTooltip && activeTab === "pharmacy" && (
        <div
          className={cn(
            "fixed top-[calc(4rem+44px)] left-3/4 z-[9999] -translate-x-1/2 w-[240px]",
            "animate-in fade-in slide-in-from-top-2 duration-500",
            tooltipExiting &&
              "animate-out fade-out slide-out-to-top-2 duration-300",
          )}
          onAnimationEnd={() => {
            if (tooltipExiting) {
              setShowTooltip(false);
              setTooltipExiting(false);
            }
          }}
        >
          {/* Arrow pointing up — centered on the เภสัชกร tab (right quarter) */}
          <div className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-primary" />
          {/* Bubble with periodic bounce animation */}
          <div className="relative bg-primary text-white rounded-xl px-4 py-3 shadow-xl shadow-primary/30 mt-1 periodic-bounce">
            <button
              type="button"
              onClick={() => {
                try {
                  localStorage.setItem(TOOLTIP_DISMISSED_KEY, "1");
                  // eslint-disable-next-line no-empty
                } catch {}
                setTooltipExiting(true);
              }}
              className="absolute top-2 right-2 p-0.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="ปิด"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="text-xs font-bold mb-1 pr-4">💬 ปรึกษาเภสัชกรฟรี!</p>
            <p className="text-[11px] leading-relaxed opacity-90">
              กดแท็บ {`"`}
              <strong>เภสัชกร</strong>
              {`"`}
              เพื่อพูดคุยกับเภสัชกรตัวจริงผ่านแชท โทร หรือวิดีโอคอล
            </p>
          </div>
        </div>
      )}

      {/* Periodic bounce animation styles */}
      <style>{`
        @keyframes periodic-bounce {
          0%, 5% { transform: translateY(0); }
          10% { transform: translateY(-8px); }
          15% { transform: translateY(0); }
          20% { transform: translateY(-4px); }
          25%, 100% { transform: translateY(0); }
        }
        .periodic-bounce {
          animation: periodic-bounce 5s ease-in-out infinite;
        }
      `}</style>

      {/* ── Location Error Notification ── */}
      {locationError && !isRealLocation && (
        <div className="shrink-0 px-4 py-3 bg-amber-50 border-b border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                ไม่สามารถเข้าถึงตำแหน่งของคุณได้
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {locationError} • กำลังแสดงร้านยาในกรุงเทพฯ (ค่าเริ่มต้น)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 transition-colors"
            >
              ระบุตำแหน่งเอง
            </button>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              className="shrink-0 p-1 rounded-full hover:bg-amber-100 transition-colors"
            >
              <X className="h-4 w-4 text-amber-600" />
            </button>
          </div>
        </div>
      )}

      {/* ── Manual Location Modal ── */}
      {showLocationModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLocationModal(false)}
          />
          <div className="relative z-10 w-full sm:max-w-md bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85svh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50 shrink-0">
              <div>
                <h3 className="font-bold text-base">เปลี่ยนตำแหน่ง</h3>
                <p className="text-[11px] text-muted-foreground">
                  เลือกตำแหน่งใหม่เพื่อค้นหาร้านยาในพื้นที่อื่น
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Quick select locations */}
              <div>
                <h4 className="text-xs font-bold mb-2 text-muted-foreground">
                  เลือกจังหวัด
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "กรุงเทพมหานคร", lat: 13.7563, lng: 100.5018 },
                    { name: "เชียงใหม่", lat: 18.7883, lng: 98.9853 },
                    { name: "ภูเก็ต", lat: 7.8804, lng: 98.3923 },
                    { name: "ชลบุรี", lat: 13.3611, lng: 100.9847 },
                    { name: "นครราชสีมา", lat: 14.9799, lng: 102.0977 },
                    { name: "ขอนแก่น", lat: 16.4419, lng: 102.8356 },
                    { name: "เชียงราย", lat: 19.9104, lng: 99.8404 },
                    { name: "หาดใหญ่", lat: 7.0084, lng: 100.4747 },
                  ].map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => {
                        setLocation({
                          lat: loc.lat,
                          lng: loc.lng,
                          label: loc.name,
                        });
                        setIsRealLocation(false);
                        setLocationError(null);
                        setShowLocationModal(false);
                        setLocationReady(true); // Show content now that user selected location
                        setRecenterKey((k) => k + 1);
                        // Reload pharmacies
                        setLoading(true);
                        void (async () => {
                          try {
                            const results = await fetchNearbyPharmacies(
                              loc.lat,
                              loc.lng,
                            );
                            cacheOverpassPharmacies(results, loc.lat, loc.lng);
                            setPharmacies(results);
                            setSelectedId(results[0]?._id ?? null);
                          } catch {
                            setError("เรียก Overpass API ไม่สำเร็จ");
                          } finally {
                            setLoading(false);
                          }
                        })();
                      }}
                      className="flex items-center gap-2 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all text-left"
                    >
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-medium">{loc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select on map option */}
              <div>
                <h4 className="text-xs font-bold mb-2 text-muted-foreground">
                  หรือเลือกบนแผนที่
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowLocationModal(false);
                    setMapSelectionMode(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/60 transition-all"
                >
                  <Navigation className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    เลือกตำแหน่งบนแผนที่
                  </span>
                </button>
                <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                  คลิกบนแผนที่เพื่อเลือกตำแหน่งใหม่
                </p>
              </div>

              {/* Manual address input */}
              <div>
                <h4 className="text-xs font-bold mb-2 text-muted-foreground">
                  หรือระบุที่อยู่
                </h4>
                <div className="flex gap-2">
                  <Input
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="เช่น 123 ถนนสุขุมวิท กรุงเทพฯ"
                    className="flex-1 h-10 rounded-xl text-sm"
                  />
                  <Button
                    onClick={() => {
                      // Try to geocode using Nominatim
                      if (!manualAddress.trim()) return;
                      setLoading(true);
                      void (async () => {
                        try {
                          const response = await fetch(
                            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualAddress)}&limit=1&countrycodes=th`,
                          );
                          const data = await response.json();
                          if (data && data[0]) {
                            const { lat, lon, display_name } = data[0];
                            const latNum = parseFloat(lat);
                            const lngNum = parseFloat(lon);
                            setLocation({
                              lat: latNum,
                              lng: lngNum,
                              label: display_name.split(",")[0],
                            });
                            setIsRealLocation(false);
                            setLocationError(null);
                            setShowLocationModal(false);
                            setManualAddress("");
                            setLocationReady(true); // Show content now that user selected location
                            setRecenterKey((k) => k + 1);
                            // Reload pharmacies
                            const results = await fetchNearbyPharmacies(
                              latNum,
                              lngNum,
                            );
                            cacheOverpassPharmacies(results, latNum, lngNum);
                            setPharmacies(results);
                            setSelectedId(results[0]?._id ?? null);
                          } else {
                            alert("ไม่พบตำแหน่ง กรุณาลองคำค้นหาอื่น");
                          }
                        } catch {
                          alert("ไม่สามารถค้นหาตำแหน่งได้ กรุณาลองใหม่");
                        } finally {
                          setLoading(false);
                        }
                      })();
                    }}
                    disabled={!manualAddress.trim() || loading}
                    className="h-10 px-4 rounded-xl"
                  >
                    ค้นหา
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  ระบบจะค้นหาตำแหน่งจาก OpenStreetMap
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 px-5 py-4 border-t border-border/50 bg-muted/20">
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl"
                onClick={() => setShowLocationModal(false)}
              >
                ปิด
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Map Selection Mode Banner ── */}
      {mapSelectionMode && (
        <div className="shrink-0 px-4 py-3 bg-primary/10 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-primary">
                โหมดเลือกตำแหน่ง: คลิกบนแผนที่เพื่อเลือกจุดใหม่
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMapSelectionMode(false)}
              className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      )}

      {/* ── Location Loading Screen ── */}
      {activeTab === "pharmacy" && !locationReady && (
        <div className="flex-1 flex flex-col items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary animate-bounce" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground mb-1">
                กำลังหาตำแหน่งของคุณ...
              </p>
              <p className="text-sm text-muted-foreground">
                กรุณาอนุญาตการเข้าถึงตำแหน่งหรือรอสักครู่
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="mt-4 px-4 py-2 rounded-xl border border-border/50 bg-background text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
            >
              เลือกตำแหน่งเอง
            </button>
          </div>
        </div>
      )}

      {/* ── Pharmacy tab ── */}
      {activeTab === "pharmacy" && locationReady && (
        <>
          <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                ร้านยาใกล้ฉัน
                {enhancedFiltered.length > 0 && (
                  <Badge variant="default" className="text-[11px] px-2 py-0.5">
                    {enhancedFiltered.length} ร้าน
                  </Badge>
                )}
              </h2>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-primary shrink-0" />
                {location.label} - แสดงร้านยาจาก OpenStreetMap สูงสุด 20 ร้าน
                {isRealLocation && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/15 text-success font-medium">
                    GPS
                  </span>
                )}
                {!isRealLocation && !locating && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium">
                    ค่าเริ่มต้น
                  </span>
                )}
                {locating && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    กำลังหา...
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                {/* Change location button - always available */}
                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors"
                  title="เปลี่ยนตำแหน่ง"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  เปลี่ยนที่
                </button>
                {!isRealLocation && !locating && (
                  <button
                    type="button"
                    onClick={refreshLocation}
                    className="flex items-center gap-1 text-[11px] font-medium text-destructive hover:text-destructive/80 transition-colors"
                    title="อนุญาตให้เข้าถึงตำแหน่ง"
                  >
                    <Crosshair className="h-3.5 w-3.5" />
                    อนุญาตตำแหน่ง
                  </button>
                )}
                <button
                  type="button"
                  onClick={refreshLocation}
                  disabled={locating}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="รีเฟรชตำแหน่ง"
                >
                  <Crosshair
                    className={cn("h-3.5 w-3.5", locating && "animate-pulse")}
                  />
                  {locating ? "กำลังหา..." : "รีเฟรช"}
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="ค้นหาชื่อร้านยา ที่อยู่ หรือเบอร์โทร"
                  className="h-10 rounded-2xl pl-9 text-sm"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="relative w-[110px] shrink-0">
                <Navigation className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  placeholder="ระยะ (กม.)"
                  className="h-10 rounded-2xl pl-8 pr-2 text-xs"
                />
                {maxDistance && (
                  <button
                    type="button"
                    onClick={() => setMaxDistance("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick filter chips for pharmacies */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
              {/* Open now */}
              <button
                type="button"
                onClick={() =>
                  setActiveFilter((prev) => (prev === "open" ? "all" : "open"))
                }
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                  activeFilter === "open"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-background text-muted-foreground border-border/50 hover:border-emerald-200 hover:text-emerald-600",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    activeFilter === "open"
                      ? "bg-emerald-600"
                      : "bg-emerald-400",
                  )}
                />
                เปิดอยู่
              </button>

              {/* Has online pharmacist */}
              <button
                type="button"
                onClick={() => setHasOnlineFilter((prev) => !prev)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                  hasOnlineFilter
                    ? "bg-sky-50 text-sky-700 border-sky-200"
                    : "bg-background text-muted-foreground border-border/50 hover:border-sky-200 hover:text-sky-600",
                )}
              >
                <Stethoscope className="h-3 w-3" />
                มีเภสัชกรออนไลน์
              </button>

              {/* Nearby < 1km */}
              <button
                type="button"
                onClick={() => setNearbyFilter((prev) => !prev)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                  nearbyFilter
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-background text-muted-foreground border-border/50 hover:border-amber-200 hover:text-amber-600",
                )}
              >
                <Navigation className="h-3 w-3" />
                ใกล้ฉัน (&lt;1 กม.)
              </button>

              {/* Verified pharmacy */}
              <button
                type="button"
                onClick={() => setVerifiedFilter((prev) => !prev)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                  verifiedFilter
                    ? "bg-violet-50 text-violet-700 border-violet-200"
                    : "bg-background text-muted-foreground border-border/50 hover:border-violet-200 hover:text-violet-600",
                )}
              >
                <BadgeCheck className="h-3 w-3" />
                ร้านยืนยันแล้ว
              </button>

              {/* Has delivery */}
              <button
                type="button"
                onClick={() => setHasDeliveryFilter((prev) => !prev)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                  hasDeliveryFilter
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-background text-muted-foreground border-border/50 hover:border-rose-200 hover:text-rose-600",
                )}
              >
                <Truck className="h-3 w-3" />
                มีจัดส่ง
              </button>

              {/* Has phone */}
              <button
                type="button"
                onClick={() => setHasPhoneFilter((prev) => !prev)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                  hasPhoneFilter
                    ? "bg-teal-50 text-teal-700 border-teal-200"
                    : "bg-background text-muted-foreground border-border/50 hover:border-teal-200 hover:text-teal-600",
                )}
              >
                <Phone className="h-3 w-3" />
                มีเบอร์โทร
              </button>
            </div>
          </div>

          {/* Mobile list/map toggle */}
          <div className="flex md:hidden shrink-0 items-center gap-2 px-4 py-2 border-b border-border/40 bg-background">
            <button
              onClick={() => setMobileView("list")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
                mobileView === "list"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              รายการ
            </button>
            <button
              onClick={() => setMobileView("map")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
                mobileView === "map"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MapIcon className="h-3.5 w-3.5" />
              แผนที่
            </button>
          </div>

          {/* ── Map filter bar (mobile only, shown when map view is active) ── */}
          {mobileView === "map" && (
            <div className="md:hidden shrink-0 px-3 pt-2 pb-2 bg-background/95 backdrop-blur-xl border-b border-border/40 shadow-sm space-y-2">
              {/* Search + distance inputs */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาร้านยา..."
                    className="h-9 rounded-xl pl-8 text-xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <div className="relative w-[100px] shrink-0">
                  <Navigation className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    placeholder="ระยะ (กม.)"
                    className="h-9 rounded-xl pl-7 pr-2 text-xs"
                  />
                  {maxDistance && (
                    <button
                      type="button"
                      onClick={() => setMaxDistance("")}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                {/* Open now */}
                <button
                  type="button"
                  onClick={() =>
                    setActiveFilter((prev) =>
                      prev === "open" ? "all" : "open",
                    )
                  }
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    activeFilter === "open"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-emerald-200 hover:text-emerald-600",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      activeFilter === "open"
                        ? "bg-emerald-600"
                        : "bg-emerald-400",
                    )}
                  />
                  เปิดอยู่
                </button>

                {/* Nearby < 1km */}
                <button
                  type="button"
                  onClick={() => setNearbyFilter((prev) => !prev)}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    nearbyFilter
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-amber-200 hover:text-amber-600",
                  )}
                >
                  <Navigation className="h-3 w-3" />
                  ใกล้ฉัน (&lt;1 กม.)
                </button>

                {/* Has phone */}
                <button
                  type="button"
                  onClick={() => setHasPhoneFilter((prev) => !prev)}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    hasPhoneFilter
                      ? "bg-teal-50 text-teal-700 border-teal-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-teal-200 hover:text-teal-600",
                  )}
                >
                  <Phone className="h-3 w-3" />
                  มีเบอร์โทร
                </button>

                {/* Has online pharmacist */}
                <button
                  type="button"
                  onClick={() => setHasOnlineFilter((prev) => !prev)}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    hasOnlineFilter
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-sky-200 hover:text-sky-600",
                  )}
                >
                  <Stethoscope className="h-3 w-3" />
                  มีเภสัชกรออนไลน์
                </button>

                {/* Verified */}
                <button
                  type="button"
                  onClick={() => setVerifiedFilter((prev) => !prev)}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    verifiedFilter
                      ? "bg-violet-50 text-violet-700 border-violet-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-violet-200 hover:text-violet-600",
                  )}
                >
                  <BadgeCheck className="h-3 w-3" />
                  ร้านยืนยันแล้ว
                </button>

                {/* Has delivery */}
                <button
                  type="button"
                  onClick={() => setHasDeliveryFilter((prev) => !prev)}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    hasDeliveryFilter
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-rose-200 hover:text-rose-600",
                  )}
                >
                  <Truck className="h-3 w-3" />
                  มีจัดส่ง
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-1 overflow-hidden">
            <div
              className={cn(
                "w-full md:w-[400px] flex-shrink-0 overflow-y-auto",
                mobileView === "map" && "hidden md:flex md:flex-col",
              )}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังดึงร้านยาจาก OpenStreetMap
                </div>
              ) : enhancedFiltered.length === 0 ? (
                <EmptyState error={error} />
              ) : (
                <div className="p-3 space-y-3">
                  {/* ── Consult CTA banner ── */}
                  <button
                    type="button"
                    onClick={() => handleTabChange("pharmacist")}
                    className="w-full rounded-2xl border-2 border-primary/25 bg-gradient-to-r from-primary/8 via-secondary/8 to-primary/8 p-4 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-[var(--shadow-elevated)] group reveal-up"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/25 group-hover:scale-105 transition-transform">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-sm text-primary">
                            ปรึกษาเภสัชกรออนไลน์
                          </p>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug">
                          เภสัชกร{" "}
                          <strong className="text-foreground">
                            {
                              allPharmacists.filter(
                                (r) => r.availability === "online",
                              ).length
                            }{" "}
                            คน
                          </strong>{" "}
                          พร้อมให้บริการ — แชท, โทร หรือวิดีโอคอล
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>

                  {enhancedFiltered.map((p, i) => (
                    <div
                      key={p._id}
                      className="reveal-up"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <PharmacyCard
                        p={p}
                        selected={selectedId === p._id}
                        onSelect={() => setSelectedId(p._id)}
                        onOpenPanel={() => {
                          setSelectedId(p._id);
                          setPanelId(p._id);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className={cn(
                "flex-1 relative",
                mobileView === "list" ? "hidden md:flex" : "flex",
              )}
            >
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center bg-muted/30">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      <span className="text-xs font-medium">
                        กำลังโหลดแผนที่
                      </span>
                    </div>
                  </div>
                }
              >
                <PharmacyMap
                  key={isRealLocation ? "real" : "default"} // Force remount when real location obtained
                  pharmacies={enhancedFiltered}
                  selectedId={selectedId}
                  onSelect={(id) => {
                    setSelectedId(id);
                    setPanelId(id);
                  }}
                  count={enhancedFiltered.length}
                  userLocation={location}
                  recenterKey={recenterKey}
                  allowMapSelection={mapSelectionMode}
                  onMapClick={(lat, lng) => {
                    setMapSelectionMode(false);
                    setLocation({
                      lat,
                      lng,
                      label: `ตำแหน่งที่เลือก (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                    });
                    setIsRealLocation(false);
                    setLocationReady(true); // Show content now that user selected location
                    // Reload pharmacies for clicked location
                    setLoading(true);
                    void (async () => {
                      try {
                        const results = await fetchNearbyPharmacies(lat, lng);
                        cacheOverpassPharmacies(results, lat, lng);
                        setPharmacies(results);
                        setSelectedId(results[0]?._id ?? null);
                        setRecenterKey((k) => k + 1);
                      } catch {
                        setError("เรียก Overpass API ไม่สำเร็จ");
                      } finally {
                        setLoading(false);
                      }
                    })();
                  }}
                />
              </Suspense>

              {/* Recenter button */}
              <button
                type="button"
                onClick={() => {
                  // Try to get GPS first, then recenter and reload
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const {
                          latitude: lat,
                          longitude: lng,
                          accuracy,
                        } = pos.coords;
                        setLocation({
                          lat,
                          lng,
                          label: `ตำแหน่งของคุณ (${accuracy.toFixed(0)}ม.)`,
                        });
                        setIsRealLocation(true);
                        // Reload pharmacies with new GPS location first
                        setLoading(true);
                        void (async () => {
                          try {
                            const results = await fetchNearbyPharmacies(
                              lat,
                              lng,
                            );
                            cacheOverpassPharmacies(results, lat, lng);
                            setPharmacies(results);
                            setSelectedId(results[0]?._id ?? null);
                            // Then recenter map after pharmacies loaded
                            setRecenterKey((k) => k + 1);
                          } catch {
                            setError("เรียก Overpass API ไม่สำเร็จ");
                          } finally {
                            setLoading(false);
                          }
                        })();
                      },
                      () => {
                        // GPS failed - recenter to last known location if not default
                        const currentLoc = location;
                        if (
                          currentLoc.lat !== DEFAULT_LOCATION.lat ||
                          currentLoc.lng !== DEFAULT_LOCATION.lng
                        ) {
                          setRecenterKey((k) => k + 1);
                          setLoading(true);
                          void (async () => {
                            try {
                              const results = await fetchNearbyPharmacies(
                                currentLoc.lat,
                                currentLoc.lng,
                              );
                              cacheOverpassPharmacies(
                                results,
                                currentLoc.lat,
                                currentLoc.lng,
                              );
                              setPharmacies(results);
                              setSelectedId(results[0]?._id ?? null);
                            } catch {
                              setError("เรียก Overpass API ไม่สำเร็จ");
                            } finally {
                              setLoading(false);
                            }
                          })();
                        }
                      },
                      {
                        timeout: 5000,
                        maximumAge: 60000,
                        enableHighAccuracy: false,
                      },
                    );
                  } else {
                    // No GPS support - use current location
                    const currentLoc = location;
                    if (
                      currentLoc.lat !== DEFAULT_LOCATION.lat ||
                      currentLoc.lng !== DEFAULT_LOCATION.lng
                    ) {
                      setRecenterKey((k) => k + 1);
                      setLoading(true);
                      void (async () => {
                        try {
                          const results = await fetchNearbyPharmacies(
                            currentLoc.lat,
                            currentLoc.lng,
                          );
                          cacheOverpassPharmacies(
                            results,
                            currentLoc.lat,
                            currentLoc.lng,
                          );
                          setPharmacies(results);
                          setSelectedId(results[0]?._id ?? null);
                        } catch {
                          setError("เรียก Overpass API ไม่สำเร็จ");
                        } finally {
                          setLoading(false);
                        }
                      })();
                    }
                  }
                }}
                className="absolute bottom-6 left-6 z-[1000] flex items-center justify-center h-11 w-11 rounded-full bg-white shadow-lg shadow-black/20 border border-border/50 hover:bg-muted/50 active:scale-95 transition-all"
                title="กลับไปที่ตำแหน่งของฉัน"
              >
                <Navigation className="h-5 w-5 text-primary" />
              </button>

              <PharmacyDetailPanel
                pharmacyId={panelId}
                osmPharmacy={
                  panelId ? getCachedOverpassPharmacy(panelId) : null
                }
                onClose={() => setPanelId(null)}
                pharmacists={pharmacists}
                // pharmacies={pharmacies}
                pharmacies={allPharmacies}
              />
            </div>
          </div>
        </>
      )}

      {/* ── Pharmacist tab ── */}
      {activeTab === "pharmacist" && (
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left: filter bar + card grid ── */}
          <div className="flex flex-col w-full lg:w-[55%] xl:w-[58%] shrink-0 overflow-hidden">
            {/* Section header - like "คำขอที่กำลังดำเนินการ" */}
            <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-bold text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  เภสัชกรที่พร้อมให้บริการ
                  {allPharmacists.filter((r) => r.availability === "online")
                    .length > 0 && (
                    <Badge
                      variant="success"
                      className="text-[11px] px-2 py-0.5"
                    >
                      {
                        allPharmacists.filter(
                          (r) => r.availability === "online",
                        ).length
                      }{" "}
                      ออนไลน์
                    </Badge>
                  )}
                </h2>
              </div>
              <p className="text-[11px] text-muted-foreground">
                พบ {filteredRph.length} คน • รอเฉลี่ย 8 นาที
              </p>
            </div>

            {/* Search + filter bar */}
            <div className="shrink-0 px-4 pt-3 pb-2 border-b border-border/40 bg-background space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={rphSearch}
                    onChange={(e) => setRphSearch(e.target.value)}
                    placeholder="ค้นหาชื่อ ความเชี่ยวชาญ หรือสถานที่"
                    className="h-9 rounded-xl pl-8 text-xs"
                  />
                  {rphSearch && (
                    <button
                      type="button"
                      onClick={() => setRphSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilterPanel(true)}
                  className={cn(
                    "relative flex items-center justify-center h-9 w-9 rounded-xl border transition-all shrink-0",
                    activeFilterCount > 0
                      ? "border-primary bg-primary text-white"
                      : "border-border/50 bg-background text-muted-foreground hover:border-primary/40 hover:text-primary",
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Quick filter chips */}
            <div className="shrink-0 px-4 py-2 border-b border-border/30 bg-background/80">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                {/* Rating */}
                <button
                  type="button"
                  onClick={() =>
                    setPharmacistFilters((prev) => ({
                      ...prev,
                      minRating: prev.minRating === 4 ? 0 : 4,
                    }))
                  }
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    pharmacistFilters.minRating === 4
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-amber-200 hover:text-amber-600",
                  )}
                >
                  <Star className="h-3 w-3 fill-current" />
                  4+ ดาว
                </button>

                {/* Experience */}
                <button
                  type="button"
                  onClick={() =>
                    setPharmacistFilters((prev) => ({
                      ...prev,
                      minExperience: prev.minExperience === 5 ? 0 : 5,
                    }))
                  }
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    pharmacistFilters.minExperience === 5
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-emerald-200 hover:text-emerald-600",
                  )}
                >
                  <Clock className="h-3 w-3" />
                  5+ ปี
                </button>

                {/* Consult methods */}
                <button
                  type="button"
                  onClick={() =>
                    setPharmacistFilters((prev) => ({
                      ...prev,
                      consultMethods: prev.consultMethods.includes("video")
                        ? []
                        : ["video"],
                    }))
                  }
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    pharmacistFilters.consultMethods.includes("video")
                      ? "bg-violet-50 text-violet-700 border-violet-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-violet-200 hover:text-violet-600",
                  )}
                >
                  <Video className="h-3 w-3" />
                  วิดีโอ
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPharmacistFilters((prev) => ({
                      ...prev,
                      consultMethods: prev.consultMethods.includes("chat")
                        ? []
                        : ["chat"],
                    }))
                  }
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    pharmacistFilters.consultMethods.includes("chat")
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-sky-200 hover:text-sky-600",
                  )}
                >
                  <MessageCircle className="h-3 w-3" />
                  แชท
                </button>

                {/* Popular specialties */}
                {["ยาสามัญประจำบ้าน", "โรคเรื้อรัง", "เวชสำอาง"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setPharmacistFilters((prev) => ({
                        ...prev,
                        specialties: prev.specialties.includes(s)
                          ? prev.specialties.filter((x) => x !== s)
                          : [...prev.specialties, s],
                      }))
                    }
                    className={cn(
                      "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                      pharmacistFilters.specialties.includes(s)
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-background text-muted-foreground border-border/50 hover:border-primary/30 hover:text-primary",
                    )}
                  >
                    <Pill className="h-3 w-3" />
                    {s}
                  </button>
                ))}

                {/* Thai language */}
                <button
                  type="button"
                  onClick={() =>
                    setPharmacistFilters((prev) => ({
                      ...prev,
                      languages: prev.languages.includes("ไทย") ? [] : ["ไทย"],
                    }))
                  }
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all flex items-center gap-1",
                    pharmacistFilters.languages.includes("ไทย")
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-background text-muted-foreground border-border/50 hover:border-rose-200 hover:text-rose-600",
                  )}
                >
                  <Globe2 className="h-3 w-3" />
                  ภาษาไทย
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
              <FilterPanel
                filters={pharmacistFilters}
                onChange={setPharmacistFilters}
                onClose={() => setShowFilterPanel(false)}
                onClear={() =>
                  setPharmacistFilters({
                    specialties: [],
                    languages: [],
                    minExperience: 0,
                    minRating: 0,
                    consultMethods: [],
                  })
                }
              />
            )}

            {/* Card grid */}
            <div className="flex-1 overflow-y-auto">
              {/* ── Quick Match Banner ── */}
              <QuickMatchBanner onBook={(id) => setBookingPharmacistId(id)} pharmacists={pharmacists} />

              {filteredRph.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
                  <h3 className="font-bold text-lg mb-2">ไม่พบเภสัชกร</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    ลองเปลี่ยนตัวกรองหรือคำค้นหาดู
                  </p>
                </div>
              ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredRph.map((p, i) => (
                    <div
                      key={p._id}
                      className="reveal-up"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <PharmacistCard
                        pharmacist={p}
                        selected={(selectedRphId ?? selectedRph?._id) === p._id}
                        onSelect={() => setSelectedRphId(p._id)}
                        onBook={() => setBookingPharmacistId(p._id)}
                      />
                    </div>
                  ))}
                </div>
              )}
              {/* Footer note */}
              {filteredRph.length > 0 && (
                <p className="px-4 pb-4 text-[11px] text-muted-foreground">
                  แสดง {filteredRph.length} คน • เภสัชกรออนไลน์{" "}
                  {
                    allPharmacists.filter((r) => r.availability === "online")
                      .length
                  }{" "}
                  คน พร้อมแชททันที
                </p>
              )}
            </div>
          </div>

          {/* ── Right: detail panel (desktop) ── */}
          <div className="hidden lg:flex flex-col flex-1 border-l border-border/50 overflow-hidden bg-background">
            {selectedRph ? (
              <PharmacistDetailPanel
                pharmacist={selectedRph}
                onBook={handleConfirmConsult}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <Stethoscope className="h-14 w-14 text-muted-foreground/30 mb-4" />
                <h3 className="font-bold text-lg mb-2">เลือกเภสัชกร</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  คลิกการ์ดเภสัชกรเพื่อดูรายละเอียดและจองคิวปรึกษา
                </p>
              </div>
            )}
          </div>

          {/* ── Mobile bottom sheet for detail ── */}
          {selectedRph && (
            <div className="lg:hidden fixed inset-x-0 bottom-16 z-50 bg-background border-t border-border/50 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] max-h-[60svh] overflow-y-auto">
              <div className="flex justify-between items-center px-4 pt-3 pb-2 border-b border-border/30">
                <span className="text-sm font-bold">{selectedRph.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedRphId(null)}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <PharmacistDetailPanel
                pharmacist={selectedRph}
                onBook={handleConfirmConsult}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Quick Booking Modal ── */}
      {bookingPharmacist && (
        <QuickBookingModal
          pharmacist={bookingPharmacist}
          onClose={() => setBookingPharmacistId(null)}
        />
      )}
    </div>
  );
}
