"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Badge } from "@/lib/api/pathfinder";
import { Pill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import { BadgeIcon } from "@/lib/badgeIcons";

interface BadgesModalProps {
  badges: Badge[];
  level: number;
  totalXp: number;
  onClose: () => void;
}

export function BadgesModal({
  badges,
  level,
  totalXp,
  onClose,
}: BadgesModalProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-canvas border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Level {level} Scholar
            </span>
            <h3 className="text-base font-bold text-ink">Achievements & Badges</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink text-xl leading-none cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              className={`p-3.5 border transition-all flex items-start gap-3.5 ${
                badge.unlocked
                  ? "bg-surface border-amber-300/60 dark:border-amber-800/60 shadow-2xs"
                  : "bg-surface/30 border-border/60 opacity-60"
              }`}
            >
              <div className="p-2 rounded-xl bg-canvas border border-border shrink-0 flex items-center justify-center">
                <BadgeIcon icon={badge.icon} className="w-6 h-6" />
              </div>

              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink">{badge.title}</span>
                  <Pill variant={badge.unlocked ? "mastered" : "neutral"}>
                    {badge.unlocked ? "Unlocked" : "Locked"}
                  </Pill>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted">
          <span>Total Accumulated: {totalXp} XP</span>
          <button
            onClick={onClose}
            className="bg-ink text-canvas font-semibold px-4 py-1.5 rounded-lg hover:bg-ink/90 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
