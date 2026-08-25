import { db } from "@/lib/db";
import { profiles, xpLedger } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { levelForXp, levelTitle } from "@/lib/gamification";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/frontend/components/layout/Nav";
import { Card, Badge } from "@/frontend/components/ui/Card";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const [viewerProfile] = data.user
    ? await db.select().from(profiles).where(eq(profiles.userId, data.user.id))
    : [];

  const rows = await db
    .select({ displayName: profiles.displayName, xp: sql<number>`coalesce(sum(${xpLedger.amount}), 0)` })
    .from(profiles)
    .leftJoin(xpLedger, eq(xpLedger.userId, profiles.userId))
    .groupBy(profiles.userId, profiles.displayName)
    .orderBy(desc(sql`coalesce(sum(${xpLedger.amount}), 0)`))
    .limit(50);

  const leaderboard = rows.map((r, i) => {
    const xp = Number(r.xp);
    const level = levelForXp(xp);
    return { rank: i + 1, displayName: r.displayName, xp, level: level.level, levelTitle: levelTitle(level.level) };
  });

  return (
    <div>
      <Nav displayName={viewerProfile?.displayName} />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-1 text-2xl font-semibold">Leaderboard</h1>
        <p className="mb-6 text-sm text-muted">Ranked by total XP across every learner.</p>

        <Card className="divide-y divide-border">
          {leaderboard.length === 0 && <p className="p-5 text-sm text-muted">No learners yet - be the first!</p>}
          {leaderboard.map((row) => (
            <div key={row.rank} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-semibold text-muted">{row.rank}</span>
                <span className="font-medium">{row.displayName}</span>
                <Badge tone="accent">{row.levelTitle}</Badge>
              </div>
              <span className="text-sm font-medium tabular-nums text-muted">{row.xp} XP</span>
            </div>
          ))}
        </Card>
      </main>
    </div>
  );
}
