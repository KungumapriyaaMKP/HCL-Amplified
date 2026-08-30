"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

export interface SkillNodeData {
  id: string;
  skillId?: string;
  skillName: string;
  resourceTitle?: string;
  status: "completed" | "in_progress" | "available" | "locked" | string;
  milestoneType?: string;
  order?: number;
}

interface InteractiveSkillMapTreeProps {
  hasGoals?: boolean;
  goalId?: string;
  goalTitle?: string;
  domain?: string;
  modules?: SkillNodeData[];
}

export function InteractiveSkillMapTree({
  hasGoals = false,
  goalId,
  goalTitle = "Web Development",
  modules = [],
}: InteractiveSkillMapTreeProps) {
  const [_hoveredNode, setHoveredNode] = useState<SkillNodeData | null>(null);

  // Default fallback curriculum if modules haven't populated yet
  const displayNodes: SkillNodeData[] =
    modules.length > 0
      ? modules
      : [
          { id: "1", skillName: "Foundations & Syntax", status: hasGoals ? "in_progress" : "available", order: 1 },
          { id: "2", skillName: "Data Structures", status: "locked", order: 2 },
          { id: "3", skillName: "Core Algorithms", status: "locked", order: 3 },
          { id: "4", skillName: "Framework Basics", status: "locked", order: 4 },
          { id: "5", skillName: "Backend & APIs", status: "locked", order: 5 },
          { id: "6", skillName: "Full-Stack Project", status: "locked", order: 6 },
          { id: "7", skillName: "Capstone Deployment", status: "locked", order: 7 },
        ];

  // Derive up to 7 nodes for the topology layout
  const n1 = displayNodes[0] || { id: "1", skillName: "Foundations", status: "available" };
  const n2 = displayNodes[1] || { id: "2", skillName: "Core Skills", status: "locked" };
  const n3 = displayNodes[2] || { id: "3", skillName: "Active Module", status: "locked" };
  const n4 = displayNodes[3] || { id: "4", skillName: "Specialization", status: "locked" };
  const n5 = displayNodes[4] || { id: "5", skillName: "Applied Practice", status: "locked" };
  const n6 = displayNodes[5] || { id: "6", skillName: "Advanced Mastery", status: "locked" };
  const n7 = displayNodes[6] || { id: "7", skillName: "Projects", status: "locked" };

  const graphHref = goalId ? `/goals/${goalId}/graph` : "/goals/new";

  function renderNodeVisual(node: SkillNodeData, cx: number, cy: number) {
    const isCompleted = node.status === "completed";
    const isInProgress = node.status === "in_progress";
    const isAvailable = node.status === "available";

    if (isCompleted) {
      return (
        <g
          className="cursor-pointer group"
          onMouseEnter={() => setHoveredNode(node)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <circle cx={cx} cy={cy} r="20" fill="#ECFDF5" stroke="#10B981" strokeWidth="2.5" />
          <path
            d={`M ${cx - 7} ${cy} L ${cx - 2} ${cy + 5} L ${cx + 8} ${cy - 6}`}
            stroke="#059669"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <text x={cx} y={cy + 37} textAnchor="middle" fill="#334155" fontSize="11" fontWeight="700">
            {node.skillName}
          </text>
        </g>
      );
    }

    if (isInProgress) {
      return (
        <Link href={goalId ? `/goals/${goalId}` : "/goals/new"}>
          <g
            className="cursor-pointer"
            filter="url(#hub-shadow-dash)"
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <circle cx={cx} cy={cy} r="28" fill="#EDE9FE" fillOpacity="0.8" />
            <circle cx={cx} cy={cy} r="22" fill="url(#hub-glow-active)" stroke="#DDD6FE" strokeWidth="2.5" />
            <text x={cx} y={cy + 6} textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900">
              ✦
            </text>
            <text x={cx} y={cy + 42} textAnchor="middle" fill="#0F172A" fontSize="12" fontWeight="900">
              {node.skillName}
            </text>
          </g>
        </Link>
      );
    }

    if (isAvailable) {
      return (
        <g
          className="cursor-pointer group"
          onMouseEnter={() => setHoveredNode(node)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <circle cx={cx} cy={cy} r="20" fill="#FAF5FF" stroke="#A855F7" strokeWidth="2.5" strokeDasharray="4 3" />
          <circle cx={cx} cy={cy} r="5" fill="#A855F7" />
          <text x={cx} y={cy + 37} textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700">
            {node.skillName}
          </text>
        </g>
      );
    }

    // Locked Node
    return (
      <g
        className="cursor-pointer opacity-50"
        onMouseEnter={() => setHoveredNode(node)}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <circle cx={cx} cy={cy} r="18" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx={cx} cy={cy} r="4" fill="#CBD5E1" />
        <text x={cx} y={cy + 37} textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="600">
          {node.skillName}
        </text>
      </g>
    );
  }

  const line1Color = n1.status === "completed" ? "#10B981" : "#E2E8F0";
  const line2Color = n2.status === "completed" ? (n3.status === "completed" ? "#10B981" : "#8B5CF6") : "#E2E8F0";
  const upperBranchColor = n3.status === "completed" || n3.status === "in_progress" ? (n4.status === "completed" ? "#10B981" : "#8B5CF6") : "#E2E8F0";
  const lowerBranchColor = n3.status === "completed" || n3.status === "in_progress" ? (n5.status === "completed" ? "#10B981" : "#8B5CF6") : "#E2E8F0";
  const line4Color = n4.status === "completed" ? "#10B981" : "#CBD5E1";
  const line5Color = n5.status === "completed" ? "#10B981" : "#CBD5E1";

  return (
    <div id="skill-map" className="rounded-sm border border-slate-200/90 bg-white p-6 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>Your Skill Map</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-xs bg-purple-100 text-[#6D28D9] border border-purple-200">
              {goalTitle}
            </span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Dynamic prerequisite constellation based on your active progress in this course.
          </p>
        </div>

        <Link
          href={graphHref}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#6D28D9] hover:underline"
        >
          <span>Explore full map</span>
          <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* SVG Topology Graph with Dynamic Course Skills */}
      <div className="relative w-full overflow-x-auto my-2">
        <svg
          viewBox="0 0 680 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto min-w-[640px] select-none"
        >
          <defs>
            <linearGradient id="hub-glow-active" x1="270" y1="50" x2="330" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>

            <filter id="hub-shadow-dash" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7C3AED" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Connected Pathways */}
          <line x1="70" y1="85" x2="160" y2="85" stroke={line1Color} strokeWidth="3" strokeLinecap="round" />
          <line x1="200" y1="85" x2="275" y2="85" stroke={line2Color} strokeWidth="3" strokeLinecap="round" />

          {/* Upper Branch */}
          <path
            d="M 335 85 C 375 85, 405 45, 440 45"
            stroke={upperBranchColor}
            strokeWidth="2.5"
            strokeDasharray="5 5"
            strokeLinecap="round"
            fill="none"
          />
          <line x1="480" y1="45" x2="580" y2="45" stroke={line4Color} strokeWidth="2.5" strokeLinecap="round" />

          {/* Lower Branch */}
          <path
            d="M 335 85 C 375 85, 405 125, 440 125"
            stroke={lowerBranchColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <line x1="480" y1="125" x2="580" y2="125" stroke={line5Color} strokeWidth="2.5" strokeLinecap="round" />

          {/* NODE 1 */}
          {renderNodeVisual(n1, 50, 85)}

          {/* NODE 2 */}
          {renderNodeVisual(n2, 180, 85)}

          {/* NODE 3 */}
          {renderNodeVisual(n3, 305, 85)}

          {/* NODE 4 */}
          {renderNodeVisual(n4, 460, 45)}

          {/* NODE 5 */}
          {renderNodeVisual(n5, 460, 125)}

          {/* NODE 6 */}
          {renderNodeVisual(n6, 600, 45)}

          {/* NODE 7 */}
          {renderNodeVisual(n7, 600, 125)}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center gap-5 text-slate-600 font-semibold text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Completed</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#7C3AED]" />
            <span>In Progress</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span>Locked</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default InteractiveSkillMapTree;
