"use client";

import React from "react";
import {
  IconSearch,
  IconBell,
  IconFlame,
  IconBookmark,
  IconLayoutColumns,
  IconBolt,
  IconAward,
  IconDiamond,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";

interface AppTopNavProps {
  displayName?: string;
  xp?: number;
  xpIntoLevel?: number;
  xpForNextLevel?: number;
  streak?: number;
  badgeCount?: number;
  rankTitle?: string;
}

export function AppTopNav({
  displayName = "Yuvi",
  xpIntoLevel = 0,
  xpForNextLevel = 50,
  streak = 0,
  badgeCount = 0,
  rankTitle = "Newcomer",
}: AppTopNavProps) {
  const xpPct = xpForNextLevel > 0 ? (xpIntoLevel / xpForNextLevel) * 100 : 0;

  return (
    <div className="space-y-6 pb-2">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Welcome Title */}
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 leading-tight">
            Good evening, <span className="text-[#6D28D9]">{displayName}!</span> 👋
          </h1>
          <p className="mt-1 text-xs sm:text-sm font-normal text-slate-500">
            Every step today builds your future.
          </p>
        </div>

        {/* Right Search Bar & Utility Icons */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex items-center">
            <IconSearch className="absolute left-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-56 sm:w-64 rounded-md border border-slate-200 bg-white py-2 pl-10 pr-12 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
            />
            <kbd className="absolute right-3 rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-200">
              ⌘ K
            </kbd>
          </div>

          {/* Notification Bell */}
          <button
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <IconBell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Flame Quick Pill */}
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <IconFlame className="h-4 w-4 fill-orange-400 text-orange-500" />
            <span className="text-xs font-bold text-slate-800">3</span>
          </div>

          {/* Bookmark Quick Icon */}
          <button
            aria-label="Bookmarks"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <IconBookmark className="h-4 w-4" />
          </button>

          {/* Layout Columns Quick Icon */}
          <button
            aria-label="Toggle Layout Columns"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <IconLayoutColumns className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 4-Pill Stat Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Stat 1: XP */}
        <div className="rounded-lg border border-slate-200/80 bg-white p-3.5 shadow-sm flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-500 shrink-0">
            <IconBolt className="h-5 w-5 fill-amber-400 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">XP</div>
            <div className="text-xs font-bold text-slate-900">{xpIntoLevel} / {xpForNextLevel}</div>
            <div className="mt-1.5 h-1 w-full rounded-sm bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-sm bg-[#7C3AED]"
                style={{ width: `${Math.max(5, Math.min(100, xpPct))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stat 2: Streak */}
        <div className="rounded-lg border border-slate-200/80 bg-white p-3.5 shadow-sm flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-50 text-orange-500 shrink-0">
            <IconFlame className="h-5 w-5 fill-orange-400 text-orange-500" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Streak</div>
            <div className="text-xs font-bold text-slate-900">{streak} days</div>
          </div>
        </div>

        {/* Stat 3: Badges */}
        <div className="rounded-lg border border-slate-200/80 bg-white p-3.5 shadow-sm flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-50 text-purple-600 shrink-0">
            <IconAward className="h-5 w-5 text-[#7C3AED]" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Badges</div>
            <div className="text-xs font-bold text-slate-900">{badgeCount}</div>
          </div>
        </div>

        {/* Stat 4: Rank */}
        <div className="rounded-lg border border-slate-200/80 bg-white p-3.5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 shrink-0">
              <IconDiamond className="h-5 w-5 fill-indigo-400 text-indigo-600" />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Rank</div>
              <div className="text-xs font-bold text-slate-900">{rankTitle}</div>
            </div>
          </div>
          <IconChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
