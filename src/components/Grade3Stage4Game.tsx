import { useEffect, useMemo, useState } from 'react';
import ResultShare from './ResultShare';
import { buildAdaptiveQuestionSet } from '../lib/learningProfile';
import { playCorrectSound, playFinalSound, playWrongSound } from '../lib/gameAudio';
import {
  GRADE3_STAGE4_SKILL_LABELS,
  generateGrade3Stage4Questions,
  type Grade3Stage4Answer,
  type Grade3Stage4Module,
  type Grade3Stage4Question,
  type Grade3Stage4SkillId,
} from '../lib/grade3Stage4QuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = { questionId: string; skillId: Grade3Stage4SkillId; attempts: number; correctFirstTry: boolean };
type Props = { module: Grade3Stage4Module };

const CONFIG = {
  numbers10000: {
    number: 8,
    lessons: '45–49',
    title: 'Các số đến 10 000',
    mascot: '🐿️',
    accent: 'sky',
    description: 'Đọc, viết, cấu tạo và so sánh số có bốn chữ số; chữ số La Mã và làm tròn số.',
    topics: [['🔢', 'Số có bốn chữ số'], ['⚖️', 'So sánh số'], ['🏛️', 'Chữ số La Mã'], ['🎯', 'Làm tròn số']],
    guideTitle: 'Đọc theo hàng, so từ trái sang phải',
    guide: [['🧱', 'Giá trị theo hàng', 'Đọc và phân tích theo thứ tự nghìn, trăm, chục, đơn vị.'], ['🎯', 'Làm tròn', 'So số cần làm tròn với điểm giữa của hai số tròn liền nhau.']],
  },
  perimeterArea: {
    number: 9,
    lessons: '50–53',
    title: 'Chu vi, diện tích một số hình phẳng',
    mascot: '🐻',
    accent: 'green',
    description: 'Tính chu vi hình quen thuộc, đếm ô vuông và tính diện tích hình chữ nhật, hình vuông.',
    topics: [['🔲', 'Chu vi'], ['🟩', 'Ô vuông đơn vị'], ['📐', 'Diện tích chữ nhật'], ['🟨', 'Diện tích hình vuông']],
    guideTitle: 'Phân biệt đường bao và phần mặt',
    guide: [['🔲', 'Chu vi', 'Cộng độ dài tất cả các cạnh bao quanh hình.'], ['🟩', 'Diện tích', 'Đếm ô vuông hoặc lấy chiều dài nhân chiều rộng.']],
  },
  arithmetic10000: {
    number: 10,
    lessons: '54–58',
    title: 'Cộng, trừ, nhân, chia trong phạm vi 10 000',
    mascot: '🐿️',
    accent: 'blue',
    description: 'Luyện cộng, trừ đến 10 000 và nhân, chia số có bốn chữ số với số có một chữ số.',
    topics: [['➕', 'Phép cộng'], ['➖', 'Phép trừ'], ['✖️', 'Phép nhân'], ['➗', 'Phép chia']],
    guideTitle: 'Đặt đúng cột, tính đúng từng hàng',
    guide: [['🧮', 'Cộng và trừ', 'Viết các chữ số cùng hàng thẳng cột, tính từ hàng đơn vị.'], ['✖️', 'Nhân và chia', 'Nhân từ phải sang trái; chia lần lượt từ hàng nghìn.']],
  },
} as const;

const TONES = {
  sky: { text: 'text-sky-700', button: 'bg-sky-600 hover:bg-sky-700', bar: 'from-sky-500 to-cyan-600', pale: 'bg-sky-50 text-sky-950', shadow: 'shadow-sky-100', selected: 'border-sky-400 bg-sky-50' },
  green: { text: 'text-green-700', button: 'bg-green-600 hover:bg-green-700', bar: 'from-lime-500 to-green-600', pale: 'bg-lime-50 text-green-950', shadow: 'shadow-green-100', selected: 'border-green-400 bg-green-50' },
  blue: { text: 'text-blue-700', button: 'bg-blue-600 hover:bg-blue-700', bar: 'from-blue-500 to-indigo-600', pale: 'bg-blue-50 text-blue-950', shadow: 'shadow-blue-100', selected: 'border-blue-400 bg-blue-50' },
} as const;

