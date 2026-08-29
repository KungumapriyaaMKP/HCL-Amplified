import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getGoalDetail } from "@/lib/goalData";
import { db } from "@/lib/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/frontend/components/layout/AppSidebar";
import { JourneyMapView } from "@/frontend/components/goals/JourneyMapView";
import { AssistantWidget } from "@/frontend/components/goals/AssistantWidget";
import { DOMAINS } from "@/data/domains";

export default async function GoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const detail = await getGoalDetail(user.id, id);
  if (!detail) redirect("/dashboard");
  if (!detail.path) redirect(`/goals/${id}/setup`);

  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
  const domain = DOMAINS.find((d) => d.id === detail.goal.domain);

  return (
    <div className="flex min-h-screen bg-[#FDFCFE] text-slate-900 font-sans">
      {/* 1. Left Sidebar Navigation */}
      <AppSidebar
        displayName={profile?.displayName || "Yuvi"}
        level={1}
        levelTitle="Newcomer"
      />

      {/* 2. Main 3D Journey Road Map Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <JourneyMapView
          goalId={id}
          goalTitle={detail.goal.goalText}
          domainName={domain?.name || "Web Development"}
          modules={detail.modules as any}
          userDisplayName={profile?.displayName || "Yuvi"}
        />
        <AssistantWidget goalId={id} />
      </div>
    </div>
  );
}
