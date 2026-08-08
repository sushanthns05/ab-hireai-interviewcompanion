import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface ThinkingTraceProps {
  fragments: string[];
  isThinking: boolean;
}

export function ThinkingTrace({ fragments, isThinking }: ThinkingTraceProps) {
  const [visibleFragments, setVisibleFragments] = useState<string[]>([]);

  // Simulate a stream of thoughts incoming
  useEffect(() => {
    if (!isThinking) {
      setVisibleFragments([]);
      return;
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fragments.length) {
        const nextFragment = fragments[currentIndex];
        if (nextFragment) {
          setVisibleFragments((prev) => [...prev, nextFragment]);
        }
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1200); // New fragment every 1.2s

    return () => clearInterval(interval);
  }, [isThinking, fragments]);

  if (!isThinking && visibleFragments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-sm backdrop-blur-md font-mono text-[13px] w-full max-w-sm">
      <div className="flex items-center gap-2 text-indigo-600 mb-1 font-sans font-medium text-xs uppercase tracking-wider">
        <Sparkles className="size-3.5 animate-pulse" />
        AI is reasoning...
      </div>
      <div className="flex flex-col gap-1.5 overflow-hidden">
        <AnimatePresence initial={false}>
          {visibleFragments.map((fragment, index) => {
            // The newest fragment gets full opacity, others fade
            const isLatest = index === visibleFragments.length - 1;
            
            return (
              <motion.div
                key={fragment + index}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ 
                  opacity: isLatest ? 1 : 0.4, 
                  y: 0,
                  filter: "blur(0px)" 
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 0.8
                }}
                className={`flex items-start gap-2 ${isLatest ? 'text-slate-800' : 'text-slate-500'}`}
              >
                <span className="text-indigo-400 mt-0.5 opacity-60">›</span>
                <span className="leading-snug">{fragment}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
