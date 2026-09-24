export type Grade4Stage1Module = 'review' | 'angles' | 'large-numbers' | 'measurement' | 'add-subtract' | 'lines-shapes' | 'semester-1-review' | 'multiply-divide' | 'statistics' | 'fractions' | 'fraction-add-subtract' | 'fraction-multiply-divide' | 'final-review';
export type Grade4Stage1SkillId =
  | 'review-numbers-100000'
  | 'review-operations-100000'
  | 'odd-even-numbers'
  | 'letter-expressions'
  | 'three-step-problems'
  | 'angle-measure'
  | 'angle-classification'
  | 'numbers-to-million'
  | 'round-large-numbers'
  | 'compare-large-numbers'
  | 'natural-number-sequence'
  | 'mass-units-grade-4'
  | 'area-units-grade-4'
  | 'second-century'
  | 'large-add-subtract'
  | 'addition-properties'
  | 'sum-difference-problems'
  | 'perpendicular-lines'
  | 'parallel-lines'
  | 'parallelogram-rhombus'
  | 'semester-1-large-numbers'
  | 'semester-1-add-subtract'
  | 'semester-1-geometry-grade-4'
  | 'semester-1-measurement-grade-4'
  | 'multiply-divide-natural'
  | 'multiplication-properties'
  | 'estimation-calculation'
  | 'average-unit-rate'
  | 'data-series'
  | 'column-chart'
  | 'event-frequency'
  | 'fraction-concept'
  | 'fraction-properties'
  | 'simplify-common-denominator'
  | 'compare-fractions'
  | 'fraction-addition'
  | 'fraction-subtraction'
  | 'fraction-multiplication'
  | 'fraction-division'
  | 'fraction-of-number'
  | 'final-natural-numbers'
  | 'final-fractions'
  | 'final-geometry-measurement'
  | 'final-data-probability';

export type Grade4Stage1Answer = number | string;

export const GRADE4_STAGE1_SKILL_LABELS: Record<Grade4Stage1SkillId, string> = {
  'review-numbers-100000': 'Số đến 100 000',
  'review-operations-100000': 'Phép tính đến 100 000',
  'odd-even-numbers': 'Số chẵn và số lẻ',
  'letter-expressions': 'Biểu thức chứa chữ',
  'three-step-problems': 'Bài toán ba bước',
  'angle-measure': 'Độ và số đo góc',
  'angle-classification': 'Phân loại góc',
  'numbers-to-million': 'Số đến lớp triệu',
  'round-large-numbers': 'Làm tròn số lớn',
  'compare-large-numbers': 'So sánh số lớn',
  'natural-number-sequence': 'Dãy số tự nhiên',
  'mass-units-grade-4': 'Yến, tạ và tấn',
  'area-units-grade-4': 'Đơn vị đo diện tích',
  'second-century': 'Giây và thế kỉ',
  'large-add-subtract': 'Cộng và trừ số lớn',
  'addition-properties': 'Tính chất phép cộng',
  'sum-difference-problems': 'Tìm hai số',
  'perpendicular-lines': 'Đường thẳng vuông góc',
  'parallel-lines': 'Đường thẳng song song',
  'parallelogram-rhombus': 'Hình bình hành và hình thoi',
  'semester-1-large-numbers': 'Ôn số đến lớp triệu',
  'semester-1-add-subtract': 'Ôn phép cộng và phép trừ',
  'semester-1-geometry-grade-4': 'Ôn hình học',
  'semester-1-measurement-grade-4': 'Ôn đo lường',
  'multiply-divide-natural': 'Nhân và chia số tự nhiên',
  'multiplication-properties': 'Tính chất phép nhân',
  'estimation-calculation': 'Ước lượng trong tính toán',
  'average-unit-rate': 'Trung bình cộng và rút về đơn vị',
  'data-series': 'Dãy số liệu',
  'column-chart': 'Biểu đồ cột',
  'event-frequency': 'Số lần xuất hiện',
  'fraction-concept': 'Khái niệm phân số',
  'fraction-properties': 'Tính chất cơ bản của phân số',
  'simplify-common-denominator': 'Rút gọn và quy đồng',
  'compare-fractions': 'So sánh phân số',
  'fraction-addition': 'Cộng phân số',
  'fraction-subtraction': 'Trừ phân số',
  'fraction-multiplication': 'Nhân phân số',
  'fraction-division': 'Chia phân số',
  'fraction-of-number': 'Tìm phân số của một số',
  'final-natural-numbers': 'Ôn số tự nhiên và phép tính',
  'final-fractions': 'Ôn phân số',
  'final-geometry-measurement': 'Ôn hình học và đo lường',
  'final-data-probability': 'Ôn thống kê và xác suất',
};

type BaseQuestion = {
  id: string;
  signature: string;
  skillId: Grade4Stage1SkillId;
  instruction: string;
  answers: Grade4Stage1Answer[];
  correctAnswer: Grade4Stage1Answer;
  hintSteps: [string, string, string];
  explanation: string;
};

export type ExpressionQuestion = BaseQuestion & { type: 'expression'; expression: string; caption?: string };
export type NumberQuestion = BaseQuestion & { type: 'number'; number: number; caption: string; highlightedDigit?: number };
export type CompareQuestion = BaseQuestion & { type: 'compare'; left: number; right: number };
export type AngleQuestion = BaseQuestion & { type: 'angle'; degrees: number; showDegrees: boolean };
export type SequenceQuestion = BaseQuestion & { type: 'sequence'; values: Array<number | string> };
export type ContextQuestion = BaseQuestion & { type: 'context'; icon: string; visualTitle: string; visualLines: string[] };
export type DiagramQuestion = BaseQuestion & { type: 'diagram'; diagram: 'perpendicular' | 'parallel' | 'parallelogram' | 'rhombus'; labels?: string[] };
export type BarChartQuestion = BaseQuestion & { type: 'bar-chart'; labels: string[]; values: number[]; chartTitle: string };
export type FractionQuestion = BaseQuestion & { type: 'fraction'; numerator: number; denominator: number; caption: string };

export type Grade4Stage1Question =
  | ExpressionQuestion
  | NumberQuestion
  | CompareQuestion
  | AngleQuestion
  | SequenceQuestion
  | ContextQuestion
  | DiagramQuestion
  | BarChartQuestion
  | FractionQuestion;

