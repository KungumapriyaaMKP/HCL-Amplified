"use client";

import { useEffect, useState } from "react";
import { Card } from "@/frontend/components/ui/Card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/Button";
import { Textarea } from "@/frontend/components/ui/Input";
import {
  IconPlayerPlay,
  IconCheck,
  IconX,
  IconCode,
  IconArrowLeft,
  IconArrowRight,
} from "@tabler/icons-react";

const STARTERS: Record<string, string> = {
  python: '# Write your solution below\nprint("Hello, QuestLearn!")\n',
  javascript: '// Write your solution below\nconsole.log("Hello, QuestLearn!");\n',
  typescript: '// Write your solution below\nconst message: string = "Hello, QuestLearn!";\nconsole.log(message);\n',
};

type TestCase = { input: string; expectedOutput: string };
type Exercise = { title: string; prompt: string; testCases: TestCase[] };
type RunResult = { stdout: string; stderr: string; compileError?: string };
type TestResult = { passed: boolean; input: string; expected: string; actual: string; error: string | null };
type ExerciseState = { code: string; stdin: string; output: RunResult | null; results: TestResult[] | null };

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

  async function run() {
    setRunning(true);
    const { code, stdin } = stateFor(current);
    try {
      const res = await fetch("/api/compiler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin }),
      });
      updateCurrent({ output: await res.json(), results: null });
    } finally {
      setRunning(false);
    }
  }

  async function submit() {
    const ex = exercises?.[current];
    if (!ex || ex.testCases.length === 0) return;
    setSubmitting(true);
    const { code } = stateFor(current);
    try {
      const results: TestResult[] = [];
      for (const tc of ex.testCases) {
        const res = await fetch("/api/compiler/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, code, stdin: tc.input }),
        });
        const body: RunResult = await res.json();
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
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="flex items-center justify-center gap-2 text-purple-400">
          <span className="h-3 w-3 rounded-full bg-purple-400 animate-ping" />
          <span>Generating Coding Exercises...</span>
        </div>
      </div>
    );
  }
  if (exercises.length === 0) {
    return <p className="text-sm text-slate-400">Could not generate challenges for this module — try refreshing.</p>;
  }

  const ex = exercises[current];
  const { code, stdin, output, results } = stateFor(current);
  const passedAll = results !== null && results.length > 0 && results.every((r) => r.passed);
  const isDoneByIndex = (i: number) => {
    const r = byExercise[i]?.results;
    return !!r && r.length > 0 && r.every((x) => x.passed);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      
      {/* Exercise Sidebar */}
      <Card className="h-fit p-4">
        <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-purple-300">
          PRACTICE EXERCISES
        </h3>
        <ol className="space-y-1.5">
          {exercises.map((item, i) => {
            const active = i === current;
            const complete = isDoneByIndex(i);
            return (
              <li key={i}>
                <button
                  onClick={() => setCurrent(i)}
                  className={`flex w-full items-start gap-2.5 rounded-md px-3 py-2.5 text-left text-xs font-bold transition-all ${
                    active
                      ? "border border-purple-400 bg-purple-950/80 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                      : "border border-transparent text-slate-400 hover:bg-[#121633] hover:text-slate-200"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[10px] font-black ${
                      complete ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {complete ? <IconCheck className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="truncate">{item.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Main Coding IDE Terminal */}
      <div className="space-y-4">
        
        {/* Prompt Card */}
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Badge tone="cyan">{skillName}</Badge>
            <span className="text-xs font-bold text-slate-400">
              Exercise {current + 1} of {exercises.length}
            </span>
          </div>
          <h2 className="text-lg font-black text-white">{ex.title}</h2>
          <p className="mt-1 text-xs text-slate-300 leading-relaxed font-medium">{ex.prompt}</p>
        </Card>

        {/* Code Editor Container */}
        <div className="overflow-hidden rounded-lg border-2 border-purple-500/30 bg-[#070918] shadow-[0_0_35px_rgba(139,92,246,0.2)]">
          <div className="flex items-center justify-between border-b border-purple-500/20 bg-[#0c1026] px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider ml-2">
                CODE WORKSPACE · {language.toUpperCase()}
              </span>
            </div>
            {passedAll && (
              <Badge tone="success" className="flex items-center gap-1">
                <IconCheck className="h-3 w-3" />
                <span>ALL TESTS PASSED</span>
              </Badge>
            )}
          </div>

          <Textarea
            value={code}
            onChange={(e) => updateCurrent({ code: e.target.value })}
            rows={14}
            className="w-full rounded-none border-0 bg-[#060814] p-5 font-mono text-xs text-emerald-300 leading-relaxed focus:ring-0 focus:border-0 shadow-none"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button size="md" variant="secondary" disabled={running} onClick={run}>
            <IconPlayerPlay className="h-4 w-4" />
            <span>{running ? "Running..." : "Run Code"}</span>
          </Button>

          <input
            type="text"
            value={stdin}
            onChange={(e) => updateCurrent({ stdin: e.target.value })}
            placeholder="stdin input (optional for free-run)"
            className="flex-1 min-w-[200px] rounded-md border border-purple-500/30 bg-[#080a1a] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />

          <Button
            size="md"
            variant="primary"
            disabled={submitting || ex.testCases.length === 0}
            onClick={submit}
          >
            <IconCheck className="h-4 w-4" />
            <span>{submitting ? "Checking Tests..." : "Submit Solution"}</span>
          </Button>
        </div>

        {/* Terminal Run Output */}
        {output && (
          <div className="rounded-md border border-purple-500/30 bg-[#060814] p-4 font-mono text-xs shadow-inner">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Execution Output (stdout / stderr):</p>
            {output.compileError && <pre className="whitespace-pre-wrap text-amber-400">{output.compileError}</pre>}
            {output.stdout && <pre className="whitespace-pre-wrap text-emerald-400">{output.stdout}</pre>}
            {output.stderr && <pre className="whitespace-pre-wrap text-red-400">{output.stderr}</pre>}
            {!output.stdout && !output.stderr && !output.compileError && <p className="text-slate-500">(No output)</p>}
          </div>
        )}

        {/* Test Cases Results */}
        {results && (
          <div className="divide-y divide-purple-500/20 rounded-md border border-purple-500/30 bg-[#0a0e24] overflow-hidden">
            {results.map((r, i) => (
              <div key={i} className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone={r.passed ? "success" : "danger"} className="flex items-center gap-1">
                    {r.passed ? <IconCheck className="h-3 w-3" /> : <IconX className="h-3 w-3" />}
                    <span>{r.passed ? "PASSED" : "FAILED"}</span>
                  </Badge>
                  <span className="text-xs font-bold text-slate-300">Test Case #{i + 1}</span>
                </div>
                {!r.passed && (
                  <div className="grid gap-1 font-mono text-xs text-slate-400 mt-2 bg-black/40 p-3 rounded-sm">
                    <p>Input: <span className="text-white">{r.input || "(none)"}</span></p>
                    <p>Expected: <span className="text-emerald-400">{r.expected}</span></p>
                    <p>Actual Output: <span className="text-red-400">{r.actual}</span></p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" size="sm" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
            <IconArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          <span className="text-[11px] text-slate-400">Revise any exercise at any time.</span>
          <Button
            variant="secondary"
            size="sm"
            disabled={current === exercises.length - 1}
            onClick={() => setCurrent((c) => c + 1)}
          >
            <span>Next</span>
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </div>
  );
}
