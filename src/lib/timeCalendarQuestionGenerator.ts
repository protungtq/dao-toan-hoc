export type TimeSkillId = 'tell-time' | 'weekdays' | 'read-calendar' | 'daily-routine-time';
export type TimeAnswer = string;

export const TIME_SKILL_LABELS: Record<TimeSkillId, string> = {
  'tell-time': 'Xem giờ đúng',
  weekdays: 'Các ngày trong tuần',
  'read-calendar': 'Xem lịch',
  'daily-routine-time': 'Thời gian trong ngày',
};

type BaseQuestion = {
  id: string;
  skillId: TimeSkillId;
  instruction: string;
  answers: TimeAnswer[];
  correctAnswer: TimeAnswer;
  hintSteps: [string, string, string];
  explanation: string;
};

export type ClockQuestion = BaseQuestion & {
  type: 'clock';
  hour: number;
  mode: 'read-analog' | 'match-digital';
};

export type WeekdayQuestion = BaseQuestion & {
  type: 'weekday';
  focusDay: string;
  relation: 'before' | 'after' | 'position';
};

export type CalendarQuestion = BaseQuestion & {
  type: 'calendar';
  month: number;
  daysInMonth: number;
  startWeekday: number;
  targetDate: number;
};

export type RoutineQuestion = BaseQuestion & {
  type: 'routine';
  icon: string;
  activity: string;
  period: string;
};

export type TimeQuestion = ClockQuestion | WeekdayQuestion | CalendarQuestion | RoutineQuestion;

