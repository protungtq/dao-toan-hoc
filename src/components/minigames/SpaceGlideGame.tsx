import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface StarBg {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface Gate {
  x: number;
  width: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
  type: 'neon' | 'crystal';
}

interface Gem {
  id: number;
  x: number;
  y: number;
  type: 'star' | 'crystal' | 'shield';
  collected: boolean;
  pulse: number;
}

const WIDTH = 480;
const HEIGHT = 580;
const GRAVITY = 0.28;
const THRUST = -5.4;
const SCROLL_SPEED = 2.4;

export const SpaceGlideGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gatesPassed, setGatesPassed] = useState(0);
  const [hasShield, setHasShield] = useState(true); // Start with 1 shield for kid friendliness!
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Ship physics
  const ship = useRef({
    x: 100,
    y: HEIGHT / 2,
    vy: 0,
    angle: 0,
    radius: 18,
    invincibleTimer: 0,
  });

  const stars = useRef<StarBg[]>([]);
  const gates = useRef<Gate[]>([]);
  const gems = useRef<Gem[]>([]);
  const particles = useRef<Particle[]>([]);
  const animFrameId = useRef<number | null>(null);
  const nextGateDist = useRef(0);
  const scoreRef = useRef(0);
  scoreRef.current = score;

  // Load High Score
  useEffect(() => {
    try {
      const stored = localStorage.getItem('trang-toan:spaceglide-best');
      if (stored) setHighScore(Number(stored));
    } catch {}
  }, []);

  // Initialize starfield
  useEffect(() => {
    const s: StarBg[] = [];
    for (let i = 0; i < 60; i++) {
      s.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
    stars.current = s;
  }, []);

  const resetGame = useCallback(() => {
    ship.current = {
      x: 100,
      y: HEIGHT / 2,
      vy: 0,
      angle: 0,
      radius: 18,
      invincibleTimer: 60, // 1s grace on start
    };
    gates.current = [];
    gems.current = [];
    particles.current = [];
    nextGateDist.current = 120;
    setScore(0);
    setGatesPassed(0);
    setHasShield(true);
    setIsGameOver(false);
    setIsPaused(false);
    setGameStarted(false);
    onScore?.(0);
  }, [onScore]);

  // Thrust action
  const thrust = useCallback(() => {
    if (isGameOver) {
      resetGame();
      return;
    }
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (isPaused) return;

    ship.current.vy = THRUST;
    playMiniGameSound('flap');

    // Emit thruster flame particles
    for (let i = 0; i < 6; i++) {
      particles.current.push({
        x: ship.current.x - 18,
        y: ship.current.y + (Math.random() - 0.5) * 8,
        vx: -Math.random() * 3.5 - 2,
        vy: (Math.random() - 0.5) * 2,
        color: Math.random() < 0.6 ? '#38bdf8' : '#fb923c',
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: Math.random() * 14 + 8,
      });
    }
  }, [isGameOver, gameStarted, isPaused, resetGame]);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spawnGate = () => {
      const gapHeight = Math.max(160, 210 - Math.min(gatesPassed * 2, 45)); // Generous gap for children
      const minTop = 60;
      const maxTop = HEIGHT - gapHeight - 60;
      const topHeight = Math.floor(Math.random() * (maxTop - minTop) + minTop);
      const bottomY = topHeight + gapHeight;

      const newGate: Gate = {
        x: WIDTH + 30,
        width: 58,
        topHeight,
        bottomY,
        passed: false,
        type: Math.random() < 0.5 ? 'neon' : 'crystal',
      };
      gates.current.push(newGate);

      // Spawn gem or shield in the gap
      const gemRand = Math.random();
      const gemType = gemRand < 0.15 ? 'shield' : gemRand < 0.55 ? 'crystal' : 'star';
      gems.current.push({
        id: Math.random(),
        x: newGate.x + newGate.width / 2,
        y: topHeight + gapHeight / 2 + (Math.random() - 0.5) * 40,
        type: gemType,
        collected: false,
        pulse: 0,
      });
    };

    const loop = () => {
      // 1. CLEAR & BACKGROUND
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Starfield parallax
      ctx.fillStyle = '#ffffff';
      stars.current.forEach((st) => {
        if (!isPaused && gameStarted && !isGameOver) {
          st.x -= st.speed;
          if (st.x < 0) st.x = WIDTH;
        }
        ctx.globalAlpha = st.alpha;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw background nebulas
      const grad = ctx.createRadialGradient(WIDTH * 0.7, HEIGHT * 0.3, 20, WIDTH * 0.7, HEIGHT * 0.3, 260);
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.18)');
      grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // 2. LOGIC UPDATES
      if (gameStarted && !isPaused && !isGameOver) {
        // Ship physics
        ship.current.vy += GRAVITY;
        ship.current.y += ship.current.vy;

        // Ship tilt
        const targetAngle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (ship.current.vy * 0.08)));
        ship.current.angle += (targetAngle - ship.current.angle) * 0.15;

        if (ship.current.invincibleTimer > 0) {
          ship.current.invincibleTimer--;
        }

        // Screen boundary collisions
        if (ship.current.y < ship.current.radius) {
          ship.current.y = ship.current.radius;
          ship.current.vy = 0;
        }
        if (ship.current.y > HEIGHT - ship.current.radius - 10) {
          handleCrash();
        }

        // Spawn gates
        nextGateDist.current -= SCROLL_SPEED;
        if (nextGateDist.current <= 0) {
          spawnGate();
          nextGateDist.current = 240 + Math.random() * 40;
        }

        // Update Gates
        for (let i = gates.current.length - 1; i >= 0; i--) {
          const g = gates.current[i];
          g.x -= SCROLL_SPEED;

          // Check score pass
          if (!g.passed && g.x + g.width < ship.current.x) {
            g.passed = true;
            setGatesPassed((prev) => {
              const next = prev + 1;
              const bonus = 20;
              setScore((s) => {
                const ns = s + bonus;
                onScore?.(ns);
                return ns;
              });
              return next;
            });
            playMiniGameSound('step');
          }

          // Gate collision with ship
          if (ship.current.invincibleTimer === 0) {
            const shipLeft = ship.current.x - ship.current.radius + 4;
            const shipRight = ship.current.x + ship.current.radius - 4;
            const shipTop = ship.current.y - ship.current.radius + 4;
            const shipBottom = ship.current.y + ship.current.radius - 4;

            if (shipRight > g.x && shipLeft < g.x + g.width) {
              if (shipTop < g.topHeight || shipBottom > g.bottomY) {
                // Collided!
                if (hasShield) {
                  // Shield absorbs crash!
                  setHasShield(false);
                  ship.current.invincibleTimer = 80;
                  playMiniGameSound('hit');
                  // Spark burst
                  createBurst(ship.current.x, ship.current.y, '#38bdf8', 20);
                } else {
                  handleCrash();
                }
              }
            }
          }

          // Remove offscreen
          if (g.x + g.width < -50) {
            gates.current.splice(i, 1);
          }
        }

        // Update Gems
        for (let i = gems.current.length - 1; i >= 0; i--) {
          const gm = gems.current[i];
          gm.x -= SCROLL_SPEED;
          gm.pulse += 0.08;

          // Pickup collision
          const dx = ship.current.x - gm.x;
          const dy = ship.current.y - gm.y;
          const dist = Math.hypot(dx, dy);

          if (!gm.collected && dist < ship.current.radius + 16) {
            gm.collected = true;
            if (gm.type === 'shield') {
              setHasShield(true);
              playMiniGameSound('powerup');
              setScore((s) => s + 50);
              createBurst(gm.x, gm.y, '#38bdf8', 16);
            } else if (gm.type === 'crystal') {
              playMiniGameSound('collect');
              setScore((s) => s + 25);
              createBurst(gm.x, gm.y, '#c084fc', 14);
            } else {
              playMiniGameSound('collect');
              setScore((s) => s + 10);
              createBurst(gm.x, gm.y, '#facc15', 12);
            }
          }

          if (gm.x < -40 || gm.collected) {
            gems.current.splice(i, 1);
          }
        }

        // Particle updates
        for (let i = particles.current.length - 1; i >= 0; i--) {
          const p = particles.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          if (p.life >= p.maxLife) {
            particles.current.splice(i, 1);
          }
        }
      }

      // 3. DRAW GATES (Trụ năng lượng không gian)
      gates.current.forEach((g) => {
        const isNeon = g.type === 'neon';
        const colorPrimary = isNeon ? '#06b6d4' : '#8b5cf6';
        const colorGlow = isNeon ? 'rgba(6, 182, 212, 0.35)' : 'rgba(139, 92, 246, 0.35)';

        // Top Pylon
        ctx.save();
        ctx.fillStyle = colorGlow;
        ctx.fillRect(g.x - 4, 0, g.width + 8, g.topHeight + 4);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(g.x, 0, g.width, g.topHeight);

        // Core light beam
        ctx.fillStyle = colorPrimary;
        ctx.fillRect(g.x + 8, 0, g.width - 16, g.topHeight - 12);

        // Cap emitter
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(g.x - 3, g.topHeight - 14, g.width + 6, 14, [0, 0, 6, 6]);
        ctx.fill();
        ctx.restore();

        // Bottom Pylon
        ctx.save();
        const bottomHeight = HEIGHT - g.bottomY;
        ctx.fillStyle = colorGlow;
        ctx.fillRect(g.x - 4, g.bottomY - 4, g.width + 8, bottomHeight + 4);

        ctx.fillStyle = '#1e293b';
        ctx.fillRect(g.x, g.bottomY, g.width, bottomHeight);

        // Core light beam
        ctx.fillStyle = colorPrimary;
        ctx.fillRect(g.x + 8, g.bottomY + 12, g.width - 16, bottomHeight);

        // Cap emitter
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(g.x - 3, g.bottomY, g.width + 6, 14, [6, 6, 0, 0]);
        ctx.fill();
        ctx.restore();
      });

      // 4. DRAW GEMS & COLLECTIBLES
      gems.current.forEach((gm) => {
        ctx.save();
        ctx.translate(gm.x, gm.y);
        const scale = 1 + Math.sin(gm.pulse) * 0.12;
        ctx.scale(scale, scale);

        if (gm.type === 'shield') {
          // Shield Orb
          ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡️', 0, 1);
        } else if (gm.type === 'crystal') {
          // Crystal Gem
          ctx.fillStyle = 'rgba(192, 132, 252, 0.4)';
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💎', 0, 1);
        } else {
          // Star
          ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', 0, 1);
        }
        ctx.restore();
      });

      // 5. DRAW PARTICLES
      particles.current.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 6. DRAW SPACESHIP
      ctx.save();
      ctx.translate(ship.current.x, ship.current.y);
      ctx.rotate(ship.current.angle);

      // Invincible flash
      if (ship.current.invincibleTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
        ctx.globalAlpha = 0.45;
      }

      // Shield Aura
      if (hasShield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 27, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Ship body (sleek cosmic wedge)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(-14, -13);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-14, 13);
      ctx.closePath();
      ctx.fill();

      // Wing trim
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(12, 0);
      ctx.lineTo(-12, -9);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-12, 9);
      ctx.closePath();
      ctx.fill();

      // Cockpit dome
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(2, 0, 7, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thruster tail nozzle
      ctx.fillStyle = '#475569';
      ctx.fillRect(-16, -4, 4, 8);

      // Jet exhaust flame
      if (gameStarted && !isPaused && !isGameOver) {
        ctx.fillStyle = Math.random() < 0.5 ? '#38bdf8' : '#f97316';
        ctx.beginPath();
        ctx.moveTo(-16, -3);
        ctx.lineTo(-24 - Math.random() * 8, 0);
        ctx.lineTo(-16, 3);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // Prompt to start if not started
      if (!gameStarted && !isGameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚀 CHẠM ĐỂ BẬT PHẢN LỰC BAY LÊN', WIDTH / 2, HEIGHT / 2 + 60);

        ctx.font = '14px system-ui, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Dùng Phím Space / Mũi tên ↑ / TV Remote', WIDTH / 2, HEIGHT / 2 + 90);
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(loop);
    };

    const handleCrash = () => {
      setIsGameOver(true);
      playMiniGameSound('crash');
      createBurst(ship.current.x, ship.current.y, '#f97316', 30);
      createBurst(ship.current.x, ship.current.y, '#ef4444', 25);

      const currentScore = scoreRef.current;
      if (currentScore > highScore) {
        setHighScore(currentScore);
        try {
          localStorage.setItem('trang-toan:spaceglide-best', String(currentScore));
        } catch {}
      }
      onFinish?.(currentScore);
    };

    const createBurst = (x: number, y: number, color: string, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: Math.random() * 3 + 1.5,
          life: 0,
          maxLife: Math.random() * 20 + 15,
        });
      }
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [gameStarted, isPaused, isGameOver, hasShield, gatesPassed, highScore, onScore, onFinish]);

  // Controls: Keyboard, Pointer
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        ['Space', 'ArrowUp', 'KeyW', 'Enter', 'NumpadEnter'].includes(e.code) ||
        [' ', 'Spacebar', 'ArrowUp', 'Up', 'Enter'].includes(e.key) ||
        e.keyCode === 32 ||
        e.keyCode === 38 ||
        e.keyCode === 13
      ) {
        e.preventDefault();
        thrust();
      } else if (['KeyP', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (['Escape', 'BrowserBack'].includes(e.key)) {
        onExit?.();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [thrust, onExit]);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-xl mx-auto w-full select-none text-slate-800 dark:text-slate-100">
      {/* Top HUD */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-bounce">🚀</span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-cyan-600 dark:text-cyan-400 tracking-wide">
              PHI THUYỀN LƯỚT NGÂN HÀ
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              Đã vượt: {gatesPassed} cổng không gian
            </span>
          </div>
        </div>

        {/* Shield and Scores */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all ${
              hasShield
                ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-800 text-sky-600 dark:text-sky-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-40'
            }`}
            title={hasShield ? 'Có khiên bảo vệ' : 'Chưa có khiên'}
          >
            <span className="text-base">🛡️</span>
            <span className="text-xs font-black hidden sm:inline">{hasShield ? 'KHIÊN SẴN SÀNG' : 'MẤT KHIÊN'}</span>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ĐIỂM</div>
            <div className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">{score}</div>
          </div>
          <div className="h-7 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">KỶ LỤC</div>
            <div className="text-base font-bold font-mono text-slate-600 dark:text-slate-300 tabular-nums">
              {Math.max(score, highScore)}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Playfield */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={(e) => {
            e.preventDefault();
            thrust();
          }}
          className="block max-w-full aspect-[4/5] w-[340px] sm:w-[420px] cursor-pointer touch-none"
        />

        {/* Pause Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-2xl font-black text-white mb-2">ĐÃ TẠM DỪNG</h3>
            <p className="text-sm text-slate-300 mb-6">Chạm vào màn hình hoặc bấm nút bên dưới để tiếp tục</p>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl active:scale-95 shadow-lg shadow-cyan-500/30 transition-all"
            >
              Tiếp tục bay 🚀
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <span className="text-5xl mb-2">💥</span>
            <h3 className="text-2xl font-black text-white mb-1">HẠ CÁNH NGOÀI Ý MUỐN!</h3>
            <p className="text-sm text-slate-300 mb-2">
              Điểm đạt được: <span className="font-mono text-cyan-400 font-black text-xl">{score}</span>
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Đã vượt qua <strong className="text-white">{gatesPassed}</strong> cổng năng lượng không gian!
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetGame}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl active:scale-95 shadow-lg shadow-cyan-500/25 transition-all"
              >
                Bay lại 🚀
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

      {/* Big Action Button for Mobile & Touch */}
      <div className="w-full mt-3 flex items-center justify-between max-w-[420px] gap-3">
        <button
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs"
          title="Tạm dừng"
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            thrust();
          }}
          className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-black text-base rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>🔥</span>
          <span>BẬT PHẢN LỰC BAY LÊN (SPACE)</span>
        </button>
      </div>

      <p className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        💡 <strong>Cách chơi:</strong> Chạm hoặc bấm phím Space / ↑ để phi thuyền bay lên, thả ra để lượn xuống né tránh các cổng năng lượng. Nhặt khiên 🛡️ để được bảo vệ khi va chạm!
      </p>
    </div>
  );
};
export default SpaceGlideGame;
