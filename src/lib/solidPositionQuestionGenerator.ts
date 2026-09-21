export type SolidId = 'cube' | 'cuboid';
export type PositionRelation =
  | 'Bên trái'
  | 'Bên phải'
  | 'Phía trên'
  | 'Phía dưới'
  | 'Phía trước'
  | 'Phía sau';

export type SolidPositionSkillId =
  | 'recognize-solids'
  | 'classify-solids'
  | 'spatial-position'
  | 'follow-direction';

export type SolidPositionAnswer = number | string;

export const SOLID_LABELS: Record<SolidId, string> = {
  cube: 'Khối lập phương',
  cuboid: 'Khối hộp chữ nhật',
};

export const SOLID_POSITION_SKILL_LABELS: Record<SolidPositionSkillId, string> = {
  'recognize-solids': 'Nhận biết hình khối',
  'classify-solids': 'Phân loại hình khối',
  'spatial-position': 'Vị trí trong không gian',
  'follow-direction': 'Làm theo chỉ dẫn',
};

type BaseQuestion = {
  id: string;
  skillId: SolidPositionSkillId;
  instruction: string;
  answers: SolidPositionAnswer[];
  correctAnswer: SolidPositionAnswer;
  hintSteps: [string, string, string];
  explanation: string;
};

export type RecognizeSolidQuestion = BaseQuestion & {
  type: 'recognize-solid';
  solid: SolidId;
  color: string;
};

export type ChooseSolidQuestion = BaseQuestion & {
  type: 'choose-solid';
  target: SolidId;
  options: SolidId[];
};

export type ObjectSolidQuestion = BaseQuestion & {
  type: 'object-solid';
  objectIcon: string;
  objectName: string;
  solid: SolidId;
};

export type CountSolidQuestion = BaseQuestion & {
  type: 'count-solid';
  target: SolidId;
  solids: Array<{ solid: SolidId; color: string }>;
};

export type PositionQuestion = BaseQuestion & {
  type: 'position';
  firstIcon: string;
  firstName: string;
  secondIcon: string;
  secondName: string;
  relation: PositionRelation;
};

export type DirectionQuestion = BaseQuestion & {
  type: 'direction';
  direction: 'up' | 'down' | 'left' | 'right';
  mascot: '🐿️' | '🐻';
};

export type SolidPositionQuestion =
  | RecognizeSolidQuestion
  | ChooseSolidQuestion
  | ObjectSolidQuestion
  | CountSolidQuestion
  | PositionQuestion
  | DirectionQuestion;

const COLORS = ['orange', 'sky', 'emerald', 'violet', 'rose'] as const;
const SOLIDS: SolidId[] = ['cube', 'cuboid'];
const OBJECTS = [
  { icon: '🎲', name: 'con xúc xắc', solid: 'cube' },
  { icon: '🧊', name: 'viên đá lạnh dạng khối', solid: 'cube' },
  { icon: '📕', name: 'quyển sách', solid: 'cuboid' },
  { icon: '🧱', name: 'viên gạch', solid: 'cuboid' },
] as const satisfies ReadonlyArray<{
  icon: string;
  name: string;
  solid: SolidId;
}>;

