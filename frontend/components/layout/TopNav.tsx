"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { createClient, hasSupabase } from "@/lib/supabase/client";
import { GamificationBar } from "@/features/gamification/GamificationBar";

const SECTIONS = [
  { href: "/", label: "Intake" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/analytics", label: "Analytics" },
  { href: "/lab", label: "Code Lab" },
  { href: "/what-if", label: "What-If" },
];

export function TopNav() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    if (!hasSupabase()) {
      setIsGuest(true);
      return;
    }

    const supabase = createClient();

    // 1. Initial user check
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name =
          user.user_metadata?.display_name ||
          user.email?.split("@")[0] ||
          "Learner";
        setUserName(name);
        setIsGuest(false);
      } else {
        setUserName(null);
        setIsGuest(true);
      }
    });

    // 2. Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name =
          session.user.user_metadata?.display_name ||
          session.user.email?.split("@")[0] ||
          "Learner";
        setUserName(name);
        setIsGuest(false);
      } else {
        setUserName(null);
        setIsGuest(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    if (hasSupabase()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUserName(null);
    setIsGuest(true);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 gap-4">
        {/* Wordmark */}
        <Link href="/" className="text-lg font-extrabold tracking-tight text-ink flex items-center gap-1.5 shrink-0">
          <Compass className="w-5 h-5" />
          <span>PATHFINDER</span>
        </Link>

        {/* Navigation Sections */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="hover:text-ink transition-colors py-1"
            >
              {s.label}
            </Link>
          ))}
        </nav>

        {/* Gamification + Auth Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <GamificationBar />

          {!isGuest && userName ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-border bg-canvas px-3.5 py-1.5 text-xs font-semibold text-ink">
                {userName}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-ink transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-border px-2.5 py-1 text-[11px] font-mono text-muted sm:inline-block">
                Demo
              </span>
              <Link
                href="/login"
                className="rounded-full bg-ink text-canvas px-4 py-1.5 text-xs font-semibold hover:bg-ink/90 transition-colors"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