const starsFor = (score: number) => score >= 90 ? 3 : score >= 70 ? 2 : 1;
const formatAnswer = (answer: Grade3Stage4Answer) => typeof answer === 'number' ? answer.toLocaleString('vi-VN') : answer;

function PlaceValueCard({ value, highlight }: { value: number; highlight?: 'thousands' | 'hundreds' | 'tens' | 'ones' }) {
  if (value === 10000) return <div className="rounded-3xl bg-white px-10 py-7 text-center shadow-sm"><p className="text-sm font-black uppercase tracking-[0.18em] text-sky-600">Mười nghìn</p><p className="mt-2 text-6xl font-black tracking-wider">10 000</p></div>;
  const digits = String(value).padStart(4, '0').split('');
  const places = [
    ['thousands', 'Nghìn'],
    ['hundreds', 'Trăm'],
    ['tens', 'Chục'],
    ['ones', 'Đơn vị'],
  ] as const;
  return <div className="grid w-full max-w-2xl grid-cols-4 gap-2 sm:gap-4">{places.map(([key, label], index) => <div key={key} className={`overflow-hidden rounded-2xl border-4 text-center shadow-sm ${highlight === key ? 'border-amber-400 bg-amber-50' : 'border-white bg-white'}`}><p className={`px-1 py-2 text-xs font-black sm:text-sm ${highlight === key ? 'bg-amber-400 text-amber-950' : 'bg-sky-100 text-sky-800'}`}>{label}</p><p className="py-4 text-4xl font-black sm:text-6xl">{digits[index]}</p></div>)}</div>;
}

function ShapeVisual({ question }: { question: Extract<Grade3Stage4Question, { type: 'shape' }> }) {
  const label = (x: number, y: number, value: number) => <text x={x} y={y} textAnchor="middle" fontSize="22" fontWeight="900" fill="#334155">{value} cm</text>;
  if (question.shape === 'triangle') return <svg viewBox="0 0 500 300" className="w-full max-w-xl" role="img" aria-label={`Tam giác có các cạnh ${question.sides.join(', ')} xăng-ti-mét`}><polygon points="250,35 70,245 430,245" fill="#fde68a" stroke="#d97706" strokeWidth="8" strokeLinejoin="round" />{label(145, 130, question.sides[0])}{label(355, 130, question.sides[1])}{label(250, 280, question.sides[2])}</svg>;
  if (question.shape === 'quadrilateral') return <svg viewBox="0 0 500 300" className="w-full max-w-xl" role="img" aria-label={`Tứ giác có các cạnh ${question.sides.join(', ')} xăng-ti-mét`}><polygon points="105,55 405,40 440,235 65,245" fill="#bfdbfe" stroke="#2563eb" strokeWidth="8" strokeLinejoin="round" />{label(250, 28, question.sides[0])}{label(465, 145, question.sides[1])}{label(250, 282, question.sides[2])}{label(35, 150, question.sides[3])}</svg>;
  const width = question.width ?? question.sides[0];
  const height = question.height ?? question.sides[1];
  const square = question.shape === 'square';
  return <svg viewBox="0 0 500 300" className="w-full max-w-xl" role="img" aria-label={`Hình ${square ? 'vuông' : 'chữ nhật'} dài ${width} xăng-ti-mét, rộng ${height} xăng-ti-mét`}><rect x={square ? 135 : 75} y="45" width={square ? 230 : 350} height="200" rx="4" fill={square ? '#fef08a' : '#bbf7d0'} stroke={square ? '#ca8a04' : '#059669'} strokeWidth="8" />{label(250, 30, width)}{label(square ? 395 : 460, 150, height)}{question.task === 'area' && <text x="250" y="160" textAnchor="middle" fontSize="26" fontWeight="900" fill="#475569">S = ? cm²</text>}</svg>;
}

