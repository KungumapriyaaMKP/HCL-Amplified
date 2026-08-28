import "./_env";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { skills, skillPrerequisites, resources, resourceSkills, badges } from "@/db/schema";
import { SKILLS } from "@/data/skills";
import { buildCatalog } from "@/data/resources";
import { BADGES } from "@/data/badges";

async function retry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 1) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return retry(fn, retries - 1, delayMs * 1.5);
  }
}

async function main() {
  console.log(`Seeding ${SKILLS.length} skills...`);
  for (const skill of SKILLS) {
    await retry(() =>
      db
        .insert(skills)
        .values({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          description: skill.description,
        })
        .onConflictDoUpdate({
          target: skills.id,
          set: { name: skill.name, category: skill.category, description: skill.description },
        })
    );
  }

  console.log("Seeding skill prerequisites...");
  await retry(() => db.delete(skillPrerequisites));
  const prereqRows: { skillId: string; prerequisiteId: string }[] = [];
  for (const skill of SKILLS) {
    for (const prereq of skill.prerequisites) {
      prereqRows.push({ skillId: skill.id, prerequisiteId: prereq });
    }
  }
  // Batch insert in chunks of 50
  for (let i = 0; i < prereqRows.length; i += 50) {
    const chunk = prereqRows.slice(i, i + 50);
    await retry(() => db.insert(skillPrerequisites).values(chunk));
  }

  const catalog = buildCatalog();
  console.log(`Seeding ${catalog.length} resources...`);
  for (const item of catalog) {
    const values = {
      source: item.source,
      title: item.title,
      url: item.url,
      type: item.type,
      description: item.description,
      provider: item.provider,
      estimatedMinutes: item.estimatedMinutes,
      difficulty: item.difficulty,
      rating: item.rating,
      externalId: item.key,
    };

    const [row] = await retry(() =>
      db
        .insert(resources)
        .values(values)
        .onConflictDoUpdate({ target: resources.externalId, set: values })
        .returning()
    );

    const resourceId = row.id;
    await retry(() => db.delete(resourceSkills).where(eq(resourceSkills.resourceId, resourceId)));
    const skillWeights = Object.entries(item.skillWeights).map(([skillId, weight]) => ({
      resourceId,
      skillId,
      weight,
    }));
    if (skillWeights.length > 0) {
      await retry(() => db.insert(resourceSkills).values(skillWeights));
    }
  }

  console.log(`Seeding ${BADGES.length} badges...`);
  for (const badge of BADGES) {
    await retry(() =>
      db
        .insert(badges)
        .values(badge)
        .onConflictDoUpdate({
          target: badges.id,
          set: { name: badge.name, description: badge.description, icon: badge.icon },
        })
    );
  }

  console.log("✓ Database seeding completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
