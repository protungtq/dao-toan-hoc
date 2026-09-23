export type Grade3Stage3Module = 'multiply1000' | 'semester1';
export type Grade3Stage3SkillId =
  | 'multiply-three-by-one' | 'divide-three-by-one' | 'numerical-expressions' | 'times-comparison'
  | 'semester-1-multiply-divide' | 'semester-1-expressions' | 'semester-1-geometry-measurement' | 'semester-1-mixed-problems';
export type Grade3Stage3Answer = number | string;

export const GRADE3_STAGE3_SKILL_LABELS: Record<Grade3Stage3SkillId, string> = {
  'multiply-three-by-one': 'Nhân số có ba chữ số', 'divide-three-by-one': 'Chia số có ba chữ số',
  'numerical-expressions': 'Biểu thức số', 'times-comparison': 'So sánh gấp mấy lần',
  'semester-1-multiply-divide': 'Ôn phép nhân và phép chia', 'semester-1-expressions': 'Ôn biểu thức số',
  'semester-1-geometry-measurement': 'Ôn hình học và đo lường', 'semester-1-mixed-problems': 'Bài toán tổng hợp',
};

type Base = { id: string; signature: string; skillId: Grade3Stage3SkillId; instruction: string; answers: Grade3Stage3Answer[]; correctAnswer: Grade3Stage3Answer; hintSteps: [string, string, string]; explanation: string };
export type CalculationQuestion = Base & { type: 'calculation'; operation: 'multiply' | 'divide'; left: number; right: number; remainder?: number };
export type ExpressionQuestion = Base & { type: 'expression'; expression: string; steps: string[] };
export type BarsQuestion = Base & { type: 'bars'; small: number; large: number; times: number; labels: [string, string] };
export type ContextQuestion = Base & { type: 'context'; icon: string; visualTitle: string; visualText: string };
export type DiagramQuestion = Base & { type: 'diagram'; diagram: 'right-angle' | 'circle' | 'rectangle' | 'cube'; highlight: string };
export type MeasureQuestion = Base & { type: 'measure'; measure: 'length' | 'mass' | 'capacity' | 'temperature'; value: number; unit: string; icon: string };
export type Grade3Stage3Question = CalculationQuestion | ExpressionQuestion | BarsQuestion | ContextQuestion | DiagramQuestion | MeasureQuestion;

