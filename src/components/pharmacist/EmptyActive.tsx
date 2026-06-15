import { CheckCircle2 } from "lucide-react";
import React from "react";
export default function EmptyActive() {
  return (
    <div className="text-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 border border-success/20 mx-auto mb-4">
        <CheckCircle2 className="h-8 w-8 text-success" />
      </div>
      <h3 className="font-bold text-lg mb-1">ไม่มีงานค้างอยู่</h3>
      <p className="text-sm text-muted-foreground">
        ดีมาก! ทุก handoff เสร็จสิ้นแล้ว
      </p>
    </div>
  );
}
