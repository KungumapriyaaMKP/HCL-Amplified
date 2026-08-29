"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { GraphNode, GraphEdge } from "@/lib/skillGraph";
import { computePoincareLayout, type PoincareNode } from "@/lib/poincare";
import {
  IconCheck,
  IconTarget,
  IconArrowRight,
  IconSparkles,
  IconAward,
  IconBook,
} from "@tabler/icons-react";

type Status = "mastered" | "target" | "required" | "in_progress" | "outside";

const STATUS_COLOR: Record<
  Status,
  { fill: string; stroke: string; text: string; bg: string; badge: string }
> = {
  mastered: {
    fill: "#10B981",
    stroke: "#059669",
    text: "#065F46",
    bg: "#ECFDF5",
    badge: "Mastered (60%+)",
  },
  in_progress: {
    fill: "#F59E0B",
    stroke: "#D97706",
    text: "#92400E",
    bg: "#FFFBEB",
    badge: "In Progress",
  },
  target: {
    fill: "#7C3AED",
    stroke: "#6D28D9",
    text: "#5B21B6",
    bg: "#F5F3FF",
    badge: "Target Skill",
  },
  required: {
    fill: "#0284C7",
    stroke: "#0369A1",
    text: "#075985",
    bg: "#F0F9FF",
    badge: "Prerequisite",
  },
  outside: {
    fill: "#64748B",
    stroke: "#475569",
    text: "#334155",
    bg: "#F8FAFC",
    badge: "Other Skill",
  },
};

function statusFor(mastery: number, isTarget: boolean, isRequired: boolean): Status {
  if (mastery >= 60) return "mastered";
  if (isTarget) return "target";
  if (isRequired && mastery > 0) return "in_progress";
  if (isRequired) return "required";
  return "outside";
}

