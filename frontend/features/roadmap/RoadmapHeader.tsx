import type { PlanResponse } from "@/lib/api/pathfinder";

/** Page 2/3 header: the orientation facts. Density rule: <= 5 elements. */
export function RoadmapHeader({ plan }: { plan: PlanResponse }) {
  return (
    <div className="border-b border-border bg-canvas">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="text-sm text-ink-muted">Your roadmap to</p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            {plan.target_role}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">{plan.readiness_pct}%</span>
            <span className="text-sm text-ink-muted">ready</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-muted">
          <span>{plan.gap_count} skills to learn</span>
          <span>{plan.total_hours}h total</span>
          {plan.weeks_required && <span>~{plan.weeks_required} weeks</span>}
          <span
            className={
              plan.prerequisite_violations === 0 ? "text-mastered" : "text-gap"
            }
          >
            {plan.prerequisite_violations} prerequisite violations
          </span>
          {!plan.is_feasible && (
            <span className="text-at-risk">⚠ Tight for your timeframe</span>
          )}
        </div>
      </div>
    </div>
  );
}
