import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface Obstacle {
  id: number;
  lane: number; // 0, 1, 2, 3
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  type: 'truck' | 'bus' | 'taxi' | 'sedan' | 'barrier' | 'oil';
  color: string;
}

interface Item {
  id: number;
  lane: number;
  x: number;
  y: number;
  type: 'coin' | 'nitro' | 'repair';
  collected: boolean;
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

const WIDTH = 420;
const HEIGHT = 580;
const LANE_COUNT = 4;
const ROAD_LEFT = 40;
const ROAD_RIGHT = WIDTH - 40;
const ROAD_WIDTH = ROAD_RIGHT - ROAD_LEFT;
const LANE_WIDTH = ROAD_WIDTH / LANE_COUNT;

export const HighwayRacerGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [lives, setLives] = useState(3);
  const [nitroGauge, setNitroGauge] = useState(100); // 0 to 100%
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [speedKmh, setSpeedKmh] = useState(90);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Car state
  const car = useRef({
    x: ROAD_LEFT + LANE_WIDTH * 1.5,
    targetX: ROAD_LEFT + LANE_WIDTH * 1.5,
    y: HEIGHT - 110,
    width: 36,
    height: 64,
    currentLane: 1,
    invincibleTimer: 0,
    driftAngle: 0,
  });

  const obstacles = useRef<Obstacle[]>([]);
  const items = useRef<Item[]>([]);
  const particles = useRef<Particle[]>([]);
  const roadOffset = useRef(0);
  const animFrameId = useRef<number | null>(null);
  const nextSpawnDist = useRef(0);
  const isNitroRef = useRef(false);
  isNitroRef.current = isNitroActive;
  const scoreRef = useRef(0);
  scoreRef.current = score;

  // Load HighScore
  useEffect(() => {
    try {
      const stored = localStorage.getItem('trang-toan:highway-best');
      if (stored) setHighScore(Number(stored));
    } catch {}
  }, []);

  const resetGame = useCallback(() => {
    car.current.currentLane = 1;
    car.current.x = ROAD_LEFT + LANE_WIDTH * 1.5;
    car.current.targetX = car.current.x;
    car.current.invincibleTimer = 60;
    car.current.driftAngle = 0;
    obstacles.current = [];
    items.current = [];
    particles.current = [];
    roadOffset.current = 0;
    nextSpawnDist.current = 60;

    setScore(0);
    setDistance(0);
    setLives(3);
    setNitroGauge(100);
    setIsNitroActive(false);
    setSpeedKmh(90);
    setIsGameOver(false);
    setIsPaused(false);
    onScore?.(0);
  }, [onScore]);

  // Steer to Lane
  const steer = useCallback((dir: 'left' | 'right') => {
    if (isGameOver || isPaused) return;
    const nextLane =
      dir === 'left'
        ? Math.max(0, car.current.currentLane - 1)
        : Math.min(LANE_COUNT - 1, car.current.currentLane + 1);

    if (nextLane !== car.current.currentLane) {
      car.current.currentLane = nextLane;
      car.current.targetX = ROAD_LEFT + LANE_WIDTH * (nextLane + 0.5);
      car.current.driftAngle = dir === 'left' ? -0.15 : 0.15;
      playMiniGameSound('step');
    }
  }, [isGameOver, isPaused]);

  // Activate Nitro
  const triggerNitro = useCallback(() => {
    if (isGameOver || isPaused || nitroGauge < 20 || isNitroActive) return;
    setIsNitroActive(true);
    playMiniGameSound('nitro');
  }, [isGameOver, isPaused, nitroGauge, isNitroActive]);

  // Honk Horn
  const honkHorn = useCallback(() => {
    playMiniGameSound('horn');
    // Nearby obstacles shift away
    obstacles.current.forEach((obs) => {
      if (obs.y > HEIGHT / 2 && Math.abs(obs.x - car.current.x) < LANE_WIDTH * 1.2) {
        obs.x += obs.x < car.current.x ? -15 : 15;
      }
    });
  }, []);

  // Main Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spawnObstacleOrItem = () => {
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const laneX = ROAD_LEFT + LANE_WIDTH * (lane + 0.5);

