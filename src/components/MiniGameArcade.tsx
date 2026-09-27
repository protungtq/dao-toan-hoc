import { useEffect, useRef, useState } from 'react';
import { endTicketGame, readTickets, startTicketGame, type TicketState } from '../lib/minigameTickets';

type GameId = 'squirrel-catch' | 'bear-catch' | 'squirrel-maze' | 'bear-climb';
const GAME_KEY = 'trang-toan:minigame-active:v1';
const GAMES: { id: GameId; name: string; icon: string; description: string }[] = [
  { id: 'squirrel-catch', name: 'Sóc hứng hạt dẻ', icon: '🐿️', description: 'Di chuyển Sóc để đón hạt dẻ.' },
  { id: 'bear-catch', name: 'Gấu hứng mật ong', icon: '🐻', description: 'Giúp Gấu hứng những hũ mật.' },
  { id: 'squirrel-maze', name: 'Sóc tìm đường về nhà', icon: '🏡', description: 'Dẫn Sóc đi qua mê cung.' },
  { id: 'bear-climb', name: 'Gấu leo cây lấy mật', icon: '🌳', description: 'Chọn đúng cành để Gấu leo cao.' },
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

export default function MiniGameArcade() {
  const [wallet, setWallet] = useState<TicketState>(() => readTickets());
  const [game, setGame] = useState<GameId | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [points, setPoints] = useState(0);
  const [lane, setLane] = useState(2);
  const [item, setItem] = useState({ lane: 1, row: 0 });
  const [position, setPosition] = useState([1, 1]);
  const [finished, setFinished] = useState(false);
  const [mazeLevel, setMazeLevel] = useState(1);
  const maze = mazeFor(mazeLevel);
  const gameRef = useRef<GameId | null>(null);
  const laneRef = useRef(2);
  const itemRef = useRef(item);
  const doneRef = useRef(false);
  const moveRef = useRef<(dx: number, dy: number) => void>(() => {});
  const levelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    window.addEventListener('trang-toan:tickets-updated', update);
    window.addEventListener('storage', update);
    const stored = localStorage.getItem(GAME_KEY);
    if (stored && GAMES.some((entry) => entry.id === stored) && readTickets().activeUntil > Date.now()) {
      gameRef.current = stored as GameId;
      setGame(stored as GameId);
    } else if (stored) {
      localStorage.removeItem(GAME_KEY);
      endTicketGame();
    }
    return () => { if (levelTimer.current) clearTimeout(levelTimer.current); window.removeEventListener('trang-toan:tickets-updated', update); window.removeEventListener('storage', update); };
  }, []);

  function stop() {
    if (levelTimer.current) clearTimeout(levelTimer.current);
    levelTimer.current = null;
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
        if (current.lane === laneRef.current) setPoints((value) => value + 1);
        itemRef.current = { lane: Math.floor(Math.random() * 5), row: 0 };
      } else itemRef.current = { ...current, row: current.row + 1 };
      setItem({ ...itemRef.current });
    }, Math.max(310, 650 - Math.floor(points / 8) * 35));
    return () => window.clearInterval(tick);
  }, [game, Math.floor(points / 8)]);

  function start(id: GameId) {
    if (readTickets().activeUntil > Date.now()) return;
    const state = startTicketGame();
    if (!state) return;
    if (state.activeUntil <= Date.now()) return;
    setWallet(state);
    localStorage.setItem(GAME_KEY, id);
    gameRef.current = id;
    setGame(id);
    setPoints(0);
    setFinished(false);
    doneRef.current = false;
    setMazeLevel(1);
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
      <div className="mt-5 flex flex-wrap gap-3 text-sm font-black"><span className="rounded-xl bg-white/20 px-4 py-2">Vé hiện có: {wallet.tickets}/3</span><span className="rounded-xl bg-white/20 px-4 py-2">Tiến độ: {wallet.progress}/3 bài đạt</span></div>
    </div>
    {!game ? <div className="mt-6 grid gap-4 sm:grid-cols-2">{GAMES.map((entry) => <article key={entry.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"><span className="text-5xl" aria-hidden="true">{entry.icon}</span><h2 className="mt-3 text-xl font-black">{entry.name}</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{entry.description}</p><button disabled={wallet.tickets < 1} onClick={() => start(entry.id)} className="mt-5 rounded-2xl bg-violet-600 px-6 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">Chơi · 1 vé</button></article>)}</div> : <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">{title}</h2><p className="font-bold text-violet-700 dark:text-violet-300">⭐ {points} điểm · Màn {game === 'squirrel-maze' ? mazeLevel : game === 'bear-climb' ? Math.floor(points / 12) + 1 : Math.floor(points / 8) + 1} · ⏱️ {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</p></div><button onClick={stop} className="rounded-xl border border-slate-300 px-4 py-2 font-bold dark:border-slate-600">Kết thúc lượt chơi</button></div>
      {(game === 'squirrel-catch' || game === 'bear-catch') && <><p className="mt-5 text-center font-semibold">Dùng phím ← → hoặc chạm ô bên dưới để hứng {game === 'squirrel-catch' ? 'hạt dẻ' : 'mật ong'}.</p><div className="mx-auto mt-4 grid max-w-md grid-cols-5 gap-1 rounded-2xl bg-sky-100 p-3 dark:bg-slate-800">{Array.from({ length: 30 }, (_, i) => { const x = i % 5, y = Math.floor(i / 5); return <div key={i} className="grid aspect-square place-items-center rounded-xl bg-white text-2xl dark:bg-slate-700 sm:text-3xl">{item.lane === x && item.row === y ? game === 'squirrel-catch' ? '🌰' : '🍯' : y === 5 && lane === x ? game === 'squirrel-catch' ? '🐿️' : '🐻' : ''}</div>; })}</div><div className="mx-auto mt-3 grid max-w-md grid-cols-5 gap-1">{Array.from({ length: 5 }, (_, i) => <button key={i} onClick={() => { laneRef.current = i; setLane(i); }} className="rounded-xl bg-violet-100 py-3 font-black text-violet-800 focus:ring-4 focus:ring-violet-400 dark:bg-violet-900 dark:text-white" aria-label={`Di chuyển tới ô ${i + 1}`}>{i + 1}</button>)}</div></>}
      {game === 'squirrel-maze' && <><p className="mt-5 text-center font-semibold">Dùng phím mũi tên hoặc các nút để đưa Sóc 🐿️ về nhà 🏡.</p><div className="mx-auto mt-4 grid max-w-md grid-cols-9 gap-0.5 rounded-2xl bg-emerald-200 p-2">{maze.flatMap((row, y) => [...row].map((tile, x) => <div key={`${x}-${y}`} className={`grid aspect-square place-items-center rounded text-lg sm:text-2xl ${tile === '#' ? 'bg-emerald-700' : 'bg-amber-50'}`}>{position[0] === x && position[1] === y ? '🐿️' : tile === 'H' ? '🏡' : ''}</div>))}</div><div className="mx-auto mt-4 grid w-48 grid-cols-3 gap-2">{[['', 0, 0], ['↑', 0, -1], ['', 0, 0], ['←', -1, 0], ['↓', 0, 1], ['→', 1, 0]].map(([label, dx, dy], i) => label ? <button key={i} onClick={() => move(Number(dx), Number(dy))} className="rounded-xl bg-emerald-600 py-3 text-xl font-black text-white">{label}</button> : <span key={i} />)}</div>{finished && <p className="mt-5 text-center text-xl font-black text-emerald-700">Sóc đã về nhà! Đang mở màn tiếp theo… 🎉</p>}</>}
      {game === 'bear-climb' && <div className="mt-6 text-center"><div className="rounded-3xl bg-emerald-50 p-7 text-6xl dark:bg-emerald-950">{points > 0 && points % 12 === 0 ? '🐻🍯' : '🌳🐻'}</div><p className="mt-4 text-xl font-black">Gấu đã leo {points % 12} / 12 cành của màn này</p><p className="mt-2 font-semibold">Chạm lần lượt vào cành trái và cành phải để giúp Gấu leo lấy mật!</p><div className="mt-5 flex justify-center gap-4"><button onClick={() => { if (points % 2 === 0) setPoints(points + 1); }} className="rounded-2xl bg-emerald-600 px-8 py-5 text-xl font-black text-white">← Cành trái</button><button onClick={() => { if (points % 2 === 1) setPoints(points + 1); }} className="rounded-2xl bg-amber-500 px-8 py-5 text-xl font-black text-white">Cành phải →</button></div>{points > 0 && points % 12 === 0 && <p className="mt-5 font-black text-amber-700">Gấu đã lấy được mật ong! Tiếp tục leo cây khác nhé 🍯</p>}</div>}
    </div>}
    <p className="mt-6 text-center text-sm font-semibold text-slate-500">Vé và tiến độ lưu trên thiết bị này. Khi kết thúc hoặc hết giờ, vé đã dùng không được hoàn lại.</p>
  </section>;
}
