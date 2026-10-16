import { useState, useEffect, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

interface Point {
  r: number;
  c: number;
}

const ROWS = 13;
const COLS = 13;

export const SquirrelMazeGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [levelWon, setLevelWon] = useState<boolean>(false);

  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState<Point>({ r: 1, c: 1 });
  const [goalPos, setGoalPos] = useState<Point>({ r: ROWS - 2, c: COLS - 2 });
  const [acorns, setAcorns] = useState<Point[]>([]);

  const scoreRef = useRef(score);
  scoreRef.current = score;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const generateMaze = useCallback(() => {
    const grid: number[][] = Array(ROWS)
      .fill(0)
      .map(() => Array(COLS).fill(1));

    const stack: [number, number][] = [];
    grid[1][1] = 0;
    stack.push([1, 1]);

    const dirs = [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2]
    ];

    while (stack.length > 0) {
      const [cr, cc] = stack[stack.length - 1];
      const neighbors: [number, number, number, number][] = [];

      for (const [dr, dc] of dirs) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && grid[nr][nc] === 1) {
          neighbors.push([nr, nc, cr + dr / 2, cc + dc / 2]);
        }
      }

      if (neighbors.length > 0) {
        const [nr, nc, mr, mc] = neighbors[Math.floor(Math.random() * neighbors.length)];
        grid[mr][mc] = 0;
        grid[nr][nc] = 0;
        stack.push([nr, nc]);
      } else {
        stack.pop();
      }
    }

    grid[ROWS - 2][COLS - 2] = 0;
    grid[ROWS - 2][COLS - 3] = 0;

    const acornList: Point[] = [];
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        if (grid[r][c] === 0 && !(r === 1 && c === 1) && !(r === ROWS - 2 && c === COLS - 2)) {
          if (Math.random() < 0.22) {
            acornList.push({ r, c });
          }
        }
      }
    }

    setMaze(grid);
    setPlayerPos({ r: 1, c: 1 });
    setGoalPos({ r: ROWS - 2, c: COLS - 2 });
    setAcorns(acornList);
    setSecondsLeft(Math.max(35, 65 - level * 5));
    setLevelWon(false);
  }, [level]);

  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  useEffect(() => {
    if (isGameOver || isPaused || levelWon) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIsGameOver(true);
          playMiniGameSound('gameover');
          onFinishRef.current?.(scoreRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, isPaused, levelWon]);

  const movePlayer = useCallback(
    (dr: number, dc: number) => {
      if (isGameOver || isPaused || levelWon) return;

      const nr = playerPos.r + dr;
      const nc = playerPos.c + dc;

      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
      if (maze[nr] && maze[nr][nc] === 1) return;

      playMiniGameSound('step');
      setPlayerPos({ r: nr, c: nc });

      const acornIdx = acorns.findIndex((a) => a.r === nr && a.c === nc);
      if (acornIdx !== -1) {
        playMiniGameSound('collect');
        setScore((s) => {
          const nextScore = s + 15;
          onScore?.(nextScore);
          return nextScore;
        });
        setAcorns((list) => list.filter((_, i) => i !== acornIdx));
      }

      if (nr === goalPos.r && nc === goalPos.c) {
        playMiniGameSound('success');
        const timeBonus = secondsLeft * 5;
        const totalEarned = 100 + timeBonus;
        setScore((s) => {
          const nextScore = s + totalEarned;
          onScore?.(nextScore);
          return nextScore;
        });
        setLevelWon(true);
      }
    },
    [playerPos, maze, acorns, goalPos, secondsLeft, isGameOver, isPaused, levelWon, onScore]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        movePlayer(1, 0);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        movePlayer(0, 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-gradient-to-br from-amber-700 via-orange-800 to-amber-950 p-6 sm:p-8 text-white shadow-2xl border border-amber-500/40">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black flex items-center gap-2">
            <span>🌰</span>
            <span>Sóc Vượt Mê Cung Pro</span>
          </h3>
          <p className="text-xs sm:text-sm text-amber-200">Dẫn đường cho Sóc 🐿️ ăn hạt dẻ và tìm về nhà 🏡!</p>
        </div>
        <div className="text-right bg-black/50 px-4 py-2 rounded-2xl border border-white/20">
          <div className="text-[11px] uppercase font-bold text-amber-300">⏱️ {secondsLeft}s · Màn {level}</div>
          <div className="text-2xl font-black text-amber-400">{score} đ</div>
        </div>
      </div>

      <div className="relative flex flex-col items-center bg-amber-950/90 rounded-3xl p-6 border-2 border-amber-500/40 shadow-inner">
        {/* Maze Grid */}
        <div
          className="grid gap-1 bg-amber-900/40 p-3 rounded-2xl border border-amber-600/50 shadow-inner"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {maze.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = playerPos.r === r && playerPos.c === c;
              const isGoal = goalPos.r === r && goalPos.c === c;
              const hasAcorn = acorns.some((a) => a.r === r && a.c === c);

              return (
                <div
                  key={`${r}-${c}`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs transition-all ${
                    cell === 1
                      ? 'bg-gradient-to-br from-stone-700 to-stone-900 border border-stone-600 shadow-sm'
                      : 'bg-amber-900/30'
                  }`}
                >
                  {isPlayer && <span className="text-xl animate-bounce filter drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]">🐿️</span>}
                  {isGoal && !isPlayer && <span className="text-xl animate-pulse">🏡</span>}
                  {hasAcorn && !isPlayer && !isGoal && <span className="text-base animate-pulse">🌰</span>}
                </div>
              );
            })
          )}
        </div>

        {/* D-Pad touch controls */}
        <div className="mt-6 grid grid-cols-3 gap-2 w-48">
          <span />
          <button
            type="button"
            onClick={() => movePlayer(-1, 0)}
            className="py-3 bg-amber-600 hover:bg-amber-500 active:scale-95 rounded-2xl font-black text-xl shadow-lg transition cursor-pointer"
          >
            ⬆️
          </button>
          <span />
          <button
            type="button"
            onClick={() => movePlayer(0, -1)}
            className="py-3 bg-amber-600 hover:bg-amber-500 active:scale-95 rounded-2xl font-black text-xl shadow-lg transition cursor-pointer"
          >
            ⬅️
          </button>
          <button
            type="button"
            onClick={() => movePlayer(1, 0)}
            className="py-3 bg-amber-600 hover:bg-amber-500 active:scale-95 rounded-2xl font-black text-xl shadow-lg transition cursor-pointer"
          >
            ⬇️
          </button>
          <button
            type="button"
            onClick={() => movePlayer(0, 1)}
            className="py-3 bg-amber-600 hover:bg-amber-500 active:scale-95 rounded-2xl font-black text-xl shadow-lg transition cursor-pointer"
          >
            ➡️
          </button>
        </div>

        {levelWon && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
            <span className="text-7xl animate-bounce">🏡</span>
            <h4 className="mt-4 text-3xl font-black text-white">Sóc Đã Về Nhà An Toàn!</h4>
            <p className="mt-2 text-base text-amber-200">Tổng điểm tích lũy: <strong className="text-amber-400 text-xl">{score} điểm</strong></p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setLevel(l => l + 1);
                  generateMaze();
                }}
                className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg shadow-xl transition cursor-pointer"
              >
                🚀 Sang Màn Tiếp
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

        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-40">
            <span className="text-7xl animate-bounce">⏰</span>
            <h4 className="mt-4 text-3xl font-black text-white">Hết Thời Gian!</h4>
            <p className="mt-2 text-base text-amber-200">Điểm đạt được: <strong className="text-amber-400 text-xl">{score} điểm</strong></p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setLevel(1);
                  setScore(0);
                  setIsGameOver(false);
                  generateMaze();
                }}
                className="px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-lg shadow-xl transition cursor-pointer"
              >
                🔄 Chơi Lại
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