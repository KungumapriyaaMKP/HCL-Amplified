"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconPlayerPlay,
  IconInfoCircle,
  IconSun,
  IconMaximize,
  IconDotsVertical,
  IconFileCode,
  IconFlame,
  IconStar,
} from "@tabler/icons-react";
import { emitNudge } from "@/lib/mentorBus";
import { runPythonInBrowser } from "@/lib/pyodideRunner";

const STARTERS: Record<string, string> = {
  python: `# Write your solution below\nprint("Hello, QuestLearn!")\n`,
  javascript: `// Write your solution below\nconsole.log("Hello, QuestLearn!");\n`,
  typescript: `// Write your solution below\nconst message: string = "Hello, QuestLearn!";\nconsole.log(message);\n`,
};

type TestCase = { input: string; expectedOutput: string };
type Exercise = { title: string; prompt: string; testCases: TestCase[] };
type RunResult = { stdout: string; stderr: string; compileError?: string };
type TestResult = { passed: boolean; input: string; expected: string; actual: string; error: string | null };
type ExerciseState = { code: string; stdin: string; output: RunResult | null; results: TestResult[] | null };

const DEFAULT_EXERCISES: Exercise[] = [
  {
    title: "Sum of Two Numbers",
    prompt: "Read two integers from a single line of input, separated by a space.\nPrint their sum as a single integer, with no extra text.",
    testCases: [
      { input: "4 7", expectedOutput: "11" },
      { input: "100 250", expectedOutput: "350" },
      { input: "-5 15", expectedOutput: "10" },
    ],
  },
  {
    title: "Even or Odd",
    prompt: "Read a single integer from input. Print 'Even' if the number is divisible by 2, or 'Odd' otherwise (exact case, no extra quotes or labels).",
    testCases: [
      { input: "8", expectedOutput: "Even" },
      { input: "13", expectedOutput: "Odd" },
      { input: "0", expectedOutput: "Even" },
    ],
  },
  {
    title: "Reverse a String",
    prompt: "Read a single line containing a string of text. Print the reversed string on a single line.",
    testCases: [
      { input: "questlearn", expectedOutput: "nraeltseuq" },
      { input: "python", expectedOutput: "nohtyp" },
      { input: "hello world", expectedOutput: "dlrow olleh" },
    ],
  },
  {
    title: "Count Vowels",
    prompt: "Read a string from input. Count and print the total number of vowels (a, e, i, o, u, case-insensitive) present in the text as a single integer.",
    testCases: [
      { input: "education", expectedOutput: "5" },
      { input: "rhythm", expectedOutput: "0" },
      { input: "QuestLearn AI", expectedOutput: "6" },
    ],
  },
  {
    title: "List Statistics",
    prompt: "Read space-separated integers from a single line. Print the minimum, maximum, and sum on a single line separated by single spaces (e.g. '2 9 26').",
    testCases: [
      { input: "3 7 2 9 5", expectedOutput: "2 9 26" },
      { input: "10 20 30", expectedOutput: "10 30 60" },
      { input: "5", expectedOutput: "5 5 5" },
    ],
  },
];

