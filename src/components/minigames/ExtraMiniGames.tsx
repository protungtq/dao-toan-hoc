import { useEffect, useMemo, useRef, useState } from 'react';

type ExtraId = 'snake' | 'match3' | 'sudoku' | '2048' | 'flappy';
type Props = { game: ExtraId; onScore: (score: number) => void };

const SIZE = 10;
const DIRS: Record<string, [number, number]> = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
};

function Snake({ onScore }: { onScore: (score: number) => void }) {
  const [snake, setSnake] = useState([[4, 5], [3, 5], [2, 5]]);
  const [food, setFood] = useState([7, 5]);
  const dir = useRef<[number, number]>([1, 0]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const d = DIRS[e.key];
      if (!d) return;
      e.preventDefault();
      if (d[0] === -dir.current[0] && d[1] === -dir.current[1]) return;
      dir.current = d;
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  useEffect(() => {
    const t = window.setInterval(() => setSnake(prev => {
      const head = [prev[0][0] + dir.current[0], prev[0][1] + dir.current[1]];
      const hit = head[0] < 0 || head[1] < 0 || head[0] >= SIZE || head[1] >= SIZE || prev.some(p => p[0] === head[0] && p[1] === head[1]);
      if (hit) { onScore(0); return [[4, 5], [3, 5], [2, 5]]; }
      const ate = head[0] === food[0] && head[1] === food[1];
      const next = [head, ...prev];
      if (!ate) next.pop();
      else {
        onScore(next.length - 3);
        setFood([Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE)]);
      }
      return next;
    }), 220);
    return () => clearInterval(t);
  }, [food, onScore]);
  return <div className="extra-game-wrap">
    <div className="snake-board">
      {Array.from({ length: SIZE * SIZE }, (_, i) => {
        const x = i % SIZE, y = Math.floor(i / SIZE);
        const s = snake.findIndex(p => p[0] === x && p[1] === y);
        const f = food[0] === x && food[1] === y;
        return <div key={i} className={`snake-cell ${s === 0 ? 'snake-head' : s > 0 ? 'snake-body' : ''} ${f ? 'snake-food' : ''}`}>
          {f && <span className="snake-apple" aria-label="Táo"><i className="snake-apple-leaf" /></span>}
        </div>;
      })}
    </div>
    <p>Dùng phím mũi tên để điều khiển.</p>
  </div>;
}

const COLORS = ['ruby','amber','violet','emerald','sapphire','coral'];
function makeBoard() { return Array.from({ length: 36 }, () => Math.floor(Math.random() * COLORS.length)); }
function Match3({ onScore }: { onScore: (score: number) => void }) {
  const [board, setBoard] = useState(makeBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const click = (i: number) => {
    if (selected === null) return setSelected(i);
    const sx = selected % 6, sy = Math.floor(selected / 6), x = i % 6, y = Math.floor(i / 6);
    if (Math.abs(sx - x) + Math.abs(sy - y) !== 1) return setSelected(i);
    const b = [...board]; [b[selected], b[i]] = [b[i], b[selected]];
    const matched = new Set<number>();
    for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) {
      const k = r * 6 + c; if (b[k] === b[k+1] && b[k] === b[k+2]) [k,k+1,k+2].forEach(v => matched.add(v));
    }
    for (let c = 0; c < 6; c++) for (let r = 0; r < 4; r++) {
      const k = r * 6 + c; if (b[k] === b[k+6] && b[k] === b[k+12]) [k,k+6,k+12].forEach(v => matched.add(v));
    }
    if (matched.size) {
      matched.forEach(k => b[k] = Math.floor(Math.random() * COLORS.length));
      const next = score + matched.size; setScore(next); onScore(next);
    }
    setBoard(b); setSelected(null);
  };
  return <div className="extra-game-wrap"><div className="match3-board">{board.map((v,i)=><button key={i} onClick={()=>click(i)} className={selected===i?'selected':''} aria-label={`Viên ngọc ${COLORS[v]}`}><span className={`gem gem-${COLORS[v]}`} /></button>)}</div><p>Đổi chỗ hai ô cạnh nhau để tạo 3 viên ngọc giống nhau.</p></div>;
}

