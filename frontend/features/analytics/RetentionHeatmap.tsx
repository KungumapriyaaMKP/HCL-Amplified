"use client";

import { useRouter } from "next/navigation";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import { BrainCircuit, Zap } from "lucide-react";

interface RetentionItem {
  skill_id: string;
  retention: number;
}

export function RetentionHeatmap({ items }: { items: RetentionItem[] }) {
  const router = useRouter();

  if (!items || items.length === 0) {
    return (
      <Card className="p-6 bg-canvas border-border text-center space-y-2">
        <div className="flex justify-center text-muted">
          <BrainCircuit className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-sm font-semibold text-ink">
          Knowledge Retention &amp; Memory Tracker
        </h3>
        <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
          Complete your first topic or quiz to start tracking memory strength and get reminders for a quick refresher.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-canvas border-border space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-ink">Knowledge Retention</h3>
          <p className="text-xs text-muted">
            How well you remember each skill you&apos;ve completed.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-muted">Fresh (&gt;80%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-muted">Ready for Practice (50-80%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-muted">Memory Fading (&lt;50%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const r = item.retention;
          const status = r >= 0.8 ? "mastered" : r >= 0.5 ? "active" : "gap";
          const isFading = r < 0.5;
          const bgColor =
            r >= 0.8
              ? "bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
              : r >= 0.5
              ? "bg-amber-50/60 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
              : "bg-rose-50/60 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800";

          return (
            <div
              key={item.skill_id}
              className={`p-3 rounded-xl border ${bgColor} space-y-2 transition-all flex flex-col justify-between`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink capitalize truncate">
                    {item.skill_id.replace(/-/g, " ")}
                  </span>
                  <Pill variant={status}>
                    {Math.round(r * 100)}%
                  </Pill>
                </div>

                {/* Decay Bar */}
                <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      r >= 0.8 ? "bg-emerald-500" : r >= 0.5 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.round(r * 100)}%` }}
                  />
                </div>
              </div>

              {/* Actionable CTA for fading retention */}
              {isFading && (
                <button
                  type="button"
                  onClick={() => router.push("/lab")}
                  className="mt-1 w-full inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-200 text-[11px] font-semibold transition-colors cursor-pointer border border-amber-500/30"
                >
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>Quick Review</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
