import { db } from "@/lib/db";
import { proctoredAttempts, practiceAttempts, progressEvents } from "@/db/schema";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { getModuleForUser } from "@/lib/moduleAccess";

export async function getModuleDetail(userId: string, moduleId: string) {
  const row = await getModuleForUser(userId, moduleId);
  if (!row) return null;

  const [proctored] = await db
    .select()
    .from(proctoredAttempts)
    .where(and(eq(proctoredAttempts.moduleId, moduleId), eq(proctoredAttempts.userId, userId)))
    .orderBy(desc(proctoredAttempts.createdAt))
    .limit(1);

  // A durable "resource marked done" signal - deliberately not
  // pathModules.status, which only reaches "in_progress" on first open and
  // "completed" on proctored submission, so it can't distinguish "opened
  // it" from "actually marked it done". This is the gate for unlocking the
  // practice quiz.
  const [resourceDone] = await db
    .select()
    .from(progressEvents)
    .where(and(eq(progressEvents.moduleId, moduleId), eq(progressEvents.userId, userId), eq(progressEvents.type, "resource_done")))
    .limit(1);

  // At least one *scored* (submitted) practice attempt - the gate for
  // unlocking the proctored test.
  const [practiced] = await db
    .select()
    .from(practiceAttempts)
    .where(and(eq(practiceAttempts.moduleId, moduleId), eq(practiceAttempts.userId, userId), isNotNull(practiceAttempts.score)))
    .limit(1);

  return {
    ...row,
    proctoredAttempt: proctored ?? null,
    hasResourceDone: !!resourceDone,
    hasPracticeAttempt: !!practiced,
  };
}

export type ModuleDetail = NonNullable<Awaited<ReturnType<typeof getModuleDetail>>>;
