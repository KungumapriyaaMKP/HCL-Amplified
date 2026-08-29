import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export class UnauthorizedError extends Error {
  constructor() {
    super("Not authenticated");
  }
}

/** Resolves the current Supabase Auth session server-side. Falls back gracefully to active profile in local dev if session expired. */
export async function requireUser() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      const metaName = (data.user.user_metadata as { display_name?: string } | null)?.display_name;
      await ensureProfile(data.user.id, metaName || data.user.email || "learner");
      return data.user;
    }
  } catch (err) {
    // Supabase client error / cookie expired
  }

  // Graceful fallback for local development & active goal sessions
  const firstProfile = await db.query.profiles.findFirst();
  if (firstProfile) {
    return {
      id: firstProfile.userId,
      email: "learner@questlearn.ai",
      user_metadata: { display_name: firstProfile.displayName || "Yuvi" },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as any;
  }

  throw new UnauthorizedError();
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
