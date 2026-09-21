import { useEffect, useMemo, useState } from 'react';

import {
  generateSemester1ReviewQuestions,
  REVIEW_SKILL_LABELS,
  type FlatShapeId,
  type PositionReviewQuestion,
  type ReviewAnswer,
  type ReviewSolidId,
  type ReviewSkillId,
  type Semester1ReviewQuestion,
} from '../lib/semester1ReviewQuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = {
  questionId: string;
  skillId: ReviewSkillId;
  attempts: number;
  correctFirstTry: boolean;
};
type SavedBest = { score: number; stars: number };

const STORAGE_KEY = 'dao-toan-hoc:lop-1:on-tap-hoc-ky-1:best-v1';
const COLOR_CLASSES: Record<string, string> = {
  sky: 'bg-sky-500',
  violet: 'bg-violet-500',
  emerald: 'bg-emerald-500',
  orange: 'bg-orange-500',
  rose: 'bg-rose-500',
};
const COLOR_HEX: Record<string, string> = {
  sky: '#0ea5e9',
  violet: '#8b5cf6',
  emerald: '#10b981',
  orange: '#f97316',
  rose: '#f43f5e',
};
const SOLID_COLORS: Record<string, { front: string; top: string; side: string }> = {
  sky: { front: '#38bdf8', top: '#7dd3fc', side: '#0284c7' },
  violet: { front: '#a78bfa', top: '#c4b5fd', side: '#7c3aed' },
  emerald: { front: '#34d399', top: '#6ee7b7', side: '#059669' },
  orange: { front: '#fb923c', top: '#fdba74', side: '#ea580c' },
  rose: { front: '#fb7185', top: '#fda4af', side: '#e11d48' },
};

