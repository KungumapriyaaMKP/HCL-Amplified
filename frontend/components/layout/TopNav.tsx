import Link from "next/link";

/**
 * Top bar per the Swiss design: wordmark, section links, a static profile
 * pill. No macOS dock (dropped -- no mockup uses it).
 */
const SECTIONS = [
  { href: "/", label: "Intake" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/analytics", label: "Analytics" },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-canvas/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          PATHFINDER
        </Link>
        <nav className="hidden gap-8 text-sm text-ink-muted md:flex">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href} className="hover:text-ink">
              {s.label}
            </Link>
          ))}
        </nav>
        <span className="rounded-full bg-pill px-4 py-1.5 text-sm font-medium text-pill-ink">
          Demo
        </span>
      </div>
    </header>
  );
}