export const WEEKDAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'] as const;
const PERIODS = ['Buổi sáng', 'Buổi trưa', 'Buổi chiều', 'Buổi tối'] as const;
const ROUTINES = [
  { icon: '🌅', activity: 'Bé thức dậy và đánh răng', period: 'Buổi sáng' },
  { icon: '🏫', activity: 'Bé bắt đầu buổi học ở trường', period: 'Buổi sáng' },
  { icon: '🍚', activity: 'Bé ăn cơm trưa', period: 'Buổi trưa' },
  { icon: '😴', activity: 'Bé ngủ trưa', period: 'Buổi trưa' },
  { icon: '⚽', activity: 'Bé chơi thể thao sau giờ học', period: 'Buổi chiều' },
  { icon: '🌇', activity: 'Bé cùng gia đình ngắm hoàng hôn', period: 'Buổi chiều' },
  { icon: '📖', activity: 'Bé chuẩn bị sách vở cho ngày mai', period: 'Buổi tối' },
  { icon: '🌙', activity: 'Bé đi ngủ', period: 'Buổi tối' },
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

function clockAnswers(hour: number, digital: boolean) {
  const values = new Set<number>([hour]);
  for (let distance = 1; values.size < 4; distance += 1) {
    values.add(((hour - 1 + distance) % 12) + 1);
    if (values.size < 4) values.add(((hour - 1 - distance + 120) % 12) + 1);
  }
  return shuffle([...values]).map((value) => digital ? `${String(value).padStart(2, '0')}:00` : `${value} giờ`);
}

function clockQuestion(): ClockQuestion {
  const hour = randomInteger(1, 12);
  const mode = randomItem(['read-analog', 'match-digital'] as const);
  const digital = mode === 'match-digital';
  const correct = digital ? `${String(hour).padStart(2, '0')}:00` : `${hour} giờ`;
  return {
    id: id('clock'), type: 'clock', skillId: 'tell-time', hour, mode,
    instruction: digital ? 'Đồng hồ này ứng với giờ điện tử nào?' : 'Đồng hồ chỉ mấy giờ?',
    answers: clockAnswers(hour, digital), correctAnswer: correct,
    hintSteps: ['Kim phút dài đang chỉ số 12 nên đây là giờ đúng.', 'Nhìn kim giờ ngắn đang chỉ vào số nào.', `Kim giờ chỉ số ${hour}, nên đồng hồ chỉ ${hour} giờ.`],
    explanation: `Kim phút chỉ số 12 và kim giờ chỉ số ${hour}, nên đồng hồ chỉ ${hour} giờ đúng.`,
  };
}

function weekdayQuestion(): WeekdayQuestion {
  const relation = randomItem(['before', 'after', 'position'] as const);
  if (relation === 'position') {
    const index = randomInteger(0, 6);
    const correct = WEEKDAYS[index];
    return {
      id: id('weekday-position'), type: 'weekday', skillId: 'weekdays', focusDay: correct, relation,
      instruction: `Ngày thứ ${index + 1} trong tuần là ngày nào?`,
      answers: shuffle([correct, ...shuffle(WEEKDAYS.filter((day) => day !== correct)).slice(0, 3)]),
      correctAnswer: correct,
      hintSteps: ['Một tuần có 7 ngày.', 'Tuần bắt đầu từ thứ Hai và kết thúc vào Chủ nhật.', `Ngày thứ ${index + 1} là ${correct}.`],
      explanation: `Nếu tính thứ Hai là ngày đầu tuần thì ngày thứ ${index + 1} là ${correct}.`,
    };
  }
  const index = randomInteger(0, 6);
  const focusDay = WEEKDAYS[index];
  const answerIndex = relation === 'after' ? (index + 1) % 7 : (index + 6) % 7;
  const correct = WEEKDAYS[answerIndex];
  return {
    id: id(`weekday-${relation}`), type: 'weekday', skillId: 'weekdays', focusDay, relation,
    instruction: relation === 'after' ? `Ngày liền sau ${focusDay} là ngày nào?` : `Ngày liền trước ${focusDay} là ngày nào?`,
    answers: shuffle([correct, ...shuffle(WEEKDAYS.filter((day) => day !== correct)).slice(0, 3)]), correctAnswer: correct,
    hintSteps: ['Đọc lần lượt các ngày trong tuần.', relation === 'after' ? `Tìm ngày đứng ngay sau ${focusDay}.` : `Tìm ngày đứng ngay trước ${focusDay}.`, `Đáp án là ${correct}.`],
    explanation: `${correct} là ngày liền ${relation === 'after' ? 'sau' : 'trước'} ${focusDay}.`,
  };
}

function calendarQuestion(): CalendarQuestion {
  const month = randomInteger(1, 12);
  const daysInMonth = randomItem([28, 30, 31] as const);
  const startWeekday = randomInteger(0, 6);
  const targetDate = randomInteger(1, daysInMonth);
  const weekdayIndex = (startWeekday + targetDate - 1) % 7;
  const correct = WEEKDAYS[weekdayIndex];
  return {
    id: id('calendar'), type: 'calendar', skillId: 'read-calendar', month, daysInMonth, startWeekday, targetDate,
    instruction: `Quan sát tờ lịch. Ngày ${targetDate} tháng ${month} là thứ mấy?`,
    answers: shuffle([correct, ...shuffle(WEEKDAYS.filter((day) => day !== correct)).slice(0, 3)]), correctAnswer: correct,
    hintSteps: ['Tìm ô có ngày được hỏi trên tờ lịch.', 'Nhìn thẳng lên tên thứ ở đầu cột.', `Ngày ${targetDate} nằm ở cột ${correct}.`],
    explanation: `Trên tờ lịch, ngày ${targetDate} tháng ${month} nằm ở cột ${correct}.`,
  };
}

function routineQuestion(): RoutineQuestion {
  const routine = randomItem(ROUTINES);
  return {
    id: id('routine'), type: 'routine', skillId: 'daily-routine-time', ...routine,
    instruction: 'Hoạt động này thường diễn ra vào lúc nào trong ngày?',
    answers: shuffle(PERIODS), correctAnswer: routine.period,
    hintSteps: ['Nhớ lại sinh hoạt hằng ngày của bé.', `Hãy nghĩ xem lúc nào bé thường ${routine.activity.toLowerCase()}.`, `Hoạt động này thường diễn ra vào ${routine.period.toLowerCase()}.`],
    explanation: `${routine.activity} thường diễn ra vào ${routine.period.toLowerCase()}.`,
  };
}

type Factory = () => TimeQuestion;
function plan(total: 5 | 10 | 15): Factory[] {
  if (total === 5) return [clockQuestion, clockQuestion, weekdayQuestion, calendarQuestion, routineQuestion];
  if (total === 10) return [clockQuestion, clockQuestion, clockQuestion, weekdayQuestion, weekdayQuestion, weekdayQuestion, calendarQuestion, calendarQuestion, routineQuestion, routineQuestion];
  return [clockQuestion, clockQuestion, clockQuestion, clockQuestion, clockQuestion, weekdayQuestion, weekdayQuestion, weekdayQuestion, weekdayQuestion, calendarQuestion, calendarQuestion, calendarQuestion, routineQuestion, routineQuestion, routineQuestion];
}

function signature(question: TimeQuestion) {
  if (question.type === 'clock') return `${question.type}-${question.hour}-${question.mode}`;
  if (question.type === 'weekday') return `${question.type}-${question.relation}-${question.focusDay}`;
  if (question.type === 'calendar') return `${question.type}-${question.month}-${question.startWeekday}-${question.targetDate}`;
  return `${question.type}-${question.activity}`;
}

export function generateTimeQuestions(total: 5 | 10 | 15 = 10) {
  const used = new Set<string>();
  return shuffle(plan(total)).map((factory) => {
    let question = factory();
    let key = signature(question);
    let retries = 0;
    while (used.has(key) && retries < 30) { question = factory(); key = signature(question); retries += 1; }
    used.add(key);
    return question;
  });
}
