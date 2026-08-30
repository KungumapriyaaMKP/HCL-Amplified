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

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
    router.refresh();
  }

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
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-none text-sm font-bold tracking-tight transition-all ${
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

          {/* Log Out Nav Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-none text-sm font-bold tracking-tight text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer select-none group text-left mt-1"
          >
            <IconLogout className="w-5 h-5 stroke-[2.2] shrink-0 text-slate-600 group-hover:text-rose-600 transition-colors" />
            <span>Log Out</span>
          </button>
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-none border border-slate-100 bg-white hover:border-purple-200 transition-all">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 flex-1 min-w-0 group"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-sm font-black text-white shadow-xs">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 leading-tight truncate">
                {displayName}
              </div>
              <div className="text-[10px] font-medium text-slate-500 truncate">
                Level {level} • {levelTitle}
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 rounded-none text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <IconLogout className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
