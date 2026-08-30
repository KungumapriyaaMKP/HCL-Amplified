import { Card } from "@/frontend/components/ui/Card";
import type { DashboardData } from "@/lib/dashboardData";
import { IconActivity } from "@tabler/icons-react";

function getRankBadge(score: number) {
  if (score >= 85) return { label: "MASTER", color: "text-amber-400 border-amber-500/40 bg-amber-950/60" };
  if (score >= 70) return { label: "EXPERT", color: "text-purple-300 border-purple-500/40 bg-purple-950/60" };
  if (score >= 50) return { label: "ADEPT", color: "text-cyan-300 border-cyan-500/40 bg-cyan-950/60" };
  return { label: "NOVICE", color: "text-slate-400 border-slate-700 bg-slate-900/60" };
}

export function MasteryChart({ mastery }: { mastery: DashboardData["mastery"] }) {
  if (mastery.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <IconActivity className="h-5 w-5 text-purple-400" />
          <span>SKILL MASTERY MATRIX</span>
        </h3>
        <p className="mt-2 text-xs text-slate-400">No skills assessed yet | embark on a goal to build your skill profile.</p>
      </Card>
    );
  }

  const top = mastery.slice(0, 10);

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
            <IconActivity className="h-5 w-5 text-purple-400" />
            <span>SKILL MASTERY MATRIX</span>
          </h3>
          <p className="mt-1 text-xs text-slate-400">Live proficiency & algorithmic mastery rating</p>
        </div>
        <span className="rounded-sm bg-purple-950/70 border border-purple-500/30 px-2.5 py-1 text-[10px] font-extrabold text-purple-300 uppercase">
          {mastery.length} SKILLS
        </span>
      </div>

      <div className="space-y-4">
        {top.map((m) => {
          const rank = getRankBadge(m.score);
          return (
            <div key={m.skillId} className="group">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                  {m.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`rounded-sm border px-1.5 py-0.5 text-[9px] font-black tracking-wider ${rank.color}`}>
                    {rank.label}
                  </span>
                  <span className="w-9 text-right text-xs font-black tabular-nums text-purple-400">
                    {m.score}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-sm bg-[#080b18] ring-1 ring-white/5">
                <div
                  className="h-full rounded-sm bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(168,85,247,0.7)] transition-all duration-700"
                  style={{ width: `${Math.max(4, m.score)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
