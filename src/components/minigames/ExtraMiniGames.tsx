import { useCallback, useEffect, useRef, useState } from 'react';
import { playMiniGameSound } from '../../lib/minigameSounds';

type ExtraId = 'snake' | 'match3' | '2048';
type Props = { game: ExtraId; onScore: (score: number) => void };
type DirectionKey = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

const DIRS: Record<DirectionKey, [number, number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
};

function TouchPad({ onMove, compact = false }: { onMove: (key: DirectionKey) => void; compact?: boolean }) {
  return <div className={`minigame-dpad ${compact ? 'minigame-dpad-compact' : ''}`} aria-label="Điều khiển cảm ứng">
    <span />
    <button type="button" onPointerDown={(e) => { e.preventDefault(); onMove('ArrowUp'); }} aria-label="Lên">↑</button>
    <span />
    <button type="button" onPointerDown={(e) => { e.preventDefault(); onMove('ArrowLeft'); }} aria-label="Trái">←</button>
    <button type="button" onPointerDown={(e) => { e.preventDefault(); onMove('ArrowDown'); }} aria-label="Xuống">↓</button>
    <button type="button" onPointerDown={(e) => { e.preventDefault(); onMove('ArrowRight'); }} aria-label="Phải">→</button>
  </div>;
}

function useSwipe(onSwipe: (key: DirectionKey) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    start.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    onSwipe(Math.abs(dx) > Math.abs(dy)
      ? dx > 0 ? 'ArrowRight' : 'ArrowLeft'
      : dy > 0 ? 'ArrowDown' : 'ArrowUp');
  };
  return { onPointerDown, onPointerUp };
}

const SNAKE_SIZE = 10;
function Snake({ onScore }: { onScore: (score: number) => void }) {
  const initial = [[4, 5], [3, 5], [2, 5]];
  const [snake, setSnake] = useState<number[][]>(initial);
  const [food, setFood] = useState([7, 5]);
  const [best, setBest] = useState(0);
  const [heading, setHeading] = useState<'up' | 'down' | 'left' | 'right'>('right');
  const dir = useRef<[number, number]>([1, 0]);

  const changeDirection = useCallback((key: DirectionKey) => {
    const next = DIRS[key];
    if (next[0] === -dir.current[0] && next[1] === -dir.current[1]) return;
    dir.current = next;
    if (key === 'ArrowUp') setHeading('up');
    if (key === 'ArrowDown') setHeading('down');
    if (key === 'ArrowLeft') setHeading('left');
    if (key === 'ArrowRight') setHeading('right');
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (!(e.key in DIRS)) return;
      e.preventDefault();
      changeDirection(e.key as DirectionKey);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [changeDirection]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setSnake(prev => {
        const head = [prev[0][0] + dir.current[0], prev[0][1] + dir.current[1]];
        const ate = head[0] === food[0] && head[1] === food[1];
        const bodyToCheck = ate ? prev : prev.slice(0, -1);
        const hit = head[0] < 0 || head[1] < 0 || head[0] >= SNAKE_SIZE || head[1] >= SNAKE_SIZE
          || bodyToCheck.some(p => p[0] === head[0] && p[1] === head[1]);

        if (hit) {
          dir.current = [1, 0];
          setHeading('right');
          playMiniGameSound('miss');
          onScore(0);
          return initial;
        }

        const next = [head, ...prev];
        if (!ate) next.pop();
        else {
          const score = next.length - 3;
          setBest(v => Math.max(v, score));
          onScore(score);
          playMiniGameSound('collect');
          let nextFood = [0, 0];
          do {
            nextFood = [Math.floor(Math.random() * SNAKE_SIZE), Math.floor(Math.random() * SNAKE_SIZE)];
          } while (next.some(p => p[0] === nextFood[0] && p[1] === nextFood[1]));
          setFood(nextFood);
        }
        return next;
      });
    }, 400);
    return () => clearInterval(t);
  }, [food, onScore]);

  const swipe = useSwipe(changeDirection);

  return <div className="extra-game-wrap">
    <div className="minigame-mini-status">🍎 Điểm cao lượt này: <strong>{best}</strong></div>
    <div className="snake-board touch-game-board" {...swipe}>
      {Array.from({ length: SNAKE_SIZE * SNAKE_SIZE }, (_, i) => {
        const x = i % SNAKE_SIZE, y = Math.floor(i / SNAKE_SIZE);
        const s = snake.findIndex(p => p[0] === x && p[1] === y);
        const isFood = food[0] === x && food[1] === y;
        return <div key={i} className={`snake-cell ${s === 0 ? `snake-head head-${heading}` : s > 0 ? 'snake-body' : ''} ${isFood ? 'snake-food' : ''}`}>
          {isFood && <span className="snake-apple" aria-label="Táo"><i className="snake-apple-leaf" /></span>}
          {s === 0 && <>
            <span className="snake-eye snake-eye-left" />
            <span className="snake-eye snake-eye-right" />
            <span className="snake-tongue" />
          </>}
        </div>;
      })}
    </div>
    <TouchPad onMove={changeDirection} compact />
    <p>Vuốt trên bàn chơi hoặc chạm các phím điều hướng.</p>
  </div>;
}

