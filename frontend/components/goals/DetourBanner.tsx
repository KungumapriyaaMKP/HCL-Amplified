"use client";

import { useState } from "react";

export interface DetourBannerProps {
  blockedSkillName: string;
  bridgeSkillName: string;
  rationale: string;
  onDismiss?: () => void;
}

export function DetourBanner({
  blockedSkillName,
  bridgeSkillName,
  rationale,
  onDismiss,
}: DetourBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-foreground shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-bold text-sm">
            ⚡
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Adaptive Remediation Spliced
              </span>
              <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                Prerequisite Bridge
              </span>
            </div>
            <p className="text-xs font-medium text-foreground">
              Blocked on <span className="underline decoration-amber-400">{blockedSkillName}</span>. Inserted refresher module for{" "}
              <span className="font-bold text-amber-300">{bridgeSkillName}</span>.
            </p>
            <p className="text-[11px] text-muted">{rationale}</p>
          </div>
        </div>

        <button
          onClick={() => {
            setDismissed(true);
            onDismiss?.();
          }}
          className="shrink-0 cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
