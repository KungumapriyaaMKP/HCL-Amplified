"use client";

import { useMemo, useState } from "react";
import type { GraphNode, GraphEdge } from "@/lib/skillGraph";
import { computePoincareLayout, type PoincareNode } from "@/lib/poincare";

type Status = "mastered" | "target" | "required" | "in_progress" | "outside";

const STATUS_COLOR: Record<Status, { fill: string; stroke: string; text: string; shadow: string }> = {
  mastered: { fill: "#34d399", stroke: "#10b981", text: "#34d399", shadow: "rgba(16,185,129,0.5)" },
  in_progress: { fill: "#fbbf24", stroke: "#f59e0b", text: "#fbbf24", shadow: "rgba(245,158,11,0.5)" },
  target: { fill: "#c084fc", stroke: "#a855f7", text: "#e9d5ff", shadow: "rgba(168,85,247,0.7)" },
  required: { fill: "#38bdf8", stroke: "#0ea5e9", text: "#7dd3fc", shadow: "rgba(6,182,212,0.5)" },
  outside: { fill: "#64748b", stroke: "#475569", text: "#94a3b8", shadow: "transparent" },
};

function statusFor(mastery: number, isTarget: boolean, isRequired: boolean): Status {
  if (mastery >= 60) return "mastered";
  if (isTarget) return "target";
  if (isRequired && mastery > 0) return "in_progress";
  if (isRequired) return "required";
  return "outside";
}

/**
 * Renders the domain's skill graph as a 2D Poincaré Hyperbolic Disk.
 * Foundational skills cluster near the origin; specialized/advanced skills branch outward.
 */
