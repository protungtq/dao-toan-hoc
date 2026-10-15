import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const BallShooterGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [currentBall, setCurrentBall] = useState(7);
  const [bubbles, setBubbles] = useState<{ id: number; val: number; color: string }[]>([
    { id: 1, val: 7, color: 'bg-rose-500' },
    { id: 2, val: 5, color: 'bg-amber-500' },
    { id: 3, val: 7, color: 'bg-rose-500' },
    { id: 4, val: 3, color: 'bg-sky-500' },
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const reloadBall = useCallback(() => {
    const vals = [3, 5, 7, 9];
    setCurrentBall(vals[Math.floor(Math.random() * vals.length)]);
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

  const shootBall = (targetId: number, val: number) => {
    if (isGameOver) return;
    if (val === currentBall) {
      playMiniGameSound('collect');
      setBubbles(prev => prev.filter(b => b.id !== targetId));
      const nextScore = score + 15;
      setScore(nextScore);
      onScore?.(nextScore);
      reloadBall();

      if (bubbles.length <= 1) {
        setBubbles([
          { id: Math.random(), val: 5, color: 'bg-amber-500' },
          { id: Math.random(), val: 7, color: 'bg-rose-500' },
          { id: Math.random(), val: 3, color: 'bg-sky-500' },
          { id: Math.random(), val: 9, color: 'bg-purple-500' },
        ]);
      }
    } else {
      playMiniGameSound('miss');
    }
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(30);
    setIsGameOver(false);
    reloadBall();
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-rose-600 to-purple-900 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>⚽</span>
            <span>Bắn Bóng Ghép Số</span>
          </h3>
          <p className="text-xs text-rose-100">Bắn quả bóng vào ô có con số tương ứng để làm nổ bong bóng!</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold text-rose-200">Thời gian: {timeLeft}s</div>
          <div className="text-2xl font-black">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-slate-950/80 border border-rose-500/30 p-6 flex flex-col justify-between items-center">
        {/* Bubbles grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
          {bubbles.map(b => (
            <button
              key={b.id}
              type="button"
              onClick={() => shootBall(b.id, b.val)}
              className={`h-20 rounded-2xl ${b.color} border-2 border-white shadow-xl flex items-center justify-center font-black text-3xl hover:scale-105 active:scale-95 transition cursor-pointer`}
            >
              {b.val}
            </button>
          ))}
        </div>

        {/* Shooter launcher */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-rose-200 mb-1">Đạn tiếp theo:</span>
          <div className="w-16 h-16 rounded-full bg-amber-400 border-4 border-white shadow-2xl flex items-center justify-center font-black text-2xl text-slate-900 animate-pulse">
            {currentBall}
          </div>
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl">🏆</span>
            <h4 className="mt-3 text-2xl font-black text-white">Hoàn thành bắn bóng!</h4>
            <p className="mt-1 text-sm text-rose-200">Tổng điểm: <strong className="text-amber-400">{score} điểm</strong></p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black shadow-lg transition cursor-pointer"
              >
                🔄 Bắn tiếp
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
