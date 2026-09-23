import { useEffect, useMemo, useState } from 'react';
import ResultShare from './ResultShare';
import SolutionExplanation from './SolutionExplanation';
import { buildAdaptiveQuestionSet } from '../lib/learningProfile';
import { playCorrectSound, playFinalSound, playWrongSound } from '../lib/gameAudio';
import {
  GRADE3_STAGE6_SKILL_LABELS,
  generateGrade3Stage6Questions,
  type Grade3Stage6Answer,
  type Grade3Stage6Module,
  type Grade3Stage6Question,
  type Grade3Stage6SkillId,
} from '../lib/grade3Stage6QuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = { questionId: string; skillId: Grade3Stage6SkillId; attempts: number; correctFirstTry: boolean };
type Props = { module: Grade3Stage6Module };

const CONFIG = {
  multiplyDivide100000: {
    number: 14, lessons: '70–72', title: 'Nhân, chia trong phạm vi 100 000', mascot: '🐿️', accent: 'red',
    description: 'Nhân và chia số có năm chữ số với số có một chữ số, vận dụng vào bài toán thực tế.',
    topics: [['✖️', 'Nhân số có năm chữ số'], ['➗', 'Chia số có năm chữ số'], ['🔍', 'Kiểm tra kết quả'], ['📖', 'Bài toán thực tế']],
    guideTitle: 'Tính theo từng hàng và luôn kiểm tra lại',
    guide: [['🧮', 'Đặt tính', 'Nhân từ phải sang trái; chia từ hàng cao nhất xuống hàng thấp nhất.'], ['🔍', 'Kiểm tra', 'Kiểm tra phép chia bằng cách lấy thương nhân với số chia.']],
  },
  statisticsProbability: {
    number: 15, lessons: '73–75', title: 'Thống kê và xác suất đơn giản', mascot: '🐻', accent: 'cyan',
    description: 'Thu thập, phân loại, đọc bảng số liệu và nhận biết khả năng xảy ra của một sự kiện.',
    topics: [['📋', 'Ghi chép số liệu'], ['📊', 'Đọc bảng số liệu'], ['➕', 'Tính từ dữ liệu'], ['🎲', 'Khả năng xảy ra']],
    guideTitle: 'Đọc đúng hàng, đúng cột và xét đủ khả năng',
    guide: [['📊', 'Đọc bảng', 'Tìm đúng hàng được hỏi rồi đọc số liệu ở cùng hàng.'], ['🎲', 'Xác suất', 'Xét sự kiện là chắc chắn, có thể hay không thể xảy ra.']],
  },
  finalReview: {
    number: 16, lessons: '76–81', title: 'Ôn tập cuối năm', mascot: '🏆', accent: 'fuchsia',
    description: 'Ôn tổng hợp số, phép tính, hình học, đo lường, bảng số liệu và xác suất lớp 3.',
    topics: [['🔢', 'Số đến 100 000'], ['🧮', 'Bốn phép tính'], ['📐', 'Hình học và đo lường'], ['📊', 'Dữ liệu và xác suất']],
    guideTitle: 'Đọc kỹ yêu cầu, chọn đúng quy tắc rồi kiểm tra',
    guide: [['🧩', 'Chọn cách làm', 'Xác định bài hỏi số, phép tính, hình học hay dữ liệu.'], ['✅', 'Kiểm tra', 'Ước lượng và dùng phép tính ngược để phát hiện sai sót.']],
  },
} as const;

const TONES = {
  red: { text: 'text-rose-700', button: 'bg-rose-600 hover:bg-rose-700', bar: 'from-red-500 to-rose-600', pale: 'bg-rose-50 text-rose-950', shadow: 'shadow-rose-100', selected: 'border-rose-400 bg-rose-50' },
  cyan: { text: 'text-cyan-700', button: 'bg-cyan-600 hover:bg-cyan-700', bar: 'from-cyan-500 to-teal-600', pale: 'bg-cyan-50 text-cyan-950', shadow: 'shadow-cyan-100', selected: 'border-cyan-400 bg-cyan-50' },
  fuchsia: { text: 'text-fuchsia-700', button: 'bg-fuchsia-600 hover:bg-fuchsia-700', bar: 'from-fuchsia-500 to-purple-600', pale: 'bg-fuchsia-50 text-fuchsia-950', shadow: 'shadow-fuchsia-100', selected: 'border-fuchsia-400 bg-fuchsia-50' },
} as const;

