export type SkillId =
  | 'count-recognize'
  | 'quantity-compare'
  | 'number-compare'
  | 'number-bonds'
  | 'sequence';

export type QuestionType =
  | 'count'
  | 'recognize-number'
  | 'compare-groups'
  | 'compare-number'
  | 'number-bond'
  | 'missing-number'
  | 'before-after';

export type AnswerValue = number | string;

export const SKILL_LABELS: Record<SkillId, string> = {
  'count-recognize': 'Đếm và nhận biết số',
  'quantity-compare': 'Nhiều hơn, ít hơn, bằng nhau',
  'number-compare': 'So sánh số',
  'number-bonds': 'Tách – gộp số',
  sequence: 'Dãy số, số trước và số sau',
};

type BaseQuestion = {
  id: string;
  type: QuestionType;
  skillId: SkillId;
  instruction: string;
  correctAnswer: AnswerValue;
  answers: AnswerValue[];
  hintSteps: [string, string, string];
  explanation: string;
};

export type CountQuestion = BaseQuestion & {
  type: 'count';
  object: string;
  objectName: string;
  count: number;
};

export type RecognizeNumberQuestion = BaseQuestion & {
  type: 'recognize-number';
  number: number;
  numberWord: string;
};

export type CompareGroupsQuestion = BaseQuestion & {
  type: 'compare-groups';
  object: string;
  leftCount: number;
  rightCount: number;
  task: 'more' | 'less' | 'relation';
};

export type CompareNumberQuestion = BaseQuestion & {
  type: 'compare-number';
  left: number;
  right: number;
};

export type NumberBondQuestion = BaseQuestion & {
  type: 'number-bond';
  whole: number;
  knownPart: number;
  missingPart: number;
  object: string;
};

export type MissingNumberQuestion = BaseQuestion & {
  type: 'missing-number';
  sequence: Array<number | null>;
};

export type BeforeAfterQuestion = BaseQuestion & {
  type: 'before-after';
  referenceNumber: number;
  direction: 'before' | 'after';
};

export type CountingQuestion =
  | CountQuestion
  | RecognizeNumberQuestion
  | CompareGroupsQuestion
  | CompareNumberQuestion
  | NumberBondQuestion
  | MissingNumberQuestion
  | BeforeAfterQuestion;

const OBJECTS = [
  { icon: '🍎', name: 'quả táo' },
  { icon: '🍊', name: 'quả cam' },
  { icon: '🍓', name: 'quả dâu' },
  { icon: '🥕', name: 'củ cà rốt' },
  { icon: '🌻', name: 'bông hoa' },
  { icon: '⭐', name: 'ngôi sao' },
  { icon: '🐝', name: 'chú ong' },
  { icon: '⚽', name: 'quả bóng' },
  { icon: '✏️', name: 'chiếc bút chì' },
  { icon: '🎈', name: 'quả bóng bay' },
] as const;

const NUMBER_WORDS = [
  'không', 'một', 'hai', 'ba', 'bốn', 'năm',
  'sáu', 'bảy', 'tám', 'chín', 'mười',
];

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(items: readonly T[]): T {
  return items[randomInteger(0, items.length - 1)];
}

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function createId(type: QuestionType) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createNumberAnswers(correct: number, total = 4) {
  const values = new Set<number>([correct]);
  let distance = 1;
  while (values.size < total) {
    if (correct - distance >= 0) values.add(correct - distance);
    if (values.size < total && correct + distance <= 10) {
      values.add(correct + distance);
    }
    distance += 1;
  }
  return shuffle([...values]);
}

function createCountQuestion(): CountQuestion {
  const selected = randomItem(OBJECTS);
  const count = randomInteger(0, 10);
  return {
    id: createId('count'),
    type: 'count',
    skillId: 'count-recognize',
    instruction: `Có tất cả bao nhiêu ${selected.name}?`,
    object: selected.icon,
    objectName: selected.name,
    count,
    correctAnswer: count,
    answers: createNumberAnswers(count),
    hintSteps: [
      count === 0
        ? 'Quan sát xem trong khung có đồ vật nào không.'
        : 'Chạm mắt vào từng đồ vật và đếm lần lượt.',
      count === 0
        ? 'Không có đồ vật nào được biểu diễn bằng số 0.'
        : `Có thể đếm: ${Array.from({ length: count }, (_, i) => i + 1).join(', ')}.`,
      `Đáp án là ${count}.`,
    ],
    explanation:
      count === 0
        ? `Không có ${selected.name} nào nên ta chọn số 0.`
        : `Đếm lần lượt từng ${selected.name}, ta được ${count}.`,
  };
}

