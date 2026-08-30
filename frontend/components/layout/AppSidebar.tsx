"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  QuestLearnBrandIcon,
  RocketBlastingIllustration,
  NeedResourcesBooksIllustration,
} from "@/frontend/components/dashboard/Illustrations";
import {
  IconSmartHome,
  IconTarget,
  IconListCheck,
  IconGitFork,
  IconRotateClockwise,
  IconCompass,
  IconTrophy,
  IconAward,
  IconBook,
  IconUser,
  IconLogout,
  IconArrowRight,
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
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: IconSmartHome },
    { label: "My Quests", href: activeGoalId ? `/goals/${activeGoalId}` : "/goals/new", icon: IconTarget },
    { label: "To-Do List", href: "/todo", icon: IconListCheck },
    { label: "Spaced Review", href: "/review", icon: IconRotateClockwise },
    { label: "Skill Map", href: activeGoalId ? `/goals/${activeGoalId}/graph` : "/dashboard#skill-map", icon: IconGitFork },
    { label: "Explore", href: "/community", icon: IconCompass },
    { label: "Leaderboard", href: "/leaderboard", icon: IconTrophy },
    { label: "Achievements", href: "/achievements", icon: IconAward },
    { label: "Resources", href: "/resources", icon: IconBook },
    { label: "Profile", href: "/profile", icon: IconUser },
  ];

  const isResourcesPage = pathname === "/resources";

  return (
    <aside className="relative z-30 w-64 shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between p-5 min-h-screen shadow-2xs">
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
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/community" && pathname.startsWith("/community")) ||
              (item.href === "/dashboard" && pathname === "/dashboard") ||
              (item.href === "/achievements" && pathname === "/achievements") ||
              (item.href === "/resources" && pathname === "/resources") ||
              (item.href === "/todo" && pathname === "/todo") ||
              (item.href === "/review" && pathname === "/review") ||
              (item.href === "/leaderboard" && pathname === "/leaderboard");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xs text-sm font-bold tracking-tight transition-all ${
                  isActive
                    ? "bg-[#6D28D9] text-white shadow-sm shadow-purple-500/20 font-extrabold"
                    : "text-slate-900 hover:bg-purple-50 hover:text-[#6D28D9]"
                }`}
              >
                <Icon className={`w-5 h-5 stroke-[2.2] shrink-0 ${isActive ? "text-white" : "text-slate-800 group-hover:text-[#6D28D9]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <Link
          href="/profile"
          className="flex items-center justify-between p-2 rounded-xs border border-slate-100 bg-white hover:border-purple-200 hover:bg-purple-50/50 transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-sm font-black text-white shadow-xs">
              {displayName.charAt(0).toUpperCase()}
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
        </Link>
      </div>
    </aside>
  );
}
