export type ShapeId = 'circle' | 'square' | 'triangle' | 'rectangle';

export type ShapeSkillId =
  | 'recognize-shapes'
  | 'classify-shapes'
  | 'shapes-in-life'
  | 'compose-shapes';

export type ShapeAnswer = number | string;

export const SHAPE_LABELS: Record<ShapeId, string> = {
  circle: 'Hình tròn',
  square: 'Hình vuông',
  triangle: 'Hình tam giác',
  rectangle: 'Hình chữ nhật',
};

export const SHAPE_SKILL_LABELS: Record<ShapeSkillId, string> = {
  'recognize-shapes': 'Nhận biết hình',
  'classify-shapes': 'Phân loại hình',
  'shapes-in-life': 'Hình trong cuộc sống',
  'compose-shapes': 'Ghép và xếp hình',
};

type BaseQuestion = {
  id: string;
  skillId: ShapeSkillId;
  instruction: string;
  answers: ShapeAnswer[];
  correctAnswer: ShapeAnswer;
  hintSteps: [string, string, string];
  explanation: string;
};

export type IdentifyShapeQuestion = BaseQuestion & {
  type: 'identify-shape';
  shape: ShapeId;
  color: string;
};

export type ChooseShapeQuestion = BaseQuestion & {
  type: 'choose-shape';
  targetShape: ShapeId;
  shapeOptions: ShapeId[];
};

export type ClassifyShapeQuestion = BaseQuestion & {
  type: 'classify-shape';
  targetShape: ShapeId;
  shapes: Array<{ shape: ShapeId; color: string }>;
};

export type OddShapeQuestion = BaseQuestion & {
  type: 'odd-shape';
  shapes: ShapeId[];
  differentIndex: number;
};

export type LifeShapeQuestion = BaseQuestion & {
  type: 'life-shape';
  objectIcon: string;
  objectName: string;
  shape: ShapeId;
};

export type CompositeId = 'house' | 'robot' | 'ice-cream' | 'boat';

export type ComposeShapeQuestion = BaseQuestion & {
  type: 'compose-shape';
  composite: CompositeId;
  compositeName: string;
};

export type CountInCompositeQuestion = BaseQuestion & {
  type: 'count-in-composite';
  composite: CompositeId;
  compositeName: string;
  targetShape: ShapeId;
};

export type ShapeQuestion =
  | IdentifyShapeQuestion
  | ChooseShapeQuestion
  | ClassifyShapeQuestion
  | OddShapeQuestion
  | LifeShapeQuestion
  | ComposeShapeQuestion
  | CountInCompositeQuestion;

const SHAPES = Object.keys(SHAPE_LABELS) as ShapeId[];
const COLORS = ['violet', 'sky', 'emerald', 'orange', 'rose'] as const;

const LIFE_OBJECTS = [
  { icon: '🕐', name: 'mặt đồng hồ', shape: 'circle' },
  { icon: '🍪', name: 'chiếc bánh quy tròn', shape: 'circle' },
  { icon: '🪟', name: 'ô cửa sổ vuông', shape: 'square' },
  { icon: '🧊', name: 'mặt trước của khối Rubik', shape: 'square' },
  { icon: '🚪', name: 'cánh cửa', shape: 'rectangle' },
  { icon: '📱', name: 'màn hình điện thoại', shape: 'rectangle' },
  { icon: '⚠️', name: 'biển cảnh báo', shape: 'triangle' },
  { icon: '🍕', name: 'miếng bánh pizza', shape: 'triangle' },
] as const satisfies ReadonlyArray<{
  icon: string;
  name: string;
  shape: ShapeId;
}>;

