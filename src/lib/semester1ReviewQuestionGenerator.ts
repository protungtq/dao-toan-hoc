export type ReviewSkillId =
  | 'numbers-to-10'
  | 'add-subtract-to-10'
  | 'semester-1-geometry';

export type ReviewAnswer = number | string;
export type FlatShapeId = 'circle' | 'square' | 'triangle' | 'rectangle';
export type ReviewSolidId = 'cube' | 'cuboid';
export type ReviewPosition = 'Bên trái' | 'Bên phải' | 'Phía trên' | 'Phía dưới';

export const REVIEW_SKILL_LABELS: Record<ReviewSkillId, string> = {
  'numbers-to-10': 'Ôn các số đến 10',
  'add-subtract-to-10': 'Ôn phép cộng và phép trừ',
  'semester-1-geometry': 'Ôn hình học và vị trí',
};

type BaseQuestion = {
  id: string;
  skillId: ReviewSkillId;
  instruction: string;
  answers: ReviewAnswer[];
  correctAnswer: ReviewAnswer;
  hintSteps: [string, string, string];
  explanation: string;
};

export type CountReviewQuestion = BaseQuestion & {
  type: 'count';
  object: string;
  count: number;
};

export type CompareReviewQuestion = BaseQuestion & {
  type: 'compare';
  left: number;
  right: number;
};

export type NumberBondReviewQuestion = BaseQuestion & {
  type: 'number-bond';
  whole: number;
  knownPart: number;
};

export type SequenceReviewQuestion = BaseQuestion & {
  type: 'sequence';
  sequence: Array<number | null>;
};

export type ArithmeticReviewQuestion = BaseQuestion & {
  type: 'arithmetic';
  operation: 'addition' | 'subtraction';
  first: number;
  second: number;
  object: string;
  visual: boolean;
};

export type MissingArithmeticReviewQuestion = BaseQuestion & {
  type: 'missing-arithmetic';
  equation: Array<number | '+' | '−' | '=' | null>;
};

export type WordReviewQuestion = BaseQuestion & {
  type: 'word-problem';
  story: string;
  object: string;
  first: number;
  change: number;
  operation: 'addition' | 'subtraction';
};

export type FlatShapeReviewQuestion = BaseQuestion & {
  type: 'flat-shape';
  shape: FlatShapeId;
  color: string;
};

export type SolidReviewQuestion = BaseQuestion & {
  type: 'solid';
  solid: ReviewSolidId;
  color: string;
};

export type PositionReviewQuestion = BaseQuestion & {
  type: 'position';
  firstIcon: string;
  firstName: string;
  secondIcon: string;
  secondName: string;
  relation: ReviewPosition;
};

export type Semester1ReviewQuestion =
  | CountReviewQuestion
  | CompareReviewQuestion
  | NumberBondReviewQuestion
  | SequenceReviewQuestion
  | ArithmeticReviewQuestion
  | MissingArithmeticReviewQuestion
  | WordReviewQuestion
  | FlatShapeReviewQuestion
  | SolidReviewQuestion
  | PositionReviewQuestion;