function QuestionVisual({ question, tone }: { question: Grade3Stage4Question; tone: (typeof TONES)[keyof typeof TONES] }) {
  if (question.type === 'number-card') return <div className={`grid min-h-64 place-items-center rounded-3xl p-5 ${tone.pale}`}><PlaceValueCard value={question.value} highlight={question.highlightPlace} />{question.expanded && <p className="mt-5 text-center text-xl font-black opacity-75">Phân tích theo giá trị từng hàng</p>}</div>;

  if (question.type === 'comparison') return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 ${tone.pale}`}>{question.mode === 'symbol' ? <div className="flex items-center justify-center gap-4 text-4xl font-black sm:gap-8 sm:text-6xl"><span>{question.values[0].toLocaleString('vi-VN')}</span><span className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-dashed border-sky-400 bg-white text-sky-500">?</span><span>{question.values[1].toLocaleString('vi-VN')}</span></div> : <div className="flex flex-wrap justify-center gap-3">{question.values.map((value) => <span key={value} className="rounded-2xl bg-white px-5 py-4 text-2xl font-black shadow-sm">{value.toLocaleString('vi-VN')}</span>)}</div>}</div>;

  if (question.type === 'roman') return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 ${tone.pale}`}><div className="text-center"><div className="mx-auto flex h-44 w-64 items-center justify-center rounded-[2rem] border-8 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-100 shadow-xl"><span className="font-serif text-7xl font-black tracking-widest text-amber-950">{question.askFor === 'arabic' ? question.roman : question.arabic}</span></div><p className="mt-5 font-black opacity-65">I = 1 · V = 5 · X = 10</p></div></div>;

  if (question.type === 'number-line') {
    const range = question.upper - question.lower;
    const marker = 60 + (question.value - question.lower) / range * 600;
    return <div className={`grid min-h-64 place-items-center rounded-3xl p-4 ${tone.pale}`}><svg viewBox="0 0 720 235" className="w-full max-w-3xl" role="img" aria-label={`Số ${question.value} nằm giữa ${question.lower} và ${question.upper}`}><line x1="60" y1="135" x2="660" y2="135" stroke="#334155" strokeWidth="8" strokeLinecap="round" /><line x1="60" y1="100" x2="60" y2="165" stroke="#334155" strokeWidth="6" /><line x1="360" y1="105" x2="360" y2="165" stroke="#f59e0b" strokeWidth="6" /><line x1="660" y1="100" x2="660" y2="165" stroke="#334155" strokeWidth="6" /><circle cx={marker} cy="135" r="15" fill="#0284c7" /><path d={`M${marker} 70 L${marker - 14} 93 L${marker + 14} 93 Z`} fill="#0284c7" /><text x={marker} y="55" textAnchor="middle" fontSize="26" fontWeight="900" fill="#0369a1">{question.value.toLocaleString('vi-VN')}</text><text x="60" y="205" textAnchor="middle" fontSize="22" fontWeight="900">{question.lower.toLocaleString('vi-VN')}</text><text x="360" y="205" textAnchor="middle" fontSize="22" fontWeight="900" fill="#b45309">{question.midpoint.toLocaleString('vi-VN')}</text><text x="660" y="205" textAnchor="middle" fontSize="22" fontWeight="900">{question.upper.toLocaleString('vi-VN')}</text></svg></div>;
  }

  if (question.type === 'shape') return <div className={`grid min-h-72 place-items-center rounded-3xl p-5 ${tone.pale}`}><ShapeVisual question={question} /></div>;

  if (question.type === 'area-grid') {
    const cell = Math.min(55, 280 / question.rows, 440 / question.columns);
    const width = cell * question.columns;
    const height = cell * question.rows;
    const startX = (520 - width) / 2;
    const startY = (330 - height) / 2;
    return <div className={`grid min-h-72 place-items-center rounded-3xl p-5 ${tone.pale}`}><svg viewBox="0 0 520 330" className="w-full max-w-xl" role="img" aria-label={`Hình gồm ${question.rows} hàng và ${question.columns} cột ô vuông đơn vị`}>{Array.from({ length: question.rows * question.columns }).map((_, index) => { const row = Math.floor(index / question.columns); const column = index % question.columns; return <rect key={index} x={startX + column * cell} y={startY + row * cell} width={cell} height={cell} fill={(row + column) % 2 ? '#86efac' : '#bbf7d0'} stroke="#15803d" strokeWidth="2" />; })}<text x="260" y="315" textAnchor="middle" fontSize="20" fontWeight="900" fill="#166534">Mỗi ô có diện tích 1 cm²</text></svg></div>;
  }

  const symbols = { add: '+', subtract: '−', multiply: '×', divide: ':' } as const;
  if (question.operation === 'divide') return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 ${tone.pale}`}><div className="text-center"><p className="text-sm font-black uppercase tracking-[0.16em] opacity-60">Tính thương</p><p className="mt-6 text-4xl font-black sm:text-6xl">{question.left.toLocaleString('vi-VN')} : {question.right} = ?</p></div></div>;
  return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 ${tone.pale}`}><div className="grid grid-cols-[3rem_10rem] text-right text-4xl font-black leading-tight sm:text-5xl"><span /><span>{question.left.toLocaleString('vi-VN')}</span><span className={tone.text}>{symbols[question.operation]}</span><span>{question.right.toLocaleString('vi-VN')}</span><span className="col-span-2 mt-2 border-t-4 border-slate-700 pt-3">?</span></div></div>;
}

