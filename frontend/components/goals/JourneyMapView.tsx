"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconCheck,
  IconLock,
  IconTarget,
  IconSparkles,
  IconArrowRight,
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
  // Sort modules
  const sortedModules = [...modules].sort(
    (a, b) => a.module.orderIndex - b.module.orderIndex
  );

  // Build the complete 5-milestone journey nodes
  // Step 1: Intake (Completed)
  // Step 2: Goals & Baseline (Completed)
  // Step 3..N: Modules from learning path
  const journeyNodes = [
    {
      id: "intake_step",
      stepNumber: 1,
      title: "Intake",
      subtitle: "Completed",
      description: "Prerequisites intake assessment completed.",
      status: "completed",
      link: `/goals/${goalId}/setup`,
      estimatedMinutes: 5,
    },
    {
      id: "goals_step",
      stepNumber: 2,
      title: "Goals",
      subtitle: "Completed",
      description: "Target competencies defined and calibrated.",
      status: "completed",
      link: `/goals/${goalId}/setup`,
      estimatedMinutes: 5,
    },
    {
      id: sortedModules[0]?.module.id || "calibration_step",
      stepNumber: 3,
      title: sortedModules[0]?.module.title || "Calibration",
      subtitle: "In Progress",
      description:
        sortedModules[0]?.module.rationale ||
        sortedModules[0]?.module.description ||
        "Complete calibration so the recommendation engine can calculate your exact skill gap roadmap.",
      status: "in_progress",
      link: sortedModules[0]?.module.id
        ? `/goals/${goalId}/modules/${sortedModules[0].module.id}`
        : `/goals/${goalId}/setup`,
      estimatedMinutes: sortedModules[0]?.module.estimatedMinutes || 45,
    },
    {
      id: sortedModules[1]?.module.id || "roadmap_step",
      stepNumber: 4,
      title: sortedModules[1]?.module.title || "Roadmap",
      subtitle: "Locked",
      description:
        sortedModules[1]?.module.rationale ||
        sortedModules[1]?.module.description ||
        "Complete the previous step to unlock.",
      status: sortedModules[1]?.module.status === "completed" ? "completed" : "locked",
      link: sortedModules[1]?.module.id
        ? `/goals/${goalId}/modules/${sortedModules[1].module.id}`
        : `/goals/${goalId}`,
      estimatedMinutes: sortedModules[1]?.module.estimatedMinutes || 60,
    },
    {
      id: sortedModules[2]?.module.id || "action_plan_step",
      stepNumber: 5,
      title: sortedModules[2]?.module.title || "Action Plan",
      subtitle: "Locked",
      description:
        sortedModules[2]?.module.rationale ||
        sortedModules[2]?.module.description ||
        "Complete the previous step to unlock.",
      status: sortedModules[2]?.module.status === "completed" ? "completed" : "locked",
      link: sortedModules[2]?.module.id
        ? `/goals/${goalId}/modules/${sortedModules[2].module.id}`
        : `/goals/${goalId}`,
      estimatedMinutes: sortedModules[2]?.module.estimatedMinutes || 90,
    },
  ];

  const completedCount = journeyNodes.filter((n) => n.status === "completed").length;
  const totalCount = journeyNodes.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="relative w-full min-h-screen bg-[#FFF9F6] text-slate-900 font-sans flex flex-col">
      {/* 1. Full Scenic Candy Landscape Background (Clean Image, Zero Static Text) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden min-h-[1200px]">
        <Image
          src="/images/journey/candy_clean_bg.jpg"
          alt="Candy Valley Learning Background"
          fill
          unoptimized
          className="object-cover object-top opacity-95"
          priority
        />
        {/* Soft pastel atmosphere overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/40" />
      </div>

      {/* 2. Top Navigation Bar (Real Interactive Elements) */}
      <header className="relative z-30 w-full px-6 sm:px-12 py-4 flex items-center justify-between">
        {/* Title and Subtitle */}
        <div className="space-y-0.5 drop-shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Your{" "}
            <span className="text-[#6D28D9]">Learning Journey</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5">
            <span>Complete milestones, unlock rewards & level up your skills!</span>
            <span className="text-amber-500">✨</span>
          </p>
        </div>

        {/* Top Right Badges & Actions */}
        <div className="flex items-center gap-3">
          {/* Coins Badge */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-amber-200/90 text-amber-800 text-xs font-black shadow-xs backdrop-blur-xs">
            <span className="text-sm">🪙</span>
            <span>320</span>
          </div>

          {/* Gems Badge */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 border border-purple-200/90 text-[#7C3AED] text-xs font-black shadow-xs backdrop-blur-xs">
            <span className="text-sm">💎</span>
            <span>15</span>
          </div>

          {/* Skill Tree Graph Link */}
          <Link
            href={`/goals/${goalId}/graph`}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-white/95 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-purple-50 hover:text-[#7C3AED] transition-all"
          >
            <IconLayersLinked className="h-4 w-4 text-[#7C3AED]" />
            <span>Skill Tree</span>
          </Link>

          {/* Notification Bell */}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-100 bg-white/95 text-slate-600 hover:text-[#7C3AED] transition-colors shadow-xs"
            title="Notifications"
          >
            <IconBell className="h-4 w-4" />
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-1.5 pl-1 cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-white font-bold text-xs shadow-sm ring-2 ring-white">
              {userDisplayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-slate-500 font-bold">▾</span>
          </div>
        </div>
      </header>

      {/* 3. Main Stage: S-Curved Candy Path + Dynamic 3D Nodes + Right Progress Panel */}
      <div className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-2 flex flex-col lg:flex-row items-start justify-between">
        
        {/* Center Canvas with S-Curve Road and 3D Pedestal Steps */}
        <div className="relative w-full lg:w-[68%] min-h-[1100px] pb-16">
          
          {/* SVG S-Curve Candy Cane Ribbon Road */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 700 1100"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Candy Cane Stripe Pattern */}
              <pattern
                id="candyCanePattern"
                width="28"
                height="28"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="14" height="28" fill="#FFFFFF" />
                <rect x="14" width="14" height="28" fill="#FB7185" />
              </pattern>

              {/* Road Drop Shadow */}
              <filter id="roadShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#78350F" floodOpacity="0.18" />
              </filter>
            </defs>

            {/* Road Outer Shadow Border */}
            <path
              d="M 290 80 C 210 160, 240 240, 280 320 C 320 400, 280 470, 300 550 C 330 630, 270 710, 310 790 C 340 860, 280 930, 310 1000"
              stroke="#FDE68A"
              strokeWidth="52"
              strokeLinecap="round"
              fill="none"
              filter="url(#roadShadow)"
            />

            {/* Road Candy-Cane Border Strip */}
            <path
              d="M 290 80 C 210 160, 240 240, 280 320 C 320 400, 280 470, 300 550 C 330 630, 270 710, 310 790 C 340 860, 280 930, 310 1000"
              stroke="url(#candyCanePattern)"
              strokeWidth="42"
              strokeLinecap="round"
              fill="none"
            />

            {/* Road Inner Smooth Path */}
            <path
              d="M 290 80 C 210 160, 240 240, 280 320 C 320 400, 280 470, 300 550 C 330 630, 270 710, 310 790 C 340 860, 280 930, 310 1000"
              stroke="#FEF3C7"
              strokeWidth="30"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* STEP 1: Intake (Completed) */}
          <div className="absolute top-[30px] left-[32%] sm:left-[36%] flex items-center gap-6 z-10">
            {/* 3D Pedestal 1 */}
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-3 -left-3 text-sm animate-pulse">✨</div>
              <div className="absolute -bottom-2 -right-2 text-sm animate-pulse">🎉</div>

              <div className="relative flex flex-col items-center drop-shadow-[0_10px_18px_rgba(16,185,129,0.45)]">
                <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 via-emerald-500 to-teal-400 border-[3px] border-white text-white shadow-lg ring-4 ring-emerald-200/50">
                  <IconCheck className="h-9 w-9 stroke-[3]" />
                </div>
                <div className="-mt-3 px-3.5 py-0.5 rounded-full bg-purple-900 border-2 border-purple-400 text-white text-[11px] font-black shadow-md">
                  1
                </div>
              </div>
            </div>

            {/* Step 1 Card */}
            <Link
              href={`/goals/${goalId}/setup`}
              className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 shadow-md backdrop-blur-xs min-w-[170px] hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                </span>
                <span className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Intake
                </span>
              </div>
              <div className="text-xs font-bold text-emerald-600 pl-7 mt-0.5">Completed</div>
            </Link>
          </div>

          {/* STEP 2: Goals (Completed) */}
          <div className="absolute top-[205px] left-[31%] sm:left-[35%] flex items-center gap-6 z-10">
            {/* 3D Pedestal 2 */}
            <div className="relative flex flex-col items-center">
              <div className="relative flex flex-col items-center drop-shadow-[0_10px_18px_rgba(16,185,129,0.45)]">
                <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 via-emerald-500 to-teal-400 border-[3px] border-white text-white shadow-lg ring-4 ring-emerald-200/50">
                  <IconCheck className="h-9 w-9 stroke-[3]" />
                </div>
                <div className="-mt-3 px-3.5 py-0.5 rounded-full bg-purple-900 border-2 border-purple-400 text-white text-[11px] font-black shadow-md">
                  2
                </div>
              </div>
            </div>

            {/* Step 2 Card */}
            <Link
              href={`/goals/${goalId}/setup`}
              className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 shadow-md backdrop-blur-xs min-w-[170px] hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <IconCheck className="h-3.5 w-3.5 stroke-[3]" />
                </span>
                <span className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  Goals
                </span>
              </div>
              <div className="text-xs font-bold text-emerald-600 pl-7 mt-0.5">Completed</div>
            </Link>
          </div>

          {/* STEP 3: Calibration / Active Module (In Progress - Highlight Target) */}
          <div className="absolute top-[375px] left-[30%] sm:left-[33%] flex items-center gap-6 z-20">
            {/* 3D Active Glowing Pedestal 3 */}
            <div className="relative flex flex-col items-center">
              <div className="absolute -inset-5 rounded-full bg-purple-500/30 blur-xl animate-pulse" />
              
              <div className="relative flex flex-col items-center drop-shadow-[0_16px_28px_rgba(124,58,237,0.55)]">
                {/* 3D Target Bullseye */}
                <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-tr from-[#6D28D9] via-[#8B5CF6] to-[#C084FC] border-4 border-white shadow-2xl ring-4 ring-purple-300">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-white/90 bg-[#5B21B6]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#7C3AED]">
                      <div className="h-4 w-4 rounded-full bg-[#7C3AED]" />
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 text-xl drop-shadow-md transform -rotate-12">
                    🎯
                  </div>
                </div>

                {/* Pedestal Base with Number 3 */}
                <div className="-mt-3 px-4 py-1 rounded-full bg-purple-950 border-2 border-purple-300 text-amber-300 text-xs font-black shadow-lg ring-2 ring-purple-400">
                  3
                </div>
              </div>
            </div>

            {/* Step 3 Active Card with Purple Border & Working Continue Button */}
            <div className="bg-white/98 border-2 border-purple-400 rounded-3xl p-5 shadow-xl shadow-purple-500/15 backdrop-blur-md max-w-xs sm:max-w-sm space-y-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {journeyNodes[2].title}
                </h3>
                <div className="text-xs font-extrabold text-[#7C3AED]">In Progress</div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {journeyNodes[2].description}
              </p>

              <div className="pt-2">
                <Link
                  href={journeyNodes[2].link}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-purple-500/30 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <span>Continue</span>
                  <IconArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* STEP 4: Roadmap / Next Module (Locked) */}
          <div className="absolute top-[580px] left-[34%] sm:left-[38%] flex items-center gap-6 z-10">
            {/* 3D Dark Pedestal 4 */}
            <div className="relative flex flex-col items-center drop-shadow-[0_10px_18px_rgba(30,41,59,0.35)]">
              <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-gradient-to-tr from-slate-600 to-slate-800 border-[3px] border-slate-400 text-slate-300 shadow-md">
                <IconLock className="h-8 w-8 text-slate-300" />
              </div>
              <div className="-mt-3 px-3.5 py-0.5 rounded-full bg-slate-900 border-2 border-slate-600 text-slate-400 text-[11px] font-black shadow-md">
                4
              </div>
            </div>

            {/* Step 4 Card */}
            <div className="bg-white/92 border border-slate-200 rounded-2xl p-4 shadow-sm backdrop-blur-xs max-w-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <IconLock className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-extrabold text-slate-900">{journeyNodes[3].title}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 pl-6 mt-0.5">Locked</div>
              <p className="text-[11px] text-slate-500 pl-6 mt-1">Complete the previous step to unlock</p>
            </div>
          </div>

          {/* STEP 5: Action Plan (Locked) */}
          <div className="absolute top-[760px] left-[33%] sm:left-[37%] flex items-center gap-6 z-10">
            {/* 3D Dark Pedestal 5 */}
            <div className="relative flex flex-col items-center drop-shadow-[0_10px_18px_rgba(30,41,59,0.35)]">
              <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full bg-gradient-to-tr from-slate-600 to-slate-800 border-[3px] border-slate-400 text-slate-300 shadow-md">
                <IconLock className="h-8 w-8 text-slate-300" />
              </div>
              <div className="-mt-3 px-3.5 py-0.5 rounded-full bg-slate-900 border-2 border-slate-600 text-slate-400 text-[11px] font-black shadow-md">
                5
              </div>
            </div>

            {/* Step 5 Card */}
            <div className="bg-white/92 border border-slate-200 rounded-2xl p-4 shadow-sm backdrop-blur-xs max-w-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <IconLock className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-extrabold text-slate-900">{journeyNodes[4].title}</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 pl-6 mt-0.5">Locked</div>
              <p className="text-[11px] text-slate-500 pl-6 mt-1">Complete the previous step to unlock</p>
            </div>
          </div>

          {/* FINAL DESTINATION: 3D Golden Treasure Chest (Mega Reward) */}
          <div className="absolute top-[935px] left-[32%] sm:left-[36%] flex items-center gap-6 z-10">
            {/* 3D Treasure Chest */}
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 drop-shadow-[0_18px_30px_rgba(234,179,8,0.5)]">
              <Image
                src="/images/journey/treasure.jpg"
                alt="Treasure Chest"
                fill
                unoptimized
                className="object-contain rounded-2xl"
              />
            </div>

            {/* Mega Reward Card */}
            <div className="bg-white/95 border border-amber-200/90 rounded-2xl p-4 shadow-md backdrop-blur-xs max-w-xs">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-purple-700 uppercase tracking-wide">
                <span>💎</span>
                <span>Mega Reward</span>
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-snug">
                Complete all milestones to earn amazing rewards! 🎁
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Working Progress & Milestone Rewards Panel */}
        <aside className="w-full lg:w-[30%] shrink-0 space-y-6 lg:sticky lg:top-20">
          
          {/* Card: Your Progress */}
          <div className="rounded-3xl border border-purple-100 bg-white/95 p-6 shadow-lg shadow-purple-500/5 backdrop-blur-md space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-purple-600 font-extrabold">📈</span>
              <h2 className="text-base font-extrabold text-slate-900">Your Progress</h2>
            </div>

            {/* Progress Count & Segmented Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-[#7C3AED]">3 of 5 milestones completed</span>
                <span className="text-slate-800 font-black">{progressPct}%</span>
              </div>
              {/* Segmented Progress Bar */}
              <div className="flex items-center gap-1 w-full h-2">
                <div className="flex-1 h-full rounded-full bg-emerald-500" />
                <div className="flex-1 h-full rounded-full bg-emerald-500" />
                <div className="flex-1 h-full rounded-full bg-emerald-500" />
                <div className="flex-1 h-full rounded-full bg-slate-200" />
                <div className="flex-1 h-full rounded-full bg-slate-200" />
              </div>
            </div>

            {/* Milestone Rewards Grid */}
            <div className="pt-1">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2.5">
                Milestone Rewards
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                {/* Reward 1 */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-emerald-200 bg-emerald-50/60">
                  <span className="text-lg">🪙</span>
                  <span className="text-xs font-black text-slate-900 mt-0.5">100</span>
                  <div className="mt-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <IconCheck className="h-2 w-2 stroke-[3]" />
                  </div>
                </div>

                {/* Reward 2 */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-emerald-200 bg-emerald-50/60">
                  <span className="text-lg">💎</span>
                  <span className="text-xs font-black text-slate-900 mt-0.5">10</span>
                  <div className="mt-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <IconCheck className="h-2 w-2 stroke-[3]" />
                  </div>
                </div>

                {/* Reward 3: Active Outline */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl border-2 border-purple-500 bg-purple-50/80 shadow-xs ring-2 ring-purple-200">
                  <span className="text-lg">⭐</span>
                  <span className="text-xs font-black text-[#7C3AED] mt-0.5">XP 200</span>
                </div>

                {/* Reward 4: Locked */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                  <IconLock className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 mt-1">Locked</span>
                </div>

                {/* Reward 5: Locked */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                  <IconLock className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 mt-1">Locked</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
              Complete all milestones to earn mega rewards! 🎁
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}

export default JourneyMapView;
