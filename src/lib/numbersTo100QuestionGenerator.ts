export type Numbers100SkillId =
  | 'tens-and-ones'
  | 'read-write-to-100'
  | 'before-after-to-100'
  | 'compare-to-100'
  | 'number-chart-to-100';

export type Numbers100Answer = number | string;

export const NUMBERS_100_SKILL_LABELS: Record<Numbers100SkillId, string> = {
  'tens-and-ones': 'Chục và đơn vị',
  'read-write-to-100': 'Đọc và viết số',
  'before-after-to-100': 'Số trước và số sau',
  'compare-to-100': 'So sánh số',
  'number-chart-to-100': 'Bảng số đến 100',
};

type BaseQuestion = {
  id: string;
  skillId: Numbers100SkillId;
  instruction: string;
  answers: Numbers100Answer[];
  correctAnswer: Numbers100Answer;
  hintSteps: [string, string, string];
  explanation: string;
};

export type BuildNumberQuestion = BaseQuestion & {
  type: 'build-number';
  tens: number;
  ones: number;
};

export type DecomposeNumberQuestion = BaseQuestion & {
  type: 'decompose-number';
  number: number;
  tens: number;
  ones: number;
};

export type ReadWriteNumberQuestion = BaseQuestion & {
  type: 'read-write-number';
  number: number;
  numberWord: string;
  mode: 'read' | 'write';
};

export type BeforeAfter100Question = BaseQuestion & {
  type: 'before-after';
  number: number;
  direction: 'before' | 'after';
};

export type Sequence100Question = BaseQuestion & {
  type: 'sequence';
  sequence: Array<number | null>;
};

export type Compare100Question = BaseQuestion & {
  type: 'compare';
  left: number;
  right: number;
};

export type ChooseLargerSmallerQuestion = BaseQuestion & {
  type: 'choose-larger-smaller';
  numbers: number[];
  mode: 'larger' | 'smaller';
};

export type NumberChartQuestion = BaseQuestion & {
  type: 'number-chart';
  cells: Array<number | null>;
  missingIndex: number;
  centerNumber: number;
};

export type NumbersTo100Question =
  | BuildNumberQuestion
  | DecomposeNumberQuestion
  | ReadWriteNumberQuestion
  | BeforeAfter100Question
  | Sequence100Question
  | Compare100Question
  | ChooseLargerSmallerQuestion
  | NumberChartQuestion;

const DIGIT_WORDS = [
  'không', 'một', 'hai', 'ba', 'bốn',
  'năm', 'sáu', 'bảy', 'tám', 'chín',
];

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

export function readVietnameseNumber(number: number) {
  if (number === 100) return 'một trăm';
  if (number < 10) return DIGIT_WORDS[number];
  const tens = Math.floor(number / 10);
  const ones = number % 10;
  if (tens === 1) {
    if (ones === 0) return 'mười';
    if (ones === 5) return 'mười lăm';
    return `mười ${DIGIT_WORDS[ones]}`;
  }
  const tensText = `${DIGIT_WORDS[tens]} mươi`;
  if (ones === 0) return tensText;
  if (ones === 1) return `${tensText} mốt`;
  if (ones === 4) return `${tensText} tư`;
  if (ones === 5) return `${tensText} lăm`;
  return `${tensText} ${DIGIT_WORDS[ones]}`;
}

function numberAnswers(correct: number, min = 1, max = 100) {
  const values = new Set<number>([correct]);
  let distance = 1;
  while (values.size < 4) {
    if (correct - distance >= min) values.add(correct - distance);
    if (values.size < 4 && correct + distance <= max) values.add(correct + distance);
    distance += 1;
  }
  return shuffle([...values]);
}

function twoDigitDistractors(number: number) {
  const tens = Math.floor(number / 10);
  const ones = number % 10;
  const values = new Set<number>([number]);
  if (ones !== 0) values.add(ones * 10 + tens);
  values.add(Math.min(99, Math.max(10, (tens === 9 ? 8 : tens + 1) * 10 + ones)));
  values.add(Math.min(99, Math.max(10, tens * 10 + (ones === 9 ? 8 : ones + 1))));
  let distance = 1;
  while (values.size < 4) {
    if (number - distance >= 10) values.add(number - distance);
    if (values.size < 4 && number + distance <= 99) {
      values.add(number + distance);
    }
    distance += 1;
  }
  return shuffle([...values]).slice(0, 4);
}

function buildNumberQuestion(): BuildNumberQuestion {
  const tens = randomInteger(1, 9);
  const ones = randomInteger(0, 9);
  const number = tens * 10 + ones;
  return {
    id: id('build-number'),
    type: 'build-number',
    skillId: 'tens-and-ones',
    instruction: 'Các bó chục và khối đơn vị tạo thành số nào?',
    tens,
    ones,
    answers: twoDigitDistractors(number),
    correctAnswer: number,
    hintSteps: [
      'Mỗi thanh dài biểu diễn 1 chục, mỗi khối nhỏ biểu diễn 1 đơn vị.',
      `Có ${tens} chục và ${ones} đơn vị.`,
      `${tens} chục và ${ones} đơn vị tạo thành số ${number}.`,
    ],
    explanation: `${tens} chục và ${ones} đơn vị tạo thành số ${number}.`,
  };
}

