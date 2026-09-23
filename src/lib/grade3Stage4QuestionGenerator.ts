export type Grade3Stage4Module = 'numbers10000' | 'perimeterArea' | 'arithmetic10000';

export type Grade3Stage4SkillId =
  | 'four-digit-numbers'
  | 'compare-to-10000'
  | 'roman-numerals'
  | 'round-tens-hundreds'
  | 'perimeter-plane-shapes'
  | 'area-concept'
  | 'rectangle-square-area'
  | 'add-subtract-10000'
  | 'multiply-four-by-one'
  | 'divide-four-by-one';

export type Grade3Stage4Answer = number | string;

export const GRADE3_STAGE4_SKILL_LABELS: Record<Grade3Stage4SkillId, string> = {
  'four-digit-numbers': 'Số có bốn chữ số',
  'compare-to-10000': 'So sánh và sắp xếp số',
  'roman-numerals': 'Chữ số La Mã',
  'round-tens-hundreds': 'Làm tròn số',
  'perimeter-plane-shapes': 'Chu vi hình phẳng',
  'area-concept': 'Diện tích và xăng-ti-mét vuông',
  'rectangle-square-area': 'Diện tích hình chữ nhật, hình vuông',
  'add-subtract-10000': 'Cộng và trừ đến 10 000',
  'multiply-four-by-one': 'Nhân số có bốn chữ số',
  'divide-four-by-one': 'Chia số có bốn chữ số',
};

type BaseQuestion = {
  id: string;
  signature: string;
  skillId: Grade3Stage4SkillId;
  instruction: string;
  answers: Grade3Stage4Answer[];
  correctAnswer: Grade3Stage4Answer;
  hintSteps: [string, string, string];
  explanation: string;
};

export type NumberCardQuestion = BaseQuestion & {
  type: 'number-card';
  value: number;
  highlightPlace?: 'thousands' | 'hundreds' | 'tens' | 'ones';
  expanded?: string;
};

export type ComparisonQuestion = BaseQuestion & {
  type: 'comparison';
  values: number[];
  mode: 'symbol' | 'order';
};

export type RomanQuestion = BaseQuestion & {
  type: 'roman';
  arabic: number;
  roman: string;
  askFor: 'arabic' | 'roman';
};

export type NumberLineQuestion = BaseQuestion & {
  type: 'number-line';
  value: number;
  lower: number;
  upper: number;
  midpoint: number;
  unit: 10 | 100;
};

export type ShapeQuestion = BaseQuestion & {
  type: 'shape';
  shape: 'triangle' | 'quadrilateral' | 'rectangle' | 'square';
  sides: number[];
  width?: number;
  height?: number;
  unit: 'cm';
  task: 'perimeter' | 'area';
};

export type AreaGridQuestion = BaseQuestion & {
  type: 'area-grid';
  rows: number;
  columns: number;
  cellUnit: 'cm²';
};

export type CalculationQuestion = BaseQuestion & {
  type: 'calculation';
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  left: number;
  right: number;
};

export type Grade3Stage4Question =
  | NumberCardQuestion
  | ComparisonQuestion
  | RomanQuestion
  | NumberLineQuestion
  | ShapeQuestion
  | AreaGridQuestion
  | CalculationQuestion;

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'] as const;
const ROMAN_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'] as const;

const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: readonly T[]): T => items[ri(0, items.length - 1)];

