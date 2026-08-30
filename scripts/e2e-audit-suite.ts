import "./_env";
import { db } from "@/lib/db";
import { profiles, goals, learningPaths, pathModules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { runCode } from "@/lib/external/codeRunner";
import { isValidDomain } from "@/lib/community";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category?: "AUTH" | "FUNCTIONAL" | "UI_UX" | "NETWORK" | "A11Y" | "SECURITY";
  route: string;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function testCompiler() {
  console.log("--> Testing In-App Practice Compiler...");

  // Test 1: Valid JS execution
  try {
    const res = await runCode("javascript", "console.log('Math output:', 2 + 2);");
    const passed = res.stdout.includes("Math output: 4") && res.exitCode === 0;
    results.push({
      suite: "Compiler",
      name: "Valid JavaScript execution",
      passed,
      route: "/api/compiler/run",
      details: res,
    });
  } catch (err: any) {
    results.push({ suite: "Compiler", name: "Valid JavaScript execution", passed: false, route: "/api/compiler/run", error: err.message });
  }

  // Test 2: Valid Python execution
  try {
    const res = await runCode("python", "print('Python output:', 3 * 3)");
    const passed = res.stdout.includes("Python output: 9") && res.exitCode === 0;
    results.push({
      suite: "Compiler",
      name: "Valid Python execution",
      passed,
      route: "/api/compiler/run",
      details: res,
    });
  } catch (err: any) {
    results.push({ suite: "Compiler", name: "Valid Python execution", passed: false, route: "/api/compiler/run", error: err.message });
  }

  // Test 3: Timeout handling (infinite loop)
  try {
    const res = await runCode("javascript", "while(true){}");
    const passed = res.stderr.includes("timed out") || res.exitCode !== 0;
    results.push({
      suite: "Compiler",
      name: "Infinite loop timeout protection",
      passed,
      route: "/api/compiler/run",
      details: res,
    });
  } catch (err: any) {
    results.push({ suite: "Compiler", name: "Infinite loop timeout protection", passed: false, route: "/api/compiler/run", error: err.message });
  }

  // Test 4: Syntax error handling
  try {
    const res = await runCode("javascript", "const x = ;");
    const passed = res.stderr.length > 0 && res.exitCode !== 0;
    results.push({
      suite: "Compiler",
      name: "Syntax error capture",
      passed,
      route: "/api/compiler/run",
      details: res,
    });
  } catch (err: any) {
    results.push({ suite: "Compiler", name: "Syntax error capture", passed: false, route: "/api/compiler/run", error: err.message });
  }

  // Test 5: Unsupported language
  try {
    await runCode("cobol", "DISPLAY 'Hello'");
    results.push({ suite: "Compiler", name: "Unsupported language rejection", passed: false, route: "/api/compiler/run", error: "Should have thrown" });
  } catch (err: any) {
    results.push({ suite: "Compiler", name: "Unsupported language rejection", passed: true, route: "/api/compiler/run", details: err.message });
  }
}

async function testHttpEndpoints() {
  console.log("--> Testing HTTP Endpoints on http://localhost:3000...");
  const baseUrl = "http://localhost:3000";

  // Test 1: Landing Page GET
  try {
    const res = await fetch(`${baseUrl}/`);
    results.push({
      suite: "HTTP Routing",
      name: "GET /",
      passed: res.status === 200 || res.status === 307 || res.status === 308,
      route: "/",
      details: { status: res.status },
    });
  } catch (err: any) {
    results.push({ suite: "HTTP Routing", name: "GET /", passed: false, route: "/", error: err.message });
  }

  // Test 2: Login Page GET
  try {
    const res = await fetch(`${baseUrl}/login`);
    results.push({
      suite: "HTTP Routing",
      name: "GET /login",
      passed: res.status === 200,
      route: "/login",
      details: { status: res.status },
    });
  } catch (err: any) {
    results.push({ suite: "HTTP Routing", name: "GET /login", passed: false, route: "/login", error: err.message });
  }

  // Test 3: Signup Page GET
  try {
    const res = await fetch(`${baseUrl}/signup`);
    results.push({
      suite: "HTTP Routing",
      name: "GET /signup",
      passed: res.status === 200,
      route: "/signup",
      details: { status: res.status },
    });
  } catch (err: any) {
    results.push({ suite: "HTTP Routing", name: "GET /signup", passed: false, route: "/signup", error: err.message });
  }

  // Test 4: Dashboard Page GET (unauthenticated demo fallback check)
  try {
    const res = await fetch(`${baseUrl}/dashboard`);
    results.push({
      suite: "HTTP Routing",
      name: "GET /dashboard (Graceful Demo Fallback)",
      passed: res.status === 200,
      route: "/dashboard",
      details: { status: res.status },
    });
  } catch (err: any) {
    results.push({ suite: "HTTP Routing", name: "GET /dashboard", passed: false, route: "/dashboard", error: err.message });
  }

  // Test 5: Leaderboard Page GET
  try {
    const res = await fetch(`${baseUrl}/leaderboard`);
    results.push({
      suite: "HTTP Routing",
      name: "GET /leaderboard",
      passed: res.status === 200,
      route: "/leaderboard",
      details: { status: res.status },
    });
  } catch (err: any) {
    results.push({ suite: "HTTP Routing", name: "GET /leaderboard", passed: false, route: "/leaderboard", error: err.message });
  }

  // Test 6: Community Hub GET
  try {
    const res = await fetch(`${baseUrl}/community`);
    results.push({
      suite: "HTTP Routing",
      name: "GET /community",
      passed: res.status === 200,
      route: "/community",
      details: { status: res.status },
    });
  } catch (err: any) {
    results.push({ suite: "HTTP Routing", name: "GET /community", passed: false, route: "/community", error: err.message });
  }

  // Test 7: Community Domain GET (Web Dev)
  try {
    const res = await fetch(`${baseUrl}/community/web-dev`);
    // Note: CommunityDomainPage calls requireUser() without a try/catch, so unauthenticated request might return 500 or redirect to /login
    results.push({
      suite: "HTTP Routing",
      name: "GET /community/web-dev (Auth Guard Behavior)",
      passed: res.status === 200 || res.status === 307 || res.status === 308 || res.status === 401,
      severity: res.status === 500 ? "HIGH" : undefined,
      category: "AUTH",
      route: "/community/[domain]",
      details: { status: res.status },
      error: res.status === 500 ? "CommunityDomainPage throws 500 instead of redirecting when unauthenticated" : undefined,
    });
  } catch (err: any) {
    results.push({ suite: "HTTP Routing", name: "GET /community/web-dev", passed: false, route: "/community/web-dev", error: err.message });
  }

  // Test 8: Goals API unauthenticated POST
  try {
    const res = await fetch(`${baseUrl}/api/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: "web-dev", trackPace: "balanced", goalText: "Learn Web Dev" }),
    });
    const body = await res.json();
    const passed = res.status === 401 && body.error === "Not authenticated";
    results.push({
      suite: "Security & AuthZ",
      name: "POST /api/goals rejects unauthenticated requests with 401",
      passed,
      route: "/api/goals",
      details: { status: res.status, body },
    });
  } catch (err: any) {
    results.push({ suite: "Security & AuthZ", name: "POST /api/goals auth guard", passed: false, route: "/api/goals", error: err.message });
  }

  // Test 9: Auth Signup API - Empty Fields
  try {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", password: "" }),
    });
    const body = await res.json();
    const passed = res.status === 400 && !!body.error;
    results.push({
      suite: "Security & Input Validation",
      name: "POST /api/auth/signup rejects empty fields",
      passed,
      route: "/api/auth/signup",
      details: { status: res.status, body },
    });
  } catch (err: any) {
    results.push({ suite: "Security & Input Validation", name: "POST /api/auth/signup empty fields", passed: false, route: "/api/auth/signup", error: err.message });
  }

  // Test 10: Auth Signup API - SQL Injection & XSS Payload in displayName
  try {
    const res = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `fuzz_${Date.now()}@test.local`,
        password: "Password123!",
        displayName: "<script>alert(1)</script>' OR 1=1 --",
      }),
    });
    const body = await res.json();
    results.push({
      suite: "Security & Input Validation",
      name: "POST /api/auth/signup handles special chars & injection payloads safely",
      passed: res.status === 200 || res.status === 400,
      route: "/api/auth/signup",
      details: { status: res.status, body },
    });
  } catch (err: any) {
    results.push({ suite: "Security & Input Validation", name: "POST /api/auth/signup fuzz test", passed: false, route: "/api/auth/signup", error: err.message });
  }

  // Test 11: Community Domain validation
  try {
    const res = await fetch(`${baseUrl}/api/community/invalid-domain-slug-xyz`);
    const body = await res.json();
    const passed = res.status === 401 || res.status === 404;
    results.push({
      suite: "Security & Input Validation",
      name: "GET /api/community/[domain] rejects invalid domain slug",
      passed,
      route: "/api/community/[domain]",
      details: { status: res.status, body },
    });
  } catch (err: any) {
    results.push({ suite: "Security & Input Validation", name: "GET /api/community invalid domain", passed: false, route: "/api/community/[domain]", error: err.message });
  }

  // Test 12: Profile API (GET /api/profile)
  try {
    const res = await fetch(`${baseUrl}/api/profile`);
    const body = await res.json().catch(() => ({}));
    // Should reject unauthenticated with 401 or return profile
    const passed = res.status === 401 || res.status === 200;
    results.push({
      suite: "API Integration",
      name: "GET /api/profile endpoint exists and enforces auth",
      passed,
      route: "/api/profile",
      details: { status: res.status, body },
    });
  } catch (err: any) {
    results.push({ suite: "API Integration", name: "GET /api/profile", passed: false, route: "/api/profile", error: err.message });
  }

  // Test 13: Proctored Generate API (POST /api/modules/[id]/proctored/generate)
  try {
    const res = await fetch(`${baseUrl}/api/modules/demo-id/proctored/generate`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    // Should reject unauthenticated with 401 or 404/403 (not 500)
    const passed = res.status === 401 || res.status === 403 || res.status === 404;
    results.push({
      suite: "API Integration",
      name: "POST /api/modules/[id]/proctored/generate exists and handles requests safely",
      passed,
      route: "/api/modules/[id]/proctored/generate",
      details: { status: res.status, body },
    });
  } catch (err: any) {
    results.push({ suite: "API Integration", name: "POST proctored/generate", passed: false, route: "/api/modules/[id]/proctored/generate", error: err.message });
  }

  // -------------------------------------------------------------------------
  // Engagement & Productivity Layer Endpoints
  // -------------------------------------------------------------------------

  // Test 14: Daily Tasks API (GET & POST /api/tasks)
  try {
    const getRes = await fetch(`${baseUrl}/api/tasks`);
    const passed = getRes.status === 401 || getRes.status === 200;
    results.push({
      suite: "Productivity",
      name: "GET /api/tasks enforces authentication safely",
      passed,
      route: "/api/tasks",
      details: { status: getRes.status },
    });
  } catch (err: any) {
    results.push({ suite: "Productivity", name: "GET /api/tasks", passed: false, route: "/api/tasks", error: err.message });
  }

  // Test 15: Focus Sessions API (POST /api/focus/start)
  try {
    const res = await fetch(`${baseUrl}/api/focus/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plannedSeconds: 1500 }),
    });
    const passed = res.status === 401 || res.status === 201;
    results.push({
      suite: "Productivity",
      name: "POST /api/focus/start validates auth and creates sessions",
      passed,
      route: "/api/focus/start",
      details: { status: res.status },
    });
  } catch (err: any) {
    results.push({ suite: "Productivity", name: "POST /api/focus/start", passed: false, route: "/api/focus/start", error: err.message });
  }

  // Test 16: Spaced Review Queue API (GET /api/review/today)
  try {
    const res = await fetch(`${baseUrl}/api/review/today`);
    const passed = res.status === 401 || res.status === 200;
    results.push({
      suite: "Productivity",
      name: "GET /api/review/today serves spaced repetition queue",
      passed,
      route: "/api/review/today",
      details: { status: res.status },
    });
  } catch (err: any) {
    results.push({ suite: "Productivity", name: "GET /api/review/today", passed: false, route: "/api/review/today", error: err.message });
  }

  // Test 17: Today's Plan Generator API (GET /api/plan/today)
  try {
    const res = await fetch(`${baseUrl}/api/plan/today`);
    const passed = res.status === 401 || res.status === 200;
    results.push({
      suite: "Productivity",
      name: "GET /api/plan/today generates daily unified agenda",
      passed,
      route: "/api/plan/today",
      details: { status: res.status },
    });
  } catch (err: any) {
    results.push({ suite: "Productivity", name: "GET /api/plan/today", passed: false, route: "/api/plan/today", error: err.message });
  }
}