      // Check if item or obstacle
      if (Math.random() < 0.35) {
        // Spawn Item
        const rand = Math.random();
        const type: 'coin' | 'nitro' | 'repair' = rand < 0.65 ? 'coin' : rand < 0.88 ? 'nitro' : 'repair';
        items.current.push({
          id: Math.random(),
          lane,
          x: laneX,
          y: -40,
          type,
          collected: false,
        });
      } else {
        // Spawn Obstacle Vehicle
        const types: ('truck' | 'bus' | 'taxi' | 'sedan' | 'barrier' | 'oil')[] = [
          'truck',
          'bus',
          'taxi',
          'sedan',
          'barrier',
          'oil',
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        let width = 36;
        let height = 62;
        let color = '#ef4444';

        if (type === 'truck') {
          width = 42;
          height = 92;
          color = '#3b82f6';
        } else if (type === 'bus') {
          width = 40;
          height = 84;
          color = '#10b981';
        } else if (type === 'taxi') {
          width = 34;
          height = 58;
          color = '#eab308';
        } else if (type === 'barrier') {
          width = 48;
          height = 24;
          color = '#f97316';
        } else if (type === 'oil') {
          width = 38;
          height = 38;
          color = '#1e293b';
        }

        obstacles.current.push({
          id: Math.random(),
          lane,
          x: laneX,
          y: -height - 20,
          width,
          height,
          speed: type === 'truck' ? 1.5 : type === 'bus' ? 2 : type === 'barrier' || type === 'oil' ? 0 : 2.8,
          type,
          color,
        });
      }
    };

    const loop = () => {
      // Highway Speed calculation
      const currentSpeed = isNitroRef.current ? 12 : 6.5;
      setSpeedKmh(isNitroRef.current ? 180 : 95 + Math.min(50, Math.floor(scoreRef.current / 30)));

      // 1. DRAW HIGHWAY (Mặt đường nhựa)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Road asphalt
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ROAD_LEFT, 0, ROAD_WIDTH, HEIGHT);

      // Rumble strips (Viền đỏ trắng lề đường)
      const curbSegHeight = 24;
      const curbOffset = roadOffset.current % (curbSegHeight * 2);
      for (let y = -curbSegHeight * 2; y < HEIGHT + curbSegHeight * 2; y += curbSegHeight) {
        const isRed = Math.floor((y - curbOffset) / curbSegHeight) % 2 === 0;
        ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';
        ctx.fillRect(ROAD_LEFT - 12, y + curbOffset, 12, curbSegHeight);
        ctx.fillRect(ROAD_RIGHT, y + curbOffset, 12, curbSegHeight);
      }

