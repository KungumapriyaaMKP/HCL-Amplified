export type MentorEvent =
  | "quiz_pass"
  | "badge_unlock"
  | "code_run"
  | "progress"
  | "detour_splice"
  | "focus_milestone";

export interface MentorNudgeDetail {
  event: MentorEvent;
  message?: string;
}

/**
 * Dispatches a typed nudge event to the global mentor companion from anywhere in the app.
 */
export function emitNudge(event: MentorEvent, message?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<MentorNudgeDetail>("mentor:nudge", {
      detail: { event, message },
    })
  );
}

export const MENTOR_MESSAGES: Record<MentorEvent, string[]> = {
  quiz_pass: [
    "Sharp work | that concept is locked in.",
    "Correct! Your skill mastery just increased.",
    "Great understanding. Moving forward.",
  ],
  badge_unlock: [
    "Achievement unlocked! Keep your momentum going.",
    "New badge earned | outstanding progress.",
  ],
  code_run: [
    "Code executed! Hands-on practice is where mastery happens.",
    "Testing and iterating builds real intuition.",
  ],
  progress: [
    "Milestone reached! Another module completed.",
    "Your learning path is advancing nicely.",
  ],
  detour_splice: [
    "Spliced a quick refresher module to bridge that prerequisite gap.",
    "Added a focused concept bridge to reinforce your foundation.",
  ],
  focus_milestone: [
    "Deep focus session logged. Keep up the great pace.",
    "Consistent practice leads to great outcomes.",
  ],
};

export const IDLE_THOUGHTS: string[] = [
  "Ready when you are.",
  "Take your time | understanding comes with practice.",
  "One step at a time.",
  "You've got this.",
  "Building strong foundations.",
];
