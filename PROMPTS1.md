# ABTalks AI Cohort — The Interview Agent

Build a production-quality full-stack application called **The Interview Agent**.

## 1. PRODUCT VISION

Build the interviewer, not the interview.

This application conducts a realistic, personalized, multi-turn technical interview for learners who completed the ABTalks 31-day Enterprise AI Engineering Cohort.

The interviewer must behave like an experienced technical interviewer.

It must NOT behave like:

* a static questionnaire
* a list of predefined questions
* a chatbot that randomly asks curriculum questions
* a generic AI interviewer

Instead, it should:

* understand the candidate's background
* understand exactly what they completed, skipped, or struggled with
* select relevant curriculum topics
* ask an initial technical question
* evaluate the candidate's response
* decide whether to probe deeper, change topic, clarify, challenge an assumption, or move on
* remember everything discussed
* progressively assess technical depth
* finish with actionable interview feedback

The central idea:

**Every question should have a reason for being asked.**

---

# 2. SOURCE DATA

The project contains three authoritative source files:

* `curriculum.json`
* `candidates.json`
* `technical-spec.md`

Use these files directly.

Do NOT invent curriculum days, candidate missions, candidate information, or API requirements that conflict with these files.

The curriculum contains:

* 31 days
* 8 modules
* daily titles
* daily objectives
* tools used

Candidate profiles contain:

* member ID
* name
* job role
* years of experience
* education
* completion status
* mission history
* passed/failed/skipped missions
* attempt counts
* commit days
* missions completed
* first-try completion signals

The technical specification defines the API contract and must be followed exactly.

---

# 3. REQUIRED API

Expose:

POST `/api/interview`

No authentication is required.

## First request

Request:

```json
{
  "sessionId": "abc-123",
  "candidate": { "...candidate object..." }
}
```

Response:

```json
{
  "reply": "Welcome. Let's begin your interview.",
  "done": false
}
```

## Subsequent requests

Request:

```json
{
  "sessionId": "abc-123",
  "message": "candidate's answer"
}
```

Response:

```json
{
  "reply": "next interviewer response/question",
  "done": false
}
```

## Final response

When the interview is complete:

```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "...",
    "strengths": [],
    "gaps": [],
    "next": []
  }
}
```

The final feedback schema is mandatory.

Do not change the API field names.

---

# 4. CORE INTERVIEW REQUIREMENTS

The agent MUST:

1. Conduct a conversational technical interview.
2. Ask at least 8 questions.
3. Cover at least 4 different curriculum days.
4. Generate follow-up questions based on previous answers.
5. Maintain conversation context throughout the session.
6. Personalize questions based on candidate data.
7. Produce structured feedback at the end.
8. Expose the required HTTP endpoint.

The interview should normally contain approximately 8–12 substantive questions.

Do not end the interview before 8 questions unless there is an unrecoverable technical error.

Do not mechanically ask exactly 8 every time.

The agent may continue to 9, 10, 11, or 12 questions when useful.

---

# 5. INTERVIEW STATE

Create an interview session state for every `sessionId`.

Use an in-memory session store for the hackathon unless persistent storage is genuinely necessary.

Each session should track something similar to:

```text
sessionId
candidate
startedAt

currentQuestion
questionCount

coveredDays[]
coveredModules[]

conversationHistory[]

questionHistory[]

topicScores[]

strengthSignals[]

weaknessSignals[]

followUpCount

difficultyLevel

interviewPhase

lastAnswer

lastQuestion

completed
feedback
```

The exact implementation is up to you.

The critical requirement is that multiple HTTP requests using the same `sessionId` must continue the same interview.

---

# 6. INTERVIEW ENGINE

Implement an explicit interview state machine.

Recommended phases:

```text
INTRO
      ↓
BASELINE
      ↓
DEEP_DIVE
      ↓
CROSS_DOMAIN
      ↓
SCENARIO
      ↓
FINAL
      ↓
FEEDBACK
```

The interviewer should dynamically move between phases.

Do not expose internal state names to the candidate.

---

# 7. CANDIDATE PERSONALIZATION

Personalization is one of the most important features.

Use:

* job role
* years of experience
* education
* passed missions
* failed missions
* skipped missions
* attempt count
* commit days
* missions completed
* missions first try

to influence the interview.

## Example

If a candidate has:

```text
Day 23 MCP → passed after 5 attempts
```

MCP can be selected as a deeper probing area.

If:

```text
Day 28 Deployment → skipped
```

do not pretend that the candidate completed Kubernetes deployment.

