import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getGoalDetail } from "@/lib/goalData";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Nav } from "@/frontend/components/layout/Nav";
import { Card } from "@/frontend/components/ui/Card";
import { ProgressBar } from "@/frontend/components/ui/progress-bar";
import { ModuleCard } from "@/frontend/components/goals/ModuleCard";
import { AssistantWidget } from "@/frontend/components/goals/AssistantWidget";
import { DOMAINS } from "@/data/domains";
import { DomainIcon } from "@/frontend/components/ui/DomainIcon";
import { IconArrowRight, IconCheck, IconLayersLinked } from "@tabler/icons-react";

const CHAPTER_HEADINGS: Record<string, { title: string; subtitle: string }> = {
  foundation: { title: "FOUNDATION MILESTONES", subtitle: "Prerequisites & Core Foundations" },
  core: { title: "CORE CURRICULUM", subtitle: "Primary Competencies & Practical Modules" },
  remediation: { title: "REMEDIATION MODULES", subtitle: "Targeted Reinforcement Paths" },
  capstone: { title: "CAPSTONE EVALUATION", subtitle: "Comprehensive Assessment & Capstone Project" },
};

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
    <div className="min-h-screen bg-[#070913] text-white">
      <Nav displayName={profile?.displayName} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        
        {/* Breadcrumb / Domain Tag */}
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs font-black text-purple-300 uppercase tracking-widest">
            <DomainIcon id={domain?.id} className="h-4 w-4 text-purple-400" />
            <span>{domain?.name}</span>
          </p>
          <Link
            href={`/goals/${id}/graph`}
            className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 text-xs font-bold text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-900/80 hover:scale-105"
          >
            <span>View Topological Skill Tree</span>
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Goal Title */}
        <h1 className="mb-5 text-3xl font-black text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.2)]">
          {detail.goal.goalText}
        </h1>

        {/* Goal Progress Banner */}
        <div className="mb-8 rounded-lg border-2 border-purple-500/30 bg-[#0c1026]/90 p-5 shadow-[0_0_30px_rgba(139,92,246,0.2)] backdrop-blur-2xl">
          <div className="mb-2 flex items-center justify-between text-xs font-black">
            <span className="text-slate-300 flex items-center gap-1.5">
              <IconCheck className="h-4 w-4 text-emerald-400" />
              <span>{completed} of {detail.modules.length} Milestones Cleared</span>
            </span>
            <span className="text-purple-300 font-extrabold">{Math.round(pct)}% Completed</span>
          </div>
          <ProgressBar value={pct} variant="purple" />
        </div>

        {/* Milestone Chapters */}
        <div className="space-y-8">
          {groupOrder.map((group) => {
            const heading = CHAPTER_HEADINGS[group] ?? { title: group.toUpperCase(), subtitle: "" };
            return (
              <div key={group} className="rounded-lg border border-purple-500/20 bg-[#0a0e22]/60 p-5 sm:p-6 backdrop-blur-xl">
                <div className="mb-4">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-purple-300 flex items-center gap-2">
                    <IconLayersLinked className="h-4 w-4 text-purple-400" />
                    <span>{heading.title}</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">{heading.subtitle}</p>
                </div>
                <div className="space-y-3">
                  {groups[group].map((m) => (
                    <ModuleCard key={m.module.id} item={m} goalId={id} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </main>
      <AssistantWidget goalId={id} />
    </div>
  );
}
