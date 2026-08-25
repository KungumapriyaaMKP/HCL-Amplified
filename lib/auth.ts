import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export class UnauthorizedError extends Error {
  constructor() {
    super("Not authenticated");
  }
}

/** Resolves the current Supabase Auth session server-side. Throws if absent. */
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new UnauthorizedError();

  const metaName = (data.user.user_metadata as { display_name?: string } | null)?.display_name;
  await ensureProfile(data.user.id, metaName || data.user.email || "learner");
  return data.user;
}

/** Creates the app-side profile row the first time we see this user. */
export async function ensureProfile(userId: string, preferredName: string) {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  if (existing) return existing;

  const displayName = preferredName.split("@")[0] || "learner";
  const [created] = await db
    .insert(profiles)
    .values({ userId, displayName })
    .onConflictDoNothing()
    .returning();
  return created;
}
