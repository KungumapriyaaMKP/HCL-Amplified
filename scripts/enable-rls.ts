/**
 * Defense-in-depth: enable Row Level Security on every table with no policies,
 * which denies ALL access to the anon/authenticated PostgREST roles by default.
 * The app itself never queries Postgres through those roles - all app data
 * access goes through Next.js server route handlers using the DATABASE_URL
 * connection (effectively the table owner), which is unaffected by RLS and
 * instead scopes every query by the verified Supabase session's user_id in
 * the query itself. This just guarantees nothing is reachable via the
 * Supabase client/PostgREST API even by mistake.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import postgres from "postgres";
import { patchDnsLookupFor } from "@/lib/dnsPatch";

const DDL_URL = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!;
patchDnsLookupFor(new URL(DDL_URL).hostname);

const TABLES = [
  "profiles",
  "skills",
  "skill_prerequisites",
  "resources",
  "resource_skills",
  "goals",
  "learning_paths",
  "path_modules",
  "skill_mastery",
  "diagnostic_attempts",
  "practice_attempts",
  "proctored_attempts",
  "progress_events",
  "adaptation_log",
  "chat_messages",
  "xp_ledger",
  "badges",
  "user_badges",
  "streaks",
];

async function main() {
  const sql = postgres(DDL_URL, { prepare: false });
  for (const table of TABLES) {
    await sql.unsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
    console.log(`RLS enabled on ${table}`);
  }
  await sql.end();
}

main();
