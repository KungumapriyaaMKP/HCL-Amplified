import type { GraphNode, GraphEdge } from "@/lib/skillGraph";

type Status = "mastered" | "target" | "required" | "in_progress" | "outside";

const STATUS_COLOR: Record<Status, { fill: string; stroke: string; text: string }> = {
  mastered: { fill: "rgba(52,211,153,0.14)", stroke: "#34d399", text: "#34d399" },
  in_progress: { fill: "rgba(251,191,36,0.14)", stroke: "#fbbf24", text: "#fbbf24" },
  target: { fill: "rgba(124,92,255,0.16)", stroke: "#7c5cff", text: "#c9bdff" },
  required: { fill: "rgba(34,211,238,0.12)", stroke: "#22d3ee", text: "#7fe3f3" },
  outside: { fill: "rgba(35,43,61,0.6)", stroke: "#232b3d", text: "#8b95a7" },
};

function statusFor(mastery: number, isTarget: boolean, isRequired: boolean): Status {
  if (mastery >= 60) return "mastered";
  if (isTarget) return "target";
  if (isRequired && mastery > 0) return "in_progress";
  if (isRequired) return "required";
  return "outside";
}

const NODE_W = 168;
const NODE_H = 46;
const COL_GAP = 216;
const ROW_GAP = 60;
const MARGIN = 28;

/**
 * Renders the domain's skill/prerequisite graph as inline SVG: columns are
 * prerequisite depth (0 = no prerequisites, on the left), each node colored
 * by this learner's mastery and relevance to the current goal. This is the
 * visual face of the same DAG lib/skillGraph.ts uses for gap analysis and
 * path ordering - not a separate data structure.
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
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface/60 p-4">
      <svg width={Math.max(width, 320)} height={Math.max(height, 200)} className="min-w-full">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#8b95a7" />
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
              stroke="#2a3348"
              strokeWidth={1.5}
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
            <g key={node.id}>
              <title>
                {node.name} - {mastery}% mastery
              </title>
              <rect
                x={pos.x}
                y={pos.y}
                width={NODE_W}
                height={NODE_H}
                rx={10}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={pos.status === "target" ? 2 : 1.25}
              />
              <text x={pos.x + 10} y={pos.y + 19} fontSize={11.5} fontWeight={600} fill={colors.text}>
                {node.name.length > 20 ? node.name.slice(0, 19) + "…" : node.name}
              </text>
              <text x={pos.x + 10} y={pos.y + 34} fontSize={10} fill="#8b95a7">
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
    { status: "in_progress", label: "In progress" },
    { status: "target", label: "Your target skill" },
    { status: "required", label: "Needed prerequisite" },
    { status: "outside", label: "Not on this path" },
  ];
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted">
      {items.map((item) => (
        <span key={item.status} className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-sm border"
            style={{ background: STATUS_COLOR[item.status].fill, borderColor: STATUS_COLOR[item.status].stroke }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
