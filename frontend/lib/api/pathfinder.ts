/**
 * Typed helpers over the generated OpenAPI types. Components import from
 * here, never from the raw generated file.
 */
import { createClient } from "@/lib/supabase/client";
import type { components, RoleCompareRequest, RoleCompareResponse } from "./types";

export type { RoleCompareRequest, RoleCompareResponse };
export type PlanRequest = components["schemas"]["PlanRequest"];
export type PlanResponse = components["schemas"]["PlanResponse"];
export type Milestone = components["schemas"]["MilestoneOut"];
export type Node = components["schemas"]["NodeOut"];
export type ResourceOut = components["schemas"]["ResourceOut"];
export type RelaxationOption = components["schemas"]["RelaxationOption"];
export type PlanRelaxResponse = components["schemas"]["PlanRelaxResponse"];
export type RoleItem = components["schemas"]["RoleItem"];
export type DiagnosticQuestion = components["schemas"]["DiagnosticQuestion"];
export type DiagnosticSubmitResponse = components["schemas"]["DiagnosticSubmitResponse"];
export type SocraticResponse = components["schemas"]["SocraticResponse"];
export type GamificationResponse = components["schemas"]["GamificationResponse"];
export type Badge = components["schemas"]["Badge"];
export type PoincareResponse = components["schemas"]["PoincareResponse"];
export type PoincareNode = components["schemas"]["PoincareNode"];
export type PoincareEdge = components["schemas"]["PoincareEdge"];
export type DetourResponse = components["schemas"]["DetourResponse"];
export type Mastery = components["schemas"]["Mastery"];

export interface UserProfile {
  user_id: string;
  display_name: string;
  is_guest: boolean;
}

export interface LearningEventPayload {
  learner_id?: string;
  type: string;
  at?: string;
  skill_id?: string | null;
  resource_id?: string | null;
  score?: number | null;
  minutes_spent?: number | null;
  payload?: Record<string, unknown>;
}

export interface HistoryResponse {
  saved_plans: Array<{
    id: string;
    user_id: string;
    goal: string;
    plan_json: PlanResponse;
    created_at: string;
  }>;
  retention_summary: Array<{
    skill_id: string;
    retention: number;
  }>;
  activity_grid: Array<{
    date: string;
    count: number;
    topics: string[];
  }>;
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Retrieve authorization bearer token from Supabase session if authenticated.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch {
      // Gracefully continue without authorization header in guest fallback mode
    }
  }
  return headers;
}

export async function createPlan(req: PlanRequest): Promise<PlanResponse> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}/api/plan`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`plan failed: ${res.status}`);
  return res.json();
}

export async function relaxPlan(req: {
  goal: string;
  hours_per_week: number;
  deadline_weeks?: number | null;
  budget_usd?: number | null;
  known?: Record<string, number>;
  priority?: string;
}): Promise<PlanRelaxResponse> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}/api/plan/relax`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`relax plan failed: ${res.status}`);
  return res.json();
}

export async function getRoles(): Promise<{ roles: RoleItem[] }> {
  const res = await fetch(`${BASE}/api/roles`);
  if (!res.ok) throw new Error(`get roles failed: ${res.status}`);
  return res.json();
}

