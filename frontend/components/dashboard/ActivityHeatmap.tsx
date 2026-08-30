import { Card } from "@/frontend/components/ui/Card";
import type { DashboardData } from "@/lib/dashboardData";
import { IconCalendar } from "@tabler/icons-react";

const TIER_CLASSES = [
  "bg-[#090d1f] border border-white/5",
  "bg-purple-950/80 border border-purple-600/40 text-purple-300",
  "bg-purple-700/70 border border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.4)]",
  "bg-purple-500 border border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.7)]",
  "bg-cyan-400 border border-white shadow-[0_0_15px_rgba(6,182,212,0.9)]",
];

function tierFor(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ActivityHeatmap({ activity }: { activity: DashboardData["activity"] }) {
  if (activity.every((d) => d.count === 0)) {
    return (
      <Card className="p-6">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <IconCalendar className="h-5 w-5 text-purple-400" />
          <span>ACTIVITY VELOCITY LOG</span>
        </h3>
        <p className="mt-2 text-xs text-slate-400">No activity logged yet | complete quizzes and code challenges to record your progress.</p>
      </Card>
    );
  }

  const firstDow = new Date(activity[0].date + "T00:00:00").getDay();
  const padded = [...Array.from({ length: firstDow }, () => null), ...activity];
  const weeks: (DashboardData["activity"][number] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2 drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
            <IconCalendar className="h-5 w-5 text-purple-400" />
            <span>LEARNING ACTIVITY LOG</span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">Daily learning sessions and assessment frequency</p>
        </div>
      </div>

      <div className="flex gap-[4px] overflow-x-auto pb-2 scrollbar-thin">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[4px]">
            {week.map((day, di) => (
              <div
                key={di}
                title={
                  day
                    ? `${formatDate(day.date)} - ${day.count} action${day.count === 1 ? "" : "s"}${
                        day.skillNames.length ? ` (${day.skillNames.join(", ")})` : ""
                      }`
                    : undefined
                }
                className={`h-[14px] w-[14px] rounded-[4px] transition-transform hover:scale-125 ${
                  day ? TIER_CLASSES[tierFor(day.count)] : "bg-transparent"
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-purple-500/15 pt-3 text-[10px] font-bold text-slate-400">
        <span>Activity Scale</span>
        <div className="flex items-center gap-1.5">
          <span>Low</span>
          {TIER_CLASSES.map((c, i) => (
            <div key={i} className={`h-[12px] w-[12px] rounded-[3px] ${c}`} />
          ))}
          <span>High</span>
        </div>
      </div>
    </Card>
  );
}