const COMPOSITES = [
  {
    id: 'house',
    name: 'ngôi nhà',
    answer: 'Hình vuông, hình chữ nhật và hình tam giác',
    explanation:
      'Mái nhà là hình tam giác; thân nhà và cửa ra vào là hình chữ nhật; cửa sổ gồm 4 ô vuông nhỏ ghép thành 1 ô vuông lớn.',
  },
  {
    id: 'robot',
    name: 'chú rô-bốt',
    answer: 'Hình vuông, hình chữ nhật và hình tròn',
    explanation:
      'Rô-bốt được ghép từ đầu vuông, thân và tay chân chữ nhật, mắt tròn.',
  },
  {
    id: 'ice-cream',
    name: 'cây kem',
    answer: 'Hình tròn và hình tam giác',
    explanation:
      'Viên kem là hình tròn, phần ốc quế là hình tam giác.',
  },
  {
    id: 'boat',
    name: 'chiếc thuyền',
    answer: 'Hình chữ nhật và hình tam giác',
    explanation:
      'Cánh buồm là hình tam giác, thân thuyền và cột buồm là hình chữ nhật.',
  },
] as const satisfies ReadonlyArray<{
  id: CompositeId;
  name: string;
  answer: string;
  explanation: string;
}>;

const COUNT_COMPOSITE_TASKS = [
  {
    composite: 'house' as CompositeId,
    compositeName: 'ngôi nhà',
    targetShape: 'square' as ShapeId,
    instruction: 'Hình ngôi nhà có tất cả bao nhiêu hình vuông?',
    correctAnswer: 5,
    answers: [3, 4, 5, 6],
    hintSteps: [
      'Quan sát kỹ phần ô cửa sổ của ngôi nhà.',
      'Đếm 4 ô vuông nhỏ bên trong trước.',
      'Cả 4 ô vuông nhỏ cùng ghép lại thành 1 ô vuông lớn bao bên ngoài. Tất cả là: 4 + 1 = 5 hình vuông!',
    ] as [string, string, string],
    explanation:
      'Cửa sổ gồm 4 ô vuông nhỏ và 1 ô vuông lớn bao quanh 4 ô vuông đó. Như vậy có tất cả: 4 + 1 = 5 hình vuông!',
  },
  {
    composite: 'house' as CompositeId,
    compositeName: 'ngôi nhà',
    targetShape: 'triangle' as ShapeId,
    instruction: 'Hình ngôi nhà có bao nhiêu hình tam giác?',
    correctAnswer: 1,
    answers: [1, 2, 3, 4],
    hintSteps: [
      'Quan sát từ trên xuống dưới của ngôi nhà.',
      'Mái nhà có 3 cạnh nhọn thẳng.',
      'Chỉ có đúng 1 hình tam giác làm mái nhà.',
    ] as [string, string, string],
    explanation: 'Ngôi nhà có đúng 1 hình tam giác là phần mái nhà.',
  },
  {
    composite: 'house' as CompositeId,
    compositeName: 'ngôi nhà',
    targetShape: 'rectangle' as ShapeId,
    instruction: 'Hình ngôi nhà có bao nhiêu hình chữ nhật?',
    correctAnswer: 2,
    answers: [1, 2, 3, 4],
    hintSteps: [
      'Tìm các hình có 2 cạnh dài và 2 cạnh ngắn.',
      'Thân ngôi nhà là 1 hình chữ nhật lớn.',
      'Cánh cửa chính ra vào là 1 hình chữ nhật nữa. Tổng cộng có 2 hình chữ nhật!',
    ] as [string, string, string],
    explanation: 'Có 2 hình chữ nhật gồm: 1 thân ngôi nhà và 1 cánh cửa ra vào.',
  },
  {
    composite: 'robot' as CompositeId,
    compositeName: 'chú rô-bốt',
    targetShape: 'circle' as ShapeId,
    instruction: 'Chú rô-bốt có bao nhiêu hình tròn?',
    correctAnswer: 2,
    answers: [1, 2, 3, 4],
    hintSteps: [
      'Tìm các hình có đường cong khép kín, không có cạnh.',
      'Quan sát kỹ khuôn mặt của chú rô-bốt.',
      'Hai con mắt của chú rô-bốt là 2 hình tròn!',
    ] as [string, string, string],
    explanation: 'Chú rô-bốt có 2 con mắt hình tròn.',
  },
  {
    composite: 'robot' as CompositeId,
    compositeName: 'chú rô-bốt',
    targetShape: 'square' as ShapeId,
    instruction: 'Chú rô-bốt có bao nhiêu hình vuông?',
    correctAnswer: 1,
    answers: [1, 2, 3, 4],
    hintSteps: [
      'Tìm hình có 4 cạnh bằng nhau hoàn hảo.',
      'Quan sát phần đầu của chú rô-bốt.',
      'Đầu chú rô-bốt là 1 hình vuông!',
    ] as [string, string, string],
    explanation: 'Chú rô-bốt có 1 hình vuông chính là phần đầu.',
  },
  {
    composite: 'boat' as CompositeId,
    compositeName: 'chiếc thuyền',
    targetShape: 'triangle' as ShapeId,
    instruction: 'Chiếc thuyền có bao nhiêu hình tam giác?',
    correctAnswer: 2,
    answers: [1, 2, 3, 4],
    hintSteps: [
      'Tìm các hình có 3 cạnh khép kín.',
      'Quan sát hai cánh buồm của chiếc thuyền.',
      'Có 1 cánh buồm lớn và 1 cánh buồm nhỏ, tất cả là 2 hình tam giác!',
    ] as [string, string, string],
    explanation: 'Chiếc thuyền có 2 hình tam giác chính là 2 cánh buồm đón gió.',
  },
  {
    composite: 'ice-cream' as CompositeId,
    compositeName: 'cây kem',
    targetShape: 'circle' as ShapeId,
    instruction: 'Cây kem có bao nhiêu hình tròn?',
    correctAnswer: 1,
    answers: [1, 2, 3, 4],
    hintSteps: [
      'Tìm hình có đường cong tròn đều.',
      'Quan sát viên kem mát lạnh ở phía trên.',
      'Viên kem là 1 hình tròn!',
    ] as [string, string, string],
    explanation: 'Cây kem có 1 hình tròn chính là viên kem ngọt ngào phía trên.',
  },
];

