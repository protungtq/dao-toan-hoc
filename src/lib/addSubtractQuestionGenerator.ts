import { additionStory, subtractionStory } from './storyContexts';

export type ArithmeticSkillId =
  | 'addition-to-10'
  | 'subtraction-to-10'
  | 'missing-number'
  | 'fact-family'
  | 'word-problems';

export type ArithmeticAnswer = number | string;

export const ARITHMETIC_SKILL_LABELS: Record<ArithmeticSkillId, string> = {
  'addition-to-10': 'Phép cộng',
  'subtraction-to-10': 'Phép trừ',
  'missing-number': 'Tìm số còn thiếu',
  'fact-family': 'Mối quan hệ cộng – trừ',
  'word-problems': 'Bài toán thực tế',
};

type BaseQuestion = {
  id: string;
  skillId: ArithmeticSkillId;
  instruction: string;
  answers: ArithmeticAnswer[];
  correctAnswer: ArithmeticAnswer;
  hintSteps: [string, string, string];
  explanation: string;
};

export type AdditionQuestion = BaseQuestion & {
  type: 'addition';
  left: number;
  right: number;
  object: string;
  visual: boolean;
};

export type SubtractionQuestion = BaseQuestion & {
  type: 'subtraction';
  whole: number;
  removed: number;
  object: string;
  visual: boolean;
};

export type MissingQuestion = BaseQuestion & {
  type: 'missing';
  equation: Array<number | '+' | '-' | '=' | null>;
  equationText: string;
};

export type FactFamilyQuestion = BaseQuestion & {
  type: 'fact-family';
  firstPart: number;
  secondPart: number;
  whole: number;
};

export type WordProblemQuestion = BaseQuestion & {
  type: 'word-problem';
  operation: 'addition' | 'subtraction';
  object: string;
  objectName: string;
  first: number;
  change: number;
  story: string;
};

export type ArithmeticQuestion =
  | AdditionQuestion
  | SubtractionQuestion
  | MissingQuestion
  | FactFamilyQuestion
  | WordProblemQuestion;

const OBJECTS = [
  { icon: '🍎', name: 'quả táo' },
  { icon: '🍊', name: 'quả cam' },
  { icon: '🐟', name: 'chú cá' },
  { icon: '🐦', name: 'chú chim' },
  { icon: '🎈', name: 'quả bóng bay' },
  { icon: '⭐', name: 'ngôi sao' },
  { icon: '✏️', name: 'chiếc bút chì' },
  { icon: '🍪', name: 'chiếc bánh quy' },
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
  let distance = 1;
  while (values.size < 4) {
    if (correct - distance >= 0) values.add(correct - distance);
    if (values.size < 4 && correct + distance <= 10) {
      values.add(correct + distance);
    }
    distance += 1;
  }
  return shuffle([...values]);
}

function additionQuestion(): AdditionQuestion {
  const left = randomInteger(0, 8);
  const right = randomInteger(0, 10 - left);
  const result = left + right;
  const selected = randomItem(OBJECTS);
  const visual = Math.random() < 0.6;
  return {
    id: createId('addition'),
    type: 'addition',
    skillId: 'addition-to-10',
    instruction: visual
      ? 'Gộp hai nhóm lại. Có tất cả bao nhiêu?'
      : `Tính ${left} + ${right}.`,
    left,
    right,
    object: selected.icon,
    visual,
    answers: numberAnswers(result),
    correctAnswer: result,
    hintSteps: [
      visual
        ? 'Đếm nhóm thứ nhất, rồi đếm tiếp các đồ vật ở nhóm thứ hai.'
        : `Bắt đầu từ ${left}, đếm thêm ${right} đơn vị.`,
      `${left} và thêm ${right} tạo thành ${result}.`,
      `${left} + ${right} = ${result}.`,
    ],
    explanation: `Gộp ${left} và ${right}, ta có ${left} + ${right} = ${result}.`,
  };
}

