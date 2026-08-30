"use client";

import { useEffect, useState } from "react";
import { ChatThread, type ChatBubble } from "@/frontend/components/chat/ChatThread";
import { IconSparkles, IconX } from "@tabler/icons-react";

/**
 * Cute Ghost Mascot Vector matching Image 1
 */
export function CuteGhostMascot({ className = "w-11 h-13" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <filter id="ghostGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#7C3AED" floodOpacity="0.25" />
      </filter>

      {/* Ghost Body */}
      <path
        d="M 6 22 C 6 10 14 4 24 4 C 34 4 42 10 42 22 L 42 46 C 42 50 38 52 34 48 C 30 44 27 46 24 46 C 21 46 18 44 14 48 C 10 52 6 50 6 46 Z"
        fill="#FFFFFF"
        stroke="#DDD6FE"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#ghostGlow)"
      />

      {/* Left Eye */}
      <circle cx="17" cy="22" r="2.8" fill="#1E293B" />
      <circle cx="18" cy="21" r="1" fill="#FFFFFF" />

      {/* Right Eye */}
      <circle cx="31" cy="22" r="2.8" fill="#1E293B" />
      <circle cx="32" cy="21" r="1" fill="#FFFFFF" />

      {/* Left Blush Cheek */}
      <circle cx="12" cy="26" r="2.8" fill="#FDE047" opacity="0.9" />

      {/* Right Blush Cheek */}
      <circle cx="36" cy="26" r="2.8" fill="#FDE047" opacity="0.9" />

      {/* Smile Mouth */}
      <path
        d="M 20.5 27.5 C 22 29.5 26 29.5 27.5 27.5"
        stroke="#1E293B"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function AssistantWidget({ goalId, moduleId }: { goalId: string; moduleId?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (open && !loaded) {
      fetch(`/api/assistant/chat?goalId=${goalId}`)
        .then((r) => r.json())
        .then((body) => {
          setMessages((body.messages ?? []).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })));
          setLoaded(true);
        });
    }
  }, [open, loaded, goalId]);

  async function send(text: string) {
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId, message: text, moduleId }),
      });
      const body = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: res.ok ? body.reply : `Error: ${body.error}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 h-[460px] w-88 overflow-hidden rounded-sm border-2 border-purple-200 bg-white/98 shadow-2xl shadow-purple-500/20 backdrop-blur-2xl text-slate-900">
          <div className="flex items-center justify-between border-b border-purple-100 bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-white/20">
                <CuteGhostMascot className="w-5 h-6" />
              </div>
              <div>
                <div className="text-xs font-black tracking-wide">AI MENTOR COMPANION</div>
                <div className="text-[10px] text-purple-100 font-medium">
                  {moduleId ? "Module Mentor Mode" : "Roadmap Guidance"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-xs border border-white/20 text-white hover:bg-white/20 transition-colors"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[calc(460px-57px)] bg-slate-50/50">
            <ChatThread
              messages={messages}
              onSend={send}
              loading={loading}
              placeholder={moduleId ? "Ask mentor about this module..." : "Ask why this path was recommended..."}
              emptyHint={
                moduleId
                  ? "Stuck on a concept? Ask for a code snippet, mental model, or test preparation tip."
                  : "Ask the mentor why a module was recommended, what to tackle next, or how to level up faster."
              }
            />
          </div>
        </div>
      )}

      {/* Floating Trigger Button: Cute Ghost Mascot (Image 1) */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="group relative flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-115 active:scale-95 drop-shadow-md select-none"
        title="AI Companion Mentor"
      >
        {open ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6D28D9] text-white shadow-lg ring-2 ring-purple-300">
            <IconX className="h-6 w-6" />
          </div>
        ) : (
          <div className="relative">
            {/* Soft Ambient Floating Glow */}
            <div className="absolute -inset-1 rounded-full bg-purple-400/20 blur-md group-hover:bg-purple-400/40 transition-colors" />
            
            {/* Cute Ghost Mascot (Exact Match to Image 1) */}
            <CuteGhostMascot className="relative w-12 h-14" />

            {/* Notification Pulse Dot */}
            <span className="absolute 1 top-0 right-0 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#7C3AED] ring-2 ring-white" />
            </span>
          </div>
        )}
      </button>
    </div>
  );
}

export default AssistantWidget;
