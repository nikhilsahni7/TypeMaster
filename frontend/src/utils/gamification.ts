export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalMatches: number;
  avgWpm: number;
  maxWpm: number;
}

export const LEVELS = [
  { minWpm: 0, label: 'ROOKIE', color: 'text-zinc-400' },
  { minWpm: 30, label: 'NOVICE', color: 'text-blue-400' },
  { minWpm: 50, label: 'INTERMEDIATE', color: 'text-green-400' },
  { minWpm: 70, label: 'ADVANCED', color: 'text-yellow-400' },
  { minWpm: 90, label: 'EXPERT', color: 'text-orange-400' },
  { minWpm: 110, label: 'MASTER', color: 'text-red-500' },
  { minWpm: 130, label: 'GRANDMASTER', color: 'text-purple-500' },
  { minWpm: 150, label: 'LEGEND', color: 'text-cyan-400' },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'matches_10',
    title: 'Warm Up',
    description: 'Complete 10 matches',
    icon: '🔥',
    condition: (stats) => stats.totalMatches >= 10
  },
  {
    id: 'matches_50',
    title: 'Dedicated',
    description: 'Complete 50 matches',
    icon: '🏃',
    condition: (stats) => stats.totalMatches >= 50
  },
  {
    id: 'matches_100',
    title: 'Veteran',
    description: 'Complete 100 matches',
    icon: '🎖️',
    condition: (stats) => stats.totalMatches >= 100
  },
  {
    id: 'speed_60',
    title: 'Speedster',
    description: 'Reach 60 WPM average',
    icon: '⚡',
    condition: (stats) => stats.avgWpm >= 60
  },
  {
    id: 'speed_100',
    title: 'Sonic',
    description: 'Reach 100 WPM average',
    icon: '🚀',
    condition: (stats) => stats.avgWpm >= 100
  }
];

export const calculateLevel = (wpm: number) => {
  // Find the highest level where minWpm <= wpm
  return LEVELS.slice().reverse().find(l => wpm >= l.minWpm) || LEVELS[0];
};

export const getUnlockedAchievements = (stats: UserStats) => {
  return ACHIEVEMENTS.filter(a => a.condition(stats));
};
