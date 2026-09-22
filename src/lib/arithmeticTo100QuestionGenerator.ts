import { additionStory, subtractionStory } from './storyContexts';

export type Arithmetic100SkillId =
  | 'add-two-one-digit'
  | 'add-two-two-digit'
  | 'subtract-two-one-digit'
  | 'subtract-two-two-digit'
  | 'word-problems-to-100';

export type Arithmetic100Answer = number;

export const ARITHMETIC_100_SKILL_LABELS: Record<Arithmetic100SkillId, string> = {
  'add-two-one-digit': 'Cộng với số có một chữ số',
  'add-two-two-digit': 'Cộng hai số có hai chữ số',
  'subtract-two-one-digit': 'Trừ số có một chữ số',
  'subtract-two-two-digit': 'Trừ hai số có hai chữ số',
  'word-problems-to-100': 'Bài toán thực tế',
};

export type Arithmetic100Question = {
  id: string;
  type: 'calculation' | 'word-problem';
  skillId: Arithmetic100SkillId;
  instruction: string;
  left: number;
  right: number;
  operation: 'addition' | 'subtraction';
  layout: 'horizontal' | 'vertical' | 'place-value';
  story?: string;
  objectIcon?: string;
  answers: number[];
  correctAnswer: number;
  hintSteps: [string, string, string];
  explanation: string;
};

const STORY_OBJECTS = [
  { icon: '📚', name: 'quyển sách' },
  { icon: '✏️', name: 'chiếc bút chì' },
  { icon: '⭐', name: 'hình dán ngôi sao' },
  { icon: '🔵', name: 'viên bi' },
] as const;

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: readonly T[]): T {
  return items[randomInteger(0, items.length - 1)];
}

function shuffle<T>(items: readonly T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInteger(0, index);
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function createId(type: string) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function numberAnswers(correct: number) {
  const values = new Set<number>([correct]);
  const likely = [correct - 10, correct + 10, correct - 1, correct + 1, correct - 2, correct + 2];
  for (const value of likely) {
    if (value >= 0 && value <= 100) values.add(value);
    if (values.size === 4) break;
  }
  let fallback = 0;
  while (values.size < 4) {
    if (fallback !== correct) values.add(fallback);
    fallback += 1;
  }
  return shuffle([...values].slice(0, 4));
}

function makeQuestion(
  skillId: Arithmetic100SkillId,
  left: number,
  right: number,
  operation: 'addition' | 'subtraction',
  layout: Arithmetic100Question['layout'] = randomItem(['horizontal', 'vertical', 'place-value'] as const)
): Arithmetic100Question {
  const result = operation === 'addition' ? left + right : left - right;
  const sign = operation === 'addition' ? '+' : '−';
  const onesAction = operation === 'addition' ? 'cộng' : 'trừ';
  const tensAction = operation === 'addition' ? 'cộng' : 'trừ';
  return {
    id: createId(skillId),
    type: 'calculation',
    skillId,
    instruction: layout === 'vertical' ? 'Tính theo cột dọc.' : layout === 'place-value' ? 'Tính theo hàng chục và hàng đơn vị.' : `Tính ${left} ${sign} ${right}.`,
    left,
    right,
    operation,
    layout,
    answers: numberAnswers(result),
    correctAnswer: result,
    hintSteps: [
      'Tính hàng đơn vị trước, rồi tính hàng chục.',
      `Hàng đơn vị: ${left % 10} ${onesAction} ${right % 10}. Hàng chục: ${Math.floor(left / 10)} ${tensAction} ${Math.floor(right / 10)}.`,
      `${left} ${sign} ${right} = ${result}.`,
    ],
    explanation: `Đặt thẳng hàng chục với hàng chục, hàng đơn vị với hàng đơn vị. Ta được ${left} ${sign} ${right} = ${result}.`,
  };
}

function addTwoOneDigit() {
  const tens = randomInteger(1, 9);
  const ones = randomInteger(0, 8);
  const right = randomInteger(1, 9 - ones);
  return makeQuestion('add-two-one-digit', tens * 10 + ones, right, 'addition');
}

function addTwoTwoDigit() {
  const leftTens = randomInteger(1, 8);
  const rightTens = randomInteger(1, 9 - leftTens);
  const leftOnes = randomInteger(0, 9);
  const rightOnes = randomInteger(0, 9 - leftOnes);
  return makeQuestion('add-two-two-digit', leftTens * 10 + leftOnes, rightTens * 10 + rightOnes, 'addition');
}

function subtractTwoOneDigit() {
  const tens = randomInteger(1, 9);
  const ones = randomInteger(1, 9);
  const right = randomInteger(1, ones);
  return makeQuestion('subtract-two-one-digit', tens * 10 + ones, right, 'subtraction');
}

function subtractTwoTwoDigit() {
  const leftTens = randomInteger(2, 9);
  const rightTens = randomInteger(1, leftTens - 1);
  const leftOnes = randomInteger(0, 9);
  const rightOnes = randomInteger(0, leftOnes);
  return makeQuestion('subtract-two-two-digit', leftTens * 10 + leftOnes, rightTens * 10 + rightOnes, 'subtraction');
}

function wordProblem(): Arithmetic100Question {
  const operation = randomItem(['addition', 'subtraction'] as const);
  const object = randomItem(STORY_OBJECTS);
  const base = operation === 'addition' ? addTwoTwoDigit() : subtractTwoTwoDigit();
  const result = base.correctAnswer;
  const context = operation === 'addition'
    ? additionStory(base.left, base.right, object.name, object.icon)
    : subtractionStory(base.left, base.right, object.name, object.icon);
  const sign = operation === 'addition' ? '+' : '−';
  return {
    ...base,
    id: createId('word-problem-to-100'),
    type: 'word-problem',
    skillId: 'word-problems-to-100',
    instruction: 'Đọc bài toán và chọn đáp số.',
    layout: 'horizontal',
    story: context.story,
    objectIcon: context.icon,
    hintSteps: [
      operation === 'addition' ? `Các từ “${context.clue}” gợi ý phép cộng.` : `Các từ “${context.clue}” gợi ý phép trừ.`,
      `Phép tính cần làm là ${base.left} ${sign} ${base.right}.`,
      `${base.left} ${sign} ${base.right} = ${result}.`,
    ],
    explanation: `${base.left} ${sign} ${base.right} = ${result}. Đáp số: ${result} ${context.unit}.`,
  };
}

type Factory = () => Arithmetic100Question;

function plan(total: 5 | 10 | 15): Factory[] {
  const core = [addTwoOneDigit, addTwoTwoDigit, subtractTwoOneDigit, subtractTwoTwoDigit, wordProblem];
  if (total === 5) return core;
  if (total === 10) return [...core, ...core];
  return [...core, ...core, ...core];
}

function signature(question: Arithmetic100Question) {
  return `${question.skillId}-${question.left}-${question.right}-${question.layout}`;
}

export function generateArithmetic100Questions(total: 5 | 10 | 15 = 10) {
  const used = new Set<string>();
  return shuffle(plan(total)).map((factory) => {
    let question = factory();
    let key = signature(question);
    let retries = 0;
    while (used.has(key) && retries < 30) {
      question = factory();
      key = signature(question);
      retries += 1;
    }
    used.add(key);
    return question;
  });
}
