"use client";

import { useEffect, useState } from "react";
import { ChatThread, type ChatBubble } from "@/components/chat/ChatThread";

export function AssistantWidget({ goalId }: { goalId: string }) {
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
        body: JSON.stringify({ goalId, message: text }),
      });
      const body = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: res.ok ? body.reply : `Error: ${body.error}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 h-[420px] w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">Ask about your path</span>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground">✕</button>
          </div>
          <div className="h-[calc(420px-49px)]">
            <ChatThread
              messages={messages}
              onSend={send}
              loading={loading}
              placeholder="Why is this recommended?"
              emptyHint="Ask why a module was picked, what to focus on next, or how you're doing."
            />
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xl text-white shadow-lg"
      >
        {open ? "×" : "💬"}
      </button>
    </div>
  );
}
