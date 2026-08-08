import { motion } from "framer-motion";
import { ArrowRight, Share2, Award, Zap, Target } from "lucide-react";

interface ReportCardProps {
  score: number;
  originalAnswer: string;
  strongerAnswer: string;
  onRestart: () => void;
}

export function ReportCard({ score, originalAnswer, strongerAnswer, onRestart }: ReportCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-panel border border-slate-100 overflow-hidden flex flex-col"
    >
      {/* Header Banner */}
      <div className="bg-gradient-hero p-8 border-b border-slate-100 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
            <Award className="size-4" />
            InterviewIQ Report
          </h2>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Strong performance.
          </h1>
          <p className="text-slate-500 max-w-md mt-1">
            You demonstrated excellent technical depth, but could be more concise when setting up the STAR framework context.
          </p>
        </div>
        
        {/* Score Badge */}
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 size-28 shrink-0">
          <span className="text-4xl font-black text-indigo-600">{score}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Overall
          </span>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="p-8 grid md:grid-cols-2 gap-6 bg-slate-50/50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Target className="size-4" />
            Your Answer
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 text-sm text-slate-600 leading-relaxed shadow-sm relative">
            "{originalAnswer}"
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            <Zap className="size-4" />
            Stronger Version
          </div>
          <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 text-sm text-slate-700 leading-relaxed shadow-sm relative">
            "{strongerAnswer}"
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 border border-slate-100 shadow-sm md:flex hidden items-center justify-center">
              <ArrowRight className="size-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
        <button 
          onClick={onRestart}
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          Try another question
        </button>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 hover:shadow-glow transition-all active:scale-95">
          <Share2 className="size-4" />
          Share Results
        </button>
      </div>
    </motion.div>
  );
}