function createRecognizeQuestion(): RecognizeNumberQuestion {
  const number = randomInteger(0, 10);
  return {
    id: createId('recognize-number'),
    type: 'recognize-number',
    skillId: 'count-recognize',
    instruction: `Chọn thẻ số “${NUMBER_WORDS[number]}”.`,
    number,
    numberWord: NUMBER_WORDS[number],
    correctAnswer: number,
    answers: createNumberAnswers(number),
    hintSteps: [
      `Đọc chậm tiếng “${NUMBER_WORDS[number]}” rồi nhớ lại mặt số.`,
      'Số cần tìm nằm trong phạm vi từ 0 đến 10.',
      `“${NUMBER_WORDS[number]}” được viết là ${number}.`,
    ],
    explanation: `Tiếng “${NUMBER_WORDS[number]}” được viết bằng chữ số ${number}.`,
  };
}

function createCompareGroupsQuestion(): CompareGroupsQuestion {
  const selected = randomItem(OBJECTS);
  const task = randomItem<CompareGroupsQuestion['task']>([
    'more', 'less', 'relation',
  ]);
  let leftCount = randomInteger(0, 8);
  let rightCount = randomInteger(0, 8);

  if (task !== 'relation' && leftCount === rightCount) {
    rightCount = leftCount === 8 ? leftCount - 1 : leftCount + 1;
  } else if (task === 'relation' && Math.random() < 0.35) {
    rightCount = leftCount;
  }

  const sideAnswer =
    task === 'less'
      ? leftCount < rightCount ? 'Bên trái' : 'Bên phải'
      : leftCount > rightCount ? 'Bên trái' : 'Bên phải';
  const relationAnswer =
    leftCount === rightCount
      ? 'Bằng nhau'
      : leftCount > rightCount ? 'Bên trái nhiều hơn' : 'Bên phải nhiều hơn';
  const correctAnswer = task === 'relation' ? relationAnswer : sideAnswer;

  return {
    id: createId('compare-groups'),
    type: 'compare-groups',
    skillId: 'quantity-compare',
    instruction:
      task === 'more'
        ? 'Bên nào có nhiều đồ vật hơn?'
        : task === 'less'
          ? 'Bên nào có ít đồ vật hơn?'
          : 'So sánh số lượng của hai bên.',
    object: selected.icon,
    leftCount,
    rightCount,
    task,
    correctAnswer,
    answers:
      task === 'relation'
        ? shuffle(['Bên trái nhiều hơn', 'Bằng nhau', 'Bên phải nhiều hơn'])
        : shuffle(['Bên trái', 'Bên phải']),
    hintSteps: [
      'Nối tưởng tượng từng đồ vật bên trái với một đồ vật bên phải.',
      `Bên trái có ${leftCount}, bên phải có ${rightCount}.`,
      `Đáp án đúng là “${correctAnswer}”.`,
    ],
    explanation: `Bên trái có ${leftCount}, bên phải có ${rightCount}; vì vậy ${correctAnswer.toLowerCase()}.`,
  };
}

function createCompareNumberQuestion(): CompareNumberQuestion {
  const left = randomInteger(0, 10);
  let right = randomInteger(0, 10);
  if (Math.random() < 0.25) right = left;
  const correctAnswer = left > right ? '>' : left < right ? '<' : '=';
  return {
    id: createId('compare-number'),
    type: 'compare-number',
    skillId: 'number-compare',
    instruction: 'Chọn dấu thích hợp.',
    left,
    right,
    correctAnswer,
    answers: shuffle(['<', '=', '>']),
    hintSteps: [
      'Có thể hình dung mỗi số bằng một nhóm chấm tròn.',
      `${left} ${left === right ? 'bằng' : left > right ? 'lớn hơn' : 'bé hơn'} ${right}.`,
      `Dấu cần chọn là ${correctAnswer}.`,
    ],
    explanation: `${left} ${correctAnswer} ${right}.`,
  };
}

function createNumberBondQuestion(): NumberBondQuestion {
  const whole = randomInteger(2, 10);
  const knownPart = randomInteger(0, whole);
  const missingPart = whole - knownPart;
  const selected = randomItem(OBJECTS);
  return {
    id: createId('number-bond'),
    type: 'number-bond',
    skillId: 'number-bonds',
    instruction: `${whole} gồm ${knownPart} và mấy?`,
    whole,
    knownPart,
    missingPart,
    object: selected.icon,
    correctAnswer: missingPart,
    answers: createNumberAnswers(missingPart),
    hintSteps: [
      `Lấy đủ ${whole} đồ vật rồi tách riêng ${knownPart} đồ vật.`,
      `Đếm số đồ vật còn lại sau khi tách ${knownPart}.`,
      `${whole} gồm ${knownPart} và ${missingPart}.`,
    ],
    explanation: `${whole} được tách thành ${knownPart} và ${missingPart}.`,
  };
}

