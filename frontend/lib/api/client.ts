/**
 * Typed API client.
 *
 * Calls the FastAPI backend DIRECTLY from the browser rather than proxying
 * through Next route handlers -- proxied SSE gets buffered, which would
 * break the streaming intake on Page 1.
 *
 * Types in ./types.ts are GENERATED from the backend OpenAPI schema:
 *   npm run gen:types
 * Never hand-edit them; the Pydantic models are the single source of truth.
 */
import { getAuthHeaders } from "./pathfinder";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...authHeaders, ...init?.headers },
  });

  if (!res.ok) {
    throw new ApiError(`${res.status} on ${path}`, res.status);
  }
  return res.json() as Promise<T>;
}

/** Server-sent events, for the conversational intake stream. */
export function stream(
  path: string,
  onChunk: (text: string) => void,
): EventSource {
  const es = new EventSource(`${BASE}${path}`);
  es.onmessage = (e) => onChunk(e.data);
  return es;
}
