import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: ReactNode;
}

/**
 * Elevation is a 1px hairline, never a heavy drop-shadow -- that restraint is what
 * makes the Swiss system read as considered rather than generic.
 */
export function Card({
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-[14px] border border-border bg-card transition-colors hover:border-border-hover ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
