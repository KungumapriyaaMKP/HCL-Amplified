import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getModuleDetail } from "@/lib/moduleDetail";
import { Nav } from "@/frontend/components/layout/Nav";
import { CompilerWorkspace } from "@/frontend/components/goals/CompilerWorkspace";
import { AssistantWidget } from "@/frontend/components/goals/AssistantWidget";

export default async function CompilerPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const user = await requireUser();
  const detail = await getModuleDetail(user.id, moduleId);
  if (!detail || !detail.module.isProgramming || !detail.module.programmingLanguage) redirect(`/goals/${id}`);

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-xl font-semibold">Practice compiler</h1>
        <CompilerWorkspace moduleId={moduleId} skillName={detail.skill.name} language={detail.module.programmingLanguage} />
      </main>
      <AssistantWidget goalId={id} moduleId={moduleId} />
    </div>
  );
}
