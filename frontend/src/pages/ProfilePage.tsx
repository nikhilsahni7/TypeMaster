import React, { useEffect, useState } from 'react';
import type { UserProfile } from '../utils/auth';
import { ACHIEVEMENTS, calculateLevel, getUnlockedAchievements } from '../utils/gamification';

interface MatchHistory {
  id: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  consistency: number;
  error_count: number;
  mode: string;
  language: string;
  duration: number;
  created_at: string;
  improvement_needed?: string;
}

interface ProfilePageProps {
  user: UserProfile;
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack }) => {
  const [history, setHistory] = useState<MatchHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/history?user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch history:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, [user.id]);

  const { totalMatches, avgWpm, maxWpm, avgAccuracy } = React.useMemo(() => {
    const total = history.length;
    if (total === 0) return { totalMatches: 0, avgWpm: 0, maxWpm: 0, avgAccuracy: 0 };

    const avgW = Math.round(history.reduce((acc, m) => acc + m.wpm, 0) / total);
    const maxW = Math.max(...history.map(m => m.wpm));
    const avgA = Math.round(history.reduce((acc, m) => acc + m.accuracy, 0) / total);

    return { totalMatches: total, avgWpm: avgW, maxWpm: maxW, avgAccuracy: avgA };
  }, [history]);

  const currentLevel = calculateLevel(avgWpm);
  const unlockedAchievements = getUnlockedAchievements({ totalMatches, avgWpm, maxWpm });

  return (
    <div className="w-full max-w-6xl mx-auto p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-zinc-900 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900"></div>
             <span className="text-4xl font-mono text-white font-bold relative z-10">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white font-mono tracking-tighter flex items-center gap-4">
              {user.username}
              <span className={`text-sm px-3 py-1 rounded-full border border-zinc-700 bg-zinc-900 ${currentLevel.color}`}>
                {currentLevel.label}
              </span>
            </h1>
            <div className="text-zinc-500 font-mono text-sm flex gap-4 mt-2">
              <span>GUEST_ACCESS</span>
              <span className="text-zinc-700">|</span>
              <span>ID: {user.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={fetchHistory}
            className="px-4 py-2 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors font-mono text-sm"
          >
            REFRESH
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2 border border-zinc-700 text-zinc-400 hover:text-white hover:border-white transition-colors font-mono text-sm"
          >
            BACK_TO_ARENA
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatCard label="MATCHES" value={totalMatches} />
        <StatCard label="AVG_WPM" value={avgWpm} highlight />
        <StatCard label="TOP_WPM" value={maxWpm} />
        <StatCard label="ACCURACY" value={totalMatches > 0 ? `${avgAccuracy}%` : "-"} />
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-bold text-white font-mono mb-6">ACHIEVEMENTS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlockedAchievements.some(u => u.id === ach.id);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-lg border ${
                  isUnlocked
                    ? 'bg-zinc-900 border-yellow-400/30 shadow-[0_0_15px_rgba(250,204,21,0.1)]'
                    : 'bg-zinc-950/50 border-zinc-800 opacity-50 grayscale'
                } transition-all`}
              >
                <div className="text-2xl mb-2">{ach.icon}</div>
                <div className={`font-bold font-mono text-sm ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                  {ach.title}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{ach.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white font-mono">MATCH_HISTORY</h2>
          <div className="text-xs text-zinc-500 font-mono">LAST 50 MATCHES</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono text-zinc-400">
            <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Mode</th>
                <th className="px-6 py-3">WPM</th>
                <th className="px-6 py-3">Acc</th>
                <th className="px-6 py-3">Cons</th>
                <th className="px-6 py-3">Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-600">LOADING_DATA...</td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-600">NO_DATA_FOUND</td>
                </tr>
              ) : (
                history.map((match) => (
                  <tr key={match.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      {match.created_at ? new Date(match.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-zinc-800 rounded text-xs">{match.mode}</span>
                    </td>
                    <td className="px-6 py-4 text-white font-bold">{match.wpm}</td>
                    <td className="px-6 py-4">{match.accuracy}%</td>
                    <td className="px-6 py-4">{match.consistency || '-'}%</td>
                    <td className="px-6 py-4 text-xs text-zinc-400 max-w-xs truncate" title={match.improvement_needed}>
                      {match.improvement_needed || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) => (
  <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg relative overflow-hidden group hover:border-zinc-700 transition-colors">
    <div className="text-zinc-500 text-xs font-mono mb-2">{label}</div>
    <div className={`text-4xl font-bold font-mono ${highlight ? 'text-yellow-400' : 'text-white'}`}>
      {value}
    </div>
    {highlight && (
      <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-400/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
    )}
  </div>
);
