import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { CandidateSelector } from "@/components/interview/CandidateSelector";
import { InterviewRoom } from "@/components/interview/InterviewRoom";
import { FeedbackReport } from "@/components/interview/FeedbackReport";
import type {
  Candidate,
  ChatMessage,
  DebugState,
  InterviewApiResponse,
  InterviewFeedback,
} from "@/lib/interview/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Live Interview — ABInterviewIQ" },
      {
        name: "description",
        content:
          "Adaptive AI technical interviewer for ABTalks cohort graduates: personalized questions, live follow-ups and structured feedback.",
      },
      { property: "og:title", content: "Live Interview — ABInterviewIQ" },
      {
        property: "og:description",
        content:
          "Adaptive AI technical interviewer for ABTalks cohort graduates: personalized questions, live follow-ups and structured feedback.",
      },
    ],
  }),
  component: InterviewApp,
});

function newSessionId() {
  return globalThis.crypto?.randomUUID?.() ?? `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function InterviewApp() {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [debug, setDebug] = useState<DebugState | null>(null);
  const [terminated, setTerminated] = useState(false);

  const refreshDebug = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/interview?sessionId=${encodeURIComponent(id)}`);
      if (res.ok) setDebug((await res.json()) as DebugState);
    } catch {
      /* debug panel is best-effort */
    }
  }, []);

  useEffect(() => {
    if (sessionId && !thinking) void refreshDebug(sessionId);
  }, [sessionId, thinking, messages.length, refreshDebug]);

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as InterviewApiResponse & { error?: string };
    if (!res.ok) throw new Error(data.error ?? "The interview service is unavailable.");
    return data;
  }

  async function startInterview(c: Candidate) {
    const id = newSessionId();
    setThinking(true);
    
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request failed:", err);
    }

    try {
      const data = await post({ sessionId: id, candidate: c });
      setCandidate(c);
      setSessionId(id);
      setMessages([{ role: "interviewer", content: data.reply, at: Date.now() }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start the interview.");
    } finally {
      setThinking(false);
    }
  }

  async function send(text: string) {
    if (!sessionId) return;
    setMessages((m) => [...m, { role: "candidate", content: text, at: Date.now() }]);
    setThinking(true);
    try {
      const data = await post({ sessionId, message: text });
      setMessages((m) => [...m, { role: "interviewer", content: data.reply, at: Date.now() }]);
      if (data.done && data.feedback) setFeedback(data.feedback);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong. Try resending your answer.");
    } finally {
      setThinking(false);
    }
  }

  function reset() {
    if (sessionId) {
      void fetch(`/api/interview-reset?sessionId=${encodeURIComponent(sessionId)}`, { method: "POST" });
    }
    setCandidate(null);
    setSessionId(null);
    setMessages([]);
    setFeedback(null);
    setDebug(null);
    setTerminated(false);
  }

  async function endEarly() {
    if (!sessionId) return;
    setThinking(true);
    try {
      const data = await post({ sessionId, forceEnd: true });
      setMessages((m) => [...m, { role: "interviewer", content: data.reply, at: Date.now() }]);
      if (data.done && data.feedback) setFeedback(data.feedback);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not end the interview early.");
    } finally {
      setThinking(false);
    }
  }

  const terminateInterview = () => {
    setTerminated(true);
    void endEarly();
  };

  const questionCount = debug?.questionCount ?? messages.filter((m) => m.role === "interviewer").length;
  const targetQuestions = debug?.targetQuestions ?? 10;
  const topicsCovered = debug?.coveredDays.length ?? 0;

  return (
    <main className="min-h-screen">
      <Toaster />
      <header className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-primary">ABTalks</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">
          The <span className="text-gradient">Interview Agent</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          An adaptive technical interviewer for the 31-day Enterprise AI Engineering cohort. It reads the
          candidate&apos;s mission history, chooses curriculum topics with intent, and follows up on what
          they actually say.
        </p>
      </header>

      {!candidate && <CandidateSelector onStart={startInterview} starting={thinking} />}

      {candidate && !feedback && (
        <InterviewRoom
          candidate={candidate}
          messages={messages}
          questionCount={questionCount}
          targetQuestions={targetQuestions}
          topicsCovered={topicsCovered}
          thinking={thinking}
          done={false}
          debug={debug}
          onSend={send}
          onReset={reset}
          onEndEarly={endEarly}
          onTerminate={terminateInterview}
        />
      )}

      {candidate && feedback && (
        <FeedbackReport
          candidate={candidate}
          feedback={feedback}
          questionCount={questionCount}
          topicsCovered={topicsCovered}
          onReset={reset}
          terminated={terminated}
        />
      )}
    </main>
  );
}
