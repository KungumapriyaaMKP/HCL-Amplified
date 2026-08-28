import Link from "next/link";
import { LogoutButton } from "@/frontend/components/layout/LogoutButton";
import { GoalSwitcher } from "@/frontend/components/layout/GoalSwitcher";

export function Nav({ displayName }: { displayName?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm">
              🧭
            </span>
            <span>Pathwise</span>
          </Link>
          <GoalSwitcher />
        </div>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/dashboard" className="rounded-lg px-3 py-2 text-muted hover:bg-surface-2 hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/leaderboard" className="rounded-lg px-3 py-2 text-muted hover:bg-surface-2 hover:text-foreground">
            Leaderboard
          </Link>
          <Link href="/community" className="rounded-lg px-3 py-2 text-muted hover:bg-surface-2 hover:text-foreground">
            Community
          </Link>
          {displayName && (
            <span className="ml-2 hidden rounded-lg px-3 py-2 text-muted sm:inline">{displayName}</span>
          )}
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
