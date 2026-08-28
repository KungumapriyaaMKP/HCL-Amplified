import { resolveGoalSkills, requiredSkillSet } from "@/lib/skillGraph";
import { planSkillOrder, type PlannerMode } from "@/lib/recommend";
import { SKILLS_BY_ID } from "@/data/skills";
import { DOMAINS, TRACK_PACES } from "@/data/domains";

export interface WhatIfComparison {
  currentGoalText: string;
  currentDomain: string;
  targetRole: string;
  targetDomain: string;
  sharedSkills: { id: string; name: string }[];
  uniqueGapSkills: { id: string; name: string; estimatedHours: number }[];
  totalTargetSkillsCount: number;
  transferabilityRatio: number; // 0..1
  deltaHours: number;
  deltaWeeks: number;
  pivotPlanOrder: string[];
}

const TIER_HOURS: Record<number, number> = { 0: 6.0, 1: 10.0, 2: 16.0 };

function skillHours(skillId: string): number {
  const skill = SKILLS_BY_ID.get(skillId);
  if (!skill) return 8.0;
  const depth = skill.prerequisites.length;
  const tier = Math.min(2, Math.floor(depth / 3));
  return TIER_HOURS[tier] ?? 10.0;
}

/**
 * Pure simulation function for What-If Career & Role Branching.
 * Evaluates in-memory A* path planning against a hypothetical target without DB mutations.
 */
export function simulateWhatIfBranch({
  currentDomain,
  currentGoalText,
  currentGoalSkillIds,
  targetDomain,
  targetRole,
  masteryBySkill,
  hoursPerWeek = 8,
  plannerMode = "fastest",
}: {
  currentDomain: string;
  currentGoalText: string;
  currentGoalSkillIds: string[];
  targetDomain: string;
  targetRole: string;
  masteryBySkill: Map<string, number>;
  hoursPerWeek?: number;
  plannerMode?: PlannerMode;
}): WhatIfComparison {
  const currentSkills = new Set(requiredSkillSet(currentGoalSkillIds));
  const rawTargetSkills = resolveGoalSkills(targetDomain, targetRole, []);
  const targetRequired = Array.from(requiredSkillSet(rawTargetSkills));
  const targetSkillsSet = new Set(targetRequired);

  const sharedIds = targetRequired.filter((id) => currentSkills.has(id));
  const sharedSkills = sharedIds.map((id) => ({
    id,
    name: SKILLS_BY_ID.get(id)?.name ?? id,
  }));

  // Target skills not yet mastered (< 60)
  const unmasteredTarget = targetRequired.filter(
    (id) => (masteryBySkill.get(id) ?? 0) < 60
  );

  // A* path planning for target gap skills
  const pivotPlanOrder = planSkillOrder(unmasteredTarget, masteryBySkill, plannerMode);
  const plannedIds = pivotPlanOrder.length > 0 ? pivotPlanOrder : unmasteredTarget;

  const uniqueGapSkills = plannedIds.map((id) => ({
    id,
    name: SKILLS_BY_ID.get(id)?.name ?? id,
    estimatedHours: skillHours(id),
  }));

  const deltaHours = Number(
    uniqueGapSkills.reduce((acc, s) => acc + s.estimatedHours, 0).toFixed(1)
  );
  const deltaWeeks = Number((deltaHours / Math.max(1, hoursPerWeek)).toFixed(1));

  const transferabilityRatio = Number(
    (sharedIds.length / Math.max(1, targetRequired.length)).toFixed(2)
  );

  return {
    currentGoalText,
    currentDomain,
    targetRole,
    targetDomain,
    sharedSkills,
    uniqueGapSkills,
    totalTargetSkillsCount: targetRequired.length,
    transferabilityRatio,
    deltaHours,
    deltaWeeks,
    pivotPlanOrder: plannedIds,
  };
}