export default function Grade3Stage4Game({ module }: Props) {
  const config = CONFIG[module];
  const tone = TONES[config.accent];
  const storageKey = `trang-toan:lop-3:${module}:best-v1`;
  const [screen, setScreen] = useState<Screen>('intro');
  const [size, setSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<Grade3Stage4Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Grade3Stage4Answer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [best, setBest] = useState<{ score: number; stars: number } | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateGrade3Stage4Questions(module, 10));
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

  function prepare(nextSize: PracticeSize) {
    setSize(nextSize);
    setQuestions(buildAdaptiveQuestionSet(() => generateGrade3Stage4Questions(module, nextSize), nextSize));
    setIndex(0);
    setResults([]);
    setReviewMode(false);
    resetAnswer();
    setScreen('guide');
  }

  function choose(answer: Grade3Stage4Answer) {
    if (!question || canContinue) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setSelected(answer);
    if (answer === question.correctAnswer) {
      playCorrectSound();
      setCanContinue(true);
      setResults((current) => [...current, { questionId: question.id, skillId: question.skillId, attempts: nextAttempts, correctFirstTry: nextAttempts === 1 }]);
    } else {
      playWrongSound();
      setHint(Math.min(nextAttempts, 3));
    }
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex((value) => value + 1);
      resetAnswer();
      return;
    }
    if (!reviewMode) {
      const correct = results.filter((result) => result.correctFirstTry).length;
      const score = Math.round(correct / questions.length * 100);
      const saved = { score, stars: starsFor(score) };
      if (!best || score > best.score) {
        localStorage.setItem(storageKey, JSON.stringify(saved));
        setBest(saved);
      }
    }
    playFinalSound();
    setScreen('result');
  }

  function review() {
    const missedIds = new Set(results.filter((result) => !result.correctFirstTry).map((result) => result.questionId));
    const missed = questions.filter((item) => missedIds.has(item.id));
    if (!missed.length) return;
    setQuestions(missed);
    setIndex(0);
    setResults([]);
    setReviewMode(true);
    resetAnswer();
    setScreen('lesson');
  }

  function answerClass(answer: Grade3Stage4Answer) {
    if (selected === answer && answer !== question.correctAnswer) return 'border-red-400 bg-red-50 text-red-700';
    if (canContinue && answer === question.correctAnswer) return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-amber-300 hover:bg-amber-50';
  }

  if (!questions.length) return <main className="grid min-h-screen place-items-center"><div className="text-center"><div className="text-7xl">{config.mascot}</div><p className={`mt-4 text-xl font-black ${tone.text}`}>Đang chuẩn bị bài luyện...</p></div></main>;

  if (screen === 'intro') return <main className="mx-auto max-w-5xl px-4 py-8 md:py-12"><a href="/lop-3" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 3</a><section className={`mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl ${tone.shadow}`}><div className={`bg-gradient-to-br ${tone.bar} p-8 text-white md:p-12`}><p className="font-black tracking-widest text-white/75">Mục {config.number} · Bài {config.lessons}</p><h1 className="mt-2 text-3xl font-black md:text-5xl">{config.title}</h1><p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">{config.description}</p></div><div className="p-6 md:p-10"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{config.topics.map(([icon, label]) => <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-3xl">{icon}</div><p className="mt-2 font-black text-slate-700">{label}</p></div>)}</div><h2 className="mt-8 text-xl font-black">Chọn lượt luyện tập</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{([[5, 'Luyện nhanh', 'Bao quát các kỹ năng chính'], [10, 'Luyện chuẩn', 'Cân bằng nhận biết và vận dụng'], [15, 'Thử thách', 'Nhiều dạng câu và số liệu hơn']] as const).map(([count, title, description]) => <button key={count} onClick={() => prepare(count)} className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${count === 10 ? `${tone.selected} shadow-lg` : 'border-slate-100 bg-white hover:border-amber-300'}`}><span className={`text-sm font-black ${tone.text}`}>{count} câu</span><span className="mt-1 block text-xl font-black">{title}</span><span className="mt-2 block font-semibold text-slate-500">{description}</span></button>)}</div>{best && <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">Kết quả tốt nhất: {best.score}% · {'⭐'.repeat(best.stars)}</p>}</div></section></main>;

  if (screen === 'guide') return <main className="mx-auto max-w-4xl px-4 py-10"><section className={`rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl ${tone.shadow} md:p-10`}><div className="flex items-start gap-4"><span className="text-6xl">{config.mascot}</span><div><p className={`font-black ${tone.text}`}>Nhớ kỹ trước khi làm</p><h1 className="mt-1 text-3xl font-black">{config.guideTitle}</h1></div></div><div className="my-7 grid gap-4 sm:grid-cols-2">{config.guide.map(([icon, title, description], guideIndex) => <div key={title} className={`rounded-3xl p-5 ${guideIndex ? 'bg-amber-50' : tone.pale}`}><p className="font-black">{icon} {title}</p><p className="mt-2 font-semibold text-slate-600">{description}</p></div>)}</div><button onClick={() => setScreen('lesson')} className={`w-full rounded-2xl px-7 py-4 text-lg font-black text-white ${tone.button}`}>Bắt đầu {size} câu</button></section></main>;

  if (screen === 'result') {
    const missed = results.filter((result) => !result.correctFirstTry).length;
    return <main className="mx-auto max-w-4xl px-4 py-10"><section className={`rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl ${tone.shadow} md:p-10`}><div className="text-7xl">{reviewMode ? '💪' : '🏅'}</div><p className={`mt-4 font-black tracking-widest ${tone.text}`}>{reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành bài luyện tập'}</p><h1 className="mt-2 text-4xl font-black">{summary.score >= 90 ? 'Nắm bài rất chắc!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Mình cùng luyện thêm nhé!'}</h1><div className="mt-6 flex justify-center gap-3 text-5xl">{[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}</div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-sky-50 p-5"><p className="font-black text-sky-700">Điểm số</p><p className="text-3xl font-black">{summary.score}%</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-black text-emerald-700">Đúng lần đầu</p><p className="text-3xl font-black">{summary.correct}/{results.length}</p></div><div className="rounded-2xl bg-amber-50 p-5"><p className="font-black text-amber-700">Sao nhận được</p><p className="text-3xl font-black">{summary.stars}/3</p></div></div><div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left"><h2 className="bg-slate-50 px-5 py-4 text-xl font-black">Kết quả theo kỹ năng</h2>{summary.bySkill.map((skill) => <div key={skill.skillId} className="grid grid-cols-[1fr_auto] gap-3 border-t px-5 py-4"><b>{GRADE3_STAGE4_SKILL_LABELS[skill.skillId]}</b><b>{skill.correct}/{skill.total}</b></div>)}</div><ResultShare score={summary.score} correct={summary.correct} total={results.length} stars={summary.stars} attempts={results} /><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{!reviewMode && missed > 0 && <button onClick={review} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu</button>}<button onClick={() => prepare(size)} className={`rounded-2xl px-6 py-4 font-black text-white ${tone.button}`}>Luyện bộ câu mới</button><a href="/lop-3" className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black">Về lớp 3</a></div></section></main>;
  }

  const longAnswers = question.answers.some((answer) => String(answer).length > 16);
  const unit = question.type === 'shape' ? (question.task === 'area' ? 'cm²' : 'cm') : question.type === 'area-grid' ? 'cm²' : '';
  return <main className="mx-auto max-w-5xl px-4 py-7"><header className="mb-5 flex items-center justify-between gap-8"><button onClick={() => setScreen('intro')} className="shrink-0 rounded-xl bg-white px-4 py-3 font-black shadow-sm">← Thoát</button><div className="text-right"><p className={`font-black ${tone.text}`}>{reviewMode ? 'Ôn lại · ' : ''}Câu {index + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{GRADE3_STAGE4_SKILL_LABELS[question.skillId]}</p></div></header><div className="mb-6 h-3 overflow-hidden rounded-full bg-white"><div className={`h-full bg-gradient-to-r ${tone.bar}`} style={{ width: `${progress}%` }} /></div><section className={`rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl ${tone.shadow} md:p-9`}><div className="mb-6 flex items-center gap-4"><span className="text-5xl">{index % 2 ? '🐻' : '🐿️'}</span><div><p className={`font-black ${tone.text}`}>{index % 2 ? 'Gấu Mật hỏi' : 'Sóc Nâu hỏi'}</p><h1 className="mt-1 text-2xl font-black md:text-3xl">{question.instruction}</h1></div></div><QuestionVisual question={question} tone={tone} /><div className={`mt-6 grid gap-3 ${longAnswers ? 'sm:grid-cols-2' : question.answers.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>{question.answers.map((answer) => <button key={String(answer)} disabled={canContinue} onClick={() => choose(answer)} className={`min-h-20 rounded-2xl border-4 px-3 py-4 text-lg font-black shadow-sm transition md:text-xl ${answerClass(answer)}`}>{formatAnswer(answer)}{unit && typeof answer === 'number' ? ` ${unit}` : ''}</button>)}</div>{selected !== null && !canContinue && <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5"><h2 className="text-xl font-black text-orange-700">💡 Chưa đúng, mình kiểm tra lại nhé!</h2><p className="mt-2 font-semibold"><b>Gợi ý {hint}/3:</b> {question.hintSteps[Math.max(0, hint - 1)]}</p><button onClick={() => setSelected(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div>}{canContinue && <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div><h2 className="text-xl font-black text-emerald-700">🎉 Chính xác!</h2><p className="mt-1 font-semibold">{question.explanation}</p></div><button onClick={next} className={`w-full rounded-2xl px-6 py-4 font-black text-white sm:w-auto ${tone.button}`}>{index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div></div>}</section></main>;
}
