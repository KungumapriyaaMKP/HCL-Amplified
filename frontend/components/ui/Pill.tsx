import { forwardRef } from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "mastered" | "active" | "gap" | "neutral";
};

/**
 * The signature action & badge control.
 *
 * DESIGN RULE: at most ONE solid pill per screen. This is a cognitive-load
 * rule, not just an aesthetic one -- two primary actions force the user to
 * make a decision before they can act. Secondary actions use "outline" or semantic tags.
 */
export const Pill = forwardRef<HTMLButtonElement, Props>(function Pill(
  { variant = "solid", className = "", ...props },
  ref,
) {
  let base =
    "inline-flex items-center justify-center gap-1.5 rounded-full transition-colors ";

  let styles = "";

  if (variant === "solid") {
    base += "px-5 py-2.5 text-sm font-medium disabled:opacity-40 disabled:pointer-events-none ";
    styles = "bg-pill text-pill-ink hover:bg-ink-muted";
  } else if (variant === "outline") {
    base += "px-4 py-2 text-xs font-medium border border-border text-ink hover:border-border-hover ";
    styles = "bg-transparent";
  } else if (variant === "mastered") {
    base += "px-2.5 py-0.5 text-xs font-medium border border-emerald-200 dark:border-emerald-850 ";
    styles = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300";
  } else if (variant === "active") {
    base += "px-2.5 py-0.5 text-xs font-medium border border-amber-200 dark:border-amber-850 ";
    styles = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300";
  } else if (variant === "gap") {
    base += "px-2.5 py-0.5 text-xs font-medium border border-rose-200 dark:border-rose-850 ";
    styles = "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300";
  } else {
    base += "px-2.5 py-0.5 text-xs font-medium border border-border ";
    styles = "bg-surface text-muted";
  }

  return <button ref={ref} className={`${base} ${styles} ${className}`} {...props} />;
});