function subtractionQuestion(): SubtractionQuestion {
  const whole = randomInteger(1, 10);
  const removed = randomInteger(0, whole);
  const result = whole - removed;
  const selected = randomItem(OBJECTS);
  const visual = Math.random() < 0.6;
  return {
    id: createId('subtraction'),
    type: 'subtraction',
    skillId: 'subtraction-to-10',
    instruction: visual
      ? `Có ${whole}, bớt đi ${removed}. Còn lại bao nhiêu?`
      : `Tính ${whole} − ${removed}.`,
    whole,
    removed,
    object: selected.icon,
    visual,
    answers: numberAnswers(result),
    correctAnswer: result,
    hintSteps: [
      visual
        ? `Gạch đi ${removed} đồ vật rồi đếm những đồ vật chưa bị gạch.`
        : `Bắt đầu từ ${whole}, đếm lùi ${removed} đơn vị.`,
      `Bớt ${removed} khỏi ${whole}, còn ${result}.`,
      `${whole} − ${removed} = ${result}.`,
    ],
    explanation: `Bớt ${removed} khỏi ${whole}, ta có ${whole} − ${removed} = ${result}.`,
  };
}

function missingQuestion(): MissingQuestion {
  const operation = randomItem(['addition', 'subtraction'] as const);
  const missingPosition = randomItem(['first', 'second'] as const);

  if (operation === 'addition') {
    const first = randomInteger(0, 8);
    const second = randomInteger(0, 10 - first);
    const whole = first + second;
    const correct = missingPosition === 'first' ? first : second;
    const equation: MissingQuestion['equation'] =
      missingPosition === 'first'
        ? [null, '+', second, '=', whole]
        : [first, '+', null, '=', whole];
    return {
      id: createId('missing-addition'),
      type: 'missing',
      skillId: 'missing-number',
      instruction: 'Số nào thích hợp với ô trống?',
      equation,
      equationText:
        missingPosition === 'first'
          ? `? + ${second} = ${whole}`
          : `${first} + ? = ${whole}`,
      answers: numberAnswers(correct),
      correctAnswer: correct,
      hintSteps: [
        `Tìm phần còn thiếu để hai phần gộp lại được ${whole}.`,
        `${whole} bớt phần đã biết sẽ ra phần còn thiếu.`,
        `Số còn thiếu là ${correct}.`,
      ],
      explanation:
        missingPosition === 'first'
          ? `${first} + ${second} = ${whole}, nên ô trống là ${first}.`
          : `${first} + ${second} = ${whole}, nên ô trống là ${second}.`,
    };
  }

  const whole = randomInteger(1, 10);
  const removed = randomInteger(0, whole);
  const result = whole - removed;
  const correct = missingPosition === 'first' ? whole : removed;
  const equation: MissingQuestion['equation'] =
    missingPosition === 'first'
      ? [null, '-', removed, '=', result]
      : [whole, '-', null, '=', result];
  return {
    id: createId('missing-subtraction'),
    type: 'missing',
    skillId: 'missing-number',
    instruction: 'Số nào thích hợp với ô trống?',
    equation,
    equationText:
      missingPosition === 'first'
        ? `? − ${removed} = ${result}`
        : `${whole} − ? = ${result}`,
    answers: numberAnswers(correct),
    correctAnswer: correct,
    hintSteps: [
      missingPosition === 'first'
        ? `Số ban đầu gồm phần bớt đi và phần còn lại.`
        : `Tìm xem phải bớt bao nhiêu từ ${whole} để còn ${result}.`,
      missingPosition === 'first'
        ? `Gộp ${removed} và ${result} để tìm số ban đầu.`
        : `${whole} bớt ${result} sẽ ra số đã lấy đi.`,
      `Số còn thiếu là ${correct}.`,
    ],
    explanation: `${whole} − ${removed} = ${result}, nên ô trống là ${correct}.`,
  };
}

function factFamilyQuestion(): FactFamilyQuestion {
  const firstPart = randomInteger(1, 8);
  const secondPart = randomInteger(1, 10 - firstPart);
  const whole = firstPart + secondPart;
  const correct = `${whole} − ${firstPart} = ${secondPart}`;
  const wrong = [
    `${whole} + ${firstPart} = ${secondPart}`,
    `${firstPart} − ${whole} = ${secondPart}`,
    `${whole} − ${secondPart} = ${whole}`,
  ];
  return {
    id: createId('fact-family'),
    type: 'fact-family',
    skillId: 'fact-family',
    instruction: `Từ ${firstPart} + ${secondPart} = ${whole}, chọn phép trừ đúng.`,
    firstPart,
    secondPart,
    whole,
    answers: shuffle([correct, ...wrong]),
    correctAnswer: correct,
    hintSteps: [
      'Phép trừ bắt đầu từ số chỉ toàn bộ.',
      `Lấy ${whole} bớt một phần sẽ còn phần kia.`,
      `${whole} − ${firstPart} = ${secondPart}.`,
    ],
    explanation: `${firstPart} + ${secondPart} = ${whole}, nên ${whole} − ${firstPart} = ${secondPart}.`,
  };
}

