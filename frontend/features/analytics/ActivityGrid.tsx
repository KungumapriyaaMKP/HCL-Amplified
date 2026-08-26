"use client";

import { Card } from "@/components/ui/Card";

interface ActivityGridProps {
  grid: Array<{
    date: string;
    count: number;
    topics: string[];
  }>;
}

export function ActivityGrid({ grid }: ActivityGridProps) {
  // Generate 52 weeks (364 days)
  const totalDays = 52 * 7;
  const activityMap: Record<string, number> = {};
  for (const item of grid) {
    activityMap[item.date] = item.count;
  }

  const days: { date: string; count: number }[] = [];
  const today = new Date();
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      count: activityMap[dateStr] || 0,
    });
  }

  const totalEvents = grid.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="p-6 bg-canvas border-border space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">52-Week Study Contributions</h3>
          <p className="text-xs text-muted">
            {totalEvents} total telemetry learning events recorded across the curriculum
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-surface border border-border" />
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-900" />
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" />
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500" />
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="grid grid-rows-7 grid-flow-col gap-1 w-max">
          {days.map((day, idx) => {
            const level =
              day.count === 0
                ? "bg-surface border border-border/40"
                : day.count === 1
                ? "bg-emerald-200 dark:bg-emerald-900"
                : day.count <= 3
                ? "bg-emerald-400 dark:bg-emerald-700"
                : "bg-emerald-600 dark:bg-emerald-500";

            return (
              <div
                key={idx}
                title={`${day.date}: ${day.count} events`}
                className={`w-3 h-3 rounded-xs ${level} transition-colors cursor-pointer`}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}
