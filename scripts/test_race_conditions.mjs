import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import http from "http";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const client = createClient(supabaseUrl, supabaseAnonKey);

async function runRaceConditionTests() {
  console.log("=== STARTING RACE CONDITION & DOUBLE-SUBMIT TESTS ===\n");

  // Sign in
  const { data: { session } } = await client.auth.signInWithPassword({
    email: "chaos_tester_agent2@example.com",
    password: "Password123!"
  });

  const projectRef = "bultlqyabsnhwtomhipu";
  const authCookieValue = encodeURIComponent(JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    user: session.user,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600
  }));
  const cookieHeader = `sb-${projectRef}-auth-token=${authCookieValue}`;

  async function makeRequest(path, method = "POST", body = {}) {
    return new Promise((resolve) => {
      const dataStr = JSON.stringify(body);
      const req = http.request({
        hostname: "localhost",
        port: 3000,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(dataStr),
          "Cookie": cookieHeader
        }
      }, (res) => {
        let resBody = "";
        res.on("data", chunk => resBody += chunk);
        res.on("end", () => {
          let json = null;
          try { json = JSON.parse(resBody); } catch(e) {}
          resolve({ status: res.statusCode, body: resBody, json });
        });
      });
      req.on("error", (e) => resolve({ error: e.message }));
      req.write(dataStr);
      req.end();
    });
  }

  // 1. Race Condition on Goal Creation (10 concurrent requests)
  console.log("[Race 1] 10 Rapid Concurrent Goal Creation Requests (/api/goals)...");
  const goalPromises = Array.from({ length: 10 }).map((_, i) =>
    makeRequest("/api/goals", "POST", {
      domain: "web-dev",
      trackPace: "fast",
      goalText: `Race Condition Test Goal #${i} - ${Date.now()}`
    })
  );
  const goalResults = await Promise.all(goalPromises);
  const successfulGoals = goalResults.filter(r => r.status === 200);
  console.log(`  Created ${successfulGoals.length} / 10 goals concurrently.`);
  console.log(`  Goal IDs:`, successfulGoals.map(r => r.json?.goal?.id));

  // 2. Race Condition on Community Join (10 concurrent requests to join the same domain)
  console.log("\n[Race 2] 10 Rapid Concurrent Community Join Requests (/api/community/data-science/join)...");
  const joinPromises = Array.from({ length: 10 }).map(() =>
    makeRequest("/api/community/data-science/join", "POST", {})
  );
  const joinResults = await Promise.all(joinPromises);
  const successfulJoins = joinResults.filter(r => r.status === 200);
  console.log(`  Completed ${successfulJoins.length} / 10 join requests without error.`);

  // 3. Race Condition on Community Post Creation (10 concurrent requests)
  console.log("\n[Race 3] 10 Rapid Concurrent Community Post Submissions...");
  const postPromises = Array.from({ length: 10 }).map((_, i) =>
    makeRequest("/api/community/data-science", "POST", {
      content: `Concurrent burst message #${i} - timestamp: ${Date.now()}`
    })
  );
  const postResults = await Promise.all(postPromises);
  const successfulPosts = postResults.filter(r => r.status === 200);
  console.log(`  Created ${successfulPosts.length} / 10 duplicate posts simultaneously!`);
  console.log(`  Post IDs:`, successfulPosts.map(r => r.json?.post?.id));

  // 4. Race Condition on Signup Endpoint (Concurrent creation with identical email)
  console.log("\n[Race 4] 5 Concurrent Signups with Identical Email...");
  const dupeEmail = `race_user_${Date.now()}@example.com`;
  const signupPromises = Array.from({ length: 5 }).map(() =>
    makeRequest("/api/auth/signup", "POST", {
      email: dupeEmail,
      password: "Password123!",
      displayName: "RaceTester"
    })
  );
  const signupResults = await Promise.all(signupPromises);
  console.log("  Signup Results:", signupResults.map(r => ({ status: r.status, json: r.json })));

  console.log("\n=== RACE CONDITION TESTS COMPLETE ===");
}

runRaceConditionTests().catch(console.error);
