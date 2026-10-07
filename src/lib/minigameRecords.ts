export type GameRecord = {
  gameId: string;
  gameName: string;
  gameIcon: string;
  highScore: number;
  highScoreAchievedAt: number;
  lastScore: number;
  lastPlayedAt: number;
  playCount: number;
  totalScore: number;
};

export type GameSessionHistory = {
  id: string;
  gameId: string;
  gameName: string;
  gameIcon: string;
  score: number;
  playedAt: number;
  day: string; // YYYY-MM-DD
  isNewHighScore: boolean;
};

export type MiniGameRecordsState = {
  records: Record<string, GameRecord>;
  history: GameSessionHistory[];
  totalPlays: number;
  overallHighScore: number;
};

export const MINIGAME_RECORDS_KEY = 'trang-toan:minigame-records:v2';
export const RECORDS_UPDATED_EVENT = 'trang-toan:records-updated';

function localDay(timestamp = Date.now()): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const EMPTY_STATE: MiniGameRecordsState = {
  records: {},
  history: [],
  totalPlays: 0,
  overallHighScore: 0,
};

function migrateLegacyRecords(state: MiniGameRecordsState): MiniGameRecordsState {
  if (typeof window === 'undefined') return state;
  try {
    const legacyKeys: [string, string, string, string][] = [
      ['trang-toan:spaceship-best', 'space-ship', 'Phi thuyền vượt không gian', '🚀'],
      ['trang-toan:spaceglide-best', 'space-glide', 'Phi thuyền lướt ngân hà', '🛸'],
      ['trang-toan:highway-best', 'highway-racer', 'Đua xe vượt chướng ngại', '🏎️'],
      ['trang-toan:penalty-best', 'penalty-kick', 'Đá penalty siêu cúp', '⚽'],
    ];

    let hasChanges = false;
    for (const [storageKey, gameId, name, icon] of legacyKeys) {
      const val = localStorage.getItem(storageKey);
      if (val) {
        const score = Number(val);
        if (Number.isFinite(score) && score > 0) {
          if (!state.records[gameId] || state.records[gameId].highScore < score) {
            state.records[gameId] = {
              gameId,
              gameName: name,
              gameIcon: icon,
              highScore: score,
              highScoreAchievedAt: Date.now(),
              lastScore: score,
              lastPlayedAt: Date.now(),
              playCount: Math.max(1, state.records[gameId]?.playCount || 1),
              totalScore: Math.max(score, state.records[gameId]?.totalScore || score),
            };
            hasChanges = true;
          }
        }
      }
    }
    if (hasChanges) {
      saveRecords(state);
    }
  } catch {
    // Ignore migration errors
  }
  return state;
}

export function readMiniGameRecords(): MiniGameRecordsState {
  if (typeof window === 'undefined') return { ...EMPTY_STATE };
  try {
    const raw = localStorage.getItem(MINIGAME_RECORDS_KEY);
    if (!raw) {
      return migrateLegacyRecords({ ...EMPTY_STATE });
    }
    const parsed = JSON.parse(raw) as Partial<MiniGameRecordsState>;
    const records = parsed.records && typeof parsed.records === 'object' ? parsed.records : {};
    const history = Array.isArray(parsed.history) ? parsed.history : [];
    const totalPlays = Number(parsed.totalPlays) || 0;
    const overallHighScore = Number(parsed.overallHighScore) || 0;

    return migrateLegacyRecords({
      records,
      history,
      totalPlays,
      overallHighScore,
    });
  } catch {
    return { ...EMPTY_STATE };
  }
}

function saveRecords(state: MiniGameRecordsState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MINIGAME_RECORDS_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(RECORDS_UPDATED_EVENT, { detail: state }));
  } catch {
    // Ignore storage quote errors
  }
}

