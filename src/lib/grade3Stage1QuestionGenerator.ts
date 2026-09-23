export type Grade3Stage1Module = 'review' | 'tables';
export type Grade3Stage1SkillId =
  | 'review-numbers-1000'
  | 'operation-components-grade-3'
  | 'review-tables-2-to-5'
  | 'review-geometry-measurement'
  | 'tables-6-to-9'
  | 'multiply-divide-components'
  | 'unit-fractions';

export type Grade3Stage1Answer = number | string;

export const GRADE3_STAGE1_SKILL_LABELS: Record<Grade3Stage1SkillId, string> = {
  'review-numbers-1000': 'Số và phép tính đến 1 000',
  'operation-components-grade-3': 'Thành phần phép tính',
  'review-tables-2-to-5': 'Bảng nhân chia 2–5',
  'review-geometry-measurement': 'Hình học và đo lường',
  'tables-6-to-9': 'Bảng nhân chia 6–9',
  'multiply-divide-components': 'Thành phần nhân chia',
  'unit-fractions': 'Một phần mấy',
};

type BaseQuestion = {
  id: string;
  signature: string;
  skillId: Grade3Stage1SkillId;
  instruction: string;
  answers: Grade3Stage1Answer[];
  correctAnswer: Grade3Stage1Answer;
  hintSteps: [string, string, string];
  explanation: string;
};

export type ExpressionQuestion = BaseQuestion & { type: 'expression'; expression: string; caption?: string };
export type PlaceValueQuestion = BaseQuestion & { type: 'place-value'; number: number; highlightedPlace: 'trăm' | 'chục' | 'đơn vị' };
export type CompareQuestion = BaseQuestion & { type: 'compare'; left: number; right: number };
export type GroupsQuestion = BaseQuestion & { type: 'groups'; groups: number; perGroup: number; icon: string };
export type FractionQuestion = BaseQuestion & { type: 'fraction'; denominator: number; mode: 'recognize' | 'of-set'; total?: number; icon?: string };
export type ContextQuestion = BaseQuestion & { type: 'context'; icon: string; visualTitle: string; visualText: string };

export type Grade3Stage1Question =
  | ExpressionQuestion
  | PlaceValueQuestion
  | CompareQuestion
  | GroupsQuestion
  | FractionQuestion
  | ContextQuestion;

const ICONS = ['🍎', '⭐', '⚽', '🧁', '🐟', '🌼'] as const;
const FRACTIONS = [2, 3, 4, 5, 6, 8, 9] as const;

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

function numericAnswers(correct: number, min = 0, max = 1000, steps: number[] = [1, -1, 10, -10, 2, -2]) {
  const values = new Set<number>([correct]);
  for (const step of shuffle(steps)) {
    const value = correct + step;
    if (value >= min && value <= max) values.add(value);
    if (values.size === 4) break;
  }
  while (values.size < 4) values.add(randomInt(min, max));
  return shuffle([...values]);
}

function expressionQuestion(skillId: Grade3Stage1SkillId, expression: string, correct: number, explanation: string, signature: string, caption?: string, max = 1000): ExpressionQuestion {
  return {
    id: questionId(signature), signature, type: 'expression', skillId, expression, caption,
    instruction: pick(['Số nào thích hợp với ô trống?', 'Tìm giá trị còn thiếu.', 'Chọn đáp án đúng cho phép tính này.']),
    answers: numericAnswers(correct, 0, max, [1, -1, 2, -2, 5, -5, 10, -10, 100, -100]),
    correctAnswer: correct,
    hintSteps: ['Xác định phép tính và vị trí cần tìm.', 'Liên hệ phép tính ngược hoặc bảng tính đã học.', explanation],
    explanation,
  };
}

