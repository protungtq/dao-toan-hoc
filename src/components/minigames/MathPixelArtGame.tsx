import React, { useState } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

const PIXEL_GRID = [
  [1, 1, 2, 2, 1, 1],
  [1, 2, 2, 2, 2, 1],
  [2, 2, 3, 3, 2, 2],
  [2, 3, 3, 3, 3, 2],
  [1, 2, 2, 2, 2, 1],
  [1, 1, 2, 2, 1, 1],
];

const COLORS: Record<number, string> = {
  1: 'bg-sky-400',
  2: 'bg-amber-400',
  3: 'bg-rose-500',
};

const MATH_CLUES: Record<number, string> = {
  1: '3 - 2 = 1',
  2: '1 + 1 = 2',
  3: '1 + 2 = 3',
};

export const MathPixelArtGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [selectedColor, setSelectedColor] = useState<number>(1);
  const [painted, setPainted] = useState<number[][]>(() =>
    Array.from({ length: 6 }, () => Array(6).fill(0))
  );
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const paintCell = (r: number, c: number) => {
    if (isCompleted) return;
    const target = PIXEL_GRID[r][c];
    if (selectedColor === target) {
      playMiniGameSound('collect');
      const nextPainted = painted.map((row, ri) =>
        row.map((val, ci) => (ri === r && ci === c ? selectedColor : val))
      );
      setPainted(nextPainted);

      // Check if finished
      let finished = true;
      for (let ri = 0; ri < 6; ri++) {
        for (let ci = 0; ci < 6; ci++) {
          if (nextPainted[ri][ci] !== PIXEL_GRID[ri][ci]) finished = false;
        }
      }

      const nextScore = score + 5;
      setScore(nextScore);
      onScore?.(nextScore);

      if (finished) {
        setIsCompleted(true);
        playMiniGameSound('fanfare');
        onFinish?.(nextScore);
      }
    } else {
      playMiniGameSound('miss');
    }
  };

  const restart = () => {
    setPainted(Array.from({ length: 6 }, () => Array(6).fill(0)));
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-emerald-500 to-teal-800 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>🎨</span>
            <span>Tô Màu Pixel Theo Phép Toán</span>
          </h3>
          <p className="text-xs text-emerald-100">Chọn màu tương ứng với kết quả phép tính để tô bức tranh!</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold text-emerald-200">Điểm số</div>
          <div className="text-2xl font-black">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-teal-950/80 border border-emerald-300/30 p-4 flex flex-col items-center justify-center">
        {/* Pixel Canvas Grid */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          {PIXEL_GRID.map((row, ri) =>
            row.map((target, ci) => {
              const pColor = painted[ri][ci];
              return (
                <button
                  key={`${ri}-${ci}`}
                  type="button"
                  onClick={() => paintCell(ri, ci)}
                  className={`w-12 h-12 rounded-xl border-2 border-white/30 flex items-center justify-center font-black text-sm shadow-md transition cursor-pointer ${
                    pColor ? COLORS[pColor] : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {!pColor ? target : '✨'}
                </button>
              );
            })
          )}
        </div>

        {/* Color Palette Selector */}
        <div className="flex items-center gap-3">
          {[1, 2, 3].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => setSelectedColor(num)}
              className={`px-4 py-2.5 rounded-2xl font-black text-sm border-2 transition cursor-pointer flex items-center gap-2 ${
                selectedColor === num ? 'border-white scale-105 shadow-lg' : 'border-transparent opacity-80'
              } ${COLORS[num]}`}
            >
              <span>{MATH_CLUES[num]}</span>
            </button>
          ))}
        </div>

        {isCompleted && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl animate-bounce">🎨</span>
            <h4 className="mt-3 text-2xl font-black text-white">Hoàn thành bức tranh Pixel!</h4>
            <p className="mt-1 text-sm text-emerald-200">Tổng điểm: <strong className="text-amber-400">{score} điểm</strong></p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black shadow-lg transition cursor-pointer"
              >
                🔄 Tô tranh mới
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
