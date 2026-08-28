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
} from "@tabler/icons-react";

/**
 * 1. Your Plan for Today Widget
 */
export function YourPlanForToday() {
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
export function AchievementsWidget() {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Achievements</h3>
        <Link href="/profile" className="text-xs font-bold text-[#6D28D9] hover:underline">
          View all
        </Link>
      </div>

      {/* 3 Exact Hexagonal Badges */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Badge 1: First Steps (Star Hexagon) */}
        <div className="rounded-md border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <StarHexagonBadge className="w-14 h-14 mb-2" />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">First Steps</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            Complete your first quest
          </div>
          <div className="mt-2.5 w-full">
            <span className="inline-flex items-center justify-center gap-1 w-full rounded-sm bg-emerald-50 border border-emerald-200/60 py-0.5 text-[9px] font-bold text-emerald-700">
              <IconCheck className="h-2.5 w-2.5 stroke-[3]" />
              <span>Completed</span>
            </span>
          </div>
        </div>

        {/* Badge 2: Streak Starter (Flame Hexagon) */}
        <div className="rounded-md border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <FlameHexagonBadge className="w-14 h-14 mb-2" />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">Streak Starter</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            Maintain a 3-day streak
          </div>
          <div className="mt-2.5 w-full">
            <div className="text-[9px] font-bold text-slate-500 mb-1">0 / 3</div>
            <div className="h-1.5 w-full rounded-sm bg-slate-200 overflow-hidden">
              <div className="h-full rounded-sm bg-[#7C3AED]" style={{ width: "0%" }} />
            </div>
          </div>
        </div>

        {/* Badge 3: Explorer (Compass Hexagon) */}
        <div className="rounded-md border border-slate-100 bg-[#FAFBFD] p-3 flex flex-col items-center text-center">
          <CompassHexagonBadge className="w-14 h-14 mb-2" />
          <div className="text-[11px] font-bold text-slate-900 leading-tight">Explorer</div>
          <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
            Complete 5 checkpoints
          </div>
          <div className="mt-2.5 w-full">
            <div className="text-[9px] font-bold text-slate-500 mb-1">1 / 5</div>
            <div className="h-1.5 w-full rounded-sm bg-slate-200 overflow-hidden">
              <div className="h-full rounded-sm bg-[#0284C7]" style={{ width: "20%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 3. Weekly Progress Widget
 */
export function WeeklyProgressWidget() {
  const days = [
    { day: "Mon", height: 50 },
    { day: "Tue", height: 35 },
    { day: "Wed", height: 95, isPeak: true },
    { day: "Thu", height: 65 },
    { day: "Fri", height: 30 },
    { day: "Sat", height: 20 },
    { day: "Sun", height: 15 },
  ];

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900">Weekly Progress</h3>
        <Link href="/profile" className="text-xs font-bold text-[#6D28D9] hover:underline">
          View insights
        </Link>
      </div>

      <div className="flex items-end justify-between gap-4">
        {/* 7-Day Bar Chart */}
        <div className="flex items-end gap-2 sm:gap-2.5 flex-1 h-20 pt-2">
          {days.map((item) => (
            <div key={item.day} className="flex flex-col items-center flex-1 h-full justify-end group">
              <div className="relative w-full flex justify-center">
                <div
                  className={`w-3.5 sm:w-4 rounded-t-sm transition-all group-hover:opacity-80 ${
                    item.isPeak ? "bg-[#7C3AED] shadow-sm" : "bg-[#A78BFA]"
                  }`}
                  style={{ height: `${(item.height / 100) * 55}px` }}
                />
              </div>
              <span className="mt-1.5 text-[9px] font-semibold text-slate-400">{item.day}</span>
            </div>
          ))}
        </div>

        {/* Right Summary Statistics */}
        <div className="shrink-0 pl-2 text-right">
          <div className="text-[10px] font-semibold text-slate-400">This Week</div>
          <div className="text-xl font-extrabold text-slate-900 leading-tight">2.5 hrs</div>
          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-600">
            <IconTrendingUp className="h-3 w-3" />
            <span>+1.2 hrs vs last week</span>
          </div>
        </div>
      </div>
    </div>
  );
}
