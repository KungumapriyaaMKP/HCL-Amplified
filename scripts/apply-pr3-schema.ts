import "./_env";
import postgres from "postgres";
import { patchDnsLookupFor } from "@/lib/dnsPatch";

const url = process.env.DATABASE_URL!;
patchDnsLookupFor(new URL(url).hostname);

async function main() {
  const sql = postgres(url, { prepare: false });

  console.log("Applying PR 3 schema tables and columns...");

  await sql.unsafe(`
    ALTER TABLE "streaks"
      ADD COLUMN IF NOT EXISTS "freezes" integer NOT NULL DEFAULT 0;
  `);
  console.log("streaks.freezes column ensured");

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "daily_tasks" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL,
      "title" text NOT NULL,
      "completed" boolean NOT NULL DEFAULT false,
      "created_at" timestamptz NOT NULL DEFAULT now()
    );
  `);
  console.log("daily_tasks table ensured");

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "focus_sessions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL,
      "module_id" uuid REFERENCES "path_modules"("id") ON DELETE SET NULL,
      "skill_id" text REFERENCES "skills"("id") ON DELETE SET NULL,
      "planned_seconds" integer NOT NULL,
      "actual_seconds" integer NOT NULL DEFAULT 0,
      "completed" boolean NOT NULL DEFAULT false,
      "interruptions" integer NOT NULL DEFAULT 0,
      "started_at" timestamptz NOT NULL DEFAULT now(),
      "ended_at" timestamptz
    );
  `);
  console.log("focus_sessions table ensured");

  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "review_schedule" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL,
      "skill_id" text NOT NULL REFERENCES "skills"("id") ON DELETE CASCADE,
      "repetition_number" integer NOT NULL DEFAULT 0,
      "interval_days" integer NOT NULL DEFAULT 1,
      "ease_factor" real NOT NULL DEFAULT 2.5,
      "next_due" timestamptz NOT NULL,
      "last_reviewed" timestamptz,
      "created_at" timestamptz NOT NULL DEFAULT now(),
      "updated_at" timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT "review_schedule_user_skill_unique" UNIQUE("user_id", "skill_id")
    );
  `);
  console.log("review_schedule table ensured");

  await sql.unsafe(`ALTER TABLE "daily_tasks" ENABLE ROW LEVEL SECURITY;`);
  await sql.unsafe(`ALTER TABLE "focus_sessions" ENABLE ROW LEVEL SECURITY;`);
  await sql.unsafe(`ALTER TABLE "review_schedule" ENABLE ROW LEVEL SECURITY;`);
  console.log("RLS enabled on new tables");

  await sql.end();
  console.log("Migration finished successfully!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
