"use client";
import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { RefreshCw } from "lucide-react";
import { cn } from "../utility/setup";
interface ReconnectOverlayProps {
  attempts: number;
  maxAttempts: number;
  onRetry: () => void;
  onCancel: () => void;
}
export default function ReconnectOverlay({
  attempts,
  maxAttempts,
  onRetry,
  onCancel,
}: ReconnectOverlayProps) {
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="p-6 max-w-sm w-full mx-4 text-center">
        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="h-6 w-6 text-amber-600 animate-spin" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">
          กำลังเชื่อมต่อใหม่...
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          สัญญาณอินเทอร์เน็ตไม่เสถียร กำลังพยายามเชื่อมต่อใหม่
        </p>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(maxAttempts)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  i < attempts ? "bg-amber-500" : "bg-slate-200",
                )}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500">
            {attempts}/{maxAttempts}
          </span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button className="flex-1" onClick={onRetry}>
            เชื่อมต่อทันที
          </Button>
        </div>
      </Card>
    </div>
  );
}
