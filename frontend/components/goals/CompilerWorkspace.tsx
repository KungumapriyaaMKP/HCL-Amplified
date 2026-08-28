"use client";

import { useEffect, useState } from "react";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/Button";
import { Textarea } from "@/frontend/components/ui/Input";
import { emitNudge } from "@/lib/mentorBus";

const STARTERS: Record<string, string> = {
  python: '# Write your practice code below\nprint("Hello, world!")\n',
  javascript: '// Write your practice code below\nconsole.log("Hello, world!");\n',
  typescript: '// Write your practice code below\nconst message: string = "Hello, world!";\nconsole.log(message);\n',
};

type TestCase = { input: string; expectedOutput: string };
type Exercise = { title: string; prompt: string; testCases: TestCase[] };
type RunResult = { stdout: string; stderr: string; compileError?: string };
type TestResult = { passed: boolean; input: string; expected: string; actual: string; error: string | null };
type ExerciseState = { code: string; stdin: string; output: RunResult | null; results: TestResult[] | null };

import { runPythonInBrowser } from "@/lib/pyodideRunner";

export function CompilerWorkspace({ moduleId, skillName, language }: { moduleId: string; skillName: string; language: string }) {
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [byExercise, setByExercise] = useState<Record<number, ExerciseState>>({});
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/modules/${moduleId}/exercises`)
      .then((r) => r.json())
      .then((body) => setExercises(body.exercises ?? []))
      .catch(() => setExercises([]));
  }, [moduleId]);

  function stateFor(index: number): ExerciseState {
    return byExercise[index] ?? { code: STARTERS[language] ?? "", stdin: "", output: null, results: null };
  }

  function updateCurrent(patch: Partial<ExerciseState>) {
    setByExercise((prev) => ({ ...prev, [current]: { ...stateFor(current), ...patch } }));
  }

  async function executeCode(codeToRun: string, stdinInput: string): Promise<RunResult> {
    if (language === "python") {
      return await runPythonInBrowser(codeToRun, stdinInput);
    }
    const res = await fetch("/api/compiler/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code: codeToRun, stdin: stdinInput }),
    });
    return await res.json();
  }

  async function run() {
    setRunning(true);
    const { code, stdin } = stateFor(current);
    try {
      const output = await executeCode(code, stdin);
      updateCurrent({ output, results: null });
      emitNudge("code_run");
    } finally {
      setRunning(false);
    }
  }

  // The only way an exercise counts as done: every one of its test cases
  // actually passes when run for real. No manual override - this is the
  // point of grading it instead of taking the learner's word for it.
  async function submit() {
    const ex = exercises?.[current];
    if (!ex || ex.testCases.length === 0) return;
    setSubmitting(true);
    const { code } = stateFor(current);
    try {
      const results: TestResult[] = [];
      for (const tc of ex.testCases) {
        const body: RunResult = await executeCode(code, tc.input);
        const actual = (body.stdout ?? "").trim();
        const expected = tc.expectedOutput.trim();
        results.push({
          passed: !body.compileError && !body.stderr && actual === expected,
          input: tc.input,
          expected,
          actual: body.compileError || body.stderr || actual,
          error: body.compileError || body.stderr || null,
        });
      }
      updateCurrent({ results, output: null });
    } finally {
      setSubmitting(false);
    }
  }

  if (!exercises) {
    return <p className="text-sm text-muted">Generating practice exercises...</p>;
  }
  if (exercises.length === 0) {
    return <p className="text-sm text-muted">Couldn&apos;t generate exercises for this module - try refreshing.</p>;
  }

  const ex = exercises[current];
  const { code, stdin, output, results } = stateFor(current);
  const passedAll = results !== null && results.length > 0 && results.every((r) => r.passed);
  const isDoneByIndex = (i: number) => {
    const r = byExercise[i]?.results;
    return !!r && r.length > 0 && r.every((x) => x.passed);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      {/* One-at-a-time exercise list: click any to revisit and revise. The
          checkmark only appears once that exercise's tests have actually
          passed - it's not something the learner can just toggle on. */}
      <Card className="h-fit p-3">
        <h3 className="mb-2 px-1 text-sm font-semibold">Practice exercises</h3>
        <ol className="space-y-1">
          {exercises.map((item, i) => {
            const active = i === current;
            const complete = isDoneByIndex(i);
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
            {passedAll && <Badge tone="success">All tests passed ✓</Badge>}
          </div>
          <Textarea
            value={code}
            onChange={(e) => updateCurrent({ code: e.target.value })}
            rows={14}
            className="rounded-none border-0 font-mono text-[13px] leading-relaxed focus:ring-0"
          />
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" disabled={running} onClick={run}>
            {running ? "Running..." : "Run ▶"}
          </Button>
          <Textarea
            value={stdin}
            onChange={(e) => updateCurrent({ stdin: e.target.value })}
            rows={1}
            placeholder="stdin (optional, for free-form Run)"
            className="max-w-xs"
          />
          <Button
            size="sm"
            disabled={submitting || ex.testCases.length === 0}
            onClick={submit}
            title={ex.testCases.length === 0 ? "No test cases available for this exercise" : undefined}
          >
            {submitting ? "Checking..." : "Submit ✓"}
          </Button>
        </div>

        {output && (
          <Card className="p-4 font-mono text-xs">
            <p className="mb-2 text-[11px] font-sans text-muted">Free-run output (not graded):</p>
            {output.compileError && <pre className="whitespace-pre-wrap text-warning">{output.compileError}</pre>}
            {output.stdout && <pre className="whitespace-pre-wrap text-foreground">{output.stdout}</pre>}
            {output.stderr && <pre className="whitespace-pre-wrap text-danger">{output.stderr}</pre>}
            {!output.stdout && !output.stderr && !output.compileError && <p className="text-muted">(no output)</p>}
          </Card>
        )}

        {results && (
          <Card className="divide-y divide-border p-0">
            {results.map((r, i) => (
              <div key={i} className="p-3">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone={r.passed ? "success" : "danger"}>{r.passed ? "Passed" : "Failed"}</Badge>
                  <span className="text-xs text-muted">Test case {i + 1}</span>
                </div>
                {!r.passed && (
                  <div className="grid gap-1 font-mono text-xs text-muted">
                    <p>
                      input: <span className="text-foreground">{r.input || "(none)"}</span>
                    </p>
                    <p>
                      expected: <span className="text-foreground">{r.expected}</span>
                    </p>
                    <p>
                      got: <span className="text-danger">{r.actual}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
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
