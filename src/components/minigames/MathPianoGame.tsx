import React, { useState, useEffect, useCallback, useRef } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface Tile {
  id: number;
  lane: number;
  num: number;
  y: number;
}

export const MathPianoGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [targetSum, setTargetSum] = useState(10);
  const [activeLane, setActiveLane] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [combo, setCombo] = useState(0);

  const scoreRef = useRef(score);
  scoreRef.current = score;
  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;

  const generateTarget = useCallback(() => {
    setTargetSum(Math.floor(Math.random() * 10) + 8);
  }, []);

  useEffect(() => {
    generateTarget();
  }, [generateTarget]);

  useEffect(() => {
    if (isGameOver) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          playMiniGameSound('gameover');
          onFinish?.(scoreRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isGameOver, onFinish]);

  // Falling tiles loop
  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTiles(prev => {
        let missed = false;
        const next = prev.map(t => ({ ...t, y: t.y + 10 })).filter(t => {
          if (t.y > 360) {
            missed = true;
            return false;
          }
          return true;
        });

        if (missed) {
          playMiniGameSound('miss');
          setCombo(0);
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isGameOver]);

  // Spawn tiles loop
  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      const lane = Math.floor(Math.random() * 4);
      const num = Math.floor(Math.random() * 9) + 1;
      setTiles(prev => [...prev, { id: Date.now() + Math.random(), lane, num, y: 0 }]);
    }, 1200);
    return () => clearInterval(timer);
  }, [isGameOver]);

  const pressPianoKey = useCallback((laneIdx: number) => {
    if (isGameOverRef.current) return;
    setActiveLane(laneIdx);
    setTimeout(() => setActiveLane(null), 120);

    // Find tile in this lane near bottom hit zone (y between 200 and 370)
    setTiles(currentTiles => {
      const hitTile = currentTiles.find(t => t.lane === laneIdx && t.y >= 200 && t.y <= 370);
      if (hitTile) {
        playMiniGameSound('collect');
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        const added = (hitTile.num + Math.floor(nextCombo / 3)) * 5;
        const nextScore = scoreRef.current + added;
        setScore(nextScore);
        onScore?.(nextScore);
        return currentTiles.filter(t => t.id !== hitTile.id);
      } else {
        playMiniGameSound('step');
        return currentTiles;
      }
    });
  }, [combo, onScore]);

  // Keyboard support: 1, 2, 3, 4
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === 'q') pressPianoKey(0);
      if (e.key === '2' || e.key === 'w') pressPianoKey(1);
      if (e.key === '3' || e.key === 'e') pressPianoKey(2);
      if (e.key === '4' || e.key === 'r') pressPianoKey(3);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pressPianoKey]);

  const restart = () => {
    setScore(0);
    setTimeLeft(45);
    setTiles([]);
    setIsGameOver(false);
    setCombo(0);
    generateTarget();
  };

  const laneNames = ['Đồ (1)', 'Rê (2)', 'Mi (3)', 'Fa (4)'];
  const laneColors = [
    'from-rose-500 via-red-600 to-rose-700',
    'from-amber-500 via-orange-600 to-amber-700',
    'from-emerald-500 via-teal-600 to-emerald-700',
    'from-sky-500 via-blue-600 to-indigo-700'
  ];

  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-950 p-6 sm:p-8 text-white shadow-2xl border border-indigo-400/40">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <span>🎹</span>
            <span>Đàn Piano Số Học Pro</span>
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200">Chạm đúng nốt nhạc khi rơi xuống vạch đích! (Phím 1-4 hoặc Chạm)</p>
        </div>
        <div className="flex items-center gap-3">
          {combo > 1 && (
            <div className="bg-amber-500/20 border border-amber-400 text-amber-300 px-3 py-1.5 rounded-2xl font-black text-xs animate-pulse">
              🔥 x{combo} Combo
            </div>
          )}
          <div className="text-right bg-black/50 px-4 py-2 rounded-2xl border border-white/20">
            <div className="text-[11px] uppercase font-bold text-indigo-300">⏱️ {timeLeft}s</div>
            <div className="text-2xl font-black text-amber-400">{score} đ</div>
          </div>
        </div>
      </div>

      <div className="relative h-[440px] w-full overflow-hidden rounded-3xl bg-slate-950 border-2 border-indigo-500/50 shadow-inner flex flex-col justify-between p-4">
        {/* 4 Lanes */}
        <div className="relative h-full grid grid-cols-4 gap-2 pb-24">
          {[0, 1, 2, 3].map(laneIdx => (
            <div key={laneIdx} className="relative border-x border-indigo-500/20 h-full flex flex-col items-center">
              {tiles.filter(t => t.lane === laneIdx).map(t => (
                <div
                  key={t.id}
                  className={`absolute w-14 h-14 rounded-2xl bg-gradient-to-tr ${laneColors[laneIdx]} border-2 border-white/90 shadow-[0_0_20px_rgba(255,255,255,0.7)] flex flex-col items-center justify-center font-black text-xl transition-transform`}
                  style={{ top: `${t.y}px` }}
                >
                  <span>🎵</span>
                  <span className="text-xs">{t.num}</span>
                </div>
              ))}
            </div>
          ))}

          {/* Hit Line indicator */}
          <div className="absolute bottom-24 left-0 right-0 h-1.5 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.9)] z-10" />
        </div>

        {/* Interactive Piano Keys */}
        <div className="grid grid-cols-4 gap-2 absolute bottom-4 left-4 right-4 z-20">
          {[0, 1, 2, 3].map(laneIdx => (
            <button
              key={laneIdx}
              type="button"
              onClick={() => pressPianoKey(laneIdx)}
              className={`h-20 rounded-2xl bg-gradient-to-b ${laneColors[laneIdx]} border-3 border-white/90 shadow-2xl flex flex-col items-center justify-center font-black text-sm active:scale-95 transition-all cursor-pointer ${
                activeLane === laneIdx ? 'scale-95 brightness-125 ring-4 ring-amber-400' : 'hover:brightness-110'
              }`}
            >
              <span className="text-lg">🎹</span>
              <span className="text-xs uppercase">{laneNames[laneIdx]}</span>
            </button>
          ))}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
            <span className="text-7xl animate-bounce">🎶</span>
            <h4 className="mt-4 text-3xl font-black text-white">Bản Nhạc Hoàn Thành!</h4>
            <p className="mt-2 text-base text-indigo-200">Điểm số biểu diễn: <strong className="text-amber-400 text-xl">{score} điểm</strong></p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={restart}
                className="px-8 py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black text-lg shadow-xl transition cursor-pointer"
              >
                🔄 Chơi Lại
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