const GEMS = ['ruby','amber','violet','emerald','sapphire','coral'];
function makeBoard() {
  const board:number[] = [];
  for (let i = 0; i < 36; i++) {
    let value = Math.floor(Math.random() * GEMS.length);
    const row = Math.floor(i / 6), col = i % 6;
    while (
      (col >= 2 && board[i - 1] === value && board[i - 2] === value) ||
      (row >= 2 && board[i - 6] === value && board[i - 12] === value)
    ) value = Math.floor(Math.random() * GEMS.length);
    board.push(value);
  }
  return board;
}
function findMatches(board:number[]) {
  const matched = new Set<number>();
  for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) {
    const k = r * 6 + c;
    if (board[k] === board[k+1] && board[k] === board[k+2]) [k,k+1,k+2].forEach(v => matched.add(v));
  }
  for (let c = 0; c < 6; c++) for (let r = 0; r < 4; r++) {
    const k = r * 6 + c;
    if (board[k] === board[k+6] && board[k] === board[k+12]) [k,k+6,k+12].forEach(v => matched.add(v));
  }
  return matched;
}
function Match3({ onScore }: { onScore: (score: number) => void }) {
  const [board, setBoard] = useState(makeBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState('');

  const click = (i: number) => {
    if (selected === null) { setSelected(i); return; }
    if (selected === i) { setSelected(null); return; }
    const sx = selected % 6, sy = Math.floor(selected / 6), x = i % 6, y = Math.floor(i / 6);
    if (Math.abs(sx - x) + Math.abs(sy - y) !== 1) { setSelected(i); return; }

    const swapped = [...board];
    [swapped[selected], swapped[i]] = [swapped[i], swapped[selected]];
    const matched = findMatches(swapped);
    if (!matched.size) {
      playMiniGameSound('miss');
      setCombo('Chưa tạo được bộ 3');
      setSelected(null);
      return;
    }

    matched.forEach(k => swapped[k] = Math.floor(Math.random() * GEMS.length));
    const next = score + matched.size;
    setScore(next);
    onScore(next);
    setBoard(swapped);
    playMiniGameSound('collect');
    setCombo(`+${matched.size} điểm ✨`);
    setSelected(null);
  };

  return <div className="extra-game-wrap">
    <div className="minigame-mini-status">{combo || 'Chạm hai viên cạnh nhau để đổi chỗ'}</div>
    <div className="match3-board">{board.map((v,i)=><button type="button" key={i} onClick={()=>click(i)} className={selected===i?'selected':''} aria-label={`Viên ngọc ${GEMS[v]}`}><span className={`gem gem-${GEMS[v]}`} /></button>)}</div>
    <p>Ghép ít nhất 3 viên ngọc cùng màu theo hàng hoặc cột.</p>
  </div>;
}

function slideLine(values:number[]) {
  const compact = values.filter(Boolean);
  const merged:number[] = [];
  let gained = 0;
  for (let i=0; i<compact.length; i++) {
    if (compact[i] === compact[i+1]) {
      const v = compact[i] * 2;
      merged.push(v);
      gained += v;
      i++;
    } else merged.push(compact[i]);
  }
  while (merged.length < 4) merged.push(0);
  return { line: merged, gained };
}
function gridsEqual(a:number[], b:number[]) { return a.every((v,i) => v === b[i]); }

function Twenty48({ onScore }: { onScore: (score: number) => void }) {
  const newGame = () => {
    const a = Array(16).fill(0);
    a[5] = 2; a[10] = 2;
    return a;
  };
  const [grid, setGrid] = useState<number[]>(newGame);
  const [score, setScore] = useState(0);

  const move = useCallback((key: DirectionKey) => {
    setGrid(current => {
      const out = Array(16).fill(0);
      let gained = 0;
      const vertical = key === 'ArrowUp' || key === 'ArrowDown';
      const reverse = key === 'ArrowRight' || key === 'ArrowDown';

      for (let line=0; line<4; line++) {
        const vals:number[] = [];
        for (let i=0; i<4; i++) {
          const slot = reverse ? 3-i : i;
          const index = vertical ? slot*4+line : line*4+slot;
          vals.push(current[index]);
        }
        const result = slideLine(vals);
        gained += result.gained;
        for (let i=0; i<4; i++) {
          const slot = reverse ? 3-i : i;
          const index = vertical ? slot*4+line : line*4+slot;
          out[index] = result.line[i];
        }
      }

      if (gridsEqual(current, out)) return current;
      const empties = out.map((v,i)=>v ? -1 : i).filter(i=>i>=0);
      if (empties.length) out[empties[Math.floor(Math.random()*empties.length)]] = Math.random() < .9 ? 2 : 4;
      if (gained) {
        setScore(s => {
          const next = s + gained;
          onScore(next);
          playMiniGameSound('collect');
          return next;
        });
      }
      return out;
    });
  }, [onScore]);

  useEffect(() => {
    const h = (e:KeyboardEvent) => {
      if (!(e.key in DIRS)) return;
      e.preventDefault();
      move(e.key as DirectionKey);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [move]);

  const swipe = useSwipe(move);

  return <div className="extra-game-wrap">
    <div className="minigame-mini-status">Điểm ghép: <strong>{score}</strong></div>
    <div className="twenty48-board touch-game-board" {...swipe}>{grid.map((v,i)=><div key={i} data-v={v}>{v||''}</div>)}</div>
    <TouchPad onMove={move} compact />
    <p>Vuốt trên bảng hoặc dùng phím điều hướng để ghép số.</p>
  </div>;
}

export default function ExtraMiniGames({ game, onScore }: Props) {
  if (game === 'snake') return <Snake onScore={onScore}/>;
  if (game === 'match3') return <Match3 onScore={onScore}/>;
  return <Twenty48 onScore={onScore}/>;
}
