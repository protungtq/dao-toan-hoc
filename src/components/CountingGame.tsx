import { useEffect, useMemo, useState } from 'react';

import {
  generateCountingQuestions,
  getCorrectAnswer,
  type CountingQuestion,
} from '../lib/countingQuestionGenerator';

type Screen = 'intro' | 'example' | 'lesson' | 'result';

type LessonResult = {
  score: number;
  correctFirstTry: number;
  totalQuestions: number;
  stars: number;
  completedAt: string;
};

const TOTAL_QUESTIONS = 10;
const STORAGE_KEY = 'dao-toan-hoc:dem-so:best';

function getStars(correctFirstTry: number, totalQuestions: number) {
  const percentage = (correctFirstTry / totalQuestions) * 100;

  if (percentage >= 90) return 3;
  if (percentage >= 70) return 2;
  return 1;
}

function getLevelMessage(score: number) {
  if (score >= 90) {
    return {
      title: 'Thành thạo xuất sắc!',
      description: 'Bé đã đếm và nhận biết các số rất chính xác.',
      color: 'text-emerald-700',
    };
  }

  if (score >= 70) {
    return {
      title: 'Hoàn thành tốt!',
      description: 'Bé đã hiểu bài. Hãy luyện lại để giành đủ ba sao nhé.',
      color: 'text-sky-700',
    };
  }

  return {
    title: 'Bé đã rất cố gắng!',
    description: 'Mình hãy luyện lại để nhớ bài chắc hơn nhé.',
    color: 'text-orange-700',
  };
}

