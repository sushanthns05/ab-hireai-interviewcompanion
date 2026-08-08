import { z } from "zod";
import type { Candidate, InterviewApiResponse, DebugState } from "./types";
import { createLLMClient, LLMError } from "./llm.server";
import { getSession, saveSession, deleteSession } from "./sessions.server";
import { startInterview, continueInterview } from "./engine.server";

const candidateSchema = z.object({
  member: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    jobRole: z.string().min(1),
    yearsExperience: z.number().min(0),
    education: z.string().default(""),
    status: z.string().default("COMPLETED"),
  }),
  missions: z
    .array(
      z.object({
        day: z.number().int().min(1).max(31),
        title: z.string().default(""),
        passed: z.boolean().optional(),
        skipped: z.boolean().optional(),
        attempts: z.number().int().min(0).optional(),
      }),
    )
    .default([]),
  signals: z
    .object({
      commitDays: z.number().default(0),
      missionsCompleted: z.number().default(0),
      missionsFirstTry: z.number().default(0),
    })
    .default({ commitDays: 0, missionsCompleted: 0, missionsFirstTry: 0 }),
});

const requestSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
  candidate: candidateSchema.optional(),
  message: z.string().optional(),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function fail(message: string, status: number) {
  return json({ error: message, reply: message, done: false }, status);
}

export async function handleInterviewRequest(request: Request): Promise<Response> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail("Request body must be valid JSON.", 400);
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path.join(".");
    return fail(
      issue ? `Invalid request payload${field ? ` at "${field}"` : ""}: ${issue.message}` : "Invalid request payload.",
      400,
    );
  }

  const { sessionId, candidate, message } = parsed.data;

  let llm;
  try {
    llm = createLLMClient();
  } catch (e) {
    return fail(e instanceof LLMError ? e.message : "AI provider unavailable.", 503);
  }

  try {
    const existing = getSession(sessionId);

    if (!existing) {
      if (!candidate) {
        return fail(
          "Unknown sessionId. Send a candidate object with the first request to start an interview.",
          404,
        );
      }
      const { session, reply } = await startInterview(llm, sessionId, candidate as Candidate);
      saveSession(session);
      const body: InterviewApiResponse = { reply, done: false };
      return json(body);
    }

    if (existing.completed) {
      const body: InterviewApiResponse = {
        reply: "Interview completed.",
        done: true,
        ...(existing.feedback ? { feedback: existing.feedback } : {}),
      };
      return json(body);
    }

    if (candidate && !message) {
      // Re-sent start request for a live session: replay the current question.
      const body: InterviewApiResponse = {
        reply: existing.lastQuestion ?? "Let's continue.",
        done: false,
      };
      return json(body);
    }

    if (!message || !message.trim()) {
      const body: InterviewApiResponse = {
        reply:
          "I didn't catch an answer there. Take your time and walk me through your thinking on the last question.",
        done: false,
      };
      return json(body);
    }

    const result = await continueInterview(llm, existing, message.trim().slice(0, 8000));
    saveSession(existing);
    const body: InterviewApiResponse = {
      reply: result.reply,
      done: result.done,
      ...(result.feedback ? { feedback: result.feedback } : {}),
    };
    return json(body);
  } catch (error) {
    if (error instanceof LLMError) return fail(error.message, error.status);
    console.error("interview_error", error);
    return fail("The interview service hit an unexpected error. Please resend your answer.", 500);
  }
}

/** Non-sensitive session state for the demo debug panel. */
export function handleDebugRequest(request: Request): Response {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) return json({ error: "sessionId query parameter is required." }, 400);

  const session = getSession(sessionId);
  if (!session) return json({ error: "Session not found." }, 404);

  const last = session.questionHistory[session.questionHistory.length - 1];
  const state: DebugState = {
    sessionId: session.sessionId,
    interviewPhase: session.interviewPhase,
    questionCount: session.questionCount,
    targetQuestions: session.targetQuestions,
    difficultyLevel: session.difficultyLevel,
    ...(session.currentDay !== undefined ? { currentDay: session.currentDay } : {}),
    coveredDays: session.coveredDays,
    coveredModules: session.coveredModules,
    followUpCount: session.followUpCount,
    completed: session.completed,
    ...(last ? { lastAction: String(last.action), lastReason: last.reason } : {}),
  };
  return json(state);
}

export function handleResetRequest(request: Request): Response {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  if (sessionId) deleteSession(sessionId);
  return json({ ok: true });
}
