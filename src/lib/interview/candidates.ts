import type { Candidate } from "@/lib/interview/types";
import candidatesData from "@/data/candidates.json";

export const candidates = (candidatesData as { candidates: Candidate[] }).candidates;

export function candidateSummary(c: Candidate) {
  const skipped = c.missions.filter((m) => m.skipped).length;
  const failed = c.missions.filter((m) => m.passed === false).length;
  const highEffort = c.missions.filter((m) => (m.attempts ?? 1) >= 4 && m.passed).length;
  return { skipped, failed, highEffort };
}
