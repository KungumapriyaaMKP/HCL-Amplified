"use client";

import { useRef, useEffect } from "react";
import { IconSparkles } from "@tabler/icons-react";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";

export type ChatBubble = { role: "user" | "assistant"; content: string };

export function ChatThread({
  messages,
  onSend,
  loading,
  placeholder = "Type your reply...",
  emptyHint,
}: {
  messages: ChatBubble[];
  onSend: (text: string) => void;
  loading: boolean;
  placeholder?: string;
  emptyHint?: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Scrollable Message List */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
        {messages.length === 0 && emptyHint && (
          <div className="text-center text-xs text-slate-400 py-10">
            <p>{emptyHint}</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex items-start gap-3 max-w-[85%]">
              {m.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FE] text-[#7C3AED] shadow-2xs">
                  <IconSparkles className="h-4 w-4" />
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white font-medium shadow-sm"
                    : "bg-slate-50 text-slate-800 border border-slate-200/80 shadow-2xs"
                }`}
              >
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-3 text-xs text-[#7C3AED] font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-[#7C3AED] animate-ping" />
              <span>AI is thinking & analyzing your response...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Modern ChatGPT Style Prompt Box Footer */}
      <div className="border-t border-slate-100 bg-slate-50/70 p-3 sm:p-4">
        <PromptBox
          placeholder={placeholder}
          onSendMessage={onSend}
          loading={loading}
        />
      </div>
    </div>
  );
}
