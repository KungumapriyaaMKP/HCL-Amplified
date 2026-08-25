import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations need the direct (session-mode) connection, not the
    // transaction-mode pooler DATABASE_URL the app uses at runtime.
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!,
  },
});
