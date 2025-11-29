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
    <div className="w-full max-w-5xl mx-auto p-8 flex flex-col gap-8">

      {!isActive && !isFinished && (
        <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-lg backdrop-blur-sm border border-zinc-800 animate-slide-up">
          <div className="flex gap-4">
            {(['easy', 'medium', 'hard'] as DifficultyType[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`text-xs font-mono uppercase px-3 py-1 rounded transition-all ${
                  difficulty === d
                    ? 'bg-yellow-400 text-black font-bold shadow-[0_0_10px_rgba(250,204,21,0.4)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            {[15, 30, 60].map((t) => (
              <button
                key={t}
                onClick={() => setDuration(t)}
                className={`text-xs font-mono px-3 py-1 rounded transition-all ${
                  duration === t
                    ? 'bg-yellow-400 text-black font-bold shadow-[0_0_10px_rgba(250,204,21,0.4)]'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-end font-mono text-yellow-400">
        <div className="text-5xl font-bold tracking-tighter">{timeLeft}s</div>
        <div className="flex gap-8 text-xl">
          <div className="flex flex-col items-end">
             <span className="text-xs text-zinc-600">ACCURACY</span>
             <span className={accuracy < 95 ? 'text-red-400' : 'text-white'}>{accuracy}%</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-xs text-zinc-600">WPM</span>
             <span>{wpm}</span>
          </div>
        </div>
      </div>

      <div
        className="relative font-mono text-2xl md:text-3xl leading-relaxed break-all min-h-[200px] outline-none"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="relative text-zinc-600 transition-all duration-100">
          {text.split('').map((char, i) => {
            let className = 'transition-colors duration-75 ';
            if (i < input.length) {
              className += input[i] === char ? 'text-white' : 'text-red-500';
            }
            if (i === input.length) {
              className += ' bg-yellow-400/20 text-yellow-400 border-b-2 border-yellow-400 animate-pulse';
            }
            return (
              <span key={i} className={className}>{char}</span>
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

      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 p-10 rounded-2xl max-w-2xl w-full text-center space-y-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>

            <h2 className="text-4xl font-bold text-white font-mono tracking-tighter">SESSION_COMPLETE</h2>

            <div className="grid grid-cols-4 gap-4">
              <StatBox label="WPM" value={wpm} highlight />
              <StatBox label="ACCURACY" value={`${accuracy}%`} />
              <StatBox label="RAW" value={rawWpm} />
              <StatBox label="ERRORS" value={errors} color="text-red-400" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 flex flex-col items-center justify-center">
                  <div className="text-zinc-500 text-xs font-mono mb-2">CONSISTENCY</div>
                  <div className="text-2xl font-bold text-white">{calculateConsistency()}%</div>
                  <div className="w-full h-1 bg-zinc-800 mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${calculateConsistency()}%` }}></div>
                  </div>
               </div>

               <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 flex flex-col items-center justify-center">
                  <div className="text-zinc-500 text-xs font-mono mb-2">IMPROVEMENT_NEEDED</div>
                  <div className="flex gap-2">
                    {topBadKeys.length > 0 ? (
                      topBadKeys.map(([key, count]) => (
                        <span key={key} className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-mono text-sm">
                          {key === ' ' ? 'SPACE' : key.toUpperCase()} ({count})
                        </span>
                      ))
                    ) : (
                      <span className="text-green-400 font-mono text-sm">NONE - PERFECT!</span>
                    )}
                  </div>
               </div>
            </div>

            <div className="flex gap-4 justify-center pt-8">
              <button
                onClick={startGame}
                className="px-8 py-4 bg-yellow-400 text-black font-bold rounded hover:bg-yellow-300 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] w-full font-mono text-lg"
              >
                RESTART_SESSION (TAB)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-zinc-600 text-xs font-mono mt-auto flex justify-center gap-8">
        <span><span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">TAB</span> RESTART</span>
        <span><span className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">ESC</span> END</span>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, highlight = false, color = 'text-white' }: { label: string, value: string | number, highlight?: boolean, color?: string }) => (
  <div className={`bg-zinc-900 p-6 rounded-xl border ${highlight ? 'border-yellow-400/50 bg-yellow-400/5' : 'border-zinc-800'}`}>
    <div className="text-zinc-500 text-xs font-mono mb-1">{label}</div>
    <div className={`text-4xl font-bold ${highlight ? 'text-yellow-400' : color}`}>{value}</div>
  </div>
);
