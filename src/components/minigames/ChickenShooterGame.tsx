import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const ChickenShooterGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [chickens, setChickens] = useState<{ id: number; math: string; ans: number; left: number }[]>([
    { id: 1, math: '4 + 5', ans: 9, left: 20 },
    { id: 2, math: '3 × 3', ans: 9, left: 60 },
    { id: 3, math: '10 - 4', ans: 6, left: 80 },
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const spawnChicken = useCallback(() => {
    const a = Math.floor(Math.random() * 6) + 1;
    const b = Math.floor(Math.random() * 6) + 1;
    const sum = a + b;
    setChickens(prev => [
      ...prev,
      { id: Date.now(), math: `${a} + ${b}`, ans: sum, left: Math.floor(Math.random() * 70) + 10 }
    ]);
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

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      if (chickens.length < 5) spawnChicken();
    }, 2500);
    return () => clearInterval(timer);
  }, [isGameOver, chickens.length, spawnChicken]);

  const shootChicken = (id: number) => {
    if (isGameOver) return;
    playMiniGameSound('collect');
    setChickens(prev => prev.filter(c => c.id !== id));
    const nextScore = score + 10;
    setScore(nextScore);
    onScore?.(nextScore);
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(30);
    setIsGameOver(false);
    setChickens([
      { id: 1, math: '4 + 5', ans: 9, left: 20 },
      { id: 2, math: '3 × 3', ans: 9, left: 60 },
    ]);
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-amber-500 to-yellow-800 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>🐔</span>
            <span>Bắn Gà Toán Học</span>
          </h3>
          <p className="text-xs text-amber-100">Bắn hạ các chú gà mang phép tính nhanh và chính xác!</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold text-amber-200">Thời gian: {timeLeft}s</div>
          <div className="text-2xl font-black">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-sky-900/60 border border-amber-300/30 p-6 flex flex-col justify-between">
        {/* Sky with flying chickens */}
        <div className="relative h-64 flex flex-wrap content-start gap-6 p-4">
          {chickens.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => shootChicken(c.id)}
              className="flex flex-col items-center p-3 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-white shadow-xl animate-bounce active:scale-95 transition cursor-pointer text-slate-900"
              style={{ marginLeft: `${c.left}%` }}
            >
              <span className="text-3xl">🐔</span>
              <span className="text-xs font-black bg-black/70 text-white px-2 py-0.5 rounded-lg mt-1">{c.math}</span>
            </button>
          ))}
        </div>

        {/* Crosshair launcher */}
        <div className="text-center font-bold text-amber-200 text-sm">
          🎯 Chạm vào chú gà để ngắm bắn!
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl">🏆</span>
            <h4 className="mt-3 text-2xl font-black text-white">Hoàn thành săn gà!</h4>
            <p className="mt-1 text-sm text-amber-200">Tổng điểm: <strong className="text-white">{score} điểm</strong></p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black shadow-lg transition cursor-pointer"
              >
                🔄 Săn tiếp
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
    </div>
  );
};
