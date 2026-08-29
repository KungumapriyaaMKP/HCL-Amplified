"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconCheck,
  IconLock,
  IconTarget,
  IconSparkles,
  IconArrowRight,
  IconCoins,
  IconDiamond,
  IconBell,
  IconTrendingUp,
  IconGift,
  IconLayersLinked,
} from "@tabler/icons-react";

export type JourneyModuleItem = {
  module: {
    id: string;
    title: string;
    description: string | null;
    rationale: string | null;
    status: "completed" | "in_progress" | "available" | "locked" | string;
    milestoneType: string;
    orderIndex: number;
    estimatedMinutes: number | null;
  };
  skill: {
    id: string;
    name: string;
    category?: string;
  } | null;
};

interface JourneyMapViewProps {
  goalId: string;
  goalTitle: string;
  domainName: string;
  modules: JourneyModuleItem[];
  userDisplayName?: string;
}

export function JourneyMapView({
  goalId,
  goalTitle,
  domainName,
  modules,
  userDisplayName = "Yuvi",
}: JourneyMapViewProps) {
  // Sort modules by orderIndex
  const sortedModules = [...modules].sort(
    (a, b) => a.module.orderIndex - b.module.orderIndex
  );

  const completedCount = sortedModules.filter(
    (m) => m.module.status === "completed"
  ).length;
  const totalCount = sortedModules.length || 1;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  // Find the first non-completed module as the current active step
  const activeIndex = sortedModules.findIndex(
    (m) => m.module.status === "in_progress" || m.module.status === "available"
  );
  const currentActiveIdx = activeIndex !== -1 ? activeIndex : completedCount < totalCount ? completedCount : totalCount - 1;

  return (
    <div className="w-full flex-1 flex flex-col min-h-screen bg-[#FDFCFE] text-slate-900 font-sans">
      {/* 1. Top Bar Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-purple-100/70 px-6 sm:px-10 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="space-y-0.5">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Your{" "}
            <span className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#9333EA] bg-clip-text text-transparent">
              Learning Journey
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Complete milestones, unlock rewards & level up your skills!</span>
            <span className="text-amber-500">✨</span>
          </p>
        </div>

        {/* Top Right Badges & Actions */}
        <div className="flex items-center gap-3">
          {/* Coins Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black shadow-2xs">
            <span className="text-base leading-none">🪙</span>
            <span>320</span>
          </div>

          {/* Gems Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-[#7C3AED] text-xs font-black shadow-2xs">
            <span className="text-base leading-none">💎</span>
            <span>15</span>
          </div>

          {/* Skill Tree Graph Link */}
          <Link
            href={`/goals/${goalId}/graph`}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-purple-50 hover:text-[#7C3AED] transition-all"
          >
            <IconLayersLinked className="h-4 w-4 text-[#7C3AED]" />
            <span>Skill Tree</span>
          </Link>

          {/* Notification Bell */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-purple-50 hover:text-[#7C3AED] transition-colors shadow-2xs"
            title="Notifications"
          >
            <IconBell className="h-4 w-4" />
          </button>

          {/* User Profile Dropdown Pill */}
          <div className="flex items-center gap-2 pl-1 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-white font-bold text-xs shadow-sm">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Grid: Journey Map Canvas + Right Progress Panel */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Left/Center Canvas: 3D Winding Candy Road Map */}
        <div className="w-full lg:w-[68%] relative rounded-3xl overflow-hidden border border-purple-100/80 shadow-lg bg-gradient-to-b from-[#F5F3FF] via-[#FFF7ED] to-[#FEF2F2]">
          
          {/* Scenic Candy Valley Background Image Overlay */}
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none">
            <Image
              src="/images/journey/candy_bg.jpg"
              alt="Candy Journey Background"
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Ambient Lighting Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/80 pointer-events-none z-1" />

          {/* SVG Winding Road Path with Candy Cane Borders */}
          <div className="relative z-10 py-12 px-4 sm:px-12 flex flex-col items-center">
            
            <div className="w-full max-w-2xl flex flex-col items-center space-y-16 sm:space-y-20 relative">
              
              {/* Connecting Curving Line Behind Nodes */}
              <div className="absolute top-10 bottom-24 w-4 rounded-full bg-gradient-to-b from-purple-400 via-pink-400 to-amber-400 opacity-80 shadow-md pointer-events-none" />

              {sortedModules.map((item, idx) => {
                const isCompleted = item.module.status === "completed" || idx < currentActiveIdx;
                const isCurrent = idx === currentActiveIdx;
                const isLocked = !isCompleted && !isCurrent;
                const stepNumber = idx + 1;
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={item.module.id}
                    className={`w-full flex items-center gap-6 sm:gap-10 ${
                      isEven ? "flex-col sm:flex-row" : "flex-col sm:flex-row-reverse"
                    } justify-center z-10`}
                  >
                    {/* Node 3D Pedestal and Icon */}
                    <div className="shrink-0 relative flex flex-col items-center group cursor-pointer">
                      
                      {/* Ambient Glow for Active Step */}
                      {isCurrent && (
                        <div className="absolute -inset-4 rounded-full bg-purple-500/25 blur-xl animate-pulse" />
                      )}

                      {/* Tiered Pedestal */}
                      <div
                        className={`relative flex flex-col items-center justify-center transition-all duration-300 transform group-hover:scale-105 ${
                          isCompleted
                            ? "drop-shadow-[0_10px_15px_rgba(16,185,129,0.3)]"
                            : isCurrent
                            ? "drop-shadow-[0_12px_20px_rgba(124,58,237,0.45)]"
                            : "drop-shadow-[0_6px_10px_rgba(100,116,139,0.25)]"
                        }`}
                      >
                        {/* Top Floating Badge */}
                        <div
                          className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-4 transition-all ${
                            isCompleted
                              ? "bg-gradient-to-tr from-emerald-400 to-teal-400 border-white text-white shadow-lg"
                              : isCurrent
                              ? "bg-gradient-to-tr from-[#6D28D9] via-[#7C3AED] to-[#9333EA] border-white text-white shadow-xl ring-4 ring-purple-300/60 animate-bounce-short"
                              : "bg-gradient-to-tr from-slate-600 to-slate-800 border-slate-400 text-slate-300 shadow-md"
                          }`}
                        >
                          {isCompleted ? (
                            <IconCheck className="h-8 w-8 sm:h-10 sm:w-10 stroke-[3]" />
                          ) : isCurrent ? (
                            <div className="relative flex items-center justify-center">
                              {/* 3D Bullseye Target Icon */}
                              <IconTarget className="h-9 w-9 sm:h-11 sm:w-11 text-white animate-pulse" />
                            </div>
                          ) : (
                            <IconLock className="h-7 w-7 sm:h-9 sm:w-9 text-slate-400" />
                          )}
                        </div>

                        {/* Pedestal Base with Step Number */}
                        <div
                          className={`-mt-3 px-4 py-1 rounded-full text-xs font-black border-2 shadow-md ${
                            isCompleted
                              ? "bg-purple-900 border-purple-400 text-purple-200"
                              : isCurrent
                              ? "bg-purple-950 border-purple-300 text-amber-300 ring-2 ring-purple-400"
                              : "bg-slate-800 border-slate-600 text-slate-400"
                          }`}
                        >
                          {stepNumber}
                        </div>
                      </div>
                    </div>

                    {/* Connected Floating Glass Card */}
                    <div
                      className={`w-full max-w-sm rounded-2xl border p-5 transition-all shadow-md backdrop-blur-md ${
                        isCurrent
                          ? "bg-white/95 border-purple-300 ring-2 ring-purple-400/50 shadow-purple-500/15"
                          : isCompleted
                          ? "bg-white/90 border-emerald-200/90 shadow-emerald-500/10"
                          : "bg-white/70 border-slate-200/80 opacity-80"
                      }`}
                    >
                      {/* Status Header */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {isCompleted ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                              <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                          ) : isCurrent ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-[#7C3AED]">
                              <IconSparkles className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                              <IconLock className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <span
                            className={`text-xs font-extrabold uppercase tracking-wide ${
                              isCompleted
                                ? "text-emerald-600"
                                : isCurrent
                                ? "text-[#7C3AED]"
                                : "text-slate-500"
                            }`}
                          >
                            {isCompleted
                              ? "Completed"
                              : isCurrent
                              ? "In Progress"
                              : "Locked"}
                          </span>
                        </div>

                        {item.module.estimatedMinutes && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            ~{item.module.estimatedMinutes}m
                          </span>
                        )}
                      </div>

                      {/* Module Title */}
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {item.module.title}
                      </h3>

                      {/* Rationale / Description */}
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {item.module.rationale ||
                          item.module.description ||
                          (isLocked
                            ? "Complete the previous step to unlock this module."
                            : "Master prerequisites and practical exercises.")}
                      </p>

                      {/* Action Button for Active or Completed Module */}
                      {isCurrent && (
                        <div className="mt-4">
                          <Link
                            href={`/goals/${goalId}/modules/${item.module.id}`}
                            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white px-5 py-2.5 text-xs font-extrabold shadow-md shadow-purple-500/25 hover:opacity-95 transition-all group cursor-pointer"
                          >
                            <span>Continue</span>
                            <IconArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="mt-3">
                          <Link
                            href={`/goals/${goalId}/modules/${item.module.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            <span>Review Module</span>
                            <IconArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Final Node: 3D Golden Treasure Chest with Mega Reward */}
              <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 pt-4 z-10">
                <div className="relative flex flex-col items-center">
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 drop-shadow-[0_15px_25px_rgba(234,179,8,0.4)] animate-pulse">
                    <Image
                      src="/images/journey/treasure.jpg"
                      alt="Treasure Chest Mega Reward"
                      fill
                      className="object-contain rounded-2xl"
                    />
                  </div>
                </div>

                <div className="w-full max-w-sm rounded-2xl border border-amber-200/90 bg-white/95 p-5 shadow-lg shadow-amber-500/10 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 mb-1 text-xs font-extrabold text-amber-600 uppercase tracking-wide">
                    <span>💎</span>
                    <span>Mega Reward</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Capstone & Certification
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Complete all milestones to earn 500 XP, 50 Gems, and your Verified Domain Mastery Certificate! 🎁
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Progress & Milestone Rewards Panel */}
        <aside className="w-full lg:w-[32%] shrink-0 space-y-6">
          
          {/* Card: Your Progress */}
          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-[#7C3AED]">
                  <IconTrendingUp className="h-4 w-4" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900">Your Progress</h2>
              </div>
            </div>

            {/* Progress Count & Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-600">
                  <span className="text-[#7C3AED]">{completedCount} of {totalCount}</span> milestones completed
                </span>
                <span className="text-[#7C3AED] font-black">{progressPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#9333EA] rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Milestone Rewards Grid */}
            <div className="pt-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3">
                Milestone Rewards
              </h3>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                {/* Reward 1 */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <span className="text-lg">🪙</span>
                  <span className="text-xs font-black text-slate-900 mt-1">100</span>
                  <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <IconCheck className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                </div>

                {/* Reward 2 */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <span className="text-lg">💎</span>
                  <span className="text-xs font-black text-slate-900 mt-1">10</span>
                  <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <IconCheck className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                </div>

                {/* Reward 3: Active */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border-2 border-purple-400 bg-purple-50 shadow-xs ring-2 ring-purple-200">
                  <span className="text-lg">⭐</span>
                  <span className="text-xs font-black text-[#7C3AED] mt-1">XP 200</span>
                  <span className="text-[9px] font-extrabold text-[#7C3AED] uppercase mt-1">
                    Active
                  </span>
                </div>

                {/* Reward 4: Locked */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                  <IconLock className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 mt-1">Locked</span>
                </div>

                {/* Reward 5: Locked */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                  <IconLock className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 mt-1">Locked</span>
                </div>

                {/* Reward 6: Grand Chest */}
                <div className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
                  <span className="text-lg">🎁</span>
                  <span className="text-[10px] font-black text-amber-700 mt-1">Mega</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Complete all milestones to earn mega rewards!</span>
              <span>🎁</span>
            </div>
          </div>

          {/* Card: Explorer Profile Status */}
          <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-md space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden border-2 border-purple-200 shadow-sm bg-purple-50">
                <Image
                  src="/images/journey/explorer.jpg"
                  alt="Explorer Avatar"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-0.5">
                <h4 className="text-sm font-extrabold text-slate-900">
                  {domainName || "Web Dev"} Explorer 🚀
                </h4>
                <div className="text-xs font-bold text-[#7C3AED]">Level 12</div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-amber-600">🪙 320</span>
                  <span className="text-xs font-bold text-purple-600">💎 15</span>
                </div>
              </div>
            </div>

            {/* Level XP Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                <span>XP Progress</span>
                <span>820 / 1200 XP</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  style={{ width: "68%" }}
                />
              </div>
            </div>

            {/* Keep Going motivation prompt */}
            <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center gap-3">
              <div className="text-2xl">🎁</div>
              <div className="text-xs text-slate-600 leading-snug">
                <span className="font-extrabold text-[#7C3AED]">Keep going! 💜</span> Complete more quests to unlock achievements and earn rewards.
              </div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}

export default JourneyMapView;
