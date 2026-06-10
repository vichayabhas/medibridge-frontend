import { Button } from "@/components/ui/button";
import { cn } from "@/components/utility/setup";
import { MessageCircle, Send, X } from "lucide-react";
import React from "react";
import { useTelepharmacyChat } from "./useTelepharmacyChat";
function formatTime(date: Date) {
  return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}
export default function ChatConsult({ handoffId, patientName, onClose }: { handoffId: string; patientName: string; onClose: () => void }) {
  const { messages: rawMessages,  sendMessage } = useTelepharmacyChat({
    handoffId,
    senderType: "patient",
    senderName: patientName,
  });
  const [draft, setDraft] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rawMessages]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await sendMessage(text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-primary/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">แชทกับเภสัชกร</p>
            <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              ออนไลน์
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">

        {rawMessages.map((m) => {
          const isPatient = m.senderType === "patient";
          const ts = new Date(m.createdAt);
          return (
            <div key={m._id} className={cn("flex", isPatient ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  isPatient
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}
              >
                <p>{m.content}</p>
                <p className={cn("text-[10px] mt-1", isPatient ? "text-primary-foreground/60 text-right" : "text-muted-foreground")}>
                  {formatTime(ts)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border/40 shrink-0">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 rounded-xl border border-border/50 bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors"
            placeholder="พิมพ์ข้อความ..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          />
          <Button size="icon" className="h-10 w-10 rounded-xl shrink-0" onClick={send} disabled={!draft.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
