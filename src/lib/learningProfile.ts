export type SkillProgress = {
  attempts: number;
  mistakes: number;
  lastPracticedAt: number;
};

type LearningProfile = Record<string, SkillProgress>;

const STORAGE_KEY = 'trang-toan:learning-profile:v1';
const ACTIVITY_KEY = 'trang-toan:activity:v1';

export type LearningSession = {
  id: string;
  path: string;
  title: string;
  score: number;
  correct: number;
  total: number;
  stars: number;
  completedAt: number;
  day: string;
};

export type LearningActivity = {
  sessions: LearningSession[];
};

function finiteNumber(value: unknown, fallback = 0) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeSession(value: unknown): LearningSession | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<LearningSession>;
  const total = Math.max(0, Math.round(finiteNumber(item.total)));
  const correct = Math.min(total, Math.max(0, Math.round(finiteNumber(item.correct))));
  const calculatedScore = total > 0 ? Math.round(correct / total * 100) : 0;
  const score = Math.min(100, Math.max(0, Math.round(finiteNumber(item.score, calculatedScore))));
  const completedAt = finiteNumber(item.completedAt, Date.now());

  return {
    id: typeof item.id === 'string' && item.id ? item.id : `${completedAt}-legacy`,
    path: typeof item.path === 'string' && item.path ? item.path : '/',
    title: typeof item.title === 'string' && item.title ? item.title : 'Bài luyện tập',
    score,
    correct,
    total,
    stars: Math.min(3, Math.max(0, Math.round(finiteNumber(item.stars)))),
    completedAt,
    day: typeof item.day === 'string' && item.day ? item.day : localDay(completedAt),
  };
}

function readProfile(): LearningProfile {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as LearningProfile;
  } catch {
    return {};
  }
}

function routeKey() {
  return typeof window === 'undefined' ? 'unknown' : window.location.pathname;
}

function keyFor(skillId: string) {
  return `${routeKey()}::${skillId}`;
}

export function recordSkillResult(skillId: string, correctFirstTry: boolean) {
  if (typeof window === 'undefined') return;
  const profile = readProfile();
  const key = keyFor(skillId);
  const current = profile[key] ?? { attempts: 0, mistakes: 0, lastPracticedAt: 0 };
  profile[key] = {
    attempts: current.attempts + 1,
    mistakes: current.mistakes + (correctFirstTry ? 0 : 1),
    lastPracticedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function getSkillPriority(skillId: string) {
  const progress = readProfile()[keyFor(skillId)];
  if (!progress || progress.attempts < 1) return 1;
  const errorRate = progress.mistakes / progress.attempts;
  return 1 + Math.min(2, errorRate * 2);
}

export function buildAdaptiveQuestionSet<T extends { skillId: string }>(factory: () => T[], total: number): T[] {
  const first = factory();
  if (typeof window === 'undefined') return first.slice(0, total);
  const hasHistory = first.some((question) => getSkillPriority(question.skillId) > 1);
  if (!hasHistory) return first.slice(0, total);

  const pool = [...first, ...factory(), ...factory()];
  return pool
    .map((question, index) => ({ question, index, rank: Math.random() + (getSkillPriority(question.skillId) - 1) * 1.5 }))
    .sort((left, right) => right.rank - left.rank || left.index - right.index)
    .slice(0, total)
    .map(({ question }) => question)
    .sort(() => Math.random() - 0.5);
}

export function clearLearningProfile() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
  }
}

function localDay(timestamp = Date.now()) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function readLearningActivity(): LearningActivity {
  if (typeof window === 'undefined') return { sessions: [] };
  try {
    const parsed = JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? '{"sessions":[]}') as LearningActivity;
    const sessions = Array.isArray(parsed.sessions)
      ? parsed.sessions.map(normalizeSession).filter((session): session is LearningSession => session !== null)
      : [];
    return { sessions };
  } catch {
    return { sessions: [] };
  }
}

export function recordLearningSession(input: Omit<LearningSession, 'id' | 'completedAt' | 'day'>) {
  if (typeof window === 'undefined') return;
  const activity = readLearningActivity();
  const completedAt = Date.now();
  const total = Math.max(0, Math.round(finiteNumber(input.total)));
  const correct = Math.min(total, Math.max(0, Math.round(finiteNumber(input.correct))));
  const calculatedScore = total > 0 ? Math.round(correct / total * 100) : 0;
  const session: LearningSession = {
    ...input,
    total,
    correct,
    score: Math.min(100, Math.max(0, Math.round(finiteNumber(input.score, calculatedScore)))),
    stars: Math.min(3, Math.max(0, Math.round(finiteNumber(input.stars)))),
    id: `${completedAt}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt,
    day: localDay(completedAt),
  };
  activity.sessions = [session, ...activity.sessions].slice(0, 100);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  window.dispatchEvent(new CustomEvent('trang-toan:activity-updated'));
  return session;
}

export function calculateStreak(sessions: LearningSession[]) {
  const days = new Set(sessions.map((session) => session.day));
  if (!days.size) return 0;
  const cursor = new Date();
  if (!days.has(localDay(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(localDay(cursor.getTime()))) return 0;
  }
  let streak = 0;
  while (days.has(localDay(cursor.getTime()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getSkillProgress() {
  return readProfile();
}
