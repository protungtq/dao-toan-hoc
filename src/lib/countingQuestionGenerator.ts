export type QuestionType =
  | 'count'
  | 'missing-number'
  | 'compare'
  | 'choose-group'
  | 'before-after'
  | 'order';

type BaseQuestion = {
  id: string;
  type: QuestionType;
  instruction: string;
  explanation: string;
};

export type CountQuestion = BaseQuestion & {
  type: 'count';
  object: string;
  objectName: string;
  count: number;
  answers: number[];
};

export type MissingNumberQuestion = BaseQuestion & {
  type: 'missing-number';
  sequence: Array<number | null>;
  correctAnswer: number;
  answers: number[];
};

export type CompareQuestion = BaseQuestion & {
  type: 'compare';
  left: number;
  right: number;
  answers: string[];
  correctAnswer: string;
};

export type ChooseGroupQuestion = BaseQuestion & {
  type: 'choose-group';
  object: string;
  objectName: string;
  target: number;
  groups: number[];
};

export type BeforeAfterQuestion = BaseQuestion & {
  type: 'before-after';
  referenceNumber: number;
  direction: 'before' | 'after';
  correctAnswer: number;
  answers: number[];
};

export type OrderQuestion = BaseQuestion & {
  type: 'order';
  numbers: number[];
  direction: 'ascending' | 'descending';
  correctAnswer: string;
  answers: string[];
};

export type CountingQuestion =
  | CountQuestion
  | MissingNumberQuestion
  | CompareQuestion
  | ChooseGroupQuestion
  | BeforeAfterQuestion
  | OrderQuestion;

type ObjectItem = {
  icon: string;
  singularName: string;
};

const objects: ObjectItem[] = [
  { icon: '🍎', singularName: 'quả táo' },
  { icon: '🍊', singularName: 'quả cam' },
  { icon: '🍓', singularName: 'quả dâu' },
  { icon: '🧁', singularName: 'chiếc bánh' },
  { icon: '🍯', singularName: 'hũ mật ong' },
  { icon: '🥕', singularName: 'củ cà rốt' },
  { icon: '🌻', singularName: 'bông hoa' },
  { icon: '⭐', singularName: 'ngôi sao' },
  { icon: '🐝', singularName: 'chú ong' },
  { icon: '🐞', singularName: 'chú bọ rùa' },
  { icon: '⚽', singularName: 'quả bóng' },
  { icon: '✏️', singularName: 'chiếc bút chì' },
  { icon: '🎈', singularName: 'quả bóng bay' },
  { icon: '🐟', singularName: 'chú cá' },
  { icon: '🍪', singularName: 'chiếc bánh quy' },
];

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: T[]): T {
  return items[randomInteger(0, items.length - 1)];
}

export function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [
      result[randomIndex],
      result[index],
    ];
  }

  return result;
}

function createNumberAnswers(
  correctAnswer: number,
  min = 1,
  max = 10,
  total = 4
) {
  const values = new Set<number>([correctAnswer]);

  let distance = 1;

  while (values.size < total) {
    const lower = correctAnswer - distance;
    const higher = correctAnswer + distance;

    if (lower >= min) {
      values.add(lower);
    }

    if (values.size < total && higher <= max) {
      values.add(higher);
    }

    distance += 1;

    if (distance > max + 2) {
      const fallback = randomInteger(min, max);
      values.add(fallback);
    }
  }

  return shuffle(Array.from(values)).slice(0, total);
}

