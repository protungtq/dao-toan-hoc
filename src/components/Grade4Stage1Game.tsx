import { useEffect, useMemo, useState } from 'react';
import ResultShare from './ResultShare';
import SolutionExplanation from './SolutionExplanation';
import { buildAdaptiveQuestionSet } from '../lib/learningProfile';
import { playCorrectSound, playFinalSound, playWrongSound } from '../lib/gameAudio';
import {
  GRADE4_STAGE1_SKILL_LABELS,
  generateGrade4Stage1Questions,
  type Grade4Stage1Answer,
  type Grade4Stage1Module,
  type Grade4Stage1Question,
  type Grade4Stage1SkillId,
} from '../lib/grade4Stage1QuestionGenerator';

type Screen = 'intro' | 'guide' | 'lesson' | 'result';
type PracticeSize = 5 | 10 | 15;
type QuestionResult = { questionId: string; skillId: Grade4Stage1SkillId; attempts: number; correctFirstTry: boolean };
type BestResult = { score: number; stars: number };
type Props = { module: Grade4Stage1Module };

const CONFIG = {
  review: {
    number: 1, lessons: '1–6', title: 'Ôn tập và bổ sung',
    description: 'Ôn số và phép tính đến 100 000, số chẵn – số lẻ, biểu thức chứa chữ và bài toán ba bước.',
    accent: 'orange', mascot: '🐻', mascotName: 'Gấu Mật',
    topics: [['🔢', 'Số đến 100 000'], ['🧮', 'Bốn phép tính'], ['⚖️', 'Chẵn và lẻ'], ['📝', 'Biểu thức chứa chữ'], ['📖', 'Bài toán ba bước']],
    guideTitle: 'Đọc kĩ dữ kiện và giải từng bước',
    tips: [['🧮', 'Tính chính xác', 'Đặt các chữ số cùng hàng thẳng cột trước khi cộng hoặc trừ.'], ['📖', 'Bài toán ba bước', 'Ghi kết quả của từng bước rồi mới dùng cho bước tiếp theo.']],
  },
  angles: {
    number: 2, lessons: '7–9', title: 'Góc và đơn vị đo góc',
    description: 'Làm quen độ, số đo góc và nhận biết góc nhọn, góc vuông, góc tù, góc bẹt.',
    accent: 'cyan', mascot: '🐿️', mascotName: 'Sóc Nâu',
    topics: [['📏', 'Đơn vị độ'], ['📐', 'Đo góc'], ['◿', 'Góc nhọn'], ['∟', 'Góc vuông'], ['↔️', 'Góc tù và góc bẹt']],
    guideTitle: 'So sánh số đo với 90° và 180°',
    tips: [['📐', 'Mốc 90°', 'Góc nhọn bé hơn 90°, góc vuông bằng 90°, góc tù lớn hơn 90°.'], ['↔️', 'Mốc 180°', 'Góc bẹt có hai cạnh tạo thành một đường thẳng và có số đo 180°.']],
  },
  'large-numbers': {
    number: 3, lessons: '10–16', title: 'Số có nhiều chữ số',
    description: 'Đọc, viết, phân tích, làm tròn và so sánh số đến lớp triệu; nhận biết quy luật dãy số tự nhiên.',
    accent: 'indigo', mascot: '🐻', mascotName: 'Gấu Mật',
    topics: [['🔢', 'Lớp triệu'], ['🏗️', 'Giá trị hàng'], ['🎯', 'Làm tròn'], ['⚖️', 'So sánh'], ['➡️', 'Dãy số tự nhiên']],
    guideTitle: 'Tách số thành từng lớp ba chữ số',
    tips: [['🔢', 'Đọc số theo lớp', 'Tách từ phải sang trái thành lớp đơn vị, lớp nghìn và lớp triệu.'], ['🎯', 'Làm tròn', 'Nhìn chữ số ngay bên phải hàng cần làm tròn để quyết định tăng hay giữ nguyên.']],
  },
  measurement: {
    number: 4, lessons: '17–21', title: 'Một số đơn vị đo đại lượng',
    description: 'Luyện yến, tạ, tấn; đơn vị đo diện tích; giây và thế kỉ trong tình huống thực tế.',
    accent: 'rose', mascot: '🐿️', mascotName: 'Sóc Nâu',
    topics: [['⚖️', 'Yến, tạ và tấn'], ['🟦', 'Mi-li-mét vuông'], ['🔳', 'Đề-xi-mét vuông'], ['🏡', 'Mét vuông'], ['⏱️', 'Giây và thế kỉ']],
    guideTitle: 'Đổi về cùng đơn vị trước khi tính',
    tips: [['⚖️', 'Khối lượng', '1 yến = 10 kg; 1 tạ = 100 kg; 1 tấn = 1 000 kg.'], ['🟦', 'Diện tích', 'Hai đơn vị diện tích liền nhau hơn kém nhau 100 lần.']],
  },
  'add-subtract': {
    number: 5, lessons: '22–26', title: 'Phép cộng và phép trừ',
    description: 'Cộng, trừ số có nhiều chữ số; tính thuận tiện và tìm hai số khi biết tổng và hiệu.',
    accent: 'emerald', mascot: '🐻', mascotName: 'Gấu Mật',
    topics: [['➕', 'Cộng số lớn'], ['➖', 'Trừ số lớn'], ['🔁', 'Giao hoán'], ['🧩', 'Kết hợp'], ['📖', 'Tổng và hiệu']],
    guideTitle: 'Đặt tính thẳng hàng, chọn cách tính hợp lí',
    tips: [['🧮', 'Cộng và trừ', 'Viết các chữ số cùng hàng thẳng cột, tính từ phải sang trái.'], ['🧩', 'Tổng và hiệu', 'Số lớn = (tổng + hiệu) : 2; số bé = (tổng − hiệu) : 2.']],
  },
  'lines-shapes': {
    number: 6, lessons: '27–32', title: 'Đường thẳng vuông góc, đường thẳng song song',
    description: 'Nhận biết đường thẳng vuông góc, song song; khám phá hình bình hành và hình thoi.',
    accent: 'sky', mascot: '🐿️', mascotName: 'Sóc Nâu',
    topics: [['⊥', 'Vuông góc'], ['∥', 'Song song'], ['📏', 'Vẽ đường thẳng'], ['▱', 'Hình bình hành'], ['🔷', 'Hình thoi']],
    guideTitle: 'Quan sát góc và các cặp cạnh',
    tips: [['⊥', 'Vuông góc', 'Hai đường vuông góc cắt nhau và tạo thành góc 90°.'], ['∥', 'Song song', 'Hai đường song song không cắt nhau dù được kéo dài.']],
  },
  'semester-1-review': {
    number: 7, lessons: '33–37', title: 'Ôn tập học kỳ I',
    description: 'Ôn tổng hợp số đến lớp triệu, phép cộng và phép trừ, hình học, đo lường và bài toán thực tế.',
    accent: 'fuchsia', mascot: '🐻', mascotName: 'Gấu Mật',
    topics: [['🔢', 'Số đến lớp triệu'], ['➕', 'Cộng và trừ'], ['📐', 'Góc và đường thẳng'], ['⚖️', 'Đo lường'], ['🧩', 'Bài toán tổng hợp']],
    guideTitle: 'Xác định đúng nhóm kiến thức trước khi giải',
    tips: [['🔎', 'Đọc kĩ yêu cầu', 'Gạch chân số liệu, đơn vị và nội dung cần tìm.'], ['✅', 'Kiểm tra kết quả', 'Dùng phép tính ngược, ước lượng hoặc đổi về cùng đơn vị để kiểm tra.']],
  },
  'multiply-divide': {
    number: 8, lessons: '38–48', title: 'Phép nhân và phép chia',
    description: 'Luyện nhân, chia số tự nhiên; tính thuận tiện, ước lượng, trung bình cộng và rút về đơn vị.',
    accent: 'blue', mascot: '🐻', mascotName: 'Gấu Mật',
    topics: [['✖️', 'Nhân số tự nhiên'], ['➗', 'Chia số tự nhiên'], ['🔁', 'Tính chất phép nhân'], ['🎯', 'Ước lượng'], ['📊', 'Trung bình cộng']],
    guideTitle: 'Chọn phép tính và kiểm tra tính hợp lí',
    tips: [['🧮', 'Nhân và chia', 'Tính từ phải sang trái; dùng phép tính ngược để kiểm tra.'], ['📊', 'Trung bình cộng', 'Lấy tổng các số chia cho số các số hạng.']],
  },
  statistics: {
    number: 9, lessons: '49–52', title: 'Thống kê và xác suất',
    description: 'Đọc dãy số liệu, biểu đồ cột và kiểm đếm số lần xuất hiện của một sự kiện.',
    accent: 'teal', mascot: '🐿️', mascotName: 'Sóc Nâu',
    topics: [['🔢', 'Dãy số liệu'], ['📊', 'Biểu đồ cột'], ['🔎', 'Đọc dữ liệu'], ['⚖️', 'So sánh dữ liệu'], ['🎲', 'Số lần xuất hiện']],
    guideTitle: 'Đọc tên, giá trị và đơn vị của dữ liệu',
    tips: [['📊', 'Biểu đồ cột', 'Đọc nhãn dưới cột và số ghi trên đỉnh cột.'], ['🎲', 'Kiểm đếm', 'Đánh dấu từng lần sự kiện xuất hiện để không bị sót.']],
  },
  fractions: {
    number: 10, lessons: '53–59', title: 'Phân số',
    description: 'Nhận biết phân số, phân số bằng nhau, rút gọn, quy đồng và so sánh phân số.',
    accent: 'amber', mascot: '🐻', mascotName: 'Gấu Mật',
    topics: [['🍕', 'Nhận biết phân số'], ['🧩', 'Phân số bằng nhau'], ['✂️', 'Rút gọn'], ['🔄', 'Quy đồng'], ['⚖️', 'So sánh phân số']],
    guideTitle: 'Quan sát tử số và mẫu số',
    tips: [['🍕', 'Đọc phân số', 'Mẫu số chỉ tổng số phần bằng nhau; tử số chỉ số phần được lấy.'], ['✂️', 'Rút gọn', 'Chia cả tử và mẫu cho cùng một số lớn hơn 1.']],
  },
  'fraction-add-subtract': {
    number: 11, lessons: '60–62', title: 'Phép cộng, phép trừ phân số',
    description: 'Cộng, trừ phân số cùng mẫu hoặc khác mẫu; rút gọn kết quả về dạng tối giản.',
    accent: 'violet', mascot: '🐿️', mascotName: 'Sóc Nâu',
    topics: [['➕', 'Cộng cùng mẫu'], ['🔄', 'Cộng khác mẫu'], ['➖', 'Trừ cùng mẫu'], ['🧩', 'Trừ khác mẫu'], ['✂️', 'Rút gọn kết quả']],
    guideTitle: 'Quy đồng mẫu số trước khi cộng hoặc trừ',
    tips: [['📍', 'Cùng mẫu', 'Giữ nguyên mẫu số, cộng hoặc trừ hai tử số.'], ['🔄', 'Khác mẫu', 'Quy đồng để hai phân số cùng mẫu rồi mới tính.']],
  },
  'fraction-multiply-divide': {
    number: 12, lessons: '63–66', title: 'Phép nhân, phép chia phân số',
    description: 'Nhân, chia phân số và tìm phân số của một số trong những tình huống gần gũi.',
    accent: 'pink', mascot: '🐻', mascotName: 'Gấu Mật',
    topics: [['✖️', 'Nhân phân số'], ['🎯', 'Rút gọn tích'], ['➗', 'Chia phân số'], ['🔁', 'Phân số đảo ngược'], ['🍊', 'Phân số của một số']],
    guideTitle: 'Nhớ quy tắc nhân và phân số đảo ngược',
    tips: [['✖️', 'Phép nhân', 'Nhân tử với tử, mẫu với mẫu rồi rút gọn.'], ['➗', 'Phép chia', 'Giữ nguyên phân số thứ nhất và nhân với phân số đảo ngược của phân số thứ hai.']],
  },
  'final-review': {
    number: 13, lessons: '67–73', title: 'Ôn tập cuối năm',
    description: 'Ôn tổng hợp số tự nhiên, các phép tính, phân số, hình học, đo lường, thống kê và xác suất.',
    accent: 'red', mascot: '🐻', mascotName: 'Gấu Mật',
    topics: [['🔢', 'Số tự nhiên'], ['🧮', 'Bốn phép tính'], ['🍕', 'Phân số'], ['📐', 'Hình học và đo lường'], ['📊', 'Dữ liệu và xác suất']],
    guideTitle: 'Nhận dạng kiến thức, lập kế hoạch rồi kiểm tra',
    tips: [['🧠', 'Chọn cách giải', 'Đọc kĩ câu hỏi, xác định dạng toán và các dữ kiện cần dùng.'], ['✅', 'Tự kiểm tra', 'Ước lượng, dùng phép tính ngược hoặc thay kết quả vào đề bài.']],
  },
} as const;

