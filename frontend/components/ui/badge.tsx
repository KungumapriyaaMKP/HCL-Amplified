import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "accent" | "danger" | string;
  tone?: "default" | "success" | "warning" | "accent" | "danger" | "destructive" | string;
}

const TONE_MAP: Record<string, string> = {
  default: "border-border bg-surface-2 text-foreground/80",
  secondary: "border-transparent bg-surface-2 text-foreground/80",
  destructive: "border-red-500/30 bg-red-500/10 text-red-400",
  danger: "border-red-500/30 bg-red-500/10 text-red-400",
  outline: "border-border text-foreground",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  accent: "border-accent/30 bg-accent/10 text-accent",
};

export function Badge({ className, variant = "default", tone, ...props }: BadgeProps) {
  const effectiveKey = tone || variant;
  const toneClass = TONE_MAP[effectiveKey] ?? TONE_MAP.default;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        toneClass,
        className
      )}
      {...props}
    />
  );
}
