"use client";

import React from "react";
import Link from "next/link";
import {
  MountainHeroLandscape,
  CircularProgress40,
} from "@/frontend/components/dashboard/Illustrations";
import { InteractiveSkillMapTree } from "@/frontend/components/dashboard/InteractiveSkillMapTree";
import {
  YourPlanForToday,
  AchievementsWidget,
  WeeklyProgressWidget,
} from "@/frontend/components/dashboard/RightColumnWidgets";
import {
  IconCheck,
  IconBrain,
  IconChartBar,
  IconArrowRight,
  IconChevronRight,
} from "@tabler/icons-react";

interface QuestDashboardProps {
  displayName?: string;
  level?: number;
  levelTitle?: string;
  xp?: number;
  xpIntoLevel?: number;
  xpForNextLevel?: number;
  streak?: number;
  badgeCount?: number;
}

export function QuestDashboard({}: QuestDashboardProps) {
  const currentStep = 3;
  const totalSteps = 5;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 max-w-[1440px]">
      
      {/* ======================= LEFT MAIN COLUMN (8 of 12) ======================= */}
      <div className="space-y-6 lg:col-span-8">
        
        {/* 1. CURRENT QUEST HERO CARD (Mountain Landscape Card) */}
        <div className="relative overflow-hidden rounded-lg border border-slate-200/70 bg-gradient-to-r from-[#FAF8FE] via-[#F5F1FD] to-[#EDE5FD] p-7 sm:p-8 shadow-sm min-h-[220px] flex flex-col justify-between">
          
          {/* Vector Mountain Landscape Illustration Layer */}
          <MountainHeroLandscape />

          {/* Top Row: Left Title & Right 40% Complete Radial Progress Ring */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#7C3AED]">
                CURRENT QUEST
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Master Calculus Basics
              </h2>
              <p className="mt-1 text-xs sm:text-sm font-normal text-slate-500 max-w-md">
                Build a strong foundation before moving forward.
              </p>
            </div>

            {/* Top Right: 40% Complete Ring */}
            <div className="shrink-0 -mt-2 -mr-1">
              <CircularProgress40 className="w-24 h-24" />
            </div>
          </div>

          {/* Bottom Row: Left Stepper & Right Continue Learning Pill Button */}
          <div className="relative z-10 mt-6 flex flex-wrap items-end justify-between gap-4">
            
            {/* Stepper Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((step, idx) => {
                  const isCompleted = step < currentStep;
                  const isCurrent = step === currentStep;

                  return (
                    <React.Fragment key={step}>
                      {idx > 0 && (
                        <div
                          className={`h-[2px] w-6 sm:w-8 transition-colors ${
                            step < currentStep
                              ? "bg-emerald-500"
                              : step === currentStep
                              ? "bg-[#7C3AED]"
                              : "bg-slate-300"
                          }`}
                        />
                      )}
                      <div
                        className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md text-xs font-bold transition-all ${
                          isCompleted
                            ? "bg-emerald-500 text-white shadow-sm"
                            : isCurrent
                            ? "bg-[#7C3AED] text-white shadow-md ring-4 ring-purple-100"
                            : "border border-slate-300 bg-white text-slate-400"
                        }`}
                      >
                        {isCompleted ? <IconCheck className="h-4 w-4 stroke-[3]" /> : step}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="text-xs font-semibold text-slate-700">
                Step {currentStep} of {totalSteps} • <span className="text-slate-500 font-normal">Differentiation</span>
              </div>
            </div>

            {/* Bottom Right: Continue Learning Button */}
            <div>
              <Link
                href="/goals/new"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_6px_20px_rgba(109,40,217,0.35)] transition-all hover:scale-105"
              >
                <span>Continue Learning</span>
                <IconArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
            </div>

          </div>
        </div>

        {/* 2. CONTINUE YOUR LEARNING SECTION */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Continue Your Learning
            </h3>
            <Link href="/goals/new" className="text-xs font-bold text-[#6D28D9] hover:underline">
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Card 1: AI & Machine Learning */}
            <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#EDE9FE] text-[#7C3AED] shrink-0">
                  <IconBrain className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    AI & Machine Learning
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    AI Developer Journey
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                    <span className="text-slate-500">3 of 10 checkpoints</span>
                    <span className="text-[#6D28D9]">32%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-sm bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-sm bg-[#7C3AED]" style={{ width: "32%" }} />
                  </div>
                </div>

                <Link
                  href="/goals/new"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#DDD6FE] transition-colors shrink-0 shadow-sm"
                >
                  <IconChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Data Science */}
            <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#D1FAE5] text-[#059669] shrink-0">
                  <IconChartBar className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Data Science
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Discover your path
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="h-1.5 w-full rounded-sm bg-slate-100 overflow-hidden mb-1.5">
                    <div className="h-full rounded-sm bg-[#059669]" style={{ width: "15%" }} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Start your assessment
                  </span>
                </div>

                <Link
                  href="/goals/new"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-[#D1FAE5] text-[#059669] hover:bg-[#A7F3D0] transition-colors shrink-0 shadow-sm"
                >
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE SKILL MAP TREE */}
        <InteractiveSkillMapTree />

      </div>

      {/* ======================= RIGHT SIDEBAR COLUMN (4 of 12) ======================= */}
      <div className="space-y-6 lg:col-span-4">
        {/* 1. Your Plan for Today */}
        <YourPlanForToday />

        {/* 2. Achievements */}
        <AchievementsWidget />

        {/* 3. Weekly Progress */}
        <WeeklyProgressWidget />
      </div>

    </div>
  );
}