const COMPOSITION_ANSWERS = [
  'Hình vuông, hình chữ nhật và hình tam giác',
  'Hình chữ nhật và hình tam giác',
  'Hình vuông, hình chữ nhật và hình tròn',
  'Hình tròn và hình tam giác',
  'Hình vuông và hình tam giác',
  'Hình tròn và hình chữ nhật',
  'Hình vuông và hình chữ nhật',
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
    if (values.size < 4) values.add(correct + distance);
    distance += 1;
  }
  return shuffle([...values]);
}

function identifyQuestion(): IdentifyShapeQuestion {
  const shape = randomItem(SHAPES);
  return {
    id: id('identify'),
    type: 'identify-shape',
    skillId: 'recognize-shapes',
    instruction: 'Đây là hình gì?',
    shape,
    color: randomItem(COLORS),
    answers: shuffle(SHAPES.map((item) => SHAPE_LABELS[item])),
    correctAnswer: SHAPE_LABELS[shape],
    hintSteps: [
      'Quan sát đường bao và số cạnh của hình.',
      shape === 'circle'
        ? 'Hình này có đường cong khép kín và không có cạnh.'
        : `Hình này có ${shape === 'triangle' ? 3 : 4} cạnh.`,
      `Đây là ${SHAPE_LABELS[shape].toLowerCase()}.`,
    ],
    explanation: `Hình được cho là ${SHAPE_LABELS[shape].toLowerCase()}.`,
  };
}

