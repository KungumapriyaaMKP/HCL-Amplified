"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  IconBolt,
  IconFlame,
  IconTrophy,
  IconChevronDown,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";

interface AppHeaderProps {
  displayName?: string;
  xp?: number;
  streak?: number;
  badgeCount?: number;
}

export function AppHeader({
  displayName = "Yuvi",
  xp = 0,
  streak = 0,
  badgeCount = 0,
}: AppHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-7 pt-1 max-w-[1360px]">
      {/* Left Welcome Greeting */}
      <div>
        <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900 leading-tight">
          Good morning, <span className="text-[#6D28D9]">{displayName}!</span> 👋
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-normal text-slate-500">
          Let&apos;s make today a step closer to your goals.
        </p>
      </div>

      {/* Right Stats HUD & User Profile Pill */}
      <div className="flex flex-wrap items-center gap-3">
        {/* XP Stat Pill */}
        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-white px-3.5 py-2 shadow-sm">
          <IconBolt className="h-5 w-5 fill-amber-400 text-amber-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-800 leading-none">{xp.toLocaleString()}</span>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-none">XP</span>
          </div>
        </div>

        {/* Streak Stat Pill */}
        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-white px-3.5 py-2 shadow-sm">
          <IconFlame className="h-5 w-5 fill-orange-400 text-orange-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-800 leading-none">{streak}</span>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-none">Day Streak</span>
          </div>
        </div>

        {/* Badges Stat Pill */}
        <div className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-white px-3.5 py-2 shadow-sm">
          <IconTrophy className="h-5 w-5 fill-amber-300 text-amber-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-800 leading-none">{badgeCount}</span>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5 leading-none">Badges</span>
          </div>
        </div>

        {/* Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-md border border-slate-200/80 bg-white px-3 py-1.5 shadow-sm transition-all hover:bg-slate-50 focus:outline-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#7C3AED] text-xs font-bold text-white shadow-sm">
              {displayName[0]?.toUpperCase() || "Y"}
            </div>
            <span className="text-sm font-semibold text-slate-700">{displayName}</span>
            <IconChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <IconUser className="h-4 w-4 text-slate-500" />
                <span>Profile Settings</span>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <IconLogout className="h-4 w-4 text-rose-500" />
                  <span>Log out</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
