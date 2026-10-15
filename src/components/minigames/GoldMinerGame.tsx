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
  const [hookLength, setHookLength] = useState(40);
  const [targetGem, setTargetGem] = useState<{ val: number; icon: string; points: number } | null>(null);
  const [gems, setGems] = useState([
    { id: 1, val: 12, icon: '💎', points: 15, left: 20, top: 200 },
    { id: 2, val: 24, icon: '🏆', points: 30, left: 50, top: 240 },
    { id: 3, val: 7, icon: '💰', points: 10, left: 80, top: 180 },
  ]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(35);

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

  // Swing hook animation
  useEffect(() => {
    if (hookState !== 'swing' || isGameOver) return;
    let dir = 1;
    const t = setInterval(() => {
      setAngle(a => {
        if (a > 60) dir = -1;
        if (a < -60) dir = 1;
        return a + dir * 2;
      });
    }, 30);
    return () => clearInterval(t);
  }, [hookState, isGameOver]);

  const launchHook = () => {
    if (hookState !== 'swing' || isGameOver) return;
    setHookState('shoot');
    playMiniGameSound('collect');

    let len = 40;
    const shootInterval = setInterval(() => {
      len += 15;
      setHookLength(len);

      // Check hit gem
      const hit = gems.find(g => Math.abs(g.left - (50 + angle * 0.6)) < 15 && Math.abs(g.top - len) < 20);
      if (hit || len > 280) {
        clearInterval(shootInterval);
        if (hit) {
          setTargetGem({ val: hit.val, icon: hit.icon, points: hit.points });
          setGems(prev => prev.filter(g => g.id !== hit.id));
          const nextScore = score + hit.points;
          setScore(nextScore);
          onScore?.(nextScore);
          playMiniGameSound('fanfare');
        }

        // Return hook
        const returnInterval = setInterval(() => {
          len -= 15;
          setHookLength(len);
          if (len <= 40) {
            clearInterval(returnInterval);
            setHookLength(40);
            setHookState('swing');
            setTargetGem(null);
            if (gems.length <= 1) {
              setGems([
                { id: Math.random(), val: Math.floor(Math.random() * 30) + 5, icon: '💎', points: 15, left: Math.random() * 60 + 20, top: 200 },
                { id: Math.random(), val: Math.floor(Math.random() * 40) + 10, icon: '🏆', points: 30, left: Math.random() * 60 + 20, top: 230 },
                { id: Math.random(), val: Math.floor(Math.random() * 20) + 2, icon: '💰', points: 10, left: Math.random() * 60 + 20, top: 190 },
              ]);
            }
          }
        }, 20);
      }
    }, 20);
  };

  const restart = () => {
    setScore(0);
    setTimeLeft(35);
    setIsGameOver(false);
    setHookState('swing');
    setHookLength(40);
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-amber-600 to-amber-900 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>⛏️</span>
            <span>Đào Vàng Tri Thức</span>
          </h3>
          <p className="text-xs text-amber-200">Thả móc đúng hướng để thu thập kho báu toán học!</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold text-amber-200">Thời gian: {timeLeft}s</div>
          <div className="text-2xl font-black">{score} đ</div>
        </div>
      </div>

      <div
        onClick={launchHook}
        className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-amber-950/80 border border-amber-500/30 cursor-pointer select-none"
      >
        {/* Crane / Hook origin */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl">🏗️</div>

        {/* Swinging Hook line */}
        <div
          className="absolute top-10 left-1/2 origin-top border-l-2 border-dashed border-amber-300"
          style={{
            height: `${hookLength}px`,
            transform: `translateX(-50%) rotate(${angle}deg)`,
          }}
        >
          <div className="absolute -bottom-2 -left-3 text-2xl">🪝</div>
          {targetGem && (
            <div className="absolute -bottom-8 -left-4 text-2xl animate-bounce">
              {targetGem.icon}
            </div>
          )}
        </div>

        {/* Gems on ground */}
        {gems.map(g => (
          <div
            key={g.id}
            className="absolute flex flex-col items-center p-2 rounded-xl bg-amber-900/60 border border-amber-600/50 shadow-md"
            style={{ left: `${g.left}%`, top: `${g.top}px` }}
          >
            <span className="text-2xl">{g.icon}</span>
            <span className="text-xs font-black text-amber-300">{g.val}</span>
          </div>
        ))}

        {isGameOver && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl">💰</span>
            <h4 className="mt-3 text-2xl font-black text-white">Hoàn thành phiên đào vàng!</h4>
            <p className="mt-1 text-sm text-amber-200">Tổng điểm: <strong className="text-amber-400">{score} điểm</strong></p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black shadow-lg transition cursor-pointer"
              >
                🔄 Tiếp tục đào
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

      <div className="mt-4">
        <button
          type="button"
          onClick={launchHook}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-900 font-black text-lg rounded-2xl shadow-lg transition cursor-pointer"
        >
          🪝 THẢ MÓC (CHẠM / CLICK)
        </button>
      </div>
    </div>
  );
};
