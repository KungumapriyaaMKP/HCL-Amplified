import { redirect } from "next/navigation";
import { requireUserOrRedirect } from "@/lib/auth";
import { getGoalDetail } from "@/lib/goalData";
import { getMasteryMap } from "@/lib/adapt";
import { domainSkillGraph, resolveGoalSkills, requiredSkillSet } from "@/lib/skillGraph";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { SkillGraphView, SkillGraphLegend } from "@/frontend/components/goals/SkillGraphView";
import { AssistantWidget } from "@/frontend/components/goals/AssistantWidget";
import { DOMAINS } from "@/data/domains";
import Link from "next/link";
import { IconArrowLeft, IconLayersLinked } from "@tabler/icons-react";

export default async function SkillGraphPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUserOrRedirect(`/goals/${id}/graph`);
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
    <div className="flex min-h-screen bg-[#FFF9F6] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={profile?.displayName || "Yuvi"}
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen custom-scrollbar">
        <main className="mx-auto w-full max-w-5xl px-6 py-8 sm:px-10 space-y-6">
          
          {/* Back to Quest Roadmap */}
          <div>
            <Link
              href={`/goals/${id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white border border-purple-200 text-xs font-bold text-[#6D28D9] shadow-2xs hover:bg-purple-50 hover:border-purple-300 transition-all group"
            >
              <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Quest Roadmap</span>
            </Link>
          </div>

          {/* Header Title Section */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xs bg-purple-100/90 text-purple-800 text-[11px] font-black uppercase tracking-wider">
                <IconLayersLinked className="w-3.5 h-3.5 text-[#6D28D9]" />
                <span>{domain?.name || "Web Development"} Topological Skill Tree</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {detail.goal.goalText}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed font-medium">
              Interactive topological constellation of prerequisite skills, competencies, and dependencies dynamically updated by diagnostic and battle evaluations.
            </p>
          </div>

          {/* Legend Card */}
          <div className="rounded-sm border border-purple-100 bg-white/95 p-4 shadow-sm backdrop-blur-md">
            <SkillGraphLegend />
          </div>

          {/* Interactive Skill Graph View */}
          <SkillGraphView
            goalId={id}
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
