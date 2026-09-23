export type Grade3Stage6Module = 'multiplyDivide100000' | 'statisticsProbability' | 'finalReview';

export type Grade3Stage6SkillId =
  | 'multiply-five-by-one'
  | 'divide-five-by-one'
  | 'large-number-word-problems'
  | 'collect-record-data-grade-3'
  | 'event-likelihood-grade-3'
  | 'read-data-table-grade-3'
  | 'final-numbers-100000'
  | 'final-add-subtract-grade-3'
  | 'final-multiply-divide-grade-3'
  | 'final-geometry-measurement-grade-3'
  | 'final-data-probability-grade-3';

export type Grade3Stage6Answer = number | string;

export const GRADE3_STAGE6_SKILL_LABELS: Record<Grade3Stage6SkillId, string> = {
  'multiply-five-by-one': 'Nhân số có năm chữ số',
  'divide-five-by-one': 'Chia số có năm chữ số',
  'large-number-word-problems': 'Bài toán nhân chia thực tế',
  'collect-record-data-grade-3': 'Thu thập và ghi chép số liệu',
  'event-likelihood-grade-3': 'Khả năng xảy ra',
  'read-data-table-grade-3': 'Đọc bảng số liệu',
  'final-numbers-100000': 'Ôn số đến 100 000',
  'final-add-subtract-grade-3': 'Ôn cộng và trừ',
  'final-multiply-divide-grade-3': 'Ôn nhân và chia',
  'final-geometry-measurement-grade-3': 'Ôn hình học và đo lường',
  'final-data-probability-grade-3': 'Ôn dữ liệu và xác suất',
};

type BaseQuestion = {
  id: string;
  signature: string;
  skillId: Grade3Stage6SkillId;
  instruction: string;
  answers: Grade3Stage6Answer[];
  correctAnswer: Grade3Stage6Answer;
  hintSteps: [string, string, string];
  explanation: string;
  answerUnit?: string;
};

type CalculationQuestion = BaseQuestion & {
  type: 'calculation';
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  left: number;
  right: number;
};

type ContextQuestion = BaseQuestion & {
  type: 'context';
  icon: string;
  visualTitle: string;
  visualLines: string[];
};

type DataTableQuestion = BaseQuestion & {
  type: 'data-table';
  title: string;
  labels: string[];
  values: number[];
  icons: string[];
};

type ProbabilityQuestion = BaseQuestion & {
  type: 'probability';
  icon: string;
  sceneTitle: string;
  sceneText: string;
};

type NumberQuestion = BaseQuestion & {
  type: 'number';
  value: number;
  secondValue?: number;
  mode: 'round' | 'compare' | 'place-value';
  highlightedPlace?: string;
};

type GeometryQuestion = BaseQuestion & {
  type: 'geometry';
  shape: 'rectangle' | 'square';
  width: number;
  height: number;
  task: 'area' | 'perimeter';
  unit: 'cm';
};

type MeasureQuestion = BaseQuestion & {
  type: 'measure';
  icon: string;
  value: number;
  fromUnit: string;
  toUnit: string;
};

export type Grade3Stage6Question =
  | CalculationQuestion
  | ContextQuestion
  | DataTableQuestion
  | ProbabilityQuestion
  | NumberQuestion
  | GeometryQuestion
  | MeasureQuestion;

const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: readonly T[]) => items[ri(0, items.length - 1)];
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const formatNumber = (value: number) => value.toLocaleString('vi-VN');
const qid = (signature: string) => `g3s6-${signature}-${Math.random().toString(36).slice(2, 8)}`;

function distinctValues(count: number, min: number, max: number) {
  const values = new Set<number>();
  while (values.size < count) values.add(ri(min, max));
  return [...values];
}

function numberAnswers(correct: number, min = 0, max = 100000, offsets = [1, -1, 10, -10, 100, -100, 1000, -1000]) {
  const values = new Set<number>([correct]);
  for (const offset of shuffle(offsets)) {
    const candidate = correct + offset;
    if (candidate >= min && candidate <= max) values.add(candidate);
    if (values.size === 4) break;
  }
  while (values.size < 4) values.add(ri(min, max));
  return shuffle([...values]);
}

