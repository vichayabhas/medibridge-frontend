import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "../utility/setup";
interface RatingProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  size?: "sm" | "md";
}

function Rating({ value, max = 5, className, showValue = true, size = "sm" }: RatingProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            iconSize,
            i < Math.round(value)
              ? "fill-warning text-warning"
              : "fill-muted text-muted-foreground/40"
          )}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-xs font-semibold text-warning">{value.toFixed(1)}</span>
      )}
    </span>
  );
}

export { Rating };
