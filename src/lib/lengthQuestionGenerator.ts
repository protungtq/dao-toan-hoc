export type LengthSkillId =
  | 'compare-length'
  | 'length-unit'
  | 'measure-length'
  | 'estimate-length'
  | 'length-word-problem';

export type LengthAnswer = number | string;

export const LENGTH_SKILL_LABELS: Record<LengthSkillId, string> = {
  'compare-length': 'Dài hơn, ngắn hơn',
  'length-unit': 'Đơn vị xăng-ti-mét',
  'measure-length': 'Đo độ dài',
  'estimate-length': 'Ước lượng độ dài',
  'length-word-problem': 'Bài toán độ dài',
};

type BaseQuestion = {
  id: string;
  skillId: LengthSkillId;
  instruction: string;
  answers: LengthAnswer[];
  correctAnswer: LengthAnswer;
  hintSteps: [string, string, string];
  explanation: string;
};

export type CompareLengthQuestion = BaseQuestion & {
  type: 'compare-length';
  firstLength: number;
  secondLength: number;
  mode: 'longer' | 'shorter';
  firstColor: string;
  secondColor: string;
};

export type OrderLengthQuestion = BaseQuestion & {
  type: 'order-length';
  items: Array<{ label: string; length: number; color: string }>;
  mode: 'ascending' | 'descending';
};

export type LengthUnitQuestion = BaseQuestion & {
  type: 'length-unit';
  mode: 'symbol' | 'complete';
  objectIcon?: string;
  objectName?: string;
  objectLength?: number;
};

export type MeasureLengthQuestion = BaseQuestion & {
  type: 'measure-length';
  length: number;
  color: string;
};

export type EstimateLengthQuestion = BaseQuestion & {
  type: 'estimate-length';
  objectIcon: string;
  objectName: string;
  reasonableLength: number;
};

export type LengthWordProblemQuestion = BaseQuestion & {
  type: 'length-word-problem';
  objectName: string;
  firstLength: number;
  change: number;
  operation: 'addition' | 'subtraction';
  story: string;
};

export type LengthQuestion =
  | CompareLengthQuestion
  | OrderLengthQuestion
  | LengthUnitQuestion
  | MeasureLengthQuestion
  | EstimateLengthQuestion
  | LengthWordProblemQuestion;

