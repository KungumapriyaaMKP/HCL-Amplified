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
}

export function AppSidebar({
  displayName = "Yuvi",
  level = 1,
  levelTitle = "Newcomer",
}: AppSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: IconSmartHome },
    { label: "My Quests", href: "/goals/new", icon: IconTarget },
    { label: "Skill Map", href: "/dashboard#skill-map", icon: IconGitFork },
    { label: "Explore", href: "/community", icon: IconCompass },
    { label: "Leaderboard", href: "/leaderboard", icon: IconTrophy },
    { label: "Achievements", href: "/profile", icon: IconAward },
    { label: "Resources", href: "/dashboard#resources", icon: IconBook },
    { label: "Profile", href: "/profile", icon: IconUser },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-100 flex flex-col justify-between p-5 min-h-screen">
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
            <div className="text-[11px] font-normal text-slate-400">
              Level up your future
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-md text-sm font-semibold transition-all ${
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

      {/* Bottom Section */}
      <div className="pt-4 border-t border-slate-100">
        {/* User Profile Footer */}
        <Link
          href="/profile"
          className="flex items-center justify-between p-2 rounded-md hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#6D28D9] text-xs font-bold text-white shadow-sm">
              {displayName[0]?.toUpperCase() || "Y"}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {displayName}
              </div>
              <div className="text-[10px] font-medium text-slate-400">
                Level {level} • {levelTitle}
              </div>
            </div>
          </div>
          <IconChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>
    </aside>
  );
}
