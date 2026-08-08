import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Brain, MessageSquareText, ShieldCheck, BarChart3, History } from "lucide-react";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
});

const features = [
  {
    title: "Adaptive Difficulty",
    description: "Questions adjust in real time based on how well you're answering — no fixed script. The AI reads your response quality and recalibrates the next question's difficulty accordingly.",
    icon: Brain,
    color: "teal"
  },
  {
    title: "Instant AI Feedback",
    description: "Get scored on clarity, correctness, and structure right after every answer, not just at the end. See exactly what to improve before you move to the next question.",
    icon: MessageSquareText,
    color: "purple"
  },
  {
    title: "Focus Mode for Live Sessions",
    description: "Tab-switch detection and fullscreen enforcement keep Live Interviews as close to the real thing as possible — no shortcuts, no second tab.",
    icon: ShieldCheck,
    color: "teal"
  },
  {
    title: "Performance Analytics",
    description: "Track score trends across sessions and see exactly which topics need more practice, with a breakdown by subject/skill area.",
    icon: BarChart3,
    color: "purple"
  },
  {
    title: "Session Replay",
    description: "Revisit past interviews with full transcripts and feedback to see how you've improved over time.",
    icon: History,
    color: "teal"
  }
];

function FeaturesPage() {
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
      <nav className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl flex items-center gap-4 sm:gap-8 px-4 sm:px-8 z-50 sticky top-0">
        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group">
          <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium hidden sm:inline">Back to Home</span>
        </Link>
        
        <Link to="/" className="flex items-center gap-3 group ml-auto sm:ml-0">
          <div className="bg-linear-to-br from-[#c084fc] to-[#2dd4bf] size-8 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)] group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-lg leading-none">IQ</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            AB<span className="bg-linear-to-r from-[#c084fc] to-[#2dd4bf] text-transparent bg-clip-text">InterviewIQ</span>
          </span>
        </Link>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center py-16 px-4 sm:px-8 relative bg-black/40">
        <div className="w-full max-w-5xl flex flex-col z-10 relative">
          
          {/* Page Hero */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center text-center mb-16 sm:mb-24"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Explore Features
            </h1>
            <p className="text-lg text-white/60 max-w-2xl leading-relaxed">
              Everything built to make your interview practice sharper and more realistic.
            </p>
          </motion.div>

          {/* Features List */}
          <div className="flex flex-col">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 items-center py-16 lg:py-24 border-b border-white/5 last:border-0`}
              >
                <div className="flex-1 flex flex-col items-start text-left gap-6 w-full">
                  <div className={`p-4 rounded-full ${feature.color === 'teal' ? 'bg-[#2dd4bf]/10 shadow-[0_0_20px_rgba(45,212,191,0.2)]' : 'bg-[#c084fc]/10 shadow-[0_0_20px_rgba(192,132,252,0.2)]'}`}>
                    <feature.icon className={`size-8 ${feature.color === 'teal' ? 'text-[#2dd4bf]' : 'text-[#c084fc]'}`} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{feature.title}</h2>
                  <p className="text-base sm:text-lg text-white/60 max-w-[500px] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                <div className="flex-1 w-full flex items-center justify-center mt-8 lg:mt-0">
                  <div className="w-full max-w-md aspect-video lg:aspect-[4/3] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                    <feature.icon className="size-20 text-white/10" strokeWidth={1} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center mt-16 lg:mt-24 pt-16 border-t border-white/5"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              Ready to start practicing?
            </h2>
            <Link 
              to="/"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-[#c084fc] to-[#2dd4bf] text-white font-bold text-lg hover:opacity-90 transition-opacity active:scale-95 shadow-[0_0_20px_rgba(192,132,252,0.3)]"
            >
              Start Practicing
              <ArrowRight className="size-5" />
            </Link>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