const COLORS = ['#0ea5e9', '#8b5cf6', '#f97316', '#10b981', '#f43f5e'];
const ESTIMATE_OBJECTS = [
  { icon: '🧽', name: 'cục tẩy', length: 4 },
  { icon: '✏️', name: 'chiếc bút chì', length: 15 },
  { icon: '🥄', name: 'chiếc thìa', length: 15 },
  { icon: '📒', name: 'chiều dài quyển vở', length: 20 },
  { icon: '🖍️', name: 'chiếc bút sáp', length: 9 },
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

function id(type: string) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function numberAnswers(correct: number, min = 1, max = 30) {
  const values = new Set<number>([correct]);
  let distance = 1;
  while (values.size < 4) {
    if (correct - distance >= min) values.add(correct - distance);
    if (values.size < 4 && correct + distance <= max) values.add(correct + distance);
    distance += 1;
  }
  return shuffle([...values]);
}

function compareQuestion(): CompareLengthQuestion {
  let firstLength = randomInteger(3, 10);
  let secondLength = randomInteger(3, 10);
  while (secondLength === firstLength) secondLength = randomInteger(3, 10);
  const mode = randomItem(['longer', 'shorter'] as const);
  const firstWins =
    mode === 'longer' ? firstLength > secondLength : firstLength < secondLength;
  const correct = firstWins ? 'Đoạn A' : 'Đoạn B';
  return {
    id: id('compare-length'),
    type: 'compare-length',
    skillId: 'compare-length',
    instruction: mode === 'longer' ? 'Đoạn nào dài hơn?' : 'Đoạn nào ngắn hơn?',
    firstLength,
    secondLength,
    mode,
    firstColor: randomItem(COLORS),
    secondColor: randomItem(COLORS),
    answers: ['Đoạn A', 'Đoạn B'],
    correctAnswer: correct,
    hintSteps: [
      'Hai đoạn cùng bắt đầu tại một vị trí, hãy nhìn điểm cuối.',
      mode === 'longer'
        ? 'Đoạn có điểm cuối xa hơn là đoạn dài hơn.'
        : 'Đoạn có điểm cuối gần hơn là đoạn ngắn hơn.',
      `Đáp án là ${correct}.`,
    ],
    explanation: `${correct} ${mode === 'longer' ? 'dài hơn' : 'ngắn hơn'} đoạn còn lại.`,
  };
}

function orderQuestion(): OrderLengthQuestion {
  const lengths = new Set<number>();
  while (lengths.size < 3) lengths.add(randomInteger(3, 10));
  const values = [...lengths];
  const labels = ['A', 'B', 'C'];
  const items = values.map((length, index) => ({
    label: labels[index],
    length,
    color: COLORS[index],
  }));
  const mode = randomItem(['ascending', 'descending'] as const);
  const sorted = [...items].sort((a, b) =>
    mode === 'ascending' ? a.length - b.length : b.length - a.length
  );
  const correct = sorted.map((item) => item.label).join(' – ');
  const wrong = new Set<string>();
  while (wrong.size < 3) {
    const candidate = shuffle(labels).join(' – ');
    if (candidate !== correct) wrong.add(candidate);
  }
  return {
    id: id('order-length'),
    type: 'order-length',
    skillId: 'compare-length',
    instruction:
      mode === 'ascending'
        ? 'Chọn thứ tự từ ngắn đến dài.'
        : 'Chọn thứ tự từ dài đến ngắn.',
    items,
    mode,
    answers: shuffle([correct, ...wrong]),
    correctAnswer: correct,
    hintSteps: [
      'So sánh điểm cuối của ba đoạn.',
      mode === 'ascending'
        ? 'Bắt đầu từ đoạn có điểm cuối gần nhất.'
        : 'Bắt đầu từ đoạn có điểm cuối xa nhất.',
      `Thứ tự đúng là ${correct}.`,
    ],
    explanation: `Thứ tự đúng là ${correct}.`,
  };
}

function unitQuestion(): LengthUnitQuestion {
  const mode = randomItem(['symbol', 'complete'] as const);
  if (mode === 'symbol') {
    return {
      id: id('unit-symbol'),
      type: 'length-unit',
      skillId: 'length-unit',
      mode,
      instruction: 'Kí hiệu của xăng-ti-mét là gì?',
      answers: shuffle(['cm', 'kg', 'l', 'giờ']),
      correctAnswer: 'cm',
      hintSteps: [
        'Xăng-ti-mét là đơn vị đo độ dài.',
        'Kí hiệu gồm hai chữ cái viết thường.',
        'Xăng-ti-mét được viết tắt là cm.',
      ],
      explanation: 'Xăng-ti-mét được viết tắt là cm.',
    };
  }
  const object = randomItem(ESTIMATE_OBJECTS);
  return {
    id: id('unit-complete'),
    type: 'length-unit',
    skillId: 'length-unit',
    mode,
    objectIcon: object.icon,
    objectName: object.name,
    objectLength: object.length,
    instruction: `${object.name} dài khoảng ${object.length} ... Chọn đơn vị thích hợp.`,
    answers: shuffle(['cm', 'kg', 'l', 'giờ']),
    correctAnswer: 'cm',
    hintSteps: [
      'Câu hỏi đang nói về độ dài.',
      'Đồ vật nhỏ thường được đo bằng xăng-ti-mét.',
      'Đơn vị thích hợp là cm.',
    ],
    explanation: `Có thể viết: ${object.length} cm.`,
  };
}

function measureQuestion(): MeasureLengthQuestion {
  const length = randomInteger(2, 10);
  return {
    id: id('measure'),
    type: 'measure-length',
    skillId: 'measure-length',
    instruction: 'Đoạn màu dài bao nhiêu xăng-ti-mét?',
    length,
    color: randomItem(COLORS),
    answers: numberAnswers(length, 1, 10),
    correctAnswer: length,
    hintSteps: [
      'Đoạn màu bắt đầu đúng tại vạch 0.',
      'Nhìn vạch số tại điểm cuối của đoạn màu.',
      `Điểm cuối ở vạch ${length}, nên đoạn dài ${length} cm.`,
    ],
    explanation: `Đoạn bắt đầu ở vạch 0 và kết thúc ở vạch ${length}, nên dài ${length} cm.`,
  };
}

function estimateQuestion(): EstimateLengthQuestion {
  const object = randomItem(ESTIMATE_OBJECTS);
  const correct = object.length;
  const candidates = new Set<number>([correct]);
  const offsets = shuffle([3, 5, 8, 10, 12]);
  for (const offset of offsets) {
    if (candidates.size >= 4) break;
    const value = Math.random() < 0.5 ? correct - offset : correct + offset;
    if (value >= 1 && value <= 30) candidates.add(value);
  }
  let fallback = 1;
  while (candidates.size < 4) {
    if (fallback !== correct) candidates.add(fallback);
    fallback += 1;
  }
  return {
    id: id('estimate'),
    type: 'estimate-length',
    skillId: 'estimate-length',
    instruction: `${object.name} thường dài khoảng bao nhiêu xăng-ti-mét?`,
    objectIcon: object.icon,
    objectName: object.name,
    reasonableLength: correct,
    answers: shuffle([...candidates]).map((value) => `${value} cm`),
    correctAnswer: `${correct} cm`,
    hintSteps: [
      'Hãy nhớ lại kích thước thật của đồ vật khi cầm trên tay.',
      'Loại các số quá nhỏ hoặc quá lớn so với đồ vật.',
      `Ước lượng hợp lí là khoảng ${correct} cm.`,
    ],
    explanation: `${object.name} có thể dài khoảng ${correct} cm.`,
  };
}

function wordProblemQuestion(): LengthWordProblemQuestion {
  const operation = randomItem(['addition', 'subtraction'] as const);
  const objectName = randomItem(['sợi dây', 'dải ruy băng', 'đoạn que'] as const);
  if (operation === 'addition') {
    const firstLength = randomInteger(2, 8);
    const change = randomInteger(1, 10 - firstLength);
    const result = firstLength + change;
    return {
      id: id('word-add'),
      type: 'length-word-problem',
      skillId: 'length-word-problem',
      objectName,
      firstLength,
      change,
      operation,
      story: `Một ${objectName} dài ${firstLength} cm. ${objectName} khác dài hơn ${change} cm. ${objectName} thứ hai dài bao nhiêu xăng-ti-mét?`,
      instruction: 'Đọc tình huống và chọn kết quả.',
      answers: numberAnswers(result, 1, 15).map((value) => `${value} cm`),
      correctAnswer: `${result} cm`,
      hintSteps: [
        '“Dài hơn” cho biết cần cộng thêm.',
        `Lấy ${firstLength} cộng ${change}.`,
        `${firstLength} + ${change} = ${result} cm.`,
      ],
      explanation: `${objectName} thứ hai dài ${firstLength} + ${change} = ${result} cm.`,
    };
  }
  const firstLength = randomInteger(5, 12);
  const change = randomInteger(1, firstLength - 1);
  const result = firstLength - change;
  return {
    id: id('word-subtract'),
    type: 'length-word-problem',
    skillId: 'length-word-problem',
    objectName,
    firstLength,
    change,
    operation,
    story: `Một ${objectName} dài ${firstLength} cm, cắt bớt ${change} cm. Phần còn lại dài bao nhiêu xăng-ti-mét?`,
    instruction: 'Đọc tình huống và chọn kết quả.',
    answers: numberAnswers(result, 1, 15).map((value) => `${value} cm`),
    correctAnswer: `${result} cm`,
    hintSteps: [
      '“Cắt bớt” cho biết cần dùng phép trừ.',
      `Lấy ${firstLength} trừ ${change}.`,
      `${firstLength} − ${change} = ${result} cm.`,
    ],
    explanation: `Phần còn lại dài ${firstLength} − ${change} = ${result} cm.`,
  };
}

type Factory = () => LengthQuestion;

function plan(total: 5 | 10 | 15): Factory[] {
  if (total === 5) {
    return [
      randomItem([compareQuestion, orderQuestion]),
      unitQuestion,
      measureQuestion,
      estimateQuestion,
      wordProblemQuestion,
    ];
  }
  if (total === 10) {
    return [
      compareQuestion, compareQuestion, orderQuestion,
      unitQuestion, unitQuestion,
      measureQuestion, measureQuestion,
      estimateQuestion, estimateQuestion,
      wordProblemQuestion,
    ];
  }
  return [
    compareQuestion, compareQuestion, orderQuestion, orderQuestion,
    unitQuestion, unitQuestion, unitQuestion,
    measureQuestion, measureQuestion, measureQuestion, measureQuestion,
    estimateQuestion, estimateQuestion,
    wordProblemQuestion, wordProblemQuestion,
  ];
}

function signature(question: LengthQuestion) {
  if (question.type === 'compare-length') return `${question.type}-${question.mode}-${question.firstLength}-${question.secondLength}`;
  if (question.type === 'order-length') return `${question.type}-${question.mode}-${question.items.map((item) => item.length).join('-')}`;
  if (question.type === 'length-unit') return `${question.type}-${question.mode}-${question.objectName ?? ''}`;
  if (question.type === 'measure-length') return `${question.type}-${question.length}`;
  if (question.type === 'estimate-length') return `${question.type}-${question.objectName}`;
  return `${question.type}-${question.operation}-${question.firstLength}-${question.change}`;
}

export function generateLengthQuestions(total: 5 | 10 | 15 = 10) {
  const signatures = new Set<string>();
  return shuffle(plan(total)).map((factory) => {
    let question = factory();
    let key = signature(question);
    let retries = 0;
    while (signatures.has(key) && retries < 30) {
      question = factory();
      key = signature(question);
      retries += 1;
    }
    signatures.add(key);
    return question;
  });
}