function chooseQuestion(): ChooseShapeQuestion {
  const targetShape = randomItem(SHAPES);
  return {
    id: id('choose'),
    type: 'choose-shape',
    skillId: 'recognize-shapes',
    instruction: `Chọn ${SHAPE_LABELS[targetShape].toLowerCase()}.`,
    targetShape,
    shapeOptions: shuffle(SHAPES),
    answers: [],
    correctAnswer: targetShape,
    hintSteps: [
      'Đọc tên hình rồi quan sát từng đường bao.',
      targetShape === 'circle'
        ? 'Hình cần tìm không có cạnh.'
        : targetShape === 'triangle'
          ? 'Hình cần tìm có 3 cạnh.'
          : targetShape === 'square'
            ? 'Hình cần tìm có 4 cạnh bằng nhau.'
            : 'Hình cần tìm có 4 cạnh, hai cạnh dài và hai cạnh ngắn.',
      `Đáp án là ${SHAPE_LABELS[targetShape].toLowerCase()}.`,
    ],
    explanation: `Bé đã chọn đúng ${SHAPE_LABELS[targetShape].toLowerCase()}.`,
  };
}

function classifyQuestion(): ClassifyShapeQuestion {
  const targetShape = randomItem(SHAPES);
  const targetCount = randomInteger(2, 4);
  const shapes = [
    ...Array.from({ length: targetCount }, () => ({
      shape: targetShape,
      color: randomItem(COLORS),
    })),
    ...Array.from({ length: randomInteger(3, 5) }, () => ({
      shape: randomItem(SHAPES.filter((shape) => shape !== targetShape)),
      color: randomItem(COLORS),
    })),
  ];
  return {
    id: id('classify'),
    type: 'classify-shape',
    skillId: 'classify-shapes',
    instruction: `Có bao nhiêu ${SHAPE_LABELS[targetShape].toLowerCase()}?`,
    targetShape,
    shapes: shuffle(shapes),
    answers: numberAnswers(targetCount),
    correctAnswer: targetCount,
    hintSteps: [
      `Chỉ tìm ${SHAPE_LABELS[targetShape].toLowerCase()}, chưa cần đếm các hình khác.`,
      'Chạm mắt vào từng hình đúng loại rồi đếm lần lượt.',
      `Có tất cả ${targetCount} ${SHAPE_LABELS[targetShape].toLowerCase()}.`,
    ],
    explanation: `Trong nhóm có ${targetCount} ${SHAPE_LABELS[targetShape].toLowerCase()}.`,
  };
}

function oddQuestion(): OddShapeQuestion {
  const common = randomItem(SHAPES);
  const different = randomItem(SHAPES.filter((shape) => shape !== common));
  const differentIndex = randomInteger(0, 3);
  const shapes = Array<ShapeId>(4).fill(common);
  shapes[differentIndex] = different;
  return {
    id: id('odd'),
    type: 'odd-shape',
    skillId: 'classify-shapes',
    instruction: 'Hình nào khác với các hình còn lại?',
    shapes,
    differentIndex,
    answers: [],
    correctAnswer: differentIndex,
    hintSteps: [
      'So sánh đường bao của từng hình.',
      `Có ba ${SHAPE_LABELS[common].toLowerCase()} giống nhau.`,
      `Hình khác là ${SHAPE_LABELS[different].toLowerCase()}.`,
    ],
    explanation: `${SHAPE_LABELS[different]} khác với ba hình còn lại.`,
  };
}

function lifeQuestion(): LifeShapeQuestion {
  const item = randomItem(LIFE_OBJECTS);
  return {
    id: id('life'),
    type: 'life-shape',
    skillId: 'shapes-in-life',
    instruction: `${item.name} gợi cho bé hình nào?`,
    objectIcon: item.icon,
    objectName: item.name,
    shape: item.shape,
    answers: shuffle(SHAPES.map((shape) => SHAPE_LABELS[shape])),
    correctAnswer: SHAPE_LABELS[item.shape],
    hintSteps: [
      'Quan sát đường viền bên ngoài của đồ vật.',
      `So sánh đường viền đó với bốn hình đã học.`,
      `${item.name} gợi đến ${SHAPE_LABELS[item.shape].toLowerCase()}.`,
    ],
    explanation: `${item.name} có dạng gần giống ${SHAPE_LABELS[item.shape].toLowerCase()}.`,
  };
}

