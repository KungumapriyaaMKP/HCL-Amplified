const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class LlmError extends Error {}

/**
 * Calls Claude via OpenRouter's OpenAI-compatible Chat Completions API.
 * This is the single choke point for every Claude call in the app
 * (onboarding extraction, question generation, rationale/report writing,
 * the assistant chat) - see lib/prompts.ts for the actual prompts.
 */
export async function chatComplete(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new LlmError("OPENROUTER_API_KEY is not set");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
