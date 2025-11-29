import { useEffect, useState } from 'react'
import { FooterStatus } from './components/FooterStatus'
import { LandingPage } from './components/LandingPage'
import { ProfilePage } from './components/ProfilePage'
import { TypingArena } from './components/TypingArena'
import { useWebSocket } from './hooks/useWebSocket'
import { getOrCreateProfile } from './utils/auth'

type ViewState = 'landing' | 'arena' | 'profile';

function App() {
  const [health, setHealth] = useState<{ status: string; db_status?: string; redis_status?: string } | null>(null)
  const [view, setView] = useState<ViewState>('landing')
  const { isConnected, sendMessage } = useWebSocket(`${import.meta.env.VITE_API_URL.replace('http', 'ws')}/ws`)
  const user = getOrCreateProfile()

  useEffect(() => {
    if (isConnected) {
      // Join lobby as guest
      sendMessage('join_lobby', {
        room_id: 'global_arena',
        user_id: user.id,
        username: user.username
      })
    }
  }, [isConnected, sendMessage, user.id, user.username])

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error("Failed to fetch health:", err))
  }, [])

  const handleGameComplete = (stats: any) => {
    console.log("Game Finished:", stats)
    sendMessage('game_end', {
      ...stats,
      user_id: user.id,
      room_id: 'global_arena',
      language: 'english',
      raw_wpm: stats.raw_wpm || stats.wpm,
      consistency: stats.consistency || 100,
      error_count: stats.error_count || 0,
      bad_keys: stats.bad_keys || {},
      improvement_needed: stats.improvement_needed || "None"
    })
    // Keep view to show results overlay
  }

  const handleProgress = (stats: any) => {
    sendMessage('typing_update', {
      user_id: user.id,
      room_id: 'global_arena',
      wpm: stats.wpm,
      progress: stats.progress,
      accuracy: 100
    })
  }

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden font-sans text-zinc-200 bg-zinc-950">

      <nav className="w-full px-8 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-sm z-10">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setView('landing')}
        >
          <div className="w-3 h-3 bg-yellow-400 rounded-sm animate-pulse"></div>
          <span className="font-mono font-bold text-xl tracking-tighter">TYPEMASTER_v1</span>
        </div>
        <div className="flex gap-6 text-sm font-mono text-zinc-500 items-center">
          <button
            onClick={() => setView('profile')}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
          >
            USER: <span className="text-white border-b border-zinc-700 pb-0.5">{user.username}</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 w-full">
        {view === 'landing' && (
          <LandingPage onStart={() => setView('arena')} />
        )}

        {view === 'arena' && (
          <TypingArena
            onComplete={handleGameComplete}
            onProgress={handleProgress}
          />
        )}

        {view === 'profile' && (
          <ProfilePage
            user={user}
            onBack={() => setView('arena')}
          />
        )}
      </main>

      <FooterStatus health={health} isConnected={isConnected} />
    </div>
  )
}

export default App