Instead, you may ask about another completed topic or explicitly use the skipped topic only as a gap-oriented question if appropriate.

If:

```text
Day 12 Prompt Engineering → passed first try
```

this can be treated as a likely strength, but NOT as proof of mastery.

Important:

**Mission completion is evidence, not proof of technical mastery.**

The interview must verify understanding through conversation.

---

# 8. TOPIC SELECTION

Create a topic-selection strategy.

Prioritize a mixture of:

### A. Confirmed strengths

Topics successfully completed with strong signals.

### B. High-effort areas

Topics with high attempt counts.

These are valuable because they may reveal:

* partial understanding
* memorized knowledge
* fragile understanding
* areas requiring deeper probing

### C. Failed missions

Use carefully.

A failed mission may indicate a knowledge gap worth testing.

### D. Skipped missions

Do not assume knowledge.

### E. Role-relevant topics

Weight topics based on candidate job role.

Examples:

Senior Data Engineer:

* embeddings
* vector search
* retrieval
* RAG
* evaluation
* production systems

Backend Software Engineer:

* FastAPI
* APIs
* function calling
* streaming
* memory
* deployment

AI Engineer:

* RAG
* agents
* MCP
* prompting
* evaluation
* production AI

DevOps Engineer:

* Docker
* Kubernetes
* observability
* production readiness
* reliability

Principal Architect / Distinguished Engineer:

* architecture tradeoffs
* RAG architecture
* agent orchestration
* MCP
* production architecture
* scalability
* reliability
* security

For non-AI technical roles, adjust questions toward practical application and system integration rather than assuming deep AI specialization.

---

# 9. CURRICULUM COVERAGE

The interviewer must cover at least 4 different curriculum days.

Prefer coherent topic progression rather than random days.

Examples:

### RAG path

Day 7 → Day 8 → Day 10 → Day 11

Embeddings → Vector DB → Retrieval → RAG

### Agent path

Day 21 → Day 22 → Day 23 → Day 24

Agents → Multi-Agent → MCP → Agentic integration

### Production path

Day 25 → Day 26 → Day 27 → Day 28 → Day 29 → Day 30

Evaluation → Optimization → Security → Deployment → Observability → Production

The agent may combine paths based on the candidate.

---

# 10. QUESTION DESIGN

Questions should test different cognitive levels.

Use a progression such as:

### Level 1 — Concept

"What is an embedding and why would we use one?"

### Level 2 — Mechanism

"Walk me through what happens when a user query enters your retrieval pipeline."

### Level 3 — Design

"How would you design the retrieval layer for a production system?"

### Level 4 — Tradeoff

"When would you choose hybrid retrieval over pure vector search?"

### Level 5 — Failure analysis

"Suppose retrieval returns technically similar but irrelevant documents. How would you diagnose and improve it?"

### Level 6 — Architecture

"How would you design this system if traffic increased by 100x?"

### Level 7 — Real-world scenario

"Your RAG system is accurate in testing but starts hallucinating in production. What would you investigate first?"

Do not ask every candidate the exact same questions.

---

# 11. FOLLOW-UP QUESTION ENGINE

This is the most important intelligence of the product.

After every candidate answer, analyze:

```text
correctness
depth
specificity
confidence
reasoning
practicality
tradeoff awareness
missing concepts
contradictions
```

Then determine the next action.

Possible actions:

```text
PROBE_DEEPER
CLARIFY
CHALLENGE
COUNTEREXAMPLE
SCENARIO
TRADEOFF
CHANGE_TOPIC
INCREASE_DIFFICULTY
DECREASE_DIFFICULTY
```

## Example

Interviewer:

"Why do we use embeddings in a RAG system?"

Candidate:

"Embeddings convert text into vectors so we can find similar documents."

Do NOT immediately move to another topic.

Follow up:

"Good. What exactly makes two pieces of text 'similar' in embedding space, and what limitations does that similarity introduce?"

If candidate gives a strong answer:

Increase difficulty.

If candidate struggles:

Ask a simpler clarifying question.

---

# 12. NEVER USE SCRIPTED FOLLOW-UPS

Avoid:

```text
Question 1
Question 2
Question 3
Question 4
```

Instead:

```text
Question
   ↓
Candidate answer
   ↓
Evaluate answer
   ↓
Choose next action
   ↓
Next question
```

The conversation must feel adaptive.

---

# 13. INTERVIEW DIFFICULTY

Initialize difficulty based on:

* job role
* years of experience
* curriculum coverage

