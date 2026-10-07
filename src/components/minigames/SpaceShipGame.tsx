import { useState, useEffect, useRef, useCallback } from 'react';
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

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Asteroid {
  id: number;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  hp: number;
  maxHp: number;
  points: number;
}

interface Collectible {
  id: number;
  x: number;
  y: number;
  type: 'star' | 'gem' | 'shield';
  vy: number;
  pulse: number;
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

const WIDTH = 480;
const HEIGHT = 600;

export const SpaceShipGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [shields, setShields] = useState(3);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Ship coordinates
  const shipPos = useRef({ x: WIDTH / 2, y: HEIGHT - 85 });
  const shipTargetX = useRef(WIDTH / 2);
  const isShooting = useRef(false);
  const keysHeld = useRef({ left: false, right: false });
  const lastShotTime = useRef(0);
  const invincibleTimer = useRef(0);

  // Entities
  const stars = useRef<Star[]>([]);
  const bullets = useRef<Bullet[]>([]);
  const asteroids = useRef<Asteroid[]>([]);
  const collectibles = useRef<Collectible[]>([]);
  const particles = useRef<Particle[]>([]);
  const nextSpawnTime = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const scoreRef = useRef(0);

  // Initialize stars background
  useEffect(() => {
    const s: Star[] = [];
    for (let i = 0; i < 70; i++) {
      s.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        size: Math.random() * 2 + 0.6,
        speed: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
    stars.current = s;

    try {
      const stored = localStorage.getItem('trang-toan:spaceship-best');
      if (stored) setHighScore(Number(stored));
    } catch {}
  }, []);

  const spawnAsteroid = useCallback((lvl: number) => {
    const radius = Math.random() * 16 + 18;
    const hp = radius > 26 ? 2 : 1;
    asteroids.current.push({
      id: Math.random(),
      x: Math.random() * (WIDTH - radius * 2) + radius,
      y: -radius - 10,
      radius,
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 1.6 + 1.2 + lvl * 0.15,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      hp,
      maxHp: hp,
      points: hp * 15,
    });
  }, []);

  const spawnCollectible = (x: number, y: number) => {
    const rand = Math.random();
    const type = rand < 0.6 ? 'star' : rand < 0.88 ? 'gem' : 'shield';
    collectibles.current.push({
      id: Math.random(),
      x,
      y,
      type,
      vy: 1.6,
      pulse: 0,
    });
  };

  const createExplosion = (x: number, y: number, color: string, count = 14) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3.5 + 1.5,
        life: 0,
        maxLife: Math.random() * 20 + 15,
      });
    }
  };

  const shoot = useCallback(() => {
    const now = performance.now();
    if (now - lastShotTime.current < 160) return;
    lastShotTime.current = now;

    const shipX = shipPos.current.x;
    const shipY = shipPos.current.y;

    // Dual laser bullets
    bullets.current.push(
      { x: shipX - 12, y: shipY - 14, vx: 0, vy: -9 },
      { x: shipX + 12, y: shipY - 14, vx: 0, vy: -9 }
    );
    playMiniGameSound('laser');
  }, []);

  const resetGame = useCallback(() => {
    playMiniGameSound('step');
    shipPos.current = { x: WIDTH / 2, y: HEIGHT - 85 };
    shipTargetX.current = WIDTH / 2;
    bullets.current = [];
    asteroids.current = [];
    collectibles.current = [];
    particles.current = [];
    invincibleTimer.current = 60;
    setScore(0);
    scoreRef.current = 0;
    setShields(3);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
    onScore?.(0);
  }, [onScore]);

  // Main game loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    let now = performance.now();

    const loop = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      now = timestamp;

      // Continuous steering from keys or on-screen hold
      if (keysHeld.current.left) {
        shipTargetX.current = Math.max(26, shipTargetX.current - 6.5);
      }
      if (keysHeld.current.right) {
        shipTargetX.current = Math.min(WIDTH - 26, shipTargetX.current + 6.5);
      }

      // 1. Update spaceship position (smooth easing towards target)
      shipPos.current.x += (shipTargetX.current - shipPos.current.x) * 0.22;
      shipPos.current.x = Math.max(26, Math.min(WIDTH - 26, shipPos.current.x));

      if (invincibleTimer.current > 0) invincibleTimer.current--;

      // 2. Shoot continuously if held down
      if (isShooting.current) shoot();

      // 3. Spawn Asteroids
      if (now > nextSpawnTime.current) {
        spawnAsteroid(level);
        nextSpawnTime.current = now + Math.max(850, 2200 - level * 140);
      }

      // 4. Update Stars Background
      stars.current.forEach((star) => {
        star.y += star.speed;
        if (star.y > HEIGHT) {
          star.y = 0;
          star.x = Math.random() * WIDTH;
        }
      });

      // 5. Update Bullets
      bullets.current = bullets.current.filter((b) => {
        b.y += b.vy;
        return b.y > -20;
      });

      // 6. Update Asteroids & Collisions with Bullets
      asteroids.current = asteroids.current.filter((ast) => {
        ast.y += ast.vy;
        ast.x += ast.vx;
        ast.rotation += ast.rotSpeed;

        // Bounce horizontally off walls
        if (ast.x - ast.radius < 0 || ast.x + ast.radius > WIDTH) {
          ast.vx = -ast.vx;
        }

        // Bullet collision check
        let destroyed = false;
        bullets.current = bullets.current.filter((b) => {
          if (destroyed) return true;
          const dist = Math.hypot(b.x - ast.x, b.y - ast.y);
          if (dist < ast.radius + 6) {
            ast.hp -= 1;
            createExplosion(b.x, b.y, '#38bdf8', 4);
            if (ast.hp <= 0) {
              destroyed = true;
              createExplosion(ast.x, ast.y, '#fb923c', 16);
              createExplosion(ast.x, ast.y, '#fbbf24', 8);
              playMiniGameSound('collect');

              // Add score
              const added = ast.points;
              scoreRef.current += added;
              setScore(scoreRef.current);
              onScore?.(scoreRef.current);

              // Chance to spawn collectible star or gem
              if (Math.random() < 0.45) {
                spawnCollectible(ast.x, ast.y);
              }

              // Increase level every 100 points
              const currentLvl = Math.floor(scoreRef.current / 120) + 1;
              setLevel(currentLvl);
            }
            return false; // remove bullet
          }
          return true;
        });

        if (destroyed) return false;

        // Ship collision check
        if (invincibleTimer.current <= 0) {
          const shipDist = Math.hypot(shipPos.current.x - ast.x, shipPos.current.y - ast.y);
          if (shipDist < ast.radius + 20) {
            createExplosion(shipPos.current.x, shipPos.current.y, '#ef4444', 20);
            playMiniGameSound('hit');
            invincibleTimer.current = 80; // 1.3s invulnerability

            setShields((prev) => {
              const nextShields = prev - 1;
              if (nextShields <= 0) {
                setIsGameOver(true);
                playMiniGameSound('crash');
                onFinish?.(scoreRef.current);
                try {
                  const curBest = Number(localStorage.getItem('trang-toan:spaceship-best') || '0');
                  if (scoreRef.current > curBest) {
                    localStorage.setItem('trang-toan:spaceship-best', String(scoreRef.current));
                    setHighScore(scoreRef.current);
                  }
                } catch {}
              }
              return Math.max(0, nextShields);
            });
            return false; // asteroid breaks on impact
          }
        }

        return ast.y < HEIGHT + ast.radius + 10;
      });

      // 7. Update Collectibles
      collectibles.current = collectibles.current.filter((col) => {
        col.y += col.vy;
        col.pulse += 0.08;

        const dist = Math.hypot(shipPos.current.x - col.x, shipPos.current.y - col.y);
        if (dist < 32) {
          if (col.type === 'shield') {
            playMiniGameSound('powerup');
            setShields((s) => Math.min(3, s + 1));
            createExplosion(col.x, col.y, '#38bdf8', 12);
          } else if (col.type === 'gem') {
            playMiniGameSound('collect');
            scoreRef.current += 50;
            setScore(scoreRef.current);
            onScore?.(scoreRef.current);
            createExplosion(col.x, col.y, '#c084fc', 14);
          } else {
            playMiniGameSound('collect');
            scoreRef.current += 25;
            setScore(scoreRef.current);
            onScore?.(scoreRef.current);
            createExplosion(col.x, col.y, '#facc15', 12);
          }
          return false;
        }

        return col.y < HEIGHT + 30;
      });

      // 8. Update Particles
      particles.current = particles.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        return p.life < p.maxLife;
      });

      // ----------------------------------------------------
      // DRAW SCENE
      // ----------------------------------------------------
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Draw Stars
      stars.current.forEach((star) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Collectibles
      collectibles.current.forEach((col) => {
        ctx.save();
        ctx.translate(col.x, col.y);
        const scale = 1 + Math.sin(col.pulse) * 0.12;
        ctx.scale(scale, scale);

        if (col.type === 'star') {
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', 0, 0);
        } else if (col.type === 'gem') {
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💎', 0, 0);
        } else {
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡️', 0, 0);
        }
        ctx.restore();
      });

      // Draw Asteroids
      asteroids.current.forEach((ast) => {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.rotation);

        // Asteroid Body
        ctx.fillStyle = ast.hp > 1 ? '#78716c' : '#a8a29e';
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        const sides = 8;
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2;
          const rOffset = ((i % 2 === 0 ? 1 : 0.82) * ast.radius);
          const px = Math.cos(angle) * rOffset;
          const py = Math.sin(angle) * rOffset;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Crater details
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.arc(ast.radius * 0.28, -ast.radius * 0.2, ast.radius * 0.22, 0, Math.PI * 2);
        ctx.arc(-ast.radius * 0.35, ast.radius * 0.25, ast.radius * 0.16, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Draw Bullets
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8;
      bullets.current.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Draw Particles
      particles.current.forEach((p) => {
        const alpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw Spaceship
      const sx = shipPos.current.x;
      const sy = shipPos.current.y;

      const isFlicker = invincibleTimer.current > 0 && Math.floor(invincibleTimer.current / 4) % 2 === 0;
      if (!isFlicker) {
        ctx.save();
        ctx.translate(sx, sy);

        // Thruster Flames
        const flameHeight = Math.random() * 12 + 14;
        const grad = ctx.createLinearGradient(0, 16, 0, 16 + flameHeight);
        grad.addColorStop(0, '#f97316');
        grad.addColorStop(0.5, '#facc15');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(-7, 16);
        ctx.lineTo(0, 16 + flameHeight);
        ctx.lineTo(7, 16);
        ctx.closePath();
        ctx.fill();

        // Wings
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(26, 18);
        ctx.lineTo(14, 15);
        ctx.lineTo(0, 8);
        ctx.lineTo(-14, 15);
        ctx.lineTo(-26, 18);
        ctx.closePath();
        ctx.fill();

        // Ship Fuselage (Body)
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(12, 14);
        ctx.lineTo(-12, 14);
        ctx.closePath();
        ctx.fill();

        // Cockpit Glass
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(0, -4, 5, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shield Aura if active
        if (invincibleTimer.current > 0) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isGameOver, isPaused, level, shoot, spawnAsteroid, onScore, onFinish]);

  // Handle Controls: Keyboard, TV Remote, Touch, Mouse
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
        shipTargetX.current = Math.max(26, shipTargetX.current - 24);
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
        shipTargetX.current = Math.min(WIDTH - 26, shipTargetX.current + 24);
      }
      // Shoot / Action
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
        isShooting.current = true;
        shoot();
      }
      // Pause
      else if (['KeyP'].includes(e.code) || ['p', 'P'].includes(e.key) || e.keyCode === 80) {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
      // Exit / Back
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
      } else if (
        ['Space', 'Enter', 'ArrowUp', 'KeyW', 'NumpadEnter'].includes(e.code) ||
        [' ', 'Spacebar', 'Enter', 'Select', 'ArrowUp', 'Up'].includes(e.key) ||
        e.keyCode === 32 ||
        e.keyCode === 13 ||
        e.keyCode === 23 ||
        e.keyCode === 38 ||
        e.keyCode === 66
      ) {
        isShooting.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shoot, onExit]);

  // Touch and Mouse pointer tracking on canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const clientX = e.clientX - rect.left;
    shipTargetX.current = Math.max(26, Math.min(WIDTH - 26, clientX * scaleX));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    handlePointerMove(e);
    isShooting.current = true;
    shoot();
  };

  const handlePointerUp = () => {
    isShooting.current = false;
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-xl mx-auto w-full select-none text-slate-800 dark:text-slate-100">
      {/* HUD Header */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🚀</span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-cyan-600 dark:text-cyan-400 tracking-wide">
              PHI THUYỀN VƯỢT KHÔNG GIAN
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              Cấp độ {level} • Tốc độ Warp
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ĐIỂM SỐ</div>
            <div className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">{score}</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div className="hidden sm:block">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">KỶ LỤC</div>
            <div className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300 tabular-nums">
              {Math.max(score, highScore)}
            </div>
          </div>
        </div>

        {/* Shields (Lives) */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800" aria-label={`Còn ${shields} khiên`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg transition-transform ${
                i < shields ? 'scale-100 opacity-100' : 'scale-90 opacity-25 grayscale'
              }`}
            >
              🛡️
            </span>
          ))}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="block max-w-full aspect-[4/5] w-[340px] sm:w-[420px] cursor-crosshair touch-none"
        />

        {/* Pause Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-2xl font-black text-white mb-2">ĐÃ TẠM DỪNG</h3>
            <p className="text-sm text-slate-300 mb-6">Nhấn phím Cách hoặc nút bên dưới để tiếp tục hành trình</p>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl flex items-center gap-2 active:scale-95 shadow-lg shadow-cyan-500/30 transition-all"
            >
              Tiếp tục bay 🚀
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <span className="text-5xl mb-2">💥</span>
            <h3 className="text-2xl font-black text-white mb-1">PHI THUYỀN BỊ VA CHẠM!</h3>
            <p className="text-sm text-slate-300 mb-2">
              Điểm số hành trình: <span className="font-mono text-cyan-400 font-black text-xl">{score}</span>
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Thu thập ⭐ sao và 💎 kim cương để nhận thêm nhiều điểm thưởng!
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

      {/* Control Bar (Touch / TV / Mouse) */}
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

        {/* Big Touch Steer & Fire Buttons for Mobile / TV */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              keysHeld.current.left = true;
              shipTargetX.current = Math.max(26, shipTargetX.current - 35);
            }}
            onPointerUp={() => {
              keysHeld.current.left = false;
            }}
            onPointerLeave={() => {
              keysHeld.current.left = false;
            }}
            className="h-12 w-12 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:bg-cyan-500 active:text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-xs transition-all active:scale-95 touch-none"
            aria-label="Trái"
          >
            ←
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              keysHeld.current.right = true;
              shipTargetX.current = Math.min(WIDTH - 26, shipTargetX.current + 35);
            }}
            onPointerUp={() => {
              keysHeld.current.right = false;
            }}
            onPointerLeave={() => {
              keysHeld.current.right = false;
            }}
            className="h-12 w-12 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:bg-cyan-500 active:text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-xs transition-all active:scale-95 touch-none"
            aria-label="Phải"
          >
            →
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              isShooting.current = true;
              shoot();
            }}
            onPointerUp={() => {
              isShooting.current = false;
            }}
            className="h-12 px-5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white rounded-2xl flex items-center justify-center gap-1.5 text-sm font-black shadow-md shadow-cyan-600/25 active:scale-95 transition-all"
            aria-label="Bắn Laser"
          >
            <span>BẮN</span>
            <span className="text-base">🚀</span>
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium text-center">
        💡 Di chuột hoặc kéo chạm để lượn tàu · Phím ← → hoặc D-pad điều khiển · Space/Bắn laser phá thiên thạch
      </div>
    </div>
  );
};
