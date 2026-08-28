import Link from "next/link";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import type { GoalDetail } from "@/lib/goalData";
import { IconArrowRight, IconLock, IconCheck, IconClock, IconPlayerPlay } from "@tabler/icons-react";

const STATUS_STYLE: Record<string, { tone: "default" | "success" | "warning" | "accent" | "cyan"; label: string }> = {
  locked: { tone: "default", label: "LOCKED" },
  available: { tone: "cyan", label: "AVAILABLE" },
  in_progress: { tone: "warning", label: "IN PROGRESS" },
  completed: { tone: "success", label: "COMPLETED" },
};

const MILESTONE_LABEL: Record<string, string> = {
  foundation: "FOUNDATION",
  core: "CORE",
  capstone: "CAPSTONE",
  remediation: "REMEDIATION",
};

export function ModuleCard({ item, goalId }: { item: GoalDetail["modules"][number]; goalId: string }) {
  const status = STATUS_STYLE[item.module.status] ?? STATUS_STYLE.locked;
  const clickable = item.module.status !== "locked";

  const body = (
    <div
      className={`group relative overflow-hidden rounded-md border p-4 transition-all duration-300 ${
        item.module.status === "completed"
          ? "border-emerald-500/40 bg-[#0a1f18]/80 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          : item.module.status === "available"
          ? "border-cyan-400/50 bg-[#0d1633]/90 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:border-cyan-300 hover:scale-[1.01]"
          : item.module.status === "in_progress"
          ? "border-amber-400/50 bg-[#1f1608]/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          : "border-purple-500/15 bg-[#080a18]/60 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge tone="default" className="text-[9px]">
              {MILESTONE_LABEL[item.module.milestoneType] ?? item.module.milestoneType.toUpperCase()}
            </Badge>
            {item.module.isProgramming && (
              <Badge tone="accent" className="text-[9px]">
                {item.module.programmingLanguage?.toUpperCase()} LAB
              </Badge>
            )}
          </div>
          <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
            {item.skill.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400 font-medium">
            {item.resource.type.toUpperCase()} · {item.resource.provider} · ~{Math.round(item.resource.estimatedMinutes / 60)}h
          </p>
        </div>
        
        <Badge tone={status.tone} className="flex items-center gap-1 shrink-0">
          {item.module.status === "completed" && <IconCheck className="h-3 w-3" />}
          {item.module.status === "available" && <IconPlayerPlay className="h-3 w-3" />}
          {item.module.status === "in_progress" && <IconClock className="h-3 w-3" />}
          {item.module.status === "locked" && <IconLock className="h-3 w-3" />}
          <span>{status.label}</span>
        </Badge>
      </div>

      {item.module.rationale && (
        <div className="mt-3 rounded-sm border border-white/5 bg-black/40 p-2.5 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">RECOMMENDATION RATIONALE</span>
            {clickable && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Enter Module</span>
                <IconArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-snug">{item.module.rationale}</p>
        </div>
      )}
    </div>
  );

  return clickable ? <Link href={`/goals/${goalId}/modules/${item.module.id}`}>{body}</Link> : body;
}