export function SkillGraphView({
  goalId,
  nodes,
  edges,
  masteryBySkill,
  targetSkillIds,
  requiredSkillIds,
}: {
  goalId?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  masteryBySkill: Map<string, number>;
  targetSkillIds: Set<string>;
  requiredSkillIds: Set<string>;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const poincareData = useMemo(() => {
    return computePoincareLayout(nodes, edges);
  }, [nodes, edges]);

  const activeNodeId = hoveredNodeId || selectedNodeId || poincareData.nodes[0]?.id;
  const activeNode = useMemo(() => {
    return poincareData.nodes.find((n) => n.id === activeNodeId) ?? null;
  }, [poincareData.nodes, activeNodeId]);

  const size = 600;
  const radius = size / 2 - 36;
  const center = size / 2;

  // Transform Poincaré disk coordinates (-1..1) to SVG canvas pixels (0..size)
  const toSvgCoords = (u: number, v: number) => ({
    x: center + u * radius,
    y: center + v * radius,
  });

  const activeMastery = activeNode ? masteryBySkill.get(activeNode.id) ?? 0 : 0;
  const activeStatus = activeNode
    ? statusFor(
        activeMastery,
        targetSkillIds.has(activeNode.id),
        requiredSkillIds.has(activeNode.id)
      )
    : "outside";
  const activeColors = STATUS_COLOR[activeStatus];

  return (
    <div className="space-y-6">
      {/* 1. Interactive Poincaré Hyperbolic Constellation */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-md border-2 border-purple-200/80 bg-white/95 p-6 shadow-xl shadow-purple-500/5 backdrop-blur-md">
        
        {/* Soft Ambient Background Glow */}
        <div className="pointer-events-none absolute inset-12 rounded-full bg-gradient-to-tr from-purple-300/20 via-amber-200/20 to-teal-200/20 blur-3xl" />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="max-w-full select-none overflow-visible"
        >
          <defs>
            {/* Luminous Poincaré Gradient */}
            <radialGradient id="poincare-luminous" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="65%" stopColor="#FAF5FF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#F3E8FF" stopOpacity="0.9" />
            </radialGradient>

            {/* Glowing Drop Shadows */}
            <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#7C3AED" floodOpacity="0.35" />
            </filter>
            <filter id="activeGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#6D28D9" floodOpacity="0.5" />
            </filter>

            {/* Directional Edge Markers */}
            <marker
              id="edge-arrow"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <path d="M 0 2 L 7 5 L 0 8 z" fill="#C4B5FD" />
            </marker>
            <marker
              id="edge-arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#7C3AED" />
            </marker>
          </defs>

          {/* Horizon Boundary Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#poincare-luminous)"
            stroke="#DDD6FE"
            strokeWidth="3"
          />

          {/* Concentric Hyperbolic Horizon Orbit Rings */}
          <circle
            cx={center}
            cy={center}
            r={radius * 0.24}
            fill="none"
            stroke="#C084FC"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle
            cx={center}
            cy={center}
            r={radius * 0.48}
            fill="none"
            stroke="#C084FC"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />
          <circle
            cx={center}
            cy={center}
            r={radius * 0.70}
            fill="none"
            stroke="#C084FC"
            strokeOpacity="0.2"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <circle
            cx={center}
            cy={center}
            r={radius * 0.86}
            fill="none"
            stroke="#C084FC"
            strokeOpacity="0.15"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Central Origin Crosshair */}
          <line
            x1={center - 10}
            y1={center}
            x2={center + 10}
            y2={center}
            stroke="#C4B5FD"
            strokeWidth="1.5"
          />
          <line
            x1={center}
            y1={center - 10}
            x2={center}
            y2={center + 10}
            stroke="#C4B5FD"
            strokeWidth="1.5"
          />

          {/* Dependency Connection Edges */}
          {poincareData.edges.map((edge, i) => {
            const src = poincareData.nodes.find((n) => n.id === edge.from);
            const tgt = poincareData.nodes.find((n) => n.id === edge.to);
            if (!src || !tgt) return null;

            const p1 = toSvgCoords(src.u, src.v);
            const p2 = toSvgCoords(tgt.u, tgt.v);

            const isHighlighted = activeNode?.id === src.id || activeNode?.id === tgt.id;

            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={isHighlighted ? "#7C3AED" : "#DDD6FE"}
                strokeWidth={isHighlighted ? 2.5 : 1.25}
                strokeDasharray={isHighlighted ? "6 3" : undefined}
                markerEnd={isHighlighted ? "url(#edge-arrow-active)" : "url(#edge-arrow)"}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Skill Nodes with Collision-Free Smart Labels */}
          {poincareData.nodes.map((node) => {
            const pt = toSvgCoords(node.u, node.v);
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isActive = isSelected || isHovered || activeNode?.id === node.id;

            const mastery = masteryBySkill.get(node.id) ?? 0;
            const status = statusFor(
              mastery,
              targetSkillIds.has(node.id),
              requiredSkillIds.has(node.id)
            );
            const colors = STATUS_COLOR[status];

            const baseRadius = node.depth === 0 ? 11 : Math.max(8, 12 - node.depth * 0.9);
            const r = isActive ? baseRadius + 4 : baseRadius;

            // Compute outward radial offset for label so it never collides
            const labelOffsetY = node.v >= 0 ? r + 12 : -(r + 8);

            return (
              <g
                key={node.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() =>
                  setSelectedNodeId((prev) => (prev === node.id ? null : node.id))
                }
              >
                {/* Active Pulse Ring */}
                {isActive && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={r + 6}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="2"
                    opacity="0.7"
                    className="animate-ping"
                  />
                )}

                {/* Node Outer Base */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={r}
                  fill={colors.fill}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  filter={isActive ? "url(#activeGlow)" : "url(#nodeGlow)"}
                  className="transition-all duration-200"
                />

                {/* Inner Icon / Dot */}
                {status === "mastered" ? (
                  <text
                    x={pt.x}
                    y={pt.y + 3.5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10px"
                    fontWeight="900"
                    className="pointer-events-none"
                  >
                    ✓
                  </text>
                ) : status === "target" ? (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={r * 0.4}
                    fill="#FFFFFF"
                    className="pointer-events-none"
                  />
                ) : null}

                {/* Non-overlapping Smart Label Badge */}
                <g transform={`translate(${pt.x}, ${pt.y + labelOffsetY})`}>
                  <rect
                    x={-(node.name.length * 3.3 + 8)}
                    y="-9"
                    width={node.name.length * 6.6 + 16}
                    height="18"
                    rx="4"
                    fill={isActive ? "#6D28D9" : "#FFFFFF"}
                    stroke={isActive ? "#5B21B6" : "#E2E8F0"}
                    strokeWidth="1"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                    className="transition-all duration-150"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={isActive ? "#FFFFFF" : "#1E293B"}
                    fontSize={isActive ? "10px" : "9px"}
                    fontWeight={isActive ? "800" : "600"}
                    className="pointer-events-none select-none"
                  >
                    {node.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Disk Info Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 font-medium w-full max-w-lg border-t border-purple-100 pt-3">
          <span>Center = Core Foundations</span>
          <span>Perimeter = Specialized Modules</span>
          <span className="font-bold text-purple-700">
            {poincareData.nodes.length} Skills · {poincareData.edges.length} Prerequisites
          </span>
        </div>
      </div>

      {/* 2. Active Node Detail Drawer */}
      {activeNode && (
        <div className="rounded-md border-2 border-purple-200 bg-white/98 p-5 shadow-lg shadow-purple-500/5 backdrop-blur-md space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: activeColors.fill }}
                />
                <h3 className="text-lg font-black text-slate-900">{activeNode.name}</h3>
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider"
                  style={{ backgroundColor: activeColors.bg, color: activeColors.text }}
                >
                  {activeColors.badge}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-[#6D28D9] text-[10px] font-bold uppercase tracking-wider">
                  {activeNode.category.replace(/-/g, " ")}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Depth Level:{" "}
                <span className="font-bold text-slate-800">
                  {activeNode.depth === 0
                    ? "Foundation (Root)"
                    : activeNode.depth <= 2
                    ? "Core Competency"
                    : "Advanced Specialization"}
                </span>{" "}
                · Unlocks <span className="font-bold text-[#6D28D9]">{activeNode.fanOut}</span> downstream skills
              </p>
            </div>

            {/* Mastery Meter */}
            <div className="min-w-[180px] space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Mastery Progress</span>
                <span className="text-[#6D28D9]">{activeMastery}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(5, activeMastery)}%`,
                    backgroundColor: activeColors.fill,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          {goalId && (
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">
                Click any node in the constellation to explore skill dependencies
              </span>
              <Link
                href={`/goals/${goalId}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white text-xs font-bold shadow-md shadow-purple-500/20 hover:opacity-95 transition-all"
              >
                <span>View in Quest Roadmap</span>
                <IconArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SkillGraphLegend() {
  const items: {
    status: Status;
    label: string;
    dot: string;
    textColor: string;
    bgColor: string;
  }[] = [
    {
      status: "mastered",
      label: "Mastered (60%+)",
      dot: "bg-emerald-500",
      textColor: "text-emerald-900",
      bgColor: "bg-emerald-50/90 border-emerald-200",
    },
    {
      status: "in_progress",
      label: "In Trial",
      dot: "bg-amber-500",
      textColor: "text-amber-900",
      bgColor: "bg-amber-50/90 border-amber-200",
    },
    {
      status: "target",
      label: "Apex Quest Skill",
      dot: "bg-[#7C3AED]",
      textColor: "text-purple-900",
      bgColor: "bg-purple-50/90 border-purple-200",
    },
    {
      status: "required",
      label: "Needed Prerequisite",
      dot: "bg-sky-500",
      textColor: "text-sky-900",
      bgColor: "bg-sky-50/90 border-sky-200",
    },
    {
      status: "outside",
      label: "Alternative Realm",
      dot: "bg-slate-500",
      textColor: "text-slate-900",
      bgColor: "bg-slate-100/90 border-slate-200",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((item) => (
        <span
          key={item.status}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-black ${item.bgColor} ${item.textColor} shadow-2xs`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${item.dot} shadow-xs ring-1 ring-white`} />
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  );
}

export default SkillGraphView;
