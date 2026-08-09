/**
 * Provider-agnostic LLM client.
 *
 * Configuration comes from environment variables so the provider can be swapped
 * without touching the interview engine:
 *   LLM_BASE_URL  (default: Lovable AI Gateway)
 *   LLM_MODEL     (default: google/gemini-3.6-flash)
 *   LLM_API_KEY   (falls back to LOVABLE_API_KEY)
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMClient {
  generate(messages: LLMMessage[], opts?: { temperature?: number }): Promise<string>;
  structuredGenerate<T>(messages: LLMMessage[], opts?: { temperature?: number }): Promise<T>;
}

/** Answers shorter than this are not meaningful interview attempts. */
export const MIN_ANSWER_LENGTH = 5;

export class LLMError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

const DEFAULT_BASE_URL = "https://ai.gateway.lovable.dev/v1";
const DEFAULT_MODEL = "google/gemini-3.6-flash";

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.search(/[[{]/);
    const end = Math.max(raw.lastIndexOf("}"), raw.lastIndexOf("]"));
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new LLMError("The AI response could not be parsed.");
  }
}

export function createLLMClient(): LLMClient {
  const baseUrl = process.env["LLM_BASE_URL"] || DEFAULT_BASE_URL;
  const model = process.env["LLM_MODEL"] || DEFAULT_MODEL;
  const explicitKey = process.env["LLM_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const apiKey = explicitKey || lovableKey;

  if (!apiKey) {
    throw new LLMError("AI provider is not configured.", 503);
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (explicitKey) headers["Authorization"] = `Bearer ${explicitKey}`;
  else headers["Lovable-API-Key"] = lovableKey as string;

  async function call(messages: LLMMessage[], temperature: number, json: boolean): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    let res: Response;
    try {
      res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model,
          temperature,
          messages,
          ...(json ? { response_format: { type: "json_object" } } : {}),
        }),
      });
    } catch {
      throw new LLMError("The AI provider did not respond in time.", 504);
    } finally {
      clearTimeout(timeout);
    }

    if (res.status === 429) throw new LLMError("AI rate limit reached. Please retry shortly.", 429);
    if (res.status === 402) throw new LLMError("AI credits exhausted for this workspace.", 402);
    if (!res.ok) {
      const errText = await res.text().catch(() => "could not read error text");
      console.error("[LLM ERROR] Status:", res.status, "Body:", errText);
      throw new LLMError(`The AI provider returned an error: ${res.status} ${errText}`, 502);
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new LLMError("The AI provider returned an empty response.");
    return content;
  }

  return {
    async generate(messages, opts) {
      return (await call(messages, opts?.temperature ?? 0.7, false)).trim();
    },
    async structuredGenerate<T>(messages: LLMMessage[], opts?: { temperature?: number }) {
      const text = await call(messages, opts?.temperature ?? 0.2, true);
      return extractJson(text) as T;
    },
  };
}
