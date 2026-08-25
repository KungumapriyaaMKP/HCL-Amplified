import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { getModuleForUser } from "@/lib/moduleAccess";
import { chatJson } from "@/lib/llm";

type ExerciseSet = { exercises: { title: string; prompt: string }[] };

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
          content: `Generate 5 short, hands-on coding practice exercises for the skill "${row.skill.name}" in ${row.module.programmingLanguage}, ordered from easiest to hardest. Each should be solvable in a single small script/function with no external dependencies, runnable in a bare interpreter (stdin/stdout only). Respond with ONLY: {"exercises": [{"title": "<short title>", "prompt": "<1-3 sentence task description>"}]}`,
        },
      ],
      { temperature: 0.7, maxTokens: 900 },
    );

    return NextResponse.json(result);
  });
}