function createMissingNumberQuestion(): MissingNumberQuestion {
  const length = randomItem([4, 5]);
  const start = randomInteger(0, 10 - length + 1);
  const sequence: Array<number | null> = Array.from(
    { length },
    (_, index) => start + index
  );
  const missingIndex = randomInteger(0, length - 1);
  const correctAnswer = sequence[missingIndex] as number;
  sequence[missingIndex] = null;
  return {
    id: createId('missing-number'),
    type: 'missing-number',
    skillId: 'sequence',
    instruction: 'Số nào còn thiếu trong dãy?',
    sequence,
    correctAnswer,
    answers: createNumberAnswers(correctAnswer),
    hintSteps: [
      'Đọc dãy từ trái sang phải, mỗi số tăng thêm 1.',
      `Dãy bắt đầu từ ${start} và kết thúc ở ${start + length - 1}.`,
      `Số còn thiếu là ${correctAnswer}.`,
    ],
    explanation: `Dãy tăng từng đơn vị nên số còn thiếu là ${correctAnswer}.`,
  };
}

function createBeforeAfterQuestion(): BeforeAfterQuestion {
  const direction = randomItem<'before' | 'after'>(['before', 'after']);
  const referenceNumber =
    direction === 'before' ? randomInteger(1, 10) : randomInteger(0, 9);
  const correctAnswer =
    direction === 'before' ? referenceNumber - 1 : referenceNumber + 1;
  const directionText = direction === 'before' ? 'đứng ngay trước' : 'đứng ngay sau';
  return {
    id: createId('before-after'),
    type: 'before-after',
    skillId: 'sequence',
    instruction: `Số nào ${directionText} số ${referenceNumber}?`,
    referenceNumber,
    direction,
    correctAnswer,
    answers: createNumberAnswers(correctAnswer),
    hintSteps: [
      'Nhẩm dãy số từ 0 đến 10 quanh số đã cho.',
      direction === 'before'
        ? 'Số đứng trước bé hơn số đã cho 1 đơn vị.'
        : 'Số đứng sau lớn hơn số đã cho 1 đơn vị.',
      `Đáp án là ${correctAnswer}.`,
    ],
    explanation: `Số ${correctAnswer} ${directionText} số ${referenceNumber}.`,
  };
}

function createQuestion(skillId: SkillId): CountingQuestion {
  if (skillId === 'count-recognize') {
    return Math.random() < 0.65 ? createCountQuestion() : createRecognizeQuestion();
  }
  if (skillId === 'quantity-compare') return createCompareGroupsQuestion();
  if (skillId === 'number-compare') return createCompareNumberQuestion();
  if (skillId === 'number-bonds') return createNumberBondQuestion();
  return Math.random() < 0.55
    ? createMissingNumberQuestion()
    : createBeforeAfterQuestion();
}

function getSkillPlan(total: number): SkillId[] {
  if (total === 5) {
    return ['count-recognize', 'quantity-compare', 'number-compare', 'number-bonds', 'sequence'];
  }
  if (total === 10) {
    return [
      'count-recognize', 'count-recognize', 'count-recognize',
      'quantity-compare', 'quantity-compare',
      'number-compare', 'number-compare',
      'number-bonds', 'number-bonds', 'sequence',
    ];
  }
  if (total === 15) {
    return [
      ...Array<SkillId>(4).fill('count-recognize'),
      ...Array<SkillId>(3).fill('quantity-compare'),
      ...Array<SkillId>(3).fill('number-compare'),
      ...Array<SkillId>(3).fill('number-bonds'),
      ...Array<SkillId>(2).fill('sequence'),
    ];
  }
  const skills = Object.keys(SKILL_LABELS) as SkillId[];
  return Array.from({ length: Math.max(1, total) }, (_, index) => skills[index % skills.length]);
}

function signature(question: CountingQuestion) {
  if (question.type === 'count') return `${question.type}-${question.object}-${question.count}`;
  if (question.type === 'recognize-number') return `${question.type}-${question.number}`;
  if (question.type === 'compare-groups') {
    return `${question.type}-${question.task}-${question.leftCount}-${question.rightCount}`;
  }
  if (question.type === 'compare-number') return `${question.type}-${question.left}-${question.right}`;
  if (question.type === 'number-bond') return `${question.type}-${question.whole}-${question.knownPart}`;
  if (question.type === 'missing-number') return `${question.type}-${question.sequence.join('-')}`;
  return `${question.type}-${question.direction}-${question.referenceNumber}`;
}

export function generateCountingQuestions(totalQuestions = 10): CountingQuestion[] {
  const questions: CountingQuestion[] = [];
  const signatures = new Set<string>();

  for (const skillId of shuffle(getSkillPlan(totalQuestions))) {
    let question = createQuestion(skillId);
    let currentSignature = signature(question);
    let retries = 0;
    while (signatures.has(currentSignature) && retries < 40) {
      question = createQuestion(skillId);
      currentSignature = signature(question);
      retries += 1;
    }
    signatures.add(currentSignature);
    questions.push(question);
  }
  return questions;
}

export function getCorrectAnswer(question: CountingQuestion): AnswerValue {
  return question.correctAnswer;
}
