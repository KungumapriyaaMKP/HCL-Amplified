# Daily Engagement & Productivity Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive daily engagement and productivity layer for Pathwise — including persistent daily tasks, 25/5 Pomodoro focus sessions with real time-on-task, spaced-repetition review queue (activating the decay model with SM-2 scheduling), a unified "Today's Plan" agenda generator, gamification enhancements (streak freezes, dynamic goal rings, real achievement widgets), and resilient deterministic zero-LLM fallbacks.

**Architecture:** 
- Database layer: `daily_tasks`, `focus_sessions`, `review_schedule` tables in `db/schema.ts`, with `freezes` added to `streaks`.
- Backend engine: `lib/review.ts` for SM-2 spaced repetition and `lib/gamification.ts` for streak freeze logic; route handlers in `app/api/tasks/`, `app/api/focus/`, `app/api/review/`, `app/api/plan/`.
- Frontend presentation: `frontend/components/dashboard/RightColumnWidgets.tsx` (real tasks + agenda + badges + weekly progress), `frontend/components/goals/FocusTimer.tsx` (25/5 Pomodoro with interruption detection), `frontend/components/review/ReviewSession.tsx` and `app/review/page.tsx` (spaced repetition flow).
- Resilience: Static question bank in `data/reviewQuestions.ts` and templated coach intros for offline/rate-limited operation.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Postgres via Drizzle ORM, Supabase Auth, Groq/OpenRouter with deterministic offline fallbacks.

## Global Constraints

- Components in `frontend/components/**` are strictly pure presentation: no direct DB or LLM imports; all data mutations through `fetch("/api/...")`.
- All DB access is server-side in `app/api/**/route.ts` or `lib/*`, scoped by the verified Supabase session's `user.id` using `requireUser()`.
- Every table has Row Level Security (RLS) enabled via `scripts/enable-rls.ts`.
- Every AI-dependent route must have a graceful deterministic offline fallback using static banks or templated heuristics.
- All code must pass `npm run build` and `npm run lint`.

---

### Task 1: Database Schema & RLS Setup for Productivity Tables

**Files:**
- Modify: `db/schema.ts`
- Modify: `scripts/enable-rls.ts`
- Modify: `data/badges.ts`

**Interfaces:**
- Produces:
  - `dailyTasks`: `{ id, userId, title, completed, createdAt }`
  - `focusSessions`: `{ id, userId, moduleId, skillId, plannedSeconds, actualSeconds, completed, interruptions, startedAt, endedAt }`
  - `reviewSchedule`: `{ userId, skillId, dueAt, intervalDays, ease, reps, lastReviewedAt }`
  - `streaks.freezes`: integer default 0

- [ ] **Step 1: Update `db/schema.ts` with new tables and streak freeze column**
- [ ] **Step 2: Update `scripts/enable-rls.ts` to include `daily_tasks`, `focus_sessions`, `review_schedule`**
- [ ] **Step 3: Update `data/badges.ts` with new badges (`deep_work`, `review_rigor`, `focus_master`)**
- [ ] **Step 4: Run `npx drizzle-kit push` and `npx tsx scripts/enable-rls.ts` to apply migration**
- [ ] **Step 5: Commit changes to branch**

---

### Task 2: Persistent Daily Tasks API & Widget Integration (STEP 1)

**Files:**
- Create: `app/api/tasks/route.ts`
- Create: `app/api/tasks/[id]/route.ts`
- Modify: `frontend/components/dashboard/RightColumnWidgets.tsx`

**Interfaces:**
- Produces:
  - `GET /api/tasks` → `{ tasks: DailyTask[] }`
  - `POST /api/tasks` → `{ task: DailyTask }` (body: `{ title: string }`)
  - `PATCH /api/tasks/[id]` → `{ task: DailyTask }` (body: `{ completed?: boolean, title?: string }`)
  - `DELETE /api/tasks/[id]` → `{ success: true }`

- [ ] **Step 1: Create `app/api/tasks/route.ts` (GET & POST)**
- [ ] **Step 2: Create `app/api/tasks/[id]/route.ts` (PATCH & DELETE)**
- [ ] **Step 3: Update `YourPlanForToday` in `RightColumnWidgets.tsx` with task input, optimistic add, toggle, and delete**
- [ ] **Step 4: Test tasks API and UI functionality**
- [ ] **Step 5: Commit changes to branch**

---

### Task 3: Focus Sessions (Pomodoro) Engine, API, and Timer Component (STEP 2)

**Files:**
- Create: `app/api/focus/start/route.ts`
- Create: `app/api/focus/complete/route.ts`
- Create: `frontend/components/goals/FocusTimer.tsx`
- Modify: `frontend/components/goals/ModuleWorkspace.tsx`
- Modify: `lib/dashboardData.ts`

**Interfaces:**
- Produces:
  - `POST /api/focus/start` → `{ id: string }` (body: `{ moduleId?: string, skillId?: string, plannedSeconds: number }`)
  - `POST /api/focus/complete` → `{ session: FocusSession, xpEarned: number, integrity: number }` (body: `{ sessionId: string, actualSeconds: number, interruptions: number }`)
  - `FocusTimer` component mounted on module page and dashboard.

