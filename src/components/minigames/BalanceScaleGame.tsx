import { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface Puzzle {
  targetWeight: number;
  objectName: string;
  objectIcon: string;
  allowedWeights: number[];
}

const PUZZLES: Puzzle[] = [
  { targetWeight: 7, objectName: 'Giỏ hạt dẻ của Sóc', objectIcon: '🌰', allowedWeights: [1, 2, 3, 5] },
  { targetWeight: 12, objectName: 'Hũ mật ong của Gấu', objectIcon: '🍯', allowedWeights: [1, 2, 5, 10] },
  { targetWeight: 16, objectName: 'Giỏ nấm linh chi rừng', objectIcon: '🍄', allowedWeights: [1, 3, 5, 10] },
  { targetWeight: 18, objectName: 'Giỏ dâu tây rừng', objectIcon: '🍓', allowedWeights: [2, 3, 5, 10] },
  { targetWeight: 25, objectName: 'Thùng táo đỏ', objectIcon: '🍎', allowedWeights: [2, 5, 10, 20] },
  { targetWeight: 30, objectName: 'Bó củi sưởi ấm mùa đông', objectIcon: '🪵', allowedWeights: [2, 5, 10, 20] },
  { targetWeight: 34, objectName: 'Hộp dụng cụ toán học', objectIcon: '📐', allowedWeights: [1, 2, 5, 10, 20] },
  { targetWeight: 45, objectName: 'Rương kho báu vàng', objectIcon: '👑', allowedWeights: [5, 10, 20, 25] },
  { targetWeight: 55, objectName: 'Bao lúa mì vàng', objectIcon: '🌾', allowedWeights: [5, 10, 20, 50] },
  { targetWeight: 60, objectName: 'Tảng đá thạch anh tím', objectIcon: '💎', allowedWeights: [5, 10, 20, 50] },
  { targetWeight: 75, objectName: 'Chuông đồng cổ kính', objectIcon: '🔔', allowedWeights: [10, 15, 25, 50] },
  { targetWeight: 90, objectName: 'Tượng gấu vàng danh dự', objectIcon: '🏆', allowedWeights: [10, 20, 30, 50] },
];

export function BalanceScaleGame({ onScore, onFinish }: Props) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedWeights, setSelectedWeights] = useState<number[]>([]);
  const [isBalanced, setIsBalanced] = useState(false);
  const [streak, setStreak] = useState(0);

  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const streakRef = useRef(streak);
  streakRef.current = streak;

  const puzzle = PUZZLES[puzzleIndex % PUZZLES.length];
  const currentRightWeight = selectedWeights.reduce((a, b) => a + b, 0);
  const diff = currentRightWeight - puzzle.targetWeight;

  // Tính góc nghiêng cán cân (-16 đến +16 độ)
  const tiltAngle = Math.max(-16, Math.min(16, diff * 1.8));

  // Chuyển sang câu đố kế tiếp
  const goToNextPuzzle = useCallback(() => {
    if (nextTimerRef.current) {
      clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
    setIsBalanced(false);
    setSelectedWeights([]);
    setPuzzleIndex((prev) => prev + 1);
    playMiniGameSound('step');
  }, []);

  // Kiểm tra khi vừa đạt thăng bằng
  useEffect(() => {
    if (diff === 0 && selectedWeights.length > 0 && !isBalanced) {
      setIsBalanced(true);
      playMiniGameSound('success');
      const addedPoints = 15 + streakRef.current * 3;
      setScore((s) => {
        const ns = s + addedPoints;
        onScore?.(ns);
        return ns;
      });
      setStreak((st) => st + 1);

      // Tự động chuyển câu đố sau 1.5s
      nextTimerRef.current = setTimeout(() => {
        goToNextPuzzle();
      }, 1500);
    }
  }, [diff, selectedWeights.length, isBalanced, onScore, goToNextPuzzle]);

  // Dọn dẹp timer khi unmount
  useEffect(() => {
    return () => {
      if (nextTimerRef.current) {
        clearTimeout(nextTimerRef.current);
      }
    };
  }, []);

  // Thêm quả cân vào đĩa phải
  const addWeight = (w: number) => {
    if (isBalanced) return;
    playMiniGameSound('step');
    setSelectedWeights((prev) => [...prev, w]);
  };

  // Bỏ bớt quả cân ra khỏi đĩa phải
  const removeWeight = (indexToRemove: number) => {
    if (isBalanced) return;
    playMiniGameSound('step');
    setSelectedWeights((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Bắt phím số
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBalanced) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          goToNextPuzzle();
        }
        return;
      }

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= puzzle.allowedWeights.length) {
        e.preventDefault();
        addWeight(puzzle.allowedWeights[num - 1]);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        if (selectedWeights.length > 0) {
          removeWeight(selectedWeights.length - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [puzzle, selectedWeights, isBalanced, goToNextPuzzle]);

  return (
    <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-sky-950 to-slate-950 p-4 sm:p-6 shadow-2xl dark:border-slate-800 text-white select-none">
      {/* Header trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-800/80 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚖️</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-300">Cân Thăng Bằng Khối Lượng</h3>
            <p className="text-xs text-sky-300">Chọn các quả cân bên phải sao cho hai bên thăng bằng!</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm font-bold">
          <div className="rounded-xl bg-sky-900/90 border border-sky-700/80 px-3 py-1 font-mono text-amber-300">
            ⭐ {score} điểm
          </div>
          {streak > 1 && (
            <div className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-0.5 text-xs font-black text-white animate-pulse">
              🔥 Chuỗi x{streak}
            </div>
          )}
        </div>
      </div>

      {/* Nhiệm vụ cân nặng */}
      <div className="my-3 rounded-2xl border-2 border-sky-500/60 bg-sky-900/40 p-3 text-center">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-black uppercase tracking-wider text-sky-400">
            Màn #{puzzleIndex + 1} / {PUZZLES.length}
          </span>
          {isBalanced && (
            <span className="text-xs font-black text-emerald-400 animate-bounce">
              🎉 Đúng rồi! Đang chuẩn bị màn tiếp theo...
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-center gap-3">
          <span className="text-3xl">{puzzle.objectIcon}</span>
          <span className="text-lg sm:text-xl font-black text-white">{puzzle.objectName}</span>
          <span className="rounded-xl bg-amber-400 px-3 py-0.5 font-mono text-lg sm:text-xl font-black text-slate-950 shadow-md">
            {puzzle.targetWeight} kg
          </span>
        </div>
      </div>

      {/* Mô hình chiếc Cân đĩa trực quan (Scale Visual Area) */}
      <div className="relative mx-auto mt-4 h-64 sm:h-72 w-full max-w-lg overflow-hidden rounded-2xl border border-sky-800 bg-slate-900/80 p-4 shadow-inner flex flex-col items-center justify-between">
        {/* Kim chỉ thăng bằng ở giữa đỉnh cân */}
        <div className="flex flex-col items-center z-10">
          <div
            className={`h-6 w-1.5 rounded-full transition-all duration-300 ${
              isBalanced ? 'bg-emerald-400 shadow-[0_0_14px_#34d399]' : 'bg-rose-500'
            }`}
          />
          <div
            className={`mt-1 rounded-full border px-3 py-0.5 text-[11px] font-black uppercase transition-all ${
              isBalanced
                ? 'border-emerald-400 bg-emerald-950 text-emerald-300 scale-105 shadow-md shadow-emerald-500/20'
                : 'border-sky-600 bg-sky-950 text-sky-300'
            }`}
          >
            {isBalanced ? 'ĐÃ CÂN BẰNG! 🎉' : diff < 0 ? '👈 Bên Trái Nặng Hơn' : diff > 0 ? '👉 Bên Phải Nặng Hơn' : 'Đang Cân Bằng'}
          </div>
        </div>

        {/* Thanh đòn cân xoay theo góc tiltAngle */}
        <div className="relative w-full flex justify-center items-center my-auto">
          {/* Trục tâm đỡ đòn cân */}
          <div className="absolute h-24 w-4 bg-gradient-to-b from-amber-600 to-amber-800 rounded-b-md shadow-md z-0" />
          <div className="absolute h-7 w-7 rounded-full bg-amber-400 border-2 border-amber-200 shadow-md z-10" />

          {/* Cán cân xoay */}
          <div
            className="relative w-full h-3 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full shadow-lg transition-transform duration-300 ease-out z-0 flex justify-between items-center px-4"
            style={{ transform: `rotate(${tiltAngle}deg)` }}
          >
            {/* Đĩa cân TRÁI (Vật phẩm) */}
            <div
              className="relative transition-transform duration-300"
              style={{ transform: `rotate(${-tiltAngle}deg)` }}
            >
              <div className="flex flex-col items-center -mt-2">
                <div className="w-1 h-12 bg-amber-200/80 mx-auto" />
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-slate-800 to-slate-900 px-3 py-2 shadow-xl min-w-[100px]">
                  <span className="text-3xl">{puzzle.objectIcon}</span>
                  <span className="font-mono text-xs font-black text-amber-300 mt-1">
                    {puzzle.targetWeight} kg
                  </span>
                </div>
              </div>
            </div>

            {/* Đĩa cân PHẢI (Quả cân của bé) */}
            <div
              className="relative transition-transform duration-300"
              style={{ transform: `rotate(${-tiltAngle}deg)` }}
            >
              <div className="flex flex-col items-center -mt-2">
                <div className="w-1 h-12 bg-amber-200/80 mx-auto" />
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-slate-800 to-slate-900 px-3 py-2 shadow-xl min-w-[100px] min-h-[70px]">
                  {selectedWeights.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Đĩa trống</span>
                  ) : (
                    <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">
                      {selectedWeights.map((w, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => removeWeight(idx)}
                          disabled={isBalanced}
                          title="Bấm để gỡ quả cân này"
                          className="rounded-lg bg-amber-500 hover:bg-rose-500 px-1.5 py-0.5 font-mono text-xs font-black text-slate-950 hover:text-white transition shadow-xs disabled:cursor-not-allowed"
                        >
                          {w}kg ✕
                        </button>
                      ))}
                    </div>
                  )}
                  <span
                    className={`font-mono text-xs font-black mt-1 ${
                      isBalanced ? 'text-emerald-400 font-extrabold' : 'text-sky-300'
                    }`}
                  >
                    Tổng: {currentRightWeight} kg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chân đế cân */}
        <div className="w-24 h-4 bg-amber-800 rounded-t-xl border-t border-amber-400" />
      </div>

      {/* Thông báo và Nút bấm chuyển màn trực tiếp khi đã cân bằng */}
      {isBalanced && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={goToNextPuzzle}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-6 py-2.5 font-black text-white text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition cursor-pointer animate-pulse"
          >
            <span>▶ Tiếp tục sang màn tiếp theo</span>
            <span className="text-xs bg-emerald-700/60 px-2 py-0.5 rounded-full">Enter ↵</span>
          </button>
        </div>
      )}

      {/* Kho quả cân để bé chọn thả vào */}
      {!isBalanced && (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-wider text-sky-400 text-center mb-2">
            Bấm quả cân để đặt lên đĩa bên phải:
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {puzzle.allowedWeights.map((w, idx) => (
              <button
                key={w}
                type="button"
                onClick={() => addWeight(w)}
                className="group flex flex-col items-center justify-center rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-400 to-amber-600 px-4 py-2.5 text-slate-950 font-black shadow-lg hover:from-amber-300 hover:to-amber-500 active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-xs opacity-75">#{idx + 1}</span>
                <span className="text-base sm:text-lg font-black">{w} kg</span>
              </button>
            ))}
          </div>

          {selectedWeights.length > 0 && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedWeights([]);
                  playMiniGameSound('step');
                }}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-rose-300 transition cursor-pointer"
              >
                🗑️ Xóa toàn bộ quả cân trên đĩa
              </button>
            </div>
          )}
        </div>
      )}

      {/* Điều khiển TV / Bàn phím / Cảm ứng */}
      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-sky-400/80 border-t border-sky-900 pt-3">
        <span>🎮 TV / Bàn phím: Bấm phím 1–{puzzle.allowedWeights.length} để thêm quả cân</span>
        <span>📱 Cảm ứng: Chạm vào quả cân trên đĩa để gỡ bỏ</span>
      </div>
    </div>
  );
}
