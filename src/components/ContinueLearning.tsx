import { useEffect, useState } from 'react';
import { readLearningActivity, type LearningSession } from '../lib/learningProfile';

export default function ContinueLearning() {
  const [latest, setLatest] = useState<LearningSession | null>(null);
  useEffect(() => {
    const update = () => setLatest(readLearningActivity().sessions[0] ?? null);
    update();
    window.addEventListener('trang-toan:activity-updated', update);
    return () => window.removeEventListener('trang-toan:activity-updated', update);
  }, []);

  if (!latest) return null;
  return (
    <section className="border-y border-indigo-100/80 bg-gradient-to-r from-indigo-50/70 via-white/80 to-sky-50/70 backdrop-blur-md transition-colors dark:border-slate-800 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-indigo-950/40">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-5 md:flex-row md:items-center md:px-8">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-2xl text-white shadow-md shadow-indigo-500/20">
            ▶️
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Tiếp tục bài gần nhất</p>
            <h2 className="mt-0.5 text-lg font-black text-slate-900 dark:text-white">{latest.title}</h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Lần trước: <span className="font-bold text-slate-700 dark:text-slate-300">{latest.score}%</span> · {'⭐'.repeat(latest.stars)}
            </p>
          </div>
        </div>
        <div className="flex w-full gap-2.5 sm:w-auto">
          <a
            href="/thanh-tich"
            className="flex-1 rounded-xl border border-slate-200/90 bg-white/90 px-4 py-2.5 text-center text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 sm:flex-none"
          >
            Xem thành tích
          </a>
          <a
            href={latest.path}
            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-center text-sm font-black text-white shadow-md shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-violet-500 active:scale-98 sm:flex-none"
          >
            Luyện tiếp →
          </a>
        </div>
      </div>
    </section>
  );
}
