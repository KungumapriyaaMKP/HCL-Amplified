/**
 * Minimal client handoff of the generated plan from intake to roadmap.
 * sessionStorage keeps it simple for Round 1 -- no state library needed,
 * and it survives the client-side navigation between pages.
 */
import type { PlanResponse } from "./api/pathfinder";

const KEY = "pathfinder.plan";

export function storePlan(plan: PlanResponse) {
  sessionStorage.setItem(KEY, JSON.stringify(plan));
}

export function loadPlan(): PlanResponse | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as PlanResponse) : null;
}
