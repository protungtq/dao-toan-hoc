import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const CloudJumperGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [clouds, setClouds] = useState<{ id: number; label: string; correct: boolean }[]>([
    { id: 1, label: '14 + 6 = 20', correct: true },
    { id: 2, label: '8 + 7 = 13', correct: false },
    { id: 3, label: '25 - 5 = 20', correct: true },
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [height, setHeight] = useState(0);

  const generateMath = () => {
    const a = Math.floor(Math.random() * 12) + 1;
    const b = Math.floor(Math.random() * 12) + 1;
    const isPlus = Math.random() > 0.5;
    const res = isPlus ? a + b : a + b;
    return `${a} + ${b} = ${res}`;
  };

  const jumpToCloud = (correct: boolean) => {
    if (isGameOver) return;
    if (correct) {
      playMiniGameSound('collect');
      const nextScore = score + 20;
      const nextHeight = height + 10;
      setScore(nextScore);
      setHeight(nextHeight);
      onScore?.(nextScore);

      setClouds([
        { id: Math.random(), label: generateMath(), correct: Math.random() > 0.4 },
        { id: Math.random(), label: generateMath(), correct: Math.random() > 0.4 },
        { id: Math.random(), label: generateMath(), correct: true },
      ]);
    } else {
      playMiniGameSound('gameover');
      setIsGameOver(true);
      onFinish?.(score);
    }
  };

  const restart = () => {
    setScore(0);
    setHeight(0);
    setIsGameOver(false);
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-sky-400 via-indigo-600 to-purple-950 p-6 sm:p-8 text-white shadow-2xl border border-sky-300/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <span>☁️</span>
            <span>Nhảy Mây Toán Học Pro</span>
          </h3>
          <p className="text-xs sm:text-sm text-sky-100">Chọn chính xác các đám mây mang phép tính đúng để leo lên bầu trời!</p>
        </div>
        <div className="text-right bg-black/40 px-4 py-2 rounded-2xl border border-white/20">
          <div className="text-[11px] uppercase font-bold text-sky-300">🌟 Độ cao: {height}m</div>
          <div className="text-2xl font-black text-amber-400">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[400px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-sky-900/90 via-indigo-950 to-slate-950 border-2 border-sky-400/40 shadow-inner p-6 flex flex-col justify-around">
        {/* Clouds stack */}
        <div className="space-y-4 my-auto">
          {clouds.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => jumpToCloud(c.correct)}
              className="w-full py-4 px-7 rounded-3xl bg-gradient-to-r from-white/95 to-sky-100 hover:from-white hover:to-sky-200 text-slate-900 font-black text-xl shadow-2xl border-2 border-sky-300 flex items-center justify-between hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">☁️ Đám Mây Tri Thức</span>
              <span className="bg-violet-600 text-white px-5 py-2 rounded-2xl text-base shadow-md">
                {c.label} ({c.correct ? 'Đúng' : 'Sai'})
              </span>
            </button>
          ))}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
            <span className="text-7xl animate-bounce">🌧️</span>
            <h4 className="mt-4 text-3xl font-black text-white">Hụt Chân Rơi Xuống!</h4>
            <p className="mt-2 text-base text-sky-200">Đạt độ cao kỷ lục: <strong className="text-amber-400 text-xl">{height}m</strong> ({score} điểm)</p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={restart}
                className="px-8 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-black text-lg shadow-xl transition cursor-pointer"
              >
                🔄 Thử Lại
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
