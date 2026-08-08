import curriculumData from "@/data/curriculum.json";
import type { CurriculumDay } from "./types";

interface RawModule {
  n: number;
  title: string;
  days: number[];
}

const modules = curriculumData.modules as RawModule[];
const days = curriculumData.days as Omit<CurriculumDay, "module">[];

const dayIndex = new Map<number, CurriculumDay>();

for (const d of days) {
  const mod = modules.find((m) => d.day >= m.days[0]! && d.day <= m.days[1]!);
  dayIndex.set(d.day, {
    ...d,
    ...(mod ? { module: { n: mod.n, title: mod.title } } : {}),
  });
}

export const cohortTitle = curriculumData.cohort as string;

export function getDay(day: number): CurriculumDay | undefined {
  return dayIndex.get(day);
}

export function allDays(): CurriculumDay[] {
  return [...dayIndex.values()].sort((a, b) => a.day - b.day);
}

export function getModuleNumber(day: number): number | undefined {
  return dayIndex.get(day)?.module?.n;
}

export function dayTitle(day: number): string {
  return dayIndex.get(day)?.title ?? `Day ${day}`;
}

/** Compact, prompt-friendly grounding context for a single curriculum day. */
export function dayContext(day: number): string {
  const d = dayIndex.get(day);
  if (!d) return `Day ${day}: (not in curriculum)`;
  return [
    `Day ${d.day} — ${d.title}`,
    `Module ${d.module?.n ?? "?"}: ${d.module?.title ?? "?"} | Type: ${d.type}`,
    `Tools: ${d.tools.join(", ")}`,
    `Objectives:\n- ${d.objectives.join("\n- ")}`,
  ].join("\n");
}

/** Coherent topic progressions used by the topic selector. */
export const learningPaths: Record<string, number[]> = {
  data: [4, 5, 6, 9],
  rag: [7, 8, 9, 10, 11],
  prompting: [12, 13, 14, 15],
  chatbot: [16, 17, 18, 19, 20],
  agents: [21, 22, 23, 24],
  production: [25, 26, 27, 28, 29, 30],
  capstone: [31],
};