function multiplicationQuestion(skillId: Grade3Stage6SkillId = 'multiply-five-by-one'): CalculationQuestion {
  const right = ri(2, 9);
  const left = ri(10000, Math.floor(99999 / right));
  const correct = left * right;
  return {
    id: qid(`mul5-${left}-${right}`), signature: `mul5-${left}-${right}`, type: 'calculation', skillId,
    operation: 'multiply', left, right, instruction: 'Chọn tích đúng của phép nhân.',
    answers: numberAnswers(correct), correctAnswer: correct,
    hintSteps: ['Đặt thừa số có một chữ số dưới hàng đơn vị.', 'Nhân lần lượt từ phải sang trái và nhớ sang hàng kế tiếp.', `${formatNumber(left)} × ${right} = ${formatNumber(correct)}.`],
    explanation: `${formatNumber(left)} × ${right} = ${formatNumber(correct)}.`,
  };
}

function divisionQuestion(skillId: Grade3Stage6SkillId = 'divide-five-by-one'): CalculationQuestion {
  const right = ri(2, 9);
  const quotient = ri(1200, Math.floor(99999 / right));
  const left = quotient * right;
  return {
    id: qid(`div5-${left}-${right}`), signature: `div5-${left}-${right}`, type: 'calculation', skillId,
    operation: 'divide', left, right, instruction: 'Chọn thương đúng của phép chia.',
    answers: numberAnswers(quotient, 0, 99999, [1, -1, 10, -10, 100, -100, 1000, -1000]), correctAnswer: quotient,
    hintSteps: ['Chia lần lượt từ hàng cao nhất sang hàng thấp nhất.', 'Sau mỗi lượt: chia, nhân, rồi trừ.', `${formatNumber(left)} : ${right} = ${formatNumber(quotient)}.`],
    explanation: `${formatNumber(left)} : ${right} = ${formatNumber(quotient)}. Có thể kiểm tra bằng ${formatNumber(quotient)} × ${right} = ${formatNumber(left)}.`,
  };
}

function largeWordProblem(): ContextQuestion {
  const multiply = Math.random() < 0.55;
  if (multiply) {
    const contexts = [
      ['📚', 'Kho sách của trường', 'Mỗi giá có', 'quyển sách'],
      ['🌱', 'Vườn cây giống', 'Mỗi khu có', 'cây giống'],
      ['🎟️', 'Ngày hội thiếu nhi', 'Mỗi buổi phát', 'vé'],
    ] as const;
    const [icon, title, line, unit] = pick(contexts);
    const groups = ri(2, 7);
    const each = ri(10000, Math.floor(95000 / groups));
    const correct = groups * each;
    return {
      id: qid(`story-mul-${groups}-${each}`), signature: `story-mul-${groups}-${each}`, type: 'context', skillId: 'large-number-word-problems',
      icon, visualTitle: title, visualLines: [`${groups} nhóm bằng nhau`, `${line} ${formatNumber(each)} ${unit}`],
      instruction: `Có ${groups} nhóm, mỗi nhóm có ${formatNumber(each)} ${unit}. Có tất cả bao nhiêu ${unit}?`,
      answers: numberAnswers(correct), correctAnswer: correct, answerUnit: unit,
      hintSteps: ['Các nhóm có số lượng bằng nhau nên dùng phép nhân.', `Lấy ${formatNumber(each)} nhân với ${groups}.`, `${formatNumber(each)} × ${groups} = ${formatNumber(correct)}.`],
      explanation: `Có tất cả ${formatNumber(each)} × ${groups} = ${formatNumber(correct)} ${unit}.`,
    };
  }
  const contexts = [
    ['📦', 'Chia đều hàng cứu trợ', 'thùng hàng'],
    ['✏️', 'Chia đồ dùng học tập', 'bút chì'],
    ['🍊', 'Đóng đều các túi quà', 'quả cam'],
  ] as const;
  const [icon, title, unit] = pick(contexts);
  const groups = ri(2, 9);
  const each = ri(1200, Math.floor(90000 / groups));
  const total = groups * each;
  return {
    id: qid(`story-div-${total}-${groups}`), signature: `story-div-${total}-${groups}`, type: 'context', skillId: 'large-number-word-problems',
    icon, visualTitle: title, visualLines: [`${formatNumber(total)} ${unit}`, `Chia đều vào ${groups} nhóm`],
    instruction: `Có ${formatNumber(total)} ${unit} chia đều vào ${groups} nhóm. Mỗi nhóm có bao nhiêu ${unit}?`,
    answers: numberAnswers(each), correctAnswer: each, answerUnit: unit,
    hintSteps: ['Chia đều vào các nhóm nên dùng phép chia.', `Lấy ${formatNumber(total)} chia cho ${groups}.`, `${formatNumber(total)} : ${groups} = ${formatNumber(each)}.`],
    explanation: `Mỗi nhóm có ${formatNumber(total)} : ${groups} = ${formatNumber(each)} ${unit}.`,
  };
}