export function CompilerWorkspace({
  goalId,
  moduleId,
  skillName = "Python Fundamentals",
  language = "python",
  dayStreak = 7,
  totalXp = 320,
}: {
  goalId?: string;
  moduleId: string;
  skillName?: string;
  language?: string;
  dayStreak?: number;
  totalXp?: number;
}) {
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [current, setCurrent] = useState(0);
  const [byExercise, setByExercise] = useState<Record<number, ExerciseState>>({});
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDarkEditor, setIsDarkEditor] = useState(false);

  useEffect(() => {
    fetch(`/api/modules/${moduleId}/exercises`)
      .then((r) => r.json())
      .then((body) => {
        if (body.exercises && Array.isArray(body.exercises) && body.exercises.length > 0) {
          setExercises(body.exercises);
        }
      })
      .catch(() => {
        setExercises(DEFAULT_EXERCISES);
      });
  }, [moduleId]);

  function stateFor(index: number): ExerciseState {
    return byExercise[index] ?? { code: STARTERS[language] ?? STARTERS.python, stdin: "", output: null, results: null };
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

  async function submit() {
    const ex = exercises[current];
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

  const ex = exercises[current] || DEFAULT_EXERCISES[0];
  const { code, stdin, output, results } = stateFor(current);
  const passedAll = results !== null && results.length > 0 && results.every((r) => r.passed);
  const isDoneByIndex = (i: number) => {
    const r = byExercise[i]?.results;
    return !!r && r.length > 0 && r.every((x) => x.passed);
  };

  const lineCount = Math.max(8, code.split("\n").length);

  return (
    <div className="space-y-6">
      
      {/* ================= HEADER SECTION (Matching Image 2) ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left Title & Breadcrumb */}
        <div className="space-y-1">
          {goalId && (
            <Link
              href={`/goals/${goalId}/modules/${moduleId}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D28D9] hover:text-[#5B21B6] transition-colors"
            >
              <IconArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Module</span>
            </Link>
          )}

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#7C3AED]">
              CODE LAB &amp; COMPILER ENVIRONMENT
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {skillName} Practice Challenges
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Sharpen your {skillName.toLowerCase()} skills with hands-on practice exercises.
          </p>
        </div>

        {/* Right Badges & Mascot Illustration */}
        <div className="flex items-center gap-4 self-start lg:self-auto">
          {/* Day Streak Card */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <IconFlame className="h-5 w-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-none">
                {dayStreak}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                Day Streak
              </div>
            </div>
          </div>

          {/* XP Earned Card */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <IconStar className="h-5 w-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 leading-none">
                {totalXp}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                XP Earned
              </div>
            </div>
          </div>

          {/* Cute 3D Robot Mascot */}
          <div className="hidden sm:flex items-center justify-center w-28 h-20 relative">
            <svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
              <ellipse cx="70" cy="88" rx="60" ry="8" fill="#E0E7FF" opacity="0.6" />
              <path d="M110 82 C110 75 116 72 120 72 C124 72 130 75 130 82 Z" fill="#6EE7B7" />
              <rect x="117" y="80" width="6" height="8" rx="2" fill="#D97706" />

              <rect x="42" y="58" width="44" height="26" rx="3" fill="#334155" />
              <rect x="45" y="61" width="38" height="20" rx="1.5" fill="#0F172A" />
              <path d="M36 84 L92 84 L88 88 L40 88 Z" fill="#64748B" />
              <text x="64" y="75" fontSize="9" fontWeight="900" fill="#818CF8" textAnchor="middle" fontFamily="monospace">&lt;/&gt;</text>

              <rect x="52" y="38" width="36" height="32" rx="16" fill="#6366F1" />
              <rect x="56" y="44" width="28" height="20" rx="10" fill="#4338CA" />
              <circle cx="64" cy="52" r="2.5" fill="#38BDF8" />
              <circle cx="76" cy="52" r="2.5" fill="#38BDF8" />
              <path d="M66 58 Q70 61 74 58" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />

              <path d="M48 48 C48 30 92 30 92 48" stroke="#A78BFA" strokeWidth="3" fill="none" />
              <rect x="46" y="44" width="6" height="12" rx="3" fill="#7C3AED" />
              <rect x="88" y="44" width="6" height="12" rx="3" fill="#7C3AED" />

              <circle cx="48" cy="74" r="4" fill="#C7D2FE" />
              <circle cx="86" cy="74" r="4" fill="#C7D2FE" />

              <path d="M105 28 L107 33 L112 34 L108 37 L109 42 L105 39 L101 42 L102 37 L98 34 L103 33 Z" fill="#FBBF24" />
              <circle cx="34" cy="38" r="2" fill="#C084FC" />
            </svg>
          </div>

        </div>
      </div>

      {/* ================= 2-COLUMN MAIN BODY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-6 items-start">
        
        {/* ---------------- LEFT COLUMN: EXERCISES LIST ---------------- */}
        <div className="space-y-4">
          
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            {/* Header */}
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
              <IconFileCode className="h-4 w-4 text-[#7C3AED]" />
              <h3 className="text-xs font-black uppercase tracking-wider text-[#4C1D95]">
                PRACTICE EXERCISES
              </h3>
            </div>

            {/* Stepper Vertical List */}
            <div className="relative space-y-1">
              {exercises.map((item, i) => {
                const active = i === current;
                const complete = isDoneByIndex(i);
                const isLast = i === exercises.length - 1;

                return (
                  <div key={i} className="relative">
                    {!isLast && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 border-l-2 border-dashed border-slate-200 pointer-events-none -mb-2" />
                    )}

                    <button
                      type="button"
                      onClick={() => setCurrent(i)}
                      className={`relative z-10 flex w-full items-center justify-between gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        active
                          ? "bg-purple-50/80 border border-purple-200/80 shadow-xs"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black transition-all ${
                            active
                              ? "bg-[#6D28D9] text-white shadow-sm shadow-purple-500/30"
                              : complete
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                              : "border-2 border-slate-200 bg-white text-slate-500"
                          }`}
                        >
                          {complete ? <IconCheck className="h-3.5 w-3.5 stroke-[3]" /> : i + 1}
                        </div>

                        <span
                          className={`truncate text-xs ${
                            active
                              ? "font-extrabold text-slate-900"
                              : complete
                              ? "font-bold text-slate-700"
                              : "font-semibold text-slate-600"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>

                      {active && (
                        <IconArrowRight className="h-4 w-4 text-[#7C3AED] shrink-0" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Motivational Bottom Card */}
          <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/70 via-indigo-50/30 to-purple-50/90 p-4 shadow-2xs flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] text-amber-300 shadow-md">
              <span className="text-xl">🏆</span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                Keep practicing! 🚀
              </h4>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">
                Every challenge makes you better.
              </p>
            </div>
          </div>

        </div>

        {/* ---------------- RIGHT COLUMN: MAIN CHALLENGE & IDE ---------------- */}
        <div className="space-y-4">
          
          {/* Card 1: Challenge Details & 3D Python Laptop Illustration */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="rounded-full bg-purple-100/90 border border-purple-200/60 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#6D28D9]">
                {skillName.toUpperCase()}
              </span>

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span>Exercise {current + 1} of {exercises.length}</span>
                <div className="flex items-center gap-1">
                  {exercises.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all ${
                        idx === current
                          ? "w-4 bg-[#6D28D9]"
                          : isDoneByIndex(idx)
                          ? "w-1.5 bg-emerald-400"
                          : "w-1.5 bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 items-center">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {ex.title}
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                  {ex.prompt}
                </div>
              </div>

              {/* 3D Laptop with Python Logo & Coffee Mug */}
              <div className="hidden md:flex items-center justify-center">
                <svg viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-44 h-32 drop-shadow-sm">
                  <ellipse cx="80" cy="100" rx="70" ry="12" fill="#EDE9FE" opacity="0.6" />
                  
                  <path d="M22 85 C18 68 28 62 32 60 C32 72 26 82 22 85 Z" fill="#34D399" />
                  <path d="M25 82 C20 72 32 66 38 68 C36 78 28 84 25 82 Z" fill="#10B981" />
                  <path d="M19 86 L31 86 L28 98 L22 98 Z" fill="#D97706" />

                  <rect x="36" y="82" width="14" height="16" rx="3" fill="#38BDF8" />
                  <path d="M50 85 C54 85 54 93 50 93" stroke="#38BDF8" strokeWidth="2.5" fill="none" />
                  <path d="M40 78 Q42 74 40 70" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

                  <rect x="52" y="32" width="86" height="56" rx="4" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
                  <rect x="56" y="36" width="78" height="48" rx="2" fill="#F8FAFC" />
                  <path d="M44 90 L146 90 L140 98 L50 98 Z" fill="#CBD5E1" />
                  <rect x="84" y="91" width="22" height="3" rx="1.5" fill="#94A3B8" />

                  <g transform="translate(80, 48) scale(0.65)">
                    <path
                      d="M20 4 C11 4 11 8 11 8 L11 12 L20 12 L20 13 L7 13 C7 13 3 13 3 20 C3 27 6.5 27 6.5 27 L9 27 L9 23.5 C9 20 12 17 15.5 17 L24.5 17 C27.5 17 30 14.5 30 11.5 L30 8 C30 8 30 4 20 4 Z"
                      fill="#38BDF8"
                    />
                    <circle cx="15" cy="8" r="1.5" fill="white" />
                    <path
                      d="M20 36 C29 36 29 32 29 32 L29 28 L20 28 L20 27 L33 27 C33 27 37 27 37 20 C37 13 33.5 13 33.5 13 L31 13 L31 16.5 C31 20 28 23 24.5 23 L15.5 23 C12.5 23 10 25.5 10 28.5 L10 32 C10 32 10 36 20 36 Z"
                      fill="#FBBF24"
                    />
                    <circle cx="25" cy="32" r="1.5" fill="white" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Code Workspace & Terminal */}
          <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
            
            {/* Top Workspace Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-[#FAF9FD] px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-[#7C3AED] font-mono text-xs font-black">
                  &lt;/&gt;
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-[#6D28D9]">
                  CODE WORKSPACE • {language.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => setIsDarkEditor((d) => !d)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Toggle Theme"
                >
                  <IconSun className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Fullscreen"
                >
                  <IconMaximize className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Options"
                >
                  <IconDotsVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Code Editor Body */}
            <div className={`relative flex font-mono text-xs ${isDarkEditor ? "bg-[#0B0F19] text-emerald-300" : "bg-white text-slate-900"}`}>
              <div className={`select-none py-4 px-3 text-right text-[11px] font-mono shrink-0 border-r ${isDarkEditor ? "bg-[#080B14] text-slate-600 border-slate-800" : "bg-[#FBFBFE] text-slate-400 border-slate-100"}`}>
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i} className="leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>

              <textarea
                value={code}
                onChange={(e) => updateCurrent({ code: e.target.value })}
                rows={Math.max(8, lineCount)}
                spellCheck={false}
                className={`w-full resize-none p-4 font-mono text-xs leading-6 outline-none border-0 focus:ring-0 shadow-none ${
                  isDarkEditor
                    ? "bg-[#0B0F19] text-emerald-300 placeholder-slate-600"
                    : "bg-white text-slate-900 placeholder-slate-400 selection:bg-purple-100"
                }`}
                placeholder="# Write your solution here"
              />
            </div>

            {/* Bottom Controls Bar (Matching Image 2) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 border-t border-slate-100 bg-[#FBFBFE]">
              <button
                type="button"
                disabled={running}
                onClick={run}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-purple-200 bg-white text-xs font-bold text-[#6D28D9] hover:bg-purple-50 shadow-2xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <IconPlayerPlay className="h-4 w-4 fill-purple-600 text-purple-600" />
                <span>{running ? "Running..." : "Run Code"}</span>
              </button>

              <input
                type="text"
                value={stdin}
                onChange={(e) => updateCurrent({ stdin: e.target.value })}
                placeholder="stdin input (optional for free-run)"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
              />

              <button
                type="button"
                disabled={submitting || ex.testCases.length === 0}
                onClick={submit}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] text-xs font-black text-white shadow-md shadow-purple-500/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                <IconCheck className="h-4 w-4 stroke-[3]" />
                <span>{submitting ? "Checking Tests..." : "Submit Solution"}</span>
              </button>
            </div>

            {/* Terminal Output */}
            {output && (
              <div className="p-4 border-t border-slate-200 bg-[#0F172A] text-slate-100 font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Execution Output:</span>
                  <span>Exit Code 0</span>
                </div>
                {output.compileError && <pre className="whitespace-pre-wrap text-amber-400">{output.compileError}</pre>}
                {output.stdout && <pre className="whitespace-pre-wrap text-emerald-400">{output.stdout}</pre>}
                {output.stderr && <pre className="whitespace-pre-wrap text-red-400">{output.stderr}</pre>}
                {!output.stdout && !output.stderr && !output.compileError && <p className="text-slate-500">(No output)</p>}
              </div>
            )}

            {/* Test Results Breakdown */}
            {results && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase ${passedAll ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {passedAll ? "All Test Cases Passed 🎉" : "Some Tests Failed"}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {results.filter((r) => r.passed).length} / {results.length} Correct
                    </span>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {results.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                        r.passed
                          ? "bg-white border-emerald-200 text-slate-800"
                          : "bg-rose-50/60 border-rose-200 text-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between font-sans">
                        <span className="font-bold text-[11px] text-slate-700">Test Case #{idx + 1}</span>
                        <span className={`text-[10px] font-black ${r.passed ? "text-emerald-600" : "text-rose-600"}`}>
                          {r.passed ? "✓ PASSED" : "✗ FAILED"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">Input: <span className="font-bold text-slate-800">{r.input || "(none)"}</span></div>
                      <div className="text-[11px] text-slate-500">Expected: <span className="font-bold text-emerald-700">{r.expected}</span></div>
                      {!r.passed && (
                        <div className="text-[11px] text-rose-600">Actual: <span className="font-bold">{r.actual}</span></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Bottom Navigation Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-40"
            >
              <IconArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Review any exercise at any time</span>
              <IconInfoCircle className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <button
              type="button"
              disabled={current === exercises.length - 1}
              onClick={() => setCurrent((c) => c + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-40"
            >
              <span>Next</span>
              <IconArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

export default CompilerWorkspace;
