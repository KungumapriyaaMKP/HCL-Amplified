import type { ChatMessage } from "@/lib/llm";
import { leafSkillsForDomain } from "@/lib/skillGraph";
import { SKILLS_BY_ID } from "@/data/skills";

const QUESTION_SHAPE = `Each question object must look like:
{"id": "q1", "skillId": "<one of the given skill ids>", "question": "<text>", "options": ["<a>", "<b>", "<c>", "<d>"], "correctIndex": <0-3>, "explanation": "<why the correct answer is correct, 1-2 sentences>"}`;

export function goalIntakeMessages(
  domain: string,
  goalText: string,
  trackPace: string,
  history: ChatMessage[],
  domainId?: string,
): ChatMessage[] {
  const targetDomain = domainId || domain;
  const leafIds = leafSkillsForDomain(targetDomain);
  const candidateSkills = leafIds
    .map((id) => SKILLS_BY_ID.get(id))
    .filter((s): s is NonNullable<typeof s> => !!s)
    .map((s) => `- ${s.id}: ${s.name} - ${s.description}`)
    .join("\n");

  const system = `You are a warm, focused AI learning advisor helping a learner scope a brand-new learning goal.
Domain: "${domain}". Learner's initial goal statement: "${goalText}". Chosen pace: "${trackPace}".

Candidate target skills in this domain:
${candidateSkills || "(No leaf skills defined for this domain)"}

Have a short natural conversation (aim for 2-4 learner replies total) to learn:
(a) their specific sub-focus or specialization within this domain (e.g. within "AI & Machine Learning" that could be "computer vision" or "LLM applications"),
(b) their underlying motivation (career switch, current job need, curiosity, an upcoming project...),
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
  scoreBreakdown: {
    cosineSim: number;
    prereqReadiness: number;
    difficultyFit: number;
    interestOverlap: number;
    ratingNorm: number;
    preferenceFit?: number;
  };
}): ChatMessage[] {
  const crashCourse = opts.trackPace === "crash-course";
  const scores = opts.scoreBreakdown;
  const prefLine =
    scores.preferenceFit !== undefined
      ? `\n- Modality preference fit: ${(scores.preferenceFit * 100).toFixed(0)}%`
      : "";

  const system = `You write short, specific explanations for why a learning-path recommendation engine picked a resource.

Goal: "${opts.goalText}" (domain: ${opts.domain}).
This module teaches: "${opts.skillName}", via the ${opts.resourceType} "${opts.resourceTitle}".
${opts.isFirstModule ? "This is the very first module in the path." : `It comes after the learner has covered: ${opts.priorSkillNames.join(", ")}.`}
${crashCourse ? "The learner picked the Interview Crash Course pace - they have an upcoming interview and chose hands-on practice over long-form courses wherever possible. Frame the rationale around interview relevance and getting practice reps in fast." : ""}

Algorithm score breakdown for this recommendation:
- Goal/content cosine similarity: ${(scores.cosineSim * 100).toFixed(0)}%
- Prerequisite readiness: ${(scores.prereqReadiness * 100).toFixed(0)}%
- Difficulty fit: ${(scores.difficultyFit * 100).toFixed(0)}%
- Interest overlap: ${(scores.interestOverlap * 100).toFixed(0)}%
- Resource quality rating: ${(scores.ratingNorm * 100).toFixed(0)}%${prefLine}

Base your explanation ONLY on these specific scores. Do not invent reasons not reflected in these numbers. Reference at least one concrete score in plain language (e.g. a high prereqReadiness means their foundations are solid for this, or a strong difficulty fit matches their current level).

Write a 2-3 sentence rationale, second person ("you"), explaining why this specific skill and resource were chosen now, referencing the prerequisite chain or the goal directly. Respond with ONLY plain text, no JSON, no markdown.`;

  return [{ role: "system", content: system }];
}

export function assistantSystemMessage(context: {
  goalText: string;
  domain: string;
  trackPace: string;
  masterySummary: string;
  pathSummary: string;
  recentAdaptations: string;
}): ChatMessage {
  return {
    role: "system",
    content: `You are the learner's AI learning assistant inside a personalized learning path app. Answer questions about their own path, explain recommendations, and give study advice. Be specific and reference their actual data below rather than speaking generically.

Goal: "${context.goalText}" (domain: ${context.domain}, pace: ${context.trackPace}).
Current mastery: ${context.masterySummary}
Path so far: ${context.pathSummary}
Recent path adaptations: ${context.recentAdaptations || "none yet"}

Keep answers concise (a few sentences unless asked for detail). Respond with plain text only.`,
  };
}

export function proctoredReportMessages(opts: {
  skillName: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  missedTopics: string[];
  tabSwitchCount: number;
}): ChatMessage[] {
  const system = `You write short, honest, encouraging proctored-test reports for a learning app.

Skill assessed: "${opts.skillName}". Score: ${opts.score}/100 (${opts.correctCount}/${opts.totalQuestions} correct).
Topics with mistakes: ${opts.missedTopics.length ? opts.missedTopics.join(", ") : "none - clean pass"}.
Tab-switch/focus-loss flags during the test: ${opts.tabSwitchCount}.

Write a short report (3-5 sentences): acknowledge the result honestly, call out the specific weak spot(s) if any, and say concretely what happens next (e.g. "the path will now revisit X before moving on" or "you're clear to move to the next module"). If tab-switch flags are 3 or higher, gently note the test conditions were not fully clean, factually not accusatory. Respond with ONLY plain text.`;

  return [{ role: "system", content: system }];
}
