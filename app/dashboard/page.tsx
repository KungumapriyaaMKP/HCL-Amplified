import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboardData";
import { Nav } from "@/frontend/components/layout/Nav";
import { GamificationHeader } from "@/frontend/components/dashboard/GamificationHeader";
import { GoalCard } from "@/frontend/components/dashboard/GoalCard";
import { MasteryChart } from "@/frontend/components/dashboard/MasteryChart";
import { AdaptationFeed } from "@/frontend/components/dashboard/AdaptationFeed";
import { ReminderBanner } from "@/frontend/components/dashboard/ReminderBanner";
import { ActivityHeatmap } from "@/frontend/components/dashboard/ActivityHeatmap";
import { SkillDecayHeatmap } from "@/frontend/components/dashboard/SkillDecayHeatmap";
import { LinkButton } from "@/frontend/components/ui/Button";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);

  return (
    <div>
      <Nav displayName={data.profile?.displayName} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back{data.profile ? `, ${data.profile.displayName}` : ""}</h1>
            <p className="text-sm text-muted">Here&apos;s where every one of your learning goals stands.</p>
          </div>
          <LinkButton href="/goals/new">+ New goal</LinkButton>
        </div>

        <ReminderBanner goals={data.goals} streak={data.gamification.streak} disengagement={data.disengagement} />

        <div className="mb-6">
          <GamificationHeader gamification={data.gamification} />
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-muted">Your goals</h2>
          {data.goals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="mb-3 text-muted">You don&apos;t have any learning goals yet.</p>
              <LinkButton href="/goals/new">Set your first goal</LinkButton>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.goals.map((g) => (
                <GoalCard key={g.id} goal={g} />
              ))}
            </div>
          )}
        </div>

        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <MasteryChart mastery={data.mastery} />
          <SkillDecayHeatmap decay={data.decay} reviewSuggestions={data.reviewSuggestions} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ActivityHeatmap activity={data.activity} />
          <AdaptationFeed adaptations={data.adaptations} />
        </div>
      </main>
    </div>
  );
}
