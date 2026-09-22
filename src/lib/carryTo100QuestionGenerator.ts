export type Carry100SkillId =
  | 'carry-add-one-digit'
  | 'carry-add-two-digit'
  | 'borrow-subtract-one-digit'
  | 'borrow-subtract-two-digit';

export type Carry100Question = {
  id: string;
  skillId: Carry100SkillId;
  operation: 'addition' | 'subtraction';
  top: number;
  bottom: number;
  instruction: string;
  answers: number[];
  correctAnswer: number;
  hintSteps: [string, string, string];
  explanation: string;
};

export const CARRY100_SKILL_LABELS: Record<Carry100SkillId, string> = {
  'carry-add-one-digit': 'Cộng số có hai chữ số với số có một chữ số',
  'carry-add-two-digit': 'Cộng hai số có hai chữ số',
  'borrow-subtract-one-digit': 'Trừ số có một chữ số',
  'borrow-subtract-two-digit': 'Trừ hai số có hai chữ số',
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(values: readonly T[]) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index--) {
    const target = randomInt(0, index);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function makeAnswers(correct: number) {
  const values = new Set([correct]);
  const offsets = shuffle([1, -1, 10, -10, 2, -2, 9, -9]);
  for (const offset of offsets) {
    const value = correct + offset;
    if (value >= 0 && value <= 100) values.add(value);
    if (values.size === 4) break;
  }
  return shuffle([...values]);
}

function createQuestion(skillId: Carry100SkillId): Carry100Question {
  const addition = skillId.startsWith('carry-add');
  const oneDigit = skillId.endsWith('one-digit');
  let top = 0;
  let bottom = 0;

  if (addition) {
    do {
      bottom = oneDigit ? randomInt(2, 9) : randomInt(11, 49);
    } while (bottom % 10 === 0);
    const bottomOnes = bottom % 10;
    const minimumOnes = Math.max(1, 10 - bottomOnes);
    do {
      top = randomInt(10, oneDigit ? 89 : 88);
    } while (top % 10 < minimumOnes || top + bottom > 100);
  } else {
    do {
      bottom = oneDigit ? randomInt(2, 9) : randomInt(11, 69);
    } while (bottom % 10 === 0);
    do {
      top = randomInt(oneDigit ? 20 : bottom + 1, 99);
    } while (top <= bottom || top % 10 >= bottom % 10);
  }

  const correctAnswer = addition ? top + bottom : top - bottom;
  const topOnes = top % 10;
  const bottomOnes = bottom % 10;
  const topTens = Math.floor(top / 10);
  const bottomTens = Math.floor(bottom / 10);
  const id = `${skillId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  if (addition) {
    const onesSum = topOnes + bottomOnes;
    const carry = Math.floor(onesSum / 10);
    return {
      id, skillId, operation: 'addition', top, bottom,
      instruction: 'Đặt tính rồi tính. Kết quả nào đúng?',
      answers: makeAnswers(correctAnswer), correctAnswer,
      hintSteps: [
        'Viết các chữ số hàng đơn vị thẳng cột với nhau.',
        `${topOnes} + ${bottomOnes} = ${onesSum}: viết ${onesSum % 10}, nhớ ${carry}.`,
        `Hàng chục: ${topTens} + ${bottomTens}${carry ? ` + ${carry}` : ''}.`,
      ],
      explanation: `${topOnes} + ${bottomOnes} = ${onesSum}, viết ${onesSum % 10} nhớ ${carry}; cộng tiếp hàng chục được ${correctAnswer}.`,
    };
  }

  const borrowedOnes = topOnes + 10;
  return {
    id, skillId, operation: 'subtraction', top, bottom,
    instruction: 'Đặt tính rồi tính. Kết quả nào đúng?',
    answers: makeAnswers(correctAnswer), correctAnswer,
    hintSteps: [
      'Viết các chữ số cùng hàng thẳng cột với nhau.',
      `${topOnes} không trừ được ${bottomOnes}, mượn 1 chục: ${borrowedOnes} − ${bottomOnes} = ${borrowedOnes - bottomOnes}.`,
      `Hàng chục còn ${topTens - 1}, rồi trừ ${bottomTens}.`,
    ],
    explanation: `Mượn 1 chục: ${borrowedOnes} − ${bottomOnes} = ${borrowedOnes - bottomOnes}; hàng chục còn ${topTens - 1} − ${bottomTens}. Kết quả là ${correctAnswer}.`,
  };
}

const SKILLS: Carry100SkillId[] = [
  'carry-add-one-digit',
  'carry-add-two-digit',
  'borrow-subtract-one-digit',
  'borrow-subtract-two-digit',
];

export function generateCarryTo100Questions(total: 5 | 10 | 15 = 10) {
  const plan = Array.from({ length: total }, (_, index) => SKILLS[index % SKILLS.length]);
  return shuffle(plan).map(createQuestion);
}
