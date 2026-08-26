import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uuid,
  real,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

// Mirrors auth.users (Supabase Auth). We never write to auth.users ourselves;
// this row is created the first time an authenticated request hits the app.
export const profiles = pgTable("profiles", {
  userId: uuid("user_id").primaryKey(),
  displayName: text("display_name").notNull(),
  preferenceScores: jsonb("preference_scores").notNull().default({}),
  // Face verification for proctored tests (lib/faceMatch.ts, run entirely
  // client-side via @vladmandic/face-api - no server-side ML, no external
  // vision API). faceDescriptor is the ~128-float embedding used for actual
  // matching; faceReferencePhoto is the captured image itself, kept only so
  // a flagged attempt can be reviewed visually. Both null until the learner
  // registers a face (auto-enrolled on their first proctored test).
  faceDescriptor: jsonb("face_descriptor"),
  faceReferencePhoto: text("face_reference_photo"),
  // Resume-derived prior knowledge (lib/resume.ts) - extracted once at
  // onboarding, then reused as a mastery seed for every future goal rather
  // than re-asked per goal. resumeText is the raw extracted text (kept so
  // re-extraction doesn't need the file re-uploaded); resumeProfile is
  // Claude's structured read of it (role, career goal, years of
  // experience, mapped skill ids, a short summary).
  resumeText: text("resume_text"),
  resumeProfile: jsonb("resume_profile"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Catalog (shared, no user_id)
// ---------------------------------------------------------------------------

export const skills = pgTable("skills", {
  id: text("id").primaryKey(), // slug, e.g. "react-fundamentals"
  name: text("name").notNull(),
  category: text("category").notNull(), // domain slug, e.g. "web-dev"
  description: text("description").notNull(),
});

export const skillPrerequisites = pgTable(
  "skill_prerequisites",
  {
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    prerequisiteId: text("prerequisite_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.skillId, t.prerequisiteId] })],
);

export const resources = pgTable("resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull(), // 'internal' | 'ms_learn' | 'curated'
  title: text("title").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'course' | 'project' | 'assessment' | 'article'
  description: text("description").notNull(),
  provider: text("provider").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  difficulty: text("difficulty").notNull(), // 'beginner' | 'intermediate' | 'advanced'
  rating: real("rating").notNull().default(4.5),
  externalId: text("external_id").unique(),
  cachedAt: timestamp("cached_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const resourceSkills = pgTable(
  "resource_skills",
  {
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    weight: real("weight").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.resourceId, t.skillId] })],
);

// ---------------------------------------------------------------------------
// Goals & paths (per user)
// ---------------------------------------------------------------------------

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  domain: text("domain").notNull(),
  trackPace: text("track_pace").notNull(), // 'fast' | 'balanced' | 'relaxed'
  goalText: text("goal_text").notNull(),
  subFocus: jsonb("sub_focus").notNull().default({}), // { tags: string[], motivation?: string, timeframeWeeks?: number }
  preferences: jsonb("preferences").notNull().default({}), // { difficultyBias?: number }
  beginnerDeclared: boolean("beginner_declared").notNull().default(false),
  status: text("status").notNull().default("intake"), // intake|diagnostic|active|completed
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const learningPaths = pgTable("learning_paths", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const pathModules = pgTable("path_modules", {
  id: uuid("id").defaultRandom().primaryKey(),
  pathId: uuid("path_id")
    .notNull()
    .references(() => learningPaths.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  skillId: text("skill_id")
    .notNull()
    .references(() => skills.id),
  resourceId: uuid("resource_id")
    .notNull()
    .references(() => resources.id),
  status: text("status").notNull().default("locked"), // locked|available|in_progress|completed
  milestoneType: text("milestone_type").notNull(), // 'foundation' | 'core' | 'capstone'
  rationale: text("rationale").notNull().default(""),
  isProgramming: boolean("is_programming").notNull().default(false),
  programmingLanguage: text("programming_language"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Mastery & assessments
// ---------------------------------------------------------------------------

export const skillMastery = pgTable(
  "skill_mastery",
  {
    userId: uuid("user_id").notNull(),
    skillId: text("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(0),
    source: text("source").notNull(), // 'stated'|'diagnostic'|'practice'|'proctored'
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.skillId] })],
);

export const diagnosticAttempts = pgTable("diagnostic_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  questions: jsonb("questions").notNull(),
  answers: jsonb("answers").notNull().default([]),
  score: integer("score"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const practiceAttempts = pgTable("practice_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => pathModules.id, { onDelete: "cascade" }),
  questions: jsonb("questions").notNull(),
  answers: jsonb("answers").notNull().default([]),
  score: integer("score"),
  attemptNo: integer("attempt_no").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const proctoredAttempts = pgTable("proctored_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => pathModules.id, { onDelete: "cascade" }),
  questions: jsonb("questions").notNull(),
  answers: jsonb("answers").notNull().default([]),
  score: integer("score"),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  timeLimitSeconds: integer("time_limit_seconds").notNull(),
  flags: jsonb("flags").notNull().default([]),
  webcamPresenceRatio: real("webcam_presence_ratio"),
  reportText: text("report_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Progress / adaptation
// ---------------------------------------------------------------------------

export const progressEvents = pgTable("progress_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => pathModules.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'started'|'completed'|'feedback'
  payload: jsonb("payload").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const learningEvents = pgTable("learning_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  moduleId: uuid("module_id").references(() => pathModules.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // 'open'|'complete'|'abandon'|'quiz_submit'
  modality: text("modality"), // 'course'|'project'|'assessment'|'article' (matches resources.type)
  timeSpentSeconds: integer("time_spent_seconds"),
  estimatedSeconds: integer("estimated_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const adaptationLog = pgTable("adaptation_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  trigger: text("trigger").notNull(),
  action: text("action").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  goalId: uuid("goal_id").references(() => goals.id, { onDelete: "cascade" }),
  thread: text("thread").notNull(), // 'goal_intake' | 'assistant'
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Gamification
// ---------------------------------------------------------------------------

export const xpLedger = pgTable("xp_ledger", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const badges = pgTable("badges", {
  id: text("id").primaryKey(), // code, e.g. "first_steps"
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
});

export const userBadges = pgTable(
  "user_badges",
  {
    userId: uuid("user_id").notNull(),
    badgeId: text("badge_id")
      .notNull()
      .references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.badgeId] })],
);

export const streaks = pgTable("streaks", {
  userId: uuid("user_id").primaryKey(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: date("last_active_date"),
});

// ---------------------------------------------------------------------------
// Community (per-domain discussion boards)
// ---------------------------------------------------------------------------

export const communityMembers = pgTable(
  "community_members",
  {
    userId: uuid("user_id").notNull(),
    domain: text("domain").notNull(), // matches data/domains.ts DOMAINS[].id
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.domain] })],
);

export const communityPosts = pgTable("community_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  domain: text("domain").notNull(),
  userId: uuid("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const communityReplies = pgTable("community_replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id")
    .notNull()
    .references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
