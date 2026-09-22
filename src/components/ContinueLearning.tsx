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
  return <section className="border-y border-violet-100 bg-gradient-to-r from-violet-50 via-white to-sky-50">
    <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-6 md:flex-row md:items-center md:px-8">
      <div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-violet-600 text-3xl shadow-lg">▶️</span><div><p className="text-sm font-black text-violet-700">Tiếp tục bài gần nhất</p><h2 className="mt-1 text-xl font-black text-slate-950">{latest.title}</h2><p className="mt-1 text-sm font-semibold text-slate-500">Lần trước: {latest.score}% · {'⭐'.repeat(latest.stars)}</p></div></div>
      <div className="flex w-full gap-3 md:w-auto"><a href="/thanh-tich" className="flex-1 rounded-2xl border-2 border-violet-200 bg-white px-5 py-3 text-center font-black text-violet-700 md:flex-none">Xem thành tích</a><a href={latest.path} className="flex-1 rounded-2xl bg-violet-600 px-5 py-3 text-center font-black text-white shadow-lg md:flex-none">Luyện tiếp →</a></div>
    </div>
  </section>;
}
