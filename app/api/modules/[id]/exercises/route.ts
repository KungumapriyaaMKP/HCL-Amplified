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

function getDefaultExercises(skillName: string, language: string = "python"): ExerciseSet {
  const isPy = language.toLowerCase().includes("python") || skillName.toLowerCase().includes("python");
  return {
    exercises: [
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
    ],
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;

    const row = await getModuleForUser(user.id, id);
    if (!row) return jsonError("Not found", 404);

    const lang = row.module.programmingLanguage || 
      (row.skill.name.toLowerCase().includes("python") ? "python" : 
       row.skill.name.toLowerCase().includes("type") ? "typescript" : "javascript");

    try {
      const result = await chatJson<ExerciseSet>(
        [
          {
            role: "system",
            content: `Generate 5 short, hands-on coding practice exercises for the skill "${row.skill.name}" in ${lang}, ordered from easiest to hardest. Each must be solvable in a single small script reading from stdin and writing to stdout only (no external dependencies, no files, no network).

For each exercise, also produce 2-3 test cases that a grader will run automatically: feed "input" to the program's stdin, capture its stdout, and compare it exactly (after trimming whitespace) against "expectedOutput". Specify exact input and output formats.

Respond with ONLY:
{"exercises": [{"title": "<short title>", "prompt": "<task description, precise about input/output format>", "testCases": [{"input": "<stdin text>", "expectedOutput": "<exact expected stdout, trimmed>"}]}]}`,
          },
        ],
        { temperature: 0.6, maxTokens: 1800 },
      );

      if (result && Array.isArray(result.exercises) && result.exercises.length > 0) {
        return NextResponse.json(result);
      }
    } catch (_err) {
      // Fallback seamlessly to high-quality curated exercises
    }

    return NextResponse.json(getDefaultExercises(row.skill.name, lang));
  });
}
