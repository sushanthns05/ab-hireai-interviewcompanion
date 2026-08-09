import type { Candidate, CandidateMission } from "./types";
import { getDay, learningPaths } from "./curriculum";

export type Seniority = "junior" | "mid" | "senior" | "principal";

export interface CandidateAnalysis {
  seniority: Seniority;
  baseDifficulty: number;
  strengthDays: number[];
  highEffortDays: number[];
  failedDays: number[];
  skippedDays: number[];
  completedDays: number[];
  roleFocus: string[];
  engagement: "low" | "moderate" | "high";
  plannedDays: number[];
  notes: string[];
}

const ROLE_PATHS: { match: RegExp; focus: string[]; paths: string[] }[] = [
  {
    match: /data engineer|data scientist|analytics/i,
    focus: [
      "embeddings",
      "vector search",
      "retrieval",
      "RAG",
      "evaluation",
      "production data systems",
    ],
    paths: ["rag", "production"],
  },
  {
    match: /devops|sre|platform|infrastructure/i,
    focus: [
      "Docker",
      "Kubernetes",
      "observability",
      "reliability",
      "production readiness",
      "security",
    ],
    paths: ["production", "chatbot"],
  },
  {
    match: /principal|distinguished|architect|staff/i,
    focus: [
      "architecture tradeoffs",
      "RAG architecture",
      "agent orchestration",
      "MCP",
      "scalability",
      "reliability",
      "security",
    ],
    paths: ["agents", "production", "rag"],
  },
  {
    match: /ai engineer|ml engineer|machine learning/i,
    focus: ["RAG", "agents", "MCP", "prompting", "evaluation", "production AI"],
    paths: ["rag", "agents", "production"],
  },
  {
    match: /backend|software engineer|developer|mobile|legacy/i,
    focus: [
      "FastAPI",
      "APIs",
      "function calling",
      "streaming",
      "conversation memory",
      "deployment",
    ],
    paths: ["chatbot", "prompting", "rag"],
  },
  {
    match: /intern|junior|student/i,
    focus: ["fundamentals", "practical implementation", "simple system design"],
    paths: ["rag", "chatbot"],
  },
];

const NON_TECHNICAL =
  /analyst|marketing|hr |hr manager|ux|research|support|product manager|business/i;

function roleProfile(jobRole: string) {
  const hit = ROLE_PATHS.find((r) => r.match.test(jobRole));
  if (hit) return hit;
  return {
    match: /./,
    focus: ["practical application", "system integration", "working with AI services"],
    paths: ["rag", "chatbot"],
  };
}

function seniorityOf(role: string, years: number): Seniority {
  if (/principal|distinguished|architect|staff/i.test(role)) return "principal";
  if (/intern|junior|student/i.test(role) || years <= 1) return "junior";
  if (years >= 8 || /senior|lead/i.test(role)) return "senior";
  return "mid";
}

function missionScore(m: CandidateMission): number {
  if (m.skipped) return -1;
  if (m.passed === false) return -2;
  return m.attempts ?? 1;
}

