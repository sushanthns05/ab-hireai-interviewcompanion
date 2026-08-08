import { motion, useAnimation, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle2, TrendingUp } from "lucide-react";

interface ConfidenceMeterProps {
  isSpeaking: boolean;
  confidenceScore: number; // 0 to 100
  celebration?: string | null;
}

export function ConfidenceMeter({ isSpeaking, confidenceScore, celebration }: ConfidenceMeterProps) {
  // We use a MotionValue to animate the circle smoothly without React state re-renders
  const scoreValue = useMotionValue(0);
  
  useEffect(() => {
    // Spring animation to the new score
    const controls = animate(scoreValue, confidenceScore, {
      type: "spring",
      stiffness: 80,
      damping: 15,
      mass: 1,
    });
    return controls.stop;
  }, [confidenceScore, scoreValue]);

  // Transform score 0-100 to stroke-dashoffset (circle circumference is ~283)
  const circumference = 2 * Math.PI * 45; // r=45
  const strokeDashoffset = useTransform(scoreValue, [0, 100], [circumference, 0]);

  // Simple waveform bars
  const bars = Array.from({ length: 5 });

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-panel border border-slate-100 w-64">
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <div className={`size-2 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {isSpeaking ? 'Listening' : 'Ready'}
        </span>
      </div>

      {/* Circular Gauge */}
      <div className="relative flex items-center justify-center mb-6 mt-4">
        <svg width="120" height="120" className="-rotate-90">
          <circle
            cx="60"
            cy="60"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-100"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="45"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            className="drop-shadow-sm"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" /> {/* Violet */}
              <stop offset="100%" stopColor="#4F46E5" /> {/* Indigo */}
            </linearGradient>
          </defs>
        </svg>

        {/* Inner Content */}
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span className="text-3xl font-bold tracking-tighter text-slate-900">
            {Math.round(confidenceScore)}
          </motion.span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Score
          </span>
        </div>
      </div>

      {/* Waveform indicator */}
      <div className="flex items-center justify-center gap-1 h-8 w-full bg-slate-50 rounded-lg border border-slate-100">
        {bars.map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-indigo-400 rounded-full"
            animate={{
              height: isSpeaking ? ["4px", `${Math.random() * 20 + 8}px`, "4px"] : "4px",
            }}
            transition={{
              duration: 0.8,
              repeat: isSpeaking ? Infinity : 0,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Micro-interaction Toast (Celebration) */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={celebration ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-10"
      >
        <CheckCircle2 className="size-3.5" />
        {celebration}
      </motion.div>
    </div>
  );
}
