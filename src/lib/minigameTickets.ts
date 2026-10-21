export const TICKET_KEY = 'trang-toan:minigame-tickets:v1';
export const MAX_TICKETS = 3;
export const GAME_DURATION_MS = 180_000;
export const ADMIN_PLAY_KEY = 'trang-toan:admin-play:v1';

export type TicketState = { tickets: number; progress: number; countedSessionIds: string[]; activeUntil: number };
const EMPTY: TicketState = { tickets: 0, progress: 0, countedSessionIds: [], activeUntil: 0 };

export function readTickets(): TicketState {
  if (typeof window === 'undefined') return { tickets: 3, progress: 0, countedSessionIds: [], activeUntil: 0 };
  try {
    const raw = localStorage.getItem(TICKET_KEY);
    if (!raw) {
      const initial: TicketState = { tickets: 3, progress: 0, countedSessionIds: [], activeUntil: 0 };
      localStorage.setItem(TICKET_KEY, JSON.stringify(initial));
      return initial;
    }
    const value = JSON.parse(raw || '{}');
    return {
      tickets: Math.min(MAX_TICKETS, Math.max(0, Math.floor(Number(value.tickets ?? 3)))),
      progress: Math.min(2, Math.max(0, Math.floor(Number(value.progress) || 0))),
      countedSessionIds: Array.isArray(value.countedSessionIds) ? value.countedSessionIds.filter((id: unknown) => typeof id === 'string').slice(-150) : [],
      activeUntil: Number.isFinite(value.activeUntil) ? Math.max(0, value.activeUntil) : 0,
    };
  } catch { return { tickets: 3, progress: 0, countedSessionIds: [], activeUntil: 0 }; }
}

function writeTickets(state: TicketState) {
  try {
    localStorage.setItem(TICKET_KEY, JSON.stringify(state));
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('trang-toan:tickets-updated'));
  }
  return state;
}

export function countSuccessfulSession(id: string, score: number) {
  const state = readTickets();
  if (score <= 80 || state.countedSessionIds.includes(id)) return state;
  state.countedSessionIds.push(id);
  state.countedSessionIds = state.countedSessionIds.slice(-150);
  if (state.tickets < MAX_TICKETS) {
    state.progress += 1;
    if (state.progress === 3) { state.tickets += 1; state.progress = 0; }
  }
  return writeTickets(state);
}

export function grantFullTickets(sessionId?: string) {
  const state = readTickets();
  state.tickets = MAX_TICKETS;
  state.progress = 0;
  if (sessionId && !state.countedSessionIds.includes(sessionId)) {
    state.countedSessionIds.push(sessionId);
    state.countedSessionIds = state.countedSessionIds.slice(-150);
  }
  return writeTickets(state);
}

export function readAdminPlayMode() {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(ADMIN_PLAY_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAdminPlayMode(enabled: boolean) {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) sessionStorage.setItem(ADMIN_PLAY_KEY, '1');
    else sessionStorage.removeItem(ADMIN_PLAY_KEY);
  } catch {}
  window.dispatchEvent(new Event('trang-toan:admin-play-updated'));
}

export function startTicketGame(adminPlay = false) {
  const state = readTickets();
  if (adminPlay) {
    state.activeUntil = Date.now() + GAME_DURATION_MS;
    return writeTickets(state);
  }
  if (state.activeUntil > Date.now()) return state;
  if (state.tickets < 1) return null;
  state.tickets -= 1;
  state.activeUntil = Date.now() + GAME_DURATION_MS;
  return writeTickets(state);
}

export function endTicketGame() {
  const state = readTickets();
  if (state.activeUntil) { state.activeUntil = 0; writeTickets(state); }
}