export function analyzeCandidate(candidate: Candidate): CandidateAnalysis {
  const { member, missions, signals } = candidate;
  const seniority = seniorityOf(member.jobRole, member.yearsExperience);
  const nonTechnicalRole = NON_TECHNICAL.test(member.jobRole);

  const skippedDays = missions.filter((m) => m.skipped).map((m) => m.day);
  const failedDays = missions.filter((m) => m.passed === false).map((m) => m.day);
  const passed = missions.filter((m) => m.passed === true);
  const completedDays = passed.map((m) => m.day);
  const strengthDays = passed.filter((m) => (m.attempts ?? 1) <= 1).map((m) => m.day);
  const highEffortDays = passed.filter((m) => (m.attempts ?? 1) >= 3).map((m) => m.day);

  const firstTryRatio =
    signals.missionsCompleted > 0 ? signals.missionsFirstTry / signals.missionsCompleted : 0;
  const engagement: CandidateAnalysis["engagement"] =
    signals.commitDays >= 25 ? "high" : signals.commitDays >= 15 ? "moderate" : "low";

  let baseDifficulty =
    seniority === "principal" ? 5 : seniority === "senior" ? 4 : seniority === "mid" ? 3 : 2;
  if (firstTryRatio >= 0.8 && engagement === "high") baseDifficulty += 1;
  if (firstTryRatio < 0.2 || engagement === "low") baseDifficulty -= 1;
  if (nonTechnicalRole) baseDifficulty -= 1;
  baseDifficulty = Math.min(7, Math.max(1, baseDifficulty));

  const role = roleProfile(member.jobRole);

  // Topic selection: score every curriculum day the candidate can be fairly asked about.
  const scores = new Map<number, number>();
  const bump = (day: number, amount: number) => {
    if (!getDay(day)) return;
    scores.set(day, (scores.get(day) ?? 0) + amount);
  };

  for (const p of role.paths) {
    (learningPaths[p] ?? []).forEach((d, i) => bump(d, 6 - i * 0.5));
  }
  for (const m of missions) {
    const s = missionScore(m);
    if (m.skipped)
      bump(m.day, -6); // never assume knowledge
    else if (m.passed === false)
      bump(m.day, 2.5); // possible gap worth testing, carefully
    else if (s >= 4)
      bump(m.day, 5); // high effort -> fragile understanding, probe
    else if (s === 3) bump(m.day, 4);
    else if (s === 2) bump(m.day, 3);
    else bump(m.day, 2.5); // first-try pass: likely strength, must still be verified
  }
  // Never open on setup days.
  for (const d of [1, 2]) bump(d, -8);

  const ranked = [...scores.entries()]
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([d]) => d);

  // Build a coherent but broad progression: walk each role-relevant learning
  // path in curriculum order, taking two days at a time and rotating between
  // paths so the interview stays coherent yet crosses modules.
  const planned: number[] = [];
  const pushDay = (d: number) => {
    if (!planned.includes(d) && getDay(d)) planned.push(d);
  };
  const seed = ranked[0];
  if (seed !== undefined) pushDay(seed);

  const queues = role.paths.map((p) =>
    (learningPaths[p] ?? []).filter((d) => ranked.includes(d) && d !== seed),
  );
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const q of queues) {
      for (let i = 0; i < 2; i++) {
        const next = q.shift();
        if (next !== undefined) {
          pushDay(next);
          progressed = true;
        }
      }
    }
  }
  ranked.forEach(pushDay);
  // Guaranteed coverage floor if the candidate's data is very sparse.
  [7, 10, 12, 16, 22].forEach(pushDay);

  const notes: string[] = [];
  if (skippedDays.length)
    notes.push(
      `Skipped days ${skippedDays.join(", ")} — do NOT assume any knowledge there; only ask about them as an explicit gap-oriented question.`,
    );
  if (failedDays.length)
    notes.push(
      `Failed days ${failedDays.join(", ")} — likely genuine gaps; test fundamentals there fairly.`,
    );
  if (highEffortDays.length)
    notes.push(
      `High-attempt passes on days ${highEffortDays.join(", ")} — understanding may be fragile or memorized; probe beyond definitions.`,
    );
  if (strengthDays.length)
    notes.push(
      `First-try passes on days ${strengthDays.join(", ")} — likely strengths, but verify, never assume mastery.`,
    );
  if (nonTechnicalRole)
    notes.push(
      `Non-AI-specialist role (${member.jobRole}) — emphasise practical application and system integration over deep specialisation.`,
    );

  return {
    seniority,
    baseDifficulty,
    strengthDays,
    highEffortDays,
    failedDays,
    skippedDays,
    completedDays,
    roleFocus: role.focus,
    engagement,
    plannedDays: planned.slice(0, 10),
    notes,
  };
}

/** Compact candidate briefing used inside LLM prompts. */
export function candidateBrief(candidate: Candidate, analysis: CandidateAnalysis): string {
  const { member, signals } = candidate;
  const missions = candidate.missions
    .map((m) => {
      const state = m.skipped
        ? "SKIPPED"
        : m.passed === false
          ? "FAILED"
          : `passed in ${m.attempts ?? 1} attempt(s)`;
      return `Day ${m.day} ${m.title}: ${state}`;
    })
    .join("\n");
  return [
    `Candidate: ${member.name} — ${member.jobRole}, ${member.yearsExperience} yrs experience, ${member.education}.`,
    `Seniority band: ${analysis.seniority}. Engagement: ${analysis.engagement} (commit days ${signals.commitDays}).`,
    `Signals: ${signals.missionsCompleted} missions completed, ${signals.missionsFirstTry} first-try.`,
    `Role-relevant focus areas: ${analysis.roleFocus.join(", ")}.`,
    `Mission history:\n${missions}`,
    `Interview strategy notes:\n- ${analysis.notes.join("\n- ")}`,
  ].join("\n");
}