function createUniqueId(type: QuestionType) {
  return `${type}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function createCountQuestion(): CountQuestion {
  const selectedObject = randomItem(objects);
  const count = randomInteger(2, 10);

  return {
    id: createUniqueId('count'),
    type: 'count',
    instruction: `Có tất cả bao nhiêu ${selectedObject.singularName}?`,
    object: selectedObject.icon,
    objectName: selectedObject.singularName,
    count,
    answers: createNumberAnswers(count),
    explanation: `Đếm lần lượt từng ${selectedObject.singularName}, ta được ${count}.`,
  };
}

function createMissingNumberQuestion(): MissingNumberQuestion {
  const sequenceLength = randomItem([4, 5]);
  const start = randomInteger(1, 10 - sequenceLength + 1);

  const sequence: Array<number | null> = Array.from(
    { length: sequenceLength },
    (_, index) => start + index
  );

  const missingIndex = randomInteger(1, sequenceLength - 1);
  const correctAnswer = sequence[missingIndex] as number;

  sequence[missingIndex] = null;

  return {
    id: createUniqueId('missing-number'),
    type: 'missing-number',
    instruction: 'Số nào còn thiếu trong dãy?',
    sequence,
    correctAnswer,
    answers: createNumberAnswers(correctAnswer),
    explanation: `Dãy số tăng lần lượt từng đơn vị. Số còn thiếu là ${correctAnswer}.`,
  };
}

function createCompareQuestion(): CompareQuestion {
  let left = randomInteger(1, 10);
  let right = randomInteger(1, 10);

  const shouldBeEqual = Math.random() < 0.25;

  if (shouldBeEqual) {
    right = left;
  } else {
    while (right === left) {
      right = randomInteger(1, 10);
    }
  }

  const correctAnswer = left > right ? '>' : left < right ? '<' : '=';

  const relation =
    correctAnswer === '>'
      ? 'lớn hơn'
      : correctAnswer === '<'
        ? 'nhỏ hơn'
        : 'bằng';

  return {
    id: createUniqueId('compare'),
    type: 'compare',
    instruction: 'Chọn dấu thích hợp',
    left,
    right,
    answers: shuffle(['<', '=', '>']),
    correctAnswer,
    explanation: `${left} ${relation} ${right}, vì vậy đáp án đúng là dấu ${correctAnswer}.`,
  };
}

function createChooseGroupQuestion(): ChooseGroupQuestion {
  const selectedObject = randomItem(objects);
  const target = randomInteger(3, 9);

  const groups = createNumberAnswers(target, 1, 10, 3);

  return {
    id: createUniqueId('choose-group'),
    type: 'choose-group',
    instruction: `Nhóm nào có đúng ${target} ${selectedObject.singularName}?`,
    object: selectedObject.icon,
    objectName: selectedObject.singularName,
    target,
    groups,
    explanation: `Nhóm đúng có tất cả ${target} ${selectedObject.singularName}.`,
  };
}

function createBeforeAfterQuestion(): BeforeAfterQuestion {
  const direction = randomItem<'before' | 'after'>(['before', 'after']);

  const referenceNumber =
    direction === 'before'
      ? randomInteger(2, 10)
      : randomInteger(1, 9);

  const correctAnswer =
    direction === 'before'
      ? referenceNumber - 1
      : referenceNumber + 1;

  const directionText =
    direction === 'before' ? 'đứng ngay trước' : 'đứng ngay sau';

  return {
    id: createUniqueId('before-after'),
    type: 'before-after',
    instruction: `Số nào ${directionText} số ${referenceNumber}?`,
    referenceNumber,
    direction,
    correctAnswer,
    answers: createNumberAnswers(correctAnswer),
    explanation: `Số ${correctAnswer} ${directionText} số ${referenceNumber}.`,
  };
}

function createOrderQuestion(): OrderQuestion {
  const direction = randomItem<'ascending' | 'descending'>([
    'ascending',
    'descending',
  ]);

  const numberSet = new Set<number>();

  while (numberSet.size < 3) {
    numberSet.add(randomInteger(1, 10));
  }

  const numbers = Array.from(numberSet);

  const correctNumbers = [...numbers].sort((first, second) =>
    direction === 'ascending'
      ? first - second
      : second - first
  );

  const correctAnswer = correctNumbers.join(' – ');

  const wrongAnswers = new Set<string>();

  while (wrongAnswers.size < 3) {
    const candidate = shuffle(numbers).join(' – ');

    if (candidate !== correctAnswer) {
      wrongAnswers.add(candidate);
    }
  }

  return {
    id: createUniqueId('order'),
    type: 'order',
    instruction:
      direction === 'ascending'
        ? 'Chọn dãy số từ bé đến lớn'
        : 'Chọn dãy số từ lớn đến bé',
    numbers,
    direction,
    correctAnswer,
    answers: shuffle([
      correctAnswer,
      ...Array.from(wrongAnswers),
    ]),
    explanation:
      direction === 'ascending'
        ? `Thứ tự từ bé đến lớn là ${correctAnswer}.`
        : `Thứ tự từ lớn đến bé là ${correctAnswer}.`,
  };
}

function createQuestionByType(
  type: QuestionType
): CountingQuestion {
  if (type === 'count') return createCountQuestion();
  if (type === 'missing-number') return createMissingNumberQuestion();
  if (type === 'compare') return createCompareQuestion();
  if (type === 'choose-group') return createChooseGroupQuestion();
  if (type === 'before-after') return createBeforeAfterQuestion();

  return createOrderQuestion();
}

function createQuestionSignature(question: CountingQuestion) {
  if (question.type === 'count') {
    return `${question.type}-${question.object}-${question.count}`;
  }

  if (question.type === 'missing-number') {
    return `${question.type}-${question.sequence.join('-')}`;
  }

  if (question.type === 'compare') {
    return `${question.type}-${question.left}-${question.right}`;
  }

  if (question.type === 'choose-group') {
    return `${question.type}-${question.object}-${question.target}`;
  }

  if (question.type === 'before-after') {
    return `${question.type}-${question.direction}-${question.referenceNumber}`;
  }

  return `${question.type}-${question.direction}-${question.numbers.join('-')}`;
}

function arrangeQuestionTypes(totalQuestions: number) {
  const baseTypes: QuestionType[] = [
    'count',
    'choose-group',
    'missing-number',
    'before-after',
    'compare',
    'order',
  ];

  const result: QuestionType[] = [];

  while (result.length < totalQuestions) {
    const shuffledTypes = shuffle(baseTypes);

    for (const type of shuffledTypes) {
      if (result.length >= totalQuestions) break;

      const lastType = result[result.length - 1];
      const secondLastType = result[result.length - 2];

      if (type === lastType && type === secondLastType) {
        continue;
      }

      result.push(type);
    }
  }

  return result;
}

export function generateCountingQuestions(
  totalQuestions = 10
): CountingQuestion[] {
  const types = arrangeQuestionTypes(totalQuestions);
  const questions: CountingQuestion[] = [];
  const signatures = new Set<string>();

  for (const type of types) {
    let question = createQuestionByType(type);
    let signature = createQuestionSignature(question);
    let safetyCount = 0;

    while (signatures.has(signature) && safetyCount < 30) {
      question = createQuestionByType(type);
      signature = createQuestionSignature(question);
      safetyCount += 1;
    }

    signatures.add(signature);
    questions.push(question);
  }

  return questions;
}

export function getCorrectAnswer(
  question: CountingQuestion
): number | string {
  if (question.type === 'count') return question.count;
  if (question.type === 'missing-number') {
    return question.correctAnswer;
  }
  if (question.type === 'compare') return question.correctAnswer;
  if (question.type === 'before-after') {
    return question.correctAnswer;
  }
  if (question.type === 'order') return question.correctAnswer;

  return question.target;
}