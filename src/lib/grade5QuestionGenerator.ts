export type Grade5Module =
  | 'review' | 'decimals' | 'area-units' | 'decimal-operations'
  | 'plane-geometry' | 'semester-1-review' | 'ratio-percent'
  | 'volume-units' | 'solid-geometry' | 'time-speed'
  | 'statistics' | 'final-review';

export type Grade5SkillId =
  | 'review-natural-fraction' | 'review-operations' | 'review-geometry-measurement'
  | 'decimal-concept' | 'decimal-compare' | 'decimal-round'
  | 'hectare-square-kilometre' | 'area-unit-relations'
  | 'decimal-add-subtract' | 'decimal-multiply-divide' | 'decimal-powers-ten'
  | 'triangle-area' | 'trapezoid-area' | 'circle-perimeter-area'
  | 'semester-1-decimals' | 'semester-1-geometry' | 'semester-1-measurement'
  | 'ratio-map-scale' | 'sum-difference-ratio' | 'percent-problems'
  | 'volume-concept' | 'volume-unit-conversion'
  | 'cuboid-surface-area' | 'cube-surface-area' | 'solid-volume'
  | 'time-calculation' | 'speed-distance-time'
  | 'data-analysis' | 'pie-chart' | 'relative-frequency'
  | 'final-number-operations' | 'final-ratio-geometry' | 'final-motion-data';

export const GRADE5_SKILL_LABELS: Record<Grade5SkillId, string> = {
  'review-natural-fraction': 'Số tự nhiên và phân số',
  'review-operations': 'Các phép tính',
  'review-geometry-measurement': 'Hình học và đo lường',
  'decimal-concept': 'Khái niệm số thập phân',
  'decimal-compare': 'So sánh số thập phân',
  'decimal-round': 'Làm tròn số thập phân',
  'hectare-square-kilometre': 'Héc-ta và ki-lô-mét vuông',
  'area-unit-relations': 'Quan hệ đơn vị diện tích',
  'decimal-add-subtract': 'Cộng và trừ số thập phân',
  'decimal-multiply-divide': 'Nhân và chia số thập phân',
  'decimal-powers-ten': 'Nhân chia nhẩm với 10, 100, 1 000',
  'triangle-area': 'Diện tích tam giác',
  'trapezoid-area': 'Diện tích hình thang',
  'circle-perimeter-area': 'Chu vi và diện tích hình tròn',
  'semester-1-decimals': 'Ôn số thập phân',
  'semester-1-geometry': 'Ôn hình phẳng',
  'semester-1-measurement': 'Ôn đo lường',
  'ratio-map-scale': 'Tỉ số và tỉ lệ bản đồ',
  'sum-difference-ratio': 'Tổng – tỉ và hiệu – tỉ',
  'percent-problems': 'Tỉ số phần trăm',
  'volume-concept': 'Khái niệm thể tích',
  'volume-unit-conversion': 'Đơn vị đo thể tích',
  'cuboid-surface-area': 'Diện tích hình hộp chữ nhật',
  'cube-surface-area': 'Diện tích hình lập phương',
  'solid-volume': 'Thể tích hình khối',
  'time-calculation': 'Tính với số đo thời gian',
  'speed-distance-time': 'Vận tốc, quãng đường, thời gian',
  'data-analysis': 'Thu thập và phân tích dữ liệu',
  'pie-chart': 'Biểu đồ hình quạt tròn',
  'relative-frequency': 'Tỉ số lặp lại',
  'final-number-operations': 'Ôn số và phép tính',
  'final-ratio-geometry': 'Ôn tỉ số và hình học',
  'final-motion-data': 'Ôn chuyển động và dữ liệu',
};

export type Grade5Answer = number | string;

type BaseQuestion = {
  id: string;
  signature: string;
  skillId: Grade5SkillId;
  instruction: string;
  answers: Grade5Answer[];
  correctAnswer: Grade5Answer;
  hintSteps: [string, string, string];
  explanation: string;
};

