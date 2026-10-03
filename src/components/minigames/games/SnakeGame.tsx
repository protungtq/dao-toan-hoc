import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, RotateCcw, Pause } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Props {
  highScore: number;
  onGameOver: (score: number) => void;
  onExit: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

export const SnakeGame: React.FC<Props> = ({ highScore, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
  ]);
  const [direction, setDirection] = useState<Direction>('UP');
  const nextDirectionRef = useRef<Direction>('UP');

  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [bonusStar, setBonusStar] = useState<Point | null>(null);
  const [bonusTimer, setBonusTimer] = useState<number>(0);

  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(120); // ms per step

  // Generate random food not on snake
  const getRandomPosition = useCallback((currentSnake: Point[]): Point => {
    let newPos: Point;
    while (true) {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      const onSnake = currentSnake.some((seg) => seg.x === newPos.x && seg.y === newPos.y);
      if (!onSnake) break;
    }
    return newPos;
  }, []);

  const resetGame = useCallback(() => {
    sound.click();
    const initSnake: Point[] = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 }
    ];
    setSnake(initSnake);
    setDirection('UP');
    nextDirectionRef.current = 'UP';
    setFood(getRandomPosition(initSnake));
    setBonusStar(null);
    setBonusTimer(0);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
  }, [getRandomPosition]);

  // Handle keyboard inputs
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

  // Main game tick
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

        // Collision with walls
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          sound.gameOver();
          setIsGameOver(true);
          onGameOver(score);
          return prevSnake;
        }

        // Collision with self
        if (prevSnake.some((seg) => seg.x === head.x && seg.y === head.y)) {
          sound.gameOver();
          setIsGameOver(true);
          onGameOver(score);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat red food
        if (head.x === food.x && head.y === food.y) {
          sound.eat();
          setScore((s) => s + 10);
          setFood(getRandomPosition(newSnake));

          // Chance to spawn bonus star
          if (Math.random() < 0.35 && !bonusStar) {
            setBonusStar(getRandomPosition(newSnake));
            setBonusTimer(40); // ticks
          }
        } else if (bonusStar && head.x === bonusStar.x && head.y === bonusStar.y) {
          sound.bonus();
          setScore((s) => s + 50);
          setBonusStar(null);
          setBonusTimer(0);
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });

      // Bonus star countdown
      setBonusTimer((t) => {
        if (t <= 1 && bonusStar) {
          setBonusStar(null);
          return 0;
        }
        return t > 0 ? t - 1 : 0;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isGameOver, isPaused, food, bonusStar, speed, score, getRandomPosition, onGameOver]);

  // Render on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid lines
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

    // Render Red Food
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

    // Render Bonus Star if active
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

    ctx.shadowBlur = 0; // reset shadow

    // Render Snake Body & Head
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

      // Eyes on head
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
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full">
      {/* Top Status */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">ĐIỂM HIỆN TẠI</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{score}</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400 font-medium">KỶ LỤC CỦA BẠN</div>
            <div className="text-2xl font-bold font-mono text-slate-200 tabular-nums">{Math.max(score, highScore)}</div>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setSpeed(140)}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${speed === 140 ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Dễ
          </button>
          <button
            onClick={() => setSpeed(100)}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${speed === 100 ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Vừa
          </button>
          <button
            onClick={() => setSpeed(70)}
            className={`px-2.5 py-1 text-xs font-semibold rounded ${speed === 70 ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Nhanh
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block max-w-full aspect-square w-[340px] sm:w-[380px] md:w-[400px]"
        />

        {/* Bonus Star Timer alert */}
        {bonusStar && (
          <div className="absolute top-3 left-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-bounce">
            <span>⭐ Sao vàng +50 điểm!</span>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6">
            <h3 className="text-2xl font-bold text-white mb-2">ĐÃ TẠM DỪNG</h3>
            <p className="text-sm text-slate-400 mb-6">Nhấn phím Cách hoặc nút bên dưới để tiếp tục</p>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              Tiếp tục chơi
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-3">
              <span className="text-2xl">💀</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">RẮN ĐÃ VA CHẠM!</h3>
            <p className="text-sm text-slate-400 mb-4">
              Điểm đạt được: <span className="font-mono text-emerald-400 font-bold text-lg">{score}</span>
            </p>
            {score > highScore && score > 0 && (
              <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-5 font-semibold">
                🎉 Kỷ lục cá nhân mới được xác lập!
              </div>
            )}
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <RotateCcw className="w-5 h-5" />
              Chơi Lại Ván Mới
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons & D-Pad for Mobile */}
      <div className="w-full mt-5 flex items-center justify-between max-w-[400px]">
        {/* Pause & Restart quick buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 flex items-center justify-center transition-colors"
            title="Tạm dừng (Phím Cách)"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button
            onClick={resetGame}
            className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 flex items-center justify-center transition-colors"
            title="Làm mới ván"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Virtual D-Pad */}
        <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
          <div />
          <button
            onClick={() => changeDirection('UP')}
            className="bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-slate-200 rounded-xl flex items-center justify-center transition-colors shadow-sm"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <div />

          <button
            onClick={() => changeDirection('LEFT')}
            className="bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-slate-200 rounded-xl flex items-center justify-center transition-colors shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center justify-center text-slate-600 text-[10px] font-mono select-none">
            D-PAD
          </div>
          <button
            onClick={() => changeDirection('RIGHT')}
            className="bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-slate-200 rounded-xl flex items-center justify-center transition-colors shadow-sm"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          <div />
          <button
            onClick={() => changeDirection('DOWN')}
            className="bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-slate-200 rounded-xl flex items-center justify-center transition-colors shadow-sm"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <div />
        </div>
      </div>
    </div>
  );
};
