import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, UserCircle2, Code2, Play, LayoutDashboard, Mic, Send, Target, Briefcase, Loader2 } from "lucide-react";
import { ThinkingTrace } from "../components/interview-iq/ThinkingTrace";
import { ConfidenceMeter } from "../components/interview-iq/ConfidenceMeter";
import { ReportCard } from "../components/interview-iq/ReportCard";
import { StreamingMessage } from "../components/interview/StreamingMessage";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: InterviewIQApp,
});

type AppState = "HOME" | "SETUP" | "LIVE" | "RESULTS";

const TAGLINE = "AI-powered interview practice that adapts to you.";
const QUESTION = "Can you describe a time when you had to optimize a slow-performing React application? What specific metrics did you target?";

function InterviewIQApp() {
  const [appState, setAppState] = useState<AppState>("HOME");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Setup State variables
  const [interviewType, setInterviewType] = useState<"behavioral" | "technical">("behavioral");
  const [persona, setPersona] = useState<"hr" | "tech_lead" | "panel">("hr");

  // Live State variables
  const [livePhase, setLivePhase] = useState<"ai_thinking_1" | "ai_asking" | "user_answering" | "ai_thinking_2" | "done">("ai_thinking_1");
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [celebration, setCelebration] = useState<string | null>(null);

  // Input & Web Speech State
  const [value, setValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseValueRef = useRef("");

  // Results State
  const [resultScore, setResultScore] = useState(0);
  const [originalAnswer, setOriginalAnswer] = useState("");
  const [strongerAnswer, setStrongerAnswer] = useState("");
  const [aiFragments, setAiFragments] = useState<string[]>([
    "Transcribing audio input...",
    "Extracting STAR framework components...",
    "Evaluating use of concrete metrics...",
    "Generating feedback report..."
  ]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Mouse tracking for radial glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // When LIVE starts, simulate thinking, then asking, then wait for user
  useEffect(() => {
    if (appState !== "LIVE") return;

    setLivePhase("ai_thinking_1");
    setConfidenceScore(0);
    setCelebration(null);
    setValue("");

    const t1 = setTimeout(() => {
      setLivePhase("user_answering");
    }, 2000); 

    return () => clearTimeout(t1);
  }, [appState]);

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    baseValueRef.current = value + (value && !value.endsWith(" ") ? " " : "");
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentText = baseValueRef.current + finalTranscript;
      setValue(currentText + interimTranscript);
      // Simulate confidence score rising as they speak
      setConfidenceScore(Math.min(100, Math.max(10, currentText.length / 3)));
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const submitAnswer = async () => {
    if (!value.trim()) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    
    setOriginalAnswer(value.trim());
    setLivePhase("ai_thinking_2");

    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: QUESTION,
          answer: value.trim(),
          persona,
        }),
      });
      
      const data = await response.json();
      
      if (data.score !== undefined) {
        setResultScore(data.score);
        setStrongerAnswer(data.strongerAnswer);
        setAiFragments(data.fragments || aiFragments);
      } else {
        throw new Error(data.error || "Failed to evaluate");
      }
    } catch (err) {
      console.error(err);
      setResultScore(0);
      setStrongerAnswer("Sorry, I encountered an error evaluating your answer.");
    }

    setAppState("RESULTS");
  };

  const handleStart = () => {
    setAppState("LIVE");
  };

  const handleRestart = () => {
    setAppState("SETUP");
  };

  const navigateTo = (state: AppState) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setAppState(state);
      setIsTransitioning(false);
    }, 400); // simulate short loading state
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans text-foreground selection:bg-primary/20 selection:text-indigo-900">
      {/* Premium Navbar */}
      <nav className="h-20 border-b border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 z-50 sticky top-0">
        <Link 
          to="/"
          onClick={() => setAppState("HOME")}
          className="flex items-center gap-3 group"
        >
          <div className="bg-linear-to-br from-primary to-chart-2 size-8 rounded-lg flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg leading-none">IQ</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            AB<span className="text-primary">InterviewIQ</span>
          </span>
        </Link>
        
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        
        {/* Abstract Background Decoration (Static) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-120 h-120 bg-chart-2/10 rounded-full blur-3xl pointer-events-none" />

        {/* Interactive Radial Glow */}
        <div 
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139, 92, 246, 0.08), transparent 40%)`
          }}
        />

        <AnimatePresence mode="wait">
          {isTransitioning && (
            <motion.div
              key="transition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm"
            >
              <Loader2 className="size-10 text-primary animate-spin" />
            </motion.div>
          )}
          
          {/* HOME SCREEN */}
          {!isTransitioning && appState === "HOME" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-2xl bg-card rounded-3xl shadow-panel border border-border p-10 flex flex-col gap-10 z-10 text-center relative"
            >
              <div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">Welcome to ABInterviewIQ</h1>
                <p className="text-muted-foreground mt-3 text-lg font-medium">{TAGLINE}</p>
                <p className="text-muted-foreground/70 mt-1 text-sm">Choose an interview mode to begin your journey.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center mt-4">
                <button 
                  onClick={() => navigateTo("SETUP")}
                  className="flex-1 flex flex-col items-center gap-4 bg-card border border-border hover:border-primary/50 hover:bg-primary/5 p-8 rounded-2xl transition-all group cursor-pointer"
                >
                  <div className="bg-primary/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                    <Target className="size-8 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-foreground">Practice Mode</div>
                    <div className="text-sm text-muted-foreground mt-2 leading-relaxed">Hone your skills in a low-pressure simulated environment.</div>
                  </div>
                </button>
                <Link 
                  to="/dashboard"
                  className="flex-1 flex flex-col items-center gap-4 bg-card border border-border hover:border-chart-2/50 hover:bg-chart-2/5 p-8 rounded-2xl transition-all group cursor-pointer"
                >
                  <div className="bg-chart-2/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                    <Briefcase className="size-8 text-chart-2" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-foreground">Live Interview</div>
                    <div className="text-sm text-muted-foreground mt-2 leading-relaxed">Start the adaptive technical interview session.</div>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}

          {/* SETUP SCREEN */}
          {!isTransitioning && appState === "SETUP" && (
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
          {!isTransitioning && appState === "LIVE" && (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, filter: "blur(10px)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full flex flex-col gap-6 items-center z-10 relative"
            >
              <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 items-stretch justify-center relative z-10">
              {/* Left Column: AI Interface */}
              <div className="flex-1 flex flex-col gap-8 w-full max-w-xl relative">
                
                {/* AI Question Box */}
                <div className="bg-card p-8 rounded-3xl shadow-panel border border-border flex flex-col gap-6 relative overflow-hidden h-full">
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
                    {livePhase === "ai_thinking_1" ? (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground bg-surface-raised border border-border p-4 w-fit">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        <span className="animate-pulse">Analyzing context and formulating question...</span>
                      </div>
                    ) : (
                      <StreamingMessage content={QUESTION} />
                    )}
                  </div>
                </div>

                {/* Thinking Trace Drawer/Panel */}
                <div className="absolute top-[105%] left-0 w-full z-20">
                  <ThinkingTrace 
                    isThinking={livePhase === "ai_thinking_1" || livePhase === "ai_thinking_2"} 
                    fragments={
                      livePhase === "ai_thinking_1" 
                        ? [
                            "Loading standard technical baseline...",
                            "Selecting a core concept to test...",
                            "Calibrating technical depth for target role...",
                            "Formulating adaptive technical question..."
                          ]
                        : aiFragments
                    }
                  />
                </div>
              </div>

              {/* Right Column: User Interface / Input */}
              <div className="flex-1 flex flex-col gap-4 max-w-xl w-full">
                
                <div className="flex-1 bg-card rounded-3xl shadow-panel border border-border p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="font-semibold text-foreground uppercase tracking-wider text-sm">Your Answer</h3>
                    <ConfidenceMeter 
                      isSpeaking={isRecording} 
                      confidenceScore={confidenceScore} 
                      celebration={celebration} 
                    />
                  </div>
                  
                  <div className="flex-1 relative flex flex-col min-h-32">
                    <Textarea
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitAnswer();
                      }}
                      placeholder={isRecording ? "Listening..." : "Type or speak your answer..."}
                      className={`flex-1 resize-none bg-background/50 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl p-4 text-base leading-relaxed ${isRecording ? 'border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : ''}`}
                      disabled={livePhase !== "user_answering"}
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <Button 
                      onClick={toggleRecording} 
                      variant="outline" 
                      size="lg" 
                      disabled={livePhase !== "user_answering"}
                      className={`transition-all rounded-full px-6 gap-2 ${isRecording ? 'bg-red-500/10 text-red-500 border-red-500 animate-pulse hover:bg-red-500/20 hover:text-red-500' : 'hover:text-primary hover:border-primary'}`}
                    >
                      <Mic className="size-5" />
                      {isRecording ? "Stop Recording" : "Use Voice"}
                    </Button>
                    <Button 
                      onClick={submitAnswer} 
                      disabled={livePhase !== "user_answering" || !value.trim()} 
                      size="lg" 
                      className="rounded-full px-8 shadow-(--shadow-glow) gap-2"
                    >
                      <Send className="size-4" />
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
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
                score={resultScore} 
                originalAnswer={originalAnswer}
                strongerAnswer={strongerAnswer}
                onRestart={handleRestart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
