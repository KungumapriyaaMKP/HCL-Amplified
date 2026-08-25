import "./_env";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { skills, skillPrerequisites, resources, resourceSkills, badges } from "@/db/schema";
import { SKILLS } from "@/data/skills";
import { buildCatalog } from "@/data/resources";
import { BADGES } from "@/data/badges";

async function main() {
  console.log(`Seeding ${SKILLS.length} skills...`);
  for (const skill of SKILLS) {
    await db
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
      });
  }

  console.log("Seeding skill prerequisites...");
  await db.delete(skillPrerequisites);
  for (const skill of SKILLS) {
    for (const prereq of skill.prerequisites) {
      await db.insert(skillPrerequisites).values({ skillId: skill.id, prerequisiteId: prereq });
    }
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
    const [row] = await db
      .insert(resources)
      .values(values)
      .onConflictDoUpdate({ target: resources.externalId, set: values })
      .returning();

    const resourceId = row.id;
    await db.delete(resourceSkills).where(eq(resourceSkills.resourceId, resourceId));
    for (const [skillId, weight] of Object.entries(item.skillWeights)) {
      await db.insert(resourceSkills).values({ resourceId, skillId, weight });
    }
  }

  console.log(`Seeding ${BADGES.length} badges...`);
  for (const badge of BADGES) {
    await db
      .insert(badges)
      .values(badge)
      .onConflictDoUpdate({ target: badges.id, set: { name: badge.name, description: badge.description, icon: badge.icon } });
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
