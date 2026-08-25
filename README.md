# Pathwise — AI-Powered Personalized Learning Path Recommender

An AI/ML-driven learning path recommender: a learner describes a goal in
conversation, gets diagnosed, and gets a real generated roadmap — ranked by a
skill-graph + embeddings + cosine-similarity recommendation engine, explained
by Claude, and adapted by rule-based logic as they progress through practice
quizzes and proctored tests.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase Auth** for signup/login (email + password)
- **Postgres via Drizzle ORM**, direct connection (not PostgREST) — every
  query is scoped server-side by the verified session's `user_id`; RLS is
  enabled on every table as defense-in-depth
- **OpenRouter** (`OPENROUTER_MODEL`, default `anthropic/claude-sonnet-5`) for
  every Claude call: goal-intake extraction, question generation, path
  rationale, the assistant chat, proctored reports
- **Microsoft Learn Catalog API** (live, public, no key) + a hand-authored
  internal catalog + a small curated set of real MIT OCW / freeCodeCamp links,
  all ranked together by the same recommendation engine
- A local sandboxed subprocess (`lib/external/codeRunner.ts`) powers the
  in-app practice compiler for programming skills — see the security note in
  that file before using this anywhere beyond a local demo

## Project layout — frontend vs. backend

This is a single Next.js app (App Router), so page/route files under `app/`
have to stay there — that's a framework requirement, not a design choice.
Everything else is organized so a frontend-focused contributor only ever
needs to touch one folder:

- **`frontend/`** — the entire UI surface. Frontend work happens here.
  - `frontend/components/` — every React component (`ui/`, `auth/`, `chat/`,
    `dashboard/`, `goals/`, `layout/`). Pure presentation: props in, JSX out.
    No direct DB/Supabase/LLM calls — they call `fetch("/api/...")` like any
    browser client would.
  - `frontend/styles/globals.css` — Tailwind entry point + the design tokens
    (colors, etc.) used everywhere via `@theme inline`.
- **`app/`** — routing only. `app/**/page.tsx` files should stay thin:
  fetch data via a `lib/` function, then render `frontend/components/*` with
  it. `app/api/**/route.ts` is backend territory (see below).
- **Backend territory** — `lib/` (engine + data access), `db/schema.ts`
  (Drizzle schema), `data/` (the skill graph, catalog, badges — shared
  read-only constants both sides use), `scripts/` (seed/migration one-offs),
  `app/api/**` (route handlers).

Import boundary in code: components import from `@/frontend/components/*` and
`@/frontend/styles/*` for everything visual. They talk to the backend two
ways only: `fetch("/api/...")` for data/actions, and `lib/supabase/client.ts`
for auth (a browser-safe SDK call, not a DB query). A few components also do
`import type {...} from "@/lib/..."` purely for shared TypeScript shapes
(e.g. `DashboardData`) — that's erased at compile time and never touches the
database; components never import `lib/db.ts` or any query/engine module.

## Where the AI/ML actually lives

- **Claude (via OpenRouter)** — `lib/llm.ts` + `lib/prompts.ts`: natural
  language understanding (goal intake), question generation (diagnostic /
  practice / proctored), explanation generation (module rationale, proctored
  reports), and the assistant chat.
- **Recommendation engine** — `lib/embeddings.ts` + `lib/recommend.ts`: every
  resource and every learner goal/interest is a dense vector over the
  skill-id dimension space; resources are ranked by a weighted blend of
  cosine similarity, prerequisite readiness, difficulty fit, interest
  overlap, and rating.
- **Learning intelligence** — `lib/skillGraph.ts` + `lib/adapt.ts`: a real
  prerequisite DAG (`data/skills.ts`) drives skill-gap analysis (topological
  sort via Kahn's algorithm) and rule-based dynamic adaptation (remediation on
  a low proctored score, re-ranking on "too easy/too hard" feedback,
  prerequisite reinforcement on a strong score).

## Setup

```bash
npm install
npx drizzle-kit push   # syncs db/schema.ts to the Supabase Postgres instance
npx tsx scripts/enable-rls.ts   # one-time: enable RLS on every table
npx tsx scripts/seed.ts         # seeds the skill graph + resource catalog
npm run dev
```

Required `.env.local` values: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`,
`OPENROUTER_API_KEY`, `OPENROUTER_MODEL`.

**OpenRouter credits**: every AI feature depends on `OPENROUTER_API_KEY`
having a positive balance — check at
[openrouter.ai/settings/credits](https://openrouter.ai/settings/credits). A
$0 balance surfaces as a 500 on any Claude-dependent route (intake,
diagnostic, path generation, practice/proctored question generation, the
assistant).

## App flow

Signup/login → Dashboard → New Goal (domain → pace → conversational intake →
beginner check or diagnostic quiz) → generated roadmap (milestones of
modules, each with a rationale) → per module: resource → (practice compiler,
for programming skills) → practice quiz (unlimited, low-stakes) → proctored
test (single-attempt, timed, fullscreen + tab-switch flagging + webcam
self-view — sets official mastery) → report → adaptation engine reacts →
dashboard (mastery chart, gamification, adaptation feed) / public leaderboard.

## Known limitations (hackathon-scope, documented rather than hidden)

- The practice compiler runs code in a bare local subprocess, not a real
  sandbox — fine for a local demo, not for untrusted multi-tenant deployment.
- "Proctored" is browser-monitored (fullscreen + tab/blur flags + a live
  webcam self-view for presence), not real identity/gaze verification.
- MIT OCW and freeCodeCamp resources are a small hand-curated link set
  (`source: "curated"`), not a live API — neither exposes a public one.