const DATA_SETS = [
  { title: 'Số cuốn sách các tổ quyên góp', labels: ['Tổ 1', 'Tổ 2', 'Tổ 3', 'Tổ 4'], icons: ['📘', '📗', '📕', '📙'] },
  { title: 'Số cây các lớp trồng được', labels: ['Lớp 3A', 'Lớp 3B', 'Lớp 3C', 'Lớp 3D'], icons: ['🌳', '🌲', '🌴', '🌿'] },
  { title: 'Số huy hiệu trong bốn trò chơi', labels: ['Ném vòng', 'Chạy tiếp sức', 'Cờ vua', 'Đố vui'], icons: ['⭕', '🏃', '♟️', '💡'] },
] as const;

function dataTableQuestion(skillId: Grade3Stage6SkillId = 'read-data-table-grade-3'): DataTableQuestion {
  const data = pick(DATA_SETS);
  const values = distinctValues(data.labels.length, 4, 18);
  const mode = pick(['total', 'max', 'difference'] as const);
  let instruction: string;
  let correctAnswer: Grade3Stage6Answer;
  let answers: Grade3Stage6Answer[];
  let hints: [string, string, string];
  let explanation: string;
  if (mode === 'max') {
    const maxIndex = values.indexOf(Math.max(...values));
    correctAnswer = data.labels[maxIndex];
    instruction = 'Nhóm nào có số lượng nhiều nhất?';
    answers = shuffle([...data.labels]);
    hints = ['Đọc số liệu của từng hàng.', 'So sánh các số trong cột số lượng.', `${data.labels[maxIndex]} có ${values[maxIndex]}, là số lớn nhất.`];
    explanation = `${data.labels[maxIndex]} nhiều nhất với ${values[maxIndex]}.`;
  } else if (mode === 'difference') {
    const max = Math.max(...values); const min = Math.min(...values); const correct = max - min;
    correctAnswer = correct; instruction = 'Số lớn nhất nhiều hơn số nhỏ nhất bao nhiêu?';
    answers = numberAnswers(correct, 0, 30, [1, -1, 2, -2, 3, -3, 5, -5]);
    hints = ['Tìm số lớn nhất và số nhỏ nhất trong bảng.', `Số lớn nhất là ${max}, số nhỏ nhất là ${min}.`, `${max} − ${min} = ${correct}.`];
    explanation = `Số lớn nhất nhiều hơn số nhỏ nhất ${max} − ${min} = ${correct}.`;
  } else {
    const correct = values.reduce((sum, value) => sum + value, 0);
    correctAnswer = correct; instruction = 'Tổng số lượng của cả bốn nhóm là bao nhiêu?';
    answers = numberAnswers(correct, 0, 100, [1, -1, 2, -2, 5, -5, 10, -10]);
    hints = ['Đọc đủ bốn số liệu trong bảng.', 'Cộng lần lượt số lượng của các nhóm.', `${values.join(' + ')} = ${correct}.`];
    explanation = `Tổng số lượng là ${values.join(' + ')} = ${correct}.`;
  }
  const signature = `table-${mode}-${values.join('-')}-${data.labels[0]}`;
  return { id: qid(signature), signature, type: 'data-table', skillId, title: data.title, labels: [...data.labels], icons: [...data.icons], values, instruction, answers, correctAnswer, hintSteps: hints, explanation };
}

