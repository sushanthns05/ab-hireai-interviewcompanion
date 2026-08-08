import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, TrendingUp, Target, Brain, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";

// @ts-expect-error: Route tree generator hasn't picked this up yet
export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const trendData = [
  { name: "Session 1", score: 62 },
  { name: "Session 2", score: 68 },
  { name: "Session 3", score: 71 },
  { name: "Session 4", score: 79 },
  { name: "Session 5", score: 82 },
  { name: "Session 6", score: 85 }
];

const topicData = [
  { topic: "System Design", score: 74 },
  { topic: "Data Structures & Algorithms", score: 88 },
  { topic: "Behavioral", score: 91 },
  { topic: "Communication Clarity", score: 65 },
  { topic: "Problem Solving", score: 80 }
];

function AnalyticsPage() {
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

      <main className="flex-1 flex flex-col items-center py-12 px-4 sm:px-8 relative bg-black/40">
        <div className="w-full max-w-5xl flex flex-col z-10 relative">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center sm:text-left"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">Performance Analytics</h1>
            <p className="text-lg text-white/60">Track score trends across sessions and see exactly which topics need more practice.</p>
          </motion.div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Sessions", value: "12", icon: Target, color: "text-[#c084fc]" },
              { label: "Average Score", value: "78%", icon: TrendingUp, color: "text-[#2dd4bf]" },
              { label: "Strongest Area", value: "Behavioral", icon: Brain, color: "text-green-400" },
              { label: "Needs Focus", value: "Communication", icon: MessageSquare, color: "text-amber-400" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.3)] flex flex-col gap-2"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <stat.icon className={`size-5 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium text-white/60">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Score Trend Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(0,0,0,0.4)] flex flex-col"
            >
              <h2 className="text-xl font-bold text-white mb-6">Score Progression</h2>
              <div className="flex-1 w-full h-75">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Topic Breakdown */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(0,0,0,0.4)] flex flex-col gap-6"
            >
              <h2 className="text-xl font-bold text-white mb-2">Topic Proficiency</h2>
              
              <div className="flex flex-col gap-5">
                {topicData.map((t, i) => {
                  const barColor = t.score >= 80 ? "bg-green-400" : 
                                   t.score >= 60 ? "bg-amber-400" : "bg-red-400";
                  return (
                    <div key={i} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/80 font-medium">{t.topic}</span>
                        <span className="text-white font-bold">{t.score}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${t.score}%` }}
                          transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                          className={`h-full rounded-full ${barColor} shadow-[0_0_10px_currentColor]`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
