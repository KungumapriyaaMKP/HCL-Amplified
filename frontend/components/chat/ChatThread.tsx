"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PromptBox } from "@/components/ui/chatgpt-prompt-input";
import { MentorGirlAvatar } from "@/components/ui/mentor-girl-avatar";
import { LoaderOne } from "@/components/ui/loader-one";

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
                <MentorGirlAvatar size="sm" />
              )}
              <div
                className={`rounded-md px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white font-medium shadow-sm"
                    : "bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs"
                }`}
              >
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2.5">
              <MentorGirlAvatar size="sm" isThinking={true} />
              <div className="flex items-center gap-2 rounded-md bg-slate-50 border border-slate-200/90 px-4 py-3 shadow-2xs">
                <span className="text-xs text-slate-500 font-medium mr-1">Typing</span>
                <LoaderOne dotClassName="h-2 w-2 bg-[#7C3AED]" />
              </div>
            </div>
          </motion.div>
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
