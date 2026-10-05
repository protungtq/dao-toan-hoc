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
      className="fixed right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-2xl border border-slate-200/80 bg-white/85 text-xl shadow-md shadow-slate-300/30 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-300/50 dark:border-slate-800 dark:bg-slate-900/85 dark:shadow-black/40 dark:hover:border-indigo-500/50 md:right-6 md:top-6"
    >
      <span aria-hidden="true">{enabled ? '🔊' : '🔇'}</span>
    </button>
  );
}
