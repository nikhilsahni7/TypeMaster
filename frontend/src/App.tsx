
function App() {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10"></div>

      <main className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text animate-pulse">
            TypeMaster
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light tracking-wide">
            The Ultimate High-Performance Typing Arena
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <FeatureCard
            title="Zero Latency"
            desc="Powered by Go & WebSockets for instant feedback."
            icon="⚡"
          />
          <FeatureCard
            title="Multiplayer"
            desc="Race against friends or the world in real-time."
            icon="🎮"
          />
          <FeatureCard
            title="Analytics"
            desc="Deep dive into your WPM, consistency, and accuracy."
            icon="📊"
          />
        </div>

        <div className="pt-12">
          <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Enter the Arena
          </button>
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors text-left">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-slate-200">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

export default App
