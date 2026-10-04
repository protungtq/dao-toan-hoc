import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

export const SnakeGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [direction, setDirection] = useState<Direction>('UP');
  const nextDirectionRef = useRef<Direction>('UP');

  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [bonusStar, setBonusStar] = useState<Point | null>(null);
  const [bonusTimer, setBonusTimer] = useState<number>(0);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(120);

  const getRandomPosition = useCallback((currentSnake: Point[]): Point => {
    let newPos: Point;
    while (true) {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some((seg) => seg.x === newPos.x && seg.y === newPos.y);
      if (!onSnake) break;
    }
    return newPos;
  }, []);

  const resetGame = useCallback(() => {
    playMiniGameSound('step');
    const initSnake: Point[] = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initSnake);
    setDirection('UP');
    nextDirectionRef.current = 'UP';
    setFood(getRandomPosition(initSnake));
    setBonusStar(null);
    setBonusTimer(0);
    setScore(0);
    onScore?.(0);
    setIsGameOver(false);
    setIsPaused(false);
  }, [getRandomPosition, onScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const cur = nextDirectionRef.current;
      if (['ArrowUp', 'KeyW'].includes(e.code) && cur !== 'DOWN') {
        e.preventDefault();
        nextDirectionRef.current = 'UP';
      } else if (['ArrowDown', 'KeyS'].includes(e.code) && cur !== 'UP') {
        e.preventDefault();
        nextDirectionRef.current = 'DOWN';
      } else if (['ArrowLeft', 'KeyA'].includes(e.code) && cur !== 'RIGHT') {
        e.preventDefault();
        nextDirectionRef.current = 'LEFT';
      } else if (['ArrowRight', 'KeyD'].includes(e.code) && cur !== 'LEFT') {
        e.preventDefault();
        nextDirectionRef.current = 'RIGHT';
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isGameOver || isPaused) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const dir = nextDirectionRef.current;
        setDirection(dir);

        const head = { ...prevSnake[0] };
        if (dir === 'UP') head.y -= 1;
        if (dir === 'DOWN') head.y += 1;
        if (dir === 'LEFT') head.x -= 1;
        if (dir === 'RIGHT') head.x += 1;

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          playMiniGameSound('miss');
          setIsGameOver(true);
          onFinish?.(score);
          return prevSnake;
        }

        if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
          playMiniGameSound('miss');
          setIsGameOver(true);
          onFinish?.(score);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        if (head.x === food.x && head.y === food.y) {
          playMiniGameSound('collect');
          const nextScore = score + 10;
          setScore(nextScore);
          onScore?.(nextScore);
          setHighScore((h) => Math.max(h, nextScore));
          setFood(getRandomPosition(newSnake));

          if (Math.random() < 0.35 && !bonusStar) {
            setBonusStar(getRandomPosition(newSnake));
            setBonusTimer(40);
          }
        } else if (bonusStar && head.x === bonusStar.x && head.y === bonusStar.y) {
          playMiniGameSound('success');
          const nextScore = score + 50;
          setScore(nextScore);
          onScore?.(nextScore);
          setHighScore((h) => Math.max(h, nextScore));
          setBonusStar(null);
          setBonusTimer(0);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });

      setBonusTimer((t) => {
        if (t <= 1 && bonusStar) {
          setBonusStar(null);
          return 0;
        }
        return t > 0 ? t - 1 : 0;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isGameOver, isPaused, food, bonusStar, speed, score, getRandomPosition, onScore, onFinish]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    ctx.fillStyle = '#EF4444';
    ctx.shadowColor = '#EF4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (bonusStar) {
      ctx.fillStyle = '#FBBF24';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(
        bonusStar.x * CELL_SIZE + CELL_SIZE / 2,
        bonusStar.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    snake.forEach((seg, idx) => {
      const isHead = idx === 0;
      if (isHead) {
        ctx.fillStyle = '#34D399';
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
      } else {
        const gradient = ctx.createLinearGradient(
          seg.x * CELL_SIZE,
          seg.y * CELL_SIZE,
          (seg.x + 1) * CELL_SIZE,
          (seg.y + 1) * CELL_SIZE
        );
        gradient.addColorStop(0, '#10B981');
        gradient.addColorStop(1, '#059669');
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.roundRect(
        seg.x * CELL_SIZE + 1.5,
        seg.y * CELL_SIZE + 1.5,
        CELL_SIZE - 3,
        CELL_SIZE - 3,
        isHead ? 6 : 4
      );
      ctx.fill();

      if (isHead) {
        ctx.fillStyle = '#064E3B';
        const eyeRadius = 2;
        let eye1 = { x: 0, y: 0 };
        let eye2 = { x: 0, y: 0 };

        if (direction === 'UP') {
          eye1 = { x: seg.x * CELL_SIZE + 6, y: seg.y * CELL_SIZE + 6 };
          eye2 = { x: seg.x * CELL_SIZE + 14, y: seg.y * CELL_SIZE + 6 };
        } else if (direction === 'DOWN') {
          eye1 = { x: seg.x * CELL_SIZE + 6, y: seg.y * CELL_SIZE + 14 };
          eye2 = { x: seg.x * CELL_SIZE + 14, y: seg.y * CELL_SIZE + 14 };
        } else if (direction === 'LEFT') {
          eye1 = { x: seg.x * CELL_SIZE + 6, y: seg.y * CELL_SIZE + 6 };
          eye2 = { x: seg.x * CELL_SIZE + 6, y: seg.y * CELL_SIZE + 14 };
        } else {
          eye1 = { x: seg.x * CELL_SIZE + 14, y: seg.y * CELL_SIZE + 6 };
          eye2 = { x: seg.x * CELL_SIZE + 14, y: seg.y * CELL_SIZE + 14 };
        }

        ctx.beginPath();
        ctx.arc(eye1.x, eye1.y, eyeRadius, 0, Math.PI * 2);
        ctx.arc(eye2.x, eye2.y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [snake, food, bonusStar, direction]);

  const changeDirection = (dir: Direction) => {
    const cur = nextDirectionRef.current;
    if (dir === 'UP' && cur !== 'DOWN') nextDirectionRef.current = 'UP';
    if (dir === 'DOWN' && cur !== 'UP') nextDirectionRef.current = 'DOWN';
    if (dir === 'LEFT' && cur !== 'RIGHT') nextDirectionRef.current = 'LEFT';
    if (dir === 'RIGHT' && cur !== 'LEFT') nextDirectionRef.current = 'RIGHT';
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-xl mx-auto w-full select-none text-slate-800 dark:text-slate-100">
      {/* HUD Bar */}
      <div className="w-full flex items-center justify-between mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ĐIỂM HIỆN TẠI</div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">{score}</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">KỶ LỤC CỦA BÉ</div>
            <div className="text-2xl font-black font-mono text-slate-800 dark:text-slate-200 tabular-nums">
              {Math.max(score, highScore)}
            </div>
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSpeed(140)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              speed === 140
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Dễ
          </button>
          <button
            type="button"
            onClick={() => setSpeed(100)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              speed === 100
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Vừa
          </button>
          <button
            type="button"
            onClick={() => setSpeed(70)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              speed === 70
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Nhanh
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block max-w-full aspect-square w-[320px] sm:w-[380px] md:w-[400px]"
        />

        {bonusStar && (
          <div className="absolute top-3 left-3 bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 animate-bounce shadow-md">
            <span>⭐ Sao vàng +50 điểm!</span>
          </div>
        )}

        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
            <h3 className="text-2xl font-black text-white mb-2">ĐÃ TẠM DỪNG</h3>
            <p className="text-sm text-slate-300 mb-6">Nhấn phím Cách hoặc nút bên dưới để tiếp tục</p>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/30 transition-all"
            >
              Tiếp tục chơi
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <span className="text-5xl mb-3">💥</span>
            <h3 className="text-2xl font-black text-white mb-1">RẮN ĐÃ VA CHẠM!</h3>
            <p className="text-sm text-slate-300 mb-5">
              Điểm đạt được: <span className="font-mono text-emerald-400 font-black text-xl">{score}</span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetGame}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl active:scale-95 shadow-lg shadow-emerald-500/20 transition-all"
              >
                Chơi lại
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl transition-all"
                >
                  Thoát
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control bar + D-pad */}
      <div className="w-full mt-4 flex items-center justify-between max-w-[400px]">
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs transition-colors"
            title="Tạm dừng"
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
          <button
            type="button"
            onClick={resetGame}
            className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs transition-colors"
            title="Làm mới"
          >
            🔄
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 w-36 h-36">
          <div />
          <button
            type="button"
            onClick={() => changeDirection('UP')}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md active:scale-95 transition-all"
            aria-label="Lên"
          >
            ↑
          </button>
          <div />

          <button
            type="button"
            onClick={() => changeDirection('LEFT')}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md active:scale-95 transition-all"
            aria-label="Trái"
          >
            ←
          </button>
          <div className="flex items-center justify-center text-slate-400 dark:text-slate-600 text-[10px] font-black tracking-wider select-none">
            D-PAD
          </div>
          <button
            type="button"
            onClick={() => changeDirection('RIGHT')}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md active:scale-95 transition-all"
            aria-label="Phải"
          >
            →
          </button>

          <div />
          <button
            type="button"
            onClick={() => changeDirection('DOWN')}
            className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md active:scale-95 transition-all"
            aria-label="Xuống"
          >
            ↓
          </button>
          <div />
        </div>
      </div>
    </div>
  );
};