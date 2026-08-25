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

export function CompilerWorkspace({ moduleId, skillName, language }: { moduleId: string; skillName: string; language: string }) {
  const [code, setCode] = useState(STARTERS[language] ?? "");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState<{ stdout: string; stderr: string; compileError?: string } | null>(null);
  const [running, setRunning] = useState(false);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);

  useEffect(() => {
    fetch(`/api/modules/${moduleId}/exercises`)
      .then((r) => r.json())
      .then((body) => setExercises(body.exercises ?? []))
      .catch(() => setExercises([]));
  }, [moduleId]);

  async function run() {
    setRunning(true);
    setOutput(null);
    try {
      const res = await fetch("/api/compiler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, stdin }),
      });
      setOutput(await res.json());
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <Badge tone="accent">{skillName}</Badge>
            <span className="text-xs text-muted">{language}</span>
          </div>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={16}
            className="rounded-none border-0 font-mono text-[13px] leading-relaxed focus:ring-0"
          />
        </Card>
        <div className="flex items-center gap-2">
          <Button size="sm" disabled={running} onClick={run}>{running ? "Running..." : "Run ▶"}</Button>
          <Textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={1} placeholder="stdin (optional)" className="max-w-xs" />
        </div>
        {output && (
          <Card className="p-4 font-mono text-xs">
            {output.compileError && <pre className="whitespace-pre-wrap text-warning">{output.compileError}</pre>}
            {output.stdout && <pre className="whitespace-pre-wrap text-foreground">{output.stdout}</pre>}
            {output.stderr && <pre className="whitespace-pre-wrap text-danger">{output.stderr}</pre>}
            {!output.stdout && !output.stderr && !output.compileError && <p className="text-muted">(no output)</p>}
          </Card>
        )}
      </div>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold">Practice exercises</h3>
        {!exercises ? (
          <p className="text-sm text-muted">Generating...</p>
        ) : (
          <ol className="space-y-3">
            {exercises.map((ex, i) => (
              <li key={i} className="text-sm">
                <p className="font-medium">{i + 1}. {ex.title}</p>
                <p className="text-xs text-muted">{ex.prompt}</p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
