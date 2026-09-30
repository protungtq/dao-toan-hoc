import { useCallback, useEffect, useRef, useState } from 'react';

type ExtraId = 'snake' | 'match3' | 'sudoku' | '2048' | 'flappy';
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
          onScore(0);
          return initial;
        }

        const next = [head, ...prev];
        if (!ate) next.pop();
        else {
          const score = next.length - 3;
          setBest(v => Math.max(v, score));
          onScore(score);
          let nextFood = [0, 0];
          do {
            nextFood = [Math.floor(Math.random() * SNAKE_SIZE), Math.floor(Math.random() * SNAKE_SIZE)];
          } while (next.some(p => p[0] === nextFood[0] && p[1] === nextFood[1]));
          setFood(nextFood);
        }
        return next;
      });
    }, 235);
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
      setCombo('Chưa tạo được bộ 3');
      setSelected(null);
      return;
    }

    matched.forEach(k => swapped[k] = Math.floor(Math.random() * GEMS.length));
    const next = score + matched.size;
    setScore(next);
    onScore(next);
    setBoard(swapped);
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

function Flappy({ onScore }: { onScore: (score: number) => void }) {
  const [y,setY] = useState(50);
  const vy = useRef(0);
  const [pipes,setPipes] = useState([{id:1,x:88,gap:50,passed:false},{id:2,x:156,gap:40,passed:false}]);
  const [score,setScore] = useState(0);

  const flap = useCallback(() => { vy.current = -5.0; }, []);
  useEffect(() => {
    const k=(e:KeyboardEvent)=>{
      if(e.code==='Space'||e.key==='ArrowUp'){e.preventDefault();flap();}
    };
    window.addEventListener('keydown',k);
    return()=>window.removeEventListener('keydown',k);
  },[flap]);

  useEffect(() => {
    const t=setInterval(()=>{
      vy.current += 0.32;
      setY(v => Math.max(4, Math.min(94, v + vy.current)));
      setPipes(ps => ps.map(p => {
        let next = { ...p, x:p.x-1.35 };
        if (!next.passed && next.x < 18) {
          next.passed = true;
          setScore(s => { const n=s+1; onScore(n); return n; });
        }
        if (next.x < -12) next = {id:p.id+2,x:118,gap:34+Math.random()*32,passed:false};
        return next;
      }));
    }, 70);
    return()=>clearInterval(t);
  }, [onScore]);

  const hit = y < 4 || y > 94 || pipes.some(p=>p.x>12&&p.x<27&&(y<p.gap-19||y>p.gap+19));
  useEffect(()=>{
    if(!hit) return;
    setY(50);
    vy.current=0;
    setPipes([{id:1,x:88,gap:50,passed:false},{id:2,x:156,gap:40,passed:false}]);
  },[hit]);

  return <div className="extra-game-wrap">
    <div className="minigame-mini-status">Cổng đã vượt: <strong>{score}</strong></div>
    <div className="flappy-board touch-game-board" onPointerDown={(e)=>{ e.preventDefault(); flap(); }} role="button" tabIndex={0} aria-label="Chạm để chim bay">
      <div className="flappy-bird" style={{top:`${y}%`}} aria-label="Chim"><span className="flappy-wing"/><span className="flappy-eye"/><span className="flappy-beak"/></div>
      {pipes.map(p=><div key={p.id} className="pipe" style={{left:`${p.x}%`}}><span style={{height:`${Math.max(0,p.gap-19)}%`}}/><span style={{top:`${Math.min(100,p.gap+19)}%`,bottom:0}}/></div>)}
      <span className="flappy-tap-hint">CHẠM ĐỂ BAY</span>
    </div>
    <button type="button" className="flappy-touch-button" onPointerDown={(e)=>{e.preventDefault();flap();}}>↑ Bay lên</button>
    <p>Chạm vào vùng chơi hoặc nút Bay lên.</p>
  </div>;
}

const PUZZLE = [
  5,3,0,0,7,0,0,0,0,
  6,0,0,1,9,5,0,0,0,
  0,9,8,0,0,0,0,6,0,
  8,0,0,0,6,0,0,0,3,
  4,0,0,8,0,3,0,0,1,
  7,0,0,0,2,0,0,0,6,
  0,6,0,0,0,0,2,8,0,
  0,0,0,4,1,9,0,0,5,
  0,0,0,0,8,0,0,7,9,
];
const SOLUTION = [5,3,4,6,7,8,9,1,2,6,7,2,1,9,5,3,4,8,1,9,8,3,4,2,5,6,7,8,5,9,7,6,1,4,2,3,4,2,6,8,5,3,7,9,1,7,1,3,9,2,4,8,5,6,9,6,1,5,3,7,2,8,4,2,8,7,4,1,9,6,3,5,3,4,5,2,8,6,1,7,9];

function Sudoku({ onScore }: { onScore:(score:number)=>void }) {
  const [grid,setGrid]=useState([...PUZZLE]);
  const [sel,setSel]=useState<number|null>(null);
  const filled=grid.filter((v,i)=>PUZZLE[i]===0&&v===SOLUTION[i]).length;
  useEffect(()=>onScore(filled),[filled,onScore]);

  const put = (n:number) => {
    if (sel === null || PUZZLE[sel]) return;
    const g=[...grid];
    g[sel]=n;
    setGrid(g);
  };

  return <div className="extra-game-wrap">
    <div className="minigame-mini-status">{sel === null ? 'Chạm một ô trống để bắt đầu' : `Ô đang chọn: hàng ${Math.floor(sel/9)+1}, cột ${sel%9+1}`}</div>
    <div className="sudoku-board">
      {grid.map((v,i)=>{
        const wrong = PUZZLE[i]===0 && v!==0 && v!==SOLUTION[i];
        return <button type="button" key={i} onClick={()=>PUZZLE[i]===0&&setSel(i)} className={`${PUZZLE[i]?'fixed':''} ${sel===i?'selected':''} ${wrong?'wrong':''}`} aria-label={PUZZLE[i] ? `Số cho sẵn ${v}` : `Ô trống hàng ${Math.floor(i/9)+1} cột ${i%9+1}`}>{v||''}</button>;
      })}
    </div>
    <div className="sudoku-nums">
      {[1,2,3,4,5,6,7,8,9].map(n=><button type="button" key={n} onClick={()=>put(n)}>{n}</button>)}
      <button type="button" className="sudoku-erase" onClick={()=>put(0)} aria-label="Xóa số">⌫</button>
    </div>
    <p>Chọn ô trống rồi điền số. Ô sai sẽ được đánh dấu.</p>
  </div>;
}

export default function ExtraMiniGames({ game, onScore }: Props) {
  if (game === 'snake') return <Snake onScore={onScore}/>;
  if (game === 'match3') return <Match3 onScore={onScore}/>;
  if (game === 'sudoku') return <Sudoku onScore={onScore}/>;
  if (game === '2048') return <Twenty48 onScore={onScore}/>;
  return <Flappy onScore={onScore}/>;
}
