import { useEffect, useState } from 'react';
import {
  isSoundEnabled,
  setSoundEnabled,
  subscribeToSoundSetting,
} from '../lib/gameAudio';

export default function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isSoundEnabled());
    return subscribeToSoundSetting(setEnabled);
  }, []);

  function toggleSound() {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    setSoundEnabled(nextEnabled);
  }

  const label = enabled ? 'Tắt âm thanh' : 'Bật âm thanh';

  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-label={label}
      title={label}
      aria-pressed={!enabled}
      className="fixed right-4 top-4 z-50 grid h-12 w-12 place-items-center rounded-2xl border border-slate-200/80 bg-white/90 text-2xl shadow-lg shadow-slate-300/40 backdrop-blur transition hover:-translate-y-0.5 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-black/30 md:right-6 md:top-6"
    >
      <span aria-hidden="true">{enabled ? '🔊' : '🔇'}</span>
    </button>
  );
}
