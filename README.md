# The Interview Agent — ABTalks HireAI

An adaptive AI technical interviewer for graduates of the 31-day Enterprise AI Engineering cohort, now featuring comprehensive mock practice capabilities. 
It reads each candidate's real mission history, plans curriculum topics with intent, adapts difficulty turn by turn, follows up on what the candidate actually said, and closes with a comprehensive, structured feedback report.

## Features

- **Live Adaptive AI Interviewing:** The core engine assesses seniority, tracks curriculum gaps, and controls difficulty seamlessly as the candidate answers real-time questions.
- **Mock Interview Practice Mode:** Choose from various personas (HR, Technical Lead, Panel) and practice specific types of behavioral or technical questions in a low-pressure simulated environment.
- **Strict Anti-Cheat (Focus Mode):** Active across both Live and Mock interviews. 
  - Forces Fullscreen automatically.
  - Intercepts tab-switching and window-switching.
  - Blocks `PrintScreen`, developer tools, context menus, and text copying.
  - Enforces a 4-strike violation rule that instantly terminates the session if the candidate loses focus too many times.
- **Session Replay & History:** All practice sessions are saved locally. You can revisit past interviews to view full chat transcripts, see your overall score, and analyze the AI's provided "Ideal Response" side-by-side with your original answers.
- **Voice Input Integration:** Supports in-browser speech-to-text allowing candidates to answer technical questions via voice.
- **Developer Debug Panel:** Toggle the live developer panel during the interview to inspect the engine's real-time inner thoughts, phase progression, and current difficulty.
- **Comprehensive Feedback Report:** At the end of the interview, candidates receive:
  - An **Overall Score** and **Performance Qualification** (Strong, Good, Weak).
  - A dynamic **Radar Chart** scoring 5 key competencies: Technical, Communication, Problem Solving, Empathy, and Culture Fit.
  - Actionable insights including key strengths, areas to improve, and precise next steps.

## Running Locally

```bash
bun install
bun run dev        # app at http://localhost:8080
bunx vitest run    # engine + API contract tests
```

The LLM is called through the Lovable AI Gateway (`LOVABLE_API_KEY`, server-side only).

## API Structure

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

When `done` is `true`, the response also carries the enriched feedback report:

```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "qualification": "Strong",
    "overallScore": 85,
    "competencyScores": {
      "technical": 88,
      "communication": 90,
      "problemSolving": 80,
      "empathy": 85,
      "cultureFit": 95
    },
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
