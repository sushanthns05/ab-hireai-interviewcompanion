import { describe, it, expect, beforeEach } from "vitest";
import candidatesData from "@/data/candidates.json";
import type { Candidate, InterviewFeedback } from "@/lib/interview/types";
import { startInterview, continueInterview, interviewLimits } from "@/lib/interview/engine.server";
import { analyzeCandidate } from "@/lib/interview/analyzer";
import { getSession, deleteSession } from "@/lib/interview/sessions.server";
import { handleInterviewRequest } from "@/lib/interview/handler.server";
import { createMockLLM, type AnswerQuality } from "./mock-llm";

const candidates = (candidatesData as { candidates: Candidate[] }).candidates;
const byId = (id: string) => candidates.find((c) => c.member.id === id)!;

async function runFullInterview(candidate: Candidate, quality: AnswerQuality = "strong") {
  const { client } = createMockLLM(quality);
  const sessionId = `test-${candidate.member.id}-${quality}`;
  const { session, reply } = await startInterview(client, sessionId, candidate);
  const replies = [reply];
  let feedback: InterviewFeedback | undefined;

  for (let i = 0; i < 20; i++) {
    const res = await continueInterview(client, session, `Answer ${i} with concrete details.`);
    replies.push(res.reply);
    if (res.done) {
      feedback = res.feedback!;
      break;
    }
  }
  return { session, replies, feedback };
}

describe("interview engine", () => {
  it("asks at least 8 questions and covers at least 4 curriculum days", async () => {
    const { session, feedback } = await runFullInterview(byId("CAND-003"));
    expect(session.questionCount).toBeGreaterThanOrEqual(interviewLimits.MIN_QUESTIONS);
    expect(session.questionCount).toBeLessThanOrEqual(interviewLimits.MAX_QUESTIONS);
    expect(new Set(session.coveredDays).size).toBeGreaterThanOrEqual(interviewLimits.MIN_DAYS);
    expect(feedback).toBeDefined();
  });

  it("returns the mandatory feedback schema", async () => {
    const { feedback } = await runFullInterview(byId("CAND-001"));
    expect(typeof feedback!.summary).toBe("string");
    expect(Array.isArray(feedback!.strengths)).toBe(true);
    expect(Array.isArray(feedback!.gaps)).toBe(true);
    expect(Array.isArray(feedback!.next)).toBe(true);
    expect(feedback!.next.length).toBeGreaterThan(0);
  });

  it("records every question with a reason, day and evaluation", async () => {
    const { session } = await runFullInterview(byId("CAND-005"));
    for (const q of session.questionHistory) {
      expect(q.curriculumDay).toBeGreaterThan(0);
      expect(q.reason.length).toBeGreaterThan(0);
      expect(q.topic.length).toBeGreaterThan(0);
    }
    // Every answered question is scored.
    expect(session.questionHistory.filter((q) => q.evaluation).length).toBeGreaterThanOrEqual(
      session.questionCount - 1,
    );
  });

  it("maintains conversation context across turns", async () => {
    const { client, prompts } = createMockLLM("partial");
    const { session } = await startInterview(client, "ctx-1", byId("CAND-002"));
    await continueInterview(client, session, "My answer mentions reciprocal rank fusion.");
    await continueInterview(client, session, "Second answer.");
    expect(session.conversationHistory.length).toBeGreaterThanOrEqual(5);
    expect(prompts.some((p) => p.includes("reciprocal rank fusion"))).toBe(true);
  });

  it("increases difficulty on strong answers and decreases it on weak ones", async () => {
    const strong = await runFullInterview(byId("CAND-018"), "strong");
    const weak = await runFullInterview(byId("CAND-018"), "weak");
    expect(strong.session.difficultyLevel).toBeGreaterThan(weak.session.difficultyLevel);
  });

  it("follows up on the same topic before changing subject", async () => {
    const { client } = createMockLLM("partial");
    const { session } = await startInterview(client, "followup-1", byId("CAND-003"));
    const firstDay = session.currentDay;
    await continueInterview(client, session, "A vague answer.");
    expect(session.currentDay).toBe(firstDay);
    expect(session.followUpCount).toBeGreaterThan(0);
  });
});

describe("candidate personalization", () => {
  it("never plans a question on a skipped curriculum day first", () => {
    for (const c of candidates) {
      const a = analyzeCandidate(c);
      expect(a.skippedDays).not.toContain(a.plannedDays[0]);
    }
  });

  it("weights topics by role", () => {
    const devops = analyzeCandidate(byId("CAND-005")); // DevOps Engineer
    const dataEng = analyzeCandidate(byId("CAND-001")); // Senior Data Engineer
    expect(devops.roleFocus.join(" ")).toMatch(/Kubernetes|observability/i);
    expect(dataEng.roleFocus.join(" ")).toMatch(/embeddings|retrieval/i);
    expect(devops.plannedDays).not.toEqual(dataEng.plannedDays);
  });

  it("scales difficulty by seniority", () => {
    const intern = analyzeCandidate(byId("CAND-007")); // Computer Science Intern
    const principal = analyzeCandidate(byId("CAND-015")); // Principal Architect
    expect(intern.seniority).toBe("junior");
    expect(principal.seniority).toBe("principal");
    expect(principal.baseDifficulty).toBeGreaterThan(intern.baseDifficulty);
  });

  it("flags failed missions and high-attempt passes as probing areas", () => {
    const failing = analyzeCandidate(byId("CAND-010")); // multiple failed missions
    expect(failing.failedDays.length).toBeGreaterThan(0);
    expect(failing.notes.join(" ")).toMatch(/Failed days/);
    const struggler = analyzeCandidate(byId("CAND-017")); // junior, everything at 5 attempts
    expect(struggler.highEffortDays.length).toBeGreaterThan(0);
  });

  it("gives different candidates different interview plans", () => {
    const plans = candidates.map((c) => analyzeCandidate(c).plannedDays.join("-"));
    expect(new Set(plans).size).toBeGreaterThan(candidates.length / 2);
  });
});

describe("POST /api/interview contract", () => {
  beforeEach(() => {
    process.env["LLM_API_KEY"] = "test-key";
  });

  const post = (body: unknown) =>
    handleInterviewRequest(
      new Request("http://localhost/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );

  it("rejects a payload without sessionId", async () => {
    const res = await post({ message: "hello" });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/sessionId/i);
    expect(JSON.stringify(body)).not.toMatch(/at .*\.ts:/); // no stack traces
  });

  it("rejects an unknown sessionId with no candidate", async () => {
    deleteSession("does-not-exist");
    const res = await post({ sessionId: "does-not-exist", message: "hi" });
    expect(res.status).toBe(404);
  });

  it("rejects malformed candidate objects", async () => {
    const res = await post({ sessionId: "bad-candidate", candidate: { member: { id: "x" } } });
    expect(res.status).toBe(400);
  });

  it("keeps one session per sessionId across requests", async () => {
    const { client } = createMockLLM("strong");
    const { session } = await startInterview(client, "shared-session", byId("CAND-009"));
    expect(getSession("shared-session")).toBeUndefined();
    // sessions are persisted by the request handler; simulate that here
    const { saveSession } = await import("@/lib/interview/sessions.server");
    saveSession(session);
    expect(getSession("shared-session")?.questionCount).toBe(1);
    deleteSession("shared-session");
  });
});
