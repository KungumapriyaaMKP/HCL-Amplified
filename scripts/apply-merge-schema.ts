/**
 * One-off: applies the two schema changes that came in from merging
 * origin/base (profiles.preferenceScores + the learning_events table)
 * directly via raw SQL, bypassing `drizzle-kit push`'s full introspection -
 * which breaks against the transaction-mode pooler (see the merge notes).
 * Safe to run multiple times (IF NOT EXISTS / IF NOT EXISTS guards).
 */
import "./_env";
import postgres from "postgres";
import { patchDnsLookupFor } from "@/lib/dnsPatch";

const url = process.env.DATABASE_URL!;
patchDnsLookupFor(new URL(url).hostname);

async function main() {
  const sql = postgres(url, { prepare: false });

  await sql.unsafe(`
    ALTER TABLE "profiles"
      ADD COLUMN IF NOT EXISTS "preference_scores" jsonb NOT NULL DEFAULT '{}';
  `);
  console.log("profiles.preference_scores ensured");

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "learning_events" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL,
      "module_id" uuid REFERENCES "path_modules"("id") ON DELETE CASCADE,
      "event_type" text NOT NULL,
      "modality" text,
      "time_spent_seconds" integer,
      "estimated_seconds" integer,
      "created_at" timestamptz NOT NULL DEFAULT now()
    );
  `);
  console.log("learning_events table ensured");

  await sql.unsafe(`ALTER TABLE "learning_events" ENABLE ROW LEVEL SECURITY;`);
  console.log("RLS enabled on learning_events");

  await sql.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
