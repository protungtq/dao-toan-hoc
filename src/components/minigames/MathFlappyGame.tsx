import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [problem, setProblem] = useState({ q: '4 + 5 = ?', ans: 9, options: [7, 9, 12, 14] });
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
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const ans = a + b;
    const wrong1 = ans + (Math.random() > 0.5 ? 2 : -2);
    const wrong2 = ans + (Math.random() > 0.5 ? 4 : -4);
    const wrong3 = Math.max(1, ans + (Math.random() > 0.5 ? 3 : -3));
    const opts = [ans, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);
    setProblem({ q: `${a} + ${b} = ?`, ans, options: opts });
    setTargetLane(opts.indexOf(ans));
  }, []);

  const jump = useCallback(() => {
    if (isGameOverRef.current) return;
    setVelocity(-7.2);
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
      setVelocity(v => v + 0.45);
      setBirdY(y => {
        const next = y + velocityRef.current;
        if (next > 380 || next < 0) {
          setIsGameOver(true);
          isGameOverRef.current = true;
          playMiniGameSound('gameover');
          onFinish?.(scoreRef.current);
          return Math.max(0, Math.min(380, next));
        }
        return next;
      });
    }, 28);
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
    <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-950 p-6 sm:p-8 text-white shadow-2xl border border-sky-300/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <span>🐦</span>
            <span>Flappy Bird Toán Học Pro</span>
          </h3>
          <p className="text-xs sm:text-sm text-sky-100">Chạm hoặc bấm Space để điều khiển chú chim bay qua cổng đáp án đúng!</p>
        </div>
        <div className="text-right bg-black/40 px-4 py-2 rounded-2xl border border-white/20">
          <div className="text-[11px] uppercase font-bold text-sky-300">Điểm số</div>
          <div className="text-2xl font-black text-amber-400">{score} đ</div>
        </div>
      </div>

      <div
        onClick={jump}
        className="relative h-[400px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-sky-900/90 via-indigo-950 to-slate-950 border-2 border-sky-400/40 shadow-inner cursor-pointer select-none flex items-center justify-center"
      >
        {/* Glowing Problem Banner */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 text-slate-900 px-7 py-2.5 rounded-2xl font-black text-2xl shadow-2xl border-2 border-sky-400 flex items-center gap-3">
          <span>🎯</span>
          <span>{problem.q}</span>
        </div>

        {/* Flappy Bird Character */}
        <div
          className="absolute left-16 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-3 border-white shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center justify-center text-3xl transition-transform"
          style={{ top: `${birdY}px`, transform: `rotate(${velocity * 3.5}deg)` }}
        >
          🐤
        </div>

        {/* Options / Gates on the right */}
        <div className="absolute right-12 top-0 bottom-0 w-32 flex flex-col justify-around py-8 pointer-events-none">
          {problem.options.map((opt, idx) => (
            <div
              key={idx}
              className={`h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl border-2 transition-all ${
                targetLane === idx
                  ? 'bg-emerald-500/90 border-emerald-300 text-white shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-105'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300'
              }`}
            >
              {opt}
            </div>
          ))}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
            <span className="text-7xl animate-bounce">💥</span>
            <h4 className="mt-4 text-3xl font-black text-white">Chạm Đất Mất Rồi!</h4>
            <p className="mt-2 text-base text-sky-200">Điểm số đạt được: <strong className="text-amber-400 text-xl">{score} điểm</strong></p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={restart}
                className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg shadow-xl transition cursor-pointer"
              >
                🔄 Bay Lại
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-8 py-3.5 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition cursor-pointer"
                >
                  Thoát
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={jump}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-900 font-black text-lg rounded-2xl shadow-xl transition cursor-pointer"
        >
          🚀 BAY LÊN NGAY (SPACE / CHẠM)
        </button>
      </div>
    </div>
  );
};
