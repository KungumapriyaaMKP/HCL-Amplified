# Changelog

All notable changes to the **Pathwise / HCL-Amplified** learning path recommendation engine are documented in this file.

---

## [Features-Imported] - 2026-08-28

### Added & Ported Engine Features (12 Steps)

1. **Poincaré Hyperbolic Disk Layout (`lib/poincare.ts`, `frontend/components/goals/SkillGraphView.tsx`)**:
   - Implemented hyperbolic geometry metric $d_H(u, v) = \operatorname{acosh}\left(1 + \frac{2\|u-v\|^2}{(1-\|u\|^2)(1-\|v\|^2)}\right)$.
   - Embedded hierarchical skill DAGs into the Poincaré disk model with $r = \tanh(\alpha \cdot \text{depth})$ clamped to $0.88$.
   - Interactive SVG visualization with horizon boundary rings, active node inspection, and mastery coloration.

2. **A* DAG Planner with 3 Modes (`lib/recommend.ts`, `app/api/goals/[id]/path/generate/route.ts`)**:
   - Designed A* state-space search exploring prerequisite DAG orderings.
   - Three optimization modes: `fastest` (duration-optimized), `cheapest` (cost/free-resource prioritized), and `most_rigorous` (lab & depth-focused).
   - 3-way segmented control in goal setup UI.

3. **2PL-IRT Ability Estimation Engine (`lib/irt.ts`, `db/schema.ts`)**:
   - Implemented 2-Parameter Logistic Item Response Theory with Newton-Raphson MLE:
     $$P_i(\theta) = \frac{1}{1 + e^{-a_i(\theta - b_i)}}$$
   - Computes learner latent ability $\theta \in [-4, 4]$ and Fisher Information standard error $\text{SE} = 1/\sqrt{I(\theta)}$.
   - Additive `theta` and `standardError` columns in `db/schema.ts` for diagnostic and practice attempts.

4. **Feasibility Constraint Relaxer & Trade-Off Solver (`lib/feasibility.ts`, `RelaxerBanner.tsx`)**:
   - Computes schedule feasibility ratios against target deadlines and weekly hours.
   - Generates 3 ranked trade-off proposals (`drop_electives`, `extend_deadline`, `increase_hours`) with an interactive banner.

5. **Dynamic Detour Splicing (`lib/adapt.ts`, `DetourBanner.tsx`)**:
   - Added `findBridgeConcept` for recursive root prerequisite gap detection.
   - Slices remedial bridge modules into `pathModules` with order shifting in transactions upon repeated quiz struggle streaks.

6. **Socratic Misconception Dialog (`data/misconceptions.json`, `lib/prompts.ts`, `SocraticModal.tsx`)**:
   - Created catalogue of conceptual misconceptions (dimension mismatch, closure scope, $p$-value fallacy, etc.).
   - Generates guided scaffolding reflection probes on incorrect practice quiz submissions.

7. **Ghost Mentor Mascot Companion (`lib/mentorBus.ts`, `GhostMentor.tsx`, `GlobalMentor.tsx`)**:
   - Lightweight typed pub/sub event bus (`mentorBus.ts`).
   - Interactive cursor-tracking floating SVG companion with state machine (`idle`, `thinking`, `speaking`, `socratic`, `celebrate`).
   - Globally mounted in `app/layout.tsx` and wired to quiz, code-run, and detour events.

8. **What-If Career & Role Branching Simulator (`lib/whatif.ts`, `WhatIfBranching.tsx`, `app/api/goals/[id]/whatif/route.ts`)**:
   - In-memory A* branch simulation evaluating career pivot runway, delta hours/weeks, and transferable skill ratios with zero database mutations.

9. **Multi-Goal Track Isolation (`frontend/components/layout/GoalSwitcher.tsx`, `Nav.tsx`)**:
   - Concurrent multi-goal management with top navigation dropdown switcher and isolated `[id]` route scoping.

10. **GitHub Public Profile Extractor (`lib/github.ts`, `app/api/profile/github/route.ts`, `app/onboarding/github/page.tsx`)**:
    - Extracted public repositories, languages, and technical topics via public GitHub REST API without OAuth.
    - Verified and seeded baseline skills to prevent starting from zero.

11. **Live Catalog + Guaranteed YouTube Fallback (`lib/external/youtubeFallback.ts`, `lib/catalog.ts`)**:
    - Guaranteed fallback video course generation for any skill with $< 2$ curated candidates, eliminating empty recommendation pools.

12. **Client-Side Pyodide Python Sandbox (`lib/pyodideRunner.ts`, `CompilerWorkspace.tsx`)**:
    - In-browser WebAssembly Python execution via Pyodide with stdout/stderr capture for instant zero-latency feedback.

---

### Infrastructure & LLM Provider Updates

- **Groq API Integration (`lib/llm.ts`, `.env.local`)**:
  - Switched primary LLM provider to Groq OpenAI-compatible Chat Completions API.
  - Configured model to `openai/gpt-oss-120b` for ultra-fast, high-accuracy reasoning across intake, Socratic tutoring, and rationale generation.
  - Retained strict JSON extraction and automatic repair handling.

- **Resilient Database Seeding (`scripts/seed.ts`)**:
  - Added chunked batch inserts and automatic exponential backoff retries.
  - Successfully seeded 48 skills, skill prerequisites, 82 resources, and 8 badges.

- **Clean Component Architecture**:
  - Added `lib/utils.ts` with `cn` class helper.
  - Standardized `Card`, `Badge`, and `ProgressBar` imports across all views.
  - Verified Next.js build compilation and type safety.

---

## [Initial Release] - 2026-08-25

### Added
- Grounded recommendation explainer with exact score breakdown citing.
- LLM-assisted goal-to-skill mapping during intake.
- Behavioral event logging and modality EMA preference learning.
- 6-factor recommendation engine (cosine similarity, prerequisites, difficulty fit, interest overlap, rating, modality fit).
- Disengagement monitor and reactive reminder banners.
