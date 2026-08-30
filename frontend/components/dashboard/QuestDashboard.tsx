"use client";

import React from "react";
import Link from "next/link";
import {
  MountainHeroLandscape,
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
  IconArrowRight,
  IconSparkles,
  IconCode,
  IconDatabase,
} from "@tabler/icons-react";

export interface QuestDashboardGoal {
  id: string;
  goalText?: string;
  domain?: string;
  targetRole?: string | null;
  targetSkillIds?: string[] | null;
  targetTimelineWeeks?: number | null;
  totalModules: number;
  completedModules: number;
  modules?: {
    id: string;
    skillId?: string;
    skillName: string;
    resourceTitle?: string;
    status: string;
    milestoneType?: string;
    order?: number;
  }[];
  nextAction?: {
    moduleId: string;
    skillName: string;
    resourceTitle: string;
    status: string;
  } | null;
}

interface QuestDashboardProps {
  displayName?: string;
  level?: number;
  levelTitle?: string;
  xp?: number;
  xpIntoLevel?: number;
  xpForNextLevel?: number;
  streak?: number;
  freezes?: number;
  badgeCount?: number;
  goals?: QuestDashboardGoal[];
  activeGoalId?: string;
  activeAiGoalId?: string;
  activeDataScienceGoalId?: string;
}

