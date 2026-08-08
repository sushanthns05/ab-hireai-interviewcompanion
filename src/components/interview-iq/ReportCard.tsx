import { motion } from "framer-motion";
import { ArrowRight, Share2, Award, Zap, Target, TrendingUp, AlertCircle } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

const mockRadarData = [
  { subject: "Technical", score: 85, fullMark: 100 },
  { subject: "Communication", score: 90, fullMark: 100 },
  { subject: "Problem Solving", score: 75, fullMark: 100 },
  { subject: "Empathy", score: 80, fullMark: 100 },
  { subject: "Culture Fit", score: 95, fullMark: 100 },
];

interface ReportCardProps {
  score: number;
  originalAnswer: string;
  strongerAnswer: string;
  onRestart: () => void;
}

export function ReportCard({ score, originalAnswer, strongerAnswer, onRestart }: ReportCardProps) {
  let performanceTitle = "";
  let performanceSubtitle = "";

  if (score >= 60) {
    performanceTitle = "Strong performance.";
    performanceSubtitle = "You demonstrated excellent technical depth, but could be more concise when setting up the STAR framework context.";
  } else if (score >= 40) {
    performanceTitle = "Good performance, but improvement is needed.";
    performanceSubtitle = "You hit some key points, but the response lacked sufficient detail and structure.";
  } else {
    performanceTitle = "Weak performance.";
    performanceSubtitle = "Your answer missed the core concepts. Review the stronger version below for a better approach.";
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-3xl mx-auto bg-card rounded-3xl shadow-panel border border-border overflow-hidden flex flex-col"
    >
      {/* Header Banner */}
      <div className="bg-gradient-hero p-8 border-b border-border flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-widest flex items-center gap-2">
            <Award className="size-4" />
            InterviewIQ Report
          </h2>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {performanceTitle}
          </h1>
          <p className="text-muted-foreground max-w-md mt-1">
            {performanceSubtitle}
          </p>
        </div>
        
        {/* Score Badge */}
        <div className="flex flex-col items-center justify-center bg-card rounded-2xl shadow-glow border border-border size-28 shrink-0">
          <span className="text-4xl font-black text-primary">{score}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Overall
          </span>
        </div>
      </div>


      {/* Side-by-Side Comparison */}
      <div className="p-8 grid md:grid-cols-2 gap-6 bg-muted/50 border-t border-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Target className="size-4" />
            Your Answer
          </div>
          <div className="bg-card p-5 rounded-2xl border border-border text-sm text-muted-foreground leading-relaxed shadow-glow relative">
            "{originalAnswer}"
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-chart-3 uppercase tracking-wider">
            <Zap className="size-4" />
            Stronger Version
          </div>
          <div className="bg-chart-3/10 p-5 rounded-2xl border border-chart-3/30 text-sm text-foreground leading-relaxed shadow-glow relative">
            "{strongerAnswer}"
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-card rounded-full p-1 border border-border shadow-glow md:flex hidden items-center justify-center">
              <ArrowRight className="size-4 text-chart-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-card border-t border-border flex items-center justify-between">
        <button 
          onClick={onRestart}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Try another question
        </button>
        <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:hover:bg-primary/80 hover:shadow-glow transition-all active:scale-95">
          <Share2 className="size-4" />
          Share Results
        </button>
      </div>
    </motion.div>
  );
}
