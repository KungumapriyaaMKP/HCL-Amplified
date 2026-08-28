"use client";

import { Card } from "@/frontend/components/ui/Card";
import { Button } from "@/frontend/components/ui/Button";

export interface SocraticGuidanceData {
  scaffoldingQuestions: string[];
  conceptualHint: string;
  diagram?: string | null;
}

export interface SocraticModalProps {
  skillName: string;
  chosenAnswer: string;
  guidance: SocraticGuidanceData;
  onClose: () => void;
}

export function SocraticModal({
  skillName,
  chosenAnswer,
  guidance,
  onClose,
}: SocraticModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-lg text-amber-400">
              💡
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Socratic Reflection
              </span>
              <h3 className="text-sm font-semibold text-foreground">
                {skillName} Concept Reflector
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-sm p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Learner's Selected Thought */}
        <div className="rounded-xl border border-border bg-surface-2 p-3 text-xs space-y-1">
          <span className="text-muted">Your Selection:</span>
          <p className="font-semibold text-foreground">&ldquo;{chosenAnswer}&rdquo;</p>
        </div>

        {/* Guided Scaffolding Questions */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Guided Questions for Reflection
          </h4>
          {guidance.scaffoldingQuestions.map((q, idx) => (
            <Card key={idx} className="p-3.5 text-xs space-y-1 bg-surface-2/70 border-border">
              <span className="font-mono text-[10px] uppercase text-muted">
                Probe {String(idx + 1).padStart(2, "0")}
              </span>
              <p className="text-foreground leading-relaxed">{q}</p>
            </Card>
          ))}
        </div>

        {/* Conceptual Diagram if present */}
        {guidance.diagram && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Concept Invariant Matrix
            </h4>
            <pre className="overflow-x-auto rounded-xl border border-border bg-black/40 p-3 text-[11px] font-mono leading-tight text-amber-300">
              {guidance.diagram}
            </pre>
          </div>
        )}

        {/* Conceptual Hint */}
        {guidance.conceptualHint && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs space-y-1">
            <span className="font-bold text-amber-400">Pedagogical Hint:</span>
            <p className="leading-relaxed text-foreground">{guidance.conceptualHint}</p>
          </div>
        )}

        <Button onClick={onClose} className="w-full">
          I Understand — Return to Quiz
        </Button>
      </div>
    </div>
  );
}
