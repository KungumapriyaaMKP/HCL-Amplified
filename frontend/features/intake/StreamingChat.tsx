"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Globe, Cloud, BarChart3 } from "lucide-react";
import { streamChatIntake, PlanRequest } from "@/lib/api/pathfinder";
import { Pill } from "@/components/ui/Pill";
import { GhostMentor } from "@/components/ui/GhostMentor";
import { FormattedContent } from "@/components/ui/FormattedContent";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface StreamingChatProps {
  onIntakeComplete: (planReq: Partial<PlanRequest>) => void;
  knownSkills: Record<string, number>;
  constraints?: {
    hoursPerWeek: number;
    deadlineWeeks: number;
    budgetUsd: number | null;
  };
}

export function StreamingChat({
  onIntakeComplete,
  knownSkills,
  constraints,
}: StreamingChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      role: "assistant",
      content: constraints
        ? `Hello! I'm Pathfinder AI. What career role or technical goal are you aiming for? I've already noted your schedule (${constraints.hoursPerWeek}h/week, ${constraints.deadlineWeeks} weeks${constraints.budgetUsd !== null ? `, budget $${constraints.budgetUsd}` : ""}) from the sliders.`
        : "Hello! I'm Pathfinder AI. What career role or technical goal are you aiming for? Tell me a bit about your target timeline and available study hours per week.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend ?? input;
    if (!query.trim() || isStreaming) return;

    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setIsStreaming(true);

    let assistantAccum = "";

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const chatPayload: Array<{ role: string; content: string }> = [];
    if (constraints) {
      const budgetText =
        constraints.budgetUsd === null
          ? "Any / Flexible"
          : constraints.budgetUsd === 0
          ? "100% Free"
          : `$${constraints.budgetUsd}`;
      chatPayload.push({
        role: "system",
        content: `[CONTEXT] The learner has already set: ~${constraints.hoursPerWeek}h/week, a ${constraints.deadlineWeeks}-week deadline, budget ${budgetText}. Do NOT ask for these again — acknowledge them and focus on their goal, sub-interests, and motivation.`,
      });
    }
    chatPayload.push(...newMessages.map((m) => ({ role: m.role, content: m.content })));

    await streamChatIntake(
      chatPayload,
      (chunk) => {
        assistantAccum += chunk;
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: assistantAccum };
          return next;
        });
      },
      () => {
        setIsStreaming(false);
        // Check for INTAKE_COMPLETE marker
        const match = assistantAccum.match(/\[INTAKE_COMPLETE:\s*({.*?})\]/);
        if (match && match[1]) {
          try {
            const parsed = JSON.parse(match[1]);
            onIntakeComplete({
              goal: parsed.goal || query,
              hours_per_week: constraints?.hoursPerWeek ?? parsed.hours_per_week ?? 10.0,
              deadline_weeks: constraints?.deadlineWeeks ?? parsed.deadline_weeks ?? 24,
              budget_usd: constraints ? constraints.budgetUsd : (parsed.budget_usd || null),
              known: knownSkills,
            });
          } catch {}
        }
      }
    );
  };

  const handleQuickGoal = (goalText: string, hours: number, weeks: number) => {
    onIntakeComplete({
      goal: goalText,
      hours_per_week: constraints?.hoursPerWeek ?? hours,
      deadline_weeks: constraints?.deadlineWeeks ?? weeks,
      budget_usd: constraints ? constraints.budgetUsd : null,
      known: knownSkills,
      priority: "balanced",
    });
  };

  return (
    <div className="flex flex-col h-[520px] bg-canvas border border-border rounded-2xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-4 border-b border-border bg-surface/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GhostMentor size={36} state={isStreaming ? "speaking" : "idle"} />
          <div>
            <h3 className="text-sm font-semibold text-ink">Pathfinder AI Greeter</h3>
            <p className="text-xs text-muted">Intelligent Goal & Constraint Extraction</p>
          </div>
        </div>
        <Pill variant={isStreaming ? "active" : "neutral"}>
          {isStreaming ? "Synthesizing..." : "Active"}
        </Pill>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-ink text-canvas rounded-br-xs font-medium"
                  : "bg-surface border border-border text-ink rounded-bl-xs shadow-2xs"
              }`}
            >
              {/* Clean INTAKE_COMPLETE marker from rendered text */}
              {m.role === "user" ? (
                m.content
              ) : (
                <FormattedContent
                  text={m.content.replace(/\[INTAKE_COMPLETE:.*?\]/, "").trim()}
                />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Role Suggestions */}
      <div className="px-4 py-2 bg-surface/20 border-t border-border flex items-center gap-2 overflow-x-auto text-xs text-muted scrollbar-none">
        <span className="shrink-0 text-[11px] font-medium">Quick Goals:</span>
        <button
          type="button"
          onClick={() => handleQuickGoal("Machine Learning Engineer", 10, 24)}
          className="shrink-0 bg-surface border border-border hover:border-ink/40 text-ink px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>ML Engineer (10h/wk)</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickGoal("Full-Stack Web & AI Application Engineer", 12, 16)}
          className="shrink-0 bg-surface border border-border hover:border-ink/40 text-ink px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Full-Stack AI (12h/wk)</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickGoal("Cloud Infrastructure & DevOps Engineer", 8, 20)}
          className="shrink-0 bg-surface border border-border hover:border-ink/40 text-ink px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>Cloud / DevOps (8h/wk)</span>
        </button>
        <button
          type="button"
          onClick={() => handleQuickGoal("Data Platform & Analytics Engineer", 10, 24)}
          className="shrink-0 bg-surface border border-border hover:border-ink/40 text-ink px-2.5 py-1 rounded-full text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Data Engineer (10h/wk)</span>
        </button>
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-border bg-canvas flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="E.g., I want to become a Machine Learning Engineer in 6 months studying 10h/week..."
          disabled={isStreaming}
          className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-ink/50"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="bg-ink text-canvas font-medium text-xs px-5 py-2.5 rounded-xl hover:bg-ink/90 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
        >
          Send
        </button>
      </form>
    </div>
  );
}
