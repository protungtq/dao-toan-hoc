export type FinalReviewSkillId =
  | 'final-review-numbers'
  | 'final-review-calculation'
  | 'final-review-word-problems'
  | 'final-review-geometry'
  | 'final-review-measurement';

export type FinalReviewAnswer = number | string;
export const FINAL_REVIEW_SKILL_LABELS: Record<FinalReviewSkillId, string> = {
  'final-review-numbers': 'Ôn tập số',
  'final-review-calculation': 'Ôn tập phép tính',
  'final-review-word-problems': 'Ôn tập bài toán',
  'final-review-geometry': 'Ôn tập hình học',
  'final-review-measurement': 'Ôn tập đo lường',
};

type Base = { id: string; skillId: FinalReviewSkillId; instruction: string; answers: FinalReviewAnswer[]; correctAnswer: FinalReviewAnswer; hintSteps: [string, string, string]; explanation: string };
export type NumberQuestion = Base & { type: 'number'; mode: 'place-value' | 'compare' | 'sequence'; number?: number; left?: number; right?: number; sequence?: Array<number | null> };
export type CalculationQuestion = Base & { type: 'calculation'; left: number; right: number; operation: 'addition' | 'subtraction'; missing: boolean };
export type WordQuestion = Base & { type: 'word'; story: string; icon: string; left: number; right: number; operation: 'addition' | 'subtraction' };
export type GeometryQuestion = Base & { type: 'geometry'; mode: 'flat' | 'solid' | 'position'; shape?: 'circle' | 'square' | 'triangle' | 'rectangle'; solid?: 'cube' | 'cuboid'; firstIcon?: string; secondIcon?: string; relation?: string };
export type MeasurementQuestion = Base & { type: 'measurement'; mode: 'length' | 'clock' | 'weekday'; value?: number; focusDay?: string };
export type FinalReviewQuestion = NumberQuestion | CalculationQuestion | WordQuestion | GeometryQuestion | MeasurementQuestion;

const WEEKDAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'] as const;
const SHAPES = [{ id: 'circle', label: 'Hình tròn' }, { id: 'square', label: 'Hình vuông' }, { id: 'triangle', label: 'Hình tam giác' }, { id: 'rectangle', label: 'Hình chữ nhật' }] as const;
const OBJECTS = [{ icon: '📚', name: 'quyển sách' }, { icon: '✏️', name: 'chiếc bút chì' }, { icon: '⭐', name: 'hình dán' }, { icon: '🔵', name: 'viên bi' }] as const;
function ri(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function item<T>(items: readonly T[]): T { return items[ri(0, items.length - 1)]; }
function shuffle<T>(items: readonly T[]) { const a = [...items]; for (let i = a.length - 1; i > 0; i -= 1) { const j = ri(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function id(type: string) { return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }
function nums(correct: number) { const s = new Set<number>([correct]); for (const d of [1, -1, 10, -10, 2, -2]) { const v = correct + d; if (v >= 0 && v <= 100) s.add(v); if (s.size === 4) break; } let v = 0; while (s.size < 4) { s.add(v); v += 1; } return shuffle([...s].slice(0, 4)); }

function numberQuestion(): NumberQuestion {
  const mode = item(['place-value', 'compare', 'sequence'] as const);
  if (mode === 'place-value') {
    const number = ri(10, 99), tens = Math.floor(number / 10), ones = number % 10;
    const correct = `${tens} chục và ${ones} đơn vị`;
    const wrong = [`${ones} chục và ${tens} đơn vị`, `${tens + 1} chục và ${ones} đơn vị`, `${tens} chục và ${(ones + 1) % 10} đơn vị`];
    return { id: id('number-place'), type: 'number', skillId: 'final-review-numbers', mode, number, instruction: `Số ${number} gồm mấy chục và mấy đơn vị?`, answers: shuffle([correct, ...wrong.filter((x) => x !== correct)].slice(0, 4)), correctAnswer: correct, hintSteps: ['Chữ số bên trái cho biết số chục.', 'Chữ số bên phải cho biết số đơn vị.', `${number} gồm ${tens} chục và ${ones} đơn vị.`], explanation: `${number} = ${tens} chục và ${ones} đơn vị.` };
  }
  if (mode === 'compare') {
    const left = ri(10, 99), right = Math.random() < 0.2 ? left : ri(10, 99), correct = left > right ? '>' : left < right ? '<' : '=';
    return { id: id('number-compare'), type: 'number', skillId: 'final-review-numbers', mode, left, right, instruction: 'Chọn dấu thích hợp.', answers: shuffle(['<', '=', '>']), correctAnswer: correct, hintSteps: ['So sánh hàng chục trước.', 'Nếu hàng chục bằng nhau, so sánh hàng đơn vị.', `${left} ${correct} ${right}.`], explanation: `${left} ${correct} ${right}.` };
  }
  const start = ri(10, 91), step = item([1, 2] as const), sequence: Array<number | null> = Array.from({ length: 5 }, (_, i) => start + i * step), missingIndex = ri(0, 4), correct = sequence[missingIndex] as number; sequence[missingIndex] = null;
  return { id: id('number-sequence'), type: 'number', skillId: 'final-review-numbers', mode, sequence, instruction: 'Số nào còn thiếu trong dãy?', answers: nums(correct), correctAnswer: correct, hintSteps: ['Quan sát khoảng cách giữa hai số liền nhau.', `Mỗi số tăng thêm ${step}.`, `Số còn thiếu là ${correct}.`], explanation: `Dãy tăng thêm ${step} nên số còn thiếu là ${correct}.` };
}

function operands(operation: 'addition' | 'subtraction') {
  if (operation === 'addition') { const at = ri(1, 8), bt = ri(1, 9 - at), ao = ri(0, 9), bo = ri(0, 9 - ao); return [at * 10 + ao, bt * 10 + bo] as const; }
  const at = ri(2, 9), bt = ri(1, at - 1), ao = ri(0, 9), bo = ri(0, ao); return [at * 10 + ao, bt * 10 + bo] as const;
}
function calculationQuestion(): CalculationQuestion {
  const operation = item(['addition', 'subtraction'] as const), [left, right] = operands(operation), result = operation === 'addition' ? left + right : left - right, sign = operation === 'addition' ? '+' : '−', missing = Math.random() < 0.35;
  return { id: id('calculation'), type: 'calculation', skillId: 'final-review-calculation', left, right, operation, missing, instruction: missing ? 'Tìm số còn thiếu.' : 'Tính kết quả.', answers: nums(missing ? right : result), correctAnswer: missing ? right : result, hintSteps: ['Tính hàng đơn vị trước, hàng chục sau.', missing ? `Tìm số cần ${operation === 'addition' ? 'cộng với' : 'trừ khỏi'} ${left} để được ${result}.` : `Đặt ${left} và ${right} thẳng cột.`, missing ? `Số còn thiếu là ${right}.` : `${left} ${sign} ${right} = ${result}.`], explanation: `${left} ${sign} ${right} = ${result}${missing ? `, nên ô trống là ${right}` : ''}.` };
}

function wordQuestion(): WordQuestion {
  const operation = item(['addition', 'subtraction'] as const), [left, right] = operands(operation), result = operation === 'addition' ? left + right : left - right, object = item(OBJECTS), sign = operation === 'addition' ? '+' : '−';
  const story = operation === 'addition' ? `Lớp 1A có ${left} ${object.name}, lớp 1B có ${right} ${object.name}. Cả hai lớp có tất cả bao nhiêu ${object.name}?` : `Cửa hàng có ${left} ${object.name}, đã bán ${right} ${object.name}. Cửa hàng còn lại bao nhiêu ${object.name}?`;
  return { id: id('word'), type: 'word', skillId: 'final-review-word-problems', story, icon: object.icon, left, right, operation, instruction: 'Đọc bài toán và chọn đáp số.', answers: nums(result), correctAnswer: result, hintSteps: [operation === 'addition' ? '“Tất cả” cho biết cần làm phép cộng.' : '“Đã bán” và “còn lại” cho biết cần làm phép trừ.', `Phép tính là ${left} ${sign} ${right}.`, `${left} ${sign} ${right} = ${result}.`], explanation: `${left} ${sign} ${right} = ${result}. Đáp số: ${result} ${object.name}.` };
}

function geometryQuestion(): GeometryQuestion {
  const mode = item(['flat', 'solid', 'position'] as const);
  if (mode === 'flat') { const shape = item(SHAPES); return { id: id('geo-flat'), type: 'geometry', skillId: 'final-review-geometry', mode, shape: shape.id, instruction: 'Đây là hình gì?', answers: shuffle(SHAPES.map((x) => x.label)), correctAnswer: shape.label, hintSteps: ['Quan sát số cạnh và hình dạng đường bao.', shape.id === 'circle' ? 'Hình này không có cạnh.' : `Hình này có ${shape.id === 'triangle' ? 3 : 4} cạnh.`, `Đây là ${shape.label.toLowerCase()}.`], explanation: `Hình đã cho là ${shape.label.toLowerCase()}.` }; }
  if (mode === 'solid') { const solid = item(['cube', 'cuboid'] as const), correct = solid === 'cube' ? 'Khối lập phương' : 'Khối hộp chữ nhật'; return { id: id('geo-solid'), type: 'geometry', skillId: 'final-review-geometry', mode, solid, instruction: 'Đây là khối gì?', answers: shuffle(['Khối lập phương', 'Khối hộp chữ nhật', 'Hình vuông', 'Hình chữ nhật']), correctAnswer: correct, hintSteps: ['Đây là hình khối, không phải hình phẳng.', solid === 'cube' ? 'Các mặt nhìn thấy giống hình vuông.' : 'Khối có dạng một chiếc hộp dài.', `Đây là ${correct.toLowerCase()}.`], explanation: `Hình đã cho là ${correct.toLowerCase()}.` }; }
  const relation = item(['Bên trái', 'Bên phải', 'Phía trên', 'Phía dưới'] as const), horizontal = relation.includes('trái') || relation.includes('phải');
  return { id: id('geo-position'), type: 'geometry', skillId: 'final-review-geometry', mode, firstIcon: '🐿️', secondIcon: '🌳', relation, instruction: `Sóc Nâu ở vị trí nào so với cây?`, answers: shuffle(['Bên trái', 'Bên phải', 'Phía trên', 'Phía dưới']), correctAnswer: relation, hintSteps: ['Lấy cây làm vật mốc.', horizontal ? 'Quan sát phía trái và phía phải.' : 'Quan sát phía trên và phía dưới.', `Sóc Nâu ở ${relation.toLowerCase()} cây.`], explanation: `Sóc Nâu ở ${relation.toLowerCase()} cây.` };
}

function measurementQuestion(): MeasurementQuestion {
  const mode = item(['length', 'clock', 'weekday'] as const);
  if (mode === 'length') { const value = ri(2, 10); return { id: id('measure-length'), type: 'measurement', skillId: 'final-review-measurement', mode, value, instruction: 'Đoạn màu dài bao nhiêu xăng-ti-mét?', answers: nums(value), correctAnswer: value, hintSteps: ['Đoạn màu bắt đầu ở vạch 0.', 'Nhìn số tại điểm cuối đoạn màu.', `Đoạn màu dài ${value} cm.`], explanation: `Đoạn từ vạch 0 đến vạch ${value} dài ${value} cm.` }; }
  if (mode === 'clock') { const value = ri(1, 12); return { id: id('measure-clock'), type: 'measurement', skillId: 'final-review-measurement', mode, value, instruction: 'Đồng hồ chỉ mấy giờ?', answers: shuffle([value, value % 12 + 1, (value + 10) % 12 + 1, (value + 1) % 12 + 1]).map((x) => `${x} giờ`), correctAnswer: `${value} giờ`, hintSteps: ['Kim dài chỉ số 12 nên đây là giờ đúng.', 'Nhìn kim ngắn đang chỉ số nào.', `Đồng hồ chỉ ${value} giờ.`], explanation: `Kim phút chỉ 12, kim giờ chỉ ${value}, nên đồng hồ chỉ ${value} giờ.` }; }
  const index = ri(0, 6), focusDay = WEEKDAYS[index], correct = WEEKDAYS[(index + 1) % 7];
  return { id: id('measure-weekday'), type: 'measurement', skillId: 'final-review-measurement', mode, focusDay, instruction: `Ngày liền sau ${focusDay} là ngày nào?`, answers: shuffle([correct, ...shuffle(WEEKDAYS.filter((d) => d !== correct)).slice(0, 3)]), correctAnswer: correct, hintSteps: ['Đọc lần lượt các ngày trong tuần.', `Tìm ngày đứng ngay sau ${focusDay}.`, `Đáp án là ${correct}.`], explanation: `${correct} là ngày liền sau ${focusDay}.` };
}

type Factory = () => FinalReviewQuestion;
function plan(total: 5 | 10 | 15): Factory[] { const core = [numberQuestion, calculationQuestion, wordQuestion, geometryQuestion, measurementQuestion]; return total === 5 ? core : total === 10 ? [...core, ...core] : [...core, ...core, ...core]; }
function signature(q: FinalReviewQuestion) { return `${q.type}-${q.instruction}-${JSON.stringify(q.correctAnswer)}-${'mode' in q ? q.mode : ''}`; }
export function generateFinalReviewQuestions(total: 5 | 10 | 15 = 10) { const used = new Set<string>(); return shuffle(plan(total)).map((factory) => { let q = factory(), key = signature(q), retries = 0; while (used.has(key) && retries < 30) { q = factory(); key = signature(q); retries += 1; } used.add(key); return q; }); }
