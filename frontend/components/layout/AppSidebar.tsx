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
  IconCompass,
  IconTrophy,
  IconAward,
  IconBook,
  IconUser,
  IconLogout,
  IconArrowRight,
} from "@tabler/icons-react";

interface AppSidebarProps {
  displayName?: string;
  level?: number;
  levelTitle?: string;
}

export function AppSidebar({
  displayName = "yuvi",
  level = 1,
  levelTitle = "Newcomer",
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: IconSmartHome },
    { label: "My Quests", href: "/goals/new", icon: IconTarget },
    { label: "To-Do List", href: "/todo", icon: IconListCheck },
    { label: "Skill Map", href: "/dashboard#skill-map", icon: IconGitFork },
    { label: "Explore", href: "/community", icon: IconCompass },
    { label: "Leaderboard", href: "/leaderboard", icon: IconTrophy },
    { label: "Achievements", href: "/achievements", icon: IconAward },
    { label: "Resources", href: "/resources", icon: IconBook },
    { label: "Profile", href: "/profile", icon: IconUser },
  ];

  const isResourcesPage = pathname === "/resources";

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
            const isActive =
              pathname === item.href ||
              (item.href === "/community" && pathname.startsWith("/community")) ||
              (item.href === "/dashboard" && pathname === "/dashboard") ||
              (item.href === "/achievements" && pathname === "/achievements") ||
              (item.href === "/resources" && pathname === "/resources") ||
              (item.href === "/todo" && pathname === "/todo") ||
              (item.href === "/leaderboard" && pathname === "/leaderboard");

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-none text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#EDE9FE] text-[#6D28D9]"
                    : "text-slate-900 hover:text-black hover:bg-slate-50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-[#6D28D9] stroke-[2.2]" : "text-slate-700 stroke-[2]"}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Sign Out Button */}
          <button
            onClick={async () => {
              await createClient().auth.signOut();
              router.push("/login");
              router.refresh();
            }}
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-none text-sm font-bold text-slate-900 hover:text-rose-600 hover:bg-rose-50/60 w-full text-left transition-all cursor-pointer group"
          >
            <IconLogout className="w-5 h-5 text-slate-700 group-hover:text-rose-600 stroke-[2]" />
            <span>Sign Out</span>
          </button>
        </nav>
      </div>

      {/* Bottom Explorer Status Card (Exact Match to Image 1) */}
      <div className="pt-3 space-y-3">
        {/* Explorer Character Box */}
        <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-100 shadow-2xs space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 rounded-xl overflow-hidden border border-purple-200 bg-white shadow-2xs">
              <img
                src="/images/journey/explorer.jpg"
                alt="Explorer Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold text-slate-900 leading-tight">
                Web Dev Explorer 🚀
              </div>
              <div className="text-[11px] font-bold text-[#7C3AED]">Level 12</div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
              <span>XP Progress</span>
              <span>820 / 1200 XP</span>
            </div>
            <div className="w-full h-1.5 bg-purple-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] rounded-full"
                style={{ width: "68%" }}
              />
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-3 pt-0.5 text-xs font-black">
            <span className="flex items-center gap-1 text-amber-600">
              <span>🪙</span>
              <span>320</span>
            </span>
            <span className="flex items-center gap-1 text-[#7C3AED]">
              <span>💎</span>
              <span>15</span>
            </span>
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between shadow-2xs">
          <div className="space-y-0.5 pr-2">
            <div className="text-[11px] font-black text-purple-950 leading-tight flex items-center gap-1">
              <span>Keep going!</span>
              <span className="text-purple-600">💜</span>
            </div>
            <div className="text-[9px] font-medium text-purple-700 leading-snug">
              Complete more quests to unlock achievements and earn rewards.
            </div>
          </div>
          <div className="text-2xl shrink-0">🎁</div>
        </div>
      </div>
    </aside>
  );
}
