# Changelog

All notable changes to the **Pathwise / HCL-Amplified** learning path recommendation engine are documented in this file.

---

## [Unreleased] - 2026-08-25

### Added
- **Grounded Recommendation Explainer (`lib/prompts.ts`, `app/api/goals/[id]/path/generate/route.ts`)**:
  - `moduleRationaleMessages` now takes the exact `scoreBreakdown` (`cosineSim`, `prereqReadiness`, `difficultyFit`, `interestOverlap`, `ratingNorm`, `preferenceFit`).
  - System prompt strictly instructs Claude to explain recommendation reasoning using real numeric percentages (e.g. prerequisite readiness, goal similarity) and forbids hallucinating ungrounded justifications.
  - Reuses the existing single concurrent LLM call per module without added latency or cost.

- **LLM-Assisted Goal-to-Skill Mapping (`lib/prompts.ts`, `app/api/goals/[id]/intake/route.ts`, `app/api/goals/[id]/path/generate/route.ts`)**:
  - `goalIntakeMessages` dynamically injects candidate domain leaf skills (`leafSkillsForDomain(domain)`) with names and descriptions.
  - Added `mappedSkillIds` to the conversational intake JSON schema.
  - Path generation prioritizes validated `subFocus.mappedSkillIds` for semantic understanding over keyword matching, while preserving `resolveGoalSkills(...)` as a deterministic fallback.

- **Behavioral Event Log & Modality EMA Preference (`db/schema.ts`, `lib/adapt.ts`, `app/api/modules/[id]/track-event/route.ts`)**:
  - Created `learning_events` table tracking `open`, `complete`, `abandon`, and `quiz_submit` events with modality and time spent.
  - Added `preferenceScores` JSONB column on `profiles` storing exponential moving average (EMA) preference per modality (`course`, `project`, `assessment`, `article`).
  - Implemented `updatePreferenceScore(userId, modality, outcomeSignal)`:
    $$\text{newScore} = 0.3 \times \text{signal} + 0.7 \times (\text{currentScore} \parallel 0.5)$$
  - Integrated real-time tracking in `ModuleWorkspace.tsx`, practice quiz submit, and proctored assessment submit.

- **Modality Preference Ranking Factor (`lib/recommend.ts`)**:
  - Extended `RankingContext` with `modalityPreference`.
  - Added `preferenceFit(resource, modalityPreference)` evaluating learner affinity per resource modality (`0.5` neutral baseline).
  - Rebalanced 6-factor ranking weights:
    - Cosine Similarity: `0.35`
    - Prerequisite Readiness: `0.15`
    - Difficulty Fit: `0.15`
    - Interest Overlap: `0.15`
    - Resource Rating: `0.10`
    - Modality Preference Fit: `0.10`
    *(Total weight = 1.00)*
  - Passed `profiles.preferenceScores` through to `bestResourceForSkill` in both initial path generation and dynamic adaptation reranking.

- **Disengagement Monitor (`lib/adapt.ts`, `lib/dashboardData.ts`, `components/dashboard/ReminderBanner.tsx`)**:
  - Implemented `checkDisengagement(userId)` returning `{ atRisk: boolean; daysSinceActive: number }` (flags `atRisk = true` when inactive for $>5$ days).
  - Integrated into `getDashboardData` payload.
  - `ReminderBanner` dynamically surfaces a friendly re-engagement banner encouraging returning learners to resume their next module.

### Verified
- Automated type safety: `npx tsc --noEmit` passed with 0 errors.
- Code style: `npm run lint` passed with 0 warnings.
- Live E2E tests: Verified LLM grounded percentage citing, semantic goal mapping priority, database EMA updates, and reactive disengagement banner rendering.