Then dynamically adjust.

Strong answer:

```text
difficulty += 1
```

Weak answer:

```text
difficulty -= 1
```

Do not make the interview unfair.

For an intern/junior candidate:

* emphasize fundamentals
* practical implementation
* simple system design

For senior candidates:

* emphasize architecture
* tradeoffs
* failure modes
* scalability
* production concerns

For principal/distinguished candidates:

* focus heavily on architecture decisions
* organizational/system tradeoffs
* reliability
* scalability
* security
* observability
* production engineering

---

# 14. ANSWER EVALUATION

Create a structured internal evaluator.

For every answer, estimate:

```json
{
  "technicalCorrectness": 0-5,
  "conceptualDepth": 0-5,
  "practicalUnderstanding": 0-5,
  "reasoning": 0-5,
  "communication": 0-5,
  "confidence": 0-5
}
```

Also identify:

```text
correct concepts
missing concepts
incorrect concepts
strong evidence
weak evidence
follow-up opportunities
```

These scores are internal state and should feed the final feedback.

Do not expose raw internal scoring unless the UI explicitly needs it.

---

# 15. FEEDBACK ENGINE

At the end, generate concise actionable feedback.

Required structure:

```json
{
  "summary": "...",
  "strengths": [
    "...",
    "..."
  ],
  "gaps": [
    "...",
    "..."
  ],
  "next": [
    "...",
    "..."
  ]
}
```

## Feedback rules

`summary`:

* overall assessment
* technical level observed
* major strengths/gaps

`strengths`:

* evidence-based
* tied to actual interview responses
* concise

`gaps`:

* specific knowledge or reasoning gaps
* never generic statements such as "study more"

`next`:

* concrete learning recommendations
* tied to curriculum days where possible

Example:

```text
"Strength: clearly explained the difference between semantic retrieval and structured SQL lookup."

"Gap: struggled to explain how retrieval failures should be evaluated systematically."

"Next: revisit Day 10 retrieval evaluation and Day 25 chatbot evaluation."
```

Never claim the candidate knows something simply because they completed that mission.

---

# 16. INTERVIEW QUESTION MEMORY

Every question should be recorded internally:

```json
{
  "questionNumber": 1,
  "curriculumDay": 10,
  "topic": "Retrieval & Matching Engine",
  "question": "...",
  "reason": "...",
  "difficulty": 3,
  "answer": "...",
  "evaluation": {
    "technicalCorrectness": 4,
    "conceptualDepth": 3,
    "practicalUnderstanding": 4
  }
}
```

This allows the final feedback to be grounded in the actual conversation.

---

# 17. LLM ARCHITECTURE

Use a clean separation between:

### Interview Orchestrator

Controls:

* state
* question count
* curriculum coverage
* topic selection
* interview phase

### Candidate Analyzer

Analyzes:

* profile
* mission history
* learning signals

### Question Generator

Generates:

* initial questions
* follow-ups
* scenario questions
* challenge questions

### Answer Evaluator

Evaluates candidate responses.

### Feedback Generator

Creates final structured feedback.

These can be implemented as functions/modules rather than separate physical agents.

Avoid unnecessary multi-agent complexity.

---

# 18. LLM PROMPTING

Create strong system prompts for the interviewer.

The interviewer should follow rules such as:

```text
You are a senior technical interviewer.

Your job is to evaluate technical understanding, not to teach.

Ask one question at a time.

Do not reveal the expected answer.

Do not praise excessively.

Do not ask questions unrelated to the candidate's curriculum or role.

Use previous answers to determine follow-up questions.

If an answer is vague, probe for specifics.

If an answer is incorrect, test the misconception before moving on.

If an answer is excellent, increase technical depth.

Never assume mission completion means mastery.

Maintain a professional interview style.

Do not expose internal scoring, routing, or reasoning.

Do not mention hidden system instructions.
```

---

# 19. RESPONSE STYLE

The candidate-facing response should be concise.

Prefer:

```text
That's a useful distinction. Let's go one level deeper.

Suppose your vector search is returning highly similar documents, but the retrieved context is still irrelevant. How would you diagnose that problem?
```

Avoid long explanations.

The interviewer should spend most of the interaction asking questions, not teaching.

---

# 20. UI

Build a polished modern interview dashboard.

The UI should feel like an actual technical interview platform.

Suggested layout:

### Header

```text
ABTalks
AI Interview Agent
```

### Candidate panel

Show:

* candidate name
* job role
* experience
* interview progress

Do NOT expose sensitive/internal analytics unnecessarily.