const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: readonly T[]): T => items[ri(0, items.length - 1)];
function shuffle<T>(items: readonly T[]) { const result = [...items]; for (let i = result.length - 1; i > 0; i--) { const j = ri(0, i); [result[i], result[j]] = [result[j], result[i]]; } return result; }
const qid = (signature: string) => `${signature}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
function numberAnswers(correct: number, min = 0, max = 2000, steps = [1, -1, 2, -2, 10, -10, 100, -100]) { const values = new Set([correct]); for (const step of shuffle(steps)) { const value = correct + step; if (value >= min && value <= max) values.add(value); if (values.size === 4) break; } while (values.size < 4) values.add(ri(min, max)); return shuffle([...values]); }

function calculation(skillId: Grade3Stage3SkillId, operation: 'multiply' | 'divide', left: number, right: number, correct: number, signature: string, remainder?: number): CalculationQuestion {
  const answer = remainder === undefined || remainder === 0 ? correct : `${correct} dư ${remainder}`;
  const alternatives: Grade3Stage3Answer[] = typeof answer === 'number'
    ? numberAnswers(answer, 0, 1000)
    : shuffle([answer, `${correct + 1} dư ${remainder}`, `${correct} dư ${Math.max(0, remainder - 1)}`, `${Math.max(0, correct - 1)} dư ${remainder}`]);
  const equation = operation === 'multiply' ? `${left} × ${right} = ${correct}` : `${left} : ${right} = ${correct}${remainder ? ` dư ${remainder}` : ''}`;
  return { id: qid(signature), signature, type: 'calculation', skillId, operation, left, right, remainder, instruction: operation === 'multiply' ? 'Đặt tính rồi chọn tích đúng.' : 'Thực hiện phép chia rồi chọn kết quả đúng.', answers: alternatives, correctAnswer: answer, hintSteps: [operation === 'multiply' ? 'Nhân lần lượt từ hàng đơn vị.' : 'Chia lần lượt từ hàng trăm sang hàng đơn vị.', operation === 'multiply' ? `Nhân ${left} với ${right}.` : `Tìm số lớn nhất nhân với ${right} không vượt quá ${left}.`, equation], explanation: equation + '.' };
}

function multiplyThreeDigit(skillId: Grade3Stage3SkillId = 'multiply-three-by-one'): CalculationQuestion {
  const multiplier = ri(2, 9), number = ri(100, Math.floor(999 / multiplier)), correct = number * multiplier;
  return calculation(skillId, 'multiply', number, multiplier, correct, `multiply-${skillId}-${number}-${multiplier}`);
}

function divideThreeDigit(skillId: Grade3Stage3SkillId = 'divide-three-by-one'): CalculationQuestion {
  const divisor = ri(2, 9), allowRemainder = Math.random() < 0.35;
  let quotient = ri(Math.ceil(100 / divisor), Math.floor(990 / divisor)), remainder = allowRemainder ? ri(1, divisor - 1) : 0;
  let dividend = divisor * quotient + remainder;
  if (dividend > 999) { quotient -= 1; dividend = divisor * quotient + remainder; }
  return calculation(skillId, 'divide', dividend, divisor, quotient, `divide-${skillId}-${dividend}-${divisor}`, remainder);
}

function expressionQuestion(skillId: Grade3Stage3SkillId = 'numerical-expressions'): ExpressionQuestion {
  const mode = pick(['multiply-first', 'parentheses', 'left-to-right', 'divide-first'] as const);
  let shown = '', correct = 0, steps: string[] = [], signature = '';
  if (mode === 'multiply-first') { const a = ri(20, 200), b = ri(2, 9), c = ri(2, 9), product = b * c; shown = `${a} + ${b} × ${c}`; correct = a + product; steps = [`${b} × ${c} = ${product}`, `${a} + ${product} = ${correct}`]; signature = `expr-mf-${a}-${b}-${c}`; }
  else if (mode === 'parentheses') { const a = ri(10, 90), b = ri(5, 50), c = ri(2, 5), subtotal = a + b; shown = `(${a} + ${b}) × ${c}`; correct = subtotal * c; steps = [`${a} + ${b} = ${subtotal}`, `${subtotal} × ${c} = ${correct}`]; signature = `expr-paren-${a}-${b}-${c}`; }
  else if (mode === 'left-to-right') { const a = ri(200, 700), b = ri(20, 150), c = ri(10, 100), subtotal = a - b; shown = `${a} − ${b} + ${c}`; correct = subtotal + c; steps = [`${a} − ${b} = ${subtotal}`, `${subtotal} + ${c} = ${correct}`]; signature = `expr-ltr-${a}-${b}-${c}`; }
  else { const divisor = ri(2, 9), quotient = ri(2, 20), divided = divisor * quotient, a = ri(divided + 20, 300); shown = `${a} − ${divided} : ${divisor}`; correct = a - quotient; steps = [`${divided} : ${divisor} = ${quotient}`, `${a} − ${quotient} = ${correct}`]; signature = `expr-df-${a}-${divided}-${divisor}`; }
  return { id: qid(signature), signature: `${skillId}-${signature}`, type: 'expression', skillId, expression: shown, steps, instruction: 'Giá trị của biểu thức bằng bao nhiêu?', answers: numberAnswers(correct, 0, 1500), correctAnswer: correct, hintSteps: ['Nhìn xem biểu thức có dấu ngoặc hoặc phép nhân, chia không.', `Thực hiện bước đầu: ${steps[0]}.`, `${steps.join('; ')}.`], explanation: `${steps.join('; ')}.` };
}

function comparisonQuestion(): BarsQuestion {
  const small = ri(2, 40), times = ri(2, 9), large = small * times;
  const labels = pick([['Rổ nhỏ', 'Rổ lớn'], ['Đội A', 'Đội B'], ['Đoạn ngắn', 'Đoạn dài']] as const), signature = `compare-times-${small}-${large}-${labels[0]}`;
  return { id: qid(signature), signature, type: 'bars', skillId: 'times-comparison', small, large, times, labels: [...labels], instruction: `${large} gấp mấy lần ${small}?`, answers: numberAnswers(times, 1, 12, [1, -1, 2, -2]), correctAnswer: times, hintSteps: ['Muốn biết số lớn gấp mấy lần số bé, dùng phép chia.', `Lấy ${large} chia cho ${small}.`, `${large} : ${small} = ${times}.`], explanation: `${large} : ${small} = ${times}, nên ${large} gấp ${times} lần ${small}.` };
}

function reviewGeometryMeasurement(): DiagramQuestion | MeasureQuestion {
  const variant = pick(['right-angle', 'circle', 'rectangle', 'cube', 'length', 'mass', 'capacity', 'temperature'] as const);
  if (variant === 'right-angle') return { id: qid('review-right-angle'), signature: 'review-right-angle', type: 'diagram', skillId: 'semester-1-geometry-measurement', diagram: 'right-angle', highlight: 'góc A', instruction: 'Góc được đánh dấu là góc gì?', answers: shuffle(['Góc vuông', 'Góc không vuông']), correctAnswer: 'Góc vuông', hintSteps: ['So sánh với góc tờ giấy hình chữ nhật.', 'Dấu ô vuông nhỏ biểu thị góc vuông.', 'Đây là góc vuông.'], explanation: 'Dấu ô vuông nhỏ cho biết đây là góc vuông.' };
  if (variant === 'circle') return { id: qid('review-circle-radius'), signature: 'review-circle-radius', type: 'diagram', skillId: 'semester-1-geometry-measurement', diagram: 'circle', highlight: 'OA', instruction: 'Đoạn OA nối tâm với đường tròn gọi là gì?', answers: shuffle(['Bán kính', 'Đường kính', 'Cạnh', 'Góc']), correctAnswer: 'Bán kính', hintSteps: ['O là tâm hình tròn.', 'Đoạn nối tâm với một điểm trên đường tròn là bán kính.', 'OA là bán kính.'], explanation: 'OA nối tâm O với đường tròn nên là bán kính.' };
  if (variant === 'rectangle') return { id: qid('review-rectangle'), signature: 'review-rectangle', type: 'diagram', skillId: 'semester-1-geometry-measurement', diagram: 'rectangle', highlight: 'bốn góc', instruction: 'Hình chữ nhật có bao nhiêu góc vuông?', answers: shuffle([2, 3, 4, 6]), correctAnswer: 4, hintSteps: ['Quan sát bốn góc của hình.', 'Mỗi góc đều là góc vuông.', 'Hình chữ nhật có 4 góc vuông.'], explanation: 'Hình chữ nhật có 4 góc vuông.' };
  if (variant === 'cube') return { id: qid('review-cube'), signature: 'review-cube', type: 'diagram', skillId: 'semester-1-geometry-measurement', diagram: 'cube', highlight: 'các mặt', instruction: 'Khối lập phương có bao nhiêu mặt?', answers: shuffle([4, 5, 6, 8]), correctAnswer: 6, hintSteps: ['Hình dung một con xúc xắc.', 'Đếm mặt trên, dưới và bốn mặt xung quanh.', 'Khối lập phương có 6 mặt.'], explanation: 'Khối lập phương có 6 mặt.' };
  const measureData = {
    length: { value: ri(1, 9) * 10, unit: 'mm', icon: '📏', question: 'Đoạn thẳng dài bao nhiêu mi-li-mét?' },
    mass: { value: ri(1, 9) * 100, unit: 'g', icon: '⚖️', question: 'Cân chỉ bao nhiêu gam?' },
    capacity: { value: ri(1, 9) * 100, unit: 'ml', icon: '🧪', question: 'Bình có bao nhiêu mi-li-lít nước?' },
    temperature: { value: ri(2, 8) * 5, unit: '°C', icon: '🌡️', question: 'Nhiệt kế chỉ bao nhiêu độ C?' },
  } as const;
  const data = measureData[variant], signature = `review-measure-${variant}-${data.value}`;
  return { id: qid(signature), signature, type: 'measure', skillId: 'semester-1-geometry-measurement', measure: variant, value: data.value, unit: data.unit, icon: data.icon, instruction: data.question, answers: numberAnswers(data.value, 0, 1000, variant === 'temperature' ? [5, -5, 10, -10] : [10, -10, 100, -100]), correctAnswer: data.value, hintSteps: ['Quan sát đơn vị và vạch chia.', `Đọc giá trị theo đơn vị ${data.unit}.`, `Giá trị là ${data.value} ${data.unit}.`], explanation: `Kết quả là ${data.value} ${data.unit}.` };
}

function reviewMixedProblem(): ContextQuestion {
  const mode = pick(['boxes', 'remaining', 'comparison'] as const), groups = ri(2, 6), each = ri(5, 12), extra = ri(2, 15), subtotal = groups * each;
  if (mode === 'comparison') { const times = ri(2, 5), small = ri(4, 15), large = small * times, correct = large - small, signature = `mixed-comparison-${small}-${times}`; return { id: qid(signature), signature, type: 'context', skillId: 'semester-1-mixed-problems', icon: '📚', visualTitle: `Ngăn trên: ${small} quyển`, visualText: `Ngăn dưới gấp ${times} lần ngăn trên`, instruction: 'Ngăn dưới nhiều hơn ngăn trên bao nhiêu quyển sách?', answers: numberAnswers(correct, 0, 100), correctAnswer: correct, hintSteps: [`Tính số sách ngăn dưới: ${small} × ${times}.`, 'Lấy số sách ngăn dưới trừ số sách ngăn trên.', `${small} × ${times} = ${large}; ${large} − ${small} = ${correct}.`], explanation: `Ngăn dưới có ${large} quyển; nhiều hơn ${large} − ${small} = ${correct} quyển.` }; }
  const add = mode === 'boxes', correct = add ? subtotal + extra : subtotal - extra, signature = `mixed-${mode}-${groups}-${each}-${extra}`;
  return { id: qid(signature), signature, type: 'context', skillId: 'semester-1-mixed-problems', icon: add ? '🎁' : '🍊', visualTitle: `${groups} nhóm × ${each}`, visualText: add ? `Thêm ${extra}` : `Bớt ${extra}`, instruction: add ? `Có ${groups} hộp, mỗi hộp ${each} món quà, rồi thêm ${extra} món. Có tất cả bao nhiêu?` : `Có ${groups} túi, mỗi túi ${each} quả, đã dùng ${extra} quả. Còn lại bao nhiêu?`, answers: numberAnswers(correct, 0, 150), correctAnswer: correct, hintSteps: [`Bước 1: tính ${groups} × ${each}.`, `Bước 2: ${add ? 'cộng' : 'trừ'} ${extra}.`, `${groups} × ${each} = ${subtotal}; ${subtotal} ${add ? '+' : '−'} ${extra} = ${correct}.`], explanation: `${groups} × ${each} = ${subtotal}; ${subtotal} ${add ? '+' : '−'} ${extra} = ${correct}.` };
}

function reviewArithmetic() { return Math.random() < 0.5 ? multiplyThreeDigit('semester-1-multiply-divide') : divideThreeDigit('semester-1-multiply-divide'); }
type Factory = () => Grade3Stage3Question;
function unique(plan: Factory[], total: 5 | 10 | 15) { const result: Grade3Stage3Question[] = [], seen = new Set<string>(); let attempts = 0; while (result.length < total && attempts < total * 50) { const question = plan[result.length % plan.length](); attempts++; if (seen.has(question.signature)) continue; seen.add(question.signature); result.push(question); } return shuffle(result); }
export function generateGrade3Stage3Questions(module: Grade3Stage3Module, total: 5 | 10 | 15 = 10) {
  const plans: Record<Grade3Stage3Module, Factory[]> = {
    multiply1000: [multiplyThreeDigit, divideThreeDigit, expressionQuestion, comparisonQuestion, () => Math.random() < 0.5 ? multiplyThreeDigit() : divideThreeDigit()],
    semester1: [reviewArithmetic, () => expressionQuestion('semester-1-expressions'), reviewGeometryMeasurement, reviewMixedProblem, () => Math.random() < 0.5 ? reviewArithmetic() : reviewGeometryMeasurement()],
  };
  return unique(plans[module], total);
}
