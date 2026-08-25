import { db } from "@/lib/db";
import { pathModules, learningPaths, goals, resources, skills } from "@/db/schema";
import { and, eq } from "drizzle-orm";

/** Resolves a module id to its module/path/goal rows, scoped to the
 * requesting user (so one learner can never touch another's module). */
export async function getModuleForUser(userId: string, moduleId: string) {
  const [row] = await db
    .select({ module: pathModules, path: learningPaths, goal: goals, resource: resources, skill: skills })
    .from(pathModules)
    .innerJoin(learningPaths, eq(learningPaths.id, pathModules.pathId))
    .innerJoin(goals, eq(goals.id, learningPaths.goalId))
    .innerJoin(resources, eq(resources.id, pathModules.resourceId))
    .innerJoin(skills, eq(skills.id, pathModules.skillId))
    .where(and(eq(pathModules.id, moduleId), eq(goals.userId, userId)));

  return row ?? null;
}
