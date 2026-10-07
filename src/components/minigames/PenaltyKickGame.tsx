import { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

type TargetId = 'top-left' | 'center-high' | 'top-right' | 'bottom-left' | 'bottom-right';

interface TargetZone {
  id: TargetId;
  name: string;
  shortKey: string;
  icon: string;
  xPct: number; // % in goal area
  yPct: number;
}

const TARGET_ZONES: TargetZone[] = [
  { id: 'top-left', name: 'Góc cao trái', shortKey: '1', icon: '↖️', xPct: 20, yPct: 24 },
  { id: 'center-high', name: 'Chính diện bổng', shortKey: '2', icon: '⬆️', xPct: 50, yPct: 26 },
  { id: 'top-right', name: 'Góc cao phải', shortKey: '3', icon: '↗️', xPct: 80, yPct: 24 },
  { id: 'bottom-left', name: 'Góc sệt trái', shortKey: '4', icon: '↙️', xPct: 22, yPct: 76 },
  { id: 'bottom-right', name: 'Góc sệt phải', shortKey: '5', icon: '↘️', xPct: 78, yPct: 76 },
];

interface MathBoost {
  question: string;
  options: number[];
  answer: number;
}

function generateMathBoost(): MathBoost {
  const op = Math.random() < 0.6 ? '+' : '-';
  if (op === '+') {
    const a = Math.floor(Math.random() * 15) + 3;
    const b = Math.floor(Math.random() * 15) + 2;
    const ans = a + b;
    const wrong1 = ans + (Math.random() < 0.5 ? 2 : -2);
    const wrong2 = ans + (Math.random() < 0.5 ? 1 : -3);
    const opts = Array.from(new Set([ans, wrong1, wrong2])).sort(() => Math.random() - 0.5);
    while (opts.length < 3) opts.push(ans + opts.length + 1);
    return { question: `${a} + ${b} = ?`, options: opts.slice(0, 3), answer: ans };
  } else {
    const a = Math.floor(Math.random() * 20) + 10;
    const b = Math.floor(Math.random() * 9) + 2;
    const ans = a - b;
    const wrong1 = ans + 2;
    const wrong2 = ans > 3 ? ans - 2 : ans + 4;
    const opts = Array.from(new Set([ans, wrong1, wrong2])).sort(() => Math.random() - 0.5);
    while (opts.length < 3) opts.push(ans + opts.length + 1);
    return { question: `${a} - ${b} = ?`, options: opts.slice(0, 3), answer: ans };
  }
}

export const PenaltyKickGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [kickIndex, setKickIndex] = useState(0); // 0 to 4 (5 kicks)
  const [kickResults, setKickResults] = useState<('goal' | 'saved' | 'pending')[]>([
    'pending',
    'pending',
    'pending',
    'pending',
    'pending',
  ]);
  const [streak, setStreak] = useState(0);

  // Ball & Goalie Animation State
  const [isKicking, setIsKicking] = useState(false);
  const [ballStyle, setBallStyle] = useState<{
    x: number; // % in pitch
    y: number; // % in pitch
    scale: number;
    rotate: number;
  }>({ x: 50, y: 84, scale: 1, rotate: 0 });

  const [keeperPos, setKeeperPos] = useState<'center' | 'left-high' | 'right-high' | 'left-low' | 'right-low'>('center');
  const [keeperDiving, setKeeperDiving] = useState(false);
  const [resultBanner, setResultBanner] = useState<{ text: string; sub: string; type: 'goal' | 'miss' } | null>(null);
  const [roundEnded, setRoundEnded] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<TargetId | null>(null);

  // Super Shot Math Boost
  const [superShotActive, setSuperShotActive] = useState(false);
  const [currentMath, setCurrentMath] = useState<MathBoost | null>(() => generateMathBoost());

  const isKickingRef = useRef(false);
  isKickingRef.current = isKicking;

  // Load HighScore
  useEffect(() => {
    try {
      const stored = localStorage.getItem('trang-toan:penalty-best');
      if (stored) setHighScore(Number(stored));
    } catch {}
  }, []);

  // Update overall arcade score
  useEffect(() => {
    onScore?.(score);
  }, [score, onScore]);

  // Handle Math Answer
  const handleAnswerMath = (chosen: number) => {
    if (!currentMath || isKicking || superShotActive) return;
    if (chosen === currentMath.answer) {
      setSuperShotActive(true);
      playMiniGameSound('correct');
    } else {
      playMiniGameSound('miss');
      setCurrentMath(generateMathBoost());
    }
  };

  // Perform Penalty Kick
  const shootAtTarget = useCallback((targetId: TargetId) => {
    if (isKickingRef.current || roundEnded) return;

    setIsKicking(true);
    setSelectedTarget(targetId);
    playMiniGameSound('jump');

    const target = TARGET_ZONES.find((t) => t.id === targetId)!;

    // Goalkeeper AI decision:
    // With SuperShot active: 100% GOAL!
    // Without SuperShot: Keeper has 35% chance to guess correct quadrant, but 65% goal chance for fun!
    const possibleDives: ('left-high' | 'right-high' | 'left-low' | 'right-low' | 'center')[] = [
      'left-high',
      'right-high',
      'left-low',
      'right-low',
      'center',
    ];

    let keeperDive: 'left-high' | 'right-high' | 'left-low' | 'right-low' | 'center' = 'center';
    let isGoal = false;

    if (superShotActive) {
      // Super shot always beats goalkeeper!
      // Keeper dives to opposite side
      keeperDive = targetId.includes('left') ? 'right-high' : 'left-high';
      isGoal = true;
    } else {
      const matchMap: Record<TargetId, 'left-high' | 'right-high' | 'left-low' | 'right-low' | 'center'> = {
        'top-left': 'left-high',
        'top-right': 'right-high',
        'bottom-left': 'left-low',
        'bottom-right': 'right-low',
        'center-high': 'center',
      };
      const correctDive = matchMap[targetId];

      const keeperGuessesRight = Math.random() < 0.35;
      if (keeperGuessesRight) {
        keeperDive = correctDive;
        isGoal = false;
      } else {
        // Keeper dives wrong way or doesn't reach in time
        const wrongDives = possibleDives.filter((d) => d !== correctDive);
        keeperDive = wrongDives[Math.floor(Math.random() * wrongDives.length)];
        isGoal = true;
      }
    }

    // Ball animation target coordinates
    // Pitch height: goal area top is around 18% - 50%
    const goalAreaTopPct = 20;
    const goalAreaHeightPct = 34;
    const targetXPct = 28 + (target.xPct / 100) * 44;
    const targetYPct = goalAreaTopPct + (target.yPct / 100) * goalAreaHeightPct;

    // Trigger keeper dive
    setKeeperDiving(true);
    setKeeperPos(keeperDive);

    // Animate ball to target
    setBallStyle({
      x: targetXPct,
      y: targetYPct,
      scale: 0.42,
      rotate: 720,
    });

    // Resolve shot result after flight time (650ms)
    setTimeout(() => {
      if (isGoal) {
        const pointsAwarded = superShotActive ? 200 : 100;
        const newScore = score + pointsAwarded;
        setScore(newScore);
        const newStreak = streak + 1;
        setStreak(newStreak);

        if (newScore > highScore) {
          setHighScore(newScore);
          try {
            localStorage.setItem('trang-toan:penalty-best', String(newScore));
          } catch {}
        }

        playMiniGameSound('goal');
        setResultBanner({
          text: superShotActive ? '🔥 SIÊU PHẨM SẤM SÉT! VÀOOOO! ⚽' : 'VÀOOOOOO! ⚽🎉',
          sub: superShotActive ? '+200 ĐIỂM BÓNG VÀNG!' : '+100 ĐIỂM SÚT PHẠT ĐỈNH CAO!',
          type: 'goal',
        });

        setKickResults((prev) => {
          const next = [...prev];
          next[kickIndex] = 'goal';
          return next;
        });
      } else {
        setStreak(0);
        playMiniGameSound('hit');
        setResultBanner({
          text: 'THỦ MÔN CẢN PHÁ! 🧤',
          sub: 'Cú sút rất hiểm nhưng thủ môn đã xuất sắc bay người!',
          type: 'miss',
        });

        setKickResults((prev) => {
          const next = [...prev];
          next[kickIndex] = 'saved';
          return next;
        });
      }

      // Reset for next kick or end round after delay
      setTimeout(() => {
        setResultBanner(null);
        setSuperShotActive(false);
        setCurrentMath(generateMathBoost());
        setSelectedTarget(null);

        if (kickIndex + 1 >= 5) {
          // Finished 5 kicks!
          setRoundEnded(true);
          setIsKicking(false);
        } else {
          // Next kick
          setKickIndex((prev) => prev + 1);
          setKeeperPos('center');
          setKeeperDiving(false);
          setBallStyle({ x: 50, y: 84, scale: 1, rotate: 0 });
          setIsKicking(false);
        }
      }, 1600);
    }, 650);
  }, [isKickingRef, roundEnded, superShotActive, kickIndex, score, streak, highScore]);

  // Next round reset
  const startNextRound = () => {
    setRoundNumber((r) => r + 1);
    setKickIndex(0);
    setKickResults(['pending', 'pending', 'pending', 'pending', 'pending']);
    setRoundEnded(false);
    setResultBanner(null);
    setSuperShotActive(false);
    setCurrentMath(generateMathBoost());
    setKeeperPos('center');
    setKeeperDiving(false);
    setBallStyle({ x: 50, y: 84, scale: 1, rotate: 0 });
    setIsKicking(false);
  };

  // Keyboard controls: 1-5 or arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isKickingRef.current || roundEnded) return;

      if (e.key === '1' || e.code === 'Numpad1') {
        shootAtTarget('top-left');
      } else if (e.key === '2' || e.code === 'Numpad2') {
        shootAtTarget('center-high');
      } else if (e.key === '3' || e.code === 'Numpad3') {
        shootAtTarget('top-right');
      } else if (e.key === '4' || e.code === 'Numpad4') {
        shootAtTarget('bottom-left');
      } else if (e.key === '5' || e.code === 'Numpad5') {
        shootAtTarget('bottom-right');
      } else if (e.key === 'ArrowUp') {
        shootAtTarget('center-high');
      } else if (e.key === 'ArrowLeft') {
        shootAtTarget('bottom-left');
      } else if (e.key === 'ArrowRight') {
        shootAtTarget('bottom-right');
      } else if (e.key === ' ' || e.key === 'Enter') {
        // Shoot at center or random corner
        shootAtTarget('center-high');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shootAtTarget, roundEnded]);

  const goalsCount = kickResults.filter((r) => r === 'goal').length;

  return (
    <div className="penalty-game-container relative mx-auto flex flex-col items-center max-w-2xl px-2">
      {/* Top Header & Scoreboard */}
      <div className="w-full mb-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 text-white p-3.5 rounded-2xl border border-slate-700/80 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚽</span>
          <div>
            <h3 className="text-base sm:text-lg font-black tracking-wide text-emerald-400">
              ĐÁ PENALTY SIÊU CÚP
            </h3>
            <span className="text-xs text-slate-300 font-semibold">
              Hiệp {roundNumber} • Lượt {Math.min(5, kickIndex + 1)}/5
            </span>
          </div>
        </div>

        {/* 5-kick indicator */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          {kickResults.map((res, i) => (
            <span
              key={i}
              className={`text-lg transition-transform ${
                i === kickIndex && !roundEnded ? 'scale-125 animate-pulse' : ''
              }`}
              title={`Lượt ${i + 1}: ${res === 'goal' ? 'VÀO' : res === 'saved' ? 'HỎNG' : 'Chưa sút'}`}
            >
              {res === 'goal' ? '🟢' : res === 'saved' ? '🔴' : '⚪'}
            </span>
          ))}
        </div>

        {/* Scores */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Bàn thắng</div>
            <div className="text-base font-black text-amber-400">{goalsCount}/5</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-bold uppercase">Tổng điểm</div>
            <div className="text-lg font-black text-cyan-400">{score}</div>
          </div>
        </div>
      </div>

      {/* Super-Shot Math Boost Bar (Optional Boost for Kids) */}
      {!roundEnded && currentMath && (
        <div className="w-full mb-3 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border border-amber-400/40 backdrop-blur-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-bounce">⚡</span>
            <div>
              <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-300">
                {superShotActive ? '🔥 BÓNG VÀNG SẤM SÉT ĐÃ SẴN SÀNG! (100% VÀO LƯỚI +200Đ)' : 'Trợ lực sút sấm sét: Nhẩm tính nhanh để kích hoạt Bóng Vàng!'}
              </span>
              {!superShotActive && (
                <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Câu hỏi: <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{currentMath.question}</span>
                </div>
              )}
            </div>
          </div>

          {!superShotActive && (
            <div className="flex items-center gap-1.5 ml-auto">
              {currentMath.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswerMath(opt)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-black text-sm border border-slate-300 dark:border-slate-700 hover:bg-amber-400 hover:text-slate-950 transition-all active:scale-95 shadow-xs"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {superShotActive && (
            <div className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-xl animate-pulse">
              ⚡ SÚT NGAY!
            </div>
          )}
        </div>
      )}

      {/* STADIUM PITCH ARENA */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] max-w-[580px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 select-none bg-gradient-to-b from-sky-900 via-emerald-900 to-green-800">
        {/* Stadium Lights & Crowd */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-slate-950 via-slate-900/80 to-transparent flex items-start justify-between px-6 pt-2 pointer-events-none z-10">
          <div className="flex gap-2">
            <span className="text-amber-300 text-xs font-black animate-pulse">💡 💡 💡</span>
            <span className="text-[11px] text-slate-300 font-extrabold tracking-widest hidden sm:inline">
              VIỆT NAM VÔ ĐỊCH 🇻🇳
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-[11px] text-slate-300 font-extrabold tracking-widest hidden sm:inline">
              CHUNG KẾT 11M 🏆
            </span>
            <span className="text-amber-300 text-xs font-black animate-pulse">💡 💡 💡</span>
          </div>
        </div>

        {/* Grass Field with stripes */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-800 via-green-700 to-emerald-600 flex flex-col justify-end">
          <div className="w-full h-1/2 bg-[repeating-linear-gradient(0deg,#15803d,#15803d_24px,#16a34a_24px,#16a34a_48px)] opacity-40 pointer-events-none" />
        </div>

        {/* Penalty Area Lines */}
        <div className="absolute inset-x-12 bottom-0 top-16 border-x-4 border-white/40 pointer-events-none" />
        <div className="absolute inset-x-24 bottom-0 top-32 border-x-4 border-t-4 border-white/50 pointer-events-none rounded-t-lg" />
        
        {/* Penalty Spot (chấm 11m) */}
        <div className="absolute left-1/2 bottom-[14%] -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none z-10" />

        {/* GOALPOST & NET (Khung thành) */}
        <div className="absolute left-[16%] right-[16%] top-[14%] h-[42%] z-10 pointer-events-none">
          {/* Goal Frame Box */}
          <div className="relative w-full h-full border-t-8 border-x-8 border-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.5)] rounded-t-sm">
            {/* Hexagon Goal Net Pattern */}
            <div
              className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:10px_10px] opacity-25"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
              }}
            />

            {/* Depth posts (inner 3D goal structure) */}
            <div className="absolute inset-x-3 top-2 bottom-0 border-t-2 border-x-2 border-white/20 pointer-events-none" />
          </div>
        </div>

        {/* 5 INTERACTIVE TARGET ZONES (Over the Goal) */}
        <div className="absolute left-[16%] right-[16%] top-[14%] h-[42%] z-20">
          {TARGET_ZONES.map((zone) => {
            const isTargeted = selectedTarget === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => shootAtTarget(zone.id)}
                disabled={isKicking || roundEnded}
                style={{
                  left: `${zone.xPct}%`,
                  top: `${zone.yPct}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                  isTargeted
                    ? 'scale-125 bg-amber-400 text-slate-950 ring-4 ring-amber-300 shadow-xl'
                    : 'bg-white/20 hover:bg-white/40 text-white ring-2 ring-white/50 hover:scale-110 active:scale-95 shadow-md backdrop-blur-xs'
                }`}
                title={`Sút vào ${zone.name} (Phím ${zone.shortKey})`}
              >
                <span className="text-base sm:text-lg">{zone.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-tight">{zone.shortKey}</span>
              </button>
            );
          })}
        </div>

        {/* GOALKEEPER (Thủ môn chú Gấu / Cầu thủ) */}
        <div
          className={`absolute z-15 pointer-events-none transition-all duration-500 ease-out flex flex-col items-center ${
            keeperDiving ? 'scale-110' : 'animate-bounce'
          }`}
          style={{
            top:
              keeperPos === 'left-high' || keeperPos === 'right-high'
                ? '17%'
                : keeperPos === 'left-low' || keeperPos === 'right-low'
                ? '32%'
                : '27%',
            left:
              keeperPos === 'left-high' || keeperPos === 'left-low'
                ? '24%'
                : keeperPos === 'right-high' || keeperPos === 'right-low'
                ? '76%'
                : '50%',
            transform: `translate(-50%, -50%) rotate(${
              keeperPos === 'left-high'
                ? '-35deg'
                : keeperPos === 'right-high'
                ? '35deg'
                : keeperPos === 'left-low'
                ? '-65deg'
                : keeperPos === 'right-low'
                ? '65deg'
                : '0deg'
            })`,
          }}
        >
          {/* Goalkeeper Avatar */}
          <div className="relative flex flex-col items-center">
            {/* Extended Gloves when diving */}
            <div className="flex items-center gap-6 -mb-2">
              <span className="text-xl filter drop-shadow">🧤</span>
              <span className="text-xl filter drop-shadow">🧤</span>
            </div>
            {/* Goalie Bear Head */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-700 border-2 border-amber-900 flex items-center justify-center text-2xl shadow-md">
              🐻
            </div>
            {/* Goalie Jersey */}
            <div className="w-10 h-7 rounded-md bg-yellow-400 border border-yellow-600 flex items-center justify-center text-[10px] font-black text-slate-900 shadow-xs">
              1
            </div>
          </div>
        </div>

        {/* SOCCER BALL (Quả bóng) */}
        <div
          className="absolute z-25 pointer-events-none transition-all duration-[620ms] ease-out"
          style={{
            left: `${ballStyle.x}%`,
            top: `${ballStyle.y}%`,
            transform: `translate(-50%, -50%) scale(${ballStyle.scale}) rotate(${ballStyle.rotate}deg)`,
          }}
        >
          {superShotActive ? (
            <div className="relative">
              <span className="text-5xl sm:text-6xl filter drop-shadow-[0_0_16px_rgba(251,191,36,1)]">
                ⚽
              </span>
              <span className="absolute -inset-2 rounded-full border-2 border-amber-300 animate-ping opacity-75" />
            </div>
          ) : (
            <span className="text-5xl sm:text-6xl filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
              ⚽
            </span>
          )}
        </div>

        {/* Goal Net / Ripple Celebration Effect */}
        {resultBanner && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in p-4 text-center">
            <div
              className={`px-6 py-4 rounded-3xl shadow-2xl border-2 transform scale-105 animate-bounce ${
                resultBanner.type === 'goal'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-300 text-white'
                  : 'bg-gradient-to-r from-rose-600 to-amber-700 border-rose-300 text-white'
              }`}
            >
              <h2 className="text-2xl sm:text-3xl font-black tracking-wide drop-shadow-md">
                {resultBanner.text}
              </h2>
              <p className="mt-1 text-sm sm:text-base font-extrabold text-amber-200">
                {resultBanner.sub}
              </p>
            </div>
          </div>
        )}

        {/* ROUND VICTORY / SUMMARY MODAL */}
        {roundEnded && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center animate-fade-in">
            <span className="text-6xl mb-2">
              {goalsCount >= 4 ? '🏆' : goalsCount >= 3 ? '🥇' : '🥈'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {goalsCount === 5
                ? 'VÔ ĐỊCH TUYỆT ĐỐI! 5/5 BÀN THẮNG!'
                : goalsCount >= 4
                ? 'SIÊU TIỀN ĐẠO XUẤT SẮC!'
                : goalsCount >= 3
                ? 'CHIẾN THẮNG KỊCH TÍNH!'
                : 'CỐ GẮNG THÊM MỘT CHÚT!'}
            </h2>
            <p className="mt-2 text-slate-300 text-sm max-w-sm">
              Bé đã ghi được <strong className="text-amber-400 font-black text-lg">{goalsCount}/5</strong> bàn thắng trong hiệp đấu này. Tổng điểm tích lũy: <strong className="text-emerald-400 font-black text-lg">{score}</strong>!
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={startNextRound}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
              >
                Đá hiệp tiếp theo 🏆
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base rounded-2xl border border-slate-700 active:scale-95 transition-all"
                >
                  Rời sân cỏ
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM QUICK TARGET BUTTONS (for touch screens and convenience) */}
      <div className="w-full mt-3 flex flex-wrap items-center justify-center gap-2">
        {TARGET_ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => shootAtTarget(zone.id)}
            disabled={isKicking || roundEnded}
            className="flex-1 min-w-[90px] py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <span>{zone.icon}</span>
            <span>{zone.name}</span>
          </button>
        ))}
      </div>

      {/* Guide hint */}
      <p className="mt-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        💡 <strong>Cách chơi:</strong> Chạm trực tiếp vào các ô tiêu điểm trên khung thành hoặc bấm phím số <strong>1 đến 5</strong> (hoặc các phím Mũi tên). Nhẩm tính câu đố nhanh để kích hoạt <strong>Bóng Vàng Sấm Sét ⚡</strong> nhân đôi điểm số!
      </p>
    </div>
  );
};
export default PenaltyKickGame;
