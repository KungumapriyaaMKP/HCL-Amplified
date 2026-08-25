import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getGoalDetail } from "@/lib/goalData";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Nav } from "@/components/layout/Nav";
import { Card, ProgressBar } from "@/components/ui/Card";
import { ModuleCard } from "@/components/goals/ModuleCard";
import { AssistantWidget } from "@/components/goals/AssistantWidget";
import { DOMAINS } from "@/data/domains";

export default async function GoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const detail = await getGoalDetail(user.id, id);
  if (!detail) redirect("/dashboard");
  if (!detail.path) redirect(`/goals/${id}/setup`);

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  const domain = DOMAINS.find((d) => d.id === detail.goal.domain);
  const completed = detail.modules.filter((m) => m.module.status === "completed").length;
  const pct = detail.modules.length ? (completed / detail.modules.length) * 100 : 0;

  const groups: Record<string, typeof detail.modules> = {};
  for (const m of detail.modules) {
    (groups[m.module.milestoneType] ??= []).push(m);
  }
  const order = ["foundation", "core", "remediation", "capstone"];
  const groupOrder = Object.keys(groups).sort((a, b) => order.indexOf(a) - order.indexOf(b));

  return (
    <div>
      <Nav displayName={profile?.displayName} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">{domain?.icon} {domain?.name}</p>
          <Link href={`/goals/${id}/graph`} className="text-xs font-medium text-accent hover:underline">
            View skill graph →
          </Link>
        </div>
        <h1 className="mb-4 text-2xl font-semibold">{detail.goal.goalText}</h1>
        <Card className="mb-8 p-4">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>{completed}/{detail.modules.length} modules complete</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <ProgressBar value={pct} />
        </Card>

        <div className="space-y-8">
          {groupOrder.map((group) => (
            <div key={group}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{group}</h2>
              <div className="space-y-3">
                {groups[group].map((m) => (
                  <ModuleCard key={m.module.id} item={m} goalId={id} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <AssistantWidget goalId={id} />
    </div>
  );
}
