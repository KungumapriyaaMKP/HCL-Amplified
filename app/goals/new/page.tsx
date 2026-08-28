"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/frontend/components/layout/Nav";
import { Card } from "@/frontend/components/ui/Card";
import { Button } from "@/frontend/components/ui/Button";
import { Textarea } from "@/frontend/components/ui/Input";
import { DOMAINS, TRACK_PACES } from "@/data/domains";
import { DomainIcon } from "@/frontend/components/ui/DomainIcon";
import { IconCheck, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";

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
      setError(err instanceof Error ? err.message : "Something went wrong creating goal");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070913] text-white">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        
        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400">
              GOAL SETUP · STEP {step + 1} OF 3
            </span>
            <h1 className="mt-1 text-2xl font-black text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
              Set a New Learning Goal
            </h1>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-sm transition-all ${
                  i <= step ? "bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_8px_#a855f7]" : "bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 0: Domain Selection */}
        {step === 0 && (
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-white">Select Domain</h2>
              <p className="text-xs text-slate-400">Which discipline do you wish to master?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
              {DOMAINS.map((d) => {
                const selected = domain === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDomain(d.id)}
                    className={`group relative flex flex-col items-start rounded-md border p-4 text-left transition-all duration-200 ${
                      selected
                        ? "border-purple-400 bg-purple-950/70 shadow-[0_0_20px_rgba(168,85,247,0.4)] ring-1 ring-purple-400/50"
                        : "border-purple-500/20 bg-[#0d1226]/80 hover:border-purple-500/50 hover:bg-[#121838]"
                    }`}
                  >
                    <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-md bg-purple-950/60 border border-purple-500/30 text-purple-400 transition-transform group-hover:scale-110">
                      <DomainIcon id={d.id} className="h-6 w-6" />
                    </div>
                    <div className="text-sm font-bold text-white group-hover:text-purple-300">{d.name}</div>
                    {selected && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-sm bg-purple-500 text-[10px] font-black text-white">
                        <IconCheck className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <Button disabled={!domain} onClick={() => setStep(1)} size="lg">
                <span>Continue to Pace</span>
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 1: Pace Selection */}
        {step === 1 && (
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-white">Choose Learning Pace</h2>
              <p className="text-xs text-slate-400">How many hours per week will you dedicate to this goal?</p>
            </div>

            <div className="space-y-3">
              {TRACK_PACES.map((t) => {
                const selected = trackPace === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTrackPace(t.id)}
                    className={`flex w-full items-center justify-between rounded-md border p-4 text-left transition-all duration-200 ${
                      selected
                        ? "border-cyan-400 bg-cyan-950/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400/50"
                        : "border-purple-500/20 bg-[#0d1226]/80 hover:border-purple-500/40 hover:bg-[#121838]"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{t.description}</div>
                    </div>
                    <span className="rounded-sm border border-cyan-500/40 bg-cyan-950/80 px-3 py-1 text-xs font-black text-cyan-300">
                      ~{t.hoursPerWeek} hrs/wk
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <Button variant="secondary" onClick={() => setStep(0)}>
                <IconArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button disabled={!trackPace} onClick={() => setStep(2)} size="lg">
                <span>Define Objective</span>
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: Goal Text */}
        {step === 2 && (
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold text-white">State Your Target Objective</h2>
              <p className="text-xs text-slate-400">Describe what you want to achieve. Claude AI will parse your goal into an exact topological skill DAG.</p>
            </div>

            <Textarea
              rows={4}
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g. I want to master Full-Stack Web Application Engineering and build production-ready software."
              className="text-sm font-medium"
            />

            {error && (
              <div className="mt-3 rounded-md border border-red-500/40 bg-red-950/60 p-3 text-xs font-bold text-red-300">
                {error}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button variant="secondary" onClick={() => setStep(1)}>
                <IconArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button
                disabled={goalText.trim().length < 5 || loading}
                onClick={createGoal}
                size="lg"
              >
                <span>{loading ? "Creating Goal..." : "Initiate Diagnostic Intake"}</span>
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

      </main>
    </div>
  );
}
