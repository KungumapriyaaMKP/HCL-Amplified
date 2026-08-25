import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { patchDnsLookupFor } from "@/lib/dnsPatch";

patchDnsLookupFor(new URL(process.env.DATABASE_URL!).hostname);

declare global {
  var __pgClient: ReturnType<typeof postgres> | undefined;
}

const client =
  global.__pgClient ??
  postgres(process.env.DATABASE_URL!, {
    prepare: false,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgClient = client;
}

export const db = drizzle(client, { schema });
