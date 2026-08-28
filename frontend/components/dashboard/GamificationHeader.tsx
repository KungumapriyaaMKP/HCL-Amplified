import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { ProgressBar } from "@/frontend/components/ui/progress-bar";
import type { DashboardData } from "@/lib/dashboardData";
import { IconBolt, IconFlame, IconAward } from "@tabler/icons-react";

export function GamificationHeader({ gamification }: { gamification: DashboardData["gamification"] }) {
  const pct = gamification.xpForNextLevel > 0 ? (gamification.xpIntoLevel / gamification.xpForNextLevel) * 100 : 0;

  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-purple-500/30 bg-[#0c1026]/90 p-6 shadow-[0_0_35px_rgba(139,92,246,0.25)] backdrop-blur-2xl">
      
      {/* Corner Accents */}
      <div className="pointer-events-none absolute -top-1 -right-1 h-6 w-6 rounded-tr-sm border-t-2 border-r-2 border-cyan-400" />
      <div className="pointer-events-none absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-sm border-b-2 border-l-2 border-purple-400" />

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        
        {/* Hero Plate & Title */}
        <div className="flex items-center gap-5">
          {/* Level Shield */}
          <div className="relative flex h-18 w-18 shrink-0 items-center justify-center rounded-md bg-gradient-to-tr from-purple-800 via-fuchsia-600 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(168,85,247,0.6)] ring-2 ring-purple-300/40">
            <div className="flex h-full w-full flex-col items-center justify-center rounded-sm bg-[#0d0f24]">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">LVL</span>
              <span className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                {gamification.level}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300/70">MASTERY TIER</span>
              <span className="rounded-sm bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 text-[9px] font-extrabold text-purple-300">
                ACTIVE
              </span>
            </div>
            <h3 className="text-xl font-black text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.3)]">
              {gamification.levelTitle}
            </h3>
            
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                <IconBolt className="h-4 w-4" />
                <span>{gamification.xp.toLocaleString()} Total XP</span>
              </span>
              
              {gamification.streak.currentStreak > 0 && (
                <span className="flex items-center gap-1.5 font-bold text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">
                  <IconFlame className="h-4 w-4" />
                  <span>{gamification.streak.currentStreak}-Day Streak</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Level Progression XP Gauge */}
        <div className="w-full max-w-sm rounded-md border border-purple-500/20 bg-[#070a1a]/80 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-black">
            <span className="text-purple-300">Level {gamification.level}</span>
            <span className="text-amber-400">{Math.round(pct)}% to Level {gamification.level + 1}</span>
          </div>
          <ProgressBar value={pct} variant="gold" />
          <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
            <span>Progress in Level</span>
            <span className="tabular-nums">{gamification.xpIntoLevel.toLocaleString()} / {gamification.xpForNextLevel.toLocaleString()} XP</span>
          </div>
        </div>

      </div>

      {/* Badges Section */}
      {gamification.badges.length > 0 && (
        <div className="mt-6 border-t border-purple-500/20 pt-4">
          <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-purple-300/70">
            EARNED BADGES ({gamification.badges.length})
          </div>
          <div className="flex flex-wrap gap-2.5">
            {gamification.badges.map((b) => (
              <div
                key={b.id}
                title={b.description}
                className="group flex items-center gap-2 rounded-md border border-purple-500/30 bg-[#121633]/90 px-3 py-1.5 text-xs font-bold text-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-all hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:-translate-y-0.5"
              >
                <IconAward className="h-4 w-4 text-purple-400 transition-transform group-hover:scale-110" />
                <span>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