- [ ] **Step 1: Create `POST /api/focus/start` and `POST /api/focus/complete` routes**
- [ ] **Step 2: Build `frontend/components/goals/FocusTimer.tsx` with 25/5 countdown, pause/reset, and visibility/blur interruption detection**
- [ ] **Step 3: Mount `FocusTimer` in `frontend/components/goals/ModuleWorkspace.tsx` and provide compact dashboard trigger**
- [ ] **Step 4: Update `lib/dashboardData.ts` to calculate total study time and mastery gained per hour**
- [ ] **Step 5: Commit changes to branch**

---

### Task 4: Spaced-Repetition Review Queue Engine & Review Page (STEP 3 & STEP 6)

**Files:**
- Create: `data/reviewQuestions.ts` (deterministic offline fallback questions)
- Create: `lib/review.ts` (SM-2 scheduler and helper functions)
- Create: `app/api/review/today/route.ts`
- Create: `app/api/review/submit/route.ts`
- Create: `frontend/components/review/ReviewSession.tsx`
- Create: `app/review/page.tsx`
- Modify: `frontend/components/layout/AppSidebar.tsx` (add review due badge)

**Interfaces:**
- Produces:
  - `lib/review.ts`: `calculateNextReview(current, grade)`, `seedReviewSchedule(userId, skillId)`
  - `GET /api/review/today` → `{ items: ReviewItem[], count: number }`
  - `POST /api/review/submit` → `{ updatedMastery: number, nextDue: string, xpEarned: number }`
  - Route `/review` hosting interactive `ReviewSession` flashcard/quiz flow.

- [ ] **Step 1: Create `data/reviewQuestions.ts` with static MCQ question bank for fallback**
- [ ] **Step 2: Create `lib/review.ts` implementing SM-2 algorithm**
- [ ] **Step 3: Create `app/api/review/today/route.ts` and `app/api/review/submit/route.ts` with fallback protection**
- [ ] **Step 4: Create `frontend/components/review/ReviewSession.tsx` and `app/review/page.tsx`**
- [ ] **Step 5: Add "Review Due" badge in `AppSidebar.tsx` and dashboard navigation**
- [ ] **Step 6: Commit changes to branch**

---

### Task 5: "Today's Plan" Generator & Unified Agenda (STEP 4)

**Files:**
- Create: `app/api/plan/today/route.ts`
- Modify: `frontend/components/dashboard/RightColumnWidgets.tsx`

**Interfaces:**
- Produces:
  - `GET /api/plan/today` → `{ intro: string, items: PlanItem[], totalEstimatedMinutes: number, dailyGoalProgress: { completed: number, target: number } }`
  - `YourPlanForToday` renders AI/templated intro, in-progress module action, due reviews action, user daily tasks, and calendar deep links.

- [ ] **Step 1: Create `app/api/plan/today/route.ts` combining active modules, due reviews, practice quizzes, and user tasks**
- [ ] **Step 2: Implement resilient coach intro generation with template fallback**
- [ ] **Step 3: Wire `YourPlanForToday` in `RightColumnWidgets.tsx` to `/api/plan/today` with primary actions (Focus Block, Review, Task toggle)**
- [ ] **Step 4: Commit changes to branch**

---

### Task 6: Gamification Depth: Streak Freezes, Dynamic Goal Rings & Real Widgets (STEP 5)

**Files:**
- Modify: `lib/gamification.ts` (streak freeze logic and badge awards)
- Modify: `frontend/components/dashboard/RightColumnWidgets.tsx` (`AchievementsWidget`, `WeeklyProgressWidget`)
- Modify: `frontend/components/dashboard/QuestDashboard.tsx` (daily goal ring)

**Interfaces:**
- Produces:
  - `touchStreak(userId)` handles streak freeze consumption and earning.
  - `AchievementsWidget` and `WeeklyProgressWidget` bind to real user data.
  - Daily goal ring shows real progress (completed focus blocks + reviews).

- [ ] **Step 1: Update `touchStreak` in `lib/gamification.ts` to manage streak freezes**
- [ ] **Step 2: Update `AchievementsWidget` and `WeeklyProgressWidget` in `RightColumnWidgets.tsx` to render real database stats**
- [ ] **Step 3: Integrate daily goal ring in dashboard**
- [ ] **Step 4: Commit changes to branch**

---

### Task 7: Comprehensive Verification & E2E Test Suite Updates (STEP 7)

**Files:**
- Modify: `scripts/e2e-audit-suite.ts`

**Verification Actions:**
- [ ] **Step 1: Add automated tests to `scripts/e2e-audit-suite.ts` for all new routes (`/api/tasks`, `/api/focus/start`, `/api/focus/complete`, `/api/review/today`, `/api/review/submit`, `/api/plan/today`, `/review`)**
- [ ] **Step 2: Run `npx tsx scripts/e2e-audit-suite.ts` and verify 100% pass rate**
- [ ] **Step 3: Run `npm run build` and `npm run lint`**
- [ ] **Step 4: Verify degraded-mode fallback without LLM API key**
- [ ] **Step 5: Final review and commit**
