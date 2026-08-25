import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="text-sm text-ink-muted">Scaffold check</p>
      <h1 className="mt-2 text-5xl font-extrabold">Pathfinder</h1>
      <p className="mt-4 max-w-xl text-ink-muted">
        Turn a career goal into a prerequisite-aware, explainable learning
        roadmap.
      </p>

      <Card className="mt-10 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-mastered-bg px-3 py-1 text-xs font-medium text-mastered">
            Mastered
          </span>
          <span className="rounded-full bg-active-bg px-3 py-1 text-xs font-medium text-active">
            Active
          </span>
          <span className="rounded-full bg-at-risk-bg px-3 py-1 text-xs font-medium text-at-risk">
            At risk
          </span>
          <span className="rounded-full bg-gap-bg px-3 py-1 text-xs font-medium text-gap">
            Gap
          </span>
        </div>
        <div className="mt-6">
          <Pill>Continue</Pill>
        </div>
      </Card>
    </main>
  );
}
