"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getSocraticGuidance, SocraticResponse } from "@/lib/api/pathfinder";
import { GhostMentor } from "@/components/ui/GhostMentor";
import { Card } from "@/components/ui/Card";
import { FormattedContent } from "@/components/ui/FormattedContent";

interface SocraticModalProps {
  skillId: string;
  skillName: string;
  chosenAnswer: string;
  question: string;
  correctAnswer?: string;
  onClose: () => void;
}

export function SocraticModal({
  skillId,
  skillName,
  chosenAnswer,
  question,
  correctAnswer = "",
  onClose,
}: SocraticModalProps) {
  const [data, setData] = useState<SocraticResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getSocraticGuidance({
          skill_id: skillId,
          skill_name: skillName,
          chosen_answer: chosenAnswer,
          question: question,
          correct_answer: correctAnswer,
        });
        setData(res);
      } catch (e) {
        console.error("Failed to load Socratic guidance:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [skillId, skillName, chosenAnswer, question, correctAnswer]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-canvas border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
        {/* Header with Ghost Mentor */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <GhostMentor size={40} state="socratic" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Socratic Dialogue
              </span>
              <h3 className="text-base font-bold text-ink">{skillName} Concept Reflector</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink text-xl leading-none cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-2">
            <div className="text-sm font-semibold text-ink animate-pulse">
              Formulating guided Socratic questions...
            </div>
            <p className="text-xs text-muted">Analyzing student reasoning model</p>
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Student's initial assertion */}
            <div className="p-3 bg-surface rounded-xl text-xs space-y-1">
              <span className="text-muted font-medium">Your Selected Thought:</span>
              <p className="text-ink font-semibold">&ldquo;{chosenAnswer}&rdquo;</p>
            </div>

            {/* Guided Scaffolding Questions */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Guided Questions for Reflection
              </h4>
              {data.scaffolding_questions.map((q, idx) => (
                <Card key={idx} className="p-3.5 bg-surface border-border text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-muted font-mono text-[10px] uppercase tracking-wider">
                      Probe {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <FormattedContent text={q} className="text-ink font-medium leading-relaxed" />
                </Card>
              ))}
            </div>

            {/* Conceptual Diagram */}
            {data.diagram && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Concept Matrix / Invariant
                </h4>
                <pre className="p-3 bg-zinc-950 text-zinc-100 text-[11px] font-mono rounded-xl overflow-x-auto border border-zinc-800 leading-tight">
                  {data.diagram}
                </pre>
              </div>
            )}

            {/* Conceptual Hint */}
            {data.conceptual_hint && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-xs text-ink space-y-1">
                <span className="font-bold text-amber-700 dark:text-amber-300">Pedagogical Hint:</span>
                <FormattedContent text={data.conceptual_hint} className="leading-relaxed text-ink" />
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-ink text-canvas font-semibold text-xs py-2.5 rounded-xl hover:bg-ink/90 transition-all cursor-pointer shadow-xs mt-2"
            >
              I Understand — Return to Question
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
