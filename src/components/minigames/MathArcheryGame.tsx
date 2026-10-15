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
  const [targets, setTargets] = useState<{ id: number; val: number; x: number; color: string }[]>([
    { id: 1, val: 5, x: 15, color: 'from-pink-500 to-rose-600' },
    { id: 2, val: 10, x: 50, color: 'from-amber-500 to-orange-600' },
    { id: 3, val: 15, x: 85, color: 'from-purple-500 to-indigo-600' },
  ]);
  const [arrowFlying, setArrowFlying] = useState(false);
  const [arrowX, setArrowX] = useState(50);
  const [hitEffect, setHitEffect] = useState<{ x: number; y: number; text: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(35);

  const generateNewRound = useCallback(() => {
    const correct = Math.floor(Math.random() * 20) + 4;
    setTargetNum(correct);
    const opts = [
      correct,
      Math.max(1, correct + (Math.random() > 0.5 ? 2 : -2)),
      Math.max(1, correct + (Math.random() > 0.5 ? 4 : -4)),
    ].sort(() => Math.random() - 0.5);

    const colors = ['from-pink-500 to-rose-600', 'from-amber-500 to-orange-600', 'from-purple-500 to-indigo-600'];
    setTargets(opts.map((v, i) => ({ id: i, val: v, x: 20 + i * 30, color: colors[i % colors.length] })));
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
        const next = score + 15;
        setScore(next);
        onScore?.(next);
        setHitEffect({ x: xPos, y: 140, text: '+15 🎯' });
      } else {
        playMiniGameSound('miss');
        setHitEffect({ x: xPos, y: 140, text: 'Sai rồi ❌' });
      }
      setTimeout(() => setHitEffect(null), 800);
      setArrowFlying(false);
      generateNewRound();
    }, 350);
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(35);
    setIsGameOver(false);
    generateNewRound();
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-purple-900 p-6 sm:p-8 text-white shadow-2xl border border-amber-400/30">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <span>🏹</span>
            <span>Bắn Cung Toán Học Pro</span>
          </h3>
          <p className="text-xs sm:text-sm text-amber-100">Ngắm chuẩn và bắn vào hồng tâm mang kết quả đúng nhất!</p>
        </div>
        <div className="text-right bg-black/40 px-4 py-2 rounded-2xl border border-white/20">
          <div className="text-[11px] uppercase font-bold text-amber-300">⏱️ {timeLeft}s</div>
          <div className="text-2xl font-black text-amber-400">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[380px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 to-indigo-950 border-2 border-amber-400/40 shadow-inner flex flex-col justify-between p-6">
        {/* Target goal display */}
        <div className="mx-auto bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 px-8 py-2.5 rounded-2xl font-black text-2xl shadow-xl border border-white flex items-center gap-2 animate-bounce">
          <span>🎯 MỤC TIÊU:</span>
          <span className="bg-white px-3 py-0.5 rounded-xl text-rose-600">{targetNum}</span>
        </div>

        {/* Floating Targets */}
        <div className="flex justify-around items-center my-auto relative">
          {hitEffect && (
            <div
              className="absolute z-30 font-black text-2xl animate-ping text-amber-300"
              style={{ left: `${hitEffect.x}%`, top: `${hitEffect.y}px` }}
            >
              {hitEffect.text}
            </div>
          )}

          {targets.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => shoot(t.val, t.x)}
              className={`group relative flex flex-col items-center justify-center w-24 h-28 rounded-full bg-gradient-to-t ${t.color} border-4 border-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer`}
            >
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center border-2 border-white/60">
                <span className="text-2xl font-black text-white">{t.val}</span>
              </div>
              <div className="absolute -bottom-4 w-1.5 h-8 bg-amber-200/80 rounded-full" />
            </button>
          ))}
        </div>

        {/* Archer Bow Launcher */}
        <div className="relative h-20 flex items-end justify-center">
          <div
            className={`absolute bottom-2 text-5xl transition-all duration-300 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] ${arrowFlying ? 'translate-y-[-240px] scale-75 rotate-12' : ''}`}
            style={{ left: `${arrowX}%` }}
          >
            🏹
          </div>
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
            <span className="text-7xl animate-bounce">🏆</span>
            <h4 className="mt-4 text-3xl font-black text-white">Xạ Thủ Xuất Sắc!</h4>
            <p className="mt-2 text-base text-amber-200">Tổng điểm đạt được: <strong className="text-amber-400 text-xl">{score} điểm</strong></p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={restart}
                className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg shadow-xl transition cursor-pointer"
              >
                🔄 Bắn Lại
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
