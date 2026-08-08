import type { InterviewSession } from "./types";

const TTL_MS = 1000 * 60 * 60 * 3; // 3 hours

interface Store {
  sessions: Map<string, InterviewSession>;
}

const globalStore = globalThis as unknown as { __interviewStore?: Store };
const store: Store = (globalStore.__interviewStore ??= { sessions: new Map() });

function sweep() {
  const now = Date.now();
  for (const [id, s] of store.sessions) {
    if (now - s.startedAt > TTL_MS) store.sessions.delete(id);
  }
}

export function getSession(sessionId: string): InterviewSession | undefined {
  sweep();
  return store.sessions.get(sessionId);
}

export function saveSession(session: InterviewSession): void {
  store.sessions.set(session.sessionId, session);
}

export function deleteSession(sessionId: string): void {
  store.sessions.delete(sessionId);
}

export function sessionCount(): number {
  return store.sessions.size;
}
