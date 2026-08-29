# Backend Scaffold (Legacy / Unused)

> **Notice for Reviewers & Maintainers**:
> This directory contains an earlier Python/FastAPI scaffold that is **not part of the running application**.
> 
> The active application architecture is a full-stack Next.js 16 + TypeScript application where all backend services, recommendation engines, LLM pipelines, IRT estimation, Poincaré layouts, and database operations run directly in:
> - **`app/api/`** — REST API endpoints
> - **`lib/`** — Recommendation engines (`recommend.ts`, `skillGraph.ts`, `adapt.ts`, `irt.ts`, `poincare.ts`, `whatif.ts`, `feasibility.ts`, `decay.ts`, `llm.ts`, etc.)
> - **`db/`** — Drizzle ORM schemas and database access
> 
> This folder is retained only for historical scaffolding reference.
