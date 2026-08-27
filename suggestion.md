# Comprehensive System Suggestions: User Onboarding & Per-Topic Roadmap Quiz Engine

## 1. Executive Summary & Core Philosophy

To achieve **Zero-Assumption Profiling** and deliver truly personalized learning roadmaps, the platform must:
1. Capture a learner's prior background, skill evidence, and interests **during registration and onboarding before** generating a curriculum.
2. Embed **per-topic continuous evaluation quizzes** across every roadmap milestone to empirically verify mastery, guide misconceptions socratically, and trigger adaptive remediation detours.

### The Correct Sequence Principle
A common flaw in recommendation systems is attempting to *recommend a career or role before understanding the learner's interests and background*. 

```
❌ Flawed Sequence:   Sign Up ──► Recommend Career ──► Ask Interests ──► Generate Path
✅ Refined Sequence:  Sign Up ──► Capture History (Resume/GitHub) ──► Conversational Discovery ──► Recommend Role ──► Targeted Diagnostic ──► Enter App
```

By flipping the sequence, role recommendations are grounded in verified background and expressed ambitions rather than generic popular choices.

---

## 2. Refined 7-Step Registration & Onboarding Pipeline

```mermaid
flowchart TD
    S1[1. Landing Page] --> S2[2. Sign Up & Auth]
    S2 --> S3[3. Prior History & Evidence Capture<br/><i>Resume / GitHub Drop (Skippable)</i>]
    S3 --> S4[4. Conversational Interest & Constraint Discovery<br/><i>Interactive LLM Chat</i>]
    S4 --> S5[5. Career & Role Recommendation<br/><i>Select or Confirm Target Role</i>]
    S5 --> S6[6. Calibrated Skill Diagnostic<br/><i>Targeted 2PL-IRT Adaptive Quiz</i>]
    S6 --> S7[7. Completion Gate & Route Unlock<br/><i>Set onboarding_status = COMPLETED</i>]
    S7 --> APP[Executive Dashboard & Active Roadmap]
```

| Step | Stage Name | Type / Status | Existing Assets Reused | Technical Objective |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Landing Page** | Build | Clean Minimalist UI | Product value proposition, "Start Your Journey" CTA. |
| **2** | **Sign Up & Account Creation** | Build | Supabase Auth / Local JWT | Email/password registration, create base `profiles` record. |
| **3** | **Learning History & Evidence Capture** | Wire (Skippable) | `ResumeUploader`, `GitHubProfiler` | Extract verified prior skills with textual quotes & repo stats. |
| **4** | **LLM Interest & Constraint Intake** | Reshape Gated | `IntakeFlow`, `StreamingChat` | Elicit domain focus, motivation, weekly hours, deadline, budget. |
| **5** | **Career / Role Recommendation** | Wire | `/roles`, `/plan/compare` | Present top 3 matching roles based on history + interests. |
| **6** | **Calibrated Skill Diagnostic** | Mandatory Gate | `DiagnosticQuiz` | Probe high-uncertainty root skills using 2PL-IRT items (~8-12 questions). |
| **7** | **Completion Gate → Enter App** | Build Gate | `onboarding_status` | Lock app routes until onboarding is complete; transition to Hub. |

---

## 3. Step-by-Step Technical Design for Onboarding

### Step 1: Landing Page (`/`)
* **Objective**: Present the core value proposition (AI-driven, prerequisite-aware, grounded learning paths) with a clean hero section and a prominent primary action: `Get Started Free`.
* **State**: Unauthenticated.

### Step 2: Sign Up & Account Creation (`/signup`)
* **Objective**: Create the user identity and initialize their profile state.
* **Fields**: Name, Email, Password.
* **Backend Action**:
  * Create auth user (via Supabase Auth or native backend auth).
  * Insert row into `profiles`:
    ```json
    {
      "user_id": "usr_12345",
      "email": "learner@example.com",
      "onboarding_status": "history_pending",
      "onboarding_step": 3
    }
    ```

