import QRCode from 'qrcode';
import { createPortal } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';

type WorksheetSize = 5 | 10 | 15;
type PrintableAnswer = string | number;
type PrintableQuestion = {
  type?: string;
  instruction: string;
  answers?: PrintableAnswer[];
  correctAnswer: PrintableAnswer;
  explanation?: string;
  [key: string]: unknown;
};

type Loader = (size: WorksheetSize) => Promise<PrintableQuestion[]>;

const SITE_URL = 'https://trangtoan.so1.asia';

const asQuestions = (value: unknown) => value as PrintableQuestion[];

const LOADERS: Record<string, Loader> = {
  '/luyen-tap/lop-1/cac-so-tu-0-den-10': async (size) => asQuestions((await import('../lib/countingQuestionGenerator')).generateCountingQuestions(size)),
  '/luyen-tap/lop-1/lam-quen-voi-hinh-phang': async (size) => asQuestions((await import('../lib/shapeQuestionGenerator')).generateShapeQuestions(size)),
  '/luyen-tap/lop-1/cong-tru-trong-pham-vi-10': async (size) => asQuestions((await import('../lib/addSubtractQuestionGenerator')).generateArithmeticQuestions(size)),
  '/luyen-tap/lop-1/hinh-khoi-va-vi-tri': async (size) => asQuestions((await import('../lib/solidPositionQuestionGenerator')).generateSolidPositionQuestions(size)),
  '/luyen-tap/lop-1/on-tap-hoc-ky-1': async (size) => asQuestions((await import('../lib/semester1ReviewQuestionGenerator')).generateSemester1ReviewQuestions(size)),
  '/luyen-tap/lop-1/cac-so-den-100': async (size) => asQuestions((await import('../lib/numbersTo100QuestionGenerator')).generateNumbersTo100Questions(size)),
  '/luyen-tap/lop-1/do-dai-va-do-do-dai': async (size) => asQuestions((await import('../lib/lengthQuestionGenerator')).generateLengthQuestions(size)),
  '/luyen-tap/lop-1/cong-tru-trong-pham-vi-100': async (size) => asQuestions((await import('../lib/arithmeticTo100QuestionGenerator')).generateArithmetic100Questions(size)),
  '/luyen-tap/lop-1/thoi-gian-gio-va-lich': async (size) => asQuestions((await import('../lib/timeCalendarQuestionGenerator')).generateTimeQuestions(size)),
  '/luyen-tap/lop-1/on-tap-cuoi-nam': async (size) => asQuestions((await import('../lib/finalReviewQuestionGenerator')).generateFinalReviewQuestions(size)),

  '/luyen-tap/lop-2/on-tap-va-bo-sung': async (size) => asQuestions((await import('../lib/grade2ReviewQuestionGenerator')).generateGrade2ReviewQuestions(size)),
  '/luyen-tap/lop-2/cong-tru-trong-pham-vi-20': async (size) => asQuestions((await import('../lib/addSubtractTo20QuestionGenerator')).generateTo20Questions(size)),
  '/luyen-tap/lop-2/khoi-luong-va-dung-tich': async (size) => asQuestions((await import('../lib/massCapacityQuestionGenerator')).generateMeasureQuestions(size)),
  '/luyen-tap/lop-2/cong-tru-co-nho-trong-pham-vi-100': async (size) => asQuestions((await import('../lib/carryTo100QuestionGenerator')).generateCarryTo100Questions(size)),
  '/luyen-tap/lop-2/diem-duong-va-hinh-phang': async (size) => asQuestions((await import('../lib/flatGeometryQuestionGenerator')).generateFlatGeometryQuestions(size)),
  '/luyen-tap/lop-2/ngay-gio-phut-va-thang': async (size) => asQuestions((await import('../lib/grade2TimeQuestionGenerator')).generateGrade2TimeQuestions(size)),
  '/luyen-tap/lop-2/on-tap-hoc-ky-1': async (size) => asQuestions((await import('../lib/grade2Semester1QuestionGenerator')).generateG2S1Questions(size)),
  '/luyen-tap/lop-2/phep-nhan-va-phep-chia': async (size) => asQuestions((await import('../lib/multiplyDivideQuestionGenerator')).generateMultiplyDivideQuestions(size)),
  '/luyen-tap/lop-2/khoi-tru-va-khoi-cau': async (size) => asQuestions((await import('../lib/solidsQuestionGenerator')).generateSolidsQuestions(size)),
  '/luyen-tap/lop-2/cac-so-trong-pham-vi-1000': async (size) => asQuestions((await import('../lib/numbersTo1000QuestionGenerator')).generateNumbers1000Questions(size)),
  '/luyen-tap/lop-2/do-dai-va-tien-viet-nam': async (size) => asQuestions((await import('../lib/lengthMoneyQuestionGenerator')).generateLengthMoneyQuestions(size)),
  '/luyen-tap/lop-2/cong-tru-trong-pham-vi-1000': async (size) => asQuestions((await import('../lib/arithmeticTo1000QuestionGenerator')).generateArithmetic1000Questions(size)),
  '/luyen-tap/lop-2/thong-ke-va-xac-suat-don-gian': async (size) => asQuestions((await import('../lib/statisticsProbabilityQuestionGenerator')).generateStatisticsQuestions(size)),
  '/luyen-tap/lop-2/on-tap-cuoi-nam': async (size) => asQuestions((await import('../lib/grade2FinalQuestionGenerator')).generateGrade2FinalQuestions(size)),

  '/luyen-tap/lop-3/on-tap-va-bo-sung': async (size) => asQuestions((await import('../lib/grade3Stage1QuestionGenerator')).generateGrade3Stage1Questions('review', size)),
  '/luyen-tap/lop-3/bang-nhan-bang-chia': async (size) => asQuestions((await import('../lib/grade3Stage1QuestionGenerator')).generateGrade3Stage1Questions('tables', size)),
  '/luyen-tap/lop-3/hinh-phang-va-hinh-khoi': async (size) => asQuestions((await import('../lib/grade3Stage2QuestionGenerator')).generateGrade3Stage2Questions('geometry', size)),
  '/luyen-tap/lop-3/nhan-chia-trong-pham-vi-100': async (size) => asQuestions((await import('../lib/grade3Stage2QuestionGenerator')).generateGrade3Stage2Questions('multiply100', size)),
  '/luyen-tap/lop-3/do-luong-va-nhiet-do': async (size) => asQuestions((await import('../lib/grade3Stage2QuestionGenerator')).generateGrade3Stage2Questions('measurement', size)),
  '/luyen-tap/lop-3/nhan-chia-trong-pham-vi-1000': async (size) => asQuestions((await import('../lib/grade3Stage3QuestionGenerator')).generateGrade3Stage3Questions('multiply1000', size)),
  '/luyen-tap/lop-3/on-tap-hoc-ky-1': async (size) => asQuestions((await import('../lib/grade3Stage3QuestionGenerator')).generateGrade3Stage3Questions('semester1', size)),
  '/luyen-tap/lop-3/cac-so-den-10000': async (size) => asQuestions((await import('../lib/grade3Stage4QuestionGenerator')).generateGrade3Stage4Questions('numbers10000', size)),
  '/luyen-tap/lop-3/chu-vi-va-dien-tich': async (size) => asQuestions((await import('../lib/grade3Stage4QuestionGenerator')).generateGrade3Stage4Questions('perimeterArea', size)),
  '/luyen-tap/lop-3/bon-phep-tinh-den-10000': async (size) => asQuestions((await import('../lib/grade3Stage4QuestionGenerator')).generateGrade3Stage4Questions('arithmetic10000', size)),
  '/luyen-tap/lop-3/cac-so-den-100000': async (size) => asQuestions((await import('../lib/grade3Stage5QuestionGenerator')).generateGrade3Stage5Questions('numbers100000', size)),
  '/luyen-tap/lop-3/cong-tru-trong-pham-vi-100000': async (size) => asQuestions((await import('../lib/grade3Stage5QuestionGenerator')).generateGrade3Stage5Questions('addSubtract100000', size)),
  '/luyen-tap/lop-3/dong-ho-thang-nam-va-tien-viet-nam': async (size) => asQuestions((await import('../lib/grade3Stage5QuestionGenerator')).generateGrade3Stage5Questions('timeMoney', size)),
  '/luyen-tap/lop-3/nhan-chia-trong-pham-vi-100000': async (size) => asQuestions((await import('../lib/grade3Stage6QuestionGenerator')).generateGrade3Stage6Questions('multiplyDivide100000', size)),
  '/luyen-tap/lop-3/thong-ke-va-xac-suat-don-gian': async (size) => asQuestions((await import('../lib/grade3Stage6QuestionGenerator')).generateGrade3Stage6Questions('statisticsProbability', size)),
  '/luyen-tap/lop-3/on-tap-cuoi-nam': async (size) => asQuestions((await import('../lib/grade3Stage6QuestionGenerator')).generateGrade3Stage6Questions('finalReview', size)),
};