function collectDataQuestion(): DataTableQuestion {
  const data = pick(DATA_SETS);
  const values = data.labels.map(() => ri(3, 15));
  const target = ri(0, 3);
  const correct = values[target];
  const signature = `collect-${target}-${values.join('-')}-${data.labels[0]}`;
  return {
    id: qid(signature), signature, type: 'data-table', skillId: 'collect-record-data-grade-3', title: data.title,
    labels: [...data.labels], icons: [...data.icons], values,
    instruction: `${data.labels[target]} có số lượng bao nhiêu?`, answers: numberAnswers(correct, 0, 30, [1, -1, 2, -2, 3, -3, 5, -5]), correctAnswer: correct,
    hintSteps: ['Tìm đúng hàng mang tên nhóm được hỏi.', 'Đọc số ở cột số lượng trên cùng hàng.', `${data.labels[target]} có ${correct}.`],
    explanation: `Tra đúng hàng trong bảng: ${data.labels[target]} có ${correct}.`,
  };
}

function probabilityQuestion(skillId: Grade3Stage6SkillId = 'event-likelihood-grade-3'): ProbabilityQuestion {
  const variants = [
    { icon: '🎲', title: 'Gieo một con xúc xắc', text: 'Các mặt mang số từ 1 đến 6', event: 'Xuất hiện số 7', answer: 'Không thể' },
    { icon: '🎲', title: 'Gieo một con xúc xắc', text: 'Các mặt mang số từ 1 đến 6', event: 'Xuất hiện một số chẵn', answer: 'Có thể' },
    { icon: '🎲', title: 'Gieo một con xúc xắc', text: 'Các mặt mang số từ 1 đến 6', event: 'Xuất hiện số nhỏ hơn 7', answer: 'Chắc chắn' },
    { icon: '🔴', title: 'Túi chỉ có bi đỏ', text: 'Trong túi có 8 viên bi và tất cả đều màu đỏ', event: 'Lấy được một viên bi đỏ', answer: 'Chắc chắn' },
    { icon: '🔵', title: 'Túi chỉ có bi đỏ', text: 'Trong túi có 8 viên bi và tất cả đều màu đỏ', event: 'Lấy được một viên bi xanh', answer: 'Không thể' },
    { icon: '🎡', title: 'Vòng quay hai màu', text: 'Vòng quay có cả ô màu vàng và ô màu xanh', event: 'Kim dừng ở ô màu xanh', answer: 'Có thể' },
  ] as const;
  const variant = pick(variants);
  const signature = `prob-${variants.indexOf(variant)}`;
  return {
    id: qid(signature), signature, type: 'probability', skillId, icon: variant.icon, sceneTitle: variant.title, sceneText: variant.text,
    instruction: `Sự kiện “${variant.event}” là chắc chắn, có thể hay không thể?`,
    answers: shuffle(['Chắc chắn', 'Có thể', 'Không thể']), correctAnswer: variant.answer,
    hintSteps: ['Xem tất cả kết quả có thể xảy ra.', `Dựa vào dữ kiện: ${variant.text.toLowerCase()}.`, `Sự kiện này là “${variant.answer.toLowerCase()}”.`],
    explanation: `${variant.event}: ${variant.answer.toLowerCase()}.`,
  };
}

