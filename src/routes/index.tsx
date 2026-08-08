import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, UserCircle2, Code2, Play, LayoutDashboard, Mic, Send, Target, Briefcase, Loader2, ArrowRight, ArrowLeft, Brain, MessageSquareText, ShieldCheck, BarChart3, History } from "lucide-react";
import { ThinkingTrace } from "../components/interview-iq/ThinkingTrace";
import { ConfidenceMeter } from "../components/interview-iq/ConfidenceMeter";
import { ReportCard } from "../components/interview-iq/ReportCard";
import { StreamingMessage } from "../components/interview/StreamingMessage";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: InterviewIQApp,
});

type AppState = "HOME" | "SETUP" | "LIVE" | "RESULTS" | "HISTORY";

export interface PastSession {
  id: string;
  date: string;
  type: string;
  persona: string;
  score: number;
  messages: {role: "user" | "assistant", content: string}[];
  strongerAnswer: string;
  fragments: string[];
  terminated?: boolean;
}


function cleanAiText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s*undefined\s*$/i, "").trim();
}

function InterviewIQApp() {
  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");

  const [appState, setAppState] = useState<AppState>("HOME");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // History State
  const [sessions, setSessions] = useState<PastSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<PastSession | null>(null);

  useEffect(() => {
    if (appState === "HISTORY") {
      try {
        const existing = JSON.parse(localStorage.getItem('hireai_sessions') || '[]');
        setSessions(existing);
      } catch (e) {
        setSessions([]);
      }
      setSelectedSession(null);
    }
  }, [appState]);

  // Check URL for initial setup state
  useEffect(() => {
    if (window.location.search.includes("state=setup") || window.location.hash === "#setup") {
      setAppState("SETUP");
    }
  }, []);

  // Setup State variables
  const [interviewType, setInterviewType] = useState<"behavioral" | "technical">("behavioral");
  const [persona, setPersona] = useState<"hr" | "tech_lead" | "panel">("hr");
  const [isTerminated, setIsTerminated] = useState(false);

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

  // Focus Mode State
  const [focusWarning, setFocusWarning] = useState<string | null>(null);
  const [focusViolations, setFocusViolations] = useState<number>(0);

  // Focus Mode Enforcement
  useEffect(() => {
    if (appState !== "LIVE") {
      setFocusWarning(null);
      setFocusViolations(0);
      return;
    }

    const handleViolation = (message: string) => {
      setFocusViolations(prev => {
        const newCount = prev + 1;
        if (newCount >= 4) {
          setFocusWarning("Interview terminated due to multiple focus mode violations (4/4).");
          endInterview(true);
        } else {
          setFocusWarning(`${message} (Warning ${newCount}/3)`);
        }
        return newCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !focusWarning) {
        handleViolation("Tab switch detected. Please stay focused on the interview.");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !focusWarning) {
        handleViolation("Fullscreen exited. Please return to fullscreen to continue.");
      }
    };

    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation("Copying text is not allowed.");
    };

    const preventShortcuts = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && ['c', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        handleViolation("Shortcuts are disabled.");
      }
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        handleViolation("Taking screenshots is prohibited.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", preventCopy);
    document.addEventListener("keydown", preventShortcuts);
    document.addEventListener("keyup", preventShortcuts);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", preventCopy);
      document.removeEventListener("keydown", preventShortcuts);
      document.removeEventListener("keyup", preventShortcuts);
    };
  }, [appState, focusWarning]);
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

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.appState) {
        setAppState(e.state.appState);
      } else {
        setAppState("HOME");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // We no longer simulate thinking on start with a timeout; we will do it in handleStart
  useEffect(() => {
    if (appState !== "LIVE") return;
    setConfidenceScore(0);
    setCelebration(null);
    setValue("");
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
    
    const userMessage = value.trim();
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setValue("");
    setLivePhase("ai_thinking_1"); // Show thinking state while getting next question

    try {
      const response = await fetch("/api/interview-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          interviewType,
          persona,
        }),
      });
      
      const data = await response.json();
      const cleanResponse = cleanAiText(data.response);
      if (cleanResponse) {
        setMessages([...newMessages, { role: "assistant", content: cleanResponse }]);
        setCurrentQuestion(cleanResponse);
        if (data.fragments) setAiFragments(data.fragments);
        setLivePhase("user_answering");
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (err) {
      console.error(err);
      setCurrentQuestion("I seem to be having trouble connecting. Could you repeat that?");
      setLivePhase("user_answering");
    }
  };

  const endInterview = async (isViolation = false) => {
    if (isViolation) setIsTerminated(true);

    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn("Exit fullscreen failed", err);
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    setLivePhase("ai_thinking_2");
    
    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          persona,
        }),
      });
      
      const data = await response.json();
      
      if (data.score !== undefined) {
        const parsedStrongerAnswer = cleanAiText(data.strongerAnswer);
        const parsedFragments = data.fragments || aiFragments;
        
        setResultScore(data.score);
        setStrongerAnswer(parsedStrongerAnswer);
        setAiFragments(parsedFragments);

        // Save to LocalStorage
        const session: PastSession = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          type: interviewType,
          persona,
          score: data.score,
          messages,
          strongerAnswer: parsedStrongerAnswer,
          fragments: parsedFragments,
          terminated: isViolation
        };
        try {
          const existing = JSON.parse(localStorage.getItem('hireai_sessions') || '[]');
          localStorage.setItem('hireai_sessions', JSON.stringify([session, ...existing].slice(0, 50)));
        } catch (e) {
          console.error("Failed to save session history", e);
        }
      } else {
        throw new Error(data.error || "Failed to evaluate");
      }
    } catch (err) {
      console.error(err);
      setResultScore(0);
      setStrongerAnswer("Sorry, I encountered an error evaluating your interview.");
    }

    setAppState("RESULTS");
  };

  const handleStart = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen request failed", err);
    }

    setAppState("LIVE");
    setLivePhase("ai_thinking_1");
    setMessages([]);
    
    try {
      const response = await fetch("/api/interview-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          interviewType,
          persona,
        }),
      });
      
      const data = await response.json();
      const cleanResponse = cleanAiText(data.response);
      if (cleanResponse) {
        setMessages([{ role: "assistant", content: cleanResponse }]);
        setCurrentQuestion(cleanResponse);
        if (data.fragments) setAiFragments(data.fragments);
        setLivePhase("user_answering");
      } else {
        throw new Error(data.error || "Failed to start");
      }
    } catch (err) {
      console.error(err);
      setCurrentQuestion("Hello! I am ready to begin your mock interview. Tell me when you are ready.");
      setLivePhase("user_answering");
    }
  };

  const handleRestart = () => {
    setAppState("SETUP");
    setIsTerminated(false);
  };

  const navigateTo = (state: AppState) => {
    window.history.pushState({ appState: state }, "", `?state=${state.toLowerCase()}`);
    setIsTransitioning(true);
    setTimeout(() => {
      setAppState(state);
      setIsTransitioning(false);
    }, 400); // simulate short loading state
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col bg-background text-foreground font-sans selection:bg-[#c084fc]/30 selection:text-white relative"
      style={{
        backgroundImage: "url('/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Premium Navbar */}
      <nav className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center justify-between px-8 z-50 sticky top-0">
        <Link 
          to="/"
          onClick={() => setAppState("HOME")}
          className="flex items-center gap-3 group"
        >
          <div className="bg-linear-to-br from-[#c084fc] to-[#2dd4bf] size-8 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)] group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg leading-none">IQ</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            AB<span className="bg-linear-to-r from-[#c084fc] to-[#2dd4bf] text-transparent bg-clip-text">InterviewIQ</span>
          </span>
        </Link>
        
        
      </nav>

      {/* FOCUS WARNING OVERLAY */}
      <AnimatePresence>
        {appState === "LIVE" && focusWarning && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-8 text-center"
          >
            <ShieldCheck className="size-24 text-red-500 mb-6 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Focus Mode Violation</h2>
            <p className="text-lg text-white/70 max-w-lg mb-8 leading-relaxed">
              {focusWarning}
              <br /><br />
              Live Interviews require your full attention to simulate a real environment. No shortcuts, no second tabs.
            </p>
            <Button 
              size="lg" 
              variant="destructive"
              className="px-8 py-6 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all"
              onClick={async () => {
                setFocusWarning(null);
                try {
                  if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                  }
                } catch(e) {}
              }}
            >
              Return to Interview
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-black/40">
        
        {/* Removed Static Abstract Background Decoration to use the new image */}

        {/* Interactive Radial Glow */}
        <div 
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(192, 132, 252, 0.05), transparent 40%)`
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
              className="w-full max-w-5xl flex flex-col items-center gap-10 sm:gap-12 z-10 text-center relative px-4 pb-24"
            >
              {/* Top Text Content */}
              <div className="flex flex-col items-center mt-8 sm:mt-12 max-w-3xl">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                  <div className="size-2 rounded-full bg-[#2dd4bf] shadow-[0_0_8px_rgba(45,212,191,0.8)]"></div>
                  <span className="text-white/80 text-sm font-medium">AI-powered interview practice</span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 text-white leading-[1.1] max-w-[800px]">
                  Turn interview anxiety into <span className="bg-linear-to-r from-[#c084fc] to-[#2dd4bf] text-transparent bg-clip-text">confidence.</span>
                </h1>

                {/* Subtext */}
                <p className="text-white/60 text-lg sm:text-xl max-w-[600px] leading-relaxed mx-auto">
                  Practice realistic interviews, sharpen your answers, and get instant AI feedback — built to adapt to your skill level.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-4 justify-center mt-2">
                <button
                  onClick={() => navigateTo("SETUP")}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-[#c084fc] to-[#2dd4bf] text-white font-bold text-lg hover:opacity-90 transition-opacity active:scale-95 shadow-[0_0_20px_rgba(192,132,252,0.3)]"
                >
                  Start Practicing
                  <ArrowRight className="size-5" />
                </button>
                <Link
                  to="/features"
                  className="flex items-center justify-center px-8 py-4 rounded-2xl border border-white/20 text-white font-bold text-lg bg-white/5 hover:bg-white/10 transition-colors active:scale-95"
                >
                  Explore features
                </Link>
              </div>

              {/* Cards row below CTAs */}
              <div className="w-full flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mt-8 sm:mt-12">
                <button 
                  onClick={() => navigateTo("SETUP")}
                  className="flex-1 flex flex-col items-start text-left gap-4 bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-[#2dd4bf]/50 hover:bg-white/5 p-6 sm:p-8 rounded-3xl transition-all group cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                  <div className="bg-[#2dd4bf]/10 p-3 rounded-full group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                    <Target className="size-6 text-[#2dd4bf]" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg sm:text-xl text-white group-hover:text-[#2dd4bf] transition-colors">Mock Interview</div>
                    <div className="text-sm text-white/50 mt-2 leading-relaxed">Hone your skills in a low-pressure simulated environment.</div>
                  </div>
                </button>
                <button 
                  onClick={() => navigateTo("HISTORY")}
                  className="flex-1 flex flex-col items-start text-left gap-4 bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-[#c084fc]/50 hover:bg-white/5 p-6 sm:p-8 rounded-3xl transition-all group cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                  <div className="bg-[#c084fc]/10 p-3 rounded-full group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(192,132,252,0.2)]">
                    <History className="size-6 text-[#c084fc]" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg sm:text-xl text-white group-hover:text-[#c084fc] transition-colors">Session Replay</div>
                    <div className="text-sm text-white/50 mt-2 leading-relaxed">Revisit past interviews with full transcripts and feedback.</div>
                  </div>
                </button>
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
              className="w-full max-w-2xl bg-card rounded-3xl shadow-panel border border-border p-6 sm:p-10 flex flex-col gap-8 sm:gap-10 z-10 relative"
            >
              <button 
                onClick={() => {
                  window.history.back(); // Use browser back to maintain history stack
                  // Fallback if no history
                  if (window.history.state === null) navigateTo("HOME");
                }}
                className="absolute top-4 left-4 sm:top-8 sm:left-8 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors group"
                aria-label="Go back"
              >
                <ArrowLeft className="size-6 group-hover:-translate-x-1 transition-transform" />
              </button>
              
              <div className="text-center mt-8 sm:mt-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">Configure Interview</h1>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
              className="w-full flex flex-col gap-6 items-center z-10 relative select-none"
            >
              <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch justify-center relative z-10">
              {/* Left Column: AI Interface */}
              <div className="flex-1 flex flex-col gap-8 w-full max-w-xl relative">
                
                {/* AI Question Box */}
                <div className="bg-card p-6 sm:p-8 rounded-3xl shadow-panel border border-border flex flex-col gap-6 relative overflow-hidden h-full">
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
                      <StreamingMessage content={currentQuestion} />
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

                  <div className="flex flex-wrap justify-center sm:justify-end gap-2 sm:gap-3 mt-2">
                    <Button 
                      onClick={toggleRecording} 
                      variant="outline" 
                      size="lg" 
                      disabled={livePhase !== "user_answering"}
                      className={`transition-all rounded-full px-4 sm:px-6 gap-1 sm:gap-2 text-sm sm:text-base ${isRecording ? 'bg-red-500/10 text-red-500 border-red-500 animate-pulse hover:bg-red-500/20 hover:text-red-500' : 'hover:text-primary hover:border-primary'}`}
                    >
                      <Mic className="size-5" />
                      {isRecording ? "Stop Recording" : "Use Voice"}
                    </Button>
                    <Button 
                      onClick={submitAnswer} 
                      size="lg"
                      className="rounded-full px-4 sm:px-6 gap-1 sm:gap-2 text-sm sm:text-base"
                      disabled={!value.trim() || livePhase !== "user_answering"}
                    >
                      <ArrowRight className="size-5" />
                      Submit Answer
                    </Button>
                    <Button 
                      onClick={() => endInterview(false)} 
                      size="lg"
                      variant="destructive"
                      className="rounded-full px-4 sm:px-6 gap-1 sm:gap-2 text-sm sm:text-base"
                      disabled={livePhase !== "user_answering"}
                    >
                      End Interview
                    </Button>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS SCREEN */}
          {!isTransitioning && appState === "RESULTS" && (
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
                originalAnswer={isTerminated ? "Session was terminated early." : "Full mock interview completed. See the stronger version for overall feedback."}
                strongerAnswer={strongerAnswer}
                onRestart={handleRestart}
                terminated={isTerminated}
              />
            </motion.div>
          )}

          {/* HISTORY SCREEN */}
          {!isTransitioning && appState === "HISTORY" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-5xl flex flex-col items-center gap-8 z-10 relative"
            >
              <div className="w-full flex justify-between items-center mb-4">
                <button 
                  onClick={() => navigateTo("HOME")}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="size-5" />
                  <span>Back to Home</span>
                </button>
                <h1 className="text-3xl font-bold text-white tracking-tight">Session Replay</h1>
                <div className="w-[100px]"></div> {/* spacer */}
              </div>

              {!selectedSession ? (
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.length === 0 ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                      <div className="bg-white/5 p-6 rounded-full inline-block">
                        <History className="size-12 text-white/20" />
                      </div>
                      <h3 className="text-xl font-medium text-white">No sessions yet</h3>
                      <p className="text-white/50 max-w-sm">Complete a mock interview to see your transcripts and feedback here.</p>
                      <button 
                        onClick={() => navigateTo("SETUP")}
                        className="mt-4 px-6 py-3 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors font-semibold"
                      >
                        Start Practicing
                      </button>
                    </div>
                  ) : (
                    sessions.map(session => (
                      <div 
                        key={session.id}
                        onClick={() => setSelectedSession(session)}
                        className="bg-card hover:bg-white/5 cursor-pointer border border-border p-6 rounded-3xl flex flex-col gap-4 transition-all hover:scale-[1.02] shadow-panel"
                      >
                        <div className="flex justify-between items-start">
                          <div className="bg-primary/10 text-primary p-2 rounded-xl">
                            <Target className="size-5" />
                          </div>
                          <div className="text-sm font-semibold text-white/60 bg-white/5 px-3 py-1 rounded-full">
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1 capitalize">{session.type} Interview</h3>
                          <p className="text-sm text-white/50 capitalize">Persona: {session.persona.replace('_', ' ')}</p>
                        </div>
                        <div className="mt-auto pt-4 border-t border-border flex justify-between items-end">
                          <div>
                            <div className="text-sm text-white/50 mb-1">Score</div>
                            <div className={`text-2xl font-black ${session.score >= 80 ? 'text-green-400' : session.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {session.score}/100
                            </div>
                          </div>
                          <ArrowRight className="size-5 text-white/30" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="w-full bg-card rounded-3xl border border-border shadow-panel flex flex-col lg:flex-row overflow-hidden max-h-[75vh]">
                  {/* Left Column: Transcript */}
                  <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-border max-h-[50vh] lg:max-h-none">
                    <div className="p-6 border-b border-border flex justify-between items-center bg-black/20">
                      <h2 className="text-xl font-bold text-white">Full Transcript</h2>
                      <button onClick={() => setSelectedSession(null)} className="text-sm font-medium text-white/60 hover:text-white px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
                        Close Details
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                      {selectedSession.messages.filter(m => m.content.trim()).map((msg, i) => (
                        <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`size-8 shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/70'}`}>
                            {msg.role === 'user' ? <UserCircle2 className="size-4" /> : <ShieldCheck className="size-4" />}
                          </div>
                          <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-sm'}`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Right Column: Feedback */}
                  <div className="flex-1 flex flex-col bg-black/40 overflow-y-auto max-h-[50vh] lg:max-h-none">
                    <div className="p-6 border-b border-border sticky top-0 bg-black/40 backdrop-blur-xl z-10 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-white">Feedback Report</h2>
                      <div className={`px-4 py-1.5 rounded-full text-lg font-bold border ${selectedSession.score >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/30' : selectedSession.score >= 60 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                        {selectedSession.score}/100
                      </div>
                    </div>
                    <div className="p-6 flex flex-col gap-8">
                      <div>
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                          <MessageSquareText className="size-4" />
                          Evaluation
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                          {selectedSession.fragments.map((frag, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                              <Target className="size-4 text-primary shrink-0 mt-1" />
                              <span className="text-sm text-white/80 leading-relaxed">{frag}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Target className="size-4" />
                          Ideal Response Strategy
                        </h3>
                        <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl text-sm leading-relaxed text-white/90">
                          {selectedSession.strongerAnswer}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
