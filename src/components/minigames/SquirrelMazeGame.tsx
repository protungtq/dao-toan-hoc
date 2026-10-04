import React, { useState, useEffect, useCallback } from 'react';
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

  const resetAll = useCallback(() => {
    playMiniGameSound('step');
    setLevel(1);
    setScore(0);
    onScore?.(0);
    setIsGameOver(false);
    setIsPaused(false);
    generateMaze();
  }, [generateMaze, onScore]);

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
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  useEffect(() => {
    if (isGameOver || isPaused || levelWon) return;

    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          playMiniGameSound('miss');
          setIsGameOver(true);
          onFinish?.(score);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, isPaused, levelWon, score, onFinish]);

  const nextLevel = () => {
    playMiniGameSound('step');
    setLevel((lvl) => lvl + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 max-w-xl mx-auto w-full select-none text-slate-800 dark:text-slate-100">
      {/* HUD Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">MÀN CHƠI</div>
            <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">Tầng {level}</div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">ĐIỂM TỔNG</div>
            <div className="text-2xl font-black font-mono text-amber-500 dark:text-amber-400 tabular-nums">{score}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
          <svg className={`w-4 h-4 ${secondsLeft < 10 ? 'text-rose-500 animate-spin' : 'text-emerald-500 dark:text-emerald-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={secondsLeft < 10 ? 'text-rose-600 dark:text-rose-400 font-black' : ''}>{secondsLeft}s</span>
        </div>
      </div>

      {/* Maze Board */}
      <div className="relative bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 sm:p-4 shadow-xl">
        <div
          className="grid gap-1 w-[300px] sm:w-[360px] md:w-[380px] h-[300px] sm:h-[360px] md:h-[380px] bg-emerald-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-emerald-100 dark:border-slate-800"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {maze.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = playerPos.r === r && playerPos.c === c;
              const isGoal = goalPos.r === r && goalPos.c === c;
              const hasAcorn = acorns.some((a) => a.r === r && a.c === c);

              let bg = 'bg-white/60 dark:bg-slate-900/40';
              if (cell === 1) bg = 'bg-emerald-600 dark:bg-emerald-800/80 border border-emerald-500 dark:border-emerald-700/60 rounded-xs shadow-2xs';

              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex items-center justify-center text-xs sm:text-sm select-none transition-all ${bg}`}
                >
                  {isPlayer ? (
                    <span className="text-base sm:text-lg animate-bounce drop-shadow-sm">🐿️</span>
                  ) : isGoal ? (
                    <span className="text-base sm:text-lg animate-pulse drop-shadow-sm">🏡</span>
                  ) : hasAcorn ? (
                    <span className="text-xs drop-shadow-xs">🌰</span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {levelWon && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center rounded-3xl animate-fade-in z-20">
            <span className="text-5xl mb-2">🎉</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">VỀ NHÀ AN TOÀN!</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5">
              Sóc đã về đến tổ ấm trước khi trời tối! Điểm hiện tại: <span className="text-emerald-600 dark:text-emerald-400 font-black">{score}</span>
            </p>
            <button
              type="button"
              onClick={nextLevel}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl active:scale-95 shadow-lg shadow-emerald-600/30 transition-all"
            >
              Tiếp tục Màn {level + 1}
            </button>
          </div>
        )}

        {isGameOver && (
          <div className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center rounded-3xl animate-fade-in z-20">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">HẾT GIỜ!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
              Điểm đạt được: <span className="font-mono text-amber-500 dark:text-amber-400 font-black text-xl">{score}</span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-600/30 transition-all"
              >
                Chơi lại
              </button>
              {onExit && (
                <button
                  type="button"
                  onClick={onExit}
                  className="px-5 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Thoát
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* D-Pad */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-44">
        <div />
        <button
          type="button"
          onClick={() => movePlayer(-1, 0)}
          className="p-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-all"
          aria-label="Lên"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
        </button>
        <div />

        <button
          type="button"
          onClick={() => movePlayer(0, -1)}
          className="p-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-all"
          aria-label="Trái"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <button
          type="button"
          onClick={() => movePlayer(1, 0)}
          className="p-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-all"
          aria-label="Xuống"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
        </button>
        <button
          type="button"
          onClick={() => movePlayer(0, 1)}
          className="p-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-all"
          aria-label="Phải"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </div>
  );
};