### Step 3: Prior Learning History & Evidence Boosters (`/onboarding/history`)
* **Objective**: Capture past academic, professional, and project experience without forcing manual multi-page form filling.
* **UI Components**:
  * **Resume Dropzone** (`ResumeUploader.tsx`): Accepts PDF/DOCX. Parses text via `pdfplumber` and extracts skills with direct quote provenance:
    $$\text{SkillEntity} = \{\text{skill\_name}, \text{evidence\_quote}, \text{years\_exp}, \text{confidence}\}$$
  * **GitHub Profiler** (`GitHubProfiler.tsx`): Accepts public GitHub username/URL (zero OAuth required). Analyzes top language byte counts, frameworks in `requirements.txt`/`package.json`, and commit recency.
  * **Skip Affordance**: Clear `"I'm starting fresh / Skip for now"` action for complete beginners or career switchers.
* **Output Profile Update**:
  * Sets verified skill priors in `mastery_priors` table with medium confidence ($0.4 \le \theta \le 0.7$).

### Step 4: LLM Interest & Constraint Discovery (`/onboarding/discovery`)
* **Objective**: Conversational discovery to understand what the learner actually wants to achieve, their constraints, and learning preferences.
* **UI Components**: Reshapes `StreamingChat.tsx` / `IntakeFlow.tsx` into a guided 3–4 turn dialogue.
* **Extracted Dimensions**:
  1. **Sub-focus / Interests**: (e.g. *Computer Vision*, *Distributed Systems*, *LLM Applications*).
  2. **Motivation**: (e.g. *Career Switch*, *Job Promotion*, *Interview Prep*, *Academic Mastery*).
  3. **Weekly Time Commitment**: Hours per week ($3\text{h}$, $6\text{h}$, $12\text{h}$, or $20\text{h}$ crash-course).
  4. **Target Deadline**: Timeframe in weeks/months.
  5. **Course Budget**: Free only ($0) vs. Paid certification allowance.
  6. **Preferred Modality**: Interactive coding, video lectures, reading, or project builds.

### Step 5: Role Recommendation & Confirmation (`/onboarding/role`)
* **Objective**: Synthesize the extracted background (Step 3) and declared interests (Step 4) into ranked role recommendations.
* **Mechanism**:
  * Blends semantic match of interests + prior skill overlap.
  * Shows **Top 3 Recommended Career Tracks** with role descriptions, job demand metrics, and estimated time to complete.
  * Allows the user to select a recommended role or search/customize a custom goal.
* **UI Component**:
  * Role cards with readiness badge (e.g. `"Machine Learning Engineer — 38% Background Match"`).

### Step 6: Mandatory Targeted Diagnostic (`/onboarding/diagnostic`)
* **Objective**: Replace assumptions with empirical proof. Calibrate baseline skill mastery across the chosen role’s core prerequisite DAG.
* **Item Selection Algorithm**:
  * Selects items based on maximum information gain:
    $$\text{ProbePriority}(s) = \text{Uncertainty}(s) \times \text{DownstreamFanOut}(s)$$
  * Probes 4–6 foundational skills with 2 items each ($8\text{--}12$ questions total, ~3–4 minutes).
* **Ability Scoring**:
  * Computes latent skill ability $\theta$ via 2PL-Item Response Theory:
    $$P(Y = 1 \mid \theta) = \frac{1}{1 + e^{-a(\theta - b)}}$$
* **Socratic Safeguard**: Evaluates correct answers and logs initial misconceptions.

### Step 7: Completion Gate & Application Unlock (`/onboarding/complete`)
* **Objective**: Finalize profile generation, trigger initial $A^*$ roadmap calculation, and transition the user into the main application.
* **Backend Actions**:
  1. Update `profiles.onboarding_status = "completed"`.
  2. Run initial $A^*$ path generation over the real catalog for the confirmed role.
  3. Generate baseline Poincaré hyperbolic coordinates for the learner's skill state.
  4. Award the **"First Step"** achievement badge.
* **Navigation**: Smooth redirect to `/roadmap` or `/dashboard`.

---

## 4. Database Schema & State Machine for Onboarding

### Onboarding State Machine

