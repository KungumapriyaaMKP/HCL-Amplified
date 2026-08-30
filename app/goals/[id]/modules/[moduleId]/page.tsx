import { redirect } from "next/navigation";
import { requireUserOrRedirect } from "@/lib/auth";
import { getModuleDetail } from "@/lib/moduleDetail";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTotalXp, levelForXp, levelTitle } from "@/lib/gamification";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { ModuleWorkspace } from "@/frontend/components/goals/ModuleWorkspace";
import { AssistantWidget } from "@/frontend/components/goals/AssistantWidget";

export default async function ModulePage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const user = await requireUserOrRedirect(`/goals/${id}/modules/${moduleId}`);
  const detail = await getModuleDetail(user.id, moduleId);
  if (!detail) redirect(`/goals/${id}`);

  let displayName = "Learner";
  let totalXp = 0;

  try {
    const [profileResult, xpResult] = await Promise.all([
      db.select().from(profiles).where(eq(profiles.userId, user.id)),
      getTotalXp(user.id),
    ]);
    const [profile] = profileResult;
    if (profile?.displayName) displayName = profile.displayName;
    totalXp = xpResult || 0;
  } catch (_err) {}

  const userLevel = levelForXp(totalXp);
  const userLevelTitle = levelTitle(userLevel.level);

  return (
    <div className="flex h-screen max-h-screen overflow-hidden bg-[#FDFBF7] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={displayName}
        level={userLevel.level}
        levelTitle={userLevelTitle}
        activeGoalId={id}
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
        />
      </div>
    </div>
  );
}
