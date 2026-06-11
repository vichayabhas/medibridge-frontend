"use client";
import React from "react";
import { Button } from "../ui/button";
import { Coins, Star, Stethoscope } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { cn } from "../utility/setup";
import { PharmacistType } from "../../../interface";
import { PHARMACIST_PHOTOS } from "./NearbyPage";
export default function PharmacistCard({
  pharmacist,
  selected,
  onSelect,
  onBook,
}: {
  pharmacist: PharmacistType;
  selected: boolean;
  onSelect: () => void;
  onBook: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={cn(
        "w-full text-left rounded-2xl border p-4 transition-all duration-300 cursor-pointer",
        selected
          ? "border-primary/60 shadow-[var(--shadow-elevated)] ring-2 ring-primary/20 bg-primary/3"
          : "border-border/45 bg-card hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5",
      )}
    >
      <div className="flex gap-3 mb-3">
        <div className="relative shrink-0">
          <Avatar
            src={PHARMACIST_PHOTOS[pharmacist._id]}
            name={pharmacist.name}
            size="lg"
            className="ring-2 ring-background shadow-md"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <h3 className="font-bold text-sm leading-snug">
              {pharmacist.name}
            </h3>
            <span className="text-xs font-bold text-primary shrink-0 flex items-center gap-0.5">
              <Coins className="h-3 w-3" />
              {pharmacist.methodRates.chat}–{pharmacist.methodRates.video}
              <span className="text-[10px] font-normal text-muted-foreground">
                /นาที
              </span>
            </span>
          </div>
          <p className="text-xs text-primary font-semibold mb-0.5">
            {pharmacist.specialties[0]}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {pharmacist.experience} ปี • {pharmacist.workplace}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-3">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span className="text-xs font-bold">{pharmacist.rating}</span>
        <span className="text-xs text-muted-foreground">
          ({pharmacist.reviewCount})
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {pharmacist.specialties.slice(0, 2).map((s) => (
          <span
            key={s}
            className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-primary/10"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="flex-1 h-8 text-xs rounded-xl gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            onBook();
          }}
        >
          <Stethoscope className="h-3.5 w-3.5" />
          เริ่มปรึกษา
        </Button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="h-8 px-3 text-xs rounded-xl border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        >
          ดูโปรไฟล์
        </button>
      </div>
    </div>
  );
}
