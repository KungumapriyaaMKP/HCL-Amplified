/**
 * Elevation is a 1px hairline, never a shadow -- that restraint is what
 * makes the Swiss system read as considered rather than generic.
 */
export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-[12px] border border-border bg-card transition-colors hover:border-border-hover ${className}`}
    >
      {children}
    </div>
  );
}
