import { SKILLS_BY_ID } from "@/data/skills";
import { TRACK_PACES } from "@/data/domains";

export interface RelaxationOption {
  type: "drop_electives" | "extend_deadline" | "increase_hours";
  title: string;
  description: string;
  hoursSaved: number;
  newTotalHours: number;
  newWeeksRequired: number;
  isFeasible: boolean;
}

export interface FeasibilityReport {
  isFeasible: boolean;
  baselineHours: number;
  baselineWeeks: number;
  deadlineWeeks: number | null;
  hoursPerWeek: number;
  options: RelaxationOption[];
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
 * Computes ranked relaxation trade-offs when schedule or weekly study budget is tight.
 * Returns math-grounded options: (1) drop electives, (2) extend deadline, (3) increase weekly hours.
 */
export function computeFeasibility({
  gapSkills,
  goalSkillIds,
  trackPace = "balanced",
  deadlineWeeks = null,
  hoursPerWeekOverride = null,
}: {
  gapSkills: string[];
  goalSkillIds: string[];
  trackPace?: string;
  deadlineWeeks?: number | null;
  hoursPerWeekOverride?: number | null;
}): FeasibilityReport {
  const paceObj = TRACK_PACES.find((p) => p.id === trackPace);
  const hoursPerWeek = hoursPerWeekOverride ?? paceObj?.hoursPerWeek ?? 8;

  // Calculate baseline hours
  const baselineHours = Number(
    gapSkills.reduce((acc, sid) => acc + skillHours(sid), 0).toFixed(1)
  );
  const baselineWeeks = Number((baselineHours / Math.max(1, hoursPerWeek)).toFixed(1));

  const targetDeadline = deadlineWeeks ?? (trackPace === "crash-course" ? 4 : Math.ceil(baselineWeeks));
  const isFeasible = !targetDeadline || baselineWeeks <= targetDeadline;

  const options: RelaxationOption[] = [];

  // 1. Drop electives (focus strictly on direct goal skills + direct prerequisites)
  const directGoalSet = new Set(goalSkillIds);
  const corePrereqs = new Set<string>();
  for (const gid of goalSkillIds) {
    const s = SKILLS_BY_ID.get(gid);
    if (s) {
      for (const p of s.prerequisites) corePrereqs.add(p);
    }
  }

  const strippedSkills = gapSkills.filter((s) => directGoalSet.has(s) || corePrereqs.has(s));
  const strippedHours = Number(
    strippedSkills.reduce((acc, sid) => acc + skillHours(sid), 0).toFixed(1)
  );
  const savedHours = Number((baselineHours - strippedHours).toFixed(1));

  if (savedHours > 0) {
    const newWeeks = Number((strippedHours / Math.max(1, hoursPerWeek)).toFixed(1));
    options.push({
      type: "drop_electives",
      title: "Drop Elective Modules",
      description: `Focus strictly on core requirements, saving ${savedHours} study hours.`,
      hoursSaved: savedHours,
      newTotalHours: strippedHours,
      newWeeksRequired: newWeeks,
      isFeasible: !targetDeadline || newWeeks <= targetDeadline,
    });
  }

  // 2. Extend deadline
  if (targetDeadline && baselineWeeks > targetDeadline) {
    const neededWeeks = Math.ceil(baselineHours / Math.max(1, hoursPerWeek));
    const deltaWeeks = neededWeeks - targetDeadline;
    options.push({
      type: "extend_deadline",
      title: `Extend Target Deadline by +${deltaWeeks} Weeks`,
      description: `Maintain your current ${hoursPerWeek}h/week study pace by adjusting target deadline to ${neededWeeks} weeks.`,
      hoursSaved: 0,
      newTotalHours: baselineHours,
      newWeeksRequired: neededWeeks,
      isFeasible: true,
    });
  }

  // 3. Increase weekly hours
  if (targetDeadline && baselineWeeks > targetDeadline) {
    const neededHPW = Number((baselineHours / targetDeadline).toFixed(1));
    const deltaHPW = Number((neededHPW - hoursPerWeek).toFixed(1));
    options.push({
      type: "increase_hours",
      title: `Accelerate Pace (+${deltaHPW}h/week)`,
      description: `Increase study commitment to ${neededHPW}h/week to achieve goal within ${targetDeadline} weeks.`,
      hoursSaved: 0,
      newTotalHours: baselineHours,
      newWeeksRequired: targetDeadline,
      isFeasible: true,
    });
  }

  // If already feasible, provide a speed-up trade-off option
  if (options.length === 0) {
    const acceleratedHPW = hoursPerWeek + 4;
    const accWeeks = Number((baselineHours / acceleratedHPW).toFixed(1));
    options.push({
      type: "increase_hours",
      title: "Fast Track Acceleration (+4h/week)",
      description: `Increase pace to ${acceleratedHPW}h/week to complete the roadmap in ~${accWeeks} weeks.`,
      hoursSaved: 0,
      newTotalHours: baselineHours,
      newWeeksRequired: accWeeks,
      isFeasible: true,
    });
  }

  return {
    isFeasible,
    baselineHours,
    baselineWeeks,
    deadlineWeeks: targetDeadline,
    hoursPerWeek,
    options,
  };
}
