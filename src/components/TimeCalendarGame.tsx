import { useEffect, useMemo, useState } from 'react';

import {
  generateTimeQuestions,
  TIME_SKILL_LABELS,
  WEEKDAYS,
  type TimeAnswer,
  type TimeQuestion,
  type TimeSkillId,
} from '../lib/timeCalendarQuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = { questionId: string; skillId: TimeSkillId; attempts: number; correctFirstTry: boolean };
type SavedBest = { score: number; stars: number };
const STORAGE_KEY = 'dao-toan-hoc:lop-1:thoi-gian-lich:best-v1';

function starsFor(score: number) {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

function AnalogClock({ hour }: { hour: number }) {
  return (
    <svg viewBox="0 0 300 300" className="h-64 w-64 drop-shadow-xl" role="img" aria-label={`Đồng hồ chỉ ${hour} giờ`}>
      <circle cx="150" cy="150" r="136" fill="#fffdf4" stroke="#f59e0b" strokeWidth="10" />
      {Array.from({ length: 12 }).map((_, index) => {
        const number = index + 1;
        const angle = (number * 30 - 90) * Math.PI / 180;
        return <text key={number} x={150 + Math.cos(angle) * 105} y={157 + Math.sin(angle) * 105} textAnchor="middle" fontSize="24" fontWeight="900" fill="#334155">{number}</text>;
      })}
      {Array.from({ length: 12 }).map((_, index) => <line key={index} x1="150" y1="22" x2="150" y2="34" stroke="#92400e" strokeWidth="4" transform={`rotate(${index * 30} 150 150)`} />)}
      <line x1="150" y1="150" x2="150" y2="67" stroke="#334155" strokeWidth="10" strokeLinecap="round" transform={`rotate(${hour * 30} 150 150)`} />
      <line x1="150" y1="150" x2="150" y2="40" stroke="#0ea5e9" strokeWidth="7" strokeLinecap="round" />
      <circle cx="150" cy="150" r="11" fill="#f97316" />
    </svg>
  );
}

function CalendarVisual({ month, daysInMonth, startWeekday, targetDate }: { month: number; daysInMonth: number; startWeekday: number; targetDate: number }) {
  const cells: Array<number | null> = [...Array.from({ length: startWeekday }, () => null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border-4 border-orange-200 bg-white shadow-lg">
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-4 text-center text-2xl font-black text-white">Tháng {month}</div>
      <div className="grid grid-cols-7 bg-amber-50">{WEEKDAYS.map((day) => <div key={day} className="border-b border-amber-100 px-1 py-3 text-center text-xs font-black text-amber-800 sm:text-sm">{day === 'Chủ nhật' ? 'CN' : day.replace('Thứ ', 'T')}</div>)}</div>
      <div className="grid grid-cols-7">{cells.map((date, index) => <div key={index} className={`grid aspect-square place-items-center border-b border-r border-slate-100 text-sm font-black sm:text-lg ${date === targetDate ? 'bg-sky-500 text-white ring-4 ring-inset ring-sky-200' : date ? 'text-slate-700' : 'bg-slate-50'}`}>{date}</div>)}</div>
    </div>
  );
}

export default function TimeCalendarGame() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [practiceSize, setPracticeSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<TimeQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<TimeAnswer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [bestResult, setBestResult] = useState<SavedBest | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateTimeQuestions(10));
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try { setBestResult(JSON.parse(saved)); } catch { localStorage.removeItem(STORAGE_KEY); }
  }, []);

  const question = questions[questionIndex];
  const progress = questions.length ? ((questionIndex + 1) / questions.length) * 100 : 0;
  const summary = useMemo(() => {
    const correct = results.filter((item) => item.correctFirstTry).length;
    const score = results.length ? Math.round((correct / results.length) * 100) : 0;
    const bySkill = (Object.keys(TIME_SKILL_LABELS) as TimeSkillId[]).map((skillId) => {
      const skillResults = results.filter((item) => item.skillId === skillId);
      return { skillId, total: skillResults.length, correct: skillResults.filter((item) => item.correctFirstTry).length };
    }).filter((item) => item.total > 0);
    return { correct, score, stars: starsFor(score), bySkill };
  }, [results]);

  function resetAnswer() { setSelectedAnswer(null); setAttempts(0); setHintLevel(0); setCanContinue(false); }
  function prepareSession(size: PracticeSize) { setPracticeSize(size); setQuestions(generateTimeQuestions(size)); setQuestionIndex(0); setResults([]); setReviewMode(false); resetAnswer(); setScreen('guide'); }
  function chooseAnswer(answer: TimeAnswer) {
    if (!question || canContinue) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts); setSelectedAnswer(answer);
    if (answer === question.correctAnswer) {
      setCanContinue(true);
      setResults((current) => [...current, { questionId: question.id, skillId: question.skillId, attempts: nextAttempts, correctFirstTry: nextAttempts === 1 }]);
    } else setHintLevel(Math.min(nextAttempts, 3));
  }
  function nextQuestion() {
    if (questionIndex < questions.length - 1) { setQuestionIndex((current) => current + 1); resetAnswer(); return; }
    if (!reviewMode) {
      const correct = results.filter((item) => item.correctFirstTry).length;
      const score = Math.round((correct / questions.length) * 100);
      const saved = { score, stars: starsFor(score) };
      if (!bestResult || score > bestResult.score) { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); setBestResult(saved); }
    }
    setScreen('result');
  }
  function startMistakeReview() {
    const missedIds = new Set(results.filter((item) => !item.correctFirstTry).map((item) => item.questionId));
    const missed = questions.filter((item) => missedIds.has(item.id));
    if (!missed.length) return;
    setQuestions(missed); setQuestionIndex(0); setResults([]); setReviewMode(true); resetAnswer(); setScreen('lesson');
  }
  function answerClass(answer: string) {
    if (selectedAnswer === answer && answer !== question.correctAnswer) return 'border-red-400 bg-red-50 text-red-700';
    if (canContinue && answer === question.correctAnswer) return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-amber-300 hover:bg-amber-50';
  }
  function AnswerButtons() {
    return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{question.answers.map((answer) => <button key={answer} type="button" disabled={canContinue} onClick={() => chooseAnswer(answer)} className={`min-h-20 rounded-2xl border-4 px-3 py-4 text-lg font-black shadow-sm transition md:text-xl ${answerClass(answer)}`}>{answer}</button>)}</div>;
  }
  function QuestionVisual() {
    if (question.type === 'clock') return <div className="grid min-h-80 place-items-center rounded-3xl bg-amber-50 p-5"><AnalogClock hour={question.hour} /></div>;
    if (question.type === 'weekday') return <div className="rounded-3xl bg-sky-50 p-6"><div className="mx-auto grid max-w-3xl grid-cols-7 gap-1">{WEEKDAYS.map((day) => <div key={day} className={`grid min-h-24 place-items-center rounded-xl px-1 text-center text-xs font-black sm:text-sm ${day === question.focusDay ? 'bg-sky-500 text-white shadow-lg' : 'bg-white text-slate-500'}`}>{day}</div>)}</div></div>;
    if (question.type === 'calendar') return <div className="rounded-3xl bg-orange-50 p-4 md:p-6"><CalendarVisual month={question.month} daysInMonth={question.daysInMonth} startWeekday={question.startWeekday} targetDate={question.targetDate} /></div>;
    return <div className="grid min-h-72 place-items-center rounded-3xl bg-violet-50 p-6 text-center"><div><div className="text-8xl">{question.icon}</div><p className="mt-5 text-2xl font-black text-violet-800">{question.activity}</p></div></div>;
  }

  if (!questions.length) return <main className="grid min-h-screen place-items-center text-center"><div><div className="text-7xl">🕐</div><p className="mt-4 text-xl font-black text-orange-700">Gấu Mật đang xem giờ...</p></div></main>;

  if (screen === 'intro') return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <a href="/lop-1" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 1</a>
      <section className="mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl shadow-orange-100">
        <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 p-8 text-white md:p-12"><p className="font-black tracking-widest text-yellow-100">Mục 9 · Bài 34–37</p><h1 className="mt-2 text-3xl font-black md:text-5xl">Thời gian, giờ và lịch</h1><p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">Xem giờ đúng, nhận biết các ngày trong tuần và đọc lịch.</p></div>
        <div className="p-6 md:p-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['🕐', 'Xem giờ đúng'], ['📅', 'Ngày trong tuần'], ['🗓️', 'Xem lịch'], ['🌞', 'Thời gian trong ngày']].map(([icon, label]) => <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-3xl">{icon}</div><p className="mt-2 font-black text-slate-700">{label}</p></div>)}</div>
          <h2 className="mt-8 text-xl font-black">Chọn lượt luyện tập</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">{([[5, 'Luyện nhanh', 'Làm quen bốn kỹ năng'], [10, 'Luyện chuẩn', 'Tập trung xem giờ và lịch'], [15, 'Thử thách', 'Luyện nhiều tình huống hơn']] as const).map(([size, title, description]) => <button key={size} type="button" onClick={() => prepareSession(size)} className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${size === 10 ? 'border-orange-400 bg-orange-50 shadow-lg shadow-orange-100' : 'border-slate-100 bg-white hover:border-yellow-300'}`}><span className="text-sm font-black text-orange-700">{size} câu</span><span className="mt-1 block text-xl font-black">{title}</span><span className="mt-2 block font-semibold text-slate-500">{description}</span></button>)}</div>
          {bestResult && <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">Kết quả tốt nhất: {bestResult.score}% · {'⭐'.repeat(bestResult.stars)}</p>}
        </div>
      </section>
    </main>
  );

  if (screen === 'guide') return (
    <main className="mx-auto max-w-4xl px-4 py-10"><section className="rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl shadow-orange-100 md:p-10">
      <div className="flex items-start gap-4"><span className="text-6xl">🐻</span><div><p className="font-black text-orange-700">Gấu Mật nhắc bé</p><h1 className="mt-1 text-3xl font-black">Kim ngắn chỉ giờ, kim dài chỉ phút</h1></div></div>
      <div className="my-7 grid gap-4 sm:grid-cols-2"><div className="rounded-3xl bg-amber-50 p-5"><p className="font-black text-amber-700">Giờ đúng</p><p className="mt-2 font-semibold text-slate-600">Khi kim dài chỉ số 12, kim ngắn chỉ số nào thì đó là giờ đúng.</p></div><div className="rounded-3xl bg-sky-50 p-5"><p className="font-black text-sky-700">Xem lịch</p><p className="mt-2 font-semibold text-slate-600">Tìm ngày rồi nhìn lên đầu cột để biết đó là thứ mấy.</p></div></div>
      <button type="button" onClick={() => setScreen('lesson')} className="w-full rounded-2xl bg-orange-500 px-7 py-4 text-lg font-black text-white shadow-lg shadow-orange-200">Bắt đầu {practiceSize} câu</button>
    </section></main>
  );

  if (screen === 'result') {
    const missed = results.filter((item) => !item.correctFirstTry).length;
    return <main className="mx-auto max-w-4xl px-4 py-10"><section className="rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl shadow-orange-100 md:p-10">
      <div className="text-7xl">{reviewMode ? '💪' : '🎉'}</div><p className="mt-4 font-black tracking-widest text-orange-700">{reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành bài luyện tập'}</p><h1 className="mt-2 text-4xl font-black">{summary.score >= 90 ? 'Chuyên gia thời gian!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Bé đã rất cố gắng!'}</h1>
      <div className="mt-6 flex justify-center gap-3 text-5xl">{[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}</div>
      <div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-sky-50 p-5"><p className="font-black text-sky-700">Điểm số</p><p className="mt-1 text-3xl font-black">{summary.score}%</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-black text-emerald-700">Đúng lần đầu</p><p className="mt-1 text-3xl font-black">{summary.correct}/{results.length}</p></div><div className="rounded-2xl bg-amber-50 p-5"><p className="font-black text-amber-700">Sao nhận được</p><p className="mt-1 text-3xl font-black">{summary.stars}/3</p></div></div>
      <div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left"><h2 className="bg-slate-50 px-5 py-4 text-xl font-black">Kết quả theo kỹ năng</h2><div className="divide-y divide-slate-100">{summary.bySkill.map((item) => { const percent = Math.round((item.correct / item.total) * 100); return <div key={item.skillId} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black">{TIME_SKILL_LABELS[item.skillId]}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${percent >= 70 ? 'bg-emerald-400' : 'bg-orange-400'}`} style={{ width: `${percent}%` }} /></div></div><p className="font-black text-slate-600">{item.correct}/{item.total}</p></div>; })}</div></div>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{!reviewMode && missed > 0 && <button type="button" onClick={startMistakeReview} className="rounded-2xl bg-orange-600 px-6 py-4 font-black text-white">Ôn lại {missed} câu cần nhớ</button>}<button type="button" onClick={() => prepareSession(practiceSize)} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Luyện bộ câu mới</button><a href="/lop-1" className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black text-slate-700">Về lớp 1</a></div>
    </section></main>;
  }

  return <main className="mx-auto max-w-5xl px-4 py-7">
    <header className="mb-5 flex items-center justify-between gap-4"><button type="button" onClick={() => setScreen('intro')} className="rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Thoát</button><div className="text-right"><p className="font-black text-orange-700">{reviewMode ? 'Ôn lại · ' : ''}Câu {questionIndex + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{TIME_SKILL_LABELS[question.skillId]}</p></div></header>
    <div className="mb-6 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all" style={{ width: `${progress}%` }} /></div>
    <section className="rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl shadow-orange-100 md:p-9">
      <div className="mb-6 flex items-center gap-4"><span className="text-5xl">{questionIndex % 2 === 0 ? '🐻' : '🐿️'}</span><div><p className="font-black text-orange-700">{questionIndex % 2 === 0 ? 'Gấu Mật hỏi' : 'Sóc Nâu hỏi'}</p><h1 className="mt-1 text-2xl font-black md:text-3xl">{question.instruction}</h1></div></div>
      <QuestionVisual /><div className="mt-6"><AnswerButtons /></div>
      {selectedAnswer !== null && !canContinue && <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5"><div className="flex items-start gap-3"><span className="text-3xl">💡</span><div className="flex-1"><h2 className="text-xl font-black text-orange-700">Chưa đúng, mình xem lại nhé!</h2><p className="mt-2 font-semibold leading-7 text-slate-600"><span className="font-black">Gợi ý {hintLevel}/3:</span> {question.hintSteps[Math.max(0, hintLevel - 1)]}</p><button type="button" onClick={() => setSelectedAnswer(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div></div></div>}
      {canContinue && selectedAnswer === question.correctAnswer && <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div className="flex items-start gap-3"><span className="text-3xl">🎉</span><div><h2 className="text-xl font-black text-emerald-700">Chính xác!</h2><p className="mt-1 font-semibold text-slate-600">{question.explanation}</p></div></div><button type="button" onClick={nextQuestion} className="w-full rounded-2xl bg-orange-500 px-6 py-4 font-black text-white sm:w-auto">{questionIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div></div>}
    </section>
  </main>;
}