const ACCENTS = {
  orange: { text: 'text-orange-700', button: 'bg-orange-600 hover:bg-orange-700', bar: 'from-orange-400 to-amber-500', shadow: 'shadow-orange-100', selected: 'border-orange-400 bg-orange-50', tone: 'bg-orange-50 text-orange-900' },
  cyan: { text: 'text-cyan-700', button: 'bg-cyan-600 hover:bg-cyan-700', bar: 'from-cyan-400 to-blue-600', shadow: 'shadow-cyan-100', selected: 'border-cyan-400 bg-cyan-50', tone: 'bg-cyan-50 text-cyan-900' },
  indigo: { text: 'text-indigo-700', button: 'bg-indigo-600 hover:bg-indigo-700', bar: 'from-indigo-400 to-violet-600', shadow: 'shadow-indigo-100', selected: 'border-indigo-400 bg-indigo-50', tone: 'bg-indigo-50 text-indigo-900' },
  rose: { text: 'text-rose-700', button: 'bg-rose-600 hover:bg-rose-700', bar: 'from-rose-400 to-pink-600', shadow: 'shadow-rose-100', selected: 'border-rose-400 bg-rose-50', tone: 'bg-rose-50 text-rose-900' },
  emerald: { text: 'text-emerald-700', button: 'bg-emerald-600 hover:bg-emerald-700', bar: 'from-emerald-400 to-teal-600', shadow: 'shadow-emerald-100', selected: 'border-emerald-400 bg-emerald-50', tone: 'bg-emerald-50 text-emerald-900' },
  sky: { text: 'text-sky-700', button: 'bg-sky-600 hover:bg-sky-700', bar: 'from-sky-400 to-cyan-600', shadow: 'shadow-sky-100', selected: 'border-sky-400 bg-sky-50', tone: 'bg-sky-50 text-sky-900' },
  fuchsia: { text: 'text-fuchsia-700', button: 'bg-fuchsia-600 hover:bg-fuchsia-700', bar: 'from-fuchsia-500 to-purple-600', shadow: 'shadow-fuchsia-100', selected: 'border-fuchsia-400 bg-fuchsia-50', tone: 'bg-fuchsia-50 text-fuchsia-900' },
  blue: { text: 'text-blue-700', button: 'bg-blue-600 hover:bg-blue-700', bar: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-100', selected: 'border-blue-400 bg-blue-50', tone: 'bg-blue-50 text-blue-900' },
  teal: { text: 'text-teal-700', button: 'bg-teal-600 hover:bg-teal-700', bar: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-100', selected: 'border-teal-400 bg-teal-50', tone: 'bg-teal-50 text-teal-900' },
  amber: { text: 'text-amber-700', button: 'bg-amber-600 hover:bg-amber-700', bar: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-100', selected: 'border-amber-400 bg-amber-50', tone: 'bg-amber-50 text-amber-950' },
  violet: { text: 'text-violet-700', button: 'bg-violet-600 hover:bg-violet-700', bar: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-100', selected: 'border-violet-400 bg-violet-50', tone: 'bg-violet-50 text-violet-950' },
  pink: { text: 'text-pink-700', button: 'bg-pink-600 hover:bg-pink-700', bar: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-100', selected: 'border-pink-400 bg-pink-50', tone: 'bg-pink-50 text-pink-950' },
  red: { text: 'text-red-700', button: 'bg-red-600 hover:bg-red-700', bar: 'from-red-500 to-orange-500', shadow: 'shadow-red-100', selected: 'border-red-400 bg-red-50', tone: 'bg-red-50 text-red-950' },
} as const;

function starsFor(score: number) {
  return score >= 90 ? 3 : score >= 70 ? 2 : 1;
}

function formatAnswer(answer: Grade4Stage1Answer) {
  return typeof answer === 'number' ? new Intl.NumberFormat('vi-VN').format(answer) : answer;
}

function QuestionVisual({ question, accent }: { question: Grade4Stage1Question; accent: keyof typeof ACCENTS }) {
  const tone = ACCENTS[accent].tone;

  if (question.type === 'expression') return (
    <div className={`grid min-h-64 place-items-center rounded-3xl p-6 ${tone}`}>
      <div className="text-center">{question.caption && <p className="mb-4 text-base font-black opacity-70">{question.caption}</p>}<p className="break-words text-4xl font-black tracking-tight sm:text-6xl">{question.expression}</p></div>
    </div>
  );

  if (question.type === 'number') return (
    <div className={`grid min-h-64 place-items-center rounded-3xl p-6 ${tone}`}>
      <div className="text-center"><p className="text-sm font-black uppercase tracking-widest opacity-60">{question.caption}</p><p className="mt-5 text-5xl font-black tracking-tight sm:text-7xl">{formatAnswer(question.number)}</p></div>
    </div>
  );

  if (question.type === 'compare') return <div className={`grid min-h-64 grid-cols-[1fr_auto_1fr] place-items-center gap-3 rounded-3xl p-5 text-3xl font-black sm:text-6xl ${tone}`}><span>{formatAnswer(question.left)}</span><span className="text-amber-500">?</span><span>{formatAnswer(question.right)}</span></div>;

  if (question.type === 'angle') {
    const radians = (question.degrees * Math.PI) / 180;
    const endX = 160 + 105 * Math.cos(radians);
    const endY = 125 - 105 * Math.sin(radians);
    const labelX = 160 + 58 * Math.cos(radians / 2);
    const labelY = 125 - 58 * Math.sin(radians / 2);
    return <div className={`rounded-3xl p-5 ${tone}`}><svg viewBox="0 0 320 230" className="mx-auto h-64 w-full max-w-xl" role="img" aria-label={`Góc ${question.degrees} độ`}><circle cx="160" cy="125" r="7" fill="currentColor" /><line x1="160" y1="125" x2="275" y2="125" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /><line x1="160" y1="125" x2={endX} y2={endY} stroke="currentColor" strokeWidth="8" strokeLinecap="round" /><path d={`M 205 125 A 45 45 0 0 0 ${160 + 45 * Math.cos(radians)} ${125 - 45 * Math.sin(radians)}`} fill="none" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />{question.showDegrees && <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" className="fill-amber-600 text-2xl font-black">{question.degrees}°</text>}</svg></div>;
  }

  if (question.type === 'sequence') return <div className={`flex min-h-64 flex-wrap content-center justify-center gap-3 rounded-3xl p-6 ${tone}`}>{question.values.map((value, index) => <div key={`${value}-${index}`} className={`grid min-h-20 min-w-28 place-items-center rounded-2xl border-4 px-4 text-2xl font-black shadow-sm ${value === '?' ? 'border-amber-400 bg-amber-100 text-amber-800' : 'border-white bg-white/85'}`}>{typeof value === 'number' ? formatAnswer(value) : value}</div>)}</div>;

  if (question.type === 'bar-chart') {
    const maxValue = Math.max(...question.values);
    return <div className={`rounded-3xl p-5 ${tone}`}><p className="text-center text-lg font-black">{question.chartTitle}</p><div className="mx-auto mt-5 flex h-56 max-w-2xl items-end justify-around gap-3 border-b-4 border-l-4 border-current px-4 pt-4">{question.values.map((value, index) => <div key={question.labels[index]} className="flex h-full flex-1 flex-col items-center justify-end"><span className="mb-1 font-black">{value}</span><div className="w-full max-w-20 rounded-t-xl bg-gradient-to-t from-teal-600 to-emerald-400 shadow-md" style={{ height: `${Math.max(18, (value / maxValue) * 78)}%` }}></div><span className="mt-2 whitespace-nowrap text-xs font-black sm:text-sm">{question.labels[index]}</span></div>)}</div></div>;
  }

  if (question.type === 'fraction') return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 ${tone}`}><div className="w-full max-w-2xl text-center"><p className="mb-5 font-black opacity-70">{question.caption}</p><div className="grid overflow-hidden rounded-2xl border-4 border-current bg-white" style={{ gridTemplateColumns: `repeat(${question.denominator}, minmax(0, 1fr))` }}>{Array.from({ length: question.denominator }, (_, index) => <span key={index} className={`h-24 border-r-2 border-current last:border-r-0 sm:h-32 ${index < question.numerator ? 'bg-amber-400' : 'bg-white'}`}></span>)}</div></div></div>;

  if (question.type === 'diagram') {
    const common = { stroke: 'currentColor', strokeWidth: 8, strokeLinecap: 'round' as const };
    return <div className={`rounded-3xl p-5 ${tone}`}><svg viewBox="0 0 420 250" className="mx-auto h-64 w-full max-w-2xl" role="img" aria-label="Hình minh họa hình học">
      {question.diagram === 'perpendicular' && <><line x1="55" y1="130" x2="365" y2="130" {...common} /><line x1="210" y1="35" x2="210" y2="220" {...common} /><path d="M210 130 L210 100 L240 100 L240 130" fill="none" stroke="#f59e0b" strokeWidth="5" /><text x="350" y="115" className="fill-current text-xl font-black">a</text><text x="225" y="48" className="fill-current text-xl font-black">b</text><text x="188" y="155" className="fill-current text-xl font-black">O</text></>}
      {question.diagram === 'parallel' && <><line x1="55" y1="85" x2="365" y2="85" {...common} /><line x1="55" y1="175" x2="365" y2="175" {...common} /><path d="M190 73 l20 12 l-20 12 M220 73 l20 12 l-20 12" fill="none" stroke="#f59e0b" strokeWidth="5" /><path d="M190 163 l20 12 l-20 12 M220 163 l20 12 l-20 12" fill="none" stroke="#f59e0b" strokeWidth="5" /><text x="350" y="70" className="fill-current text-xl font-black">m</text><text x="350" y="160" className="fill-current text-xl font-black">n</text></>}
      {question.diagram === 'parallelogram' && <><polygon points="105,190 165,55 330,55 270,190" fill="#38bdf8" fillOpacity="0.3" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" /><text x="82" y="213" className="fill-current text-xl font-black">A</text><text x="150" y="43" className="fill-current text-xl font-black">B</text><text x="332" y="43" className="fill-current text-xl font-black">C</text><text x="276" y="213" className="fill-current text-xl font-black">D</text></>}
      {question.diagram === 'rhombus' && <><polygon points="210,30 345,125 210,220 75,125" fill="#f59e0b" fillOpacity="0.25" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" /><line x1="142" y1="77" x2="153" y2="92" stroke="#f59e0b" strokeWidth="5" /><line x1="268" y1="92" x2="279" y2="77" stroke="#f59e0b" strokeWidth="5" /><line x1="142" y1="173" x2="153" y2="158" stroke="#f59e0b" strokeWidth="5" /><line x1="268" y1="158" x2="279" y2="173" stroke="#f59e0b" strokeWidth="5" /></>}
    </svg></div>;
  }

  return <div className={`grid min-h-64 place-items-center rounded-3xl p-6 text-center ${tone}`}><div><div className="text-7xl">{question.icon}</div><p className="mt-4 text-2xl font-black">{question.visualTitle}</p><div className="mt-3 space-y-1">{question.visualLines.map((line) => <p key={line} className="text-lg font-bold opacity-75">{line}</p>)}</div></div></div>;
}

export default function Grade4Stage1Game({ module }: Props) {
  const config = CONFIG[module];
  const accentClasses = ACCENTS[config.accent];
  const storageKey = `trang-toan:lop-4:${module}:best-v1`;
  const [screen, setScreen] = useState<Screen>('intro');
  const [size, setSize] = useState<PracticeSize>(10);
  const [questions, setQuestions] = useState<Grade4Stage1Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Grade4Stage1Answer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(0);
  const [canContinue, setCanContinue] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [best, setBest] = useState<BestResult | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    setQuestions(generateGrade4Stage1Questions(module, 10));
    const saved = localStorage.getItem(storageKey);
    if (saved) try { setBest(JSON.parse(saved)); } catch { localStorage.removeItem(storageKey); }
  }, [module, storageKey]);

  const question = questions[index];
  const progress = questions.length ? ((index + 1) / questions.length) * 100 : 0;
  const summary = useMemo(() => {
    const correct = results.filter((result) => result.correctFirstTry).length;
    const score = results.length ? Math.round((correct / results.length) * 100) : 0;
    const bySkill = [...new Set(results.map((result) => result.skillId))].map((skillId) => {
      const skillResults = results.filter((result) => result.skillId === skillId);
      return { skillId, total: skillResults.length, correct: skillResults.filter((result) => result.correctFirstTry).length };
    });
    return { correct, score, stars: starsFor(score), bySkill };
  }, [results]);

  function resetQuestionState() { setSelected(null); setAttempts(0); setHint(0); setCanContinue(false); }

  function prepare(nextSize: PracticeSize) {
    setSize(nextSize);
    setQuestions(buildAdaptiveQuestionSet(() => generateGrade4Stage1Questions(module, nextSize), nextSize));
    setIndex(0); setResults([]); setReviewMode(false); resetQuestionState(); setScreen('guide');
  }

  function choose(answer: Grade4Stage1Answer) {
    if (!question || canContinue) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts); setSelected(answer);
    if (answer === question.correctAnswer) {
      playCorrectSound(); setCanContinue(true);
      setResults((current) => [...current, { questionId: question.id, skillId: question.skillId, attempts: nextAttempts, correctFirstTry: nextAttempts === 1 }]);
    } else {
      playWrongSound(); setHint(Math.min(nextAttempts, 3));
    }
  }

  function nextQuestion() {
    if (index < questions.length - 1) { setIndex((current) => current + 1); resetQuestionState(); return; }
    if (!reviewMode) {
      const correct = results.filter((result) => result.correctFirstTry).length;
      const score = Math.round((correct / questions.length) * 100);
      const saved = { score, stars: starsFor(score) };
      if (!best || score > best.score) { localStorage.setItem(storageKey, JSON.stringify(saved)); setBest(saved); }
    }
    playFinalSound(); setScreen('result');
  }

  function reviewMistakes() {
    const missedIds = new Set(results.filter((result) => !result.correctFirstTry).map((result) => result.questionId));
    const missedQuestions = questions.filter((item) => missedIds.has(item.id));
    if (!missedQuestions.length) return;
    setQuestions(missedQuestions); setIndex(0); setResults([]); setReviewMode(true); resetQuestionState(); setScreen('lesson');
  }

  function answerClass(answer: Grade4Stage1Answer) {
    if (selected === answer && answer !== question.correctAnswer) return 'border-red-400 bg-red-50 text-red-700';
    if (canContinue && answer === question.correctAnswer) return 'border-emerald-400 bg-emerald-50 text-emerald-700';
    return 'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-amber-300 hover:bg-amber-50';
  }

  if (!questions.length) return <main className="grid min-h-screen place-items-center"><div className="text-center"><div className="text-7xl">{config.mascot}</div><p className={`mt-4 text-xl font-black ${accentClasses.text}`}>Đang chuẩn bị bài luyện...</p></div></main>;

  if (screen === 'intro') return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-12"><a href="/lop-4" className="inline-flex rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-sm">← Lớp 4</a><section className={`mt-6 overflow-hidden rounded-[2.5rem] border-4 border-white bg-white shadow-2xl ${accentClasses.shadow}`}><div className={`bg-gradient-to-br ${accentClasses.bar} p-8 text-white md:p-12`}><p className="font-black tracking-widest text-white/75">Mục {config.number} · Bài {config.lessons}</p><h1 className="mt-2 text-3xl font-black md:text-5xl">{config.title}</h1><p className="mt-4 max-w-3xl text-lg font-semibold leading-8 text-white/90">{config.description}</p></div><div className="p-6 md:p-10"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{config.topics.map(([icon, label]) => <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center"><div className="text-3xl">{icon}</div><p className="mt-2 font-black text-slate-700">{label}</p></div>)}</div><h2 className="mt-8 text-xl font-black">Chọn lượt luyện tập</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{([[5, 'Luyện nhanh', 'Khởi động đủ nhóm kiến thức'], [10, 'Luyện chuẩn', 'Cân bằng kiến thức và vận dụng'], [15, 'Thử thách', 'Nhiều biến thể và bài toán hơn']] as const).map(([count, title, description]) => <button key={count} onClick={() => prepare(count)} className={`rounded-3xl border-4 p-5 text-left transition hover:-translate-y-1 ${count === 10 ? `${accentClasses.selected} shadow-lg` : 'border-slate-100 bg-white hover:border-amber-300'}`}><span className={`text-sm font-black ${accentClasses.text}`}>{count} câu</span><span className="mt-1 block text-xl font-black">{title}</span><span className="mt-2 block font-semibold text-slate-500">{description}</span></button>)}</div>{best && <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 font-bold text-amber-800">Kết quả tốt nhất: {best.score}% · {'⭐'.repeat(best.stars)}</p>}</div></section></main>
  );

  if (screen === 'guide') return (
    <main className="mx-auto max-w-4xl px-4 py-10"><section className={`rounded-[2.5rem] border-4 border-white bg-white p-7 shadow-2xl ${accentClasses.shadow} md:p-10`}><div className="flex items-start gap-4"><span className="text-6xl">{config.mascot}</span><div><p className={`font-black ${accentClasses.text}`}>{config.mascotName} nhắc bé</p><h1 className="mt-1 text-3xl font-black">{config.guideTitle}</h1></div></div><div className="my-7 grid gap-4 sm:grid-cols-2">{config.tips.map(([icon, title, description], tipIndex) => <div key={title} className={`rounded-3xl p-5 ${tipIndex ? 'bg-amber-50' : accentClasses.tone}`}><p className="font-black">{icon} {title}</p><p className="mt-2 font-semibold text-slate-600">{description}</p></div>)}</div><button onClick={() => setScreen('lesson')} className={`w-full rounded-2xl px-7 py-4 text-lg font-black text-white ${accentClasses.button}`}>Bắt đầu {size} câu</button></section></main>
  );

  if (screen === 'result') {
    const missed = results.filter((result) => !result.correctFirstTry).length;
    return <main className="mx-auto max-w-4xl px-4 py-10"><section className={`rounded-[2.5rem] border-4 border-white bg-white p-7 text-center shadow-2xl ${accentClasses.shadow} md:p-10`}><div className="text-7xl">{reviewMode ? '💪' : '🏅'}</div><p className={`mt-4 font-black tracking-widest ${accentClasses.text}`}>{reviewMode ? 'Hoàn thành lượt ôn lại' : 'Hoàn thành bài luyện tập'}</p><h1 className="mt-2 text-4xl font-black">{summary.score >= 90 ? 'Tuyệt vời, bé rất chắc bài!' : summary.score >= 70 ? 'Hoàn thành tốt!' : 'Mình cùng luyện thêm nhé!'}</h1><div className="mt-6 flex justify-center gap-3 text-5xl">{[1, 2, 3].map((star) => <span key={star} className={star <= summary.stars ? '' : 'grayscale opacity-20'}>⭐</span>)}</div><div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-sky-50 p-5"><p className="font-black text-sky-700">Điểm số</p><p className="text-3xl font-black">{summary.score}%</p></div><div className="rounded-2xl bg-emerald-50 p-5"><p className="font-black text-emerald-700">Đúng lần đầu</p><p className="text-3xl font-black">{summary.correct}/{results.length}</p></div><div className="rounded-2xl bg-amber-50 p-5"><p className="font-black text-amber-700">Sao nhận được</p><p className="text-3xl font-black">{summary.stars}/3</p></div></div><div className="mt-7 overflow-hidden rounded-3xl border-2 border-slate-100 text-left"><h2 className="bg-slate-50 px-5 py-4 text-xl font-black">Kết quả theo kỹ năng</h2>{summary.bySkill.map((skill) => <div key={skill.skillId} className="grid grid-cols-[1fr_auto] gap-3 border-t px-5 py-4"><b>{GRADE4_STAGE1_SKILL_LABELS[skill.skillId]}</b><b>{skill.correct}/{skill.total}</b></div>)}</div><ResultShare score={summary.score} correct={summary.correct} total={results.length} stars={summary.stars} attempts={results} /><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{!reviewMode && missed > 0 && <button onClick={reviewMistakes} className="rounded-2xl bg-orange-500 px-6 py-4 font-black text-white">Ôn lại {missed} câu</button>}<button onClick={() => prepare(size)} className={`rounded-2xl px-6 py-4 font-black text-white ${accentClasses.button}`}>Luyện bộ câu mới</button><a href="/lop-4" className="rounded-2xl border-2 border-slate-200 px-6 py-4 font-black">Về lớp 4</a></div></section></main>;
  }

  const longAnswers = question.answers.some((answer) => String(answer).length > 12);
  return (
    <main className="mx-auto max-w-5xl px-4 py-7"><header className="mb-5 flex items-center justify-between gap-8"><button onClick={() => setScreen('intro')} className="shrink-0 rounded-xl bg-white px-4 py-3 font-black shadow-sm">← Thoát</button><div className="text-right"><p className={`font-black ${accentClasses.text}`}>{reviewMode ? 'Ôn lại · ' : ''}Câu {index + 1}/{questions.length}</p><p className="text-sm font-bold text-slate-500">{GRADE4_STAGE1_SKILL_LABELS[question.skillId]}</p></div></header><div className="mb-6 h-3 overflow-hidden rounded-full bg-white"><div className={`h-full bg-gradient-to-r ${accentClasses.bar}`} style={{ width: `${progress}%` }} /></div><section className={`rounded-[2.5rem] border-4 border-white bg-white p-5 shadow-2xl ${accentClasses.shadow} md:p-9`}><div className="mb-6 flex items-center gap-4"><span className="text-5xl">{index % 2 ? '🐿️' : '🐻'}</span><div><p className={`font-black ${accentClasses.text}`}>{index % 2 ? 'Sóc Nâu hỏi' : 'Gấu Mật hỏi'}</p><h1 className="mt-1 text-2xl font-black md:text-3xl">{question.instruction}</h1></div></div><QuestionVisual question={question} accent={config.accent} /><div className={`mt-6 grid gap-3 ${longAnswers ? 'sm:grid-cols-2' : question.answers.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>{question.answers.map((answer) => <button key={String(answer)} disabled={canContinue} onClick={() => choose(answer)} className={`min-h-20 rounded-2xl border-4 px-3 py-4 text-lg font-black shadow-sm transition sm:text-xl ${answerClass(answer)}`}>{formatAnswer(answer)}</button>)}</div>{selected !== null && !canContinue && <div className="mt-6 rounded-3xl border-2 border-orange-200 bg-orange-50 p-5"><h2 className="text-xl font-black text-orange-700">💡 Chưa đúng, mình xem lại nhé!</h2><p className="mt-2 font-semibold"><b>Gợi ý {hint}/3:</b> {question.hintSteps[Math.max(0, hint - 1)]}</p><button onClick={() => setSelected(null)} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Chọn lại đáp án</button></div>}{canContinue && <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-5"><div className="flex flex-col items-center justify-between gap-4 sm:flex-row"><div><h2 className="text-xl font-black text-emerald-700">🎉 Chính xác!</h2><SolutionExplanation steps={question.hintSteps} conclusion={question.explanation} /></div><button onClick={nextQuestion} className={`w-full rounded-2xl px-6 py-4 font-black text-white sm:w-auto ${accentClasses.button}`}>{index === questions.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div></div>}</section></main>
  );
}
