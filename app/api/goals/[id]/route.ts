import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling, jsonError } from "@/lib/apiHelpers";
import { getGoalDetail } from "@/lib/goalData";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const { id } = await params;

    const detail = await getGoalDetail(user.id, id);
    if (!detail) return jsonError("Not found", 404);

    return NextResponse.json(detail);
  });
}
