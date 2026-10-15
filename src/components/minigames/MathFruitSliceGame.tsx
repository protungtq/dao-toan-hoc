import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const MathFruitSliceGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [targetType, setTargetType] = useState<'even' | 'odd' | 'prime'>('even');
  const [fruits, setFruits] = useState<{ id: number; name: string; val: number; isTarget: boolean }[]>([
    { id: 1, name: '🍎', val: 4, isTarget: true },
    { id: 2, name: '🍌', val: 7, isTarget: false },
    { id: 3, name: '🍉', val: 12, isTarget: true },
    { id: 4, name: '🍇', val: 5, isTarget: false },
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const newRound = useCallback(() => {
    const types: ('even' | 'odd' | 'prime')[] = ['even', 'odd', 'prime'];
    const t = types[Math.floor(Math.random() * types.length)];
    setTargetType(t);

    const check = (n: number, type: string) => {
      if (type === 'even') return n % 2 === 0;
      if (type === 'odd') return n % 2 !== 0;
      return [2, 3, 5, 7, 11, 13, 17, 19].includes(n);
    };

    const fs = ['🍎', '🍌', '🍉', '🍇', '🍊', '🍍'].map((name, i) => {
      const val = Math.floor(Math.random() * 18) + 2;
      return { id: i, name, val, isTarget: check(val, t) };
    });
    setFruits(fs);
  }, []);

  useEffect(() => {
    newRound();
  }, [newRound]);

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
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
    return () => clearInterval(timer);
  }, [isGameOver, score, onFinish]);

  const sliceFruit = (isTarget: boolean) => {
    if (isGameOver) return;
    if (isTarget) {
      playMiniGameSound('collect');
      const next = score + 10;
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

  const targetTitle = targetType === 'even' ? 'SỐ CHẴN (2, 4, 6...)' : targetType === 'odd' ? 'SỐ LẺ (1, 3, 5...)' : 'SỐ NGUYÊN TỐ (2, 3, 5, 7...)';

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-rose-500 to-pink-700 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>🍉</span>
            <span>Cắt Trái Cây Toán Học</span>
          </h3>
          <p className="text-xs text-rose-100">Chạm vào trái cây mang số: <strong>{targetTitle}</strong></p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold text-rose-200">Thời gian: {timeLeft}s</div>
          <div className="text-2xl font-black">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-slate-900/60 border border-rose-300/30 p-6 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-4 my-auto">
          {fruits.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => sliceFruit(f.isTarget)}
              className="flex items-center justify-between p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md shadow-lg active:scale-95 transition cursor-pointer"
            >
              <span className="text-4xl">{f.name}</span>
              <span className="text-2xl font-black text-amber-300 bg-black/40 px-4 py-1 rounded-xl">{f.val}</span>
            </button>
          ))}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl">🏆</span>
            <h4 className="mt-3 text-2xl font-black text-white">Hết thời gian cắt trái cây!</h4>
            <p className="mt-1 text-sm text-rose-200">Tổng điểm: <strong className="text-amber-400">{score} điểm</strong></p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black shadow-lg transition cursor-pointer"
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
    </div>
  );
};