const GRADE4_MODULES: Record<string, string> = {
  'on-tap-va-bo-sung': 'review', 'goc-va-don-vi-do-goc': 'angles', 'so-co-nhieu-chu-so': 'large-numbers',
  'mot-so-don-vi-do-dai-luong': 'measurement', 'phep-cong-va-phep-tru': 'add-subtract', 'duong-thang-va-tu-giac': 'lines-shapes',
  'on-tap-hoc-ky-1': 'semester-1-review', 'phep-nhan-va-phep-chia': 'multiply-divide', 'thong-ke-va-xac-suat': 'statistics',
  'phan-so': 'fractions', 'cong-tru-phan-so': 'fraction-add-subtract', 'nhan-chia-phan-so': 'fraction-multiply-divide', 'on-tap-cuoi-nam': 'final-review',
};

const GRADE5_MODULES: Record<string, string> = {
  'on-tap-va-bo-sung': 'review', 'so-thap-phan': 'decimals', 'don-vi-do-dien-tich': 'area-units',
  'phep-tinh-voi-so-thap-phan': 'decimal-operations', 'hinh-phang-chu-vi-dien-tich': 'plane-geometry',
  'on-tap-hoc-ky-1': 'semester-1-review', 'ti-so-va-bai-toan-lien-quan': 'ratio-percent', 'the-tich-va-don-vi-do': 'volume-units',
  'dien-tich-the-tich-hinh-khoi': 'solid-geometry', 'thoi-gian-van-toc-chuyen-dong': 'time-speed',
  'thong-ke-va-xac-suat': 'statistics', 'on-tap-cuoi-nam': 'final-review',
};

function normalisePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