export function SkillGraphView({
  nodes,
  edges,
  masteryBySkill,
  targetSkillIds,
  requiredSkillIds,
}: {
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

  const activeNodeId = hoveredNodeId || selectedNodeId;
  const activeNode = useMemo(() => {
    return poincareData.nodes.find((n) => n.id === activeNodeId) ?? null;
  }, [poincareData.nodes, activeNodeId]);

  const size = 560;
  const radius = size / 2 - 28;
  const center = size / 2;

  // Transform Poincaré disk coordinates (-1..1) to SVG canvas pixels (0..size)
  const toSvgCoords = (u: number, v: number) => ({
    x: center + u * radius,
    y: center + v * radius,
  });

  return (
    <div className="space-y-4">
      {/* Active node detail panel */}
      {activeNode && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-purple-500/30 bg-[#0d1226]/90 p-3.5 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.2)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{activeNode.name}</span>
              <span className="rounded-md border border-purple-500/30 bg-purple-950/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
                {activeNode.category.replace(/-/g, " ")}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              Hyperbolic Radius: <span className="text-white font-mono">{activeNode.radius}</span> · Angle:{" "}
              <span className="text-white font-mono">{activeNode.angle} rad</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-400">Mastery: </span>
              <span className="font-bold text-white">
                {masteryBySkill.get(activeNode.id) ?? 0}%
              </span>
            </div>
            <div>
              <span className="text-slate-400">Level: </span>
              <span className="font-bold text-amber-400">
                {activeNode.depth === 0 ? "Foundation" : activeNode.depth <= 2 ? "Core" : "Advanced"}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Unlocks: </span>
              <span className="font-bold text-emerald-400">{activeNode.fanOut} skills</span>
            </div>
          </div>
        </div>
      )}

      {/* Poincaré Hyperbolic Constellation */}
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-purple-500/30 bg-[#070a1a]/95 p-4 sm:p-6 shadow-[0_0_35px_rgba(139,92,246,0.25)] backdrop-blur-2xl">
        <div className="relative">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute inset-8 rounded-full bg-purple-600/10 blur-3xl" />

          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="max-w-full select-none overflow-visible"
          >
            <defs>
              <radialGradient id="poincare-bg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#131926" stopOpacity="0.8" />
                <stop offset="85%" stopColor="#0b0f19" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#060911" stopOpacity="1" />
              </radialGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <marker
                id="poincare-arrow"
                viewBox="0 0 10 10"
                refX="14"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
              </marker>
              <marker
                id="poincare-arrow-active"
                viewBox="0 0 10 10"
                refX="14"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Boundary Circle (Poincaré Horizon) */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="url(#poincare-bg)"
              stroke="rgba(168, 85, 247, 0.4)"
              strokeWidth="2"
            />

            {/* Hyperbolic Concentric Horizons */}
            <circle
              cx={center}
              cy={center}
              r={radius * 0.32}
              fill="none"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeDasharray="4 4"
            />
            <circle
              cx={center}
              cy={center}
              r={radius * 0.62}
              fill="none"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeDasharray="4 4"
            />
            <circle
              cx={center}
              cy={center}
              r={radius * 0.88}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeDasharray="3 3"
            />

            {/* Central Origin Crosshair */}
            <line
              x1={center - 8}
              y1={center}
              x2={center + 8}
              y2={center}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
            <line
              x1={center}
              y1={center - 8}
              x2={center}
              y2={center + 8}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />

            {/* Edges with Hyperbolic Geodesic Connections */}
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
                  stroke={isHighlighted ? "#f59e0b" : "rgba(148, 163, 184, 0.22)"}
                  strokeWidth={isHighlighted ? 2 : 1}
                  markerEnd={isHighlighted ? "url(#poincare-arrow-active)" : "url(#poincare-arrow)"}
                  className="transition-colors duration-150"
                />
              );
            })}

            {/* Skill Nodes (Render inactive first, active on top to prevent visual clipping/ghosting) */}
            {[...poincareData.nodes]
              .sort((a, b) => {
                const aActive = a.id === selectedNodeId || a.id === hoveredNodeId;
                const bActive = b.id === selectedNodeId || b.id === hoveredNodeId;
                if (aActive === bActive) return 0;
                return aActive ? 1 : -1;
              })
              .map((node) => {
                const pt = toSvgCoords(node.u, node.v);
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isActive = isSelected || isHovered;

                const mastery = masteryBySkill.get(node.id) ?? 0;
                const status = statusFor(
                  mastery,
                  targetSkillIds.has(node.id),
                  requiredSkillIds.has(node.id)
                );
                const colors = STATUS_COLOR[status];

                const baseRadius = node.depth === 0 ? 7 : Math.max(4.5, 7 - node.depth * 0.6);
                const r = isActive ? baseRadius + 3.5 : baseRadius;
                const labelText = node.name;
                const approxLabelWidth = Math.min(180, labelText.length * 6.5 + 16);

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() =>
                      setSelectedNodeId((prev) => (prev === node.id ? null : node.id))
                    }
                  >
                    {/* Pulsing ring when active */}
                    {isActive && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={r + 5}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={r}
                      fill={colors.fill}
                      stroke={isActive ? "#ffffff" : colors.stroke}
                      strokeWidth={isActive ? 2.5 : 1.25}
                      className="transition-transform duration-150"
                    />

                    {/* Clean background pill and crisp label for active or foundation nodes */}
                    {(isActive || node.depth === 0) && (
                      <g className="pointer-events-none select-none">
                        {isActive && (
                          <rect
                            x={pt.x - approxLabelWidth / 2}
                            y={pt.y - r - 20}
                            width={approxLabelWidth}
                            height={18}
                            rx={4}
                            fill="#0b0f19"
                            stroke="rgba(168, 85, 247, 0.5)"
                            strokeWidth={1}
                            opacity={0.95}
                          />
                        )}
                        <text
                          x={pt.x}
                          y={isActive ? pt.y - r - 7 : pt.y - r - 4}
                          textAnchor="middle"
                          fill={isActive ? "#ffffff" : colors.text}
                          fontSize={isActive ? "11px" : "9px"}
                          fontWeight={isActive ? "700" : "600"}
                          className="drop-shadow-sm select-none"
                        >
                          {labelText}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Disk Info Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 w-full max-w-lg border-t border-purple-500/20 pt-3">
          <span>Center = Core Foundations</span>
          <span>Perimeter = Advanced Specializations</span>
          <span>Nodes: {poincareData.nodes.length} · Prereqs: {poincareData.edges.length}</span>
        </div>
      </div>
    </div>
  );
}

export function SkillGraphLegend() {
  const items: { status: Status; label: string }[] = [
    { status: "mastered", label: "Mastered (60%+)" },
    { status: "in_progress", label: "In Trial" },
    { status: "target", label: "Apex Quest Skill" },
    { status: "required", label: "Needed Prerequisite" },
    { status: "outside", label: "Alternative Realm" },
  ];
  return (
    <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-300">
      {items.map((item) => (
        <span key={item.status} className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full border"
            style={{ background: STATUS_COLOR[item.status].fill, borderColor: STATUS_COLOR[item.status].stroke }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