export function recordGameResult(
  gameId: string,
  gameName: string,
  gameIcon: string,
  score: number
): { isNewHighScore: boolean; record: GameRecord } {
  if (typeof window === 'undefined') {
    return {
      isNewHighScore: false,
      record: {
        gameId,
        gameName,
        gameIcon,
        highScore: score,
        highScoreAchievedAt: Date.now(),
        lastScore: score,
        lastPlayedAt: Date.now(),
        playCount: 1,
        totalScore: score,
      },
    };
  }

  const state = readMiniGameRecords();
  const safeScore = Math.max(0, Math.round(score));
  const now = Date.now();

  const prevRecord = state.records[gameId];
  const prevHighScore = prevRecord ? prevRecord.highScore : 0;
  const isNewHighScore = safeScore > prevHighScore;

  const updatedRecord: GameRecord = {
    gameId,
    gameName,
    gameIcon,
    highScore: Math.max(prevHighScore, safeScore),
    highScoreAchievedAt: isNewHighScore ? now : prevRecord?.highScoreAchievedAt || now,
    lastScore: safeScore,
    lastPlayedAt: now,
    playCount: (prevRecord?.playCount || 0) + 1,
    totalScore: (prevRecord?.totalScore || 0) + safeScore,
  };

  state.records[gameId] = updatedRecord;
  state.totalPlays += 1;
  state.overallHighScore = Math.max(state.overallHighScore, safeScore);

  const newHistoryItem: GameSessionHistory = {
    id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
    gameId,
    gameName,
    gameIcon,
    score: safeScore,
    playedAt: now,
    day: localDay(now),
    isNewHighScore,
  };

  state.history = [newHistoryItem, ...state.history].slice(0, 100);

  saveRecords(state);
  return { isNewHighScore, record: updatedRecord };
}

export function getGameRecord(gameId: string): GameRecord | null {
  const state = readMiniGameRecords();
  return state.records[gameId] || null;
}

export function clearMiniGameRecords(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(MINIGAME_RECORDS_KEY);
    localStorage.removeItem('trang-toan:spaceship-best');
    localStorage.removeItem('trang-toan:spaceglide-best');
    localStorage.removeItem('trang-toan:highway-best');
    localStorage.removeItem('trang-toan:penalty-best');
    window.dispatchEvent(new CustomEvent(RECORDS_UPDATED_EVENT, { detail: EMPTY_STATE }));
  } catch {}
}

export function getGameRankTitle(highScore: number): { title: string; color: string; badge: string } {
  if (highScore >= 500) return { title: 'Huyền thoại', color: 'text-purple-600 dark:text-purple-400', badge: '👑' };
  if (highScore >= 300) return { title: 'Quán quân', color: 'text-amber-600 dark:text-amber-400', badge: '🏆' };
  if (highScore >= 150) return { title: 'Siêu sao', color: 'text-sky-600 dark:text-sky-400', badge: '🥇' };
  if (highScore >= 50) return { title: 'Cao thủ', color: 'text-emerald-600 dark:text-emerald-400', badge: '🥈' };
  if (highScore > 0) return { title: 'Tập sự', color: 'text-blue-600 dark:text-blue-400', badge: '🥉' };
  return { title: 'Chưa chơi', color: 'text-slate-400 dark:text-slate-500', badge: '⚪' };
}

export function getFavoriteGame(records: Record<string, GameRecord>): GameRecord | null {
  const list = Object.values(records);
  if (list.length === 0) return null;
  return list.reduce((best, curr) => (curr.playCount > best.playCount ? curr : best), list[0]);
}

export function getOverallArcadeRank(totalPlays: number, overallHighScore: number): { title: string; badge: string; color: string } {
  if (overallHighScore >= 600 || totalPlays >= 30) {
    return { title: 'Đại kiện tướng Arcade', badge: '👑', color: 'text-purple-600 dark:text-purple-400' };
  }
  if (overallHighScore >= 350 || totalPlays >= 18) {
    return { title: 'Cao thủ Ngân hà', badge: '🏆', color: 'text-amber-600 dark:text-amber-400' };
  }
  if (overallHighScore >= 180 || totalPlays >= 10) {
    return { title: 'Ngôi sao Sôi nổi', badge: '🥇', color: 'text-sky-600 dark:text-sky-400' };
  }
  if (overallHighScore >= 60 || totalPlays >= 4) {
    return { title: 'Chiến binh Nhanh nhẹn', badge: '🥈', color: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (totalPlays > 0) {
    return { title: 'Tân thủ Ham học', badge: '🥉', color: 'text-blue-600 dark:text-blue-400' };
  }
  return { title: 'Chưa tham gia', badge: '🎮', color: 'text-slate-400 dark:text-slate-500' };
}