const OBJECTS = [
  { icon: '🍎', name: 'quả táo' },
  { icon: '⭐', name: 'ngôi sao' },
  { icon: '🐟', name: 'chú cá' },
  { icon: '🎈', name: 'quả bóng bay' },
  { icon: '🍪', name: 'chiếc bánh quy' },
] as const;
const SHAPE_LABELS: Record<FlatShapeId, string> = {
  circle: 'Hình tròn',
  square: 'Hình vuông',
  triangle: 'Hình tam giác',
  rectangle: 'Hình chữ nhật',
};
const SOLID_LABELS: Record<ReviewSolidId, string> = {
  cube: 'Khối lập phương',
  cuboid: 'Khối hộp chữ nhật',
};
const COLORS = ['sky', 'violet', 'emerald', 'orange', 'rose'] as const;
const POSITION_OBJECTS = [
  { icon: '⚽', name: 'quả bóng' },
  { icon: '🎁', name: 'hộp quà' },
  { icon: '🐱', name: 'chú mèo' },
  { icon: '🚗', name: 'chiếc xe' },
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

function numberAnswers(correct: number) {
  const values = new Set<number>([correct]);
  let distance = 1;
  while (values.size < 4) {
    if (correct - distance >= 0) values.add(correct - distance);
    if (values.size < 4 && correct + distance <= 10) values.add(correct + distance);
    distance += 1;
  }
  return shuffle([...values]);
}

function countQuestion(): CountReviewQuestion {
  const selected = randomItem(OBJECTS);
  const count = randomInteger(0, 10);
  return {
    id: id('count'),
    type: 'count',
    skillId: 'numbers-to-10',
    instruction: `Có bao nhiêu ${selected.name}?`,
    object: selected.icon,
    count,
    answers: numberAnswers(count),
    correctAnswer: count,
    hintSteps: [
      count === 0 ? 'Quan sát xem có đồ vật nào không.' : 'Đếm từng đồ vật một.',
      count === 0 ? 'Không có đồ vật nào được viết bằng số 0.' : `Đếm từ 1 đến ${count}.`,
      `Đáp án là ${count}.`,
    ],
    explanation: count === 0 ? 'Không có đồ vật nào nên chọn số 0.' : `Đếm được ${count} ${selected.name}.`,
  };
}

function compareQuestion(): CompareReviewQuestion {
  const left = randomInteger(0, 10);
  const right = Math.random() < 0.25 ? left : randomInteger(0, 10);
  const correct = left > right ? '>' : left < right ? '<' : '=';
  return {
    id: id('compare'),
    type: 'compare',
    skillId: 'numbers-to-10',
    instruction: 'Chọn dấu thích hợp.',
    left,
    right,
    answers: shuffle(['<', '=', '>']),
    correctAnswer: correct,
    hintSteps: [
      'So sánh hai số hoặc hình dung bằng hai nhóm đồ vật.',
      `${left} ${left === right ? 'bằng' : left > right ? 'lớn hơn' : 'bé hơn'} ${right}.`,
      `Dấu đúng là ${correct}.`,
    ],
    explanation: `${left} ${correct} ${right}.`,
  };
}

function numberBondQuestion(): NumberBondReviewQuestion {
  const whole = randomInteger(2, 10);
  const knownPart = randomInteger(0, whole);
  const missing = whole - knownPart;
  return {
    id: id('number-bond'),
    type: 'number-bond',
    skillId: 'numbers-to-10',
    instruction: `${whole} gồm ${knownPart} và mấy?`,
    whole,
    knownPart,
    answers: numberAnswers(missing),
    correctAnswer: missing,
    hintSteps: [
      `Lấy đủ ${whole} đồ vật rồi tách ra ${knownPart}.`,
      'Đếm phần còn lại.',
      `${whole} gồm ${knownPart} và ${missing}.`,
    ],
    explanation: `${whole} được tách thành ${knownPart} và ${missing}.`,
  };
}

function sequenceQuestion(): SequenceReviewQuestion {
  const length = 5;
  const start = randomInteger(0, 6);
  const sequence: Array<number | null> = Array.from({ length }, (_, index) => start + index);
  const missingIndex = randomInteger(0, length - 1);
  const correct = sequence[missingIndex] as number;
  sequence[missingIndex] = null;
  return {
    id: id('sequence'),
    type: 'sequence',
    skillId: 'numbers-to-10',
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

function arithmeticQuestion(operation?: 'addition' | 'subtraction'): ArithmeticReviewQuestion {
  const selectedOperation = operation ?? randomItem(['addition', 'subtraction'] as const);
  const selected = randomItem(OBJECTS);
  if (selectedOperation === 'addition') {
    const first = randomInteger(0, 8);
    const second = randomInteger(0, 10 - first);
    const result = first + second;
    return {
      id: id('addition'),
      type: 'arithmetic',
      skillId: 'add-subtract-to-10',
      operation: 'addition',
      first,
      second,
      object: selected.icon,
      visual: Math.random() < 0.45,
      instruction: `Tính ${first} + ${second}.`,
      answers: numberAnswers(result),
      correctAnswer: result,
      hintSteps: [
        `Bắt đầu từ ${first}, đếm thêm ${second}.`,
        `Gộp ${first} và ${second}.`,
        `${first} + ${second} = ${result}.`,
      ],
      explanation: `${first} + ${second} = ${result}.`,
    };
  }
  const first = randomInteger(1, 10);
  const second = randomInteger(0, first);
  const result = first - second;
  return {
    id: id('subtraction'),
    type: 'arithmetic',
    skillId: 'add-subtract-to-10',
    operation: 'subtraction',
    first,
    second,
    object: selected.icon,
    visual: Math.random() < 0.45,
    instruction: `Tính ${first} − ${second}.`,
    answers: numberAnswers(result),
    correctAnswer: result,
    hintSteps: [
      `Bắt đầu từ ${first}, đếm lùi ${second}.`,
      `Bớt ${second} khỏi ${first}.`,
      `${first} − ${second} = ${result}.`,
    ],
    explanation: `${first} − ${second} = ${result}.`,
  };
}

function missingArithmeticQuestion(): MissingArithmeticReviewQuestion {
  const first = randomInteger(0, 8);
  const second = randomInteger(0, 10 - first);
  const whole = first + second;
  const hideFirst = Math.random() < 0.5;
  const correct = hideFirst ? first : second;
  return {
    id: id('missing-arithmetic'),
    type: 'missing-arithmetic',
    skillId: 'add-subtract-to-10',
    instruction: 'Số nào thích hợp với ô trống?',
    equation: hideFirst ? [null, '+', second, '=', whole] : [first, '+', null, '=', whole],
    answers: numberAnswers(correct),
    correctAnswer: correct,
    hintSteps: [
      `Tìm phần còn thiếu để gộp lại được ${whole}.`,
      `${whole} bớt phần đã biết sẽ ra phần còn thiếu.`,
      `Số còn thiếu là ${correct}.`,
    ],
    explanation: `${first} + ${second} = ${whole}, nên ô trống là ${correct}.`,
  };
}

function wordQuestion(): WordReviewQuestion {
  const selected = randomItem(OBJECTS);
  const operation = randomItem(['addition', 'subtraction'] as const);
  if (operation === 'addition') {
    const first = randomInteger(1, 7);
    const change = randomInteger(1, 10 - first);
    const result = first + change;
    return {
      id: id('word-add'),
      type: 'word-problem',
      skillId: 'add-subtract-to-10',
      operation,
      object: selected.icon,
      first,
      change,
      story: `Có ${first} ${selected.name}, thêm ${change} ${selected.name}. Có tất cả bao nhiêu?`,
      instruction: 'Đọc tình huống và chọn kết quả.',
      answers: numberAnswers(result),
      correctAnswer: result,
      hintSteps: ['“Thêm” cho biết cần cộng.', `Gộp ${first} với ${change}.`, `${first} + ${change} = ${result}.`],
      explanation: `Có thêm nên tính ${first} + ${change} = ${result}.`,
    };
  }
  const first = randomInteger(2, 10);
  const change = randomInteger(1, first);
  const result = first - change;
  return {
    id: id('word-subtract'),
    type: 'word-problem',
    skillId: 'add-subtract-to-10',
    operation,
    object: selected.icon,
    first,
    change,
    story: `Có ${first} ${selected.name}, bớt đi ${change} ${selected.name}. Còn lại bao nhiêu?`,
    instruction: 'Đọc tình huống và chọn kết quả.',
    answers: numberAnswers(result),
    correctAnswer: result,
    hintSteps: ['“Bớt đi” cho biết cần trừ.', `Lấy ${first} bớt ${change}.`, `${first} − ${change} = ${result}.`],
    explanation: `Bớt đi nên tính ${first} − ${change} = ${result}.`,
  };
}

function flatShapeQuestion(): FlatShapeReviewQuestion {
  const shape = randomItem(Object.keys(SHAPE_LABELS) as FlatShapeId[]);
  return {
    id: id('flat-shape'),
    type: 'flat-shape',
    skillId: 'semester-1-geometry',
    instruction: 'Đây là hình gì?',
    shape,
    color: randomItem(COLORS),
    answers: shuffle(Object.values(SHAPE_LABELS)),
    correctAnswer: SHAPE_LABELS[shape],
    hintSteps: [
      'Quan sát đường bao và số cạnh.',
      shape === 'circle' ? 'Hình này không có cạnh.' : `Hình này có ${shape === 'triangle' ? 3 : 4} cạnh.`,
      `Đây là ${SHAPE_LABELS[shape].toLowerCase()}.`,
    ],
    explanation: `Đây là ${SHAPE_LABELS[shape].toLowerCase()}.`,
  };
}

function solidQuestion(): SolidReviewQuestion {
  const solid = randomItem(['cube', 'cuboid'] as const);
  return {
    id: id('solid'),
    type: 'solid',
    skillId: 'semester-1-geometry',
    instruction: 'Đây là khối gì?',
    solid,
    color: randomItem(COLORS),
    answers: shuffle(Object.values(SOLID_LABELS)),
    correctAnswer: SOLID_LABELS[solid],
    hintSteps: [
      'Quan sát độ dài các chiều của khối.',
      solid === 'cube' ? 'Các chiều trông bằng nhau.' : 'Khối có dạng hộp dài.',
      `Đây là ${SOLID_LABELS[solid].toLowerCase()}.`,
    ],
    explanation: `Đây là ${SOLID_LABELS[solid].toLowerCase()}.`,
  };
}

function positionQuestion(): PositionReviewQuestion {
  const [first, second] = shuffle(POSITION_OBJECTS).slice(0, 2);
  const relation = randomItem<ReviewPosition>(['Bên trái', 'Bên phải', 'Phía trên', 'Phía dưới']);
  const answers =
    relation === 'Bên trái' || relation === 'Bên phải'
      ? ['Bên trái', 'Bên phải']
      : ['Phía trên', 'Phía dưới'];
  return {
    id: id('position'),
    type: 'position',
    skillId: 'semester-1-geometry',
    instruction: `${first.name} ở vị trí nào so với ${second.name}?`,
    firstIcon: first.icon,
    firstName: first.name,
    secondIcon: second.icon,
    secondName: second.name,
    relation,
    answers: shuffle(answers),
    correctAnswer: relation,
    hintSteps: [
      'Tìm đồ vật được nhắc đến trước.',
      'So sánh vị trí của nó với đồ vật thứ hai.',
      `${first.name} ở ${relation.toLowerCase()} ${second.name}.`,
    ],
    explanation: `${first.name} ở ${relation.toLowerCase()} ${second.name}.`,
  };
}

type Factory = () => Semester1ReviewQuestion;

function plan(total: 5 | 10 | 15): Factory[] {
  if (total === 5) {
    return [
      randomItem([countQuestion, compareQuestion, numberBondQuestion]),
      randomItem([countQuestion, sequenceQuestion, numberBondQuestion]),
      () => arithmeticQuestion('addition'),
      () => arithmeticQuestion('subtraction'),
      randomItem([flatShapeQuestion, solidQuestion, positionQuestion]),
    ];
  }
  if (total === 10) {
    return [
      countQuestion,
      compareQuestion,
      numberBondQuestion,
      () => arithmeticQuestion('addition'),
      () => arithmeticQuestion('subtraction'),
      missingArithmeticQuestion,
      wordQuestion,
      flatShapeQuestion,
      solidQuestion,
      positionQuestion,
    ];
  }
  return [
    countQuestion,
    countQuestion,
    compareQuestion,
    numberBondQuestion,
    sequenceQuestion,
    () => arithmeticQuestion('addition'),
    () => arithmeticQuestion('addition'),
    () => arithmeticQuestion('subtraction'),
    () => arithmeticQuestion('subtraction'),
    missingArithmeticQuestion,
    wordQuestion,
    flatShapeQuestion,
    flatShapeQuestion,
    solidQuestion,
    positionQuestion,
  ];
}

function signature(question: Semester1ReviewQuestion) {
  if (question.type === 'count') return `${question.type}-${question.object}-${question.count}`;
  if (question.type === 'compare') return `${question.type}-${question.left}-${question.right}`;
  if (question.type === 'number-bond') return `${question.type}-${question.whole}-${question.knownPart}`;
  if (question.type === 'sequence') return `${question.type}-${question.sequence.join('-')}`;
  if (question.type === 'arithmetic') return `${question.type}-${question.operation}-${question.first}-${question.second}`;
  if (question.type === 'missing-arithmetic') return `${question.type}-${question.equation.join('-')}`;
  if (question.type === 'word-problem') return `${question.type}-${question.operation}-${question.first}-${question.change}-${question.object}`;
  if (question.type === 'flat-shape') return `${question.type}-${question.shape}-${question.color}`;
  if (question.type === 'solid') return `${question.type}-${question.solid}-${question.color}`;
  return `${question.type}-${question.firstName}-${question.secondName}-${question.relation}`;
}

export function generateSemester1ReviewQuestions(total: 5 | 10 | 15 = 10) {
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
