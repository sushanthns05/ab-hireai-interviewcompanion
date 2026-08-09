import { createFileRoute } from "@tanstack/react-router";
import { createLLMClient } from "@/lib/interview/llm.server";
import { z } from "zod";

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
  persona: z.string(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isInvalidAnswer(content: string): boolean {
  const answer = content.trim().toLowerCase();
  if (answer.length < 5) return true;

  // Reject repeated-character noise such as "jjj", "aaaa", or "!!!!!!".
  const meaningful = answer.replace(/[^a-z0-9]/g, "");
  return meaningful.length > 0 && new Set(meaningful).size === 1;
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
        const candidateAnswers = messages
          .filter((message) => message.role === "user")
          .map((message) => message.content.trim());
        const invalidAnswers = candidateAnswers.filter(isInvalidAnswer);

        // Do not let the model turn a transcript made entirely of nonsense into
        // a non-zero report score. This is also provider-independent.
        if (candidateAnswers.length > 0 && invalidAnswers.length === candidateAnswers.length) {
          return json({
            score: 0,
            strongerAnswer:
              "Your responses were too short or invalid to evaluate. Please provide relevant answers to each question.",
            fragments: [
              "Checking responses...",
              "Invalid answers detected",
              "Score assigned: 0",
              "Try again with details",
            ],
          });
        }

        try {
          const llm = createLLMClient();

          const transcript = messages
            .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
            .join("\n\n");

          const llmMessages = [
            {
              role: "system" as const,
              content: `You are an AI interviewer acting as a ${persona}. The candidate has just completed a mock interview. Here is the transcript:

${transcript}

Evaluate their overall performance across the interview. Provide a score out of 100 based on technical accuracy, clarity, depth, and how well they handled the questions.
First, evaluate whether each candidate response is a genuine attempt to answer the interviewer question. Treat nonsensical input, repeated-character noise (such as "jjj"), answers shorter than 5 characters, and completely irrelevant responses as incorrect. Assign 0 for that answer and do not reward it with a polite transition or partial credit. If all candidate responses are invalid, the overall score MUST be 0.
Provide a "strongerAnswer" which summarizes the key areas they should focus on improving, or provides an idealized version of how they could have approached the interview's main topics.
Provide 4 short "fragments" of text (under 8 words each) that represent your "thinking process" while evaluating, like ["Reviewing interview transcript...", "Analyzing core competencies...", "Identifying areas for improvement...", "Finalizing overall score..."]. 


Respond ONLY with JSON matching this shape:
{
  "score": 85,
  "strongerAnswer": "string",
  "fragments": ["string", "string", "string", "string"]
}`,
            },
          ];

          const result = await llm.structuredGenerate<{
            score: number;
            strongerAnswer: string;
            fragments: string[];
          }>(llmMessages, { temperature: 0.3 });

          return json(result);
        } catch (error: any) {
          console.error("Evaluation error", error);
          return json({ error: error.message || "Failed to evaluate" }, 500);
        }
      },
    },
  },
});
