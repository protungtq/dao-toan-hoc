import ResultShare from './ResultShare';
import { buildAdaptiveQuestionSet } from '../lib/learningProfile';
import { playCorrectSound, playFinalSound, playWrongSound } from '../lib/gameAudio';
import { useEffect, useMemo, useState } from 'react';

import {
  generateSolidPositionQuestions,
  SOLID_LABELS,
  SOLID_POSITION_SKILL_LABELS,
  type PositionQuestion,
  type SolidId,
  type SolidPositionAnswer,
  type SolidPositionQuestion,
  type SolidPositionSkillId,
} from '../lib/solidPositionQuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = {
  questionId: string;
  skillId: SolidPositionSkillId;
  attempts: number;
  correctFirstTry: boolean;
};
type SavedBest = { score: number; stars: number };

const STORAGE_KEY = 'dao-toan-hoc:lop-1:hinh-khoi-vi-tri:best-v1';
const COLORS: Record<string, { front: string; top: string; side: string }> = {
  orange: { front: '#fb923c', top: '#fdba74', side: '#ea580c' },
  sky: { front: '#38bdf8', top: '#7dd3fc', side: '#0284c7' },
  emerald: { front: '#34d399', top: '#6ee7b7', side: '#059669' },
  violet: { front: '#a78bfa', top: '#c4b5fd', side: '#7c3aed' },
  rose: { front: '#fb7185', top: '#fda4af', side: '#e11d48' },
};

