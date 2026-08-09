import type { LLMClient, LLMMessage } from "@/lib/interview/llm.server";

export type AnswerQuality = "weak" | "partial" | "strong";

/**
 * Deterministic stand-in for the LLM provider so the interview engine can be
 * tested without network access. It mirrors the three JSON contracts the engine
 * relies on (question, evaluation, feedback).
 */
export function createMockLLM(quality: AnswerQuality = "strong") {
  const prompts: string[] = [];
  let questionNo = 0;

  const scores =
    quality === "strong"
      ? { technicalCorrectness: 5, conceptualDepth: 4, practicalUnderstanding: 5, reasoning: 4 }
      : quality === "partial"
        ? { technicalCorrectness: 3, conceptualDepth: 3, practicalUnderstanding: 3, reasoning: 3 }
        : { technicalCorrectness: 1, conceptualDepth: 1, practicalUnderstanding: 1, reasoning: 1 };

  const client: LLMClient = {
    async generate(messages: LLMMessage[]) {
      prompts.push(messages.map((m) => m.content).join("\n"));
      return "ok";
    },
    async structuredGenerate<T>(messages: LLMMessage[]) {
      const text = messages.map((m) => m.content).join("\n");
      prompts.push(text);

      if (text.includes('"transition"')) {
        questionNo += 1;
        const day = /Day (\d+) — /.exec(text)?.[1] ?? "?";
        return {
          transition: questionNo === 1 ? "Welcome." : "Noted.",
          question: `Question ${questionNo} about day ${day}?`,
          reason: `Probing day ${day} based on the candidate profile.`,
        } as T;
      }

      if (text.includes("recommendedAction")) {
        return {
          ...scores,
          communication: 4,
          confidence: 3,
          correctConcepts: ["retrieval basics"],
          missingConcepts: quality === "strong" ? [] : ["evaluation of retrieval quality"],
          incorrectConcepts: [],
          strengths: ["explained the mechanism clearly"],
          gaps: quality === "strong" ? [] : ["no failure analysis"],
          recommendedAction: quality === "strong" ? "INCREASE_DIFFICULTY" : "CLARIFY",
        } as T;
      }

      return {
        summary: "Solid applied understanding with uneven depth in production topics.",
        strengths: ["Explained retrieval mechanics with specifics."],
        gaps: ["Could not describe systematic retrieval evaluation."],
        next: ["Revisit Day 10 — The Retrieval & Matching Engine."],
      } as T;
    },
  };

  return {
    client,
    prompts,
    get questionCount() {
      return questionNo;
    },
  };
}
