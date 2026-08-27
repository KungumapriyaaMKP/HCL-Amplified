import { createClient, hasSupabase } from "@/lib/supabase/client";

export type OnboardingStatus =
  | "history_pending"
  | "discovery_pending"
  | "role_pending"
  | "diagnostic_pending"
  | "completed";

export interface OnboardingDraft {
  knownSkills: Record<string, number>;
  goal?: string;
  targetRole?: string;
  targetRoleId?: string;
  hoursPerWeek?: number;
  deadlineWeeks?: number | null;
  budgetUsd?: number | null;
  priority?: string;
}

const DRAFT_KEY = "onboarding_draft";

export function getOnboardingDraft(): OnboardingDraft {
  if (typeof window === "undefined") {
    return {
      knownSkills: {},
      goal: "Machine Learning Engineer",
      targetRole: "Machine Learning Engineer",
      hoursPerWeek: 10,
      deadlineWeeks: 24,
      priority: "balanced",
    };
  }

  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      return {
        knownSkills: {},
        goal: "Machine Learning Engineer",
        targetRole: "Machine Learning Engineer",
        hoursPerWeek: 10,
        deadlineWeeks: 24,
        priority: "balanced",
      };
    }
    const parsed = JSON.parse(raw);
    return {
      knownSkills: parsed.knownSkills || {},
      goal: parsed.goal || "Machine Learning Engineer",
      targetRole: parsed.targetRole || parsed.goal || "Machine Learning Engineer",
      targetRoleId: parsed.targetRoleId,
      hoursPerWeek: parsed.hoursPerWeek ?? 10,
      deadlineWeeks: parsed.deadlineWeeks ?? 24,
      budgetUsd: parsed.budgetUsd ?? null,
      priority: parsed.priority || "balanced",
    };
  } catch {
    return {
      knownSkills: {},
      goal: "Machine Learning Engineer",
      targetRole: "Machine Learning Engineer",
      hoursPerWeek: 10,
      deadlineWeeks: 24,
      priority: "balanced",
    };
  }
}

export function saveOnboardingDraft(updates: Partial<OnboardingDraft>): OnboardingDraft {
  if (typeof window === "undefined") {
    return {
      knownSkills: {},
      ...updates,
    };
  }

  const current = getOnboardingDraft();
  const merged: OnboardingDraft = {
    ...current,
    ...updates,
    knownSkills: {
      ...current.knownSkills,
      ...(updates.knownSkills || {}),
    },
  };

  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(merged));
  } catch (err) {
    console.error("Failed to persist onboarding draft:", err);
  }

  return merged;
}

export function clearOnboardingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}

export async function updateOnboardingStatus(nextStatus: OnboardingStatus): Promise<void> {
  if (!hasSupabase()) return;
  try {
    const supabase = createClient();
    // Guests have no session; skip silently so we don't fire a 401 from updateUser.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.auth.updateUser({
      data: {
        onboarding_status: nextStatus,
      },
    });
  } catch (err) {
    console.warn("Failed to update onboarding status in user metadata:", err);
  }
}
