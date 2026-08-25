import { NextResponse } from "next/server";
import { UnauthorizedError } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Wraps a route handler body so UnauthorizedError -> 401 and any other
 * thrown error -> 500 with its message, instead of an opaque Next.js crash. */
export function withErrorHandling<T>(fn: () => Promise<T>) {
  return fn().catch((err) => {
    if (err instanceof UnauthorizedError) return jsonError("Not authenticated", 401);
    console.error(err);
    return jsonError(err instanceof Error ? err.message : "Unexpected error", 500);
  });
}
