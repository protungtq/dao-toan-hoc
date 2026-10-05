import { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  points: number;
  alive: boolean;
  powerUp?: 'wide' | 'life';
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  stuck: boolean;
}

interface PowerUpItem {
  x: number;
  y: number;
  type: 'wide' | 'life';
  vy: number;
}

const WIDTH = 480;
const HEIGHT = 560;

const BRICK_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#facc15', // Amber
  '#10b981', // Green
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
];

export const BrickBreakerGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Paddle
  const paddle = useRef({
    x: WIDTH / 2 - 45,
    y: HEIGHT - 36,
    w: 90,
    h: 14,
    speed: 8,
  });

  const paddleTargetX = useRef(WIDTH / 2 - 45);
  const keysHeld = useRef({ left: false, right: false });

  // Ball
  const ball = useRef<Ball>({
    x: WIDTH / 2,
    y: HEIGHT - 52,
    vx: 3.5,
    vy: -4.5,
    radius: 7,
    stuck: true,
  });

  // Bricks & PowerUps
  const bricks = useRef<Brick[]>([]);
  const powerUps = useRef<PowerUpItem[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const scoreRef = useRef(0);

  const initBricks = useCallback(() => {
    const b: Brick[] = [];
    const rows = 5;
    const cols = 8;
    const padding = 6;
    const brickW = (WIDTH - 30 - padding * (cols - 1)) / cols;
    const brickH = 20;
    const startY = 40;
    const startX = 15;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rand = Math.random();
        const powerUp = rand < 0.12 ? 'wide' : rand < 0.2 ? 'life' : undefined;
        b.push({
          x: startX + c * (brickW + padding),
          y: startY + r * (brickH + padding),
          w: brickW,
          h: brickH,
          color: BRICK_COLORS[r % BRICK_COLORS.length],
          points: (rows - r) * 10,
          alive: true,
          powerUp,
        });
      }
    }
    bricks.current = b;
  }, []);

  const resetGame = useCallback(() => {
    playMiniGameSound('step');
    paddle.current.w = 90;
    paddle.current.x = WIDTH / 2 - 45;
    paddleTargetX.current = WIDTH / 2 - 45;
    ball.current = {
      x: WIDTH / 2,
      y: HEIGHT - 52,
      vx: 3.5,
      vy: -4.5,
      radius: 7,
      stuck: true,
    };
    powerUps.current = [];
    scoreRef.current = 0;
    setScore(0);
    setLives(3);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPaused(false);
    initBricks();
    onScore?.(0);
  }, [initBricks, onScore]);

  useEffect(() => {
    initBricks();
    try {
      const stored = localStorage.getItem('trang-toan:brick-best');
      if (stored) setHighScore(Number(stored));
    } catch {}
  }, [initBricks]);

  const launchBall = useCallback(() => {
    if (ball.current.stuck) {
      ball.current.stuck = false;
      const angle = (Math.random() * 0.6 - 0.3) * Math.PI;
      const speed = 6;
      ball.current.vx = Math.sin(angle) * speed;
      ball.current.vy = -Math.cos(angle) * speed;
      playMiniGameSound('flap');
    }
  }, []);

  // Main Loop
  useEffect(() => {
    if (isGameOver || isVictory || isPaused) return;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const p = paddle.current;
      const b = ball.current;

      // 1. Continuous paddle steering from held keys/buttons
      if (keysHeld.current.left) {
        paddleTargetX.current = Math.max(8, paddleTargetX.current - 7);
      }
      if (keysHeld.current.right) {
        paddleTargetX.current = Math.min(WIDTH - p.w - 8, paddleTargetX.current + 7);
      }

      // Move paddle smoothly towards target
      p.x += (paddleTargetX.current - p.x) * 0.22;
      p.x = Math.max(8, Math.min(WIDTH - p.w - 8, p.x));

      // 2. Ball movement
      if (b.stuck) {
        b.x = p.x + p.w / 2;
        b.y = p.y - b.radius - 2;
      } else {
        b.x += b.vx;
        b.y += b.vy;

        // Wall collisions
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx = -b.vx;
          playMiniGameSound('step');
        } else if (b.x + b.radius > WIDTH) {
          b.x = WIDTH - b.radius;
          b.vx = -b.vx;
          playMiniGameSound('step');
        }

        if (b.y - b.radius < 0) {
          b.y = b.radius;
          b.vy = -b.vy;
          playMiniGameSound('step');
        }

        // Paddle collision
        if (
          b.y + b.radius >= p.y &&
          b.y - b.radius <= p.y + p.h &&
          b.x >= p.x - 4 &&
          b.x <= p.x + p.w + 4 &&
          b.vy > 0
        ) {
          // Angular bounce
          const hitPoint = (b.x - (p.x + p.w / 2)) / (p.w / 2);
          const maxBounceAngle = (Math.PI / 3) * 1.1;
          const bounceAngle = hitPoint * maxBounceAngle;
          const currentSpeed = Math.min(8.5, Math.hypot(b.vx, b.vy) + 0.05);

          b.vx = currentSpeed * Math.sin(bounceAngle);
          b.vy = -currentSpeed * Math.cos(bounceAngle);
          b.y = p.y - b.radius - 1;
          playMiniGameSound('step');
        }

        // Missed ball (falls off bottom)
        if (b.y - b.radius > HEIGHT) {
          playMiniGameSound('miss');
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setIsGameOver(true);
              onFinish?.(scoreRef.current);
              try {
                const curBest = Number(localStorage.getItem('trang-toan:brick-best') || '0');
                if (scoreRef.current > curBest) {
                  localStorage.setItem('trang-toan:brick-best', String(scoreRef.current));
                  setHighScore(scoreRef.current);
                }
              } catch {}
            } else {
              b.stuck = true;
              p.w = 90; // reset power-up
            }
            return Math.max(0, nextL);
          });
        }

        // Brick collisions
        let aliveCount = 0;
        bricks.current.forEach((brick) => {
          if (!brick.alive) return;
          aliveCount++;

          if (
            b.x + b.radius >= brick.x &&
            b.x - b.radius <= brick.x + brick.w &&
            b.y + b.radius >= brick.y &&
            b.y - b.radius <= brick.y + brick.h
          ) {
            brick.alive = false;
            b.vy = -b.vy;
            playMiniGameSound('collect');

            scoreRef.current += brick.points;
            setScore(scoreRef.current);
            onScore?.(scoreRef.current);

            // Spawn power-up
            if (brick.powerUp) {
              powerUps.current.push({
                x: brick.x + brick.w / 2,
                y: brick.y + brick.h / 2,
                type: brick.powerUp,
                vy: 2.2,
              });
            }
          }
        });

        // Check victory
        if (aliveCount === 0) {
          setIsVictory(true);
          playMiniGameSound('success');
          onFinish?.(scoreRef.current);
        }
      }

      // 3. Update PowerUps
      powerUps.current = powerUps.current.filter((pw) => {
        pw.y += pw.vy;
        if (
          pw.y >= p.y &&
          pw.y <= p.y + p.h + 8 &&
          pw.x >= p.x &&
          pw.x <= p.x + p.w
        ) {
          playMiniGameSound('collect');
          if (pw.type === 'wide') {
            p.w = Math.min(150, p.w + 30);
          } else if (pw.type === 'life') {
            setLives((l) => Math.min(3, l + 1));
          }
          return false;
        }
        return pw.y < HEIGHT + 20;
      });

      // ----------------------------------------------------
      // DRAW CANVAS
      // ----------------------------------------------------
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Grid background effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < WIDTH; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }

      // Draw Bricks
      bricks.current.forEach((br) => {
        if (!br.alive) return;
        ctx.fillStyle = br.color;
        ctx.beginPath();
        ctx.roundRect(br.x, br.y, br.w, br.h, 5);
        ctx.fill();

        // Top glossy highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(br.x + 2, br.y + 2, br.w - 4, br.h / 2 - 2);

        // Power-up indicator
        if (br.powerUp) {
          ctx.fillStyle = '#fff';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(br.powerUp === 'wide' ? '★' : '♥', br.x + br.w / 2, br.y + br.h / 2);
        }
      });

      // Draw PowerUps falling
      powerUps.current.forEach((pw) => {
        ctx.save();
        ctx.translate(pw.x, pw.y);
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pw.type === 'wide' ? '⭐' : '❤️', 0, 0);
        ctx.restore();
      });

      // Draw Paddle
      const paddleGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      paddleGrad.addColorStop(0, '#38bdf8');
      paddleGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = paddleGrad;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 7);
      ctx.fill();

      // Draw Ball
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isGameOver, isVictory, isPaused, onScore, onFinish]);

  // Controls: Keyboard, TV Remote, Touch, Mouse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Left
      if (
        ['ArrowLeft', 'Left', 'KeyA'].includes(e.key) ||
        ['ArrowLeft', 'KeyA', 'DPAD_LEFT'].includes(e.code) ||
        e.keyCode === 37 ||
        e.keyCode === 21
      ) {
        e.preventDefault();
        keysHeld.current.left = true;
        paddleTargetX.current = Math.max(8, paddleTargetX.current - 25);
      }
      // Right
      else if (
        ['ArrowRight', 'Right', 'KeyD'].includes(e.key) ||
        ['ArrowRight', 'KeyD', 'DPAD_RIGHT'].includes(e.code) ||
        e.keyCode === 39 ||
        e.keyCode === 22
      ) {
        e.preventDefault();
        keysHeld.current.right = true;
        paddleTargetX.current = Math.min(WIDTH - paddle.current.w - 8, paddleTargetX.current + 25);
      }
      // Launch / Action
      else if (
        ['Space', 'Enter', 'ArrowUp', 'KeyW', 'NumpadEnter'].includes(e.code) ||
        [' ', 'Spacebar', 'Enter', 'Select', 'ArrowUp', 'Up'].includes(e.key) ||
        e.keyCode === 32 ||
        e.keyCode === 13 ||
        e.keyCode === 23 ||
        e.keyCode === 38 ||
        e.keyCode === 66
      ) {
        e.preventDefault();
        launchBall();
      }
      // Pause
      else if (['KeyP'].includes(e.code) || ['p', 'P'].includes(e.key) || e.keyCode === 80) {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
      // Back / Exit
      else if (
        ['Escape', 'BrowserBack', 'GoBack'].includes(e.key) ||
        e.keyCode === 4 ||
        e.keyCode === 461 ||
        e.keyCode === 10009
      ) {
        e.preventDefault();
        onExit?.();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        ['ArrowLeft', 'Left', 'KeyA'].includes(e.key) ||
        ['ArrowLeft', 'KeyA', 'DPAD_LEFT'].includes(e.code) ||
        e.keyCode === 37 ||
        e.keyCode === 21
      ) {
        keysHeld.current.left = false;
      } else if (
        ['ArrowRight', 'Right', 'KeyD'].includes(e.key) ||
        ['ArrowRight', 'KeyD', 'DPAD_RIGHT'].includes(e.code) ||
        e.keyCode === 39 ||
        e.keyCode === 22
      ) {
        keysHeld.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [launchBall, onExit]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const clientX = (e.clientX - rect.left) * scaleX;
    paddleTargetX.current = Math.max(8, Math.min(WIDTH - paddle.current.w - 8, clientX - paddle.current.w / 2));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
    launchBall();
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-xl mx-auto w-full select-none text-slate-800 dark:text-slate-100">
      {/* HUD Header */}
      <div className="w-full flex items-center justify-between mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ĐIỂM SỐ</div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">{score}</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">KỶ LỤC</div>
            <div className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300 tabular-nums">
              {Math.max(score, highScore)}
            </div>
          </div>
        </div>

        {/* Lives (Balls) */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800" aria-label={`Còn ${lives} bóng`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg transition-transform ${
                i < lives ? 'scale-100 opacity-100' : 'scale-90 opacity-20 grayscale'
              }`}
            >
              ⚽
            </span>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="block max-w-full aspect-[6/7] w-[340px] sm:w-[420px] cursor-ew-resize touch-none"
        />

        {/* Start / Launch hint overlay */}
        {ball.current.stuck && !isGameOver && !isVictory && (
          <div
            onClick={launchBall}
            className="absolute bottom-20 inset-x-0 mx-auto max-w-xs text-center py-2 px-4 rounded-full bg-slate-900/80 border border-white/20 text-white text-xs font-black animate-pulse cursor-pointer"
          >
            Chạm màn hình hoặc bấm Space để phát bóng! ⚽
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-2xl font-black text-white mb-2">ĐÃ TẠM DỪNG</h3>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl active:scale-95 shadow-lg shadow-emerald-500/30 transition-all"
            >
              Tiếp tục chơi
            </button>
          </div>
        )}

        {/* Victory Screen */}
        {isVictory && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <span className="text-5xl mb-2 animate-bounce">🏆</span>
            <h3 className="text-2xl font-black text-white mb-1">XUẤT SẮC! PHÁ HẾT CÁC VIÊN GẠCH</h3>
            <p className="text-sm text-slate-300 mb-6">
              Tổng điểm: <span className="font-mono text-emerald-400 font-black text-xl">{score}</span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetGame}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl active:scale-95 shadow-lg shadow-emerald-500/25 transition-all"
              >
                Chơi lại
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-5 py-3 border border-slate-700 bg-slate-800 text-slate-200 font-bold rounded-2xl hover:bg-slate-700 transition-all"
                >
                  Thoát
                </button>
              )}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <span className="text-5xl mb-2">💥</span>
            <h3 className="text-2xl font-black text-white mb-1">HẾT LƯỢT CHƠI!</h3>
            <p className="text-sm text-slate-300 mb-6">
              Điểm đạt được: <span className="font-mono text-emerald-400 font-black text-xl">{score}</span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetGame}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl active:scale-95 shadow-lg shadow-emerald-500/25 transition-all"
              >
                Chơi lại
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-5 py-3 border border-slate-700 bg-slate-800 text-slate-200 font-bold rounded-2xl hover:bg-slate-700 transition-all"
                >
                  Thoát
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="w-full mt-4 flex items-center justify-between max-w-[420px] gap-3">
        <div className="flex gap-2">
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              keysHeld.current.left = true;
              paddleTargetX.current = Math.max(8, paddleTargetX.current - 35);
            }}
            onPointerUp={() => {
              keysHeld.current.left = false;
            }}
            onPointerLeave={() => {
              keysHeld.current.left = false;
            }}
            className="h-12 w-12 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:bg-emerald-500 active:text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-xs transition-all active:scale-95 touch-none"
            aria-label="Trái"
          >
            ←
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              keysHeld.current.right = true;
              paddleTargetX.current = Math.min(WIDTH - paddle.current.w - 8, paddleTargetX.current + 35);
            }}
            onPointerUp={() => {
              keysHeld.current.right = false;
            }}
            onPointerLeave={() => {
              keysHeld.current.right = false;
            }}
            className="h-12 w-12 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:bg-emerald-500 active:text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-xs transition-all active:scale-95 touch-none"
            aria-label="Phải"
          >
            →
          </button>
          <button
            type="button"
            onClick={launchBall}
            className="h-12 px-5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-1.5 text-sm font-black shadow-md shadow-emerald-600/25 active:scale-95 transition-all"
            aria-label="Phát bóng"
          >
            <span>PHÁT BÓNG</span>
            <span>⚽</span>
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium text-center">
        💡 Kéo ngón tay hoặc chuột để trượt thanh đỡ · Phím ← → hoặc D-pad điều khiển · Space/Bấm nút để phát bóng
      </div>
    </div>
  );
};
