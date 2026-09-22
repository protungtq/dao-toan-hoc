import { useEffect, useMemo, useState } from 'react';

import {
  generateLengthQuestions,
  LENGTH_SKILL_LABELS,
  type LengthAnswer,
  type LengthQuestion,
  type LengthSkillId,
} from '../lib/lengthQuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = {
  questionId: string;
  skillId: LengthSkillId;
  attempts: number;
  correctFirstTry: boolean;
};
type SavedBest = { score: number; stars: number };

const STORAGE_KEY = 'dao-toan-hoc:lop-1:do-dai:best-v1';

function starsFor(score: number) {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

function LengthBar({
  label,
  length,
  color,
}: {
  label: string;
  length: number;
  color: string;
}) {
  return (
    <div className="grid grid-cols-[2rem_1fr] items-center gap-3">
      <span className="font-black text-slate-600">{label}</span>
      <div className="h-7 rounded-full shadow-sm" style={{ width: `${length * 9}%`, backgroundColor: color }} />
    </div>
  );
}

function RulerVisual({ length, color }: { length: number; color: string }) {
  const startX = 40;
  const step = 58;
  const endX = startX + length * step;
  return (
    <svg viewBox="0 0 660 210" className="w-full max-w-3xl" role="img" aria-label={`Đoạn màu từ vạch 0 đến vạch ${length}`}>
      <line x1={startX} y1="55" x2={endX} y2="55" stroke={color} strokeWidth="18" strokeLinecap="round" />
      <circle cx={startX} cy="55" r="10" fill={color} />
      <circle cx={endX} cy="55" r="10" fill={color} />
      <rect x="25" y="100" width="610" height="82" rx="10" fill="#fef3c7" stroke="#f59e0b" strokeWidth="3" />
      {Array.from({ length: 11 }).map((_, index) => {
        const x = startX + index * step;
        return (
          <g key={index}>
            <line x1={x} y1="100" x2={x} y2="135" stroke="#92400e" strokeWidth="3" />
            <text x={x} y="165" textAnchor="middle" fontSize="22" fontWeight="800" fill="#78350f">{index}</text>
          </g>
        );
      })}
      <text x="620" y="165" textAnchor="end" fontSize="18" fontWeight="800" fill="#92400e">cm</text>
    </svg>
  );
}

export default function LengthGame() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [practiceSize, setPracticeSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<LengthQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<LengthAnswer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [bestResult, setBestResult] = useState<SavedBest | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateLengthQuestions(10));
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      setBestResult(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const question = questions[questionIndex];
  const progress = questions.length ? ((questionIndex + 1) / questions.length) * 100 : 0;
  const summary = useMemo(() => {
    const correct = results.filter((item) => item.correctFirstTry).length;
    const score = results.length ? Math.round((correct / results.length) * 100) : 0;
    const bySkill = (Object.keys(LENGTH_SKILL_LABELS) as LengthSkillId[])
      .map((skillId) => {
        const skillResults = results.filter((item) => item.skillId === skillId);
        return {
          skillId,
          total: skillResults.length,
          correct: skillResults.filter((item) => item.correctFirstTry).length,
        };
      })
      .filter((item) => item.total > 0);
    return { correct, score, stars: starsFor(score), bySkill };
  }, [results]);

  function resetAnswer() {
    setSelectedAnswer(null);
    setAttempts(0);
    setHintLevel(0);
    setCanContinue(false);
  }

  function prepareSession(size: PracticeSize) {
    setPracticeSize(size);
    setQuestions(generateLengthQuestions(size));
    setQuestionIndex(0);
    setResults([]);
    setReviewMode(false);
    resetAnswer();
    setScreen('guide');
  }

  function chooseAnswer(answer: LengthAnswer) {
    if (!question || canContinue) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setSelectedAnswer(answer);
    if (answer === question.correctAnswer) {
      setCanContinue(true);
      setResults((current) => [
        ...current,
        {
          questionId: question.id,
          skillId: question.skillId,
          attempts: nextAttempts,
          correctFirstTry: nextAttempts === 1,
        },
      ]);
    } else {
      setHintLevel(Math.min(nextAttempts, 3));
    }
  }

  function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      resetAnswer();
      return;
    }
    if (!reviewMode) {
      const correct = results.filter((item) => item.correctFirstTry).length;
      const score = Math.round((correct / questions.length) * 100);
      const saved = { score, stars: starsFor(score) };
      if (!bestResult || score > bestResult.score) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        setBestResult(saved);
      }
    }
    setScreen('result');
  }

  function startMistakeReview() {
    const missedIds = new Set(results.filter((item) => !item.correctFirstTry).map((item) => item.questionId));
    const missed = questions.filter((item) => missedIds.has(item.id));
    if (!missed.length) return;
    setQuestions(missed);
    setQuestionIndex(0);
    setResults([]);
    setReviewMode(true);
    resetAnswer();
    setScreen('lesson');
  }

  function answerClass(answer: LengthAnswer) {
    if (selectedAnswer === answer && answer !== question.correctAnswer) return 'border-red-400 bg-red-50 text-red-700';
    if (canContinue && answer === question.correctAnswer) return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-lime-300 hover:bg-lime-50';
  }

  function AnswerButtons({ answers }: { answers: LengthAnswer[] }) {
    const longAnswers = answers.some((answer) => String(answer).length > 10);
    return (
      <div className={`grid gap-3 ${longAnswers ? 'sm:grid-cols-2' : answers.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {answers.map((answer) => (
          <button key={String(answer)} type="button" disabled={canContinue} onClick={() => chooseAnswer(answer)} className={`min-h-20 rounded-2xl border-4 px-3 py-4 text-lg font-black shadow-sm transition md:text-xl ${answerClass(answer)}`}>
            {answer}
          </button>
        ))}
      </div>
    );
  }

  function renderQuestion() {
    if (!question) return null;
    if (question.type === 'compare-length') {
      return <><div className="space-y-8 rounded-3xl bg-lime-50 p-7"><LengthBar label="A" length={question.firstLength} color={question.firstColor} /><LengthBar label="B" length={question.secondLength} color={question.secondColor} /><p className="text-center text-sm font-bold text-slate-500">Hai đoạn bắt đầu từ cùng một vị trí</p></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'order-length') {
      return <><div className="space-y-6 rounded-3xl bg-emerald-50 p-7">{question.items.map((item) => <LengthBar key={item.label} label={item.label} length={item.length} color={item.color} />)}</div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'length-unit') {
      return <><div className="grid min-h-56 place-items-center rounded-3xl bg-sky-50 p-6 text-center">{question.mode === 'symbol' ? <div><p className="text-lg font-bold text-sky-700">Xăng-ti-mét</p><p className="mt-3 text-7xl font-black text-slate-900">?</p></div> : <div><div className="text-8xl">{question.objectIcon}</div><p className="mt-4 text-2xl font-black">{question.objectLength} ...</p></div>}</div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'measure-length') {
      return <><div className="overflow-x-auto rounded-3xl bg-amber-50 p-4"><RulerVisual length={question.length} color={question.color} /></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'estimate-length') {
      return <><div className="grid min-h-60 place-items-center rounded-3xl bg-violet-50 p-6 text-center"><div><div className="text-8xl">{question.objectIcon}</div><p className="mt-4 text-xl font-black text-violet-800">{question.objectName}</p><p className="mt-2 font-semibold text-slate-500">Chọn một độ dài hợp lí</p></div></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    return <><div className="rounded-3xl bg-orange-50 p-7"><p className="mx-auto max-w-3xl text-center text-xl font-black leading-9 text-slate-800">{question.story}</p><div className="mt-6 flex items-end justify-center gap-3"><div className="h-7 rounded-full bg-orange-400" style={{ width: `${question.firstLength * 24}px` }} /><span className="font-black text-orange-700">{question.firstLength} cm</span></div></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
  }

  if (!questions.length) {
    return <main className="grid min-h-screen place-items-center text-center"><div><div className="text-7xl">📏</div><p className="mt-4 text-xl font-black text-lime-700">Gấu Mật đang chuẩn bị thước đo...</p></div></main>;
  }

  if (screen === 'intro') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <a href="/lop-1" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 1</a>
        <section className="mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl shadow-lime-100">
          <div className="bg-gradient-to-br from-lime-500 via-green-500 to-emerald-500 p-8 text-white md:p-12">
            <p className="font-black tracking-widest text-lime-100">Mục 7 · Bài 25–28</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Độ dài và đo độ dài</h1>
            <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">So sánh, ước lượng và đo độ dài bằng đơn vị xăng-ti-mét.</p>
          </div>
          <div className="p-6 md:p-10">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[['↔️', 'Dài hơn, ngắn hơn'], ['📐', 'Đơn vị xăng-ti-mét'], ['📏', 'Đo độ dài'], ['🤔', 'Ước lượng'], ['📖', 'Bài toán độ dài']].map(([icon, label]) => <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-3xl">{icon}</div><p className="mt-2 font-black text-slate-700">{label}</p></div>)}
            </div>
            <h2 className="mt-8 text-xl font-black text-slate-900">Chọn lượt luyện tập</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {([[5, 'Luyện nhanh', 'Mỗi kỹ năng một câu'], [10, 'Luyện chuẩn', 'Tập trung so sánh và đo bằng thước'], [15, 'Thử thách', 'Luyện đầy đủ các dạng độ dài']] as const).map(([size, title, description]) => (
                <button key={size} type="button" onClick={() => prepareSession(size)} className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${size === 10 ? 'border-lime-400 bg-lime-50 shadow-lg shadow-lime-100' : 'border-slate-100 bg-white hover:border-green-300'}`}><span className="text-sm font-black text-green-700">{size} câu</span><span className="mt-1 block text-xl font-black">{title}</span><span className="mt-2 block font-semibold text-slate-500">{description}</span></button>
              ))}
            </div>
            {bestResult && <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">Kết quả tốt nhất: {bestResult.score}% · {'⭐'.repeat(bestResult.stars)}</p>}
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'guide') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl shadow-lime-100 md:p-10">
          <div className="flex items-start gap-4"><span className="text-6xl">🐻</span><div><p className="font-black text-green-700">Gấu Mật nhắc bé</p><h1 className="mt-1 text-3xl font-black">Đặt đúng vạch 0 trước khi đo</h1></div></div>
          <div className="my-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-lime-50 p-5"><p className="font-black text-lime-700">So sánh</p><p className="mt-2 font-semibold text-slate-600">Đặt hai vật cùng điểm bắt đầu rồi nhìn điểm cuối.</p></div>
            <div className="rounded-3xl bg-amber-50 p-5"><p className="font-black text-amber-700">Đo bằng thước</p><p className="mt-2 font-semibold text-slate-600">Đặt đầu vật tại vạch 0 và đọc số ở đầu còn lại.</p></div>
          </div>
          <p className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 font-bold text-sky-800">Xăng-ti-mét được viết tắt là cm.</p>
          <button type="button" onClick={() => setScreen('lesson')} className="mt-7 w-full rounded-2xl bg-green-600 px-7 py-4 text-lg font-black text-white shadow-lg shadow-green-200">Bắt đầu {practiceSize} câu</button>
        </section>
      </main>
    );
  }

  if (screen === 'result') {
    const missed = results.filter((item) => !item.correctFirstTry).length;
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl shadow-lime-100 md:p-10">
          <div className="text-7xl">{reviewMode ? '💪' : '🎉'}</div>
          <p className="mt-4 font-black tracking-widest text-green-700">{reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành bài luyện tập'}</p>
          <h1 className="mt-2 text-4xl font-black">{summary.score >= 90 ? 'Nhà đo lường tài ba!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Bé đã rất cố gắng!'}</h1>
          <div className="mt-6 flex justify-center gap-3 text-5xl">{[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}</div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-sky-50 p-5"><p className="font-black text-sky-700">Điểm số</p><p className="mt-1 text-3xl font-black">{summary.score}%</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-black text-emerald-700">Đúng lần đầu</p><p className="mt-1 text-3xl font-black">{summary.correct}/{results.length}</p></div><div className="rounded-2xl bg-amber-50 p-5"><p className="font-black text-amber-700">Sao nhận được</p><p className="mt-1 text-3xl font-black">{summary.stars}/3</p></div></div>
          <div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left"><h2 className="bg-slate-50 px-5 py-4 text-xl font-black">Kết quả theo kỹ năng</h2><div className="divide-y divide-slate-100">{summary.bySkill.map((item) => { const percent = Math.round((item.correct / item.total) * 100); return <div key={item.skillId} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black text-slate-800">{LENGTH_SKILL_LABELS[item.skillId]}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${percent >= 70 ? 'bg-emerald-400' : 'bg-orange-400'}`} style={{ width: `${percent}%` }} /></div></div><p className="font-black text-slate-600">{item.correct}/{item.total}</p></div>; })}</div></div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{!reviewMode && missed > 0 && <button type="button" onClick={startMistakeReview} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu cần nhớ</button>}<button type="button" onClick={() => prepareSession(practiceSize)} className="rounded-2xl bg-green-600 px-6 py-4 font-black text-white">Luyện bộ câu mới</button><a href="/lop-1" className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black text-slate-700">Về lớp 1</a></div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-7">
      <header className="mb-5 flex items-center justify-between gap-4"><button type="button" onClick={() => setScreen('intro')} className="rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Thoát</button><div className="text-right"><p className="font-black text-green-700">{reviewMode ? 'Ôn lại · ' : ''}Câu {questionIndex + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{LENGTH_SKILL_LABELS[question.skillId]}</p></div></header>
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-lime-400 to-green-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <section className="rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl shadow-lime-100 md:p-9">
        <div className="mb-6 flex items-center gap-4"><span className="text-5xl">{questionIndex % 2 === 0 ? '🐻' : '🐿️'}</span><div><p className="font-black text-green-700">{questionIndex % 2 === 0 ? 'Gấu Mật hỏi' : 'Sóc Nâu hỏi'}</p><h1 className="mt-1 text-2xl font-black md:text-3xl">{question.instruction}</h1></div></div>
        {renderQuestion()}
        {selectedAnswer !== null && !canContinue && <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5"><div className="flex items-start gap-3"><span className="text-3xl">💡</span><div className="flex-1"><h2 className="text-xl font-black text-orange-700">Chưa đúng, mình đo lại nhé!</h2><p className="mt-2 font-semibold leading-7 text-slate-600"><span className="font-black">Gợi ý {hintLevel}/3:</span> {question.hintSteps[Math.max(0, hintLevel - 1)]}</p><button type="button" onClick={() => setSelectedAnswer(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div></div></div>}
        {canContinue && selectedAnswer === question.correctAnswer && <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div className="flex items-start gap-3"><span className="text-3xl">🎉</span><div><h2 className="text-xl font-black text-emerald-700">Chính xác!</h2><p className="mt-1 font-semibold leading-7 text-slate-600">{question.explanation}</p></div></div><button type="button" onClick={nextQuestion} className="w-full rounded-2xl bg-green-600 px-6 py-4 font-black text-white sm:w-auto">{questionIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div></div>}
      </section>
    </main>
  );
}
