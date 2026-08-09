import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

// @ts-expect-error: Route tree generator hasn't picked this up yet
export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

const staticSessions = [
  {
    id: "s1",
    name: "Sarah Johnson — System Design Focus",
    date: "Aug 5, 2026",
    mode: "Live",
    score: 82,
    transcript: [
      {
        q: "How would you design a rate limiter for a distributed API?",
        a: "I would use a token bucket algorithm backed by Redis. Each user gets a bucket with a maximum capacity and a refill rate. Redis handles the atomic decrements and TTLs.",
        feedback:
          "Good choice. Token bucket is standard. You could improve this by mentioning how to handle Redis node failures.",
      },
      {
        q: "What happens if the Redis instance crashes?",
        a: "If Redis crashes, we would either fail open (allow all traffic) or fail closed (block all traffic). Usually, failing open is better for user experience, though it risks overloading the backend.",
        feedback: "Excellent understanding of the trade-offs between fail-open and fail-closed.",
      },
    ],
  },
  {
    id: "s2",
    name: "Mock Interview — Behavioral Panel",
    date: "Aug 2, 2026",
    mode: "Mock",
    score: 91,
    transcript: [
      {
        q: "Tell me about a time you had to deal with a difficult team member.",
        a: "I had a colleague who constantly missed deadlines. I set up a 1-on-1, discovered they were blocked on a dependency, and helped them re-route their tasks so they could continue working.",
        feedback: "Great STAR format answer. Shows empathy and proactive problem-solving.",
      },
      {
        q: "How do you handle scope creep in a project?",
        a: "I try to keep the MVP strict. If new requirements come in, I put them in a backlog and estimate the cost of adding them to the current sprint so stakeholders understand the trade-off.",
        feedback: "Solid practical approach. Clear communication with stakeholders is key.",
      },
    ],
  },
  {
    id: "s3",
    name: "Mock Interview — Algorithms",
    date: "Jul 28, 2026",
    mode: "Mock",
    score: 58,
    transcript: [
      {
        q: "Can you explain how to reverse a linked list?",
        a: "You iterate through the list and keep track of the current node and the next node, and you point the current node's next to the previous node.",
        feedback:
          "The basic idea is there, but you missed handling the edge cases like empty lists or single-node lists.",
      },
      {
        q: "What is the time complexity of your approach?",
        a: "It's O(N^2) because we have to visit every node.",
        feedback:
          "Incorrect. Reversing a linked list linearly is O(N). Review time complexities for basic data structures.",
      },
    ],
  },
];

function HistoryPage() {
  return (
    <div
      className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans selection:bg-[#c084fc]/30 selection:text-white relative"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Premium Navbar */}
      <nav className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center gap-4 sm:gap-8 px-4 sm:px-8 z-50 sticky top-0">
        <Link
          to="/"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
        >
          <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium hidden sm:inline">Back to Home</span>
        </Link>

        <Link to="/" className="flex items-center gap-3 group ml-auto sm:ml-0">
          <div className="bg-linear-to-br from-[#c084fc] to-[#2dd4bf] size-8 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)] group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg leading-none">IQ</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            AB
            <span className="bg-linear-to-r from-[#c084fc] to-[#2dd4bf] text-transparent bg-clip-text">
              InterviewIQ
            </span>
          </span>
        </Link>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center py-12 px-4 sm:px-8 relative bg-black/40">
        <div className="w-full max-w-4xl flex flex-col z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center sm:text-left"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
              Session Replay
            </h1>
            <p className="text-lg text-white/60">
              Revisit past interviews with full transcripts and feedback to see how you've improved
              over time.
            </p>
          </motion.div>

          <div className="flex flex-col gap-6">
            {staticSessions.map((session, i) => {
              const scoreColor =
                session.score >= 80
                  ? "text-green-400 bg-green-400/10 border-green-400/20"
                  : session.score >= 60
                    ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                    : "text-red-400 bg-red-400/10 border-red-400/20";

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                >
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={session.id} className="border-none">
                      <div className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col gap-2">
                          <h2 className="text-xl font-semibold text-white">{session.name}</h2>
                          <div className="flex items-center gap-3 text-sm text-white/50">
                            <span className="flex items-center gap-1">
                              <Clock className="size-4" /> {session.date}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                              {session.mode}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <div className={`px-3 py-1 rounded-full border font-bold ${scoreColor}`}>
                            {session.score}/100
                          </div>
                          <AccordionTrigger className="hover:no-underline py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
                            View Transcript
                          </AccordionTrigger>
                        </div>
                      </div>

                      <AccordionContent className="border-t border-white/5 bg-black/20">
                        <div className="p-6 flex flex-col gap-8">
                          {session.transcript.map((t, idx) => (
                            <div key={idx} className="flex flex-col gap-4">
                              <div className="flex gap-4">
                                <div className="size-8 rounded-full bg-[#2dd4bf]/20 flex items-center justify-center shrink-0">
                                  <span className="text-[#2dd4bf] font-bold text-sm">AI</span>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 text-white/90 leading-relaxed">
                                  {t.q}
                                </div>
                              </div>

                              <div className="flex gap-4 flex-row-reverse">
                                <div className="size-8 rounded-full bg-[#c084fc]/20 flex items-center justify-center shrink-0">
                                  <span className="text-[#c084fc] font-bold text-sm">YOU</span>
                                </div>
                                <div className="bg-[#c084fc]/10 border border-[#c084fc]/20 rounded-2xl rounded-tr-none p-4 text-white leading-relaxed">
                                  {t.a}
                                </div>
                              </div>

                              <div className="ml-12 mr-12 bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 items-start">
                                {t.feedback.includes("Good") ||
                                t.feedback.includes("Great") ||
                                t.feedback.includes("Excellent") ? (
                                  <CheckCircle2 className="size-5 text-green-400 shrink-0 mt-0.5" />
                                ) : (
                                  <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                                )}
                                <p className="text-sm text-white/70 leading-relaxed">
                                  {t.feedback}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
