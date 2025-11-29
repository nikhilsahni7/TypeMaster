import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      {/* Left: Typography & CTA */}
      <div className="space-y-8 text-left">
        <div className="inline-block px-3 py-1 border border-yellow-400/30 bg-yellow-400/10 text-yellow-400 text-xs font-mono rounded-full">
          SYSTEM_ONLINE
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none text-white">
          MASTER<br/>
          THE <span className="text-zinc-600">FLOW</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-md font-mono leading-relaxed">
          Zero latency. Pure performance. The ultimate competitive typing arena for professionals.
        </p>

        <div className="flex gap-4 pt-4">
          <button
            onClick={onStart}
            className="px-8 py-4 bg-white text-black font-mono font-bold hover:bg-zinc-200 transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:translate-y-[2px] active:shadow-none cursor-pointer"
          >
            START_ENGINE
          </button>
          <button className="px-8 py-4 border border-zinc-700 text-zinc-300 font-mono font-bold hover:border-white hover:text-white transition-colors cursor-pointer">
            VIEW_REPLAY
          </button>
        </div>
      </div>

      {/* Right: Technical Stats Visual */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-transparent opacity-20 blur-xl"></div>
        <div className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-lg font-mono text-sm shadow-2xl">
          <div className="flex justify-between border-b border-zinc-800 pb-4 mb-4 text-zinc-500 text-xs">
            <span>TERMINAL_01</span>
            <span>LATENCY: 12ms</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-400">WPM_CURRENT</span>
              <span className="text-yellow-400 font-bold">142</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">ACCURACY</span>
              <span className="text-white">99.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">CONSISTENCY</span>
              <span className="text-white">94.8%</span>
            </div>
            <div className="h-px bg-zinc-800 my-4"></div>
            <div className="text-zinc-500">
              <span className="text-green-500">➜</span> user_connected: <span className="text-white">true</span><br/>
              <span className="text-green-500">➜</span> db_sync: <span className="text-white">active</span><br/>
              <span className="text-green-500">➜</span> packet_loss: <span className="text-red-500">0.0%</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