function Twenty48({ onScore }: { onScore: (score: number) => void }) {
  const [grid, setGrid] = useState(() => {
    const a = Array(16).fill(0); a[5]=2; a[10]=2; return a;
  });
  const [score, setScore] = useState(0);
  const move = (key: string) => {
    const left = key === 'ArrowLeft' || key === 'ArrowUp';
    const vertical = key === 'ArrowUp' || key === 'ArrowDown';
    if (!DIRS[key]) return;
    const g = [...grid];
    const out = Array(16).fill(0);
    let gained = 0;
    for (let line=0; line<4; line++) {
      let vals:number[] = [];
      for (let i=0;i<4;i++) {
        const p = vertical ? i*4+line : line*4+i; if (g[p]) vals.push(g[p]);
      }
      if (!left) vals.reverse();
      for (let i=0;i<vals.length-1;i++) if (vals[i]===vals[i+1]) { vals[i]*=2; gained+=vals[i]; vals.splice(i+1,1); }
      if (!left) vals.reverse();
      for (let i=0;i<vals.length;i++) {
        const slot = left ? i : 4-vals.length+i;
        const p = vertical ? slot*4+line : line*4+slot; out[p]=vals[i];
      }
    }
    const empties = out.map((v,i)=>v? -1:i).filter(i=>i>=0);
    if (empties.length) out[empties[Math.floor(Math.random()*empties.length)]]=2;
    const next=score+gained; setScore(next); onScore(next); setGrid(out);
  };
  useEffect(()=>{const h=(e:KeyboardEvent)=>{if(DIRS[e.key]){e.preventDefault();move(e.key)}};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)},[grid,score]);
  return <div className="extra-game-wrap"><div className="twenty48-board">{grid.map((v,i)=><div key={i} data-v={v}>{v||''}</div>)}</div><p>Dùng phím mũi tên để ghép các số giống nhau.</p></div>;
}

function Flappy({ onScore }: { onScore: (score: number) => void }) {
  const [y,setY]=useState(50); const vy=useRef(0); const [pipes,setPipes]=useState([{x:82,gap:48},{x:140,gap:32}]); const [score,setScore]=useState(0);
  useEffect(()=>{const flap=()=>{vy.current=-7}; const k=(e:KeyboardEvent)=>{if(e.code==='Space'||e.key==='ArrowUp'){e.preventDefault();flap()}};window.addEventListener('keydown',k);window.addEventListener('pointerdown',flap);return()=>{window.removeEventListener('keydown',k);window.removeEventListener('pointerdown',flap)}},[]);
  useEffect(()=>{const t=setInterval(()=>{vy.current+=0.55; setY(v=>Math.max(4,Math.min(92,v+vy.current))); setPipes(ps=>ps.map(p=>({ ...p, x:p.x-2.2 })).map(p=>p.x<-8?{x:108,gap:25+Math.random()*50}:p)); setScore(s=>{const n=s+1; onScore(Math.floor(n/20)); return n;});},70); return()=>clearInterval(t)},[onScore]);
  const hit = pipes.some(p=>p.x>14&&p.x<28&&(y<p.gap-14||y>p.gap+14)); useEffect(()=>{if(hit){setY(50);vy.current=0;setPipes([{x:82,gap:48},{x:140,gap:32}])}},[hit]);
  return <div className="extra-game-wrap"><div className="flappy-board"><div className="flappy-bird" style={{top:`${y}%`}} aria-label="Chim"><span className="flappy-wing"/><span className="flappy-eye"/><span className="flappy-beak"/></div>{pipes.map((p,i)=><div key={i} className="pipe" style={{left:`${p.x}%`}}><span style={{height:`${Math.max(0,p.gap-14)}%`}}/><span style={{top:`${Math.min(100,p.gap+14)}%`,bottom:0}}/></div>)}</div><p>Chạm màn hình hoặc nhấn Space/↑ để bay.</p></div>;
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
  const [grid,setGrid]=useState([...PUZZLE]); const [sel,setSel]=useState<number|null>(null);
  const filled=grid.filter((v,i)=>PUZZLE[i]===0&&v===SOLUTION[i]).length;
  useEffect(()=>onScore(filled),[filled,onScore]);
  return <div className="extra-game-wrap"><div className="sudoku-board">{grid.map((v,i)=><button key={i} onClick={()=>PUZZLE[i]===0&&setSel(i)} className={`${PUZZLE[i]?'fixed':''} ${sel===i?'selected':''}`}>{v||''}</button>)}</div><div className="sudoku-nums">{[1,2,3,4,5,6,7,8,9].map(n=><button key={n} onClick={()=>{if(sel===null)return;const g=[...grid];g[sel]=n;setGrid(g)}}>{n}</button>)}</div><p>Chọn ô trống rồi điền số 1–9.</p></div>;
}

export default function ExtraMiniGames({ game, onScore }: Props) {
  const stableScore = useMemo(() => onScore, [onScore]);
  if (game === 'snake') return <Snake onScore={stableScore}/>;
  if (game === 'match3') return <Match3 onScore={stableScore}/>;
  if (game === 'sudoku') return <Sudoku onScore={stableScore}/>;
  if (game === '2048') return <Twenty48 onScore={stableScore}/>;
  return <Flappy onScore={stableScore}/>;
}
