import React, { useState } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const CutTheRopeGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [ropesCut, setRopesCut] = useState([false, false, false]);
  const [acornDropped, setAcornDropped] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const cutRope = (index: number) => {
    if (acornDropped) return;
    playMiniGameSound('collect');
    const nextRopes = [...ropesCut];
    nextRopes[index] = true;
    setRopesCut(nextRopes);

    if (nextRopes.every(Boolean)) {
      setAcornDropped(true);
      setIsSuccess(true);
      playMiniGameSound('fanfare');
      const nextScore = score + 20;
      setScore(nextScore);
      onScore?.(nextScore);
      onFinish?.(nextScore);
    }
  };

  const restart = () => {
    setRopesCut([false, false, false]);
    setAcornDropped(false);
    setIsSuccess(false);
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-amber-600 to-amber-950 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>🌰</span>
            <span>Cắt Dây Thả Hạt Dẻ</span>
          </h3>
          <p className="text-xs text-amber-200">Cắt đúng các sợi dây để hạt dẻ rơi chính xác vào miệng Sóc!</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold text-amber-200">Điểm số</div>
          <div className="text-2xl font-black">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[360px] w-full overflow-hidden rounded-2xl bg-amber-950/90 border border-amber-500/40 p-6 flex flex-col justify-between items-center">
        {/* Acorn hanging by ropes */}
        <div className="relative w-full h-48 flex justify-around items-start pt-6">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex flex-col items-center">
              {!ropesCut[i] ? (
                <button
                  type="button"
                  onClick={() => cutRope(i)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl font-black text-xs shadow-lg border border-white/30 cursor-pointer active:scale-95 transition"
                >
                  ✂️ Cắt dây {i + 1}
                </button>
              ) : (
                <span className="text-xs text-slate-500">Đã cắt</span>
              )}
              <div className="w-1 h-20 bg-amber-200/60 my-2" />
            </div>
          ))}
        </div>

        {/* Acorn & Squirrel */}
        <div className="relative flex flex-col items-center mb-4">
          <div className={`text-5xl transition-all duration-700 ${acornDropped ? 'translate-y-24 scale-125' : ''}`}>
            🌰
          </div>
          <div className="text-4xl mt-2 animate-bounce">🐿️</div>
        </div>

        {isSuccess && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl">🎉</span>
            <h4 className="mt-3 text-2xl font-black text-white">Sóc đã ăn được hạt dẻ ngon lành!</h4>
            <p className="mt-1 text-sm text-amber-200">Điểm thưởng: <strong className="text-amber-400">{score} điểm</strong></p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black shadow-lg transition cursor-pointer"
              >
                🔄 Thử màn tiếp
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
