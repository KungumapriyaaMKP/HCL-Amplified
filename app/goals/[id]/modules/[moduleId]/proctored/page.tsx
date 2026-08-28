import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getModuleDetail } from "@/lib/moduleDetail";
import { Nav } from "@/frontend/components/layout/Nav";
import { ProctoredWorkspace } from "@/frontend/components/goals/ProctoredWorkspace";

export default async function ProctoredPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const user = await requireUser();
  const detail = await getModuleDetail(user.id, moduleId);
  if (!detail) redirect(`/goals/${id}`);

  return (
    <div className="min-h-screen bg-[#070913] text-white">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
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
  );
}
