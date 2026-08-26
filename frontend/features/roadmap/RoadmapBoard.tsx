"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { PlanResponse, Node } from "@/lib/api/pathfinder";
import { SkillCard } from "./SkillCard";
import { ExplanationPanel } from "./ExplanationPanel";

/**
 * Page 3 -- the four phase columns. A fixed-column CSS grid, not a free-form
 * graph (the mockup is columnar). Clicking a card opens the D5 panel.
 */
export function RoadmapBoard({ plan }: { plan: PlanResponse }) {
  const [selected, setSelected] = useState<Node | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {plan.milestones.map((m) => (
          <div key={m.phase} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="font-bold">{m.title}</h2>
              <span className="text-xs text-ink-subtle">{m.total_hours}h</span>
            </div>
            {m.nodes.map((n) => (
              <SkillCard
                key={`${n.skill_id}-${n.order}`}
                node={n}
                selected={selected?.skill_id === n.skill_id}
                onClick={() => setSelected(n)}
              />
            ))}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <ExplanationPanel node={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
