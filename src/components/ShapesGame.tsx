import ResultShare from './ResultShare';
import SolutionExplanation from './SolutionExplanation';
import { buildAdaptiveQuestionSet } from '../lib/learningProfile';
import { playCorrectSound, playFinalSound, playWrongSound } from '../lib/gameAudio';
import { useEffect, useMemo, useState } from 'react';

import {
  generateShapeQuestions,
  SHAPE_LABELS,
  SHAPE_SKILL_LABELS,
  type CompositeId,
  type ShapeAnswer,
  type ShapeId,
  type ShapeQuestion,
  type ShapeSkillId,
} from '../lib/shapeQuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = {
  questionId: string;
  skillId: ShapeSkillId;
  attempts: number;
  correctFirstTry: boolean;
};
type SavedBest = { score: number; stars: number };

const STORAGE_KEY = 'dao-toan-hoc:lop-1:hinh-phang:best-v1';
const COLOR_CLASSES: Record<string, string> = {
  violet: 'bg-violet-500',
  sky: 'bg-sky-500',
  emerald: 'bg-emerald-500',
  orange: 'bg-orange-500',
  rose: 'bg-rose-500',
};
const COLOR_HEX: Record<string, string> = {
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  emerald: '#10b981',
  orange: '#f97316',
  rose: '#f43f5e',
};

