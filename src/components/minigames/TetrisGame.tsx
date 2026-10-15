import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

interface Props {
  onScore?: (score: number) => void;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

interface Tetromino {
  shape: number[][];
  color: string;
  name: TetrominoType;
}

const TETROMINOES: Record<TetrominoType, { shape: number[][]; color: string }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: 'bg-cyan-500 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.6)]',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'bg-amber-400 border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.6)]',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-purple-500 border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.6)]',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: 'bg-emerald-500 border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.6)]',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-rose-500 border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.6)]',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-blue-600 border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.6)]',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-orange-500 border-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.6)]',
  },
};

const RANDOM_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

function randomTetromino(): Tetromino {
  const type = RANDOM_TYPES[Math.floor(Math.random() * RANDOM_TYPES.length)];
  return {
    name: type,
    shape: TETROMINOES[type].shape,
    color: TETROMINOES[type].color,
  };
}

export const TetrisGame: React.FC<Props> = ({ onScore, onFinish, onExit }) => {
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<{
    x: number;
    y: number;
    shape: number[][];
    color: string;
    name: TetrominoType;
  }>(() => {
    const t = randomTetromino();
    return { x: 3, y: 0, ...t };
  });
  const [nextPiece, setNextPiece] = useState<Tetromino>(randomTetromino);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const boardRef = useRef(board);
  boardRef.current = board;
  const currentPieceRef = useRef(currentPiece);
  currentPieceRef.current = currentPiece;
  const isGameOverRef = useRef(isGameOver);
  isGameOverRef.current = isGameOver;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const scoreRef = useRef(score);
  scoreRef.current = score;

  // Load HighScore
  useEffect(() => {
    try {
      const stored = localStorage.getItem('trang-toan:tetris-best');
      if (stored) setHighScore(Number(stored));
    } catch {}
  }, []);

  const checkCollision = (
    shape: number[][],
    posX: number,
    posY: number,
    boardState: (string | null)[][]
  ) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = posX + c;
          const newY = posY + r;
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && boardState[newY][newX] !== null)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePieceToBoard = () => {
    const { shape, x, y, color } = currentPieceRef.current;
    const newBoard = boardRef.current.map((row) => [...row]);
    let gameOver = false;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardY = y + r;
          if (boardY < 0) {
            gameOver = true;
          } else {
            newBoard[boardY][x + c] = color;
          }
        }
      }
    }

    if (gameOver) {
      setIsGameOver(true);
      isGameOverRef.current = true;
      playMiniGameSound('gameover');
      onFinish?.(scoreRef.current);
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        try {
          localStorage.setItem('trang-toan:tetris-best', String(scoreRef.current));
        } catch {}
      }
      return;
    }

    // Check full lines
    let clearedLines = 0;
    const filteredBoard = newBoard.filter((row) => {
      const isFull = row.every((cell) => cell !== null);
      if (isFull) clearedLines++;
      return !isFull;
    });

    while (filteredBoard.length < BOARD_HEIGHT) {
      filteredBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    setBoard(filteredBoard);

    if (clearedLines > 0) {
      playMiniGameSound('success');
      const pointsEarned = [0, 100, 300, 500, 800][clearedLines] * level;
      setScore((s) => {
        const ns = s + pointsEarned;
        onScore?.(ns);
        return ns;
      });
      setLines((l) => {
        const nl = l + clearedLines;
        setLevel(Math.floor(nl / 5) + 1);
        return nl;
      });
    } else {
      playMiniGameSound('step');
    }

    // Spawn next piece
    const next = nextPiece;
    const newNext = randomTetromino();
    setNextPiece(newNext);

    const startX = 3;
    const startY = 0;
    if (checkCollision(next.shape, startX, startY, filteredBoard)) {
      setIsGameOver(true);
      isGameOverRef.current = true;
      playMiniGameSound('gameover');
      onFinish?.(scoreRef.current);
    } else {
      setCurrentPiece({
        x: startX,
        y: startY,
        shape: next.shape,
        color: next.color,
        name: next.name,
      });
    }
  };

  const moveLeft = useCallback(() => {
    if (isGameOverRef.current || isPausedRef.current) return;
    const { shape, x, y } = currentPieceRef.current;
    if (!checkCollision(shape, x - 1, y, boardRef.current)) {
      setCurrentPiece((prev) => ({ ...prev, x: prev.x - 1 }));
      playMiniGameSound('step');
    }
  }, []);

  const moveRight = useCallback(() => {
    if (isGameOverRef.current || isPausedRef.current) return;
    const { shape, x, y } = currentPieceRef.current;
    if (!checkCollision(shape, x + 1, y, boardRef.current)) {
      setCurrentPiece((prev) => ({ ...prev, x: prev.x + 1 }));
      playMiniGameSound('step');
    }
  }, []);

  const moveDown = useCallback(() => {
    if (isGameOverRef.current || isPausedRef.current) return;
    const { shape, x, y } = currentPieceRef.current;
    if (!checkCollision(shape, x, y + 1, boardRef.current)) {
      setCurrentPiece((prev) => ({ ...prev, y: prev.y + 1 }));
    } else {
      mergePieceToBoard();
    }
  }, [level, nextPiece]);

  const rotate = useCallback(() => {
    if (isGameOverRef.current || isPausedRef.current) return;
    const { shape, x, y } = currentPieceRef.current;
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rotated[c][rows - 1 - r] = shape[r][c];
      }
    }

    // Wall kick simple check
    let kickX = x;
    if (checkCollision(rotated, kickX, y, boardRef.current)) {
      kickX = x > BOARD_WIDTH / 2 ? x - 1 : x + 1;
      if (checkCollision(rotated, kickX, y, boardRef.current)) {
        kickX = x > BOARD_WIDTH / 2 ? x - 2 : x + 2;
        if (checkCollision(rotated, kickX, y, boardRef.current)) return;
      }
    }

    setCurrentPiece((prev) => ({
      ...prev,
      x: kickX,
      shape: rotated,
    }));
    playMiniGameSound('step');
  }, []);

  const hardDrop = useCallback(() => {
    if (isGameOverRef.current || isPausedRef.current) return;
    let { shape, x, y } = currentPieceRef.current;
    let dropDist = 0;
    while (!checkCollision(shape, x, y + dropDist + 1, boardRef.current)) {
      dropDist++;
    }
    setCurrentPiece((prev) => ({ ...prev, y: prev.y + dropDist }));
    playMiniGameSound('collect');
    setTimeout(() => {
      mergePieceToBoard();
    }, 50);
  }, [level, nextPiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveRight();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        moveDown();
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        rotate();
      } else if (e.key === ' ') {
        e.preventDefault();
        hardDrop();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight, moveDown, rotate, hardDrop]);

  // Drop Timer Loop
  useEffect(() => {
    if (isGameOver || isPaused) return;
    const speed = Math.max(120, 700 - (level - 1) * 80);
    const interval = setInterval(() => {
      moveDown();
    }, speed);
    return () => clearInterval(interval);
  }, [isGameOver, isPaused, level, moveDown]);

  const restartGame = () => {
    playMiniGameSound('step');
    setBoard(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null)));
    const first = randomTetromino();
    setCurrentPiece({ x: 3, y: 0, shape: first.shape, color: first.color, name: first.name });
    setNextPiece(randomTetromino());
    setScore(0);
    setLines(0);
    setLevel(1);
    setIsGameOver(false);
    isGameOverRef.current = false;
    onScore?.(0);
  };

  // Render composite board with current piece overlay
  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row]);
    const { shape, x, y, color } = currentPiece;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const boardY = y + r;
          const boardX = x + c;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = color;
          }
        }
      }
    }
    return displayBoard;
  };

  const activeDisplayBoard = renderBoard();

  return (
    <div className="relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-4 sm:p-6 shadow-2xl dark:border-slate-800 text-white select-none">
      {/* Header trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧩</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-amber-400">Xếp Hình Tetris Vui Nhộn</h3>
            <p className="text-xs text-slate-400">Xoay và sắp xếp các khối hình để xóa hàng ghi điểm!</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm font-bold">
          <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-1 font-mono text-cyan-300">
            Màn {level}
          </div>
          <div className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-1 font-mono text-amber-400">
            ⭐ {score} đ
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* Main Tetris Grid */}
        <div className="relative border-4 border-slate-700 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-1">
          <div
            className="grid gap-[1px] bg-slate-800"
            style={{
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
            }}
          >
            {activeDisplayBoard.map((row, rIdx) =>
              row.map((cell, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-xs border transition-colors ${
                    cell ? `${cell}` : 'bg-slate-950/80 border-slate-900'
                  }`}
                />
              ))
            )}
          </div>

          {/* Game Over Modal */}
          {isGameOver && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/92 p-6 text-center backdrop-blur-sm animate-fade-in">
              <span className="text-5xl">🏆</span>
              <h4 className="mt-2 text-2xl font-black text-rose-400">Trò Chơi Kết Thúc!</h4>
              <p className="mt-1 text-sm text-slate-300">
                Bé đã ghi được <strong className="text-yellow-300 text-lg">{score} điểm</strong> ({lines} hàng)!
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={restartGame}
                  className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-black text-slate-950 shadow-lg hover:from-amber-400 hover:to-orange-400 active:scale-95 transition cursor-pointer"
                >
                  🔄 Chơi Lại Lượt Mới
                </button>
                {onExit && (
                  <button
                    type="button"
                    onClick={onExit}
                    className="rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 font-bold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                  >
                    ✕ Thoát
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Side HUD: Next Piece & Stats */}
        <div className="flex flex-col gap-4 w-full sm:w-40 shrink-0">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-center shadow-inner">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Khối tiếp theo</span>
            <div className="mt-3 h-20 flex items-center justify-center bg-slate-950 rounded-xl p-2 border border-slate-800">
              <div
                className="grid gap-[1px]"
                style={{
                  gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, minmax(0, 1fr))`,
                }}
              >
                {nextPiece.shape.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={`w-4 h-4 rounded-xs ${
                        cell ? nextPiece.color : 'bg-transparent border-0'
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-inner space-y-2 text-xs">
            <div className="flex justify-between font-bold">
              <span className="text-slate-400">Số hàng:</span>
              <span className="text-amber-300">{lines}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-400">Kỷ lục:</span>
              <span className="text-yellow-400">{highScore} đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* On-screen touch controls for mobile / tablet / TV */}
      <div className="mt-6 flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto w-full">
          <button
            type="button"
            onClick={moveLeft}
            className="rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 py-3.5 text-xl font-black text-white shadow-md cursor-pointer flex items-center justify-center"
          >
            ◀ Trái
          </button>
          <button
            type="button"
            onClick={rotate}
            className="rounded-2xl bg-violet-600 hover:bg-violet-500 active:scale-95 py-3.5 text-xl font-black text-white shadow-md cursor-pointer flex items-center justify-center"
          >
            🔄 Xoay
          </button>
          <button
            type="button"
            onClick={moveRight}
            className="rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 py-3.5 text-xl font-black text-white shadow-md cursor-pointer flex items-center justify-center"
          >
            Phải ▶
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto w-full">
          <button
            type="button"
            onClick={moveDown}
            className="rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 py-3 font-bold text-slate-300 shadow-md cursor-pointer flex items-center justify-center text-sm"
          >
            🔽 Rơi nhanh (Soft Drop)
          </button>
          <button
            type="button"
            onClick={hardDrop}
            className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 py-3 font-black text-slate-950 shadow-md cursor-pointer flex items-center justify-center text-sm"
          >
            ⚡ Thả rơi đáy (Hard Drop)
          </button>
        </div>

        <div className="mt-2 text-center text-xs text-slate-400">
          <span>⌨️ Phím Mũi tên (← → ↓ ↑) để di chuyển & xoay · Phím Space để thả rơi</span>
        </div>
      </div>
    </div>
  );
};
