/**
 * Wipes every per-user row (goals, paths, mastery, attempts, gamification,
 * chat, profiles) and deletes every Supabase Auth user, so the app can be
 * tested again from a clean slate. Leaves the shared catalog untouched
 * (skills, skill_prerequisites, resources, resource_skills, badges) - that's
 * real seeded content, not test data.
 */
import "./_env";
import { db } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  goals,
  learningPaths,
  pathModules,
  skillMastery,
  diagnosticAttempts,
  practiceAttempts,
  proctoredAttempts,
  progressEvents,
  adaptationLog,
  chatMessages,
  xpLedger,
  userBadges,
  streaks,
  profiles,
} from "@/db/schema";

async function main() {
  console.log("Deleting per-user rows...");
  // Children first (FK dependencies), though most cascade from goals/paths anyway.
  await db.delete(progressEvents);
  await db.delete(adaptationLog);
  await db.delete(practiceAttempts);
  await db.delete(proctoredAttempts);
  await db.delete(diagnosticAttempts);
  await db.delete(pathModules);
  await db.delete(learningPaths);
  await db.delete(goals);
  await db.delete(skillMastery);
  await db.delete(chatMessages);
  await db.delete(xpLedger);
  await db.delete(userBadges);
  await db.delete(streaks);
  await db.delete(profiles);
  console.log("Per-user rows deleted.");

  console.log("Deleting Supabase Auth users...");
  const admin = createAdminClient();
  let page = 1;
  let deleted = 0;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    if (data.users.length === 0) break;
    for (const user of data.users) {
      const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
      if (delErr) console.error(`Failed to delete ${user.email}:`, delErr.message);
      else deleted++;
    }
    page++;
  }
  console.log(`Deleted ${deleted} auth user(s).`);
  console.log("Done. Catalog (skills/resources/badges) left intact.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
