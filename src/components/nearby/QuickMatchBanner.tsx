"use client";
import React from "react";
import { Button } from "../ui/button";
import { BadgeCheck, Coins, Star, Zap } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { cn, PHARMACIST_PHOTOS } from "../utility/setup";
import { PharmacistType } from "../../../interface";
export default function QuickMatchBanner({
  onBook,
  pharmacists,
}: {
  onBook: (id: string) => void;
  pharmacists: PharmacistType[];
}) {
  const allPharmacists = pharmacists;
  const onlinePharmacists = allPharmacists.filter(
    (p) => p.availability === "online",
  );
  const [manualOffset, setManualOffset] = React.useState(0);
  const [tick, setTick] = React.useState(() => Date.now());
  const [displayIdx, setDisplayIdx] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  React.useEffect(() => {
    const syncTick = () => setTick(Date.now());

    syncTick();
    const msUntilNextTick = 8_000 - (Date.now() % 8_000);
    let intervalId: number | null = null;
    const timeoutId = window.setTimeout(() => {
      syncTick();
      intervalId = window.setInterval(syncTick, 8_000);
    }, msUntilNextTick);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, []);

  const count = onlinePharmacists.length;
  const normalize = (idx: number) =>
    ((idx % Math.max(count, 1)) + Math.max(count, 1)) % Math.max(count, 1);

  // Rotate recommendation every 8 seconds based on wall clock.
  const timeBucket = Math.floor(tick / 8_000);
  const targetIdx = normalize(timeBucket + manualOffset);

  React.useEffect(() => {
    if (count === 0 || targetIdx === displayIdx) return;

    setIsTransitioning(true);
    const timeoutId = window.setTimeout(() => {
      setDisplayIdx(targetIdx);
      setIsTransitioning(false);
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [targetIdx, displayIdx, count]);

  if (count === 0) return null;

  const match = onlinePharmacists[normalize(displayIdx)];

  const handleReroll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setManualOffset((i) => i + 1);
  };

  return (
    <div className="px-4 pt-4 pb-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onBook(match._id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onBook(match._id);
        }}
        className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/8 via-background to-secondary/8 p-4 relative overflow-hidden cursor-pointer"
      >
        {/* Decorative glow */}
        <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl pointer-events-none" />

        {/* Label */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-sm shadow-primary/30">
            <Zap className="h-3 w-3 text-white" />
          </div>
          <span className="text-xs font-bold text-primary">
            จับคู่เภสัชกรพร้อมให้บริการทันที
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">
            {onlinePharmacists.length} คนออนไลน์ • ปรับทุก 8 วินาที
          </span>
        </div>

        <div
          className={cn(
            "transition-all duration-500",
            isTransitioning
              ? "opacity-0 translate-y-1"
              : "opacity-100 translate-y-0",
          )}
        >
          {/* Pharmacist row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative shrink-0">
              <Avatar
                src={PHARMACIST_PHOTOS[match._id]}
                name={match.name}
                size="lg"
                className="ring-2 ring-primary/30 shadow-md"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background bg-success" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5">
                <p className="font-bold text-sm leading-snug truncate">
                  {match.name}
                </p>
                <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              </div>
              <p className="text-xs text-primary font-semibold truncate mb-0.5">
                {match.specialties[0]}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">
                    {match.rating}
                  </span>
                  <span>({match.reviewCount})</span>
                </div>
                <span>•</span>
                <span className="truncate">
                  {match.experience} ปี • {match.workplace}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-0.5">
                <Coins className="h-3.5 w-3.5 text-primary" />
                <p className="text-base font-bold text-primary leading-none">
                  {match.methodRates.chat}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground">แชท/นาที</p>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1 mb-3">
            {match.specialties.slice(0, 3).map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium"
              >
                {s}
              </span>
            ))}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2">
            <Button
              className="flex-1 h-9 text-xs rounded-xl gap-1.5 shadow-md shadow-primary/25"
              onClick={(e) => {
                e.stopPropagation();
                onBook(match._id);
              }}
            >
              <Zap className="h-3.5 w-3.5" />
              จองทันที
            </Button>
            {onlinePharmacists.length > 1 && (
              <button
                type="button"
                onClick={handleReroll}
                className="h-9 px-3 text-xs rounded-xl border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors font-semibold"
              >
                เปลี่ยนคู่
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
