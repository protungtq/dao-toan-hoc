import React, { useState, useEffect, useCallback, useRef } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const MathFlappyGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [shipY, setShipY] = useState(180);
  const [velocity, setVelocity] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [problem, setProblem] = useState({ q: '4 + 5 = ?', ans: 9, options: [7, 9, 12, 14] });
  const [targetLane, setTargetLane] = useState(1);

  const shipYRef = useRef(shipY);
  shipYRef.current = shipY;
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

  const boost = useCallback(() => {
    if (isGameOverRef.current) return;
    setVelocity(-6.8);
    playMiniGameSound('collect');
  }, []);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        boost();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [boost]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isGameOverRef.current) return;
      setVelocity(v => v + 0.42);
      setShipY(y => {
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
    setShipY(180);
    setVelocity(0);
    setScore(0);
    setIsGameOver(false);
    isGameOverRef.current = false;
    generateProblem();
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-6 sm:p-8 text-white shadow-2xl border border-indigo-400/40">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <span>🚀</span>
            <span>Phi Thuyền Lướt Không Gian</span>
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200">Chạm hoặc nhấn Space để tăng tốc phi thuyền qua cổng năng lượng toán học đúng!</p>
        </div>
        <div className="text-right bg-black/50 px-4 py-2 rounded-2xl border border-white/20">
          <div className="text-[11px] uppercase font-bold text-indigo-300">Điểm số</div>
          <div className="text-2xl font-black text-amber-400">{score} đ</div>
        </div>
      </div>

      <div
        onClick={boost}
        className="relative h-[400px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 border-2 border-indigo-500/50 shadow-inner cursor-pointer select-none flex items-center justify-center"
      >
        {/* Starfield background elements */}
        <div className="absolute inset-0 opacity-45 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent" />

        {/* Glowing Problem Banner */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white px-7 py-2.5 rounded-2xl font-black text-2xl shadow-2xl border-2 border-cyan-400 flex items-center gap-3">
          <span>🌌</span>
          <span className="text-cyan-300">{problem.q}</span>
        </div>

        {/* Neon Player Spaceship */}
        <div
          className="absolute left-16 w-16 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-sky-400 border-2 border-white shadow-[0_0_20px_rgba(56,189,248,0.9)] flex items-center justify-center text-3xl transition-transform"
          style={{ top: `${shipY}px`, transform: `rotate(${velocity * 3.2}deg)` }}
        >
          🚀
          <div className="absolute -left-3 bottom-3 w-4 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_orange]" />
        </div>

        {/* Space Energy Gates on the right */}
        <div className="absolute right-12 top-0 bottom-0 w-32 flex flex-col justify-around py-8 pointer-events-none">
          {problem.options.map((opt, idx) => (
            <div
              key={idx}
              className={`h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl border-2 transition-all ${
                targetLane === idx
                  ? 'bg-cyan-500/90 border-cyan-200 text-white shadow-[0_0_25px_rgba(6,182,212,0.9)] scale-105'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400'
              }`}
            >
              {opt}
            </div>
          ))}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
            <span className="text-7xl animate-bounce">💥</span>
            <h4 className="mt-4 text-3xl font-black text-white">Va Chạm Thiên Thạch!</h4>
            <p className="mt-2 text-base text-indigo-200">Điểm số vượt ngân hà: <strong className="text-amber-400 text-xl">{score} điểm</strong></p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={restart}
                className="px-8 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-lg shadow-xl transition cursor-pointer"
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
    </div>
  );
};