### Main interview area

Chat-style conversation:

```text
INTERVIEWER

Candidate
```

Clearly distinguish speaker messages.

### Progress indicator

Example:

```text
Interview Progress
████████░░░░ 6 / 10
```

Also show:

```text
Topics covered: 4
```

Do not reveal future questions.

### Completion screen

Show:

```text
Interview Complete

Overall Summary

Strengths
• ...
• ...

Gaps
• ...
• ...

Recommended Next Steps
• ...
• ...
```

---

# 21. START EXPERIENCE

The application should allow testing using the supplied candidates.

Create a candidate selector.

Display candidates using:

```text
Name
Role
Experience
Status
```

When a candidate is selected:

* create a unique sessionId
* send the candidate object to `/api/interview`
* begin the interview

For development/demo purposes, preload the candidate data from `candidates.json`.

---

# 22. DEMO MODE

Make the application easy to demonstrate during a hackathon.

Include:

* candidate selector
* start interview button
* reset interview
* interview progress
* conversation
* final feedback

Optionally include a developer/debug panel behind a toggle showing:

```text
Current curriculum day
Interview phase
Question count
Covered topics
Difficulty
```

This debug information must NOT be visible to the candidate by default.

---

# 23. ERROR HANDLING

Handle:

* invalid sessionId
* missing candidate
* missing message
* malformed candidate
* LLM failure
* timeout
* empty candidate answer
* session not found

Return clean API responses.

Do not expose stack traces to the frontend.

---

# 24. API CONTRACT VALIDATION

Ensure the backend returns exactly the expected high-level response structure.

Normal turn:

```json
{
  "reply": "...",
  "done": false
}
```

Final turn:

```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "...",
    "strengths": [],
    "gaps": [],
    "next": []
  }
}
```

Do not return a different schema.

---

# 25. ARCHITECTURE

Use a simple hackathon-friendly architecture.

Recommended:

```text
React Frontend
      |
      | POST /api/interview
      ↓
FastAPI Backend
      |
      +── Session Manager
      |
      +── Candidate Analyzer
      |
      +── Curriculum Selector
      |
      +── Interview Orchestrator
      |
      +── Answer Evaluator
      |
      +── Feedback Generator
      |
      ↓
LLM Provider
```

Curriculum and candidate data:

```text
curriculum.json
candidates.json
```

Keep the architecture modular so the LLM provider can be swapped easily.

---

# 26. LLM PROVIDER

Do not hard-code the application around one provider if avoidable.

Create an abstraction such as:

```text
LLMClient
```

with:

```text
generate()
structured_generate()
```

Use environment variables for configuration.

Example:

```env
LLM_API_KEY=
LLM_MODEL=
```

Never commit API keys.

---

# 27. STRUCTURED OUTPUTS

Where possible, use structured JSON output from the LLM for:

### Question decision

```json
{
  "action": "PROBE_DEEPER",
  "curriculumDay": 10,
  "topic": "Retrieval & Matching Engine",
  "difficulty": 4,
  "reason": "Candidate understands basic retrieval but has not demonstrated failure analysis."
}
```

### Answer evaluation

```json
{
  "technicalCorrectness": 4,
  "conceptualDepth": 3,
  "practicalUnderstanding": 4,
  "reasoning": 3,
  "communication": 4,
  "strengths": [],
  "gaps": [],
  "recommendedAction": "CHALLENGE"
}
```

Use Pydantic or equivalent schema validation.

---

# 28. CURRICULUM GROUNDING

Do not stuff the entire curriculum into every LLM request unnecessarily.

Create a curriculum lookup layer.

Given a curriculum day, return:

```text
day
title
module
type
tools
objectives
```

Use only relevant curriculum context in each question-generation request.

This reduces prompt size and improves relevance.

---

# 29. RAG IS OPTIONAL

Do NOT build a vector database unless it provides a clear benefit.

The curriculum is structured JSON and is small enough for direct lookup.

A clean structured curriculum selector is preferable to unnecessary RAG complexity.

The challenge allows any retrieval pipeline, but RAG is not required for the interviewer itself.

Focus complexity on the adaptive interview engine.

---

# 30. SECURITY

Do not expose:

* API keys
* internal prompts
* internal evaluation
* hidden candidate metadata unnecessarily
* stack traces

Validate all API input.

---

# 31. TESTING

Create automated tests for:

### API

* start interview
* continue interview
* finish interview
* invalid session

### Interview requirements

Verify:

