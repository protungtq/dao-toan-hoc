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

const COLOR_PALETTES: Record<
  string,
  { fill: string; stroke: string; accent: string; text: string }
> = {
  violet: { fill: '#c4b5fd', stroke: '#7c3aed', accent: '#6d28d9', text: 'text-violet-700' },
  sky: { fill: '#7dd3fc', stroke: '#0284c7', accent: '#0369a1', text: 'text-sky-700' },
  emerald: { fill: '#86efac', stroke: '#059669', accent: '#047857', text: 'text-emerald-700' },
  orange: { fill: '#fed7aa', stroke: '#ea580c', accent: '#c2410c', text: 'text-orange-700' },
  rose: { fill: '#fecdd3', stroke: '#e11d48', accent: '#be123c', text: 'text-rose-700' },
};

function starsFor(score: number) {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

/**
 * GeometricShapePiece - Vẽ hình học phẳng chuẩn mực toán học SGK:
 * - HÌNH VUÔNG: 4 cạnh thẳng bằng nhau, 4 góc vuông 90° sắc nét (rx=0, strokeLinejoin=miter, rounded-none).
 * - HÌNH CHỮ NHẬT: 2 cạnh dài bằng nhau, 2 cạnh ngắn bằng nhau, 4 góc vuông 90° sắc nét.
 * - HÌNH TAM GIÁC: 3 cạnh thẳng, 3 đỉnh nhọn.
 * - HÌNH TRÒN: đường cong khép kín hoàn hảo.
 * Có chế độ inspect (soi góc vuông ∟ và vạch bằng nhau trên các cạnh).
 */
function GeometricShapePiece({
  shape,
  color = 'violet',
  small = false,
}: {
  shape: ShapeId;
  color?: string;
  small?: boolean;
}) {
  const palette = COLOR_PALETTES[color] || COLOR_PALETTES.violet;

  if (shape === 'circle') {
    const size = small ? 72 : 136;
    const r = small ? 30 : 58;
    const center = size / 2;
    return (
      <div className="flex flex-col items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className={small ? 'h-18 w-18 drop-shadow-sm' : 'h-36 w-36 drop-shadow-md'}
          role="img"
          aria-label="Hình tròn"
        >
          <circle
            cx={center}
            cy={center}
            r={r}
            fill={palette.fill}
            stroke={palette.stroke}
            strokeWidth={small ? 4 : 6}
          />
        </svg>
      </div>
    );
  }

  if (shape === 'square') {
    // 100% SQUARE: Aspect ratio 1:1, rx=0 (sharp 90-degree corners, cạnh thẳng tuyệt đối không bo góc)
    const viewSize = small ? 72 : 136;
    const side = small ? 58 : 110;
    const offset = (viewSize - side) / 2;

    return (
      <div className="flex flex-col items-center justify-center">
        <svg
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          className={small ? 'h-18 w-18 drop-shadow-sm' : 'h-36 w-36 drop-shadow-md'}
          role="img"
          aria-label="Hình vuông có bốn cạnh bằng nhau và bốn góc vuông"
        >
          <rect
            x={offset}
            y={offset}
            width={side}
            height={side}
            rx={0}
            strokeLinejoin="miter"
            fill={palette.fill}
            stroke={palette.stroke}
            strokeWidth={small ? 4 : 6}
          />
        </svg>
      </div>
    );
  }

  if (shape === 'rectangle') {
    // 100% RECTANGLE: 2 cạnh dài bằng nhau, 2 cạnh ngắn bằng nhau, rx=0 (sharp 90-degree corners, không bo góc)
    const viewW = small ? 96 : 180;
    const viewH = small ? 64 : 116;
    const w = small ? 82 : 156;
    const h = small ? 48 : 92;
    const ox = (viewW - w) / 2;
    const oy = (viewH - h) / 2;

    return (
      <div className="flex flex-col items-center justify-center">
        <svg
          viewBox={`0 0 ${viewW} ${viewH}`}
          className={small ? 'h-16 w-24 drop-shadow-sm' : 'h-32 w-48 drop-shadow-md'}
          role="img"
          aria-label="Hình chữ nhật"
        >
          <rect
            x={ox}
            y={oy}
            width={w}
            height={h}
            rx={0}
            strokeLinejoin="miter"
            fill={palette.fill}
            stroke={palette.stroke}
            strokeWidth={small ? 4 : 6}
          />
        </svg>
      </div>
    );
  }

  // TRIANGLE: 3 cạnh thẳng, 3 đỉnh nhọn
  const viewW = small ? 80 : 144;
  const viewH = small ? 72 : 130;
  const topX = viewW / 2;
  const topY = small ? 8 : 12;
  const leftX = small ? 10 : 16;
  const leftY = viewH - (small ? 8 : 12);
  const rightX = viewW - (small ? 10 : 16);
  const rightY = leftY;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className={small ? 'h-18 w-20 drop-shadow-sm' : 'h-36 w-40 drop-shadow-md'}
        role="img"
        aria-label="Hình tam giác"
      >
        <polygon
          points={`${topX},${topY} ${leftX},${leftY} ${rightX},${rightY}`}
          fill={palette.fill}
          stroke={palette.stroke}
          strokeWidth={small ? 4 : 6}
          strokeLinejoin="miter"
        />
      </svg>
    </div>
  );
}