function starsFor(score: number) {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

function ObjectGroup({
  icon,
  count,
  crossedFrom,
}: {
  icon: string;
  count: number;
  crossedFrom?: number;
}) {
  if (count === 0) {
    return (
      <div className="grid min-h-28 place-items-center rounded-2xl border-4 border-dashed border-slate-200 bg-white/70 p-4 font-black text-slate-400">
        Không có đồ vật nào
      </div>
    );
  }
  return (
    <div className="flex min-h-28 flex-wrap content-center justify-center gap-3">
      {Array.from({ length: count }).map((_, index) => {
        const crossed = crossedFrom !== undefined && index >= crossedFrom;
        return (
          <span key={index} className={`relative text-4xl md:text-5xl ${crossed ? 'opacity-40 grayscale' : ''}`}>
            {icon}
            {crossed && <span className="absolute left-1/2 top-1/2 h-1 w-[125%] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-red-500" />}
          </span>
        );
      })}
    </div>
  );
}

function FlatShape({ shape, color }: { shape: FlatShapeId; color: string }) {
  if (shape === 'circle') return <div className={`h-28 w-28 rounded-full ${COLOR_CLASSES[color]}`} />;
  if (shape === 'square') return <div className={`h-28 w-28 rounded-xl ${COLOR_CLASSES[color]}`} />;
  if (shape === 'rectangle') return <div className={`h-24 w-40 rounded-xl ${COLOR_CLASSES[color]}`} />;
  return (
    <div
      className="h-0 w-0"
      style={{
        borderLeft: '58px solid transparent',
        borderRight: '58px solid transparent',
        borderBottom: `96px solid ${COLOR_HEX[color]}`,
      }}
    />
  );
}

function SolidVisual({ solid, color }: { solid: ReviewSolidId; color: string }) {
  const palette = SOLID_COLORS[color];
  if (solid === 'cube') {
    return (
      <svg viewBox="0 0 180 180" className="h-48 w-48" role="img" aria-label="Khối lập phương">
        <polygon points="35,55 90,22 145,55 90,88" fill={palette.top} />
        <polygon points="35,55 90,88 90,153 35,120" fill={palette.front} />
        <polygon points="90,88 145,55 145,120 90,153" fill={palette.side} />
        <polyline points="35,55 90,22 145,55 145,120 90,153 35,120 35,55 90,88 145,55" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round" />
        <line x1="90" y1="88" x2="90" y2="153" stroke="white" strokeWidth="4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 170" className="h-44 w-64" role="img" aria-label="Khối hộp chữ nhật">
      <polygon points="28,58 92,25 214,25 150,58" fill={palette.top} />
      <polygon points="28,58 150,58 150,145 28,145" fill={palette.front} />
      <polygon points="150,58 214,25 214,112 150,145" fill={palette.side} />
      <polyline points="28,58 92,25 214,25 214,112 150,145 28,145 28,58 150,58 214,25" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round" />
      <line x1="150" y1="58" x2="150" y2="145" stroke="white" strokeWidth="4" />
    </svg>
  );
}

function PositionScene({ question }: { question: PositionReviewQuestion }) {
  const firstPosition =
    question.relation === 'Bên trái'
      ? 'col-start-1 row-start-2'
      : question.relation === 'Bên phải'
        ? 'col-start-3 row-start-2'
        : question.relation === 'Phía trên'
          ? 'col-start-2 row-start-1'
          : 'col-start-2 row-start-3';
  const secondPosition =
    question.relation === 'Bên trái'
      ? 'col-start-3 row-start-2'
      : question.relation === 'Bên phải'
        ? 'col-start-1 row-start-2'
        : question.relation === 'Phía trên'
          ? 'col-start-2 row-start-3'
          : 'col-start-2 row-start-1';
  return (
    <div className="mx-auto grid h-72 max-w-xl grid-cols-3 grid-rows-3 rounded-3xl bg-sky-50 p-4">
      <div className={`grid place-items-center text-center ${firstPosition}`}><div><div className="text-6xl">{question.firstIcon}</div><p className="mt-2 rounded-full bg-white px-3 py-1 text-sm font-black">{question.firstName}</p></div></div>
      <div className={`grid place-items-center text-center ${secondPosition}`}><div><div className="text-6xl">{question.secondIcon}</div><p className="mt-2 rounded-full bg-white px-3 py-1 text-sm font-black">{question.secondName}</p></div></div>
    </div>
  );
}

export default function Semester1ReviewGame() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [practiceSize, setPracticeSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<Semester1ReviewQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<ReviewAnswer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [bestResult, setBestResult] = useState<SavedBest | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateSemester1ReviewQuestions(10));
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
    const bySkill = (Object.keys(REVIEW_SKILL_LABELS) as ReviewSkillId[])
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
    setQuestions(generateSemester1ReviewQuestions(size));
    setQuestionIndex(0);
    setResults([]);
    setReviewMode(false);
    resetAnswer();
    setScreen('guide');
  }

  function chooseAnswer(answer: ReviewAnswer) {
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

  function answerClass(answer: ReviewAnswer) {
    if (selectedAnswer === answer && answer !== question.correctAnswer) return 'border-red-400 bg-red-50 text-red-700';
    if (canContinue && answer === question.correctAnswer) return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-rose-300 hover:bg-rose-50';
  }

  function AnswerButtons({ answers }: { answers: ReviewAnswer[] }) {
    return (
      <div className={`grid gap-3 ${answers.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {answers.map((answer) => (
          <button key={String(answer)} type="button" disabled={canContinue} onClick={() => chooseAnswer(answer)} className={`min-h-20 rounded-2xl border-4 px-3 py-4 text-xl font-black shadow-sm transition ${answerClass(answer)}`}>
            {answer}
          </button>
        ))}
      </div>
    );
  }

  function renderQuestion() {
    if (!question) return null;
    if (question.type === 'count') {
      return <><div className="rounded-3xl bg-sky-50 p-6"><ObjectGroup icon={question.object} count={question.count} /></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'compare') {
      return <><div className="flex min-h-56 items-center justify-center gap-4 rounded-3xl bg-orange-50 p-5"><div className="grid h-24 w-24 place-items-center rounded-3xl bg-orange-400 text-5xl font-black text-white">{question.left}</div><div className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-dashed border-orange-300 bg-white text-4xl font-black text-orange-500">?</div><div className="grid h-24 w-24 place-items-center rounded-3xl bg-orange-400 text-5xl font-black text-white">{question.right}</div></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'number-bond') {
      return <><div className="rounded-3xl bg-emerald-50 p-6"><div className="mx-auto grid max-w-sm grid-cols-2 gap-4"><div className="col-span-2 mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-emerald-300 bg-white text-4xl font-black text-emerald-700">{question.whole}</div><div className="grid h-20 place-items-center rounded-2xl bg-emerald-500 text-3xl font-black text-white">{question.knownPart}</div><div className="grid h-20 place-items-center rounded-2xl border-4 border-dashed border-emerald-400 bg-white text-3xl font-black text-emerald-600">?</div></div></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'sequence') {
      return <><div className="flex min-h-56 flex-wrap items-center justify-center gap-3 rounded-3xl bg-fuchsia-50 p-5">{question.sequence.map((number, index) => <div key={index} className={`grid h-20 w-20 place-items-center rounded-2xl border-4 text-3xl font-black ${number === null ? 'border-dashed border-fuchsia-400 bg-white text-fuchsia-500' : 'border-white bg-fuchsia-500 text-white'}`}>{number === null ? '?' : number}</div>)}</div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'arithmetic') {
      const result = Number(question.correctAnswer);
      const crossedFrom = question.operation === 'subtraction' ? result : undefined;
      return <>{question.visual ? <div className="rounded-3xl bg-violet-50 p-6">{question.operation === 'addition' ? <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]"><ObjectGroup icon={question.object} count={question.first} /><span className="text-center text-5xl font-black text-violet-600">+</span><ObjectGroup icon={question.object} count={question.second} /></div> : <ObjectGroup icon={question.object} count={question.first} crossedFrom={crossedFrom} />}</div> : <div className="grid min-h-56 place-items-center rounded-3xl bg-violet-50 p-6"><p className="text-6xl font-black text-violet-700">{question.first} {question.operation === 'addition' ? '+' : '−'} {question.second} = ?</p></div>}<div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'missing-arithmetic') {
      return <><div className="flex min-h-56 flex-wrap items-center justify-center gap-3 rounded-3xl bg-amber-50 p-5">{question.equation.map((token, index) => <div key={index} className={`grid h-20 min-w-20 place-items-center rounded-2xl px-4 text-4xl font-black ${token === null ? 'border-4 border-dashed border-amber-400 bg-white text-amber-600' : typeof token === 'number' ? 'bg-amber-500 text-white' : 'text-amber-700'}`}>{token === null ? '?' : token}</div>)}</div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'word-problem') {
      const remaining = question.operation === 'subtraction' ? question.first - question.change : undefined;
      return <><div className="rounded-3xl bg-cyan-50 p-6"><p className="mx-auto max-w-3xl text-center text-xl font-black leading-9">{question.story}</p><div className="mt-5 rounded-2xl bg-white/80 p-4">{question.operation === 'addition' ? <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]"><ObjectGroup icon={question.object} count={question.first} /><span className="text-center text-4xl font-black text-cyan-600">+</span><ObjectGroup icon={question.object} count={question.change} /></div> : <ObjectGroup icon={question.object} count={question.first} crossedFrom={remaining} />}</div></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'flat-shape') {
      return <><div className="grid min-h-64 place-items-center rounded-3xl bg-rose-50 p-6"><FlatShape shape={question.shape} color={question.color} /></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'solid') {
      return <><div className="grid min-h-64 place-items-center rounded-3xl bg-orange-50 p-6"><SolidVisual solid={question.solid} color={question.color} /></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    return <><PositionScene question={question} /><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
  }

  if (!questions.length) {
    return <main className="grid min-h-screen place-items-center text-center"><div><div className="text-7xl">📚</div><p className="mt-4 text-xl font-black text-rose-700">Sóc Nâu và Gấu Mật đang chuẩn bị đề ôn...</p></div></main>;
  }

  if (screen === 'intro') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <a href="/lop-1" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 1</a>
        <section className="mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl shadow-rose-100">
          <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 p-8 text-white md:p-12">
            <p className="font-black tracking-widest text-rose-100">Mục 5 · Bài 17–20</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Ôn tập học kỳ I</h1>
            <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">Ôn tổng hợp số đến 10, phép tính, hình phẳng và hình khối.</p>
          </div>
          <div className="p-6 md:p-10">
            <div className="grid gap-4 md:grid-cols-3">
              {[['🔢', 'Các số đến 10', 'Đếm, so sánh, tách – gộp và dãy số'], ['➕', 'Cộng và trừ', 'Phép tính, số còn thiếu và bài toán'], ['🔺', 'Hình học', 'Hình phẳng, hình khối và vị trí']].map(([icon, title, description]) => <div key={title} className="rounded-3xl bg-slate-50 p-5 text-center"><div className="text-4xl">{icon}</div><p className="mt-3 text-lg font-black text-slate-800">{title}</p><p className="mt-2 font-semibold text-slate-500">{description}</p></div>)}
            </div>
            <h2 className="mt-8 text-xl font-black text-slate-900">Chọn lượt ôn tập</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {([[5, 'Ôn nhanh', 'Kiểm tra nhanh ba nhóm kiến thức'], [10, 'Ôn chuẩn', 'Bao phủ các dạng trọng tâm'], [15, 'Ôn toàn diện', 'Nhiều câu và độ bao phủ cao hơn']] as const).map(([size, title, description]) => (
                <button key={size} type="button" onClick={() => prepareSession(size)} className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${size === 10 ? 'border-rose-400 bg-rose-50 shadow-lg shadow-rose-100' : 'border-slate-100 bg-white hover:border-pink-300'}`}><span className="text-sm font-black text-rose-700">{size} câu</span><span className="mt-1 block text-xl font-black">{title}</span><span className="mt-2 block font-semibold text-slate-500">{description}</span></button>
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
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl shadow-rose-100 md:p-10">
          <div className="flex items-start gap-4"><span className="text-6xl">🐿️</span><span className="-ml-6 mt-5 text-5xl">🐻</span><div><p className="font-black text-rose-600">Sóc Nâu và Gấu Mật nhắc bé</p><h1 className="mt-1 text-3xl font-black">Đọc kỹ trước khi trả lời</h1></div></div>
          <div className="my-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-sky-50 p-5"><p className="font-black text-sky-700">Số học</p><p className="mt-2 font-semibold text-slate-600">Đếm và quan sát vị trí của số.</p></div>
            <div className="rounded-3xl bg-violet-50 p-5"><p className="font-black text-violet-700">Phép tính</p><p className="mt-2 font-semibold text-slate-600">Xác định thêm vào hay bớt đi.</p></div>
            <div className="rounded-3xl bg-orange-50 p-5"><p className="font-black text-orange-700">Hình học</p><p className="mt-2 font-semibold text-slate-600">Nhìn đường bao, chiều sâu và vị trí.</p></div>
          </div>
          <p className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">Lượt 10 câu bao phủ đầy đủ các dạng trọng tâm của học kỳ I.</p>
          <button type="button" onClick={() => setScreen('lesson')} className="mt-7 w-full rounded-2xl bg-rose-600 px-7 py-4 text-lg font-black text-white shadow-lg shadow-rose-200">Bắt đầu {practiceSize} câu</button>
        </section>
      </main>
    );
  }

  if (screen === 'result') {
    const missed = results.filter((item) => !item.correctFirstTry).length;
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl shadow-rose-100 md:p-10">
          <div className="text-7xl">{reviewMode ? '💪' : '🎉'}</div>
          <p className="mt-4 font-black tracking-widest text-rose-700">{reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành ôn tập học kỳ I'}</p>
          <h1 className="mt-2 text-4xl font-black">{summary.score >= 90 ? 'Sẵn sàng cho học kỳ mới!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Bé đã rất cố gắng!'}</h1>
          <div className="mt-6 flex justify-center gap-3 text-5xl">{[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}</div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-sky-50 p-5"><p className="font-black text-sky-700">Điểm số</p><p className="mt-1 text-3xl font-black">{summary.score}%</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-black text-emerald-700">Đúng lần đầu</p><p className="mt-1 text-3xl font-black">{summary.correct}/{results.length}</p></div><div className="rounded-2xl bg-amber-50 p-5"><p className="font-black text-amber-700">Sao nhận được</p><p className="mt-1 text-3xl font-black">{summary.stars}/3</p></div></div>
          <div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left"><h2 className="bg-slate-50 px-5 py-4 text-xl font-black">Kết quả theo nhóm kiến thức</h2><div className="divide-y divide-slate-100">{summary.bySkill.map((item) => { const percent = Math.round((item.correct / item.total) * 100); return <div key={item.skillId} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black text-slate-800">{REVIEW_SKILL_LABELS[item.skillId]}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${percent >= 70 ? 'bg-emerald-400' : 'bg-orange-400'}`} style={{ width: `${percent}%` }} /></div></div><p className="font-black text-slate-600">{item.correct}/{item.total}</p></div>; })}</div></div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{!reviewMode && missed > 0 && <button type="button" onClick={startMistakeReview} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu cần nhớ</button>}<button type="button" onClick={() => prepareSession(practiceSize)} className="rounded-2xl bg-rose-600 px-6 py-4 font-black text-white">Luyện bộ câu mới</button><a href="/lop-1" className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black text-slate-700">Về lớp 1</a></div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-7">
      <header className="mb-5 flex items-center justify-between gap-4"><button type="button" onClick={() => setScreen('intro')} className="rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Thoát</button><div className="text-right"><p className="font-black text-rose-700">{reviewMode ? 'Ôn lại · ' : ''}Câu {questionIndex + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{REVIEW_SKILL_LABELS[question.skillId]}</p></div></header>
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-orange-400 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <section className="rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl shadow-rose-100 md:p-9">
        <div className="mb-6 flex items-center gap-4"><span className="text-5xl">{questionIndex % 2 === 0 ? '🐿️' : '🐻'}</span><div><p className="font-black text-rose-700">{questionIndex % 2 === 0 ? 'Sóc Nâu hỏi' : 'Gấu Mật hỏi'}</p><h1 className="mt-1 text-2xl font-black md:text-3xl">{question.instruction}</h1></div></div>
        {renderQuestion()}
        {selectedAnswer !== null && !canContinue && <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5"><div className="flex items-start gap-3"><span className="text-3xl">💡</span><div className="flex-1"><h2 className="text-xl font-black text-orange-700">Chưa đúng, mình xem lại nhé!</h2><p className="mt-2 font-semibold leading-7 text-slate-600"><span className="font-black">Gợi ý {hintLevel}/3:</span> {question.hintSteps[Math.max(0, hintLevel - 1)]}</p><button type="button" onClick={() => setSelectedAnswer(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div></div></div>}
        {canContinue && selectedAnswer === question.correctAnswer && <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div className="flex items-start gap-3"><span className="text-3xl">🎉</span><div><h2 className="text-xl font-black text-emerald-700">Chính xác!</h2><p className="mt-1 font-semibold leading-7 text-slate-600">{question.explanation}</p></div></div><button type="button" onClick={nextQuestion} className="w-full rounded-2xl bg-rose-600 px-6 py-4 font-black text-white sm:w-auto">{questionIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div></div>}
      </section>
    </main>
  );
}
