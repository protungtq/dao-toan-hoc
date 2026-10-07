import { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface MoleHole {
  id: number;
  value: number;
  isCorrect: boolean;
  isBomb?: boolean;
  isWhacked: boolean;
  visible: boolean;
}

interface Mission {
  title: string;
  hint: string;
  check: (n: number) => boolean;
}

const MISSIONS: Mission[] = [
  {
    title: 'Đập các số CHẴN! 🎯',
    hint: 'Số chẵn chia hết cho 2 (kết thúc bằng 0, 2, 4, 6, 8)',
    check: (n) => n % 2 === 0
  },
  {
    title: 'Đập các số LẺ! 🎯',
    hint: 'Số lẻ không chia hết cho 2 (kết thúc bằng 1, 3, 5, 7, 9)',
    check: (n) => n % 2 !== 0
  },
  {
    title: 'Tìm các số chia hết cho 5! 🎯',
    hint: 'Số chia hết cho 5 có chữ số tận cùng là 0 hoặc 5',
    check: (n) => n % 5 === 0
  },
  {
    title: 'Tìm các số LỚN HƠN 40! 🎯',
    hint: 'Đập các số có giá trị > 40',
    check: (n) => n > 40
  },
  {
    title: 'Tìm các số TRÒN CHỤC! 🎯',
    hint: 'Các số tròn chục như 10, 20, 30, 40, 50...',
    check: (n) => n % 10 === 0 && n > 0
  },
  {
    title: 'Tìm bội số của 3! 🎯',
    hint: 'Các số chia hết cho 3 như 3, 6, 9, 12, 15, 18, 21...',
    check: (n) => n % 3 === 0
  }
];

export function WhackMathGame({ onScore, onFinish, onExit }: Props) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [missionIndex, setMissionIndex] = useState(0);
  const [missionSuccessCount, setMissionSuccessCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [holes, setHoles] = useState<MoleHole[]>(() =>
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      value: 0,
      isCorrect: false,
      isWhacked: false,
      visible: false
    }))
  );
  const [whackAnimation, setWhackAnimation] = useState<{ id: number; text: string; good: boolean } | null>(null);

  const mission = MISSIONS[missionIndex];
  const missionRef = useRef(mission);
  missionRef.current = mission;
  const livesRef = useRef(lives);
  livesRef.current = lives;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;

  // Đổi nhiệm vụ sau mỗi 5 câu đúng
  const checkMissionProgression = useCallback((newCount: number) => {
    if (newCount >= 5) {
      setMissionSuccessCount(0);
      setMissionIndex((prev) => (prev + 1) % MISSIONS.length);
      playMiniGameSound('success');
    }
  }, []);

  // Xử lý đập chuột tại ô id (0-8)
  const whack = useCallback((holeId: number) => {
    if (isGameOverRef.current) return;

    setHoles((prev) => {
      const target = prev[holeId];
      if (!target || !target.visible || target.isWhacked) return prev;

      const isHitCorrect = target.isCorrect && !target.isBomb;

      if (isHitCorrect) {
        // Đập trúng chuột hợp lệ!
        playMiniGameSound('collect');
        setScore((s) => {
          const ns = s + 10;
          onScore?.(ns);
          return ns;
        });

        setMissionSuccessCount((cnt) => {
          const next = cnt + 1;
          checkMissionProgression(next);
          return next;
        });

        setWhackAnimation({ id: holeId, text: '+10 ĐÚNG! ⭐', good: true });
      } else {
        // Đập sai hoặc trúng bom!
        playMiniGameSound('miss');
        const remaining = livesRef.current - 1;
        setLives(remaining);

        const reason = target.isBomb ? 'BÙM! Đập trúng bom 💣' : 'Chưa đúng quy tắc! ❌';
        setWhackAnimation({ id: holeId, text: reason, good: false });

        if (remaining <= 0) {
          setIsGameOver(true);
          onFinish?.(scoreRef.current);
        }
      }

      // Đánh dấu đã đập
      return prev.map((h) =>
        h.id === holeId ? { ...h, isWhacked: true, visible: false } : h
      );
    });

    setTimeout(() => setWhackAnimation(null), 800);
  }, [checkMissionProgression, onScore, onFinish]);

  // Bắt phím 1-9 (cho bàn phím và TV Remote D-pad / Numpad)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = parseInt(e.key, 10);
      if (key >= 1 && key <= 9) {
        e.preventDefault();
        whack(key - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [whack]);

  // Vòng lặp xuất hiện chuột chũi ngẫu nhiên
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      if (isGameOverRef.current) return;

      setHoles((prev) => {
        // Chọn 1-3 lỗ ngẫu nhiên chưa hiện chuột
        const inactiveHoles = prev.filter((h) => !h.visible);
        if (inactiveHoles.length === 0) return prev;

        const pickCount = Math.min(inactiveHoles.length, Math.floor(Math.random() * 2) + 1);
        const shuffled = [...inactiveHoles].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, pickCount);

        const updated = prev.map((h) => {
          if (selected.some((s) => s.id === h.id)) {
            // Quyết định số và tính đúng sai
            const isBomb = Math.random() < 0.15; // 15% xác suất xuất hiện bom
            let val = Math.floor(Math.random() * 80) + 1;

            // Đảm bảo có xác suất 50% ra đúng mục tiêu
            const wantCorrect = Math.random() < 0.55;
            if (wantCorrect && !isBomb) {
              // Tìm số đúng theo mission
              for (let test = 1; test <= 90; test++) {
                if (missionRef.current.check(test)) {
                  val = test;
                  break;
                }
              }
            }

            const isCorrect = !isBomb && missionRef.current.check(val);

            return {
              id: h.id,
              value: val,
              isCorrect,
              isBomb,
              isWhacked: false,
              visible: true
            };
          }
          return h;
        });

        return updated;
      });

      // Tự động thụt chuột xuống sau 2.2 giây
      setTimeout(() => {
        if (!isGameOverRef.current) {
          setHoles((prev) =>
            prev.map((h) => (Math.random() < 0.6 ? { ...h, visible: false } : h))
          );
        }
      }, 2000);
    }, 1400);

    return () => clearInterval(interval);
  }, [isGameOver]);

  const restartGame = () => {
    playMiniGameSound('step');
    setScore(0);
    setLives(3);
    setMissionIndex(0);
    setMissionSuccessCount(0);
    setIsGameOver(false);
    setWhackAnimation(null);
    setHoles((prev) => prev.map((h) => ({ ...h, visible: false, isWhacked: false })));
    onScore?.(0);
  };

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-emerald-950/90 p-4 sm:p-6 shadow-2xl dark:border-slate-800 text-white select-none">
      {/* Header trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/80 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐹</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-yellow-300">Chuột Chũi Số Học</h3>
            <p className="text-xs text-emerald-300">Đập nhanh chú chuột mang số đúng mục tiêu!</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-bold">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`text-lg transition-transform ${i < lives ? 'scale-100' : 'opacity-25 grayscale'}`}>
                ❤️
              </span>
            ))}
          </div>

          <div className="rounded-xl bg-emerald-900/90 border border-emerald-700/80 px-3 py-1 font-mono text-amber-300">
            ⭐ {score} điểm
          </div>
        </div>
      </div>

      {/* Nhiệm vụ mục tiêu */}
      <div className="my-3 rounded-2xl border-2 border-yellow-400/80 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900 p-3.5 text-center shadow-lg">
        <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/20 px-3 py-0.5 text-xs font-black uppercase text-yellow-300">
          Nhiệm vụ {missionIndex + 1}/{MISSIONS.length}
        </div>
        <h4 className="mt-1 text-xl sm:text-2xl font-black text-white drop-shadow">
          {mission.title}
        </h4>
        <p className="mt-0.5 text-xs text-emerald-200 font-semibold">{mission.hint}</p>

        {/* Thanh tiến độ màn */}
        <div className="mx-auto mt-2 h-2 max-w-xs overflow-hidden rounded-full bg-emerald-950">
          <div
            className="h-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${(missionSuccessCount / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Lưới 9 hang chuột 3x3 */}
      <div className="relative mx-auto grid max-w-md grid-cols-3 gap-3 sm:gap-4 p-2 sm:p-4 rounded-3xl bg-emerald-900/60 border border-emerald-700/60 shadow-inner">
        {holes.map((hole) => (
          <div
            key={hole.id}
            onClick={() => whack(hole.id)}
            className="group relative flex h-24 sm:h-28 cursor-pointer flex-col items-center justify-end overflow-hidden rounded-2xl border-2 border-emerald-800 bg-amber-950/80 p-1 shadow-lg active:scale-95 transition-all hover:border-yellow-400/80"
          >
            {/* Lỗ hang đất */}
            <div className="absolute inset-x-2 bottom-1 h-6 rounded-full bg-amber-900/90 shadow-inner border border-amber-800" />

            {/* Số phím tắt nhỏ ở góc */}
            <span className="absolute top-1 left-2 font-mono text-[10px] font-black text-emerald-400 opacity-60">
              #{hole.id + 1}
            </span>

            {/* Chú chuột chũi nhảy lên */}
            {hole.visible && (
              <div className="relative z-10 flex flex-col items-center animate-bounce-short transition-all">
                {hole.isBomb ? (
                  <span className="text-3xl sm:text-4xl drop-shadow filter animate-pulse">💣</span>
                ) : (
                  <span className="text-3xl sm:text-4xl drop-shadow filter">🐹</span>
                )}

                {/* Bảng số cầm trên tay */}
                <div
                  className={`mt-0.5 rounded-lg border px-2 py-0.5 font-mono text-sm sm:text-base font-black shadow-md ${
                    hole.isBomb
                      ? 'border-rose-500 bg-rose-600 text-white'
                      : 'border-yellow-300 bg-yellow-400 text-slate-950'
                  }`}
                >
                  {hole.isBomb ? 'BOM!' : hole.value}
                </div>
              </div>
            )}

            {/* Thông báo đập trúng hoặc trật ngay tại ô */}
            {whackAnimation && whackAnimation.id === hole.id && (
              <div
                className={`absolute inset-0 z-20 flex items-center justify-center rounded-2xl p-1 text-center text-xs font-black backdrop-blur-xs animate-pop ${
                  whackAnimation.good
                    ? 'bg-emerald-600/90 text-white'
                    : 'bg-rose-600/90 text-white'
                }`}
              >
                {whackAnimation.text}
              </div>
            )}
          </div>
        ))}

        {/* Màn hình Game Over */}
        {isGameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-3xl bg-slate-950/95 p-6 text-center backdrop-blur-sm animate-fade-in">
            <span className="text-5xl">🏆</span>
            <h4 className="mt-2 text-2xl font-black text-yellow-400">Kết Thúc Lượt Chơi!</h4>
            <p className="mt-1 text-sm text-slate-300">
              Bé đã xuất sắc đập được <strong className="text-yellow-300 text-lg">{score} điểm</strong>!
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={restartGame}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-black text-white shadow-lg hover:from-emerald-400 hover:to-teal-400 active:scale-95 transition"
              >
                🔄 Chơi Lại Màn Mới
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 font-bold text-slate-300 hover:bg-slate-700 transition"
                >
                  ✕ Thoát
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hướng dẫn điều khiển */}
      <div className="mt-4 text-center text-xs text-emerald-300">
        <span>🎮 TV / Bàn phím: Bấm phím 1 đến 9 theo thứ tự từ trên xuống dưới, trái qua phải</span>
        <span className="mx-2">·</span>
        <span>📱 Cảm ứng / Chuột: Chạm trực tiếp vào chú chuột</span>
      </div>
    </div>
  );
}