function starsFor(score: number) {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

function ShapePiece({
  shape,
  color = 'violet',
  small = false,
}: {
  shape: ShapeId;
  color?: string;
  small?: boolean;
}) {
  const size = small ? 'h-16 w-16' : 'h-28 w-28';
  if (shape === 'circle') {
    return <div aria-label="Hình tròn" className={`${size} rounded-full ${COLOR_CLASSES[color]}`} />;
  }
  if (shape === 'square') {
    return <div aria-label="Hình vuông" className={`${size} rounded-xl ${COLOR_CLASSES[color]}`} />;
  }
  if (shape === 'rectangle') {
    return (
      <div
        aria-label="Hình chữ nhật"
        className={`${small ? 'h-14 w-24' : 'h-24 w-40'} rounded-xl ${COLOR_CLASSES[color]}`}
      />
    );
  }
  const border = small ? 34 : 58;
  return (
    <div
      aria-label="Hình tam giác"
      className="h-0 w-0"
      style={{
        borderLeft: `${border}px solid transparent`,
        borderRight: `${border}px solid transparent`,
        borderBottom: `${border * 1.65}px solid ${COLOR_HEX[color]}`,
      }}
    />
  );
}

function CompositePicture({ composite }: { composite: CompositeId }) {
  if (composite === 'house') {
    return (
      <svg viewBox="0 0 240 200" className="h-52 w-64" role="img" aria-label="Ngôi nhà ghép từ các hình">
        <polygon points="120,15 25,95 215,95" fill="#f97316" />
        <rect x="48" y="95" width="144" height="92" fill="#38bdf8" />
        <rect x="100" y="125" width="42" height="62" fill="#8b5cf6" />
      </svg>
    );
  }
  if (composite === 'robot') {
    return (
      <svg viewBox="0 0 240 220" className="h-52 w-64" role="img" aria-label="Rô-bốt ghép từ các hình">
        <rect x="75" y="15" width="90" height="70" fill="#a78bfa" />
        <circle cx="102" cy="48" r="9" fill="white" />
        <circle cx="138" cy="48" r="9" fill="white" />
        <rect x="68" y="95" width="104" height="82" fill="#38bdf8" />
        <rect x="34" y="102" width="28" height="70" fill="#10b981" />
        <rect x="178" y="102" width="28" height="70" fill="#10b981" />
        <rect x="82" y="182" width="28" height="34" fill="#f97316" />
        <rect x="130" y="182" width="28" height="34" fill="#f97316" />
      </svg>
    );
  }
  if (composite === 'ice-cream') {
    return (
      <svg viewBox="0 0 200 220" className="h-52 w-56" role="img" aria-label="Cây kem ghép từ các hình">
        <circle cx="100" cy="62" r="52" fill="#f472b6" />
        <polygon points="48,88 152,88 100,212" fill="#f59e0b" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 260 200" className="h-52 w-64" role="img" aria-label="Chiếc thuyền ghép từ các hình">
      <rect x="126" y="20" width="8" height="115" fill="#475569" />
      <polygon points="126,25 45,125 126,125" fill="#38bdf8" />
      <polygon points="136,45 210,125 136,125" fill="#a78bfa" />
      <rect x="38" y="128" width="184" height="48" fill="#f97316" />
    </svg>
  );
}

export default function ShapesGame() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [practiceSize, setPracticeSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<ShapeQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<ShapeAnswer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [bestResult, setBestResult] = useState<SavedBest | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateShapeQuestions(10));
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
    const bySkill = (Object.keys(SHAPE_SKILL_LABELS) as ShapeSkillId[])
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
    setQuestions(generateShapeQuestions(size));
    setQuestionIndex(0);
    setResults([]);
    setReviewMode(false);
    resetAnswer();
    setScreen('guide');
  }

  function chooseAnswer(answer: ShapeAnswer) {
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

  function newSession() {
    prepareSession(practiceSize);
  }

  function answerClass(answer: ShapeAnswer) {
    if (selectedAnswer === answer && answer !== question.correctAnswer) {
      return 'border-red-400 bg-red-50 text-red-700';
    }
    if (canContinue && answer === question.correctAnswer) {
      return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    }
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50';
  }

  function AnswerButtons({ answers }: { answers: ShapeAnswer[] }) {
    return (
      <div className={`grid gap-3 ${answers.length === 3 ? 'sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {answers.map((answer) => (
          <button
            key={String(answer)}
            type="button"
            disabled={canContinue}
            onClick={() => chooseAnswer(answer)}
            className={`min-h-20 rounded-2xl border-4 px-4 py-3 text-lg font-black shadow-sm transition ${answerClass(answer)}`}
          >
            {answer}
          </button>
        ))}
      </div>
    );
  }

  function renderQuestion() {
    if (!question) return null;
    if (question.type === 'identify-shape') {
      return (
        <>
          <div className="grid min-h-64 place-items-center rounded-3xl bg-violet-50 p-8">
            <ShapePiece shape={question.shape} color={question.color} />
          </div>
          <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
        </>
      );
    }
    if (question.type === 'choose-shape') {
      return (
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-sky-50 p-5 sm:grid-cols-4">
          {question.shapeOptions.map((shape, index) => (
            <button
              key={shape}
              type="button"
              disabled={canContinue}
              onClick={() => chooseAnswer(shape)}
              className={`grid min-h-44 place-items-center rounded-3xl border-4 p-4 transition ${answerClass(shape)}`}
              aria-label={SHAPE_LABELS[shape]}
            >
              <ShapePiece shape={shape} color={['violet', 'sky', 'emerald', 'orange'][index]} small />
            </button>
          ))}
        </div>
      );
    }
    if (question.type === 'classify-shape') {
      return (
        <>
          <div className="flex min-h-64 flex-wrap items-center justify-center gap-6 rounded-3xl bg-amber-50 p-6">
            {question.shapes.map((item, index) => (
              <ShapePiece key={index} shape={item.shape} color={item.color} small />
            ))}
          </div>
          <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
        </>
      );
    }
    if (question.type === 'odd-shape') {
      return (
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-rose-50 p-5 sm:grid-cols-4">
          {question.shapes.map((shape, index) => (
            <button
              key={index}
              type="button"
              disabled={canContinue}
              onClick={() => chooseAnswer(index)}
              className={`grid min-h-44 place-items-center rounded-3xl border-4 p-4 transition ${answerClass(index)}`}
            >
              <ShapePiece shape={shape} color="rose" small />
            </button>
          ))}
        </div>
      );
    }
    if (question.type === 'life-shape') {
      return (
        <>
          <div className="grid min-h-64 place-items-center rounded-3xl bg-emerald-50 p-8 text-center">
            <div>
              <div className="text-8xl">{question.objectIcon}</div>
              <p className="mt-4 text-xl font-black text-emerald-800">{question.objectName}</p>
            </div>
          </div>
          <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
        </>
      );
    }
    return (
      <>
        <div className="grid min-h-64 place-items-center rounded-3xl bg-cyan-50 p-5">
          <CompositePicture composite={question.composite} />
        </div>
        <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
      </>
    );
  }

  if (!questions.length) {
    return (
      <main className="grid min-h-screen place-items-center text-center">
        <div><div className="text-7xl">🐻</div><p className="mt-4 text-xl font-black text-emerald-700">Gấu Mật đang xếp hình...</p></div>
      </main>
    );
  }

  if (screen === 'intro') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <a href="/lop-1" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 1</a>
        <section className="mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl shadow-emerald-100">
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white md:p-12">
            <p className="font-black tracking-widest text-emerald-100">Mục 2 · Bài 7–9</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Làm quen với hình phẳng</h1>
            <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">
              Nhận biết, phân loại và ghép hình vuông, hình tròn, hình tam giác, hình chữ nhật.
            </p>
          </div>
          <div className="p-6 md:p-10">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['🔵', 'Nhận biết hình'],
                ['🗂️', 'Phân loại hình'],
                ['🏠', 'Hình trong cuộc sống'],
                ['🧱', 'Ghép và xếp hình'],
              ].map(([icon, label]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center">
                  <div className="text-3xl">{icon}</div>
                  <p className="mt-2 font-black text-slate-700">{label}</p>
                </div>
              ))}
            </div>
            <h2 className="mt-8 text-xl font-black text-slate-900">Chọn lượt luyện tập</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {([
                [5, 'Luyện nhanh', 'Ôn đủ bốn kỹ năng'],
                [10, 'Luyện chuẩn', 'Phân bổ cân bằng các dạng'],
                [15, 'Thử thách', 'Nhiều hình và câu ghép hơn'],
              ] as const).map(([size, title, description]) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => prepareSession(size)}
                  className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${size === 10 ? 'border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100' : 'border-slate-100 bg-white hover:border-cyan-300'}`}
                >
                  <span className="text-sm font-black text-emerald-700">{size} câu</span>
                  <span className="mt-1 block text-xl font-black text-slate-900">{title}</span>
                  <span className="mt-2 block font-semibold text-slate-500">{description}</span>
                </button>
              ))}
            </div>
            {bestResult && (
              <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">
                Kết quả tốt nhất: {bestResult.score}% · {'⭐'.repeat(bestResult.stars)}
              </p>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'guide') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl shadow-emerald-100 md:p-10">
          <div className="flex items-start gap-4">
            <span className="text-6xl">🐻</span>
            <div><p className="font-black text-amber-600">Gấu Mật nhắc bé</p><h1 className="mt-1 text-3xl font-black text-slate-900">Nhìn đường bao của hình</h1></div>
          </div>
          <div className="my-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-cyan-50 p-5">
              <p className="font-black text-cyan-700">Hình tròn</p>
              <p className="mt-2 font-semibold leading-7 text-slate-600">Có đường cong khép kín, không có cạnh và không có góc.</p>
            </div>
            <div className="rounded-3xl bg-violet-50 p-5">
              <p className="font-black text-violet-700">Các hình có cạnh</p>
              <p className="mt-2 font-semibold leading-7 text-slate-600">Tam giác có 3 cạnh; hình vuông và hình chữ nhật có 4 cạnh.</p>
            </div>
          </div>
          <p className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">
            Màu sắc và kích thước có thể thay đổi, nhưng tên hình vẫn dựa vào đường bao của nó.
          </p>
          <button type="button" onClick={() => setScreen('lesson')} className="mt-7 w-full rounded-2xl bg-emerald-600 px-7 py-4 text-lg font-black text-white shadow-lg shadow-emerald-200">
            Bắt đầu {practiceSize} câu
          </button>
        </section>
      </main>
    );
  }

  if (screen === 'result') {
    const missed = results.filter((item) => !item.correctFirstTry).length;
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl shadow-emerald-100 md:p-10">
          <div className="text-7xl">{reviewMode ? '💪' : '🎉'}</div>
          <p className="mt-4 font-black tracking-widest text-emerald-700">{reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành bài luyện tập'}</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">
            {summary.score >= 90 ? 'Nhà thám hiểm hình học!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Bé đã rất cố gắng!'}
          </h1>
          <div className="mt-6 flex justify-center gap-3 text-5xl">
            {[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-cyan-50 p-5"><p className="font-black text-cyan-700">Điểm số</p><p className="mt-1 text-3xl font-black">{summary.score}%</p></div>
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
                    <div><p className="font-black text-slate-800">{SHAPE_SKILL_LABELS[item.skillId]}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${percent >= 70 ? 'bg-emerald-400' : 'bg-orange-400'}`} style={{ width: `${percent}%` }} /></div></div>
                    <p className="font-black text-slate-600">{item.correct}/{item.total}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <ResultShare score={summary.score} correct={summary.correct} total={results.length} stars={summary.stars} attempts={results} /><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {!reviewMode && missed > 0 && <button type="button" onClick={startMistakeReview} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu cần nhớ</button>}
            <button type="button" onClick={newSession} className="rounded-2xl bg-emerald-600 px-6 py-4 font-black text-white">Luyện bộ câu mới</button>
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
        <div className="text-right"><p className="font-black text-emerald-700">{reviewMode ? 'Ôn lại · ' : ''}Câu {questionIndex + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{SHAPE_SKILL_LABELS[question.skillId]}</p></div>
      </header>
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-white shadow-inner"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <section className="rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl shadow-emerald-100 md:p-9">
        <div className="mb-6 flex items-center gap-4">
          <span className="text-5xl">{questionIndex % 2 === 0 ? '🐻' : '🐿️'}</span>
          <div><p className="font-black text-emerald-700">{questionIndex % 2 === 0 ? 'Gấu Mật hỏi' : 'Sóc Nâu hỏi'}</p><h1 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">{question.instruction}</h1></div>
        </div>
        {renderQuestion()}
        {selectedAnswer !== null && !canContinue && (
          <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5">
            <div className="flex items-start gap-3"><span className="text-3xl">💡</span><div className="flex-1"><h2 className="text-xl font-black text-orange-700">Chưa đúng, mình quan sát lại nhé!</h2><p className="mt-2 font-semibold leading-7 text-slate-600"><span className="font-black">Gợi ý {hintLevel}/3:</span> {question.hintSteps[Math.max(0, hintLevel - 1)]}</p><button type="button" onClick={() => setSelectedAnswer(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div></div>
          </div>
        )}
        {canContinue && selectedAnswer === question.correctAnswer && (
          <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div className="flex items-start gap-3"><span className="text-3xl">🎉</span><div><h2 className="text-xl font-black text-emerald-700">Chính xác!</h2><SolutionExplanation steps={question.hintSteps} conclusion={question.explanation} /></div></div><button type="button" onClick={nextQuestion} className="w-full rounded-2xl bg-emerald-600 px-6 py-4 font-black text-white sm:w-auto">{questionIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div>
          </div>
        )}
      </section>
    </main>
  );
}
