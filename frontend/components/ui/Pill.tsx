import { forwardRef } from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline";
};

/**
 * The signature action control.
 *
 * DESIGN RULE: at most ONE solid pill per screen. This is a cognitive-load
 * rule, not just an aesthetic one -- two primary actions force the user to
 * make a decision before they can act. Secondary actions use "outline".
 */
export const Pill = forwardRef<HTMLButtonElement, Props>(function Pill(
  { variant = "solid", className = "", ...props },
  ref,
) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 " +
    "text-sm font-medium transition-colors disabled:opacity-40 " +
    "disabled:pointer-events-none";

  const styles =
    variant === "solid"
      ? "bg-pill text-pill-ink hover:bg-ink-muted"
      : "border border-border text-ink hover:border-border-hover";

  return <button ref={ref} className={`${base} ${styles} ${className}`} {...props} />;
});