function starsFor(score: number) {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

function SolidVisual({
  solid,
  color = 'orange',
  small = false,
}: {
  solid: SolidId;
  color?: string;
  small?: boolean;
}) {
  const palette = COLORS[color] ?? COLORS.orange;
  if (solid === 'cube') {
    return (
      <svg viewBox="0 0 180 180" className={small ? 'h-28 w-28' : 'h-48 w-48'} role="img" aria-label="Khối lập phương">
        <polygon points="35,55 90,22 145,55 90,88" fill={palette.top} />
        <polygon points="35,55 90,88 90,153 35,120" fill={palette.front} />
        <polygon points="90,88 145,55 145,120 90,153" fill={palette.side} />
        <polyline points="35,55 90,22 145,55 145,120 90,153 35,120 35,55 90,88 145,55" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round" />
        <line x1="90" y1="88" x2="90" y2="153" stroke="white" strokeWidth="4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 170" className={small ? 'h-28 w-40' : 'h-44 w-64'} role="img" aria-label="Khối hộp chữ nhật">
      <polygon points="28,58 92,25 214,25 150,58" fill={palette.top} />
      <polygon points="28,58 150,58 150,145 28,145" fill={palette.front} />
      <polygon points="150,58 214,25 214,112 150,145" fill={palette.side} />
      <polyline points="28,58 92,25 214,25 214,112 150,145 28,145 28,58 150,58 214,25" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round" />
      <line x1="150" y1="58" x2="150" y2="145" stroke="white" strokeWidth="4" />
    </svg>
  );
}

function PositionScene({ question }: { question: PositionQuestion }) {
  const relation = question.relation;
  if (relation === 'Phía trước' || relation === 'Phía sau') {
    const firstIsFront = relation === 'Phía trước';
    return (
      <div className="relative mx-auto h-72 max-w-xl overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 to-emerald-100">
        <div className="absolute bottom-6 left-1/2 h-28 w-[85%] -translate-x-1/2 rounded-[50%] bg-emerald-200/70" />
        <div className={`absolute left-1/2 -translate-x-1/2 text-center ${firstIsFront ? 'bottom-5 z-20 scale-125' : 'top-8 z-10 scale-75'}`}>
          <div className="text-6xl">{question.firstIcon}</div>
          <p className="mt-1 rounded-full bg-white/90 px-3 py-1 text-sm font-black text-slate-700">{question.firstName}</p>
        </div>
        <div className={`absolute left-[28%] -translate-x-1/2 text-center ${firstIsFront ? 'top-8 z-10 scale-75' : 'bottom-5 z-20 scale-125'}`}>
          <div className="text-6xl">{question.secondIcon}</div>
          <p className="mt-1 rounded-full bg-white/90 px-3 py-1 text-sm font-black text-slate-700">{question.secondName}</p>
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-500">Xa hơn</span>
        <span className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-500">Gần hơn</span>
      </div>
    );
  }

  const firstPosition =
    relation === 'Bên trái'
      ? 'col-start-1 row-start-2'
      : relation === 'Bên phải'
        ? 'col-start-3 row-start-2'
        : relation === 'Phía trên'
          ? 'col-start-2 row-start-1'
          : 'col-start-2 row-start-3';
  const secondPosition =
    relation === 'Bên trái'
      ? 'col-start-3 row-start-2'
      : relation === 'Bên phải'
        ? 'col-start-1 row-start-2'
        : relation === 'Phía trên'
          ? 'col-start-2 row-start-3'
          : 'col-start-2 row-start-1';

  return (
    <div className="mx-auto grid h-72 max-w-xl grid-cols-3 grid-rows-3 rounded-3xl bg-sky-50 p-4">
      <div className={`grid place-items-center text-center ${firstPosition}`}>
        <div><div className="text-6xl">{question.firstIcon}</div><p className="mt-2 rounded-full bg-white px-3 py-1 text-sm font-black text-slate-700">{question.firstName}</p></div>
      </div>
      <div className={`grid place-items-center text-center ${secondPosition}`}>
        <div><div className="text-6xl">{question.secondIcon}</div><p className="mt-2 rounded-full bg-white px-3 py-1 text-sm font-black text-slate-700">{question.secondName}</p></div>
      </div>
    </div>
  );
}

export default function SolidPositionGame() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [practiceSize, setPracticeSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<SolidPositionQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<SolidPositionAnswer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [bestResult, setBestResult] = useState<SavedBest | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateSolidPositionQuestions(10));
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      setBestResult(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const question = questions[questionIndex];
  const progress = questions.length
    ? ((questionIndex + 1) / questions.length) * 100
    : 0;
  const summary = useMemo(() => {
    const correct = results.filter((item) => item.correctFirstTry).length;
    const score = results.length ? Math.round((correct / results.length) * 100) : 0;
    const bySkill = (Object.keys(SOLID_POSITION_SKILL_LABELS) as SolidPositionSkillId[])
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
    setQuestions(generateSolidPositionQuestions(size));
    setQuestionIndex(0);
    setResults([]);
    setReviewMode(false);
    resetAnswer();
    setScreen('guide');
  }

  function chooseAnswer(answer: SolidPositionAnswer) {
    if (!question || canContinue) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setSelectedAnswer(answer);
    if (answer === question.correctAnswer) {playCorrectSound();
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
      playWrongSound();setHintLevel(Math.min(nextAttempts, 3));
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
    playFinalSound();setScreen('result');
  }

  function startMistakeReview() {
    const missedIds = new Set(
      results.filter((item) => !item.correctFirstTry).map((item) => item.questionId)
    );
    const missed = questions.filter((item) => missedIds.has(item.id));
    if (!missed.length) return;
    setQuestions(missed);
    setQuestionIndex(0);
    setResults([]);
    setReviewMode(true);
    resetAnswer();
    setScreen('lesson');
  }

  function answerClass(answer: SolidPositionAnswer) {
    if (selectedAnswer === answer && answer !== question.correctAnswer) {
      return 'border-red-400 bg-red-50 text-red-700';
    }
    if (canContinue && answer === question.correctAnswer) {
      return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    }
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-50';
  }

  function AnswerButtons({ answers }: { answers: SolidPositionAnswer[] }) {
    return (
      <div className={`grid gap-3 ${answers.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {answers.map((answer) => (
          <button
            key={String(answer)}
            type="button"
            disabled={canContinue}
            onClick={() => chooseAnswer(answer)}
            className={`min-h-20 rounded-2xl border-4 px-3 py-4 text-lg font-black shadow-sm transition md:text-xl ${answerClass(answer)}`}
          >
            {answer}
          </button>
        ))}
      </div>
    );
  }

  function renderQuestion() {
    if (!question) return null;
    if (question.type === 'recognize-solid') {
      return (
        <>
          <div className="grid min-h-64 place-items-center rounded-3xl bg-orange-50 p-6">
            <SolidVisual solid={question.solid} color={question.color} />
          </div>
          <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
        </>
      );
    }
    if (question.type === 'choose-solid') {
      return (
        <div className="grid gap-4 rounded-3xl bg-amber-50 p-5 sm:grid-cols-2">
          {question.options.map((solid, index) => (
            <button
              key={solid}
              type="button"
              disabled={canContinue}
              onClick={() => chooseAnswer(solid)}
              className={`grid min-h-60 place-items-center rounded-3xl border-4 p-4 transition ${answerClass(solid)}`}
              aria-label={SOLID_LABELS[solid]}
            >
              <SolidVisual solid={solid} color={index === 0 ? 'sky' : 'orange'} />
            </button>
          ))}
        </div>
      );
    }
    if (question.type === 'object-solid') {
      return (
        <>
          <div className="grid min-h-64 place-items-center rounded-3xl bg-sky-50 p-6 text-center">
            <div><div className="text-8xl">{question.objectIcon}</div><p className="mt-4 text-xl font-black text-sky-800">{question.objectName}</p></div>
          </div>
          <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
        </>
      );
    }
    if (question.type === 'count-solid') {
      return (
        <>
          <div className="flex min-h-64 flex-wrap items-center justify-center gap-3 rounded-3xl bg-violet-50 p-5">
            {question.solids.map((item, index) => <SolidVisual key={index} solid={item.solid} color={item.color} small />)}
          </div>
          <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
        </>
      );
    }
    if (question.type === 'position') {
      return (
        <>
          <PositionScene question={question} />
          <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
        </>
      );
    }

    const directions = [
      { id: 'up', label: '↑', position: 'col-start-2 row-start-1' },
      { id: 'left', label: '←', position: 'col-start-1 row-start-2' },
      { id: 'right', label: '→', position: 'col-start-3 row-start-2' },
      { id: 'down', label: '↓', position: 'col-start-2 row-start-3' },
    ] as const;
    return (
      <div className="mx-auto grid h-80 max-w-md grid-cols-3 grid-rows-3 gap-3 rounded-3xl bg-emerald-50 p-5">
        <div className="col-start-2 row-start-2 grid place-items-center rounded-2xl bg-white text-6xl shadow-md">{question.mascot}</div>
        {directions.map((direction) => (
          <button
            key={direction.id}
            type="button"
            disabled={canContinue}
            onClick={() => chooseAnswer(direction.id)}
            className={`${direction.position} grid place-items-center rounded-2xl border-4 text-4xl font-black transition ${answerClass(direction.id)}`}
            aria-label={direction.id}
          >
            {direction.label}
          </button>
        ))}
      </div>
    );
  }

  if (!questions.length) {
    return (
      <main className="grid min-h-screen place-items-center text-center">
        <div><div className="text-7xl">🐻</div><p className="mt-4 text-xl font-black text-orange-700">Gấu Mật đang xếp các khối...</p></div>
      </main>
    );
  }

  if (screen === 'intro') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <a href="/lop-1" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 1</a>
        <section className="mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl shadow-orange-100">
          <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 p-8 text-white md:p-12">
            <p className="font-black tracking-widest text-orange-100">Mục 4 · Bài 14–16</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Hình khối và vị trí</h1>
            <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">
              Nhận biết hình khối và xác định vị trí của đồ vật trong không gian.
            </p>
          </div>
          <div className="p-6 md:p-10">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['📦', 'Nhận biết hình khối'],
                ['🗃️', 'Phân loại hình khối'],
                ['🧭', 'Vị trí trong không gian'],
                ['🗺️', 'Làm theo chỉ dẫn'],
              ].map(([icon, label]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-3xl">{icon}</div><p className="mt-2 font-black text-slate-700">{label}</p></div>
              ))}
            </div>
            <h2 className="mt-8 text-xl font-black text-slate-900">Chọn lượt luyện tập</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {([
                [5, 'Luyện nhanh', 'Ôn đủ bốn kỹ năng'],
                [10, 'Luyện chuẩn', 'Cân bằng hình khối và vị trí'],
                [15, 'Thử thách', 'Nhiều tình huống không gian hơn'],
              ] as const).map(([size, title, description]) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => prepareSession(size)}
                  className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${size === 10 ? 'border-orange-400 bg-orange-50 shadow-lg shadow-orange-100' : 'border-slate-100 bg-white hover:border-amber-300'}`}
                >
                  <span className="text-sm font-black text-orange-700">{size} câu</span><span className="mt-1 block text-xl font-black text-slate-900">{title}</span><span className="mt-2 block font-semibold text-slate-500">{description}</span>
                </button>
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
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl shadow-orange-100 md:p-10">
          <div className="flex items-start gap-4"><span className="text-6xl">🐻</span><div><p className="font-black text-orange-600">Gấu Mật nhắc bé</p><h1 className="mt-1 text-3xl font-black text-slate-900">Hình khối không phải hình phẳng</h1></div></div>
          <div className="my-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-sky-50 p-5"><p className="font-black text-sky-700">Khối lập phương</p><p className="mt-2 font-semibold leading-7 text-slate-600">Có dạng đều như con xúc xắc, các chiều trông bằng nhau.</p></div>
            <div className="rounded-3xl bg-orange-50 p-5"><p className="font-black text-orange-700">Khối hộp chữ nhật</p><p className="mt-2 font-semibold leading-7 text-slate-600">Có dạng hộp dài như quyển sách hoặc viên gạch.</p></div>
          </div>
          <p className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">Khi xác định vị trí, luôn đọc kỹ đồ vật nào đang được hỏi và so sánh với đồ vật nào.</p>
          <button type="button" onClick={() => setScreen('lesson')} className="mt-7 w-full rounded-2xl bg-orange-600 px-7 py-4 text-lg font-black text-white shadow-lg shadow-orange-200">Bắt đầu {practiceSize} câu</button>
        </section>
      </main>
    );
  }

  if (screen === 'result') {
    const missed = results.filter((item) => !item.correctFirstTry).length;
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl shadow-orange-100 md:p-10">
          <div className="text-7xl">{reviewMode ? '💪' : '🎉'}</div>
          <p className="mt-4 font-black tracking-widest text-orange-700">{reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành bài luyện tập'}</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">{summary.score >= 90 ? 'Nhà thám hiểm không gian!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Bé đã rất cố gắng!'}</h1>
          <div className="mt-6 flex justify-center gap-3 text-5xl">{[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}</div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-sky-50 p-5"><p className="font-black text-sky-700">Điểm số</p><p className="mt-1 text-3xl font-black">{summary.score}%</p></div>
            <div className="rounded-2xl bg-emerald-50 p-5"><p className="font-black text-emerald-700">Đúng lần đầu</p><p className="mt-1 text-3xl font-black">{summary.correct}/{results.length}</p></div>
            <div className="rounded-2xl bg-amber-50 p-5"><p className="font-black text-amber-700">Sao nhận được</p><p className="mt-1 text-3xl font-black">{summary.stars}/3</p></div>
          </div>
          <div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left">
            <h2 className="bg-slate-50 px-5 py-4 text-xl font-black text-slate-900">Kết quả theo kỹ năng</h2>
            <div className="divide-y divide-slate-100">
              {summary.bySkill.map((item) => {
                const percent = Math.round((item.correct / item.total) * 100);
                return (
                  <div key={item.skillId} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div><p className="font-black text-slate-800">{SOLID_POSITION_SKILL_LABELS[item.skillId]}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${percent >= 70 ? 'bg-emerald-400' : 'bg-orange-400'}`} style={{ width: `${percent}%` }} /></div></div>
                    <p className="font-black text-slate-600">{item.correct}/{item.total}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <ResultShare score={summary.score} correct={summary.correct} total={results.length} stars={summary.stars} attempts={results} /><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {!reviewMode && missed > 0 && <button type="button" onClick={startMistakeReview} className="rounded-2xl bg-rose-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu cần nhớ</button>}
            <button type="button" onClick={() => prepareSession(practiceSize)} className="rounded-2xl bg-orange-600 px-6 py-4 font-black text-white">Luyện bộ câu mới</button>
            <a href="/lop-1" className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black text-slate-700">Về lớp 1</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-7">
      <header className="mb-5 flex items-center justify-between gap-4">
        <button type="button" onClick={() => setScreen('intro')} className="rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Thoát</button>
        <div className="text-right"><p className="font-black text-orange-700">{reviewMode ? 'Ôn lại · ' : ''}Câu {questionIndex + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{SOLID_POSITION_SKILL_LABELS[question.skillId]}</p></div>
      </header>
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-white shadow-inner"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <section className="rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl shadow-orange-100 md:p-9">
        <div className="mb-6 flex items-center gap-4"><span className="text-5xl">{questionIndex % 2 === 0 ? '🐻' : '🐿️'}</span><div><p className="font-black text-orange-700">{questionIndex % 2 === 0 ? 'Gấu Mật hỏi' : 'Sóc Nâu hỏi'}</p><h1 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">{question.instruction}</h1></div></div>
        {renderQuestion()}
        {selectedAnswer !== null && !canContinue && (
          <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5">
            <div className="flex items-start gap-3"><span className="text-3xl">💡</span><div className="flex-1"><h2 className="text-xl font-black text-orange-700">Chưa đúng, mình quan sát lại nhé!</h2><p className="mt-2 font-semibold leading-7 text-slate-600"><span className="font-black">Gợi ý {hintLevel}/3:</span> {question.hintSteps[Math.max(0, hintLevel - 1)]}</p><button type="button" onClick={() => setSelectedAnswer(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div></div>
          </div>
        )}
        {canContinue && selectedAnswer === question.correctAnswer && (
          <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div className="flex items-start gap-3"><span className="text-3xl">🎉</span><div><h2 className="text-xl font-black text-emerald-700">Chính xác!</h2><p className="mt-1 font-semibold leading-7 text-slate-600">{question.explanation}</p></div></div><button type="button" onClick={nextQuestion} className="w-full rounded-2xl bg-orange-600 px-6 py-4 font-black text-white sm:w-auto">{questionIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div>
          </div>
        )}
      </section>
    </main>
  );
}