function decomposeQuestion(): DecomposeNumberQuestion {
  const number = randomInteger(10, 99);
  const tens = Math.floor(number / 10);
  const ones = number % 10;
  const correct = `${tens} chục và ${ones} đơn vị`;
  const wrong = new Set<string>();
  wrong.add(`${ones} chục và ${tens} đơn vị`);
  wrong.add(`${Math.min(9, tens + 1)} chục và ${ones} đơn vị`);
  wrong.add(`${tens} chục và ${ones === 9 ? 8 : ones + 1} đơn vị`);
  wrong.delete(correct);
  let offset = 1;
  while (wrong.size < 3) {
    wrong.add(`${Math.max(1, tens - offset)} chục và ${ones} đơn vị`);
    offset += 1;
  }
  return {
    id: id('decompose'),
    type: 'decompose-number',
    skillId: 'tens-and-ones',
    instruction: `Số ${number} gồm mấy chục và mấy đơn vị?`,
    number,
    tens,
    ones,
    answers: shuffle([correct, ...[...wrong].slice(0, 3)]),
    correctAnswer: correct,
    hintSteps: [
      'Chữ số bên trái chỉ số chục, chữ số bên phải chỉ số đơn vị.',
      `Trong số ${number}, chữ số ${tens} đứng ở hàng chục.`,
      `Số ${number} gồm ${tens} chục và ${ones} đơn vị.`,
    ],
    explanation: `Số ${number} gồm ${tens} chục và ${ones} đơn vị.`,
  };
}

function readWriteQuestion(): ReadWriteNumberQuestion {
  const number = randomInteger(10, 99);
  const numberWord = readVietnameseNumber(number);
  const mode = randomItem(['read', 'write'] as const);
  const distractorNumbers = twoDigitDistractors(number).filter((value) => value !== number);
  return {
    id: id('read-write'),
    type: 'read-write-number',
    skillId: 'read-write-to-100',
    instruction:
      mode === 'read'
        ? `Số ${number} được đọc là gì?`
        : `Chọn số được đọc là “${numberWord}”.`,
    number,
    numberWord,
    mode,
    answers:
      mode === 'read'
        ? shuffle([numberWord, ...distractorNumbers.slice(0, 3).map(readVietnameseNumber)])
        : shuffle([number, ...distractorNumbers.slice(0, 3)]),
    correctAnswer: mode === 'read' ? numberWord : number,
    hintSteps: [
      'Đọc chữ số hàng chục trước, rồi đến hàng đơn vị.',
      `Số này có ${Math.floor(number / 10)} chục và ${number % 10} đơn vị.`,
      `Số ${number} đọc là “${numberWord}”.`,
    ],
    explanation: `Số ${number} được đọc là “${numberWord}”.`,
  };
}

function beforeAfterQuestion(): BeforeAfter100Question {
  const direction = randomItem(['before', 'after'] as const);
  const number = direction === 'before' ? randomInteger(11, 100) : randomInteger(10, 99);
  const correct = direction === 'before' ? number - 1 : number + 1;
  const phrase = direction === 'before' ? 'đứng ngay trước' : 'đứng ngay sau';
  return {
    id: id('before-after'),
    type: 'before-after',
    skillId: 'before-after-to-100',
    instruction: `Số nào ${phrase} số ${number}?`,
    number,
    direction,
    answers: numberAnswers(correct),
    correctAnswer: correct,
    hintSteps: [
      'Nhẩm dãy số quanh số đã cho.',
      direction === 'before' ? 'Số đứng trước bé hơn 1.' : 'Số đứng sau lớn hơn 1.',
      `Đáp án là ${correct}.`,
    ],
    explanation: `Số ${correct} ${phrase} số ${number}.`,
  };
}

function sequenceQuestion(): Sequence100Question {
  const start = randomInteger(10, 96);
  const sequence: Array<number | null> = Array.from({ length: 5 }, (_, index) => start + index);
  const missingIndex = randomInteger(0, 4);
  const correct = sequence[missingIndex] as number;
  sequence[missingIndex] = null;
  return {
    id: id('sequence'),
    type: 'sequence',
    skillId: 'before-after-to-100',
    instruction: 'Số nào còn thiếu trong dãy?',
    sequence,
    answers: numberAnswers(correct),
    correctAnswer: correct,
    hintSteps: [
      'Đọc dãy từ trái sang phải.',
      'Mỗi số tăng thêm 1.',
      `Số còn thiếu là ${correct}.`,
    ],
    explanation: `Dãy tăng từng đơn vị nên số còn thiếu là ${correct}.`,
  };
}

