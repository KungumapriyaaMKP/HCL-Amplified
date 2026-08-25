"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/frontend/components/layout/Nav";
import { Card } from "@/frontend/components/ui/Card";
import { Button } from "@/frontend/components/ui/Button";
import { Textarea } from "@/frontend/components/ui/Input";
import { DOMAINS, TRACK_PACES } from "@/data/domains";

export default function NewGoalPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [domain, setDomain] = useState<string | null>(null);
  const [trackPace, setTrackPace] = useState<string | null>(null);
  const [goalText, setGoalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createGoal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, trackPace, goalText }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not create goal");
      router.push(`/goals/${body.goal.id}/setup`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-accent">Step {step + 1} of 3</p>
        <h1 className="mb-6 text-2xl font-semibold">Set a new learning goal</h1>

        {step === 0 && (
          <Card className="p-6">
            <p className="mb-4 text-sm text-muted">Which domain is this goal in?</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {DOMAINS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDomain(d.id)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    domain === d.id ? "border-accent bg-accent/10" : "border-border bg-surface-2 hover:border-accent/40"
                  }`}
                >
                  <div className="mb-1 text-2xl">{d.icon}</div>
                  <div className="text-sm font-medium">{d.name}</div>
                </button>
              ))}
            </div>
            <Button className="mt-6" disabled={!domain} onClick={() => setStep(1)}>
              Continue
            </Button>
          </Card>
        )}

        {step === 1 && (
          <Card className="p-6">
            <p className="mb-4 text-sm text-muted">What pace do you want?</p>
            <div className="space-y-3">
              {TRACK_PACES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTrackPace(t.id)}
                  className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                    trackPace === t.id ? "border-accent bg-accent/10" : "border-border bg-surface-2 hover:border-accent/40"
                  }`}
                >
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted">{t.description}</div>
                  </div>
                  <span className="text-xs text-muted">~{t.hoursPerWeek}h/wk</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="secondary" onClick={() => setStep(0)}>Back</Button>
              <Button disabled={!trackPace} onClick={() => setStep(2)}>Continue</Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6">
            <p className="mb-4 text-sm text-muted">In your own words, what do you want to be able to do?</p>
            <Textarea
              rows={4}
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g. I want to become job-ready as a frontend developer in the next few months"
            />
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            <div className="mt-6 flex gap-2">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={goalText.trim().length < 5 || loading} onClick={createGoal}>
                {loading ? "Creating..." : "Continue"}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
