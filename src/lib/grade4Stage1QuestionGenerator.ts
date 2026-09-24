export type Grade4Stage1Module = 'review' | 'angles' | 'large-numbers' | 'measurement' | 'add-subtract' | 'lines-shapes';
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
  | 'parallelogram-rhombus';

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

export type Grade4Stage1Question =
  | ExpressionQuestion
  | NumberQuestion
  | CompareQuestion
  | AngleQuestion
  | SequenceQuestion
  | ContextQuestion
  | DiagramQuestion;

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
  };
  return uniqueQuestions(plans[module], total);
}
