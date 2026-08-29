import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-95";

const variants = {
  primary:
    "bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-400/40 hover:brightness-110 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]",
  secondary:
    "bg-[#121833]/90 text-slate-200 border border-purple-500/30 hover:border-purple-400 hover:bg-[#1a234a] shadow-[0_4px_16px_rgba(0,0,0,0.4)]",
  ghost:
    "text-slate-400 hover:text-white hover:bg-purple-950/40 border border-transparent hover:border-purple-500/20",
  danger:
    "bg-red-950/60 text-red-300 border border-red-500/40 hover:bg-red-900/60 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
  cyan:
    "bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-300/40 hover:brightness-110",
  gold:
    "bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.5)] border border-yellow-300/60 hover:brightness-110",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-xs font-bold tracking-wide",
  lg: "h-12 px-6 text-sm font-bold tracking-wide",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </Link>
  );
}
