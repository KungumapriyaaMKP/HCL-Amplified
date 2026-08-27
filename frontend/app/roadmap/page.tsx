"use client";

import { useEffect, useState } from "react";
import { Compass, Loader2 } from "lucide-react";
import { createPlan, type PlanResponse } from "@/lib/api/pathfinder";
import { loadPlan, storePlan } from "@/lib/planStore";
import { RoadmapHeader } from "@/features/roadmap/RoadmapHeader";
import { RoadmapBoard } from "@/features/roadmap/RoadmapBoard";

const QUICK_GOALS: { label: string; goal: string; hours: number; weeks: number }[] = [
  { label: "Machine Learning Engineer", goal: "Machine Learning Engineer", hours: 10, weeks: 24 },
  { label: "Full-Stack AI Engineer", goal: "Full-Stack Web & AI Application Engineer", hours: 12, weeks: 20 },
  { label: "Cloud / DevOps Engineer", goal: "Cloud Infrastructure & DevOps Engineer", hours: 8, weeks: 20 },
  { label: "Data Platform Engineer", goal: "Data Platform & Analytics Engineer", hours: 10, weeks: 24 },
];

export default function RoadmapPage() {
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [checked, setChecked] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Read the stored plan AFTER mount (never during render — SSR has no localStorage).
  useEffect(() => {
    setPlan(loadPlan());
    setChecked(true);
  }, []);

  async function generate(goal: string, hours: number, weeks: number) {
    setGenerating(true);
    try {
      const p = await createPlan({
        goal,
        hours_per_week: hours,
        deadline_weeks: weeks,
        priority: "balanced",
      });
      storePlan(p);
      setPlan(p);
    } catch (e) {
      console.error("Failed to generate roadmap:", e);
    } finally {
      setGenerating(false);
    }
  }

  // Still checking storage — render nothing (avoids a flash of the empty state).
  if (!checked) return null;

  // Have a plan → the roadmap.
  if (plan) {
    return (
      <main>
        <RoadmapHeader plan={plan} />
        <RoadmapBoard
          plan={plan}
          onPlanUpdated={(p) => {
            setPlan(p);
            storePlan(p);
          }}
        />
      </main>
    );
  }

  // No plan yet → an empty state that lets the learner generate one in place
  // (never redirect to "/" here — the proxy sends "/" back to /roadmap, which loops).
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <div className="rounded-2xl border border-border bg-canvas p-8 text-center shadow-xs">
        <div className="mx-auto mb-4 inline-flex rounded-full border border-border bg-surface p-3 text-ink">
          <Compass className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          No active roadmap yet
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Pick a target role to generate a prerequisite-aware learning path over the real
          catalog. You can refine it and add more goals afterward.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {QUICK_GOALS.map((g) => (
            <button
              key={g.goal}
              type="button"
              disabled={generating}
              onClick={() => generate(g.goal, g.hours, g.weeks)}
              className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm font-semibold text-ink transition-colors hover:border-ink/40 disabled:opacity-50 cursor-pointer"
            >
              {g.label}
              <span className="mt-0.5 block text-[11px] font-normal text-muted">
                {g.hours}h/week · {g.weeks} weeks
              </span>
            </button>
          ))}
        </div>

        {generating && (
          <div className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Generating your roadmap over the catalog…</span>
          </div>
        )}
      </div>
    </main>
  );
}