function composeQuestion(): ComposeShapeQuestion {
  const item = randomItem(COMPOSITES);
  const wrongAnswers = COMPOSITION_ANSWERS
    .filter((answer) => answer !== item.answer);
  return {
    id: id('compose'),
    type: 'compose-shape',
    skillId: 'compose-shapes',
    instruction: `${item.name} được ghép từ những hình nào?`,
    composite: item.id,
    compositeName: item.name,
    answers: shuffle([item.answer, ...shuffle(wrongAnswers).slice(0, 3)]),
    correctAnswer: item.answer,
    hintSteps: [
      'Nhìn từng bộ phận riêng thay vì nhìn cả hình.',
      'Quan sát kỹ các chi tiết như mái, thân, cửa chính, cửa sổ...',
      item.explanation,
    ],
    explanation: item.explanation,
  };
}

function countCompositeQuestion(): CountInCompositeQuestion {
  const task = randomItem(COUNT_COMPOSITE_TASKS);
  return {
    id: id('count-composite'),
    type: 'count-in-composite',
    skillId: 'compose-shapes',
    instruction: task.instruction,
    composite: task.composite,
    compositeName: task.compositeName,
    targetShape: task.targetShape,
    answers: shuffle([...task.answers]),
    correctAnswer: task.correctAnswer,
    hintSteps: task.hintSteps,
    explanation: task.explanation,
  };
}

function questionForSkill(skill: ShapeSkillId): ShapeQuestion {
  if (skill === 'recognize-shapes') {
    return Math.random() < 0.5 ? identifyQuestion() : chooseQuestion();
  }
  if (skill === 'classify-shapes') {
    return Math.random() < 0.55 ? classifyQuestion() : oddQuestion();
  }
  if (skill === 'shapes-in-life') return lifeQuestion();
  return Math.random() < 0.5 ? composeQuestion() : countCompositeQuestion();
}

function skillPlan(total: number): ShapeSkillId[] {
  if (total === 5) {
    return [
      'recognize-shapes',
      'recognize-shapes',
      'classify-shapes',
      'shapes-in-life',
      'compose-shapes',
    ];
  }
  if (total === 10) {
    return [
      ...Array<ShapeSkillId>(3).fill('recognize-shapes'),
      ...Array<ShapeSkillId>(3).fill('classify-shapes'),
      ...Array<ShapeSkillId>(2).fill('shapes-in-life'),
      ...Array<ShapeSkillId>(2).fill('compose-shapes'),
    ];
  }
  return [
    ...Array<ShapeSkillId>(5).fill('recognize-shapes'),
    ...Array<ShapeSkillId>(4).fill('classify-shapes'),
    ...Array<ShapeSkillId>(3).fill('shapes-in-life'),
    ...Array<ShapeSkillId>(3).fill('compose-shapes'),
  ];
}

function signature(question: ShapeQuestion) {
  if (question.type === 'identify-shape') return `${question.type}-${question.shape}`;
  if (question.type === 'choose-shape') return `${question.type}-${question.targetShape}`;
  if (question.type === 'classify-shape') {
    return `${question.type}-${question.targetShape}-${question.correctAnswer}`;
  }
  if (question.type === 'odd-shape') return `${question.type}-${question.shapes.join('-')}`;
  if (question.type === 'life-shape') return `${question.type}-${question.objectName}`;
  if (question.type === 'count-in-composite') {
    return `${question.type}-${question.composite}-${question.targetShape}`;
  }
  return `${question.type}-${question.composite}`;
}

export function generateShapeQuestions(total: 5 | 10 | 15 = 10) {
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
