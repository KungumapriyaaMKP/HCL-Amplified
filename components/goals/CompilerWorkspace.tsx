"use client";

import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

const STARTERS: Record<string, string> = {
  python: '# Write your practice code below\nprint("Hello, world!")\n',
  javascript: '// Write your practice code below\nconsole.log("Hello, world!");\n',
  typescript: '// Write your practice code below\nconst message: string = "Hello, world!";\nconsole.log(message);\n',
};

type Exercise = { title: string; prompt: string };
type RunResult = { stdout: string; stderr: string; compileError?: string };
type ExerciseState = { code: string; stdin: string; output: RunResult | null };

export function CompilerWorkspace({ moduleId, skillName, language }: { moduleId: string; skillName: string; language: string }) {
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [byExercise, setByExercise] = useState<Record<number, ExerciseState>>({});
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetch(`/api/modules/${moduleId}/exercises`)
      .then((r) => r.json())
      .then((body) => setExercises(body.exercises ?? []))
      .catch(() => setExercises([]));
  }, [moduleId]);

  function stateFor(index: number): ExerciseState {
    return byExercise[index] ?? { code: STARTERS[language] ?? "", stdin: "", output: null };
  }

  function updateCurrent(patch: Partial<ExerciseState>) {
    setByExercise((prev) => ({ ...prev, [current]: { ...stateFor(current), ...patch } }));
  }

  async function run() {
    setRunning(true);
    const { code, stdin } = stateFor(current);
    try {
      const res = await fetch("/api/compiler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin }),
      });
      updateCurrent({ output: await res.json() });
    } finally {
      setRunning(false);
    }
  }

  function toggleDone() {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(current)) next.delete(current);
      else next.add(current);
      return next;
    });
  }

  if (!exercises) {
    return <p className="text-sm text-muted">Generating practice exercises...</p>;
  }
  if (exercises.length === 0) {
    return <p className="text-sm text-muted">Couldn&apos;t generate exercises for this module - try refreshing.</p>;
  }

  const ex = exercises[current];
  const { code, stdin, output } = stateFor(current);
  const isDone = done.has(current);

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* One-at-a-time exercise list: click any to revisit and revise, done
          ones stay checked off but stay editable. */}
      <Card className="h-fit p-3">
        <h3 className="mb-2 px-1 text-sm font-semibold">Practice exercises</h3>
        <ol className="space-y-1">
          {exercises.map((item, i) => {
            const active = i === current;
            const complete = done.has(i);
            return (
              <li key={i}>
                <button
                  onClick={() => setCurrent(i)}
                  className={`flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
                    active ? "bg-accent/15 text-foreground" : "text-muted hover:bg-surface-2 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                      complete ? "bg-success/20 text-success" : "bg-surface-2 text-muted"
                    }`}
                  >
                    {complete ? "✓" : i + 1}
                  </span>
                  <span className="truncate">{item.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="space-y-3">
        <Card className="p-4">
          <div className="mb-1 flex items-center justify-between gap-3">
            <Badge tone="accent">{skillName}</Badge>
            <span className="text-xs text-muted">
              Exercise {current + 1} of {exercises.length}
            </span>
          </div>
          <h3 className="mt-2 font-medium">{ex.title}</h3>
          <p className="mt-1 text-sm text-muted">{ex.prompt}</p>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-xs text-muted">{language}</span>
            {isDone && <Badge tone="success">Marked done</Badge>}
          </div>
          <Textarea
            value={code}
            onChange={(e) => updateCurrent({ code: e.target.value })}
            rows={14}
            className="rounded-none border-0 font-mono text-[13px] leading-relaxed focus:ring-0"
          />
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" disabled={running} onClick={run}>
            {running ? "Running..." : "Run ▶"}
          </Button>
          <Textarea
            value={stdin}
            onChange={(e) => updateCurrent({ stdin: e.target.value })}
            rows={1}
            placeholder="stdin (optional)"
            className="max-w-xs"
          />
          <Button size="sm" variant={isDone ? "secondary" : "primary"} onClick={toggleDone}>
            {isDone ? "Unmark done" : "Mark as done"}
          </Button>
        </div>

        {output && (
          <Card className="p-4 font-mono text-xs">
            {output.compileError && <pre className="whitespace-pre-wrap text-warning">{output.compileError}</pre>}
            {output.stdout && <pre className="whitespace-pre-wrap text-foreground">{output.stdout}</pre>}
            {output.stderr && <pre className="whitespace-pre-wrap text-danger">{output.stderr}</pre>}
            {!output.stdout && !output.stderr && !output.compileError && <p className="text-muted">(no output)</p>}
          </Card>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" size="sm" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
            ‹ Previous
          </Button>
          <span className="text-xs text-muted">You can come back and revise any exercise any time.</span>
          <Button
            variant="secondary"
            size="sm"
            disabled={current === exercises.length - 1}
            onClick={() => setCurrent((c) => c + 1)}
          >
            Next ›
          </Button>
        </div>
      </div>
    </div>
  );
}
