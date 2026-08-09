import { useState } from "react";
import { Search, GraduationCap, Briefcase, TrendingUp } from "lucide-react";
import { candidates, candidateSummary } from "@/lib/interview/candidates";
import type { Candidate } from "@/lib/interview/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Props {
  onStart: (candidate: Candidate) => void;
  starting: boolean;
}

export function CandidateSelector({ onStart, starting }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Candidate | null>(null);

  const filtered = candidates.filter((c) =>
    `${c.member.name} ${c.member.jobRole}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Select a candidate</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every interview is generated from the candidate&apos;s real mission history — no two are
            alike.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or role"
            className="pl-9"
            aria-label="Search candidates"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => {
          const s = candidateSummary(c);
          const active = selected?.member.id === c.member.id;
          return (
            <button
              key={c.member.id}
              type="button"
              onClick={() => setSelected(c)}
              className={`panel group text-left transition-all duration-200 ${
                active
                  ? "border-primary shadow-(--shadow-glow)"
                  : "hover:border-primary hover:shadow-(--shadow-glow)"
              }`}
              aria-pressed={active}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{c.member.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Briefcase className="size-3.5" />
                      {c.member.jobRole}
                    </p>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {c.member.status}
                  </Badge>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-none bg-secondary/60 py-2">
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Exp
                    </dt>
                    <dd className="font-mono text-sm">{c.member.yearsExperience}y</dd>
                  </div>
                  <div className="rounded-none bg-secondary/60 py-2">
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Missions
                    </dt>
                    <dd className="font-mono text-sm">{c.signals.missionsCompleted}</dd>
                  </div>
                  <div className="rounded-none bg-secondary/60 py-2">
                    <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      1st try
                    </dt>
                    <dd className="font-mono text-sm">{c.signals.missionsFirstTry}</dd>
                  </div>
                </dl>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <GraduationCap className="size-3.5" />
                  {c.member.education}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.failed > 0 && (
                    <Badge variant="destructive" className="text-[10px]">
                      {s.failed} failed
                    </Badge>
                  )}
                  {s.skipped > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {s.skipped} skipped
                    </Badge>
                  )}
                  {s.highEffort > 0 && (
                    <Badge variant="outline" className="text-[10px] text-accent">
                      <TrendingUp className="mr-1 size-3" />
                      {s.highEffort} high-effort
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-4 mt-8 flex justify-center">
        <Button
          size="lg"
          disabled={!selected || starting}
          onClick={() => selected && onStart(selected)}
          className="shadow-(--shadow-glow)"
        >
          {starting
            ? "Preparing interview…"
            : selected
              ? `Start interview with ${selected.member.name}`
              : "Select a candidate to begin"}
        </Button>
      </div>
    </section>
  );
}
