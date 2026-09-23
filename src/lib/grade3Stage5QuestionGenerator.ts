export type Grade3Stage5Module = 'numbers100000' | 'addSubtract100000' | 'timeMoney';

export type Grade3Stage5SkillId =
  | 'five-digit-numbers'
  | 'compare-to-100000'
  | 'round-thousands'
  | 'addition-100000'
  | 'subtraction-100000'
  | 'word-problems-100000'
  | 'clock-to-minute'
  | 'months-years-calendar'
  | 'vietnamese-money-grade-3';

export type Grade3Stage5Answer = number | string;

export const GRADE3_STAGE5_SKILL_LABELS: Record<Grade3Stage5SkillId, string> = {
  'five-digit-numbers': 'Số có năm chữ số',
  'compare-to-100000': 'So sánh số đến 100 000',
  'round-thousands': 'Làm tròn số lớn',
  'addition-100000': 'Phép cộng đến 100 000',
  'subtraction-100000': 'Phép trừ đến 100 000',
  'word-problems-100000': 'Bài toán thực tế',
  'clock-to-minute': 'Đồng hồ và khoảng thời gian',
  'months-years-calendar': 'Tháng, năm và lịch',
  'vietnamese-money-grade-3': 'Tiền Việt Nam',
};

type BaseQuestion = {
  id: string;
  signature: string;
  skillId: Grade3Stage5SkillId;
  instruction: string;
  answers: Grade3Stage5Answer[];
  correctAnswer: Grade3Stage5Answer;
  hintSteps: [string, string, string];
  explanation: string;
  answerUnit?: 'đồng' | 'ngày';
};

export type NumberCardQuestion = BaseQuestion & {
  type: 'number-card';
  value: number;
  highlightPlace?: 'ten-thousands' | 'thousands' | 'hundreds' | 'tens' | 'ones';
};

export type ComparisonQuestion = BaseQuestion & {
  type: 'comparison';
  values: number[];
  mode: 'symbol' | 'order';
};

export type NumberLineQuestion = BaseQuestion & {
  type: 'number-line';
  value: number;
  lower: number;
  upper: number;
  midpoint: number;
  unit: 1000 | 10000;
};

export type CalculationQuestion = BaseQuestion & {
  type: 'calculation';
  operation: 'add' | 'subtract';
  left: number;
  right: number;
};

export type ContextQuestion = BaseQuestion & {
  type: 'context';
  icon: string;
  visualTitle: string;
  visualText: string;
  operation: 'add' | 'subtract';
  left: number;
  right: number;
};

export type TimeQuestion = BaseQuestion & {
  type: 'time';
  mode: 'read' | 'elapsed';
  hour: number;
  minute: number;
  duration?: number;
  endHour?: number;
  endMinute?: number;
};

export type CalendarQuestion = BaseQuestion & {
  type: 'calendar';
  year: number;
  month: number;
  daysInMonth: number;
  startWeekday: number;
  highlightedDay?: number;
};

export type MoneyQuestion = BaseQuestion & {
  type: 'money';
  mode: 'total' | 'change';
  bills: number[];
  price?: number;
  paid: number;
};

export type Grade3Stage5Question = NumberCardQuestion | ComparisonQuestion | NumberLineQuestion | CalculationQuestion | ContextQuestion | TimeQuestion | CalendarQuestion | MoneyQuestion;

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'] as const;
const WEEKDAYS = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'] as const;
const DENOMINATIONS = [1000, 2000, 5000, 10000, 20000, 50000, 100000] as const;

const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: readonly T[]): T => items[ri(0, items.length - 1)];

