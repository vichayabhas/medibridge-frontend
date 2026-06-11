"use client";
import { useState, useMemo } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  MessageCircle,
  Phone,
  Search,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import React from "react";
import { PharmacistType } from "../../interface";
import { cn, PHARMACIST_PHOTOS } from "./utility/setup";
import { useRouter } from "next/navigation";

type ConsultMethod = "chat" | "phone" | "video";

const CONSULT_METHODS: {
  id: ConsultMethod;
  label: string;
  sublabel: string;
  icon: typeof MessageCircle;
}[] = [
  {
    id: "chat",
    label: "แชท",
    sublabel: "แลกเปลี่ยนข้อความ",
    icon: MessageCircle,
  },
  { id: "phone", label: "โทรศัพท์", sublabel: "คุยสด", icon: Phone },
  { id: "video", label: "วิดีโอคอล", sublabel: "หน้าจอต่อหน้า", icon: Video },
];

type AvailabilityFilter = "all" | "online" | "busy";

const statusLabel: Record<string, string> = {
  online: "ออนไลน์",
  busy: "ยุ่ง",
  offline: "ออฟไลน์",
};
const statusVariant: Record<string, "success" | "warning" | "muted"> = {
  online: "success",
  busy: "warning",
  offline: "muted",
};
const statusDot: Record<string, "online" | "busy" | "offline"> = {
  online: "online",
  busy: "busy",
  offline: "offline",
};