const starsFor = (score: number) => score >= 90 ? 3 : score >= 70 ? 2 : 1;
const formatNumber = (value: number) => value.toLocaleString('vi-VN');

function CalculationVisual({ question }: { question: Extract<Grade3Stage6Question, { type: 'calculation' }> }) {
  const symbols = { add: '+', subtract: '−', multiply: '×', divide: ':' } as const;
  return <div className="grid min-h-64 place-items-center rounded-3xl bg-white/70 p-6"><div className="grid grid-cols-[3.5rem_14rem] text-right text-4xl font-black leading-tight sm:text-5xl"><span /><span>{formatNumber(question.left)}</span><span className="text-rose-600">{symbols[question.operation]}</span><span>{formatNumber(question.right)}</span><span className="col-span-2 mt-2 border-t-4 border-slate-700 pt-3">?</span></div></div>;
}

function DataTableVisual({ question }: { question: Extract<Grade3Stage6Question, { type: 'data-table' }> }) {
  return <div className="w-full max-w-2xl overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg"><div className="bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-4 text-center text-lg font-black text-white sm:text-xl">{question.title}</div><div className="grid grid-cols-[1fr_auto] bg-slate-100 px-5 py-3 text-sm font-black text-slate-600"><span>Nhóm</span><span>Số lượng</span></div>{question.labels.map((label, index) => <div key={label} className="grid grid-cols-[1fr_auto] items-center border-t px-5 py-3"><span className="flex items-center gap-3 font-black"><span className="text-2xl">{question.icons[index]}</span>{label}</span><span className="rounded-xl bg-cyan-50 px-4 py-2 text-xl font-black text-cyan-800">{question.values[index]}</span></div>)}</div>;
}

function NumberVisual({ question }: { question: Extract<Grade3Stage6Question, { type: 'number' }> }) {
  if (question.mode === 'compare') return <div className="flex min-h-64 items-center justify-center gap-3 rounded-3xl bg-white/70 p-5 text-3xl font-black sm:gap-8 sm:text-5xl"><span>{formatNumber(question.value)}</span><span className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-dashed border-fuchsia-400 text-fuchsia-500">?</span><span>{formatNumber(question.secondValue ?? 0)}</span></div>;
  const digits = String(question.value).split('');
  const places = ['Chục nghìn', 'Nghìn', 'Trăm', 'Chục', 'Đơn vị'];
  return <div className="grid min-h-64 place-items-center rounded-3xl bg-white/70 p-4"><div className="grid w-full max-w-3xl grid-cols-5 gap-1.5 sm:gap-3">{digits.map((digit, index) => <div key={`${digit}-${index}`} className={`overflow-hidden rounded-xl border-4 text-center ${question.highlightedPlace === `hàng ${places[index].toLowerCase()}` ? 'border-amber-400 bg-amber-50' : 'border-white bg-white'}`}><p className="flex min-h-11 items-center justify-center bg-fuchsia-100 px-1 text-[10px] font-black text-fuchsia-800 sm:text-sm">{places[index]}</p><p className="py-4 text-3xl font-black sm:text-5xl">{digit}</p></div>)}</div></div>;
}

function GeometryVisual({ question }: { question: Extract<Grade3Stage6Question, { type: 'geometry' }> }) {
  const viewWidth = question.shape === 'square' ? 260 : 370;
  const rectWidth = question.shape === 'square' ? 170 : 270;
  const rectHeight = question.shape === 'square' ? 170 : 145;
  return <div className="grid min-h-64 place-items-center rounded-3xl bg-white/70 p-4"><svg viewBox={`0 0 ${viewWidth} 250`} className="w-full max-w-lg" role="img" aria-label={question.shape === 'square' ? 'Hình vuông có ghi độ dài cạnh' : 'Hình chữ nhật có ghi chiều dài và chiều rộng'}><rect x="50" y="35" width={rectWidth} height={rectHeight} rx="8" fill="#e0f2fe" stroke="#7c3aed" strokeWidth="8" /><text x={50 + rectWidth / 2} y={25} textAnchor="middle" fontSize="22" fontWeight="900">{question.width} cm</text><text x={35} y={35 + rectHeight / 2} textAnchor="middle" fontSize="22" fontWeight="900" transform={`rotate(-90 35 ${35 + rectHeight / 2})`}>{question.height} cm</text>{question.task === 'area' && <><path d={`M70 55 H${30 + rectWidth} V${15 + rectHeight} H70 Z`} fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="8 6" /><text x={50 + rectWidth / 2} y={45 + rectHeight / 2} textAnchor="middle" fontSize="22" fontWeight="900" fill="#6d28d9">Diện tích?</text></>}</svg></div>;
}

