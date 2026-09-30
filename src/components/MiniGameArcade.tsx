import { useEffect, useRef, useState } from 'react';
import { endTicketGame, readAdminPlayMode, readTickets, setAdminPlayMode, startTicketGame, type TicketState } from '../lib/minigameTickets';
import SquirrelCatch3D from './minigames/SquirrelCatch3D';
import ExtraMiniGames from './minigames/ExtraMiniGames';
import { BearCatch3D, BearClimb3D, SquirrelMaze3D } from './minigames/LegacyGames3D';
import './MiniGameArcade.css';

type GameId = 'squirrel-catch' | 'bear-catch' | 'squirrel-maze' | 'bear-climb' | 'snake' | 'match3' | 'sudoku' | '2048' | 'flappy';
type ExtraGameId = 'snake' | 'match3' | 'sudoku' | '2048' | 'flappy';
const EXTRA_GAMES: ExtraGameId[] = ['snake', 'match3', 'sudoku', '2048', 'flappy'];
const GAME_KEY = 'trang-toan:minigame-active:v1';
const GAMES: { id: GameId; name: string; icon: string; description: string }[] = [
  { id: 'squirrel-catch', name: 'Sóc hứng hạt dẻ', icon: '🐿️', description: 'Di chuyển Sóc để đón hạt dẻ.' },
  { id: 'bear-catch', name: 'Gấu hứng mật ong', icon: '🐻', description: 'Giúp Gấu hứng những hũ mật.' },
  { id: 'squirrel-maze', name: 'Sóc tìm đường về nhà', icon: '🏡', description: 'Dẫn Sóc đi qua mê cung.' },
  { id: 'bear-climb', name: 'Gấu leo cây lấy mật', icon: '🌳', description: 'Chọn đúng cành để Gấu leo cao.' },
  { id: 'snake', name: 'Rắn săn mồi', icon: '🐍', description: 'Điều khiển rắn ăn táo và đừng tự cắn mình.' },
  { id: 'match3', name: 'Vườn trái cây Match-3', icon: '💎', description: 'Đổi chỗ để ghép ít nhất 3 biểu tượng giống nhau.' },
  { id: 'sudoku', name: 'Sudoku', icon: '🔢', description: 'Điền số còn thiếu vào bảng Sudoku.' },
  { id: '2048', name: 'Ghép số 2048', icon: '🧩', description: 'Ghép các ô số giống nhau để tạo số lớn hơn.' },
  { id: 'flappy', name: 'Chim bay', icon: '🐦', description: 'Giữ chú chim bay qua các khe chướng ngại.' },
];
const MAZE = [
  '#########', '#S..#...#', '###.#.#.#', '#...#.#.#', '#.###.#.#', '#.....#.#', '#.#####.#', '#......H#', '#########',
];
function mazeFor(level: number) {
  const variant = (level - 1) % 4;
  const rows = variant & 2 ? [...MAZE].reverse() : MAZE;
  return variant & 1 ? rows.map((row) => [...row].reverse().join('')) : rows;
}
function mazeStart(rows: string[]) {
  const y = rows.findIndex((row) => row.includes('S'));
  return [rows[y].indexOf('S'), y];
}

function BearClimbStage({ step, level, celebration, feedback }: { step: number; level: number; celebration: boolean; feedback: string }) {
  const height = celebration ? 68 : 9 + step * 5.35;
  return <div className={`climb-scene climb-scene-${level % 3} ${celebration ? 'climb-scene-win' : ''} ${feedback.startsWith('Chưa') ? 'climb-scene-miss' : ''}`} role="img" aria-label={`Gấu đang leo cây số ${level}, cành ${celebration ? 12 : step} trên 12, tổ mật ở ngọn cây`}>
    <div className="climb-sun" />
    <div className="climb-cloud climb-cloud-left" /><div className="climb-cloud climb-cloud-right" />
    <div className="climb-hill climb-hill-left" /><div className="climb-hill climb-hill-right" />
    <div className="climb-tree" aria-hidden="true">
      <div className="climb-canopy climb-canopy-a" /><div className="climb-canopy climb-canopy-b" /><div className="climb-canopy climb-canopy-c" />
      <div className="climb-trunk" />
      {Array.from({ length: 12 }, (_, i) => <div key={i} className={`climb-branch ${i % 2 ? 'climb-branch-right' : 'climb-branch-left'} ${i < step || celebration ? 'climb-branch-passed' : ''}`} style={{ bottom: `${19 + i * 5.7}%` }}><span>🍃</span></div>)}
      <div className="climb-hive">🍯<span className="climb-bee">🐝</span></div>
    </div>
    <div className="climb-bear" style={{ bottom: `${height}%`, left: `calc(50% + ${step % 2 ? 24 : -24}px)` }} aria-hidden="true"><img src="/models/mascots/bear-poster.webp" alt="" width="96" height="96" /></div>
    <div className="climb-ground" />
    {celebration && <div className="climb-confetti" aria-hidden="true">✨ 🍯 ✨</div>}
  </div>;
}

