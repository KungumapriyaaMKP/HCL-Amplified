"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { GhostMentor, type GhostMentorState } from "./GhostMentor";
import { ChatThread, type ChatBubble } from "@/frontend/components/chat/ChatThread";
import {
  type MentorNudgeDetail,
  MENTOR_MESSAGES,
  IDLE_THOUGHTS,
  emitNudge,
} from "@/lib/mentorBus";
import { IconSparkles, IconX, IconMessageDots } from "@tabler/icons-react";

export function GlobalMentor() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<GhostMentorState>("idle");
  const [bubble, setBubble] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Extract goalId and moduleId from URL if present
  const goalMatch = pathname?.match(/\/goals\/([^/]+)/);
  const moduleMatch = pathname?.match(/\/modules\/([^/]+)/);
  const currentGoalId = goalMatch && goalMatch[1] !== "new" ? goalMatch[1] : undefined;
  const currentModuleId = moduleMatch ? moduleMatch[1] : undefined;

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

  // Occasional low-key idle thoughts (every 3-5 min) when chat is closed
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    const scheduleNextThought = () => {
      const delay = (180 + Math.random() * 120) * 1000;
      idleTimer = setTimeout(() => {
        if (document.visibilityState === "visible" && !bubble && state === "idle" && !isOpen) {
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
  }, [bubble, state, isOpen]);

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

  // Load chat history when opened
  useEffect(() => {
    if (isOpen && !hasLoadedHistory) {
      const url = currentGoalId ? `/api/assistant/chat?goalId=${currentGoalId}` : "/api/assistant/chat";
      fetch(url)
        .then((r) => r.json())
        .then((body) => {
          if (Array.isArray(body.messages) && body.messages.length > 0) {
            setMessages(
              body.messages.map((m: { role: string; content: string }) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
              }))
            );
          } else {
            setMessages([
              {
                role: "assistant",
                content: currentModuleId
                  ? "Hi! I'm your AI Mentor. Ask me anything about this module, concepts, or code practice!"
                  : "Hi there! I'm your QuestLearn AI Companion. Ask me anything about your learning roadmap, study tips, or quiz reviews!",
              },
            ]);
          }
          setHasLoadedHistory(true);
        })
        .catch(() => {
          setHasLoadedHistory(true);
        });
    }
  }, [isOpen, hasLoadedHistory, currentGoalId, currentModuleId]);

  // Send message to LLM
  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);
    setState("thinking");

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: currentGoalId,
          moduleId: currentModuleId,
          message: text,
        }),
      });

      const body = await res.json();
      if (res.ok && body.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: body.reply }]);
        setState("celebrate");
        setTimeout(() => setState("idle"), 3000);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: body.error || "Sorry, I had trouble thinking of a response. Please try again!",
          },
        ]);
        setState("idle");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error occurred. Please try again!" },
      ]);
      setState("idle");
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = currentModuleId
    ? [
        "Explain this concept simply",
        "Give me a practice question",
        "What are the key takeaways?",
      ]
    : [
        "What should I study today?",
        "How can I level up faster?",
        "Explain how skill mastery works",
      ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto select-none font-sans">
      
      {/* 1. Chat Dialog Window */}
      {isOpen && (
        <div className="mb-3 w-[360px] sm:w-[410px] h-[520px] max-h-[80vh] overflow-hidden rounded-sm border border-purple-200/90 bg-white shadow-2xl shadow-purple-900/15 flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-purple-100 bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-white/20 shadow-xs">
                <GhostMentor size={28} state={state} />
              </div>
              <div>
                <div className="text-xs font-extrabold tracking-wide flex items-center gap-1">
                  <span>AI MENTOR COMPANION</span>
                  <IconSparkles className="w-3 h-3 text-yellow-300" />
                </div>
                <div className="text-[10px] text-purple-100 font-medium">
                  {currentModuleId
                    ? "Active Module Mentor Mode"
                    : currentGoalId
                    ? "Roadmap Guidance Mode"
                    : "Universal Study Assistant"}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-xs border border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer"
              title="Close Chat"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-50/70 border-b border-purple-100 overflow-x-auto custom-scrollbar">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 rounded-xs bg-white hover:bg-purple-100/70 border border-purple-200 text-[10px] font-bold text-[#6D28D9] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-hidden bg-[#FAFBFD]">
            <ChatThread
              messages={messages}
              onSend={handleSend}
              loading={loading}
              placeholder={
                currentModuleId
                  ? "Ask mentor about this module..."
                  : "Ask mentor anything..."
              }
              emptyHint="Ask any question about your courses, milestones, or code concepts!"
            />
          </div>
        </div>
      )}

      {/* 2. Floating Cute Ghost Trigger Mascot */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Chat with AI Mentor"
        className="group relative flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-hidden"
        title="Chat with AI Mentor"
      >
        {/* Soft Ambient Floating Glow */}
        <div className="absolute -inset-2 rounded-full bg-purple-400/25 blur-lg group-hover:bg-purple-500/40 transition-colors pointer-events-none" />

        {/* Mascot Avatar */}
        <div className="relative">
          <GhostMentor size={68} state={state} bubble={isOpen ? null : bubble} />
        </div>
      </button>

    </div>
  );
}
