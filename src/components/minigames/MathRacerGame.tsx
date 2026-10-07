import { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface GateRow {
  id: number;
  y: number; // 0 to 100 percentage
  values: [number, number, number]; // value on lane 0, 1, 2
  correctLane: number;
  passed: boolean;
}

interface Question {
  text: string;
  answer: number;
}

function generateMathQuestion(level: number): Question {
  const opType = Math.random();
  let a = 0;
  let b = 0;
  let text = '';
  let answer = 0;

  if (level <= 2) {
    // Phép cộng trừ trong phạm vi 20 hoặc 50
    if (opType < 0.6) {
      a = Math.floor(Math.random() * 20) + 2;
      b = Math.floor(Math.random() * 20) + 1;
      text = `${a} + ${b} = ?`;
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 30) + 10;
      b = Math.floor(Math.random() * (a - 2)) + 1;
      text = `${a} - ${b} = ?`;
      answer = a - b;
    }
  } else if (level <= 5) {
    // Phép nhân bảng cửu chương 2 đến 9
    const mults = [2, 3, 4, 5, 6, 7, 8, 9];
    a = mults[Math.floor(Math.random() * mults.length)];
    b = Math.floor(Math.random() * 9) + 2;
    text = `${a} × ${b} = ?`;
    answer = a * b;
  } else {
    // Phép tính lớn hơn hoặc hỗn hợp
    if (opType < 0.4) {
      a = Math.floor(Math.random() * 8) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      text = `${a} × ${b} = ?`;
      answer = a * b;
    } else if (opType < 0.7) {
      a = (Math.floor(Math.random() * 8) + 2) * 5;
      b = Math.floor(Math.random() * 50) + 10;
      text = `${a} + ${b} = ?`;
      answer = a + b;
    } else {
      const divisor = Math.floor(Math.random() * 7) + 2;
      const quotient = Math.floor(Math.random() * 9) + 2;
      a = divisor * quotient;
      text = `${a} : ${divisor} = ?`;
      answer = quotient;
    }
  }

  return { text, answer };
}

