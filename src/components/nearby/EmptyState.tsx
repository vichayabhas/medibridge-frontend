"use client";
import { AlertCircle, MapPin } from "lucide-react";
import React from "react";
export default function EmptyState({ error }: { error: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border/40 mb-5">
        {error ? (
          <AlertCircle className="h-8 w-8 text-destructive" />
        ) : (
          <MapPin className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="font-bold text-lg mb-2">{error ? "ดึงข้อมูลร้านยาไม่ได้" : "ไม่พบร้านยา"}</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-[1.75]">
        {error ?? "OpenStreetMap ไม่พบข้อมูล amenity=pharmacy หรือ healthcare=pharmacy ในรัศมีที่กำหนด"}
      </p>
    </div>
  );
}