import type { ChatMessage } from "@/lib/llm";
import { leafSkillsForDomain } from "@/lib/skillGraph";
import { SKILLS, SKILLS_BY_ID } from "@/data/skills";

const QUESTION_SHAPE = `Each question object must look like:
{"id": "q1", "skillId": "<one of the given skill ids>", "question": "<text>", "options": ["<a>", "<b>", "<c>", "<d>"], "correctIndex": <0-3>, "explanation": "<why the correct answer is correct, 1-2 sentences>"}`;

export function goalIntakeMessages(
  domain: string,
  goalText: string,
  trackPace: string,
  history: ChatMessage[],
  domainId?: string,
  resumeContext?: { summary: string; currentRole: string | null; careerGoal: string | null } | null,
): ChatMessage[] {
  const targetDomain = domainId || domain;
  const leafIds = leafSkillsForDomain(targetDomain);
  const candidateSkills = leafIds
    .map((id) => SKILLS_BY_ID.get(id))
    .filter((s): s is NonNullable<typeof s> => !!s)
    .map((s) => `- ${s.id}: ${s.name} - ${s.description}`)
    .join("\n");

  const resumeBlock = resumeContext
    ? `\nThis learner already gave us their resume at signup. What we know about their background - use it, don't re-ask for it:
- Background summary: ${resumeContext.summary}
${resumeContext.currentRole ? `- Current role: ${resumeContext.currentRole}` : ""}
${resumeContext.careerGoal ? `- Stated career goal: ${resumeContext.careerGoal}` : ""}
`
    : "";

  const system = `You are a warm, focused AI learning advisor helping a learner scope a brand-new learning goal.
Domain: "${domain}". Learner's initial goal statement: "${goalText}". Chosen pace: "${trackPace}".
${resumeBlock}
Candidate target skills in this domain:
${candidateSkills || "(No leaf skills defined for this domain)"}

Have a short natural conversation (aim for 2-4 learner replies total) to learn:
(a) their specific sub-focus or specialization within this domain (e.g. within "AI & Machine Learning" that could be "computer vision" or "LLM applications"),
(b) their underlying motivation (career switch, current job need, curiosity, an upcoming project...) - if the resume context above already answers this, confirm it briefly instead of asking from scratch,
(c) a rough target timeframe in weeks.

Ask ONE focused question at a time. Be concise and encouraging, never robotic.

After EVERY learner message, respond with ONLY a JSON object of this exact shape:
{"reply": "<your next conversational message, shown verbatim in a chat bubble - plain text, no JSON inside it>",
 "done": <true once you have (a)(b)(c) well enough to build a path, otherwise false>,
 "subFocus": ["<short tag>", ...],
 "motivation": "<string, or null if not yet known>",
 "timeframeWeeks": <integer, or null if not yet known>,
 "mappedSkillIds": ["<skill id from candidate list above>", ...]}

Never ask more than one question per turn. Once "done" is true, "reply" should be a brief warm confirmation, not another question.`;

  return [{ role: "system", content: system }, ...history];
}

/**
 * Extracts a structured profile from resume text (+ optionally a few
 * directly-answered onboarding questions) once, at signup - mapping
 * mentioned skills onto our real skill-id taxonomy so they can seed
 * skill_mastery (source='resume') and carry forward into every future
 * goal's skill-gap analysis, instead of every goal starting from zero.
 */
export function resumeExtractionMessages(opts: {
  resumeText: string | null;
  currentRole: string | null;
  careerGoal: string | null;
  yearsExperience: number | null;
}): ChatMessage[] {
  const skillList = SKILLS.map((s) => `- ${s.id}: ${s.name} (${s.category}) - ${s.description}`).join("\n");

  const system = `You extract a structured learner profile from a resume and/or a few directly-answered questions, for an AI learning path app.

${opts.resumeText ? `Resume text:\n"""${opts.resumeText}"""` : "No resume was provided."}
${opts.currentRole ? `Directly stated current role: "${opts.currentRole}"` : ""}
${opts.careerGoal ? `Directly stated career goal: "${opts.careerGoal}"` : ""}
${opts.yearsExperience != null ? `Directly stated years of experience: ${opts.yearsExperience}` : ""}

Our full skill taxonomy (map anything the resume/answers demonstrate onto these ids - only ids from this list are valid):
${skillList}

For each skill you're confident this person already has real experience with (based on job history, listed skills, projects - not just a passing mention), include it with a confidence level. Be conservative: only include a skill if the resume/answers genuinely support it, not every technology merely name-dropped once.

Respond with ONLY:
{"currentRole": "<string or null>",
 "careerGoal": "<string or null>",
 "yearsExperience": <number or null>,
 "summary": "<1-2 sentence natural-language summary of their background, for other prompts to reference>",
 "skillMastery": [{"skillId": "<id from the list above>", "confidence": "low"|"medium"|"high"}, ...]}`;

  return [{ role: "system", content: system }];
}

