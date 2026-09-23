import { useEffect, useMemo, useState } from 'react';
import ResultShare from './ResultShare';
import { buildAdaptiveQuestionSet } from '../lib/learningProfile';
import { playCorrectSound, playFinalSound, playWrongSound } from '../lib/gameAudio';
import {
  GRADE3_STAGE1_SKILL_LABELS,
  generateGrade3Stage1Questions,
  type Grade3Stage1Answer,
  type Grade3Stage1Module,
  type Grade3Stage1Question,
  type Grade3Stage1SkillId,
} from '../lib/grade3Stage1QuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = { questionId: string; skillId: Grade3Stage1SkillId; attempts: number; correctFirstTry: boolean };
type BestResult = { score: number; stars: number };
type Props = { module: Grade3Stage1Module };

const CONFIG = {
  review: {
    number: 1, lessons: '1–8', title: 'Ôn tập và bổ sung', shortTitle: 'Ôn tập đầu năm',
    description: 'Ôn số và phép tính đến 1 000, thành phần phép tính, bảng nhân chia 2–5, hình học và đo lường.',
    accent: 'emerald', mascot: '🐿️', mascotName: 'Sóc Nâu',
    topics: [['🔢', 'Số đến 1 000'], ['🧩', 'Thành phần phép tính'], ['✖️', 'Bảng nhân chia 2–5'], ['📐', 'Hình học'], ['📏', 'Đo lường']],
    guideTitle: 'Tách từng bước để tính chính xác',
    tips: [['🔢', 'Số có ba chữ số', 'So sánh hàng trăm trước, rồi đến hàng chục và hàng đơn vị.'], ['🧩', 'Tìm thành phần chưa biết', 'Dùng phép tính ngược: cộng ↔ trừ, nhân ↔ chia.']],
  },
  tables: {
    number: 2, lessons: '9–15', title: 'Bảng nhân, bảng chia', shortTitle: 'Bảng nhân chia 6–9',
    description: 'Luyện bảng nhân, bảng chia 6, 7, 8, 9; tìm thành phần chưa biết và nhận biết một phần mấy.',
    accent: 'violet', mascot: '🐻', mascotName: 'Gấu Mật',
    topics: [['✖️', 'Bảng nhân 6–9'], ['➗', 'Bảng chia 6–9'], ['🧩', 'Tìm thành phần'], ['🍕', 'Một phần mấy']],
    guideTitle: 'Dùng bảng nhân để suy ra phép chia',
    tips: [['✖️', 'Nhân và chia liên hệ nhau', 'Nếu 7 × 8 = 56 thì 56 : 7 = 8 và 56 : 8 = 7.'], ['🍕', 'Một phần mấy', 'Chia đều thành bao nhiêu phần thì mẫu số là bấy nhiêu.']],
  },
} as const;

function starsFor(score: number) {
  return score >= 90 ? 3 : score >= 70 ? 2 : 1;
}

