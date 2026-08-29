"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  QuestLearnBrandIcon,
} from "@/frontend/components/dashboard/Illustrations";
import {
  IconSmartHome,
  IconTarget,
  IconGitFork,
  IconCompass,
  IconTrophy,
  IconAward,
  IconBook,
  IconUser,
  IconChevronRight,
} from "@tabler/icons-react";

interface AppSidebarProps {
  displayName?: string;
  level?: number;
  levelTitle?: string;
  activeGoalId?: string;
}

export function AppSidebar({
  displayName = "yuvi",
  level = 1,
  levelTitle = "Newcomer",
  activeGoalId,
}: AppSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: IconSmartHome },
    { label: "My Quests", href: activeGoalId ? `/goals/${activeGoalId}` : "/goals/new", icon: IconTarget },
    { label: "Skill Map", href: activeGoalId ? `/goals/${activeGoalId}/graph` : "/dashboard#skill-map", icon: IconGitFork },
    { label: "Explore", href: "/community", icon: IconCompass },
    { label: "Leaderboard", href: "/leaderboard", icon: IconTrophy },
    { label: "Achievements", href: "/dashboard#achievements", icon: IconAward },
    { label: "Resources", href: "/dashboard#resources", icon: IconBook },
    { label: "Profile", href: "/profile", icon: IconUser },
  ];

  return (
    <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-100 flex-col justify-between p-5 min-h-screen">
      <div>
        {/* Brand Header */}
        <Link href="/dashboard" className="flex items-center gap-3 px-1 py-1 mb-6 group">
          <div className="shrink-0 transition-transform group-hover:scale-105">
            <QuestLearnBrandIcon className="w-9 h-9" />
          </div>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              QuestLearn
            </div>
            <div className="text-[11px] font-normal text-slate-500">
              Level up your future
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/community" && pathname.startsWith("/community")) ||
              (item.href === "/dashboard" && pathname === "/dashboard");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#EDE9FE] text-[#6D28D9]"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-[#6D28D9] stroke-[2.2]" : "text-slate-400 stroke-[1.8]"}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="pt-3">
        <Link
          href="/profile"
          className="flex flex-col gap-2 p-3 rounded-2xl border border-slate-100 bg-white shadow-xs hover:border-purple-200 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4A0E78] text-sm font-black text-white shadow-xs">
                N
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {displayName}
                </div>
                <div className="text-[10px] font-medium text-slate-500">
                  Level {level} • {levelTitle}
                </div>
              </div>
            </div>
            <IconChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          <div className="w-full space-y-1 mt-0.5">
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] rounded-full"
                style={{ width: "20%" }}
              />
            </div>
            <div className="text-[9px] font-semibold text-slate-500 text-right">
              100 / 500 XP
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
