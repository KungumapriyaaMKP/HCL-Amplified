import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import http from "http";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const client = createClient(supabaseUrl, supabaseAnonKey);

async function runCompilerTests() {
  console.log("=== COMPILER CHAOS & ADVERSARIAL TESTS ===\n");

  // Sign in
  const { data: { session }, error } = await client.auth.signInWithPassword({
    email: "chaos_tester_agent2@example.com",
    password: "Password123!"
  });

  if (error || !session) {
    console.error("Auth error:", error);
    return;
  }

  const token = session.access_token;
  const refreshToken = session.refresh_token;

  // Supabase SSR uses cookies: sb-<projectRef>-auth-token
  const projectRef = "bultlqyabsnhwtomhipu";
  const authCookieValue = encodeURIComponent(JSON.stringify({
    access_token: token,
    refresh_token: refreshToken,
    user: session.user,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600
  }));
  const cookieHeader = `sb-${projectRef}-auth-token=${authCookieValue}`;

  async function postCompiler(payload) {
    return new Promise((resolve) => {
      const dataStr = JSON.stringify(payload);
      const req = http.request({
        hostname: "localhost",
        port: 3000,
        path: "/api/compiler/run",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(dataStr),
          "Cookie": cookieHeader
        }
      }, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          let json = null;
          try { json = JSON.parse(body); } catch(e) {}
          resolve({ status: res.statusCode, body, json });
        });
      });
      req.on("error", (e) => resolve({ error: e.message }));
      req.write(dataStr);
      req.end();
    });
  }

  // 1. Invalid Language
  console.log("1. Testing Invalid Language (language: 'c++')...");
  const r1 = await postCompiler({ language: "c++", code: "int main(){ return 0; }" });
  console.log("   Result:", r1.status, r1.json);

  // 2. Empty Code
  console.log("\n2. Testing Empty Code (code: '')...");
  const r2 = await postCompiler({ language: "javascript", code: "" });
  console.log("   Result:", r2.status, r2.json);

  // 3. Infinite loop code (Node.js while(true){})
  console.log("\n3. Testing Infinite Loop in JS (while(true){})...");
  const t0 = Date.now();
  const r3 = await postCompiler({ language: "javascript", code: "while(true){}" });
  const tDiff = (Date.now() - t0) / 1000;
  console.log(`   Result (${tDiff}s):`, r3.status, r3.json);

  // 4. Infinite loop in Python
  console.log("\n4. Testing Infinite Loop in Python (while True: pass)...");
  const t1 = Date.now();
  const r4 = await postCompiler({ language: "python", code: "while True:\n    pass" });
  const tDiffPy = (Date.now() - t1) / 1000;
  console.log(`   Result (${tDiffPy}s):`, r4.status, r4.json);

  // 5. Dangerous OS system calls (Child Process execution)
  console.log("\n5. Testing Dangerous OS System Calls (child_process)...");
  const r5 = await postCompiler({
    language: "javascript",
    code: `const cp = require('child_process'); console.log('OS_USER:', cp.execSync('whoami').toString().trim());`
  });
  console.log("   Result:", r5.status, r5.json);

  // 6. Dangerous Filesystem inspection (.env.local check)
  console.log("\n6. Testing Filesystem Access (Reading cwd files)...");
  const r6 = await postCompiler({
    language: "javascript",
    code: `const fs = require('fs'); const path = require('path'); console.log('ROOT_FILES:', fs.readdirSync(path.resolve('.')).slice(0, 5));`
  });
  console.log("   Result:", r6.status, r6.json);

  // 7. Memory exhaustion / Heap Allocation bomb
  console.log("\n7. Testing Memory Exhaustion (Array allocation)...");
  const r7 = await postCompiler({
    language: "javascript",
    code: `const arr = []; while(true) { arr.push(new Array(1000000).fill('crash')); }`
  });
  console.log("   Result:", r7.status, r7.json);

  // 8. Code length limit (>20,000 chars)
  console.log("\n8. Testing Code Length Limit (>20,000 chars)...");
  const r8 = await postCompiler({
    language: "javascript",
    code: "console.log(1);\n".repeat(1500)
  });
  console.log("   Result:", r8.status, r8.json);
}

runCompilerTests().catch(console.error);