/* ─── Pharmacist card ─────────────────────────────────────────────────── */
function PharmacistCard({
  pharmacist,
  selected,
  onSelect,
}: {
  pharmacist: PharmacistType;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-2xl border p-4 transition-all duration-300",
        selected
          ? "border-primary/50 shadow-[var(--shadow-elevated)] ring-2 ring-primary/20 bg-primary/3"
          : "border-border/45 bg-card hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar
            src={PHARMACIST_PHOTOS[pharmacist._id]}
            name={pharmacist.name}
            size="lg"
            className="ring-2 ring-background shadow-md"
          />
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
              pharmacist.availability === "online"
                ? "bg-success"
                : pharmacist.availability === "busy"
                  ? "bg-warning"
                  : "bg-muted-foreground",
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <h3 className="font-bold text-sm leading-snug">
              {pharmacist.name}
            </h3>
            {selected && (
              <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
            )}
          </div>

          {/* License */}
          <div className="flex items-center gap-1.5 mb-2">
            <BadgeCheck className="h-3 w-3 text-primary shrink-0" />
            <span className="text-xs text-primary font-semibold">
              เภสัชเลขที่ {pharmacist.licenseNo}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge
              variant={statusVariant[pharmacist.availability]}
              dot={statusDot[pharmacist.availability]}
              className="text-[10px] px-2 py-0.5"
            >
              {statusLabel[pharmacist.availability]}
            </Badge>
            <div className="flex items-center gap-1">
              <Rating value={pharmacist.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                ({pharmacist.reviewCount})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {pharmacist.specialties.map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-primary/10"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────── */
export default function ChoosePharmacistPage({
  pharmacists: allPharmacists,
}: {
  pharmacists: PharmacistType[];
}) {
  const navigate = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [availFilter, setAvailFilter] = useState<AvailabilityFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<ConsultMethod | null>(
    null,
  );

  // Filter out offline pharmacists for consult, show all for browsing
  // const allPharmacists = usePharmacyStore((s) => s.pharmacists);
  const pharmacists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allPharmacists.filter((p) => {
      if (availFilter === "online" && p.availability !== "online") return false;
      if (availFilter === "busy" && p.availability !== "busy") return false;
      if (availFilter === "all" && p.availability === "offline") return false;
      if (q) {
        const searchable =
          `${p.name} ${p.licenseNo} ${p.specialties.join(" ")}`.toLowerCase();
        return searchable.includes(q);
      }
      return true;
    });
  }, [searchQuery, availFilter, allPharmacists]);

  const selectedPharmacist = pharmacists.find((p) => p._id === selectedId);

  const handleConfirm = () => {
    if (!selectedId || !selectedMethod) return;
    navigate.push(
      `/handoff?pharmacistId=${selectedId}&consult=${selectedMethod}`,
    );
  };

  return (
    <div className="flex flex-col h-[100svh] bg-background">
      {/* ── Header ── */}
      <div className="shrink-0 px-4 pt-20 md:pt-[68px] pb-3 border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-sm">
        <button
          onClick={() => navigate.push("../")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          กลับ
        </button>

        <div className="flex items-baseline justify-between mb-1">
          <h1 className="font-bold text-lg">เลือกเภสัชกรที่ต้องการปรึกษา</h1>
          <span className="text-xs font-semibold text-muted-foreground">
            {pharmacists.length} คน
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          เภสัชกรเหล่านี้พร้อมให้คำปรึกษาแบบออนไลน์
          เลือกเภสัชกรแล้วเลือกวิธีปรึกษาได้เลย
        </p>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ ความเชี่ยวชาญ หรือเลขใบอนุญาต"
            className="h-10 rounded-2xl pl-9 text-sm"
          />
        </div>

        {/* Availability filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {(
            [
              { key: "all", label: "พร้อมให้บริการ" },
              { key: "online", label: "ออนไลน์" },
              { key: "busy", label: "ยุ่ง (รอนัด)" },
            ] as { key: AvailabilityFilter; label: string }[]
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setAvailFilter(f.key)}
              className={cn(
                "flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 tap-target min-h-[34px]",
                availFilter === f.key
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                  : "bg-background text-muted-foreground border-border/50 hover:border-primary/35 hover:text-primary",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Pharmacist list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {pharmacists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="font-bold text-lg mb-2">ไม่พบเภสัชกร</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              ลองเปลี่ยนตัวกรองหรือคำค้นหาดู
            </p>
          </div>
        ) : (
          pharmacists.map((p, i) => (
            <div
              key={p._id}
              className="reveal-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <PharmacistCard
                pharmacist={p}
                selected={selectedId === p._id}
                onSelect={() => {
                  setSelectedId(p._id);
                  setSelectedMethod(null);
                }}
              />
            </div>
          ))
        )}
      </div>

      {/* ── Bottom panel: consult method + confirm ── */}
      {selectedPharmacist && (
        <div className="shrink-0 border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 py-4 mb-16 md:mb-0 slide-in-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-3">
            <Avatar
              src={PHARMACIST_PHOTOS[selectedPharmacist._id]}
              name={selectedPharmacist.name}
              size="sm"
              className="ring-1 ring-background"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">
                {selectedPharmacist.name}
              </p>
              <p className="text-[10px] text-muted-foreground">
                เลือกวิธีปรึกษา
              </p>
            </div>
          </div>

          {/* Consult method chips */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {CONSULT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMethod(m.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-200",
                  selectedMethod === m.id
                    ? "border-primary bg-primary/8 shadow-sm shadow-primary/15"
                    : "border-border/40 bg-muted/30 hover:border-primary/40 hover:bg-primary/3",
                )}
              >
                <m.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    selectedMethod === m.id
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-bold transition-colors",
                    selectedMethod === m.id
                      ? "text-primary"
                      : "text-foreground",
                  )}
                >
                  {m.label}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight text-center">
                  {m.sublabel}
                </span>
              </button>
            ))}
          </div>

          <Button
            className="w-full h-12 rounded-2xl gap-2 shadow-lg shadow-primary/25 disabled:shadow-none transition-all duration-300"
            disabled={!selectedMethod}
            onClick={handleConfirm}
          >
            {selectedMethod ? (
              <>
                {CONSULT_METHODS.find((m) => m.id === selectedMethod)?.icon &&
                  (() => {
                    const Icon = CONSULT_METHODS.find(
                      (m) => m.id === selectedMethod,
                    )!.icon;
                    return <Icon className="h-4 w-4" />;
                  })()}
                เริ่มปรึกษาเภสัชกร
              </>
            ) : (
              "กรุณาเลือกวิธีปรึกษา"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
