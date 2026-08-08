import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Brain, MessageSquareText, ShieldCheck, BarChart3, History } from "lucide-react";

// @ts-expect-error: Route tree generator hasn't picked this up yet
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
    color: "purple",
    linkTo: "/analytics"
  },
  {
    title: "Session Replay",
    description: "Revisit past interviews with full transcripts and feedback to see how you've improved over time.",
    icon: History,
    color: "teal",
    linkTo: "/history"
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
                  <p className="text-base sm:text-lg text-white/60 max-w-125 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                
                <div className="flex-1 w-full flex items-center justify-center mt-8 lg:mt-0 relative group">
                  {(() => {
                    const cardContent = (
                      <>
                        {/* Background Glow */}
                        <div 
                          className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity duration-700"
                          style={{ background: `radial-gradient(circle at center, ${feature.color === 'teal' ? 'rgba(45,212,191,0.15)' : 'rgba(192,132,252,0.15)'} 0%, transparent 70%)` }}
                        />
                        
                        {/* Decorative Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>

                        {/* Floating Particles */}
                        <div className={`absolute top-1/4 left-1/4 size-1.5 rounded-full ${feature.color === 'teal' ? 'bg-[#2dd4bf]' : 'bg-[#c084fc]'} blur-[1px] opacity-40 animate-pulse`}></div>
                        <div className={`absolute bottom-1/3 right-1/4 size-2.5 rounded-full ${feature.color === 'teal' ? 'bg-[#2dd4bf]' : 'bg-[#c084fc]'} blur-[1.5px] opacity-30 animate-pulse`} style={{ animationDelay: '1s' }}></div>
                        <div className={`absolute top-1/2 right-1/3 size-1 rounded-full ${feature.color === 'teal' ? 'bg-[#2dd4bf]' : 'bg-[#c084fc]'} blur-[0.5px] opacity-50 animate-pulse`} style={{ animationDelay: '0.5s' }}></div>

                        {/* Icon Container */}
                        <div className="relative z-10 flex items-center justify-center">
                          <div className={`absolute inset-0 ${feature.color === 'teal' ? 'bg-[#2dd4bf]' : 'bg-[#c084fc]'} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full`}></div>
                          <div className="bg-black/60 p-6 sm:p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2 flex flex-col items-center gap-4">
                            <feature.icon className={`size-16 sm:size-20 ${feature.color === 'teal' ? 'text-[#2dd4bf]' : 'text-[#c084fc]'} drop-shadow-[0_0_15px_rgba(${feature.color === 'teal' ? '45,212,191' : '192,132,252'},0.5)]`} strokeWidth={1.5} />
                            {feature.linkTo && (
                              <span className={`text-white font-bold bg-white/5 px-4 py-1.5 rounded-full text-sm backdrop-blur-md border border-white/10 group-hover:bg-white/10 transition-colors shadow-[0_0_15px_rgba(${feature.color === 'teal' ? '45,212,191' : '192,132,252'},0.2)]`}>
                                View Demo
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Subtle Top Border Gradient */}
                        <div className={`absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent ${feature.color === 'teal' ? 'via-[#2dd4bf]' : 'via-[#c084fc]'} to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-500`}></div>
                      </>
                    );

                    const containerClass = `w-full max-w-md aspect-video lg:aspect-4/3 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center justify-center relative overflow-hidden transition-all duration-700 shadow-[0_0_40px_rgba(0,0,0,0.5)] block ${feature.linkTo ? 'hover:border-[#c084fc]/50 cursor-pointer hover:bg-white/5' : 'hover:border-white/20'}`;

                    return feature.linkTo ? (
                      <Link to={feature.linkTo as any} className={containerClass}>
                        {cardContent}
                      </Link>
                    ) : (
                      <div className={containerClass}>
                        {cardContent}
                      </div>
                    );
                  })()}
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
            <a 
              href="/?state=setup"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-[#c084fc] to-[#2dd4bf] text-white font-bold text-lg hover:opacity-90 transition-opacity active:scale-95 shadow-[0_0_20px_rgba(192,132,252,0.3)]"
            >
              Start Practicing
              <ArrowRight className="size-5" />
            </a>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
