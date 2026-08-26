"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPlan } from "@/lib/api/pathfinder";
import { storePlan } from "@/lib/planStore";
import { Pill } from "@/components/ui/Pill";

/**
 * Page 1 -- conversational intake with SEQUENTIAL reveal (density rule):
 * the goal is asked first, then the constraints appear, then generate.
 * Never all at once.
 */
const ROLE_CHIPS = [
  "Machine Learning Engineer",
  "AI Engineer",
  "Deep Learning Engineer",
];
const HOURS = [5, 10, 15, 20];

export function IntakeFlow() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [committed, setCommitted] = useState(false);
  const [hours, setHours] = useState(10);
  const [weeks, setWeeks] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const plan = await createPlan({
        goal,
        hours_per_week: hours,
        deadline_weeks: weeks,
        priority: "balanced",
      });
      storePlan(plan);
      router.push("/roadmap");
    } catch (e) {
      setError("Could not reach the planner. Is the backend running?");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-sm text-ink-muted">Let&apos;s map your path</p>
      <h1 className="mt-2 text-4xl font-extrabold sm:text-5xl">
        What do you want to become?
      </h1>

      {/* Step 1: the goal */}
      <div className="mt-8">
        <div className="flex gap-2">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goal.trim() && setCommitted(true)}
            placeholder="e.g. Machine Learning Engineer"
            className="flex-1 rounded-full border border-border bg-card px-5 py-3 text-ink outline-none focus:border-border-hover"
          />
          <Pill
            onClick={() => goal.trim() && setCommitted(true)}
            disabled={!goal.trim()}
          >
            Next
          </Pill>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ROLE_CHIPS.map((r) => (
            <button
              key={r}
              onClick={() => {
                setGoal(r);
                setCommitted(true);
              }}
              className="rounded-full border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors hover:border-border-hover hover:text-ink"
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: constraints -- revealed only after a goal is set */}
      <AnimatePresence>
        {committed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 space-y-6"
          >
            <div>
              <label className="text-sm font-medium">Hours per week</label>
              <div className="mt-2 flex gap-2">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHours(h)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      hours === h
                        ? "border-ink bg-pill text-pill-ink"
                        : "border-border text-ink-muted hover:border-border-hover"
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">
                Target timeframe{" "}
                <span className="text-ink-subtle">(optional)</span>
              </label>
              <div className="mt-2 flex gap-2">
                {[12, 24, 52].map((w) => (
                  <button
                    key={w}
                    onClick={() => setWeeks(weeks === w ? null : w)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      weeks === w
                        ? "border-ink bg-pill text-pill-ink"
                        : "border-border text-ink-muted hover:border-border-hover"
                    }`}
                  >
                    {w} weeks
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Pill onClick={generate} disabled={loading}>
                {loading ? "Building your roadmap…" : "Generate roadmap"}
              </Pill>
              {error && <p className="mt-3 text-sm text-gap">{error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
