import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Difficulty as DifficultyType } from '../utils/words';
import { generateWords } from '../utils/words';

interface TypingArenaProps {
  onComplete: (stats: {
    wpm: number;
    accuracy: number;
    duration: number;
    mode: string;
    difficulty: DifficultyType;
    raw_wpm: number;
    consistency: number;
    error_count: number;
    bad_keys: Record<string, number>;
    improvement_needed: string;
  }) => void;
  onProgress: (stats: { wpm: number; progress: number }) => void;
}

export const TypingArena = ({ onComplete, onProgress }: TypingArenaProps) => {
  const [difficulty, setDifficulty] = useState<DifficultyType>('medium');
  const [duration, setDuration] = useState(30);

  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Stats
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errors, setErrors] = useState(0);
  const [badKeys, setBadKeys] = useState<Record<string, number>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const keyIntervals = useRef<number[]>([]);
  const lastKeyTime = useRef<number | null>(null);

  const startGame = useCallback(() => {
    const newText = generateWords(difficulty, 100); // Generate more words to prevent running out
    setText(newText);
    setInput('');
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);

    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setErrors(0);
    setBadKeys({});
    keyIntervals.current = [];
    lastKeyTime.current = null;

    setTimeout(() => inputRef.current?.focus(), 10);
  }, [difficulty, duration]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000) as unknown as number;
    } else if (timeLeft === 0 && isActive) {
      finishGame();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const calculateConsistency = () => {
    if (keyIntervals.current.length < 2) return 100;

    const mean = keyIntervals.current.reduce((a, b) => a + b, 0) / keyIntervals.current.length;
    const variance = keyIntervals.current.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / keyIntervals.current.length;
    const stdDev = Math.sqrt(variance);

    // CV = stdDev / mean. Consistency = 100 - (CV * 100)
    const cv = mean > 0 ? stdDev / mean : 0;
    return Math.max(0, Math.round(100 - (cv * 100)));
  };

  const finishGame = () => {
    setIsActive(false);
    setIsFinished(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const finalConsistency = calculateConsistency();

    const topBadKeys = Object.entries(badKeys)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => key === ' ' ? 'SPACE' : key.toUpperCase());

    const improvementNeeded = topBadKeys.length > 0
      ? `Focus on: ${topBadKeys.join(', ')}`
      : "Great job! Maintain accuracy.";

    onComplete({
      wpm,
      raw_wpm: rawWpm,
      accuracy,
      duration: duration - timeLeft,
      mode: `time_${duration}`,
      difficulty,
      consistency: finalConsistency,
      error_count: errors,
      bad_keys: badKeys,
      improvement_needed: improvementNeeded
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const now = Date.now();

    if (!isActive && !isFinished) {
      setIsActive(true);
      lastKeyTime.current = now;
    }

    if (isFinished) return;

    if (lastKeyTime.current) {
      const interval = now - lastKeyTime.current;
      keyIntervals.current.push(interval);
    }
    lastKeyTime.current = now;

    const isAddition = val.length > input.length;
    if (isAddition) {
      const charIndex = val.length - 1;
      const typedChar = val[charIndex];
      const expectedChar = text[charIndex];

      if (typedChar === expectedChar) {
        // Correct
      } else {
        setErrors(prev => prev + 1);
        setBadKeys(prev => ({
          ...prev,
          [expectedChar]: (prev[expectedChar] || 0) + 1
        }));
      }
    }

    setInput(val);

    const timeElapsedMin = (duration - timeLeft) / 60;
    // Prevent spike at start
    const safeTime = timeElapsedMin > 0.033 ? timeElapsedMin : 0.033;

    // Gross WPM
    const currentRawWpm = Math.round((val.length / 5) / safeTime);

    // Net WPM
    const netWpm = Math.max(0, Math.round(((val.length - errors) / 5) / safeTime));

    const currentAccuracy = val.length > 0
      ? Math.round(((val.length - errors) / val.length) * 100)
      : 100;

    setWpm(netWpm);
    setRawWpm(currentRawWpm);
    setAccuracy(currentAccuracy);

    const progress = Math.round((val.length / text.length) * 100);
    onProgress({ wpm: netWpm, progress });

    if (val.length >= text.length) {
      finishGame();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (timerRef.current) clearInterval(timerRef.current);
      startGame();
    }
    if (e.key === 'Escape' && isActive) {
      e.preventDefault();
      finishGame();
    }
  };

  const topBadKeys = Object.entries(badKeys)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="w-full max-w-6xl mx-auto p-8 flex flex-col gap-12 min-h-[60vh] justify-center">

      {/* Controls Header */}
      {!isActive && !isFinished && (
        <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded-full backdrop-blur-sm border border-white/5 mx-auto">
          <div className="flex gap-1 p-1">
            {(['easy', 'medium', 'hard'] as DifficultyType[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`text-xs font-mono uppercase px-4 py-2 rounded-full transition-all ${
                  difficulty === d
                    ? 'bg-zinc-800 text-white font-bold shadow-lg'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-white/10 mx-2"></div>
          <div className="flex gap-1 p-1">
            {[15, 30, 60].map((t) => (
              <button
                key={t}
                onClick={() => setDuration(t)}
                className={`text-xs font-mono px-4 py-2 rounded-full transition-all ${
                  duration === t
                    ? 'bg-yellow-400 text-black font-bold shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Stats */}
      <div className="flex justify-between items-end font-mono px-4">
        <div className="text-6xl font-bold tracking-tighter text-yellow-400 tabular-nums">
          {timeLeft}
        </div>
        <div className="flex gap-12 text-xl">
          <div className="flex flex-col items-end gap-1">
             <span className="text-[10px] tracking-widest text-zinc-500 uppercase">Accuracy</span>
             <span className={`text-2xl font-bold ${accuracy < 95 ? 'text-red-400' : 'text-white'}`}>{accuracy}%</span>
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className="text-[10px] tracking-widest text-zinc-500 uppercase">WPM</span>
             <span className="text-2xl font-bold text-white">{wpm}</span>
          </div>
        </div>
      </div>

      {/* Typing Area */}
      <div
        className="relative font-mono text-3xl leading-[1.8] outline-none min-h-[200px] select-none"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Text Container - Optimized for performance */}
        <div className="relative text-zinc-600 whitespace-pre-wrap break-words">
          {text.split('').map((char, i) => {
            let className = 'relative ';
            let isCurrent = i === input.length;

            if (i < input.length) {
              className += input[i] === char ? 'text-white' : 'text-red-500';
            }

            return (
              <span key={i} className={className}>
                {/* CSS-only Cursor for zero latency */}
                {isCurrent && isActive && (
                  <span className="absolute -left-[1px] top-1 bottom-1 w-[2px] bg-yellow-400"></span>
                )}
                {char}
              </span>
            );
          })}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="absolute opacity-0 top-0 left-0 h-full w-full cursor-default"
          autoFocus
          autoComplete="off"
        />
      </div>

      {/* Results Modal */}
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl max-w-2xl w-full text-center space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>

            <h2 className="text-4xl font-bold text-white font-mono tracking-tighter">SESSION_COMPLETE</h2>

            <div className="grid grid-cols-4 gap-4">
              <StatBox label="WPM" value={wpm} highlight />
              <StatBox label="ACCURACY" value={`${accuracy}%`} />
              <StatBox label="RAW" value={rawWpm} />
              <StatBox label="ERRORS" value={errors} color="text-red-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center gap-2">
                  <div className="text-zinc-500 text-[10px] tracking-widest font-mono">CONSISTENCY</div>
                  <div className="text-2xl font-bold text-white">{calculateConsistency()}%</div>
                  <div className="w-full h-1 bg-zinc-800 mt-1 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${calculateConsistency()}%` }}></div>
                  </div>
               </div>

               <div className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50 flex flex-col items-center justify-center gap-2">
                  <div className="text-zinc-500 text-[10px] tracking-widest font-mono">IMPROVEMENT</div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    {topBadKeys.length > 0 ? (
                      topBadKeys.map(([key]) => (
                        <span key={key} className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs font-mono">
                          {key === ' ' ? 'SPACE' : key.toUpperCase()}
                        </span>
                      ))
                    ) : (
                      <span className="text-green-400 font-mono text-xs">PERFECT</span>
                    )}
                  </div>
               </div>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all hover:scale-[1.02] w-full font-mono text-lg shadow-xl"
              >
                RESTART_SESSION <span className="opacity-50 text-sm ml-2">(TAB)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-zinc-600 text-xs font-mono mt-auto flex justify-center gap-8 opacity-50">
        <span><span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">TAB</span> RESTART</span>
        <span><span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">ESC</span> END</span>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, highlight = false, color = 'text-white' }: { label: string, value: string | number, highlight?: boolean, color?: string }) => (
  <div className={`bg-zinc-950/50 p-6 rounded-2xl border ${highlight ? 'border-yellow-400/20 bg-yellow-400/5' : 'border-zinc-800/50'}`}>
    <div className="text-zinc-500 text-[10px] tracking-widest font-mono mb-2">{label}</div>
    <div className={`text-4xl font-bold ${highlight ? 'text-yellow-400' : color}`}>{value}</div>
  </div>
);
