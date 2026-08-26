import type { Node } from "@/lib/api/pathfinder";

const STYLES: Record<string, string> = {
  mastered: "bg-mastered-bg text-mastered",
  active: "bg-active-bg text-active",
  next: "bg-active-bg text-active",
  locked: "bg-surface text-ink-subtle",
};

const LABEL: Record<string, string> = {
  mastered: "Mastered",
  active: "Active",
  next: "Next",
  locked: "Locked",
};

export function StatusBadge({ status }: { status: Node["status"] }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABEL[status]}
    </span>
  );
}
