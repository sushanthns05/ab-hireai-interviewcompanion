import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, UserCircle2, Code2, Play, LayoutDashboard } from "lucide-react";
import { ThinkingTrace } from "../components/interview-iq/ThinkingTrace";
import { ConfidenceMeter } from "../components/interview-iq/ConfidenceMeter";
import { ReportCard } from "../components/interview-iq/ReportCard";

export const Route = createFileRoute("/")({
  component: InterviewIQApp,
});

type AppState = "SETUP" | "LIVE" | "RESULTS";

function InterviewIQApp() {
  const [appState, setAppState] = useState<AppState>("SETUP");

  // Setup State variables
  const [interviewType, setInterviewType] = useState<"behavioral" | "technical">("behavioral");
  const [persona, setPersona] = useState<"hr" | "tech_lead" | "panel">("hr");

  // Live State variables
  const [livePhase, setLivePhase] = useState<"ai_thinking_1" | "ai_asking" | "user_answering" | "ai_thinking_2">("ai_thinking_1");
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [celebration, setCelebration] = useState<string | null>(null);

  // Simulated Interview Flow
  useEffect(() => {
    if (appState !== "LIVE") return;

    // Reset sequence
    setLivePhase("ai_thinking_1");
    setConfidenceScore(0);
    setCelebration(null);

    // 1. AI Thinks (generating question)
    const t1 = setTimeout(() => {
      setLivePhase("ai_asking");
    }, 4000); // 4 seconds of thinking

    // 2. AI Asks, then User Answers
    const t2 = setTimeout(() => {
      setLivePhase("user_answering");
      
      // Simulate confidence score rising
      let score = 20;
      const scoreInterval = setInterval(() => {
        score += Math.random() * 15;
        if (score > 85) score = 88;
        setConfidenceScore(score);
        
        if (score > 60 && !celebration) {
          setCelebration("Great STAR metric!");
          setTimeout(() => setCelebration(null), 3000);
        }
      }, 1000);

      // Stop answering after a few seconds
      setTimeout(() => {
        clearInterval(scoreInterval);
        setLivePhase("ai_thinking_2");
      }, 7000); // 7 seconds of answering
      
    }, 6000); // 2 seconds of asking

    // 3. AI Thinks (evaluating)
    const t3 = setTimeout(() => {
      setAppState("RESULTS");
    }, 18000); // end of sequence

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [appState]);

  const handleStart = () => {
    setAppState("LIVE");
  };

  const handleRestart = () => {
    setAppState("SETUP");
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans text-foreground selection:bg-primary/20 selection:text-indigo-900">
      {/* Premium Navbar */}
      <nav className="h-20 border-b border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-linear-to-br from-primary to-chart-2 size-8 rounded-lg flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-lg leading-none">IQ</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            AB<span className="text-primary">InterviewIQ</span>
          </span>
        </div>
        
        {/* We keep a backdoor to the original dashboard just in case */}
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <Play className="size-4 text-primary group-hover:scale-110 transition-transform" />
          Start Real Interview
        </Link>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-120 h-120 bg-chart-2/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          
          {/* SETUP SCREEN */}
          {appState === "SETUP" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-2xl bg-card rounded-3xl shadow-panel border border-border p-10 flex flex-col gap-10 z-10"
            >
              <div className="text-center">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Configure Interview</h1>
                <p className="text-muted-foreground mt-2">Tailor your mock session to your exact needs.</p>
              </div>

              <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
                {/* Configuration Options */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                      Type
                    </label>
                    <div className="flex bg-muted p-1 rounded-xl">
                      <button 
                        onClick={() => setInterviewType("behavioral")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${interviewType === 'behavioral' ? 'bg-card shadow-glow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        Behavioral
                      </button>
                      <button 
                        onClick={() => setInterviewType("technical")}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${interviewType === 'technical' ? 'bg-card shadow-glow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        Technical
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold text-foreground uppercase tracking-wide">
                      Persona
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setPersona("hr")}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${persona === 'hr' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/50'}`}
                      >
                        <UserCircle2 className="size-4" />
                        Friendly HR
                      </button>
                      <button 
                        onClick={() => setPersona("tech_lead")}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${persona === 'tech_lead' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:border-primary/50'}`}
                      >
                        <Code2 className="size-4" />
                        Tech Lead
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <button 
                  onClick={handleStart}
                  className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:hover:bg-primary/80 hover:shadow-glow transition-all active:scale-95"
                >
                  <Play className="size-5 fill-current" />
                  Start Mock Interview
                </button>
              </div>
            </motion.div>
          )}

          {/* LIVE SCREEN */}
          {appState === "LIVE" && (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full max-w-5xl flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center z-10"
            >
              {/* Left Column: AI Interface */}
              <div className="flex-1 flex flex-col gap-8 w-full max-w-lg relative">
                
                {/* AI Question Box */}
                <div className="bg-card p-8 rounded-3xl shadow-panel border border-border flex flex-col gap-6 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 size-10 rounded-full flex items-center justify-center shrink-0">
                      <UserCircle2 className="size-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground leading-tight">AI Interviewer</h3>
                      <p className="text-xs text-muted-foreground font-medium">Tech Lead Persona</p>
                    </div>
                  </div>
                  
                  <div className="text-lg text-foreground leading-relaxed font-medium min-h-20">
                    {livePhase === "ai_thinking_1" && <span className="text-muted-foreground italic">Thinking...</span>}
                    {livePhase !== "ai_thinking_1" && "Can you describe a time when you had to optimize a slow-performing React application? What specific metrics did you target?"}
                  </div>
                </div>

                {/* Thinking Trace Drawer/Panel */}
                <div className="absolute top-[110%] left-0 w-full z-20">
                  <ThinkingTrace 
                    isThinking={livePhase === "ai_thinking_1" || livePhase === "ai_thinking_2"} 
                    fragments={
                      livePhase === "ai_thinking_1" 
                        ? [
                            "Analyzing uploaded resume context...",
                            "Detected 'React Performance' bullet in Job #2...",
                            "Calibrating technical depth for Mid-Level role...",
                            "Formulating behavioral + technical hybrid question..."
                          ]
                        : [
                            "Transcribing audio input...",
                            "Extracting STAR framework components...",
                            "Evaluating use of concrete metrics...",
                            "Generating feedback report..."
                          ]
                    }
                  />
                </div>
              </div>

              {/* Right Column: User Interface / Confidence Meter */}
              <div className="flex flex-col items-center gap-4">
                <ConfidenceMeter 
                  isSpeaking={livePhase === "user_answering"} 
                  confidenceScore={confidenceScore} 
                  celebration={celebration} 
                />
                
                {livePhase === "user_answering" && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-card px-4 py-2 rounded-full shadow-glow border border-border text-sm font-medium text-muted-foreground animate-pulse"
                  >
                    Speak now...
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* RESULTS SCREEN */}
          {appState === "RESULTS" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full z-10"
            >
              <ReportCard 
                score={88} 
                originalAnswer="Well, the app was really slow when we loaded the list. So I looked at the components and added useMemo in a few places and it got faster. We didn't really measure it but the users were happy."
                strongerAnswer="I identified a critical render bottleneck in our main List component using React Profiler. By implementing useMemo for the expensive data sorting and virtualizing the list with react-window, we reduced time-to-interactive from 3.2s to 0.8s, resulting in a 40% drop in user complaints regarding page load."
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