async function loadQuestions(pathname: string, size: WorksheetSize) {
  const path = normalisePath(pathname);
  if (LOADERS[path]) return LOADERS[path](size);
  const [, grade, slug] = path.match(/^\/luyen-tap\/lop-(\d)\/(.+)$/) ?? [];
  if (grade === '4' && GRADE4_MODULES[slug]) {
    const module = await import('../lib/grade4Stage1QuestionGenerator');
    return asQuestions(module.generateGrade4Stage1Questions(GRADE4_MODULES[slug] as never, size));
  }
  if (grade === '5' && GRADE5_MODULES[slug]) {
    const module = await import('../lib/grade5QuestionGenerator');
    return asQuestions(module.generateGrade5Questions(GRADE5_MODULES[slug] as never, size));
  }
  throw new Error('Mục này chưa có bộ sinh phiếu bài tập.');
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function displayValue(value: unknown) {
  if (typeof value === 'number') return value.toLocaleString('vi-VN', { maximumFractionDigits: 4 });
  const labels: Record<string, string> = {
    circle: 'Hình tròn', square: 'Hình vuông', rectangle: 'Hình chữ nhật', triangle: 'Hình tam giác',
    cylinder: 'Khối trụ', sphere: 'Khối cầu', cube: 'Khối lập phương', cuboid: 'Khối hộp chữ nhật',
    left: 'Bên trái', right: 'Bên phải', up: 'Phía trên', down: 'Phía dưới', before: 'Đứng trước', after: 'Đứng sau',
  };
  if (typeof value === 'string' && labels[value]) return labels[value];
  return String(value ?? '');
}

function shapeSvg(shape: string) {
  const common = 'fill="none" stroke="#172033" stroke-width="5"';
  if (shape === 'sphere') return `<svg viewBox="0 0 120 90"><circle cx="60" cy="45" r="32" ${common}/><ellipse cx="60" cy="45" rx="14" ry="32" ${common} stroke-dasharray="5 4"/><path d="M30 45 Q60 58 90 45" ${common} stroke-dasharray="5 4"/></svg>`;
  if (shape === 'circle') return `<svg viewBox="0 0 120 90"><circle cx="60" cy="45" r="32" ${common}/></svg>`;
  if (shape === 'triangle') return `<svg viewBox="0 0 120 90"><path d="M60 10 L108 80 H12 Z" ${common}/></svg>`;
  if (shape === 'cuboid') return `<svg viewBox="0 0 120 90"><path d="M12 29 L35 15 H108 V65 L85 79 H12 Z M12 29 H85 L108 15 M85 29 V79 M85 29 L108 15" ${common}/></svg>`;
  if (shape === 'rectangle') return `<svg viewBox="0 0 120 90"><rect x="16" y="20" width="88" height="54" rx="3" ${common}/></svg>`;
  if (shape === 'cube') return `<svg viewBox="0 0 120 90"><path d="M22 26 L43 12 H100 V66 L79 80 H22 Z M22 26 H79 L100 12 M79 26 V80" ${common}/></svg>`;
  if (shape === 'square') return `<svg viewBox="0 0 120 90"><rect x="28" y="12" width="64" height="64" rx="3" ${common}/></svg>`;
  if (shape === 'trapezoid') return `<svg viewBox="0 0 120 90"><path d="M34 14 H86 L108 78 H12 Z" ${common}/></svg>`;
  if (shape === 'cylinder') return `<svg viewBox="0 0 120 90"><ellipse cx="60" cy="20" rx="34" ry="11" ${common}/><path d="M26 20 V68 M94 20 V68" ${common}/><ellipse cx="60" cy="68" rx="34" ry="11" ${common}/></svg>`;
  return `<span class="data-pill">${escapeHtml(shape)}</span>`;
}

// Print diagrams use SVG and text because platform emoji fonts often disappear in PDFs.
function massObjectSvg(icon: unknown) {
  const objects: Record<string, { name: string; drawing: string }> = {
    '🍉': { name: 'Quả dưa hấu', drawing: '<ellipse cx="48" cy="43" rx="33" ry="25" fill="#e2f7db"/><path d="M15 43a33 25 0 0 0 66 0" fill="#fca5a5"/><path d="M18 48q30 20 60 0" fill="none" stroke="#15803d" stroke-width="5"/>' },
    '🎒': { name: 'Chiếc cặp', drawing: '<rect x="20" y="25" width="56" height="48" rx="7" fill="#dbeafe" stroke="#172033" stroke-width="3"/><path d="M36 25v-8h24v8M30 45h36M42 45v12h12V45" fill="none" stroke="#172033" stroke-width="3"/>' },
    '🍚': { name: 'Túi gạo', drawing: '<path d="M30 20h36l-5 14 11 38H24l11-38z" fill="#fef3c7" stroke="#172033" stroke-width="3"/><path d="M35 34h26M33 52h30" stroke="#92400e" stroke-width="3"/>' },
    '🐱': { name: 'Chú mèo', drawing: '<path d="M20 34V14l19 13q9-3 18 0l19-13v20a29 29 0 1 1-56 0z" fill="#fde68a" stroke="#172033" stroke-width="3"/><circle cx="38" cy="45" r="3"/><circle cx="58" cy="45" r="3"/><path d="M45 55l3 3 3-3M48 58v5" fill="none" stroke="#172033" stroke-width="2"/>' },
    '🏋️': { name: 'Quả cân', drawing: '<path d="M36 23a12 12 0 0 1 24 0M30 30h36l10 43H20z" fill="#e2e8f0" stroke="#172033" stroke-width="3"/>' },
  };
  const item = objects[String(icon)];
  if (!item) return `<strong>${escapeHtml(icon)}</strong>`;
  return `<svg viewBox="0 0 96 88" role="img" aria-label="${item.name}">${item.drawing}</svg><strong>${item.name}</strong>`;
}

function waterContainerSvg(volume: number, label?: string, showVolume = true) {
  // A labeled scale and a real water line make the volume readable in black-and-white PDFs.
  const value = Math.max(0, Math.min(10, volume));
  const waterTop = 77 - value * 5;
  return `<div class="water-container"><svg viewBox="0 0 95 88" role="img" aria-label="${escapeHtml(label ?? 'Bình nước')}"><path d="M26 11h43v62q0 7-7 7H33q-7 0-7-7z" fill="white" stroke="#172033" stroke-width="3"/><path d="M29 ${waterTop}h37v${77 - waterTop}H29z" fill="#bfdbfe"/><path d="M29 ${waterTop}h37" stroke="#2563eb" stroke-width="3"/>${[2,4,6,8,10].map((mark) => `<path d="M62 ${77 - mark * 5}h7" stroke="#172033" stroke-width="1"/><text x="72" y="${80 - mark * 5}" font-size="7">${mark}</text>`).join('')}</svg>${label ? `<b>${escapeHtml(label)}</b>` : ''}${showVolume ? `<small>${value} l</small>` : ''}</div>`;
}

function polygonSvg(sides: number, variant = 0) {
  const shapes: Record<number, string[]> = {
    3: ['150,25 45,165 255,165'],
    4: ['55,40 245,40 220,165 75,165', '100,25 245,90 190,175 45,130', '65,40 230,30 255,155 45,170'],
    5: ['150,20 260,90 220,175 80,175 40,90'],
  };
  const choices = shapes[Math.max(3, Math.min(5, Math.round(sides || 4)))] ?? shapes[4];
  const points = choices[Math.abs(Math.round(variant)) % choices.length];
  return `<svg class="polygon-diagram" viewBox="0 0 300 200" role="img" aria-label="Hình có ${escapeHtml(sides)} cạnh"><polygon points="${points}" fill="#dbeafe" stroke="#2563eb" stroke-width="8" stroke-linejoin="round"/></svg>`;
}

function brokenLineSvg(lengths: unknown[]) {
  const values = lengths.map((value) => Number(value));
  const count = Math.max(1, values.length);
  const points = Array.from({ length: count + 1 }, (_, index) => ({ x: 25 + index * (250 / count), y: index % 2 ? 55 : 145 }));
  const segments = values.map((length, index) => {
    const point = points[index], next = points[index + 1];
    return `<line x1="${point.x}" y1="${point.y}" x2="${next.x}" y2="${next.y}"/><text x="${(point.x + next.x) / 2}" y="${(point.y + next.y) / 2 - 10}" text-anchor="middle">${escapeHtml(length)} cm</text>`;
  }).join('');
  const vertices = points.map((point, index) => `<circle cx="${point.x}" cy="${point.y}" r="6"/><text x="${point.x}" y="${point.y + 24}" text-anchor="middle">${'ABCDEF'[index] ?? ''}</text>`).join('');
  return `<svg class="broken-diagram" viewBox="0 0 300 200" role="img" aria-label="Đường gấp khúc">${segments}${vertices}</svg>`;
}

function clockSvg(hour: number, minute = 0) {
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  const minuteAngle = minute * 6;
  return `<svg class="clock" viewBox="0 0 140 140"><circle cx="70" cy="70" r="59" fill="white" stroke="#172033" stroke-width="4"/>${Array.from({ length: 12 }, (_, index) => { const angle = (index * 30 - 90) * Math.PI / 180; const x = 70 + Math.cos(angle) * 49; const y = 70 + Math.sin(angle) * 49; return `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-weight="700">${index || 12}</text>`; }).join('')}<line x1="70" y1="70" x2="70" y2="39" stroke="#172033" stroke-width="6" stroke-linecap="round" transform="rotate(${hourAngle} 70 70)"/><line x1="70" y1="70" x2="70" y2="24" stroke="#2563eb" stroke-width="4" stroke-linecap="round" transform="rotate(${minuteAngle} 70 70)"/><circle cx="70" cy="70" r="5" fill="#172033"/></svg>`;
}

function calendarHtml(question: PrintableQuestion) {
  const month = Number(question.month ?? 1);
  const days = Number(question.daysInMonth ?? 30);
  const start = Number(question.startWeekday ?? 0);
  const target = Number(question.targetDate ?? question.day ?? 0);
  const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const blanks = Array.from({ length: Math.max(0, start) }, () => '<span></span>');
  const dates = Array.from({ length: days }, (_, index) => `<span class="${index + 1 === target ? 'target-date' : ''}">${index + 1}</span>`);
  return `<div class="calendar"><b>Tháng ${month}</b><div class="calendar-grid">${labels.map((label) => `<strong>${label}</strong>`).join('')}${blanks.join('')}${dates.join('')}</div></div>`;
}

function operationSymbol(operation: unknown) {
  const symbols: Record<string, string> = {
    addition: '+', add: '+', subtraction: '−', subtract: '−',
    multiply: '×', multiplication: '×', divide: ':', division: ':',
  };
  return symbols[String(operation)] ?? String(operation ?? '');
}

function equationFromQuestion(q: Record<string, unknown>) {
  if (q.equationText) return String(q.equationText).replaceAll('?', '□');
  if (q.equation) return (q.equation as unknown[]).map((item) => item === null || item === '?' ? '□' : displayValue(item)).join(' ');
  const symbol = operationSymbol(q.operation);
  if (q.left !== undefined && q.right !== undefined) {
    const result = q.result !== undefined ? displayValue(q.result) : '?';
    if (q.missing === 'left' || q.target === 'left') return `□ ${symbol} ${displayValue(q.right)} = ${result}`;
    if (q.missing === 'right' || q.target === 'right') return `${displayValue(q.left)} ${symbol} □ = ${result}`;
    if (q.missing === 'result' || q.target === 'result') return `${displayValue(q.left)} ${symbol} ${displayValue(q.right)} = □`;
    return `${displayValue(q.left)} ${symbol} ${displayValue(q.right)} = □`;
  }
  return '';
}

export function visualHtml(question: PrintableQuestion) {
  const type = String(question.type ?? '');
  const q = question as Record<string, unknown>;
  if (type === 'clock') return clockSvg(Number(q.hour ?? 0), Number(q.minute ?? 0));
  if (type === 'calendar') return calendarHtml(question);
  if (q.story) return `<div class="story"><span>${escapeHtml(q.icon ?? q.object ?? '')}</span><p>${escapeHtml(q.story)}</p></div>`;
  if (q.equationText || q.equation) return `<div class="big-expression">${escapeHtml(equationFromQuestion(q))}</div>`;
  if (type === 'thermometer') {
    const temperature = Number(q.temperature ?? 0);
    const height = Math.max(0, Math.min(100, temperature * 2));
    return `<div class="thermometer"><div class="thermo-tube"><i style="height:${height}%"></i></div><div class="thermo-scale">${[50,40,30,20,10,0].map((v) => `<span>${v}°</span>`).join('')}</div></div>`;
  }
  if (type === 'addition') {
    if (q.visual && q.object) return `<div class="two-groups"><div>${String(q.object).repeat(Number(q.left ?? 0))}</div><b>+</b><div>${String(q.object).repeat(Number(q.right ?? 0))}</div></div>`;
    return `<div class="big-expression">${escapeHtml(displayValue(q.left))} + ${escapeHtml(displayValue(q.right))} = □</div>`;
  }
  if (type === 'subtraction') {
    if (q.visual && q.object) return `<div class="objects subtraction-objects">${Array.from({ length: Number(q.whole ?? 0) }, (_, index) => `<span class="${index >= Number(q.whole ?? 0) - Number(q.removed ?? 0) ? 'removed' : ''}">${escapeHtml(q.object)}</span>`).join('')}</div>`;
    return `<div class="big-expression">${escapeHtml(displayValue(q.whole))} − ${escapeHtml(displayValue(q.removed))} = □</div>`;
  }
  if (type === 'missing' || type === 'missing-arithmetic' || type === 'component') {
    const equation = equationFromQuestion(q);
    if (equation) return `<div class="big-expression">${escapeHtml(equation)}</div>`;
  }
  if (type === 'missing-number' && Array.isArray(q.sequence)) return `<div class="sequence">${(q.sequence as unknown[]).map((value) => `<span>${value === null || value === '?' ? '□' : escapeHtml(displayValue(value))}</span>`).join('<b>→</b>')}</div>`;
  if (type === 'fact-family') return `<div class="number-bond"><b>${escapeHtml(q.whole)}</b><span>↙</span><span>↘</span><b>${escapeHtml(q.firstPart)}</b><b>${escapeHtml(q.secondPart)}</b></div>`;
  if ((type === 'calculation' || type === 'arithmetic') && q.left !== undefined && q.right !== undefined) return `<div class="big-expression">${escapeHtml(equationFromQuestion(q))}</div>`;
  if (type === 'arithmetic' && q.first !== undefined && q.second !== undefined) {
    const symbol = operationSymbol(q.operation);
    if (q.visual && q.object) return `<div class="two-groups"><div>${String(q.object).repeat(Number(q.first))}</div><b>${escapeHtml(symbol)}</b><div>${String(q.object).repeat(Number(q.second))}</div></div>`;
    return `<div class="big-expression">${escapeHtml(displayValue(q.first))} ${escapeHtml(symbol)} ${escapeHtml(displayValue(q.second))} = □</div>`;
  }
  if (!type && q.left !== undefined && q.right !== undefined && q.operation) return `<div class="big-expression">${escapeHtml(equationFromQuestion(q))}</div>`;
  if (!type && q.top !== undefined && q.bottom !== undefined && q.operation) return `<div class="vertical-calculation"><span>${escapeHtml(displayValue(q.top))}</span><span>${escapeHtml(operationSymbol(q.operation))} ${escapeHtml(displayValue(q.bottom))}</span><i></i></div>`;
  if (type === 'word' || type === 'word-problem') {
    const equation = q.first !== undefined && q.change !== undefined ? `${displayValue(q.first)} ${operationSymbol(q.operation)} ${displayValue(q.change)} = □` : '';
    return `<div class="context"><b>${escapeHtml(q.icon ?? q.object ?? '📖')}</b>${q.visualText ? `<span>${escapeHtml(q.visualText)}</span>` : ''}${equation ? `<span class="mini-expression">${escapeHtml(equation)}</span>` : ''}</div>`;
  }
  if (type === 'count') return Number(q.count ?? 0) === 0
    ? '<div class="empty-objects">Không có đồ vật nào</div>'
    : `<div class="objects">${escapeHtml(q.object ?? '●').repeat(Number(q.count))}</div>`;
  if (type === 'compare-groups') return `<div class="two-groups"><div>${String(q.object ?? '●').repeat(Number(q.leftCount ?? 0))}</div><b>?</b><div>${String(q.object ?? '●').repeat(Number(q.rightCount ?? 0))}</div></div>`;
  if (type === 'difference') return `<div class="difference-visual"><div><span>${escapeHtml(q.firstIcon ?? '●')}</span><b>${escapeHtml(q.first)}</b></div><i>?</i><div><span>${escapeHtml(q.secondIcon ?? '●')}</span><b>${escapeHtml(q.second)}</b></div></div>`;
  if (type === 'number-bond') return `<div class="number-bond"><b>${escapeHtml(q.whole)}</b><span>↙</span><span>↘</span><b>${escapeHtml(q.knownPart)}</b><b>□</b></div>`;
  if (type === 'groups' && q.groups !== undefined) return `<div class="groups">${Array.from({ length: Number(q.groups) }, () => `<span>${String(q.icon ?? '●').repeat(Number(q.perGroup ?? 0))}</span>`).join('')}</div>`;
  if (type === 'groups' && q.groupCount !== undefined) return `<div class="groups">${Array.from({ length: Number(q.groupCount) }, () => `<span>${String(q.icon ?? '●').repeat(Number(q.perGroup ?? 0))}</span>`).join('')}</div>`;
  if (type === 'multiply') return `<div class="big-expression">${escapeHtml(q.missing === 'factor' ? `${q.factor} × □ = ${q.correctAnswer}` : `${q.factor} × ${q.times} = □`)}</div>`;
  if (type === 'divide') return `<div class="big-expression">${escapeHtml(q.missing === 'divisor' ? `${q.total} : □ = ${q.quotient}` : `${q.total} : ${q.divisor} = □`)}</div>`;
  if (type === 'share') return `<div class="context"><b>${escapeHtml(q.icon ?? '●')} ${escapeHtml(q.total)}</b><span>Chia đều thành ${escapeHtml(q.groups)} nhóm</span></div>`;
  if (type === 'recognize-solid') return `<div class="shape-row">${shapeSvg(String(q.solid))}</div>`;
  if (type === 'choose-solid') return `<div class="shape-row">${(q.options as unknown[] ?? []).map((solid, index) => `<div><b>${String.fromCharCode(65 + index)}</b>${shapeSvg(String(solid))}</div>`).join('')}</div>`;
  if (type === 'object-solid') return `<div class="object-icon">${escapeHtml(q.objectIcon)}<small>${escapeHtml(q.objectName)}</small></div>`;
  if (type === 'count-solid') return `<div class="shape-row">${(q.solids as Record<string, unknown>[] ?? []).map((item) => shapeSvg(String(item.solid))).join('')}</div>`;
  if (type === 'sort') return `<div class="sort-objects">${(q.objects as Record<string, unknown>[] ?? []).map((item, index) => `<span><b>${String.fromCharCode(65 + index)}</b>${escapeHtml(item.icon ?? item.objectIcon ?? '●')}</span>`).join('')}</div>`;
  if (type === 'property') return `<div class="shape-row">${shapeSvg(String(q.solid ?? q.shape ?? ''))}</div>`;
  if (type === 'position') {
    const vertical = String(q.relation).includes('trên') || String(q.relation).includes('dưới');
    const reverse = String(q.relation).includes('phải') || String(q.relation).includes('dưới');
    return `<div class="position-visual ${vertical ? 'vertical' : ''} ${reverse ? 'reverse' : ''}"><span>${escapeHtml(q.firstIcon)}<small>${escapeHtml(q.firstName)}</small></span><i></i><span>${escapeHtml(q.secondIcon)}<small>${escapeHtml(q.secondName)}</small></span></div>`;
  }
  if (type === 'direction') {
    const arrows: Record<string, string> = { up: '↑', down: '↓', left: '←', right: '→' };
    return `<div class="direction-visual"><span>${escapeHtml(q.mascot)}</span><b>${arrows[String(q.direction)] ?? '→'}</b></div>`;
  }
  if (type === 'comparison' && Array.isArray(q.values)) return `<div class="sequence">${q.values.map((value) => `<span>${escapeHtml(displayValue(value))}</span>`).join(q.mode === 'symbol' ? '<b>□</b>' : '')}</div>`;
  if (type === 'compare' || type === 'compare-number' || type === 'comparison') return `<div class="big-expression">${escapeHtml(displayValue(q.left))} &nbsp; □ &nbsp; ${escapeHtml(displayValue(q.right))}</div>`;
  if (type === 'before-after' || type === 'weekday') return `<div class="big-expression">${escapeHtml(q.referenceNumber ?? q.number ?? q.focusDay)}</div>`;
  if (type === 'build-number') return `<div class="place-value"><span><b>${escapeHtml(q.tens)}</b> chục</span><span><b>${escapeHtml(q.ones)}</b> đơn vị</span></div>`;
  if (type === 'choose-larger-smaller' || type === 'order') return `<div class="sequence">${(q.numbers as unknown[] ?? q.values as unknown[] ?? []).map((value) => `<span>${escapeHtml(displayValue(value))}</span>`).join('')}</div>`;
  if (type === 'number-chart') return `<div class="number-chart">${(q.cells as unknown[] ?? []).map((value) => `<span>${value === null ? '□' : escapeHtml(displayValue(value))}</span>`).join('')}</div>`;
  if (q.expression) return `<div class="big-expression">${escapeHtml(q.expression)}</div>${q.caption ? `<small>${escapeHtml(q.caption)}</small>` : ''}`;
  if (type === 'angle') {
    const degrees = Number(q.degrees ?? 90);
    const radians = degrees * Math.PI / 180;
    const x = 80 + 58 * Math.cos(radians), y = 76 - 58 * Math.sin(radians);
    return `<svg viewBox="0 0 160 100"><line x1="80" y1="76" x2="145" y2="76" stroke="#172033" stroke-width="5"/><line x1="80" y1="76" x2="${x}" y2="${y}" stroke="#172033" stroke-width="5"/><circle cx="80" cy="76" r="4" fill="#172033"/>${q.showDegrees ? `<text x="96" y="60" font-weight="700">${degrees}°</text>` : ''}</svg>`;
  }
  if (type === 'measurement' && q.measure === 'ruler') {
    const value = Number(q.value ?? 0), max = Number(q.max ?? 100), width = Math.max(5, Math.min(100, value / max * 100));
    return `<div class="ruler"><div class="ruler-line" style="width:${width}%"></div><div class="ticks">${Array.from({length:11},(_,i)=>`<i><span>${i * max / 10}</span></i>`).join('')}</div></div>`;
  }
  if (type === 'measurement' && q.mode === 'clock') return clockSvg(Number(q.value ?? q.hour ?? 0), Number(q.minute ?? 0));
  if (type === 'measurement' && q.mode === 'weekday') return `<div class="weekday-card">📅 <b>${escapeHtml(q.focusDay ?? q.value)}</b></div>`;
  if (type === 'measurement' && q.mode === 'length') {
    const value = Number(q.value ?? q.length ?? 1), max = Math.max(10, Math.ceil(value / 10) * 10);
    return `<div class="ruler"><div class="ruler-line" style="width:${Math.max(5, value / max * 100)}%"></div><div class="ticks">${Array.from({length:11},(_,i)=>`<i><span>${i * max / 10}</span></i>`).join('')}</div></div>`;
  }
  if (type === 'measurement' && (q.measure === 'jug' || q.measure === 'scale')) {
    const value = Number(q.value ?? 0), max = Number(q.max ?? 1000), height = Math.max(4, Math.min(100, value / max * 100));
    return `<div class="meter"><div class="meter-fill" style="height:${height}%"></div><div class="meter-scale">${[max, max*.75, max*.5, max*.25, 0].map(v=>`<span>${displayValue(v)}</span>`).join('')}</div></div>`;
  }
  if (type === 'measure-length' || type === 'ruler') {
    const value = Number(q.length ?? q.value ?? 1), max = Math.max(10, Math.ceil(value / 10) * 10);
    return `<div class="ruler"><div class="ruler-line" style="width:${Math.max(5, value / max * 100)}%"></div><div class="ticks">${Array.from({length:11},(_,i)=>`<i><span>${i * max / 10}</span></i>`).join('')}</div></div>`;
  }
  if (type === 'compare-length') return `<div class="length-bars"><span style="width:${Math.max(15, Number(q.firstLength) * 4)}px"></span><span style="width:${Math.max(15, Number(q.secondLength) * 4)}px"></span></div>`;
  if (type === 'order-length') return `<div class="length-list">${(q.items as Record<string, unknown>[] ?? []).map((item) => `<div><b>${escapeHtml(item.label)}</b><span style="width:${Math.max(15, Number(item.length) * 4)}px"></span></div>`).join('')}</div>`;
  if (type === 'length-unit' || type === 'unit' || type === 'estimate' || type === 'estimate-length') return `<div class="object-icon">${escapeHtml(q.objectIcon ?? q.icon ?? '📏')}<small>${escapeHtml(q.objectName ?? q.object ?? '')}</small></div>`;
  if (type === 'convert' || type === 'conversion') return `<div class="big-expression">${escapeHtml(q.from ?? q.amount)} ${escapeHtml(q.fromUnit ?? (q.mode === 'hour-to-minute' ? 'giờ' : 'phút'))} = □ ${escapeHtml(q.toUnit ?? (q.mode === 'hour-to-minute' ? 'phút' : 'giờ'))}</div>`;
  if (type === 'month') return `<div class="big-expression">Tháng ${escapeHtml(q.month)}</div>`;
  if (type === 'money') {
    const notes = (q.notes as unknown[] ?? q.bills as unknown[] ?? []);
    return `<div class="money-list">${notes.map((note) => `<span>${escapeHtml(displayValue(note))} đồng</span>`).join('')}${q.price ? `<b>Giá: ${escapeHtml(displayValue(q.price))} đồng</b>` : ''}</div>`;
  }
  if (type === 'balance') return `<div class="print-comparison"><div class="print-item">${massObjectSvg(q.leftIcon)}<small>${q.mode === 'read' ? '? kg' : `${escapeHtml(q.leftMass)} kg`}</small></div><span class="comparison-symbol">${q.mode === 'read' ? '=' : '↔'}</span><div class="print-item">${massObjectSvg(q.rightIcon)}<small>${escapeHtml(q.rightMass)} kg</small></div></div>`;
  if (type === 'capacity') return `<div class="print-comparison">${waterContainerSvg(Number(q.first ?? 0), q.mode === 'compare' ? 'Bình A' : undefined, q.mode === 'compare')}${q.mode === 'compare' ? `<span class="comparison-symbol">↔</span>${waterContainerSvg(Number(q.second ?? 0), 'Bình B')}` : ''}</div>`;
  if (type === 'count-data') return `<div class="objects">${(q.items as unknown[] ?? []).map((item) => escapeHtml(item)).join(' ')}</div>`;
  if (type === 'probability') return `<div class="balls">${(q.balls as unknown[] ?? []).map((ball) => `<span class="${escapeHtml(ball)}"></span>`).join('')}</div>`;
  if (type === 'identify-shape') return `<div class="shape-row">${shapeSvg(String(q.shape ?? ''))}</div>`;
  if (type === 'choose-shape') return `<div class="shape-row">${(q.shapeOptions as unknown[] ?? []).map((shape, index) => `<div><b>${String.fromCharCode(65 + index)}</b>${shapeSvg(String(shape))}</div>`).join('')}</div>`;
  if (type === 'odd-shape') return `<div class="shape-row">${(q.shapes as unknown[] ?? []).map((shape, index) => `<div><b>${index + 1}</b>${shapeSvg(String(shape))}</div>`).join('')}</div>`;
  if (type === 'classify-shape') return `<div class="shape-row">${(q.shapes as Record<string, unknown>[] ?? []).map((item) => shapeSvg(String(item.shape))).join('')}</div>`;
  if (type === 'life-shape') return `<div class="object-icon">${escapeHtml(q.objectIcon)}<small>${escapeHtml(q.objectName)}</small></div>`;
  if (type === 'compose-shape') {
    const icons: Record<string, string> = { house: '🏠', robot: '🤖', boat: '⛵', train: '🚂' };
    return `<div class="object-icon">${icons[String(q.composite)] ?? '🧩'}<small>${escapeHtml(q.compositeName)}</small></div>`;
  }
  if (type === 'fraction') return `<div class="fraction"><span>${escapeHtml(q.numerator)}</span><span>${escapeHtml(q.denominator)}</span></div>${q.caption ? `<small>${escapeHtml(q.caption)}</small>` : ''}`;
  if (type === 'sequence' || type === 'number-line') return `<div class="sequence">${(q.values as unknown[] ?? q.numbers as unknown[] ?? []).map((value) => `<span>${escapeHtml(displayValue(value))}</span>`).join('<b>→</b>')}</div>`;
  if (type === 'bars' || type === 'bar-chart' || type === 'picture-chart' || type === 'data-table') {
    const labels = (q.labels as unknown[] ?? q.categories as unknown[] ?? []);
    const values = (q.values as unknown[] ?? q.data as unknown[] ?? []);
    return `<div class="data-table">${labels.map((label, i) => `<div><b>${escapeHtml(label)}</b><span>${escapeHtml(displayValue(values[i]))}</span></div>`).join('')}</div>`;
  }
  if (type === 'polygon') return `<div class="shape-row">${polygonSvg(Number(q.sides ?? 4), Number(q.variant ?? 0))}</div>`;
  if (type === 'shape' || type === 'solid') return `<div class="shape-row">${shapeSvg(String(q.shape ?? q.solid ?? ''))}</div>${q.caption ? `<small>${escapeHtml(q.caption)}</small>` : ''}`;
  if (type === 'flat-shape') return `<div class="shape-row">${shapeSvg(String(q.shape))}</div>`;
  if (type === 'geometry') {
    if (q.mode === 'position') {
      const vertical = String(q.relation).toLowerCase().includes('trên') || String(q.relation).toLowerCase().includes('dưới');
      const reverse = String(q.relation).toLowerCase().includes('phải') || String(q.relation).toLowerCase().includes('dưới');
      return `<div class="position-visual ${vertical ? 'vertical' : ''} ${reverse ? 'reverse' : ''}"><span>${escapeHtml(q.firstIcon ?? '●')}</span><i></i><span>${escapeHtml(q.secondIcon ?? '●')}</span></div>`;
    }
    if (q.mode === 'polygon' || (q.sides && !Array.isArray(q.sides))) return `<div class="shape-row">${polygonSvg(Number(q.sides ?? 4), Number(q.variant ?? 0))}</div>`;
    if (q.mode === 'solid' || q.solid) return `<div class="shape-row">${shapeSvg(String(q.solid))}</div>`;
    if (q.mode === 'flat' || q.shape) return `<div class="shape-row">${shapeSvg(String(q.shape ?? 'rectangle'))}</div>${q.width ? `<small>${escapeHtml(q.width)} × ${escapeHtml(q.height)} ${escapeHtml(q.unit ?? '')}</small>` : ''}`;
    if (q.mode === 'broken' || q.lengths) return brokenLineSvg(q.lengths as unknown[] ?? []);
  }
  if (type === 'circle') {
    const focus = String(q.focus ?? 'center');
    const segment = focus === 'diameter'
      ? '<line x1="24" y1="45" x2="96" y2="45"/><text x="17" y="50">A</text><text x="100" y="50">B</text>'
      : focus === 'radius' ? '<line x1="60" y1="45" x2="96" y2="45"/><text x="100" y="50">A</text>' : '';
    return `<svg class="circle-diagram" viewBox="0 0 120 90"><circle cx="60" cy="45" r="36"/><g>${segment}</g><circle class="center-dot" cx="60" cy="45" r="3"/><text x="64" y="41">O</text></svg>`;
  }
  if (type === 'segment') {
    const labels = q.labels as unknown[] ?? ['A', 'M', 'B'];
    return `<svg class="segment-diagram" viewBox="0 0 180 72"><line x1="25" y1="34" x2="155" y2="34"/>${labels.slice(0, 3).map((label, index) => { const x = 25 + index * 65; return `<circle cx="${x}" cy="34" r="4"/><text x="${x}" y="55" text-anchor="middle">${escapeHtml(label)}</text>`; }).join('')}${q.leftLength ? `<text x="58" y="25" text-anchor="middle">${escapeHtml(q.leftLength)} cm</text>` : ''}${q.rightLength ? `<text x="123" y="25" text-anchor="middle">${escapeHtml(q.rightLength)} cm</text>` : ''}</svg>`;
  }
  if (type === 'line') return `<div class="line-visual ${String(q.lineKind).includes('cong') ? 'curved' : ''}"><span>${(q.labels as unknown[] ?? []).map((label) => escapeHtml(label)).join(' · ')}</span></div>`;
  if (type === 'points') return `<div class="points">${(q.labels as unknown[] ?? Array.from({length:Number(q.pointCount ?? 3)},(_,i)=>String.fromCharCode(65+i))).map((label) => `<span>•<small>${escapeHtml(label)}</small></span>`).join('')}</div>`;
  if (type === 'broken') return brokenLineSvg(q.lengths as unknown[] ?? []);
  if (type === 'area-grid') return `<div class="area-grid" style="grid-template-columns:repeat(${Number(q.columns ?? 1)},12px)">${Array.from({length:Number(q.rows ?? 1)*Number(q.columns ?? 1)},()=>'<i></i>').join('')}</div>`;
  if (type === 'roman') return `<div class="big-expression">${escapeHtml(q.askFor === 'roman' ? q.arabic : q.roman)}</div>`;
  if (type === 'number-card') return `<div class="big-expression">${escapeHtml(displayValue(q.value))}</div>${q.expanded ? `<small>${escapeHtml(q.expanded)}</small>` : ''}`;
  if (type === 'diagram') return `<div class="diagram-label">${escapeHtml(displayValue(q.diagram))}</div>`;
  if (type === 'time') return `${clockSvg(Number(q.hour ?? 0), Number(q.minute ?? 0))}${q.duration ? `<small>Thêm ${escapeHtml(q.duration)} phút</small>` : ''}`;
  if (type === 'multiply-divide') return `<div class="big-expression">${escapeHtml(q.left)} ${escapeHtml(q.operation)} ${escapeHtml(q.right)} = □</div>`;
  if (type === 'data') return `<div class="data-table">${(q.labels as unknown[] ?? []).map((label, i) => `<div><b>${escapeHtml(label)}</b><span>${escapeHtml((q.icons as unknown[] ?? [])[i] ?? '')} × ${escapeHtml((q.counts as unknown[] ?? [])[i] ?? '')}</span></div>`).join('')}</div>`;
  if (type === 'number') {
    if (q.sequence) return `<div class="sequence">${(q.sequence as unknown[]).map((value) => `<span>${value === null ? '□' : escapeHtml(displayValue(value))}</span>`).join('<b>→</b>')}</div>`;
    if (q.left !== undefined && q.right !== undefined) return `<div class="big-expression">${escapeHtml(q.left)} □ ${escapeHtml(q.right)}</div>`;
    return `<div class="big-expression">${escapeHtml(displayValue(q.number ?? q.value))}</div>`;
  }
  if (q.visualTitle || q.visualLines || q.visualText || q.icon) return `<div class="context"><b>${escapeHtml(q.icon ?? '')} ${escapeHtml(q.visualTitle ?? '')}</b>${q.visualText ? `<span>${escapeHtml(q.visualText)}</span>` : ''}${(q.visualLines as unknown[] ?? []).map((line) => `<span>${escapeHtml(line)}</span>`).join('')}</div>`;
  if (q.number !== undefined) return `<div class="big-expression">${escapeHtml(displayValue(q.number))}</div>${q.caption ? `<small>${escapeHtml(q.caption)}</small>` : ''}`;
  if (q.objectIcon || q.icon) return `<div class="object-icon">${escapeHtml(q.objectIcon ?? q.icon)}</div>`;
  const fallbackFields = [q.display, q.label, q.caption, q.sceneTitle, q.sceneText, q.kind, q.value, q.visualText].filter((value) => value !== undefined && value !== '');
  if (fallbackFields.length) return `<div class="context">${fallbackFields.map((value) => `<span>${escapeHtml(displayValue(value))}</span>`).join('')}</div>`;
  return `<div class="answer-space">${escapeHtml(question.instruction)}</div>`;
}

function answersHtml(question: PrintableQuestion) {
  const answers = question.answers ?? [];
  // These choices are already drawn and labeled inside the illustration.
  if (question.type === 'choose-shape' || question.type === 'choose-solid' || question.type === 'odd-shape') return '';
  return answers.map((answer, index) => `<span>${String.fromCharCode(65 + index)}. ${escapeHtml(displayValue(answer))}</span>`).join('');
}

function correctAnswerHtml(question: PrintableQuestion) {
  if (question.type === 'odd-shape' && typeof question.correctAnswer === 'number') return `Hình ${question.correctAnswer + 1}`;
  if (question.type === 'choose-shape' && Array.isArray(question.shapeOptions)) {
    const index = question.shapeOptions.indexOf(question.correctAnswer);
    if (index >= 0) return `${String.fromCharCode(65 + index)}. ${displayValue(question.correctAnswer)}`;
  }
  if (question.type === 'choose-solid' && Array.isArray(question.options)) {
    const index = question.options.indexOf(question.correctAnswer);
    if (index >= 0) return `${String.fromCharCode(65 + index)}. ${displayValue(question.correctAnswer)}`;
  }
  return displayValue(question.correctAnswer);
}

function buildWorksheetHtml(options: { title: string; grade: string; size: WorksheetSize; questions: PrintableQuestion[]; includeAnswers: boolean; qr: string; code: string; }) {
  const { title, grade, size, questions, includeAnswers, qr, code } = options;
  const questionMarkup = questions.map((question, index) => { const answers = answersHtml(question); return `<article class="question"><h2>Câu ${index + 1}. ${escapeHtml(question.instruction)}</h2><div class="visual">${visualHtml(question)}</div>${answers ? `<div class="answers">${answers}</div>` : ''}</article>`; }).join('');
  const answerMarkup = includeAnswers ? `<section class="answer-key"><h1>Đáp án</h1><div class="answer-grid">${questions.map((question, index) => `<div><b>Câu ${index + 1}</b><span>${escapeHtml(correctAnswerHtml(question))}</span>${question.explanation ? `<small>${escapeHtml(question.explanation)}</small>` : ''}</div>`).join('')}</div></section>` : '';
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Phiếu bài tập - ${escapeHtml(title)}</title><style>
  @font-face{font-family:"Be Vietnam Pro";font-weight:400;src:url("/fonts/be-vietnam-pro-vietnamese-400.woff2") format("woff2");font-display:swap}@font-face{font-family:"Be Vietnam Pro";font-weight:700;src:url("/fonts/be-vietnam-pro-vietnamese-700.woff2") format("woff2");font-display:swap}@font-face{font-family:"Be Vietnam Pro";font-weight:900;src:url("/fonts/be-vietnam-pro-vietnamese-900.woff2") format("woff2");font-display:swap}@page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#172033;background:#eef2f7;font-family:"Be Vietnam Pro","Segoe UI",Arial,sans-serif;line-height:1.42}.toolbar{position:sticky;top:0;z-index:5;display:flex;justify-content:center;gap:12px;padding:12px;background:#172033;color:white}.toolbar button{border:0;border-radius:12px;padding:11px 18px;font:800 15px inherit;cursor:pointer}.toolbar .primary{background:#7c3aed;color:white}.sheet{width:210mm;min-height:297mm;margin:18px auto;padding:12mm;background:white;box-shadow:0 16px 45px #0f172a22}.sheet-header{display:grid;grid-template-columns:1fr 28mm;gap:8mm;align-items:center;border-bottom:3px solid #172033;padding-bottom:6mm}.brand{font-size:14px;font-weight:900;color:#6d28d9;letter-spacing:.08em;text-transform:uppercase}.sheet-header h1{margin:2mm 0 1mm;font-size:23px;line-height:1.2}.meta{font-size:12px;font-weight:700;color:#475569}.qr{text-align:center;font-size:8px;font-weight:700}.qr img{display:block;width:24mm;height:24mm;margin:auto}.student{display:grid;grid-template-columns:2fr 1fr 1fr;gap:6mm;margin:6mm 0 4mm;font-size:12px;font-weight:700}.line{display:inline-block;min-width:35mm;border-bottom:1px dotted #172033}.question{break-inside:avoid;border:1.4px solid #cbd5e1;border-radius:4mm;margin:0 0 4mm;padding:4mm}.question h2{margin:0 0 3mm;font-size:14px}.visual{min-height:18mm;display:grid;place-items:center;border-radius:3mm;background:#f8fafc;padding:3mm;text-align:center}.visual svg{width:38mm;height:27mm}.visual small{display:block;margin-top:2mm;font-weight:700;color:#475569}.answers{display:grid;grid-template-columns:repeat(2,1fr);gap:2mm 5mm;margin-top:3mm;font-size:12px;font-weight:700}.answers span{padding:2mm 3mm;border:1px solid #cbd5e1;border-radius:2mm}.big-expression{font-size:24px;font-weight:900}.objects{max-width:150mm;font-size:24px;letter-spacing:3px}.subtraction-objects{display:flex;flex-wrap:wrap;justify-content:center}.subtraction-objects .removed{text-decoration:line-through;text-decoration-thickness:3px;opacity:.48}.two-groups{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8mm;font-size:22px}.number-bond{display:grid;grid-template-columns:repeat(2,35mm);justify-content:center;font-size:20px}.number-bond b:first-child{grid-column:1/3}.groups{display:flex;flex-wrap:wrap;justify-content:center;gap:4mm}.groups span{border:1px solid #94a3b8;border-radius:3mm;padding:3mm;font-size:20px}.story{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:4mm;max-width:155mm;text-align:left}.story>span{font-size:34px}.story p{margin:0;font-size:13px;font-weight:700}.mini-expression{font-size:18px;font-weight:900}.shape-row{display:flex;justify-content:center;align-items:center;gap:4mm}.shape-row>div{display:grid;place-items:center}.shape-row>div>b{font-size:10px}.shape-row svg{width:25mm;height:20mm}.clock{width:35mm!important;height:35mm!important}.fraction{display:inline-flex;flex-direction:column;font-size:22px;font-weight:900}.fraction span:first-child{border-bottom:2px solid;padding:0 8px}.sequence{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:3mm}.sequence span{border:1px solid #94a3b8;border-radius:2mm;padding:2mm 4mm;font-weight:800}.context{display:flex;flex-direction:column;gap:1mm;font-size:13px}.context b{font-size:18px}.object-icon{display:flex;flex-direction:column;font-size:38px}.object-icon small{font-size:11px}.data-table{display:flex;gap:1mm;border:1px solid #94a3b8}.data-table div{display:flex;flex-direction:column;padding:2mm 4mm;border-right:1px solid #94a3b8}.calendar{width:72mm}.calendar>b{font-size:16px}.calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);margin-top:2mm;border:1px solid #94a3b8}.calendar-grid>*{padding:1.2mm;border:.5px solid #cbd5e1;font-size:9px}.target-date{outline:2px solid #172033;font-weight:900}.thermometer{display:flex;gap:4mm;height:40mm}.thermo-tube{position:relative;width:8mm;height:38mm;border:2px solid #64748b;border-radius:5mm;overflow:hidden;background:white}.thermo-tube i{position:absolute;bottom:0;left:1.5mm;right:1.5mm;background:#ef4444;border-radius:4mm}.thermo-scale{display:flex;flex-direction:column;justify-content:space-between;font-size:8px}.ruler{position:relative;width:145mm;padding-top:8mm}.ruler-line{position:absolute;top:1mm;left:0;height:3mm;background:#2563eb}.ticks{display:flex;justify-content:space-between;border-top:2px solid}.ticks i{height:5mm;border-left:1px solid;position:relative}.ticks span{position:absolute;top:4mm;transform:translateX(-50%);font-size:7px}.meter{position:relative;width:24mm;height:38mm;border:2px solid #64748b;border-radius:2mm;overflow:hidden;background:white}.meter-fill{position:absolute;bottom:0;left:0;right:7mm;background:#60a5fa}.meter-scale{position:absolute;inset:1mm 1mm 1mm auto;display:flex;flex-direction:column;justify-content:space-between;font-size:6px}.place-value{display:flex;gap:6mm}.place-value span{border:1px solid #94a3b8;border-radius:3mm;padding:3mm 6mm}.number-chart{display:grid;grid-template-columns:repeat(5,1fr);gap:1mm}.number-chart span{border:1px solid #94a3b8;padding:2mm 3mm;font-weight:800}.length-bars,.length-list{display:grid;gap:3mm;justify-items:start}.length-bars span,.length-list span{display:block;height:4mm;background:#2563eb;border-radius:9px}.length-list div{display:grid;grid-template-columns:24mm 1fr;align-items:center;gap:3mm}.money-list{display:flex;flex-wrap:wrap;justify-content:center;gap:3mm}.money-list span{border:2px solid #64748b;border-radius:3mm;padding:3mm 5mm;font-weight:900}.balance{display:flex;align-items:center;justify-content:center;gap:8mm}.balance span{display:flex;flex-direction:column;font-size:30px}.balance b{font-size:10px}.balance i{font-size:28px}.balls{display:flex;flex-wrap:wrap;justify-content:center;gap:3mm}.balls span{width:9mm;height:9mm;border:2px solid #64748b;border-radius:50%;background:#cbd5e1}.balls .bg-red-500{background:#ef4444}.balls .bg-blue-500{background:#3b82f6}.balls .bg-yellow-400{background:#facc15}.position-visual{display:flex;align-items:center;gap:7mm}.position-visual.vertical{flex-direction:column}.position-visual.reverse{flex-direction:row-reverse}.position-visual.vertical.reverse{flex-direction:column-reverse}.position-visual span{display:flex;flex-direction:column;font-size:32px}.position-visual small{font-size:9px}.position-visual i{width:20mm;border-top:1px dashed #94a3b8}.direction-visual{display:flex;align-items:center;gap:8mm;font-size:34px}.direction-visual b{font-size:42px}.line-visual{width:90mm;border-top:4px solid #172033}.line-visual.curved{height:14mm;border:0;border-radius:50%;border-top:4px solid #172033}.points{display:flex;gap:14mm;font-size:28px}.points span{display:flex;flex-direction:column}.points small{font-size:9px}.broken-line{display:flex;align-items:center;gap:2mm}.area-grid{display:grid}.area-grid i{width:12px;height:12px;border:1px solid #64748b}.diagram-label{border:2px dashed #64748b;border-radius:3mm;padding:4mm 8mm;font-weight:900}.answer-space{width:100%;border-bottom:1px dotted #64748b;color:#64748b;font-size:11px;text-align:left;padding:4mm}.answer-key{break-before:page}.answer-key h1{font-size:23px;border-bottom:3px solid;padding-bottom:4mm}.answer-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:3mm}.answer-grid>div{display:grid;grid-template-columns:20mm 1fr;gap:2mm;border:1px solid #cbd5e1;border-radius:3mm;padding:3mm}.answer-grid small{grid-column:1/3;color:#475569}.footer{display:flex;justify-content:space-between;margin-top:6mm;font-size:9px;color:#64748b}
  @font-face{font-family:"Trang Toan Print";font-style:normal;font-display:block;font-weight:400;src:url("/fonts/be-vietnam-pro-vietnamese-400.woff2") format("woff2");unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}@font-face{font-family:"Trang Toan Print";font-style:normal;font-display:block;font-weight:400;src:url("/fonts/be-vietnam-pro-latin-400.woff2") format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:"Trang Toan Print";font-style:normal;font-display:block;font-weight:600;src:url("/fonts/be-vietnam-pro-vietnamese-600.woff2") format("woff2");unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}@font-face{font-family:"Trang Toan Print";font-style:normal;font-display:block;font-weight:600;src:url("/fonts/be-vietnam-pro-latin-600.woff2") format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:"Trang Toan Print";font-style:normal;font-display:block;font-weight:700;src:url("/fonts/be-vietnam-pro-vietnamese-700.woff2") format("woff2");unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}@font-face{font-family:"Trang Toan Print";font-style:normal;font-display:block;font-weight:700;src:url("/fonts/be-vietnam-pro-latin-700.woff2") format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:"Trang Toan Print";font-style:normal;font-display:block;font-weight:800;src:url("/fonts/be-vietnam-pro-vietnamese-800.woff2") format("woff2");unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}@font-face{font-family:"Trang Toan Print";font-style:normal;font-display:block;font-weight:800;src:url("/fonts/be-vietnam-pro-latin-800.woff2") format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:"Trang Toan Print";font-style:normal;font-display:block;font-weight:900;src:url("/fonts/be-vietnam-pro-vietnamese-900.woff2") format("woff2");unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB}@font-face{font-family:"Trang Toan Print";font-style:normal;font-display:block;font-weight:900;src:url("/fonts/be-vietnam-pro-latin-900.woff2") format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}body{font-family:"Trang Toan Print","Segoe UI",Arial,sans-serif}
  .vertical-calculation{display:grid;justify-items:end;min-width:30mm;font-size:20px;font-weight:900}.vertical-calculation i{width:100%;border-top:2px solid #172033}.difference-visual{display:flex;align-items:center;gap:8mm}.difference-visual div{display:flex;align-items:center;gap:2mm;border:1px solid #94a3b8;border-radius:3mm;padding:3mm 6mm}.difference-visual div span{font-size:28px}.difference-visual i{font-size:22px;font-weight:900}.sort-objects{display:flex;flex-wrap:wrap;justify-content:center;gap:5mm}.sort-objects span{display:grid;grid-template-columns:auto auto;align-items:center;gap:2mm;border:1px solid #94a3b8;border-radius:3mm;padding:3mm 5mm;font-size:28px}.sort-objects b{font-size:10px}.weekday-card{font-size:24px}.circle-diagram circle,.circle-diagram line,.segment-diagram line,.segment-diagram circle{fill:none;stroke:#172033;stroke-width:4}.circle-diagram .center-dot,.segment-diagram circle{fill:#172033}.circle-diagram text,.segment-diagram text{font-size:12px;font-weight:800;fill:#172033}
  .shape-row{max-width:100%;flex-wrap:wrap;row-gap:3mm}.shape-row>svg{flex:0 0 22mm;width:22mm;height:18mm}.shape-row>.polygon-diagram{flex-basis:60mm;width:60mm;height:40mm}.shape-row>div{flex:0 1 27mm}.visual>.broken-diagram{width:80mm;height:45mm}.broken-diagram line{stroke:#2563eb;stroke-width:7;stroke-linecap:round}.broken-diagram circle{fill:#f97316}.broken-diagram text{fill:#172033;font-size:14px;font-weight:800}.objects{max-width:100%;overflow-wrap:anywhere;word-break:break-all;white-space:normal;line-height:1.35}.two-groups{max-width:100%;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}.two-groups>div{min-width:0;overflow-wrap:anywhere;word-break:break-all}.visual>*{max-width:100%}
  @media print{body{background:white}.toolbar{display:none}.sheet{width:auto;min-height:auto;margin:0;padding:0;box-shadow:none}.question{break-inside:avoid}.answer-key{break-before:page}}
  @media screen and (max-width:800px){.sheet{width:100%;margin:0;padding:18px}.student{grid-template-columns:1fr}.answers{grid-template-columns:1fr}.toolbar{position:fixed;right:0;bottom:0;left:0;top:auto}.sheet{padding-bottom:82px}.shape-row{gap:2mm}.shape-row>svg{flex-basis:18mm;width:18mm;height:15mm}.shape-row>.polygon-diagram{flex-basis:58mm;width:58mm;height:38mm}.shape-row>div{flex-basis:21mm}.objects{font-size:20px}.two-groups{gap:3mm;font-size:18px}}
  @media print{.sheet{width:auto;max-width:186mm;padding:0}.student{grid-template-columns:2fr 1fr 1fr}.answers{grid-template-columns:repeat(2,minmax(0,1fr))}.question{overflow:hidden;break-inside:avoid-page}.question h2{overflow-wrap:anywhere}.visual{min-width:0;overflow:hidden}.visual>*{min-width:0}.shape-row{width:100%;flex-wrap:wrap}.shape-row>div{flex:0 0 27mm}.shape-row>svg{flex:0 0 22mm}.shape-row>.polygon-diagram{flex:0 0 60mm}.objects,.two-groups>div{word-break:normal;overflow-wrap:anywhere}.two-groups{width:100%}.sequence{max-width:100%;flex-wrap:wrap}.data-table{max-width:100%;flex-wrap:wrap}.data-table div{min-width:0}.answer-key{break-before:page}}
  .empty-objects{border:2px dashed #94a3b8;border-radius:3mm;padding:5mm 12mm;font-size:13px;font-weight:700;color:#475569}.print-comparison{width:100%;display:flex;align-items:center;justify-content:center;gap:8mm;flex-wrap:wrap}.print-item,.water-container{display:flex;flex-direction:column;align-items:center;gap:1mm;min-width:35mm;font-size:12px}.print-item svg,.water-container svg{width:23mm;height:23mm}.print-item strong,.water-container b{font-size:11px}.print-item small,.water-container small{font-size:12px;font-weight:900;color:#172033}.comparison-symbol{font-size:21px;font-weight:900}
  </style></head><body><div class="toolbar"><button onclick="window.close()">Đóng</button><button class="primary" onclick="printWorksheet()">🖨️ In hoặc lưu PDF</button></div><main class="sheet"><header class="sheet-header"><div><div class="brand">Trạng Toán · Phiếu luyện tập</div><h1>${escapeHtml(title)}</h1><div class="meta">Toán lớp ${escapeHtml(grade)} · ${size} câu · Mã đề ${escapeHtml(code)}</div></div><div class="qr"><img src="${qr}" alt="QR Trạng Toán">Quét để luyện trực tuyến</div></header><div class="student"><div>Họ và tên: <span class="line"></span></div><div>Lớp: <span class="line"></span></div><div>Ngày: <span class="line"></span></div></div>${questionMarkup}${answerMarkup}<footer class="footer"><span>trangtoan.so1.asia</span><span>Mã đề ${escapeHtml(code)}</span></footer></main><script>async function printWorksheet(){if(document.fonts?.ready)await document.fonts.ready;await Promise.all(Array.from(document.images,image=>image.complete?Promise.resolve():new Promise(resolve=>{image.onload=resolve;image.onerror=resolve})));window.print()}</script></body></html>`;
}

function watchPortalTarget(onFound: (element: HTMLElement) => void) {
  let current: HTMLElement | null = null;
  const locate = () => {
    if (current?.isConnected) return;
    const heading = [...document.querySelectorAll('main h2')].find((element) => element.textContent?.trim() === 'Chọn lượt luyện tập');
    const grid = heading?.nextElementSibling;
    if (!grid?.parentElement) return false;
    const mount = document.createElement('div');
    mount.dataset.worksheetLauncher = 'true';
    grid.insertAdjacentElement('afterend', mount);
    current = mount;
    onFound(mount);
    return true;
  };
  locate();
  const observer = new MutationObserver(locate);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => { observer.disconnect(); current?.remove(); };
}

export default function WorksheetPrintLauncher() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<WorksheetSize>(10);
  const [includeAnswers, setIncludeAnswers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const path = useMemo(() => typeof window === 'undefined' ? '' : normalisePath(window.location.pathname), []);

  useEffect(() => {
    return watchPortalTarget(setTarget);
  }, []);

  async function createWorksheet() {
    const preview = window.open('', '_blank');
    if (!preview) { setError('Trình duyệt đang chặn cửa sổ xem trước. Hãy cho phép mở cửa sổ mới rồi thử lại.'); return; }
    preview.document.write('<!doctype html><title>Đang tạo phiếu…</title><p style="font:700 18px sans-serif;padding:30px">Đang tạo phiếu bài tập…</p>');
    setLoading(true); setError('');
    try {
      const questions = await loadQuestions(path, size);
      const title = document.querySelector('main section h1')?.textContent?.trim() || document.title.split('–')[0].trim();
      const grade = path.match(/\/lop-(\d)/)?.[1] ?? '';
      const code = `TT${grade}-${Date.now().toString(36).slice(-5).toUpperCase()}`;
      const qr = await QRCode.toDataURL(`${SITE_URL}${path}/`, { width: 240, margin: 1, errorCorrectionLevel: 'M' });
      preview.document.open();
      preview.document.write(buildWorksheetHtml({ title, grade, size, questions, includeAnswers, qr, code }));
      preview.document.close();
      setOpen(false);
    } catch (reason) {
      preview.close();
      setError(reason instanceof Error ? reason.message : 'Không thể tạo phiếu. Vui lòng thử lại.');
    } finally { setLoading(false); }
  }

  if (!target) return null;
  return createPortal(<>
    <button type="button" onClick={() => setOpen(true)} className="mt-5 flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-violet-500 hover:bg-violet-100 focus-visible:outline-violet-600">
      <span className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-2xl shadow-sm">🖨️</span><span><strong className="block text-base font-black text-violet-900">In phiếu bài tập</strong><span className="mt-0.5 block text-sm font-semibold text-slate-600">Tạo đề A4 mới với 5, 10 hoặc 15 câu</span></span></span><span className="hidden font-black text-violet-700 sm:block">Tạo phiếu →</span>
    </button>
    {open && <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="worksheet-dialog-title" className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black uppercase tracking-widest text-violet-600">Phiếu bài tập A4</p><h2 id="worksheet-dialog-title" className="mt-1 text-2xl font-black">Chọn số câu cần in</h2></div><button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xl font-black" aria-label="Đóng">×</button></div>
        <div className="mt-6 grid grid-cols-3 gap-3">{([5, 10, 15] as const).map((count) => <button key={count} type="button" onClick={() => setSize(count)} className={`rounded-2xl border-2 px-3 py-4 text-center transition ${size === count ? 'border-violet-500 bg-violet-50 text-violet-800 shadow-md' : 'border-slate-200 bg-white hover:border-violet-300'}`}><strong className="block text-xl font-black">{count}</strong><span className="text-xs font-bold">câu</span></button>)}</div>
        <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"><span><strong className="block font-black">Kèm trang đáp án</strong><span className="text-sm font-semibold text-slate-500">Đáp án và lời giải ngắn nằm ở trang cuối</span></span><input type="checkbox" checked={includeAnswers} onChange={(event) => setIncludeAnswers(event.target.checked)} className="h-6 w-6 accent-violet-600" /></label>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <button type="button" disabled={loading} onClick={createWorksheet} className="mt-6 w-full rounded-2xl bg-violet-600 px-6 py-4 text-lg font-black text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60">{loading ? 'Đang tạo phiếu…' : 'Mở phiếu để in hoặc lưu PDF'}</button>
        <p className="mt-3 text-center text-xs font-semibold text-slate-500">Mỗi lần tạo là một mã đề mới, câu hỏi được phân bổ theo các kỹ năng của mục học.</p>
      </section>
    </div>}
  </>, target);
}
