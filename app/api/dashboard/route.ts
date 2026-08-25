import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { withErrorHandling } from "@/lib/apiHelpers";
import { getDashboardData } from "@/lib/dashboardData";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    return NextResponse.json(await getDashboardData(user.id));
  });
}
