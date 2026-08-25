import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { runCode } from "@/lib/external/codeRunner";
import { awardBadgeIfNew } from "@/lib/gamification";

export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { language, code, stdin } = (await req.json()) as { language: string; code: string; stdin?: string };
    if (!language || typeof code !== "string") return jsonError("language and code are required");
    if (code.length > 20000) return jsonError("Code is too long for the practice compiler");

    const result = await runCode(language, code, stdin ?? "");
    const newBadge = await awardBadgeIfNew(user.id, "code_runner");

    return NextResponse.json({ ...result, badgeAwarded: newBadge ? "code_runner" : null });
  });
}
