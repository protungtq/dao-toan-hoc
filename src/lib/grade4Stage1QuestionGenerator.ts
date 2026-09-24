export type Grade4Stage1Module = 'review' | 'angles' | 'large-numbers';
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
  | 'natural-number-sequence';

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

export type Grade4Stage1Question =
  | ExpressionQuestion
  | NumberQuestion
  | CompareQuestion
  | AngleQuestion
  | SequenceQuestion
  | ContextQuestion;

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
  };
  return uniqueQuestions(plans[module], total);
}
