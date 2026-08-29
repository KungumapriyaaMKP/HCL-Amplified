"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconCheck,
  IconLock,
  IconArrowRight,
  IconBell,
} from "@tabler/icons-react";

export type JourneyModuleItem = {
  module: {
    id: string;
    title: string;
    description: string | null;
    rationale: string | null;
    status: "completed" | "in_progress" | "available" | "locked" | string;
    milestoneType: string;
    orderIndex: number;
    estimatedMinutes: number | null;
  };
  skill: {
    id: string;
    name: string;
    category?: string;
  } | null;
};

interface JourneyMapViewProps {
  goalId: string;
  goalTitle: string;
  domainName: string;
  modules: JourneyModuleItem[];
  userDisplayName?: string;
}

export function JourneyMapView({
  goalId,
  goalTitle,
  domainName,
  modules,
  userDisplayName = "Yuvi",
}: JourneyMapViewProps) {
  // Sort modules
  const sortedModules = [...modules].sort(
    (a, b) => a.module.orderIndex - b.module.orderIndex
  );

  const calibrationLink = sortedModules[0]?.module.id
    ? `/goals/${goalId}/modules/${sortedModules[0].module.id}`
    : `/goals/${goalId}/setup`;

  return (
    <div className="relative w-full min-h-screen bg-[#FFF9F6] text-slate-900 font-sans flex flex-col items-center justify-start overflow-x-hidden">
      
      {/* 100% Clarity Full-Resolution Mockup Interactive Stage */}
      <div className="relative w-full max-w-[1400px] min-h-[1420px] mx-auto overflow-hidden">
        
        {/* Crisp 1:1 Native Mockup Image */}
        <Image
          src="/images/journey/candy_bg.jpg"
          alt="100% Clarity Learning Journey"
          width={1400}
          height={1420}
          unoptimized
          priority
          className="w-full h-auto object-contain select-none pointer-events-none"
        />

        {/* Live Interactive Overlay Layer */}
        <div className="absolute inset-0 z-20 pointer-events-auto">
          
          {/* Top Right Actions Hotspots */}
          {/* Notification Button */}
          <button
            type="button"
            className="absolute top-[28px] right-[78px] w-9 h-9 rounded-full opacity-0 hover:opacity-20 bg-purple-500 cursor-pointer transition-opacity"
            title="Notifications"
            onClick={() => {}}
          />

          {/* User Avatar */}
          <div
            className="absolute top-[25px] right-[25px] w-12 h-10 rounded-full opacity-0 hover:opacity-20 bg-purple-500 cursor-pointer transition-opacity"
            title="Profile Menu"
          />

          {/* Step 1: Intake Hotspot */}
          <Link
            href={`/goals/${goalId}/setup`}
            className="absolute top-[100px] left-[34%] w-[320px] h-[95px] rounded-2xl opacity-0 hover:opacity-10 bg-purple-500 cursor-pointer transition-opacity"
            title="Review Intake"
          />

          {/* Step 2: Goals Hotspot */}
          <Link
            href={`/goals/${goalId}/setup`}
            className="absolute top-[255px] left-[34%] w-[320px] h-[95px] rounded-2xl opacity-0 hover:opacity-10 bg-purple-500 cursor-pointer transition-opacity"
            title="Review Goals"
          />

          {/* Step 3: Calibration - Interactive "Continue →" Button */}
          <div className="absolute top-[515px] left-[540px] w-[165px] h-[40px]">
            <Link
              href={calibrationLink}
              className="flex items-center justify-center gap-2 w-full h-full rounded-xl bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] text-white text-xs font-black shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Continue</span>
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Step 4: Roadmap Hotspot */}
          {sortedModules[1] && (
            <Link
              href={`/goals/${goalId}/modules/${sortedModules[1].module.id}`}
              className="absolute top-[580px] left-[38%] w-[340px] h-[90px] rounded-2xl opacity-0 hover:opacity-10 bg-purple-500 cursor-pointer transition-opacity"
              title={sortedModules[1].module.title}
            />
          )}

          {/* Step 5: Action Plan Hotspot */}
          {sortedModules[2] && (
            <Link
              href={`/goals/${goalId}/modules/${sortedModules[2].module.id}`}
              className="absolute top-[715px] left-[38%] w-[340px] h-[90px] rounded-2xl opacity-0 hover:opacity-10 bg-purple-500 cursor-pointer transition-opacity"
              title={sortedModules[2].module.title}
            />
          )}

          {/* Mega Reward Chest Hotspot */}
          <div
            className="absolute bottom-[40px] left-[36%] w-[400px] h-[130px] rounded-3xl opacity-0 hover:opacity-10 bg-amber-500 cursor-pointer transition-opacity"
            title="Mega Reward: Complete all milestones to earn 500 XP, 50 Gems, and your Certificate!"
          />

        </div>

      </div>

    </div>
  );
}

export default JourneyMapView;