function finalNumberQuestion(): NumberQuestion {
  const mode = pick(['round', 'compare', 'place-value'] as const);
  const value = ri(10000, 99999);
  if (mode === 'round') {
    const unit = pick([1000, 10000] as const);
    const correct = Math.round(value / unit) * unit;
    return { id: qid(`final-round-${value}-${unit}`), signature: `final-round-${value}-${unit}`, type: 'number', skillId: 'final-numbers-100000', value, mode, instruction: `Làm tròn ${formatNumber(value)} đến hàng ${unit === 1000 ? 'nghìn' : 'chục nghìn'}.`, answers: numberAnswers(correct), correctAnswer: correct, hintSteps: [`Quan sát chữ số ngay bên phải hàng ${unit === 1000 ? 'nghìn' : 'chục nghìn'}.`, 'Từ 5 trở lên thì làm tròn lên; nhỏ hơn 5 thì làm tròn xuống.', `Kết quả là ${formatNumber(correct)}.`], explanation: `${formatNumber(value)} làm tròn được ${formatNumber(correct)}.` };
  }
  if (mode === 'compare') {
    const secondValue = Math.max(10000, Math.min(99999, value + pick([-1000, -100, -10, 0, 10, 100, 1000])));
    const correct = value < secondValue ? '<' : value > secondValue ? '>' : '=';
    return { id: qid(`final-compare-${value}-${secondValue}`), signature: `final-compare-${value}-${secondValue}`, type: 'number', skillId: 'final-numbers-100000', value, secondValue, mode, instruction: 'Chọn dấu so sánh thích hợp.', answers: shuffle(['<', '>', '=']), correctAnswer: correct, hintSteps: ['So sánh số chữ số, rồi so từ hàng cao nhất.', 'Nếu một hàng bằng nhau, tiếp tục sang hàng bên phải.', `${formatNumber(value)} ${correct} ${formatNumber(secondValue)}.`], explanation: `${formatNumber(value)} ${correct} ${formatNumber(secondValue)}.` };
  }
  const place = ri(0, 4); const digits = String(value).split('').map(Number); const placeValues = [10000, 1000, 100, 10, 1]; const placeNames = ['hàng chục nghìn', 'hàng nghìn', 'hàng trăm', 'hàng chục', 'hàng đơn vị']; const correct = digits[place] * placeValues[place];
  return { id: qid(`final-place-${value}-${place}`), signature: `final-place-${value}-${place}`, type: 'number', skillId: 'final-numbers-100000', value, mode, highlightedPlace: placeNames[place], instruction: `Chữ số ${digits[place]} ở ${placeNames[place]} có giá trị bao nhiêu?`, answers: numberAnswers(correct, 0, 90000), correctAnswer: correct, hintSteps: [`Chữ số đang xét ở ${placeNames[place]}.`, `Giá trị của hàng là ${formatNumber(placeValues[place])}.`, `${digits[place]} × ${formatNumber(placeValues[place])} = ${formatNumber(correct)}.`], explanation: `Chữ số ${digits[place]} có giá trị ${formatNumber(correct)}.` };
}

function finalAddSubtract(): CalculationQuestion {
  const operation = Math.random() < 0.5 ? 'add' : 'subtract';
  let left: number; let right: number; let correct: number;
  if (operation === 'add') { left = ri(10000, 80000); right = ri(5000, 99999 - left); correct = left + right; }
  else { left = ri(20000, 99999); right = ri(5000, left - 1); correct = left - right; }
  const symbol = operation === 'add' ? '+' : '−';
  return { id: qid(`final-${operation}-${left}-${right}`), signature: `final-${operation}-${left}-${right}`, type: 'calculation', skillId: 'final-add-subtract-grade-3', operation, left, right, instruction: `Tính ${operation === 'add' ? 'tổng' : 'hiệu'} rồi chọn đáp án đúng.`, answers: numberAnswers(correct), correctAnswer: correct, hintSteps: ['Đặt các chữ số cùng hàng thẳng cột.', 'Tính từ hàng đơn vị sang trái.', `${formatNumber(left)} ${symbol} ${formatNumber(right)} = ${formatNumber(correct)}.`], explanation: `${formatNumber(left)} ${symbol} ${formatNumber(right)} = ${formatNumber(correct)}.` };
}

