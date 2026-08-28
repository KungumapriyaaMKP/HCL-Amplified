import Link from "next/link";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { ProgressBar } from "@/frontend/components/ui/progress-bar";
import { DOMAINS } from "@/data/domains";
import { DomainIcon } from "@/frontend/components/ui/DomainIcon";
import type { DashboardData } from "@/lib/dashboardData";
import { IconArrowRight, IconTarget } from "@tabler/icons-react";

const STATUS_LABEL: Record<string, { label: string; tone: "accent" | "success" | "warning" | "cyan" }> = {
  intake: { label: "INTAKE", tone: "cyan" },
  beginner_check: { label: "CALIBRATION", tone: "cyan" },
  diagnostic: { label: "DIAGNOSTIC", tone: "warning" },
  ready: { label: "GENERATING", tone: "accent" },
  active: { label: "IN PROGRESS", tone: "accent" },
  completed: { label: "COMPLETED", tone: "success" },
};

export function GoalCard({ goal }: { goal: DashboardData["goals"][number] }) {
  const domain = DOMAINS.find((d) => d.id === goal.domain);
  const pct = goal.totalModules > 0 ? (goal.completedModules / goal.totalModules) * 100 : 0;
  const inSetup = !goal.pathId;
  const href = inSetup ? `/goals/${goal.id}/setup` : `/goals/${goal.id}`;
  const statusInfo = STATUS_LABEL[goal.status] ?? { label: goal.status.toUpperCase(), tone: "accent" };

  return (
    <Link href={href} className="group block h-full">
      <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-purple-500/30 bg-[#0d1226]/85 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.35)] hover:-translate-y-1">
        
        {/* Glow overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-cyan-600/5 opacity-0 transition-opacity group-hover:opacity-100" />
        
        <div>
          {/* Top domain & status */}
          <div className="relative z-10 mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
              <DomainIcon id={domain?.id} className="h-4 w-4 text-purple-400" />
              <span className="uppercase tracking-widest text-[10px] text-slate-400">{domain?.name ?? "General Goal"}</span>
            </div>
            <Badge tone={statusInfo.tone}>
              {statusInfo.label}
            </Badge>
          </div>

          {/* Goal title */}
          <h3 className="relative z-10 text-base font-black text-white leading-snug drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)] group-hover:text-purple-200 transition-colors">
            {goal.goalText}
          </h3>
        </div>

        {/* Bottom progress & action */}
        <div className="relative z-10 mt-5 pt-4 border-t border-purple-500/15">
          {goal.pathId ? (
            <>
              <div className="mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400">{goal.completedModules}/{goal.totalModules} Modules Cleared</span>
                  <span className="text-purple-300">{Math.round(pct)}%</span>
                </div>
                <ProgressBar value={pct} variant="purple" />
              </div>

              {goal.nextAction && (
                <div className="rounded-md border border-purple-500/25 bg-[#070918]/80 p-3 text-xs">
                  <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-cyan-400">
                    <IconTarget className="h-3.5 w-3.5" />
                    <span>NEXT OBJECTIVE</span>
                  </div>
                  <p className="mt-1 font-bold text-white line-clamp-1">{goal.nextAction.skillName}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400 line-clamp-1">{goal.nextAction.resourceTitle}</p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-md border border-amber-500/20 bg-amber-950/30 p-3 text-xs font-semibold text-amber-300 flex items-center justify-between">
              <span>Complete intake assessment</span>
              <IconArrowRight className="h-4 w-4" />
            </div>
          )}
        </div>

      </div>
    </Link>
  );
}
