"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GoalSwitcher } from "@/frontend/components/layout/GoalSwitcher";
import {
  IconCompass,
  IconTrophy,
  IconUsers,
  IconUser,
  IconPlus,
  IconChevronDown,
} from "@tabler/icons-react";
import { QuestLearnBrandIcon } from "@/frontend/components/dashboard/Illustrations";

export function Nav({ displayName = "yuvi" }: { displayName?: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white shadow-xs">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-8">
        
        {/* Brand & Goal Switcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/dashboard" className="group flex items-center gap-2.5 transition-transform hover:scale-102">
            <QuestLearnBrandIcon className="h-8 w-8" />
            <div>
              <div className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                Quest<span className="text-[#7C3AED]">Learn</span>
              </div>
              <div className="text-[8px] font-bold tracking-[0.2em] text-slate-400 uppercase">
                LEVEL UP YOUR FUTURE
              </div>
            </div>
          </Link>
          <GoalSwitcher />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-5 text-xs font-semibold">
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${
              pathname === "/dashboard"
                ? "text-[#2563EB] font-bold border-b-2 border-[#2563EB] rounded-none"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <IconCompass className="h-4 w-4" />
            <span className="hidden sm:inline">Quests</span>
          </Link>
          <Link
            href="/leaderboard"
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${
              pathname === "/leaderboard"
                ? "text-[#2563EB] font-bold border-b-2 border-[#2563EB] rounded-none"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <IconTrophy className="h-4 w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Link>
          <Link
            href="/community"
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${
              pathname.startsWith("/community")
                ? "text-[#2563EB] font-bold border-b-2 border-[#2563EB] rounded-none"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <IconUsers className="h-4 w-4" />
            <span className="hidden sm:inline">Guilds</span>
          </Link>
          <Link
            href="/profile"
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors ${
              pathname === "/profile"
                ? "text-[#2563EB] font-bold border-b-2 border-[#2563EB] rounded-none"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <IconUser className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </Link>
          <Link
            href="/goals/new"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#7C3AED] px-4 py-2 text-white font-bold shadow-sm transition-all hover:opacity-95 active:scale-98"
          >
            <IconPlus className="h-4 w-4" />
            <span>New Quest</span>
          </Link>

          {/* User Profile Tag */}
          <div className="flex items-center gap-2 pl-2">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white shadow-xs">
                {displayName[0]?.toUpperCase() || "Y"}
              </div>
              <div className="hidden lg:block leading-tight">
                <div className="text-xs font-bold text-slate-900">{displayName}</div>
                <div className="text-[10px] font-medium text-slate-400">Level 1</div>
              </div>
              <IconChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </nav>

      </div>
    </header>
  );
}
