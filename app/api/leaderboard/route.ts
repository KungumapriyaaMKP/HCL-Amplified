import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profiles, xpLedger } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { levelForXp, levelTitle } from "@/lib/gamification";

// Public endpoint by design: only display_name + XP + level are ever
// exposed (never email/user id beyond the opaque profile row), matching the
// leaderboard's public-read intent from the data model.
export async function GET() {
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

  return NextResponse.json({ leaderboard });
}
