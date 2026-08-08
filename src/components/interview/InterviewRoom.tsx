import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, Bug, Loader2, Mic } from "lucide-react";
import type { Candidate, ChatMessage, DebugState } from "@/lib/interview/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  candidate: Candidate;
  messages: ChatMessage[];
  questionCount: number;
  targetQuestions: number;
  topicsCovered: number;
  thinking: boolean;
  done: boolean;
  debug: DebugState | null;
  onSend: (text: string) => void;
  onReset: () => void;
}

export function InterviewRoom({
  candidate,
  messages,
  questionCount,
  targetQuestions,
  topicsCovered,
  thinking,
  done,
  debug,
  onSend,
  onReset,
}: Props) {
  const [value, setValue] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseValueRef = useRef("");

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    baseValueRef.current = value + (value && !value.endsWith(" ") ? " " : "");
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        baseValueRef.current += finalTranscript;
      }

      setValue(baseValueRef.current + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, thinking]);

  const submit = () => {
    const text = value.trim();
    if (!text || thinking || done) return;
    setValue("");
    onSend(text);
  };

  const pct = Math.min(100, Math.round((questionCount / Math.max(targetQuestions, 1)) * 100));

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-16 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-4">
        <div className="panel p-5">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Candidate</p>
          <h2 className="mt-1 text-lg font-semibold">{candidate.member.name}</h2>
          <p className="text-sm text-muted-foreground">{candidate.member.jobRole}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {candidate.member.yearsExperience} yrs · {candidate.member.education}
          </p>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-widest text-muted-foreground">Progress</span>
              <span className="font-mono">
                {questionCount} / {targetQuestions}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-none bg-secondary">
              <div
                className="h-full rounded-none transition-all duration-500"
                style={{ width: `${pct}%`, backgroundImage: "var(--gradient-line)" }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Topics covered: {topicsCovered}</p>
          </div>

          <Button variant="outline" size="sm" className="mt-5 w-full" onClick={onReset}>
            <RotateCcw className="mr-2 size-3.5" />
            Reset interview
          </Button>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <Label htmlFor="debug-toggle" className="flex items-center gap-2 text-sm">
              <Bug className="size-4" />
              Developer panel
            </Label>
            <Switch id="debug-toggle" checked={showDebug} onCheckedChange={setShowDebug} />
          </div>
          {showDebug && (
            <dl className="mt-4 space-y-2 font-mono text-xs">
              {debug ? (
                <>
                  <Row label="phase" value={debug.interviewPhase} />
                  <Row label="question" value={`${debug.questionCount}/${debug.targetQuestions}`} />
                  <Row label="difficulty" value={String(debug.difficultyLevel)} />
                  <Row label="curriculum day" value={debug.currentDay ? `Day ${debug.currentDay}` : "—"} />
                  <Row label="covered days" value={debug.coveredDays.join(", ") || "—"} />
                  <Row label="modules" value={debug.coveredModules.join(", ") || "—"} />
                  <Row label="follow-ups" value={String(debug.followUpCount)} />
                  <Row label="last move" value={debug.lastAction ?? "—"} />
                  {debug.lastReason && (
                    <p className="pt-2 text-[11px] leading-relaxed text-muted-foreground">
                      Reason: {debug.lastReason}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">No state yet.</p>
              )}
            </dl>
          )}
        </div>
      </aside>

      <section className="panel flex min-h-[70vh] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="text-sm font-medium">Live technical interview</span>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {done ? "COMPLETE" : "IN PROGRESS"}
          </Badge>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.map((m, i) => (
            <article
              key={i}
              className={`max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                m.role === "candidate" ? "ml-auto" : ""
              }`}
            >
              <p
                className={`mb-1 text-[10px] font-semibold uppercase tracking-widest ${
                  m.role === "interviewer" ? "text-primary" : "text-accent"
                }`}
              >
                {m.role === "interviewer" ? "Interviewer" : "Candidate"}
              </p>
              <div
                className={`whitespace-pre-wrap rounded-none px-4 py-3 text-sm leading-relaxed ${
                  m.role === "interviewer"
                    ? "bg-surface-raised border border-border"
                    : "bg-primary/10 border border-primary shadow-[0_0_15px_oklch(0.79_0.18_184.11/0.15)]"
                }`}
              >
                {m.content}
              </div>
            </article>
          ))}
          {thinking && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Interviewer is considering your answer…
            </p>
          )}
          <div ref={endRef} />
        </div>

        {!done && (
          <div className="border-t border-border p-4">
            <div className="flex items-end gap-3">
              <div className="relative flex-1">
                <Textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
                  }}
                  placeholder={isRecording ? "Listening..." : "Type your answer… (⌘/Ctrl + Enter to send)"}
                  className={`min-h-21 resize-none rounded-none focus-visible:border-primary focus-visible:ring-0 focus-visible:shadow-(--shadow-glow) bg-background/50 ${isRecording ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                  aria-label="Your answer"
                  disabled={thinking}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={toggleRecording} 
                  variant="outline" 
                  size="lg" 
                  disabled={thinking}
                  className={`rounded-none transition-all ${isRecording ? 'bg-red-500/10 text-red-500 border-red-500 animate-pulse' : 'hover:text-primary hover:border-primary'}`}
                  title="Answer with Voice"
                >
                  <Mic className="size-4" />
                </Button>
                <Button onClick={submit} disabled={thinking || !value.trim()} size="lg" className="rounded-none shadow-(--shadow-glow)">
                  <Send className="size-4" />
                  <span className="sr-only">Send answer</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right">{value}</dd>
    </div>
  );
}
