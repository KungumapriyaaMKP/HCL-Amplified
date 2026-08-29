import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

const admin = createClient(supabaseUrl, supabaseServiceKey);
const client = createClient(supabaseUrl, supabaseAnonKey);

async function setup() {
  const testEmail = "chaos_tester_agent2@example.com";
  const testPassword = "Password123!";

  // Check if test user exists, otherwise create
  const { data: { users } } = await admin.auth.admin.listUsers();
  let user = users.find(u => u.email === testEmail);
  
  if (!user) {
    console.log("Creating test user:", testEmail);
    const { data, error } = await admin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { display_name: "ChaosTester" }
    });
    if (error) {
      console.error("Error creating user:", error);
      return;
    }
    user = data.user;
  } else {
    console.log("Found existing test user:", testEmail);
    await admin.auth.admin.updateUserById(user.id, { password: testPassword });
  }

  // Sign in to get session
  const { data: sessionData, error: signInError } = await client.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (signInError) {
    console.error("Sign in failed:", signInError);
    return;
  }

  console.log("Successfully logged in as:", sessionData.user.email);
  return { user: sessionData.user, session: sessionData.session };
}

setup().catch(console.error);
