import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, TrendingUp, AlertCircle, Award } from "lucide-react";
import type { Candidate, InterviewFeedback } from "@/lib/interview/types";
import { Button } from "@/components/ui/button";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const mockRadarData = [
  { subject: "Technical", score: 85, fullMark: 100 },
  { subject: "Communication", score: 90, fullMark: 100 },
  { subject: "Problem Solving", score: 75, fullMark: 100 },
  { subject: "Empathy", score: 80, fullMark: 100 },
  { subject: "Culture Fit", score: 95, fullMark: 100 },
];

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

        <div className="flex flex-col border-t border-border bg-background">
          {/* Content Body Grid */}
          <div className="grid md:grid-cols-2">
            {/* Radar Chart Section */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col gap-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Competency Breakdown
              </div>
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockRadarData}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="var(--color-primary)"
                      fill="var(--color-primary)"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Feedback Summary Section */}
            <div className="p-8 bg-muted/30 flex flex-col justify-center">
              <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Overall summary</h3>
              <p className="text-base leading-relaxed text-foreground">{feedback.summary}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-border">
            <Block
              title="Key Strengths"
              items={feedback.strengths}
              icon={<TrendingUp className="size-4" />}
              iconClass="text-chart-2"
            />
            <Block
              title="Areas to Improve"
              items={feedback.gaps}
              icon={<AlertCircle className="size-4" />}
              iconClass="text-destructive"
              className="border-t md:border-t-0 md:border-l border-border"
            />
            <Block
              title="Next Steps"
              items={feedback.next}
              icon={<ArrowRight className="size-4" />}
              iconClass="text-primary"
              className="border-t lg:border-t-0 lg:border-l border-border"
            />
          </div>
        </div>

        <div className="p-8 bg-card border-t border-border flex justify-end">
          <Button onClick={onReset} size="lg" className="rounded-full px-8 shadow-glow gap-2">
            <RotateCcw className="size-4" />
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
  iconClass,
  className = "",
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  iconClass?: string;
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <div className={`p-8 bg-muted/10 ${className}`}>
      <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-4 ${iconClass}`}>
        {icon}
        {title}
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="bg-card p-4 rounded-xl border border-border text-sm text-foreground shadow-sm flex gap-3">
            <span className={`font-bold mt-0.5 shrink-0 ${iconClass}`}>•</span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
