import { db } from "@/lib/db";
import { xpLedger, streaks, userBadges } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const XP = {
  MODULE_STARTED: 5,
  MODULE_COMPLETED: 20,
  PRACTICE_QUIZ_CORRECT_ANSWER: 4,
  PRACTICE_QUIZ_PERFECT_BONUS: 15,
  PROCTORED_PASS_BASE: 50,
  PROCTORED_SCORE_BONUS_PER_POINT: 1, // + up to 100 for a perfect proctored score
  CODE_RUN_FIRST: 10,
  BADGE_BONUS: 25,
  DAILY_ACTIVITY: 5,
};

export async function awardXp(userId: string, amount: number, reason: string) {
  if (amount === 0) return;
  await db.insert(xpLedger).values({ userId, amount, reason });
}

export async function getTotalXp(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${xpLedger.amount}), 0)` })
    .from(xpLedger)
    .where(eq(xpLedger.userId, userId));
  return Number(row?.total ?? 0);
}

/** Simple, demo-friendly level curve: level N requires N^2 * 50 total XP. */
export function levelForXp(xp: number): { level: number; xpIntoLevel: number; xpForNextLevel: number } {
  let level = 1;
  while (xp >= level * level * 50) level++;
  const currentFloor = (level - 1) * (level - 1) * 50;
  const nextCeiling = level * level * 50;
  return { level, xpIntoLevel: xp - currentFloor, xpForNextLevel: nextCeiling - currentFloor };
}

export const LEVEL_TITLES = ["Newcomer", "Explorer", "Builder", "Adept", "Specialist", "Expert", "Master"];
export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}

export async function touchStreak(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const existing = await db.query.streaks.findFirst({ where: eq(streaks.userId, userId) });

  if (!existing) {
    await db.insert(streaks).values({ userId, currentStreak: 1, longestStreak: 1, lastActiveDate: today, freezes: 0 });
    await awardXp(userId, XP.DAILY_ACTIVITY, "Daily activity");
    return { currentStreak: 1, longestStreak: 1, freezes: 0, grew: true, freezeUsed: false };
  }

  if (existing.lastActiveDate === today) {
    return { currentStreak: existing.currentStreak, longestStreak: existing.longestStreak, freezes: existing.freezes, grew: false, freezeUsed: false };
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const continued = existing.lastActiveDate === yesterday;
  let currentStreak = 1;
  let freezes = existing.freezes || 0;
  let freezeUsed = false;

  if (continued) {
    currentStreak = existing.currentStreak + 1;
    // Earn a streak freeze on every 7-day milestone
    if (currentStreak % 7 === 0) {
      freezes += 1;
    }
  } else {
    // Missed a day: auto-consume a streak freeze if available
    if (freezes > 0) {
      freezes -= 1;
      currentStreak = existing.currentStreak + 1;
      freezeUsed = true;
    } else {
      currentStreak = 1;
    }
  }

  const longestStreak = Math.max(existing.longestStreak, currentStreak);

  await db
    .update(streaks)
    .set({ currentStreak, longestStreak, lastActiveDate: today, freezes })
    .where(eq(streaks.userId, userId));
  await awardXp(userId, XP.DAILY_ACTIVITY, "Daily activity");

  return { currentStreak, longestStreak, freezes, grew: true, freezeUsed };
}

/** Awards a badge if the learner doesn't already have it. Returns true if
 * this call newly awarded it (so callers can show a toast + grant bonus XP). */
export async function awardBadgeIfNew(userId: string, badgeId: string): Promise<boolean> {
  const inserted = await db
    .insert(userBadges)
    .values({ userId, badgeId })
    .onConflictDoNothing()
    .returning();
  const isNew = inserted.length > 0;
  if (isNew) await awardXp(userId, XP.BADGE_BONUS, `Badge: ${badgeId}`);
  return isNew;
}
