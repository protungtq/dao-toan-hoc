import { useEffect, useMemo, useState } from 'react';
import ResultShare from './ResultShare';
import SolutionExplanation from './SolutionExplanation';
import { buildAdaptiveQuestionSet } from '../lib/learningProfile';
import { playCorrectSound, playFinalSound, playWrongSound } from '../lib/gameAudio';
import {
  GRADE3_STAGE5_SKILL_LABELS,
  generateGrade3Stage5Questions,
  type Grade3Stage5Answer,
  type Grade3Stage5Module,
  type Grade3Stage5Question,
  type Grade3Stage5SkillId,
} from '../lib/grade3Stage5QuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = { questionId: string; skillId: Grade3Stage5SkillId; attempts: number; correctFirstTry: boolean };
type Props = { module: Grade3Stage5Module };

const CONFIG = {
  numbers100000: {
    number: 11, lessons: '59–62', title: 'Các số đến 100 000', mascot: '🐻', accent: 'teal',
    description: 'Đọc, viết, phân tích và so sánh số có năm chữ số; làm tròn đến hàng nghìn, chục nghìn.',
    topics: [['🔢', 'Số có năm chữ số'], ['🧱', 'Giá trị theo hàng'], ['⚖️', 'So sánh số'], ['🎯', 'Làm tròn số']],
    guideTitle: 'Đọc đúng năm hàng, so sánh từ bên trái',
    guide: [['🔢', 'Năm hàng', 'Đọc theo thứ tự chục nghìn, nghìn, trăm, chục, đơn vị.'], ['🎯', 'Làm tròn', 'So số đã cho với điểm giữa của hai số tròn liền nhau.']],
  },
  addSubtract100000: {
    number: 12, lessons: '63–65', title: 'Phép cộng, phép trừ trong phạm vi 100 000', mascot: '🐿️', accent: 'purple',
    description: 'Luyện đặt tính, tính viết và giải bài toán cộng trừ trong phạm vi 100 000.',
    topics: [['➕', 'Phép cộng'], ['➖', 'Phép trừ'], ['🧮', 'Đặt tính'], ['📖', 'Bài toán thực tế']],
    guideTitle: 'Viết thẳng cột, kiểm tra bằng phép tính ngược',
    guide: [['🧮', 'Đặt tính', 'Các chữ số cùng hàng phải nằm thẳng cột.'], ['🔍', 'Kiểm tra', 'Kiểm tra phép cộng bằng phép trừ và phép trừ bằng phép cộng.']],
  },
  timeMoney: {
    number: 13, lessons: '66–69', title: 'Đồng hồ, tháng – năm và tiền Việt Nam', mascot: '🐻', accent: 'amber',
    description: 'Xem giờ đến phút, đọc lịch tháng – năm và giải tình huống với tiền Việt Nam.',
    topics: [['🕰️', 'Xem đồng hồ'], ['⏱️', 'Khoảng thời gian'], ['📅', 'Xem lịch'], ['💵', 'Tiền Việt Nam']],
    guideTitle: 'Quan sát đúng kim, đúng cột và đúng mệnh giá',
    guide: [['🕰️', 'Đọc giờ', 'Kim ngắn chỉ giờ; kim dài chỉ phút, mỗi vạch nhỏ là một phút.'], ['💵', 'Tính tiền', 'Cộng các mệnh giá; tiền thừa bằng tiền trả trừ giá món đồ.']],
  },
} as const;

const TONES = {
  teal: { text: 'text-teal-700', button: 'bg-teal-600 hover:bg-teal-700', bar: 'from-teal-500 to-emerald-600', pale: 'bg-teal-50 text-teal-950', shadow: 'shadow-teal-100', selected: 'border-teal-400 bg-teal-50' },
  purple: { text: 'text-purple-700', button: 'bg-purple-600 hover:bg-purple-700', bar: 'from-purple-500 to-indigo-600', pale: 'bg-purple-50 text-purple-950', shadow: 'shadow-purple-100', selected: 'border-purple-400 bg-purple-50' },
  amber: { text: 'text-amber-700', button: 'bg-amber-500 hover:bg-amber-600', bar: 'from-amber-400 to-orange-500', pale: 'bg-amber-50 text-amber-950', shadow: 'shadow-amber-100', selected: 'border-amber-400 bg-amber-50' },
} as const;

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;
const starsFor = (score: number) => score >= 90 ? 3 : score >= 70 ? 2 : 1;
const formatNumber = (value: number) => value.toLocaleString('vi-VN');

