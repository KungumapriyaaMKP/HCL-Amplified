"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconTrophy, IconBolt, IconFlame, IconSparkles } from "@tabler/icons-react";

export interface PodiumChampion {
  rank: number;
  displayName: string;
  xp: number;
  level: number;
  levelTitle: string;
}

interface InteractiveRocketPodiumProps {
  top3: PodiumChampion[];
}

export function InteractiveRocketPodium({ top3 }: InteractiveRocketPodiumProps) {
  const [boostedRank, setBoostedRank] = useState<number | null>(null);
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);

  const triggerBoost = (rank: number) => {
    setBoostedRank(rank);
    setTimeout(() => setBoostedRank(null), 1200);
  };

  const rank2 = top3.find((r) => r.rank === 2) || top3[1];
  const rank1 = top3.find((r) => r.rank === 1) || top3[0];
  const rank3 = top3.find((r) => r.rank === 3) || top3[2];

  return (
    <div className="mb-20 pt-8 grid grid-cols-3 gap-3 sm:gap-8 items-end max-w-3xl mx-auto select-none">
      {/* ======================= RANK 2: Silver Nebula Striker ======================= */}
      {rank2 && (
        <motion.div
          className="relative flex flex-col items-center cursor-pointer group"
          animate={{
            y: boostedRank === 2 ? -55 : hoveredRank === 2 ? -18 : 0,
            scale: hoveredRank === 2 ? 1.04 : 1,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          onClick={() => triggerBoost(2)}
          onMouseEnter={() => setHoveredRank(2)}
          onMouseLeave={() => setHoveredRank(null)}
        >
          {/* Floating Hover Base Animation */}
          <div className="animate-rocket-2 w-full flex flex-col items-center">
            {/* Nose Cone */}
            <div className="relative flex flex-col items-center z-10 transition-transform group-hover:scale-105">
              <div className="h-0 w-0 border-x-[22px] sm:border-x-[28px] border-x-transparent border-b-[32px] sm:border-b-[40px] border-b-cyan-400 drop-shadow-[0_0_18px_rgba(6,182,212,0.9)] filter" />
              <div className="h-1.5 w-1.5 bg-white shadow-[0_0_8px_#fff] -mt-8 mb-6 animate-ping" />
            </div>

            {/* Main Fuselage Body */}
            <div className="relative w-full max-w-[200px] border-2 border-cyan-400/80 bg-gradient-to-b from-slate-900 via-[#0d1330] to-[#070918] p-3 sm:p-4 text-center shadow-[0_0_25px_rgba(6,182,212,0.4)] z-10 transition-all group-hover:border-cyan-300 group-hover:shadow-[0_0_35px_rgba(6,182,212,0.7)]">
              {/* Side Booster Fins */}
              <div className="absolute -left-3 sm:-left-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 border-l-2 border-b-2 border-t border-cyan-400/80 bg-gradient-to-l from-slate-800 to-cyan-950 skew-y-[35deg] shadow-[0_0_12px_rgba(6,182,212,0.4)]" />
              <div className="absolute -right-3 sm:-right-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 border-r-2 border-b-2 border-t border-cyan-400/80 bg-gradient-to-r from-slate-800 to-cyan-950 -skew-y-[35deg] shadow-[0_0_12px_rgba(6,182,212,0.4)]" />

              {/* Cockpit Window */}
              <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-2 border-slate-300 bg-slate-800/90 shadow-[inset_0_0_10px_rgba(203,213,225,0.5),0_0_15px_rgba(203,213,225,0.4)]">
                <span className="text-xs sm:text-sm font-black text-slate-200">#2</span>
              </div>

              <p className="font-bold text-xs sm:text-sm text-white truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                {rank2.displayName}
              </p>

              <div className="mt-1 flex items-center justify-center gap-1 text-[11px] sm:text-xs font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                <IconBolt className="h-3 w-3" />
                <span>{rank2.xp.toLocaleString()} XP</span>
              </div>

              <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-wider text-purple-300/90 border border-purple-500/30 bg-purple-950/60 px-1.5 py-0.5">
                {rank2.levelTitle}
              </span>

              {/* Interactive Click Hint */}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold text-cyan-300 uppercase tracking-widest">
                Click to Boost 🚀
              </div>
            </div>

            {/* Engine Exhaust Nozzle */}
            <div className="h-2.5 w-12 sm:w-16 bg-slate-950 border-x-2 border-cyan-400/80 z-10" />

            {/* Animated Thruster Fire Plume */}
            <div className="relative flex flex-col items-center -mt-0.5">
              <div
                className={`animate-flame-main w-8 sm:w-10 bg-gradient-to-b from-cyan-200 via-blue-500 to-transparent blur-[1px] shadow-[0_0_25px_rgba(6,182,212,0.9)] [clip-path:polygon(20%_0%,80%_0%,100%_70%,50%_100%,0%_70%)] transition-all ${
                  boostedRank === 2 ? "h-28 sm:h-36 scale-125" : "h-16 sm:h-20"
                }`}
              />
              <div
                className={`animate-flame-core absolute top-0 w-4 sm:w-5 bg-gradient-to-b from-white via-cyan-100 to-transparent shadow-[0_0_12px_#fff] [clip-path:polygon(25%_0%,75%_0%,100%_65%,50%_100%,0%_65%)] ${
                  boostedRank === 2 ? "h-18 sm:h-24" : "h-10 sm:h-12"
                }`}
              />
              <div className="animate-sparks absolute top-10 h-1.5 w-1.5 bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
              <div className="animate-sparks absolute top-12 left-2 h-1 w-1 bg-blue-300 [animation-delay:0.25s]" />
            </div>

            {/* Launchpad Glow */}
            <div className="h-1.5 w-20 sm:w-28 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-sm -mt-2 animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* ======================= RANK 1: Solar Apex Cruiser (Gold Leader) ======================= */}
      {rank1 && (
        <motion.div
          className="relative flex flex-col items-center -translate-y-6 sm:-translate-y-10 z-20 cursor-pointer group"
          animate={{
            y: boostedRank === 1 ? -75 : hoveredRank === 1 ? -38 : -24,
            scale: hoveredRank === 1 ? 1.05 : 1,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          onClick={() => triggerBoost(1)}
          onMouseEnter={() => setHoveredRank(1)}
          onMouseLeave={() => setHoveredRank(null)}
        >
          {/* Floating Hover Base Animation */}
          <div className="animate-rocket-1 w-full flex flex-col items-center">
            {/* Nose Cone */}
            <div className="relative flex flex-col items-center z-10 transition-transform group-hover:scale-110">
              <div className="h-0 w-0 border-x-[26px] sm:border-x-[34px] border-x-transparent border-b-[38px] sm:border-b-[48px] border-b-amber-400 drop-shadow-[0_0_24px_rgba(245,158,11,1)] filter" />
              <div className="h-2 w-2 bg-white shadow-[0_0_12px_#fff] -mt-10 mb-8 animate-ping" />
            </div>

            {/* Main Fuselage Body */}
            <div className="relative w-full max-w-[230px] border-2 border-amber-400 bg-gradient-to-b from-amber-950/90 via-[#18142a] to-[#070918] p-4 sm:p-5 text-center shadow-[0_0_40px_rgba(245,158,11,0.6),inset_0_0_15px_rgba(245,158,11,0.2)] z-10 transition-all group-hover:border-yellow-300 group-hover:shadow-[0_0_55px_rgba(245,158,11,0.9)]">
              {/* Side Booster Fins */}
              <div className="absolute -left-4 sm:-left-5 bottom-4 h-16 sm:h-20 w-4 sm:w-5 border-l-2 border-b-2 border-t border-amber-400 bg-gradient-to-l from-amber-600 to-amber-950 skew-y-[35deg] shadow-[0_0_18px_rgba(245,158,11,0.6)]" />
              <div className="absolute -right-4 sm:-right-5 bottom-4 h-16 sm:h-20 w-4 sm:w-5 border-r-2 border-b-2 border-t border-amber-400 bg-gradient-to-r from-amber-600 to-amber-950 -skew-y-[35deg] shadow-[0_0_18px_rgba(245,158,11,0.6)]" />

              {/* Cockpit Window with Trophy */}
              <div className="relative mx-auto mb-2 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center border-2 border-amber-300 bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 shadow-[0_0_28px_rgba(245,158,11,0.9),inset_0_0_12px_rgba(255,255,255,0.5)]">
                <IconTrophy className="h-7 w-7 sm:h-8 sm:w-8 text-amber-950 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" />
                <span className="absolute -bottom-2 -right-2 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center border border-black bg-amber-300 text-[10px] sm:text-xs font-black text-black shadow-md">
                  #1
                </span>
              </div>

              <p className="font-black text-sm sm:text-base text-amber-200 truncate drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
                {rank1.displayName}
              </p>

              <div className="mt-1 flex items-center justify-center gap-1 text-xs sm:text-sm font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
                <IconFlame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>{rank1.xp.toLocaleString()} XP</span>
              </div>

              <span className="mt-1.5 inline-block text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-500/40 bg-amber-950/80 px-2 py-0.5 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                {rank1.levelTitle}
              </span>

              {/* Interactive Click Hint */}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold text-amber-300 uppercase tracking-widest">
                Click to Mega-Boost ⚡
              </div>
            </div>

            {/* Engine Exhaust Nozzle */}
            <div className="h-3 w-16 sm:w-20 bg-slate-950 border-x-2 border-amber-400 z-10" />

            {/* Animated Thruster Mega Fire Plume */}
            <div className="relative flex flex-col items-center -mt-0.5">
              <div
                className={`animate-flame-main w-10 sm:w-14 bg-gradient-to-b from-yellow-200 via-orange-500 to-transparent blur-[1px] shadow-[0_0_35px_rgba(249,115,22,1)] [clip-path:polygon(15%_0%,85%_0%,100%_70%,50%_100%,0%_70%)] transition-all ${
                  boostedRank === 1 ? "h-36 sm:h-48 scale-135" : "h-20 sm:h-28"
                }`}
              />
              <div
                className={`animate-flame-core absolute top-0 w-5 sm:w-7 bg-gradient-to-b from-white via-yellow-200 to-transparent shadow-[0_0_20px_#fff] [clip-path:polygon(20%_0%,80%_0%,100%_65%,50%_100%,0%_65%)] ${
                  boostedRank === 1 ? "h-22 sm:h-30" : "h-12 sm:h-16"
                }`}
              />
              <div className="animate-sparks absolute top-12 h-2 w-2 bg-yellow-300 shadow-[0_0_10px_#fde047]" />
              <div className="animate-sparks absolute top-14 left-3 h-1.5 w-1.5 bg-orange-400 shadow-[0_0_8px_#fb923c] [animation-delay:0.3s]" />
              <div className="animate-sparks absolute top-14 right-3 h-1.5 w-1.5 bg-amber-200 shadow-[0_0_8px_#fef08a] [animation-delay:0.15s]" />
            </div>

            {/* Launchpad Ground Flame Reflection */}
            <div className="h-2 w-24 sm:w-36 bg-gradient-to-r from-transparent via-amber-500/70 to-transparent blur-sm -mt-2 animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* ======================= RANK 3: Bronze Phoenix Striker ======================= */}
      {rank3 && (
        <motion.div
          className="relative flex flex-col items-center cursor-pointer group"
          animate={{
            y: boostedRank === 3 ? -55 : hoveredRank === 3 ? -18 : 0,
            scale: hoveredRank === 3 ? 1.04 : 1,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          onClick={() => triggerBoost(3)}
          onMouseEnter={() => setHoveredRank(3)}
          onMouseLeave={() => setHoveredRank(null)}
        >
          {/* Floating Hover Base Animation */}
          <div className="animate-rocket-3 w-full flex flex-col items-center">
            {/* Nose Cone */}
            <div className="relative flex flex-col items-center z-10 transition-transform group-hover:scale-105">
              <div className="h-0 w-0 border-x-[22px] sm:border-x-[28px] border-x-transparent border-b-[32px] sm:border-b-[40px] border-b-orange-600 drop-shadow-[0_0_18px_rgba(234,88,12,0.9)] filter" />
              <div className="h-1.5 w-1.5 bg-white shadow-[0_0_8px_#fff] -mt-8 mb-6 animate-ping" />
            </div>

            {/* Main Fuselage Body */}
            <div className="relative w-full max-w-[200px] border-2 border-orange-600/80 bg-gradient-to-b from-amber-950/80 via-[#161026] to-[#070918] p-3 sm:p-4 text-center shadow-[0_0_25px_rgba(234,88,12,0.4)] z-10 transition-all group-hover:border-orange-500 group-hover:shadow-[0_0_35px_rgba(234,88,12,0.7)]">
              {/* Side Booster Fins */}
              <div className="absolute -left-3 sm:-left-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 border-l-2 border-b-2 border-t border-orange-600/80 bg-gradient-to-l from-amber-800 to-amber-950 skew-y-[35deg] shadow-[0_0_12px_rgba(234,88,12,0.4)]" />
              <div className="absolute -right-3 sm:-right-4 bottom-3 h-12 sm:h-16 w-3 sm:w-4 border-r-2 border-b-2 border-t border-orange-600/80 bg-gradient-to-r from-amber-800 to-amber-950 -skew-y-[35deg] shadow-[0_0_12px_rgba(234,88,12,0.4)]" />

              {/* Cockpit Window */}
              <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center border-2 border-amber-700 bg-amber-950/90 shadow-[inset_0_0_10px_rgba(180,83,9,0.5),0_0_15px_rgba(180,83,9,0.4)]">
                <span className="text-xs sm:text-sm font-black text-amber-300">#3</span>
              </div>

              <p className="font-bold text-xs sm:text-sm text-white truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                {rank3.displayName}
              </p>

              <div className="mt-1 flex items-center justify-center gap-1 text-[11px] sm:text-xs font-black text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]">
                <IconBolt className="h-3 w-3" />
                <span>{rank3.xp.toLocaleString()} XP</span>
              </div>

              <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-wider text-purple-300/90 border border-purple-500/30 bg-purple-950/60 px-1.5 py-0.5">
                {rank3.levelTitle}
              </span>

              {/* Interactive Click Hint */}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-bold text-orange-400 uppercase tracking-widest">
                Click to Boost 🚀
              </div>
            </div>

            {/* Engine Exhaust Nozzle */}
            <div className="h-2.5 w-12 sm:w-16 bg-slate-950 border-x-2 border-orange-600/80 z-10" />

            {/* Animated Thruster Fire Plume */}
            <div className="relative flex flex-col items-center -mt-0.5">
              <div
                className={`animate-flame-main w-8 sm:w-10 bg-gradient-to-b from-amber-300 via-red-600 to-transparent blur-[1px] shadow-[0_0_25px_rgba(220,38,38,0.9)] [clip-path:polygon(20%_0%,80%_0%,100%_70%,50%_100%,0%_70%)] transition-all ${
                  boostedRank === 3 ? "h-28 sm:h-36 scale-125" : "h-16 sm:h-20"
                }`}
              />
              <div
                className={`animate-flame-core absolute top-0 w-4 sm:w-5 bg-gradient-to-b from-white via-orange-200 to-transparent shadow-[0_0_12px_#fff] [clip-path:polygon(25%_0%,75%_0%,100%_65%,50%_100%,0%_65%)] ${
                  boostedRank === 3 ? "h-18 sm:h-24" : "h-10 sm:h-12"
                }`}
              />
              <div className="animate-sparks absolute top-10 h-1.5 w-1.5 bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <div className="animate-sparks absolute top-12 right-2 h-1 w-1 bg-red-400 [animation-delay:0.25s]" />
            </div>

            {/* Launchpad Glow */}
            <div className="h-1.5 w-20 sm:w-28 bg-gradient-to-r from-transparent via-orange-600/50 to-transparent blur-sm -mt-2 animate-pulse" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
