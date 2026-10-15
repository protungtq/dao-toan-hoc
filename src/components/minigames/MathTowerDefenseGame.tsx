import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const MathTowerDefenseGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [castleHp, setCastleHp] = useState(5);
  const [enemies, setEnemies] = useState<{ id: number; question: string; answer: number; pos: number }[]>([
    { id: 1, question: '3 + 4 = ?', answer: 7, pos: 10 },
    { id: 2, question: '5 × 2 = ?', answer: 10, pos: 40 },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isGameOver, setIsGameOver] = useState(false);

  const spawnEnemy = useCallback(() => {
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.floor(Math.random() * 8) + 1;
    const isPlus = Math.random() > 0.5;
    const ans = isPlus ? a + b : a * b;
    const q = isPlus ? `${a} + ${b} = ?` : `${a} × ${b} = ?`;
    setEnemies(prev => [...prev, { id: Date.now(), question: q, answer: ans, pos: 0 }]);
  }, []);

  useEffect(() => {
    if (isGameOver) return;
    const interval = setInterval(() => {
      setEnemies(prev => {
        let hpLoss = 0;
        const next = prev.map(e => ({ ...e, pos: e.pos + 12 })).filter(e => {
          if (e.pos >= 90) {
            hpLoss++;
            return false;
          }
          return true;
        });

        if (hpLoss > 0) {
          playMiniGameSound('miss');
          setCastleHp(hp => {
            const h = hp - hpLoss;
            if (h <= 0) {
              setIsGameOver(true);
              onFinish?.(score);
            }
            return h;
          });
        }

        if (Math.random() > 0.6 && next.length < 4) {
          // spawn new inside state update or effect
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isGameOver, score, onFinish]);

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(() => {
      spawnEnemy();
    }, 3500);
    return () => clearInterval(timer);
  }, [isGameOver, spawnEnemy]);

  const submitAnswer = (num: number) => {
    if (isGameOver) return;
    const target = enemies.find(e => e.answer === num);
    if (target) {
      playMiniGameSound('collect');
      setEnemies(prev => prev.filter(e => e.id !== target.id));
      const nextScore = score + 10;
      setScore(nextScore);
      onScore?.(nextScore);
      setInputVal('');
    } else {
      playMiniGameSound('miss');
    }
  };

  const restart = () => {
    setScore(0);
    setCastleHp(5);
    setEnemies([{ id: 1, question: '3 + 4 = ?', answer: 7, pos: 10 }]);
    setIsGameOver(false);
  };

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-b from-purple-700 to-indigo-900 p-6 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span>🏰</span>
            <span>Tháp Toán Học (Defense)</span>
          </h3>
          <p className="text-xs text-purple-200">Giải toán nhanh để tiêu diệt quái vật trước khi đến tháp!</p>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase font-bold text-purple-200">❤️ HP Lâu đài: {castleHp}</div>
          <div className="text-2xl font-black">{score} đ</div>
        </div>
      </div>

      <div className="relative h-[340px] w-full overflow-hidden rounded-2xl bg-slate-950/80 border border-purple-500/40 p-4 flex flex-col justify-between">
        {/* Enemies path */}
        <div className="relative h-48 border-b-2 border-dashed border-purple-400/40 flex items-center">
          <div className="absolute left-0 text-4xl">🏰</div>
          {enemies.map(e => (
            <div
              key={e.id}
              className="absolute transition-all duration-1000 flex flex-col items-center"
              style={{ left: `${e.pos}%` }}
            >
              <span className="text-2xl animate-bounce">👾</span>
              <span className="bg-rose-600 px-2.5 py-1 rounded-xl text-xs font-black shadow-lg border border-white/20 whitespace-nowrap">
                {e.question}
              </span>
            </div>
          ))}
        </div>

        {/* Number keypad for answers */}
        <div className="grid grid-cols-5 gap-2 mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => submitAnswer(n)}
              className="py-3 bg-purple-600 hover:bg-purple-500 active:scale-95 rounded-xl font-black text-lg shadow-md transition cursor-pointer"
            >
              {n}
            </button>
          ))}
        </div>

        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
            <span className="text-6xl">💥</span>
            <h4 className="mt-3 text-2xl font-black text-white">Lâu đài thất thủ!</h4>
            <p className="mt-1 text-sm text-purple-200">Điểm phòng thủ: <strong className="text-amber-400">{score} điểm</strong></p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white font-black shadow-lg transition cursor-pointer"
              >
                🔄 Xây lại tháp
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
