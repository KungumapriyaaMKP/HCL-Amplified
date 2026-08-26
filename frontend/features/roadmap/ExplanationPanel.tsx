"use client";

import { motion } from "framer-motion";
import type { Node } from "@/lib/api/pathfinder";
import { PROVIDER_LABEL } from "@/lib/api/pathfinder";

/**
 * Deliverable 5 on screen: the grounded rationale plus the real candidates.
 * Every number here came from the engine.
 */
export function ExplanationPanel({
  node,
  onClose,
}: {
  node: Node;
  onClose: () => void;
}) {
  return (
    <motion.aside
      initial={{ x: 32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed right-0 top-16 z-10 h-[calc(100vh-4rem)] w-full max-w-md overflow-y-auto border-l border-border bg-canvas p-6 shadow-sm sm:w-[26rem]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-subtle">
            {node.phase}
          </p>
          <h2 className="mt-1 text-2xl font-bold">{node.skill_name}</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-full border border-border px-3 py-1 text-sm text-ink-muted hover:border-border-hover"
        >
          Close
        </button>
      </div>

      {node.gap_delta > 0 && (
        <div className="mt-4 inline-flex rounded-full bg-gap-bg px-3 py-1 text-sm font-medium text-gap">
          Skill gap ↓ {node.gap_delta}%
        </div>
      )}

      {node.rationale && (
        <p
          className="mt-5 text-sm leading-relaxed text-ink"
          dangerouslySetInnerHTML={{
            __html: node.rationale.replace(
              /\*\*(.+?)\*\*/g,
              "<strong>$1</strong>",
            ),
          }}
        />
      )}

      {node.resource && (
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Primary resource
          </p>
          <a
            href={node.resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block rounded-[12px] border border-border p-4 hover:border-border-hover"
          >
            <div className="flex items-center gap-2 text-xs text-active">
              {PROVIDER_LABEL[node.resource.provider] ?? node.resource.provider}
            </div>
            <p className="mt-1 font-semibold leading-snug">
              {node.resource.title}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
              <span>{node.resource.duration_display}</span>
              <span>
                {node.resource.cost_type === "free"
                  ? "Free"
                  : node.resource.price_is_estimate
                    ? `~$${node.resource.price_usd}/mo (est.)`
                    : `$${node.resource.price_usd}`}
              </span>
            </div>
          </a>
        </div>
      )}

      {(node.alternatives?.length ?? 0) > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Alternatives
          </p>
          <div className="mt-2 space-y-2">
            {node.alternatives?.map((a) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-border p-3 text-sm hover:border-border-hover"
              >
                <span className="text-ink">{a.title}</span>
                <span className="ml-2 text-xs text-ink-subtle">
                  {a.duration_display}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.aside>
  );
}
