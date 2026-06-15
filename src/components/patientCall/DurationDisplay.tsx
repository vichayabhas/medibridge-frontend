"use client";
import React from "react";
import { useCallDuration } from "./useDailyCall";
export default function DurationDisplay({ isActive }: { isActive: boolean }) {
  const { formattedDuration } = useCallDuration(isActive);

  return (
    <div className="bg-black/40 backdrop-blur px-3 py-1 rounded-full">
      <span className="text-sm font-mono font-medium text-white">
        {formattedDuration}
      </span>
    </div>
  );
}
