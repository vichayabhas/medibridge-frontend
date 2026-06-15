"use client";
import React from "react";
import { Card } from "../ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
interface ErrorOverlayProps {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
}

export default function ErrorOverlay({
  error,
  onRetry,
  onCancel,
}: ErrorOverlayProps) {
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="p-6 max-w-sm w-full mx-4 text-center">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-2">
          การเชื่อมต่อล้มเหลว
        </h3>
        <p className="text-sm text-slate-500 mb-4">{error}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            กลับ
          </Button>
          <Button className="flex-1" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            ลองอีกครั้ง
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Inner Call Component ─────────────────────────────────────────────────────