```
[REGISTERED]
     │
     ▼
[HISTORY_PENDING] ──(Upload Resume / GitHub or Skip)──► [DISCOVERY_PENDING]
                                                              │
                                                              ▼
[DIAGNOSTIC_PENDING] ◄──(Confirm Target Role)────────── [ROLE_PENDING]
     │
     ▼ (Complete 8-12 Questions)
[COMPLETED] ──► Full App Access Unlocked
```

### Proposed Profile Schema Extensions (`db/schema.ts` / `app/domain/learner.py`)

```typescript
export const onboardingStatusEnum = pgEnum("onboarding_status", [
  "history_pending",
  "discovery_pending",
  "role_pending",
  "diagnostic_pending",
  "completed",
]);

// Extended Profiles Table
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  onboardingStatus: onboardingStatusEnum("onboarding_status").default("history_pending").notNull(),
  targetRoleId: text("target_role_id"),
  weeklyHours: integer("weekly_hours").default(6),
  targetDeadlineWeeks: integer("target_deadline_weeks"),
  budgetUsd: numeric("budget_usd").default("0"),
  evidenceSummary: jsonb("evidence_summary"), // Parsed resume quotes + github language stats
  preferenceScores: jsonb("preference_scores"), // Modality EMA weights
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

---

## 5. Next.js Middleware & Route Protection Guard

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = getAuthenticatedUser(request);

  if (!user && isProtectedRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && user.onboardingStatus !== "completed") {
    const stepRoutes: Record<string, string> = {
      history_pending: "/onboarding/history",
      discovery_pending: "/onboarding/discovery",
      role_pending: "/onboarding/role",
      diagnostic_pending: "/onboarding/diagnostic",
    };

    const targetRoute = stepRoutes[user.onboardingStatus] || "/onboarding/history";
    if (!pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL(targetRoute, request.url));
    }
  }

  return NextResponse.next();
}
```

---

## 6. Detailed Proposal: Per-Topic Roadmap Quiz & Continuous Evaluation Engine

To prevent "passive video watching" and ensure active cognitive retention, **every topic/milestone card on the roadmap should feature an embedded, psychometrically calibrated quiz**.

```mermaid
flowchart TD
    Node[Learner studies Roadmap Topic Card] --> QuizChoice{Select Quiz Mode}
    QuizChoice -->|Low-Stakes / Learning| PQ[1. Practice Self-Check Quiz<br/>3-5 Conceptual MCQs]
    QuizChoice -->|Formal Verification| MQ[2. Milestone Mastery Check<br/>Scored IRT Evaluation]
    
    PQ --> PQCheck{Score ≥ 70%?}
    PQCheck -->|Pass| XP1[+30 XP · Unlock Next Step]
    PQCheck -->|Incorrect Answer| Soc[Socratic Misconception Engine<br/>• Guided Questioning<br/>• Visual Counter-Example]
    Soc --> PQRetry[Unlimited Retry Allowed]
    
    MQ --> MQCheck{Score Result}
    MQCheck -->|Pass ≥ 70%| Mastered[Set Mastery θ ≥ 0.70<br/>Reset Ebbinghaus Decay S<br/>Unlock Downstream Prerequisite Nodes<br/>+100 XP & Telemetry Event]
    MQCheck -->|Fail < 50% 1st Time| Retake[Flag 'Needs Review'<br/>Suggest Targeted Micro-Read]
    MQCheck -->|Fail < 50% 2nd Time (Stuck)| Detour[🚨 Dynamic Detour Engine<br/>Splice Bridge Prerequisite Node into Active Path]
```

### 6.1 Multi-Tier Assessment Hierarchy per Topic

Each topic in the generated learning path (`SkillCard.tsx` / `ExplanationPanel.tsx`) contains two complementary quiz modes:

1. **Practice Self-Check Quiz (Formative & Unlimited)**:
   * **Purpose**: Immediate knowledge check after completing a lecture, article, or coding lab.
   * **Format**: 3–5 scenario-based questions.
   * **Stakes**: Low-stakes, unlimited attempts.
   * **Feedback Mechanism**: If an option is wrong, it does **not** reveal the letter answer. Instead, it routes into the **Socratic Misconception Modal** to guide the learner's thinking.

