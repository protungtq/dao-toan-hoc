import { useEffect, useRef, useState } from 'react';
import {
  endTicketGame,
  readAdminPlayMode,
  readTickets,
  setAdminPlayMode,
  startTicketGame,
  type TicketState,
} from '../lib/minigameTickets';
import SquirrelCatch3D from './minigames/SquirrelCatch3D';
import ExtraMiniGames from './minigames/ExtraMiniGames';
import { BearCatch3D, SquirrelMaze3D } from './minigames/LegacyGames3D';
import { SquirrelMazeGame } from './minigames/SquirrelMazeGame';
import { MemoryGame } from './minigames/MemoryGame';
import { ReflexMathGame } from './minigames/ReflexMathGame';
import { SnakeGame } from './minigames/SnakeGame';
import { SpaceShipGame } from './minigames/SpaceShipGame';
import { BrickBreakerGame } from './minigames/BrickBreakerGame';
import { BubbleMathGame } from './minigames/BubbleMathGame';
import { MathRacerGame } from './minigames/MathRacerGame';
import { WhackMathGame } from './minigames/WhackMathGame';
import { BalanceScaleGame } from './minigames/BalanceScaleGame';
import { playMiniGameSound } from '../lib/minigameSounds';
import './MiniGameArcade.css';

type GameId =
  | 'space-ship'
  | 'bubble-math'
  | 'brick-breaker'
  | 'math-racer'
  | 'whack-math'
  | 'balance-scale'
  | 'squirrel-catch'
  | 'bear-catch'
  | 'squirrel-maze'
  | 'bear-climb'
  | 'maze-2d'
  | 'memory-card'
  | 'reflex-math'
  | 'snake-canvas'
  | 'snake'
  | 'match3'
  | 'sudoku'
  | '2048'
  | 'flappy';

type ExtraGameId = 'snake' | 'match3' | 'sudoku' | '2048' | 'flappy';
const EXTRA_GAMES: ExtraGameId[] = ['snake', 'match3', 'sudoku', '2048', 'flappy'];

const GAME_KEY = 'trang-toan:minigame-active:v1';

const GAME_CATEGORIES: { id: string; name: string; icon: string }[] = [
  { id: 'all', name: 'Tất cả trò chơi', icon: '🎮' },
  { id: 'mascots', name: 'Sóc & Gấu', icon: '🐿️' },
  { id: 'math-brain', name: 'Trí tuệ & Toán', icon: '🧠' },
  { id: 'arcade', name: 'Arcade vũ trụ & hành động', icon: '🚀' },
];

function getCategoryForGame(id: GameId): string {
  if (['squirrel-catch', 'bear-catch', 'squirrel-maze', 'bear-climb', 'maze-2d'].includes(id)) {
    return 'mascots';
  }
  if (['reflex-math', 'memory-card', 'sudoku', '2048', 'bubble-math', 'whack-math', 'balance-scale'].includes(id)) {
    return 'math-brain';
  }
  return 'arcade';
}