export async function compareRoles(
  currentRoleId: string,
  targetRoleId: string,
  hoursPerWeek: number = 10.0
): Promise<RoleCompareResponse> {
  const res = await fetch(`${BASE}/api/plan/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      current_role_id: currentRoleId,
      target_role_id: targetRoleId,
      hours_per_week: hoursPerWeek,
    }),
  });
  if (!res.ok) throw new Error(`compare roles failed: ${res.status}`);
  return res.json();
}

export async function uploadResume(file: File): Promise<{ skills: Mastery[]; count: number }> {
  const formData = new FormData();
  formData.append("file", file);

  const authHeaders: Record<string, string> = {};
  if (typeof window !== "undefined") {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        authHeaders["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch {}
  }

  const res = await fetch(`${BASE}/api/profile/resume`, {
    method: "POST",
    headers: authHeaders,
    body: formData,
  });
  if (!res.ok) throw new Error(`resume upload failed: ${res.status}`);
  return res.json();
}

export async function profileGithub(username: string): Promise<{ skills: Mastery[]; count: number }> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}/api/profile/github`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error(`github profiling failed: ${res.status}`);
  return res.json();
}

export async function generateDiagnostic(
  goal: string,
  numQuestions: number = 4
): Promise<{ questions: DiagnosticQuestion[]; skills_tested: string[] }> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}/api/diagnostic/generate`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ goal, num_questions: numQuestions }),
  });
  if (!res.ok) throw new Error(`generate diagnostic failed: ${res.status}`);
  return res.json();
}

export async function submitDiagnostic(
  responses: Array<{
    skill_id: string;
    discrimination?: number;
    difficulty?: number;
    is_correct: boolean;
  }>,
  goal: string
): Promise<DiagnosticSubmitResponse> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}/api/diagnostic/submit`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ responses, goal }),
  });
  if (!res.ok) throw new Error(`submit diagnostic failed: ${res.status}`);
  return res.json();
}

export async function getSocraticGuidance(req: {
  skill_id: string;
  skill_name: string;
  chosen_answer: string;
  question: string;
  correct_answer?: string;
}): Promise<SocraticResponse> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}/api/socratic`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`socratic guidance failed: ${res.status}`);
  return res.json();
}

export async function getGamification(): Promise<GamificationResponse> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}/api/gamification`, {
    headers: authHeaders,
  });
  if (!res.ok) throw new Error(`get gamification failed: ${res.status}`);
  return res.json();
}

export async function getPoincareLayout(): Promise<PoincareResponse> {
  const res = await fetch(`${BASE}/api/poincare`);
  if (!res.ok) throw new Error(`get poincare failed: ${res.status}`);
  return res.json();
}

export async function insertDetour(
  blockedSkillId: string,
  goal: string = "Machine Learning Engineer"
): Promise<DetourResponse> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}/api/adapt/detour`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ blocked_skill_id: blockedSkillId, goal }),
  });
  if (!res.ok) throw new Error(`adapt detour failed: ${res.status}`);
  return res.json();
}

export async function getMe(): Promise<UserProfile> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}/api/me`, {
    headers: authHeaders,
  });
  if (!res.ok) throw new Error(`get me failed: ${res.status}`);
  return res.json();
}

export async function updateProfile(
  displayName: string,
  customToken?: string
): Promise<UserProfile> {
  const authHeaders = await getAuthHeaders();
  if (customToken) {
    authHeaders["Authorization"] = `Bearer ${customToken}`;
  }
  const cleanName = displayName.trim() || "Learner";
  const res = await fetch(`${BASE}/api/profile`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ display_name: cleanName }),
  });
  if (!res.ok) throw new Error(`update profile failed: ${res.status}`);
  return res.json();
}

export async function recordEvent(event: LearningEventPayload): Promise<void> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}/api/events`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      at: event.at ?? new Date().toISOString(),
      ...event,
    }),
  });
  if (!res.ok) throw new Error(`record event failed: ${res.status}`);
}

export async function getHistory(): Promise<HistoryResponse> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}/api/history`, {
    headers: authHeaders,
  });
  if (!res.ok) throw new Error(`get history failed: ${res.status}`);
  return res.json();
}

export async function streamChatIntake(
  messages: Array<{ role: string; content: string }>,
  onChunk: (text: string) => void,
  onDone: () => void
): Promise<void> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok || !res.body) {
    onDone();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const raw = line.slice(6).trim();
          if (raw === "[DONE]") {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(raw);
            if (parsed.text) {
              onChunk(parsed.text);
            }
          } catch {}
        }
      }
    }
  } finally {
    onDone();
  }
}

export const PHASE_LABEL: Record<string, string> = {
  foundations: "Foundations",
  core: "Core Concepts",
  advanced: "Advanced Applications",
  capstone: "Capstone",
};

export const PROVIDER_LABEL: Record<string, string> = {
  coursera: "Coursera",
  youtube: "YouTube",
  ms_learn: "Microsoft Learn",
  udemy: "Udemy",
  docs: "Docs",
};
