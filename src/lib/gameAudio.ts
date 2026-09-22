import correctSoundUrl from './audio/win.mp3?url';
import wrongSoundUrl from './audio/fail.wav?url';
import finalSoundUrl from './audio/final.mp3?url';

type SoundName = 'correct' | 'wrong' | 'final';

const SOUND_ENABLED_KEY = 'trang-toan:sound-enabled';
const SOUND_CHANGED_EVENT = 'trang-toan:sound-changed';

const soundUrls: Record<SoundName, string> = {
  correct: correctSoundUrl,
  wrong: wrongSoundUrl,
  final: finalSoundUrl,
};

const players = new Map<SoundName, HTMLAudioElement>();

export function isSoundEnabled() {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  if (!enabled) {
    players.forEach((player) => {
      player.pause();
      player.currentTime = 0;
    });
  }

  window.dispatchEvent(
    new CustomEvent<boolean>(SOUND_CHANGED_EVENT, { detail: enabled }),
  );
}

export function subscribeToSoundSetting(listener: (enabled: boolean) => void) {
  if (typeof window === 'undefined') return () => undefined;

  const handleChange = (event: Event) => {
    listener((event as CustomEvent<boolean>).detail);
  };
  window.addEventListener(SOUND_CHANGED_EVENT, handleChange);
  return () => window.removeEventListener(SOUND_CHANGED_EVENT, handleChange);
}

function playSound(name: SoundName) {
  if (typeof window === 'undefined' || !isSoundEnabled()) return;

  let player = players.get(name);
  if (!player) {
    player = new Audio(soundUrls[name]);
    player.preload = 'auto';
    players.set(name, player);
  }

  player.pause();
  player.currentTime = 0;
  void player.play().catch(() => {
    // Trình duyệt có thể chặn âm thanh nếu chưa có tương tác của người dùng.
  });
}

export function playCorrectSound() {
  playSound('correct');
}

export function playWrongSound() {
  playSound('wrong');
}

export function playFinalSound() {
  playSound('final');
}