function finalGeometry(): GeometryQuestion {
  const shape = Math.random() < 0.5 ? 'rectangle' : 'square';
  const task = Math.random() < 0.55 ? 'area' : 'perimeter';
  const width = ri(3, 12); const height = shape === 'square' ? width : ri(2, 9);
  const correct = task === 'area' ? width * height : 2 * (width + height);
  const shapeName = shape === 'square' ? 'hình vuông' : 'hình chữ nhật';
  const formula = task === 'area' ? `${width} × ${height}` : `(${width} + ${height}) × 2`;
  return { id: qid(`final-geo-${shape}-${task}-${width}-${height}`), signature: `final-geo-${shape}-${task}-${width}-${height}`, type: 'geometry', skillId: 'final-geometry-measurement-grade-3', shape, width, height, task, unit: 'cm', instruction: `${task === 'area' ? 'Diện tích' : 'Chu vi'} ${shapeName} bằng bao nhiêu?`, answers: numberAnswers(correct, 1, 300, [1, -1, 2, -2, 4, -4, 10, -10]), correctAnswer: correct, answerUnit: task === 'area' ? 'cm²' : 'cm', hintSteps: [task === 'area' ? 'Diện tích bằng chiều dài nhân chiều rộng.' : 'Chu vi bằng tổng độ dài các cạnh.', `Thay số vào công thức: ${formula}.`, `${formula} = ${correct} ${task === 'area' ? 'cm²' : 'cm'}.`], explanation: `${task === 'area' ? 'Diện tích' : 'Chu vi'} là ${formula} = ${correct} ${task === 'area' ? 'cm²' : 'cm'}.` };
}

function finalMeasure(): MeasureQuestion {
  const convertToMillimeter = Math.random() < 0.5;
  const value = ri(2, 25);
  const correct = convertToMillimeter ? value * 10 : value * 1000;
  const fromUnit = convertToMillimeter ? 'cm' : 'kg';
  const toUnit = convertToMillimeter ? 'mm' : 'g';
  return { id: qid(`final-measure-${value}-${fromUnit}`), signature: `final-measure-${value}-${fromUnit}`, type: 'measure', skillId: 'final-geometry-measurement-grade-3', icon: convertToMillimeter ? '📏' : '⚖️', value, fromUnit, toUnit, instruction: `${value} ${fromUnit} bằng bao nhiêu ${toUnit}?`, answers: numberAnswers(correct, 0, 30000, convertToMillimeter ? [10, -10, 20, -20, 100, -100] : [100, -100, 1000, -1000, 2000, -2000]), correctAnswer: correct, answerUnit: toUnit, hintSteps: [convertToMillimeter ? '1 cm = 10 mm.' : '1 kg = 1 000 g.', `Lấy ${value} nhân với ${convertToMillimeter ? 10 : '1 000'}.`, `${value} ${fromUnit} = ${formatNumber(correct)} ${toUnit}.`], explanation: `${value} ${fromUnit} = ${formatNumber(correct)} ${toUnit}.` };
}

type Factory = () => Grade3Stage6Question;

function unique(plan: Factory[], total: 5 | 10 | 15) {
  const result: Grade3Stage6Question[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  while (result.length < total && attempts < total * 100) {
    const question = plan[result.length % plan.length]();
    attempts += 1;
    if (seen.has(question.signature)) continue;
    seen.add(question.signature);
    result.push(question);
  }
  return shuffle(result);
}

export function generateGrade3Stage6Questions(module: Grade3Stage6Module, total: 5 | 10 | 15 = 10) {
  const plans: Record<Grade3Stage6Module, Factory[]> = {
    multiplyDivide100000: [multiplicationQuestion, divisionQuestion, largeWordProblem, multiplicationQuestion, () => Math.random() < 0.5 ? divisionQuestion() : largeWordProblem()],
    statisticsProbability: [collectDataQuestion, dataTableQuestion, probabilityQuestion, dataTableQuestion, () => Math.random() < 0.5 ? collectDataQuestion() : probabilityQuestion()],
    finalReview: [finalNumberQuestion, finalAddSubtract, () => Math.random() < 0.5 ? multiplicationQuestion('final-multiply-divide-grade-3') : divisionQuestion('final-multiply-divide-grade-3'), () => Math.random() < 0.55 ? finalGeometry() : finalMeasure(), () => Math.random() < 0.5 ? dataTableQuestion('final-data-probability-grade-3') : probabilityQuestion('final-data-probability-grade-3')],
  };
  return unique(plans[module], total);
}