function PlaceValueCard({ question }: { question: Extract<Grade3Stage5Question, { type: 'number-card' }> }) {
  if (question.value === 100000) return <div className="rounded-3xl bg-white px-10 py-7 text-center shadow-sm"><p className="text-sm font-black uppercase tracking-[0.18em] text-teal-600">Một trăm nghìn</p><p className="mt-2 text-5xl font-black tracking-wider sm:text-6xl">100 000</p></div>;
  const digits = String(question.value).padStart(5, '0').split('');
  const places = [['ten-thousands', 'Chục nghìn'], ['thousands', 'Nghìn'], ['hundreds', 'Trăm'], ['tens', 'Chục'], ['ones', 'Đơn vị']] as const;
  return <div className="grid w-full max-w-3xl grid-cols-5 gap-1.5 sm:gap-3">{places.map(([key, label], index) => <div key={key} className={`overflow-hidden rounded-xl border-4 text-center shadow-sm sm:rounded-2xl ${question.highlightPlace === key ? 'border-amber-400 bg-amber-50' : 'border-white bg-white'}`}><p className={`flex min-h-11 items-center justify-center px-1 py-1 text-[10px] font-black leading-tight sm:text-sm ${question.highlightPlace === key ? 'bg-amber-400 text-amber-950' : 'bg-teal-100 text-teal-800'}`}>{label}</p><p className="py-4 text-3xl font-black sm:text-5xl">{digits[index]}</p></div>)}</div>;
}