function shuffle<T>(items: readonly T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = ri(0, index);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

const qid = (signature: string) => `${signature}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const formatNumber = (value: number) => value.toLocaleString('vi-VN');

function numberAnswers(correct: number, min: number, max: number, offsets: readonly number[]) {
  const values = new Set<number>([correct]);
  for (const offset of shuffle(offsets)) {
    const candidate = correct + offset;
    if (candidate >= min && candidate <= max) values.add(candidate);
    if (values.size === 4) break;
  }
  while (values.size < 4) values.add(ri(min, max));
  return shuffle([...values]);
}

function readTwoDigits(value: number) {
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  if (tens === 0) return ones ? DIGITS[ones] : '';
  if (tens === 1) return ones === 0 ? 'mười' : `mười ${ones === 5 ? 'lăm' : DIGITS[ones]}`;
  if (ones === 0) return `${DIGITS[tens]} mươi`;
  const onesWord = ones === 1 ? 'mốt' : ones === 5 ? 'lăm' : DIGITS[ones];
  return `${DIGITS[tens]} mươi ${onesWord}`;
}

function readThreeDigits(value: number, full = false) {
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  if (!hundreds && !full) return readTwoDigits(remainder);
  const prefix = `${DIGITS[hundreds]} trăm`;
  if (!remainder) return prefix;
  if (remainder < 10) return `${prefix} linh ${DIGITS[remainder]}`;
  return `${prefix} ${readTwoDigits(remainder)}`;
}

function readVietnameseNumber(value: number) {
  if (value === 10000) return 'mười nghìn';
  const thousands = Math.floor(value / 1000);
  const remainder = value % 1000;
  if (!remainder) return `${DIGITS[thousands]} nghìn`;
  return `${DIGITS[thousands]} nghìn ${readThreeDigits(remainder, remainder < 100)}`;
}

function randomFourDigitNumber() {
  return ri(1000, 9999);
}

function fourDigitQuestion(): NumberCardQuestion {
  const mode = pick(['read', 'expanded', 'digit-value'] as const);
  const value = mode === 'read' && Math.random() < 0.12 ? 10000 : randomFourDigitNumber();
  const digits = value === 10000 ? [10, 0, 0, 0] : [Math.floor(value / 1000), Math.floor(value / 100) % 10, Math.floor(value / 10) % 10, value % 10];
  const expanded = value === 10000 ? '10 000' : `${digits[0] * 1000} + ${digits[1] * 100} + ${digits[2] * 10} + ${digits[3]}`;
  if (mode === 'read') {
    const correct = readVietnameseNumber(value);
    const alternatives = new Set<string>([correct]);
    while (alternatives.size < 4) alternatives.add(readVietnameseNumber(Math.max(1000, Math.min(10000, value + pick([-1000, -100, -10, 10, 100, 1000])))));
    return { id: qid(`read-${value}`), signature: `read-${value}`, type: 'number-card', skillId: 'four-digit-numbers', value, instruction: `Số ${formatNumber(value)} được đọc như thế nào?`, answers: shuffle([...alternatives]), correctAnswer: correct, hintSteps: ['Đọc lần lượt từ hàng nghìn đến hàng đơn vị.', 'Chú ý hàng nào có chữ số 0.', `Số này đọc là “${correct}”.`], explanation: `${formatNumber(value)} đọc là “${correct}”.` };
  }
  if (mode === 'expanded') {
    const variants = new Set<string>([expanded]);
    while (variants.size < 4) {
      const changedPlace = ri(0, 3);
      const changed = [...digits];
      changed[changedPlace] = Math.max(0, changed[changedPlace] + pick([-1, 1]));
      variants.add(`${changed[0] * 1000} + ${changed[1] * 100} + ${changed[2] * 10} + ${changed[3]}`);
    }
    return { id: qid(`expanded-${value}`), signature: `expanded-${value}`, type: 'number-card', skillId: 'four-digit-numbers', value, expanded, instruction: `Cách phân tích số ${formatNumber(value)} nào đúng?`, answers: shuffle([...variants]), correctAnswer: expanded, hintSteps: ['Xác định chữ số ở từng hàng.', 'Nhân mỗi chữ số với giá trị của hàng đó.', `${formatNumber(value)} = ${expanded}.`], explanation: `${formatNumber(value)} = ${expanded}.` };
  }
  const placeIndex = ri(0, 3);
  const placeNames = ['hàng nghìn', 'hàng trăm', 'hàng chục', 'hàng đơn vị'] as const;
  const placeKeys = ['thousands', 'hundreds', 'tens', 'ones'] as const;
  const placeValues = [1000, 100, 10, 1] as const;
  const correct = digits[placeIndex] * placeValues[placeIndex];
  return { id: qid(`place-${value}-${placeIndex}`), signature: `place-${value}-${placeIndex}`, type: 'number-card', skillId: 'four-digit-numbers', value, highlightPlace: placeKeys[placeIndex], instruction: `Chữ số ${digits[placeIndex]} ở ${placeNames[placeIndex]} có giá trị bao nhiêu?`, answers: numberAnswers(correct, 0, 9000, [1, -1, 9, -9, 10, -10, 90, -90, 100, -100, 900, -900]), correctAnswer: correct, hintSteps: [`Chữ số đang xét ở ${placeNames[placeIndex]}.`, `Giá trị hàng là ${placeValues[placeIndex]}.`, `${digits[placeIndex]} × ${placeValues[placeIndex]} = ${formatNumber(correct)}.`], explanation: `Chữ số ${digits[placeIndex]} ở ${placeNames[placeIndex]} có giá trị ${formatNumber(correct)}.` };
}

function comparisonQuestion(): ComparisonQuestion {
  const mode = Math.random() < 0.55 ? 'symbol' : 'order';
  if (mode === 'symbol') {
    const left = randomFourDigitNumber();
    const delta = pick([-1000, -100, -10, -1, 0, 1, 10, 100, 1000]);
    const right = Math.max(1000, Math.min(10000, left + delta));
    const correct = left < right ? '<' : left > right ? '>' : '=';
    return { id: qid(`compare-${left}-${right}`), signature: `compare-${left}-${right}`, type: 'comparison', skillId: 'compare-to-10000', values: [left, right], mode, instruction: 'Chọn dấu thích hợp điền vào ô trống.', answers: shuffle(['<', '>', '=']), correctAnswer: correct, hintSteps: ['So sánh số chữ số, rồi so từ hàng nghìn.', 'Nếu hàng nghìn bằng nhau, tiếp tục so hàng trăm, chục, đơn vị.', `${formatNumber(left)} ${correct} ${formatNumber(right)}.`], explanation: `${formatNumber(left)} ${correct} ${formatNumber(right)}.` };
  }
  const values = new Set<number>();
  const base = ri(1200, 9200);
  while (values.size < 4) values.add(Math.max(1000, Math.min(9999, base + ri(-350, 350))));
  const shown = shuffle([...values]);
  const ascending = Math.random() < 0.5;
  const sorted = [...shown].sort((a, b) => ascending ? a - b : b - a);
  const correct = sorted.map(formatNumber).join(' – ');
  const alternatives = new Set<string>([correct]);
  while (alternatives.size < 4) alternatives.add(shuffle(shown).map(formatNumber).join(' – '));
  return { id: qid(`order-${shown.join('-')}-${ascending}`), signature: `order-${shown.join('-')}-${ascending}`, type: 'comparison', skillId: 'compare-to-10000', values: shown, mode, instruction: `Dãy nào được sắp xếp từ ${ascending ? 'bé đến lớn' : 'lớn đến bé'}?`, answers: shuffle([...alternatives]), correctAnswer: correct, hintSteps: ['So sánh từ hàng nghìn trước.', `Chọn ${ascending ? 'số bé nhất' : 'số lớn nhất'} trước.`, `Thứ tự đúng là ${correct}.`], explanation: `Dãy đúng: ${correct}.` };
}

function romanQuestion(): RomanQuestion {
  const arabic = ri(1, 20);
  const roman = ROMAN_NUMERALS[arabic];
  const askFor = Math.random() < 0.5 ? 'arabic' : 'roman';
  if (askFor === 'arabic') {
    return { id: qid(`roman-read-${arabic}`), signature: `roman-read-${arabic}`, type: 'roman', skillId: 'roman-numerals', arabic, roman, askFor, instruction: `Chữ số La Mã ${roman} biểu thị số nào?`, answers: numberAnswers(arabic, 1, 20, [1, -1, 2, -2, 5, -5, 10, -10]), correctAnswer: arabic, hintSteps: ['Nhớ I = 1, V = 5, X = 10.', 'Chữ nhỏ đứng trước chữ lớn thì lấy số lớn trừ số nhỏ.', `${roman} = ${arabic}.`], explanation: `${roman} biểu thị số ${arabic}.` };
  }
  const alternatives = new Set<string>([roman]);
  while (alternatives.size < 4) alternatives.add(ROMAN_NUMERALS[Math.max(1, Math.min(20, arabic + pick([-5, -2, -1, 1, 2, 5])))]);
  return { id: qid(`roman-write-${arabic}`), signature: `roman-write-${arabic}`, type: 'roman', skillId: 'roman-numerals', arabic, roman, askFor, instruction: `Số ${arabic} được viết bằng chữ số La Mã như thế nào?`, answers: shuffle([...alternatives]), correctAnswer: roman, hintSteps: ['Nhớ I = 1, V = 5, X = 10.', 'Ghép các chữ theo giá trị của số cần viết.', `${arabic} viết là ${roman}.`], explanation: `Số ${arabic} viết bằng chữ số La Mã là ${roman}.` };
}

function roundingQuestion(): NumberLineQuestion {
  const unit = pick([10, 100] as const);
  const value = unit === 10 ? ri(101, 998) * 10 + ri(1, 9) : ri(11, 98) * 100 + ri(1, 99);
  const lower = Math.floor(value / unit) * unit;
  const upper = lower + unit;
  const midpoint = lower + unit / 2;
  const correct = value < midpoint ? lower : upper;
  return { id: qid(`round-${unit}-${value}`), signature: `round-${unit}-${value}`, type: 'number-line', skillId: 'round-tens-hundreds', value, lower, upper, midpoint, unit, instruction: `Làm tròn số ${formatNumber(value)} đến hàng ${unit === 10 ? 'chục' : 'trăm'}.`, answers: numberAnswers(correct, 0, 10000, unit === 10 ? [10, -10, 20, -20, 100, -100] : [100, -100, 200, -200, 1000, -1000]), correctAnswer: correct, hintSteps: [`Quan sát chữ số hàng ${unit === 10 ? 'đơn vị' : 'chục'}.`, `So ${formatNumber(value)} với điểm giữa ${formatNumber(midpoint)}.`, `${formatNumber(value)} gần ${formatNumber(correct)} hơn.`], explanation: `${formatNumber(value)} làm tròn đến hàng ${unit === 10 ? 'chục' : 'trăm'} được ${formatNumber(correct)}.` };
}

function perimeterQuestion(): ShapeQuestion {
  const shape = pick(['triangle', 'quadrilateral', 'rectangle', 'square'] as const);
  let sides: number[];
  let width: number | undefined;
  let height: number | undefined;
  if (shape === 'triangle') {
    const first = ri(3, 9);
    const second = ri(3, 9);
    const third = ri(Math.abs(first - second) + 1, Math.min(9, first + second - 1));
    sides = [first, second, third];
  }
  else if (shape === 'quadrilateral') sides = [ri(4, 9), ri(4, 9), ri(4, 9), ri(4, 9)];
  else if (shape === 'rectangle') { width = ri(5, 12); height = ri(2, width - 1); sides = [width, height, width, height]; }
  else { width = ri(3, 10); height = width; sides = [width, width, width, width]; }
  const correct = sides.reduce((sum, side) => sum + side, 0);
  const shapeName = { triangle: 'tam giác', quadrilateral: 'tứ giác', rectangle: 'chữ nhật', square: 'vuông' }[shape];
  return { id: qid(`perimeter-${shape}-${sides.join('-')}`), signature: `perimeter-${shape}-${sides.join('-')}`, type: 'shape', skillId: 'perimeter-plane-shapes', shape, sides, width, height, unit: 'cm', task: 'perimeter', instruction: `Chu vi hình ${shapeName} bằng bao nhiêu?`, answers: numberAnswers(correct, 1, 100, [1, -1, 2, -2, 4, -4, 6, -6, 10, -10]), correctAnswer: correct, hintSteps: ['Chu vi là tổng độ dài các cạnh.', `Các cạnh dài ${sides.join(' cm, ')} cm.`, `${sides.join(' + ')} = ${correct} cm.`], explanation: `Chu vi là ${sides.join(' + ')} = ${correct} cm.` };
}

function areaGridQuestion(): AreaGridQuestion {
  const rows = ri(2, 6);
  const columns = ri(2, 8);
  const correct = rows * columns;
  return { id: qid(`area-grid-${rows}-${columns}`), signature: `area-grid-${rows}-${columns}`, type: 'area-grid', skillId: 'area-concept', rows, columns, cellUnit: 'cm²', instruction: 'Hình được tô màu có diện tích bao nhiêu xăng-ti-mét vuông?', answers: numberAnswers(correct, 1, 60, [1, -1, rows, -rows, columns, -columns, 2, -2]), correctAnswer: correct, hintSteps: ['Mỗi ô vuông có diện tích 1 cm².', `Có ${rows} hàng, mỗi hàng ${columns} ô.`, `${rows} × ${columns} = ${correct} cm².`], explanation: `Có ${rows} × ${columns} = ${correct} ô vuông đơn vị, nên diện tích là ${correct} cm².` };
}

function rectangleSquareAreaQuestion(): ShapeQuestion {
  const shape = Math.random() < 0.6 ? 'rectangle' : 'square';
  const width = ri(4, 12);
  const height = shape === 'square' ? width : ri(2, width - 1);
  const correct = width * height;
  const shapeName = shape === 'square' ? 'vuông' : 'chữ nhật';
  return { id: qid(`area-${shape}-${width}-${height}`), signature: `area-${shape}-${width}-${height}`, type: 'shape', skillId: 'rectangle-square-area', shape, sides: [width, height, width, height], width, height, unit: 'cm', task: 'area', instruction: `Diện tích hình ${shapeName} bằng bao nhiêu?`, answers: numberAnswers(correct, 1, 150, [1, -1, width, -width, height, -height, 2, -2, 10, -10]), correctAnswer: correct, hintSteps: [shape === 'square' ? 'Diện tích hình vuông bằng cạnh nhân cạnh.' : 'Diện tích hình chữ nhật bằng chiều dài nhân chiều rộng.', `Thực hiện ${width} × ${height}.`, `${width} × ${height} = ${correct} cm².`], explanation: `Diện tích là ${width} × ${height} = ${correct} cm².` };
}

function calculationQuestion(operation?: CalculationQuestion['operation']): CalculationQuestion {
  const chosen = operation ?? pick(['add', 'subtract', 'multiply', 'divide'] as const);
  let left = 0;
  let right = 0;
  let correct = 0;
  let skillId: Grade3Stage4SkillId;
  if (chosen === 'add') {
    left = ri(1000, 8500);
    right = ri(500, 10000 - left);
    correct = left + right;
    skillId = 'add-subtract-10000';
  } else if (chosen === 'subtract') {
    left = ri(2000, 10000);
    right = ri(500, left - 1);
    correct = left - right;
    skillId = 'add-subtract-10000';
  } else if (chosen === 'multiply') {
    right = ri(2, 9);
    left = ri(1000, Math.floor(9999 / right));
    correct = left * right;
    skillId = 'multiply-four-by-one';
  } else {
    right = ri(2, 9);
    const quotient = ri(Math.ceil(1000 / right), Math.floor(9999 / right));
    left = quotient * right;
    correct = quotient;
    skillId = 'divide-four-by-one';
  }
  const symbols = { add: '+', subtract: '−', multiply: '×', divide: ':' } as const;
  const names = { add: 'tổng', subtract: 'hiệu', multiply: 'tích', divide: 'thương' } as const;
  const equation = `${formatNumber(left)} ${symbols[chosen]} ${formatNumber(right)} = ${formatNumber(correct)}`;
  return { id: qid(`calc-${chosen}-${left}-${right}`), signature: `calc-${chosen}-${left}-${right}`, type: 'calculation', skillId, operation: chosen, left, right, instruction: `Chọn ${names[chosen]} đúng.`, answers: numberAnswers(correct, 0, 10000, [1, -1, 10, -10, 100, -100, 1000, -1000]), correctAnswer: correct, hintSteps: [chosen === 'divide' ? 'Chia lần lượt từ hàng nghìn sang hàng đơn vị.' : 'Đặt các chữ số cùng hàng thẳng cột.', chosen === 'multiply' ? `Nhân ${formatNumber(left)} với ${right}.` : chosen === 'divide' ? `Tìm thương của ${formatNumber(left)} và ${right}.` : 'Tính lần lượt từ hàng đơn vị.', equation], explanation: `${equation}.` };
}

type Factory = () => Grade3Stage4Question;

function unique(plan: Factory[], total: 5 | 10 | 15) {
  const result: Grade3Stage4Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  while (result.length < total && attempts < total * 80) {
    const question = plan[result.length % plan.length]();
    attempts += 1;
    if (seen.has(question.signature)) continue;
    seen.add(question.signature);
    result.push(question);
  }
  return shuffle(result);
}

export function generateGrade3Stage4Questions(module: Grade3Stage4Module, total: 5 | 10 | 15 = 10) {
  const plans: Record<Grade3Stage4Module, Factory[]> = {
    numbers10000: [fourDigitQuestion, comparisonQuestion, romanQuestion, roundingQuestion, () => Math.random() < 0.5 ? fourDigitQuestion() : comparisonQuestion()],
    perimeterArea: [perimeterQuestion, areaGridQuestion, rectangleSquareAreaQuestion, perimeterQuestion, () => Math.random() < 0.5 ? areaGridQuestion() : rectangleSquareAreaQuestion()],
    arithmetic10000: [() => calculationQuestion('add'), () => calculationQuestion('subtract'), () => calculationQuestion('multiply'), () => calculationQuestion('divide'), calculationQuestion],
  };
  return unique(plans[module], total);
}
