import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Creates a pre-confirmed account via the admin API so the demo flow never
// blocks on an email-confirmation link. The client signs in immediately
// after this succeeds.
export async function POST(req: NextRequest) {
  const { email, password, displayName } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName || email.split("@")[0] },
  });

  if (error) {
    console.error("Signup failed:", error.status, error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
