import { db } from "@/lib/db";
import { proctoredAttempts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
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

  return { ...row, proctoredAttempt: proctored ?? null };
}

export type ModuleDetail = NonNullable<Awaited<ReturnType<typeof getModuleDetail>>>;
