"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Pill } from "@/components/ui/Pill";

interface DetourBannerProps {
  blockedSkillName: string;
  bridgeSkillName: string;
  rationale: string;
  onDismiss: () => void;
}

export function DetourBanner({
  blockedSkillName,
  bridgeSkillName,
  rationale,
  onDismiss,
}: DetourBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl shadow-sm flex items-start justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Adaptive Remediation Spliced
            </span>
            <Pill variant="active">Prerequisite Bridge</Pill>
          </div>
          <p className="text-xs text-ink font-semibold">
            Blocked on <span className="underline decoration-amber-400">{blockedSkillName}</span>. Inserted refresher module for <span className="font-bold text-amber-900 dark:text-amber-200">{bridgeSkillName}</span>.
          </p>
          <p className="text-[11px] text-muted">{rationale}</p>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="text-muted hover:text-ink text-xs px-2.5 py-1 rounded-lg border border-border bg-canvas hover:bg-surface transition-colors shrink-0 cursor-pointer"
      >
        Dismiss
      </button>
    </motion.div>
  );
}
