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

const SITE_URL = 'https://trangtoan.so1.asia/';

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
    left: 'Bên trái', right: 'Bên phải', before: 'Đứng trước', after: 'Đứng sau',
  };
  if (typeof value === 'string' && labels[value]) return labels[value];
  return String(value ?? '');
}

function shapeSvg(shape: string) {
  const common = 'fill="none" stroke="#172033" stroke-width="5"';
  if (shape === 'circle' || shape === 'sphere') return `<svg viewBox="0 0 120 90"><circle cx="60" cy="45" r="32" ${common}/></svg>`;
  if (shape === 'triangle') return `<svg viewBox="0 0 120 90"><path d="M60 10 L108 80 H12 Z" ${common}/></svg>`;
  if (shape === 'rectangle' || shape === 'cuboid') return `<svg viewBox="0 0 120 90"><rect x="16" y="20" width="88" height="54" rx="3" ${common}/></svg>`;
  if (shape === 'square' || shape === 'cube') return `<svg viewBox="0 0 120 90"><rect x="28" y="12" width="64" height="64" rx="3" ${common}/></svg>`;
  if (shape === 'trapezoid') return `<svg viewBox="0 0 120 90"><path d="M34 14 H86 L108 78 H12 Z" ${common}/></svg>`;
  if (shape === 'cylinder') return `<svg viewBox="0 0 120 90"><ellipse cx="60" cy="20" rx="34" ry="11" ${common}/><path d="M26 20 V68 M94 20 V68" ${common}/><ellipse cx="60" cy="68" rx="34" ry="11" ${common}/></svg>`;
  return `<span class="data-pill">${escapeHtml(shape)}</span>`;
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

function visualHtml(question: PrintableQuestion) {
  const type = String(question.type ?? '');
  const q = question as Record<string, unknown>;
  if (type === 'clock') return clockSvg(Number(q.hour ?? 0), Number(q.minute ?? 0));
  if (type === 'calendar') return calendarHtml(question);
  if (type === 'thermometer') {
    const temperature = Number(q.temperature ?? 0);
    const height = Math.max(0, Math.min(100, temperature * 2));
    return `<div class="thermometer"><div class="thermo-tube"><i style="height:${height}%"></i></div><div class="thermo-scale">${[50,40,30,20,10,0].map((v) => `<span>${v}°</span>`).join('')}</div></div>`;
  }
  if (type === 'count') return `<div class="objects">${String(q.object ?? '●').repeat(Number(q.count ?? 0))}</div>`;
  if (type === 'compare-groups') return `<div class="two-groups"><div>${String(q.object ?? '●').repeat(Number(q.leftCount ?? 0))}</div><b>?</b><div>${String(q.object ?? '●').repeat(Number(q.rightCount ?? 0))}</div></div>`;
  if (type === 'number-bond') return `<div class="number-bond"><b>${escapeHtml(q.whole)}</b><span>↙</span><span>↘</span><b>${escapeHtml(q.knownPart)}</b><b>□</b></div>`;
  if (type === 'compare' || type === 'compare-number' || type === 'comparison') return `<div class="big-expression">${escapeHtml(displayValue(q.left))} &nbsp; □ &nbsp; ${escapeHtml(displayValue(q.right))}</div>`;
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
  if (type === 'measurement' && (q.measure === 'jug' || q.measure === 'scale')) {
    const value = Number(q.value ?? 0), max = Number(q.max ?? 1000), height = Math.max(4, Math.min(100, value / max * 100));
    return `<div class="meter"><div class="meter-fill" style="height:${height}%"></div><div class="meter-scale">${[max, max*.75, max*.5, max*.25, 0].map(v=>`<span>${displayValue(v)}</span>`).join('')}</div></div>`;
  }
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
  if (type === 'shape' || type === 'solid' || type === 'polygon') return `<div class="shape-row">${shapeSvg(String(q.shape ?? q.solid ?? q.polygon ?? ''))}</div>${q.caption ? `<small>${escapeHtml(q.caption)}</small>` : ''}`;
  if (q.visualTitle || q.visualLines || q.icon) return `<div class="context"><b>${escapeHtml(q.icon ?? '')} ${escapeHtml(q.visualTitle ?? '')}</b>${(q.visualLines as unknown[] ?? []).map((line) => `<span>${escapeHtml(line)}</span>`).join('')}</div>`;
  if (q.number !== undefined) return `<div class="big-expression">${escapeHtml(displayValue(q.number))}</div>${q.caption ? `<small>${escapeHtml(q.caption)}</small>` : ''}`;
  if (q.objectIcon || q.icon) return `<div class="object-icon">${escapeHtml(q.objectIcon ?? q.icon)}</div>`;
  return '<div class="answer-space">Trình bày hoặc chọn đáp án ở bên dưới</div>';
}

function answersHtml(question: PrintableQuestion) {
  const answers = question.answers ?? [];
  if (!answers.length && Array.isArray(question.shapeOptions)) {
    return (question.shapeOptions as PrintableAnswer[]).map((answer, index) => `<span>${String.fromCharCode(65 + index)}. ${escapeHtml(answer)}</span>`).join('');
  }
  return answers.map((answer, index) => `<span>${String.fromCharCode(65 + index)}. ${escapeHtml(displayValue(answer))}</span>`).join('');
}

function correctAnswerHtml(question: PrintableQuestion) {
  if (question.type === 'odd-shape' && typeof question.correctAnswer === 'number') return `Hình ${question.correctAnswer + 1}`;
  return displayValue(question.correctAnswer);
}

function buildWorksheetHtml(options: { title: string; grade: string; size: WorksheetSize; questions: PrintableQuestion[]; includeAnswers: boolean; qr: string; code: string; }) {
  const { title, grade, size, questions, includeAnswers, qr, code } = options;
  const questionMarkup = questions.map((question, index) => `<article class="question"><h2>Câu ${index + 1}. ${escapeHtml(question.instruction)}</h2><div class="visual">${visualHtml(question)}</div><div class="answers">${answersHtml(question)}</div></article>`).join('');
  const answerMarkup = includeAnswers ? `<section class="answer-key"><h1>Đáp án</h1><div class="answer-grid">${questions.map((question, index) => `<div><b>Câu ${index + 1}</b><span>${escapeHtml(correctAnswerHtml(question))}</span>${question.explanation ? `<small>${escapeHtml(question.explanation)}</small>` : ''}</div>`).join('')}</div></section>` : '';
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Phiếu bài tập - ${escapeHtml(title)}</title><style>
  @font-face{font-family:"Be Vietnam Pro";font-weight:400;src:url("/fonts/be-vietnam-pro-vietnamese-400.woff2") format("woff2");font-display:swap}@font-face{font-family:"Be Vietnam Pro";font-weight:700;src:url("/fonts/be-vietnam-pro-vietnamese-700.woff2") format("woff2");font-display:swap}@font-face{font-family:"Be Vietnam Pro";font-weight:900;src:url("/fonts/be-vietnam-pro-vietnamese-900.woff2") format("woff2");font-display:swap}@page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#172033;background:#eef2f7;font-family:"Be Vietnam Pro","Segoe UI",Arial,sans-serif;line-height:1.42}.toolbar{position:sticky;top:0;z-index:5;display:flex;justify-content:center;gap:12px;padding:12px;background:#172033;color:white}.toolbar button{border:0;border-radius:12px;padding:11px 18px;font:800 15px inherit;cursor:pointer}.toolbar .primary{background:#7c3aed;color:white}.sheet{width:210mm;min-height:297mm;margin:18px auto;padding:12mm;background:white;box-shadow:0 16px 45px #0f172a22}.sheet-header{display:grid;grid-template-columns:1fr 28mm;gap:8mm;align-items:center;border-bottom:3px solid #172033;padding-bottom:6mm}.brand{font-size:14px;font-weight:900;color:#6d28d9;letter-spacing:.08em;text-transform:uppercase}.sheet-header h1{margin:2mm 0 1mm;font-size:23px;line-height:1.2}.meta{font-size:12px;font-weight:700;color:#475569}.qr{text-align:center;font-size:8px;font-weight:700}.qr img{display:block;width:24mm;height:24mm;margin:auto}.student{display:grid;grid-template-columns:2fr 1fr 1fr;gap:6mm;margin:6mm 0 4mm;font-size:12px;font-weight:700}.line{display:inline-block;min-width:35mm;border-bottom:1px dotted #172033}.question{break-inside:avoid;border:1.4px solid #cbd5e1;border-radius:4mm;margin:0 0 4mm;padding:4mm}.question h2{margin:0 0 3mm;font-size:14px}.visual{min-height:18mm;display:grid;place-items:center;border-radius:3mm;background:#f8fafc;padding:3mm;text-align:center}.visual svg{width:38mm;height:27mm}.visual small{display:block;margin-top:2mm;font-weight:700;color:#475569}.answers{display:grid;grid-template-columns:repeat(2,1fr);gap:2mm 5mm;margin-top:3mm;font-size:12px;font-weight:700}.answers span{padding:2mm 3mm;border:1px solid #cbd5e1;border-radius:2mm}.big-expression{font-size:24px;font-weight:900}.objects{max-width:150mm;font-size:24px;letter-spacing:3px}.two-groups{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8mm;font-size:22px}.number-bond{display:grid;grid-template-columns:repeat(2,35mm);justify-content:center;font-size:20px}.number-bond b:first-child{grid-column:1/3}.shape-row{display:flex;justify-content:center;align-items:center;gap:4mm}.shape-row>div{display:grid;place-items:center}.shape-row>div>b{font-size:10px}.shape-row svg{width:25mm;height:20mm}.clock{width:35mm!important;height:35mm!important}.fraction{display:inline-flex;flex-direction:column;font-size:22px;font-weight:900}.fraction span:first-child{border-bottom:2px solid;padding:0 8px}.sequence{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:3mm}.sequence span{border:1px solid #94a3b8;border-radius:2mm;padding:2mm 4mm;font-weight:800}.context{display:flex;flex-direction:column;gap:1mm;font-size:13px}.context b{font-size:18px}.object-icon{display:flex;flex-direction:column;font-size:38px}.object-icon small{font-size:11px}.data-table{display:flex;gap:1mm;border:1px solid #94a3b8}.data-table div{display:flex;flex-direction:column;padding:2mm 4mm;border-right:1px solid #94a3b8}.calendar{width:72mm}.calendar>b{font-size:16px}.calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);margin-top:2mm;border:1px solid #94a3b8}.calendar-grid>*{padding:1.2mm;border:.5px solid #cbd5e1;font-size:9px}.target-date{outline:2px solid #172033;font-weight:900}.thermometer{display:flex;gap:4mm;height:40mm}.thermo-tube{position:relative;width:8mm;height:38mm;border:2px solid #64748b;border-radius:5mm;overflow:hidden;background:white}.thermo-tube i{position:absolute;bottom:0;left:1.5mm;right:1.5mm;background:#ef4444;border-radius:4mm}.thermo-scale{display:flex;flex-direction:column;justify-content:space-between;font-size:8px}.ruler{position:relative;width:145mm;padding-top:8mm}.ruler-line{position:absolute;top:1mm;left:0;height:3mm;background:#2563eb}.ticks{display:flex;justify-content:space-between;border-top:2px solid}.ticks i{height:5mm;border-left:1px solid;position:relative}.ticks span{position:absolute;top:4mm;transform:translateX(-50%);font-size:7px}.meter{position:relative;width:24mm;height:38mm;border:2px solid #64748b;border-radius:2mm;overflow:hidden;background:white}.meter-fill{position:absolute;bottom:0;left:0;right:7mm;background:#60a5fa}.meter-scale{position:absolute;inset:1mm 1mm 1mm auto;display:flex;flex-direction:column;justify-content:space-between;font-size:6px}.answer-space{width:100%;border-bottom:1px dotted #64748b;color:#94a3b8;font-size:10px;text-align:left;padding:4mm}.answer-key{break-before:page}.answer-key h1{font-size:23px;border-bottom:3px solid;padding-bottom:4mm}.answer-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:3mm}.answer-grid>div{display:grid;grid-template-columns:20mm 1fr;gap:2mm;border:1px solid #cbd5e1;border-radius:3mm;padding:3mm}.answer-grid small{grid-column:1/3;color:#475569}.footer{display:flex;justify-content:space-between;margin-top:6mm;font-size:9px;color:#64748b}
  @media print{body{background:white}.toolbar{display:none}.sheet{width:auto;min-height:auto;margin:0;padding:0;box-shadow:none}.question{break-inside:avoid}.answer-key{break-before:page}}
  @media(max-width:800px){.sheet{width:100%;margin:0;padding:18px}.student{grid-template-columns:1fr}.answers{grid-template-columns:1fr}.toolbar{position:fixed;right:0;bottom:0;left:0;top:auto}.sheet{padding-bottom:82px}}
  </style></head><body><div class="toolbar"><button onclick="window.close()">Đóng</button><button class="primary" onclick="window.print()">🖨️ In hoặc lưu PDF</button></div><main class="sheet"><header class="sheet-header"><div><div class="brand">Trạng Toán · Phiếu luyện tập</div><h1>${escapeHtml(title)}</h1><div class="meta">Toán lớp ${escapeHtml(grade)} · ${size} câu · Mã đề ${escapeHtml(code)}</div></div><div class="qr"><img src="${qr}" alt="QR Trạng Toán">Quét để luyện trực tuyến</div></header><div class="student"><div>Họ và tên: <span class="line"></span></div><div>Lớp: <span class="line"></span></div><div>Ngày: <span class="line"></span></div></div>${questionMarkup}${answerMarkup}<footer class="footer"><span>trangtoan.so1.asia</span><span>Mã đề ${escapeHtml(code)}</span></footer></main></body></html>`;
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
      const qr = await QRCode.toDataURL(SITE_URL, { width: 240, margin: 1, errorCorrectionLevel: 'M' });
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
