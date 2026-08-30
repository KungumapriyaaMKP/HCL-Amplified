import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/auth";
import { getModuleDetail } from "@/lib/moduleDetail";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { CompilerWorkspace } from "@/frontend/components/goals/CompilerWorkspace";
import { AssistantWidget } from "@/frontend/components/goals/AssistantWidget";
import { IconArrowLeft } from "@tabler/icons-react";

export default async function CompilerPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const user = await requireUserOrRedirect(`/goals/${id}/modules/${moduleId}/compiler`);
  const detail = await getModuleDetail(user.id, moduleId);
  if (!detail || !detail.module.isProgramming || !detail.module.programmingLanguage) redirect(`/goals/${id}`);

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName="Yuvi"
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen bg-[#070913] text-white">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <Link href={`/goals/${id}/modules/${moduleId}`} className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300">
            <IconArrowLeft className="h-4 w-4" />
            <span>Back to Module</span>
          </Link>
          <div className="mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
              CODE LAB & COMPILER ENVIRONMENT
            </span>
            <h1 className="mt-1 text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
              {detail.skill.name} Practice Challenges
            </h1>
          </div>
          <CompilerWorkspace moduleId={moduleId} skillName={detail.skill.name} language={detail.module.programmingLanguage} />
        </main>
      </div>
    </div>
  );
}
