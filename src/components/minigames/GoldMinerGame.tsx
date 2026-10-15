import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const GoldMinerGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [angle, setAngle] = useState(0);
  const [hookState, setHookState] = useState<'swing' | 'shoot' | 'return'>('swing');
  const [hookLength, setHookLength] = useState(50);
  const [targetGem, setTargetGem] = useState<{ val: number; icon: string; points: number } | null>(null);
  const [gems, setGems] = useState([
    { id: 1, val: 14, icon: '💎', points: 20, left: 25, top: 220 },
    { id: 2, val: 28, icon: '🏆', points: 35, left: 55, top: 260 },
    { id: 3, val: 9, icon: '💰', points: 15, left: 80, top: 200 },
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(40);

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
    if (hookState !== 'swing' || isGameOver) return;
    let dir = 1;
    const t = setInterval(() => {
      setAngle(a => {
        if (a > 65) dir = -1;
        if (a < -65) dir = 1;
        return a + dir * 2.5;
      });
    }, 25);
    return () => clearInterval(t);
  }, [hookState, isGameOver]);

  const launchHook = () => {
    if (hookState !== 'swing' || isGameOver) return;
    setHookState('shoot');
    playMiniGameSound('collect');

    let len = 50;
    const shootInterval = setInterval(() => {
      len += 18;
      setHookLength(len);

      const hit = gems.find(g => Math.abs(g.left - (50 + angle * 0.55)) < 18 && Math.abs(g.top - len) < 25);
      if (hit || len > 300) {
        clearInterval(shootInterval);
        if (hit) {
          setTargetGem({ val: hit.val, icon: hit.icon, points: hit.points });
          setGems(prev => prev.filter(g => g.id !== hit.id));
          const nextScore = score + hit.points;
          setScore(nextScore);
          onScore?.(nextScore);
          playMiniGameSound('fanfare');
        }

        const returnInterval = setInterval(() => {
          len -= 18;
          setHookLength(len);
          if (len <= 50) {
            clearInterval(returnInterval);
            setHookLength(50);
            setHookState('swing');
            setTargetGem(null);
            if (gems.length <= 1) {
              setGems([
                { id: Math.random(), val: Math.floor(Math.random() * 30) + 5, icon: '💎', points: 20, left: Math.random() * 60 + 20, top: 210 },
                { id: Math.random(), val: Math.floor(Math.random() * 45) + 12, icon: '🏆', points: 35, left: Math.random() * 60 + 20, top: 250 },
                { id: Math.random(), val: Math.floor(Math.random() * 20) + 3, icon: '💰', points: 15, left: Math.random() * 60 + 20, top: 190 },
              ]);
            }
          }
        }, 15);
      }
    }, 15);
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(40);
    setIsGameOver(false);
    setHookState('swing');
    setHookLength(50);
  };

  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-amber-800 via-yellow-900 to-slate-950 p-6 sm:p-8 text-white shadow-2xl border border-amber-500/40">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <span>⛏️</span>
            <span>Đào Vàng Tri Thức Pro</span>
          </h3>
          <p className="text-xs sm:text-sm text-amber-200">Thả cần cẩu đúng hướng để gom kho báu toán học quý hiếm!</p>
        </div>
        <div className="text-right bg-black/50 px-4 py-2 rounded-2xl border border-white/20">
          <div className="text-[11px] uppercase font-bold text-amber-300">⏱️ {timeLeft}s</div>
          <div className="text-2xl font-black text-amber-400">{score} đ</div>
        </div>
      </div>

      <div
        onClick={launchHook}
        className="relative h-[380px] w-full overflow-hidden rounded-3xl bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-inner cursor-pointer select-none"
      >
        {/* Crane / Hook winch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-4xl filter drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">🏗️</div>

        {/* Swinging Hook line */}
        <div
          className="absolute top-12 left-1/2 origin-top border-l-4 border-dashed border-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          style={{
            height: `${hookLength}px`,
            transform: `translateX(-50%) rotate(${angle}deg)`,
          }}
        >
          <div className="absolute -bottom-3 -left-4 text-3xl">🪝</div>
          {targetGem && (
            <div className="absolute -bottom-10 -left-5 text-3xl animate-bounce filter drop-shadow-[0_0_12px_rgba(252,211,77,0.9)]">
              {targetGem.icon}
            </div>
          )}
        </div>

        {/* Gems on ground */}
        {gems.map(g => (
          <div
            key={g.id}
            className="absolute flex flex-col items-center px-3 py-1.5 rounded-2xl bg-amber-950/80 border-2 border-amber-500/60 shadow-xl backdrop-blur-md animate-pulse"
            style={{ left: `${g.left}%`, top: `${g.top}px` }}
          >
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">{g.icon}</span>
            <span className="text-xs font-black text-amber-300">+{g.val}</span>
          </div>
        ))}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
            <span className="text-7xl animate-bounce">🏆</span>
            <h4 className="mt-4 text-3xl font-black text-white">Phiên Đào Vàng Hoàn Tất!</h4>
            <p className="mt-2 text-base text-amber-200">Tổng điểm thu hoạch: <strong className="text-amber-400 text-xl">{score} điểm</strong></p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={restart}
                className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg shadow-xl transition cursor-pointer"
              >
                🔄 Đào Tiếp
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

      <div className="mt-6">
        <button
          type="button"
          onClick={launchHook}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-900 font-black text-lg rounded-2xl shadow-xl transition cursor-pointer"
        >
          🪝 THẢ MÓC NGAY (CHẠM / CLICK)
        </button>
      </div>
    </div>
  );
};
