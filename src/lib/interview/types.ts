// Shared types for the Interview Agent. Safe to import from client code.

export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface CandidateMission {
  day: number;
  title: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface Candidate {
  member: CandidateMember;
  missions: CandidateMission[];
  signals: CandidateSignals;
}

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
  module?: { n: number; title: string };
}

export type InterviewPhase =
  | "INTRO"
  | "BASELINE"
  | "DEEP_DIVE"
  | "CROSS_DOMAIN"
  | "SCENARIO"
  | "FINAL"
  | "FEEDBACK";

export type InterviewAction =
  | "PROBE_DEEPER"
  | "CLARIFY"
  | "CHALLENGE"
  | "COUNTEREXAMPLE"
  | "SCENARIO"
  | "TRADEOFF"
  | "CHANGE_TOPIC"
  | "INCREASE_DIFFICULTY"
  | "DECREASE_DIFFICULTY";

export interface AnswerEvaluation {
  technicalCorrectness: number;
  conceptualDepth: number;
  practicalUnderstanding: number;
  reasoning: number;
  communication: number;
  confidence: number;
  correctConcepts: string[];
  missingConcepts: string[];
  incorrectConcepts: string[];
  strengths: string[];
  gaps: string[];
  recommendedAction: InterviewAction;
}

export interface QuestionRecord {
  questionNumber: number;
  curriculumDay: number;
  topic: string;
  question: string;
  reason: string;
  difficulty: number;
  phase: InterviewPhase;
  action: InterviewAction | "OPENING";
  answer?: string;
  evaluation?: AnswerEvaluation;
}

export interface ChatMessage {
  role: "interviewer" | "candidate";
  content: string;
  at: number;
}

export interface InterviewFeedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface InterviewSession {
  sessionId: string;
  candidate: Candidate;
  startedAt: number;
  questionCount: number;
  targetQuestions: number;
  coveredDays: number[];
  coveredModules: number[];
  conversationHistory: ChatMessage[];
  questionHistory: QuestionRecord[];
  plannedDays: number[];
  followUpCount: number;
  difficultyLevel: number;
  interviewPhase: InterviewPhase;
  lastQuestion?: string;
  lastAnswer?: string;
  currentDay?: number;
  completed: boolean;
  feedback?: InterviewFeedback;
  /** Prompt guardrail note about skipped curriculum days. */
  skippedNote?: string;
}

/** Non-sensitive session view used by the demo debug panel. */
export interface DebugState {
  sessionId: string;
  interviewPhase: InterviewPhase;
  questionCount: number;
  targetQuestions: number;
  difficultyLevel: number;
  currentDay?: number;
  coveredDays: number[];
  coveredModules: number[];
  followUpCount: number;
  completed: boolean;
  lastAction?: string;
  lastReason?: string;
}

export interface InterviewApiResponse {
  reply: string;
  done: boolean;
  feedback?: InterviewFeedback;
}
