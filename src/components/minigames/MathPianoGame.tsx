import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const MathPianoGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [tiles, setTiles] = useState<{ id: number; lane: number; num: number; y: number }[]>([
    { id: 1, lane: 0, num: 5, y: 0 },
    { id: 2, lane: 2, num: 8, y: 150 },
  ]);
  const [targetSum, setTargetSum] = useState(10);
  const [isGameOver, setIsGameOver] = useState(false);

  const spawnTile = useCallback(() => {
    const lane = Math.floor(Math.random() * 3);
    const num = Math.floor(Math.random() * 9) + 1;
    setTiles(prev => [...prev, { id: Date.now(), lane, num, y: 0 }]);
  }, []);

  useEffect(() => {
    const t = Math.floor(Math.random() * 10) + 5;
    setTargetSum(t);
  }, []);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setTiles(prev => {
        let missed = false;
        const next = prev.map(t => ({ ...t, y: t.y + 18 })).filter(t => {
          if (t.y > 300) {
            missed = true;
            return false;
          }
          return true;
        });

        if (missed) {
          playMiniGameSound('miss');
        }

        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      spawnTile();
    }, 1800);
    return () => clearInterval(timer);
  }, [isGameOver, spawnTile]);

  const tapTile = (tileId: number, num: number) => {
    if (isGameOver) return;
    playMiniGameSound('collect');
    setTiles(prev => prev.filter(t => t.id !== tileId));
    const nextScore = score + num;
    setScore(nextScore);
    onScore?.(nextScore);
  };

  const restart = () => {
    setScore(0);
    setTiles([{ id: 1, lane: 1, num: 5, y: 50 }]);
    setIsGameOver(false);
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-indigo-600 to-violet-900 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>🎹</span>
            <span>Đàn Piano Số Học</span>
          </h3>
          <p className="text-xs text-indigo-100">Chạm đúng các phím đàn rơi xuống theo giai điệu số học!</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold text-indigo-200">Điểm số</div>
          <div className="text-2xl font-black">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-slate-950/80 border border-indigo-400/30 p-4 flex flex-col justify-between">
        {/* Falling piano tiles across 3 lanes */}
        <div className="relative h-full grid grid-cols-3 gap-2 border-b border-indigo-500/40 pb-16">
          {[0, 1, 2].map(laneIdx => (
            <div key={laneIdx} className="relative border-x border-indigo-500/20 h-full">
              {tiles.filter(t => t.lane === laneIdx).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => tapTile(t.id, t.num)}
                  className="absolute left-2 right-2 h-14 rounded-2xl bg-gradient-to-t from-amber-500 to-amber-300 border-2 border-white shadow-xl flex items-center justify-center text-slate-900 font-black text-2xl active:scale-95 transition cursor-pointer"
                  style={{ top: `${t.y}px` }}
                >
                  🎵 {t.num}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Keyboard tap buttons */}
        <div className="grid grid-cols-3 gap-2 absolute bottom-3 left-4 right-4">
          {[0, 1, 2].map(laneIdx => (
            <div
              key={laneIdx}
              className="h-12 rounded-xl bg-violet-600/60 border border-violet-400/50 flex items-center justify-center font-bold text-sm"
            >
              Phím {laneIdx + 1}
            </div>
          ))}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl animate-bounce">🎶</span>
            <h4 className="mt-3 text-2xl font-black text-white">Buổi hòa nhạc kết thúc!</h4>
            <p className="mt-1 text-sm text-indigo-200">Tổng điểm: <strong className="text-amber-400">{score} điểm</strong></p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-violet-500 hover:bg-violet-400 text-white font-black shadow-lg transition cursor-pointer"
              >
                🔄 Chơi lại bản nhạc
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
