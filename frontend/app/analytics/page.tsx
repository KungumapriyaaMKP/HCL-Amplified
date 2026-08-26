"use client";

import { useEffect, useState } from "react";
import { getHistory, HistoryResponse } from "@/lib/api/pathfinder";
import { PoincareDisk } from "@/features/analytics/PoincareDisk";
import { RetentionHeatmap } from "@/features/analytics/RetentionHeatmap";
import { ActivityGrid } from "@/features/analytics/ActivityGrid";
import { GapClosureTrend } from "@/features/analytics/GapClosureTrend";

export default function AnalyticsPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getHistory();
        setHistory(res);
      } catch (e) {
        console.error("Failed to load history analytics:", e);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* Page Header */}
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted">
            Your Progress
          </span>
          <h1 className="text-3xl font-extrabold text-ink tracking-tight">
            Learning Analytics
          </h1>
          <p className="text-sm text-muted">
            See your skill map, how well you&apos;re retaining what you&apos;ve learned, and your study activity over time.
          </p>
        </div>

        {/* 1. Dark Inset Panel: Knowledge Constellation */}
        <PoincareDisk />

        {/* 2. Knowledge Retention Tracker */}
        <RetentionHeatmap items={history?.retention_summary || []} />

        {/* 3. 52-Week Activity Grid */}
        <ActivityGrid grid={history?.activity_grid || []} />

        {/* 4. Gap-Closure Trend */}
        <GapClosureTrend
          savedPlans={history?.saved_plans || []}
          skillsStudiedCount={history?.retention_summary?.length || 0}
        />
      </main>
    </div>
  );
}