export function MathRacerGame({ onScore, onFinish, onExit }: Props) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [lane, setLane] = useState(1); // 0: Left, 1: Center, 2: Right
  const [combo, setCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [question, setQuestion] = useState<Question>(() => generateMathQuestion(1));
  const [gates, setGates] = useState<GateRow[]>([]);
  const [flashMessage, setFlashMessage] = useState<{ text: string; type: 'hit' | 'miss' | 'nitro' } | null>(null);

  const laneRef = useRef(1);
  laneRef.current = lane;
  const questionRef = useRef(question);
  questionRef.current = question;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const livesRef = useRef(lives);
  livesRef.current = lives;
  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const roadScrollRef = useRef<number>(0);

  // Spawn cổng mới khi cần
  const spawnGate = useCallback((currentQuestion: Question) => {
    const correct = currentQuestion.answer;
    const correctLane = Math.floor(Math.random() * 3);
    const fake1 = correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
    let fake2 = correct + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 6) + 3);
    if (fake2 === fake1) fake2 = correct + 7;

    const values: [number, number, number] = [0, 0, 0];
    const fakes = [fake1, fake2];
    let fakeIdx = 0;

    for (let i = 0; i < 3; i++) {
      if (i === correctLane) {
        values[i] = correct;
      } else {
        values[i] = fakes[fakeIdx++];
      }
    }

    const newGate: GateRow = {
      id: Date.now() + Math.random(),
      y: 0,
      values,
      correctLane,
      passed: false
    };

    setGates((prev) => [...prev, newGate]);
  }, []);

  // Đổi làn
  const moveLeft = useCallback(() => {
    if (isGameOverRef.current) return;
    setLane((prev) => {
      const next = Math.max(0, prev - 1);
      if (next !== prev) playMiniGameSound('step');
      return next;
    });
  }, []);

  const moveRight = useCallback(() => {
    if (isGameOverRef.current) return;
    setLane((prev) => {
      const next = Math.min(2, prev + 1);
      if (next !== prev) playMiniGameSound('step');
      return next;
    });
  }, []);

  // Bắt phím điều khiển
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveRight();
      } else if (e.key === '1') {
        e.preventDefault();
        setLane(0);
        playMiniGameSound('step');
      } else if (e.key === '2') {
        e.preventDefault();
        setLane(1);
        playMiniGameSound('step');
      } else if (e.key === '3') {
        e.preventDefault();
        setLane(2);
        playMiniGameSound('step');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight]);

  // Vòng lặp game (Game loop 60fps)
  useEffect(() => {
    if (isGameOver) return;

    // Khởi tạo cổng đầu tiên
    if (gates.length === 0) {
      spawnGate(questionRef.current);
    }

    const step = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      roadScrollRef.current = (roadScrollRef.current + dt * 180) % 60;

      setGates((currentGates) => {
        const speed = 28 + speedLevel * 4; // Tốc độ rơi theo level
        let shouldSpawnNext = false;
        let nextQuestionNeeded = false;

        const updated = currentGates.map((gate) => {
          const nextY = gate.y + speed * dt;

          // Kiểm tra va chạm khi cổng đi qua tầm của xe (khoảng 72% đến 84%)
          if (!gate.passed && nextY >= 75) {
            gate.passed = true;
            const currentCarLane = laneRef.current;

            if (currentCarLane === gate.correctLane) {
              // Chọn đúng làn!
              playMiniGameSound('collect');
              const addedPoints = 10 + combo * 2;
              setScore((s) => {
                const ns = s + addedPoints;
                onScore?.(ns);
                return ns;
              });
              setCombo((c) => c + 1);
              setFlashMessage({ text: `+${addedPoints} ĐÚNG RỒI! NITRO TĂNG TỐC ⚡`, type: 'nitro' });
              setSpeedLevel((lvl) => Math.min(8, lvl + 0.25));
            } else {
              // Chọn sai làn!
              playMiniGameSound('miss');
              setCombo(0);
              const remainingLives = livesRef.current - 1;
              setLives(remainingLives);
              setFlashMessage({ text: `SAI LÀN RỒI! Đáp án là ${questionRef.current.answer} ❌`, type: 'miss' });

              if (remainingLives <= 0) {
                setIsGameOver(true);
                onFinish?.(scoreRef.current);
              }
            }

            nextQuestionNeeded = true;
          }

          return { ...gate, y: nextY };
        });

        // Xóa cổng đã đi quá màn hình (y > 105)
        const remainingGates = updated.filter((g) => g.y <= 105);

        // Nếu cổng cuối cùng đã trôi qua nửa màn hình, spawn cổng kế
        if (remainingGates.length === 0 || remainingGates[remainingGates.length - 1].y > 55) {
          shouldSpawnNext = true;
        }

        if (nextQuestionNeeded) {
          const nextQ = generateMathQuestion(Math.floor(scoreRef.current / 40) + 1);
          setQuestion(nextQ);
          questionRef.current = nextQ;
        }

        if (shouldSpawnNext && !isGameOverRef.current) {
          setTimeout(() => spawnGate(questionRef.current), 0);
        }

        return remainingGates;
      });

      if (!isGameOverRef.current) {
        animationRef.current = requestAnimationFrame(step);
      }
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      lastTimeRef.current = 0;
    };
  }, [isGameOver, speedLevel, combo, spawnGate, onScore, onFinish]);

  const restartGame = () => {
    playMiniGameSound('step');
    setScore(0);
    setLives(3);
    setLane(1);
    setCombo(0);
    setSpeedLevel(1);
    setIsGameOver(false);
    const newQ = generateMathQuestion(1);
    setQuestion(newQ);
    questionRef.current = newQ;
    setGates([]);
    setFlashMessage(null);
    onScore?.(0);
  };

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-4 shadow-2xl dark:border-slate-800 text-white select-none">
      {/* Header trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏎️</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-400">Đua Xe Tính Nhanh</h3>
            <p className="text-xs text-slate-400">Lái xe vào đúng làn đáp án để bứt tốc!</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-bold">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`text-lg transition-transform ${i < lives ? 'scale-100' : 'opacity-25 grayscale'}`}>
                ❤️
              </span>
            ))}
          </div>

          <div className="rounded-xl bg-slate-800 px-3 py-1 font-mono text-amber-400">
            ⭐ {score} điểm
          </div>

          {combo > 1 && (
            <div className="animate-pulse rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-0.5 text-xs font-black text-white">
              🔥 Combo x{combo}
            </div>
          )}
        </div>
      </div>

      {/* Bảng điện tử đề bài */}
      <div className="my-3 rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-3 text-center shadow-inner">
        <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Phép toán cần tìm:</span>
        <div className="mt-0.5 font-mono text-2xl sm:text-3xl font-black text-yellow-300 drop-shadow-[0_2px_8px_rgba(253,224,71,0.5)]">
          {question.text}
        </div>
      </div>

      {/* Đường đua 3 làn (Track Canvas Area) */}
      <div className="relative mx-auto h-80 sm:h-96 w-full overflow-hidden rounded-2xl border-2 border-slate-700 bg-slate-950 shadow-2xl">
        {/* Nền đường đua cuộn */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
          {/* Vạch kẻ đường 3 làn */}
          <div className="absolute inset-0 grid grid-cols-3">
            {/* Làn 1 & Làn 2 ranh giới */}
            <div className="border-r-2 border-dashed border-slate-700/80" />
            <div className="border-r-2 border-dashed border-slate-700/80" />
            <div />
          </div>

          {/* Vạch kẻ lề đường phản quang hai bên */}
          <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-amber-500 via-rose-500 to-amber-500 opacity-60" />
          <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-b from-amber-500 via-rose-500 to-amber-500 opacity-60" />
        </div>

        {/* Các cổng đáp án trôi xuống */}
        {gates.map((gate) => (
          <div
            key={gate.id}
            className="absolute inset-x-0 transition-opacity duration-200"
            style={{ top: `${gate.y}%` }}
          >
            <div className="grid grid-cols-3 gap-2 px-3">
              {gate.values.map((val, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 py-2 px-1 text-center font-mono font-black shadow-lg backdrop-blur-md transition-all ${
                    gate.passed
                      ? idx === gate.correctLane
                        ? 'border-emerald-400 bg-emerald-600/80 text-white scale-105'
                        : 'border-slate-800 bg-slate-900/60 text-slate-500 opacity-40'
                      : 'border-indigo-400 bg-slate-900/90 text-amber-300 shadow-indigo-500/20'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-400">Làn {idx + 1}</span>
                  <span className="text-xl sm:text-2xl font-black">{val}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Xe đua của bé */}
        <div
          className="absolute bottom-6 w-1/3 transition-all duration-150 ease-out flex justify-center"
          style={{ left: `${lane * 33.333}%` }}
        >
          <div className="relative group">
            {/* Ánh sáng đèn pha */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-16 w-20 bg-gradient-to-t from-yellow-300/30 to-transparent blur-md rounded-full pointer-events-none" />

            {/* Xe đua thể thao */}
            <div className="relative flex flex-col items-center">
              <span className="text-5xl sm:text-6xl drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)] filter transition-transform active:scale-95">
                🏎️
              </span>
              <span className="mt-1 rounded-full bg-indigo-600/80 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                Làn {lane + 1}
              </span>
            </div>
          </div>
        </div>

        {/* Thông báo tức thời khi qua cổng */}
        {flashMessage && (
          <div
            className={`absolute top-4 inset-x-4 rounded-xl py-2 px-3 text-center text-xs sm:text-sm font-black shadow-lg backdrop-blur-md transition-all animate-fade-in ${
              flashMessage.type === 'nitro'
                ? 'bg-emerald-600/90 text-white ring-2 ring-emerald-300'
                : 'bg-rose-600/90 text-white ring-2 ring-rose-300'
            }`}
          >
            {flashMessage.text}
          </div>
        )}

        {/* Màn hình Game Over */}
        {isGameOver && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center backdrop-blur-sm animate-fade-in">
            <span className="text-5xl">🏁</span>
            <h4 className="mt-2 text-2xl font-black text-rose-400">Cuộc Đua Kết Thúc!</h4>
            <p className="mt-1 text-sm text-slate-300">
              Bé đã xuất sắc đạt <strong className="text-yellow-300 text-lg">{score} điểm</strong>!
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={restartGame}
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-black text-slate-950 shadow-lg hover:from-amber-400 hover:to-orange-400 active:scale-95 transition"
              >
                🔄 Chạy Lại Lượt Mới
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 font-bold text-slate-300 hover:bg-slate-700 transition"
                >
                  ✕ Thoát
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bảng phím điều khiển dưới (Dành cho TV Remote, Cảm ứng điện thoại, Chuột) */}
      <div className="mt-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setLane(0);
              playMiniGameSound('step');
            }}
            className={`rounded-2xl py-3.5 px-2 text-center font-black transition-all active:scale-95 ${
              lane === 0
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 ring-2 ring-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="block text-xs text-slate-400">Phím 1</span>
            <span className="text-base sm:text-lg">👈 Làn 1 (Trái)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLane(1);
              playMiniGameSound('step');
            }}
            className={`rounded-2xl py-3.5 px-2 text-center font-black transition-all active:scale-95 ${
              lane === 1
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 ring-2 ring-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="block text-xs text-slate-400">Phím 2</span>
            <span className="text-base sm:text-lg">🚗 Làn 2 (Giữa)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLane(2);
              playMiniGameSound('step');
            }}
            className={`rounded-2xl py-3.5 px-2 text-center font-black transition-all active:scale-95 ${
              lane === 2
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 ring-2 ring-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span className="block text-xs text-slate-400">Phím 3</span>
            <span className="text-base sm:text-lg">Làn 3 (Phải) 👉</span>
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>🎮 TV: Phím ← → hoặc Phím số 1, 2, 3</span>
          <span>📱 Điện thoại: Bấm trực tiếp vào 3 nút làn</span>
        </div>
      </div>
    </div>
  );
}