function reviewNumberQuestion(): Grade3Stage1Question {
  const mode = pick(['place', 'compare', 'addition', 'subtraction'] as const);
  if (mode === 'place') {
    const hundreds = randomInt(1, 9), tens = randomInt(0, 9), ones = randomInt(0, 9);
    const number = hundreds * 100 + tens * 10 + ones;
    const place = pick(['trăm', 'chục', 'đơn vị'] as const);
    const digit = place === 'trăm' ? hundreds : place === 'chục' ? tens : ones;
    const correct = place === 'trăm' ? digit * 100 : place === 'chục' ? digit * 10 : digit;
    const signature = `place-${number}-${place}`;
    return {
      id: questionId(signature), signature, type: 'place-value', skillId: 'review-numbers-1000', number, highlightedPlace: place,
      instruction: `Chữ số ở hàng ${place} có giá trị bao nhiêu?`,
      answers: numericAnswers(correct, 0, 900, [1, -1, 10, -10, 100, -100]), correctAnswer: correct,
      hintSteps: [`Tách số ${number} thành trăm, chục và đơn vị.`, `Hãy nhìn chữ số ở cột hàng ${place}.`, `Giá trị cần tìm là ${correct}.`],
      explanation: `Trong số ${number}, chữ số hàng ${place} có giá trị ${correct}.`,
    };
  }
  if (mode === 'compare') {
    const left = randomInt(100, 999);
    const relation = pick([-1, 0, 1] as const);
    const right = relation === 0 ? left : Math.max(100, Math.min(999, left + relation * randomInt(1, 80)));
    const correct = left === right ? '=' : left > right ? '>' : '<';
    const signature = `compare-${left}-${right}`;
    return {
      id: questionId(signature), signature, type: 'compare', skillId: 'review-numbers-1000', left, right,
      instruction: 'Dấu nào thích hợp đặt giữa hai số?', answers: shuffle(['>', '<', '=']), correctAnswer: correct,
      hintSteps: ['So sánh hàng trăm trước.', 'Nếu hàng trăm bằng nhau, so sánh hàng chục rồi hàng đơn vị.', `${left} ${correct} ${right}.`],
      explanation: `${left} ${correct} ${right}.`,
    };
  }
  if (mode === 'addition') {
    const left = randomInt(120, 750), right = randomInt(20, 999 - left), correct = left + right;
    return expressionQuestion('review-numbers-1000', `${left} + ${right} = □`, correct, `${left} + ${right} = ${correct}.`, `add-${left}-${right}`);
  }
  const left = randomInt(250, 999), right = randomInt(20, left - 1), correct = left - right;
  return expressionQuestion('review-numbers-1000', `${left} − ${right} = □`, correct, `${left} − ${right} = ${correct}.`, `subtract-${left}-${right}`);
}

function operationComponentQuestion(): ExpressionQuestion {
  const operation = pick(['missing-addend', 'missing-minuend', 'missing-subtrahend'] as const);
  const first = randomInt(30, 500), second = randomInt(20, 450);
  if (operation === 'missing-addend') {
    const sum = first + second;
    return expressionQuestion('operation-components-grade-3', `${first} + □ = ${sum}`, second, `Muốn tìm số hạng chưa biết, lấy ${sum} − ${first} = ${second}.`, `missing-addend-${first}-${sum}`);
  }
  const minuend = first + second;
  if (operation === 'missing-minuend') return expressionQuestion('operation-components-grade-3', `□ − ${second} = ${first}`, minuend, `Muốn tìm số bị trừ, lấy ${first} + ${second} = ${minuend}.`, `missing-minuend-${second}-${first}`);
  return expressionQuestion('operation-components-grade-3', `${minuend} − □ = ${first}`, second, `Muốn tìm số trừ, lấy ${minuend} − ${first} = ${second}.`, `missing-subtrahend-${minuend}-${first}`);
}

function reviewTableQuestion(): Grade3Stage1Question {
  const factor = randomInt(2, 5), times = randomInt(1, 10), total = factor * times;
  const division = Math.random() < 0.5;
  if (division) return expressionQuestion('review-tables-2-to-5', `${total} : ${factor} = □`, times, `${factor} × ${times} = ${total}, nên ${total} : ${factor} = ${times}.`, `review-divide-${total}-${factor}`, `Liên hệ bảng nhân ${factor}`, 50);
  return expressionQuestion('review-tables-2-to-5', `${factor} × ${times} = □`, total, `${factor} × ${times} = ${total}.`, `review-multiply-${factor}-${times}`, `Bảng nhân ${factor}`, 50);
}