function compareQuestion(): Compare100Question {
  const left = randomInteger(10, 99);
  const right = Math.random() < 0.2 ? left : randomInteger(10, 99);
  const correct = left > right ? '>' : left < right ? '<' : '=';
  return {
    id: id('compare'),
    type: 'compare',
    skillId: 'compare-to-100',
    instruction: 'Chọn dấu thích hợp.',
    left,
    right,
    answers: shuffle(['<', '=', '>']),
    correctAnswer: correct,
    hintSteps: [
      'So sánh chữ số hàng chục trước.',
      Math.floor(left / 10) === Math.floor(right / 10)
        ? 'Hai số có cùng hàng chục, hãy so sánh hàng đơn vị.'
        : `${left} có ${Math.floor(left / 10)} chục, ${right} có ${Math.floor(right / 10)} chục.`,
      `${left} ${correct} ${right}.`,
    ],
    explanation: `${left} ${correct} ${right}.`,
  };
}

function chooseLargerSmallerQuestion(): ChooseLargerSmallerQuestion {
  const numbers = new Set<number>();
  while (numbers.size < 4) numbers.add(randomInteger(10, 99));
  const values = [...numbers];
  const mode = randomItem(['larger', 'smaller'] as const);
  const correct = mode === 'larger' ? Math.max(...values) : Math.min(...values);
  return {
    id: id('choose-extreme'),
    type: 'choose-larger-smaller',
    skillId: 'compare-to-100',
    instruction: mode === 'larger' ? 'Chọn số lớn nhất.' : 'Chọn số bé nhất.',
    numbers: values,
    mode,
    answers: shuffle(values),
    correctAnswer: correct,
    hintSteps: [
      'So sánh chữ số hàng chục của các số.',
      'Nếu hàng chục bằng nhau, so sánh hàng đơn vị.',
      `Đáp án là ${correct}.`,
    ],
    explanation: `${correct} là số ${mode === 'larger' ? 'lớn nhất' : 'bé nhất'} trong nhóm.`,
  };
}

function numberChartQuestion(): NumberChartQuestion {
  const row = randomInteger(2, 9);
  const column = randomInteger(2, 9);
  const centerNumber = (row - 1) * 10 + column;
  const cells: Array<number | null> = [
    centerNumber - 11, centerNumber - 10, centerNumber - 9,
    centerNumber - 1, centerNumber, centerNumber + 1,
    centerNumber + 9, centerNumber + 10, centerNumber + 11,
  ];
  const missingIndex = randomInteger(0, 8);
  const correct = cells[missingIndex] as number;
  cells[missingIndex] = null;
  return {
    id: id('number-chart'),
    type: 'number-chart',
    skillId: 'number-chart-to-100',
    instruction: 'Số nào còn thiếu trong bảng số?',
    cells,
    missingIndex,
    centerNumber,
    answers: numberAnswers(correct),
    correctAnswer: correct,
    hintSteps: [
      'Trong cùng một hàng, số bên phải lớn hơn số bên trái 1 đơn vị.',
      'Trong cùng một cột, số phía dưới lớn hơn số phía trên 10 đơn vị.',
      `Số còn thiếu là ${correct}.`,
    ],
    explanation: `Theo quy luật ngang thêm 1 và dọc thêm 10, số còn thiếu là ${correct}.`,
  };
}

type Factory = () => NumbersTo100Question;

function plan(total: 5 | 10 | 15): Factory[] {
  if (total === 5) {
    return [
      randomItem([buildNumberQuestion, decomposeQuestion]),
      readWriteQuestion,
      randomItem([beforeAfterQuestion, sequenceQuestion]),
      randomItem([compareQuestion, chooseLargerSmallerQuestion]),
      numberChartQuestion,
    ];
  }
  if (total === 10) {
    return [
      buildNumberQuestion, buildNumberQuestion, decomposeQuestion,
      readWriteQuestion, readWriteQuestion,
      randomItem([beforeAfterQuestion, sequenceQuestion]),
      compareQuestion, chooseLargerSmallerQuestion,
      numberChartQuestion, numberChartQuestion,
    ];
  }
  return [
    buildNumberQuestion, buildNumberQuestion, decomposeQuestion, decomposeQuestion,
    readWriteQuestion, readWriteQuestion, readWriteQuestion,
    beforeAfterQuestion, sequenceQuestion,
    compareQuestion, compareQuestion, chooseLargerSmallerQuestion,
    numberChartQuestion, numberChartQuestion, numberChartQuestion,
  ];
}

function signature(question: NumbersTo100Question) {
  if (question.type === 'build-number') return `${question.type}-${question.tens}-${question.ones}`;
  if (question.type === 'decompose-number') return `${question.type}-${question.number}`;
  if (question.type === 'read-write-number') return `${question.type}-${question.mode}-${question.number}`;
  if (question.type === 'before-after') return `${question.type}-${question.direction}-${question.number}`;
  if (question.type === 'sequence') return `${question.type}-${question.sequence.join('-')}`;
  if (question.type === 'compare') return `${question.type}-${question.left}-${question.right}`;
  if (question.type === 'choose-larger-smaller') return `${question.type}-${question.mode}-${question.numbers.join('-')}`;
  return `${question.type}-${question.centerNumber}-${question.missingIndex}`;
}

export function generateNumbersTo100Questions(total: 5 | 10 | 15 = 10) {
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
