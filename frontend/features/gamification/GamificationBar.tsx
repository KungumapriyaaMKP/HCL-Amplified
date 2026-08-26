"use client";

import { useState, useEffect, useRef } from "react";
import { Flame, Zap, Trophy } from "lucide-react";
import { getGamification, GamificationResponse } from "@/lib/api/pathfinder";
import { emitNudge } from "@/lib/mentorBus";
import { BadgesModal } from "./BadgesModal";

export function GamificationBar() {
  const [data, setData] = useState<GamificationResponse | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const prevUnlockedCountRef = useRef<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await getGamification();
        setData(res);
        const unlocked = res.badges.filter((b) => b.unlocked).length;
        if (prevUnlockedCountRef.current !== null && unlocked > prevUnlockedCountRef.current) {
          emitNudge("badge_unlock");
        }
        prevUnlockedCountRef.current = unlocked;
      } catch {}
    }
    load();
  }, []);

  if (!data) return null;

  const unlockedCount = data.badges.filter((b) => b.unlocked).length;

  return (
    <>
      <div className="flex items-center gap-3 text-xs">
        {/* Streak Counter */}
        <div
          title={`${data.streak_days}-day consecutive study streak`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 font-bold font-mono"
        >
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>{data.streak_days}d</span>
        </div>

        {/* Level & XP Bar Button */}
        <button
          onClick={() => setShowBadges(true)}
          className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-surface border border-border hover:border-ink/40 transition-colors cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-1 font-bold text-ink">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Lv.{data.level}</span>
          </div>

          <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden hidden sm:block">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${data.current_level_progress_pct}%` }}
            />
          </div>

          <span className="text-[11px] font-mono text-muted hidden sm:inline">
            {data.total_xp} XP
          </span>

          <span className="text-[10px] font-semibold bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-1.5 py-0.2 rounded inline-flex items-center gap-1">
            <Trophy className="w-3 h-3" /> {unlockedCount}
          </span>
        </button>
      </div>

      {showBadges && (
        <BadgesModal
          badges={data.badges}
          level={data.level}
          totalXp={data.total_xp}
          onClose={() => setShowBadges(false)}
        />
      )}
    </>
  );
}
