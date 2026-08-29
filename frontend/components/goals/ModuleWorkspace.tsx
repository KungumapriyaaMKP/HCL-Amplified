"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/Button";
import { PracticeQuiz } from "@/frontend/components/goals/PracticeQuiz";
import { FocusTimer } from "@/frontend/components/goals/FocusTimer";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconExternalLink,
  IconLock,
  IconCode,
  IconAward,
} from "@tabler/icons-react";

type Props = {
  goalId: string;
  moduleId: string;
  skillName: string;
  resourceTitle: string;
  resourceUrl: string;
  resourceType: string;
  resourceProvider: string;
  estimatedMinutes: number;
  rationale: string;
  isProgramming: boolean;
  programmingLanguage: string | null;
  hasResourceDone: boolean;
  hasPracticeAttempt: boolean;
  proctoredAlreadyTaken: boolean;
  proctoredScore: number | null;
  proctoredReport: string | null;
};

export function ModuleWorkspace(props: Props) {
  const [resourceMarked, setResourceMarked] = useState(props.hasResourceDone);
  const [practiceAttempted, setPracticeAttempted] = useState(props.hasPracticeAttempt);
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function postProgress(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch(`/api/modules/${props.moduleId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } finally {
      setBusy(false);
    }
  }

  async function trackEvent(body: { eventType: string; modality?: string; timeSpentSeconds?: number }) {
    try {
      await fetch(`/api/modules/${props.moduleId}/track-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // Non-blocking telemetry
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <Link href={`/goals/${props.goalId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300">
        <IconArrowLeft className="h-4 w-4" />
        <span>Back to Roadmap</span>
      </Link>

      {/* Main Module Card */}
      <Card className="p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge tone="accent">{props.skillName}</Badge>
            {props.isProgramming && (
              <Badge tone="cyan">
                {props.programmingLanguage?.toUpperCase()} LAB
              </Badge>
            )}
          </div>
          <span className="rounded-sm bg-purple-950/80 border border-purple-500/30 px-3 py-1 text-[10px] font-bold text-purple-300">
            ~{Math.round(props.estimatedMinutes / 60)}h ESTIMATED
          </span>
        </div>

        <h1 className="text-2xl font-black text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]">
          {props.resourceTitle}
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-400">
          Source: {props.resourceProvider} · Modality: {props.resourceType.toUpperCase()}
        </p>

        {props.rationale && (
          <div className="mt-4 rounded-md border border-purple-500/20 bg-[#070918]/80 p-3.5 text-xs text-slate-300">
            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 block mb-1">
              AI RECOMMENDATION RATIONALE
            </span>
            <p className="leading-relaxed">{props.rationale}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href={props.resourceUrl} target="_blank" rel="noreferrer">
            <Button
              size="md"
              onClick={() => {
                trackEvent({ eventType: "open", modality: props.resourceType });
                if (!resourceMarked) postProgress({ type: "started" });
              }}
            >
              <span>Launch Resource</span>
              <IconExternalLink className="h-4 w-4" />
            </Button>
          </a>

          {!resourceMarked ? (
            <Button
              size="md"
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                await postProgress({ type: "resource_done" });
                await trackEvent({ eventType: "complete", modality: props.resourceType });
                setResourceMarked(true);
              }}
            >
              <span>Mark Step Complete</span>
              <IconCheck className="h-4 w-4" />
            </Button>
          ) : (
            <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-950/60 px-4 py-2 text-xs font-bold text-emerald-300">
              <IconCheck className="h-4 w-4" />
              <span>Study Phase Cleared</span>
            </span>
          )}

          {props.isProgramming && (
            <Link href={`/goals/${props.goalId}/modules/${props.moduleId}/compiler`}>
              <Button size="md" variant="cyan">
                <IconCode className="h-4 w-4" />
                <span>Open Practice Compiler</span>
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Difficulty Calibration Feedback */}
        <div className="mt-6 border-t border-purple-500/15 pt-4">
          <p className="mb-2 text-xs font-bold text-slate-300">Calibrate Module Difficulty for Future Recommendations:</p>
          <div className="flex flex-wrap gap-2">
            {(["too_easy", "just_right", "too_hard"] as const).map((f) => (
              <button
                key={f}
                disabled={busy}
                onClick={async () => {
                  await postProgress({ type: "feedback", feedback: f });
                  setFeedbackSent(f);
                }}
                className={`rounded-md border px-3.5 py-1.5 text-xs font-bold transition-all ${
                  feedbackSent === f
                    ? "border-purple-400 bg-purple-950 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    : "border-purple-500/20 bg-[#080b18] text-slate-400 hover:border-purple-500/40 hover:text-white"
                }`}
              >
                {f === "too_easy" ? "Too Easy" : f === "just_right" ? "Balanced" : "Challenging"}
              </button>
            ))}
          </div>
          {feedbackSent && (
            <p className="mt-2 text-xs font-bold text-emerald-400">
              Feedback registered — upcoming modules re-ranked accordingly.
            </p>
          )}
        </div>
      </Card>

      {/* 25/5 Pomodoro Focus Session Timer */}
      <FocusTimer
        moduleId={props.moduleId}
        skillName={props.skillName}
      />

      {/* Practice Quiz */}
      {resourceMarked ? (
        <PracticeQuiz moduleId={props.moduleId} onSubmitted={() => setPracticeAttempted(true)} />
      ) : (
        <LockedCard title="Practice Assessment" reason="Complete the resource review above to unlock practice assessments." />
      )}

      {/* Official Proctored Assessment */}
      {props.proctoredAlreadyTaken ? (
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <IconAward className="h-5 w-5 text-purple-400" />
              <span>PROCTORED ASSESSMENT SCORE</span>
            </h3>
            <Badge tone="success">OFFICIAL MASTERY RECORDED</Badge>
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-4xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              {props.proctoredScore}/100
            </span>
          </div>
          {props.proctoredReport && (
            <div className="rounded-md border border-purple-500/20 bg-[#070918]/80 p-4 text-xs font-medium text-slate-300 leading-relaxed">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 block mb-1">
                EVALUATION REPORT
              </span>
              {props.proctoredReport}
            </div>
          )}
        </Card>
      ) : practiceAttempted ? (
        <Card className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <IconAward className="h-5 w-5 text-purple-400" />
              <span>OFFICIAL PROCTORED ASSESSMENT</span>
            </h3>
            <Badge tone="warning">SETS OFFICIAL MASTERY</Badge>
          </div>
          <p className="mb-5 text-xs text-slate-300 leading-relaxed">
            Single-attempt, timed, webcam presence-monitored trial with fullscreen focus detection. Successfully completing this assessment sets official skill mastery on your radar.
          </p>
          <Link href={`/goals/${props.goalId}/modules/${props.moduleId}/proctored`}>
            <Button size="lg" variant="primary">
              <span>Begin Proctored Assessment</span>
              <IconArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      ) : (
        <LockedCard
          title="Official Proctored Assessment"
          reason="Complete at least one practice quiz attempt in the arena above to unlock this assessment."
        />
      )}
    </div>
  );
}

function LockedCard({ title, reason }: { title: string; reason: string }) {
  return (
    <div className="rounded-lg border border-purple-500/15 bg-[#080a18]/60 p-6 opacity-60 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-300">
          <IconLock className="h-4 w-4" />
          <span>{title}</span>
        </h3>
        <Badge tone="default">LOCKED</Badge>
      </div>
      <p className="text-xs text-slate-500">{reason}</p>
    </div>
  );
}
