"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PlanResponse, Node } from "@/lib/api/pathfinder";
import { insertDetour } from "@/lib/api/pathfinder";
import { emitNudge } from "@/lib/mentorBus";
import { SkillCard } from "./SkillCard";
import { ExplanationPanel } from "./ExplanationPanel";
import { DetourBanner } from "../adapt/DetourBanner";
import { RelaxerBanner } from "./RelaxerBanner";

interface RoadmapBoardProps {
  plan: PlanResponse;
  onPlanUpdated: (p: PlanResponse) => void;
}

export function RoadmapBoard({ plan, onPlanUpdated }: RoadmapBoardProps) {
  const [selected, setSelected] = useState<Node | null>(null);
  const [detourInfo, setDetourInfo] = useState<{
    blockedSkillName: string;
    bridgeSkillName: string;
    rationale: string;
  } | null>(null);

  const handleSimulateStuck = async (node: Node) => {
    try {
      const res = await insertDetour(node.skill_id, plan.goal);
      if (res.success && res.plan) {
        onPlanUpdated(res.plan);
        setDetourInfo({
          blockedSkillName: node.skill_name,
          bridgeSkillName: res.bridge_skill_name || "Prerequisite Concept",
          rationale: res.rationale || "Inserted prerequisite bridge refresher.",
        });
        emitNudge("progress");
      }
    } catch (err) {
      console.error("Failed to insert detour:", err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      {/* S9 Relaxer Optimizer */}
      <RelaxerBanner
        plan={plan}
        onPlanUpdated={onPlanUpdated}
      />

      {/* S4 Detour Money-shot Banner */}
      <AnimatePresence>
        {detourInfo && (
          <DetourBanner
            blockedSkillName={detourInfo.blockedSkillName}
            bridgeSkillName={detourInfo.bridgeSkillName}
            rationale={detourInfo.rationale}
            onDismiss={() => setDetourInfo(null)}
          />
        )}
      </AnimatePresence>

      {/* 4 Phase Columns with Framer Layout Springs */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 items-start">
        {plan.milestones.map((m) => (
          <motion.div
            layout
            key={m.phase}
            className="flex flex-col gap-3 bg-surface/30 p-3 rounded-2xl border border-border/60"
          >
            <div className="flex items-baseline justify-between px-1">
              <h2 className="font-bold text-sm text-ink">{m.title}</h2>
              <span className="text-xs font-mono text-muted">{m.total_hours}h</span>
            </div>

            <motion.div layout className="space-y-3">
              {m.nodes.map((n) => (
                <SkillCard
                  key={`${n.skill_id}-${n.order}`}
                  node={n}
                  selected={selected?.skill_id === n.skill_id}
                  onClick={() => setSelected(n)}
                  onSimulateStuck={() => handleSimulateStuck(n)}
                />
              ))}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Explanation Side Panel */}
      <AnimatePresence>
        {selected && (
          <ExplanationPanel node={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