function ClockFace({ hour, minute }: { hour: number; minute: number }) {
  const minuteAngle = minute / 60 * Math.PI * 2 - Math.PI / 2;
  const hourAngle = ((hour % 12) + minute / 60) / 12 * Math.PI * 2 - Math.PI / 2;
  const minuteX = 160 + Math.cos(minuteAngle) * 100;
  const minuteY = 160 + Math.sin(minuteAngle) * 100;
  const hourX = 160 + Math.cos(hourAngle) * 67;
  const hourY = 160 + Math.sin(hourAngle) * 67;
  return <svg viewBox="0 0 320 320" className="h-72 w-72 max-w-full" role="img" aria-label="Mặt đồng hồ kim"><circle cx="160" cy="160" r="142" fill="white" stroke="#f59e0b" strokeWidth="9" />{Array.from({ length: 60 }).map((_, index) => { const angle = index / 60 * Math.PI * 2 - Math.PI / 2; const major = index % 5 === 0; const x1 = 160 + Math.cos(angle) * (major ? 119 : 128); const y1 = 160 + Math.sin(angle) * (major ? 119 : 128); const x2 = 160 + Math.cos(angle) * 136; const y2 = 160 + Math.sin(angle) * 136; return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#78350f" strokeWidth={major ? 4 : 1.5} />; })}{Array.from({ length: 12 }).map((_, index) => { const number = index + 1; const angle = number / 12 * Math.PI * 2 - Math.PI / 2; return <text key={number} x={160 + Math.cos(angle) * 99} y={167 + Math.sin(angle) * 99} textAnchor="middle" fontSize="21" fontWeight="900" fill="#451a03">{number}</text>; })}<line x1="160" y1="160" x2={hourX} y2={hourY} stroke="#0f172a" strokeWidth="11" strokeLinecap="round" /><line x1="160" y1="160" x2={minuteX} y2={minuteY} stroke="#ea580c" strokeWidth="7" strokeLinecap="round" /><circle cx="160" cy="160" r="12" fill="#7c2d12" /></svg>;
}

function CalendarVisual({ question }: { question: Extract<Grade3Stage5Question, { type: 'calendar' }> }) {
  const cells = [...Array(question.startWeekday).fill(null), ...Array.from({ length: question.daysInMonth }, (_, index) => index + 1)];
  return <div className="w-full max-w-xl overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg"><div className="bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-4 text-center text-2xl font-black text-white">Tháng {question.month} · {question.year}</div><div className="grid grid-cols-7 bg-slate-100 text-center">{WEEKDAYS.map((day) => <div key={day} className={`py-3 text-sm font-black ${day === 'CN' ? 'text-rose-600' : 'text-slate-600'}`}>{day}</div>)}</div><div className="grid grid-cols-7 p-2">{cells.map((day, index) => <div key={index} className={`grid aspect-square place-items-center rounded-xl text-sm font-black sm:text-lg ${day === question.highlightedDay ? 'bg-amber-400 text-amber-950 ring-4 ring-amber-200' : day ? index % 7 === 6 ? 'text-rose-600' : 'text-slate-700' : ''}`}>{day}</div>)}</div></div>;
}

function MoneyVisual({ question }: { question: Extract<Grade3Stage5Question, { type: 'money' }> }) {
  const colors = ['from-sky-200 to-cyan-300', 'from-emerald-200 to-green-300', 'from-amber-200 to-yellow-300', 'from-rose-200 to-pink-300'];
  return <div className="w-full max-w-3xl text-center"><div className="flex flex-wrap justify-center gap-3">{question.bills.map((bill, index) => <div key={`${bill}-${index}`} className={`relative grid h-24 w-44 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br shadow-md ${colors[index % colors.length]}`}><span className="absolute left-3 top-2 text-xl opacity-60">🌸</span><span className="font-black text-slate-800">{formatNumber(bill)} đồng</span><span className="absolute bottom-1 right-3 text-[10px] font-black text-slate-600">TIỀN VIỆT NAM</span></div>)}</div>{question.mode === 'change' && <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-lg font-black"><span className="rounded-xl bg-white px-4 py-3">Giá: {formatNumber(question.price ?? 0)} đồng</span><span>→</span><span className="rounded-xl bg-white px-4 py-3">Tiền thừa: ?</span></div>}</div>;
}

function QuestionVisual({ question, tone }: { question: Grade3Stage5Question; tone: (typeof TONES)[keyof typeof TONES] }) {
  if (question.type === 'number-card') return <div className={`grid min-h-64 place-items-center rounded-3xl p-4 ${tone.pale}`}><PlaceValueCard question={question} /></div>;
  if (question.type === 'comparison') return <div className={`grid min-h-64 place-items-center rounded-3xl p-5 ${tone.pale}`}>{question.mode === 'symbol' ? <div className="flex items-center justify-center gap-3 text-3xl font-black sm:gap-7 sm:text-5xl"><span>{formatNumber(question.values[0])}</span><span className="grid h-16 w-16 place-items-center rounded-2xl border-4 border-dashed border-teal-400 bg-white text-teal-500 sm:h-20 sm:w-20">?</span><span>{formatNumber(question.values[1])}</span></div> : <div className="flex flex-wrap justify-center gap-3">{question.values.map((value) => <span key={value} className="rounded-2xl bg-white px-4 py-4 text-xl font-black shadow-sm sm:text-2xl">{formatNumber(value)}</span>)}</div>}</div>;
  if (question.type === 'number-line') { const marker = 60 + (question.value - question.lower) / (question.upper - question.lower) * 600; return <div className={`grid min-h-64 place-items-center rounded-3xl p-4 ${tone.pale}`}><svg viewBox="0 0 720 235" className="w-full max-w-3xl"><line x1="60" y1="135" x2="660" y2="135" stroke="#334155" strokeWidth="8" strokeLinecap="round" /><line x1="60" y1="100" x2="60" y2="165" stroke="#334155" strokeWidth="6" /><line x1="360" y1="105" x2="360" y2="165" stroke="#f59e0b" strokeWidth="6" /><line x1="660" y1="100" x2="660" y2="165" stroke="#334155" strokeWidth="6" /><circle cx={marker} cy="135" r="15" fill="#0d9488" /><text x={marker} y="62" textAnchor="middle" fontSize="25" fontWeight="900" fill="#0f766e">{formatNumber(question.value)}</text>{[[60, question.lower], [360, question.midpoint], [660, question.upper]].map(([x, value]) => <text key={x} x={x} y="205" textAnchor="middle" fontSize="21" fontWeight="900">{formatNumber(value)}</text>)}</svg></div>; }
  if (question.type === 'calculation') return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 ${tone.pale}`}><div className="grid grid-cols-[3rem_12rem] text-right text-4xl font-black leading-tight sm:text-5xl"><span /><span>{formatNumber(question.left)}</span><span className={tone.text}>{question.operation === 'add' ? '+' : '−'}</span><span>{formatNumber(question.right)}</span><span className="col-span-2 mt-2 border-t-4 border-slate-700 pt-3">?</span></div></div>;
  if (question.type === 'context') return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 text-center ${tone.pale}`}><div><div className="text-8xl">{question.icon}</div><p className="mt-4 text-2xl font-black">{question.visualTitle}</p><p className="mt-2 text-lg font-bold opacity-75">{question.visualText}</p></div></div>;
  if (question.type === 'time') return <div className={`grid min-h-72 place-items-center rounded-3xl p-5 ${tone.pale}`}>{question.mode === 'read' ? <ClockFace hour={question.hour} minute={question.minute} /> : <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-5 sm:flex-row"><div className="rounded-3xl bg-white p-6 text-center shadow-md"><p className="text-sm font-black text-slate-500">Bắt đầu</p><p className="mt-2 text-3xl font-black">{question.hour}:{String(question.minute).padStart(2, '0')}</p></div><div className="text-center"><p className="text-4xl">⏱️</p><p className="mt-1 font-black text-amber-700">+ {question.duration} phút</p></div><div className="rounded-3xl border-4 border-dashed border-amber-400 bg-white p-6 text-center"><p className="text-sm font-black text-slate-500">Kết thúc</p><p className="mt-2 text-3xl font-black">?:??</p></div></div>}</div>;
  if (question.type === 'calendar') return <div className={`grid min-h-72 place-items-center rounded-3xl p-4 ${tone.pale}`}><CalendarVisual question={question} /></div>;
  return <div className={`grid min-h-72 place-items-center rounded-3xl p-5 ${tone.pale}`}><MoneyVisual question={question} /></div>;
}

export default function Grade3Stage5Game({ module }: Props) {
  const config = CONFIG[module];
  const tone = TONES[config.accent];
  const storageKey = `trang-toan:lop-3:${module}:best-v1`;
  const [screen, setScreen] = useState<Screen>('intro');
  const [size, setSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<Grade3Stage5Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Grade3Stage5Answer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [best, setBest] = useState<{ score: number; stars: number } | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => { setQuestions(generateGrade3Stage5Questions(module, 10)); const saved = localStorage.getItem(storageKey); if (saved) try { setBest(JSON.parse(saved)); } catch { localStorage.removeItem(storageKey); } }, [module, storageKey]);
  const question = questions[index];
  const progress = questions.length ? (index + 1) / questions.length * 100 : 0;
  const summary = useMemo(() => { const correct = results.filter((result) => result.correctFirstTry).length; const score = results.length ? Math.round(correct / results.length * 100) : 0; const bySkill = [...new Set(results.map((result) => result.skillId))].map((skillId) => { const list = results.filter((result) => result.skillId === skillId); return { skillId, total: list.length, correct: list.filter((result) => result.correctFirstTry).length }; }); return { correct, score, stars: starsFor(score), bySkill }; }, [results]);
  const resetAnswer = () => { setSelected(null); setAttempts(0); setHint(0); setCanContinue(false); };
  function prepare(nextSize: PracticeSize) { setSize(nextSize); setQuestions(buildAdaptiveQuestionSet(() => generateGrade3Stage5Questions(module, nextSize), nextSize)); setIndex(0); setResults([]); setReviewMode(false); resetAnswer(); setScreen('guide'); }
  function choose(answer: Grade3Stage5Answer) { if (!question || canContinue) return; const nextAttempts = attempts + 1; setAttempts(nextAttempts); setSelected(answer); if (answer === question.correctAnswer) { playCorrectSound(); setCanContinue(true); setResults((current) => [...current, { questionId: question.id, skillId: question.skillId, attempts: nextAttempts, correctFirstTry: nextAttempts === 1 }]); } else { playWrongSound(); setHint(Math.min(nextAttempts, 3)); } }
  function next() { if (index < questions.length - 1) { setIndex((value) => value + 1); resetAnswer(); return; } if (!reviewMode) { const correct = results.filter((result) => result.correctFirstTry).length; const score = Math.round(correct / questions.length * 100); const saved = { score, stars: starsFor(score) }; if (!best || score > best.score) { localStorage.setItem(storageKey, JSON.stringify(saved)); setBest(saved); } } playFinalSound(); setScreen('result'); }
  function review() { const missedIds = new Set(results.filter((result) => !result.correctFirstTry).map((result) => result.questionId)); const missed = questions.filter((item) => missedIds.has(item.id)); if (!missed.length) return; setQuestions(missed); setIndex(0); setResults([]); setReviewMode(true); resetAnswer(); setScreen('lesson'); }
  function answerClass(answer: Grade3Stage5Answer) { if (selected === answer && answer !== question.correctAnswer) return 'border-red-400 bg-red-50 text-red-700'; if (canContinue && answer === question.correctAnswer) return 'border-emerald-400 bg-emerald-50 text-emerald-700'; return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-amber-300 hover:bg-amber-50'; }

  if (!questions.length) return <main className="grid min-h-screen place-items-center"><div className="text-center"><div className="text-7xl">{config.mascot}</div><p className={`mt-4 text-xl font-black ${tone.text}`}>Đang chuẩn bị bài luyện...</p></div></main>;
  if (screen === 'intro') return <main className="mx-auto max-w-5xl px-4 py-8 md:py-12"><a href="/lop-3" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 3</a><section className={`mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl ${tone.shadow}`}><div className={`bg-gradient-to-br ${tone.bar} p-8 text-white md:p-12`}><p className="font-black tracking-widest text-white/75">Mục {config.number} · Bài {config.lessons}</p><h1 className="mt-2 text-3xl font-black md:text-5xl">{config.title}</h1><p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">{config.description}</p></div><div className="p-6 md:p-10"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{config.topics.map(([icon, label]) => <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-3xl">{icon}</div><p className="mt-2 font-black text-slate-700">{label}</p></div>)}</div><h2 className="mt-8 text-xl font-black">Chọn lượt luyện tập</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{([[5, 'Luyện nhanh', 'Bao quát các kỹ năng chính'], [10, 'Luyện chuẩn', 'Cân bằng tính toán và vận dụng'], [15, 'Thử thách', 'Nhiều số liệu và tình huống hơn']] as const).map(([count, title, description]) => <button key={count} onClick={() => prepare(count)} className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${count === 10 ? `${tone.selected} shadow-lg` : 'border-slate-100 bg-white hover:border-amber-300'}`}><span className={`text-sm font-black ${tone.text}`}>{count} câu</span><span className="mt-1 block text-xl font-black">{title}</span><span className="mt-2 block font-semibold text-slate-500">{description}</span></button>)}</div>{best && <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">Kết quả tốt nhất: {best.score}% · {'⭐'.repeat(best.stars)}</p>}</div></section></main>;
  if (screen === 'guide') return <main className="mx-auto max-w-4xl px-4 py-10"><section className={`rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl ${tone.shadow} md:p-10`}><div className="flex items-start gap-4"><span className="text-6xl">{config.mascot}</span><div><p className={`font-black ${tone.text}`}>Nhớ kỹ trước khi làm</p><h1 className="mt-1 text-3xl font-black">{config.guideTitle}</h1></div></div><div className="my-7 grid gap-4 sm:grid-cols-2">{config.guide.map(([icon, title, description], guideIndex) => <div key={title} className={`rounded-3xl p-5 ${guideIndex ? 'bg-amber-50' : tone.pale}`}><p className="font-black">{icon} {title}</p><p className="mt-2 font-semibold text-slate-600">{description}</p></div>)}</div><button onClick={() => setScreen('lesson')} className={`w-full rounded-2xl px-7 py-4 text-lg font-black text-white ${tone.button}`}>Bắt đầu {size} câu</button></section></main>;
  if (screen === 'result') { const missed = results.filter((result) => !result.correctFirstTry).length; return <main className="mx-auto max-w-4xl px-4 py-10"><section className={`rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl ${tone.shadow} md:p-10`}><div className="text-7xl">{reviewMode ? '💪' : '🏅'}</div><p className={`mt-4 font-black tracking-widest ${tone.text}`}>{reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành bài luyện tập'}</p><h1 className="mt-2 text-4xl font-black">{summary.score >= 90 ? 'Vận dụng rất chính xác!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Mình cùng luyện thêm nhé!'}</h1><div className="mt-6 flex justify-center gap-3 text-5xl">{[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}</div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-sky-50 p-5"><p className="font-black text-sky-700">Điểm số</p><p className="text-3xl font-black">{summary.score}%</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-black text-emerald-700">Đúng lần đầu</p><p className="text-3xl font-black">{summary.correct}/{results.length}</p></div><div className="rounded-2xl bg-amber-50 p-5"><p className="font-black text-amber-700">Sao nhận được</p><p className="text-3xl font-black">{summary.stars}/3</p></div></div><div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left"><h2 className="bg-slate-50 px-5 py-4 text-xl font-black">Kết quả theo kỹ năng</h2>{summary.bySkill.map((skill) => <div key={skill.skillId} className="grid grid-cols-[1fr_auto] gap-3 border-t px-5 py-4"><b>{GRADE3_STAGE5_SKILL_LABELS[skill.skillId]}</b><b>{skill.correct}/{skill.total}</b></div>)}</div><ResultShare score={summary.score} correct={summary.correct} total={results.length} stars={summary.stars} attempts={results} /><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{!reviewMode && missed > 0 && <button onClick={review} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu</button>}<button onClick={() => prepare(size)} className={`rounded-2xl px-6 py-4 font-black text-white ${tone.button}`}>Luyện bộ câu mới</button><a href="/lop-3" className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black">Về lớp 3</a></div></section></main>; }
  const longAnswers = question.answers.some((answer) => String(answer).length > 17);
  return <main className="mx-auto max-w-5xl px-4 py-7"><header className="mb-5 flex items-center justify-between gap-8"><button onClick={() => setScreen('intro')} className="shrink-0 rounded-xl bg-white px-4 py-3 font-black shadow-sm">← Thoát</button><div className="text-right"><p className={`font-black ${tone.text}`}>{reviewMode ? 'Ôn lại · ' : ''}Câu {index + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{GRADE3_STAGE5_SKILL_LABELS[question.skillId]}</p></div></header><div className="mb-6 h-3 overflow-hidden rounded-full bg-white"><div className={`h-full bg-gradient-to-r ${tone.bar}`} style={{ width: `${progress}%` }} /></div><section className={`rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl ${tone.shadow} md:p-9`}><div className="mb-6 flex items-center gap-4"><span className="text-5xl">{index % 2 ? '🐻' : '🐿️'}</span><div><p className={`font-black ${tone.text}`}>{index % 2 ? 'Gấu Mật hỏi' : 'Sóc Nâu hỏi'}</p><h1 className="mt-1 text-2xl font-black md:text-3xl">{question.instruction}</h1></div></div><QuestionVisual question={question} tone={tone} /><div className={`mt-6 grid gap-3 ${longAnswers ? 'sm:grid-cols-2' : question.answers.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>{question.answers.map((answer) => <button key={String(answer)} disabled={canContinue} onClick={() => choose(answer)} className={`min-h-20 rounded-2xl border-4 px-3 py-4 text-lg font-black shadow-sm transition md:text-xl ${answerClass(answer)}`}>{typeof answer === 'number' ? formatNumber(answer) : answer}{question.answerUnit && typeof answer === 'number' ? ` ${question.answerUnit}` : ''}</button>)}</div>{selected !== null && !canContinue && <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5"><h2 className="text-xl font-black text-orange-700">💡 Chưa đúng, mình kiểm tra lại nhé!</h2><p className="mt-2 font-semibold"><b>Gợi ý {hint}/3:</b> {question.hintSteps[Math.max(0, hint - 1)]}</p><button onClick={() => setSelected(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div>}{canContinue && <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div><h2 className="text-xl font-black text-emerald-700">🎉 Chính xác!</h2><SolutionExplanation steps={question.hintSteps} conclusion={question.explanation} /></div><button onClick={next} className={`w-full rounded-2xl px-6 py-4 font-black text-white sm:w-auto ${tone.button}`}>{index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div></div>}</section></main>;
}
