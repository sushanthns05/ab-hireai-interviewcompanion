import { createFileRoute } from "@tanstack/react-router";
import { createLLMClient } from "@/lib/interview/llm.server";
import { z } from "zod";

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })),
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

        const { messages, persona } = parsed.data;

        try {
          const llm = createLLMClient();
          
          const transcript = messages.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n\n');

          const llmMessages = [
            {
              role: "system" as const,
              content: `You are an AI interviewer acting as a ${persona}. The candidate has just completed a mock interview. Here is the transcript:

${transcript}

Evaluate their overall performance across the interview. Provide a score out of 100 based on technical accuracy, clarity, depth, and how well they handled the questions.
Provide a "strongerAnswer" which summarizes the key areas they should focus on improving, or provides an idealized version of how they could have approached the interview's main topics.
Provide 4 short "fragments" of text (under 8 words each) that represent your "thinking process" while evaluating, like ["Reviewing interview transcript...", "Analyzing core competencies...", "Identifying areas for improvement...", "Finalizing overall score..."]. 


Respond ONLY with JSON matching this shape:
{
  "score": 85,
  "strongerAnswer": "string",
  "fragments": ["string", "string", "string", "string"]
}`
            }
          ];

          const result = await llm.structuredGenerate<{ score: number, strongerAnswer: string, fragments: string[] }>(llmMessages, { temperature: 0.3 });
          
          return json(result);
        } catch (error: any) {
          console.error("Evaluation error", error);
          return json({ error: error.message || "Failed to evaluate" }, 500);
        }
      },
    },
  },
});
