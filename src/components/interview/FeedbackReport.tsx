import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";
import type { Candidate, InterviewFeedback } from "@/lib/interview/types";
import { Button } from "@/components/ui/button";

interface Props {
  candidate: Candidate;
  feedback: InterviewFeedback;
  questionCount: number;
  topicsCovered: number;
  onReset: () => void;
}

export function FeedbackReport({
  candidate,
  feedback,
  questionCount,
  topicsCovered,
  onReset,
}: Props) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-20">
      <div className="panel overflow-hidden">
        <div className="p-8" style={{ backgroundImage: "var(--gradient-hero)" }}>
          <p className="text-[11px] uppercase tracking-widest text-primary">Interview complete</p>
          <h2 className="mt-2 text-3xl font-semibold">{candidate.member.name}</h2>
          <p className="text-sm text-muted-foreground">
            {candidate.member.jobRole} · {candidate.member.yearsExperience} yrs experience
          </p>
          <div className="mt-5 flex flex-wrap gap-6 font-mono text-sm">
            <span>
              <span className="text-muted-foreground">Questions </span>
              {questionCount}
            </span>
            <span>
              <span className="text-muted-foreground">Curriculum days </span>
              {topicsCovered}
            </span>
          </div>
        </div>

        <div className="space-y-8 p-8">
          <div>
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground">Overall summary</h3>
            <p className="mt-3 text-base leading-relaxed">{feedback.summary}</p>
          </div>

          <Block
            title="Strengths"
            items={feedback.strengths}
            icon={<CheckCircle2 className="size-4 text-primary" />}
          />
          <Block
            title="Gaps"
            items={feedback.gaps}
            icon={<AlertTriangle className="size-4 text-accent" />}
          />
          <Block
            title="Recommended next steps"
            items={feedback.next}
            icon={<ArrowRight className="size-4 text-primary" />}
          />

          <Button onClick={onReset} size="lg" className="w-full sm:w-auto rounded-none shadow-(--shadow-glow)">
            <RotateCcw className="mr-2 size-4" />
            Run another interview
          </Button>
        </div>
      </div>
    </section>
  );
}

function Block({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="text-sm uppercase tracking-widest text-muted-foreground">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed">
            <span className="mt-0.5 shrink-0">{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
