import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface Star {
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
  problem: string;
  options: { value: number; isCorrect: boolean; yMin: number; yMax: number }[];
  passed: boolean;
}

const WIDTH = 480;
const HEIGHT = 580;
const GRAVITY = 0.32;
const THRUST = -5.8;
const SCROLL_SPEED = 2.6;

export const MathFlappyGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [shields, setShields] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentProblemText, setCurrentProblemText] = useState('4 + 5 = ?');

  // Ship physics
  const ship = useRef({
    x: 120,
    y: HEIGHT / 2,
    vy: 0,
    radius: 20,
    invincibleTimer: 0,
  });

  const stars = useRef<Star[]>([]);
  const gates = useRef<Gate[]>([]);
  const particles = useRef<Particle[]>([]);
  const animFrameId = useRef<number | null>(null);
  const scoreRef = useRef(0);
  scoreRef.current = score;

  // Load High Score
  useEffect(() => {
    try {
      const stored = localStorage.getItem('trang-toan:mathflappy-best');
      if (stored) setHighScore(Number(stored));
    } catch {}
  }, []);

  // Initialize starfield
  useEffect(() => {
    const s: Star[] = [];
    for (let i = 0; i < 70; i++) {
      s.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
    stars.current = s;
  }, []);

  const generateNewGate = useCallback((spawnX: number) => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const ans = a + b;
    const wrong1 = ans + (Math.random() > 0.5 ? 2 : -2);
    const wrong2 = Math.max(1, ans + (Math.random() > 0.5 ? 4 : -4));
    const opts = [ans, wrong1, wrong2].sort(() => Math.random() - 0.5);

    setCurrentProblemText(`${a} + ${b} = ?`);

    // 3 lanes vertically: top (y: 80 - 180), middle (y: 240 - 340), bottom (y: 400 - 500)
    const laneCoords = [
      { yCenter: 130, yMin: 80, yMax: 180 },
      { yCenter: 290, yMin: 240, yMax: 340 },
      { yCenter: 450, yMin: 400, yMax: 500 },
    ];

    const options = opts.map((val, idx) => ({
      value: val,
      isCorrect: val === ans,
      yMin: laneCoords[idx].yMin,
      yMax: laneCoords[idx].yMax,
    }));

    gates.current.push({
      x: spawnX,
      problem: `${a} + ${b} = ?`,
      options,
      passed: false,
    });
  }, []);

  const resetGame = useCallback(() => {
    ship.current = {
      x: 120,
      y: HEIGHT / 2,
      vy: 0,
      radius: 20,
      invincibleTimer: 60,
    };
    gates.current = [];
    particles.current = [];
    generateNewGate(WIDTH + 100);
    setScore(0);
    scoreRef.current = 0;
    setShields(1);
    setIsGameOver(false);
    setIsPaused(false);
    setGameStarted(false);
    onScore?.(0);
  }, [generateNewGate, onScore]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

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

    // Thruster particles
    for (let i = 0; i < 5; i++) {
      particles.current.push({
        x: ship.current.x - 16,
        y: ship.current.y + (Math.random() - 0.5) * 10,
        vx: -Math.random() * 3 - 1.5,
        vy: (Math.random() - 0.5) * 2,
        color: '#38bdf8',
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: 20,
      });
    }
  }, [gameStarted, isGameOver, isPaused, resetGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        thrust();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [thrust]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (!isPaused && !isGameOver && gameStarted) {
        // Physics update
        ship.current.vy += GRAVITY;
        ship.current.y += ship.current.vy;

        if (ship.current.invincibleTimer > 0) {
          ship.current.invincibleTimer--;
        }

        // Boundary check
        if (ship.current.y - ship.current.radius < 0 || ship.current.y + ship.current.radius > HEIGHT) {
          if (shields > 0) {
            setShields(0);
            ship.current.vy = -4;
            ship.current.y = Math.max(30, Math.min(HEIGHT - 30, ship.current.y));
            playMiniGameSound('shield_break');
          } else {
            setIsGameOver(true);
            playMiniGameSound('gameover');
            onFinish?.(scoreRef.current);
            try {
              const best = Number(localStorage.getItem('trang-toan:mathflappy-best') || 0);
              if (scoreRef.current > best) {
                localStorage.setItem('trang-toan:mathflappy-best', String(scoreRef.current));
                setHighScore(scoreRef.current);
              }
            } catch {}
          }
        }

        // Scroll stars
        stars.current.forEach((star) => {
          star.x -= star.speed * (SCROLL_SPEED / 2);
          if (star.x < 0) {
            star.x = WIDTH;
            star.y = Math.random() * HEIGHT;
          }
        });

        // Scroll gates
        gates.current.forEach((gate) => {
          gate.x -= SCROLL_SPEED;

          // Check if ship passes gate
          if (!gate.passed && gate.x + 40 < ship.current.x) {
            gate.passed = true;
            // Check which option lane ship is in
            let hitCorrect = false;
            let hitAny = false;

            gate.options.forEach((opt) => {
              if (ship.current.y >= opt.yMin && ship.current.y <= opt.yMax) {
                hitAny = true;
                if (opt.isCorrect) {
                  hitCorrect = true;
                }
              }
            });

            if (hitCorrect) {
              const newScore = scoreRef.current + 10;
              setScore(newScore);
              onScore?.(newScore);
              playMiniGameSound('collect');
              // Particle burst
              for (let i = 0; i < 15; i++) {
                particles.current.push({
                  x: ship.current.x,
                  y: ship.current.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: '#34d399',
                  size: Math.random() * 5 + 2,
                  life: 0,
                  maxLife: 25,
                });
              }
            } else {
              if (shields > 0) {
                setShields(0);
                playMiniGameSound('shield_break');
              } else {
                setIsGameOver(true);
                playMiniGameSound('gameover');
                onFinish?.(scoreRef.current);
                try {
                  const best = Number(localStorage.getItem('trang-toan:mathflappy-best') || 0);
                  if (scoreRef.current > best) {
                    localStorage.setItem('trang-toan:mathflappy-best', String(scoreRef.current));
                    setHighScore(scoreRef.current);
                  }
                } catch {}
              }
            }
          }
        });

        // Spawn new gates
        if (gates.current.length === 0 || gates.current[gates.current.length - 1].x < WIDTH - 240) {
          generateNewGate(WIDTH + 50);
        }

        // Clean offscreen gates
        gates.current = gates.current.filter((g) => g.x > -100);

        // Update particles
        particles.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
        });
        particles.current = particles.current.filter((p) => p.life < p.maxLife);
      }

      // --- DRAWING ---
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#1e1b4b');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw Stars
      stars.current.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Gates (Neon Math Portals)
      gates.current.forEach((gate) => {
        // Draw problem statement above gate
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText(gate.problem, gate.x, 50);

        gate.options.forEach((opt) => {
          const gateWidth = 90;
          const gateHeight = 70;
          const gateX = gate.x - gateWidth / 2;
          const gateY = opt.yMin + (opt.yMax - opt.yMin) / 2 - gateHeight / 2;

          ctx.save();
          ctx.shadowBlur = 15;
          ctx.shadowColor = opt.isCorrect ? '#06b6d4' : '#64748b';
          ctx.fillStyle = opt.isCorrect ? 'rgba(6, 182, 212, 0.25)' : 'rgba(30, 41, 59, 0.75)';
          ctx.strokeStyle = opt.isCorrect ? '#22d3ee' : '#475569';
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.roundRect(gateX, gateY, gateWidth, gateHeight, 16);
          ctx.fill();
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(opt.value), gate.x, gateY + gateHeight / 2);
          ctx.restore();
        });
      });

      // Draw Spaceship
      ctx.save();
      ctx.translate(ship.current.x, ship.current.y);
      const rot = Math.min(Math.max(ship.current.vy * 0.05, -0.4), 0.6);
      ctx.rotate(rot);

      // Spaceship Body (Neon Sci-Fi)
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(-14, -14);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-14, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit Window
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.ellipse(4, 0, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Draw Particles
      particles.current.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw start prompt if not started
      if (!gameStarted && !isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Chạm hoặc nhấn Phím Cách để Bắt Đầu!', WIDTH / 2, HEIGHT / 2);
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [gameStarted, isGameOver, isPaused, shields, generateNewGate, onScore, onFinish]);

  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-6 sm:p-8 text-white shadow-2xl border border-indigo-400/40">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <span>🚀</span>
            <span>Phi Thuyền Lướt Không Gian</span>
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200">Điều khiển phi thuyền bay qua cổng năng lượng có đáp án đúng!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right bg-black/50 px-4 py-2 rounded-2xl border border-white/20">
            <div className="text-[11px] uppercase font-bold text-indigo-300">Điểm số</div>
            <div className="text-2xl font-black text-amber-400">{score} đ</div>
          </div>
        </div>
      </div>

      <div
        onClick={thrust}
        className="relative mx-auto h-[580px] w-full max-w-[480px] overflow-hidden rounded-3xl bg-slate-950 border-2 border-indigo-500/50 shadow-inner cursor-pointer select-none"
      >
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block w-full h-full" />

        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
            <span className="text-7xl animate-bounce">💥</span>
            <h4 className="mt-4 text-3xl font-black text-white">Va Chạm Thiên Thạch!</h4>
            <p className="mt-2 text-base text-indigo-200">Điểm số vượt ngân hà: <strong className="text-amber-400 text-xl">{score} điểm</strong></p>
            <p className="text-xs text-slate-400 mt-1">Kỷ lục: {highScore} điểm</p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={resetGame}
                className="px-8 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-lg shadow-xl transition cursor-pointer"
              >
                🔄 Bay Lại
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-8 py-3.5 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition cursor-pointer"
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