export default function CountingGame() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [questions, setQuestions] = useState<CountingQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState<
    number | string | null
  >(null);

  const [attempts, setAttempts] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [bestResult, setBestResult] = useState<LessonResult | null>(null);
  const [latestResult, setLatestResult] = useState<LessonResult | null>(null);

  useEffect(() => {
    setQuestions(generateCountingQuestions(TOTAL_QUESTIONS));

    const savedResult = localStorage.getItem(STORAGE_KEY);

    if (!savedResult) return;

    try {
      setBestResult(JSON.parse(savedResult));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const question = questions[questionIndex];

  const correctAnswer = question
    ? getCorrectAnswer(question)
    : null;

  const answeredCorrectly =
    selectedAnswer !== null &&
    selectedAnswer === correctAnswer;

  const progress =
    questions.length > 0
      ? ((questionIndex + 1) / questions.length) * 100
      : 0;

  const countObjects = useMemo(() => {
    if (!question || question.type !== 'count') return [];

    return Array.from({ length: question.count });
  }, [question]);

  function startLesson() {
    if (questions.length === 0) {
      setQuestions(generateCountingQuestions(TOTAL_QUESTIONS));
    }

    setScreen('example');
  }

  function chooseAnswer(answer: number | string) {
    if (!question || canContinue) return;

    const nextAttempt = attempts + 1;

    setAttempts(nextAttempt);
    setSelectedAnswer(answer);

    if (answer === correctAnswer) {
      if (nextAttempt === 1) {
        setCorrectFirstTry((current) => current + 1);
      }

      setCanContinue(true);
      setShowHint(false);
      return;
    }

    setShowHint(true);
  }

  function tryAgain() {
    setSelectedAnswer(null);
    setCanContinue(false);
  }

  function resetQuestionState() {
    setSelectedAnswer(null);
    setAttempts(0);
    setCanContinue(false);
    setShowHint(false);
  }

  function nextQuestion() {
    if (questionIndex >= questions.length - 1) {
      finishLesson();
      return;
    }

    setQuestionIndex((current) => current + 1);
    resetQuestionState();
  }

  function finishLesson() {
    const score = Math.round(
      (correctFirstTry / questions.length) * 100
    );

    const result: LessonResult = {
      score,
      correctFirstTry,
      totalQuestions: questions.length,
      stars: getStars(correctFirstTry, questions.length),
      completedAt: new Date().toISOString(),
    };

    setLatestResult(result);

    if (!bestResult || result.score > bestResult.score) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      setBestResult(result);
    }

    setScreen('result');
  }

  function startNewSession() {
    setQuestions(generateCountingQuestions(TOTAL_QUESTIONS));
    setQuestionIndex(0);
    setCorrectFirstTry(0);
    setLatestResult(null);
    resetQuestionState();
    setScreen('example');
  }

  function renderAnswerButtons(
    answers: Array<number | string>
  ) {
    return (
      <div
        className={`grid gap-4 ${
          answers.length === 3
            ? 'grid-cols-3'
            : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        {answers.map((answer) => {
          const selected = selectedAnswer === answer;
          const isCorrectAnswer = answer === correctAnswer;

          let buttonStyle =
            'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-violet-300 hover:bg-violet-50';

          if (selected && !isCorrectAnswer) {
            buttonStyle =
              'border-red-400 bg-red-50 text-red-600';
          }

          if (canContinue && isCorrectAnswer) {
            buttonStyle =
              'border-emerald-400 bg-emerald-50 text-emerald-700';
          }

          return (
            <button
              key={String(answer)}
              type="button"
              disabled={canContinue}
              onClick={() => chooseAnswer(answer)}
              className={`min-h-20 rounded-2xl border-4 px-4 py-4 text-2xl font-black shadow-md transition md:text-3xl ${buttonStyle}`}
            >
              {answer}
            </button>
          );
        })}
      </div>
    );
  }

  function renderCountQuestion() {
    if (!question || question.type !== 'count') return null;

    return (
      <>
        <div className="grid min-h-56 place-items-center rounded-3xl bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
          <div className="flex max-w-2xl flex-wrap justify-center gap-4">
            {countObjects.map((_, index) => (
              <div
                key={index}
                className="group flex flex-col items-center"
              >
                <span className="text-5xl drop-shadow-md transition group-hover:-translate-y-2 group-hover:scale-110 md:text-6xl">
                  {question.object}
                </span>

                {showHint && (
                  <span className="mt-1 grid h-7 w-7 place-items-center rounded-full bg-violet-600 text-sm font-black text-white">
                    {index + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7">
          {renderAnswerButtons(question.answers)}
        </div>
      </>
    );
  }

  function renderMissingNumberQuestion() {
    if (!question || question.type !== 'missing-number') {
      return null;
    }

    return (
      <>
        <div className="flex min-h-56 flex-wrap items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6">
          {question.sequence.map((number, index) => (
            <div
              key={index}
              className={`grid h-20 w-20 place-items-center rounded-2xl border-4 text-3xl font-black shadow-md ${
                number === null
                  ? 'border-dashed border-violet-400 bg-white text-violet-500'
                  : 'border-white bg-violet-500 text-white'
              }`}
            >
              {number === null ? '?' : number}
            </div>
          ))}
        </div>

        <div className="mt-7">
          {renderAnswerButtons(question.answers)}
        </div>
      </>
    );
  }

  function renderCompareQuestion() {
    if (!question || question.type !== 'compare') return null;

    return (
      <>
        <div className="flex min-h-56 items-center justify-center gap-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 p-6">
          <div className="grid h-28 w-28 place-items-center rounded-3xl bg-orange-400 text-5xl font-black text-white shadow-lg">
            {question.left}
          </div>

          <div className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-dashed border-orange-300 bg-white text-4xl font-black text-orange-500">
            ?
          </div>

          <div className="grid h-28 w-28 place-items-center rounded-3xl bg-orange-400 text-5xl font-black text-white shadow-lg">
            {question.right}
          </div>
        </div>

        <div className="mt-7">
          {renderAnswerButtons(question.answers)}
        </div>
      </>
    );
  }

  function renderChooseGroupQuestion() {
    if (!question || question.type !== 'choose-group') {
      return null;
    }

    return (
      <div className="grid gap-4 md:grid-cols-3">
        {question.groups.map((groupCount) => {
          const selected = selectedAnswer === groupCount;
          const correct = groupCount === question.target;

          let cardStyle =
            'border-slate-200 bg-white hover:-translate-y-1 hover:border-violet-300';

          if (selected && !correct) {
            cardStyle = 'border-red-400 bg-red-50';
          }

          if (canContinue && correct) {
            cardStyle = 'border-emerald-400 bg-emerald-50';
          }

          return (
            <button
              key={groupCount}
              type="button"
              disabled={canContinue}
              onClick={() => chooseAnswer(groupCount)}
              className={`rounded-3xl border-4 p-5 shadow-md transition ${cardStyle}`}
            >
              <div className="flex min-h-40 flex-wrap content-center justify-center gap-2">
                {Array.from({ length: groupCount }).map(
                  (_, index) => (
                    <span key={index} className="text-4xl">
                      {question.object}
                    </span>
                  )
                )}
              </div>

              {showHint && (
                <p className="mt-3 font-black text-slate-500">
                  Có {groupCount} {question.objectName}
                </p>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  function renderBeforeAfterQuestion() {
    if (!question || question.type !== 'before-after') {
      return null;
    }

    const leftNumber =
      question.direction === 'before'
        ? '?'
        : question.referenceNumber;

    const rightNumber =
      question.direction === 'after'
        ? '?'
        : question.referenceNumber;

    return (
      <>
        <div className="min-h-56 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
          <div className="flex h-full min-h-44 items-center justify-center gap-4">
            <div
              className={`grid h-24 w-24 place-items-center rounded-3xl border-4 text-4xl font-black shadow-md ${
                leftNumber === '?'
                  ? 'border-dashed border-emerald-400 bg-white text-emerald-500'
                  : 'border-white bg-emerald-500 text-white'
              }`}
            >
              {leftNumber}
            </div>

            <span className="text-4xl font-black text-emerald-400">
              →
            </span>

            <div
              className={`grid h-24 w-24 place-items-center rounded-3xl border-4 text-4xl font-black shadow-md ${
                rightNumber === '?'
                  ? 'border-dashed border-emerald-400 bg-white text-emerald-500'
                  : 'border-white bg-emerald-500 text-white'
              }`}
            >
              {rightNumber}
            </div>
          </div>
        </div>

        <div className="mt-7">
          {renderAnswerButtons(question.answers)}
        </div>
      </>
    );
  }

  function renderOrderQuestion() {
    if (!question || question.type !== 'order') return null;

    return (
      <>
        <div className="min-h-56 rounded-3xl bg-gradient-to-br from-pink-50 to-rose-50 p-6">
          <p className="text-center font-bold text-slate-500">
            Các số cần sắp xếp
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {question.numbers.map((number) => (
              <div
                key={number}
                className="grid h-24 w-24 place-items-center rounded-3xl border-4 border-white bg-pink-500 text-4xl font-black text-white shadow-lg"
              >
                {number}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {question.answers.map((answer) => {
            const selected = selectedAnswer === answer;
            const correct = answer === question.correctAnswer;

            let buttonStyle =
              'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-pink-300 hover:bg-pink-50';

            if (selected && !correct) {
              buttonStyle =
                'border-red-400 bg-red-50 text-red-600';
            }

            if (canContinue && correct) {
              buttonStyle =
                'border-emerald-400 bg-emerald-50 text-emerald-700';
            }

            return (
              <button
                key={answer}
                type="button"
                disabled={canContinue}
                onClick={() => chooseAnswer(answer)}
                className={`rounded-2xl border-4 px-5 py-5 text-xl font-black shadow-md transition ${buttonStyle}`}
              >
                {answer}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  function renderQuestion() {
    if (!question) return null;

    if (question.type === 'count') {
      return renderCountQuestion();
    }

    if (question.type === 'missing-number') {
      return renderMissingNumberQuestion();
    }

    if (question.type === 'compare') {
      return renderCompareQuestion();
    }

    if (question.type === 'choose-group') {
      return renderChooseGroupQuestion();
    }

    if (question.type === 'before-after') {
      return renderBeforeAfterQuestion();
    }

    return renderOrderQuestion();
  }

  if (questions.length === 0) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="text-center">
          <div className="text-7xl">🐿️</div>
          <p className="mt-4 text-xl font-black text-violet-700">
            Sóc Nâu đang chuẩn bị bài học...
          </p>
        </div>
      </main>
    );
  }

  if (screen === 'intro') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <a
          href="/"
          className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-md"
        >
          ← Trang chủ
        </a>

        <section className="mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl shadow-sky-100">
          <div className="bg-gradient-to-r from-sky-400 to-violet-500 p-8 text-white md:p-12">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="flex shrink-0 items-end">
                <span className="text-8xl">🐿️</span>
                <span className="-ml-3 text-6xl">🐻</span>
              </div>

              <div>
                <p className="font-black uppercase tracking-widest text-sky-100">
                  Bài 1 · Lớp 1
                </p>

                <h1 className="mt-2 text-3xl font-black md:text-5xl">
                  Đếm và nhận biết số đến 10
                </h1>

                <p className="mt-4 text-lg font-semibold leading-8 text-white/90">
                  Mỗi lượt học gồm 10 câu được tạo mới từ nhiều dạng
                  bài tập khác nhau.
                </p>
              </div>
            </div>
          </div>

          <div className="p-7 md:p-10">
            <h2 className="text-xl font-black text-slate-900">
              Bé sẽ luyện tập:
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[
                ['👆', 'Đếm đồ vật'],
                ['🔢', 'Tìm số còn thiếu'],
                ['⚖️', 'So sánh số'],
                ['🧺', 'Chọn đúng nhóm'],
                ['➡️', 'Số trước và số sau'],
                ['📊', 'Sắp xếp các số'],
              ].map(([icon, title]) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"
                >
                  <span className="text-3xl">{icon}</span>
                  <span className="font-black text-slate-800">
                    {title}
                  </span>
                </div>
              ))}
            </div>

            {bestResult && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">
                Kết quả tốt nhất: {bestResult.score}% ·{' '}
                {'⭐'.repeat(bestResult.stars)}
              </div>
            )}

            <button
              type="button"
              onClick={startLesson}
              className="mt-7 w-full rounded-2xl bg-violet-600 px-7 py-4 text-lg font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-1 hover:bg-violet-700"
            >
              Bắt đầu bài học
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'example') {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl shadow-sky-100 md:p-10">
          <div className="flex items-start gap-4">
            <span className="text-6xl">🐿️</span>

            <div>
              <p className="font-black text-orange-600">
                Sóc Nâu hướng dẫn
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-900">
                Đếm từng đồ vật một
              </h1>
            </div>
          </div>

          <div className="my-8 rounded-3xl bg-sky-50 p-7">
            <div className="flex flex-wrap justify-center gap-5">
              {['🍎', '🍎', '🍎', '🍎'].map(
                (apple, index) => (
                  <div key={index} className="text-center">
                    <span className="text-6xl">{apple}</span>
                    <span className="mx-auto mt-2 grid h-8 w-8 place-items-center rounded-full bg-violet-600 font-black text-white">
                      {index + 1}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center">
            <p className="text-lg font-bold text-emerald-800">
              Ta đếm: 1, 2, 3, 4
            </p>

            <p className="mt-2 text-2xl font-black text-emerald-700">
              Có tất cả bốn quả táo.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setScreen('lesson')}
            className="mt-7 w-full rounded-2xl bg-violet-600 px-7 py-4 text-lg font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-1 hover:bg-violet-700"
          >
            Bé đã hiểu, bắt đầu luyện tập
          </button>
        </section>
      </main>
    );
  }

  if (screen === 'result' && latestResult) {
    const level = getLevelMessage(latestResult.score);

    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-center">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-8 shadow-2xl shadow-sky-100 md:p-12">
          <div className="text-7xl">🎉</div>

          <p className="mt-5 font-black uppercase tracking-widest text-violet-600">
            Hoàn thành bài học
          </p>

          <h1 className={`mt-3 text-4xl font-black ${level.color}`}>
            {level.title}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-lg font-semibold leading-8 text-slate-600">
            {level.description}
          </p>

          <div className="mt-7 flex justify-center gap-4 text-6xl">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={
                  star <= latestResult.stars
                    ? 'drop-shadow-lg'
                    : 'grayscale opacity-20'
                }
              >
                ⭐
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-sky-50 p-5">
              <p className="text-sm font-black text-sky-600">
                Điểm số
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {latestResult.score}%
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-sm font-black text-emerald-600">
                Đúng lần đầu
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {latestResult.correctFirstTry}/
                {latestResult.totalQuestions}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50 p-5">
              <p className="text-sm font-black text-amber-600">
                Sao nhận được
              </p>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {latestResult.stars}/3
              </p>
            </div>
          </div>

          <p className="mt-7 font-semibold text-slate-500">
            Mỗi lần luyện lại sẽ có một bộ câu hỏi mới.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={startNewSession}
              className="rounded-2xl bg-violet-600 px-7 py-4 font-black text-white shadow-lg shadow-violet-200"
            >
              Luyện bộ câu mới
            </button>

            <a
              href="/"
              className="rounded-2xl border-2 border-slate-200 bg-white px-7 py-4 font-black text-slate-700"
            >
              Về trang chủ
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-7">
      <header className="mb-6 flex items-center justify-between gap-4">
        <a
          href="/"
          className="rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-md"
        >
          ← Thoát
        </a>

        <div className="text-right">
          <p className="font-black text-violet-600">
            Câu {questionIndex + 1}/{questions.length}
          </p>
          <p className="text-sm font-bold text-slate-500">
            Đúng lần đầu: {correctFirstTry}
          </p>
        </div>
      </header>

      <div className="mb-6 h-4 overflow-hidden rounded-full bg-white shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="rounded-[2.5rem] border-4 border-white bg-white p-6 shadow-2xl shadow-sky-100 md:p-10">
        <div className="mb-7 flex items-center gap-4">
          <span className="text-5xl">
            {questionIndex % 2 === 0 ? '🐿️' : '🐻'}
          </span>

          <div>
            <p className="font-black text-violet-600">
              {questionIndex % 2 === 0
                ? 'Sóc Nâu hỏi'
                : 'Gấu Mật hỏi'}
            </p>

            <h1 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">
              {question.instruction}
            </h1>
          </div>
        </div>

        {renderQuestion()}

        {selectedAnswer !== null && !canContinue && (
          <div className="mt-7 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5">
            <div className="flex items-start gap-4">
              <span className="text-4xl">💡</span>

              <div className="flex-1">
                <h2 className="text-xl font-black text-orange-700">
                  Chưa đúng rồi, mình thử lại nhé!
                </h2>

                <p className="mt-2 font-semibold leading-7 text-slate-600">
                  {question.explanation}
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
          <div className="mt-7 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🎉</span>

                <div>
                  <h2 className="text-xl font-black text-emerald-700">
                    Chính xác!
                  </h2>

                  <p className="mt-1 font-semibold text-slate-600">
                    {question.explanation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={nextQuestion}
                className="w-full rounded-2xl bg-violet-600 px-6 py-4 font-black text-white shadow-lg shadow-violet-200 sm:w-auto"
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