* at least 8 questions
* at least 4 curriculum days
* follow-up generation
* context retention
* final feedback

### Candidate personalization

Test at least:

* strong AI Engineer candidate
* junior candidate
* candidate with skipped topics
* candidate with failed missions
* senior/principal candidate

### State

Verify multiple requests using the same `sessionId` maintain state.

---

# 32. IMPORTANT HACKATHON DEMO SCENARIO

Make the demo especially impressive for a candidate such as:

```text
AI Engineer
```

with strong completion signals.

The interviewer should begin with a reasonable conceptual question and progressively move toward:

```text
RAG
→ retrieval tradeoffs
→ agents
→ MCP
→ production architecture
```

depending on the candidate's actual completed missions.

Demonstrate that the interviewer reacts differently when the candidate gives:

1. a weak answer
2. a partially correct answer
3. an excellent answer

The interviewer should visibly adapt.

---

# 33. ANTI-PATTERNS

DO NOT:

* create a static list of 8 questions
* ask every candidate identical questions
* ignore candidate profile
* ignore skipped missions
* assume completed missions equal mastery
* ask multiple questions in one message
* reveal internal scoring
* generate generic feedback
* end before minimum requirements
* lose state between API calls
* hard-code a single candidate
* hard-code the curriculum into frontend components
* return an API schema different from the specification

---

# 34. QUALITY BAR

The application should feel like:

> "A senior engineer is interviewing me and actually listening to what I say."

Not:

> "An AI is reading questions from a database."

The strongest differentiator is adaptive reasoning.

If the candidate says something unexpected, the interviewer should be able to respond intelligently.

If the candidate demonstrates strong understanding, the interviewer should go deeper.

If the candidate struggles, the interviewer should diagnose the gap.

---

# 35. IMPLEMENTATION PRIORITY

Build in this order:

## P0 — Must work

1. Backend
2. `/api/interview`
3. Session management
4. Candidate loading
5. Curriculum loading
6. LLM integration
7. Adaptive interview engine
8. 8+ questions
9. 4+ curriculum days
10. Final feedback

## P1 — High value

11. Polished interview UI
12. Candidate selector
13. Progress indicator
14. Structured answer evaluation
15. Role-based difficulty
16. Debug panel

## P2 — Polish

17. Animations
18. Better visual feedback
19. Advanced analytics
20. Interview replay
21. Additional evaluation metrics

Prioritize working intelligence over visual complexity.

---

# 36. DELIVERABLES

Create a complete runnable project.

Include:

```text
frontend/
backend/
data/
tests/
README.md
.env.example
```

The README must explain:

* architecture
* setup
* environment variables
* how to run frontend
* how to run backend
* API contract
* interview state machine
* personalization logic
* how the agent satisfies the minimum requirements

---

# 37. FINAL ACCEPTANCE CHECKLIST

Before considering the project complete, verify:

[ ] `POST /api/interview` exists

[ ] First request accepts `sessionId` and candidate

[ ] Subsequent requests accept `sessionId` and message

[ ] Session state persists across requests

[ ] Interview is conversational

[ ] At least 8 questions are asked

[ ] At least 4 curriculum days are covered

[ ] Follow-ups depend on previous answers

[ ] Candidate profile influences questions

[ ] Skipped/failed/high-attempt missions influence strategy appropriately

[ ] Candidate experience affects difficulty

[ ] Conversation context is maintained

[ ] Final response has `done: true`

[ ] Final response contains:
- summary
- strengths
- gaps
- next

[ ] Feedback is based on actual interview performance

[ ] Frontend can start and conduct an interview

[ ] Frontend can display final feedback

[ ] Application handles API/LLM errors gracefully

[ ] No secrets are committed

[ ] README contains setup instructions

---

# 38. BUILD INSTRUCTION

Now inspect the existing project structure.

If the project is empty, scaffold the application.

If code already exists, preserve useful existing code and improve it rather than unnecessarily rewriting everything.

First implement the backend interview engine and API.

Then implement the frontend.

Then add tests.

Then run the application and test the complete interview flow end-to-end.

Do not stop at generating mockups.

Build the actual working application.

After implementation, verify the complete flow:

```text
Select candidate
      ↓
Start interview
      ↓
Question 1
      ↓
Candidate answer
      ↓
Adaptive follow-up
      ↓
Question 2
      ↓
...
      ↓
8+ questions
      ↓
4+ curriculum days
      ↓
Interview complete
      ↓
Structured feedback
```

The final result must be demo-ready for the ABTalks AI Vibe Coding Hackathon.