export function questionGenerationMessages(opts: {
  purpose: "diagnostic" | "practice" | "proctored";
  domain: string;
  skills: { id: string; name: string; description: string }[];
  count: number;
}): ChatMessage[] {
  const tone =
    opts.purpose === "diagnostic"
      ? "a quick calibration quiz to find out what the learner already knows before building their path. Mix easy and moderately hard questions across the given skills."
      : opts.purpose === "practice"
        ? "a low-stakes self-check quiz the learner can retake as many times as they like. Keep it approachable and instructive - the explanation matters as much as the question."
        : "a formal, single-attempt proctored assessment that determines the learner's official mastery score for this skill. Make it rigorous and unambiguous - no trick questions, but real depth.";

  const skillList = opts.skills.map((s) => `- ${s.id}: ${s.name} - ${s.description}`).join("\n");

  const system = `You are an expert assessment writer generating ${tone}

Domain: "${opts.domain}". Cover these skills:
${skillList}

Generate exactly ${opts.count} multiple-choice questions, distributed across the given skills. ${QUESTION_SHAPE}

Respond with ONLY: {"questions": [ ... ]}`;

  return [{ role: "system", content: system }];
}

export function moduleRationaleMessages(opts: {
  skillName: string;
  resourceTitle: string;
  resourceType: string;
  goalText: string;
  domain: string;
  isFirstModule: boolean;
  priorSkillNames: string[];
  trackPace?: string;
  currentMastery: number;
  scoreBreakdown: {
    cosineSim: number;
    prereqReadiness: number;
    difficultyFit: number;
    interestOverlap: number;
    ratingNorm: number;
    keywordOverlap: number;
    preferenceFit: number;
  };
}): ChatMessage[] {
  const crashCourse = opts.trackPace === "crash-course";
  const s = opts.scoreBreakdown;
  const system = `You write short, specific explanations for why a learning-path recommendation engine picked a resource. This is a score-grounded explainer: the numbers below are the engine's REAL output for this pick, not something to invent. Reference the actual numbers/facts that best support the choice - you don't need to cite every one, pick whichever are most telling - and never write generic filler like "this will help you learn."

Goal: "${opts.goalText}" (domain: ${opts.domain}).
This module teaches: "${opts.skillName}", via the ${opts.resourceType} "${opts.resourceTitle}".
${opts.isFirstModule ? "This is the very first module in the path." : `It comes after the learner has covered: ${opts.priorSkillNames.join(", ")}.`}

Real numbers behind this pick (0-100 scale):
- Current mastery in "${opts.skillName}": ${opts.currentMastery}% (the skill-gap this module closes)
- Prerequisite readiness: ${Math.round(s.prereqReadiness * 100)}% (how ready the learner is, based on prerequisite mastery)
- Skill-tag match (embedding cosine similarity): ${Math.round(s.cosineSim * 100)}%
- Keyword match to the learner's own goal wording: ${Math.round(s.keywordOverlap * 100)}%
- Difficulty fit for where they are right now: ${Math.round(s.difficultyFit * 100)}%
- Resource rating: ${Math.round(s.ratingNorm * 100)}%
- Modality preference fit (course/project/assessment/article, learned from how they've engaged before): ${Math.round(s.preferenceFit * 100)}%
${crashCourse ? "The learner picked the Interview Crash Course pace - they have an upcoming interview and chose hands-on practice over long-form courses wherever possible. Frame the rationale around interview relevance and getting practice reps in fast." : ""}

Base your explanation ONLY on these specific scores - do not invent reasons not reflected in these numbers. Write a 2-3 sentence rationale, second person ("you"), weaving in whichever numbers matter most for this pick rather than reasoning abstractly. Respond with ONLY plain text, no JSON, no markdown.`;

  return [{ role: "system", content: system }];
}

