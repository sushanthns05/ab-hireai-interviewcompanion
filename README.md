# The Interview Agent — ABTalks AI Cohort

An adaptive AI technical interviewer for graduates of the 31-day Enterprise AI Engineering cohort.
It reads each candidate's real mission history, plans curriculum topics with intent, adapts
difficulty turn by turn, follows up on what the candidate actually said, and closes with a
structured feedback report.

## Running

```bash
bun install
bun run dev        # app at http://localhost:8080
bunx vitest run    # engine + API contract tests
```

The LLM is called through the Lovable AI Gateway (`LOVABLE_API_KEY`, server-side only).

## API

`POST /api/interview` (also mirrored at `/api/public/interview`)

Start a session:

```json
{ "sessionId": "uuid", "candidate": { "member": { ... }, "missions": [ ... ] } }
```

Continue a session:

```json
{ "sessionId": "uuid", "message": "candidate answer" }
```

Response:

```json
{ "reply": "next question or closing line", "done": false }
```

When `done` is `true`, the response also carries the feedback report:

```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "string",
    "strengths": ["string"],
    "gaps": ["string"],
    "next": ["string"]
  }
}
```

`GET /api/interview?sessionId=…` returns the internal state (phase, difficulty, covered days,
last action + reason) for the developer panel. `POST /api/interview-reset?sessionId=…` clears it.

## How it works

| Layer | File | Responsibility |
| --- | --- | --- |
| Curriculum grounding | `src/lib/interview/curriculum.ts` | Day/module lookup, learning paths, topic text used to ground every question |
| Candidate analysis | `src/lib/interview/analyzer.ts` | Seniority, role focus, skipped/failed/high-effort days, planned day sequence, base difficulty |
| Interview engine | `src/lib/interview/engine.server.ts` | Phase machine (INTRO → BASELINE → DEEP_DIVE → CROSS_DOMAIN → SCENARIO → FINAL → FEEDBACK), evaluation, difficulty control |
| Sessions | `src/lib/interview/sessions.server.ts` | In-memory session store with TTL |
| HTTP | `src/lib/interview/handler.server.ts` | Zod validation, error mapping, session lifecycle |

Guarantees enforced by the engine and covered by tests: 8–12 questions, at least 4 distinct
curriculum days, every question tied to a day plus a reason, no assumed knowledge of skipped
missions, and difficulty that moves with answer quality.