function geometryMeasurementQuestion(): ContextQuestion {
  const variants = [
    { icon: '✏️', title: 'Chiếc bút chì', text: 'Dài khoảng 15 …', question: 'Đơn vị nào thích hợp điền vào chỗ trống?', correct: 'cm', answers: ['cm', 'm', 'km', 'kg'], explain: 'Chiếc bút chì thường được đo bằng xăng-ti-mét.' },
    { icon: '🛣️', title: 'Quãng đường', text: 'Từ nhà đến trường dài khoảng 2 …', question: 'Đơn vị nào thích hợp điền vào chỗ trống?', correct: 'km', answers: ['km', 'm', 'cm', 'l'], explain: 'Quãng đường dài giữa hai địa điểm thường đo bằng ki-lô-mét.' },
    { icon: '🥛', title: 'Bình nước', text: 'Bình chứa được 2 … nước', question: 'Đơn vị nào thích hợp điền vào chỗ trống?', correct: 'l', answers: ['l', 'kg', 'm', 'cm'], explain: 'Sức chứa của bình nước có thể đo bằng lít.' },
    { icon: '📦', title: 'Khối hộp chữ nhật', text: 'Quan sát hình khối quen thuộc', question: 'Khối hộp chữ nhật có bao nhiêu mặt?', correct: 6, answers: [4, 5, 6, 8], explain: 'Khối hộp chữ nhật có 6 mặt.' },
    { icon: '▭', title: 'Hình chữ nhật', text: 'Bốn góc đều là góc vuông', question: 'Hình chữ nhật có bao nhiêu góc vuông?', correct: 4, answers: [2, 3, 4, 6], explain: 'Hình chữ nhật có 4 góc vuông.' },
  ] as const;
  const variant = pick(variants), signature = `geometry-${variant.title}-${variant.correct}`;
  return {
    id: questionId(signature), signature, type: 'context', skillId: 'review-geometry-measurement', icon: variant.icon, visualTitle: variant.title, visualText: variant.text,
    instruction: variant.question, answers: shuffle(variant.answers), correctAnswer: variant.correct,
    hintSteps: ['Nhớ lại đặc điểm của đồ vật hoặc hình đã học.', variant.text, variant.explain], explanation: variant.explain,
  };
}

function tableSixToNineQuestion(forceDivision?: boolean): Grade3Stage1Question {
  const factor = randomInt(6, 9), times = randomInt(1, 10), total = factor * times;
  const division = forceDivision ?? Math.random() < 0.5;
  if (Math.random() < 0.3 && !division) {
    const signature = `groups-${times}-${factor}`;
    return {
      id: questionId(signature), signature, type: 'groups', skillId: 'tables-6-to-9', groups: times, perGroup: factor, icon: pick(ICONS),
      instruction: `${times} nhóm, mỗi nhóm có ${factor}. Có tất cả bao nhiêu?`, answers: numericAnswers(total, 0, 100, [1, -1, factor, -factor, 10, -10]), correctAnswer: total,
      hintSteps: [`Có ${times} nhóm bằng nhau.`, `Lấy ${factor} nhân với ${times}.`, `${factor} × ${times} = ${total}.`], explanation: `${times} nhóm, mỗi nhóm ${factor}: ${times} × ${factor} = ${total}.`,
    };
  }
  if (division) return expressionQuestion('tables-6-to-9', `${total} : ${factor} = □`, times, `${factor} × ${times} = ${total}, nên ${total} : ${factor} = ${times}.`, `divide-${total}-${factor}`, `Bảng chia ${factor}`, 100);
  return expressionQuestion('tables-6-to-9', `${factor} × ${times} = □`, total, `${factor} × ${times} = ${total}.`, `multiply-${factor}-${times}`, `Bảng nhân ${factor}`, 100);
}

