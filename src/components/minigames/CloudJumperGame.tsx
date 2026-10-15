import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const CloudJumperGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [characterY, setCharacterY] = useState(240);
  const [clouds, setClouds] = useState([
    { id: 1, x: 20, y: 100, label: '12 + 8 = 20', correct: true },
    { id: 2, x: 60, y: 200, label: '9 + 6 = 14', correct: false },
    { id: 3, x: 40, y: 300, label: '15 - 5 = 10', correct: true },
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [height, setHeight] = useState(0);

  const jumpToCloud = (correct: boolean) => {
    if (isGameOver) return;
    if (correct) {
      playMiniGameSound('collect');
      const nextScore = score + 15;
      const nextHeight = height + 1;
      setScore(nextScore);
      setHeight(nextHeight);
      onScore?.(nextScore);

      // Scroll clouds down & generate new
      setClouds([
        { id: Math.random(), x: Math.random() * 60 + 10, y: 80, label: generateMath(), correct: Math.random() > 0.5 },
        { id: Math.random(), x: Math.random() * 60 + 10, y: 180, label: generateMath(), correct: Math.random() > 0.5 },
        { id: Math.random(), x: Math.random() * 60 + 10, y: 280, label: generateMath(), correct: true },
      ]);
    } else {
      playMiniGameSound('gameover');
      setIsGameOver(true);
      onFinish?.(score);
    }
  };

  const generateMath = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const isPlus = Math.random() > 0.5;
    const res = isPlus ? a + b : a + b; // simplified
    return `${a} + ${b} = ${res}`;
  };

  const restart = () => {
    setScore(0);
    setHeight(0);
    setIsGameOver(false);
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-sky-300 to-indigo-700 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>☁️</span>
            <span>Nhảy Mây Toán Học</span>
          </h3>
          <p className="text-xs text-sky-100">Chọn đám mây có phép tính đúng để nhảy lên cao!</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold text-sky-200">Độ cao: {height}m</div>
          <div className="text-2xl font-black">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[380px] w-full overflow-hidden rounded-2xl bg-sky-900/50 border border-sky-300/30 p-6 flex flex-col justify-around">
        {/* Clouds */}
        <div className="space-y-4 my-auto">
          {clouds.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => jumpToCloud(c.correct)}
              className="w-full py-3.5 px-6 rounded-3xl bg-white/90 hover:bg-white text-slate-900 font-black text-lg shadow-xl border border-sky-300 flex items-center justify-between hover:scale-[1.02] active:scale-95 transition cursor-pointer"
            >
              <span>☁️ Đám mây tri thức</span>
              <span className="bg-violet-600 text-white px-4 py-1.5 rounded-2xl text-sm">{c.label} ({c.correct ? 'Đúng' : 'Sai'})</span>
            </button>
          ))}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl">🌧️</span>
            <h4 className="mt-3 text-2xl font-black text-white">Trượt chân mất rồi!</h4>
            <p className="mt-1 text-sm text-sky-200">Đạt độ cao <strong className="text-amber-400">{height}m</strong> ({score} điểm)</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-450 text-white font-black shadow-lg transition cursor-pointer"
              >
                🔄 Thử lại
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