export function QuestDashboard({
  displayName = "Learner",
  level = 1,
  levelTitle = "Newcomer",
  xp = 0,
  xpIntoLevel = 0,
  xpForNextLevel = 50,
  streak = 0,
  freezes = 0,
  badgeCount = 0,
  goals = [],
  activeGoalId,
  activeAiGoalId,
  activeDataScienceGoalId,
}: QuestDashboardProps) {
  const hasGoals = goals.length > 0;
  const activeGoal = hasGoals ? goals[0] : null;

  const currentStep = activeGoal ? activeGoal.completedModules + 1 : 1;
  const totalSteps = activeGoal ? Math.max(activeGoal.totalModules, 5) : 3;
  const progressPercent = activeGoal
    ? Math.round((activeGoal.completedModules / (activeGoal.totalModules || 1)) * 100)
    : 0;

  const aiGoalLink = activeAiGoalId ? `/goals/${activeAiGoalId}` : (activeGoalId ? `/goals/${activeGoalId}` : "/goals/new");
  const webGoalLink = activeGoalId ? `/goals/${activeGoalId}` : "/goals/new";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 max-w-[1440px]">
      
      {/* ======================= LEFT MAIN COLUMN (8 of 12) ======================= */}
      <div className="space-y-6 lg:col-span-8">
        
        {/* 1. CURRENT QUEST HERO CARD */}
        <div className="relative overflow-hidden rounded-sm border border-slate-200/90 bg-gradient-to-r from-[#FAF8FE] via-[#F5F1FD] to-[#EDE5FD] p-7 sm:p-8 shadow-2xs min-h-[220px] flex flex-col justify-between">
          
          {/* Vector Mountain Landscape Illustration Layer */}
          <MountainHeroLandscape />

          {/* Top Row: Left Title & Right Progress Ring */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#7C3AED] flex items-center gap-1.5">
                <span>{hasGoals ? "CURRENT QUEST" : "WELCOME TO QUESTLEARN"}</span>
                <IconSparkles className="w-3.5 h-3.5" />
              </div>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {hasGoals ? (activeGoal?.goalText || activeGoal?.targetRole || "Master Learning Path") : "Start Your First Quest"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm font-normal text-slate-600 max-w-md">
                {hasGoals
                  ? "Build a strong foundation and complete modules to earn XP and rank up."
                  : "Set your target role or topic, and let AI build your personalized adaptive learning journey."}
              </p>
            </div>

            {/* Top Right: High-Contrast Elevated Progress Pod */}
            <div className="shrink-0 -mt-1 -mr-1">
              <div className="relative flex items-center justify-center w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-white/95 border-2 border-purple-200/90 shadow-md p-1.5 backdrop-blur-md">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="dashboardProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#6D28D9" />
                    </linearGradient>
                  </defs>
                  {/* Background Track with crisp contrast */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="9"
                  />
                  {/* Active Progress Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="url(#dashboardProgressGrad)"
                    strokeWidth="9"
                    strokeDasharray={238.76}
                    strokeDashoffset={238.76 - (238.76 * Math.max(progressPercent, 0)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                  <span className="text-base sm:text-lg font-black text-slate-900 leading-none tracking-tight">
                    {progressPercent}%
                  </span>
                  <span className="text-[9px] font-extrabold text-[#6D28D9] uppercase tracking-wider mt-0.5">
                    COMPLETE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Left Stepper & Right CTA Button */}
          <div className="relative z-10 mt-6 flex flex-wrap items-end justify-between gap-4">
            
            {/* Stepper Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {hasGoals ? (
                  Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, idx) => {
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
                          className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xs text-xs font-bold transition-all ${
                            isCompleted
                              ? "bg-emerald-500 text-white shadow-xs"
                              : isCurrent
                              ? "bg-[#7C3AED] text-white shadow-xs ring-4 ring-purple-100"
                              : "border border-slate-300 bg-white text-slate-400"
                          }`}
                        >
                          {isCompleted ? <IconCheck className="h-4 w-4 stroke-[3]" /> : step}
                        </div>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-white border border-purple-200 text-xs font-bold text-[#6D28D9] shadow-2xs">
                      <span>1. Choose Goal</span>
                    </div>
                    <div className="h-[2px] w-4 bg-purple-300" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-white/80 border border-slate-200 text-xs font-medium text-slate-600">
                      <span>2. AI Diagnostic</span>
                    </div>
                    <div className="h-[2px] w-4 bg-slate-300" />
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-white/80 border border-slate-200 text-xs font-medium text-slate-600">
                      <span>3. Level Up</span>
                    </div>
                  </>
                )}
              </div>

              <div className="text-xs font-semibold text-slate-700">
                {hasGoals ? (
                  <>
                    Step {currentStep} of {totalSteps} •{" "}
                    <span className="text-slate-500 font-normal">
                      {activeGoal?.nextAction?.skillName || "In Progress"}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 font-medium">Ready to begin your adaptive learning journey</span>
                )}
              </div>
            </div>

            {/* Bottom Right: Continue / Create Learning Button */}
            <div>
              <Link
                href={hasGoals ? `/goals/${activeGoal?.id}` : "/goals/new"}
                className="inline-flex items-center gap-2 rounded-xs bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all hover:scale-[1.02]"
              >
                <span>{hasGoals ? "Continue Learning" : "Create a Quest"}</span>
                <IconArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
            </div>

          </div>
        </div>

        {/* 2. CONTINUE YOUR LEARNING / YOUR ACTIVE PATHWAYS */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {hasGoals ? "Continue Your Pathways" : "Recommended Pathways"}
            </h3>
            <Link href="/goals/new" className="text-xs font-bold text-[#6D28D9] hover:underline">
              {hasGoals ? "+ Start New Pathway" : "Explore all topics"}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* If user has started goals, render their actual active pathways! */}
            {hasGoals && goals.map((goal) => {
              const goalPercent = Math.round((goal.completedModules / Math.max(1, goal.totalModules)) * 100);
              const isAi = goal.domain === "ai-ml";
              const isWeb = goal.domain === "web-dev";
              const isData = goal.domain === "data-science";

              const badgeGradient = isAi
                ? "from-[#7C3AED] via-[#6D28D9] to-[#4C1D95]"
                : isWeb
                ? "from-[#059669] via-[#047857] to-[#065F46]"
                : isData
                ? "from-[#0284C7] via-[#0369A1] to-[#075985]"
                : "from-[#D97706] via-[#B45309] to-[#92400E]";

              const barColor = isAi ? "bg-[#7C3AED]" : isWeb ? "bg-[#059669]" : isData ? "bg-[#0284C7]" : "bg-[#D97706]";
              const hoverBorder = isAi ? "hover:border-purple-300" : isWeb ? "hover:border-emerald-300" : isData ? "hover:border-sky-300" : "hover:border-amber-300";

              return (
                <div
                  key={goal.id}
                  className={`rounded-sm border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:shadow-md ${hoverBorder} flex flex-col justify-between group`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xs bg-gradient-to-br ${badgeGradient} text-white shadow-sm ring-1 ring-purple-300/40 shrink-0`}>
                      {isAi && <IconBrain className="h-6 w-6 stroke-[1.8]" />}
                      {isWeb && <IconCode className="h-6 w-6 stroke-[2.2]" />}
                      {isData && <IconDatabase className="h-6 w-6 stroke-[1.8]" />}
                      {!isAi && !isWeb && !isData && <IconSparkles className="h-6 w-6 stroke-[1.8]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#6D28D9] transition-colors truncate">
                        {goal.goalText || goal.targetRole || (isAi ? "AI & Machine Learning" : isWeb ? "Full-Stack Web Dev" : "Learning Pathway")}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed truncate">
                        {goal.nextAction
                          ? `Next: ${goal.nextAction.skillName}`
                          : goal.targetRole || `${goal.totalModules} Modules Enrolled`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                        <span className="text-slate-500 font-bold">
                          {goal.completedModules > 0 ? `${goalPercent}% Complete` : "In Progress"}
                        </span>
                        <span className="text-[#6D28D9] font-black">
                          {goal.completedModules}/{goal.totalModules} Modules
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-xs bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-xs ${barColor} transition-all duration-500`}
                          style={{ width: `${Math.max(goalPercent, 6)}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/goals/${goal.id}`}
                      className="flex h-8 w-8 items-center justify-center rounded-xs bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-[#6D28D9] group-hover:border-[#6D28D9] group-hover:text-white transition-all shrink-0 shadow-2xs"
                      title="Continue Pathway"
                    >
                      <IconArrowRight className="h-4 w-4 stroke-[2.2]" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* If user has 0 or 1 goal, show starter pathways so there are always at least 2 cards */}
            {(!hasGoals || goals.length === 1) && (
              <>
                {(!hasGoals || goals[0]?.domain !== "ai-ml") && (
                  <div className="rounded-sm border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:shadow-md hover:border-purple-300 flex flex-col justify-between group">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xs bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] text-white shadow-sm ring-1 ring-purple-300/40 shrink-0">
                        <IconBrain className="h-6 w-6 stroke-[1.8]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#6D28D9] transition-colors">
                          AI & Machine Learning
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          Python, Neural Networks, PyTorch & LLMs
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                          <span className="text-slate-500">Starter Pathway</span>
                          <span className="text-[#6D28D9] font-black">12 Modules</span>
                        </div>
                        <div className="h-1.5 w-full rounded-xs bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-xs bg-[#7C3AED]" style={{ width: "0%" }} />
                        </div>
                      </div>

                      <Link
                        href={aiGoalLink}
                        className="flex h-8 w-8 items-center justify-center rounded-xs bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-[#6D28D9] group-hover:border-[#6D28D9] group-hover:text-white transition-all shrink-0 shadow-2xs"
                        title="Start Path"
                      >
                        <IconArrowRight className="h-4 w-4 stroke-[2.2]" />
                      </Link>
                    </div>
                  </div>
                )}

                {(!hasGoals || goals[0]?.domain !== "web-dev") && (
                  <div className="rounded-sm border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:shadow-md hover:border-emerald-300 flex flex-col justify-between group">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xs bg-gradient-to-br from-[#059669] via-[#047857] to-[#065F46] text-white shadow-sm ring-1 ring-emerald-300/40 shrink-0">
                        <IconCode className="h-6 w-6 stroke-[2.2]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#059669] transition-colors">
                          Full-Stack Web Dev
                        </h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          React, Next.js, Node.js & Database Architecture
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                          <span className="text-slate-500">Starter Pathway</span>
                          <span className="text-[#059669] font-black">15 Modules</span>
                        </div>
                        <div className="h-1.5 w-full rounded-xs bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-xs bg-[#059669]" style={{ width: "0%" }} />
                        </div>
                      </div>

                      <Link
                        href={webGoalLink}
                        className="flex h-8 w-8 items-center justify-center rounded-xs bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-[#059669] group-hover:border-[#059669] group-hover:text-white transition-all shrink-0 shadow-2xs"
                        title="Start Path"
                      >
                        <IconArrowRight className="h-4 w-4 stroke-[2.2]" />
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 3. INTERACTIVE SKILL MAP TREE */}
        <InteractiveSkillMapTree
          hasGoals={hasGoals}
          goalId={activeGoal?.id}
          goalTitle={activeGoal?.goalText || activeGoal?.targetRole || "Web Development"}
          domain={activeGoal?.domain}
          modules={activeGoal?.modules}
        />

      </div>

      {/* ======================= RIGHT SIDEBAR COLUMN (4 of 12) ======================= */}
      <div className="space-y-6 lg:col-span-4">
        {/* 1. Your Plan for Today */}
        <YourPlanForToday hasGoals={hasGoals} />

        {/* 2. Achievements */}
        <AchievementsWidget streak={streak} xp={xp} badgeCount={badgeCount} />

        {/* 3. Weekly Progress */}
        <WeeklyProgressWidget />
      </div>

    </div>
  );
}
