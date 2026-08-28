import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getGoalDetail } from "@/lib/goalData";
import { getMasteryMap } from "@/lib/adapt";
import { domainSkillGraph, resolveGoalSkills, requiredSkillSet } from "@/lib/skillGraph";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
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
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={profile?.displayName || "Yuvi"}
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen bg-[#070913] text-white">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <Link href={`/goals/${id}`} className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300">
            <span>❮</span> Back to Quest Roadmap
          </Link>
          
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
              {domain?.icon} {domain?.name} TOPOLOGICAL SKILL TREE
            </span>
          </div>

          <h1 className="mb-2 text-3xl font-black text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
            {detail.goal.goalText}
          </h1>
          <p className="mb-6 text-xs text-slate-400 max-w-2xl">
            Visual DAG of prerequisites and skill gap dependencies, dynamically updated by proctored battle attempts and diagnostic evaluations.
          </p>

          <div className="mb-5 rounded-none border border-purple-500/20 bg-[#0c1026]/90 p-4 backdrop-blur-xl">
            <SkillGraphLegend />
          </div>

          <SkillGraphView
            nodes={nodes}
            edges={edges}
            masteryBySkill={mastery}
            targetSkillIds={targetSkillIds}
            requiredSkillIds={requiredSkillIds}
          />
        </main>
      </div>
    </div>
  );
}
