import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Eye, Sparkles, Timer, Flame } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Props {
  highScore: number;
  onGameOver: (score: number, extra?: { moves?: number }) => void;
  onExit: () => void;
}

interface CardItem {
  id: number;
  glyph: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const GLYPH_POOL = ['⚡', '🔮', '💎', '🚀', '👾', '🔥', '🛡️', '👑', '🌌', '🧬', '🌀', '🎯'];

export const MemoryGame: React.FC<Props> = ({ highScore, onGameOver }) => {
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
      sound.click();
      const pairsNeeded = count / 2;
      const selectedGlyphs = GLYPH_POOL.slice(0, pairsNeeded);
      const deck: CardItem[] = [];

      selectedGlyphs.forEach((glyph, idx) => {
        deck.push({ id: idx * 2, glyph, isFlipped: false, isMatched: false });
        deck.push({ id: idx * 2 + 1, glyph, isFlipped: false, isMatched: false });
      });

      // Shuffle deck
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
    },
    [cardCount]
  );

  useEffect(() => {
    initGame(cardCount);
  }, [initGame, cardCount]);

  // Timer tick
  useEffect(() => {
    if (isVictory) return;
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isVictory]);

  // Flip card handler
  const handleCardClick = (index: number) => {
    if (isPeeking || isVictory) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched || flippedIndices.length >= 2) return;

    sound.cardFlip();

    const newIndices = [...flippedIndices, index];
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, isFlipped: true } : c))
    );
    setFlippedIndices(newIndices);

    // If 2 cards are now open
    if (newIndices.length === 2) {
      setMoves((m) => m + 1);
      const [idx1, idx2] = newIndices;
      const card1 = cards[idx1];
      const card2 = cards[idx2];

      if (card1.glyph === card2.glyph) {
        // Matched!
        setTimeout(() => {
          sound.cardMatch();
          setStreak((st) => st + 1);
          setMatchesCount((mc) => {
            const nextMatch = mc + 1;
            if (nextMatch === cards.length / 2) {
              // Victory
              sound.victory();
              setIsVictory(true);
              const timeBonus = Math.max(0, 300 - seconds * 3);
              const movesPenalty = moves * 10;
              const finalScore = Math.max(100, 1000 + timeBonus - movesPenalty + streak * 50);
              onGameOver(finalScore, { moves: moves + 1 });
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
        // Mismatch
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

  // Peek Hint
  const handlePeek = () => {
    if (hintsLeft <= 0 || isPeeking || isVictory) return;
    sound.bonus();
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
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full select-none">
      {/* HUD Bar */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">ĐIỂM SỐ</div>
            <div className="text-2xl font-bold font-mono text-purple-400 tabular-nums">
              {calculateCurrentScore()}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400 font-medium">SỐ LƯỢT LẬT</div>
            <div className="text-2xl font-bold font-mono text-slate-200 tabular-nums">{moves}</div>
          </div>
        </div>

        {/* Timer & Streak */}
        <div className="flex items-center gap-3">
          {streak > 1 && (
            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Chuỗi x{streak}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Timer className="w-3.5 h-3.5 text-slate-400" />
            <span>{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Mode Selector & Power-Up */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              setCardCount(16);
              initGame(16);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded ${
              cardCount === 16 ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            16 Thẻ (4x4)
          </button>
          <button
            onClick={() => {
              setCardCount(24);
              initGame(24);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded ${
              cardCount === 24 ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            24 Thẻ (4x6)
          </button>
        </div>

        {/* Soi bài button */}
        <button
          onClick={handlePeek}
          disabled={hintsLeft <= 0 || isPeeking}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 border transition-all ${
            hintsLeft > 0
              ? 'bg-slate-800 hover:bg-slate-700 text-purple-300 border-purple-500/30 active:scale-95'
              : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
          }`}
          title="Mở toàn bộ thẻ trong 1.2 giây"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Soi bài ({hintsLeft})</span>
        </button>
      </div>

      {/* Cards Board Grid */}
      <div className="relative bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 shadow-2xl w-full">
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
                onClick={() => handleCardClick(idx)}
                disabled={card.isMatched || isShown}
                className={`aspect-[3/4] rounded-xl flex items-center justify-center transition-all duration-300 transform perspective-500 ${
                  card.isMatched
                    ? 'bg-purple-950/40 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)] opacity-70'
                    : isShown
                    ? 'bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-purple-400 shadow-md scale-95'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-95 shadow-sm'
                }`}
              >
                {isShown ? (
                  <span className="text-2xl sm:text-3xl select-none animate-scale-in">
                    {card.glyph}
                  </span>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-dashed border-slate-700 flex items-center justify-center">
                    <span className="text-[10px] text-slate-600">?</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Modal */}
        {isVictory && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center rounded-2xl animate-fade-in">
            <Sparkles className="w-12 h-12 text-purple-400 mb-2 animate-bounce" />
            <h3 className="text-2xl font-bold text-white mb-1">XUẤT SẮC! ĐÃ TÌM HẾT CÁC CẶP</h3>
            <p className="text-sm text-slate-300 mb-1">
              Số lượt lật: <span className="font-mono text-purple-300 font-bold">{moves}</span> lượt
            </p>
            <p className="text-sm text-slate-300 mb-5">
              Thời gian hoàn thành: <span className="font-mono text-purple-300 font-bold">{seconds}s</span>
            </p>
            <button
              onClick={() => initGame(cardCount)}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex items-center gap-2 active:scale-95 shadow-lg shadow-purple-600/30"
            >
              <RotateCcw className="w-5 h-5" />
              Chơi Lại Ván Mới
            </button>
          </div>
        )}
      </div>

      {/* Reset button */}
      <div className="mt-4">
        <button
          onClick={() => initGame(cardCount)}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 flex items-center gap-2 text-xs font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
          Trộn bài & Làm mới
        </button>
      </div>
    </div>
  );
};
