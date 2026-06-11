import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Check, Copy, Sparkles, Square, Volume2 } from "lucide-react";
type SpeakState = "idle" | "speaking";
export default function AIGeneratePanel({
  articleTitle,
  articleText,
}: {
  articleTitle: string;
  articleText: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const [speakState, setSpeakState] = React.useState<SpeakState>("idle");

  const summary =
    articleTitle + ". " + articleText.slice(0, 200).trimEnd() + "…";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rv = () => (window as any).responsiveVoice;

  const handleSpeak = () => {
    if (!rv()) return;
    rv().speak(summary, "Thai Female", {
      onstart: () => setSpeakState("speaking"),
      onend: () => setSpeakState("idle"),
      onerror: () => setSpeakState("idle"),
    });
    setSpeakState("speaking");
  };

  const handleStop = () => {
    rv()?.cancel();
    setSpeakState("idle");
  };

  React.useEffect(() => {
    return () => {
      rv()?.cancel();
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-secondary/25 bg-gradient-to-br from-secondary/6 to-primary/6 shadow-[var(--shadow-card)]">
      <CardContent className="p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 border border-secondary/20">
            <Sparkles className="h-4 w-4 text-secondary" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Summarize & Text to Speech</h3>
            <p className="text-[11px] text-muted-foreground">
              สรุปบทความและแปลงเป็นเสียงพูดอัตโนมัติ
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-background/70 border border-border/40 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Script
            </p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? "คัดลอกแล้ว!" : "คัดลอก"}
            </button>
          </div>
          <p className="text-sm leading-[1.85]">{summary}</p>
        </div>

        {speakState === "idle" && (
          <Button
            onClick={handleSpeak}
            className="w-full rounded-xl bg-secondary hover:bg-secondary/90 gap-2 shadow-sm shadow-secondary/20"
          >
            <Volume2 className="h-4 w-4" />
            สรุปและแปลงเป็นเสียง
          </Button>
        )}

        {speakState === "speaking" && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className="inline-block w-1 rounded-full bg-secondary"
                  style={{
                    height: `${8 + n * 4}px`,
                    animation: `bounce ${0.6 + n * 0.1}s ease-in-out infinite alternate`,
                  }}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground flex-1">
              กำลังอ่าน...
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              className="rounded-xl gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              <Square className="h-3.5 w-3.5" />
              หยุด
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
