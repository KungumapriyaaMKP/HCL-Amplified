export type MentorEvent =
  | "quiz_pass"
  | "badge_unlock"
  | "code_run"
  | "progress"
  | "focus_milestone";

export interface MentorNudgeDetail {
  event: MentorEvent;
  message?: string;
}

// Dispatch from anywhere in the app.
export function emitNudge(event: MentorEvent, message?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<MentorNudgeDetail>("mentor:nudge", {
      detail: { event, message },
    })
  );
}

// Static fallback messages, one picked at random when no explicit message is passed.
export const MENTOR_MESSAGES: Record<MentorEvent, string[]> = {
  quiz_pass: [
    "Sharp work — that concept is locked in.",
    "Correct. Your mastery just went up.",
  ],
  badge_unlock: [
    "Achievement unlocked. Keep the streak alive.",
    "New badge earned — nicely done.",
  ],
  code_run: [
    "Nice — code executed. Experiment freely.",
    "Running your own code is how it sticks.",
  ],
  progress: [
    "Momentum! Another step down your roadmap.",
    "Great — next module is unlocked.",
  ],
  focus_milestone: [
    "You've stayed focused a while — keep going.",
    "Deep work pays off. You're doing great.",
  ],
};

// Occasional low-key idle thoughts for the global companion
export const IDLE_THOUGHTS: string[] = [
  "Ready when you are.",
  "Take your time.",
  "You've got this.",
  "Nice focus.",
  "One step at a time.",
];
