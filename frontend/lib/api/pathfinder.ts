/**
 * Typed helpers over the generated OpenAPI types. Components import from
 * here, never from the raw generated file.
 */
import type { components } from "./types";

export type PlanRequest = components["schemas"]["PlanRequest"];
export type PlanResponse = components["schemas"]["PlanResponse"];
export type Milestone = components["schemas"]["MilestoneOut"];
export type Node = components["schemas"]["NodeOut"];
export type ResourceOut = components["schemas"]["ResourceOut"];

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function createPlan(req: PlanRequest): Promise<PlanResponse> {
  const res = await fetch(`${BASE}/api/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`plan failed: ${res.status}`);
  return res.json();
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
