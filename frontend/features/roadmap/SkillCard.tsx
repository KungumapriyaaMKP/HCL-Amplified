"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { Node } from "@/lib/api/pathfinder";
import { StatusBadge } from "./StatusBadge";

interface SkillCardProps {
  node: Node;
  onClick: () => void;
  selected: boolean;
  onSimulateStuck?: () => void;
}

export function SkillCard({
  node,
  onClick,
  selected,
  onSimulateStuck,
}: SkillCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      className="relative group"
    >
      <button
        onClick={onClick}
        className={`w-full rounded-[14px] border bg-canvas p-4 text-left transition-all cursor-pointer shadow-2xs ${
          selected
            ? "border-ink ring-1 ring-ink shadow-xs"
            : "border-border hover:border-ink/40 hover:shadow-xs"
        } ${
          node.is_remediation
            ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 border-dashed ring-1 ring-amber-300/60"
            : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <span className="font-semibold text-sm text-ink leading-tight">
              {node.skill_name}
            </span>
            {node.resource?.provider && (
              <span className="block text-[11px] text-muted capitalize">
                {node.resource.provider}
              </span>
            )}
          </div>
          <StatusBadge status={node.status} />
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          {node.resource?.difficulty && (
            <span className="capitalize">{node.resource.difficulty}</span>
          )}
          <span className="font-mono">{node.duration_display || `~${node.estimated_hours}h`}</span>
          {node.gap_delta > 0 && (
            <span className="text-emerald-600 font-medium">Gap ↓ {node.gap_delta}%</span>
          )}
        </div>

        {node.is_remediation && (
          <div className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-800/40 flex items-center justify-between text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span>↳ Prerequisite Refresher</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 dark:bg-amber-800 px-1.5 py-0.5 rounded">
              Detour
            </span>
          </div>
        )}
      </button>

      {/* Quick Test Stuck Simulation CTA on active/next nodes */}
      {!node.is_remediation && onSimulateStuck && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSimulateStuck();
          }}
          title="Simulate two low quiz scores to trigger D6 adaptive detour"
          className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-900 border border-amber-300 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full shadow-xs cursor-pointer z-10 inline-flex items-center gap-1"
        >
          <Zap className="w-2.5 h-2.5" />
          <span>Simulate Blockage</span>
        </button>
      )}
    </motion.div>
  );
}
