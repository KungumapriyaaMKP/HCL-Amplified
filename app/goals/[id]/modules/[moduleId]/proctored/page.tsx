import { redirect } from "next/navigation";
import { requireUserOrRedirect } from "@/lib/auth";
import { getModuleDetail } from "@/lib/moduleDetail";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { ProctoredWorkspace } from "@/frontend/components/goals/ProctoredWorkspace";

export default async function ProctoredPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const user = await requireUserOrRedirect(`/goals/${id}/modules/${moduleId}/proctored`);
  const detail = await getModuleDetail(user.id, moduleId);
  if (!detail) redirect(`/goals/${id}`);

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName="Yuvi"
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen bg-[#F8F9FD] text-slate-900">
        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
          <ProctoredWorkspace
            goalId={id}
            moduleId={moduleId}
            skillName={detail.skill.name}
            alreadyTaken={!!detail.proctoredAttempt?.submittedAt}
            initialScore={detail.proctoredAttempt?.score ?? null}
            initialReport={detail.proctoredAttempt?.reportText ?? null}
          />
        </main>
      </div>
    </div>
  );
}
