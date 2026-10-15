import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const MathFlappyGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [birdY, setBirdY] = useState(180);
  const [velocity, setVelocity] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [problem, setProblem] = useState({ q: '2 + 3 = ?', ans: 5, options: [4, 5, 6, 7] });
  const [targetLane, setTargetLane] = useState(1);

  const birdYRef = useRef(birdY);
  birdYRef.current = birdY;
  const velocityRef = useRef(velocity);
  velocityRef.current = velocity;
  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const generateProblem = useCallback(() => {
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.floor(Math.random() * 8) + 1;
    const ans = a + b;
    const wrong1 = ans + (Math.random() > 0.5 ? 1 : -1);
    const wrong2 = ans + (Math.random() > 0.5 ? 2 : -2);
    const opts = [ans, Math.max(1, wrong1), Math.max(1, wrong2)].sort(() => Math.random() - 0.5);
    setProblem({ q: `${a} + ${b} = ?`, ans, options: opts });
    setTargetLane(opts.indexOf(ans));
  }, []);

  const jump = useCallback(() => {
    if (isGameOverRef.current) return;
    setVelocity(-7.5);
    playMiniGameSound('collect');
  }, []);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isGameOverRef.current) return;
      setVelocity(v => v + 0.5);
      setBirdY(y => {
        const next = y + velocityRef.current;
        if (next > 360 || next < 0) {
          setIsGameOver(true);
          isGameOverRef.current = true;
          playMiniGameSound('gameover');
          onFinish?.(scoreRef.current);
          return Math.max(0, Math.min(360, next));
        }
        return next;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onFinish]);

  const restart = () => {
    setBirdY(180);
    setVelocity(0);
    setScore(0);
    setIsGameOver(false);
    isGameOverRef.current = false;
    generateProblem();
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-sky-400 to-indigo-600 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>🐦</span>
            <span>Flappy Bird Toán Học</span>
          </h3>
          <p className="text-xs text-sky-100">Bấm Space hoặc Chạm để bay qua đáp án đúng!</p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase font-bold text-sky-200">Điểm số</span>
          <div className="text-2xl font-black">{score}</div>
        </div>
      </div>

      <div
        onClick={jump}
        className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-sky-900/40 border border-sky-300/30 backdrop-blur-sm cursor-pointer select-none flex items-center justify-center"
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white px-5 py-2 rounded-2xl font-black text-lg shadow-lg border border-sky-300">
          🎯 {problem.q}
        </div>

        <div
          className="absolute left-16 w-12 h-12 rounded-full bg-amber-400 border-2 border-white shadow-lg flex items-center justify-center text-2xl transition-transform"
          style={{ top: `${birdY}px`, transform: `rotate(${velocity * 3}deg)` }}
        >
          🐤
        </div>

        <div className="absolute right-12 top-0 bottom-0 w-28 flex flex-col justify-around py-12 pointer-events-none">
          {problem.options.map((opt, idx) => (
            <div
              key={idx}
              className={`h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-2 transition-all ${
                targetLane === idx
                  ? 'bg-emerald-500/90 border-emerald-300 text-white animate-pulse'
                  : 'bg-slate-800/80 border-slate-600 text-slate-200'
              }`}
            >
              {opt}
            </div>
          ))}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl animate-bounce">💥</span>
            <h4 className="mt-3 text-2xl font-black text-white">Rơi xuống đất mất rồi!</h4>
            <p className="mt-1 text-sm text-sky-200">Điểm đạt được: <strong className="text-amber-400">{score} điểm</strong></p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black shadow-lg transition cursor-pointer"
              >
                🔄 Chơi lại
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-6 py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition cursor-pointer"
                >
                  Thoát
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={jump}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-900 font-black text-lg rounded-2xl shadow-lg transition cursor-pointer"
        >
          🚀 BAY LÊN (SPACE / CHẠM)
        </button>
      </div>
    </div>
  );
};