export type Grade5Question = BaseQuestion & (
  | { type: 'expression'; expression: string; caption?: string }
  | { type: 'context'; icon: string; visualTitle: string; visualLines: string[] }
  | { type: 'compare'; left: string; right: string }
  | { type: 'fraction'; numerator: number; denominator: number; caption: string }
  | { type: 'bars'; labels: string[]; values: number[]; chartTitle: string }
  | { type: 'shape'; shape: 'triangle' | 'trapezoid' | 'circle' | 'cuboid' | 'cube' | 'pie'; measures: number[]; caption: string }
);

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(items: readonly T[]): T { return items[randomInt(0, items.length - 1)]; }
function shuffle<T>(items: readonly T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = randomInt(0, index);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}
function round(value: number, digits = 3) { const factor = 10 ** digits; return Math.round((value + Number.EPSILON) * factor) / factor; }
function vi(value: number, digits = 3) { return value.toLocaleString('vi-VN', { maximumFractionDigits: digits }); }
function qid(signature: string) { return `${signature}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : Math.abs(a); }
function fraction(n: number, d: number) { const g = gcd(n, d); return `${n / g}/${d / g}`; }

function numericAnswers(correct: number, step = 1, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const values = new Set<number>([correct]);
  for (const offset of shuffle([step, -step, step * 2, -step * 2, step * 5, -step * 5])) {
    const value = round(correct + offset);
    if (value >= min && value <= max) values.add(value);
    if (values.size === 4) break;
  }
  while (values.size < 4) {
    const value = round(correct + randomInt(-8, 8) * step);
    if (value >= min && value <= max) values.add(value);
  }
  return shuffle([...values]);
}

function stringAnswers(correct: string, candidates: string[]) {
  const values = new Set([correct]);
  candidates.forEach((candidate) => { if (candidate !== correct && values.size < 4) values.add(candidate); });
  while (values.size < 4) values.add(`${randomInt(1, 9)}/${randomInt(2, 12)}`);
  return shuffle([...values]);
}

function expression(skillId: Grade5SkillId, value: string, correct: number, explanation: string, signature: string, step = 1, caption?: string): Grade5Question {
  return {
    id: qid(signature), signature, type: 'expression', skillId, expression: value, caption,
    instruction: 'Chọn kết quả đúng.', answers: numericAnswers(correct, step), correctAnswer: correct,
    hintSteps: ['Xác định phép tính và các đơn vị.', 'Thực hiện từng bước, chú ý dấu phẩy hoặc cùng đơn vị.', explanation], explanation,
  };
}

function reviewNaturalFractionQuestion(): Grade5Question {
  if (Math.random() < 0.5) {
    const number = randomInt(100_000, 9_999_999);
    const place = pick([1_000, 10_000, 100_000, 1_000_000] as const);
    const digit = Math.floor(number / place) % 10;
    const correct = digit * place;
    return { id: qid(`g5-place-${number}-${place}`), signature: `g5-place-${number}-${place}`, type: 'context', skillId: 'review-natural-fraction', icon: '🔢', visualTitle: vi(number, 0), visualLines: ['Xác định giá trị theo hàng'], instruction: `Chữ số ${digit} có giá trị bao nhiêu?`, answers: numericAnswers(correct, place, 0), correctAnswer: correct, hintSteps: ['Xác định hàng của chữ số.', `Chữ số ${digit} ở hàng có giá trị ${vi(place, 0)}.`, `${digit} × ${vi(place, 0)} = ${vi(correct, 0)}.`], explanation: `Giá trị của chữ số ${digit} là ${vi(correct, 0)}.` };
  }
  const whole = randomInt(1, 8), denominator = randomInt(2, 9), numerator = randomInt(1, denominator - 1);
  const correct = `${whole * denominator + numerator}/${denominator}`;
  return { id: qid(`mixed-${whole}-${numerator}-${denominator}`), signature: `mixed-${whole}-${numerator}-${denominator}`, type: 'fraction', skillId: 'review-natural-fraction', numerator, denominator, caption: `Hỗn số ${whole} ${numerator}/${denominator}`, instruction: 'Hỗn số trên viết thành phân số nào?', answers: stringAnswers(correct, [`${whole + numerator}/${denominator}`, `${whole * denominator}/${denominator}`, `${whole * denominator - numerator}/${denominator}`]), correctAnswer: correct, hintSteps: ['Nhân phần nguyên với mẫu số.', `${whole} × ${denominator} = ${whole * denominator}.`, `Cộng tử số: ${whole * denominator} + ${numerator} = ${whole * denominator + numerator}.`], explanation: `${whole} ${numerator}/${denominator} = (${whole} × ${denominator} + ${numerator})/${denominator} = ${correct}.` };
}

function reviewOperationQuestion(): Grade5Question {
  const mode = pick(['natural', 'fraction'] as const);
  if (mode === 'natural') {
    const a = randomInt(12_000, 90_000), b = randomInt(1_000, 9_000), correct = a + b;
    return expression('review-operations', `${vi(a, 0)} + ${vi(b, 0)} = ?`, correct, `${vi(a, 0)} + ${vi(b, 0)} = ${vi(correct, 0)}.`, `review-op-${a}-${b}`, 100);
  }
  const d = randomInt(3, 10), a = randomInt(1, d - 1), b = randomInt(1, d - 1), correct = fraction(a + b, d);
  return { id: qid(`review-frac-${a}-${b}-${d}`), signature: `review-frac-${a}-${b}-${d}`, type: 'expression', skillId: 'review-operations', expression: `${a}/${d} + ${b}/${d} = ?`, caption: 'Cộng phân số cùng mẫu', instruction: 'Kết quả tối giản là phân số nào?', answers: stringAnswers(correct, [`${a + b}/${d + 1}`, `${a * b}/${d}`, `${a + b}/${d * 2}`]), correctAnswer: correct, hintSteps: ['Giữ nguyên mẫu số.', `Cộng tử số: ${a} + ${b} = ${a + b}.`, `Rút gọn được ${correct}.`], explanation: `${a}/${d} + ${b}/${d} = ${a + b}/${d}${`${a + b}/${d}` === correct ? '' : ` = ${correct}`}.` };
}

function reviewGeometryQuestion(): Grade5Question {
  const length = randomInt(8, 30), width = randomInt(4, length - 1), correct = length * width;
  return { id: qid(`review-area-${length}-${width}`), signature: `review-area-${length}-${width}`, type: 'context', skillId: 'review-geometry-measurement', icon: '🟦', visualTitle: `Hình chữ nhật ${length} m × ${width} m`, visualLines: ['S = chiều dài × chiều rộng'], instruction: 'Diện tích hình chữ nhật là bao nhiêu mét vuông?', answers: numericAnswers(correct, width, 0), correctAnswer: correct, hintSteps: ['Dùng công thức diện tích hình chữ nhật.', `${length} × ${width}`, `Kết quả là ${correct} m².`], explanation: `S = ${length} × ${width} = ${correct} m².` };
}

function decimalConceptQuestion(): Grade5Question {
  const hundredths = randomInt(101, 9_999), number = hundredths / 100;
  const place = pick([10, 100] as const);
  const digit = Math.floor(hundredths / (place === 10 ? 10 : 1)) % 10;
  const correct = digit / place;
  const placeName = place === 10 ? 'phần mười' : 'phần trăm';
  return { id: qid(`decimal-place-${hundredths}-${place}`), signature: `decimal-place-${hundredths}-${place}`, type: 'context', skillId: 'decimal-concept', icon: '🔎', visualTitle: vi(number), visualLines: [`Chữ số ${digit} ở hàng ${placeName}`], instruction: `Chữ số ${digit} có giá trị bao nhiêu?`, answers: numericAnswers(correct, 1 / place, 0, 9), correctAnswer: correct, hintSteps: ['Xác định vị trí sau dấu phẩy.', `Chữ số ở hàng ${placeName}.`, `Giá trị là ${vi(correct)}.`], explanation: `Trong số ${vi(number)}, chữ số ${digit} ở hàng ${placeName} nên có giá trị ${vi(correct)}.` };
}

function decimalCompareQuestion(): Grade5Question {
  const left = randomInt(100, 9_999) / 100, right = randomInt(100, 9_999) / 100;
  const correct = left === right ? '=' : left > right ? '>' : '<';
  return { id: qid(`decimal-compare-${left}-${right}`), signature: `decimal-compare-${left}-${right}`, type: 'compare', skillId: 'decimal-compare', left: vi(left), right: vi(right), instruction: 'Dấu nào thích hợp?', answers: shuffle(['>', '<', '=']), correctAnswer: correct, hintSteps: ['So sánh phần nguyên trước.', 'Nếu bằng nhau, so sánh lần lượt hàng phần mười, phần trăm.', `${vi(left)} ${correct} ${vi(right)}.`], explanation: `${vi(left)} ${correct} ${vi(right)}.` };
}

function decimalRoundQuestion(): Grade5Question {
  const number = randomInt(1001, 99_999) / 1000;
  const digits = pick([0, 1, 2] as const);
  const correct = round(number, digits);
  const label = digits === 0 ? 'hàng đơn vị' : digits === 1 ? 'hàng phần mười' : 'hàng phần trăm';
  const step = 1 / (10 ** digits);
  return { id: qid(`decimal-round-${number}-${digits}`), signature: `decimal-round-${number}-${digits}`, type: 'context', skillId: 'decimal-round', icon: '🎯', visualTitle: vi(number), visualLines: [`Làm tròn đến ${label}`], instruction: 'Số sau khi làm tròn là bao nhiêu?', answers: numericAnswers(correct, step, 0), correctAnswer: correct, hintSteps: [`Nhìn chữ số ngay bên phải ${label}.`, 'Từ 5 trở lên thì tăng 1; nhỏ hơn 5 thì giữ nguyên.', `${vi(number)} làm tròn được ${vi(correct)}.`], explanation: `${vi(number)} làm tròn đến ${label} được ${vi(correct)}.` };
}

function areaUnitQuestion(): Grade5Question {
  const variant = pick([
    { from: 'ha', to: 'm²', factor: 10_000, fact: '1 ha = 10 000 m²' },
    { from: 'km²', to: 'ha', factor: 100, fact: '1 km² = 100 ha' },
    { from: 'km²', to: 'm²', factor: 1_000_000, fact: '1 km² = 1 000 000 m²' },
    { from: 'm²', to: 'dm²', factor: 100, fact: '1 m² = 100 dm²' },
  ] as const);
  const amount = randomInt(2, variant.factor > 10_000 ? 5 : 12), correct = amount * variant.factor;
  const skillId: Grade5SkillId = variant.from.includes('km') || variant.from === 'ha' ? 'hectare-square-kilometre' : 'area-unit-relations';
  return { id: qid(`area-unit-${amount}-${variant.from}-${variant.to}`), signature: `area-unit-${amount}-${variant.from}-${variant.to}`, type: 'context', skillId, icon: '🗺️', visualTitle: `${amount} ${variant.from} = ? ${variant.to}`, visualLines: [variant.fact], instruction: 'Số nào thích hợp với dấu hỏi?', answers: numericAnswers(correct, variant.factor, 0), correctAnswer: correct, hintSteps: [`Nhớ ${variant.fact}.`, `Tính ${amount} × ${vi(variant.factor, 0)}.`, `Kết quả là ${vi(correct, 0)} ${variant.to}.`], explanation: `${amount} ${variant.from} = ${amount} × ${vi(variant.factor, 0)} = ${vi(correct, 0)} ${variant.to}.` };
}

function decimalOperationQuestion(): Grade5Question {
  const mode = pick(['add', 'subtract', 'multiply', 'divide'] as const);
  if (mode === 'add' || mode === 'subtract') {
    let a = randomInt(100, 9_000) / 100, b = randomInt(10, 900) / 100;
    if (mode === 'subtract' && b > a) [a, b] = [b, a];
    const correct = round(mode === 'add' ? a + b : a - b, 2), symbol = mode === 'add' ? '+' : '−';
    return expression('decimal-add-subtract', `${vi(a)} ${symbol} ${vi(b)} = ?`, correct, `Đặt dấu phẩy thẳng cột: ${vi(a)} ${symbol} ${vi(b)} = ${vi(correct)}.`, `decimal-${mode}-${a}-${b}`, 0.1);
  }
  if (mode === 'multiply') {
    const a = randomInt(12, 500) / 10, b = randomInt(2, 20) / 10, correct = round(a * b, 2);
    return expression('decimal-multiply-divide', `${vi(a)} × ${vi(b)} = ?`, correct, `${vi(a)} × ${vi(b)} = ${vi(correct)}.`, `decimal-multiply-${a}-${b}`, 0.1);
  }
  const divisor = randomInt(2, 20) / 10, quotient = randomInt(10, 300) / 10, dividend = round(divisor * quotient, 2);
  return expression('decimal-multiply-divide', `${vi(dividend)} : ${vi(divisor)} = ?`, quotient, `${vi(dividend)} : ${vi(divisor)} = ${vi(quotient)}.`, `decimal-divide-${dividend}-${divisor}`, 0.1);
}

function decimalPowerTenQuestion(): Grade5Question {
  const value = randomInt(101, 9_999) / 100, factor = pick([10, 100, 1_000] as const), multiply = Math.random() < 0.5;
  const correct = round(multiply ? value * factor : value / factor, 5), symbol = multiply ? '×' : ':';
  return expression('decimal-powers-ten', `${vi(value)} ${symbol} ${vi(factor, 0)} = ?`, correct, `${multiply ? 'Dịch dấu phẩy sang phải' : 'Dịch dấu phẩy sang trái'} ${Math.log10(factor)} chữ số, được ${vi(correct, 5)}.`, `decimal-power-${value}-${factor}-${multiply}`, multiply ? 1 : 0.001);
}

function triangleAreaQuestion(): Grade5Question {
  const base = randomInt(4, 24), height = randomInt(3, 16) * 2, correct = base * height / 2;
  return { id: qid(`triangle-${base}-${height}`), signature: `triangle-${base}-${height}`, type: 'shape', skillId: 'triangle-area', shape: 'triangle', measures: [base, height], caption: `Đáy ${base} cm · Chiều cao ${height} cm`, instruction: 'Diện tích tam giác là bao nhiêu cm²?', answers: numericAnswers(correct, base, 0), correctAnswer: correct, hintSteps: ['S = đáy × chiều cao : 2.', `${base} × ${height} : 2`, `Kết quả là ${correct} cm².`], explanation: `S = ${base} × ${height} : 2 = ${correct} cm².` };
}

function trapezoidAreaQuestion(): Grade5Question {
  const a = randomInt(5, 16), b = randomInt(a + 2, 25), height = randomInt(3, 12) * 2, correct = (a + b) * height / 2;
  return { id: qid(`trapezoid-${a}-${b}-${height}`), signature: `trapezoid-${a}-${b}-${height}`, type: 'shape', skillId: 'trapezoid-area', shape: 'trapezoid', measures: [a, b, height], caption: `Hai đáy ${a} cm, ${b} cm · Cao ${height} cm`, instruction: 'Diện tích hình thang là bao nhiêu cm²?', answers: numericAnswers(correct, height, 0), correctAnswer: correct, hintSteps: ['S = (a + b) × h : 2.', `(${a} + ${b}) × ${height} : 2`, `Kết quả là ${correct} cm².`], explanation: `S = (${a} + ${b}) × ${height} : 2 = ${correct} cm².` };
}

function circleQuestion(): Grade5Question {
  const radius = randomInt(2, 12), area = Math.random() < 0.5;
  const correct = round(area ? radius * radius * 3.14 : radius * 2 * 3.14, 2);
  return { id: qid(`circle-${radius}-${area}`), signature: `circle-${radius}-${area}`, type: 'shape', skillId: 'circle-perimeter-area', shape: 'circle', measures: [radius], caption: `Bán kính ${radius} cm`, instruction: `${area ? 'Diện tích' : 'Chu vi'} hình tròn là bao nhiêu?`, answers: numericAnswers(correct, 3.14, 0), correctAnswer: correct, hintSteps: [area ? 'S = r × r × 3,14.' : 'C = r × 2 × 3,14.', area ? `${radius} × ${radius} × 3,14` : `${radius} × 2 × 3,14`, `Kết quả là ${vi(correct)} ${area ? 'cm²' : 'cm'}.`], explanation: `${area ? 'S' : 'C'} = ${area ? `${radius} × ${radius}` : `${radius} × 2`} × 3,14 = ${vi(correct)} ${area ? 'cm²' : 'cm'}.` };
}

function ratioPercentQuestion(): Grade5Question {
  const mode = pick(['percent', 'value', 'ratio'] as const);
  if (mode === 'percent') {
    const total = pick([40, 50, 80, 100, 200]), percent = pick([10, 20, 25, 40, 50, 75]), part = total * percent / 100;
    return { id: qid(`percent-${part}-${total}`), signature: `percent-${part}-${total}`, type: 'context', skillId: 'percent-problems', icon: '💯', visualTitle: `${vi(part)} trong ${total}`, visualLines: ['Tìm tỉ số phần trăm'], instruction: `${vi(part)} chiếm bao nhiêu phần trăm của ${total}?`, answers: numericAnswers(percent, 5, 0, 100), correctAnswer: percent, hintSteps: [`Lấy ${vi(part)} chia ${total}.`, `Nhân thương với 100%.`, `Kết quả là ${percent}%.`], explanation: `${vi(part)} : ${total} × 100% = ${percent}%.` };
  }
  if (mode === 'value') {
    const whole = pick([80, 120, 160, 200, 240, 400]), percent = pick([10, 20, 25, 50, 75]), correct = whole * percent / 100;
    return { id: qid(`percent-value-${whole}-${percent}`), signature: `percent-value-${whole}-${percent}`, type: 'context', skillId: 'percent-problems', icon: '🎯', visualTitle: `${percent}% của ${whole}`, visualLines: ['Giá trị phần trăm'], instruction: `${percent}% của ${whole} bằng bao nhiêu?`, answers: numericAnswers(correct, whole / 20, 0), correctAnswer: correct, hintSteps: [`Tìm 1%: ${whole} : 100.`, `Nhân kết quả với ${percent}.`, `Kết quả là ${correct}.`], explanation: `${whole} × ${percent} : 100 = ${correct}.` };
  }
  const a = randomInt(2, 12), b = randomInt(2, 12), correct = fraction(a, b);
  return { id: qid(`ratio-${a}-${b}`), signature: `ratio-${a}-${b}`, type: 'context', skillId: 'ratio-map-scale', icon: '⚖️', visualTitle: `${a} bóng đỏ · ${b} bóng xanh`, visualLines: ['Tỉ số bóng đỏ so với bóng xanh'], instruction: 'Tỉ số cần tìm là bao nhiêu?', answers: stringAnswers(correct, [`${b}/${a}`, `${a + b}/${b}`, `${a}/${a + b}`]), correctAnswer: correct, hintSteps: ['Viết số bóng đỏ trên số bóng xanh.', `${a}/${b}.`, `Rút gọn được ${correct}.`], explanation: `Tỉ số là ${a} : ${b} = ${a}/${b}${`${a}/${b}` === correct ? '' : ` = ${correct}`}.` };
}

function sumRatioQuestion(): Grade5Question {
  const firstParts = randomInt(1, 4), secondParts = randomInt(firstParts + 1, 7), unit = randomInt(8, 30), useDifference = Math.random() < 0.5;
  const known = useDifference ? (secondParts - firstParts) * unit : (firstParts + secondParts) * unit;
  const askLarge = Math.random() < 0.5, correct = (askLarge ? secondParts : firstParts) * unit;
  const operation = useDifference ? '−' : '+';
  const partCount = useDifference ? secondParts - firstParts : firstParts + secondParts;
  return { id: qid(`ratio-parts-${firstParts}-${secondParts}-${unit}-${useDifference}-${askLarge}`), signature: `ratio-parts-${firstParts}-${secondParts}-${unit}-${useDifference}-${askLarge}`, type: 'context', skillId: 'sum-difference-ratio', icon: '🧩', visualTitle: `${useDifference ? 'Hiệu' : 'Tổng'} ${known} · Tỉ số ${firstParts}:${secondParts}`, visualLines: [askLarge ? 'Tìm số lớn' : 'Tìm số bé'], instruction: `${askLarge ? 'Số lớn' : 'Số bé'} bằng bao nhiêu?`, answers: numericAnswers(correct, unit, 0), correctAnswer: correct, hintSteps: [`${useDifference ? 'Hiệu' : 'Tổng'} số phần: ${secondParts} ${operation} ${firstParts} = ${partCount}.`, `Một phần: ${known} : ${partCount} = ${unit}.`, `${askLarge ? secondParts : firstParts} phần bằng ${correct}.`], explanation: `Một phần là ${unit}; ${askLarge ? 'số lớn' : 'số bé'} = ${unit} × ${askLarge ? secondParts : firstParts} = ${correct}.` };
}

function mapScaleQuestion(): Grade5Question {
  const scale = pick([100_000, 200_000, 500_000] as const), mapCentimetres = randomInt(2, 12), realKilometres = mapCentimetres * scale / 100_000;
  return { id: qid(`map-scale-${scale}-${mapCentimetres}`), signature: `map-scale-${scale}-${mapCentimetres}`, type: 'context', skillId: 'ratio-map-scale', icon: '🗺️', visualTitle: `Tỉ lệ 1 : ${vi(scale, 0)}`, visualLines: [`Trên bản đồ: ${mapCentimetres} cm`, '100 000 cm = 1 km'], instruction: 'Khoảng cách thực tế là bao nhiêu ki-lô-mét?', answers: numericAnswers(realKilometres, Math.max(1, scale / 100_000), 0), correctAnswer: realKilometres, hintSteps: [`Khoảng cách thực theo xăng-ti-mét: ${mapCentimetres} × ${vi(scale, 0)}.`, `Đổi xăng-ti-mét sang ki-lô-mét bằng cách chia 100 000.`, `Kết quả là ${realKilometres} km.`], explanation: `${mapCentimetres} × ${vi(scale, 0)} : 100 000 = ${realKilometres} km.` };
}

function volumeUnitQuestion(): Grade5Question {
  const variant = pick([{ from: 'm³', to: 'dm³', factor: 1_000 }, { from: 'dm³', to: 'cm³', factor: 1_000 }, { from: 'm³', to: 'cm³', factor: 1_000_000 }] as const);
  const amount = randomInt(2, variant.factor > 1_000 ? 5 : 12), correct = amount * variant.factor;
  return { id: qid(`volume-unit-${amount}-${variant.from}-${variant.to}`), signature: `volume-unit-${amount}-${variant.from}-${variant.to}`, type: 'context', skillId: 'volume-unit-conversion', icon: '🧱', visualTitle: `${amount} ${variant.from} = ? ${variant.to}`, visualLines: [`1 ${variant.from} = ${vi(variant.factor, 0)} ${variant.to}`], instruction: 'Số nào thích hợp?', answers: numericAnswers(correct, variant.factor, 0), correctAnswer: correct, hintSteps: [`Mỗi bậc đơn vị thể tích gấp 1 000 lần.`, `Tính ${amount} × ${vi(variant.factor, 0)}.`, `Kết quả ${vi(correct, 0)} ${variant.to}.`], explanation: `${amount} ${variant.from} = ${vi(correct, 0)} ${variant.to}.` };
}

function volumeConceptQuestion(): Grade5Question {
  const length = randomInt(2, 7), width = randomInt(2, 6), height = randomInt(2, 5), correct = length * width * height;
  return { id: qid(`unit-cubes-${length}-${width}-${height}`), signature: `unit-cubes-${length}-${width}-${height}`, type: 'shape', skillId: 'volume-concept', shape: 'cuboid', measures: [length, width, height], caption: `${length} × ${width} × ${height} khối đơn vị`, instruction: 'Hình khối gồm bao nhiêu khối lập phương đơn vị?', answers: numericAnswers(correct, length, 0), correctAnswer: correct, hintSteps: [`Mỗi lớp có ${length} × ${width} khối.`, `Có ${height} lớp.`, `Tổng là ${length} × ${width} × ${height} = ${correct} khối.`], explanation: `Số khối đơn vị là ${length} × ${width} × ${height} = ${correct}.` };
}

function solidQuestion(): Grade5Question {
  const cube = Math.random() < 0.4;
  if (cube) {
    const edge = randomInt(2, 12), mode = Math.random() < 0.5 ? 'area' : 'volume', correct = mode === 'area' ? edge * edge * 6 : edge ** 3;
    return { id: qid(`cube-${edge}-${mode}`), signature: `cube-${edge}-${mode}`, type: 'shape', skillId: mode === 'area' ? 'cube-surface-area' : 'solid-volume', shape: 'cube', measures: [edge], caption: `Cạnh ${edge} cm`, instruction: `${mode === 'area' ? 'Diện tích toàn phần' : 'Thể tích'} hình lập phương là bao nhiêu?`, answers: numericAnswers(correct, edge * edge, 0), correctAnswer: correct, hintSteps: [mode === 'area' ? 'S = a × a × 6.' : 'V = a × a × a.', mode === 'area' ? `${edge} × ${edge} × 6` : `${edge} × ${edge} × ${edge}`, `Kết quả là ${correct} ${mode === 'area' ? 'cm²' : 'cm³'}.`], explanation: `${mode === 'area' ? 'S' : 'V'} = ${mode === 'area' ? `${edge} × ${edge} × 6` : `${edge} × ${edge} × ${edge}`} = ${correct} ${mode === 'area' ? 'cm²' : 'cm³'}.` };
  }
  const length = randomInt(5, 16), width = randomInt(3, length - 1), height = randomInt(2, 10), mode = Math.random() < 0.5 ? 'surface' : 'volume';
  const correct = mode === 'surface' ? 2 * height * (length + width) : length * width * height;
  return { id: qid(`cuboid-${length}-${width}-${height}-${mode}`), signature: `cuboid-${length}-${width}-${height}-${mode}`, type: 'shape', skillId: mode === 'surface' ? 'cuboid-surface-area' : 'solid-volume', shape: 'cuboid', measures: [length, width, height], caption: `${length} cm × ${width} cm × ${height} cm`, instruction: `${mode === 'surface' ? 'Diện tích xung quanh' : 'Thể tích'} hình hộp là bao nhiêu?`, answers: numericAnswers(correct, height * 2, 0), correctAnswer: correct, hintSteps: [mode === 'surface' ? 'Sxq = (dài + rộng) × 2 × cao.' : 'V = dài × rộng × cao.', mode === 'surface' ? `(${length} + ${width}) × 2 × ${height}` : `${length} × ${width} × ${height}`, `Kết quả là ${correct} ${mode === 'surface' ? 'cm²' : 'cm³'}.`], explanation: `${mode === 'surface' ? 'Sxq' : 'V'} = ${correct} ${mode === 'surface' ? 'cm²' : 'cm³'}.` };
}

function solidNetQuestion(): Grade5Question {
  const cube = Math.random() < 0.5;
  const correct = cube ? '6 hình vuông' : '6 hình chữ nhật';
  return { id: qid(`solid-net-${cube}-${Math.random().toString(36).slice(2, 6)}`), signature: `solid-net-${cube}-${Math.random().toString(36).slice(2, 6)}`, type: 'context', skillId: cube ? 'cube-surface-area' : 'cuboid-surface-area', icon: '🧩', visualTitle: cube ? 'Hình khai triển của khối lập phương' : 'Hình khai triển của hình hộp chữ nhật', visualLines: ['Các mặt được trải phẳng'], instruction: 'Hình khai triển gồm những mặt nào?', answers: shuffle([correct, '4 hình vuông', '4 hình chữ nhật', '8 hình tam giác']), correctAnswer: correct, hintSteps: ['Hình khối có 6 mặt.', cube ? 'Mỗi mặt của khối lập phương là hình vuông.' : 'Mỗi mặt của hình hộp là hình chữ nhật.', `Hình khai triển gồm ${correct}.`], explanation: `${cube ? 'Khối lập phương' : 'Hình hộp chữ nhật'} có 6 mặt, nên hình khai triển gồm ${correct}.` };
}

function timeQuestion(): Grade5Question {
  if (Math.random() < 0.5) {
    const firstHours = randomInt(1, 5), firstMinutes = randomInt(10, 55), secondHours = randomInt(1, 4), secondMinutes = randomInt(10, 55);
    const totalMinutes = firstHours * 60 + firstMinutes + secondHours * 60 + secondMinutes, resultHours = Math.floor(totalMinutes / 60), resultMinutes = totalMinutes % 60;
    const correct = `${resultHours} giờ ${resultMinutes} phút`;
    const answers = new Set([correct, `${firstHours + secondHours} giờ ${firstMinutes + secondMinutes} phút`, `${resultHours + 1} giờ ${resultMinutes} phút`, `${resultHours} giờ ${Math.max(0, resultMinutes - 10)} phút`]);
    let extra = resultHours + 2; while (answers.size < 4) { answers.add(`${extra} giờ ${resultMinutes} phút`); extra += 1; }
    return { id: qid(`time-add-${firstHours}-${firstMinutes}-${secondHours}-${secondMinutes}`), signature: `time-add-${firstHours}-${firstMinutes}-${secondHours}-${secondMinutes}`, type: 'context', skillId: 'time-calculation', icon: '⏱️', visualTitle: `${firstHours} giờ ${firstMinutes} phút + ${secondHours} giờ ${secondMinutes} phút`, visualLines: ['60 phút = 1 giờ'], instruction: 'Tổng thời gian là bao nhiêu?', answers: shuffle([...answers].slice(0, 4)), correctAnswer: correct, hintSteps: ['Cộng số phút và số giờ.', `Tổng là ${totalMinutes} phút.`, `${totalMinutes} phút = ${correct}.`], explanation: `Tổng thời gian bằng ${totalMinutes} phút = ${correct}.` };
  }
  const hours = randomInt(1, 5), minutes = randomInt(5, 55), multiplier = randomInt(2, 4), totalMinutes = (hours * 60 + minutes) * multiplier, resultHours = Math.floor(totalMinutes / 60), resultMinutes = totalMinutes % 60;
  const correct = `${resultHours} giờ ${resultMinutes} phút`;
  const candidates = [`${hours * multiplier} giờ ${minutes * multiplier} phút`, `${resultHours + 1} giờ ${resultMinutes} phút`, `${resultHours} giờ ${Math.max(0, resultMinutes - 10)} phút`];
  const answers = new Set([correct]);
  candidates.forEach((candidate) => answers.add(candidate));
  let extraHours = resultHours + 2;
  while (answers.size < 4) { answers.add(`${extraHours} giờ ${resultMinutes} phút`); extraHours += 1; }
  return { id: qid(`time-multiply-${hours}-${minutes}-${multiplier}`), signature: `time-multiply-${hours}-${minutes}-${multiplier}`, type: 'context', skillId: 'time-calculation', icon: '⏱️', visualTitle: `${hours} giờ ${minutes} phút × ${multiplier}`, visualLines: ['60 phút = 1 giờ'], instruction: 'Kết quả là bao nhiêu?', answers: shuffle([...answers].slice(0, 4)), correctAnswer: correct, hintSteps: ['Đổi thời gian ra phút.', `${hours * 60 + minutes} × ${multiplier} = ${totalMinutes} phút.`, `${totalMinutes} phút = ${correct}.`], explanation: `${hours} giờ ${minutes} phút × ${multiplier} = ${totalMinutes} phút = ${correct}.` };
}

function motionQuestion(): Grade5Question {
  const speed = randomInt(3, 15) * 5, time = randomInt(2, 6), distance = speed * time, ask = pick(['distance', 'speed', 'time'] as const);
  const correct = ask === 'distance' ? distance : ask === 'speed' ? speed : time;
  return { id: qid(`motion-${speed}-${time}-${ask}`), signature: `motion-${speed}-${time}-${ask}`, type: 'context', skillId: 'speed-distance-time', icon: '🚗', visualTitle: ask === 'distance' ? `v = ${speed} km/giờ · t = ${time} giờ` : ask === 'speed' ? `s = ${distance} km · t = ${time} giờ` : `s = ${distance} km · v = ${speed} km/giờ`, visualLines: ['s = v × t · v = s : t · t = s : v'], instruction: `${ask === 'distance' ? 'Quãng đường' : ask === 'speed' ? 'Vận tốc' : 'Thời gian'} bằng bao nhiêu?`, answers: numericAnswers(correct, ask === 'time' ? 1 : 5, 0), correctAnswer: correct, hintSteps: [ask === 'distance' ? 's = v × t.' : ask === 'speed' ? 'v = s : t.' : 't = s : v.', ask === 'distance' ? `${speed} × ${time}` : ask === 'speed' ? `${distance} : ${time}` : `${distance} : ${speed}`, `Kết quả là ${correct} ${ask === 'distance' ? 'km' : ask === 'speed' ? 'km/giờ' : 'giờ'}.`], explanation: `${ask === 'distance' ? 's' : ask === 'speed' ? 'v' : 't'} = ${correct} ${ask === 'distance' ? 'km' : ask === 'speed' ? 'km/giờ' : 'giờ'}.` };
}

function dataQuestion(): Grade5Question {
  const values = [randomInt(8, 15), randomInt(16, 23), randomInt(24, 31), randomInt(32, 40)], labels = ['A', 'B', 'C', 'D'], max = Math.max(...values), min = Math.min(...values), difference = max - min;
  return { id: qid(`data-${values.join('-')}`), signature: `data-${values.join('-')}`, type: 'bars', skillId: 'data-analysis', labels, values, chartTitle: 'Số sản phẩm bốn nhóm hoàn thành', instruction: 'Nhóm nhiều nhất hơn nhóm ít nhất bao nhiêu sản phẩm?', answers: numericAnswers(difference, 2, 0), correctAnswer: difference, hintSteps: ['Tìm cột cao nhất và thấp nhất.', `Giá trị lớn nhất ${max}, nhỏ nhất ${min}.`, `${max} − ${min} = ${difference}.`], explanation: `Hiệu là ${max} − ${min} = ${difference} sản phẩm.` };
}

function pieQuestion(): Grade5Question {
  const percent = pick([20, 25, 30, 40, 50, 60] as const), total = pick([40, 80, 100, 120, 200] as const), correct = total * percent / 100;
  return { id: qid(`pie-${percent}-${total}`), signature: `pie-${percent}-${total}`, type: 'shape', skillId: 'pie-chart', shape: 'pie', measures: [percent], caption: `${percent}% học sinh chọn bóng đá`, instruction: `Lớp có ${total} học sinh tham gia khảo sát. Có bao nhiêu bạn chọn bóng đá?`, answers: numericAnswers(correct, total / 20, 0), correctAnswer: correct, hintSteps: [`Tìm ${percent}% của ${total}.`, `${total} × ${percent} : 100`, `Kết quả là ${correct} học sinh.`], explanation: `${total} × ${percent} : 100 = ${correct} học sinh.` };
}

function frequencyQuestion(): Grade5Question {
  const total = pick([20, 40, 50, 100]), wins = randomInt(2, Math.floor(total * 0.8)), correct = fraction(wins, total);
  return { id: qid(`frequency-${wins}-${total}`), signature: `frequency-${wins}-${total}`, type: 'context', skillId: 'relative-frequency', icon: '🎲', visualTitle: `${wins} lần xuất hiện trong ${total} lần`, visualLines: ['Tỉ số = số lần xuất hiện : tổng số lần'], instruction: 'Tỉ số số lần xuất hiện là bao nhiêu?', answers: stringAnswers(correct, [`${total}/${wins}`, `${wins + 1}/${total}`, `${wins}/${total + 1}`]), correctAnswer: correct, hintSteps: [`Viết ${wins}/${total}.`, 'Rút gọn cả tử và mẫu.', `Kết quả là ${correct}.`], explanation: `Tỉ số là ${wins}/${total}${`${wins}/${total}` === correct ? '' : ` = ${correct}`}.` };
}

function remap(question: Grade5Question, skillId: Grade5SkillId): Grade5Question { return { ...question, skillId }; }
type Factory = () => Grade5Question;

function uniqueQuestions(plan: Factory[], total: 5 | 10 | 15) {
  const questions: Grade5Question[] = [], signatures = new Set<string>();
  let attempts = 0;
  while (questions.length < total && attempts < total * 50) {
    const question = plan[questions.length % plan.length]();
    attempts += 1;
    if (signatures.has(question.signature)) continue;
    signatures.add(question.signature);
    questions.push(question);
  }
  return shuffle(questions);
}

export function generateGrade5Questions(module: Grade5Module, total: 5 | 10 | 15 = 10) {
  const plans: Record<Grade5Module, Factory[]> = {
    review: [reviewNaturalFractionQuestion, reviewOperationQuestion, reviewGeometryQuestion, reviewNaturalFractionQuestion, reviewOperationQuestion],
    decimals: [decimalConceptQuestion, decimalCompareQuestion, decimalRoundQuestion, decimalConceptQuestion, decimalRoundQuestion],
    'area-units': [areaUnitQuestion, areaUnitQuestion, areaUnitQuestion, areaUnitQuestion],
    'decimal-operations': [decimalOperationQuestion, decimalPowerTenQuestion, decimalOperationQuestion, decimalPowerTenQuestion, decimalOperationQuestion],
    'plane-geometry': [triangleAreaQuestion, trapezoidAreaQuestion, circleQuestion, triangleAreaQuestion, circleQuestion],
    'semester-1-review': [() => remap(decimalCompareQuestion(), 'semester-1-decimals'), () => remap(decimalOperationQuestion(), 'semester-1-decimals'), () => remap(triangleAreaQuestion(), 'semester-1-geometry'), () => remap(circleQuestion(), 'semester-1-geometry'), () => remap(areaUnitQuestion(), 'semester-1-measurement')],
    'ratio-percent': [ratioPercentQuestion, sumRatioQuestion, mapScaleQuestion, ratioPercentQuestion, sumRatioQuestion],
    'volume-units': [volumeConceptQuestion, volumeUnitQuestion, volumeUnitQuestion, volumeConceptQuestion],
    'solid-geometry': [solidNetQuestion, solidQuestion, solidQuestion, solidNetQuestion, solidQuestion],
    'time-speed': [timeQuestion, motionQuestion, motionQuestion, timeQuestion, motionQuestion],
    statistics: [dataQuestion, pieQuestion, frequencyQuestion, dataQuestion, pieQuestion],
    'final-review': [() => remap(decimalOperationQuestion(), 'final-number-operations'), () => remap(reviewOperationQuestion(), 'final-number-operations'), () => remap(ratioPercentQuestion(), 'final-ratio-geometry'), () => remap(solidQuestion(), 'final-ratio-geometry'), () => remap(motionQuestion(), 'final-motion-data'), () => remap(dataQuestion(), 'final-motion-data')],
  };
  return uniqueQuestions(plans[module], total);
}
