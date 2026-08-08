import { createFileRoute } from "@tanstack/react-router";
import { createLLMClient } from "@/lib/interview/llm.server";
import { z } from "zod";

const requestSchema = z.object({
  question: z.string(),
  answer: z.string(),
  persona: z.string(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/evaluate-answer")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload;
        try {
          payload = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }

        const parsed = requestSchema.safeParse(payload);
        if (!parsed.success) return json({ error: "Invalid payload" }, 400);

        const { question, answer, persona } = parsed.data;

        try {
          const llm = createLLMClient();
          const messages = [
            {
              role: "system" as const,
              content: `You are an AI interviewer acting as a ${persona}. The candidate just answered this technical question:
"${question}"

Their answer was:
"${answer}"

Evaluate their answer. Provide a score out of 100 based on technical accuracy, clarity, and depth.
Provide a "strongerAnswer" which is an idealized, professional version of what they could have said.
Provide 4 short "fragments" of text (under 8 words each) that represent your "thinking process" while evaluating, like ["Transcribing audio...", "Checking for STAR method...", "Analyzing technical depth...", "Finalizing score..."]. 

Respond ONLY with JSON matching this shape:
{
  "score": 85,
  "strongerAnswer": "string",
  "fragments": ["string", "string", "string", "string"]
}`
            }
          ];

          const result = await llm.structuredGenerate<{ score: number, strongerAnswer: string, fragments: string[] }>(messages, { temperature: 0.3 });
          
          return json(result);
        } catch (error: any) {
          console.error("Evaluation error", error);
          return json({ error: error.message || "Failed to evaluate" }, 500);
        }
      },
    },
  },
});
