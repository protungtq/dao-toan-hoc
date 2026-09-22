import ResultShare from './ResultShare';
import { buildAdaptiveQuestionSet } from '../lib/learningProfile';
import { playCorrectSound, playFinalSound, playWrongSound } from '../lib/gameAudio';
import { useEffect, useMemo, useState } from 'react';

import {
  generateNumbersTo100Questions,
  NUMBERS_100_SKILL_LABELS,
  type Numbers100Answer,
  type Numbers100SkillId,
  type NumbersTo100Question,
} from '../lib/numbersTo100QuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = {
  questionId: string;
  skillId: Numbers100SkillId;
  attempts: number;
  correctFirstTry: boolean;
};
type SavedBest = { score: number; stars: number };

const STORAGE_KEY = 'dao-toan-hoc:lop-1:cac-so-den-100:best-v1';

function starsFor(score: number) {
  if (score >= 90) return 3;
  if (score >= 70) return 2;
  return 1;
}

function BaseTenVisual({ tens, ones }: { tens: number; ones: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-center">
      <div className="rounded-3xl border-2 border-cyan-200 bg-white p-5">
        <p className="mb-4 text-center font-black text-cyan-700">Chục</p>
        <div className="flex min-h-36 flex-wrap content-center justify-center gap-2">
          {Array.from({ length: tens }).map((_, index) => (
            <div
              key={index}
              className="h-32 w-7 rounded-md border-2 border-cyan-600 bg-cyan-400"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent 0, transparent 10px, rgba(255,255,255,.8) 10px, rgba(255,255,255,.8) 12px)',
              }}
            />
          ))}
        </div>
      </div>
      <span className="hidden text-4xl font-black text-cyan-500 md:block">+</span>
      <div className="rounded-3xl border-2 border-sky-200 bg-white p-5">
        <p className="mb-4 text-center font-black text-sky-700">Đơn vị</p>
        <div className="flex min-h-36 flex-wrap content-center justify-center gap-2">
          {ones === 0 ? (
            <span className="font-black text-slate-400">0 khối</span>
          ) : (
            Array.from({ length: ones }).map((_, index) => (
              <div key={index} className="h-8 w-8 rounded-md border-2 border-sky-600 bg-sky-400" />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function NumbersTo100Game() {
  const [screen, setScreen] = useState<Screen>('intro');
  const [practiceSize, setPracticeSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<NumbersTo100Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<Numbers100Answer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [bestResult, setBestResult] = useState<SavedBest | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateNumbersTo100Questions(10));
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
    const bySkill = (Object.keys(NUMBERS_100_SKILL_LABELS) as Numbers100SkillId[])
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
    setQuestions(generateNumbersTo100Questions(size));
    setQuestionIndex(0);
    setResults([]);
    setReviewMode(false);
    resetAnswer();
    setScreen('guide');
  }

  function chooseAnswer(answer: Numbers100Answer) {
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

  function answerClass(answer: Numbers100Answer) {
    if (selectedAnswer === answer && answer !== question.correctAnswer) return 'border-red-400 bg-red-50 text-red-700';
    if (canContinue && answer === question.correctAnswer) return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-cyan-300 hover:bg-cyan-50';
  }

  function AnswerButtons({ answers }: { answers: Numbers100Answer[] }) {
    const longAnswers = answers.some((answer) => String(answer).length > 8);
    return (
      <div className={`grid gap-3 ${longAnswers ? 'sm:grid-cols-2' : answers.length === 3 ? 'sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
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
    if (question.type === 'build-number') {
      return <><div className="rounded-3xl bg-cyan-50 p-5"><BaseTenVisual tens={question.tens} ones={question.ones} /></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'decompose-number') {
      const digits = String(question.number).split('');
      return <><div className="rounded-3xl bg-violet-50 p-6"><div className="mx-auto flex max-w-sm justify-center gap-4">{digits.map((digit, index) => <div key={index} className={`grid h-32 w-28 place-items-center rounded-3xl text-6xl font-black text-white shadow-lg ${index === 0 ? 'bg-violet-500' : 'bg-fuchsia-500'}`}><div className="text-center"><div>{digit}</div><div className="mt-1 text-xs uppercase tracking-wider">{index === 0 ? 'hàng chục' : 'hàng đơn vị'}</div></div></div>)}</div></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'read-write-number') {
      return <><div className="grid min-h-56 place-items-center rounded-3xl bg-sky-50 p-6 text-center">{question.mode === 'read' ? <div className="grid h-36 w-44 place-items-center rounded-3xl bg-sky-500 text-7xl font-black text-white shadow-lg">{question.number}</div> : <div><p className="text-lg font-bold text-sky-700">Số cần viết</p><p className="mt-3 text-4xl font-black text-slate-900">“{question.numberWord}”</p></div>}</div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'before-after') {
      const left = question.direction === 'before' ? '?' : question.number;
      const right = question.direction === 'after' ? '?' : question.number;
      return <><div className="flex min-h-56 items-center justify-center gap-4 rounded-3xl bg-emerald-50 p-5">{[left, right].map((value, index) => <div key={index} className={`grid h-28 w-28 place-items-center rounded-3xl border-4 text-4xl font-black ${value === '?' ? 'border-dashed border-emerald-400 bg-white text-emerald-600' : 'border-white bg-emerald-500 text-white'}`}>{value}</div>)}</div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'sequence') {
      return <><div className="flex min-h-56 flex-wrap items-center justify-center gap-3 rounded-3xl bg-fuchsia-50 p-5">{question.sequence.map((number, index) => <div key={index} className={`grid h-20 w-20 place-items-center rounded-2xl border-4 text-3xl font-black ${number === null ? 'border-dashed border-fuchsia-400 bg-white text-fuchsia-500' : 'border-white bg-fuchsia-500 text-white'}`}>{number === null ? '?' : number}</div>)}</div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'compare') {
      return <><div className="flex min-h-56 items-center justify-center gap-4 rounded-3xl bg-orange-50 p-5"><div className="grid h-28 w-28 place-items-center rounded-3xl bg-orange-400 text-5xl font-black text-white">{question.left}</div><div className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-dashed border-orange-300 bg-white text-4xl font-black text-orange-500">?</div><div className="grid h-28 w-28 place-items-center rounded-3xl bg-orange-400 text-5xl font-black text-white">{question.right}</div></div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
    }
    if (question.type === 'choose-larger-smaller') {
      return <div className="rounded-3xl bg-amber-50 p-6"><p className="mb-5 text-center font-bold text-amber-700">Quan sát hàng chục trước, rồi đến hàng đơn vị</p><AnswerButtons answers={question.answers} /></div>;
    }
    return <><div className="mx-auto grid max-w-md grid-cols-3 gap-3 rounded-3xl bg-teal-50 p-5">{question.cells.map((number, index) => <div key={index} className={`grid h-20 place-items-center rounded-2xl border-4 text-2xl font-black ${number === null ? 'border-dashed border-teal-400 bg-white text-teal-600' : index === 4 ? 'border-white bg-teal-600 text-white shadow-md' : 'border-white bg-teal-200 text-teal-900'}`}>{number === null ? '?' : number}</div>)}</div><div className="mt-6"><AnswerButtons answers={question.answers} /></div></>;
  }

  if (!questions.length) {
    return <main className="grid min-h-screen place-items-center text-center"><div><div className="text-7xl">💯</div><p className="mt-4 text-xl font-black text-cyan-700">Sóc Nâu đang xếp bảng số...</p></div></main>;
  }

  if (screen === 'intro') {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <a href="/lop-1" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 1</a>
        <section className="mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl shadow-cyan-100">
          <div className="bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-500 p-8 text-white md:p-12">
            <p className="font-black tracking-widest text-cyan-100">Mục 6 · Bài 21–24</p>
            <h1 className="mt-2 text-3xl font-black md:text-5xl">Các số đến 100</h1>
            <p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">Đọc, viết, phân tích và so sánh các số có hai chữ số.</p>
          </div>
          <div className="p-6 md:p-10">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[['🧮', 'Chục và đơn vị'], ['✍️', 'Đọc và viết số'], ['➡️', 'Số trước và số sau'], ['⚖️', 'So sánh số'], ['▦', 'Bảng số đến 100']].map(([icon, label]) => <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-3xl">{icon}</div><p className="mt-2 font-black text-slate-700">{label}</p></div>)}
            </div>
            <h2 className="mt-8 text-xl font-black text-slate-900">Chọn lượt luyện tập</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {([[5, 'Luyện nhanh', 'Mỗi kỹ năng một câu'], [10, 'Luyện chuẩn', 'Tập trung chục, đơn vị và so sánh'], [15, 'Thử thách', 'Luyện toàn diện bảng số đến 100']] as const).map(([size, title, description]) => (
                <button key={size} type="button" onClick={() => prepareSession(size)} className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${size === 10 ? 'border-cyan-400 bg-cyan-50 shadow-lg shadow-cyan-100' : 'border-slate-100 bg-white hover:border-sky-300'}`}><span className="text-sm font-black text-cyan-700">{size} câu</span><span className="mt-1 block text-xl font-black">{title}</span><span className="mt-2 block font-semibold text-slate-500">{description}</span></button>
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
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl shadow-cyan-100 md:p-10">
          <div className="flex items-start gap-4"><span className="text-6xl">🐿️</span><div><p className="font-black text-cyan-700">Sóc Nâu nhắc bé</p><h1 className="mt-1 text-3xl font-black">Nhìn hàng chục trước</h1></div></div>
          <div className="my-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-cyan-50 p-5"><p className="font-black text-cyan-700">Chữ số bên trái</p><p className="mt-2 font-semibold text-slate-600">Cho biết số chục.</p></div>
            <div className="rounded-3xl bg-sky-50 p-5"><p className="font-black text-sky-700">Chữ số bên phải</p><p className="mt-2 font-semibold text-slate-600">Cho biết số đơn vị.</p></div>
          </div>
          <p className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">Trên bảng số, đi sang phải thêm 1; đi xuống dưới thêm 10.</p>
          <button type="button" onClick={() => setScreen('lesson')} className="mt-7 w-full rounded-2xl bg-cyan-600 px-7 py-4 text-lg font-black text-white shadow-lg shadow-cyan-200">Bắt đầu {practiceSize} câu</button>
        </section>
      </main>
    );
  }

  if (screen === 'result') {
    const missed = results.filter((item) => !item.correctFirstTry).length;
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl shadow-cyan-100 md:p-10">
          <div className="text-7xl">{reviewMode ? '💪' : '🎉'}</div>
          <p className="mt-4 font-black tracking-widest text-cyan-700">{reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành bài luyện tập'}</p>
          <h1 className="mt-2 text-4xl font-black">{summary.score >= 90 ? 'Nhà khám phá số học!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Bé đã rất cố gắng!'}</h1>
          <div className="mt-6 flex justify-center gap-3 text-5xl">{[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}</div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-sky-50 p-5"><p className="font-black text-sky-700">Điểm số</p><p className="mt-1 text-3xl font-black">{summary.score}%</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-black text-emerald-700">Đúng lần đầu</p><p className="mt-1 text-3xl font-black">{summary.correct}/{results.length}</p></div><div className="rounded-2xl bg-amber-50 p-5"><p className="font-black text-amber-700">Sao nhận được</p><p className="mt-1 text-3xl font-black">{summary.stars}/3</p></div></div>
          <div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left"><h2 className="bg-slate-50 px-5 py-4 text-xl font-black">Kết quả theo kỹ năng</h2><div className="divide-y divide-slate-100">{summary.bySkill.map((item) => { const percent = Math.round((item.correct / item.total) * 100); return <div key={item.skillId} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black text-slate-800">{NUMBERS_100_SKILL_LABELS[item.skillId]}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${percent >= 70 ? 'bg-emerald-400' : 'bg-orange-400'}`} style={{ width: `${percent}%` }} /></div></div><p className="font-black text-slate-600">{item.correct}/{item.total}</p></div>; })}</div></div>
          <ResultShare score={summary.score} correct={summary.correct} total={results.length} stars={summary.stars} attempts={results} /><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{!reviewMode && missed > 0 && <button type="button" onClick={startMistakeReview} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu cần nhớ</button>}<button type="button" onClick={() => prepareSession(practiceSize)} className="rounded-2xl bg-cyan-600 px-6 py-4 font-black text-white">Luyện bộ câu mới</button><a href="/lop-1" className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black text-slate-700">Về lớp 1</a></div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-7">
      <header className="mb-5 flex items-center justify-between gap-4"><button type="button" onClick={() => setScreen('intro')} className="rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Thoát</button><div className="text-right"><p className="font-black text-cyan-700">{reviewMode ? 'Ôn lại · ' : ''}Câu {questionIndex + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{NUMBERS_100_SKILL_LABELS[question.skillId]}</p></div></header>
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <section className="rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl shadow-cyan-100 md:p-9">
        <div className="mb-6 flex items-center gap-4"><span className="text-5xl">{questionIndex % 2 === 0 ? '🐿️' : '🐻'}</span><div><p className="font-black text-cyan-700">{questionIndex % 2 === 0 ? 'Sóc Nâu hỏi' : 'Gấu Mật hỏi'}</p><h1 className="mt-1 text-2xl font-black md:text-3xl">{question.instruction}</h1></div></div>
        {renderQuestion()}
        {selectedAnswer !== null && !canContinue && <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5"><div className="flex items-start gap-3"><span className="text-3xl">💡</span><div className="flex-1"><h2 className="text-xl font-black text-orange-700">Chưa đúng, mình xem lại nhé!</h2><p className="mt-2 font-semibold leading-7 text-slate-600"><span className="font-black">Gợi ý {hintLevel}/3:</span> {question.hintSteps[Math.max(0, hintLevel - 1)]}</p><button type="button" onClick={() => setSelectedAnswer(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div></div></div>}
        {canContinue && selectedAnswer === question.correctAnswer && <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div className="flex items-start gap-3"><span className="text-3xl">🎉</span><div><h2 className="text-xl font-black text-emerald-700">Chính xác!</h2><p className="mt-1 font-semibold leading-7 text-slate-600">{question.explanation}</p></div></div><button type="button" onClick={nextQuestion} className="w-full rounded-2xl bg-cyan-600 px-6 py-4 font-black text-white sm:w-auto">{questionIndex === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div></div>}
      </section>
    </main>
  );
}
