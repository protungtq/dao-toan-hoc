import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Rocket, Play, Pause } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Props {
  highScore: number;
  onGameOver: (score: number) => void;
  onExit: () => void;
}

interface Obstacle {
  x: number;
  topHeight: number;
  bottomY: number;
  width: number;
  passed: boolean;
  hasCoin?: boolean;
  coinY?: number;
  coinCollected?: boolean;
}

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 480;
const GAP_SIZE = 135;
const GRAVITY = 0.38;
const JUMP_FORCE = -6.5;

export const AstroFlapGame: React.FC<Props> = ({ highScore, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Physics refs
  const shipRef = useRef<{ y: number; vy: number; rotation: number }>({
    y: CANVAS_HEIGHT / 2,
    vy: 0,
    rotation: 0
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; speed: number }[]>([]);
  const thrusterParticlesRef = useRef<{ x: number; y: number; dx: number; dy: number; life: number }[]>([]);
  const reqAnimRef = useRef<number | null>(null);

  // Generate stars background
  useEffect(() => {
    const list = [];
    for (let i = 0; i < 40; i++) {
      list.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.8 + 0.2
      });
    }
    starsRef.current = list;
  }, []);

  const resetGame = useCallback(() => {
    sound.click();
    shipRef.current = {
      y: CANVAS_HEIGHT / 2,
      vy: 0,
      rotation: 0
    };
    obstaclesRef.current = [];
    thrusterParticlesRef.current = [];
    setScore(0);
    setIsGameOver(false);
    setIsStarted(false);
    setIsPaused(false);
  }, []);

  // Flap jump action
  const jump = useCallback(() => {
    if (isGameOver || isPaused) return;

    if (!isStarted) {
      setIsStarted(true);
    }

    sound.jump();
    shipRef.current.vy = JUMP_FORCE;

    // Add thrust fire particles
    const shipY = shipRef.current.y;
    for (let i = 0; i < 6; i++) {
      thrusterParticlesRef.current.push({
        x: 80,
        y: shipY + 4,
        dx: -Math.random() * 4 - 2,
        dy: (Math.random() - 0.5) * 3,
        life: 18
      });
    }
  }, [isGameOver, isPaused, isStarted]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        jump();
      } else if (e.code === 'KeyP' && isStarted && !isGameOver) {
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump, isStarted, isGameOver]);

  // Main 60fps game loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    let spawnTimer = 0;
    let localScore = score;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const ship = shipRef.current;
      const obstacles = obstaclesRef.current;
      const stars = starsRef.current;
      const particles = thrusterParticlesRef.current;

      // Update Starfield
      stars.forEach((st) => {
        st.x -= st.speed;
        if (st.x < 0) st.x = CANVAS_WIDTH;
      });

      if (isStarted) {
        // Ship physics
        ship.vy += GRAVITY;
        ship.y += ship.vy;
        ship.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, ship.vy * 0.08));

        // Floor / Ceiling collision
        if (ship.y - 12 <= 0 || ship.y + 12 >= CANVAS_HEIGHT) {
          sound.hit();
          sound.gameOver();
          setIsGameOver(true);
          onGameOver(localScore);
          return;
        }

        // Spawn obstacles
        spawnTimer++;
        if (spawnTimer >= 100) {
          spawnTimer = 0;
          const minHeight = 50;
          const maxHeight = CANVAS_HEIGHT - GAP_SIZE - minHeight;
          const topH = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
          const bottomY = topH + GAP_SIZE;

          const hasCoin = Math.random() < 0.6;
          const coinY = topH + GAP_SIZE / 2;

          obstacles.push({
            x: CANVAS_WIDTH,
            topHeight: topH,
            bottomY,
            width: 48,
            passed: false,
            hasCoin,
            coinY,
            coinCollected: false
          });
        }

        // Update obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= 2.2;

          const shipX = 100;
          const shipRadius = 11;

          // Check laser pillar collisions
          if (shipX + shipRadius > obs.x && shipX - shipRadius < obs.x + obs.width) {
            if (ship.y - shipRadius < obs.topHeight || ship.y + shipRadius > obs.bottomY) {
              sound.hit();
              sound.gameOver();
              setIsGameOver(true);
              onGameOver(localScore);
              return;
            }
          }

          // Check coin collection
          if (
            obs.hasCoin &&
            !obs.coinCollected &&
            obs.coinY !== undefined &&
            Math.hypot(shipX - (obs.x + obs.width / 2), ship.y - obs.coinY) < 22
          ) {
            sound.eat();
            obs.coinCollected = true;
            localScore += 5;
            setScore(localScore);
          }

          // Check passing gate
          if (!obs.passed && obs.x + obs.width < shipX) {
            obs.passed = true;
            sound.move();
            localScore += 1;
            setScore(localScore);
          }

          // Cull off-screen
          if (obs.x + obs.width < -10) {
            obstacles.splice(i, 1);
          }
        }

        // Update thrust particles
        for (let p = particles.length - 1; p >= 0; p--) {
          const pt = particles[p];
          pt.x += pt.dx;
          pt.y += pt.dy;
          pt.life--;
          if (pt.life <= 0) particles.splice(p, 1);
        }
      }

      // ---------------- RENDER ----------------
      ctx.fillStyle = '#060A14';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Render Stars
      stars.forEach((st) => {
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = st.speed;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Render Obstacles
      obstacles.forEach((obs) => {
        // Top pillar
        const topGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
        topGrad.addColorStop(0, '#0E7490');
        topGrad.addColorStop(1, '#06B6D4');
        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.roundRect(obs.x, 0, obs.width, obs.topHeight, [0, 0, 8, 8]);
        ctx.fill();

        // Top emitter cap
        ctx.fillStyle = '#22D3EE';
        ctx.fillRect(obs.x, obs.topHeight - 6, obs.width, 6);

        // Bottom pillar
        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.bottomY, obs.width, CANVAS_HEIGHT - obs.bottomY, [8, 8, 0, 0]);
        ctx.fill();

        // Bottom emitter cap
        ctx.fillStyle = '#22D3EE';
        ctx.fillRect(obs.x, obs.bottomY, obs.width, 6);

        // Center Laser beam
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width / 2, obs.topHeight);
        ctx.lineTo(obs.x + obs.width / 2, obs.bottomY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Render Coin if available
        if (obs.hasCoin && !obs.coinCollected && obs.coinY !== undefined) {
          ctx.fillStyle = '#FBBF24';
          ctx.shadowColor = '#FBBF24';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, obs.coinY, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Render Thrust Particles
      particles.forEach((pt) => {
        ctx.fillStyle = '#F97316';
        ctx.globalAlpha = pt.life / 18;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Render Rocket Ship
      ctx.save();
      ctx.translate(100, ship.y);
      ctx.rotate(ship.rotation);

      // Rocket Body
      ctx.fillStyle = '#38BDF8';
      ctx.shadowColor = '#0284C7';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Cockpit window
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(4, -2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Wing fin
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.moveTo(-8, -6);
      ctx.lineTo(-14, -12);
      ctx.lineTo(-2, -6);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-8, 6);
      ctx.lineTo(-14, 12);
      ctx.lineTo(-2, 6);
      ctx.fill();

      ctx.restore();

      reqAnimRef.current = requestAnimationFrame(loop);
    };

    reqAnimRef.current = requestAnimationFrame(loop);
    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
    };
  }, [isStarted, isGameOver, isPaused, score, onGameOver]);

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full select-none">
      {/* HUD Bar */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">ĐIỂM SỐ</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">{score}</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400 font-medium">KỶ LỤC CỦA BẠN</div>
            <div className="text-2xl font-bold font-mono text-slate-200 tabular-nums">{Math.max(score, highScore)}</div>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
          <Rocket className="w-3.5 h-3.5 text-cyan-400" />
          <span>Vận tốc: Ổn định</span>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950 cursor-pointer touch-none"
        onClick={jump}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block max-w-full aspect-[400/480] w-[320px] sm:w-[380px] md:w-[400px]"
        />

        {/* Start Game prompt */}
        {!isStarted && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <Rocket className="w-12 h-12 text-cyan-400 mb-2 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-1">CHẠM ĐỂ PHÓNG PHI THUYỀN</h3>
            <p className="text-xs text-slate-300">
              Nhấp chuột hoặc chạm màn hình để kích hoạt phản lực bay lên
            </p>
          </div>
        )}

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6">
            <h3 className="text-2xl font-bold text-white mb-2">ĐÃ TẠM DỪNG</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(false);
              }}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Tiếp tục
            </button>
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-2">
              <span className="text-2xl">💥</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">PHI THUYỀN VA CHẠM!</h3>
            <p className="text-sm text-slate-400 mb-4">
              Điểm đạt được: <span className="font-mono text-cyan-400 font-bold text-lg">{score}</span>
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetGame();
              }}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-cyan-500/20"
            >
              <RotateCcw className="w-5 h-5" />
              Bay Lại Ván Mới
            </button>
          </div>
        )}
      </div>

      {/* Mobile Thrust Button */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={jump}
          className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-300 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Rocket className="w-5 h-5" />
          <span>PHÓNG (SPACE)</span>
        </button>
        <button
          onClick={resetGame}
          className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 flex items-center justify-center"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
