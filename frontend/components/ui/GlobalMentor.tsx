"use client";

import { useState, useEffect, useRef } from "react";
import { GhostMentor, type GhostMentorState } from "./GhostMentor";
import {
  type MentorEvent,
  type MentorNudgeDetail,
  MENTOR_MESSAGES,
  IDLE_THOUGHTS,
  emitNudge,
} from "@/lib/mentorBus";

export function GlobalMentor() {
  const [state, setState] = useState<GhostMentorState>("idle");
  const [bubble, setBubble] = useState<string | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus milestone timer (every 25 minutes)
  useEffect(() => {
    let focusTime = 0;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        focusTime += 10000;
        if (focusTime >= 25 * 60 * 1000) {
          emitNudge("focus_milestone");
          focusTime = 0;
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Occasional low-key idle thoughts (every 3-5 min)
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const scheduleNextThought = () => {
      const delay = (180 + Math.random() * 120) * 1000;
      idleTimer = setTimeout(() => {
        if (document.visibilityState === "visible" && !bubble && state === "idle") {
          const pool = IDLE_THOUGHTS;
          const randomThought = pool[Math.floor(Math.random() * pool.length)];
          setBubble(randomThought);
          if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
          dismissTimerRef.current = setTimeout(() => setBubble(null), 5000);
        }
        scheduleNextThought();
      }, delay);
    };

    scheduleNextThought();
    return () => clearTimeout(idleTimer);
  }, [bubble, state]);

  // Nudge Event Listener
  useEffect(() => {
    const handleNudge = (e: Event) => {
      const customEvent = e as CustomEvent<MentorNudgeDetail>;
      const { event, message } = customEvent.detail || {};
      if (!event) return;

      let nextState: GhostMentorState = "idle";
      if (event === "quiz_pass" || event === "badge_unlock" || event === "progress") {
        nextState = "celebrate";
      } else if (event === "code_run" || event === "detour_splice") {
        nextState = "thinking";
      }

      const text = message || (MENTOR_MESSAGES[event] ? MENTOR_MESSAGES[event][0] : "Great work!");

      setState(nextState);
      setBubble(text);

      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = setTimeout(() => {
        setBubble(null);
        setState("idle");
      }, 5000);
    };

    window.addEventListener("mentor:nudge", handleNudge);
    return () => {
      window.removeEventListener("mentor:nudge", handleNudge);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 pointer-events-auto">
      <GhostMentor size={64} state={state} bubble={bubble} />
    </div>
  );
}
