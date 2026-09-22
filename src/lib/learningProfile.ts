export type SkillProgress = {
  attempts: number;
  mistakes: number;
  lastPracticedAt: number;
};

type LearningProfile = Record<string, SkillProgress>;

const STORAGE_KEY = 'trang-toan:learning-profile:v1';

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
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
}