const DIGIT_WORDS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'] as const;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function shuffle<T>(items: readonly T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function questionId(signature: string) {
  return `${signature}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function readTriplet(value: number, readLeadingZero = false) {
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  const parts: string[] = [];
  if (hundreds > 0 || readLeadingZero) parts.push(`${DIGIT_WORDS[hundreds]} trăm`);
  if (tens > 1) {
    parts.push(`${DIGIT_WORDS[tens]} mươi`);
    if (ones === 1) parts.push('mốt');
    else if (ones === 5) parts.push('lăm');
    else if (ones > 0) parts.push(DIGIT_WORDS[ones]);
  } else if (tens === 1) {
    parts.push('mười');
    if (ones === 5) parts.push('lăm');
    else if (ones > 0) parts.push(DIGIT_WORDS[ones]);
  } else if (ones > 0) {
    if (hundreds > 0 || readLeadingZero) parts.push('linh');
    parts.push(DIGIT_WORDS[ones]);
  }
  return parts.join(' ');
}

function readVietnameseNumber(value: number) {
  if (value === 0) return 'không';
  const millions = Math.floor(value / 1_000_000);
  const thousands = Math.floor((value % 1_000_000) / 1_000);
  const units = value % 1_000;
  const parts: string[] = [];
  if (millions) parts.push(`${readTriplet(millions)} triệu`);
  if (thousands) parts.push(`${readTriplet(thousands, Boolean(millions && thousands < 100))} nghìn`);
  if (units) parts.push(readTriplet(units, Boolean((millions || thousands) && units < 100)));
  return parts.join(' ');
}

function numericAnswers(correct: number, min: number, max: number, offsets: number[]) {
  const values = new Set<number>([correct]);
  for (const offset of shuffle(offsets)) {
    const value = correct + offset;
    if (value >= min && value <= max) values.add(value);
    if (values.size === 4) break;
  }
  while (values.size < 4) values.add(randomInt(min, max));
  return shuffle([...values]);
}

function fractionAnswers(correct: string, candidates: string[]) {
  const values = new Set<string>([correct]);
  for (const candidate of candidates) {
    if (candidate !== correct) values.add(candidate);
    if (values.size === 4) break;
  }
  while (values.size < 4) {
    const denominator = randomInt(2, 20);
    const numerator = randomInt(1, denominator);
    values.add(`${numerator}/${denominator}`);
  }
  return shuffle([...values]);
}

function expressionQuestion(skillId: Grade4Stage1SkillId, expression: string, correct: number, explanation: string, signature: string, max = 1_000_000, caption?: string): ExpressionQuestion {
  return {
    id: questionId(signature), signature, type: 'expression', skillId, expression, caption,
    instruction: pick(['Chọn kết quả đúng.', 'Tìm giá trị của biểu thức.', 'Số nào thích hợp với ô trống?']),
    answers: numericAnswers(correct, 0, max, [1, -1, 10, -10, 100, -100, 1_000, -1_000, 10_000, -10_000]),
    correctAnswer: correct,
    hintSteps: ['Xác định phép tính cần thực hiện.', 'Đặt tính hoặc tính lần lượt từ trái sang phải khi các phép tính cùng thứ tự.', explanation],
    explanation,
  };
}

function reviewNumberQuestion(): Grade4Stage1Question {
  const mode = pick(['place', 'compare', 'previous-next'] as const);
  const number = randomInt(10_000, 99_999);
  if (mode === 'compare') {
    const right = Math.max(10_000, Math.min(99_999, number + pick([-1, 1]) * randomInt(1, 9_000)));
    const correct = number === right ? '=' : number > right ? '>' : '<';
    return {
      id: questionId(`review-compare-${number}-${right}`), signature: `review-compare-${number}-${right}`, type: 'compare', skillId: 'review-numbers-100000', left: number, right,
      instruction: 'Dấu nào thích hợp đặt giữa hai số?', answers: shuffle(['>', '<', '=']), correctAnswer: correct,
      hintSteps: ['So sánh số chữ số trước.', 'Nếu cùng số chữ số, so sánh từ hàng cao nhất sang phải.', `${formatNumber(number)} ${correct} ${formatNumber(right)}.`],
      explanation: `${formatNumber(number)} ${correct} ${formatNumber(right)}.`,
    };
  }
  if (mode === 'previous-next') {
    const askNext = Math.random() < 0.5;
    const correct = number + (askNext ? 1 : -1);
    return {
      id: questionId(`neighbor-${number}-${askNext}`), signature: `neighbor-${number}-${askNext}`, type: 'number', skillId: 'review-numbers-100000', number, caption: askNext ? 'Tìm số liền sau' : 'Tìm số liền trước',
      instruction: `${askNext ? 'Số liền sau' : 'Số liền trước'} của ${formatNumber(number)} là số nào?`,
      answers: numericAnswers(correct, 0, 100_000, [1, -1, 2, -2, 10, -10]), correctAnswer: correct,
      hintSteps: [askNext ? 'Số liền sau lớn hơn 1 đơn vị.' : 'Số liền trước bé hơn 1 đơn vị.', `${formatNumber(number)} ${askNext ? '+' : '−'} 1`, `Kết quả là ${formatNumber(correct)}.`],
      explanation: `${formatNumber(number)} ${askNext ? '+' : '−'} 1 = ${formatNumber(correct)}.`,
    };
  }
  const place = pick([10, 100, 1_000, 10_000] as const);
  const digit = Math.floor(number / place) % 10;
  const correct = digit * place;
  const placeName = place === 10 ? 'chục' : place === 100 ? 'trăm' : place === 1_000 ? 'nghìn' : 'chục nghìn';
  return {
    id: questionId(`review-place-${number}-${place}`), signature: `review-place-${number}-${place}`, type: 'number', skillId: 'review-numbers-100000', number, caption: `Giá trị chữ số hàng ${placeName}`, highlightedDigit: digit,
    instruction: `Chữ số ${digit} trong số ${formatNumber(number)} có giá trị bao nhiêu?`,
    answers: numericAnswers(correct, 0, 90_000, [digit, -digit, 10 * digit, -10 * digit, 100 * digit, -100 * digit]), correctAnswer: correct,
    hintSteps: [`Xác định chữ số ${digit} đang ở hàng nào.`, `Chữ số đó ở hàng ${placeName}.`, `Giá trị là ${formatNumber(correct)}.`],
    explanation: `Chữ số ${digit} ở hàng ${placeName}, nên có giá trị ${formatNumber(correct)}.`,
  };
}

function reviewOperationQuestion(): ExpressionQuestion {
  const mode = pick(['add', 'subtract', 'multiply', 'divide'] as const);
  if (mode === 'add') {
    const left = randomInt(10_000, 70_000), right = randomInt(1_000, 99_999 - left), correct = left + right;
    return expressionQuestion('review-operations-100000', `${formatNumber(left)} + ${formatNumber(right)} = ?`, correct, `${formatNumber(left)} + ${formatNumber(right)} = ${formatNumber(correct)}.`, `review-add-${left}-${right}`, 100_000);
  }
  if (mode === 'subtract') {
    const left = randomInt(20_000, 99_999), right = randomInt(1_000, left - 1), correct = left - right;
    return expressionQuestion('review-operations-100000', `${formatNumber(left)} − ${formatNumber(right)} = ?`, correct, `${formatNumber(left)} − ${formatNumber(right)} = ${formatNumber(correct)}.`, `review-subtract-${left}-${right}`, 100_000);
  }
  if (mode === 'multiply') {
    const left = randomInt(120, 9_999), right = randomInt(2, 9), correct = left * right;
    return expressionQuestion('review-operations-100000', `${formatNumber(left)} × ${right} = ?`, correct, `${formatNumber(left)} × ${right} = ${formatNumber(correct)}.`, `review-multiply-${left}-${right}`, 100_000);
  }
  const divisor = randomInt(2, 9), quotient = randomInt(120, 9_999), dividend = divisor * quotient;
  return expressionQuestion('review-operations-100000', `${formatNumber(dividend)} : ${divisor} = ?`, quotient, `${formatNumber(dividend)} : ${divisor} = ${formatNumber(quotient)}.`, `review-divide-${dividend}-${divisor}`, 100_000);
}

function oddEvenQuestion(): Grade4Stage1Question {
  const number = randomInt(1_000, 99_999);
  const correct = number % 2 === 0 ? 'Số chẵn' : 'Số lẻ';
  return {
    id: questionId(`odd-even-${number}`), signature: `odd-even-${number}`, type: 'number', skillId: 'odd-even-numbers', number, caption: 'Quan sát chữ số tận cùng',
    instruction: `${formatNumber(number)} là số chẵn hay số lẻ?`, answers: shuffle(['Số chẵn', 'Số lẻ']), correctAnswer: correct,
    hintSteps: ['Chỉ cần nhìn chữ số tận cùng.', 'Tận cùng 0, 2, 4, 6, 8 là số chẵn; tận cùng 1, 3, 5, 7, 9 là số lẻ.', `${number} tận cùng là ${number % 10}, nên đây là ${correct.toLowerCase()}.`],
    explanation: `${formatNumber(number)} có chữ số tận cùng là ${number % 10}, nên là ${correct.toLowerCase()}.`,
  };
}

function letterExpressionQuestion(): ExpressionQuestion {
  const value = randomInt(5, 90);
  const mode = pick(['add', 'subtract', 'multiply'] as const);
  if (mode === 'add') {
    const constant = randomInt(100, 2_000), correct = value + constant;
    return expressionQuestion('letter-expressions', `a + ${formatNumber(constant)}, với a = ${value}`, correct, `Thay a = ${value}: ${value} + ${formatNumber(constant)} = ${formatNumber(correct)}.`, `letter-add-${value}-${constant}`, 5_000, 'Thay chữ bằng số đã cho');
  }
  if (mode === 'subtract') {
    const constant = randomInt(value + 20, 2_000), correct = constant - value;
    return expressionQuestion('letter-expressions', `${formatNumber(constant)} − m, với m = ${value}`, correct, `Thay m = ${value}: ${formatNumber(constant)} − ${value} = ${formatNumber(correct)}.`, `letter-subtract-${constant}-${value}`, 5_000, 'Thay chữ bằng số đã cho');
  }
  const factor = randomInt(2, 9), correct = value * factor;
  return expressionQuestion('letter-expressions', `n × ${factor}, với n = ${value}`, correct, `Thay n = ${value}: ${value} × ${factor} = ${correct}.`, `letter-multiply-${value}-${factor}`, 1_000, 'Thay chữ bằng số đã cho');
}

function threeStepProblemQuestion(): ContextQuestion {
  const morning = randomInt(120, 350);
  const more = randomInt(30, 120);
  const donated = randomInt(40, 150);
  const afternoon = morning + more;
  const total = morning + afternoon;
  const correct = total - donated;
  const signature = `three-step-books-${morning}-${more}-${donated}`;
  return {
    id: questionId(signature), signature, type: 'context', skillId: 'three-step-problems', icon: '📚', visualTitle: 'Tủ sách của trường',
    visualLines: [`Buổi sáng nhận: ${morning} quyển`, `Buổi chiều nhiều hơn: ${more} quyển`, `Đã tặng: ${donated} quyển`],
    instruction: 'Tủ sách còn lại bao nhiêu quyển?',
    answers: numericAnswers(correct, 0, 1_000, [more, -more, donated, -donated, morning, -morning]), correctAnswer: correct,
    hintSteps: [`Buổi chiều nhận ${morning} + ${more} = ${afternoon} quyển.`, `Cả hai buổi nhận ${morning} + ${afternoon} = ${total} quyển.`, `Còn lại ${total} − ${donated} = ${correct} quyển.`],
    explanation: `Buổi chiều: ${morning} + ${more} = ${afternoon}; cả hai buổi: ${morning} + ${afternoon} = ${total}; còn lại: ${total} − ${donated} = ${correct} quyển.`,
  };
}

function angleName(degrees: number) {
  if (degrees < 90) return 'Góc nhọn';
  if (degrees === 90) return 'Góc vuông';
  if (degrees < 180) return 'Góc tù';
  return 'Góc bẹt';
}

function angleQuestion(): AngleQuestion {
  const degrees = pick([20, 30, 45, 60, 75, 90, 105, 120, 135, 150, 180] as const);
  const correct = angleName(degrees);
  const signature = `angle-class-${degrees}`;
  return {
    id: questionId(signature), signature, type: 'angle', skillId: 'angle-classification', degrees, showDegrees: true,
    instruction: `Góc có số đo ${degrees}° thuộc loại góc nào?`,
    answers: shuffle(['Góc nhọn', 'Góc vuông', 'Góc tù', 'Góc bẹt']), correctAnswer: correct,
    hintSteps: ['So sánh số đo với 90° và 180°.', 'Góc nhọn bé hơn 90°; góc tù lớn hơn 90° nhưng bé hơn 180°.', `${degrees}° là ${correct.toLowerCase()}.`],
    explanation: `${degrees}° ${degrees < 90 ? 'bé hơn 90°' : degrees === 90 ? 'bằng 90°' : degrees < 180 ? 'lớn hơn 90° và bé hơn 180°' : 'bằng 180°'}, nên là ${correct.toLowerCase()}.`,
  };
}

function angleMeasureQuestion(): ContextQuestion {
  const variant = pick([
    { title: 'Một phần tư vòng quay', icon: '↱', text: 'Từ hướng sang phải quay lên trên', correct: 90, explain: 'Một phần tư vòng quay tạo thành góc vuông, có số đo 90°.' },
    { title: 'Nửa vòng quay', icon: '↶', text: 'Từ một hướng quay sang hướng đối diện', correct: 180, explain: 'Nửa vòng quay tạo thành góc bẹt, có số đo 180°.' },
    { title: 'Đơn vị đo góc', icon: '📐', text: 'Kí hiệu của đơn vị đo góc', correct: 'Độ (°)', explain: 'Độ, kí hiệu °, là đơn vị dùng để đo góc.' },
  ] as const);
  const answers = typeof variant.correct === 'number' ? shuffle([45, 90, 120, 180]) : shuffle(['Độ (°)', 'Mét (m)', 'Lít (l)', 'Gam (g)']);
  const signature = `angle-measure-${variant.title}`;
  return {
    id: questionId(signature), signature, type: 'context', skillId: 'angle-measure', icon: variant.icon, visualTitle: variant.title, visualLines: [variant.text],
    instruction: typeof variant.correct === 'number' ? 'Góc tạo thành có số đo bao nhiêu độ?' : 'Đơn vị nào dùng để đo góc?',
    answers, correctAnswer: variant.correct,
    hintSteps: ['Liên hệ với góc vuông và góc bẹt đã học.', variant.text, variant.explain], explanation: variant.explain,
  };
}

function largeNumberQuestion(): Grade4Stage1Question {
  const mode = pick(['read', 'place'] as const);
  const number = randomInt(100_000, 9_999_999);
  if (mode === 'read') {
    const words = readVietnameseNumber(number);
    return {
      id: questionId(`read-large-${number}`), signature: `read-large-${number}`, type: 'context', skillId: 'numbers-to-million', icon: '🔊', visualTitle: 'Đọc số', visualLines: [words],
      instruction: 'Cách đọc trên ứng với số nào?',
      answers: numericAnswers(number, 100_000, 9_999_999, [1_000, -1_000, 10_000, -10_000, 100_000, -100_000]), correctAnswer: number,
      hintSteps: ['Tách cách đọc thành lớp triệu, lớp nghìn và lớp đơn vị.', 'Mỗi lớp gồm tối đa ba hàng.', `Số cần tìm là ${formatNumber(number)}.`],
      explanation: `${formatNumber(number)} đọc là “${words}”.`,
    };
  }
  const places = [1, 10, 100, 1_000, 10_000, 100_000, 1_000_000] as const;
  const place = pick(places.filter((candidate) => candidate <= number));
  const digit = Math.floor(number / place) % 10;
  const correct = digit * place;
  const placeName = place === 1 ? 'đơn vị' : place === 10 ? 'chục' : place === 100 ? 'trăm' : place === 1_000 ? 'nghìn' : place === 10_000 ? 'chục nghìn' : place === 100_000 ? 'trăm nghìn' : 'triệu';
  return {
    id: questionId(`large-place-${number}-${place}`), signature: `large-place-${number}-${place}`, type: 'number', skillId: 'numbers-to-million', number, caption: `Hàng ${placeName}`, highlightedDigit: digit,
    instruction: `Chữ số ${digit} ở hàng ${placeName} có giá trị bao nhiêu?`,
    answers: numericAnswers(correct, 0, 9_000_000, [digit, -digit, 10 * digit, -10 * digit, 100 * digit, -100 * digit, 1_000 * digit, -1_000 * digit]), correctAnswer: correct,
    hintSteps: [`Xác định vị trí của chữ số ${digit}.`, `Chữ số nằm ở hàng ${placeName}.`, `Giá trị là ${formatNumber(correct)}.`],
    explanation: `Chữ số ${digit} ở hàng ${placeName}, nên có giá trị ${formatNumber(correct)}.`,
  };
}

function roundLargeNumberQuestion(): Grade4Stage1Question {
  const place = pick([1_000, 10_000, 100_000] as const);
  const number = randomInt(100_000, 9_999_999);
  const correct = Math.round(number / place) * place;
  const placeName = place === 1_000 ? 'hàng nghìn' : place === 10_000 ? 'hàng chục nghìn' : 'hàng trăm nghìn';
  return {
    id: questionId(`round-large-${number}-${place}`), signature: `round-large-${number}-${place}`, type: 'number', skillId: 'round-large-numbers', number, caption: `Làm tròn đến ${placeName}`,
    instruction: `Làm tròn ${formatNumber(number)} đến ${placeName}.`,
    answers: numericAnswers(correct, 0, 10_000_000, [place, -place, 2 * place, -2 * place, 10 * place, -10 * place]), correctAnswer: correct,
    hintSteps: [`Xác định chữ số ngay bên phải ${placeName}.`, 'Nếu chữ số đó từ 5 trở lên thì tăng 1; nếu nhỏ hơn 5 thì giữ nguyên.', `${formatNumber(number)} làm tròn được ${formatNumber(correct)}.`],
    explanation: `${formatNumber(number)} làm tròn đến ${placeName} được ${formatNumber(correct)}.`,
  };
}

function compareLargeNumberQuestion(): CompareQuestion {
  const left = randomInt(100_000, 9_999_999);
  const right = Math.max(100_000, Math.min(9_999_999, left + pick([-1, 1]) * randomInt(1, 900_000)));
  const correct = left === right ? '=' : left > right ? '>' : '<';
  return {
    id: questionId(`compare-large-${left}-${right}`), signature: `compare-large-${left}-${right}`, type: 'compare', skillId: 'compare-large-numbers', left, right,
    instruction: 'Dấu nào thích hợp đặt giữa hai số?', answers: shuffle(['>', '<', '=']), correctAnswer: correct,
    hintSteps: ['So sánh số chữ số trước.', 'Nếu cùng số chữ số, so sánh lần lượt từ trái sang phải.', `${formatNumber(left)} ${correct} ${formatNumber(right)}.`],
    explanation: `${formatNumber(left)} ${correct} ${formatNumber(right)}.`,
  };
}

function naturalSequenceQuestion(): SequenceQuestion {
  const step = pick([1, 10, 100, 1_000, 10_000] as const);
  const start = randomInt(10_000, 800_000);
  const correct = start + step * 3;
  return {
    id: questionId(`sequence-${start}-${step}`), signature: `sequence-${start}-${step}`, type: 'sequence', skillId: 'natural-number-sequence', values: [start, start + step, start + step * 2, '?'],
    instruction: 'Số nào tiếp tục đúng dãy số?',
    answers: numericAnswers(correct, 0, 1_000_000, [step, -step, 2 * step, -2 * step, 10 * step, -10 * step]), correctAnswer: correct,
    hintSteps: ['Tìm hiệu giữa hai số liên tiếp.', `Mỗi số tăng thêm ${formatNumber(step)}.`, `${formatNumber(start + step * 2)} + ${formatNumber(step)} = ${formatNumber(correct)}.`],
    explanation: `Dãy số tăng đều ${formatNumber(step)} đơn vị, nên số tiếp theo là ${formatNumber(correct)}.`,
  };
}

function massUnitQuestion(): ContextQuestion {
  const conversion = pick([
    { from: 'yến', to: 'kg', factor: 10, fact: '1 yến = 10 kg' },
    { from: 'tạ', to: 'kg', factor: 100, fact: '1 tạ = 100 kg' },
    { from: 'tấn', to: 'kg', factor: 1_000, fact: '1 tấn = 1 000 kg' },
    { from: 'tấn', to: 'tạ', factor: 10, fact: '1 tấn = 10 tạ' },
  ] as const);
  const amount = randomInt(2, conversion.factor === 1_000 ? 8 : 15);
  const correct = amount * conversion.factor;
  const signature = `mass-${amount}-${conversion.from}-${conversion.to}`;
  return {
    id: questionId(signature), signature, type: 'context', skillId: 'mass-units-grade-4', icon: '⚖️',
    visualTitle: `${amount} ${conversion.from} = ? ${conversion.to}`,
    visualLines: [conversion.fact, 'Hãy đổi về cùng một đơn vị'],
    instruction: `${amount} ${conversion.from} bằng bao nhiêu ${conversion.to}?`,
    answers: numericAnswers(correct, 1, 20_000, [conversion.factor, -conversion.factor, amount, -amount, conversion.factor * 10, -conversion.factor * 10]),
    correctAnswer: correct,
    hintSteps: [`Nhớ rằng ${conversion.fact}.`, `Lấy ${amount} × ${formatNumber(conversion.factor)}.`, `${amount} ${conversion.from} = ${formatNumber(correct)} ${conversion.to}.`],
    explanation: `Vì ${conversion.fact}, ta có ${amount} × ${formatNumber(conversion.factor)} = ${formatNumber(correct)}. Vậy ${amount} ${conversion.from} = ${formatNumber(correct)} ${conversion.to}.`,
  };
}

function areaUnitQuestion(): ContextQuestion {
  const conversion = pick([
    { from: 'm²', to: 'dm²', factor: 100, fact: '1 m² = 100 dm²' },
    { from: 'dm²', to: 'cm²', factor: 100, fact: '1 dm² = 100 cm²' },
    { from: 'cm²', to: 'mm²', factor: 100, fact: '1 cm² = 100 mm²' },
    { from: 'm²', to: 'cm²', factor: 10_000, fact: '1 m² = 10 000 cm²' },
  ] as const);
  const amount = randomInt(2, conversion.factor === 10_000 ? 5 : 12);
  const correct = amount * conversion.factor;
  const signature = `area-${amount}-${conversion.from}-${conversion.to}`;
  return {
    id: questionId(signature), signature, type: 'context', skillId: 'area-units-grade-4', icon: '🟦',
    visualTitle: `${amount} ${conversion.from} = ? ${conversion.to}`,
    visualLines: [conversion.fact, 'Mỗi chiều dài đổi theo 10 lần thì diện tích đổi theo 100 lần'],
    instruction: `Số nào thích hợp với dấu hỏi?`,
    answers: numericAnswers(correct, 1, 100_000, [conversion.factor, -conversion.factor, amount * 10, -amount * 10, conversion.factor * 10, -conversion.factor * 10]),
    correctAnswer: correct,
    hintSteps: [`Dùng quan hệ ${conversion.fact}.`, `Tính ${amount} × ${formatNumber(conversion.factor)}.`, `Kết quả là ${formatNumber(correct)} ${conversion.to}.`],
    explanation: `${amount} ${conversion.from} = ${amount} × ${formatNumber(conversion.factor)} = ${formatNumber(correct)} ${conversion.to}.`,
  };
}

function timeCenturyQuestion(): ContextQuestion {
  if (Math.random() < 0.55) {
    const minutes = randomInt(2, 12);
    const seconds = randomInt(1, 5) * 10;
    const correct = minutes * 60 + seconds;
    const signature = `seconds-${minutes}-${seconds}`;
    return {
      id: questionId(signature), signature, type: 'context', skillId: 'second-century', icon: '⏱️',
      visualTitle: `${minutes} phút ${seconds} giây`, visualLines: ['1 phút = 60 giây'],
      instruction: `Thời gian trên bằng bao nhiêu giây?`,
      answers: numericAnswers(correct, 1, 1_000, [10, -10, 60, -60, minutes, -minutes]), correctAnswer: correct,
      hintSteps: ['Đổi số phút ra giây.', `${minutes} × 60 = ${minutes * 60} giây.`, `${minutes * 60} + ${seconds} = ${correct} giây.`],
      explanation: `${minutes} phút ${seconds} giây = ${minutes} × 60 + ${seconds} = ${correct} giây.`,
    };
  }
  const century = randomInt(15, 21);
  const year = century === 21 ? randomInt(2001, 2026) : randomInt((century - 1) * 100 + 1, century * 100);
  const roman = ['XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
  const correct = `Thế kỉ ${roman[century - 15]}`;
  const answers = [correct];
  const nearbyAnswers = shuffle(roman.filter((_, index) => index !== century - 15 && Math.abs(index - (century - 15)) <= 2).map((value) => `Thế kỉ ${value}`));
  for (const candidate of nearbyAnswers) {
    if (answers.length < 4) answers.push(candidate);
  }
  while (answers.length < 4) {
    const candidate = `Thế kỉ ${pick(roman)}`;
    if (!answers.includes(candidate)) answers.push(candidate);
  }
  const signature = `century-${year}`;
  return {
    id: questionId(signature), signature, type: 'context', skillId: 'second-century', icon: '📅',
    visualTitle: `Năm ${year}`, visualLines: ['100 năm = 1 thế kỉ'],
    instruction: `Năm ${year} thuộc thế kỉ nào?`, answers: shuffle(answers), correctAnswer: correct,
    hintSteps: ['Mỗi thế kỉ gồm 100 năm.', `Thế kỉ ${century} gồm các năm từ ${(century - 1) * 100 + 1} đến ${century * 100}.`, `Năm ${year} thuộc ${correct.toLowerCase()}.`],
    explanation: `Vì ${year} nằm trong khoảng ${(century - 1) * 100 + 1}–${century * 100}, nên thuộc ${correct.toLowerCase()}.`,
  };
}

function largeAddSubtractQuestion(): ExpressionQuestion {
  const addition = Math.random() < 0.5;
  if (addition) {
    const left = randomInt(100_000, 6_000_000);
    const right = randomInt(10_000, 9_999_999 - left);
    const correct = left + right;
    return expressionQuestion('large-add-subtract', `${formatNumber(left)} + ${formatNumber(right)} = ?`, correct, `Đặt các chữ số cùng hàng thẳng cột, ta tính được ${formatNumber(left)} + ${formatNumber(right)} = ${formatNumber(correct)}.`, `large-add-${left}-${right}`, 10_000_000);
  }
  const left = randomInt(200_000, 9_999_999);
  const right = randomInt(10_000, left - 1);
  const correct = left - right;
  return expressionQuestion('large-add-subtract', `${formatNumber(left)} − ${formatNumber(right)} = ?`, correct, `Đặt các chữ số cùng hàng thẳng cột, ta tính được ${formatNumber(left)} − ${formatNumber(right)} = ${formatNumber(correct)}.`, `large-sub-${left}-${right}`, 10_000_000);
}

function additionPropertyQuestion(): ExpressionQuestion {
  const first = randomInt(120, 950) * 10;
  const second = randomInt(11, 89);
  const third = 100 - second;
  const correct = first + 100;
  const expression = Math.random() < 0.5
    ? `${formatNumber(first)} + ${second} + ${third}`
    : `${second} + ${formatNumber(first)} + ${third}`;
  return expressionQuestion('addition-properties', `${expression} = ?`, correct, `Dùng tính chất giao hoán và kết hợp để ghép ${second} + ${third} = 100; sau đó ${formatNumber(first)} + 100 = ${formatNumber(correct)}.`, `addition-property-${first}-${second}`, 20_000, 'Tính bằng cách thuận tiện');
}

function sumDifferenceQuestion(): ContextQuestion {
  const small = randomInt(20, 450);
  const difference = randomInt(5, 160) * 2;
  const large = small + difference;
  const sum = small + large;
  const askLarge = Math.random() < 0.5;
  const correct = askLarge ? large : small;
  const signature = `sum-difference-${sum}-${difference}-${askLarge}`;
  return {
    id: questionId(signature), signature, type: 'context', skillId: 'sum-difference-problems', icon: '🧩',
    visualTitle: `Tổng: ${formatNumber(sum)} · Hiệu: ${formatNumber(difference)}`,
    visualLines: [askLarge ? 'Tìm số lớn' : 'Tìm số bé'],
    instruction: `${askLarge ? 'Số lớn' : 'Số bé'} là bao nhiêu?`,
    answers: numericAnswers(correct, 0, 2_000, [difference, -difference, Math.floor(difference / 2), -Math.floor(difference / 2), 10, -10]), correctAnswer: correct,
    hintSteps: [askLarge ? 'Số lớn = (tổng + hiệu) : 2.' : 'Số bé = (tổng − hiệu) : 2.', `${askLarge ? `${sum} + ${difference}` : `${sum} − ${difference}`} = ${askLarge ? sum + difference : sum - difference}.`, `${askLarge ? sum + difference : sum - difference} : 2 = ${correct}.`],
    explanation: `${askLarge ? 'Số lớn' : 'Số bé'} = (${sum} ${askLarge ? '+' : '−'} ${difference}) : 2 = ${correct}. Kiểm tra: ${large} + ${small} = ${sum} và ${large} − ${small} = ${difference}.`,
  };
}

function lineQuestion(kind: 'perpendicular' | 'parallel'): DiagramQuestion {
  const correct = kind === 'perpendicular' ? 'Vuông góc' : 'Song song';
  const signature = `lines-${kind}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id: questionId(signature), signature, type: 'diagram', diagram: kind,
    skillId: kind === 'perpendicular' ? 'perpendicular-lines' : 'parallel-lines',
    labels: kind === 'perpendicular' ? ['a', 'b', 'O'] : ['m', 'n'],
    instruction: `Hai đường thẳng trong hình có quan hệ gì?`,
    answers: shuffle(['Vuông góc', 'Song song', 'Cắt nhau không vuông góc', 'Trùng nhau']), correctAnswer: correct,
    hintSteps: [kind === 'perpendicular' ? 'Quan sát góc tạo bởi hai đường thẳng.' : 'Quan sát khoảng cách giữa hai đường thẳng.', kind === 'perpendicular' ? 'Dấu ô vuông cho biết hai đường tạo góc 90°.' : 'Hai đường không cắt nhau dù kéo dài.', `Hai đường thẳng ${correct.toLowerCase()}.`],
    explanation: kind === 'perpendicular' ? 'Hai đường thẳng cắt nhau và tạo thành góc vuông, nên chúng vuông góc.' : 'Hai đường thẳng luôn cách đều và không cắt nhau khi kéo dài, nên chúng song song.',
  };
}

