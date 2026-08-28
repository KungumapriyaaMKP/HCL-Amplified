import type { GraphNode, GraphEdge } from "@/lib/skillGraph";

type Status = "mastered" | "target" | "required" | "in_progress" | "outside";

const STATUS_COLOR: Record<Status, { fill: string; stroke: string; text: string; shadow: string }> = {
  mastered: { fill: "rgba(16,185,129,0.18)", stroke: "#10b981", text: "#34d399", shadow: "rgba(16,185,129,0.5)" },
  in_progress: { fill: "rgba(245,158,11,0.18)", stroke: "#f59e0b", text: "#fbbf24", shadow: "rgba(245,158,11,0.5)" },
  target: { fill: "rgba(168,85,247,0.22)", stroke: "#a855f7", text: "#e9d5ff", shadow: "rgba(168,85,247,0.7)" },
  required: { fill: "rgba(6,182,212,0.18)", stroke: "#06b6d4", text: "#67e8f9", shadow: "rgba(6,182,212,0.5)" },
  outside: { fill: "rgba(15,23,42,0.6)", stroke: "#1e293b", text: "#64748b", shadow: "transparent" },
};

function statusFor(mastery: number, isTarget: boolean, isRequired: boolean): Status {
  if (mastery >= 60) return "mastered";
  if (isTarget) return "target";
  if (isRequired && mastery > 0) return "in_progress";
  if (isRequired) return "required";
  return "outside";
}

const NODE_W = 180;
const NODE_H = 50;
const COL_GAP = 230;
const ROW_GAP = 68;
const MARGIN = 32;

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
  const maxDepth = Math.max(0, ...nodes.map((n) => n.depth));
  const columns: GraphNode[][] = Array.from({ length: maxDepth + 1 }, () => []);
  for (const n of [...nodes].sort((a, b) => a.name.localeCompare(b.name))) columns[n.depth].push(n);

  const positions = new Map<string, { x: number; y: number; status: Status }>();
  columns.forEach((col, depth) => {
    col.forEach((node, row) => {
      const mastery = masteryBySkill.get(node.id) ?? 0;
      const status = statusFor(mastery, targetSkillIds.has(node.id), requiredSkillIds.has(node.id));
      positions.set(node.id, { x: MARGIN + depth * COL_GAP, y: MARGIN + row * ROW_GAP, status });
    });
  });

  const maxRows = Math.max(1, ...columns.map((c) => c.length));
  const width = MARGIN * 2 + (maxDepth + 1) * COL_GAP - (COL_GAP - NODE_W);
  const height = MARGIN * 2 + maxRows * ROW_GAP - (ROW_GAP - NODE_H);

  return (
    <div className="overflow-x-auto rounded-3xl border-2 border-purple-500/30 bg-[#070a1a]/95 p-6 shadow-[0_0_35px_rgba(139,92,246,0.25)] backdrop-blur-2xl">
      <svg width={Math.max(width, 320)} height={Math.max(height, 200)} className="min-w-full">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#818cf8" />
          </marker>
        </defs>

        {edges.map((e, i) => {
          const from = positions.get(e.from);
          const to = positions.get(e.to);
          if (!from || !to) return null;
          const x1 = from.x + NODE_W;
          const y1 = from.y + NODE_H / 2;
          const x2 = to.x;
          const y2 = to.y + NODE_H / 2;
          const midX = (x1 + x2) / 2;
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
              fill="none"
              stroke="rgba(129,140,248,0.4)"
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />
          );
        })}

        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const colors = STATUS_COLOR[pos.status];
          const mastery = masteryBySkill.get(node.id) ?? 0;
          return (
            <g key={node.id} className="cursor-pointer transition-transform hover:scale-105">
              <title>
                {node.name} - {mastery}% mastery
              </title>
              <rect
                x={pos.x}
                y={pos.y}
                width={NODE_W}
                height={NODE_H}
                rx={14}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={pos.status === "target" ? 2.5 : 1.5}
                style={{ filter: `drop-shadow(0 0 8px ${colors.shadow})` }}
              />
              <text x={pos.x + 12} y={pos.y + 22} fontSize={12} fontWeight={800} fill={colors.text}>
                {node.name.length > 20 ? node.name.slice(0, 19) + "…" : node.name}
              </text>
              <text x={pos.x + 12} y={pos.y + 38} fontSize={10} fontWeight={600} fill="#94a3b8">
                {mastery}% mastery
              </text>
            </g>
          );
        })}
      </svg>
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
            className="h-3.5 w-3.5 rounded-md border"
            style={{ background: STATUS_COLOR[item.status].fill, borderColor: STATUS_COLOR[item.status].stroke }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
