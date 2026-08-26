"use client";

import { useState, useEffect } from "react";
import { getPoincareLayout, PoincareResponse, PoincareNode } from "@/lib/api/pathfinder";
import { Pill } from "@/components/ui/Pill";

export function PoincareDisk() {
  const [data, setData] = useState<PoincareResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<PoincareNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<PoincareNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getPoincareLayout();
        setData(res);
      } catch (e) {
        console.error("Failed to load skill map constellation:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const size = 500;
  const radius = size / 2 - 20;
  const center = size / 2;

  // Transform unit disk (-1..1) to SVG coordinates (0..size)
  const toSvgCoords = (u: number, v: number) => {
    return {
      x: center + u * radius,
      y: center + v * radius,
    };
  };

  const activeNode = hoveredNode || selectedNode;

  return (
    <div className="bg-zinc-950 text-zinc-100 rounded-3xl p-6 border border-zinc-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Skill Map
            </span>
            <Pill variant="neutral">Interactive</Pill>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Your Knowledge Constellation
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Every dot is a skill. Skills near the center are foundational; the ones further out build on them. Hover a skill to see what it connects to.
          </p>
        </div>

        {activeNode && (
          <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl text-xs space-y-1 text-right">
            <div className="font-bold text-white capitalize">{activeNode.name}</div>
            <div className="text-zinc-400 text-[11px]">
              <span className="text-zinc-500">Domain:</span> {activeNode.topic.replace(/-/g, " ")}
            </div>
            <div className="text-amber-400 text-[11px] font-medium">
              <span className="text-zinc-500">Level:</span>{" "}
              {activeNode.depth === 0
                ? "Foundation"
                : activeNode.depth <= 2
                ? "Core"
                : "Advanced"}
            </div>
            <div className="text-emerald-400 text-[11px] font-medium">
              <span className="text-zinc-500">Impact:</span> Unlocks {activeNode.fan_out} further skills
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="text-sm font-semibold text-amber-400 animate-pulse">
            Loading skill map constellation...
          </div>
        </div>
      ) : data ? (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* SVG Skill Map Constellation */}
          <div className="relative">
            {/* Ambient Disk Glow */}
            <div className="absolute inset-4 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="relative z-10 select-none overflow-visible"
            >
              {/* Unit Disk Boundary Circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="#09090b"
                stroke="rgba(245, 158, 11, 0.35)"
                strokeWidth="2"
              />

              {/* Concentric Horizon Rings */}
              <circle
                cx={center}
                cy={center}
                r={radius * 0.35}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
              <circle
                cx={center}
                cy={center}
                r={radius * 0.65}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
              <circle
                cx={center}
                cy={center}
                r={radius * 0.88}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="3 3"
              />

              {/* Prerequisite Edges */}
              {data.edges.map((edge, idx) => {
                const src = data.nodes.find((n) => n.id === edge.source);
                const tgt = data.nodes.find((n) => n.id === edge.target);
                if (!src || !tgt) return null;

                const p1 = toSvgCoords(src.u, src.v);
                const p2 = toSvgCoords(tgt.u, tgt.v);

                const isHighlighted =
                  activeNode?.id === src.id || activeNode?.id === tgt.id;

                return (
                  <line
                    key={idx}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={
                      isHighlighted
                        ? "rgba(245, 158, 11, 0.9)"
                        : "rgba(255, 255, 255, 0.12)"
                    }
                    strokeWidth={isHighlighted ? 2 : 1}
                  />
                );
              })}

              {/* Skill Nodes */}
              {data.nodes.map((node) => {
                const pt = toSvgCoords(node.u, node.v);
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNode?.id === node.id;

                const nodeRadius = node.depth === 0 ? 6 : Math.max(3.5, 6 - node.depth * 0.7);

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(node)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered || isSelected ? nodeRadius + 3 : nodeRadius}
                      fill={
                        node.depth === 0
                          ? "#f59e0b"
                          : node.depth === 1
                          ? "#fbbf24"
                          : node.depth === 2
                          ? "#a8a29e"
                          : "#10b981"
                      }
                      stroke="#000"
                      strokeWidth="1.5"
                      className="transition-all duration-200"
                    />

                    {(isHovered || isSelected) && (
                      <text
                        x={pt.x}
                        y={pt.y - nodeRadius - 4}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize={isHovered || isSelected ? "11px" : "9px"}
                        fontWeight="600"
                        className="pointer-events-none drop-shadow"
                      >
                        {node.name}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* How to Read This Info Box */}
          <div className="space-y-4 max-w-sm">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                How to read this
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Center dots are foundational skills. Outer dots are specialized topics that build on them. Lines show direct prerequisite connections between skills.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block">Total Skills</span>
                <span className="text-base font-bold text-white">{data.nodes.length}</span>
              </div>
              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                <span className="text-zinc-500 block">Prereq Links</span>
                <span className="text-base font-bold text-white">{data.edges.length}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
