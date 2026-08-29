"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  StarHexagonBadge,
  FlameHexagonBadge,
  CompassHexagonBadge,
} from "@/frontend/components/dashboard/Illustrations";
import {
  IconCheck,
  IconArrowRight,
  IconCalendar,
  IconTrendingUp,
  IconLock,
} from "@tabler/icons-react";

/**
 * 1. Your Plan for Today Widget
 */
export function YourPlanForToday({ hasGoals = false }: { hasGoals?: boolean }) {
  const [plans, setPlans] = useState([
    { id: 1, title: "Limits and Continuity", duration: "20 min", status: "completed" },
    { id: 2, title: "Differentiation Basics", duration: "25 min", status: "active" },
    { id: 3, title: "Practice Problems", duration: "15 min", status: "pending" },
    { id: 4, title: "Mini Quiz", duration: "10 min", status: "pending" },
  ]);

  const toggleItem = (id: number) => {
    setPlans((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "completed"
                  ? "pending"
                  : item.status === "active"
                  ? "completed"
                  : "active",
            }
          : item
      )
    );
  };

  if (!hasGoals) {
    return (
      <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Your Plan for Today</h3>
          <span className="text-[11px] font-bold text-slate-400">0 Tasks</span>
        </div>
        <div className="py-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-[#7C3AED] flex items-center justify-center mx-auto">
            <IconCalendar className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-800">No active tasks yet</div>
          <p className="text-[11px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
            Start a quest to generate daily practice milestones and personalized learning quizzes.
          </p>
          <Link
            href="/goals/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#7C3AED] text-white text-xs font-bold shadow-xs hover:bg-[#6D28D9] transition-colors mt-2"
          >
            <span>Start a Quest</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Your Plan for Today</h3>
        <Link href="/goals/new" className="text-xs font-bold text-[#6D28D9] hover:underline">
          View all
        </Link>
      </div>

      {/* Plan Checklist Items */}
      <div className="space-y-3">
        {plans.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`flex items-center justify-between p-2.5 rounded-md transition-all cursor-pointer ${
              item.status === "active"
                ? "bg-purple-50/70 border border-purple-200/60"
                : "hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Status Radio / Check Box */}
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm transition-colors ${
                  item.status === "completed"
                    ? "bg-[#7C3AED] text-white"
                    : item.status === "active"
                    ? "border-2 border-[#7C3AED] bg-white text-[#7C3AED]"
                    : "border-2 border-slate-300 bg-white"
                }`}
              >
                {item.status === "completed" && <IconCheck className="h-3 w-3 stroke-[3]" />}
                {item.status === "active" && <span className="h-1.5 w-1.5 bg-[#7C3AED]" />}
              </div>

              <span
                className={`text-xs font-semibold ${
                  item.status === "completed"
                    ? "text-slate-600 line-through opacity-80"
                    : item.status === "active"
                    ? "text-slate-900 font-bold"
                    : "text-slate-700"
                }`}
              >
                {item.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400">{item.duration}</span>
              {item.status === "active" && (
                <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-[#EDE9FE] text-[#6D28D9]">
                  <IconArrowRight className="h-3 w-3 stroke-[2.5]" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs font-semibold text-slate-500">
          Total time • <span className="font-bold text-slate-800">~ 50 min</span>
        </span>
        <button className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#DDD6FE] transition-colors">
          <IconCalendar className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * 2. Achievements Widget with Exact 3D Hexagonal Badges
 */
export function AchievementsWidget({
  streak = 0,
  xp = 0,
  badgeCount = 0,
}: {
  streak?: number;
  xp?: number;
  badgeCount?: number;
}) {
  const isNewUser = badgeCount === 0;

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Achievements</h3>
        <Link href="/achievements" className="text-xs font-bold text-[#6D28D9] hover:underline">
          View all
        </Link>
      </div>

      {/* 3 Exact Hexagonal Badges */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Badge 1: First Steps (Star Hexagon) */}
        <div className="rounded-md border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <StarHexagonBadge className={`w-14 h-14 mb-2 ${isNewUser ? "opacity-75 grayscale-30" : ""}`} />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">First Steps</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            Complete your first quest
          </div>
          <div className="mt-2.5 w-full">
            {isNewUser ? (
              <span className="inline-flex items-center justify-center gap-1 w-full rounded-sm bg-slate-100 border border-slate-200 py-0.5 text-[9px] font-bold text-slate-500">
                <IconLock className="h-2.5 w-2.5" />
                <span>0/1 Quest</span>
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-1 w-full rounded-sm bg-emerald-50 border border-emerald-200/60 py-0.5 text-[9px] font-bold text-emerald-700">
                <IconCheck className="h-2.5 w-2.5 stroke-[3]" />
                <span>Completed</span>
              </span>
            )}
          </div>
        </div>

        {/* Badge 2: Streak Starter (Flame Hexagon) */}
        <div className="rounded-md border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <FlameHexagonBadge className={`w-14 h-14 mb-2 ${streak < 3 ? "opacity-75 grayscale-30" : ""}`} />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">Streak Starter</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            Maintain a 3-day streak
          </div>
          <div className="mt-2.5 w-full">
            <span className="inline-flex items-center justify-center gap-1 w-full rounded-sm bg-purple-50 border border-purple-200/60 py-0.5 text-[9px] font-bold text-[#6D28D9]">
              <span>{streak}/3 days</span>
            </span>
          </div>
        </div>

        {/* Badge 3: Explorer (Compass Hexagon) */}
        <div className="rounded-md border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <CompassHexagonBadge className="w-14 h-14 mb-2 opacity-75 grayscale-30" />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">Explorer</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            Complete 5 checkpoints
          </div>
          <div className="mt-2.5 w-full">
            <span className="inline-flex items-center justify-center gap-1 w-full rounded-sm bg-purple-50 border border-purple-200/60 py-0.5 text-[9px] font-bold text-[#6D28D9]">
              <span>0/5 goals</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Weekly Progress Widget with Bar Chart
 */
export function WeeklyProgressWidget() {
  const days = [
    { label: "Mon", height: "h-8", active: false },
    { label: "Tue", height: "h-14", active: false },
    { label: "Wed", height: "h-20", active: false },
    { label: "Thu", height: "h-16", active: false },
    { label: "Fri", height: "h-24", active: false },
    { label: "Sat", height: "h-10", active: false },
    { label: "Sun", height: "h-6", active: false },
  ];

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Weekly Progress</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-bold text-[#6D28D9]">0 hrs</span>
            <span className="text-[11px] text-slate-400 font-medium">this week</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
          <IconTrendingUp className="h-3.5 w-3.5" />
          <span>New Week</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end justify-between gap-2 pt-3 h-28 border-b border-slate-100 pb-2">
        {days.map((day) => (
          <div key={day.label} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-full flex items-end justify-center h-20">
              <div
                className={`w-full max-w-[20px] rounded-t-sm transition-all bg-slate-100 h-2`}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-400">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
