import { db } from "@/lib/db";
import { learningEvents, pathModules, skills } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";

export type DayActivity = { date: string; count: number; estimatedMinutes: number; skillNames: string[] };

/**
 * One row per calendar day for the last `days` days (always fully padded,
 * even for days with zero activity - a GitHub-style heatmap needs an
 * unbroken grid, not just the days that happened to have events).
 * `estimatedMinutes` is the sum of each distinct module's estimated length
 * touched that day (not real elapsed time, which isn't tracked yet - see
 * lib/dashboardData.ts callers for how this is labeled in the UI).
 */
export async function getActivityHeatmap(userId: string, days = 98): Promise<DayActivity[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      createdAt: learningEvents.createdAt,
      estimatedSeconds: learningEvents.estimatedSeconds,
      moduleId: learningEvents.moduleId,
      skillName: skills.name,
    })
    .from(learningEvents)
    .leftJoin(pathModules, eq(pathModules.id, learningEvents.moduleId))
    .leftJoin(skills, eq(skills.id, pathModules.skillId))
    .where(and(eq(learningEvents.userId, userId), gte(learningEvents.createdAt, since)));

  type Bucket = { count: number; minutesByModule: Map<string, number>; skillNames: Set<string> };
  const byDay = new Map<string, Bucket>();
  for (const r of rows) {
    const day = r.createdAt.toISOString().slice(0, 10);
    const bucket: Bucket = byDay.get(day) ?? { count: 0, minutesByModule: new Map(), skillNames: new Set() };
    bucket.count++;
    if (r.moduleId && r.estimatedSeconds) bucket.minutesByModule.set(r.moduleId, Math.round(r.estimatedSeconds / 60));
    if (r.skillName) bucket.skillNames.add(r.skillName);
    byDay.set(day, bucket);
  }

  const result: DayActivity[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const bucket = byDay.get(key);
    result.push({
      date: key,
      count: bucket?.count ?? 0,
      estimatedMinutes: bucket ? [...bucket.minutesByModule.values()].reduce((a, b) => a + b, 0) : 0,
      skillNames: bucket ? [...bucket.skillNames] : [],
    });
  }
  return result;
}
