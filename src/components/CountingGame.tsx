import ResultShare from './ResultShare';
import SolutionExplanation from './SolutionExplanation';
import { buildAdaptiveQuestionSet } from '../lib/learningProfile';
import { playCorrectSound, playFinalSound, playWrongSound } from '../lib/gameAudio';
import { useEffect, useMemo, useState } from 'react';

import {
  generateCountingQuestions,
  getCorrectAnswer,
  SKILL_LABELS,
  type AnswerValue,
  type CountingQuestion,
  type SkillId,
} from '../lib/countingQuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;

type QuestionResult = {
  questionId: string;
  skillId: SkillId;
  attempts: number;
  correctFirstTry: boolean;
};

type SavedBest = {
  score: number;
  stars: number;
  totalQuestions: number;
};

const STORAGE_KEY = 'dao-toan-hoc:lop-1:cac-so-0-10:best-v2';

function getStars(score: number) {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

function getLevel(score: number) {
  if (score >= 90) {
    return {
      title: 'Thành thạo xuất sắc!',
      description: 'Bé đã nắm chắc các số trong phạm vi 10.',
      color: 'text-emerald-700',
    };
  }
  if (score >= 70) {
    return {
      title: 'Hoàn thành tốt!',
      description: 'Bé đã hiểu bài. Hãy luyện lại những kỹ năng còn nhầm nhé.',
      color: 'text-sky-700',
    };
  }
  return {
    title: 'Bé đã rất cố gắng!',
    description: 'Mình xem lại gợi ý và luyện thêm từng kỹ năng nhé.',
    color: 'text-orange-700',
  };
}

export default function CountingGame() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [practiceSize, setPracticeSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<CountingQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerValue | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [bestResult, setBestResult] = useState<SavedBest | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateCountingQuestions(10));
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      setBestResult(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const question = questions[questionIndex];
  const correctAnswer = question ? getCorrectAnswer(question) : null;
  const answeredCorrectly =
    selectedAnswer !== null && selectedAnswer === correctAnswer;
  const progress = questions.length
    ? ((questionIndex + 1) / questions.length) * 100
    : 0;

  const summary = useMemo(() => {
    const correctFirstTry = results.filter((item) => item.correctFirstTry).length;
    const score = results.length
      ? Math.round((correctFirstTry / results.length) * 100)
      : 0;
    const bySkill = (Object.keys(SKILL_LABELS) as SkillId[])
      .map((skillId) => {
        const skillResults = results.filter((item) => item.skillId === skillId);
        return {
          skillId,
          total: skillResults.length,
          correct: skillResults.filter((item) => item.correctFirstTry).length,
        };
      })
      .filter((item) => item.total > 0);
    return { correctFirstTry, score, stars: getStars(score), bySkill };
  }, [results]);

  function resetAnswerState() {
    setSelectedAnswer(null);
    setAttempts(0);
    setHintLevel(0);
    setCanContinue(false);
  }

  function prepareSession(size: PracticeSize) {
    setPracticeSize(size);
    setQuestions(generateCountingQuestions(size));
    setQuestionIndex(0);
    setResults([]);
    setReviewMode(false);
    resetAnswerState();
    setScreen('guide');
  }

  function chooseAnswer(answer: AnswerValue) {
    if (!question || canContinue) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setSelectedAnswer(answer);

    if (answer === correctAnswer) {
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
      return;
    }
    playWrongSound();setHintLevel(Math.min(nextAttempts, 3));
  }

  function tryAgain() {
    setSelectedAnswer(null);
    setCanContinue(false);
  }

  function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      resetAnswerState();
      return;
    }

    if (!reviewMode) {
      const finalCorrect = results.filter((item) => item.correctFirstTry).length;
      const finalScore = Math.round((finalCorrect / questions.length) * 100);
      const saved: SavedBest = {
        score: finalScore,
        stars: getStars(finalScore),
        totalQuestions: questions.length,
      };
      if (!bestResult || finalScore > bestResult.score) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        setBestResult(saved);
      }
    }
    playFinalSound();setScreen('result');
  }

  function startNewSession() {
    prepareSession(practiceSize);
  }

  function startMistakeReview() {
    const missedIds = new Set(
      results
        .filter((item) => !item.correctFirstTry)
        .map((item) => item.questionId)
    );
    const missedQuestions = questions.filter((item) => missedIds.has(item.id));
    if (!missedQuestions.length) return;
    setQuestions(missedQuestions);
    setQuestionIndex(0);
    setResults([]);
    setReviewMode(true);
    resetAnswerState();
    setScreen('lesson');
  }

  function buttonStyle(answer: AnswerValue) {
    const selected = selectedAnswer === answer;
    const correct = answer === correctAnswer;
    if (selected && !correct) {
      return 'border-red-400 bg-red-50 text-red-700';
    }
    if (canContinue && correct) {
      return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    }
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-violet-300 hover:bg-violet-50';
  }

  function renderAnswerButtons(answers: AnswerValue[]) {
    return (
      <div
        className={`grid gap-3 ${
          answers.length === 3
            ? 'grid-cols-1 sm:grid-cols-3'
            : answers.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        {answers.map((answer) => (
          <button
            key={String(answer)}
            type="button"
            disabled={canContinue}
            onClick={() => chooseAnswer(answer)}
            className={`min-h-20 rounded-2xl border-4 px-3 py-4 text-xl font-black shadow-sm transition md:text-2xl ${buttonStyle(answer)}`}
          >
            {answer}
          </button>
        ))}
      </div>
    );
  }

  function renderObjects(icon: string, count: number, numbered = false) {
    if (count === 0) {
      return (
        <div className="grid min-h-32 place-items-center rounded-2xl border-4 border-dashed border-slate-200 bg-white/70 px-5 text-center font-black text-slate-400">
          Không có đồ vật nào
        </div>
      );
    }
    return (
      <div className="flex min-h-32 flex-wrap content-center justify-center gap-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <span className="text-4xl drop-shadow-sm md:text-5xl">{icon}</span>
            {numbered && (
              <span className="mt-1 grid h-6 w-6 place-items-center rounded-full bg-violet-600 text-xs font-black text-white">
                {index + 1}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderQuestion() {
    if (!question) return null;

    if (question.type === 'count') {
      return (
        <>
          <div className="rounded-3xl bg-sky-50 p-5">
            {renderObjects(question.object, question.count, hintLevel >= 2)}
          </div>
          <div className="mt-6">{renderAnswerButtons(question.answers)}</div>
        </>
      );
    }

    if (question.type === 'recognize-number') {
      return (
        <div className="rounded-3xl bg-violet-50 p-6">
          <p className="mb-5 text-center text-lg font-bold text-violet-700">
            Từ cần tìm: “{question.numberWord}”
          </p>
          {renderAnswerButtons(question.answers)}
        </div>
      );
    }

    if (question.type === 'compare-groups') {
      return (
        <>
          <div className="grid gap-4 rounded-3xl bg-amber-50 p-4 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-amber-200 bg-white p-3">
              <p className="text-center font-black text-amber-700">Bên trái</p>
              {renderObjects(question.object, question.leftCount)}
            </div>
            <div className="rounded-2xl border-2 border-amber-200 bg-white p-3">
              <p className="text-center font-black text-amber-700">Bên phải</p>
              {renderObjects(question.object, question.rightCount)}
            </div>
          </div>
          <div className="mt-6">{renderAnswerButtons(question.answers)}</div>
        </>
      );
    }

    if (question.type === 'compare-number') {
      return (
        <>
          <div className="flex min-h-52 items-center justify-center gap-4 rounded-3xl bg-orange-50 p-5">
            <div className="grid h-24 w-24 place-items-center rounded-3xl bg-orange-400 text-5xl font-black text-white shadow-lg">
              {question.left}
            </div>
            <div className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-dashed border-orange-300 bg-white text-4xl font-black text-orange-500">
              ?
            </div>
            <div className="grid h-24 w-24 place-items-center rounded-3xl bg-orange-400 text-5xl font-black text-white shadow-lg">
              {question.right}
            </div>
          </div>
          <div className="mt-6">{renderAnswerButtons(question.answers)}</div>
        </>
      );
    }

    if (question.type === 'number-bond') {
      return (
        <>
          <div className="rounded-3xl bg-emerald-50 p-5">
            <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
              <div className="col-span-2 mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-emerald-300 bg-white text-4xl font-black text-emerald-700">
                {question.whole}
              </div>
              <div className="grid h-24 place-items-center rounded-3xl bg-emerald-500 text-4xl font-black text-white">
                {question.knownPart}
              </div>
              <div className="grid h-24 place-items-center rounded-3xl border-4 border-dashed border-emerald-400 bg-white text-4xl font-black text-emerald-600">
                ?
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2 opacity-80">
              {Array.from({ length: question.whole }).map((_, index) => (
                <span key={index} className="text-3xl">{question.object}</span>
              ))}
            </div>
          </div>
          <div className="mt-6">{renderAnswerButtons(question.answers)}</div>
        </>
      );
    }

    if (question.type === 'missing-number') {
      return (
        <>
          <div className="flex min-h-52 flex-wrap items-center justify-center gap-3 rounded-3xl bg-fuchsia-50 p-5">
            {question.sequence.map((number, index) => (
              <div
                key={index}
                className={`grid h-20 w-20 place-items-center rounded-2xl border-4 text-3xl font-black shadow-sm ${
                  number === null
                    ? 'border-dashed border-fuchsia-400 bg-white text-fuchsia-500'
                    : 'border-white bg-fuchsia-500 text-white'
                }`}
              >
                {number === null ? '?' : number}
              </div>
            ))}
          </div>
          <div className="mt-6">{renderAnswerButtons(question.answers)}</div>
        </>
      );
    }

    const left =
      question.direction === 'before' ? '?' : question.referenceNumber;
    const right =
      question.direction === 'after' ? '?' : question.referenceNumber;
    return (
      <>
        <div className="flex min-h-52 items-center justify-center gap-4 rounded-3xl bg-teal-50 p-5">
          {[left, right].map((value, index) => (
            <div
              key={index}
              className={`grid h-24 w-24 place-items-center rounded-3xl border-4 text-4xl font-black shadow-sm ${
                value === '?'
                  ? 'border-dashed border-teal-400 bg-white text-teal-600'
                  : 'border-white bg-teal-500 text-white'
              }`}
            >
              {value}
            </div>
          ))}
        </div>
        <div className="mt-6">{renderAnswerButtons(question.answers)}</div>
      </>
    );
  }

  if (!questions.length) {
    return (
      <main className="grid min-h-screen place-items-center text-center">
        <div>
          <div className="text-7xl">🐿️</div>
          <p className="mt-4 text-xl font-black text-violet-700">
            Sóc Nâu đang chuẩn bị bài luyện...
          </p>
        </div>
      </main>
    );
  }

  if (screen === 'intro') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <a
          href="/lop-1"
          className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm"
        >
          ← Lớp 1
        </a>

        <section className="mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl shadow-sky-100">
          <div className="bg-gradient-to-br from-sky-500 via-violet-500 to-fuchsia-500 p-8 text-white md:p-12">
            <p className="font-black tracking-widest text-sky-100">
              Mục 1 · Bài 1–6
            </p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">
              Các số từ 0 đến 10
            </h1>
            <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">
              Đếm, nhận biết, so sánh và tách – gộp các số trong phạm vi 10.
            </p>
          </div>

          <div className="p-6 md:p-10">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ['🔢', 'Đếm và nhận biết'],
                ['🍎', 'So sánh số lượng'],
                ['⚖️', 'So sánh số'],
                ['🧩', 'Tách – gộp số'],
                ['➡️', 'Dãy số'],
              ].map(([icon, label]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center">
                  <div className="text-3xl">{icon}</div>
                  <p className="mt-2 font-black text-slate-700">{label}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-8 text-xl font-black text-slate-900">
              Chọn lượt luyện tập
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {([
                [5, 'Luyện nhanh', 'Khoảng 3–5 phút'],
                [10, 'Luyện chuẩn', 'Đủ các kỹ năng chính'],
                [15, 'Thử thách', 'Luyện kỹ và đa dạng hơn'],
              ] as const).map(([size, title, description]) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => prepareSession(size)}
                  className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${
                    size === 10
                      ? 'border-violet-400 bg-violet-50 shadow-lg shadow-violet-100'
                      : 'border-slate-100 bg-white hover:border-sky-300'
                  }`}
                >
                  <span className="text-sm font-black text-violet-600">{size} câu</span>
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
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl shadow-sky-100 md:p-10">
          <div className="flex items-start gap-4">
            <span className="text-6xl">🐿️</span>
            <div>
              <p className="font-black text-orange-600">Sóc Nâu nhắc bé</p>
              <h1 className="mt-1 text-3xl font-black text-slate-900">
                Quan sát trước, trả lời sau
              </h1>
            </div>
          </div>
          <div className="my-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-sky-50 p-5">
              <p className="font-black text-sky-700">Khi đếm</p>
              <p className="mt-2 font-semibold leading-7 text-slate-600">
                Đếm từng đồ vật một. Nếu không có đồ vật nào, chọn số 0.
              </p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-5">
              <p className="font-black text-emerald-700">Khi tách – gộp</p>
              <p className="mt-2 font-semibold leading-7 text-slate-600">
                Nhìn số chỉ toàn bộ rồi tìm phần còn thiếu.
              </p>
            </div>
          </div>
          <p className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">
            Nếu trả lời chưa đúng, bé sẽ nhận lần lượt ba mức gợi ý. Đáp án không hiện ngay ở lần đầu.
          </p>
          <button
            type="button"
            onClick={() => setScreen('lesson')}
            className="mt-7 w-full rounded-2xl bg-violet-600 px-7 py-4 text-lg font-black text-white shadow-lg shadow-violet-200"
          >
            Bắt đầu {practiceSize} câu
          </button>
        </section>
      </main>
    );
  }

  if (screen === 'result') {
    const level = getLevel(summary.score);
    const missedCount = results.filter((item) => !item.correctFirstTry).length;

    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl shadow-sky-100 md:p-10">
          <div className="text-7xl">{reviewMode ? '💪' : '🎉'}</div>
          <p className="mt-4 font-black tracking-widest text-violet-600">
            {reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành bài luyện tập'}
          </p>
          <h1 className={`mt-2 text-4xl font-black ${level.color}`}>
            {level.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl font-semibold leading-7 text-slate-600">
            {level.description}
          </p>
          <div className="mt-6 flex justify-center gap-3 text-5xl">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={star <= summary.stars ? '' : 'grayscale opacity-20'}
              >
                ⭐
              </span>
            ))}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-sky-50 p-5">
              <p className="font-black text-sky-600">Điểm số</p>
              <p className="mt-1 text-3xl font-black">{summary.score}%</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="font-black text-emerald-600">Đúng lần đầu</p>
              <p className="mt-1 text-3xl font-black">
                {summary.correctFirstTry}/{results.length}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5">
              <p className="font-black text-amber-600">Sao nhận được</p>
              <p className="mt-1 text-3xl font-black">{summary.stars}/3</p>
            </div>
          </div>

          <div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left">
            <h2 className="bg-slate-50 px-5 py-4 text-xl font-black text-slate-900">
              Kết quả theo kỹ năng
            </h2>
            <div className="divide-y divide-slate-100">
              {summary.bySkill.map((item) => {
                const percent = Math.round((item.correct / item.total) * 100);
                return (
                  <div
                    key={item.skillId}
                    className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-black text-slate-800">
                        {SKILL_LABELS[item.skillId]}
                      </p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            percent >= 70 ? 'bg-emerald-400' : 'bg-orange-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <p className="font-black text-slate-600">
                      {item.correct}/{item.total}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <ResultShare score={summary.score} correct={summary.correct} total={results.length} stars={summary.stars} attempts={results} /><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {!reviewMode && missedCount > 0 && (
              <button
                type="button"
                onClick={startMistakeReview}
                className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white"
              >
                Ôn lại {missedCount} câu cần nhớ
              </button>
            )}
            <button
              type="button"
              onClick={startNewSession}
              className="rounded-2xl bg-violet-600 px-6 py-4 font-black text-white"
            >
              Luyện bộ câu mới
            </button>
            <a
              href="/lop-1"
              className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black text-slate-700"
            >
              Về lớp 1
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-7">
      <header className="mb-5 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setScreen('intro')}
          className="rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm"
        >
          ← Thoát
        </button>
        <div className="text-right">
          <p className="font-black text-violet-600">
            {reviewMode ? 'Ôn lại · ' : ''}Câu {questionIndex + 1}/{questions.length}
          </p>
          <p className="text-sm font-bold text-slate-500">
            {SKILL_LABELS[question.skillId]}
          </p>
        </div>
      </header>

      <div className="mb-6 h-3 overflow-hidden rounded-full bg-white shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl shadow-sky-100 md:p-9">
        <div className="mb-6 flex items-center gap-4">
          <span className="text-5xl">{questionIndex % 2 === 0 ? '🐿️' : '🐻'}</span>
          <div>
            <p className="font-black text-violet-600">
              {questionIndex % 2 === 0 ? 'Sóc Nâu hỏi' : 'Gấu Mật hỏi'}
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">
              {question.instruction}
            </h1>
          </div>
        </div>

        {renderQuestion()}

        {selectedAnswer !== null && !canContinue && (
          <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5">
            <div className="flex items-start gap-3">
              <span className="text-3xl">💡</span>
              <div className="flex-1">
                <h2 className="text-xl font-black text-orange-700">
                  Chưa đúng, mình thử lại nhé!
                </h2>
                <p className="mt-2 font-semibold leading-7 text-slate-600">
                  <span className="font-black">Gợi ý {hintLevel}/3:</span>{' '}
                  {question.hintSteps[Math.max(0, hintLevel - 1)]}
                </p>
                <button
                  type="button"
                  onClick={tryAgain}
                  className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white"
                >
                  Chọn lại đáp án
                </button>
              </div>
            </div>
          </div>
        )}

        {canContinue && answeredCorrectly && (
          <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-start gap-3">
                <span className="text-3xl">🎉</span>
                <div>
                  <h2 className="text-xl font-black text-emerald-700">Chính xác!</h2>
                  <SolutionExplanation steps={question.hintSteps} conclusion={question.explanation} />
                </div>
              </div>
              <button
                type="button"
                onClick={nextQuestion}
                className="w-full rounded-2xl bg-violet-600 px-6 py-4 font-black text-white sm:w-auto"
              >
                {questionIndex === questions.length - 1
                  ? 'Xem kết quả'
                  : 'Câu tiếp theo →'}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