2. **Milestone Mastery Certification (Summative & Gatekeeper)**:
   * **Purpose**: Formal validation that the learner has attained the required latent mastery ($\theta \ge 0.70$) on this skill before unlocking downstream dependencies in the DAG.
   * **Format**: 5–8 calibrated questions with time limits ($1\text{--}2$ min per question).
   * **Consequences**:
     * **Score $\ge 70\%$**: Transitions node from `IN_PROGRESS` $\rightarrow$ `MASTERED`. Unlocks dependent downstream skills.
     * **Score $< 50\%$ (1st attempt)**: Flags node as `AT_RISK` and recommends a 2-minute micro-review.
     * **Score $< 50\%$ (2 consecutive attempts)**: Triggers **Dual-Graph Remediation Detour**, automatically retrieving and inserting a prerequisite bridge module.

---

### 6.2 Item Generation & Psychometric 2PL-IRT Calibration

Questions are not generic trivia. They are tied directly to canonical skill concepts and generated with **2PL-IRT parameters**:

```json
{
  "skill_id": "gradient-descent",
  "question": "If the learning rate α is set too high during training of a neural network, what behaviour is mathematically expected in the loss trajectory?",
  "options": [
    "The loss will monotonically decrease at a slower rate.",
    "The loss will oscillate wildly or diverge to infinity due to overshooting the minimum.",
    "The gradient vector will become identically zero at the first step.",
    "The model will immediately overfit the training dataset."
  ],
  "correct_index": 1,
  "discrimination_a": 1.45,
  "difficulty_b": -0.20,
  "misconceptions": {
    "0": "confuses_low_learning_rate_with_high",
    "2": "confuses_divergence_with_vanishing_gradient",
    "3": "confuses_optimization_divergence_with_generalization_error"
  }
}
```

* **Discrimination ($a$)**: How well this question separates high-mastery learners from low-mastery learners ($0.8 \le a \le 2.0$).
* **Difficulty ($b$)**: Calibrated to the topic's difficulty tier (Beginner $b \in [-1.5, -0.5]$, Intermediate $b \in [-0.5, 0.5]$, Advanced $b \in [0.5, 1.5]$).
* **Misconception Mapping**: Every distractor option maps to a specific named misconception in `data/misconceptions.json`.

---

### 6.3 Socratic Misconception Integration

When a learner selects a wrong answer during a topic quiz:
1. **Rule**: Never reveal the correct letter or answer text.
2. **Step 1 (Clarifying Question)**: The AI extracts the distractor's misconception tag and asks a conceptual question that highlights the logical flaw.
3. **Step 2 (Visual Counter-Example)**: Displays a lightweight diagram or numerical example (e.g., demonstrating gradient overshooting with $\alpha = 10.0$).
4. **Step 3 (Concept Lock-In)**: Presents a single-sentence follow-up verification question before returning to the quiz.

---

### 6.4 Ebbinghaus Retention Decay Reset

Taking topic quizzes directly maintains long-term memory stability:
* **Decay Formula**:
  $$R(t) = e^{-t / S}$$
  Where $t$ is days elapsed since last quiz attempt, and $S$ is memory stability (in days).
* **Quiz Impact**:
  * Scoring $\ge 80\%$ on a topic quiz increases stability $S_{\text{new}} = S_{\text{old}} \times 2.2$ (Spaced Repetition spacing effect).
  * Resets the topic's status on the **Poincaré Retention Radar** and **Skill Decay Heatmap** from `decayed` (Red $<40\%$) or `at_risk` (Amber $40\text{--}70\%$) back to `fresh` (Green $>70\%$).

---

### 6.5 Telemetry & Gamification Rewards

Every quiz submission logs a structured `LearningEvent`:
* **Event Structure**:
  ```json
  {
    "type": "quiz_attempted",
    "skill_id": "transformers-attention",
    "score": 0.85,
    "minutes_spent": 4,
    "payload": {
      "mode": "mastery_check",
      "questions_total": 5,
      "questions_correct": 4,
      "misconceptions_encountered": ["confuses_cross_attention_with_self_attention"]
    }
  }
  ```