function multiplyDivideComponentQuestion(): ExpressionQuestion {
  const factor = randomInt(6, 9), other = randomInt(2, 10), product = factor * other;
  const mode = pick(['factor', 'dividend', 'divisor'] as const);
  if (mode === 'factor') return expressionQuestion('multiply-divide-components', `□ × ${other} = ${product}`, factor, `Muốn tìm thừa số chưa biết, lấy ${product} : ${other} = ${factor}.`, `missing-factor-${other}-${product}`, undefined, 100);
  if (mode === 'dividend') return expressionQuestion('multiply-divide-components', `□ : ${factor} = ${other}`, product, `Muốn tìm số bị chia, lấy ${other} × ${factor} = ${product}.`, `missing-dividend-${factor}-${other}`, undefined, 100);
  return expressionQuestion('multiply-divide-components', `${product} : □ = ${other}`, factor, `Muốn tìm số chia, lấy ${product} : ${other} = ${factor}.`, `missing-divisor-${product}-${other}`, undefined, 100);
}

function fractionQuestion(): FractionQuestion {
  const denominator = pick(FRACTIONS), mode = pick(['recognize', 'of-set'] as const);
  if (mode === 'recognize') {
    const correct = `1/${denominator}`, signature = `fraction-recognize-${denominator}`;
    const alternatives = shuffle(FRACTIONS.filter((value) => value !== denominator)).slice(0, 3).map((value) => `1/${value}`);
    return {
      id: questionId(signature), signature, type: 'fraction', skillId: 'unit-fractions', denominator, mode,
      instruction: 'Phần được tô màu là một phần mấy của hình?', answers: shuffle([correct, ...alternatives]), correctAnswer: correct,
      hintSteps: ['Đếm số phần bằng nhau của cả hình.', 'Chỉ có một phần được tô màu.', `Hình chia thành ${denominator} phần bằng nhau nên phần tô màu là 1/${denominator}.`],
      explanation: `Một trong ${denominator} phần bằng nhau được tô màu, nên đó là 1/${denominator}.`,
    };
  }
  const each = randomInt(1, 5), total = denominator * each, signature = `fraction-set-${total}-${denominator}`;
  return {
    id: questionId(signature), signature, type: 'fraction', skillId: 'unit-fractions', denominator, mode, total, icon: pick(ICONS),
    instruction: `1/${denominator} của ${total} đồ vật là bao nhiêu đồ vật?`, answers: numericAnswers(each, 0, 20, [1, -1, 2, -2, denominator, -denominator]), correctAnswer: each,
    hintSteps: [`Chia đều ${total} đồ vật thành ${denominator} nhóm.`, 'Một phần tương ứng với một nhóm.', `${total} : ${denominator} = ${each}.`],
    explanation: `${total} : ${denominator} = ${each}, nên 1/${denominator} của ${total} là ${each}.`,
  };
}

type Factory = () => Grade3Stage1Question;

function uniqueQuestions(plan: Factory[], total: 5 | 10 | 15) {
  const questions: Grade3Stage1Question[] = [];
  const signatures = new Set<string>();
  let attempts = 0;
  while (questions.length < total && attempts < total * 30) {
    const question = plan[questions.length % plan.length]();
    attempts += 1;
    if (signatures.has(question.signature)) continue;
    signatures.add(question.signature);
    questions.push(question);
  }
  return shuffle(questions);
}

export function generateGrade3Stage1Questions(module: Grade3Stage1Module, total: 5 | 10 | 15 = 10) {
  const reviewPlan: Factory[] = [reviewNumberQuestion, operationComponentQuestion, reviewTableQuestion, geometryMeasurementQuestion, reviewNumberQuestion];
  const tablesPlan: Factory[] = [() => tableSixToNineQuestion(false), () => tableSixToNineQuestion(true), multiplyDivideComponentQuestion, fractionQuestion, tableSixToNineQuestion];
  return uniqueQuestions(module === 'review' ? reviewPlan : tablesPlan, total);
}
