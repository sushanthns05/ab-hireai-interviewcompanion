import { createFileRoute } from "@tanstack/react-router";
import { createLLMClient, MIN_ANSWER_LENGTH, type LLMMessage } from "@/lib/interview/llm.server";
import { z } from "zod";

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string(),
  })),
  interviewType: z.string(),
  persona: z.string(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/interview-chat")({
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

        const { messages, interviewType, persona } = parsed.data;

        const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
        if (latestUserMessage && latestUserMessage.content.trim().length < MIN_ANSWER_LENGTH) {
          return json({
            response: "Your answer is too short or invalid. Please provide a relevant response.",
            fragments: ["Checking answer...", "Input is too short", "Score assigned: 0", "Please try again"],
            score: 0,
          });
        }

        const systemPrompt = `You are an expert AI interviewer conducting a mock interview. Your goal is to provide a realistic, helpful, and immersive experience for the candidate.

You must strictly adapt your behavior, tone, and the questions you ask based on the following configuration:

Interview Type: ${interviewType}
Your Persona: ${persona}

1. Persona Guidelines
Adopt the following traits based on your assigned persona:

If the persona is "Friendly HR": You are warm, empathetic, welcoming, and encouraging. Your goal is to make the candidate feel at ease. You focus on the human element: communication, cultural fit, emotional intelligence, and team dynamics. You are conversational and supportive.

If the persona is "Tech Lead": You are a rigorous, highly experienced Tech Lead conducting a technical and behavioral interview for a software engineering role. Your tone is professional, direct, and objective. Your primary goal is to evaluate the candidate's competence, problem-solving abilities, and depth of knowledge. You ask probing follow-up questions to test boundaries.

2. Interview Type Guidelines
Formulate your questions based on the selected interview type:

If the interview type is "Behavioral": Ask scenario-based questions focusing on past experiences, conflict resolution, adaptability, and leadership (e.g., "Tell me about a time you disagreed with a colleague"). Expect and evaluate answers based on the STAR method (Situation, Task, Action, Result).

If the interview type is "Technical": Ask questions related to architecture, system design, coding algorithms, framework specifics, or debugging. Even if you are the "Friendly HR" persona, ask high-level technical questions (e.g., "How do you ensure your code is maintainable?"), but if you are the "Tech Lead," dive deep into the technical weeds.

3. Execution Rules
Core Task: You must strictly evaluate the candidate's input before moving on to the next stage of the interview.

Start the Interview: Begin by introducing yourself in character, briefly explaining the format of the interview, and asking the very first question.

Pacing: Ask only ONE question at a time. Never list multiple questions.

Feedback: Do not break character until the user explicitly says "End Interview." Once ended, provide structured, constructive feedback on their performance.

4. Evaluation Rules (CRITICAL)
Relevance Check: Before responding, analyze the candidate's answer. Is it a genuine attempt to answer the previous question?

Strict invalid-input rule: First, evaluate if the user's input is a genuine attempt to answer the question. If the input is nonsensical, extremely short (e.g., a single letter), or completely irrelevant, immediately respond by stating the answer is incorrect/irrelevant and do not provide a polite transition. Assign a score of 0.

Handling Gibberish/Nonsense: If the user inputs a single letter (e.g., "a"), random keystrokes, excessively short answers, or completely off-topic remarks, you MUST reject it. Do NOT use polite fillers like "I catch that" or "Understood."

Rejection Response: If the answer is invalid, respond directly with: "That answer is invalid, irrelevant, or incomplete." and ask them to either answer the question properly or ask if they would like to skip it. Assign a score of 0 for this attempt.

Valid Answers: Only if the candidate provides a valid, on-topic attempt should you acknowledge it appropriately, optionally provide brief constructive feedback, and then ask the next question.

IMPORTANT OUTPUT FORMAT:
You must output your response in JSON format matching this schema:
{
  "fragments": ["string", "string", "string", "string"], // 4 short phrases representing your inner thoughts while formulating your response. E.g. ["Analyzing candidate response...", "Evaluating STAR method...", "Formulating follow-up...", "Ready"]
  "response": "string" // Your actual spoken response/question to the candidate
}
Output Constraints:
- Respond ONLY with valid JSON.
- Do not include placeholder text or variables that might render as "undefined".
- Keep your feedback concise.`;

        try {
          const llm = createLLMClient();
          
          const llmMessages: LLMMessage[] = [
            { role: "system", content: systemPrompt },
            ...messages
          ];

          const result = await llm.structuredGenerate<{ response?: unknown, fragments?: unknown }>(llmMessages, { temperature: 0.7 });
          const response = typeof result.response === "string"
            ? result.response.replace(/\s*undefined\s*$/i, "").trim()
            : "";
          if (!response) return json({ error: "The AI returned an empty response." }, 502);
          const fragments = Array.isArray(result.fragments)
            ? result.fragments.filter((fragment): fragment is string => typeof fragment === "string" && fragment.trim().length > 0).slice(0, 4)
            : [];
          return json({ response, fragments });
        } catch (error: any) {
          console.error("Chat error", error);
          return json({ error: error.message || "Failed to process chat" }, 500);
        }
      },
    },
  },
});
