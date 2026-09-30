import { isSoundEnabled } from './gameAudio';

export type MiniGameSound = 'collect' | 'success' | 'miss' | 'step' | 'flap';

const urls: Record<MiniGameSound, string> = {
  collect: '/audio/minigame/collect.wav',
  success: '/audio/minigame/success.wav',
  miss: '/audio/minigame/miss.wav',
  step: '/audio/minigame/step.wav',
  flap: '/audio/minigame/flap.wav',
};

const players = new Map<MiniGameSound, HTMLAudioElement>();

export function playMiniGameSound(name: MiniGameSound) {
  if (typeof window === 'undefined' || !isSoundEnabled()) return;

  let player = players.get(name);
  if (!player) {
    player = new Audio(urls[name]);
    player.preload = 'auto';
    player.volume = name === 'miss' ? 0.42 : 0.5;
    players.set(name, player);
  }

  player.pause();
  player.currentTime = 0;
  void player.play().catch(() => {
    // Mobile browsers may block audio until the first user interaction.
  });
}
