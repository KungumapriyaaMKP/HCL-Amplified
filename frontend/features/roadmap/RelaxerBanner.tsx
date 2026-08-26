"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import { relaxPlan, PlanRelaxResponse, RelaxationOption, PlanResponse, createPlan } from "@/lib/api/pathfinder";
import { storePlan } from "@/lib/planStore";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";

interface RelaxerBannerProps {
  plan: PlanResponse;
  onPlanUpdated: (newPlan: PlanResponse) => void;
}

export function RelaxerBanner({ plan, onPlanUpdated }: RelaxerBannerProps) {
  const [data, setData] = useState<PlanRelaxResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    async function checkRelax() {
      setLoading(true);
      try {
        const res = await relaxPlan({
          goal: plan.goal,
          hours_per_week: (plan.weeks_required && plan.total_hours) ? Math.round(plan.total_hours / plan.weeks_required) : 10.0,
          deadline_weeks: plan.weeks_required ? Math.round(plan.weeks_required) : null,
          priority: "balanced",
        });
        setData(res);
      } catch (e) {
        console.error("Failed to load relax options:", e);
      } finally {
        setLoading(false);
      }
    }
    checkRelax();
  }, [plan.goal, plan.weeks_required, plan.total_hours]);

  const handleApply = async (option: RelaxationOption) => {
    setApplying(option.type);
    try {
      if (option.type === "drop_electives") {
        const newPlan = await createPlan({
          goal: plan.goal,
          hours_per_week: 10.0,
          priority: "crash",
        });
        storePlan(newPlan);
        onPlanUpdated(newPlan);
      } else if (option.type === "extend_deadline") {
        const newPlan = await createPlan({
          goal: plan.goal,
          hours_per_week: 10.0,
          deadline_weeks: Math.round(option.new_weeks_required),
          priority: "balanced",
        });
        storePlan(newPlan);
        onPlanUpdated(newPlan);
      } else if (option.type === "increase_hours") {
        const newPlan = await createPlan({
          goal: plan.goal,
          hours_per_week: (option.new_total_hours / (option.new_weeks_required || 1)),
          deadline_weeks: Math.round(option.new_weeks_required),
          priority: "fastest",
        });
        storePlan(newPlan);
        onPlanUpdated(newPlan);
      }
    } catch (e) {
      console.error("Failed to apply relaxation:", e);
    } finally {
      setApplying(null);
    }
  };

  if (loading || !data || data.options.length === 0) return null;

  return (
    <div className="p-5 bg-canvas border border-border rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="w-5 h-5 text-ink shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-ink">Schedule & Curriculum Optimizer</h3>
            <p className="text-xs text-muted">
              Ranked mathematical trade-offs computed by the feasibility engine
            </p>
          </div>
        </div>
        <Pill variant={data.is_feasible ? "mastered" : "gap"}>
          {data.is_feasible ? "Feasible Pace" : "Schedule Tight"}
        </Pill>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {data.options.map((opt) => (
          <Card
            key={opt.type}
            className="p-3.5 bg-surface border-border hover:border-ink/40 transition-all flex flex-col justify-between space-y-2"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-ink">
                <span>{opt.title}</span>
                {opt.hours_saved > 0 && (
                  <span className="text-emerald-600 font-bold">-{opt.hours_saved}h</span>
                )}
              </div>
              <p className="text-[11px] text-muted leading-relaxed">{opt.description}</p>
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted">
                ~{opt.new_weeks_required.toFixed(1)} wks total
              </span>
              <button
                disabled={applying === opt.type}
                onClick={() => handleApply(opt)}
                className="bg-ink text-canvas text-[11px] font-semibold px-3 py-1.5 rounded-lg hover:bg-ink/90 disabled:opacity-50 transition-opacity cursor-pointer"
              >
                {applying === opt.type ? "Applying..." : "Apply Trade-off"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
