import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only admin client (secret key). Used for: (1) scripts/seed.ts,
// (2) creating pre-confirmed accounts on signup so the demo never blocks on
// email confirmation. Never import this from client components.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
