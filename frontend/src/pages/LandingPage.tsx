import { motion } from 'framer-motion';
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 flex flex-col gap-24 py-12 relative overflow-hidden min-h-[80vh] justify-center">

      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        {/* Left: Typography & CTA */}
        <div className="space-y-10 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 border border-zinc-700 bg-zinc-900/50 text-zinc-300 text-xs font-mono tracking-wider rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            STABLE RELEASE v2.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9] text-white"
          >
            MASTER<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 to-zinc-800">THE FLOW</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-lg font-light leading-relaxed"
          >
            The definitive low-latency typing environment. Engineered for developers and professionals who demand precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 pt-4"
          >
            <button
              onClick={onStart}
              className="group relative px-8 py-4 bg-white text-black font-mono font-bold tracking-tight overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] cursor-pointer rounded-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center gap-2">
                ENTER ARENA <span className="text-lg">→</span>
              </span>
            </button>
            <button className="px-8 py-4 border border-zinc-800 text-zinc-400 font-mono font-bold hover:border-zinc-600 hover:text-white transition-all hover:bg-zinc-900 cursor-pointer rounded-sm">
              GLOBAL LEADERBOARD
            </button>
          </motion.div>
        </div>

        {/* Right: Abstract Visuals */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          {/* Glass Card - Straightened and Refined */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative bg-zinc-900/60 backdrop-blur-2xl border border-white/10 p-8 rounded-2xl shadow-2xl transition-all duration-500"
          >
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <span className="font-mono text-xs text-zinc-500">user_metrics.json</span>
            </div>

            <div className="grid grid-cols-2 gap-8 font-mono">
              <div className="space-y-1">
                <div className="text-xs text-zinc-500">PEAK_WPM</div>
                <div className="text-4xl font-bold text-white">156</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-zinc-500">ACCURACY</div>
                <div className="text-4xl font-bold text-yellow-400">99.8%</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-zinc-500">GLOBAL_RANK</div>
                <div className="text-4xl font-bold text-white">#42</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-zinc-500">CONSISTENCY</div>
                <div className="text-4xl font-bold text-zinc-400">98%</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                <span>Sub-millisecond latency</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                <span>Real-time persistence layer active</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-16"
      >
        <FeatureCard
          title="REAL-TIME ARENA"
          desc="Compete against others globally with sub-millisecond latency updates via WebSocket."
          icon="⚡"
          delay={0.5}
        />
        <FeatureCard
          title="ADVANCED METRICS"
          desc="Track raw WPM, consistency, and error heatmaps to identify weak points."
          icon="📊"
          delay={0.6}
        />
        <FeatureCard
          title="GLOBAL RANKING"
          desc="Climb the ELO-based ladder and earn your place among the typing elite."
          icon="🌍"
          delay={0.7}
        />
      </motion.div>

    </div>
  );
};

const FeatureCard = ({ title, desc, icon, delay }: { title: string, desc: string, icon: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="group p-6 rounded-xl border border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors hover:border-white/10"
  >
    <div className="text-4xl mb-4 opacity-50 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0">{icon}</div>
    <h3 className="text-lg font-bold text-white mb-2 font-mono">{title}</h3>
    <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);
