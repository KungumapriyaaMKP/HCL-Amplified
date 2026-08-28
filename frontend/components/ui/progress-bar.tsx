import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "purple" | "gold" | "orange" | "cyan" | "emerald";
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value = 0, max = 100, variant = "purple", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const gradientMap = {
      purple: "from-purple-600 via-fuchsia-500 to-indigo-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]",
      gold: "from-amber-500 via-yellow-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]",
      orange: "from-orange-600 via-red-500 to-amber-400 shadow-[0_0_12px_rgba(249,115,22,0.8)]",
      cyan: "from-cyan-500 via-blue-500 to-indigo-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]",
      emerald: "from-emerald-500 via-teal-400 to-green-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-sm bg-[#080b18] ring-1 ring-white/10 shadow-inner",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-sm bg-gradient-to-r transition-all duration-700 ease-out",
            gradientMap[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
