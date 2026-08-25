import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

const variants = {
  primary: "bg-accent text-white hover:bg-[#6a4bff] shadow-[0_0_0_1px_rgba(124,92,255,0.4)]",
  secondary: "bg-surface-2 text-foreground border border-border hover:bg-[#222b40]",
  ghost: "text-muted hover:text-foreground hover:bg-surface-2",
  danger: "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20",
};

const sizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-base",
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
