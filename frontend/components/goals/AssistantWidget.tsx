"use client";

import { useEffect, useState } from "react";
import { ChatThread, type ChatBubble } from "@/frontend/components/chat/ChatThread";
import { IconSparkles, IconX } from "@tabler/icons-react";

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
        <div className="mb-3 h-[460px] w-88 overflow-hidden rounded-lg border-2 border-purple-500/40 bg-[#0c1026]/95 shadow-[0_0_40px_rgba(139,92,246,0.4)] backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-purple-500/20 bg-[#080b1a] px-4 py-3">
            <div className="flex items-center gap-2">
              <IconSparkles className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-xs font-black text-white">AI MENTOR ASSISTANT</div>
                <div className="text-[10px] text-purple-300/70">{moduleId ? "Module Mentor Mode" : "Roadmap Guidance"}</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-purple-500/20 text-slate-400 hover:text-white hover:bg-purple-950"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[calc(460px-57px)]">
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

      {/* Floating Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-md border-2 border-cyan-400/60 bg-gradient-to-br from-purple-700 via-indigo-700 to-cyan-600 shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300 hover:scale-110 active:scale-95"
        title="AI Companion Mentor"
      >
        <span className="text-white transition-transform group-hover:scale-110">
          {open ? <IconX className="h-6 w-6" /> : <IconSparkles className="h-6 w-6" />}
        </span>
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-cyan-400" />
          </span>
        )}
      </button>
    </div>
  );
}
