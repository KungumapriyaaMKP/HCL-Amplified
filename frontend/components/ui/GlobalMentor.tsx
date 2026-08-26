"use client";

import { useState, useEffect, useRef } from "react";
import { GhostMentor, GhostMentorState } from "./GhostMentor";
import {
  MentorEvent,
  MentorNudgeDetail,
  MENTOR_MESSAGES,
  emitNudge,
} from "@/lib/mentorBus";

// 30-minute focus session threshold
export const FOCUS_INTERVAL_MS = 30 * 60 * 1000;

function pickRandomMessage(event: MentorEvent): string {
  const pool = MENTOR_MESSAGES[event] || [];
  if (pool.length === 0) return "Keep up the great work!";
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

function mapEventToState(event: MentorEvent): GhostMentorState {
  switch (event) {
    case "quiz_pass":
    case "badge_unlock":
    case "progress":
      return "celebrate";
    case "code_run":
      return "thinking";
    case "focus_milestone":
    default:
      return "idle";
  }
}

export function GlobalMentor() {
  const [state, setState] = useState<GhostMentorState>("idle");
  const [bubble, setBubble] = useState<string | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus accumulator & visibility tracker
  useEffect(() => {
    let accumulatedMs = 0;
    let lastActiveTimestamp = Date.now();

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        const now = Date.now();
        accumulatedMs += now - lastActiveTimestamp;
        lastActiveTimestamp = now;

        if (accumulatedMs >= FOCUS_INTERVAL_MS) {
          emitNudge("focus_milestone");
          accumulatedMs = 0;
        }
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        lastActiveTimestamp = Date.now();
      } else {
        // Paused/Hidden: reset active segment
        accumulatedMs = 0;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Nudge Bus Listener
  useEffect(() => {
    const handleNudge = (e: Event) => {
      const customEvent = e as CustomEvent<MentorNudgeDetail>;
      const { event, message } = customEvent.detail || {};
      if (!event) return;

      const targetState = mapEventToState(event);
      const text = message || pickRandomMessage(event);

      setState(targetState);
      setBubble(text);

      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }

      dismissTimerRef.current = setTimeout(() => {
        setBubble(null);
        setState("idle");
      }, 5000);
    };

    window.addEventListener("mentor:nudge", handleNudge);

    return () => {
      window.removeEventListener("mentor:nudge", handleNudge);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 pointer-events-auto">
      <GhostMentor size={64} state={state} bubble={bubble} />
    </div>
  );
}