export function assistantSystemMessage(context: {
  goalText: string;
  domain: string;
  trackPace: string;
  masterySummary: string;
  pathSummary: string;
  recentAdaptations: string;
  currentModule?: { skillName: string; resourceTitle: string; resourceType: string; rationale: string } | null;
}): ChatMessage {
  const currentModuleBlock = context.currentModule
    ? `\nThe learner has this chat open WHILE actively working through a specific module right now - this is doubt-clearance in the middle of learning, not just path-level Q&A:
- Skill: "${context.currentModule.skillName}"
- Resource: the ${context.currentModule.resourceType} "${context.currentModule.resourceTitle}"
- Why this module: ${context.currentModule.rationale}
If their question is at all ambiguous, assume it's about THIS skill/resource first - answer the actual concept question directly (explain it, give an example, clarify the confusion) rather than deflecting to "check the resource." That's the whole point of this chat existing on the module page.
`
    : "";

  return {
    role: "system",
    content: `You are the learner's AI learning assistant inside a personalized learning path app. Answer questions about their own path, explain recommendations, clear up conceptual doubts while they're learning, and give study advice. Be specific and reference their actual data below rather than speaking generically.

Goal: "${context.goalText}" (domain: ${context.domain}, pace: ${context.trackPace}).
Current mastery: ${context.masterySummary}
Path so far: ${context.pathSummary}
Recent path adaptations: ${context.recentAdaptations || "none yet"}
${currentModuleBlock}
Keep answers concise (a few sentences unless asked for detail, e.g. a worked example). Respond with plain text only.`,
  };
}

export function proctoredReportMessages(opts: {
  skillName: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  missedTopics: string[];
  tabSwitchCount: number;
  identityFlagCount: number;
}): ChatMessage[] {
  const system = `You write short, honest, encouraging proctored-test reports for a learning app.

Skill assessed: "${opts.skillName}". Score: ${opts.score}/100 (${opts.correctCount}/${opts.totalQuestions} correct).
Topics with mistakes: ${opts.missedTopics.length ? opts.missedTopics.join(", ") : "none - clean pass"}.
Tab-switch/focus-loss flags during the test: ${opts.tabSwitchCount}.
Face-identity mismatch/no-face-detected flags during the test: ${opts.identityFlagCount}.

Write a short report (3-5 sentences): acknowledge the result honestly, call out the specific weak spot(s) if any, and say concretely what happens next (e.g. "the path will now revisit X before moving on" or "you're clear to move to the next module"). If tab-switch flags are 3 or higher, gently note the test conditions were not fully clean, factually not accusatory. If there are any identity flags, note factually that the face check didn't consistently match during the session - again factual, not accusatory (lighting/camera angle are common innocent causes). Respond with ONLY plain text.`;

  return [{ role: "system", content: system }];
}

export function socraticDialogueMessages(opts: {
  skillName: string;
  question: string;
  chosenAnswer: string;
  correctAnswer?: string;
  misconceptionHint?: string;
}): ChatMessage[] {
  const system = `You are a Socratic tutor. When a student chooses an incorrect answer, generate guided reflective questions and a conceptual hint to guide them toward self-discovery without revealing the correct answer directly.

Skill: "${opts.skillName}"
Question: "${opts.question}"
Student's Incorrect Answer: "${opts.chosenAnswer}"
${opts.correctAnswer ? `Target Concept / Invariant: "${opts.correctAnswer}"` : ""}
${opts.misconceptionHint ? `Known Misconception Note: "${opts.misconceptionHint}"` : ""}

Respond with ONLY a valid JSON object of this exact shape:
{
  "scaffoldingQuestions": ["<probing reflection question 1>", "<probing reflection question 2>"],
  "conceptualHint": "<a pedagogical hint guiding them to the underlying principle>",
  "diagram": "<optional ASCII concept matrix or invariant illustration, or null>"
}`;

  return [{ role: "system", content: system }];
}

