import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, Bug, Loader2, Mic, StopCircle, AlertCircle } from "lucide-react";
import type { Candidate, ChatMessage, DebugState } from "@/lib/interview/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { StreamingMessage } from "./StreamingMessage";

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
  onEndEarly: () => void;
  onTerminate: () => void;
}

const mergeText = (existing: string, addition: string) => {
  if (!existing.trim()) return addition;
  if (!addition.trim()) return existing;

  const existingWords = existing.trim().split(/\s+/);
  const additionWords = addition.trim().split(/\s+/);

  let maxOverlap = 0;
  for (let i = 1; i <= Math.min(existingWords.length, additionWords.length); i++) {
    const endExisting = existingWords.slice(-i).join(" ").toLowerCase().replace(/[.,?!]/g, '');
    const startAddition = additionWords.slice(0, i).join(" ").toLowerCase().replace(/[.,?!]/g, '');
    
    if (endExisting === startAddition) {
      maxOverlap = i;
    }
  }

  if (maxOverlap > 0) {
    const remainingAddition = additionWords.slice(maxOverlap).join(" ");
    return remainingAddition ? existing.trim() + " " + remainingAddition : existing.trim();
  }

  return existing.trim() + " " + additionWords.join(" ");
};

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
  onEndEarly,
  onTerminate,
}: Props) {
  const [value, setValue] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseValueRef = useRef("");

  const [violations, setViolations] = useState(0);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!done) {
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        }
      } catch(e) {}
    }
  }, [done]);

  useEffect(() => {
    if (done) return;

    const handleViolation = (msg: string) => {
      setViolations(prev => {
        const next = prev + 1;
        if (next >= 4) {
          onTerminate();
        } else {
          setWarningMsg(msg);
        }
        return next;
      });
    };

    const handleVisibility = () => {
      if (document.hidden && !warningMsg) handleViolation("Tab switch detected. Please stay focused.");
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement && !warningMsg) handleViolation("Fullscreen exited.");
    };

    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation("Copying text is not allowed.");
    };

    const preventContext = (e: MouseEvent) => {
      e.preventDefault();
    };

    const preventShortcuts = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && ['c', 'p', 's', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        handleViolation("Keyboard shortcuts are disabled.");
      }
      if (e.key === 'F12' || ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'i')) {
        e.preventDefault();
        handleViolation("Developer tools are disabled.");
      }
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        handleViolation("Taking screenshots is prohibited.");
      }
      if (e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        handleViolation("Screen capture shortcuts are disabled.");
      }
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleViolation("Taking screenshots is prohibited.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreen);
    document.addEventListener("copy", preventCopy);
    document.addEventListener("contextmenu", preventContext);
    document.addEventListener("keydown", preventShortcuts);
    document.addEventListener("keyup", preventShortcuts);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("keydown", preventShortcuts);
      document.removeEventListener("keyup", preventShortcuts);
    };
  }, [done, warningMsg, onTerminate]);

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
      let currentSessionFinal = "";
      let currentSessionInterim = "";

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentSessionFinal = mergeText(currentSessionFinal, transcript);
        } else {
          currentSessionInterim = mergeText(currentSessionInterim, transcript);
        }
      }

      const sessionTotal = mergeText(currentSessionFinal, currentSessionInterim);
      const finalText = mergeText(baseValueRef.current, sessionTotal);
      setValue(finalText + (finalText && !finalText.endsWith(" ") ? " " : ""));
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
    <div className="w-full flex flex-col gap-4 mt-6">
      {warningMsg && (
        <div className="fixed inset-0 z-100 bg-black/90 flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl">
          <AlertCircle className="size-24 text-red-500 mb-6 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Focus Mode Violation</h2>
          <p className="text-lg text-white/70 max-w-lg mb-8 leading-relaxed">
            {warningMsg}
            <br/><br/>
            Warning {violations}/3: Switching tabs or exiting fullscreen is not allowed during the interview. {4 - violations} more violation(s) will end your interview automatically.
          </p>
          <Button 
            size="lg" 
            variant="destructive"
            className="px-8 py-6 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all"
            onClick={async () => {
              setWarningMsg(null);
              try {
                if (document.documentElement.requestFullscreen) {
                  await document.documentElement.requestFullscreen();
                }
              } catch(e) {}
            }}
          >
            Return to Interview
          </Button>
        </div>
      )}
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
          <Button variant="secondary" size="sm" className="mt-2 w-full text-destructive hover:text-destructive-foreground hover:bg-destructive" onClick={onEndEarly}>
            <StopCircle className="mr-2 size-3.5" />
            End interview early
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

      <section className="panel flex min-h-[70vh] flex-col overflow-hidden select-none">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="text-sm font-medium">Live technical interview</span>
          </div>
          <div className="flex items-center gap-4">
            {violations > 0 && (
              <Badge variant="destructive" className="font-mono text-[10px]">
                Violations: {violations}/3
              </Badge>
            )}
            <Badge variant="secondary" className="font-mono text-[10px]">
              {done ? "COMPLETE" : "IN PROGRESS"}
            </Badge>
          </div>
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
                {m.role === "interviewer" && i === messages.length - 1 && !done ? (
                  <StreamingMessage content={m.content} />
                ) : (
                  m.content
                )}
              </div>
            </article>
          ))}
          {thinking && (
            <div className="flex flex-col gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                Interviewer
              </p>
              <div className="flex items-center gap-3 bg-surface-raised border border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground w-fit rounded-none">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="animate-pulse">Analyzing candidate response & generating adaptive follow-up...</span>
              </div>
            </div>
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
