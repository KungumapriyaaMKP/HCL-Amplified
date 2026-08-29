import { db } from "@/lib/db";
import { profiles, xpLedger } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { TodoPageView } from "@/frontend/components/todo/TodoPageView";
import { levelForXp, levelTitle } from "@/lib/gamification";

export default async function TodoPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  let displayName = "yuvi";
  let level = 1;
  let title = "Newcomer";

  if (data.user) {
    const [profileResult, xpRowResult] = await Promise.all([
      db.select().from(profiles).where(eq(profiles.userId, data.user.id)),
      db
        .select({ total: sql<number>`coalesce(sum(${xpLedger.amount}), 0)` })
        .from(xpLedger)
        .where(eq(xpLedger.userId, data.user.id)),
    ]);

    const [userProfile] = profileResult;
    if (userProfile?.displayName) {
      displayName = userProfile.displayName;
    }

    const [xpRow] = xpRowResult;
    const totalXp = xpRow ? Number(xpRow.total) : 0;
    const lvl = levelForXp(totalXp);
    level = lvl.level;
    title = levelTitle(lvl.level);
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={displayName}
        level={level}
        levelTitle={title}
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <main className="mx-auto w-full max-w-[1440px] px-6 py-8 sm:px-8">
          <TodoPageView />
        </main>
      </div>
    </div>
  );
}
