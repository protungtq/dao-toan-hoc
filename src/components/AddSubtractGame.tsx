import { playCorrectSound, playFinalSound, playWrongSound } from '../lib/gameAudio';
import { useEffect, useMemo, useState } from 'react';

import {
  ARITHMETIC_SKILL_LABELS,
  generateArithmeticQuestions,
  type ArithmeticAnswer,
  type ArithmeticQuestion,
  type ArithmeticSkillId,
} from '../lib/addSubtractQuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = {
  questionId: string;
  skillId: ArithmeticSkillId;
  attempts: number;
  correctFirstTry: boolean;
};
type SavedBest = { score: number; stars: number };

const STORAGE_KEY = 'dao-toan-hoc:lop-1:cong-tru-10:best-v1';

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
      <div className="grid min-h-28 place-items-center rounded-2xl border-4 border-dashed border-slate-200 bg-white/70 px-5 text-center font-black text-slate-400">
        Không có đồ vật nào
      </div>
    );
  }
  return (
    <div className="flex min-h-28 flex-wrap content-center justify-center gap-3">
      {Array.from({ length: count }).map((_, index) => {
        const crossed = crossedFrom !== undefined && index >= crossedFrom;
        return (
          <span
            key={index}
            className={`relative text-4xl drop-shadow-sm md:text-5xl ${crossed ? 'opacity-40 grayscale' : ''}`}
          >
            {icon}
            {crossed && (
              <span className="absolute left-1/2 top-1/2 h-1 w-[125%] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-red-500" />
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function AddSubtractGame() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [practiceSize, setPracticeSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<ArithmeticQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<ArithmeticAnswer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [bestResult, setBestResult] = useState<SavedBest | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateArithmeticQuestions(10));
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
    const bySkill = (Object.keys(ARITHMETIC_SKILL_LABELS) as ArithmeticSkillId[])
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
    setQuestions(generateArithmeticQuestions(size));
    setQuestionIndex(0);
    setResults([]);
    setReviewMode(false);
    resetAnswer();
    setScreen('guide');
  }

  function chooseAnswer(answer: ArithmeticAnswer) {
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

  function answerClass(answer: ArithmeticAnswer) {
    if (selectedAnswer === answer && answer !== question.correctAnswer) {
      return 'border-red-400 bg-red-50 text-red-700';
    }
    if (canContinue && answer === question.correctAnswer) {
      return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    }
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-violet-300 hover:bg-violet-50';
  }

  function AnswerButtons({ answers }: { answers: ArithmeticAnswer[] }) {
    return (
      <div className={`grid gap-3 ${answers.length === 3 ? 'sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {answers.map((answer) => (
          <button
            key={String(answer)}
            type="button"
            disabled={canContinue}
            onClick={() => chooseAnswer(answer)}
            className={`min-h-20 rounded-2xl border-4 px-3 py-4 text-xl font-black shadow-sm transition md:text-2xl ${answerClass(answer)}`}
          >
            {answer}
          </button>
        ))}
      </div>
    );
  }

  function renderQuestion() {
    if (!question) return null;

    if (question.type === 'addition') {
      return (
        <>
          {question.visual ? (
            <div className="grid items-center gap-3 rounded-3xl bg-sky-50 p-5 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-2xl bg-white p-3"><ObjectGroup icon={question.object} count={question.left} /></div>
              <span className="text-center text-5xl font-black text-sky-600">+</span>
              <div className="rounded-2xl bg-white p-3"><ObjectGroup icon={question.object} count={question.right} /></div>
            </div>
          ) : (
            <div className="grid min-h-56 place-items-center rounded-3xl bg-sky-50 p-6">
              <p className="text-6xl font-black text-sky-700">{question.left} + {question.right} = ?</p>
            </div>
          )}
          <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
        </>
      );
    }

    if (question.type === 'subtraction') {
      return (
        <>
          {question.visual ? (
            <div className="rounded-3xl bg-orange-50 p-6">
              <ObjectGroup
                icon={question.object}
                count={question.whole}
                crossedFrom={question.whole - question.removed}
              />
              <p className="mt-4 text-center text-lg font-black text-orange-700">
                Gạch đi {question.removed}, đếm số còn lại
              </p>
            </div>
          ) : (
            <div className="grid min-h-56 place-items-center rounded-3xl bg-orange-50 p-6">
              <p className="text-6xl font-black text-orange-700">{question.whole} − {question.removed} = ?</p>
            </div>
          )}
          <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
        </>
      );
    }

    if (question.type === 'missing') {
      return (
        <>
          <div className="flex min-h-56 flex-wrap items-center justify-center gap-3 rounded-3xl bg-fuchsia-50 p-6">
            {question.equation.map((token, index) => (
              <div
                key={index}
                className={`grid h-20 min-w-20 place-items-center rounded-2xl px-4 text-4xl font-black ${
                  token === null
                    ? 'border-4 border-dashed border-fuchsia-400 bg-white text-fuchsia-600'
                    : typeof token === 'number'
                      ? 'bg-fuchsia-500 text-white shadow-md'
                      : 'text-fuchsia-700'
                }`}
              >
                {token === null ? '?' : token}
              </div>
            ))}
          </div>
          <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
        </>
      );
    }

    if (question.type === 'fact-family') {
      return (
        <>
          <div className="rounded-3xl bg-emerald-50 p-6">
            <div className="mx-auto grid max-w-sm grid-cols-2 gap-4">
              <div className="col-span-2 mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-emerald-300 bg-white text-4xl font-black text-emerald-700">{question.whole}</div>
              <div className="grid h-20 place-items-center rounded-2xl bg-emerald-500 text-3xl font-black text-white">{question.firstPart}</div>
              <div className="grid h-20 place-items-center rounded-2xl bg-emerald-500 text-3xl font-black text-white">{question.secondPart}</div>
            </div>
            <p className="mt-5 text-center text-2xl font-black text-emerald-800">
              {question.firstPart} + {question.secondPart} = {question.whole}
            </p>
          </div>
          <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
        </>
      );
    }

    const remaining =
      question.operation === 'subtraction'
        ? question.first - question.change
        : question.first;
    return (
      <>
        <div className="rounded-3xl bg-amber-50 p-6">
          <p className="mx-auto max-w-3xl text-center text-xl font-black leading-9 text-slate-800">
            {question.story}
          </p>
          <div className="mt-5 rounded-2xl bg-white/80 p-4">
            {question.operation === 'addition' ? (
              <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <ObjectGroup icon={question.object} count={question.first} />
                <span className="text-center text-4xl font-black text-amber-600">+</span>
                <ObjectGroup icon={question.object} count={question.change} />
              </div>
            ) : (
              <ObjectGroup
                icon={question.object}
                count={question.first}
                crossedFrom={remaining}
              />
            )}
          </div>
        </div>
        <div className="mt-6"><AnswerButtons answers={question.answers} /></div>
      </>
    );
  }

  if (!questions.length) {
    return (
      <main className="grid min-h-screen place-items-center text-center">
        <div><div className="text-7xl">🐿️</div><p className="mt-4 text-xl font-black text-violet-700">Sóc Nâu đang chuẩn bị phép tính...</p></div>
      </main>
    );
  }

  if (screen === 'intro') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <a href="/lop-1" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 1</a>
        <section className="mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl shadow-violet-100">
          <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-8 text-white md:p-12">
            <p className="font-black tracking-widest text-violet-100">Mục 3 · Bài 10–13</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Phép cộng, phép trừ trong phạm vi 10</h1>
            <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">
              Luyện cộng, trừ, tìm số còn thiếu và giải bài toán bằng hình ảnh.
            </p>
          </div>
          <div className="p-6 md:p-10">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ['➕', 'Phép cộng'],
                ['➖', 'Phép trừ'],
                ['❓', 'Số còn thiếu'],
                ['🔄', 'Cộng – trừ liên quan'],
                ['📖', 'Bài toán thực tế'],
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
                [5, 'Luyện nhanh', 'Mỗi kỹ năng một câu'],
                [10, 'Luyện chuẩn', 'Cân bằng cộng, trừ và vận dụng'],
                [15, 'Thử thách', 'Luyện kỹ bảng cộng và bảng trừ'],
              ] as const).map(([size, title, description]) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => prepareSession(size)}
                  className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${size === 10 ? 'border-violet-400 bg-violet-50 shadow-lg shadow-violet-100' : 'border-slate-100 bg-white hover:border-fuchsia-300'}`}
                >
                  <span className="text-sm font-black text-violet-700">{size} câu</span>
                  <span className="mt-1 block text-xl font-black text-slate-900">{title}</span>
                  <span className="mt-2 block font-semibold text-slate-500">{description}</span>
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
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl shadow-violet-100 md:p-10">
          <div className="flex items-start gap-4">
            <span className="text-6xl">🐿️</span>
            <div><p className="font-black text-orange-600">Sóc Nâu nhắc bé</p><h1 className="mt-1 text-3xl font-black text-slate-900">Hiểu hành động trước khi tính</h1></div>
          </div>
          <div className="my-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-sky-50 p-5"><p className="font-black text-sky-700">Thêm vào, gộp lại</p><p className="mt-2 font-semibold leading-7 text-slate-600">Dùng phép cộng để tìm tất cả.</p></div>
            <div className="rounded-3xl bg-orange-50 p-5"><p className="font-black text-orange-700">Bớt đi, lấy đi</p><p className="mt-2 font-semibold leading-7 text-slate-600">Dùng phép trừ để tìm số còn lại.</p></div>
          </div>
          <p className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">
            Mọi phép tính đều trong phạm vi 10 và phép trừ không cho kết quả âm.
          </p>
          <button type="button" onClick={() => setScreen('lesson')} className="mt-7 w-full rounded-2xl bg-violet-600 px-7 py-4 text-lg font-black text-white shadow-lg shadow-violet-200">Bắt đầu {practiceSize} câu</button>
        </section>
      </main>
    );
  }

  if (screen === 'result') {
    const missed = results.filter((item) => !item.correctFirstTry).length;
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl shadow-violet-100 md:p-10">
          <div className="text-7xl">{reviewMode ? '💪' : '🎉'}</div>
          <p className="mt-4 font-black tracking-widest text-violet-700">{reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành bài luyện tập'}</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">
            {summary.score >= 90 ? 'Nhà tính toán xuất sắc!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Bé đã rất cố gắng!'}
          </h1>
          <div className="mt-6 flex justify-center gap-3 text-5xl">
            {[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}
          </div>
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
                    <div><p className="font-black text-slate-800">{ARITHMETIC_SKILL_LABELS[item.skillId]}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${percent >= 70 ? 'bg-emerald-400' : 'bg-orange-400'}`} style={{ width: `${percent}%` }} /></div></div>
                    <p className="font-black text-slate-600">{item.correct}/{item.total}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {!reviewMode && missed > 0 && <button type="button" onClick={startMistakeReview} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu cần nhớ</button>}
            <button type="button" onClick={() => prepareSession(practiceSize)} className="rounded-2xl bg-violet-600 px-6 py-4 font-black text-white">Luyện bộ câu mới</button>
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
        <div className="text-right"><p className="font-black text-violet-700">{reviewMode ? 'Ôn lại · ' : ''}Câu {questionIndex + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{ARITHMETIC_SKILL_LABELS[question.skillId]}</p></div>
      </header>
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-white shadow-inner"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <section className="rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl shadow-violet-100 md:p-9">
        <div className="mb-6 flex items-center gap-4">
          <span className="text-5xl">{questionIndex % 2 === 0 ? '🐿️' : '🐻'}</span>
          <div><p className="font-black text-violet-700">{questionIndex % 2 === 0 ? 'Sóc Nâu hỏi' : 'Gấu Mật hỏi'}</p><h1 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">{question.instruction}</h1></div>
        </div>
        {renderQuestion()}
        {selectedAnswer !== null && !canContinue && (
          <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5">
            <div className="flex items-start gap-3"><span className="text-3xl">💡</span><div className="flex-1"><h2 className="text-xl font-black text-orange-700">Chưa đúng, mình làm từng bước nhé!</h2><p className="mt-2 font-semibold leading-7 text-slate-600"><span className="font-black">Gợi ý {hintLevel}/3:</span> {question.hintSteps[Math.max(0, hintLevel - 1)]}</p><button type="button" onClick={() => setSelectedAnswer(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div></div>
          </div>
        )}
        {canContinue && selectedAnswer === question.correctAnswer && (
          <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div className="flex items-start gap-3"><span className="text-3xl">🎉</span><div><h2 className="text-xl font-black text-emerald-700">Chính xác!</h2><p className="mt-1 font-semibold leading-7 text-slate-600">{question.explanation}</p></div></div><button type="button" onClick={nextQuestion} className="w-full rounded-2xl bg-violet-600 px-6 py-4 font-black text-white sm:w-auto">{questionIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div>
          </div>
        )}
      </section>
    </main>
  );
}
