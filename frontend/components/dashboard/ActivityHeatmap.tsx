import { Card } from "@/frontend/components/ui/card";
import type { DashboardData } from "@/lib/dashboardData";

// Sequential magnitude encoding (how much activity, not which category): one
// hue (the app's existing accent), monotone intensity light -> dark/opaque.
// 0 activity gets the plain surface color, not a step on the ramp - "nothing
// happened" is a different signal than "the least that still counts".
const TIER_CLASSES = ["bg-surface-2", "bg-accent/20", "bg-accent/45", "bg-accent/70", "bg-accent"];

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

/**
 * GitHub-style contribution heatmap over learning_events - each cell is one
 * day, colored by how many events happened that day. Hover (native title,
 * so it's keyboard/screen-reader reachable with zero extra JS) shows the
 * date, event count, and which skills were touched - the relief channel so
 * meaning never rides on color shade alone.
 */
export function ActivityHeatmap({ activity }: { activity: DashboardData["activity"] }) {
  if (activity.every((d) => d.count === 0)) {
    return (
      <Card className="p-5">
        <h3 className="mb-1 text-sm font-semibold">Learning activity</h3>
        <p className="text-sm text-muted">No learning activity logged yet - it fills in as you work through modules.</p>
      </Card>
    );
  }

  // Pad the front so the grid's columns are real weeks (Sun..Sat rows),
  // with today landing in the last column rather than wherever it happens
  // to fall.
  const firstDow = new Date(activity[0].date + "T00:00:00").getDay();
  const padded = [...Array.from({ length: firstDow }, () => null), ...activity];
  const weeks: (DashboardData["activity"][number] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  return (
    <Card className="p-5">
      <h3 className="mb-3 text-sm font-semibold">Learning activity</h3>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                title={
                  day
                    ? `${formatDate(day.date)} - ${day.count} event${day.count === 1 ? "" : "s"}${
                        day.skillNames.length ? ` (${day.skillNames.join(", ")})` : ""
                      }`
                    : undefined
                }
                className={`h-[13px] w-[13px] rounded-[3px] ${day ? TIER_CLASSES[tierFor(day.count)] : "bg-transparent"}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <span>Less</span>
        {TIER_CLASSES.map((c, i) => <div key={i} className={`h-[11px] w-[11px] rounded-[3px] ${c}`} />)}
        <span>More</span>
      </div>
    </Card>
  );
}