const GAMES: { id: GameId; name: string; icon: string; description: string; controls: string[] }[] = [
  { id: 'space-ship', name: 'Phi thuyền không gian', icon: '🚀', description: 'Lái tàu vũ trụ lượn qua ngân hà, bắn thiên thạch, nhặt sao và khiên bảo vệ.', controls: ['🎮 TV / Remote', '⌨️ Phím', '📱 Cảm ứng', '🖱️ Chuột'] },
  { id: 'math-racer', name: 'Đua xe tính nhanh', icon: '🏎️', description: 'Lái siêu xe vượt 3 làn cao tốc, lao qua đúng cổng đáp án để bứt tốc Turbo Nitro.', controls: ['🎮 TV / Remote', '⌨️ Phím ← → hoặc 1–3', '📱 Chạm', '🖱️ Chuột'] },
  { id: 'whack-math', name: 'Chuột chũi số học', icon: '🐹', description: 'Đập nhanh các chú chuột chũi mang số đúng quy tắc toán học (chẵn, lẻ, bội số) và né bom.', controls: ['🎮 Phím số TV 1–9', '⌨️ Phím số 1–9', '📱 Chạm', '🖱️ Chuột'] },
  { id: 'balance-scale', name: 'Cân thăng bằng khối lượng', icon: '⚖️', description: 'Cân đo vật phẩm bằng cách chọn và đặt đúng các quả cân để đĩa cân thăng bằng tuyệt đối.', controls: ['🎮 TV / Phím 1–5', '⌨️ Phím số 1–5', '📱 Chạm', '🖱️ Chuột'] },
  { id: 'bubble-math', name: 'Bong bóng số học', icon: '🎈', description: 'Bắn vỡ bong bóng số chẵn, lẻ hoặc phép tính. Phản xạ nhanh, cộng điểm liên hoàn.', controls: ['🎮 Phím số TV', '⌨️ Phím 1–5', '📱 Chạm', '🖱️ Chuột'] },
  { id: 'brick-breaker', name: 'Bóng nảy phá gạch', icon: '🧱', description: 'Trượt thanh đỡ bóng nảy phá vỡ các khối gạch màu và nhặt năng lượng mở rộng.', controls: ['🎮 TV / Remote', '⌨️ Phím', '📱 Cảm ứng', '🖱️ Chuột'] },
  { id: 'squirrel-catch', name: 'Sóc hứng hạt dẻ', icon: '🐿️', description: 'Di chuyển Sóc nhanh nhẹn qua các làn để đón trọn từng hạt dẻ rơi.', controls: ['🎮 TV', '⌨️ Phím 1–5', '📱 Chạm'] },
  { id: 'bear-catch', name: 'Gấu hứng mật ong', icon: '🐻', description: 'Giúp chú Gấu Nâu đáng yêu hứng từng hũ mật ong vàng óng.', controls: ['🎮 TV', '⌨️ Phím 1–5', '📱 Chạm'] },
  { id: 'squirrel-maze', name: 'Sóc tìm đường về nhà 3D', icon: '🏡', description: 'Dẫn Sóc đi qua mê cung đá 3D vượt chướng ngại về tổ an toàn.', controls: ['🎮 TV / D-pad', '⌨️ Mũi tên', '📱 Chạm'] },
  { id: 'bear-climb', name: 'Gấu leo cây lấy mật', icon: '🌳', description: 'Chọn đúng cành cây để Gấu leo cao lấy tổ ong ngọt ngào.', controls: ['🎮 TV', '⌨️ Phím ← →', '📱 Chạm'] },
  { id: 'maze-2d', name: 'Sóc vượt mê cung', icon: '🌰', description: 'Ăn hạt dẻ và tìm đường về tổ nhanh nhất trên bản đồ 2D.', controls: ['🎮 TV', '⌨️ Mũi tên', '📱 Vuốt/D-pad'] },
  { id: 'memory-card', name: 'Lật thẻ trí nhớ', icon: '🃏', description: 'Ghi nhớ vị trí và ghép các cặp hình toán học giống nhau.', controls: ['🎮 TV', '⌨️ Phím số', '📱 Chạm', '🖱️ Chuột'] },
  { id: 'reflex-math', name: 'Phản xạ toán học', icon: '⚡', description: 'Quyết định đúng hay sai thần tốc trước khi thanh thời gian cạn.', controls: ['🎮 TV / OK', '⌨️ Phím ← →', '📱 Chạm'] },
  { id: 'snake-canvas', name: 'Rắn săn mồi cổ điển', icon: '🐍', description: 'Ăn táo đỏ, săn sao vàng và thiết lập kỷ lục điểm.', controls: ['🎮 TV', '⌨️ Mũi tên', '📱 D-pad'] },
  { id: 'snake', name: 'Rắn săn mồi mượt mà', icon: '🍏', description: 'Điều khiển rắn ăn táo và đừng tự cắn mình.', controls: ['🎮 TV', '⌨️ Mũi tên', '📱 D-pad'] },
  { id: 'match3', name: 'Vườn trái cây Match-3', icon: '💎', description: 'Đổi chỗ để ghép ít nhất 3 viên kim cương giống nhau.', controls: ['📱 Chạm', '🖱️ Chuột', '🎮 TV'] },
  { id: 'sudoku', name: 'Sudoku thông minh', icon: '🔢', description: 'Điền số còn thiếu vào các ô trống của bảng Sudoku.', controls: ['📱 Chạm', '🖱️ Chuột', '⌨️ Phím'] },
  { id: '2048', name: 'Ghép số 2048', icon: '🧩', description: 'Ghép các ô số giống nhau để tạo số lớn hơn.', controls: ['🎮 TV', '⌨️ Mũi tên', '📱 Vuốt'] },
  { id: 'flappy', name: 'Chim bay lượn', icon: '🐦', description: 'Giữ chú chim bay qua các khe chướng ngại vật.', controls: ['🎮 Phím OK', '⌨️ Phím Space', '📱 Chạm'] },
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
  return [rows[y]?.indexOf('S') ?? 1, y >= 0 ? y : 1];
}

