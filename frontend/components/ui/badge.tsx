import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-all",
  {
    variants: {
      variant: {
        default:
          "border-slate-700 bg-slate-900/80 text-slate-300",
        secondary:
          "border-purple-500/30 bg-purple-950/50 text-purple-300",
        destructive:
          "border-red-500/50 bg-red-950/70 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
        outline: "border-purple-500/40 text-purple-300 bg-transparent",
        success:
          "border-emerald-500/50 bg-emerald-950/70 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
        warning:
          "border-amber-500/50 bg-amber-950/70 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
        accent:
          "border-purple-500/50 bg-purple-950/70 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.35)]",
        cyan:
          "border-cyan-500/50 bg-cyan-950/70 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.35)]",
      },
      tone: {
        default: "border-slate-700 bg-slate-900/80 text-slate-300",
        success: "border-emerald-500/50 bg-emerald-950/70 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
        warning: "border-amber-500/50 bg-amber-950/70 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
        accent: "border-purple-500/50 bg-purple-950/70 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.35)]",
        cyan: "border-cyan-500/50 bg-cyan-950/70 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.35)]",
        danger: "border-red-500/50 bg-red-950/70 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
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
  tone?: "default" | "success" | "warning" | "accent" | "cyan" | "danger";
}

function Badge({ className, variant, tone, ...props }: BadgeProps) {
  const effectiveVariant = tone ? tone : variant;

  return (
    <div className={cn(badgeVariants({ variant: effectiveVariant as any }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