function wordProblemQuestion(): WordProblemQuestion {
  const operation = randomItem(['addition', 'subtraction'] as const);
  const selected = randomItem(OBJECTS);

  if (operation === 'addition') {
    const first = randomInteger(1, 7);
    const change = randomInteger(1, 10 - first);
    const result = first + change;
    const context = additionStory(first, change, selected.name, selected.icon);
    return {
      id: createId('word-addition'),
      type: 'word-problem',
      skillId: 'word-problems',
      operation,
      object: context.icon,
      objectName: context.unit,
      first,
      change,
      story: context.story,
      instruction: 'Đọc tình huống và chọn kết quả.',
      answers: numberAnswers(result),
      correctAnswer: result,
      hintSteps: [
        `Các từ “${context.clue}” cho biết cần dùng phép cộng.`,
        `Gộp ${first} với ${change}.`,
        `${first} + ${change} = ${result}.`,
      ],
      explanation: `${first} + ${change} = ${result}. Đáp số: ${result} ${context.unit}.`,
    };
  }

  const first = randomInteger(2, 10);
  const change = randomInteger(1, first);
  const result = first - change;
  const context = subtractionStory(first, change, selected.name, selected.icon);
  return {
    id: createId('word-subtraction'),
    type: 'word-problem',
    skillId: 'word-problems',
    operation,
    object: context.icon,
    objectName: context.unit,
    first,
    change,
    story: context.story,
    instruction: 'Đọc tình huống và chọn kết quả.',
    answers: numberAnswers(result),
    correctAnswer: result,
    hintSteps: [
      `Các từ “${context.clue}” cho biết cần dùng phép trừ.`,
      `Lấy ${first} bớt ${change}.`,
      `${first} − ${change} = ${result}.`,
    ],
    explanation: `${first} − ${change} = ${result}. Đáp số: ${result} ${context.unit}.`,
  };
}

function questionForSkill(skill: ArithmeticSkillId): ArithmeticQuestion {
  if (skill === 'addition-to-10') return additionQuestion();
  if (skill === 'subtraction-to-10') return subtractionQuestion();
  if (skill === 'missing-number') return missingQuestion();
  if (skill === 'fact-family') return factFamilyQuestion();
  return wordProblemQuestion();
}

function skillPlan(total: 5 | 10 | 15): ArithmeticSkillId[] {
  if (total === 5) {
    return [
      'addition-to-10',
      'subtraction-to-10',
      'missing-number',
      'fact-family',
      'word-problems',
    ];
  }
  if (total === 10) {
    return [
      ...Array<ArithmeticSkillId>(3).fill('addition-to-10'),
      ...Array<ArithmeticSkillId>(2).fill('subtraction-to-10'),
      ...Array<ArithmeticSkillId>(2).fill('missing-number'),
      'fact-family',
      ...Array<ArithmeticSkillId>(2).fill('word-problems'),
    ];
  }
  return [
    ...Array<ArithmeticSkillId>(4).fill('addition-to-10'),
    ...Array<ArithmeticSkillId>(4).fill('subtraction-to-10'),
    ...Array<ArithmeticSkillId>(3).fill('missing-number'),
    'fact-family',
    ...Array<ArithmeticSkillId>(3).fill('word-problems'),
  ];
}

function signature(question: ArithmeticQuestion) {
  if (question.type === 'addition') return `${question.type}-${question.left}-${question.right}`;
  if (question.type === 'subtraction') return `${question.type}-${question.whole}-${question.removed}`;
  if (question.type === 'missing') return `${question.type}-${question.equationText}`;
  if (question.type === 'fact-family') return `${question.type}-${question.firstPart}-${question.secondPart}`;
  return `${question.type}-${question.operation}-${question.first}-${question.change}-${question.object}`;
}

export function generateArithmeticQuestions(total: 5 | 10 | 15 = 10) {
  const signatures = new Set<string>();
  return shuffle(skillPlan(total)).map((skill) => {
    let question = questionForSkill(skill);
    let key = signature(question);
    let retries = 0;
    while (signatures.has(key) && retries < 30) {
      question = questionForSkill(skill);
      key = signature(question);
      retries += 1;
    }
    signatures.add(key);
    return question;
  });
}
