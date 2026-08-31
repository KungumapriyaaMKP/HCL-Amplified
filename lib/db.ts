import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { patchDnsLookupFor } from "@/lib/dnsPatch";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

try {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    if (url.hostname) {
      patchDnsLookupFor(url.hostname);
    }
  }
} catch {
  // Ignore invalid URL formatting during build / fallback
}

declare global {
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

const client =
  global.__pgClient ??
  postgres(connectionString, {
    prepare: false,
    max: 5,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgClient = client;
}

export const db = drizzle(client, { schema });
