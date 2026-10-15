import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface Bubble {
  id: number;
  val: number;
  color: string;
}

export const BallShooterGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [currentBall, setCurrentBall] = useState(6);
  const [bubbles, setBubbles] = useState<Bubble[]>([
    { id: 1, val: 2, color: 'bg-rose-500' },
    { id: 2, val: 4, color: 'bg-amber-500' },
    { id: 3, val: 6, color: 'bg-emerald-500' },
    { id: 4, val: 8, color: 'bg-sky-500' },
    { id: 5, val: 3, color: 'bg-purple-500' },
    { id: 6, val: 6, color: 'bg-rose-500' },
    { id: 7, val: 9, color: 'bg-indigo-500' },
    { id: 8, val: 4, color: 'bg-amber-500' },
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [combo, setCombo] = useState(0);

  const reloadBall = useCallback(() => {
    const pool = [2, 3, 4, 6, 8, 9];
    setCurrentBall(pool[Math.floor(Math.random() * pool.length)]);
  }, []);

  useEffect(() => {
    if (isGameOver) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          playMiniGameSound('gameover');
          onFinish?.(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isGameOver, score, onFinish]);

  const shootBubble = (targetId: number, val: number) => {
    if (isGameOver) return;
    if (val === currentBall || val % currentBall === 0 || currentBall % val === 0) {
      playMiniGameSound('collect');
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      const pointsAdded = val * 10 * nextCombo;
      const nextScore = score + pointsAdded;
      setScore(nextScore);
      onScore?.(nextScore);

      setBubbles(prev => {
        const filtered = prev.filter(b => b.id !== targetId);
        if (filtered.length <= 2) {
          return [
            ...filtered,
            { id: Date.now() + 1, val: Math.floor(Math.random() * 8) + 2, color: 'bg-rose-500' },
            { id: Date.now() + 2, val: Math.floor(Math.random() * 8) + 2, color: 'bg-amber-500' },
            { id: Date.now() + 3, val: Math.floor(Math.random() * 8) + 2, color: 'bg-emerald-500' },
            { id: Date.now() + 4, val: Math.floor(Math.random() * 8) + 2, color: 'bg-sky-500' },
          ];
        }
        return filtered;
      });
      reloadBall();
    } else {
      playMiniGameSound('miss');
      setCombo(0);
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(45);
    setCombo(0);
    setIsGameOver(false);
    setBubbles([
      { id: 1, val: 2, color: 'bg-rose-500' },
      { id: 2, val: 4, color: 'bg-amber-500' },
      { id: 3, val: 6, color: 'bg-emerald-500' },
      { id: 4, val: 8, color: 'bg-sky-500' },
      { id: 5, val: 3, color: 'bg-purple-500' },
      { id: 6, val: 6, color: 'bg-rose-500' },
      { id: 7, val: 9, color: 'bg-indigo-500' },
      { id: 8, val: 4, color: 'bg-amber-500' },
    ]);
    reloadBall();
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-rose-700 via-pink-900 to-slate-950 p-6 sm:p-8 text-white shadow-2xl border border-rose-400/40">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <span>⚽</span>
            <span>Bắn Bóng Ghép Số Pro</span>
          </h3>
          <p className="text-xs sm:text-sm text-rose-200">Bắn vào quả bóng có số tương thích (bằng nhau hoặc chia hết)!</p>
        </div>
        <div className="flex items-center gap-3">
          {combo > 1 && (
            <div className="bg-amber-500/20 border border-amber-400 text-amber-300 px-3 py-1.5 rounded-2xl font-black text-xs animate-pulse">
              🔥 x{combo} Combo
            </div>
          )}
          <div className="text-right bg-black/50 px-4 py-2 rounded-2xl border border-white/20">
            <div className="text-[11px] uppercase font-bold text-rose-300">⏱️ {timeLeft}s</div>
            <div className="text-2xl font-black text-amber-400">{score} đ</div>
          </div>
        </div>
      </div>

      <div className="relative h-[420px] w-full overflow-hidden rounded-3xl bg-slate-950 border-2 border-rose-500/50 shadow-inner p-6 flex flex-col justify-between items-center">
        {/* Bubbles Grid */}
        <div className="grid grid-cols-4 gap-4 w-full max-w-md pt-2">
          {bubbles.map(b => (
            <button
              key={b.id}
              type="button"
              onClick={() => shootBubble(b.id, b.val)}
              className={`h-20 rounded-3xl ${b.color} border-3 border-white/95 shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center font-black text-3xl hover:scale-105 active:scale-95 transition-all cursor-pointer`}
            >
              {b.val}
            </button>
          ))}
        </div>

        {/* Shooter Cannon Area */}
        <div className="flex flex-col items-center bg-black/40 backdrop-blur-md px-8 py-3 rounded-3xl border border-rose-400/30">
          <span className="text-xs text-rose-200 font-bold mb-1">Đạn hiện tại:</span>
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-white shadow-[0_0_25px_rgba(251,191,36,0.8)] flex items-center justify-center font-black text-3xl text-slate-950 animate-bounce">
            {currentBall}
          </div>
          <span className="text-[11px] text-rose-300 mt-1">Chạm vào bong bóng phía trên để bắn!</span>
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
            <span className="text-7xl animate-bounce">🏆</span>
            <h4 className="mt-4 text-3xl font-black text-white">Xuất Sắc! Hoàn Thành Màn Bắn Bóng</h4>
            <p className="mt-2 text-base text-rose-200">Tổng điểm: <strong className="text-amber-400 text-xl">{score} điểm</strong></p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={restart}
                className="px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-lg shadow-xl transition cursor-pointer"
              >
                🔄 Bắn Tiếp
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
