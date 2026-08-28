"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/frontend/components/ui/Button";
import { Input } from "@/frontend/components/ui/Input";
import { IconSparkles, IconArrowRight } from "@tabler/icons-react";

export type ChatBubble = { role: "user" | "assistant"; content: string };

export function ChatThread({
  messages,
  onSend,
  loading,
  placeholder = "Ask AI mentor...",
  emptyHint,
}: {
  messages: ChatBubble[];
  onSend: (text: string) => void;
  loading: boolean;
  placeholder?: string;
  emptyHint?: string;
}) {
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function submit() {
    if (!draft.trim() || loading) return;
    onSend(draft.trim());
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col bg-[#080b18]">
      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && emptyHint && (
          <p className="text-center text-xs text-slate-500 py-6">{emptyHint}</p>
        )}
        
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex items-start gap-2.5 max-w-[85%]">
              {m.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-purple-950 border border-purple-500/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <IconSparkles className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-purple-400/40"
                    : "bg-[#11162e] text-slate-200 border border-purple-500/20 shadow-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-[#11162e] border border-purple-500/20 px-4 py-3 text-xs text-purple-300">
              <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
              <span>AI is generating response...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-purple-500/20 bg-[#0c1026] p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={placeholder}
          disabled={loading}
          className="text-xs"
        />
        <Button onClick={submit} disabled={loading || !draft.trim()} size="md">
          <span>Send</span>
          <IconArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
