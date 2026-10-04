import React, { useState, useEffect, useCallback, useRef } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface Question {
  text: string;
  isCorrect: boolean;
}

export const ReflexMathGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [question, setQuestion] = useState<Question>({ text: '', isCorrect: true });
  const [timeLeft, setTimeLeft] = useState<number>(3.0);
  const [maxTime, setMaxTime] = useState<number>(3.0);
  const [flashFeedback, setFlashFeedback] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<number | null>(null);

  const generateQuestion = useCallback((currentStreak: number): Question => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1 = 0;
    let n2 = 0;
    let trueAns = 0;

    if (op === '+') {
      n1 = Math.floor(Math.random() * 40) + 5;
      n2 = Math.floor(Math.random() * 40) + 5;
      trueAns = n1 + n2;
    } else if (op === '-') {
      n1 = Math.floor(Math.random() * 60) + 15;
      n2 = Math.floor(Math.random() * n1) + 1;
      trueAns = n1 - n2;
    } else {
      n1 = Math.floor(Math.random() * 12) + 2;
      n2 = Math.floor(Math.random() * 10) + 2;
      trueAns = n1 * n2;
    }

    const isActuallyCorrect = Math.random() > 0.5;
    let displayAns = trueAns;

    if (!isActuallyCorrect) {
      const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
      displayAns = trueAns + offset;
      if (displayAns === trueAns) displayAns += 2;
    }

    const nextMaxTime = Math.max(1.6, 3.2 - Math.min(1.4, currentStreak * 0.08));
    setMaxTime(nextMaxTime);
    setTimeLeft(nextMaxTime);

    return {
      text: `${n1} ${op} ${n2} = ${displayAns}`,
      isCorrect: isActuallyCorrect,
    };
  }, []);

  const resetGame = useCallback(() => {
    playMiniGameSound('step');
    setScore(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setIsGameOver(false);
    setFlashFeedback(null);
    onScore?.(0);
    setQuestion(generateQuestion(0));
  }, [generateQuestion, onScore]);

  useEffect(() => {
    setQuestion(generateQuestion(0));
  }, [generateQuestion]);

  const handleAnswer = useCallback(
    (choice: boolean) => {
      if (isGameOver) return;

      const isRight = choice === question.isCorrect;

      if (isRight) {
        playMiniGameSound('collect');
        setFlashFeedback('correct');

        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setMaxStreak((m) => Math.max(m, nextStreak));

        const multiplier = nextStreak >= 10 ? 5 : nextStreak >= 6 ? 3 : nextStreak >= 3 ? 2 : 1;
        const timeBonus = Math.floor(timeLeft * 10);
        const addedScore = 50 * multiplier + timeBonus;

        setScore((s) => {
          const nextScore = s + addedScore;
          onScore?.(nextScore);
          return nextScore;
        });
        setQuestion(generateQuestion(nextStreak));
      } else {
        playMiniGameSound('miss');
        setFlashFeedback('wrong');
        setStreak(0);

        setLives((prevLives) => {
          const next = prevLives - 1;
          if (next <= 0) {
            playMiniGameSound('miss');
            setIsGameOver(true);
            onFinish?.(score);
          } else {
            setQuestion(generateQuestion(0));
          }
          return next;
        });
      }

      setTimeout(() => setFlashFeedback(null), 300);
    },
    [isGameOver, question, streak, timeLeft, score, generateQuestion, onScore, onFinish]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleAnswer(true);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleAnswer(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAnswer]);

  useEffect(() => {
    if (isGameOver) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.05) {
          playMiniGameSound('miss');
          setStreak(0);
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setIsGameOver(true);
              onFinish?.(score);
            } else {
              setQuestion(generateQuestion(0));
            }
            return nextL;
          });
          return maxTime;
        }
        return prev - 0.05;
      });
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver, maxTime, score, generateQuestion, onFinish]);

  const multiplier = streak >= 10 ? 5 : streak >= 6 ? 3 : streak >= 3 ? 2 : 1;

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-xl mx-auto w-full select-none text-slate-800 dark:text-slate-100">
      {/* HUD Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ĐIỂM SỐ</div>
            <div className="text-2xl font-black font-mono text-violet-600 dark:text-amber-400 tabular-nums">{score}</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">CHUỖI CAO NHẤT</div>
            <div className="text-2xl font-black font-mono text-slate-800 dark:text-slate-200 tabular-nums">{maxStreak} 🔥</div>
          </div>
        </div>

        {/* Lives (Hearts) */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800" aria-label={`Còn ${lives} lượt`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 transition-transform duration-200 ${
                i < lives ? 'text-rose-500 fill-rose-500 scale-100' : 'text-slate-300 dark:text-slate-700 scale-90'
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ))}
        </div>
      </div>

      {/* Main Problem Card */}
      <div
        className={`relative w-full max-w-[440px] bg-white dark:bg-slate-950 border-2 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center justify-center transition-colors duration-200 ${
          flashFeedback === 'correct'
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
            : flashFeedback === 'wrong'
            ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex items-center gap-2 mb-2 min-h-7">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 px-3 py-1 rounded-full animate-bounce">
              <span>🔥 Chuỗi {streak} liên tiếp · Nhân x{multiplier}!</span>
            </div>
          )}
        </div>

        {/* Animated Countdown Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full overflow-hidden mb-6 border border-slate-200 dark:border-slate-800">
          <div
            className={`h-full transition-all duration-75 rounded-full ${
              timeLeft / maxTime < 0.3
                ? 'bg-rose-500'
                : timeLeft / maxTime < 0.6
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.max(0, (timeLeft / maxTime) * 100)}%` }}
          />
        </div>

        {/* Problem text */}
        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight my-4 text-center tabular-nums">
          {question.text}
        </div>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6 text-center font-medium">
          Phép tính trên ĐÚNG hay SAI? (Còn <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{timeLeft.toFixed(1)}s</span>)
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            type="button"
            onClick={() => handleAnswer(true)}
            className="py-4 px-5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all text-base sm:text-lg"
          >
            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span>ĐÚNG</span>
          </button>

          <button
            type="button"
            onClick={() => handleAnswer(false)}
            className="py-4 px-5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25 active:scale-95 transition-all text-base sm:text-lg"
          >
            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>SAI</span>
          </button>
        </div>

        <div className="flex items-center justify-between w-full mt-5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>👈 Phím A / ← : Đúng</span>
          <span>Phím D / → : Sai 👉</span>
        </div>

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center rounded-3xl animate-fade-in z-20">
            <span className="text-5xl mb-2">🏆</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">KẾT THÚC LƯỢT ĐẤU!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
              Điểm đạt được: <span className="font-mono text-violet-600 dark:text-amber-400 font-black text-xl">{score}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Chuỗi trả lời đúng liên tiếp: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{maxStreak} câu</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={resetGame}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl active:scale-95 shadow-md shadow-amber-500/20 transition-all"
              >
                Thử thách lại
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

      <div className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
        <span>⚡ Càng phản xạ trả lời đúng nhanh, điểm thưởng thời gian càng cao!</span>
      </div>
    </div>
  );
};