* **XP Progression**:
  * Practice Quiz completed: $+30\text{ XP}$
  * Mastery Certification passed ($\ge 70\%$): $+100\text{ XP}$
  * Perfect Score ($100\%$): $+50\text{ bonus XP}$ + unlocks `"Quiz Whiz"` badge.
  * Active daily quiz streak increases consecutive study day streak counter.

---

### 6.6 Backend API Schema for Topic Quizzes

#### 1. Generate Topic Quiz
* **`POST /api/modules/{moduleId}/quiz/generate`**
* **Request**:
  ```json
  {
    "mode": "practice | mastery_check",
    "difficulty_override": "intermediate"
  }
  ```
* **Response**:
  ```json
  {
    "quiz_id": "qz_9921",
    "skill_id": "neural-networks",
    "skill_name": "Neural Network Architectures",
    "mode": "practice",
    "time_limit_seconds": 300,
    "questions": [
      {
        "id": "q1",
        "question": "What is the primary role of non-linear activation functions in deep networks?",
        "options": [
          "To speed up matrix multiplications on GPUs",
          "To allow the network to approximate non-linear decision boundaries",
          "To normalize weights between 0 and 1",
          "To prevent backpropagation gradients from flowing backwards"
        ]
      }
    ]
  }
  ```

#### 2. Submit Topic Quiz
* **`POST /api/modules/{moduleId}/quiz/submit`**
* **Request**:
  ```json
  {
    "quiz_id": "qz_9921",
    "answers": [
      { "question_id": "q1", "selected_index": 1 }
    ]
  }
  ```
* **Response**:
  ```json
  {
    "score_pct": 100,
    "passed": true,
    "new_mastery_theta": 0.82,
    "xp_earned": 100,
    "unlocked_downstream_skills": ["deep-learning-fundamentals", "nlp-transformers"],
    "misconception_insights": [],
    "retention_status": "fresh"
  }
  ```

---

### 6.7 UI/UX Roadmap Integration

1. **Card Action Affordance (`SkillCard.tsx`)**:
   * Each skill card on the Roadmap board displays a dedicated status action:
     * 🟢 **Mastered** (`Score: 88%` · `"Review Quiz (2m)"`)
     * 🔵 **Active / Ready** (`"Take Topic Quiz"`)
     * 🔒 **Locked** (`"Prerequisites required: Linear Algebra"`)
2. **Slide-Over Quiz Drawer**:
   * Taking a quiz opens an inline slide-over drawer over the roadmap without losing visual navigation context.
3. **Instant Visual Node Unlocking**:
   * Upon submitting and passing a quiz, the roadmap triggers a Framer Motion pulse animation, transitioning the current node to green and unlocking downstream prerequisite arrows.

---

## 7. Key Benefits & Judging Rubric Alignment

| Rubric Area | Weight | How Onboarding + Per-Topic Quizzes Satisfy the Criterion |
| :--- | :---: | :--- |
| **Functionality & Completeness** | **25%** | Delivers a complete learning loop: Evidence $\rightarrow$ Intake $\rightarrow$ Roadmap $\rightarrow$ Study $\rightarrow$ Continuous Topic Quiz $\rightarrow$ Mastery & Detours. |
| **AI/ML Rigor** | **20%** | Replaces mock scores with psychometric **2PL-Item Response Theory ($\theta$)** ability calibration, Ebbinghaus stability modeling, and automated misconception tagging. |
| **Zero-Assumption Compliance** | **Core Rule** | No skill mastery is fabricated; every node's progress is backed by either verified resume proof, repository analysis, or quiz results. |
| **Adaptive Innovation** | **15%** | Two consecutive quiz failures trigger automatic dual-graph remediation detours without breaking existing downstream roadmap progress. |
| **User Experience (UX)** | **10%** | Progressive sequential reveal, low-friction skip options, instant slide-over assessments, and motivating gamification rewards. |