const POSITION_OBJECTS = [
  { icon: '⚽', name: 'quả bóng' },
  { icon: '🎁', name: 'hộp quà' },
  { icon: '🐱', name: 'chú mèo' },
  { icon: '🐶', name: 'chú chó' },
  { icon: '🌳', name: 'cái cây' },
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

function createId(type: string) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function numberAnswers(correct: number) {
  const values = new Set<number>([correct]);
  let distance = 1;
  while (values.size < 4) {
    if (correct - distance >= 0) values.add(correct - distance);
    if (values.size < 4) values.add(correct + distance);
    distance += 1;
  }
  return shuffle([...values]);
}

function recognizeQuestion(): RecognizeSolidQuestion {
  const solid = randomItem(SOLIDS);
  return {
    id: createId('recognize-solid'),
    type: 'recognize-solid',
    skillId: 'recognize-solids',
    instruction: 'Đây là khối gì?',
    solid,
    color: randomItem(COLORS),
    answers: shuffle(Object.values(SOLID_LABELS)),
    correctAnswer: SOLID_LABELS[solid],
    hintSteps: [
      'Quan sát các mặt và độ dài của khối.',
      solid === 'cube'
        ? 'Các chiều của khối trông bằng nhau.'
        : 'Khối có dạng hộp dài, các chiều không bằng nhau.',
      `Đây là ${SOLID_LABELS[solid].toLowerCase()}.`,
    ],
    explanation: `Hình được cho là ${SOLID_LABELS[solid].toLowerCase()}.`,
  };
}

function chooseQuestion(): ChooseSolidQuestion {
  const target = randomItem(SOLIDS);
  return {
    id: createId('choose-solid'),
    type: 'choose-solid',
    skillId: 'recognize-solids',
    instruction: `Chọn ${SOLID_LABELS[target].toLowerCase()}.`,
    target,
    options: shuffle(SOLIDS),
    answers: [],
    correctAnswer: target,
    hintSteps: [
      'So sánh chiều dài, chiều rộng và chiều cao của hai khối.',
      target === 'cube'
        ? 'Tìm khối có ba chiều trông bằng nhau.'
        : 'Tìm khối có dạng chiếc hộp dài.',
      `Đáp án là ${SOLID_LABELS[target].toLowerCase()}.`,
    ],
    explanation: `Bé đã chọn đúng ${SOLID_LABELS[target].toLowerCase()}.`,
  };
}

function objectQuestion(): ObjectSolidQuestion {
  const object = randomItem(OBJECTS);
  return {
    id: createId('object-solid'),
    type: 'object-solid',
    skillId: 'classify-solids',
    instruction: `${object.name} có dạng gần giống khối nào?`,
    objectIcon: object.icon,
    objectName: object.name,
    solid: object.solid,
    answers: shuffle(Object.values(SOLID_LABELS)),
    correctAnswer: SOLID_LABELS[object.solid],
    hintSteps: [
      'Hãy nghĩ đến hình dạng của đồ vật khi cầm trên tay.',
      object.solid === 'cube'
        ? 'Đồ vật có các chiều gần bằng nhau.'
        : 'Đồ vật có dạng hộp dài.',
      `${object.name} gần giống ${SOLID_LABELS[object.solid].toLowerCase()}.`,
    ],
    explanation: `${object.name} có dạng gần giống ${SOLID_LABELS[object.solid].toLowerCase()}.`,
  };
}

function countQuestion(): CountSolidQuestion {
  const target = randomItem(SOLIDS);
  const targetCount = randomInteger(2, 4);
  const other: SolidId = target === 'cube' ? 'cuboid' : 'cube';
  const solids = shuffle([
    ...Array.from({ length: targetCount }, () => ({
      solid: target,
      color: randomItem(COLORS),
    })),
    ...Array.from({ length: randomInteger(2, 4) }, () => ({
      solid: other,
      color: randomItem(COLORS),
    })),
  ]);
  return {
    id: createId('count-solid'),
    type: 'count-solid',
    skillId: 'classify-solids',
    instruction: `Có bao nhiêu ${SOLID_LABELS[target].toLowerCase()}?`,
    target,
    solids,
    answers: numberAnswers(targetCount),
    correctAnswer: targetCount,
    hintSteps: [
      `Chỉ tìm ${SOLID_LABELS[target].toLowerCase()}, chưa đếm khối khác.`,
      'Chạm mắt vào từng khối đúng loại rồi đếm.',
      `Có ${targetCount} ${SOLID_LABELS[target].toLowerCase()}.`,
    ],
    explanation: `Trong nhóm có ${targetCount} ${SOLID_LABELS[target].toLowerCase()}.`,
  };
}

function positionQuestion(): PositionQuestion {
  const [first, second] = shuffle(POSITION_OBJECTS).slice(0, 2);
  const relation = randomItem<PositionRelation>([
    'Bên trái',
    'Bên phải',
    'Phía trên',
    'Phía dưới',
    'Phía trước',
    'Phía sau',
  ]);
  const answers =
    relation === 'Bên trái' || relation === 'Bên phải'
      ? ['Bên trái', 'Bên phải']
      : relation === 'Phía trên' || relation === 'Phía dưới'
        ? ['Phía trên', 'Phía dưới']
        : ['Phía trước', 'Phía sau'];
  return {
    id: createId('position'),
    type: 'position',
    skillId: 'spatial-position',
    instruction: `${first.name} ở vị trí nào so với ${second.name}?`,
    firstIcon: first.icon,
    firstName: first.name,
    secondIcon: second.icon,
    secondName: second.name,
    relation,
    answers: shuffle(answers),
    correctAnswer: relation,
    hintSteps: [
      'Tìm đồ vật được nhắc đến trước, rồi so sánh với đồ vật thứ hai.',
      relation === 'Phía trước' || relation === 'Phía sau'
        ? 'Đồ vật ở phía trước được vẽ thấp hơn và lớn hơn.'
        : 'Quan sát theo đúng chiều của màn hình.',
      `${first.name} ở ${relation.toLowerCase()} ${second.name}.`,
    ],
    explanation: `${first.name} ở ${relation.toLowerCase()} ${second.name}.`,
  };
}

function directionQuestion(): DirectionQuestion {
  const direction = randomItem(['up', 'down', 'left', 'right'] as const);
  const mascot = randomItem(['🐿️', '🐻'] as const);
  const label = {
    up: 'Ô phía trên',
    down: 'Ô phía dưới',
    left: 'Ô bên trái',
    right: 'Ô bên phải',
  }[direction];
  return {
    id: createId('direction'),
    type: 'direction',
    skillId: 'follow-direction',
    instruction: `Chọn ô ở ${label.replace('Ô ', '').toLowerCase()} nhân vật.`,
    direction,
    mascot,
    answers: ['up', 'down', 'left', 'right'],
    correctAnswer: direction,
    hintSteps: [
      'Đặt mắt ở ô có nhân vật rồi nhìn theo hướng được yêu cầu.',
      `Hướng cần tìm là ${label.replace('Ô ', '').toLowerCase()}.`,
      `Chọn ${label.toLowerCase()}.`,
    ],
    explanation: `Đúng rồi, đó là ${label.toLowerCase()} nhân vật.`,
  };
}

function questionForSkill(skill: SolidPositionSkillId): SolidPositionQuestion {
  if (skill === 'recognize-solids') {
    return Math.random() < 0.55 ? recognizeQuestion() : chooseQuestion();
  }
  if (skill === 'classify-solids') {
    return Math.random() < 0.55 ? objectQuestion() : countQuestion();
  }
  if (skill === 'spatial-position') return positionQuestion();
  return directionQuestion();
}

function skillPlan(total: 5 | 10 | 15): SolidPositionSkillId[] {
  if (total === 5) {
    return [
      'recognize-solids',
      'recognize-solids',
      'classify-solids',
      'spatial-position',
      'follow-direction',
    ];
  }
  if (total === 10) {
    return [
      ...Array<SolidPositionSkillId>(3).fill('recognize-solids'),
      ...Array<SolidPositionSkillId>(2).fill('classify-solids'),
      ...Array<SolidPositionSkillId>(3).fill('spatial-position'),
      ...Array<SolidPositionSkillId>(2).fill('follow-direction'),
    ];
  }
  return [
    ...Array<SolidPositionSkillId>(5).fill('recognize-solids'),
    ...Array<SolidPositionSkillId>(4).fill('classify-solids'),
    ...Array<SolidPositionSkillId>(4).fill('spatial-position'),
    ...Array<SolidPositionSkillId>(2).fill('follow-direction'),
  ];
}

function signature(question: SolidPositionQuestion) {
  if (question.type === 'recognize-solid') return `${question.type}-${question.solid}-${question.color}`;
  if (question.type === 'choose-solid') return `${question.type}-${question.target}`;
  if (question.type === 'object-solid') return `${question.type}-${question.objectName}`;
  if (question.type === 'count-solid') return `${question.type}-${question.target}-${question.correctAnswer}`;
  if (question.type === 'position') {
    return `${question.type}-${question.firstName}-${question.secondName}-${question.relation}`;
  }
  return `${question.type}-${question.direction}-${question.mascot}`;
}

export function generateSolidPositionQuestions(total: 5 | 10 | 15 = 10) {
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
