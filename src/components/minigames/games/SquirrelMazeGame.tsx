import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Play, Pause, Trophy, Clock, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Award } from 'lucide-react';
import { sound } from '../../utils/audio';

interface Props {
  highScore: number;
  onGameOver: (score: number) => void;
  onExit: () => void;
}

interface Point {
  r: number;
  c: number;
}

const ROWS = 13;
const COLS = 13;

export const SquirrelMazeGame: React.FC<Props> = ({ highScore, onGameOver }) => {
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [levelWon, setLevelWon] = useState<boolean>(false);

  // Maze state: 1 = wall, 0 = path
  const [maze, setMaze] = useState<number[][]>([]);
  const [playerPos, setPlayerPos] = useState<Point>({ r: 1, c: 1 });
  const [goalPos, setGoalPos] = useState<Point>({ r: ROWS - 2, c: COLS - 2 });
  const [acorns, setAcorns] = useState<Point[]>([]);

  // Simple and guaranteed solvable depth-first maze generator
  const generateMaze = useCallback(() => {
    const grid: number[][] = Array(ROWS)
      .fill(0)
      .map(() => Array(COLS).fill(1)); // All walls initially

    // Carver DFS
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

    // Ensure exit is path
    grid[ROWS - 2][COLS - 2] = 0;
    grid[ROWS - 2][COLS - 3] = 0;

    // Distribute acorns on path cells
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
    sound.click();
    setLevel(1);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    generateMaze();
  }, [generateMaze]);

  // Movement logic
  const movePlayer = useCallback(
    (dr: number, dc: number) => {
      if (isGameOver || isPaused || levelWon) return;

      const nr = playerPos.r + dr;
      const nc = playerPos.c + dc;

      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;
      if (maze[nr] && maze[nr][nc] === 1) return; // Wall

      sound.move();
      setPlayerPos({ r: nr, c: nc });

      // Check Acorn pickup
      const acornIdx = acorns.findIndex((a) => a.r === nr && a.c === nc);
      if (acornIdx !== -1) {
        sound.eat();
        setScore((s) => s + 15);
        setAcorns((list) => list.filter((_, i) => i !== acornIdx));
      }

      // Check Goal reached!
      if (nr === goalPos.r && nc === goalPos.c) {
        sound.victory();
        const timeBonus = secondsLeft * 5;
        const totalEarned = 100 + timeBonus;
        setScore((s) => s + totalEarned);
        setLevelWon(true);
      }
    },
    [playerPos, maze, acorns, goalPos, secondsLeft, isGameOver, isPaused, levelWon]
  );

  // Keybindings
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

  // Timer countdown
  useEffect(() => {
    if (isGameOver || isPaused || levelWon) return;

    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          sound.gameOver();
          setIsGameOver(true);
          onGameOver(score);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, isPaused, levelWon, score, onGameOver]);

  const nextLevel = () => {
    sound.click();
    setLevel((lvl) => lvl + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto w-full select-none">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">MÀN CHƠI</div>
            <div className="text-xl font-bold font-mono text-emerald-400">Tầng {level}</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-xs text-slate-400 font-medium">ĐIỂM TỔNG</div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{score}</div>
          </div>
        </div>

        {/* Time Left */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-200">
          <Clock className={`w-4 h-4 ${secondsLeft < 10 ? 'text-red-500 animate-spin' : 'text-emerald-400'}`} />
          <span className={secondsLeft < 10 ? 'text-red-400' : ''}>{secondsLeft}s</span>
        </div>
      </div>

      {/* Maze Grid Container */}
      <div className="relative bg-slate-950 border-2 border-slate-800 rounded-2xl p-2 sm:p-3 shadow-2xl">
        <div
          className="grid gap-1 w-[320px] sm:w-[380px] h-[320px] sm:h-[380px]"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {maze.map((row, r) =>
            row.map((cell, c) => {
              const isPlayer = playerPos.r === r && playerPos.c === c;
              const isGoal = goalPos.r === r && goalPos.c === c;
              const hasAcorn = acorns.some((a) => a.r === r && a.c === c);

              let bg = 'bg-slate-900/40';
              if (cell === 1) bg = 'bg-emerald-950/70 border border-emerald-900/50 rounded-xs'; // Hedge wall

              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex items-center justify-center text-xs sm:text-sm select-none transition-all ${bg}`}
                >
                  {isPlayer ? (
                    <span className="text-base sm:text-lg animate-bounce">🐿️</span>
                  ) : isGoal ? (
                    <span className="text-base sm:text-lg animate-pulse">🏡</span>
                  ) : hasAcorn ? (
                    <span className="text-xs">🌰</span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Level Won Overlay */}
        {levelWon && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center rounded-2xl animate-fade-in">
            <span className="text-4xl mb-2">🎉</span>
            <h3 className="text-2xl font-bold text-white mb-1">VỀ NHÀ AN TOÀN!</h3>
            <p className="text-xs text-slate-300 mb-5">
              Sóc đã về đến tổ ấm trước khi trời tối! Điểm hiện tại: <span className="text-emerald-400 font-bold">{score}</span>
            </p>
            <button
              onClick={nextLevel}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              Tiếp tục Màn {level + 1}
            </button>
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center rounded-2xl animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">HẾT GIỜ!</h3>
            <p className="text-sm text-slate-300 mb-4">
              Điểm đạt được: <span className="font-mono text-amber-400 font-bold text-lg">{score}</span>
            </p>
            <button
              onClick={resetAll}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <RotateCcw className="w-5 h-5" />
              Chơi Lại Từ Đầu
            </button>
          </div>
        )}
      </div>

      {/* Virtual D-Pad for Mobile */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-44">
        <div />
        <button
          onClick={() => movePlayer(-1, 0)}
          className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-slate-200 rounded-xl flex items-center justify-center transition-colors"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          onClick={() => movePlayer(0, -1)}
          className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-slate-200 rounded-xl flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => movePlayer(1, 0)}
          className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-slate-200 rounded-xl flex items-center justify-center transition-colors"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <button
          onClick={() => movePlayer(0, 1)}
          className="p-3 bg-slate-800 hover:bg-slate-700 active:bg-emerald-500 active:text-slate-950 text-slate-200 rounded-xl flex items-center justify-center transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
