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

## Where the AI/ML actually lives

- **Claude (via OpenRouter)** — `lib/llm.ts` + `lib/prompts.ts`:
  - **Conversational Goal Intake & Semantic Mapping**: Guides the learner to scope their goals and matches goals directly to domain leaf target skills (`mappedSkillIds`).
  - **Grounded Recommendation Explanations**: Generates module rationales strictly constrained to algorithmic numeric score breakdowns (cosine similarity %, prerequisite readiness %, difficulty fit %, quality rating %, modality preference fit %).
  - **Question Generation**: Dynamic MCQs across diagnostic, practice, and proctored assessment modes.
  - **Proctored Reports & Assistant Chat**: Analyzes assessment performance and answers path-related questions.
- **6-Factor Recommendation Engine** — `lib/embeddings.ts` + `lib/recommend.ts`:
  - Every resource and goal/interest vector lives in a dense dimension space over skill IDs.
  - Ranks resources with a weighted blend:
    - Cosine Similarity (`0.35`)
    - Prerequisite Readiness (`0.15`)
    - Difficulty Fit (`0.15`)
    - Interest Overlap (`0.15`)
    - Resource Quality Rating (`0.10`)
    - Modality Preference Fit (`0.10`)
- **Adaptive Intelligence & Behavioral Modeling** — `lib/skillGraph.ts` + `lib/adapt.ts`:
  - Prerequisite DAG (`data/skills.ts`) powers Kahn's algorithm topological sorting for skill-gap roadmaps.
  - **Behavioral Event Log & EMA Preference**: Tracks `learning_events` (open, complete, abandon, quiz_submit) and updates modality preferences via Exponential Moving Average (EMA).
  - **Disengagement Monitoring**: Analyzes inactivity gaps and proactively surfaces motivational re-entry banners when learner gap exceeds $>5$ days.
  - **Dynamic Path Adaptation**: Remediation module insertion on low proctored scores, difficulty re-ranking on learner feedback, and prerequisite mastery reinforcement on high scores.

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
