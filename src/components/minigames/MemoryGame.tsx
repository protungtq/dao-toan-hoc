import React, { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface CardItem {
  id: number;
  glyph: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const GLYPH_POOL = ['⚡', '🔮', '💎', '🚀', '👾', '🔥', '🛡️', '👑', '🌌', '🧬', '🌀', '🎯'];

export const MemoryGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matchesCount, setMatchesCount] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [hintsLeft, setHintsLeft] = useState<number>(2);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);
  const [cardCount, setCardCount] = useState<16 | 24>(16);

  const initGame = useCallback(
    (count: 16 | 24 = cardCount) => {
      playMiniGameSound('step');
      const pairsNeeded = count / 2;
      const selectedGlyphs = GLYPH_POOL.slice(0, pairsNeeded);
      const deck: CardItem[] = [];

      selectedGlyphs.forEach((glyph, idx) => {
        deck.push({ id: idx * 2, glyph, isFlipped: false, isMatched: false });
        deck.push({ id: idx * 2 + 1, glyph, isFlipped: false, isMatched: false });
      });

      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }

      setCards(deck);
      setFlippedIndices([]);
      setMoves(0);
      setMatchesCount(0);
      setSeconds(0);
      setIsVictory(false);
      setStreak(0);
      setHintsLeft(2);
      setIsPeeking(false);
      onScore?.(0);
    },
    [cardCount, onScore]
  );

  useEffect(() => {
    initGame(cardCount);
  }, [initGame, cardCount]);

  useEffect(() => {
    if (isVictory) return;
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isVictory]);

  const handleCardClick = (index: number) => {
    if (isPeeking || isVictory) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched || flippedIndices.length >= 2) return;

    playMiniGameSound('step');

    const newIndices = [...flippedIndices, index];
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, isFlipped: true } : c))
    );
    setFlippedIndices(newIndices);

    if (newIndices.length === 2) {
      setMoves((m) => m + 1);
      const [idx1, idx2] = newIndices;
      const card1 = cards[idx1];
      const card2 = cards[idx2];

      if (card1.glyph === card2.glyph) {
        setTimeout(() => {
          playMiniGameSound('collect');
          const nextStreak = streak + 1;
          setStreak(nextStreak);
          
          setMatchesCount((mc) => {
            const nextMatch = mc + 1;
            const timeBonus = Math.max(0, 300 - seconds * 3);
            const movesPenalty = (moves + 1) * 10;
            const currentScore = Math.max(0, nextMatch * 120 + timeBonus - movesPenalty + nextStreak * 30);
            onScore?.(currentScore);

            if (nextMatch === cards.length / 2) {
              playMiniGameSound('success');
              setIsVictory(true);
              const finalScore = Math.max(100, 1000 + timeBonus - movesPenalty + nextStreak * 50);
              onScore?.(finalScore);
              onFinish?.(finalScore);
            }
            return nextMatch;
          });

          setCards((prev) =>
            prev.map((c, i) =>
              i === idx1 || i === idx2 ? { ...c, isMatched: true } : c
            )
          );
          setFlippedIndices([]);
        }, 400);
      } else {
        playMiniGameSound('miss');
        setStreak(0);
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, i) =>
              i === idx1 || i === idx2 ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const handlePeek = () => {
    if (hintsLeft <= 0 || isPeeking || isVictory) return;
    playMiniGameSound('collect');
    setHintsLeft((h) => h - 1);
    setIsPeeking(true);

    setTimeout(() => {
      setIsPeeking(false);
    }, 1200);
  };

  const calculateCurrentScore = () => {
    const timeBonus = Math.max(0, 300 - seconds * 3);
    const movesPenalty = moves * 10;
    return Math.max(0, matchesCount * 120 + timeBonus - movesPenalty + streak * 30);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-xl mx-auto w-full select-none text-slate-800 dark:text-slate-100">
      {/* HUD Bar */}
      <div className="w-full flex items-center justify-between mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ĐIỂM SỐ</div>
            <div className="text-2xl font-black font-mono text-violet-600 dark:text-purple-400 tabular-nums">
              {calculateCurrentScore()}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">SỐ LƯỢT LẬT</div>
            <div className="text-2xl font-black font-mono text-slate-800 dark:text-slate-200 tabular-nums">{moves}</div>
          </div>
        </div>

        {/* Timer & Streak */}
        <div className="flex items-center gap-2.5">
          {streak > 1 && (
            <div className="flex items-center gap-1 text-xs font-black text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 px-2.5 py-1 rounded-xl">
              <span>🔥 Chuỗi x{streak}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Mode Selector & Hint */}
      <div className="w-full flex items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setCardCount(16);
              initGame(16);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              cardCount === 16
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            16 Thẻ (4x4)
          </button>
          <button
            type="button"
            onClick={() => {
              setCardCount(24);
              initGame(24);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              cardCount === 24
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            24 Thẻ (4x6)
          </button>
        </div>

        <button
          type="button"
          onClick={handlePeek}
          disabled={hintsLeft <= 0 || isPeeking}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 border transition-all ${
            hintsLeft > 0
              ? 'bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 active:scale-95'
              : 'bg-slate-100 dark:bg-slate-950 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-50'
          }`}
          title="Mở toàn bộ thẻ trong 1.2 giây"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Soi bài ({hintsLeft})</span>
        </button>
      </div>

      {/* Cards Board Grid */}
      <div className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-5 shadow-lg w-full">
        <div
          className={`grid gap-2 sm:gap-3 ${
            cardCount === 16 ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-6'
          }`}
        >
          {cards.map((card, idx) => {
            const isShown = card.isFlipped || card.isMatched || isPeeking;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(idx)}
                disabled={card.isMatched || isShown}
                className={`aspect-[3/4] rounded-2xl flex items-center justify-center transition-all duration-300 transform perspective-500 ${
                  card.isMatched
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400/60 shadow-xs opacity-75 scale-95'
                    : isShown
                    ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-2 border-violet-400 shadow-md scale-95'
                    : 'bg-slate-50 dark:bg-slate-900 hover:bg-violet-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-800 hover:border-violet-300 active:scale-95 shadow-xs'
                }`}
              >
                {isShown ? (
                  <span className="text-2xl sm:text-3xl select-none animate-scale-in">
                    {card.glyph}
                  </span>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                    <span className="text-xs font-black text-slate-400 dark:text-slate-600">?</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Modal */}
        {isVictory && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center rounded-3xl animate-fade-in z-20">
            <span className="text-5xl mb-2 animate-bounce">✨</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">XUẤT SẮC! ĐÃ TÌM HẾT CÁC CẶP</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
              Số lượt lật: <span className="font-mono text-violet-600 dark:text-purple-300 font-black">{moves}</span> lượt
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Thời gian hoàn thành: <span className="font-mono text-violet-600 dark:text-purple-300 font-black">{seconds}s</span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => initGame(cardCount)}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl flex items-center gap-2 active:scale-95 shadow-lg shadow-violet-600/30 transition-all"
              >
                Chơi lại
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-5 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Thoát
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => initGame(cardCount)}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 flex items-center gap-2 text-xs font-bold transition-all shadow-xs"
        >
          🔄 Trộn bài & làm mới
        </button>
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-xs"
          >
            Thoát game
          </button>
        )}
      </div>
    </div>
  );
};