const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class LlmError extends Error {}

/**
 * Calls LLM via Groq (or OpenRouter fallback) OpenAI-compatible Chat Completions API.
 * This is the single choke point for every AI call in the app
 * (onboarding extraction, question generation, rationale/report writing,
 * the assistant chat) - see lib/prompts.ts for the actual prompts.
 */
export async function chatComplete(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (groqKey) {
    const candidateModels = Array.from(
      new Set([
        process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3.6-27b",
      ])
    );

    let lastError: string | null = null;
    for (const model of candidateModels) {
      try {
        const res = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: opts.temperature ?? 0.5,
            max_tokens: opts.maxTokens ?? 1800,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          lastError = `Groq (${model}) failed (${res.status}): ${text.slice(0, 500)}`;
          // If rate limit / TPM limit exceeded or model not found, try next candidate
          if (res.status === 413 || res.status === 429 || res.status === 404) {
            console.warn(`Groq model ${model} rate-limited or unavailable (${res.status}), trying fallback...`);
            continue;
          }
          throw new LlmError(lastError);
        }

        const data = await res.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content === "string") {
          return content;
        }
      } catch (err) {
        if (err instanceof LlmError && !err.message.includes("413") && !err.message.includes("429")) {
          throw err;
        }
      }
    }

    throw new LlmError(lastError || "Groq returned no message content across all models");
  }

  if (openRouterKey) {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://localhost",
        "X-Title": "AI Learning Path Recommender",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-5",
        messages,
        temperature: opts.temperature ?? 0.5,
        max_tokens: opts.maxTokens ?? 1800,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new LlmError(`OpenRouter request failed (${res.status}): ${text.slice(0, 500)}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new LlmError("OpenRouter returned no message content");
    }
    return content;
  }

  throw new LlmError("Neither GROQ_API_KEY nor OPENROUTER_API_KEY is set");
}

function extractJsonBlock(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const startArr = candidate.indexOf("[");
  const first =
    start === -1 ? startArr : startArr === -1 ? start : Math.min(start, startArr);
  const last = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
  if (first === -1 || last === -1) return candidate.trim();
  return candidate.slice(first, last + 1).trim();
}

/**
 * Prompt-engineered strict-JSON call: instructs the model to answer with
 * ONLY JSON, parses it, and on a parse failure sends the broken output back
 * once asking it to return corrected valid JSON. No dependency on
 * provider-specific function calling / response_format support.
 */
export async function chatJson<T = unknown>(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<T> {
  const jsonMessages: ChatMessage[] = [
    ...messages,
    {
      role: "user",
      content:
        "Respond with ONLY valid JSON. No prose, no markdown fences, no explanation before or after.",
    },
  ];

  const raw = await chatComplete(jsonMessages, opts);
  try {
    return JSON.parse(extractJsonBlock(raw)) as T;
  } catch {
    const repair = await chatComplete(
      [
        ...jsonMessages,
        { role: "assistant", content: raw },
        {
          role: "user",
          content:
            "That was not valid JSON. Return ONLY the corrected, valid JSON object/array and nothing else.",
        },
      ],
      opts,
    );
    return JSON.parse(extractJsonBlock(repair)) as T;
  }
}
