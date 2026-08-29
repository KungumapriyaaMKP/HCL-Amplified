"use client";

import React, { useEffect, useRef, useCallback, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  Layout,
  MonitorIcon,
  Sparkles,
  Paperclip,
  SendIcon,
  XIcon,
  LoaderIcon,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MentorGirlAvatar } from "@/components/ui/mentor-girl-avatar";
import { LoaderOne } from "@/components/ui/loader-one";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = false, ...props }, ref) => {
    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          className={cn(
            "flex min-h-[44px] w-full rounded-md border-0 bg-transparent px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-slate-400 text-slate-900 focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export interface ChatBubble {
  role: "user" | "assistant";
  content: string;
}

export interface AnimatedAIChatProps {
  title?: string;
  subtitle?: string;
  messages?: ChatBubble[];
  onSendMessage?: (message: string) => void;
  loading?: boolean;
  className?: string;
}

export function AnimatedAIChat({
  title = "How can I help with your learning goal?",
  subtitle = "Our AI mentor is calibrating your skill vector. Type your reply below.",
  messages = [],
  onSendMessage,
  loading = false,
  className,
}: AnimatedAIChatProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [, startTransition] = useTransition();
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [, setRecentCommand] = useState<string | null>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 44,
    maxHeight: 120,
  });
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const commandSuggestions: CommandSuggestion[] = [
    {
      icon: <MonitorIcon className="w-4 h-4 text-[#7C3AED]" />,
      label: "Full-Stack Roadmap",
      description: "Generate full-stack web engineering curriculum",
      prefix: "/fullstack",
    },
    {
      icon: <Sparkles className="w-4 h-4 text-[#7C3AED]" />,
      label: "Fast-Track Mode",
      description: "Prioritize rapid core skill milestones",
      prefix: "/fast",
    },
    {
      icon: <ImageIcon className="w-4 h-4 text-[#7C3AED]" />,
      label: "Project-Based",
      description: "Focus on real-world portfolio builds",
      prefix: "/projects",
    },
    {
      icon: <Layout className="w-4 h-4 text-[#7C3AED]" />,
      label: "Deep Prerequisites",
      description: "Build rigorous foundational mastery first",
      prefix: "/rigorous",
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);

      const matchingSuggestionIndex = commandSuggestions.findIndex((cmd) =>
        cmd.prefix.startsWith(value)
      );

      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex);
      } else {
        setActiveSuggestion(-1);
      }
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const commandButton = document.querySelector("[data-command-button]");

      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev < commandSuggestions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev > 0 ? prev - 1 : commandSuggestions.length - 1
        );
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion];
          setValue(selectedCommand.prefix + " ");
          setShowCommandPalette(false);

          setRecentCommand(selectedCommand.label);
          setTimeout(() => setRecentCommand(null), 3500);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = () => {
    if (value.trim()) {
      const textToSend = value.trim();
      setValue("");
      adjustHeight(true);
      if (onSendMessage) {
        onSendMessage(textToSend);
      }
    }
  };

  const handleAttachFile = () => {
    const mockFileName = `spec-${Math.floor(Math.random() * 1000)}.pdf`;
    setAttachments((prev) => [...prev, mockFileName]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index];
    setValue(selectedCommand.prefix + " ");
    setShowCommandPalette(false);

    setRecentCommand(selectedCommand.label);
    setTimeout(() => setRecentCommand(null), 2000);
  };

  return (
    <div className={cn("w-full h-full flex flex-col justify-between relative min-h-0 bg-white rounded-md", className)}>
      {/* 1. Single Box Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/40 shrink-0 text-center">
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-1">{subtitle}</p>
      </div>

      {/* 2. Single Box Message Thread (No Nested Inner Border) */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 p-4 sm:p-6 custom-scrollbar bg-white">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 py-10">
            AI mentor is ready. Type your reply below.
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex items-start gap-2.5 max-w-[90%] sm:max-w-[80%]">
              {m.role === "assistant" && (
                <MentorGirlAvatar size="sm" />
              )}
              <div
                className={`rounded-md px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white font-medium shadow-xs"
                    : "bg-slate-50 text-slate-800 border border-slate-200/80 shadow-2xs"
                }`}
              >
                {m.content}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2.5">
              <MentorGirlAvatar size="sm" isThinking={true} />
              <div className="flex items-center gap-2 rounded-md bg-slate-50 border border-slate-200/80 px-4 py-2.5 shadow-2xs">
                <span className="text-xs text-slate-500 font-medium mr-1">Typing</span>
                <LoaderOne dotClassName="h-2 w-2 bg-[#7C3AED]" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Integrated Input Footer (Directly attached inside the single box) */}
      <div className="shrink-0 border-t border-slate-200 bg-slate-50/60 p-3 sm:p-4 rounded-b-md">
        <div className="relative rounded-md border border-slate-300 bg-white shadow-2xs focus-within:border-[#7C3AED] focus-within:ring-1 focus-within:ring-[#7C3AED]">
          <AnimatePresence>
            {showCommandPalette && (
              <motion.div
                ref={commandPaletteRef}
                className="absolute left-2 right-2 bottom-full mb-2 bg-white rounded-md z-50 shadow-xl border border-slate-200 overflow-hidden"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
              >
                <div className="py-1">
                  {commandSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion.prefix}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                        activeSuggestion === index
                          ? "bg-purple-50 text-[#7C3AED]"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                      onClick={() => selectCommandSuggestion(index)}
                    >
                      <div className="w-5 h-5 flex items-center justify-center">
                        {suggestion.icon}
                      </div>
                      <div className="font-semibold text-slate-800">{suggestion.label}</div>
                      <div className="text-slate-400 text-[11px] ml-1 font-mono">
                        {suggestion.prefix}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-2">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI mentor or type /..."
              containerClassName="w-full"
              className="w-full px-2 py-1 resize-none bg-transparent border-none text-slate-900 text-xs sm:text-sm focus:outline-none placeholder:text-slate-400 min-h-[44px]"
            />
          </div>

          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                className="px-3 pb-2 flex gap-2 flex-wrap"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {attachments.map((file, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-1.5 text-xs bg-purple-50 text-[#7C3AED] border border-purple-200/70 py-1 px-2.5 rounded-sm font-medium"
                  >
                    <span>{file}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-[#7C3AED]/60 hover:text-[#7C3AED] transition-colors cursor-pointer"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-2 border-t border-slate-100 flex items-center justify-end bg-slate-50/40 rounded-b-md">
            <motion.button
              type="button"
              onClick={handleSendMessage}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading || !value.trim()}
              className={cn(
                "px-4 py-1.5 rounded-sm text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs",
                value.trim() && !loading
                  ? "bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] text-white hover:opacity-95"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              {loading ? (
                <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <SendIcon className="w-3 h-3" />
              )}
              <span>Send</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimatedAIChat;