export default function MiniGameArcade() {
  const [wallet, setWallet] = useState<TicketState>(() => readTickets());
  const [adminPlay, setAdminPlay] = useState(false);
  const [game, setGame] = useState<GameId | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [points, setPoints] = useState(0);
  const [lane, setLane] = useState(2);
  const [item, setItem] = useState({ lane: 1, row: 0 });
  const [catchFeedback, setCatchFeedback] = useState('');
  const [catchResult, setCatchResult] = useState<'hit' | 'miss' | null>(null);
  const [position, setPosition] = useState([1, 1]);
  const [finished, setFinished] = useState(false);
  const [mazeLevel, setMazeLevel] = useState(1);
  const [climbCelebration, setClimbCelebration] = useState(false);
  const [climbFeedback, setClimbFeedback] = useState('');
  const maze = mazeFor(mazeLevel);
  const gameRef = useRef<GameId | null>(null);
  const laneRef = useRef(2);
  const itemRef = useRef(item);
  const doneRef = useRef(false);
  const moveRef = useRef<(dx: number, dy: number) => void>(() => {});
  const climbRef = useRef<(side: 'left' | 'right') => void>(() => {});
  const levelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (game) {
      document.documentElement.dataset.minigamePlaying = 'true';
      document.querySelectorAll<HTMLElement>('[data-tv-number]').forEach((element) => element.removeAttribute('data-tv-number'));
    }
    else delete document.documentElement.dataset.minigamePlaying;
    return () => { delete document.documentElement.dataset.minigamePlaying; };
  }, [game]);

  useEffect(() => {
    const update = () => setWallet(readTickets());
    const updateAdmin = () => setAdminPlay(readAdminPlayMode());
    window.addEventListener('trang-toan:tickets-updated', update);
    window.addEventListener('storage', update);
    window.addEventListener('trang-toan:admin-play-updated', updateAdmin);
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'play') setAdminPlayMode(true);
    if (params.get('admin') === 'off') setAdminPlayMode(false);
    setAdminPlay(readAdminPlayMode());
    const stored = localStorage.getItem(GAME_KEY);
    if (stored && GAMES.some((entry) => entry.id === stored) && readTickets().activeUntil > Date.now()) {
      gameRef.current = stored as GameId;
      setGame(stored as GameId);
    } else if (stored) {
      localStorage.removeItem(GAME_KEY);
      endTicketGame();
    }
    return () => { if (levelTimer.current) clearTimeout(levelTimer.current); if (feedbackTimer.current) clearTimeout(feedbackTimer.current); window.removeEventListener('trang-toan:tickets-updated', update); window.removeEventListener('storage', update); window.removeEventListener('trang-toan:admin-play-updated', updateAdmin); };
  }, []);

  function stop() {
    if (levelTimer.current) clearTimeout(levelTimer.current);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    levelTimer.current = null;
    feedbackTimer.current = null;
    gameRef.current = null;
    setGame(null);
    localStorage.removeItem(GAME_KEY);
    endTicketGame();
    setWallet(readTickets());
  }

  useEffect(() => {
    if (!game) return;
    const clock = window.setInterval(() => {
      const left = Math.max(0, readTickets().activeUntil - Date.now());
      setRemaining(Math.ceil(left / 1000));
      if (!left) stop();
    }, 250);
    setRemaining(Math.ceil(Math.max(0, readTickets().activeUntil - Date.now()) / 1000));
    return () => window.clearInterval(clock);
  }, [game]);

  useEffect(() => {
    if (game !== 'squirrel-catch' && game !== 'bear-catch') return;
    const tick = window.setInterval(() => {
      if (doneRef.current) return;
      const current = itemRef.current;
      if (current.row >= 5) {
        if (current.lane === laneRef.current) {
          setPoints((value) => value + 1);
          setCatchFeedback(game === 'squirrel-catch' ? 'Sóc bắt được hạt dẻ! 🌰' : 'Gấu hứng được mật ong! 🍯');
          setCatchResult('hit');
        } else {
          setCatchFeedback('Suýt nữa! Di chuyển để đón lượt tiếp theo.');
          setCatchResult('miss');
        }
        itemRef.current = { lane: Math.floor(Math.random() * 5), row: 0 };
      } else itemRef.current = { ...current, row: current.row + 1 };
      setItem({ ...itemRef.current });
    }, Math.max(310, 650 - Math.floor(points / 8) * 35));
    return () => window.clearInterval(tick);
  }, [game, Math.floor(points / 8)]);

  function start(id: GameId) {
    if (readTickets().activeUntil > Date.now()) return;
    const state = startTicketGame(adminPlay);
    if (!state) return;
    if (state.activeUntil <= Date.now()) return;
    setWallet(state);
    localStorage.setItem(GAME_KEY, id);
    gameRef.current = id;
    setGame(id);
    setPoints(0);
    setCatchFeedback('');
    setCatchResult(null);
    setFinished(false);
    doneRef.current = false;
    setMazeLevel(1);
    setClimbCelebration(false);
    setClimbFeedback('');
    setPosition(mazeStart(mazeFor(1)));
    laneRef.current = 2;
    setLane(2);
    itemRef.current = { lane: Math.floor(Math.random() * 5), row: 0 };
    setItem({ ...itemRef.current });
  }

  function move(dx: number, dy: number) {
    if (gameRef.current !== 'squirrel-maze' || doneRef.current) return;
    setPosition(([x, y]) => {
      const nx = x + dx, ny = y + dy;
      if (maze[ny]?.[nx] === undefined || maze[ny][nx] === '#') return [x, y];
      if (maze[ny][nx] === 'H') {
        doneRef.current = true;
        setFinished(true);
        setPoints((value) => value + 1);
        levelTimer.current = setTimeout(() => {
          if (gameRef.current !== 'squirrel-maze' || readTickets().activeUntil <= Date.now()) return;
          const next = mazeLevel + 1;
          setMazeLevel(next);
          setPosition(mazeStart(mazeFor(next)));
          setFinished(false);
          doneRef.current = false;
          levelTimer.current = null;
        }, 850);
      }
      return [nx, ny];
    });
  }
  function climb(side: 'left' | 'right') {
    if (gameRef.current !== 'bear-climb' || climbCelebration || readTickets().activeUntil <= Date.now()) return;
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    const expected = points % 2 === 0 ? 'left' : 'right';
    if (side !== expected) {
      setClimbFeedback('Chưa đúng cành, thử phía bên kia nhé!');
      feedbackTimer.current = setTimeout(() => setClimbFeedback(''), 850);
      return;
    }
    const next = points + 1;
    setPoints(next);
    if (next % 12 === 0) {
      setClimbCelebration(true);
      setClimbFeedback('Gấu đã lấy được mật! Sắp sang cây tiếp theo.');
      feedbackTimer.current = setTimeout(() => { setClimbCelebration(false); setClimbFeedback(''); }, 1300);
    } else {
      setClimbFeedback(`Giỏi lắm! Đã leo tới cành ${next % 12}.`);
      feedbackTimer.current = setTimeout(() => setClimbFeedback(''), 720);
    }
  }
  climbRef.current = climb;
  moveRef.current = move;
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (!gameRef.current) return;
      const key = event.key;
      if (gameRef.current.endsWith('catch') && /^[1-5]$/.test(key)) {
        event.preventDefault();
        laneRef.current = Number(key) - 1;
        setLane(laneRef.current);
        return;
      }
      const directions: Record<string, [number, number]> = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      if (directions[key]) {
        event.preventDefault();
        if (gameRef.current === 'squirrel-maze') moveRef.current(...directions[key]);
        if (gameRef.current === 'bear-climb' && (key === 'ArrowLeft' || key === 'ArrowRight')) climbRef.current(key === 'ArrowLeft' ? 'left' : 'right');
        if (gameRef.current.endsWith('catch')) {
          const delta = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0;
          laneRef.current = Math.max(0, Math.min(4, laneRef.current + delta));
          setLane(laneRef.current);
        }
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, []);

  const title = GAMES.find((entry) => entry.id === game)?.name;
  return <section className="mx-auto max-w-5xl px-4 py-9 md:px-8" aria-label="Khu minigame">
    <div className="rounded-[2rem] bg-gradient-to-br from-violet-600 to-sky-600 p-6 text-white shadow-xl md:p-9">
      <p className="font-bold text-white/85">Phần thưởng sau giờ luyện</p>
      <h1 className="mt-2 text-3xl font-black md:text-4xl">🎟️ Khu vui chơi Sóc và Gấu</h1>
      <p className="mt-3 font-semibold">Cứ 3 lượt luyện đạt trên 80% nhận 1 vé. Giữ tối đa 3 vé, mỗi vé chơi tối đa 3 phút.</p>
      <div className="mt-5 flex flex-wrap gap-3 text-sm font-black"><span className="rounded-xl bg-white/20 px-4 py-2">Vé hiện có: {wallet.tickets}/3</span><span className="rounded-xl bg-white/20 px-4 py-2">Tiến độ: {wallet.progress}/3 bài đạt</span>{adminPlay && <span className="rounded-xl bg-amber-300 px-4 py-2 text-amber-950">🛠️ Admin play · không trừ vé</span>}</div>
    </div>
    {!game ? <div className="mt-6 grid gap-4 sm:grid-cols-2">{GAMES.map((entry) => {
      const classic = entry.id.startsWith('squirrel') || entry.id.startsWith('bear');
      return <article key={entry.id} className="arcade-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className={`arcade-card-art arcade-card-${entry.id}`}>
          {classic ? <img src={`/models/mascots/${entry.id.startsWith('squirrel') ? 'squirrel' : 'bear'}-poster.webp`} alt="" width="88" height="88" /> : <span className="arcade-card-emoji" aria-hidden="true">{entry.icon}</span>}
          <span aria-hidden="true">{entry.icon}</span>
        </div>
        <h2 className="mt-3 text-xl font-black">{entry.name}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{entry.description}</p>
        <button disabled={!adminPlay && wallet.tickets < 1} onClick={() => start(entry.id)} className="mt-5 rounded-2xl bg-violet-600 px-6 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">{adminPlay ? 'Chơi thử · Admin' : 'Chơi · 1 vé'}</button>
      </article>;
    })}</div> : <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">{title}</h2><p className="font-bold text-violet-700 dark:text-violet-300">⭐ {points} điểm · Màn {game === 'squirrel-maze' ? mazeLevel : game === 'bear-climb' ? climbCelebration ? Math.ceil(points / 12) : Math.floor(points / 12) + 1 : Math.floor(points / 8) + 1} · ⏱️ {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</p></div><button onClick={stop} className="rounded-xl border border-slate-300 px-4 py-2 font-bold dark:border-slate-600">Kết thúc lượt chơi</button></div>
      {(game === 'squirrel-catch' || game === 'bear-catch') && <>
        <p className="mt-5 text-center font-semibold">Dùng phím ← → hoặc chạm ô bên dưới để hứng {game === 'squirrel-catch' ? 'hạt dẻ' : 'mật ong'}.</p>
        {game === 'squirrel-catch' ? (
          <div className="mx-auto mt-4 max-w-2xl">
            <SquirrelCatch3D lane={lane} itemLane={item.lane} itemRow={item.row} points={points} hit={catchResult === 'hit'} />
          </div>
        ) : (
          <div className="mx-auto mt-4 max-w-2xl">
            <BearCatch3D lane={lane} itemLane={item.lane} itemRow={item.row} points={points} hit={catchResult === 'hit'} />
          </div>
        )}
        <p role="status" aria-live="polite" className={`mt-3 min-h-6 text-center font-black ${catchResult === 'hit' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>{catchFeedback || 'Giúp bạn nhỏ đứng ngay dưới vật đang rơi nhé!'}</p>
        <div className="mx-auto mt-3 grid max-w-md grid-cols-5 gap-1">{Array.from({ length: 5 }, (_, i) => <button key={i} onClick={() => { laneRef.current = i; setLane(i); }} className="rounded-xl bg-violet-100 py-3 font-black text-violet-800 focus:ring-4 focus:ring-violet-400 dark:bg-violet-900 dark:text-white" aria-label={`Di chuyển tới ô ${i + 1}`}>{i + 1}</button>)}</div>
      </>}
      {game === 'squirrel-maze' && <><p className="mt-5 text-center font-semibold">Dùng phím mũi tên hoặc các nút để đưa Sóc 🐿️ về nhà 🏡.</p><div className="mx-auto mt-4 max-w-2xl"><SquirrelMaze3D maze={maze} position={position} /></div><div className="mx-auto mt-4 grid w-48 grid-cols-3 gap-2">{[['', 0, 0], ['↑', 0, -1], ['', 0, 0], ['←', -1, 0], ['↓', 0, 1], ['→', 1, 0]].map(([label, dx, dy], i) => label ? <button key={i} onClick={() => move(Number(dx), Number(dy))} className="rounded-xl bg-emerald-600 py-3 text-xl font-black text-white">{label}</button> : <span key={i} />)}</div>{finished && <p className="mt-5 text-center text-xl font-black text-emerald-700">Sóc đã về nhà! Đang mở màn tiếp theo… 🎉</p>}</>}
      {game === 'bear-climb' && <div className="mt-6 text-center">
        <div className="mx-auto max-w-2xl"><BearClimb3D step={points % 12} level={climbCelebration ? Math.ceil(points / 12) : Math.floor(points / 12) + 1} celebration={climbCelebration} /></div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm font-black sm:text-base"><span className="rounded-full bg-amber-100 px-4 py-2 text-amber-900 dark:bg-amber-950 dark:text-amber-200">🌿 Cành {climbCelebration ? 12 : points % 12} / 12</span><span className="rounded-full bg-sky-100 px-4 py-2 text-sky-900 dark:bg-sky-950 dark:text-sky-200">🍯 Đã lấy {Math.floor(points / 12)} hũ mật</span></div>
        <p className="mt-4 font-semibold">Giúp Gấu chọn cành trái rồi cành phải để leo tới tổ mật. Dùng phím ← → hoặc chạm nút.</p>
        <p role="status" aria-live="polite" className={`mt-3 min-h-7 font-black ${climbFeedback.startsWith('Chưa') ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>{climbFeedback || (points % 2 === 0 ? 'Cành tiếp theo ở bên trái.' : 'Cành tiếp theo ở bên phải.')}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3"><button disabled={climbCelebration} onClick={() => climb('left')} className={`climb-button rounded-2xl px-6 py-4 text-lg font-black text-white disabled:opacity-60 ${points % 2 === 0 ? 'bg-emerald-600' : 'bg-emerald-800'}`}>← Cành trái</button><button disabled={climbCelebration} onClick={() => climb('right')} className={`climb-button rounded-2xl px-6 py-4 text-lg font-black text-white disabled:opacity-60 ${points % 2 === 1 ? 'bg-amber-500' : 'bg-amber-700'}`}>Cành phải →</button></div>
      </div>}
      {game && EXTRA_GAMES.includes(game as ExtraGameId) && <div className="mt-6">
        <ExtraMiniGames game={game as ExtraGameId} onScore={setPoints} />
      </div>}
    </div>}
    <p className="mt-6 text-center text-sm font-semibold text-slate-500">{adminPlay ? 'Đang ở chế độ Admin play: chơi thử không trừ vé trong phiên trình duyệt này.' : 'Vé và tiến độ lưu trên thiết bị này. Khi kết thúc hoặc hết giờ, vé đã dùng không được hoàn lại.'}</p>
  </section>;
}
