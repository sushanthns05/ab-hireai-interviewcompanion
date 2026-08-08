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

type AppState = "HOME" | "SETUP" | "LIVE" | "RESULTS";


function cleanAiText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s*undefined\s*$/i, "").trim();
}

function InterviewIQApp() {
  const [messages, setMessages] = useState<{role: "user" | "assistant", content: string}[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");

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

  const endInterview = async () => {
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
        setResultScore(data.score);
        setStrongerAnswer(cleanAiText(data.strongerAnswer));
        setAiFragments(data.fragments || aiFragments);
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
                <button
                  onClick={() => {
                    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center justify-center px-8 py-4 rounded-2xl border border-white/20 text-white font-bold text-lg bg-white/5 hover:bg-white/10 transition-colors active:scale-95"
                >
                  Explore features
                </button>
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
                <Link 
                  to="/dashboard"
                  className="flex-1 flex flex-col items-start text-left gap-4 bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-[#c084fc]/50 hover:bg-white/5 p-6 sm:p-8 rounded-3xl transition-all group cursor-pointer shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                >
                  <div className="bg-[#c084fc]/10 p-3 rounded-full group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(192,132,252,0.2)]">
                    <Briefcase className="size-6 text-[#c084fc]" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg sm:text-xl text-white group-hover:text-[#c084fc] transition-colors">Live Interview</div>
                    <div className="text-sm text-white/50 mt-2 leading-relaxed">Start the adaptive technical interview session.</div>
                  </div>
                </Link>
              </div>

              {/* Features Section */}
              <motion.div 
                id="features-section"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full pt-16 sm:pt-24 mt-8 sm:mt-12 border-t border-white/10 flex flex-col items-center"
              >
                <h3 className="text-3xl sm:text-4xl font-bold text-white mb-12 tracking-tight">
                  Everything you need to walk in ready.
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full text-left">
                  {[
                    {
                      icon: Brain,
                      title: "Adaptive Difficulty",
                      description: "Questions adjust in real time based on how well you're answering — no fixed script.",
                      color: "teal"
                    },
                    {
                      icon: MessageSquareText,
                      title: "Instant AI Feedback",
                      description: "Get scored on clarity, correctness, and structure right after every answer, not just at the end.",
                      color: "purple"
                    },
                    {
                      icon: ShieldCheck,
                      title: "Focus Mode for Live Sessions",
                      description: "Tab-switch detection and fullscreen enforcement keep Live Interviews as close to the real thing as possible.",
                      color: "teal"
                    },
                    {
                      icon: BarChart3,
                      title: "Performance Analytics",
                      description: "Track score trends across sessions and see exactly which topics need more practice.",
                      color: "purple"
                    },
                    {
                      icon: History,
                      title: "Session Replay",
                      description: "Revisit past interviews with full transcripts and feedback to see how you've improved.",
                      color: "teal"
                    }
                  ].map((feature, i) => (
                    <div 
                      key={i}
                      className="flex flex-col items-start gap-4 bg-black/40 backdrop-blur-2xl border border-white/10 hover:border-white/20 p-6 sm:p-8 rounded-3xl transition-all duration-300 hover:-translate-y-1 shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] group"
                    >
                      <div className={`p-3 rounded-full transition-transform ${feature.color === 'teal' ? 'bg-[#2dd4bf]/10 shadow-[0_0_15px_rgba(45,212,191,0.2)]' : 'bg-[#c084fc]/10 shadow-[0_0_15px_rgba(192,132,252,0.2)]'}`}>
                        <feature.icon className={`size-6 ${feature.color === 'teal' ? 'text-[#2dd4bf]' : 'text-[#c084fc]'}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-white">{feature.title}</div>
                        <div className="text-sm text-white/50 mt-2 leading-relaxed line-clamp-3">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
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
              className="w-full flex flex-col gap-6 items-center z-10 relative"
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
                      onClick={endInterview} 
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
                originalAnswer="Full mock interview completed. See the stronger version for overall feedback."
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