function QuestionVisual({ question, accent }: { question: Grade3Stage1Question; accent: 'emerald' | 'violet' }) {
  const tone = accent === 'emerald' ? 'bg-emerald-50 text-emerald-800' : 'bg-violet-50 text-violet-800';

  if (question.type === 'expression') return (
    <div className={`grid min-h-64 place-items-center rounded-3xl p-6 ${tone}`}>
      <div className="text-center">
        {question.caption && <p className="mb-4 text-base font-black opacity-70">{question.caption}</p>}
        <p className="break-words text-4xl font-black tracking-tight sm:text-6xl">{question.expression}</p>
      </div>
    </div>
  );

  if (question.type === 'place-value') {
    const digits = String(question.number).split('');
    const placeIndex = question.highlightedPlace === 'trăm' ? 0 : question.highlightedPlace === 'chục' ? 1 : 2;
    return <div className={`rounded-3xl p-6 ${tone}`}><div className="mx-auto grid max-w-xl grid-cols-3 gap-3">{digits.map((digit, index) => <div key={index} className={`rounded-2xl border-4 p-4 text-center ${index === placeIndex ? 'border-amber-400 bg-amber-100 text-amber-900 shadow-lg' : 'border-white bg-white/80 text-slate-700'}`}><p className="text-xs font-black uppercase opacity-60">{['Trăm', 'Chục', 'Đơn vị'][index]}</p><p className="mt-2 text-5xl font-black">{digit}</p></div>)}</div></div>;
  }

  if (question.type === 'compare') return <div className={`grid min-h-64 grid-cols-[1fr_auto_1fr] place-items-center rounded-3xl p-5 text-4xl font-black sm:text-7xl ${tone}`}><span>{question.left}</span><span className="text-amber-500">?</span><span>{question.right}</span></div>;

  if (question.type === 'groups') return (
    <div className={`rounded-3xl p-5 ${tone}`}>
      <div className="flex min-h-56 flex-wrap content-center justify-center gap-3">{Array.from({ length: question.groups }).map((_, index) => <div key={index} className="flex min-w-20 items-center justify-center gap-2 rounded-2xl border-2 border-white bg-white/85 p-3 shadow-sm"><span className="text-3xl">{question.icon}</span><span className="text-lg font-black">× {question.perGroup}</span></div>)}</div>
      <p className="mt-3 text-center text-sm font-bold opacity-70">{question.groups} nhóm bằng nhau</p>
    </div>
  );

  if (question.type === 'fraction') return (
    <div className={`rounded-3xl p-6 ${tone}`}>
      {question.mode === 'recognize' ? <div className="mx-auto flex min-h-56 max-w-2xl items-stretch overflow-hidden rounded-3xl border-4 border-white bg-white shadow-sm">{Array.from({ length: question.denominator }).map((_, index) => <span key={index} className={`min-w-0 flex-1 border-r-2 border-slate-300 last:border-r-0 ${index === 0 ? 'bg-amber-400' : 'bg-white'}`} />)}</div> : <div className="flex min-h-56 flex-wrap content-center justify-center gap-3">{Array.from({ length: question.total ?? 0 }).map((_, index) => <span key={index} className="grid h-12 w-12 place-items-center rounded-xl bg-white text-3xl shadow-sm">{question.icon}</span>)}</div>}
      <p className="mt-4 text-center font-black">Chia thành {question.denominator} phần bằng nhau</p>
    </div>
  );

  return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 text-center ${tone}`}><div><div className="text-8xl">{question.icon}</div><p className="mt-4 text-2xl font-black">{question.visualTitle}</p><p className="mt-2 text-lg font-bold opacity-75">{question.visualText}</p></div></div>;
}

export default function Grade3Stage1Game({ module }: Props) {
  const config = CONFIG[module];
  const storageKey = `trang-toan:lop-3:${module}:best-v1`;
  const [screen, setScreen] = useState<Screen>('intro');
  const [size, setSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<Grade3Stage1Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Grade3Stage1Answer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [best, setBest] = useState<BestResult | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateGrade3Stage1Questions(module, 10));
    const saved = localStorage.getItem(storageKey);
    if (saved) try { setBest(JSON.parse(saved)); } catch { localStorage.removeItem(storageKey); }
  }, [module, storageKey]);

  const question = questions[index];
  const progress = questions.length ? ((index + 1) / questions.length) * 100 : 0;
  const accentClasses = config.accent === 'emerald'
    ? { text: 'text-emerald-700', button: 'bg-emerald-600 hover:bg-emerald-700', bar: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-100', selected: 'border-emerald-400 bg-emerald-50' }
    : { text: 'text-violet-700', button: 'bg-violet-600 hover:bg-violet-700', bar: 'from-violet-400 to-purple-600', shadow: 'shadow-violet-100', selected: 'border-violet-400 bg-violet-50' };

  const summary = useMemo(() => {
    const correct = results.filter((result) => result.correctFirstTry).length;
    const score = results.length ? Math.round((correct / results.length) * 100) : 0;
    const bySkill = [...new Set(results.map((result) => result.skillId))].map((skillId) => {
      const skillResults = results.filter((result) => result.skillId === skillId);
      return { skillId, total: skillResults.length, correct: skillResults.filter((result) => result.correctFirstTry).length };
    });
    return { correct, score, stars: starsFor(score), bySkill };
  }, [results]);

  function resetQuestionState() {
    setSelected(null); setAttempts(0); setHint(0); setCanContinue(false);
  }

  function prepare(nextSize: PracticeSize) {
    setSize(nextSize);
    setQuestions(buildAdaptiveQuestionSet(() => generateGrade3Stage1Questions(module, nextSize), nextSize));
    setIndex(0); setResults([]); setReviewMode(false); resetQuestionState(); setScreen('guide');
  }

  function choose(answer: Grade3Stage1Answer) {
    if (!question || canContinue) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts); setSelected(answer);
    if (answer === question.correctAnswer) {
      playCorrectSound(); setCanContinue(true);
      setResults((current) => [...current, { questionId: question.id, skillId: question.skillId, attempts: nextAttempts, correctFirstTry: nextAttempts === 1 }]);
    } else {
      playWrongSound(); setHint(Math.min(nextAttempts, 3));
    }
  }

  function nextQuestion() {
    if (index < questions.length - 1) { setIndex((current) => current + 1); resetQuestionState(); return; }
    if (!reviewMode) {
      const correct = results.filter((result) => result.correctFirstTry).length;
      const score = Math.round((correct / questions.length) * 100);
      const saved = { score, stars: starsFor(score) };
      if (!best || score > best.score) { localStorage.setItem(storageKey, JSON.stringify(saved)); setBest(saved); }
    }
    playFinalSound(); setScreen('result');
  }

  function reviewMistakes() {
    const missedIds = new Set(results.filter((result) => !result.correctFirstTry).map((result) => result.questionId));
    const missedQuestions = questions.filter((item) => missedIds.has(item.id));
    if (!missedQuestions.length) return;
    setQuestions(missedQuestions); setIndex(0); setResults([]); setReviewMode(true); resetQuestionState(); setScreen('lesson');
  }

  function answerClass(answer: Grade3Stage1Answer) {
    if (selected === answer && answer !== question.correctAnswer) return 'border-red-400 bg-red-50 text-red-700';
    if (canContinue && answer === question.correctAnswer) return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-amber-300 hover:bg-amber-50';
  }

  if (!questions.length) return <main className="grid min-h-screen place-items-center"><div className="text-center"><div className="text-7xl">{config.mascot}</div><p className={`mt-4 text-xl font-black ${accentClasses.text}`}>Đang chuẩn bị bài luyện...</p></div></main>;

  if (screen === 'intro') return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <a href="/lop-3" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 3</a>
      <section className={`mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl ${accentClasses.shadow}`}>
        <div className={`bg-gradient-to-br ${accentClasses.bar} p-8 text-white md:p-12`}><p className="font-black tracking-widest text-white/75">Mục {config.number} · Bài {config.lessons}</p><h1 className="mt-2 text-3xl font-black md:text-5xl">{config.title}</h1><p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">{config.description}</p></div>
        <div className="p-6 md:p-10">
          <div className={`grid gap-3 sm:grid-cols-2 ${config.topics.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>{config.topics.map(([icon, label]) => <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-3xl">{icon}</div><p className="mt-2 font-black text-slate-700">{label}</p></div>)}</div>
          <h2 className="mt-8 text-xl font-black">Chọn lượt luyện tập</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">{([[5, 'Luyện nhanh', 'Khởi động đủ nhóm kiến thức'], [10, 'Luyện chuẩn', 'Cân bằng kiến thức và vận dụng'], [15, 'Thử thách', 'Nhiều biến thể và bài toán hơn']] as const).map(([count, title, description]) => <button key={count} onClick={() => prepare(count)} className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${count === 10 ? `${accentClasses.selected} shadow-lg` : 'border-slate-100 bg-white hover:border-amber-300'}`}><span className={`text-sm font-black ${accentClasses.text}`}>{count} câu</span><span className="mt-1 block text-xl font-black">{title}</span><span className="mt-2 block font-semibold text-slate-500">{description}</span></button>)}</div>
          {best && <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">Kết quả tốt nhất: {best.score}% · {'⭐'.repeat(best.stars)}</p>}
        </div>
      </section>
    </main>
  );

  if (screen === 'guide') return (
    <main className="mx-auto max-w-4xl px-4 py-10"><section className={`rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl ${accentClasses.shadow} md:p-10`}><div className="flex items-start gap-4"><span className="text-6xl">{config.mascot}</span><div><p className={`font-black ${accentClasses.text}`}>{config.mascotName} nhắc bé</p><h1 className="mt-1 text-3xl font-black">{config.guideTitle}</h1></div></div><div className="my-7 grid gap-4 sm:grid-cols-2">{config.tips.map(([icon, title, description], tipIndex) => <div key={title} className={`rounded-3xl p-5 ${tipIndex ? 'bg-amber-50' : config.accent === 'emerald' ? 'bg-emerald-50' : 'bg-violet-50'}`}><p className="font-black">{icon} {title}</p><p className="mt-2 font-semibold text-slate-600">{description}</p></div>)}</div><button onClick={() => setScreen('lesson')} className={`w-full rounded-2xl px-7 py-4 text-lg font-black text-white ${accentClasses.button}`}>Bắt đầu {size} câu</button></section></main>
  );

  if (screen === 'result') {
    const missed = results.filter((result) => !result.correctFirstTry).length;
    return <main className="mx-auto max-w-4xl px-4 py-10"><section className={`rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl ${accentClasses.shadow} md:p-10`}><div className="text-7xl">{reviewMode ? '💪' : '🏅'}</div><p className={`mt-4 font-black tracking-widest ${accentClasses.text}`}>{reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành bài luyện tập'}</p><h1 className="mt-2 text-4xl font-black">{summary.score >= 90 ? 'Tuyệt vời, bé rất chắc bài!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Mình cùng luyện thêm nhé!'}</h1><div className="mt-6 flex justify-center gap-3 text-5xl">{[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}</div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-sky-50 p-5"><p className="font-black text-sky-700">Điểm số</p><p className="text-3xl font-black">{summary.score}%</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-black text-emerald-700">Đúng lần đầu</p><p className="text-3xl font-black">{summary.correct}/{results.length}</p></div><div className="rounded-2xl bg-amber-50 p-5"><p className="font-black text-amber-700">Sao nhận được</p><p className="text-3xl font-black">{summary.stars}/3</p></div></div><div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left"><h2 className="bg-slate-50 px-5 py-4 text-xl font-black">Kết quả theo kỹ năng</h2>{summary.bySkill.map((skill) => <div key={skill.skillId} className="grid grid-cols-[1fr_auto] gap-3 border-t px-5 py-4"><b>{GRADE3_STAGE1_SKILL_LABELS[skill.skillId]}</b><b>{skill.correct}/{skill.total}</b></div>)}</div><ResultShare score={summary.score} correct={summary.correct} total={results.length} stars={summary.stars} attempts={results} /><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{!reviewMode && missed > 0 && <button onClick={reviewMistakes} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu</button>}<button onClick={() => prepare(size)} className={`rounded-2xl px-6 py-4 font-black text-white ${accentClasses.button}`}>Luyện bộ câu mới</button><a href="/lop-3" className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black">Về lớp 3</a></div></section></main>;
  }

  const longAnswers = question.answers.some((answer) => String(answer).length > 10);
  return (
    <main className="mx-auto max-w-5xl px-4 py-7">
      <header className="mb-5 flex items-center justify-between gap-8"><button onClick={() => setScreen('intro')} className="shrink-0 rounded-xl bg-white px-4 py-3 font-black shadow-sm">← Thoát</button><div className="text-right"><p className={`font-black ${accentClasses.text}`}>{reviewMode ? 'Ôn lại · ' : ''}Câu {index + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{GRADE3_STAGE1_SKILL_LABELS[question.skillId]}</p></div></header>
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-white"><div className={`h-full bg-gradient-to-r ${accentClasses.bar}`} style={{ width: `${progress}%` }} /></div>
      <section className={`rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl ${accentClasses.shadow} md:p-9`}>
        <div className="mb-6 flex items-center gap-4"><span className="text-5xl">{index % 2 ? '🐻' : '🐿️'}</span><div><p className={`font-black ${accentClasses.text}`}>{index % 2 ? 'Gấu Mật hỏi' : 'Sóc Nâu hỏi'}</p><h1 className="mt-1 text-2xl font-black md:text-3xl">{question.instruction}</h1></div></div>
        <QuestionVisual question={question} accent={config.accent} />
        <div className={`mt-6 grid gap-3 ${longAnswers ? 'sm:grid-cols-2' : question.answers.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>{question.answers.map((answer) => <button key={String(answer)} disabled={canContinue} onClick={() => choose(answer)} className={`min-h-20 rounded-2xl border-4 px-3 py-4 text-xl font-black shadow-sm transition ${answerClass(answer)}`}>{answer}</button>)}</div>
        {selected !== null && !canContinue && <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5"><h2 className="text-xl font-black text-orange-700">💡 Chưa đúng, mình xem lại nhé!</h2><p className="mt-2 font-semibold"><b>Gợi ý {hint}/3:</b> {question.hintSteps[Math.max(0, hint - 1)]}</p><button onClick={() => setSelected(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div>}
        {canContinue && <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div><h2 className="text-xl font-black text-emerald-700">🎉 Chính xác!</h2><p className="mt-1 font-semibold">{question.explanation}</p></div><button onClick={nextQuestion} className={`w-full rounded-2xl px-6 py-4 font-black text-white sm:w-auto ${accentClasses.button}`}>{index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div></div>}
      </section>
    </main>
  );
}