function CompositePicture({ composite }: { composite: CompositeId }) {
  if (composite === 'house') {
    return (
      <svg viewBox="0 0 240 200" className="h-52 w-64 drop-shadow-md" role="img" aria-label="Ngôi nhà ghép từ hình tam giác, hình chữ nhật và hình vuông">
        {/* Mái nhà: hình tam giác */}
        <polygon points="120,15 25,95 215,95" fill="#f97316" stroke="#c2410c" strokeWidth="4" strokeLinejoin="miter" />
        {/* Thân nhà: hình chữ nhật */}
        <rect x="48" y="95" width="144" height="92" rx="0" fill="#38bdf8" stroke="#0284c7" strokeWidth="4" strokeLinejoin="miter" />
        {/* Cửa ra vào: hình chữ nhật */}
        <rect x="106" y="125" width="42" height="62" rx="0" fill="#8b5cf6" stroke="#6d28d9" strokeWidth="3" strokeLinejoin="miter" />
        {/* Cửa sổ: 4 ô vuông nhỏ ghép thành 1 cửa sổ vuông sắc nét */}
        <g stroke="#ca8a04" strokeWidth="2" strokeLinejoin="miter" fill="#fef08a">
          <rect x="60" y="112" width="15" height="15" rx="0" />
          <rect x="78" y="112" width="15" height="15" rx="0" />
          <rect x="60" y="130" width="15" height="15" rx="0" />
          <rect x="78" y="130" width="15" height="15" rx="0" />
        </g>
      </svg>
    );
  }
  if (composite === 'robot') {
    return (
      <svg viewBox="0 0 240 220" className="h-52 w-64 drop-shadow-md" role="img" aria-label="Rô-bốt ghép từ các hình">
        {/* Đầu rô-bốt là hình vuông sắc cạnh */}
        <rect x="80" y="10" width="80" height="80" rx="0" fill="#a78bfa" stroke="#6d28d9" strokeWidth="4" strokeLinejoin="miter" />
        <circle cx="102" cy="48" r="9" fill="white" stroke="#6d28d9" strokeWidth="2" />
        <circle cx="138" cy="48" r="9" fill="white" stroke="#6d28d9" strokeWidth="2" />
        <circle cx="102" cy="48" r="4" fill="#0f172a" />
        <circle cx="138" cy="48" r="4" fill="#0f172a" />
        <rect x="100" y="68" width="40" height="8" rx="0" fill="#f43f5e" />
        {/* Thân chữ nhật */}
        <rect x="68" y="95" width="104" height="82" rx="0" fill="#38bdf8" stroke="#0284c7" strokeWidth="4" strokeLinejoin="miter" />
        <rect x="34" y="102" width="28" height="70" rx="0" fill="#10b981" stroke="#047857" strokeWidth="3" strokeLinejoin="miter" />
        <rect x="178" y="102" width="28" height="70" rx="0" fill="#10b981" stroke="#047857" strokeWidth="3" strokeLinejoin="miter" />
        <rect x="82" y="182" width="28" height="34" rx="0" fill="#f97316" stroke="#c2410c" strokeWidth="3" strokeLinejoin="miter" />
        <rect x="130" y="182" width="28" height="34" rx="0" fill="#f97316" stroke="#c2410c" strokeWidth="3" strokeLinejoin="miter" />
      </svg>
    );
  }
  if (composite === 'ice-cream') {
    return (
      <svg viewBox="0 0 200 220" className="h-52 w-56 drop-shadow-md" role="img" aria-label="Cây kem ghép từ các hình">
        <circle cx="100" cy="62" r="52" fill="#f472b6" stroke="#e11d48" strokeWidth="4" />
        <polygon points="48,88 152,88 100,212" fill="#f59e0b" stroke="#b45309" strokeWidth="4" strokeLinejoin="miter" />
        <circle cx="100" cy="22" r="10" fill="#ef4444" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 260 200" className="h-52 w-64 drop-shadow-md" role="img" aria-label="Chiếc thuyền ghép từ hình tam giác và hình chữ nhật">
      <rect x="126" y="20" width="8" height="108" rx="0" fill="#475569" />
      <polygon points="126,25 45,125 126,125" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" strokeLinejoin="miter" />
      <polygon points="134,45 210,125 134,125" fill="#a78bfa" stroke="#7c3aed" strokeWidth="3" strokeLinejoin="miter" />
      <rect x="36" y="130" width="188" height="42" rx="0" fill="#f97316" stroke="#c2410c" strokeWidth="4" strokeLinejoin="miter" />
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
  const progress = questions.length ? ((questionIndex + 1) / questions.length) * 100 : 0;
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
    if (answer === question.correctAnswer) {
      playCorrectSound();
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
      playWrongSound();
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
    playFinalSound();
    setScreen('result');
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

  // Keyboard shortcut listener for answers & continue
  useEffect(() => {
    if (screen !== 'lesson' || !question) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (canContinue && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')) {
        e.preventDefault();
        nextQuestion();
        return;
      }
      if (!canContinue && ['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (question.type === 'choose-shape' && question.shapeOptions[idx]) {
          chooseAnswer(question.shapeOptions[idx]);
        } else if (question.type === 'odd-shape' && idx < question.shapes.length) {
          chooseAnswer(idx);
        } else if (question.answers[idx] !== undefined) {
          chooseAnswer(question.answers[idx]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, question, canContinue, questionIndex, questions.length]);

  function answerClass(answer: ShapeAnswer) {
    if (selectedAnswer === answer && answer !== question?.correctAnswer) {
      return 'border-rose-500 bg-rose-50 text-rose-800 shadow-md shadow-rose-200 dark:border-rose-400 dark:bg-rose-950/40 dark:text-rose-200';
    }
    if (canContinue && answer === question?.correctAnswer) {
      return 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-lg shadow-emerald-200 ring-4 ring-emerald-300/40 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200';
    }
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-lg active:translate-y-0.5 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-emerald-500';
  }

  function AnswerButtons({ answers }: { answers: ShapeAnswer[] }) {
    return (
      <div className={`grid gap-3.5 ${answers.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {answers.map((answer, i) => (
          <button
            key={String(answer)}
            type="button"
            disabled={canContinue}
            onClick={() => chooseAnswer(answer)}
            className={`group relative flex min-h-20 items-center justify-center rounded-2xl border-3 px-4 py-3 text-lg font-black transition-all ${answerClass(answer)}`}
          >
            {/* Phím tắt hiển thị rất mờ và nhỏ dạng [1], [2] chỉ trên desktop để tuyệt đối không nhầm lẫn với số đáp án */}
            <span
              className="absolute left-2.5 top-2 hidden text-[10px] font-mono font-medium text-slate-400/35 select-none dark:text-slate-500/35 sm:inline-block"
              title={`Phím tắt [${i + 1}]`}
            >
              [{i + 1}]
            </span>
            <span className="text-center text-2xl font-black">{answer}</span>
          </button>
        ))}
      </div>
    );
  }

  function renderQuestion() {
    if (!question) return null;

    if (question.type === 'identify-shape') {
      return (
        <div className="space-y-6">
          <div className="math-notebook-grid relative flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-slate-200/80 p-8 shadow-inner dark:border-slate-700">
            <GeometricShapePiece
              shape={question.shape}
              color={question.color}
            />
          </div>
          <AnswerButtons answers={question.answers} />
        </div>
      );
    }

    if (question.type === 'choose-shape') {
      return (
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-slate-50/80 p-5 dark:bg-slate-900/40 sm:grid-cols-4">
          {question.shapeOptions.map((shape, index) => (
            <button
              key={`${shape}-${index}`}
              type="button"
              disabled={canContinue}
              onClick={() => chooseAnswer(shape)}
              className={`math-notebook-grid group relative flex min-h-48 flex-col items-center justify-center rounded-3xl border-3 p-4 transition-all hover:-translate-y-1 active:translate-y-0.5 ${answerClass(shape)}`}
              aria-label={SHAPE_LABELS[shape]}
            >
              <GeometricShapePiece
                shape={shape}
                color={['violet', 'sky', 'emerald', 'orange'][index % 4]}
                small
              />
              <span className="mt-3 text-sm font-black text-slate-700 dark:text-slate-200">
                {SHAPE_LABELS[shape]}
              </span>
            </button>
          ))}
        </div>
      );
    }

    if (question.type === 'classify-shape') {
      return (
        <div className="space-y-6">
          <div className="math-notebook-grid flex min-h-64 flex-wrap items-center justify-center gap-6 rounded-3xl border-2 border-slate-200/80 p-6 shadow-inner dark:border-slate-700">
            {question.shapes.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800/80 dark:ring-slate-700"
              >
                <GeometricShapePiece
                  shape={item.shape}
                  color={item.color}
                  small
                />
              </div>
            ))}
          </div>
          <AnswerButtons answers={question.answers} />
        </div>
      );
    }

    if (question.type === 'odd-shape') {
      return (
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-slate-50/80 p-5 dark:bg-slate-900/40 sm:grid-cols-4">
          {question.shapes.map((shape, index) => (
            <button
              key={index}
              type="button"
              disabled={canContinue}
              onClick={() => chooseAnswer(index)}
              className={`math-notebook-grid group relative flex min-h-48 flex-col items-center justify-center rounded-3xl border-3 p-4 transition-all hover:-translate-y-1 active:translate-y-0.5 ${answerClass(index)}`}
            >
              <GeometricShapePiece shape={shape} color="rose" small />
              <span className="mt-3 text-sm font-black text-slate-700 dark:text-slate-200">
                Hình {index + 1}
              </span>
            </button>
          ))}
        </div>
      );
    }

    if (question.type === 'life-shape') {
      return (
        <div className="space-y-6">
          <div className="math-notebook-grid flex min-h-64 flex-col items-center justify-center rounded-3xl border-2 border-slate-200/80 p-8 text-center shadow-inner dark:border-slate-700">
            <div>
              {question.objectName === 'ô cửa sổ vuông' ? (
                <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-none border-4 border-amber-900 bg-amber-50 shadow-md dark:border-amber-700 dark:bg-slate-800">
                  {/* Ô cửa sổ vuông sắc cạnh 1:1 chuẩn SGK, rx=0 */}
                  <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Ô cửa sổ hình vuông bốn cạnh bằng nhau">
                    <rect x="0" y="0" width="100" height="100" rx="0" fill="#bae6fd" stroke="#78350f" strokeWidth="8" strokeLinejoin="miter" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="#78350f" strokeWidth="6" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="#78350f" strokeWidth="6" />
                  </svg>
                </div>
              ) : (
                <div className="text-8xl drop-shadow-md">{question.objectIcon}</div>
              )}
              <p className="mt-4 text-2xl font-black text-slate-800 dark:text-slate-100">
                {question.objectName}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
                Quan sát đường viền bên ngoài của đồ vật
              </p>
            </div>
          </div>
          <AnswerButtons answers={question.answers} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="math-notebook-grid grid min-h-64 place-items-center rounded-3xl border-2 border-slate-200/80 p-6 shadow-inner dark:border-slate-700">
          <CompositePicture composite={question.composite} />
        </div>
        <AnswerButtons answers={question.answers} />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <main className="grid min-h-screen place-items-center text-center">
        <div>
          <div className="animate-bounce text-7xl">🐻</div>
          <p className="mt-4 text-xl font-black text-emerald-700">Gấu Mật đang xếp hình...</p>
        </div>
      </main>
    );
  }

  if (screen === 'intro') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <a
          href="/lop-1"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm transition hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200"
        >
          <span>←</span> Về Lớp 1
        </a>

        <section className="mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl shadow-emerald-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          {/* Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-8 text-white md:p-12">
            <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <span>📐</span> Mục 2 · Bài 7–9 SGK Toán Lớp 1
            </p>
            <h1 className="mt-4 text-3xl font-black md:text-5xl">
              Làm quen với hình phẳng
            </h1>
            <p className="mt-3 max-w-3xl text-lg font-semibold leading-relaxed text-emerald-50">
              Nhận biết chuẩn xác hình vuông, hình chữ nhật, hình tam giác, hình tròn với góc cạnh trực quan, không lo nhầm lẫn.
            </p>

            {/* Quick Shape Showcase */}
            <div className="mt-6 flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 font-bold backdrop-blur-sm">
                <span className="inline-block h-5 w-5 rounded-none border-2 border-white bg-amber-300" />
                <span>Hình vuông (4 cạnh = nhau)</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 font-bold backdrop-blur-sm">
                <span className="inline-block h-4 w-7 rounded-none border-2 border-white bg-sky-300" />
                <span>Hình chữ nhật</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 font-bold backdrop-blur-sm">
                <span className="text-sm">🔺</span>
                <span>Hình tam giác</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 font-bold backdrop-blur-sm">
                <span className="inline-block h-5 w-5 rounded-full border-2 border-white bg-emerald-300" />
                <span>Hình tròn</span>
              </div>
            </div>
          </div>

          {/* Topics & Practice Selection */}
          <div className="p-6 md:p-10">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['🔵', 'Nhận biết hình', 'Xác định nhanh 4 dạng hình cơ bản'],
                ['🗂️', 'Phân loại hình', 'Gom nhóm các hình theo đặc điểm cạnh góc'],
                ['🏠', 'Hình trong đời sống', 'Cửa sổ, bánh quy, biển báo quen thuộc'],
                ['🧱', 'Ghép & xếp hình', 'Rô-bốt, ngôi nhà, thuyền buồm'],
              ].map(([icon, label, desc]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center transition dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <div className="text-3xl">{icon}</div>
                  <p className="mt-2 font-black text-slate-800 dark:text-slate-100">{label}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{desc}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-9 text-xl font-black text-slate-900 dark:text-slate-100">
              Chọn chế độ luyện tập
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                [5, 'Luyện nhanh', 'Ôn đủ 4 dạng hình phẳng chuẩn SGK'],
                [10, 'Luyện chuẩn', 'Cân bằng nhận biết, phân loại và đồ vật thực tế'],
                [15, 'Thử thách', 'Rèn phản xạ nhanh và tư duy hình ghép sâu hơn'],
              ].map(([size, title, description]) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => prepareSession(size as PracticeSize)}
                  className={`group rounded-3xl border-3 p-5 text-left transition-all hover:-translate-y-1 active:translate-y-0.5 ${
                    size === 10
                      ? 'border-emerald-400 bg-emerald-50/70 shadow-lg shadow-emerald-100 dark:border-emerald-500 dark:bg-emerald-950/30'
                      : 'border-slate-100 bg-white hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-850 dark:hover:border-slate-700'
                  }`}
                >
                  <span className="inline-flex rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-black text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                    {size} câu
                  </span>
                  <span className="mt-2 block text-xl font-black text-slate-900 dark:text-slate-100">
                    {title}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {description}
                  </span>
                </button>
              ))}
            </div>

            {bestResult && (
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <span className="flex items-center gap-2">
                  <span>🏆</span> Kỷ lục của bạn: {bestResult.score}%
                </span>
                <span className="text-xl">{'⭐'.repeat(bestResult.stars)}</span>
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'guide') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl shadow-emerald-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:p-10">
          <div className="flex items-start gap-4">
            <img
              src="/models/mascots/bear-poster.webp"
              alt=""
              aria-hidden="true"
              className="h-16 w-16 shrink-0 object-contain drop-shadow-lg sm:h-20 sm:w-20"
            />
            <div>
              <p className="font-black text-amber-600 dark:text-amber-400">Gấu Mật & Sóc Nâu nhắc bé</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
                Bí kíp nhận biết hình phẳng chính xác 100%
              </h1>
            </div>
          </div>

          {/* 4 Cards so sánh 4 hình rõ ràng */}
          <div className="my-7 grid gap-4 sm:grid-cols-2">
            {/* Hình vuông */}
            <div className="math-notebook-grid rounded-3xl border-2 border-emerald-200 p-5 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-none border-3 border-emerald-600 bg-emerald-100">
                  <span className="text-xs font-black text-emerald-800">1:1</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-emerald-800 dark:text-emerald-300">
                    Hình vuông
                  </h3>
                  <p className="text-xs font-bold text-slate-500">4 cạnh thẳng bằng nhau</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <li>✅ 4 góc vuông 90° sắc nét (cạnh thẳng tắp).</li>
                <li>✅ 4 cạnh dài bằng nhau hoàn hảo.</li>
                <li>⚠️ <b>Lưu ý:</b> Cạnh và góc không bao giờ bị bo tròn!</li>
              </ul>
            </div>

            {/* Hình chữ nhật */}
            <div className="math-notebook-grid rounded-3xl border-2 border-sky-200 p-5 dark:border-sky-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-14 items-center justify-center rounded-none border-3 border-sky-600 bg-sky-100">
                  <span className="text-[10px] font-black text-sky-800">Dài/Rộng</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-sky-800 dark:text-sky-300">
                    Hình chữ nhật
                  </h3>
                  <p className="text-xs font-bold text-slate-500">2 cạnh dài, 2 cạnh ngắn</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <li>✅ 4 góc vuông 90° sắc nét.</li>
                <li>✅ 2 cạnh dài bằng nhau, 2 cạnh ngắn bằng nhau.</li>
                <li>✅ Có chiều dài và chiều rộng rõ rệt.</li>
              </ul>
            </div>

            {/* Hình tam giác */}
            <div className="math-notebook-grid rounded-3xl border-2 border-violet-200 p-5 dark:border-violet-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔺</span>
                <div>
                  <h3 className="text-lg font-black text-violet-800 dark:text-violet-300">
                    Hình tam giác
                  </h3>
                  <p className="text-xs font-bold text-slate-500">3 cạnh và 3 đỉnh</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <li>✅ Có đúng 3 cạnh thẳng khép kín.</li>
                <li>✅ Có đúng 3 góc và 3 đỉnh nhọn.</li>
              </ul>
            </div>

            {/* Hình tròn */}
            <div className="math-notebook-grid rounded-3xl border-2 border-amber-200 p-5 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border-3 border-amber-600 bg-amber-100" />
                <div>
                  <h3 className="text-lg font-black text-amber-800 dark:text-amber-300">
                    Hình tròn
                  </h3>
                  <p className="text-xs font-bold text-slate-500">Đường cong khép kín</p>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <li>✅ Đường cong tròn đều, trơn tru.</li>
                <li>✅ Hoàn toàn <b>không có cạnh</b> và <b>không có góc</b>.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <p className="font-bold text-emerald-900 dark:text-emerald-200">
              💡 <b>Mẹo ghi nhớ:</b> Màu sắc hay kích thước xoay ngang dọc có thể thay đổi, nhưng tên hình luôn được quyết định bởi <b>số cạnh và các góc</b> của nó!
            </p>
          </div>

          <button
            type="button"
            onClick={() => setScreen('lesson')}
            className="mt-7 w-full rounded-2xl bg-emerald-600 py-4 text-lg font-black text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 hover:shadow-xl active:translate-y-0.5 dark:shadow-none"
          >
            Bắt đầu {practiceSize} câu ngay →
          </button>
        </section>
      </main>
    );
  }

  if (screen === 'result') {
    const missed = results.filter((item) => !item.correctFirstTry).length;
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl shadow-emerald-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:p-10">
          <div className="text-7xl">{reviewMode ? '💪' : '🏅'}</div>
          <p className="mt-4 font-black tracking-widest text-emerald-700 dark:text-emerald-400">
            {reviewMode ? 'Hoàn thành lượt ôn tập' : 'Hoàn thành bài luyện tập'}
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
            {summary.score >= 90
              ? 'Tuyệt đỉnh! Bậc thầy Hình học Lớp 1!'
              : summary.score >= 70
                ? 'Làm bài rất tốt! Phân biệt hình rất chuẩn!'
                : 'Bé đã rất cố gắng, cùng ôn thêm nhé!'}
          </h1>

          <div className="mt-6 flex justify-center gap-3 text-5xl">
            {[1, 2, 3].map((star) => (
              <span key={star} className={star <= summary.stars ? 'animate-bounce' : 'opacity-20 grayscale'}>
                ⭐
              </span>
            ))}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-cyan-50 p-5 dark:bg-cyan-950/40">
              <p className="font-black text-cyan-700 dark:text-cyan-300">Điểm số</p>
              <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{summary.score}%</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5 dark:bg-emerald-950/40">
              <p className="font-black text-emerald-700 dark:text-emerald-300">Đúng ngay lần đầu</p>
              <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                {summary.correct}/{results.length}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5 dark:bg-amber-950/40">
              <p className="font-black text-amber-700 dark:text-amber-300">Sao đạt được</p>
              <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
                {summary.stars}/3
              </p>
            </div>
          </div>

          <div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left dark:border-slate-800">
            <h2 className="bg-slate-50 px-5 py-4 text-xl font-black text-slate-900 dark:bg-slate-850 dark:text-white">
              Kết quả theo từng kỹ năng
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {summary.bySkill.map((item) => {
                const percent = Math.round((item.correct / item.total) * 100);
                return (
                  <div
                    key={item.skillId}
                    className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-black text-slate-800 dark:text-slate-200">
                        {SHAPE_SKILL_LABELS[item.skillId]}
                      </p>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${percent >= 70 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <p className="font-black text-slate-600 dark:text-slate-400">
                      {item.correct}/{item.total}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <ResultShare
            score={summary.score}
            correct={summary.correct}
            total={results.length}
            stars={summary.stars}
            attempts={results}
          />

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {!reviewMode && missed > 0 && (
              <button
                type="button"
                onClick={startMistakeReview}
                className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white shadow-md transition hover:bg-orange-600 active:translate-y-0.5"
              >
                Ôn lại {missed} câu chưa đúng
              </button>
            )}
            <button
              type="button"
              onClick={newSession}
              className="rounded-2xl bg-emerald-600 px-6 py-4 font-black text-white shadow-md transition hover:bg-emerald-700 active:translate-y-0.5"
            >
              Luyện bộ câu mới
            </button>
            <a
              href="/lop-1"
              className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Về trang Lớp 1
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-7">
      {/* Floating Header */}
      <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setScreen('intro')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 font-black text-slate-600 shadow-sm transition hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200"
        >
          <span>←</span> Thoát
        </button>

        <div className="text-right">
          <p className="font-black text-emerald-700 dark:text-emerald-400">
            {reviewMode ? 'Ôn lại · ' : ''}Câu {questionIndex + 1}/{questions.length}
          </p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {SHAPE_SKILL_LABELS[question.skillId]}
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-white/80 p-0.5 shadow-inner dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card Stage */}
      <section className="rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl shadow-emerald-100/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none md:p-9">
        <div className="mb-6 flex items-center gap-4">
          <img
            src={
              questionIndex % 2 === 0
                ? '/models/mascots/bear-poster.webp'
                : '/models/mascots/squirrel-poster.webp'
            }
            alt=""
            aria-hidden="true"
            className="h-16 w-16 shrink-0 object-contain drop-shadow-lg sm:h-20 sm:w-20"
          />
          <div>
            <p className="font-black text-emerald-700 dark:text-emerald-400">
              {questionIndex % 2 === 0 ? 'Gấu Mật hỏi bé' : 'Sóc Nâu hỏi bé'}
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white md:text-3xl">
              {question.instruction}
            </h1>
          </div>
        </div>

        {renderQuestion()}

        {/* Hint banner */}
        {selectedAnswer !== null && !canContinue && (
          <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5 dark:border-orange-800 dark:bg-orange-950/40">
            <div className="flex items-start gap-3">
              <span className="text-3xl">💡</span>
              <div className="flex-1">
                <h2 className="text-lg font-black text-orange-700 dark:text-orange-300">
                  Chưa chính xác, cùng quan sát lại nhé!
                </h2>
                <p className="mt-1 font-semibold leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-black">Gợi ý {hintLevel}/3:</span>{' '}
                  {question.hintSteps[Math.max(0, hintLevel - 1)]}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedAnswer(null)}
                  className="mt-3 rounded-xl bg-orange-500 px-5 py-2.5 font-black text-white shadow-sm transition hover:bg-orange-600 active:translate-y-0.5"
                >
                  Chọn lại đáp án
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success banner */}
        {canContinue && selectedAnswer === question.correctAnswer && (
          <div className="mt-6 rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-700 dark:bg-emerald-950/40">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🎉</span>
                <div>
                  <h2 className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                    Chính xác rồi! Rất giỏi!
                  </h2>
                  <SolutionExplanation
                    steps={question.hintSteps}
                    conclusion={question.explanation}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={nextQuestion}
                className="w-full rounded-2xl bg-emerald-600 px-7 py-4 text-lg font-black text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:translate-y-0.5 dark:shadow-none sm:w-auto"
              >
                {questionIndex === questions.length - 1 ? 'Xem kết quả 🏆' : 'Câu tiếp theo →'}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