      // Dashed lane lines
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 24]);
      ctx.lineDashOffset = -roadOffset.current;

      for (let l = 1; l < LANE_COUNT; l++) {
        const lx = ROAD_LEFT + l * LANE_WIDTH;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, HEIGHT);
        ctx.stroke();
      }
      ctx.setLineDash([]); // Reset line dash

      // 2. LOGIC UPDATES
      if (!isPaused && !isGameOver) {
        roadOffset.current += currentSpeed;

        // Nitro depletion
        if (isNitroRef.current) {
          setNitroGauge((g) => {
            const next = g - 1.2;
            if (next <= 0) {
              setIsNitroActive(false);
              return 0;
            }
            return next;
          });

          // Nitro exhaust flame particles
          for (let i = 0; i < 4; i++) {
            particles.current.push({
              x: car.current.x + (Math.random() - 0.5) * 16,
              y: car.current.y + car.current.height / 2 + 10,
              vx: (Math.random() - 0.5) * 2,
              vy: Math.random() * 4 + 4,
              color: Math.random() < 0.6 ? '#38bdf8' : '#60a5fa',
              size: Math.random() * 5 + 3,
              life: 0,
              maxLife: 15,
            });
          }
        }

        // Distance & score progression
        setDistance((d) => d + 1);
        if (Math.floor(Date.now() / 250) % 2 === 0) {
          setScore((s) => {
            const ns = s + (isNitroRef.current ? 3 : 1);
            onScore?.(ns);
            return ns;
          });
        }

        // Smooth car steering interpolation
        car.current.x += (car.current.targetX - car.current.x) * 0.22;
        car.current.driftAngle *= 0.85; // ease back straight

        if (car.current.invincibleTimer > 0) {
          car.current.invincibleTimer--;
        }

        // Spawn obstacles
        nextSpawnDist.current -= currentSpeed;
        if (nextSpawnDist.current <= 0) {
          spawnObstacleOrItem();
          nextSpawnDist.current = Math.max(70, 140 - Math.min(scoreRef.current / 2, 60));
        }

        // Update Obstacles
        for (let i = obstacles.current.length - 1; i >= 0; i--) {
          const obs = obstacles.current[i];
          // They drift downwards relative to the player car
          const relSpeed = currentSpeed - obs.speed;
          obs.y += relSpeed;

          // Collision detection with player car
          if (car.current.invincibleTimer === 0) {
            const hitX = Math.abs(car.current.x - obs.x) < (car.current.width + obs.width) * 0.42;
            const hitY = Math.abs(car.current.y - obs.y) < (car.current.height + obs.height) * 0.42;

            if (hitX && hitY) {
              if (obs.type === 'oil') {
                // Spin & slide
                car.current.driftAngle = (Math.random() - 0.5) * 0.6;
                playMiniGameSound('skid');
              } else if (isNitroRef.current) {
                // Nitro destroys obstacle!
                playMiniGameSound('crash');
                createExplosion(obs.x, obs.y, obs.color, 20);
                obstacles.current.splice(i, 1);
                setScore((s) => s + 50);
                continue;
              } else {
                // Take hit!
                handleCarHit();
              }
            }
          }

          // Remove offscreen
          if (obs.y > HEIGHT + 100) {
            obstacles.current.splice(i, 1);
          }
        }

        // Update Items
        for (let i = items.current.length - 1; i >= 0; i--) {
          const it = items.current[i];
          it.y += currentSpeed;

          const hitX = Math.abs(car.current.x - it.x) < 32;
          const hitY = Math.abs(car.current.y - it.y) < 36;

          if (!it.collected && hitX && hitY) {
            it.collected = true;
            if (it.type === 'coin') {
              playMiniGameSound('collect');
              setScore((s) => s + 30);
              createExplosion(it.x, it.y, '#facc15', 12);
            } else if (it.type === 'nitro') {
              playMiniGameSound('powerup');
              setNitroGauge((g) => Math.min(100, g + 40));
              createExplosion(it.x, it.y, '#38bdf8', 14);
            } else if (it.type === 'repair') {
              playMiniGameSound('powerup');
              setLives((l) => Math.min(3, l + 1));
              createExplosion(it.x, it.y, '#4ade80', 14);
            }
          }

          if (it.y > HEIGHT + 40 || it.collected) {
            items.current.splice(i, 1);
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

      // 3. DRAW ITEMS
      items.current.forEach((it) => {
        ctx.save();
        ctx.translate(it.x, it.y);
        if (it.type === 'coin') {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = '#713f12';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 1);
        } else if (it.type === 'nitro') {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🚀', 0, 1);
        } else {
          ctx.fillStyle = 'rgba(74, 222, 128, 0.3)';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🔧', 0, 1);
        }
        ctx.restore();
      });

      // 4. DRAW OBSTACLES (Xe khác & chướng ngại vật)
      obstacles.current.forEach((obs) => {
        ctx.save();
        ctx.translate(obs.x, obs.y);

        if (obs.type === 'oil') {
          // Oil puddle
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(0, 0, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.ellipse(2, 2, obs.width / 3, obs.height / 3, 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'barrier') {
          // Road construction barrier
          ctx.fillStyle = '#f97316';
          ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-obs.width / 4, -obs.height / 2, 8, obs.height);
          ctx.fillRect(obs.width / 8, -obs.height / 2, 8, obs.height);
        } else {
          // Vehicle Car / Truck / Bus
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.fillRect(-obs.width / 2 + 3, -obs.height / 2 + 5, obs.width, obs.height);

          // Body
          ctx.fillStyle = obs.color;
          ctx.beginPath();
          ctx.roundRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height, 8);
          ctx.fill();

          // Windshields
          ctx.fillStyle = '#0284c7';
          // Front glass
          ctx.fillRect(-obs.width / 2 + 4, -obs.height / 2 + 10, obs.width - 8, 12);
          // Rear glass
          ctx.fillRect(-obs.width / 2 + 4, obs.height / 2 - 16, obs.width - 8, 10);

          // Headlights (facing down)
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-obs.width / 2 + 3, obs.height / 2 - 4, 6, 4);
          ctx.fillRect(obs.width / 2 - 9, obs.height / 2 - 4, 6, 4);

          // Taillights
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-obs.width / 2 + 3, -obs.height / 2, 6, 3);
          ctx.fillRect(obs.width / 2 - 9, -obs.height / 2, 6, 3);
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

      // 6. DRAW PLAYER CAR (Siêu xe của bé)
      ctx.save();
      ctx.translate(car.current.x, car.current.y);
      ctx.rotate(car.current.driftAngle);

      // Invincible flash
      if (car.current.invincibleTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
        ctx.globalAlpha = 0.45;
      }

      // Nitro Glow
      if (isNitroRef.current) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
      }

      // Car shadow
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(-car.current.width / 2 + 4, -car.current.height / 2 + 6, car.current.width, car.current.height);

      // Car chassis (Bright Crimson Red Sport Car)
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.roundRect(-car.current.width / 2, -car.current.height / 2, car.current.width, car.current.height, 9);
      ctx.fill();

      // Racing Stripes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -car.current.height / 2, 6, car.current.height);

      // Cockpit / Windshield
      ctx.fillStyle = '#0f172a';
      // Front windshield (facing top)
      ctx.fillRect(-car.current.width / 2 + 4, -car.current.height / 2 + 14, car.current.width - 8, 14);
      // Rear windshield
      ctx.fillRect(-car.current.width / 2 + 5, car.current.height / 2 - 18, car.current.width - 10, 10);

      // Roof
      ctx.fillStyle = '#be123c';
      ctx.fillRect(-car.current.width / 2 + 5, -car.current.height / 2 + 28, car.current.width - 10, 16);

      // Headlights (Beaming upward)
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-car.current.width / 2 + 2, -car.current.height / 2, 7, 4);
      ctx.fillRect(car.current.width / 2 - 9, -car.current.height / 2, 7, 4);

      // Taillights
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-car.current.width / 2 + 3, car.current.height / 2 - 3, 6, 3);
      ctx.fillRect(car.current.width / 2 - 9, car.current.height / 2 - 3, 6, 3);

      ctx.restore();

      animFrameId.current = requestAnimationFrame(loop);
    };

    const handleCarHit = () => {
      playMiniGameSound('hit');
      createExplosion(car.current.x, car.current.y, '#f43f5e', 18);
      car.current.invincibleTimer = 75;

      setLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setIsGameOver(true);
          playMiniGameSound('crash');
          createExplosion(car.current.x, car.current.y, '#f97316', 30);

          const currentScore = scoreRef.current;
          if (currentScore > highScore) {
            setHighScore(currentScore);
            try {
              localStorage.setItem('trang-toan:highway-best', String(currentScore));
            } catch {}
          }
          onFinish?.(currentScore);
        }
        return Math.max(0, next);
      });
    };

    const createExplosion = (x: number, y: number, color: string, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.2;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color,
          size: Math.random() * 3.5 + 1.5,
          life: 0,
          maxLife: 20,
        });
      }
    };

    animFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPaused, isGameOver, highScore, onScore, onFinish]);

  // Controls: Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code) || e.key === 'ArrowLeft') {
        e.preventDefault();
        steer('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code) || e.key === 'ArrowRight') {
        e.preventDefault();
        steer('right');
      } else if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        triggerNitro();
      } else if (['KeyH'].includes(e.code) || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        honkHorn();
      } else if (['KeyP'].includes(e.code) || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (['Escape', 'BrowserBack'].includes(e.key)) {
        onExit?.();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [steer, triggerNitro, honkHorn, onExit]);

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-xl mx-auto w-full select-none text-slate-800 dark:text-slate-100">
      {/* Top HUD */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🏎️</span>
          <div>
            <h3 className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 tracking-wide">
              ĐUA XE VƯỢT CHƯỚNG NGẠI
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              Tốc độ: <strong className="text-amber-500">{speedKmh} km/h</strong> • {distance}m
            </span>
          </div>
        </div>

        {/* Lives & Score */}
        <div className="flex items-center gap-3">
          {/* Hearts */}
          <div className="flex items-center gap-1" aria-label={`Còn ${lives} mạng`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg transition-transform ${
                  i < lives ? 'scale-100 opacity-100' : 'scale-90 opacity-25 grayscale'
                }`}
              >
                ❤️
              </span>
            ))}
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ĐIỂM</div>
            <div className="text-xl font-black font-mono text-rose-600 dark:text-rose-400 tabular-nums">{score}</div>
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

      {/* Nitro Bar */}
      <div className="w-full max-w-[420px] mb-2 flex items-center gap-2 px-1">
        <span className="text-xs font-black text-sky-500 flex items-center gap-1">
          <span>🚀</span> NITRO
        </span>
        <div className="flex-1 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              isNitroActive
                ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 animate-pulse shadow-md'
                : 'bg-gradient-to-r from-cyan-500 to-sky-500'
            }`}
            style={{ width: `${nitroGauge}%` }}
          />
        </div>
        <span className="text-xs font-bold font-mono text-slate-500 dark:text-slate-400">{Math.round(nitroGauge)}%</span>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="block max-w-full aspect-[4/5] w-[340px] sm:w-[420px]"
        />

        {/* Pause Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-2xl font-black text-white mb-2">ĐÃ TẠM DỪNG</h3>
            <p className="text-sm text-slate-300 mb-6">Bấm nút bên dưới để tiếp tục đường đua</p>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-2xl active:scale-95 shadow-lg shadow-rose-500/30 transition-all"
            >
              Tiếp tục đua 🏎️
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <span className="text-5xl mb-2">💥</span>
            <h3 className="text-2xl font-black text-white mb-1">XE BỊ VA CHẠM!</h3>
            <p className="text-sm text-slate-300 mb-2">
              Quãng đường: <strong className="text-amber-400 font-black">{distance}m</strong> • Điểm số:{' '}
              <span className="font-mono text-rose-400 font-black text-xl">{score}</span>
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Thu thập thêm bình Nitro 🚀 và cờ sửa chữa 🔧 để duy trì hành trình nhé!
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetGame}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-white font-black rounded-2xl active:scale-95 shadow-lg shadow-rose-500/25 transition-all"
              >
                Đua lại 🏎️
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

      {/* Control Buttons (Touch / Mobile Friendly) */}
      <div className="w-full mt-3 flex flex-wrap items-center justify-between max-w-[420px] gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 shadow-xs"
            title="Tạm dừng"
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
          <button
            type="button"
            onClick={honkHorn}
            className="p-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black rounded-2xl shadow-xs transition-all"
            title="Bấm còi"
          >
            📢 Còi
          </button>
        </div>

        {/* Steer Left / Right & Nitro */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => steer('left')}
            className="w-14 h-12 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 text-slate-900 dark:text-white font-black text-xl rounded-2xl flex items-center justify-center transition-all shadow-xs"
            aria-label="Trái"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => steer('right')}
            className="w-14 h-12 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 text-slate-900 dark:text-white font-black text-xl rounded-2xl flex items-center justify-center transition-all shadow-xs"
            aria-label="Phải"
          >
            ▶
          </button>
          <button
            type="button"
            onClick={triggerNitro}
            disabled={nitroGauge < 20 || isNitroActive}
            className={`px-4 h-12 rounded-2xl font-black text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
              isNitroActive
                ? 'bg-sky-400 text-slate-950 animate-pulse'
                : nitroGauge >= 20
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/25'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 opacity-50'
            }`}
          >
            <span>🚀</span>
            <span>NITRO</span>
          </button>
        </div>
      </div>

      <p className="mt-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        💡 <strong>Cách chơi:</strong> Dùng phím ◀ ▶ (hoặc A/D) để chuyển làn né xe tải, rào chắn và vũng dầu. Bấm phím Cách / ↑ hoặc nút NITRO để phóng bứt tốc độ!
      </p>
    </div>
  );
};
export default HighwayRacerGame;
