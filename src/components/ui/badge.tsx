import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utility/setup";
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary border border-primary/20",
        secondary: "bg-secondary/10 text-secondary border border-secondary/20",
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        destructive: "bg-destructive/10 text-destructive border border-destructive/20",
        muted: "bg-muted text-muted-foreground border border-border",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: "online" | "busy" | "offline" | boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  const dotColor =
    dot === "online"
      ? "bg-success"
      : dot === "busy"
      ? "bg-warning"
      : dot === "offline"
      ? "bg-muted-foreground"
      : dot === true
      ? "bg-primary"
      : null;

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dotColor && (
        <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dotColor)} />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