function QuestionVisual({ question, pale }: { question: Grade3Stage6Question; pale: string }) {
  if (question.type === 'calculation') return <div className={`rounded-3xl ${pale}`}><CalculationVisual question={question} /></div>;
  if (question.type === 'context') return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 text-center ${pale}`}><div><div className="text-8xl">{question.icon}</div><p className="mt-4 text-2xl font-black">{question.visualTitle}</p>{question.visualLines.map((line) => <p key={line} className="mt-2 text-lg font-bold opacity-75">{line}</p>)}</div></div>;
  if (question.type === 'data-table') return <div className={`grid min-h-72 place-items-center rounded-3xl p-4 ${pale}`}><DataTableVisual question={question} /></div>;
  if (question.type === 'probability') return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 text-center ${pale}`}><div><div className="text-8xl">{question.icon}</div><p className="mt-4 text-2xl font-black">{question.sceneTitle}</p><p className="mx-auto mt-2 max-w-xl text-lg font-bold opacity-75">{question.sceneText}</p></div></div>;
  if (question.type === 'number') return <div className={`rounded-3xl ${pale}`}><NumberVisual question={question} /></div>;
  if (question.type === 'geometry') return <div className={`rounded-3xl ${pale}`}><GeometryVisual question={question} /></div>;
  return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 text-center ${pale}`}><div><div className="text-8xl">{question.icon}</div><p className="mt-4 text-4xl font-black">{question.value} {question.fromUnit}</p><p className="mt-3 text-xl font-black">= ? {question.toUnit}</p></div></div>;
}

export default function Grade3Stage6Game({ module }: Props) {
  const config = CONFIG[module];
  const tone = TONES[config.accent];
  const storageKey = `trang-toan:lop-3:${module}:best-v1`;
  const [screen, setScreen] = useState<Screen>('intro');
  const [size, setSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<Grade3Stage6Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Grade3Stage6Answer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [best, setBest] = useState<{ score: number; stars: number } | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateGrade3Stage6Questions(module, 10));
    const saved = localStorage.getItem(storageKey);
    if (saved) try { setBest(JSON.parse(saved)); } catch { localStorage.removeItem(storageKey); }
  }, [module, storageKey]);

  const question = questions[index];
  const progress = questions.length ? (index + 1) / questions.length * 100 : 0;
  const summary = useMemo(() => {
    const correct = results.filter((result) => result.correctFirstTry).length;
    const score = results.length ? Math.round(correct / results.length * 100) : 0;
    const bySkill = [...new Set(results.map((result) => result.skillId))].map((skillId) => {
      const list = results.filter((result) => result.skillId === skillId);
      return { skillId, total: list.length, correct: list.filter((result) => result.correctFirstTry).length };
    });
    return { correct, score, stars: starsFor(score), bySkill };
  }, [results]);

  const resetAnswer = () => { setSelected(null); setAttempts(0); setHint(0); setCanContinue(false); };
  function prepare(nextSize: PracticeSize) { setSize(nextSize); setQuestions(buildAdaptiveQuestionSet(() => generateGrade3Stage6Questions(module, nextSize), nextSize)); setIndex(0); setResults([]); setReviewMode(false); resetAnswer(); setScreen('guide'); }
  function choose(answer: Grade3Stage6Answer) { if (!question || canContinue) return; const nextAttempts = attempts + 1; setAttempts(nextAttempts); setSelected(answer); if (answer === question.correctAnswer) { playCorrectSound(); setCanContinue(true); setResults((current) => [...current, { questionId: question.id, skillId: question.skillId, attempts: nextAttempts, correctFirstTry: nextAttempts === 1 }]); } else { playWrongSound(); setHint(Math.min(nextAttempts, 3)); } }
  function next() { if (index < questions.length - 1) { setIndex((value) => value + 1); resetAnswer(); return; } if (!reviewMode) { const correct = results.filter((result) => result.correctFirstTry).length; const score = Math.round(correct / questions.length * 100); const saved = { score, stars: starsFor(score) }; if (!best || score > best.score) { localStorage.setItem(storageKey, JSON.stringify(saved)); setBest(saved); } } playFinalSound(); setScreen('result'); }
  function review() { const missedIds = new Set(results.filter((result) => !result.correctFirstTry).map((result) => result.questionId)); const missed = questions.filter((item) => missedIds.has(item.id)); if (!missed.length) return; setQuestions(missed); setIndex(0); setResults([]); setReviewMode(true); resetAnswer(); setScreen('lesson'); }
  function answerClass(answer: Grade3Stage6Answer) { if (selected === answer && answer !== question.correctAnswer) return 'border-red-400 bg-red-50 text-red-700'; if (canContinue && answer === question.correctAnswer) return 'border-emerald-400 bg-emerald-50 text-emerald-700'; return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-violet-300 hover:bg-violet-50'; }

  useEffect(() => {
    if (screen !== 'lesson' || !question) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (canContinue && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); next(); return; }
      const answerIndex = Number(event.key) - 1;
      if (!canContinue && answerIndex >= 0 && answerIndex < question.answers.length) { event.preventDefault(); choose(question.answers[answerIndex]); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, question, canContinue, attempts, index]);

  if (!questions.length) return <main className="grid min-h-screen place-items-center"><div className="text-center"><div className="text-7xl">{config.mascot}</div><p className={`mt-4 text-xl font-black ${tone.text}`}>Đang chuẩn bị bài luyện...</p></div></main>;

  if (screen === 'intro') return <main className="mx-auto max-w-5xl px-4 py-8 md:py-12"><a href="/lop-3" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 3</a><section className={`mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl ${tone.shadow}`}><div className={`bg-gradient-to-br ${tone.bar} p-8 text-white md:p-12`}><p className="font-black tracking-widest text-white/75">Mục {config.number} · Bài {config.lessons}</p><h1 className="mt-2 text-3xl font-black md:text-5xl">{config.title}</h1><p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">{config.description}</p></div><div className="p-6 md:p-10"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{config.topics.map(([icon, label]) => <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-3xl">{icon}</div><p className="mt-2 font-black text-slate-700">{label}</p></div>)}</div><h2 className="mt-8 text-xl font-black">Chọn lượt luyện tập</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{([[5, 'Luyện nhanh', 'Bao quát các kỹ năng chính'], [10, 'Luyện chuẩn', 'Cân bằng tính toán và vận dụng'], [15, 'Thử thách', 'Nhiều số liệu và tình huống hơn']] as const).map(([count, title, description]) => <button key={count} onClick={() => prepare(count)} className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${count === 10 ? `${tone.selected} shadow-lg` : 'border-slate-100 bg-white hover:border-violet-300'}`}><span className={`text-sm font-black ${tone.text}`}>{count} câu</span><span className="mt-1 block text-xl font-black">{title}</span><span className="mt-2 block font-semibold text-slate-500">{description}</span></button>)}</div>{best && <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">Kết quả tốt nhất: {best.score}% · {'⭐'.repeat(best.stars)}</p>}</div></section></main>;

  if (screen === 'guide') return <main className="mx-auto max-w-4xl px-4 py-10"><section className={`rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl ${tone.shadow} md:p-10`}><div className="flex items-start gap-4"><span className="text-6xl">{config.mascot}</span><div><p className={`font-black ${tone.text}`}>Nhớ kỹ trước khi làm</p><h1 className="mt-1 text-3xl font-black">{config.guideTitle}</h1></div></div><div className="my-7 grid gap-4 sm:grid-cols-2">{config.guide.map(([icon, title, description], guideIndex) => <div key={title} className={`rounded-3xl p-5 ${guideIndex ? 'bg-amber-50' : tone.pale}`}><p className="font-black">{icon} {title}</p><p className="mt-2 font-semibold text-slate-600">{description}</p></div>)}</div><button onClick={() => setScreen('lesson')} className={`w-full rounded-2xl px-7 py-4 text-lg font-black text-white ${tone.button}`}>Bắt đầu {size} câu →</button></section></main>;

  if (screen === 'result') { const missed = results.filter((result) => !result.correctFirstTry).length; return <main className="mx-auto max-w-4xl px-4 py-10"><section className={`rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl ${tone.shadow} md:p-10`}><div className="text-7xl">{reviewMode ? '💪' : module === 'finalReview' ? '🏆' : '🏅'}</div><p className={`mt-4 font-black tracking-widest ${tone.text}`}>{reviewMode ? 'Hoàn thành lượt ôn lại' : module === 'finalReview' ? 'Hoàn thành chương trình lớp 3' : 'Hoàn thành bài luyện tập'}</p><h1 className="mt-2 text-4xl font-black">{summary.score >= 90 ? module === 'finalReview' ? 'Sẵn sàng lên lớp 4!' : 'Tuyệt vời, bé rất chắc bài!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Mình cùng luyện thêm nhé!'}</h1><div className="mt-6 flex justify-center gap-3 text-5xl">{[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}</div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-sky-50 p-5"><p className="font-black text-sky-700">Điểm số</p><p className="text-3xl font-black">{summary.score}%</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-black text-emerald-700">Đúng lần đầu</p><p className="text-3xl font-black">{summary.correct}/{results.length}</p></div><div className="rounded-2xl bg-amber-50 p-5"><p className="font-black text-amber-700">Sao nhận được</p><p className="text-3xl font-black">{summary.stars}/3</p></div></div><div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left"><h2 className="bg-slate-50 px-5 py-4 text-xl font-black">Kết quả theo kỹ năng</h2>{summary.bySkill.map((skill) => <div key={skill.skillId} className="grid grid-cols-[1fr_auto] gap-3 border-t px-5 py-4"><b>{GRADE3_STAGE6_SKILL_LABELS[skill.skillId]}</b><b>{skill.correct}/{skill.total}</b></div>)}</div><ResultShare score={summary.score} correct={summary.correct} total={results.length} stars={summary.stars} attempts={results} /><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{!reviewMode && missed > 0 && <button onClick={review} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu</button>}<button onClick={() => prepare(size)} className={`rounded-2xl px-6 py-4 font-black text-white ${tone.button}`}>Luyện bộ câu mới</button><a href="/lop-3" className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black">Về lớp 3</a></div></section></main>; }

  const longAnswers = question.answers.some((answer) => String(answer).length > 15);
  return <main className="mx-auto max-w-5xl px-4 py-7"><header className="mb-5 flex items-center justify-between gap-8"><button onClick={() => setScreen('intro')} className="shrink-0 rounded-xl bg-white px-4 py-3 font-black shadow-sm">← Thoát</button><div className="text-right"><p className={`font-black ${tone.text}`}>{reviewMode ? 'Ôn lại · ' : ''}Câu {index + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{GRADE3_STAGE6_SKILL_LABELS[question.skillId]}</p></div></header><div className="mb-6 h-3 overflow-hidden rounded-full bg-white"><div className={`h-full bg-gradient-to-r ${tone.bar}`} style={{ width: `${progress}%` }} /></div><section className={`rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl ${tone.shadow} md:p-9`}><div className="mb-6 flex items-center gap-4"><span className="text-5xl">{index % 2 ? '🐻' : '🐿️'}</span><div><p className={`font-black ${tone.text}`}>{index % 2 ? 'Gấu Mật hỏi' : 'Sóc Nâu hỏi'}</p><h1 className="mt-1 text-2xl font-black md:text-3xl">{question.instruction}</h1></div></div><QuestionVisual question={question} pale={tone.pale} /><div className={`mt-6 grid gap-3 ${longAnswers ? 'sm:grid-cols-2' : question.answers.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>{question.answers.map((answer, answerIndex) => <button key={String(answer)} disabled={canContinue} onClick={() => choose(answer)} className={`relative min-h-20 rounded-2xl border-4 px-3 py-4 text-lg font-black shadow-sm transition md:text-xl ${answerClass(answer)}`}><span className="absolute left-2 top-2 text-xs font-black text-slate-400">{answerIndex + 1}</span>{typeof answer === 'number' ? formatNumber(answer) : answer}{question.answerUnit && typeof answer === 'number' ? ` ${question.answerUnit}` : ''}</button>)}</div>{selected !== null && !canContinue && <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5"><h2 className="text-xl font-black text-orange-700">💡 Chưa đúng, mình kiểm tra lại nhé!</h2><p className="mt-2 font-semibold"><b>Gợi ý {hint}/3:</b> {question.hintSteps[Math.max(0, hint - 1)]}</p><button onClick={() => setSelected(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div>}{canContinue && <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div className="w-full"><h2 className="text-xl font-black text-emerald-700">🎉 Chính xác!</h2><SolutionExplanation steps={question.hintSteps} conclusion={question.explanation} /></div><button onClick={next} className={`w-full shrink-0 rounded-2xl px-6 py-4 font-black text-white sm:w-auto ${tone.button}`}>{index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div></div>}</section></main>;
}
