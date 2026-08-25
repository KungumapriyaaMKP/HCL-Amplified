"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PracticeQuiz } from "@/components/goals/PracticeQuiz";

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
  moduleStatus: string;
  proctoredAlreadyTaken: boolean;
  proctoredScore: number | null;
  proctoredReport: string | null;
};

export function ModuleWorkspace(props: Props) {
  const [resourceMarked, setResourceMarked] = useState(props.moduleStatus !== "available");
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

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <Badge tone="accent">{props.skillName}</Badge>
          {props.isProgramming && <Badge tone="default">💻 {props.programmingLanguage}</Badge>}
        </div>
        <h2 className="mb-1 text-lg font-semibold">{props.resourceTitle}</h2>
        <p className="mb-3 text-xs text-muted">
          {props.resourceType} · {props.resourceProvider} · ~{Math.round(props.estimatedMinutes / 60)}h
        </p>
        {props.rationale && <p className="mb-4 text-sm text-foreground/85">{props.rationale}</p>}

        <div className="flex flex-wrap gap-2">
          <a href={props.resourceUrl} target="_blank" rel="noreferrer">
            <Button
              size="sm"
              onClick={() => {
                if (!resourceMarked) postProgress({ type: "started" });
              }}
            >
              Open resource ↗
            </Button>
          </a>
          {!resourceMarked && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                await postProgress({ type: "resource_done" });
                setResourceMarked(true);
              }}
            >
              Mark resource as done
            </Button>
          )}
          {props.isProgramming && (
            <Link href={`/goals/${props.goalId}/modules/${props.moduleId}/compiler`}>
              <Button size="sm" variant="secondary">Open practice compiler</Button>
            </Link>
          )}
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="mb-2 text-xs text-muted">How was the difficulty of this module?</p>
          <div className="flex gap-2">
            {(["too_easy", "just_right", "too_hard"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={feedbackSent === f ? "primary" : "secondary"}
                disabled={busy}
                onClick={async () => {
                  await postProgress({ type: "feedback", feedback: f });
                  setFeedbackSent(f);
                }}
              >
                {f === "too_easy" ? "Too easy" : f === "just_right" ? "Just right" : "Too hard"}
              </Button>
            ))}
          </div>
          {feedbackSent && <p className="mt-2 text-xs text-success">Thanks - upcoming modules have been re-ranked to match.</p>}
        </div>
      </Card>

      <PracticeQuiz moduleId={props.moduleId} />

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Proctored test</h3>
          <Badge tone="warning">Determines official mastery</Badge>
        </div>
        {props.proctoredAlreadyTaken ? (
          <div>
            <p className="mb-2 text-2xl font-semibold text-accent">{props.proctoredScore}/100</p>
            {props.proctoredReport && <p className="text-sm text-foreground/85">{props.proctoredReport}</p>}
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-muted">
              A single-attempt, timed, browser-monitored test (fullscreen + tab-switch detection + a live webcam
              self-view). This is what sets your real mastery score for {props.skillName}.
            </p>
            <Link href={`/goals/${props.goalId}/modules/${props.moduleId}/proctored`}>
              <Button size="sm">Begin proctored test</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
