import { db } from "@/lib/db";
import { goals, learningPaths, pathModules, resources, skills } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

export async function getGoalDetail(userId: string, goalId: string) {
  const [goal] = await db.select().from(goals).where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
  if (!goal) return null;

  const [path] = await db.select().from(learningPaths).where(eq(learningPaths.goalId, goal.id));
  if (!path) return { goal, path: null, modules: [] };

  const modules = await db
    .select({ module: pathModules, resource: resources, skill: skills })
    .from(pathModules)
    .innerJoin(resources, eq(resources.id, pathModules.resourceId))
    .innerJoin(skills, eq(skills.id, pathModules.skillId))
    .where(eq(pathModules.pathId, path.id))
    .orderBy(asc(pathModules.order));

  return { goal, path, modules };
}

export type GoalDetail = NonNullable<Awaited<ReturnType<typeof getGoalDetail>>>;
