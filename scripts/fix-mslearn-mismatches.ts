/**
 * One-off cleanup for the msLearn.ts title+summary matching bug (fixed to
 * title-only - see lib/external/msLearn.ts). Re-validates every ms_learn
 * resource_skills row against the corrected regex; deletes the ones that no
 * longer hold up, then re-picks a resource for any *live* path_module that
 * was pointing at a now-unjustified ms_learn resource for its skill.
 */
import "./_env";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { resources, resourceSkills, pathModules, skillMastery, goals, learningPaths } from "@/db/schema";
import { SKILLS_BY_ID } from "@/data/skills";
import { bestResourceForSkill } from "@/lib/recommend";
import { getCandidatePool } from "@/lib/catalog";
import { isProgrammingSkill, languageForSkill } from "@/data/programmingSkills";

const ALIASES: Record<string, string[]> = {
  "js-fundamentals": ["javascript"],
  "nodejs-fundamentals": ["node.js"],
  sql: ["sql", "transact-sql", "database fundamentals"],
  "cloud-fundamentals": ["azure fundamentals", "cloud concepts"],
  "containers-docker": ["docker", "containers"],
  "kubernetes-basics": ["kubernetes", "aks"],
  "cloud-deployment": ["deploy", "app service"],
  "infrastructure-as-code": ["bicep", "terraform", "arm templates"],
  "ci-cd-fundamentals": ["github actions", "azure devops", "ci/cd"],
  "linux-fundamentals": ["linux"],
  "security-fundamentals": ["security fundamentals"],
  "networking-fundamentals": ["networking"],
  "cryptography-basics": ["encryption"],
  "ml-fundamentals": ["machine learning"],
  "deep-learning-fundamentals": ["deep learning", "neural network"],
  "llm-and-genai": ["generative ai", "azure openai", "large language model"],
  "nlp-fundamentals": ["natural language processing", "text analytics"],
  "computer-vision-fundamentals": ["computer vision"],
  "python-fundamentals": ["python"],
  "data-analysis-pandas": ["data analysis"],
};

function titleMatches(title: string, skillId: string): boolean {
  const skill = SKILLS_BY_ID.get(skillId);
  if (!skill) return false;
  const keywords = [skill.name.toLowerCase(), ...(ALIASES[skillId] ?? [])];
  return keywords.some((k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(title));
}

async function main() {
  const rows = await db
    .select({ resourceId: resources.id, title: resources.title, skillId: resourceSkills.skillId })
    .from(resourceSkills)
    .innerJoin(resources, eq(resources.id, resourceSkills.resourceId))
    .where(eq(resources.source, "ms_learn"));

  const bad = rows.filter((r) => !titleMatches(r.title, r.skillId));
  console.log(`${bad.length}/${rows.length} ms_learn resource-skill mappings fail the corrected title check:`);
  for (const b of bad) console.log(`  - "${b.title}" was tagged as "${b.skillId}"`);

  for (const b of bad) {
    await db
      .delete(resourceSkills)
      .where(and(eq(resourceSkills.resourceId, b.resourceId), eq(resourceSkills.skillId, b.skillId)));
  }
  console.log(`Deleted ${bad.length} bad mapping(s).`);

  // Now find any live path_module pointing at one of those now-unjustified
  // (resource, skill) pairs, and re-pick a resource for it.
  const badResourceIds = new Set(bad.map((b) => b.resourceId));
  const allModules = await db
    .select({ module: pathModules, goalId: learningPaths.goalId })
    .from(pathModules)
    .innerJoin(learningPaths, eq(learningPaths.id, pathModules.pathId));

  const affected = allModules.filter((m) => badResourceIds.has(m.module.resourceId));
  console.log(`${affected.length} live path_module row(s) point at a now-unjustified resource.`);

  const pool = await getCandidatePool();
  for (const { module, goalId } of affected) {
    const [goal] = await db.select().from(goals).where(eq(goals.id, goalId));
    if (!goal) continue;
    const mastery = new Map(
      (await db.select().from(skillMastery).where(eq(skillMastery.userId, goal.userId))).map((r) => [
        r.skillId,
        r.score,
      ]),
    );
    const replacement = bestResourceForSkill(pool, {
      targetSkillId: module.skillId,
      masteryBySkill: mastery,
      interestSkillIds: [],
      difficultyBias: 0,
      goalText: goal?.goalText,
    });
    if (!replacement) {
      console.log(`  ! no replacement found for module ${module.id} (skill ${module.skillId}) - left as-is`);
      continue;
    }
    await db
      .update(pathModules)
      .set({
        resourceId: replacement.id,
        isProgramming: isProgrammingSkill(module.skillId),
        programmingLanguage: languageForSkill(module.skillId),
        rationale: `Re-matched to "${replacement.title}" after fixing a resource-tagging bug - the previous pick for this skill was mis-tagged from an unrelated Microsoft Learn article.`,
      })
      .where(eq(pathModules.id, module.id));
    console.log(`  fixed module ${module.id}: now "${replacement.title}" for skill "${module.skillId}"`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
