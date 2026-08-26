"use client";

import { Card } from "@/components/ui/Card";
import { NumberTicker } from "@/components/ui/NumberTicker";

interface GapClosureTrendProps {
  savedPlans?: Array<{ plan_json?: { readiness_pct?: number } }>;
  skillsStudiedCount: number;
}

export function GapClosureTrend({
  savedPlans = [],
  skillsStudiedCount,
}: GapClosureTrendProps) {
  const plansCount = savedPlans.length;
  const meanReadiness =
    plansCount > 0
      ? Math.round(
          savedPlans.reduce(
            (acc, p) => acc + (p.plan_json?.readiness_pct || 0),
            0
          ) / plansCount
        )
      : skillsStudiedCount > 0
      ? Math.min(100, Math.round(skillsStudiedCount * 4.5))
      : 0;

  return (
    <Card className="p-6 bg-canvas border-border space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">Curriculum Gap Closure Trend</h3>
          <p className="text-xs text-muted">
            Tracking mastery acquisition against target role requirements
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-muted block">Active Roadmaps</span>
          <div className="text-2xl font-extrabold text-ink mt-1">
            <NumberTicker value={Math.max(1, plansCount)} />
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">A* Optimized</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <span className="text-xs text-muted block">Skills Acquired</span>
          <div className="text-2xl font-extrabold text-ink mt-1">
            <NumberTicker value={skillsStudiedCount} />
          </div>
          <span className="text-[11px] text-purple-600 font-medium">Mapped to DAG</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border col-span-2 sm:col-span-1">
          <span className="text-xs text-muted block">Mean Readiness Closure</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            <NumberTicker value={meanReadiness} suffix="%" />
          </div>
          <span className="text-[11px] text-muted">Target 100%</span>
        </div>
      </div>
    </Card>
  );
}
