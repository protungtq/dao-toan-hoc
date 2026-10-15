import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const MathArcheryGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [targetNum, setTargetNum] = useState(10);
  const [targets, setTargets] = useState<{ id: number; val: number; x: number }[]>([
    { id: 1, val: 5, x: 20 },
    { id: 2, val: 10, x: 50 },
    { id: 3, val: 15, x: 80 },
  ]);
  const [arrowFlying, setArrowFlying] = useState(false);
  const [arrowX, setArrowX] = useState(50);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const generateNewRound = useCallback(() => {
    const correct = Math.floor(Math.random() * 20) + 5;
    setTargetNum(correct);
    const opts = [
      correct,
      Math.max(1, correct + (Math.random() > 0.5 ? 3 : -3)),
      Math.max(1, correct + (Math.random() > 0.5 ? 6 : -6)),
    ].sort(() => Math.random() - 0.5);

    setTargets(opts.map((v, i) => ({ id: i, val: v, x: 20 + i * 30 })));
  }, []);

  useEffect(() => {
    generateNewRound();
  }, [generateNewRound]);

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

  const shoot = (val: number, xPos: number) => {
    if (arrowFlying || isGameOver) return;
    setArrowX(xPos);
    setArrowFlying(true);

    setTimeout(() => {
      if (val === targetNum) {
        playMiniGameSound('collect');
        const next = score + 10;
        setScore(next);
        onScore?.(next);
      } else {
        playMiniGameSound('miss');
      }
      setArrowFlying(false);
      generateNewRound();
    }, 400);
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(30);
    setIsGameOver(false);
    generateNewRound();
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-amber-500 to-orange-700 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>🏹</span>
            <span>Bắn Cung Toán Học</span>
          </h3>
          <p className="text-xs text-amber-100">Bắn vào quả bóng bay có kết quả chính xác!</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold text-amber-200">Thời gian: {timeLeft}s</div>
          <div className="text-2xl font-black">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-sky-900/60 border border-amber-300/30 flex flex-col justify-between p-6">
        {/* Target goal display */}
        <div className="mx-auto bg-white/90 text-slate-900 px-6 py-2 rounded-2xl font-black text-xl shadow-lg border border-amber-400">
          🎯 Tìm số: {targetNum}
        </div>

        {/* Floating Target Balloons */}
        <div className="flex justify-around items-center my-auto">
          {targets.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => shoot(t.val, t.x)}
              className="group relative flex flex-col items-center justify-center w-20 h-24 rounded-full bg-gradient-to-t from-rose-500 to-amber-400 border-4 border-white shadow-xl hover:scale-110 active:scale-95 transition cursor-pointer"
            >
              <span className="text-2xl font-black text-white">{t.val}</span>
              <div className="absolute -bottom-3 w-1 h-6 bg-slate-400" />
            </button>
          ))}
        </div>

        {/* Archer / Arrow launcher */}
        <div className="relative h-16 flex items-end justify-center">
          <div
            className={`absolute bottom-2 text-4xl transition-all duration-300 ${arrowFlying ? 'translate-y-[-240px] scale-75' : ''}`}
            style={{ left: `${arrowX}%` }}
          >
            🏹
          </div>
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl">🏆</span>
            <h4 className="mt-3 text-2xl font-black text-white">Hết giờ!</h4>
            <p className="mt-1 text-sm text-amber-200">Tổng điểm: <strong className="text-white">{score} điểm</strong></p>
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
