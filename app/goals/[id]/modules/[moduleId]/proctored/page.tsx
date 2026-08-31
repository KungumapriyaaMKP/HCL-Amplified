import { redirect } from "next/navigation";
import { requireUserOrRedirect } from "@/lib/auth";
import { getModuleDetail } from "@/lib/moduleDetail";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { ProctoredWorkspace } from "@/frontend/components/goals/ProctoredWorkspace";

export default async function ProctoredPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const user = await requireUserOrRedirect(`/goals/${id}/modules/${moduleId}/proctored`);
  const detail = await getModuleDetail(user.id, moduleId);
  if (!detail) redirect(`/goals/${id}`);

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  const displayName = profile?.displayName || "Learner";

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={displayName}
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto bg-[#F8F9FD] text-slate-900 justify-center items-center py-6">
        <main className="w-full max-w-5xl px-4 sm:px-6">
          <ProctoredWorkspace
            goalId={id}
            moduleId={moduleId}
            skillName={detail.skill.name}
            alreadyTaken={!!detail.proctoredAttempt?.submittedAt}
            initialScore={detail.proctoredAttempt?.score ?? null}
            initialReport={detail.proctoredAttempt?.reportText ?? null}
            userDisplayName={displayName}
          />
        </main>
      </div>
    </div>
  );
}
