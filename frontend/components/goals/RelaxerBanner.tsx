"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FeasibilityReport, RelaxationOption } from "@/lib/feasibility";

export function RelaxerBanner({
  goalId,
  initialFeasibility,
}: {
  goalId: string;
  initialFeasibility?: FeasibilityReport | null;
}) {
  const router = useRouter();
  const [data] = useState<FeasibilityReport | null>(initialFeasibility ?? null);
  const [applying, setApplying] = useState<string | null>(null);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);

  if (!data || data.options.length === 0) return null;

  async function handleApply(option: RelaxationOption) {
    setApplying(option.type);
    try {
      const res = await fetch(`/api/goals/${goalId}/path/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plannerMode: option.type === "increase_hours" ? "fastest" : "balanced",
          appliedRelaxation: option.type,
        }),
      });
      if (!res.ok) throw new Error("Failed to re-optimize path");
      setAppliedMsg(`Applied "${option.title}"! Path updated.`);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(null);
    }
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Schedule & Curriculum Optimizer
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                data.isFeasible
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {data.isFeasible ? "Feasible Schedule" : "Schedule Tight"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Baseline: ~{data.baselineHours}h total study time ({data.baselineWeeks} weeks at {data.hoursPerWeek}h/week)
          </p>
        </div>

        {appliedMsg && (
          <span className="text-xs text-emerald-400 font-medium animate-fade-in">{appliedMsg}</span>
        )}
      </div>

      {/* 3 Ranked Trade-off Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {data.options.map((opt) => (
          <div
            key={opt.type}
            className="flex flex-col justify-between rounded-xl border border-border bg-surface-2/60 p-4 transition-all hover:border-accent/40"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>{opt.title}</span>
                {opt.hoursSaved > 0 && (
                  <span className="text-emerald-400 font-bold">-{opt.hoursSaved}h</span>
                )}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">{opt.description}</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
              <span className="text-[11px] font-mono text-muted">
                ~{opt.newWeeksRequired} wks total
              </span>
              <button
                disabled={applying === opt.type}
                onClick={() => handleApply(opt)}
                className="rounded-lg bg-accent px-3 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {applying === opt.type ? "Applying..." : "Apply Trade-off"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