export default function MiniGameArcade() {
  const [mounted, setMounted] = useState(false);
  const [wallet, setWallet] = useState<TicketState>({ tickets: 3, progress: 0, activeUntil: 0 });
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [ticketModal, setTicketModal] = useState(false);

  const maze = mazeFor(mazeLevel);
  const gameRef = useRef<GameId | null>(null);
  const laneRef = useRef(2);
  const itemRef = useRef(item);
  const doneRef = useRef(false);
  const moveRef = useRef<(dx: number, dy: number) => void>(() => {});
  const climbRef = useRef<(side: 'left' | 'right') => void>(() => {});
  const levelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Chỉ chạy sau khi trình duyệt mount hoàn toàn
  useEffect(() => {
    setMounted(true);
    setWallet(readTickets());
    setAdminPlay(readAdminPlayMode());

    const update = () => setWallet(readTickets());
    const updateAdmin = () => setAdminPlay(readAdminPlayMode());
    window.addEventListener('trang-toan:tickets-updated', update);
    window.addEventListener('storage', update);
    window.addEventListener('trang-toan:admin-play-updated', updateAdmin);

    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'play') setAdminPlayMode(true);
    if (params.get('admin') === 'off') setAdminPlayMode(false);
    setAdminPlay(readAdminPlayMode());

    try {
      const stored = localStorage.getItem(GAME_KEY);
      if (stored && GAMES.some((entry) => entry.id === stored) && readTickets().activeUntil > Date.now()) {
        gameRef.current = stored as GameId;
        setGame(stored as GameId);
      } else if (stored) {
        localStorage.removeItem(GAME_KEY);
        endTicketGame();
      }
    } catch {
      // Bỏ qua lỗi truy cập storage
    }

    return () => {
      window.removeEventListener('trang-toan:tickets-updated', update);
      window.removeEventListener('storage', update);
      window.removeEventListener('trang-toan:admin-play-updated', updateAdmin);
    };
  }, []);

  useEffect(() => {
    if (game) {
      document.documentElement.dataset.minigamePlaying = 'true';
    } else {
      delete document.documentElement.dataset.minigamePlaying;
    }
    return () => {
      delete document.documentElement.dataset.minigamePlaying;
    };
  }, [game]);

  useEffect(() => {
    const handleTvBack = (e: KeyboardEvent) => {
      if (!gameRef.current) return;
      const isBackKey =
        e.key === 'Escape' ||
        e.key === 'BrowserBack' ||
        e.key === 'GoBack' ||
        e.keyCode === 4 ||
        e.keyCode === 461 ||
        e.keyCode === 10009;
      if (isBackKey) {
        e.preventDefault();
        stop();
      }
    };
    window.addEventListener('keydown', handleTvBack);
    return () => window.removeEventListener('keydown', handleTvBack);
  }, []);

  function stop() {
    if (levelTimer.current) clearTimeout(levelTimer.current);
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    levelTimer.current = null;
    feedbackTimer.current = null;
    gameRef.current = null;
    setGame(null);
    try {
      localStorage.removeItem(GAME_KEY);
    } catch {}
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
          playMiniGameSound('collect');
        } else {
          setCatchFeedback('Suýt nữa! Di chuyển để đón lượt tiếp theo.');
          setCatchResult('miss');
          playMiniGameSound('miss');
        }
        itemRef.current = { lane: Math.floor(Math.random() * 5), row: 0 };
      } else itemRef.current = { ...current, row: current.row + 1 };
      setItem({ ...itemRef.current });
    }, Math.max(310, 650 - Math.floor(points / 8) * 35));
    return () => window.clearInterval(tick);
  }, [game, points]);

  function start(id: GameId) {
    const currentTickets = readTickets();
    if (!adminPlay && currentTickets.tickets < 1 && currentTickets.activeUntil <= Date.now()) {
      setTicketModal(true);
      return;
    }

    const state = startTicketGame(adminPlay);
    if (!state) return;
    setWallet(state);
    try {
      localStorage.setItem(GAME_KEY, id);
    } catch {}
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
        playMiniGameSound('success');
        levelTimer.current = setTimeout(() => {
          if (gameRef.current !== 'squirrel-maze') return;
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
    if (gameRef.current !== 'bear-climb' || climbCelebration) return;
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    const expected = points % 2 === 0 ? 'left' : 'right';
    if (side !== expected) {
      playMiniGameSound('miss');
      setClimbFeedback('Chưa đúng cành, thử phía bên kia nhé!');
      feedbackTimer.current = setTimeout(() => setClimbFeedback(''), 850);
      return;
    }
    const next = points + 1;
    setPoints(next);
    playMiniGameSound(next % 12 === 0 ? 'success' : 'step');
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
        if (gameRef.current === 'squirrel-maze') {
          event.preventDefault();
          moveRef.current(...directions[key]);
        }
        if (gameRef.current === 'bear-climb' && (key === 'ArrowLeft' || key === 'ArrowRight')) {
          event.preventDefault();
          climbRef.current(key === 'ArrowLeft' ? 'left' : 'right');
        }
        if (gameRef.current.endsWith('catch')) {
          event.preventDefault();
          const delta = key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0;
          laneRef.current = Math.max(0, Math.min(4, laneRef.current + delta));
          setLane(laneRef.current);
        }
      }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, []);

  if (!mounted) {
    return <div className="p-12 text-center text-slate-500 font-bold">Đang tải khu vui chơi...</div>;
  }

  const title = GAMES.find((entry) => entry.id === game)?.name;
  const filteredGames = selectedCategory === 'all'
    ? GAMES
    : GAMES.filter((entry) => getCategoryForGame(entry.id) === selectedCategory);

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 md:px-8" aria-label="Khu minigame">
      {/* Banner Arcade Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-600 p-6 text-white shadow-xl md:p-8">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black tracking-wide text-violet-200 uppercase">
              <span>🎟️ Phần thưởng vui học</span>
              <span>·</span>
              <span>3 phút / vé</span>
            </div>
            <h1 className="mt-2 text-2xl font-black md:text-3xl lg:text-4xl tracking-tight">Khu vui chơi Sóc và Gấu</h1>
            <p className="mt-2 max-w-xl text-sm md:text-base font-medium text-white/90 leading-relaxed">
              Cứ 3 lượt luyện tập đạt từ 80% điểm trở lên sẽ nhận được 1 vé vui chơi. Giữ tối đa 3 vé cùng lúc!
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur-md border border-white/20">
              <span className="text-xl">🎟️</span>
              <div>
                <div className="text-[11px] font-semibold text-white/80">VÉ HIỆN CÓ</div>
                <div className="text-lg font-black">{wallet.tickets} / 3 vé</div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5 backdrop-blur-md border border-white/20">
              <span className="text-xl">⭐</span>
              <div>
                <div className="text-[11px] font-semibold text-white/80">TIẾN ĐỘ VÉ TIẾP THEO</div>
                <div className="text-lg font-black">{wallet.progress} / 3 bài đạt</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!game ? (
        <>
          {/* Segmented Filter Categories */}
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 dark:border-slate-800 dark:bg-slate-900/80">
            {GAME_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white text-violet-700 shadow-xs dark:bg-slate-800 dark:text-violet-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-xs opacity-60">
                  ({cat.id === 'all' ? GAMES.length : GAMES.filter((g) => getCategoryForGame(g.id) === cat.id).length})
                </span>
              </button>
            ))}
          </div>

          {/* Grid Games Cards */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((entry) => {
              const classic = entry.id.startsWith('squirrel') || entry.id.startsWith('bear');
              return (
                <article
                  key={entry.id}
                  className="arcade-card group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <div className={`arcade-card-art arcade-card-${entry.id}`}>
                      {classic ? (
                        <img
                          src={`/models/mascots/${entry.id.startsWith('squirrel') ? 'squirrel' : 'bear'}-poster.webp`}
                          alt=""
                          width="88"
                          height="88"
                          className="transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <span className="arcade-card-emoji text-3xl" aria-hidden="true">{entry.icon}</span>
                      )}
                      <span aria-hidden="true" className="text-3xl">{entry.icon}</span>
                    </div>

                    <h2 className="mt-3.5 text-lg font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {entry.name}
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {entry.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {entry.controls.map((ctrl, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300"
                        >
                          {ctrl}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={!adminPlay && wallet.tickets < 1 && wallet.activeUntil <= Date.now()}
                    onClick={() => start(entry.id)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 px-4 font-black text-white shadow-md shadow-violet-600/20 transition-all hover:bg-violet-500 active:scale-98 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>▶</span>
                    <span>{wallet.tickets > 0 || wallet.activeUntil > Date.now() || adminPlay ? 'Bắt đầu chơi ngay' : 'Cần 1 vé để chơi'}</span>
                  </button>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        /* Active Game Arena */
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900 md:p-6">
          {/* Game Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">ĐANG CHƠI</div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{title}</h2>
              <div className="mt-1 flex items-center gap-3 text-sm font-bold text-violet-700 dark:text-violet-300">
                <span>⭐ {points} điểm</span>
                <span>·</span>
                <span>
                  Màn{' '}
                  {game === 'squirrel-maze'
                    ? mazeLevel
                    : game === 'bear-climb'
                    ? climbCelebration
                      ? Math.ceil(points / 12)
                      : Math.floor(points / 12) + 1
                    : Math.floor(points / 8) + 1}
                </span>
                <span>·</span>
                <span className="tabular-nums font-mono">
                  ⏱ {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
                </span>
              </div>
            </div>

            <button
              onClick={stop}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <span>✕</span>
              <span>Kết thúc lượt chơi</span>
            </button>
          </div>

          {/* Catch Games */}
          {(game === 'squirrel-catch' || game === 'bear-catch') && (
            <div className="mt-4">
              <p className="text-center font-semibold text-slate-700 dark:text-slate-300">
                Dùng phím ← → hoặc bấm vào các ô 1–5 bên dưới để hứng {game === 'squirrel-catch' ? 'hạt dẻ 🌰' : 'mật ong 🍯'}.
              </p>
              {game === 'squirrel-catch' ? (
                <div className="mx-auto mt-4 max-w-2xl">
                  <SquirrelCatch3D lane={lane} itemLane={item.lane} itemRow={item.row} points={points} hit={catchResult === 'hit'} />
                </div>
              ) : (
                <div className="mx-auto mt-4 max-w-2xl">
                  <BearCatch3D lane={lane} itemLane={item.lane} itemRow={item.row} points={points} hit={catchResult === 'hit'} />
                </div>
              )}
              <p
                role="status"
                aria-live="polite"
                className={`mt-3 min-h-6 text-center font-black ${
                  catchResult === 'hit' ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                }`}
              >
                {catchFeedback || 'Giúp bạn nhỏ đứng ngay dưới vật đang rơi nhé!'}
              </p>
              <div className="minigame-lane-controls mx-auto mt-3 grid max-w-md grid-cols-5 gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      laneRef.current = i;
                      setLane(i);
                    }}
                    className={`rounded-2xl py-3 font-black transition-all ${
                      lane === i
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-violet-100 text-violet-800 hover:bg-violet-200 dark:bg-violet-900/60 dark:text-white'
                    }`}
                    aria-label={`Di chuyển tới ô ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bear Climb Game */}
          {game === 'bear-climb' && (
            <div className="mx-auto mt-4 max-w-2xl text-center">
              <p className="text-center font-semibold text-slate-700 dark:text-slate-300">
                Dùng phím ← → hoặc bấm nút bên dưới để chọn đúng cành cây giúp Gấu 🐻 trèo lên lấy mật 🍯.
              </p>

              <div
                className={`climb-scene mx-auto mt-4 climb-scene-${Math.floor(points / 12) % 3} ${
                  climbCelebration ? 'climb-scene-win' : ''
                } ${climbFeedback.includes('Chưa đúng') ? 'climb-scene-miss' : ''}`}
                role="img"
                aria-label="Gấu leo cây"
              >
                <div className="climb-sun" aria-hidden="true" />
                <div className="climb-cloud climb-cloud-left" aria-hidden="true" />
                <div className="climb-cloud climb-cloud-right" aria-hidden="true" />
                <div className="climb-hill climb-hill-left" aria-hidden="true" />
                <div className="climb-hill climb-hill-right" aria-hidden="true" />
                <div className="climb-ground" aria-hidden="true" />

                <div className="climb-tree" aria-hidden="true">
                  <div className="climb-canopy climb-canopy-a" />
                  <div className="climb-canopy climb-canopy-b" />
                  <div className="climb-canopy climb-canopy-c" />
                  <div className="climb-trunk" />
                  {Array.from({ length: 6 }, (_, i) => {
                    const isLeft = i % 2 === 0;
                    const isPassed = (points % 12) > i;
                    return (
                      <div
                        key={i}
                        className={`climb-branch ${isLeft ? 'climb-branch-left' : 'climb-branch-right'} ${
                          isPassed ? 'climb-branch-passed' : ''
                        }`}
                        style={{ bottom: `${16 + i * 13}%` }}
                      >
                        <span>🍃</span>
                      </div>
                    );
                  })}
                </div>

                <div className="climb-hive" aria-label="Tổ ong">
                  🍯<span className="climb-bee" aria-hidden="true">🐝</span>
                </div>

                <div
                  className="climb-bear"
                  style={{
                    bottom: `${12 + ((points % 12) / 12) * 62}%`,
                    left: points % 2 === 0 ? 'calc(50% - 32px)' : 'calc(50% + 32px)',
                  }}
                  aria-label="Gấu Nâu"
                >
                  <img src="/models/mascots/bear-poster.webp" alt="Gấu Nâu" draggable={false} />
                </div>

                {climbCelebration && (
                  <div className="climb-confetti" aria-hidden="true">
                    🎉 🍯 LẤY ĐƯỢC MẬT RỒI! 🍯 🎉
                  </div>
                )}
              </div>

              <p
                role="status"
                aria-live="polite"
                className={`mt-4 min-h-6 text-center font-black ${
                  climbFeedback.includes('Chưa đúng')
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {climbFeedback || (points % 2 === 0 ? '👈 Bấm cành Trái để bắt đầu leo!' : '👉 Tiếp theo là cành Phải!')}
              </p>

              <div className="minigame-climb-controls mx-auto mt-4 flex max-w-sm justify-center gap-3">
                <button
                  type="button"
                  onClick={() => climb('left')}
                  disabled={climbCelebration}
                  className="climb-button flex-1 rounded-2xl bg-amber-500 py-3.5 px-4 text-base font-black text-white shadow-md hover:bg-amber-400 active:scale-95 transition"
                >
                  👈 Cành Trái
                </button>
                <button
                  type="button"
                  onClick={() => climb('right')}
                  disabled={climbCelebration}
                  className="climb-button flex-1 rounded-2xl bg-amber-500 py-3.5 px-4 text-base font-black text-white shadow-md hover:bg-amber-400 active:scale-95 transition"
                >
                  Cành Phải 👉
                </button>
              </div>
            </div>
          )}

          {/* Squirrel Maze 3D */}
          {game === 'squirrel-maze' && (
            <div className="mt-4">
              <p className="text-center font-semibold text-slate-700 dark:text-slate-300">
                Dùng phím mũi tên hoặc các nút bên dưới để đưa Sóc 🐿️ về nhà 🏡.
              </p>
              <div className="mx-auto mt-4 max-w-2xl">
                <SquirrelMaze3D maze={maze} position={position} />
              </div>
              <div className="minigame-maze-controls mx-auto mt-4 grid w-48 grid-cols-3 gap-2">
                {[['', 0, 0], ['↑', 0, -1], ['', 0, 0], ['←', -1, 0], ['↓', 0, 1], ['→', 1, 0]].map(([label, dx, dy], i) => (
                  label ? (
                    <button
                      key={i}
                      type="button"
                      onClick={() => move(Number(dx), Number(dy))}
                      className="rounded-2xl bg-emerald-600 py-3.5 text-xl font-black text-white shadow-md hover:bg-emerald-500 active:scale-95 transition"
                    >
                      {label}
                    </button>
                  ) : <span key={i} />
                ))}
              </div>
              {finished && (
                <p className="mt-4 text-center text-xl font-black text-emerald-700 dark:text-emerald-400 animate-bounce">
                  Sóc đã về nhà an toàn! Đang mở màn tiếp theo… 🎉
                </p>
              )}
            </div>
          )}

          {/* Phi thuyền không gian */}
          {game === 'space-ship' && (
            <div className="mt-4">
              <SpaceShipGame onScore={setPoints} onFinish={(s) => setPoints(s)} onExit={stop} />
            </div>
          )}

          {/* Bong bóng số học */}
          {game === 'bubble-math' && (
            <div className="mt-4">
              <BubbleMathGame onScore={setPoints} onFinish={(s) => setPoints(s)} onExit={stop} />
            </div>
          )}

          {/* Bóng nảy phá gạch */}
          {game === 'brick-breaker' && (
            <div className="mt-4">
              <BrickBreakerGame onScore={setPoints} onFinish={(s) => setPoints(s)} onExit={stop} />
            </div>
          )}

          {/* Đua xe tính nhanh */}
          {game === 'math-racer' && (
            <div className="mt-4">
              <MathRacerGame onScore={setPoints} onFinish={(s) => setPoints(s)} onExit={stop} />
            </div>
          )}

          {/* Chuột chũi số học */}
          {game === 'whack-math' && (
            <div className="mt-4">
              <WhackMathGame onScore={setPoints} onFinish={(s) => setPoints(s)} onExit={stop} />
            </div>
          )}

          {/* Cân thăng bằng khối lượng */}
          {game === 'balance-scale' && (
            <div className="mt-4">
              <BalanceScaleGame onScore={setPoints} onFinish={(s) => setPoints(s)} onExit={stop} />
            </div>
          )}

          {/* 4 Games độc lập */}
          {game === 'maze-2d' && (
            <div className="mt-6">
              <SquirrelMazeGame onScore={setPoints} onFinish={(s) => setPoints(s)} onExit={stop} />
            </div>
          )}

          {game === 'memory-card' && (
            <div className="mt-6">
              <MemoryGame onScore={setPoints} onFinish={(s) => setPoints(s)} onExit={stop} />
            </div>
          )}

          {game === 'reflex-math' && (
            <div className="mt-6">
              <ReflexMathGame onScore={setPoints} onFinish={(s) => setPoints(s)} onExit={stop} />
            </div>
          )}

          {game === 'snake-canvas' && (
            <div className="mt-6">
              <SnakeGame onScore={setPoints} onFinish={(s) => setPoints(s)} onExit={stop} />
            </div>
          )}

          {/* Nhóm Extra Games */}
          {game && EXTRA_GAMES.includes(game as ExtraGameId) && (
            <div className="mt-6">
              <ExtraMiniGames game={game as ExtraGameId} onScore={setPoints} />
            </div>
          )}
        </div>
      )}

      {/* Ticket Modal Reminder */}
      {ticketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-900">
            <span className="text-5xl">🎟️</span>
            <h3 className="mt-3 text-xl font-black text-slate-900 dark:text-white">Bé đã hết vé chơi hôm nay!</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Hãy hoàn thành thêm các bài tập toán đạt từ 80% điểm trở lên để nhận thêm vé vui chơi nhé.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              <a
                href="/#chon-lop"
                className="rounded-2xl bg-violet-600 py-3 px-4 font-black text-white hover:bg-violet-500 transition"
              >
                Đi tới các bài luyện tập
              </a>
              <button
                type="button"
                onClick={() => setTicketModal(false)}
                className="rounded-2xl border border-slate-300 py-2.5 px-4 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
        💡 Mỗi bài luyện tập đạt điểm giỏi sẽ tích lũy thêm vé vui chơi giải trí lành mạnh. Chúc bé học tốt và thư giãn thật vui cùng bạn Sóc & Gấu!
      </p>
    </section>
  );
}