import { redirect } from "next/navigation";
import { requireUserOrRedirect } from "@/lib/auth";
import { getModuleDetail } from "@/lib/moduleDetail";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { ModuleWorkspace } from "@/frontend/components/goals/ModuleWorkspace";
import { AssistantWidget } from "@/frontend/components/goals/AssistantWidget";

export default async function ModulePage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const user = await requireUserOrRedirect(`/goals/${id}/modules/${moduleId}`);
  const detail = await getModuleDetail(user.id, moduleId);
  if (!detail) redirect(`/goals/${id}`);

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  const displayName = profile?.displayName || "Learner";

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#FFF9F6] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={displayName}
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Scrollable Workspace - Full Edge-to-Edge Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen max-h-screen overflow-y-auto custom-scrollbar relative">
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
          userDisplayName={displayName}
        />
      </div>
    </div>
  );
}
