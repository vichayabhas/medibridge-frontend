import * as React from "react";
import { cn } from "../utility/setup";
import Image from "next/image";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

function getInitials(name: string): string {
  const cleaned = name.replace(/^ภ[กญ]\./, "").trim();
  const parts = cleaned.split(" ");
  return parts
    .map((p) => p[0])
    .join("")
    .substring(0, 2);
}

function Avatar({ src, name, size = "md", className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-gradient-to-br from-primary to-secondary font-semibold text-white",
        sizeMap[size],
        className
      )}
      {...props}
    >
      {src ? (
        <Image src={src} alt={name ?? ""} className="h-full w-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      ) : (
        <span>{name ? getInitials(name) : "?"}</span>
      )}
    </div>
  );
}

export { Avatar };
