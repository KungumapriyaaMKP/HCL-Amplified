"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export type ChatBubble = { role: "user" | "assistant"; content: string };

export function ChatThread({
  messages,
  onSend,
  loading,
  placeholder = "Type a message...",
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
    <div className="flex h-full flex-col">
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && emptyHint && <p className="text-sm text-muted">{emptyHint}</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "bg-accent text-white" : "bg-surface-2 text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-surface-2 px-4 py-2.5 text-sm text-muted">Thinking...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-border p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={placeholder}
          disabled={loading}
        />
        <Button onClick={submit} disabled={loading || !draft.trim()}>
          Send
        </Button>
      </div>
    </div>
  );
}
