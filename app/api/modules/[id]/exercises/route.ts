import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { getModuleForUser } from "@/lib/moduleAccess";
import { chatJson } from "@/lib/llm";

type ExerciseSet = {
  exercises: {
    title: string;
    prompt: string;
    testCases: { input: string; expectedOutput: string }[];
  }[];
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;

    const row = await getModuleForUser(user.id, id);
    if (!row) return jsonError("Not found", 404);
    if (!row.module.isProgramming) return jsonError("This module isn't a coding skill");

    const result = await chatJson<ExerciseSet>(
      [
        {
          role: "system",
          content: `Generate 5 short, hands-on coding practice exercises for the skill "${row.skill.name}" in ${row.module.programmingLanguage}, ordered from easiest to hardest. Each must be solvable in a single small script reading from stdin and writing to stdout only (no external dependencies, no files, no network).

For each exercise, also produce 2 test cases that a grader will run automatically: feed "input" to the program's stdin, capture its stdout, and compare it exactly (after trimming whitespace) against "expectedOutput". Because of this, the exercise prompt itself MUST fully and unambiguously specify the exact input format and exact output format (e.g. "read two integers from one line, space-separated" / "print only the resulting integer, nothing else") so that a correct solution's output is deterministic and matches "expectedOutput" exactly - no extra labels, prompts, or formatting beyond what's specified. Prefer simple, unambiguous output formats (a single number, a single word, comma or newline separated values with no surrounding text) precisely so this deterministic comparison works.

Respond with ONLY:
{"exercises": [{"title": "<short title>", "prompt": "<task description, precise about input/output format>", "testCases": [{"input": "<stdin text>", "expectedOutput": "<exact expected stdout, trimmed>"}, {"input": "...", "expectedOutput": "..."}]}]}`,
        },
      ],
      { temperature: 0.6, maxTokens: 1800 },
    );

    return NextResponse.json(result);
  });
}
