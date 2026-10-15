import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const MathFishingGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [targetNum, setTargetNum] = useState(12);
  const [fishes, setFishes] = useState<{ id: number; val: number; icon: string }[]>([
    { id: 1, val: 12, icon: '🐠' },
    { id: 2, val: 8, icon: '🐡' },
    { id: 3, val: 15, icon: '🦈' },
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const newRound = useCallback(() => {
    const target = Math.floor(Math.random() * 20) + 5;
    setTargetNum(target);
    const fs = ['🐠', '🐡', '🦈', '🐟', '🐙'].map((icon, i) => {
      const val = target + (i % 2 === 0 ? 0 : (i === 1 ? -2 : 3));
      return { id: i, val: Math.max(1, val), icon };
    }).sort(() => Math.random() - 0.5);
    setFishes(fs);
  }, []);

  useEffect(() => {
    newRound();
  }, [newRound]);

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

  const catchFish = (val: number) => {
    if (isGameOver) return;
    if (val === targetNum) {
      playMiniGameSound('collect');
      const next = score + 15;
      setScore(next);
      onScore?.(next);
      newRound();
    } else {
      playMiniGameSound('miss');
      const next = Math.max(0, score - 5);
      setScore(next);
      onScore?.(next);
      newRound();
    }
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(30);
    setIsGameOver(false);
    newRound();
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-sky-400 to-blue-800 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>🎣</span>
            <span>Câu Cá Thông Minh</span>
          </h3>
          <p className="text-xs text-sky-100">Câu chú cá có con số trùng khớp với mục tiêu!</p> bơ
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold text-sky-200">Thời gian: {timeLeft}s</div>
          <div className="text-2xl font-black">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-blue-950/70 border border-sky-300/30 p-6 flex flex-col justify-between">
        <div className="mx-auto bg-white/90 text-slate-900 px-6 py-2 rounded-2xl font-black text-xl shadow-lg border border-sky-400">
          🎯 Câu cá số: {targetNum}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-auto">
          {fishes.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => catchFish(f.val)}
              className="flex items-center justify-between p-4 rounded-2xl bg-sky-500/30 hover:bg-sky-500/50 border border-sky-300/40 backdrop-blur-md shadow-lg active:scale-95 transition cursor-pointer"
            >
              <span className="text-4xl animate-bounce">{f.icon}</span>
              <span className="text-2xl font-black text-amber-300 bg-black/40 px-3 py-1 rounded-xl">{f.val}</span>
            </button>
          ))}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl">🏆</span>
            <h4 className="mt-3 text-2xl font-black text-white">Kết quả câu cá!</h4>
            <p className="mt-1 text-sm text-sky-200">Tổng điểm: <strong className="text-amber-400">{score} điểm</strong></p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black shadow-lg transition cursor-pointer"
              >
                🔄 Tiếp tục câu
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
