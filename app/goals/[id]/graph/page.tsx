import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getGoalDetail } from "@/lib/goalData";
import { getMasteryMap } from "@/lib/adapt";
import { domainSkillGraph, resolveGoalSkills, requiredSkillSet } from "@/lib/skillGraph";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Nav } from "@/frontend/components/layout/Nav";
import { Card } from "@/frontend/components/ui/Card";
import { SkillGraphView, SkillGraphLegend } from "@/frontend/components/goals/SkillGraphView";
import { DOMAINS } from "@/data/domains";
import Link from "next/link";

export default async function SkillGraphPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const detail = await getGoalDetail(user.id, id);
  if (!detail) redirect("/dashboard");

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  const domain = DOMAINS.find((d) => d.id === detail.goal.domain);

  const subFocus = (detail.goal.subFocus ?? {}) as { tags?: string[] };
  const targetSkillIds = new Set(resolveGoalSkills(detail.goal.domain, detail.goal.goalText, subFocus.tags ?? []));
  const requiredSkillIds = requiredSkillSet([...targetSkillIds]);
  const mastery = await getMasteryMap(user.id);
  const { nodes, edges } = domainSkillGraph(detail.goal.domain);

  return (
    <div>
      <Nav displayName={profile?.displayName} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link href={`/goals/${id}`} className="mb-2 inline-block text-sm text-muted hover:text-foreground">
          ‹ Back to roadmap
        </Link>
        <p className="text-xs text-muted">{domain?.icon} {domain?.name} knowledge graph</p>
        <h1 className="mb-1 text-2xl font-semibold">{detail.goal.goalText}</h1>
        <p className="mb-6 text-sm text-muted">
          Every skill in this domain and how it depends on the others - this is the same prerequisite graph the
          recommendation engine runs skill-gap analysis over to build your roadmap, colored by your current mastery.
        </p>

        <Card className="mb-4 p-4">
          <SkillGraphLegend />
        </Card>

        <SkillGraphView
          nodes={nodes}
          edges={edges}
          masteryBySkill={mastery}
          targetSkillIds={targetSkillIds}
          requiredSkillIds={requiredSkillIds}
        />
      </main>
    </div>
  );
}