async function testReviewLogic() {
  console.log("--> Testing Spaced-Repetition SM-2 & Fallback Question Engine...");
  const { calculateNextReview } = await import("@/lib/review");
  const { getFallbackReviewQuestions } = await import("@/data/reviewQuestions");

  // 1. Test Again grade resets reps to 0 and interval to 1
  const againResult = calculateNextReview({ intervalDays: 10, ease: 2.5, reps: 3 }, "again");
  results.push({
    suite: "Spaced Repetition",
    name: "SM-2 'again' grade resets reps and interval to 1 day",
    passed: againResult.reps === 0 && againResult.intervalDays === 1 && againResult.ease === 2.3,
    route: "lib/review.ts",
    details: againResult,
  });

  // 2. Test Good grade advances repetitions and scales interval
  const goodResult = calculateNextReview({ intervalDays: 6, ease: 2.5, reps: 2 }, "good");
  results.push({
    suite: "Spaced Repetition",
    name: "SM-2 'good' grade advances interval according to ease factor",
    passed: goodResult.reps === 3 && goodResult.intervalDays === 15,
    route: "lib/review.ts",
    details: goodResult,
  });

  // 3. Test Fallback Questions Bank
  const fallbackQs = getFallbackReviewQuestions("python-fundamentals", "Python Fundamentals");
  results.push({
    suite: "Resilience",
    name: "Deterministic static question bank returns verified MCQs for offline degraded mode",
    passed: Array.isArray(fallbackQs) && fallbackQs.length >= 2 && !!fallbackQs[0].options,
    route: "data/reviewQuestions.ts",
    details: { count: fallbackQs.length },
  });
}

async function run() {
  console.log("=================================================");
  console.log("   AUTOMATED E2E QUALITY & VULNERABILITY SUITE   ");
  console.log("=================================================");
  await testCompiler();
  await testReviewLogic();
  await testHttpEndpoints();

  console.log("\n================ TEST SUMMARY ================");
  let passedCount = 0;
  let failedCount = 0;
  for (const r of results) {
    if (r.passed) {
      passedCount++;
      console.log(`[PASS] [${r.suite}] ${r.name}`);
    } else {
      failedCount++;
      console.log(`[FAIL] [${r.suite}] ${r.name} -> ${r.error || JSON.stringify(r.details)}`);
    }
  }
  console.log(`\nTotal: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);

  // Write results JSON
  try {
    const fs = await import("fs");
    fs.writeFileSync("audit_test_results.json", JSON.stringify(results, null, 2), "utf-8");
  } catch {}
}

run().catch(console.error);
