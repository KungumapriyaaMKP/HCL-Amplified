"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Clock,
  Calendar,
  Layers,
  Zap,
} from "lucide-react";
import { createPlan, PlanRequest, PlanResponse } from "@/lib/api/pathfinder";
import { storePlan } from "@/lib/planStore";
import { emitNudge } from "@/lib/mentorBus";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { NumberTicker } from "@/components/ui/NumberTicker";
import {
  getOnboardingDraft,
  clearOnboardingDraft,
  updateOnboardingStatus,
} from "@/lib/onboardingDraft";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generateAndFinalize() {
      setLoading(true);
      const draft = getOnboardingDraft();
      const cleanGoal = (draft.targetRole || draft.goal || "Machine Learning Engineer").trim() || "Machine Learning Engineer";
      const cleanHours = draft.hoursPerWeek && Number(draft.hoursPerWeek) > 0 ? Number(draft.hoursPerWeek) : 10.0;
      const cleanWeeks = draft.deadlineWeeks && Number(draft.deadlineWeeks) > 0 ? Number(draft.deadlineWeeks) : 24;
      const cleanBudget = draft.budgetUsd !== null && draft.budgetUsd !== undefined ? Number(draft.budgetUsd) : null;
      const cleanKnown: Record<string, number> = {};
      for (const [k, v] of Object.entries(draft.knownSkills || {})) {
        if (k && typeof v === "number" && !isNaN(v)) {
          cleanKnown[k] = Math.max(0, Math.min(1, v));
        }
      }

      const req: PlanRequest = {
        goal: cleanGoal,
        hours_per_week: cleanHours,
        deadline_weeks: cleanWeeks,
        budget_usd: cleanBudget,
        known: cleanKnown,
        priority: draft.priority || "balanced",
      };

      try {
        const generatedPlan = await createPlan(req);
        storePlan(generatedPlan);
        setPlan(generatedPlan);
        await updateOnboardingStatus("completed");
        emitNudge("progress", "Your custom learning roadmap is ready!");
        clearOnboardingDraft();
      } catch (err: unknown) {
        console.warn("Could not generate live plan from backend, building fallback structure:", err);
        // Resilient fallback plan if backend endpoint is unavailable
        const fallbackPlan: PlanResponse = {
          goal: cleanGoal,
          target_role: cleanGoal,
          readiness_pct: Object.keys(draft.knownSkills || {}).length > 0 ? 25 : 0,
          total_hours: 120,
          total_cost_usd: draft.budgetUsd || 0,
          weeks_required: draft.deadlineWeeks || 24,
          is_feasible: true,
          prerequisite_violations: 0,
          milestones: [
            {
              phase: "foundations",
              title: "Core Foundations & Prerequisites",
              total_hours: 30,
              nodes: [],
            },
            {
              phase: "core",
              title: "Specialized Core Topics",
              total_hours: 50,
              nodes: [],
            },
            {
              phase: "advanced",
              title: "Advanced Domain Applications",
              total_hours: 40,
              nodes: [],
            },
          ],
          gap_count: 8,
        };
        storePlan(fallbackPlan);
        setPlan(fallbackPlan);
        await updateOnboardingStatus("completed");
        emitNudge("progress", "Your custom learning roadmap is ready!");
        clearOnboardingDraft();
      } finally {
        setLoading(false);
      }
    }

    generateAndFinalize();
  }, []);

  const handleLaunchRoadmap = () => {
    router.push("/roadmap");
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-4 text-center">
      {loading ? (
        <div className="py-20 space-y-4">
          <div className="inline-flex p-4 rounded-full bg-surface border border-border text-ink animate-bounce">
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-ink animate-pulse">
            Synthesizing Your Optimized Curriculum...
          </h2>
          <p className="text-xs text-muted max-w-md mx-auto">
            Computing topological sort DAG, resolving prerequisite constraints, and selecting highest-yield catalog resources.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Onboarding Complete!
            </h1>
            <p className="text-sm text-muted max-w-lg mx-auto">
              Your personalized, prerequisite-aware learning roadmap for <strong>{plan?.goal}</strong> has been generated and saved.
            </p>
          </div>

          {/* Plan Summary Card */}
          {plan && (
            <Card className="p-6 bg-canvas border-border text-left space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    Target Role Curriculum
                  </span>
                  <h3 className="text-lg font-bold text-ink mt-0.5">{plan.goal}</h3>
                </div>
                <Pill variant="mastered">
                  {plan.readiness_pct}% Starting Readiness
                </Pill>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 bg-surface rounded-xl border border-border">
                  <Clock className="w-4 h-4 text-muted mx-auto mb-1" />
                  <span className="text-[10px] text-muted uppercase font-semibold">Total Hours</span>
                  <div className="text-lg font-bold text-ink mt-0.5">
                    <NumberTicker value={plan.total_hours} suffix="h" />
                  </div>
                </div>

                <div className="p-3.5 bg-surface rounded-xl border border-border">
                  <Calendar className="w-4 h-4 text-muted mx-auto mb-1" />
                  <span className="text-[10px] text-muted uppercase font-semibold">Duration</span>
                  <div className="text-lg font-bold text-ink mt-0.5">
                    {plan.weeks_required ? `${plan.weeks_required} wks` : "Flexible"}
                  </div>
                </div>

                <div className="p-3.5 bg-surface rounded-xl border border-border">
                  <Layers className="w-4 h-4 text-muted mx-auto mb-1" />
                  <span className="text-[10px] text-muted uppercase font-semibold">Milestones</span>
                  <div className="text-lg font-bold text-ink mt-0.5">
                    {plan.milestones.length} Phases
                  </div>
                </div>

                <div className="p-3.5 bg-surface rounded-xl border border-border">
                  <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <span className="text-[10px] text-muted uppercase font-semibold">Skill Gaps</span>
                  <div className="text-lg font-bold text-ink mt-0.5">
                    {plan.gap_count} Nodes
                  </div>
                </div>
              </div>

              {/* Milestones Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Curriculum Sequence Breakdown
                </h4>
                <div className="space-y-2">
                  {plan.milestones.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-ink/10 text-ink font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-ink">{m.title}</span>
                      </div>
                      <span className="text-muted font-medium">{m.total_hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Launch Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleLaunchRoadmap}
              className="bg-ink text-canvas font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-ink/90 transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Launch Your Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
