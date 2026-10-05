import { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  radius: number;
  value: number;
  color: string;
  speedY: number;
  speedX: number;
  wobbleSpeed: number;
  wobbleAngle: number;
  shortcut: number; // 1 to 6 for TV remote / keyboard quick pop
  isCorrect: boolean;
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

interface Mission {
  title: string;
  description: string;
  check: (val: number) => boolean;
  generator: () => number[];
}

const WIDTH = 480;
const HEIGHT = 560;

const BUBBLE_COLORS = [
  { fill: 'rgba(56, 189, 248, 0.75)', stroke: '#0284c7', glow: '#38bdf8' }, // Sky
  { fill: 'rgba(168, 85, 247, 0.75)', stroke: '#7e22ce', glow: '#c084fc' }, // Purple
  { fill: 'rgba(236, 72, 153, 0.75)', stroke: '#be185d', glow: '#f472b6' }, // Pink
  { fill: 'rgba(34, 197, 94, 0.75)', stroke: '#15803d', glow: '#4ade80' },  // Green
  { fill: 'rgba(245, 158, 11, 0.75)', stroke: '#b45309', glow: '#fbbf24' }, // Amber
  { fill: 'rgba(20, 184, 166, 0.75)', stroke: '#0f766e', glow: '#2dd4bf' }, // Teal
];

const MISSIONS: Mission[] = [
  {
    title: 'Số Chẵn',
    description: 'Bắn vỡ các bong bóng chứa SỐ CHẴN (chia hết cho 2)',
    check: (n) => n % 2 === 0,
    generator: () => {
      const nums: number[] = [];
      for (let i = 0; i < 6; i++) {
        nums.push(i % 2 === 0 ? Math.floor(Math.random() * 20 + 1) * 2 : Math.floor(Math.random() * 20) * 2 + 1);
      }
      return nums.sort(() => Math.random() - 0.5);
    },
  },
  {
    title: 'Số Lẻ',
    description: 'Bắn vỡ các bong bóng chứa SỐ LẺ (không chia hết cho 2)',
    check: (n) => n % 2 !== 0,
    generator: () => {
      const nums: number[] = [];
      for (let i = 0; i < 6; i++) {
        nums.push(i % 2 === 0 ? Math.floor(Math.random() * 20) * 2 + 1 : Math.floor(Math.random() * 20 + 1) * 2);
      }
      return nums.sort(() => Math.random() - 0.5);
    },
  },
  {
    title: 'Chia hết cho 5',
    description: 'Bắn vỡ bong bóng TẬN CÙNG LÀ 0 HOẶC 5',
    check: (n) => n % 5 === 0,
    generator: () => {
      const pool = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 8, 12, 16, 23, 37, 42];
      return [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
    },
  },
  {
    title: 'Số lớn hơn 30',
    description: 'Bắn vỡ các bong bóng có giá trị LỚN HƠN 30 (> 30)',
    check: (n) => n > 30,
    generator: () => {
      const pool = [35, 42, 58, 64, 75, 88, 12, 18, 24, 29, 15, 7];
      return [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
    },
  },
  {
    title: 'Bội số của 3',
    description: 'Bắn vỡ bong bóng CHIA HẾT CHO 3 (bảng nhân 3)',
    check: (n) => n % 3 === 0,
    generator: () => {
      const pool = [6, 9, 12, 15, 18, 21, 24, 27, 8, 11, 14, 16, 20, 25];
      return [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
    },
  },
];

export const BubbleMathGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Crosshair position (for TV remote & keyboard navigation)
  const crosshairPos = useRef({ x: WIDTH / 2, y: HEIGHT / 2 });
  const bubbles = useRef<Bubble[]>([]);
  const particles = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const nextSpawnTimer = useRef(0);

  const currentMission = MISSIONS[currentMissionIdx % MISSIONS.length];

  // Load high score
  useEffect(() => {
    try {
      const stored = localStorage.getItem('trang-toan:bubble-best');
      if (stored) setHighScore(Number(stored));
    } catch {}
  }, []);

  // Spawn a wave of bubbles
  const spawnBubbleWave = useCallback((mission: Mission) => {
    const values = mission.generator();
    const count = 5;
    const newBubbles: Bubble[] = [];
    const colWidth = (WIDTH - 60) / count;

    for (let i = 0; i < count; i++) {
      const val = values[i % values.length];
      const colorScheme = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
      newBubbles.push({
        id: Math.random(),
        x: 40 + i * colWidth + (Math.random() - 0.5) * 20,
        y: HEIGHT + 30 + Math.random() * 40,
        radius: 30,
        value: val,
        color: colorScheme.fill,
        speedY: -(Math.random() * 0.8 + 1.2),
        speedX: (Math.random() - 0.5) * 0.6,
        wobbleSpeed: Math.random() * 0.05 + 0.03,
        wobbleAngle: Math.random() * Math.PI * 2,
        shortcut: i + 1,
        isCorrect: mission.check(val),
      });
    }

    bubbles.current = newBubbles;
  }, []);

  const createPopParticles = (x: number, y: number, color: string, count = 18) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      particles.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: Math.random() * 18 + 12,
      });
    }
  };

  const popBubble = useCallback(
    (bubble: Bubble) => {
      createPopParticles(bubble.x, bubble.y, bubble.color);

      if (bubble.isCorrect) {
        playMiniGameSound('collect');
        setCombo((c) => {
          const nextCombo = c + 1;
          const bonus = nextCombo > 2 ? 15 : 10;
          scoreRef.current += bonus;
          setScore(scoreRef.current);
          onScore?.(scoreRef.current);
          return nextCombo;
        });

        // Remove popped bubble
        bubbles.current = bubbles.current.filter((b) => b.id !== bubble.id);

        // Check if any correct bubbles remain
        const remainingCorrect = bubbles.current.filter((b) => b.isCorrect);
        if (remainingCorrect.length === 0) {
          playMiniGameSound('success');
          // Move to next mission
          setCurrentMissionIdx((idx) => {
            const nextIdx = idx + 1;
            spawnBubbleWave(MISSIONS[nextIdx % MISSIONS.length]);
            return nextIdx;
          });
        }
      } else {
        // Wrong bubble
        playMiniGameSound('miss');
        setCombo(0);
        createPopParticles(bubble.x, bubble.y, '#ef4444', 12);
        setLives((l) => {
          const nextL = l - 1;
          if (nextL <= 0) {
            setIsGameOver(true);
            playMiniGameSound('miss');
            onFinish?.(scoreRef.current);
            try {
              const curBest = Number(localStorage.getItem('trang-toan:bubble-best') || '0');
              if (scoreRef.current > curBest) {
                localStorage.setItem('trang-toan:bubble-best', String(scoreRef.current));
                setHighScore(scoreRef.current);
              }
            } catch {}
          }
          return Math.max(0, nextL);
        });
        // Remove wrong bubble
        bubbles.current = bubbles.current.filter((b) => b.id !== bubble.id);
      }
    },
    [onScore, onFinish, spawnBubbleWave]
  );

  const resetGame = useCallback(() => {
    playMiniGameSound('step');
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    setCombo(0);
    setCurrentMissionIdx(0);
    setIsGameOver(false);
    setIsPaused(false);
    particles.current = [];
    spawnBubbleWave(MISSIONS[0]);
    onScore?.(0);
  }, [onScore, spawnBubbleWave]);

  // Initial wave
  useEffect(() => {
    spawnBubbleWave(MISSIONS[0]);
  }, [spawnBubbleWave]);

  // Main Loop
  useEffect(() => {
    if (isGameOver || isPaused) return;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Update bubbles
      let allEscaped = true;
      bubbles.current.forEach((b) => {
        b.y += b.speedY;
        b.wobbleAngle += b.wobbleSpeed;
        b.x += Math.sin(b.wobbleAngle) * 0.8 + b.speedX;

        // Keep within bounds
        if (b.x < b.radius + 10) b.x = b.radius + 10;
        if (b.x > WIDTH - b.radius - 10) b.x = WIDTH - b.radius - 10;

        if (b.y + b.radius > 0) {
          allEscaped = false;
        }
      });

      // If all floated past top, spawn a fresh wave and lose 1 combo
      if (allEscaped && bubbles.current.length > 0) {
        setCombo(0);
        spawnBubbleWave(MISSIONS[currentMissionIdx % MISSIONS.length]);
      }

      // 2. Update particles
      particles.current = particles.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        return p.life < p.maxLife;
      });

      // 3. RENDER SCENE
      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#1e1b4b');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Decorative stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 20; i++) {
        const sx = ((i * 73) % WIDTH);
        const sy = ((i * 109) % HEIGHT);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

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

      // Draw Bubbles
      bubbles.current.forEach((b) => {
        ctx.save();
        ctx.translate(b.x, b.y);

        // Glow aura
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;

        // Bubble outer
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Bubble sheen / highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(-b.radius * 0.35, -b.radius * 0.35, b.radius * 0.22, b.radius * 0.14, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Number Value
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Be Vietnam Pro, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 4;
        ctx.fillText(String(b.value), 0, 1);

        // TV / Keyboard Shortcut Badge (e.g. 1, 2, 3...)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(b.radius * 0.7, -b.radius * 0.7, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'black 11px sans-serif';
        ctx.fillText(String(b.shortcut), b.radius * 0.7, -b.radius * 0.7);

        ctx.restore();
      });

      // Draw TV/D-Pad Crosshair
      const ch = crosshairPos.current;
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ch.x, ch.y, 16, 0, Math.PI * 2);
      ctx.moveTo(ch.x - 24, ch.y);
      ctx.lineTo(ch.x + 24, ch.y);
      ctx.moveTo(ch.x, ch.y - 24);
      ctx.lineTo(ch.x, ch.y + 24);
      ctx.stroke();

      animationFrameId.current = requestAnimationFrame(loop);
    };

    animationFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isGameOver, isPaused, currentMissionIdx, spawnBubbleWave]);

  // Controls: Keyboard, TV Remote, D-Pad, Number shortcuts (1-6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Digit keys 1-6 (from TV Remote numpad or keyboard)
      const digitMatch = e.code.match(/^(?:Digit|Numpad)([1-6])$/)?.[1] || e.key.match(/^[1-6]$/)?.[0];
      if (digitMatch) {
        const targetShortcut = Number(digitMatch);
        const targetBubble = bubbles.current.find((b) => b.shortcut === targetShortcut);
        if (targetBubble) {
          e.preventDefault();
          popBubble(targetBubble);
          return;
        }
      }

      // 2. TV Remote & Keyboard D-Pad / Arrows for Crosshair
      const ch = crosshairPos.current;
      const step = 40;
      if (
        ['ArrowLeft', 'Left', 'KeyA'].includes(e.key) ||
        ['ArrowLeft', 'KeyA', 'DPAD_LEFT'].includes(e.code) ||
        e.keyCode === 37 ||
        e.keyCode === 21
      ) {
        e.preventDefault();
        ch.x = Math.max(30, ch.x - step);
      } else if (
        ['ArrowRight', 'Right', 'KeyD'].includes(e.key) ||
        ['ArrowRight', 'KeyD', 'DPAD_RIGHT'].includes(e.code) ||
        e.keyCode === 39 ||
        e.keyCode === 22
      ) {
        e.preventDefault();
        ch.x = Math.min(WIDTH - 30, ch.x + step);
      } else if (
        ['ArrowUp', 'Up', 'KeyW'].includes(e.key) ||
        ['ArrowUp', 'KeyW', 'DPAD_UP'].includes(e.code) ||
        e.keyCode === 38 ||
        e.keyCode === 19
      ) {
        e.preventDefault();
        ch.y = Math.max(30, ch.y - step);
      } else if (
        ['ArrowDown', 'Down', 'KeyS'].includes(e.key) ||
        ['ArrowDown', 'KeyS', 'DPAD_DOWN'].includes(e.code) ||
        e.keyCode === 40 ||
        e.keyCode === 20
      ) {
        e.preventDefault();
        ch.y = Math.min(HEIGHT - 30, ch.y + step);
      } else if (
        ['Enter', 'Select', ' '].includes(e.key) ||
        ['Enter', 'NumpadEnter', 'Space'].includes(e.code) ||
        e.keyCode === 13 ||
        e.keyCode === 23 ||
        e.keyCode === 32 ||
        e.keyCode === 66
      ) {
        e.preventDefault();
        // Shoot at crosshair position
        const target = bubbles.current.find((b) => {
          const dist = Math.hypot(b.x - ch.x, b.y - ch.y);
          return dist < b.radius + 15;
        });
        if (target) {
          popBubble(target);
        } else {
          // Find closest bubble
          let closest: Bubble | null = null;
          let minDist = 999;
          bubbles.current.forEach((b) => {
            const dist = Math.hypot(b.x - ch.x, b.y - ch.y);
            if (dist < minDist && dist < 65) {
              minDist = dist;
              closest = b;
            }
          });
          if (closest) popBubble(closest);
        }
      } else if (e.key === 'p' || e.key === 'P' || e.code === 'KeyP') {
        setIsPaused((p) => !p);
      } else if (
        ['Escape', 'BrowserBack', 'GoBack'].includes(e.key) ||
        e.keyCode === 4 ||
        e.keyCode === 461 ||
        e.keyCode === 10009
      ) {
        e.preventDefault();
        onExit?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [popBubble, onExit]);

  // Touch & Mouse Pointer interaction on Canvas
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;

    // Update crosshair to tapped location
    crosshairPos.current = { x: clientX, y: clientY };

    // Find bubble clicked
    const clickedBubble = bubbles.current.find((b) => {
      const dist = Math.hypot(b.x - clientX, b.y - clientY);
      return dist <= b.radius + 10;
    });

    if (clickedBubble) {
      popBubble(clickedBubble);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-xl mx-auto w-full select-none text-slate-800 dark:text-slate-100">
      {/* HUD Header */}
      <div className="w-full flex items-center justify-between mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ĐIỂM SỐ</div>
            <div className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">{score}</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">KỶ LỤC</div>
            <div className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300 tabular-nums">
              {Math.max(score, highScore)}
            </div>
          </div>
          {combo > 1 && (
            <div className="hidden sm:block">
              <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-600 dark:text-amber-300 text-xs font-black">
                🔥 x{combo} Combo
              </span>
            </div>
          )}
        </div>

        {/* Lives */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800" aria-label={`Còn ${lives} lượt`}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg transition-transform ${
                i < lives ? 'scale-100 opacity-100' : 'scale-90 opacity-20 grayscale'
              }`}
            >
              🎈
            </span>
          ))}
        </div>
      </div>

      {/* Mission Banner */}
      <div className="w-full mb-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-3.5 text-white shadow-md text-center">
        <div className="text-xs font-extrabold uppercase tracking-widest text-violet-200">
          🎯 NHIỆM VỤ: {currentMission.title}
        </div>
        <div className="text-sm sm:text-base font-black mt-0.5">{currentMission.description}</div>
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-950">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={handlePointerDown}
          className="block max-w-full aspect-[6/7] w-[340px] sm:w-[420px] cursor-crosshair touch-none"
        />

        {/* Pause Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-2xl font-black text-white mb-2">ĐÃ TẠM DỪNG</h3>
            <p className="text-sm text-slate-300 mb-6">Bấm phím P hoặc nút bên dưới để tiếp tục bắn bóng</p>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl active:scale-95 shadow-lg shadow-cyan-500/30 transition-all"
            >
              Tiếp tục 🎈
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <span className="text-5xl mb-2">🎉</span>
            <h3 className="text-2xl font-black text-white mb-1">KẾT THÚC LƯỢT BẮN BÓNG!</h3>
            <p className="text-sm text-slate-300 mb-2">
              Điểm số đạt được: <span className="font-mono text-amber-400 font-black text-2xl">{score}</span>
            </p>
            <p className="text-xs text-slate-400 mb-6 max-w-xs">
              Bé đã luyện tập khả năng nhận biết số học rất nhanh nhẹn!
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetGame}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl active:scale-95 shadow-lg shadow-amber-500/25 transition-all"
              >
                Chơi lại 🔄
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

      {/* Control Quick Bar for TV & Mobile */}
      <div className="w-full mt-3 flex items-center justify-between max-w-[420px] gap-2">
        <div className="flex gap-1.5">
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
            onClick={resetGame}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300 shadow-xs"
            title="Làm mới"
          >
            🔄
          </button>
        </div>

        {/* Quick Pop Buttons for TV & Touch */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                const targetBubble = bubbles.current.find((b) => b.shortcut === num);
                if (targetBubble) popBubble(targetBubble);
              }}
              className="h-11 w-11 rounded-xl bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/60 dark:hover:bg-violet-800 text-violet-900 dark:text-violet-100 font-black text-sm transition-all active:scale-90"
              aria-label={`Bắn bóng số ${num}`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium text-center">
        💡 Chạm trực tiếp vào bóng · Bấm số 1–5 trên bàn phím / remote TV · Dùng D-pad/mũi tên + OK/Space
      </div>
    </div>
  );
};