function shuffle<T>(items: readonly T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = ri(0, index);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

const qid = (signature: string) => `${signature}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const formatNumber = (value: number) => value.toLocaleString('vi-VN');

function numberAnswers(correct: number, min: number, max: number, offsets: readonly number[]) {
  const values = new Set<number>([correct]);
  for (const offset of shuffle(offsets)) {
    const candidate = correct + offset;
    if (candidate >= min && candidate <= max) values.add(candidate);
    if (values.size === 4) break;
  }
  while (values.size < 4) values.add(ri(min, max));
  return shuffle([...values]);
}

function readTwoDigits(value: number) {
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  if (!tens) return ones ? DIGITS[ones] : '';
  if (tens === 1) return ones ? `mười ${ones === 5 ? 'lăm' : DIGITS[ones]}` : 'mười';
  if (!ones) return `${DIGITS[tens]} mươi`;
  return `${DIGITS[tens]} mươi ${ones === 1 ? 'mốt' : ones === 5 ? 'lăm' : DIGITS[ones]}`;
}

function readThreeDigits(value: number, full = false) {
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  if (!hundreds && !full) return readTwoDigits(remainder);
  const prefix = `${DIGITS[hundreds]} trăm`;
  if (!remainder) return prefix;
  return remainder < 10 ? `${prefix} linh ${DIGITS[remainder]}` : `${prefix} ${readTwoDigits(remainder)}`;
}

function readVietnameseNumber(value: number) {
  if (value === 100000) return 'một trăm nghìn';
  const thousands = Math.floor(value / 1000);
  const remainder = value % 1000;
  const prefix = `${readTwoDigits(thousands)} nghìn`;
  if (!remainder) return prefix;
  return `${prefix} ${readThreeDigits(remainder, remainder < 100)}`;
}

function randomFiveDigitNumber() {
  return ri(10000, 99999);
}

function fiveDigitQuestion(): NumberCardQuestion {
  const mode = pick(['read', 'expanded', 'place'] as const);
  const value = mode === 'read' && Math.random() < 0.08 ? 100000 : randomFiveDigitNumber();
  const digits = String(value).padStart(5, '0').split('').map(Number);
  if (mode === 'read') {
    const correct = readVietnameseNumber(value);
    const alternatives = new Set<string>([correct]);
    while (alternatives.size < 4) alternatives.add(readVietnameseNumber(Math.max(10000, Math.min(100000, value + pick([-10000, -1000, -100, 100, 1000, 10000])))));
    return { id: qid(`read5-${value}`), signature: `read5-${value}`, type: 'number-card', skillId: 'five-digit-numbers', value, instruction: `Số ${formatNumber(value)} được đọc như thế nào?`, answers: shuffle([...alternatives]), correctAnswer: correct, hintSteps: ['Đọc nhóm nghìn trước, rồi đọc ba chữ số cuối.', 'Chú ý các hàng có chữ số 0.', `Số này đọc là “${correct}”.`], explanation: `${formatNumber(value)} đọc là “${correct}”.` };
  }
  if (mode === 'expanded') {
    const correct = `${digits[0] * 10000} + ${digits[1] * 1000} + ${digits[2] * 100} + ${digits[3] * 10} + ${digits[4]}`;
    const alternatives = new Set<string>([correct]);
    while (alternatives.size < 4) {
      const changed = [...digits];
      const place = ri(0, 4);
      changed[place] = Math.max(0, changed[place] + pick([-1, 1]));
      alternatives.add(`${changed[0] * 10000} + ${changed[1] * 1000} + ${changed[2] * 100} + ${changed[3] * 10} + ${changed[4]}`);
    }
    return { id: qid(`expanded5-${value}`), signature: `expanded5-${value}`, type: 'number-card', skillId: 'five-digit-numbers', value, instruction: `Cách phân tích số ${formatNumber(value)} nào đúng?`, answers: shuffle([...alternatives]), correctAnswer: correct, hintSteps: ['Xác định từng chữ số theo hàng.', 'Nhân chữ số với giá trị của hàng.', `${formatNumber(value)} = ${correct}.`], explanation: `${formatNumber(value)} = ${correct}.` };
  }
  const place = ri(0, 4);
  const placeKeys = ['ten-thousands', 'thousands', 'hundreds', 'tens', 'ones'] as const;
  const placeNames = ['hàng chục nghìn', 'hàng nghìn', 'hàng trăm', 'hàng chục', 'hàng đơn vị'] as const;
  const placeValues = [10000, 1000, 100, 10, 1] as const;
  const correct = digits[place] * placeValues[place];
  return { id: qid(`place5-${value}-${place}`), signature: `place5-${value}-${place}`, type: 'number-card', skillId: 'five-digit-numbers', value, highlightPlace: placeKeys[place], instruction: `Chữ số ${digits[place]} ở ${placeNames[place]} có giá trị bao nhiêu?`, answers: numberAnswers(correct, 0, 90000, [1, -1, 10, -10, 100, -100, 1000, -1000, 10000, -10000]), correctAnswer: correct, hintSteps: [`Xác định ${placeNames[place]}.`, `Giá trị của hàng là ${formatNumber(placeValues[place])}.`, `${digits[place]} × ${formatNumber(placeValues[place])} = ${formatNumber(correct)}.`], explanation: `Chữ số ${digits[place]} có giá trị ${formatNumber(correct)}.` };
}

function compareQuestion(): ComparisonQuestion {
  const mode = Math.random() < 0.55 ? 'symbol' : 'order';
  if (mode === 'symbol') {
    const left = randomFiveDigitNumber();
    const right = Math.max(10000, Math.min(100000, left + pick([-10000, -1000, -100, -10, 0, 10, 100, 1000, 10000])));
    const correct = left < right ? '<' : left > right ? '>' : '=';
    return { id: qid(`compare5-${left}-${right}`), signature: `compare5-${left}-${right}`, type: 'comparison', skillId: 'compare-to-100000', values: [left, right], mode, instruction: 'Chọn dấu thích hợp điền vào ô trống.', answers: shuffle(['<', '>', '=']), correctAnswer: correct, hintSteps: ['So sánh số chữ số trước.', 'Nếu cùng năm chữ số, so từ hàng chục nghìn.', `${formatNumber(left)} ${correct} ${formatNumber(right)}.`], explanation: `${formatNumber(left)} ${correct} ${formatNumber(right)}.` };
  }
  const values = new Set<number>();
  const base = ri(15000, 95000);
  while (values.size < 4) values.add(Math.max(10000, Math.min(99999, base + ri(-2500, 2500))));
  const shown = shuffle([...values]);
  const ascending = Math.random() < 0.5;
  const sorted = [...shown].sort((a, b) => ascending ? a - b : b - a);
  const correct = sorted.map(formatNumber).join(' – ');
  const alternatives = new Set<string>([correct]);
  while (alternatives.size < 4) alternatives.add(shuffle(shown).map(formatNumber).join(' – '));
  return { id: qid(`order5-${shown.join('-')}-${ascending}`), signature: `order5-${shown.join('-')}-${ascending}`, type: 'comparison', skillId: 'compare-to-100000', values: shown, mode, instruction: `Dãy nào được xếp từ ${ascending ? 'bé đến lớn' : 'lớn đến bé'}?`, answers: shuffle([...alternatives]), correctAnswer: correct, hintSteps: ['So sánh từ hàng chục nghìn.', `Chọn ${ascending ? 'số bé nhất' : 'số lớn nhất'} trước.`, `Thứ tự đúng là ${correct}.`], explanation: `Dãy đúng: ${correct}.` };
}

function roundingQuestion(): NumberLineQuestion {
  const unit = pick([1000, 10000] as const);
  const value = ri(10001, 99999);
  const lower = Math.floor(value / unit) * unit;
  const upper = lower + unit;
  const midpoint = lower + unit / 2;
  const correct = value < midpoint ? lower : upper;
  return { id: qid(`round5-${unit}-${value}`), signature: `round5-${unit}-${value}`, type: 'number-line', skillId: 'round-thousands', value, lower, upper, midpoint, unit, instruction: `Làm tròn ${formatNumber(value)} đến hàng ${unit === 1000 ? 'nghìn' : 'chục nghìn'}.`, answers: numberAnswers(correct, 0, 100000, unit === 1000 ? [1000, -1000, 2000, -2000, 10000, -10000] : [10000, -10000, 20000, -20000]), correctAnswer: correct, hintSteps: [`Quan sát chữ số hàng ${unit === 1000 ? 'trăm' : 'nghìn'}.`, `So với điểm giữa ${formatNumber(midpoint)}.`, `${formatNumber(value)} gần ${formatNumber(correct)} hơn.`], explanation: `Làm tròn được ${formatNumber(correct)}.` };
}

function calculationQuestion(operation: 'add' | 'subtract'): CalculationQuestion {
  let left: number;
  let right: number;
  let correct: number;
  if (operation === 'add') {
    left = ri(10000, 85000);
    right = ri(5000, 100000 - left);
    correct = left + right;
  } else {
    left = ri(20000, 100000);
    right = ri(5000, left - 1);
    correct = left - right;
  }
  const symbol = operation === 'add' ? '+' : '−';
  return { id: qid(`${operation}5-${left}-${right}`), signature: `${operation}5-${left}-${right}`, type: 'calculation', skillId: operation === 'add' ? 'addition-100000' : 'subtraction-100000', operation, left, right, instruction: `Chọn ${operation === 'add' ? 'tổng' : 'hiệu'} đúng.`, answers: numberAnswers(correct, 0, 100000, [1, -1, 10, -10, 100, -100, 1000, -1000, 10000, -10000]), correctAnswer: correct, hintSteps: ['Đặt các chữ số cùng hàng thẳng cột.', 'Tính lần lượt từ hàng đơn vị.', `${formatNumber(left)} ${symbol} ${formatNumber(right)} = ${formatNumber(correct)}.`], explanation: `${formatNumber(left)} ${symbol} ${formatNumber(right)} = ${formatNumber(correct)}.` };
}

function wordProblemQuestion(): ContextQuestion {
  const add = Math.random() < 0.5;
  const contexts = add
    ? [['📚', 'Hai thư viện', 'Thư viện A và thư viện B', 'quyển'], ['🌳', 'Chiến dịch trồng cây', 'Hai đội cùng trồng cây', 'cây'], ['🎟️', 'Ngày hội thiếu nhi', 'Hai buổi đón khách', 'vé']] as const
    : [['🍚', 'Kho gạo', 'Đã xuất một phần số gạo', 'kg'], ['📦', 'Kho hàng', 'Đã chuyển đi một số hộp', 'hộp'], ['🚌', 'Chuyến tham quan', 'Một số bạn đã xuống xe', 'bạn']] as const;
  const [icon, title, subtitle, unit] = pick(contexts);
  let left: number;
  let right: number;
  let correct: number;
  if (add) { left = ri(12000, 60000); right = ri(5000, 95000 - left); correct = left + right; }
  else { left = ri(20000, 95000); right = ri(5000, left - 1000); correct = left - right; }
  const instruction = add ? `Có ${formatNumber(left)} ${unit}, thêm ${formatNumber(right)} ${unit}. Có tất cả bao nhiêu ${unit}?` : `Có ${formatNumber(left)} ${unit}, đã bớt ${formatNumber(right)} ${unit}. Còn lại bao nhiêu ${unit}?`;
  return { id: qid(`story5-${add}-${left}-${right}`), signature: `story5-${add}-${left}-${right}`, type: 'context', skillId: 'word-problems-100000', icon, visualTitle: title, visualText: `${subtitle}: ${formatNumber(left)} ${add ? '+' : '−'} ${formatNumber(right)}`, operation: add ? 'add' : 'subtract', left, right, instruction, answers: numberAnswers(correct, 0, 100000, [10, -10, 100, -100, 1000, -1000, 10000, -10000]), correctAnswer: correct, hintSteps: [add ? 'Tìm tất cả nên dùng phép cộng.' : 'Tìm còn lại nên dùng phép trừ.', `Thực hiện ${formatNumber(left)} ${add ? '+' : '−'} ${formatNumber(right)}.`, `Kết quả là ${formatNumber(correct)} ${unit}.`], explanation: `${formatNumber(left)} ${add ? '+' : '−'} ${formatNumber(right)} = ${formatNumber(correct)} ${unit}.` };
}

function normalizeMinutes(total: number) {
  const normalized = ((total % 1440) + 1440) % 1440;
  return { hour: Math.floor(normalized / 60), minute: normalized % 60 };
}

function formatTime(hour: number, minute: number) {
  return `${hour} giờ ${String(minute).padStart(2, '0')} phút`;
}

function timeQuestion(): TimeQuestion {
  const mode = Math.random() < 0.6 ? 'read' : 'elapsed';
  const hour = mode === 'read' ? ri(1, 12) : ri(6, 19);
  const minute = ri(0, 59);
  if (mode === 'read') {
    const correct = formatTime(hour, minute);
    const alternatives = new Set<string>([correct]);
    for (const offset of shuffle([-10, -5, -1, 1, 5, 10, 15, -15])) {
      const other = normalizeMinutes(hour * 60 + minute + offset);
      alternatives.add(formatTime(other.hour, other.minute));
      if (alternatives.size === 4) break;
    }
    return { id: qid(`clock-${hour}-${minute}`), signature: `clock-${hour}-${minute}`, type: 'time', skillId: 'clock-to-minute', mode, hour, minute, instruction: 'Đồng hồ đang chỉ mấy giờ?', answers: shuffle([...alternatives]), correctAnswer: correct, hintSteps: ['Kim ngắn chỉ giờ, kim dài chỉ phút.', 'Mỗi vạch phút ứng với 1 phút.', `Đồng hồ chỉ ${correct}.`], explanation: `Đồng hồ chỉ ${correct}.` };
  }
  const duration = pick([15, 20, 25, 30, 35, 40, 45, 60]);
  const end = normalizeMinutes(hour * 60 + minute + duration);
  const correct = formatTime(end.hour, end.minute);
  const alternatives = new Set<string>([correct]);
  for (const offset of shuffle([-15, -10, -5, 5, 10, 15])) {
    const other = normalizeMinutes(end.hour * 60 + end.minute + offset);
    alternatives.add(formatTime(other.hour, other.minute));
    if (alternatives.size === 4) break;
  }
  return { id: qid(`elapsed-${hour}-${minute}-${duration}`), signature: `elapsed-${hour}-${minute}-${duration}`, type: 'time', skillId: 'clock-to-minute', mode, hour, minute, duration, endHour: end.hour, endMinute: end.minute, instruction: `Một hoạt động bắt đầu lúc ${formatTime(hour, minute)} và kéo dài ${duration} phút. Hoạt động kết thúc lúc nào?`, answers: shuffle([...alternatives]), correctAnswer: correct, hintSteps: ['Đổi giờ bắt đầu thành giờ và phút.', `Cộng thêm ${duration} phút.`, `Kết thúc lúc ${correct}.`], explanation: `${formatTime(hour, minute)} cộng ${duration} phút là ${correct}.` };
}

function calendarQuestion(): CalendarQuestion {
  const year = ri(2024, 2028);
  const month = ri(1, 12);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const askDays = Math.random() < 0.4;
  if (askDays) {
    const alternatives = [28, 29, 30, 31].filter((value) => value !== daysInMonth).slice(0, 3);
    return { id: qid(`calendar-days-${year}-${month}`), signature: `calendar-days-${year}-${month}`, type: 'calendar', skillId: 'months-years-calendar', year, month, daysInMonth, startWeekday, instruction: `Tháng ${month} năm ${year} có bao nhiêu ngày?`, answers: shuffle([daysInMonth, ...alternatives]), correctAnswer: daysInMonth, answerUnit: 'ngày', hintSteps: ['Quan sát ngày cuối cùng trên tờ lịch.', 'Ngày cuối chính là số ngày trong tháng.', `Tháng ${month} có ${daysInMonth} ngày.`], explanation: `Tháng ${month} năm ${year} có ${daysInMonth} ngày.` };
  }
  const highlightedDay = ri(1, daysInMonth);
  const weekdayIndex = (startWeekday + highlightedDay - 1) % 7;
  const correct = WEEKDAYS[weekdayIndex];
  const alternatives = shuffle(WEEKDAYS.filter((day) => day !== correct)).slice(0, 3);
  return { id: qid(`calendar-weekday-${year}-${month}-${highlightedDay}`), signature: `calendar-weekday-${year}-${month}-${highlightedDay}`, type: 'calendar', skillId: 'months-years-calendar', year, month, daysInMonth, startWeekday, highlightedDay, instruction: `Ngày ${highlightedDay} tháng ${month} năm ${year} là thứ mấy?`, answers: shuffle([correct, ...alternatives]), correctAnswer: correct, hintSteps: ['Tìm cột chứa ngày được đánh dấu.', 'Đọc tên thứ ở đầu cột.', `Ngày đó là ${correct}.`], explanation: `Ngày ${highlightedDay}/${month}/${year} là ${correct}.` };
}

function moneyQuestion(): MoneyQuestion {
  const mode = Math.random() < 0.55 ? 'total' : 'change';
  if (mode === 'total') {
    const bills = Array.from({ length: ri(2, 4) }, () => pick(DENOMINATIONS.slice(0, 6)));
    const paid = bills.reduce((sum, bill) => sum + bill, 0);
    const signature = `money-total-${[...bills].sort((a, b) => a - b).join('-')}`;
    return { id: qid(signature), signature, type: 'money', skillId: 'vietnamese-money-grade-3', mode, bills, paid, instruction: 'Các tờ tiền có tổng giá trị bao nhiêu?', answers: numberAnswers(paid, 0, 200000, [1000, -1000, 2000, -2000, 5000, -5000, 10000, -10000]), correctAnswer: paid, answerUnit: 'đồng', hintSteps: ['Đọc mệnh giá từng tờ tiền.', 'Cộng các mệnh giá lại.', `Tổng cộng ${formatNumber(paid)} đồng.`], explanation: `Các tờ tiền có tổng giá trị ${formatNumber(paid)} đồng.` };
  }
  const paid = pick([20000, 50000, 100000] as const);
  const price = ri(2, Math.floor((paid - 1000) / 1000)) * 1000;
  const correct = paid - price;
  return { id: qid(`money-change-${paid}-${price}`), signature: `money-change-${paid}-${price}`, type: 'money', skillId: 'vietnamese-money-grade-3', mode, bills: [paid], paid, price, instruction: `Mua món đồ giá ${formatNumber(price)} đồng và trả ${formatNumber(paid)} đồng. Được trả lại bao nhiêu tiền?`, answers: numberAnswers(correct, 0, paid, [1000, -1000, 2000, -2000, 5000, -5000, 10000, -10000]), correctAnswer: correct, answerUnit: 'đồng', hintSteps: ['Tiền thừa bằng tiền trả trừ giá món đồ.', `Lấy ${formatNumber(paid)} trừ ${formatNumber(price)}.`, `Tiền thừa là ${formatNumber(correct)} đồng.`], explanation: `${formatNumber(paid)} − ${formatNumber(price)} = ${formatNumber(correct)} đồng.` };
}

type Factory = () => Grade3Stage5Question;

function unique(plan: Factory[], total: 5 | 10 | 15) {
  const result: Grade3Stage5Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  while (result.length < total && attempts < total * 80) {
    const question = plan[result.length % plan.length]();
    attempts += 1;
    if (seen.has(question.signature)) continue;
    seen.add(question.signature);
    result.push(question);
  }
  return shuffle(result);
}

export function generateGrade3Stage5Questions(module: Grade3Stage5Module, total: 5 | 10 | 15 = 10) {
  const plans: Record<Grade3Stage5Module, Factory[]> = {
    numbers100000: [fiveDigitQuestion, compareQuestion, roundingQuestion, fiveDigitQuestion, () => Math.random() < 0.5 ? compareQuestion() : roundingQuestion()],
    addSubtract100000: [() => calculationQuestion('add'), () => calculationQuestion('subtract'), wordProblemQuestion, () => calculationQuestion('add'), () => Math.random() < 0.5 ? calculationQuestion('subtract') : wordProblemQuestion()],
    timeMoney: [timeQuestion, calendarQuestion, moneyQuestion, timeQuestion, () => Math.random() < 0.5 ? calendarQuestion() : moneyQuestion()],
  };
  return unique(plans[module], total);
}
