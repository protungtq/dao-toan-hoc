import { useState, useEffect, useCallback } from 'react';
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
  { targetWeight: 18, objectName: 'Giỏ dâu tây rừng', objectIcon: '🍓', allowedWeights: [2, 3, 5, 10] },
  { targetWeight: 25, objectName: 'Thùng táo đỏ', objectIcon: '🍎', allowedWeights: [2, 5, 10, 20] },
  { targetWeight: 34, objectName: 'Hộp dụng cụ toán học', objectIcon: '📐', allowedWeights: [1, 2, 5, 10, 20] },
  { targetWeight: 45, objectName: 'Rương kho báu vàng', objectIcon: '👑', allowedWeights: [5, 10, 20, 25] },
  { targetWeight: 60, objectName: 'Tảng đá thạch anh tím', objectIcon: '💎', allowedWeights: [5, 10, 20, 50] },
];

export function BalanceScaleGame({ onScore, onFinish, onExit }: Props) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedWeights, setSelectedWeights] = useState<number[]>([]);
  const [isBalanced, setIsBalanced] = useState(false);
  const [streak, setStreak] = useState(0);

  const puzzle = PUZZLES[puzzleIndex % PUZZLES.length];
  const currentRightWeight = selectedWeights.reduce((a, b) => a + b, 0);
  const diff = currentRightWeight - puzzle.targetWeight;

  // Tính góc nghiêng của cán cân (-15 độ đến +15 độ)
  const tiltAngle = Math.max(-16, Math.min(16, diff * 1.8));

  // Kiểm tra trạng thái cân bằng
  useEffect(() => {
    if (diff === 0 && selectedWeights.length > 0 && !isBalanced) {
      setIsBalanced(true);
      playMiniGameSound('success');
      const addedPoints = 15 + streak * 3;
      setScore((s) => {
        const ns = s + addedPoints;
        onScore?.(ns);
        return ns;
      });
      setStreak((st) => st + 1);

      // Tự động chuyển câu đố kế tiếp sau 1.6 giây
      const timer = setTimeout(() => {
        setIsBalanced(false);
        setSelectedWeights([]);
        setPuzzleIndex((prev) => prev + 1);
        playMiniGameSound('step');
      }, 1600);

      return () => clearTimeout(timer);
    }
  }, [diff, selectedWeights, isBalanced, streak, onScore]);

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

  // Bắt phím số để chọn quả cân
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [puzzle, selectedWeights, isBalanced]);

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
            <div className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-0.5 text-xs font-black text-white">
              🔥 Chuỗi x{streak}
            </div>
          )}
        </div>
      </div>

      {/* Nhiệm vụ cân nặng */}
      <div className="my-3 rounded-2xl border-2 border-sky-500/60 bg-sky-900/40 p-3 text-center">
        <span className="text-xs font-black uppercase tracking-wider text-sky-400">
          Câu đố #{puzzleIndex + 1}: Cân bằng vật phẩm
        </span>
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
        <div className="flex flex-col items-center">
          <div className={`h-6 w-1.5 rounded-full transition-all duration-300 ${isBalanced ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-rose-500'}`} />
          <div className="mt-1 rounded-full border border-sky-600 bg-sky-950 px-2.5 py-0.5 text-[11px] font-black uppercase text-sky-300">
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
            {/* Đĩa cân TRÁI */}
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

            {/* Đĩa cân PHẢI */}
            <div
              className="relative transition-transform duration-300"
              style={{ transform: `rotate(${-tiltAngle}deg)` }}
            >
              <div className="flex flex-col items-center -mt-2">
                <div className="w-1 h-12 bg-amber-200/80 mx-auto" />
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-slate-800 to-slate-900 px-3 py-2 shadow-xl min-w-[100px] min-h-[70px]">
                  {/* Danh sách các quả cân bé đã đặt vào */}
                  {selectedWeights.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Đĩa trống</span>
                  ) : (
                    <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">
                      {selectedWeights.map((w, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => removeWeight(idx)}
                          title="Bấm để gỡ quả cân này"
                          className="rounded-lg bg-amber-500 hover:bg-rose-500 px-1.5 py-0.5 font-mono text-xs font-black text-slate-950 hover:text-white transition shadow-xs"
                        >
                          {w}kg ✕
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="font-mono text-xs font-black text-sky-300 mt-1">
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

      {/* Kho quả cân để bé chọn thả vào */}
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
              disabled={isBalanced}
              className="group flex flex-col items-center justify-center rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-400 to-amber-600 px-4 py-2.5 text-slate-950 font-black shadow-lg hover:from-amber-300 hover:to-amber-500 active:scale-95 transition-all disabled:opacity-50"
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
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-rose-300 transition"
            >
              🗑️ Xóa toàn bộ quả cân trên đĩa
            </button>
          </div>
        )}
      </div>

      {/* Điều khiển TV / Thiết bị */}
      <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-sky-400/80 border-t border-sky-900 pt-3">
        <span>🎮 TV / Bàn phím: Bấm phím 1–{puzzle.allowedWeights.length} để thêm quả cân</span>
        <span>📱 Cảm ứng: Chạm vào quả cân trên đĩa để gỡ bỏ</span>
      </div>
    </div>
  );
}
