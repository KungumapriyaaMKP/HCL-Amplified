import type { Node } from "@/lib/api/pathfinder";
import { StatusBadge } from "./StatusBadge";

/**
 * A roadmap card. Density rule: at most four facts -- title, difficulty,
 * hours, status. No redundant "Milestone" label.
 */
export function SkillCard({
  node,
  onClick,
  selected,
}: {
  node: Node;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-[12px] border bg-card p-4 text-left transition-colors ${
        selected ? "border-ink" : "border-border hover:border-border-hover"
      } ${node.is_remediation ? "border-dashed border-at-risk" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold leading-tight">{node.skill_name}</span>
        <StatusBadge status={node.status} />
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-ink-muted">
        {node.resource?.difficulty && (
          <span className="capitalize">{node.resource.difficulty}</span>
        )}
        <span>{node.estimated_hours}h</span>
        {node.gap_delta > 0 && (
          <span className="text-gap">Gap ↓ {node.gap_delta}%</span>
        )}
      </div>
      {node.is_remediation && (
        <p className="mt-2 text-xs font-medium text-at-risk">
          ↳ Foundation refresher
        </p>
      )}
    </button>
  );
}
