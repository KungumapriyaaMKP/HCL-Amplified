import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getModuleDetail } from "@/lib/moduleDetail";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { ModuleWorkspace } from "@/frontend/components/goals/ModuleWorkspace";
import { AssistantWidget } from "@/frontend/components/goals/AssistantWidget";

export default async function ModulePage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const user = await requireUser();
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
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-8">
          <ModuleWorkspace
            goalId={id}
            moduleId={moduleId}
            skillName={detail.skill.name}
            resourceTitle={detail.resource.title}
            resourceUrl={detail.resource.url}
            resourceType={detail.resource.type}
            resourceProvider={detail.resource.provider}
            estimatedMinutes={detail.resource.estimatedMinutes}
            rationale={detail.module.rationale}
            isProgramming={detail.module.isProgramming}
            programmingLanguage={detail.module.programmingLanguage}
            hasResourceDone={detail.hasResourceDone}
            hasPracticeAttempt={detail.hasPracticeAttempt}
            proctoredAlreadyTaken={!!detail.proctoredAttempt?.submittedAt}
            proctoredScore={detail.proctoredAttempt?.score ?? null}
            proctoredReport={detail.proctoredAttempt?.reportText ?? null}
          />
        </main>
        <AssistantWidget goalId={id} moduleId={moduleId} />
      </div>
    </div>
  );
}