function quadrilateralQuestion(): DiagramQuestion {
  const diagram = pick(['parallelogram', 'rhombus'] as const);
  const correct = diagram === 'parallelogram' ? 'Hình bình hành' : 'Hình thoi';
  const signature = `quadrilateral-${diagram}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id: questionId(signature), signature, type: 'diagram', diagram, skillId: 'parallelogram-rhombus', labels: ['A', 'B', 'C', 'D'],
    instruction: 'Hình tứ giác trong hình là hình gì?',
    answers: shuffle(['Hình bình hành', 'Hình thoi', 'Hình chữ nhật', 'Hình thang']), correctAnswer: correct,
    hintSteps: ['Quan sát các cặp cạnh đối diện.', diagram === 'rhombus' ? 'Hình có bốn cạnh bằng nhau.' : 'Hình có hai cặp cạnh đối diện song song.', `Đây là ${correct.toLowerCase()}.`],
    explanation: diagram === 'rhombus' ? 'Hình có bốn cạnh bằng nhau và hai cặp cạnh đối diện song song, nên là hình thoi.' : 'Hình có hai cặp cạnh đối diện song song và bằng nhau, nên là hình bình hành.',
  };
}

function semesterOneLargeNumberQuestion(): Grade4Stage1Question {
  const mode = randomInt(0, 3);
  const question = mode === 0 ? largeNumberQuestion() : mode === 1 ? roundLargeNumberQuestion() : mode === 2 ? compareLargeNumberQuestion() : naturalSequenceQuestion();
  return { ...question, skillId: 'semester-1-large-numbers' };
}

function semesterOneAddSubtractQuestion(): Grade4Stage1Question {
  const mode = randomInt(0, 2);
  const question = mode === 0 ? largeAddSubtractQuestion() : mode === 1 ? additionPropertyQuestion() : sumDifferenceQuestion();
  return { ...question, skillId: 'semester-1-add-subtract' };
}

function semesterOneGeometryQuestion(): Grade4Stage1Question {
  const mode = randomInt(0, 3);
  const question = mode === 0 ? angleQuestion() : mode === 1 ? lineQuestion('perpendicular') : mode === 2 ? lineQuestion('parallel') : quadrilateralQuestion();
  return { ...question, skillId: 'semester-1-geometry-grade-4' };
}

function semesterOneMeasurementQuestion(): Grade4Stage1Question {
  const mode = randomInt(0, 2);
  const question = mode === 0 ? massUnitQuestion() : mode === 1 ? areaUnitQuestion() : timeCenturyQuestion();
  return { ...question, skillId: 'semester-1-measurement-grade-4' };
}

function multiplyDivideNaturalQuestion(): ExpressionQuestion {
  if (Math.random() < 0.55) {
    const left = randomInt(120, 9_999);
    const right = randomInt(2, 99);
    const correct = left * right;
    return expressionQuestion('multiply-divide-natural', `${formatNumber(left)} × ${right} = ?`, correct, `Tính lần lượt từ phải sang trái: ${formatNumber(left)} × ${right} = ${formatNumber(correct)}.`, `multiply-natural-${left}-${right}`, 1_000_000);
  }
  const divisor = randomInt(2, 99);
  const quotient = randomInt(20, 4_000);
  const dividend = divisor * quotient;
  return expressionQuestion('multiply-divide-natural', `${formatNumber(dividend)} : ${divisor} = ?`, quotient, `Vì ${formatNumber(quotient)} × ${divisor} = ${formatNumber(dividend)}, nên ${formatNumber(dividend)} : ${divisor} = ${formatNumber(quotient)}.`, `divide-natural-${dividend}-${divisor}`, 10_000);
}

function multiplicationPropertyQuestion(): ExpressionQuestion {
  const factor = randomInt(3, 25);
  const first = randomInt(11, 89);
  const second = 100 - first;
  const correct = factor * 100;
  const expression = Math.random() < 0.5
    ? `${factor} × ${first} + ${factor} × ${second}`
    : `${first} × ${factor} + ${second} × ${factor}`;
  return expressionQuestion('multiplication-properties', `${expression} = ?`, correct, `Dùng tính chất phân phối: ${factor} × (${first} + ${second}) = ${factor} × 100 = ${formatNumber(correct)}.`, `multiply-property-${factor}-${first}`, 10_000, 'Tính bằng cách thuận tiện');
}

function estimationQuestion(): ExpressionQuestion {
  const left = randomInt(12, 89) * 1_000 + randomInt(100, 899);
  const right = randomInt(12, 89) * 1_000 + randomInt(100, 899);
  const roundedLeft = Math.round(left / 1_000) * 1_000;
  const roundedRight = Math.round(right / 1_000) * 1_000;
  const correct = roundedLeft + roundedRight;
  return expressionQuestion('estimation-calculation', `${formatNumber(left)} + ${formatNumber(right)} ≈ ?`, correct, `Làm tròn: ${formatNumber(left)} ≈ ${formatNumber(roundedLeft)} và ${formatNumber(right)} ≈ ${formatNumber(roundedRight)}; do đó tổng ước lượng là ${formatNumber(correct)}.`, `estimate-sum-${left}-${right}`, 200_000, 'Làm tròn mỗi số đến hàng nghìn');
}

function averageUnitRateQuestion(): ContextQuestion {
  if (Math.random() < 0.55) {
    const average = randomInt(20, 150);
    const gap = randomInt(3, 25);
    const values = [average - gap, average, average + gap];
    const signature = `average-${average}-${gap}`;
    return {
      id: questionId(signature), signature, type: 'context', skillId: 'average-unit-rate', icon: '📊',
      visualTitle: 'Ba ngày thu gom giấy', visualLines: values.map((value, index) => `Ngày ${index + 1}: ${value} kg`),
      instruction: 'Trung bình mỗi ngày thu gom bao nhiêu ki-lô-gam?',
      answers: numericAnswers(average, 1, 300, [gap, -gap, 3, -3, 10, -10]), correctAnswer: average,
      hintSteps: ['Cộng khối lượng của ba ngày.', `${values.join(' + ')} = ${average * 3} kg.`, `${average * 3} : 3 = ${average} kg.`],
      explanation: `Trung bình cộng = (${values.join(' + ')}) : 3 = ${average} kg.`,
    };
  }
  const boxes = randomInt(3, 12);
  const perBox = randomInt(6, 30);
  const total = boxes * perBox;
  const wantedBoxes = randomInt(2, 9);
  const correct = perBox * wantedBoxes;
  const signature = `unit-rate-${boxes}-${perBox}-${wantedBoxes}`;
  return {
    id: questionId(signature), signature, type: 'context', skillId: 'average-unit-rate', icon: '📦',
    visualTitle: `${boxes} hộp có ${total} quyển vở`, visualLines: [`Mỗi hộp có số vở như nhau`, `Hỏi ${wantedBoxes} hộp`],
    instruction: `${wantedBoxes} hộp có bao nhiêu quyển vở?`,
    answers: numericAnswers(correct, 1, 500, [perBox, -perBox, boxes, -boxes, wantedBoxes, -wantedBoxes]), correctAnswer: correct,
    hintSteps: [`Một hộp có ${total} : ${boxes} = ${perBox} quyển.`, `${wantedBoxes} hộp có ${perBox} × ${wantedBoxes} quyển.`, `Kết quả là ${correct} quyển vở.`],
    explanation: `Rút về một hộp: ${total} : ${boxes} = ${perBox}; sau đó ${perBox} × ${wantedBoxes} = ${correct} quyển vở.`,
  };
}

function dataSeriesQuestion(): SequenceQuestion {
  const values = Array.from({ length: 6 }, () => randomInt(2, 12));
  const target = pick(values);
  const correct = values.filter((value) => value === target).length;
  const signature = `data-series-${values.join('-')}-${target}`;
  return {
    id: questionId(signature), signature, type: 'sequence', skillId: 'data-series', values,
    instruction: `Số ${target} xuất hiện bao nhiêu lần trong dãy số liệu?`,
    answers: numericAnswers(correct, 0, 6, [1, -1, 2, -2, 3, -3]), correctAnswer: correct,
    hintSteps: [`Tìm từng vị trí có số ${target}.`, `Đánh dấu mỗi lần số ${target} xuất hiện.`, `Số ${target} xuất hiện ${correct} lần.`],
    explanation: `Kiểm đếm dãy ${values.join(', ')}, ta thấy số ${target} xuất hiện ${correct} lần.`,
  };
}

function columnChartQuestion(): BarChartQuestion {
  const labels = ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'];
  const values = shuffle([randomInt(3, 6), randomInt(7, 10), randomInt(11, 14), randomInt(15, 18)]);
  const mode = Math.random() < 0.5 ? 'max' : 'difference';
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const correct = mode === 'max' ? maxValue : maxValue - minValue;
  const signature = `column-chart-${values.join('-')}-${mode}`;
  return {
    id: questionId(signature), signature, type: 'bar-chart', skillId: 'column-chart', labels, values, chartTitle: 'Số cây mỗi tổ trồng được',
    instruction: mode === 'max' ? 'Tổ trồng nhiều cây nhất được bao nhiêu cây?' : 'Tổ nhiều nhất trồng hơn tổ ít nhất bao nhiêu cây?',
    answers: numericAnswers(correct, 0, 25, [1, -1, 2, -2, 3, -3]), correctAnswer: correct,
    hintSteps: ['Đọc số ghi trên đỉnh từng cột.', `Giá trị lớn nhất là ${maxValue}, nhỏ nhất là ${minValue}.`, mode === 'max' ? `Kết quả là ${maxValue} cây.` : `${maxValue} − ${minValue} = ${correct} cây.`],
    explanation: mode === 'max' ? `Cột cao nhất có giá trị ${maxValue}, nên tổ trồng nhiều nhất được ${maxValue} cây.` : `Lấy giá trị lớn nhất trừ giá trị nhỏ nhất: ${maxValue} − ${minValue} = ${correct} cây.`,
  };
}

function eventFrequencyQuestion(): ContextQuestion {
  const outcomes = Array.from({ length: 10 }, () => Math.random() < 0.5 ? '🔴' : '🔵');
  const target = Math.random() < 0.5 ? '🔴' : '🔵';
  const correct = outcomes.filter((value) => value === target).length;
  const signature = `event-frequency-${outcomes.join('')}-${target}`;
  return {
    id: questionId(signature), signature, type: 'context', skillId: 'event-frequency', icon: '🎲',
    visualTitle: outcomes.join(' '), visualLines: ['Kết quả 10 lần rút bóng'],
    instruction: `Bóng ${target === '🔴' ? 'đỏ' : 'xanh'} xuất hiện bao nhiêu lần?`,
    answers: numericAnswers(correct, 0, 10, [1, -1, 2, -2, 3, -3]), correctAnswer: correct,
    hintSteps: [`Chỉ đếm các kí hiệu ${target}.`, 'Gạch hoặc chạm theo từng kết quả để không bị sót.', `${target} xuất hiện ${correct} lần.`],
    explanation: `Trong 10 kết quả, ${target} xuất hiện ${correct} lần.`,
  };
}

function fractionConceptQuestion(): FractionQuestion {
  const denominator = randomInt(3, 10);
  const numerator = randomInt(1, denominator - 1);
  const correct = `${numerator}/${denominator}`;
  const answers = new Set<string>([correct]);
  for (const candidate of [`${denominator}/${numerator}`, `${numerator + 1}/${denominator}`, `${numerator}/${denominator + 1}`, `${Math.max(1, numerator - 1)}/${denominator}`]) {
    if (candidate !== correct) answers.add(candidate);
    if (answers.size === 4) break;
  }
  const signature = `fraction-concept-${numerator}-${denominator}`;
  return {
    id: questionId(signature), signature, type: 'fraction', skillId: 'fraction-concept', numerator, denominator, caption: 'Phần đã tô màu',
    instruction: 'Phân số nào chỉ phần đã tô màu?', answers: shuffle([...answers]), correctAnswer: correct,
    hintSteps: ['Mẫu số cho biết hình được chia thành bao nhiêu phần bằng nhau.', 'Tử số cho biết có bao nhiêu phần đã tô màu.', `Có ${numerator} trong ${denominator} phần được tô, nên phân số là ${correct}.`],
    explanation: `Hình chia thành ${denominator} phần bằng nhau và tô màu ${numerator} phần, nên phân số là ${correct}.`,
  };
}

function equivalentFractionQuestion(): FractionQuestion {
  const denominator = randomInt(2, 8);
  const numerator = randomInt(1, denominator - 1);
  const multiplier = randomInt(2, 5);
  const correct = `${numerator * multiplier}/${denominator * multiplier}`;
  const signature = `equivalent-${numerator}-${denominator}-${multiplier}`;
  return {
    id: questionId(signature), signature, type: 'fraction', skillId: 'fraction-properties', numerator, denominator, caption: `Tìm phân số bằng ${numerator}/${denominator}`,
    instruction: `Phân số nào bằng ${numerator}/${denominator}?`,
    answers: fractionAnswers(correct, [`${numerator + multiplier}/${denominator + multiplier}`, `${numerator * multiplier}/${denominator + multiplier}`, `${numerator + multiplier}/${denominator * multiplier}`, `${numerator}/${denominator * multiplier}`]), correctAnswer: correct,
    hintSteps: ['Muốn tạo phân số bằng nhau, nhân cả tử và mẫu với cùng một số.', `Nhân cả tử và mẫu với ${multiplier}.`, `${numerator}/${denominator} = ${numerator * multiplier}/${denominator * multiplier}.`],
    explanation: `Nhân cả tử số và mẫu số với ${multiplier}: ${numerator}/${denominator} = ${correct}.`,
  };
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

function simplifyFractionQuestion(): ExpressionQuestion {
  const simpleDenominator = randomInt(3, 10);
  const simpleNumerator = randomInt(1, simpleDenominator - 1);
  const common = greatestCommonDivisor(simpleNumerator, simpleDenominator);
  const baseNumerator = simpleNumerator / common;
  const baseDenominator = simpleDenominator / common;
  const multiplier = randomInt(2, 6);
  const numerator = baseNumerator * multiplier;
  const denominator = baseDenominator * multiplier;
  const correct = `${baseNumerator}/${baseDenominator}`;
  const signature = `simplify-${numerator}-${denominator}`;
  return {
    id: questionId(signature), signature, type: 'expression', skillId: 'simplify-common-denominator', expression: `${numerator}/${denominator}`, caption: 'Rút gọn phân số',
    instruction: 'Phân số tối giản là phân số nào?',
    answers: fractionAnswers(correct, [`${baseNumerator}/${denominator}`, `${numerator}/${baseDenominator}`, `${baseNumerator + 1}/${baseDenominator}`, `${numerator - 1}/${denominator}`]), correctAnswer: correct,
    hintSteps: [`Tử và mẫu cùng chia hết cho ${multiplier}.`, `${numerator} : ${multiplier} = ${baseNumerator}; ${denominator} : ${multiplier} = ${baseDenominator}.`, `Phân số tối giản là ${correct}.`],
    explanation: `Chia cả tử và mẫu cho ${multiplier}: ${numerator}/${denominator} = ${correct}.`,
  };
}

function compareFractionQuestion(): ExpressionQuestion {
  const sameDenominator = Math.random() < 0.5;
  let leftNumerator: number;
  let leftDenominator: number;
  let rightNumerator: number;
  let rightDenominator: number;
  if (sameDenominator) {
    leftDenominator = rightDenominator = randomInt(4, 12);
    leftNumerator = randomInt(1, leftDenominator - 1);
    do rightNumerator = randomInt(1, rightDenominator - 1); while (rightNumerator === leftNumerator);
  } else {
    leftNumerator = rightNumerator = randomInt(1, 5);
    leftDenominator = randomInt(leftNumerator + 1, 10);
    do rightDenominator = randomInt(rightNumerator + 1, 10); while (rightDenominator === leftDenominator);
  }
  const leftValue = leftNumerator / leftDenominator;
  const rightValue = rightNumerator / rightDenominator;
  const correct = leftValue > rightValue ? '>' : '<';
  const signature = `compare-fraction-${leftNumerator}-${leftDenominator}-${rightNumerator}-${rightDenominator}`;
  return {
    id: questionId(signature), signature, type: 'expression', skillId: 'compare-fractions', expression: `${leftNumerator}/${leftDenominator}  ?  ${rightNumerator}/${rightDenominator}`, caption: 'Chọn dấu thích hợp',
    instruction: 'Dấu nào thích hợp với dấu hỏi?', answers: shuffle(['>', '<', '=']), correctAnswer: correct,
    hintSteps: [sameDenominator ? 'Hai phân số cùng mẫu: so sánh hai tử số.' : 'Hai phân số cùng tử: mẫu số bé hơn thì phân số lớn hơn.', sameDenominator ? `So sánh ${leftNumerator} với ${rightNumerator}.` : `So sánh hai mẫu ${leftDenominator} và ${rightDenominator}.`, `${leftNumerator}/${leftDenominator} ${correct} ${rightNumerator}/${rightDenominator}.`],
    explanation: `${leftNumerator}/${leftDenominator} ${correct} ${rightNumerator}/${rightDenominator}${sameDenominator ? ' vì hai phân số cùng mẫu nên phân số có tử lớn hơn sẽ lớn hơn.' : ' vì hai phân số cùng tử nên phân số có mẫu bé hơn sẽ lớn hơn.'}`,
  };
}

function reducedFraction(numerator: number, denominator: number) {
  const divisor = greatestCommonDivisor(Math.abs(numerator), Math.abs(denominator));
  return `${numerator / divisor}/${denominator / divisor}`;
}

function fractionAddSubtractQuestion(operation: 'add' | 'subtract'): ExpressionQuestion {
  const sameDenominator = Math.random() < 0.5;
  let leftNumerator: number;
  let leftDenominator: number;
  let rightNumerator: number;
  let rightDenominator: number;
  if (sameDenominator) {
    leftDenominator = rightDenominator = randomInt(4, 12);
    leftNumerator = randomInt(operation === 'subtract' ? 2 : 1, leftDenominator - 1);
    rightNumerator = operation === 'subtract' ? randomInt(1, leftNumerator - 1) : randomInt(1, rightDenominator - 1);
  } else {
    leftDenominator = randomInt(3, 9);
    rightDenominator = randomInt(2, 8);
    if (rightDenominator === leftDenominator) rightDenominator += 1;
    leftNumerator = randomInt(1, leftDenominator - 1);
    rightNumerator = randomInt(1, rightDenominator - 1);
    if (operation === 'subtract' && leftNumerator * rightDenominator <= rightNumerator * leftDenominator) {
      [leftNumerator, rightNumerator] = [rightNumerator, leftNumerator];
      [leftDenominator, rightDenominator] = [rightDenominator, leftDenominator];
    }
  }
  const commonDenominator = leftDenominator * rightDenominator;
  const convertedLeft = leftNumerator * rightDenominator;
  const convertedRight = rightNumerator * leftDenominator;
  const resultNumerator = operation === 'add' ? convertedLeft + convertedRight : convertedLeft - convertedRight;
  const correct = reducedFraction(resultNumerator, commonDenominator);
  const symbol = operation === 'add' ? '+' : '−';
  const skillId: Grade4Stage1SkillId = operation === 'add' ? 'fraction-addition' : 'fraction-subtraction';
  const expression = `${leftNumerator}/${leftDenominator} ${symbol} ${rightNumerator}/${rightDenominator} = ?`;
  const signature = `fraction-${operation}-${leftNumerator}-${leftDenominator}-${rightNumerator}-${rightDenominator}`;
  const commonStep = sameDenominator
    ? `Hai phân số cùng mẫu ${leftDenominator}, giữ nguyên mẫu số.`
    : `Quy đồng: ${leftNumerator}/${leftDenominator} = ${convertedLeft}/${commonDenominator} và ${rightNumerator}/${rightDenominator} = ${convertedRight}/${commonDenominator}.`;
  const rawNumerator = sameDenominator
    ? operation === 'add' ? leftNumerator + rightNumerator : leftNumerator - rightNumerator
    : resultNumerator;
  const rawDenominator = sameDenominator ? leftDenominator : commonDenominator;
  return {
    id: questionId(signature), signature, type: 'expression', skillId, expression, caption: operation === 'add' ? 'Cộng hai phân số' : 'Trừ hai phân số',
    instruction: 'Chọn kết quả đúng ở dạng tối giản.',
    answers: fractionAnswers(correct, [`${rawNumerator}/${rawDenominator + 1}`, `${Math.abs(convertedLeft - convertedRight)}/${commonDenominator}`, `${convertedLeft + convertedRight}/${commonDenominator + 1}`, `${rawNumerator + 1}/${rawDenominator}`]), correctAnswer: correct,
    hintSteps: [commonStep, `${sameDenominator ? leftNumerator : convertedLeft} ${symbol} ${sameDenominator ? rightNumerator : convertedRight} = ${rawNumerator}.`, `Rút gọn kết quả được ${correct}.`],
    explanation: `${expression.replace(' = ?', '')} = ${rawNumerator}/${rawDenominator}${`${rawNumerator}/${rawDenominator}` === correct ? '' : ` = ${correct}`}.`,
  };
}

function fractionMultiplyQuestion(): ExpressionQuestion {
  const leftNumerator = randomInt(1, 8);
  const leftDenominator = randomInt(leftNumerator + 1, 12);
  const rightNumerator = randomInt(1, 8);
  const rightDenominator = randomInt(rightNumerator + 1, 12);
  const productNumerator = leftNumerator * rightNumerator;
  const productDenominator = leftDenominator * rightDenominator;
  const correct = reducedFraction(productNumerator, productDenominator);
  const signature = `fraction-multiply-${leftNumerator}-${leftDenominator}-${rightNumerator}-${rightDenominator}`;
  return {
    id: questionId(signature), signature, type: 'expression', skillId: 'fraction-multiplication',
    expression: `${leftNumerator}/${leftDenominator} × ${rightNumerator}/${rightDenominator} = ?`, caption: 'Nhân hai phân số',
    instruction: 'Kết quả tối giản là phân số nào?',
    answers: fractionAnswers(correct, [`${leftNumerator + rightNumerator}/${leftDenominator + rightDenominator}`, `${productNumerator}/${leftDenominator + rightDenominator}`, `${leftNumerator + rightNumerator}/${productDenominator}`, `${productNumerator + 1}/${productDenominator}`]), correctAnswer: correct,
    hintSteps: ['Nhân tử với tử, mẫu với mẫu.', `${leftNumerator} × ${rightNumerator} = ${productNumerator}; ${leftDenominator} × ${rightDenominator} = ${productDenominator}.`, `Rút gọn ${productNumerator}/${productDenominator} được ${correct}.`],
    explanation: `${leftNumerator}/${leftDenominator} × ${rightNumerator}/${rightDenominator} = ${productNumerator}/${productDenominator}${`${productNumerator}/${productDenominator}` === correct ? '' : ` = ${correct}`}.`,
  };
}

function fractionDivideQuestion(): ExpressionQuestion {
  const leftNumerator = randomInt(1, 8);
  const leftDenominator = randomInt(leftNumerator + 1, 12);
  const rightNumerator = randomInt(1, 8);
  const rightDenominator = randomInt(rightNumerator + 1, 12);
  const resultNumerator = leftNumerator * rightDenominator;
  const resultDenominator = leftDenominator * rightNumerator;
  const correct = reducedFraction(resultNumerator, resultDenominator);
  const signature = `fraction-divide-${leftNumerator}-${leftDenominator}-${rightNumerator}-${rightDenominator}`;
  return {
    id: questionId(signature), signature, type: 'expression', skillId: 'fraction-division',
    expression: `${leftNumerator}/${leftDenominator} : ${rightNumerator}/${rightDenominator} = ?`, caption: 'Chia hai phân số',
    instruction: 'Kết quả tối giản là phân số nào?',
    answers: fractionAnswers(correct, [`${leftNumerator * rightNumerator}/${leftDenominator * rightDenominator}`, `${leftNumerator + rightDenominator}/${leftDenominator + rightNumerator}`, `${resultNumerator}/${resultDenominator + 1}`, `${resultNumerator + 1}/${resultDenominator}`]), correctAnswer: correct,
    hintSteps: [`Đảo ngược phân số thứ hai: ${rightNumerator}/${rightDenominator} thành ${rightDenominator}/${rightNumerator}.`, `Tính ${leftNumerator}/${leftDenominator} × ${rightDenominator}/${rightNumerator} = ${resultNumerator}/${resultDenominator}.`, `Rút gọn được ${correct}.`],
    explanation: `${leftNumerator}/${leftDenominator} : ${rightNumerator}/${rightDenominator} = ${leftNumerator}/${leftDenominator} × ${rightDenominator}/${rightNumerator} = ${resultNumerator}/${resultDenominator}${`${resultNumerator}/${resultDenominator}` === correct ? '' : ` = ${correct}`}.`,
  };
}

function fractionOfNumberQuestion(): ContextQuestion {
  const denominator = randomInt(2, 10);
  const numerator = randomInt(1, denominator - 1);
  const unit = randomInt(4, 30);
  const whole = denominator * unit;
  const correct = numerator * unit;
  const signature = `fraction-of-number-${numerator}-${denominator}-${whole}`;
  return {
    id: questionId(signature), signature, type: 'context', skillId: 'fraction-of-number', icon: '🍊',
    visualTitle: `${numerator}/${denominator} của ${whole} quả cam`, visualLines: [`Chia ${whole} quả thành ${denominator} phần bằng nhau`, `Lấy ${numerator} phần`],
    instruction: `${numerator}/${denominator} của ${whole} bằng bao nhiêu?`,
    answers: numericAnswers(correct, 1, whole, [unit, -unit, numerator, -numerator, denominator, -denominator]), correctAnswer: correct,
    hintSteps: [`Một phần là ${whole} : ${denominator} = ${unit}.`, `${numerator} phần là ${unit} × ${numerator}.`, `Kết quả là ${correct}.`],
    explanation: `Muốn tìm ${numerator}/${denominator} của ${whole}, ta tính ${whole} : ${denominator} × ${numerator} = ${correct}.`,
  };
}

function finalNaturalNumberQuestion(): Grade4Stage1Question {
  const mode = randomInt(0, 3);
  const question = mode === 0 ? largeNumberQuestion() : mode === 1 ? largeAddSubtractQuestion() : mode === 2 ? multiplyDivideNaturalQuestion() : averageUnitRateQuestion();
  return { ...question, skillId: 'final-natural-numbers' };
}

function finalFractionQuestion(): Grade4Stage1Question {
  const mode = randomInt(0, 4);
  const question = mode === 0 ? compareFractionQuestion() : mode === 1 ? fractionAddSubtractQuestion('add') : mode === 2 ? fractionAddSubtractQuestion('subtract') : mode === 3 ? fractionMultiplyQuestion() : fractionDivideQuestion();
  return { ...question, skillId: 'final-fractions' };
}

function finalGeometryMeasurementQuestion(): Grade4Stage1Question {
  const mode = randomInt(0, 5);
  const question = mode === 0 ? angleQuestion() : mode === 1 ? lineQuestion('perpendicular') : mode === 2 ? lineQuestion('parallel') : mode === 3 ? quadrilateralQuestion() : mode === 4 ? massUnitQuestion() : areaUnitQuestion();
  return { ...question, skillId: 'final-geometry-measurement' };
}

function finalDataProbabilityQuestion(): Grade4Stage1Question {
  const mode = randomInt(0, 2);
  const question = mode === 0 ? dataSeriesQuestion() : mode === 1 ? columnChartQuestion() : eventFrequencyQuestion();
  return { ...question, skillId: 'final-data-probability' };
}

type Factory = () => Grade4Stage1Question;

function uniqueQuestions(plan: Factory[], total: 5 | 10 | 15) {
  const questions: Grade4Stage1Question[] = [];
  const signatures = new Set<string>();
  let attempts = 0;
  while (questions.length < total && attempts < total * 40) {
    const question = plan[questions.length % plan.length]();
    attempts += 1;
    if (signatures.has(question.signature)) continue;
    signatures.add(question.signature);
    questions.push(question);
  }
  return shuffle(questions);
}

export function generateGrade4Stage1Questions(module: Grade4Stage1Module, total: 5 | 10 | 15 = 10) {
  const plans: Record<Grade4Stage1Module, Factory[]> = {
    review: [reviewNumberQuestion, reviewOperationQuestion, oddEvenQuestion, letterExpressionQuestion, threeStepProblemQuestion],
    angles: [angleQuestion, angleMeasureQuestion, angleQuestion, angleMeasureQuestion, angleQuestion],
    'large-numbers': [largeNumberQuestion, roundLargeNumberQuestion, compareLargeNumberQuestion, naturalSequenceQuestion, largeNumberQuestion],
    measurement: [massUnitQuestion, areaUnitQuestion, timeCenturyQuestion, massUnitQuestion, areaUnitQuestion],
    'add-subtract': [largeAddSubtractQuestion, additionPropertyQuestion, sumDifferenceQuestion, largeAddSubtractQuestion, sumDifferenceQuestion],
    'lines-shapes': [() => lineQuestion('perpendicular'), () => lineQuestion('parallel'), quadrilateralQuestion, () => lineQuestion(Math.random() < 0.5 ? 'perpendicular' : 'parallel'), quadrilateralQuestion],
    'semester-1-review': [semesterOneLargeNumberQuestion, semesterOneAddSubtractQuestion, semesterOneGeometryQuestion, semesterOneMeasurementQuestion, semesterOneAddSubtractQuestion],
    'multiply-divide': [multiplyDivideNaturalQuestion, multiplicationPropertyQuestion, estimationQuestion, averageUnitRateQuestion, multiplyDivideNaturalQuestion],
    statistics: [dataSeriesQuestion, columnChartQuestion, eventFrequencyQuestion, columnChartQuestion, dataSeriesQuestion],
    fractions: [fractionConceptQuestion, equivalentFractionQuestion, simplifyFractionQuestion, compareFractionQuestion, fractionConceptQuestion],
    'fraction-add-subtract': [() => fractionAddSubtractQuestion('add'), () => fractionAddSubtractQuestion('subtract'), () => fractionAddSubtractQuestion('add'), () => fractionAddSubtractQuestion('subtract')],
    'fraction-multiply-divide': [fractionMultiplyQuestion, fractionDivideQuestion, fractionOfNumberQuestion, fractionMultiplyQuestion, fractionDivideQuestion],
    'final-review': [finalNaturalNumberQuestion, finalFractionQuestion, finalGeometryMeasurementQuestion, finalDataProbabilityQuestion, finalNaturalNumberQuestion],
  };
  return uniqueQuestions(plans[module], total);
}
