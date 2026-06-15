import { Inbox } from "lucide-react";
import React from "react";
export default function EmptyCompleted() {
  return (
    <div className="text-center py-20">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border/40 mx-auto mb-4">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-bold text-lg mb-1">ยังไม่มีงานที่เสร็จสิ้น</h3>
      <p className="text-sm text-muted-foreground">
        งานที่เสร็จสิ้นจะแสดงที่นี่
      </p>
    </div>
  );
}
