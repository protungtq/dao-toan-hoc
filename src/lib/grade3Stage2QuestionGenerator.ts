export type Grade3Stage2Module = 'geometry' | 'multiply100' | 'measurement';
export type Grade3Stage2SkillId =
  | 'midpoint' | 'circle-parts' | 'angles-grade-3' | 'quadrilaterals-grade-3' | 'cube-cuboid-grade-3'
  | 'multiply-two-by-one' | 'division-remainder' | 'divide-two-by-one' | 'times-as-many' | 'two-step-problems-grade-3'
  | 'millimeter' | 'gram' | 'milliliter' | 'temperature-celsius';
export type Grade3Stage2Answer = number | string;

export const GRADE3_STAGE2_SKILL_LABELS: Record<Grade3Stage2SkillId, string> = {
  midpoint: 'Điểm ở giữa và trung điểm', 'circle-parts': 'Hình tròn', 'angles-grade-3': 'Góc vuông và góc không vuông',
  'quadrilaterals-grade-3': 'Hình chữ nhật và hình vuông', 'cube-cuboid-grade-3': 'Khối lập phương và khối hộp chữ nhật',
  'multiply-two-by-one': 'Nhân số có hai chữ số', 'division-remainder': 'Chia hết và chia có dư',
  'divide-two-by-one': 'Chia số có hai chữ số', 'times-as-many': 'Gấp và giảm một số lần',
  'two-step-problems-grade-3': 'Bài toán hai bước', millimeter: 'Mi-li-mét', gram: 'Gam', milliliter: 'Mi-li-lít',
  'temperature-celsius': 'Nhiệt độ và độ C',
};

type Base = { id: string; signature: string; skillId: Grade3Stage2SkillId; instruction: string; answers: Grade3Stage2Answer[]; correctAnswer: Grade3Stage2Answer; hintSteps: [string, string, string]; explanation: string };
export type ExpressionQuestion = Base & { type: 'expression'; expression: string; caption?: string };
export type SegmentQuestion = Base & { type: 'segment'; labels: [string, string, string]; leftLength: number; rightLength: number };
export type CircleQuestion = Base & { type: 'circle'; focus: 'radius' | 'diameter' | 'center' };
export type AngleQuestion = Base & { type: 'angle'; degrees: 45 | 90 | 120 };
export type ShapeQuestion = Base & { type: 'shape'; shape: 'triangle' | 'quadrilateral' | 'rectangle' | 'square'; width: number; height: number };
export type SolidQuestion = Base & { type: 'solid'; solid: 'cube' | 'cuboid'; objectIcon: string; objectName: string };
export type GroupsQuestion = Base & { type: 'groups'; groups: number; perGroup: number; icon: string };
export type BarsQuestion = Base & { type: 'bars'; first: number; second: number; relation: 'times' | 'reduced' };
export type ContextQuestion = Base & { type: 'context'; icon: string; visualTitle: string; visualText: string };
export type MeasurementQuestion = Base & { type: 'measurement'; measure: 'ruler' | 'scale' | 'jug'; value: number; unit: 'mm' | 'g' | 'ml'; max: number };
export type ThermometerQuestion = Base & { type: 'thermometer'; temperature: number };
export type Grade3Stage2Question = ExpressionQuestion | SegmentQuestion | CircleQuestion | AngleQuestion | ShapeQuestion | SolidQuestion | GroupsQuestion | BarsQuestion | ContextQuestion | MeasurementQuestion | ThermometerQuestion;

const ICONS = ['🍎', '⭐', '⚽', '🧁', '🌼'] as const;
const ri = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(items: readonly T[]): T => items[ri(0, items.length - 1)];
function shuffle<T>(items: readonly T[]) { const result = [...items]; for (let i = result.length - 1; i > 0; i--) { const j = ri(0, i); [result[i], result[j]] = [result[j], result[i]]; } return result; }
const qid = (signature: string) => `${signature}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
function numberAnswers(correct: number, min = 0, max = 1000, steps = [1, -1, 2, -2, 5, -5, 10, -10]) { const values = new Set([correct]); for (const step of shuffle(steps)) { const value = correct + step; if (value >= min && value <= max) values.add(value); if (values.size === 4) break; } while (values.size < 4) values.add(ri(min, max)); return shuffle([...values]); }
function expression(skillId: Grade3Stage2SkillId, shown: string, correct: number, explanation: string, signature: string, max = 1000, caption?: string): ExpressionQuestion { return { id: qid(signature), signature, type: 'expression', skillId, expression: shown, caption, instruction: pick(['Số nào thích hợp với ô trống?', 'Tính rồi chọn kết quả đúng.', 'Tìm giá trị còn thiếu.']), answers: numberAnswers(correct, 0, max), correctAnswer: correct, hintSteps: ['Xác định phép tính cần thực hiện.', 'Tính lần lượt và kiểm tra lại.', explanation], explanation }; }

function midpointQuestion(): SegmentQuestion {
  const labels = pick([['A', 'M', 'B'], ['C', 'N', 'D'], ['P', 'Q', 'R']] as const);
  const equal = Math.random() < 0.75, leftLength = ri(2, 6), rightLength = equal ? leftLength : leftLength + pick([-1, 1]);
  const askMidpoint = Math.random() < 0.65;
  const correct = askMidpoint ? labels[1] : equal ? 'Có' : 'Không';
  const signature = `segment-${labels.join('')}-${leftLength}-${rightLength}-${askMidpoint}`;
  return { id: qid(signature), signature, type: 'segment', skillId: 'midpoint', labels: [...labels], leftLength, rightLength,
    instruction: askMidpoint ? `Điểm nào nằm giữa ${labels[0]} và ${labels[2]}?` : `${labels[1]} có là trung điểm của đoạn ${labels[0]}${labels[2]} không?`,
    answers: askMidpoint ? shuffle([...labels, 'O']) : shuffle(['Có', 'Không']), correctAnswer: correct,
    hintSteps: ['Quan sát thứ tự các điểm trên đoạn thẳng.', askMidpoint ? 'Điểm ở giữa nằm giữa hai đầu mút.' : 'Trung điểm phải nằm giữa và cách đều hai đầu mút.', askMidpoint ? `${labels[1]} nằm giữa ${labels[0]} và ${labels[2]}.` : `${labels[0]}${labels[1]} ${equal ? '=' : '≠'} ${labels[1]}${labels[2]}, nên đáp án là ${correct}.`],
    explanation: askMidpoint ? `${labels[1]} nằm giữa ${labels[0]} và ${labels[2]}.` : `${labels[1]} ${equal ? 'là' : 'không là'} trung điểm vì hai đoạn ${equal ? 'dài bằng nhau' : 'không dài bằng nhau'}.` };
}

function circleQuestion(): CircleQuestion {
  const focus = pick(['radius', 'diameter', 'center'] as const);
  const data = focus === 'radius'
    ? { question: 'Đoạn thẳng OA trong hình là gì?', correct: 'Bán kính', answers: ['Bán kính', 'Đường kính', 'Tâm', 'Đường tròn'] }
    : focus === 'diameter'
      ? { question: 'Đoạn thẳng AB đi qua tâm O là gì?', correct: 'Đường kính', answers: ['Bán kính', 'Đường kính', 'Tâm', 'Đường tròn'] }
      : { question: 'Điểm O trong hình được gọi là gì?', correct: 'Tâm', answers: ['Tâm', 'Bán kính', 'Đường kính', 'Góc vuông'] };
  const signature = `circle-${focus}`;
  return { id: qid(signature), signature, type: 'circle', skillId: 'circle-parts', focus, instruction: data.question, answers: shuffle(data.answers), correctAnswer: data.correct, hintSteps: ['Quan sát vị trí của O, A và B.', focus === 'radius' ? 'Đoạn nối tâm với một điểm trên đường tròn là bán kính.' : focus === 'diameter' ? 'Đoạn nối hai điểm trên đường tròn và đi qua tâm là đường kính.' : 'Điểm nằm chính giữa hình tròn là tâm.', `Đáp án đúng là ${data.correct}.`], explanation: `Đáp án đúng là ${data.correct}.` };
}

function angleQuestion(): AngleQuestion {
  const degrees = pick([45, 90, 120] as const), correct = degrees === 90 ? 'Góc vuông' : 'Góc không vuông';
  const signature = `angle-${degrees}`;
  return { id: qid(signature), signature, type: 'angle', skillId: 'angles-grade-3', degrees, instruction: 'Góc trong hình là góc vuông hay góc không vuông?', answers: shuffle(['Góc vuông', 'Góc không vuông']), correctAnswer: correct, hintSteps: ['Quan sát độ mở của hai cạnh góc.', 'So sánh với góc của một tờ giấy hình chữ nhật.', `Góc này ${degrees === 90 ? 'có' : 'không có'} độ mở bằng góc vuông.`], explanation: `Đây là ${correct.toLowerCase()}.` };
}

function shapeQuestion(): ShapeQuestion {
  const shape = pick(['triangle', 'quadrilateral', 'rectangle', 'square'] as const);
  const names = { triangle: 'Hình tam giác', quadrilateral: 'Hình tứ giác', rectangle: 'Hình chữ nhật', square: 'Hình vuông' } as const;
  const width = shape === 'square' ? 140 : shape === 'rectangle' ? 210 : 180, height = shape === 'square' ? 140 : 120;
  const signature = `shape-${shape}`;
  return { id: qid(signature), signature, type: 'shape', skillId: 'quadrilaterals-grade-3', shape, width, height, instruction: 'Hình được vẽ là hình gì?', answers: shuffle(Object.values(names)), correctAnswer: names[shape], hintSteps: ['Đếm số cạnh của hình.', shape === 'square' ? 'Hình có bốn cạnh bằng nhau và bốn góc vuông.' : shape === 'rectangle' ? 'Hình có bốn góc vuông, hai cạnh dài và hai cạnh ngắn.' : shape === 'triangle' ? 'Hình có ba cạnh.' : 'Hình có bốn cạnh nhưng không phải hình chữ nhật hoặc hình vuông.', `Đó là ${names[shape].toLowerCase()}.`], explanation: `Hình vẽ là ${names[shape].toLowerCase()}.` };
}

function solidQuestion(): SolidQuestion {
  const variant = pick([
    { solid: 'cube' as const, icon: '🎲', name: 'Con xúc xắc', correct: 'Khối lập phương' },
    { solid: 'cube' as const, icon: '🧊', name: 'Viên đá đồ chơi', correct: 'Khối lập phương' },
    { solid: 'cuboid' as const, icon: '📦', name: 'Hộp hàng', correct: 'Khối hộp chữ nhật' },
    { solid: 'cuboid' as const, icon: '🧱', name: 'Viên gạch', correct: 'Khối hộp chữ nhật' },
  ]);
  const signature = `solid-${variant.name}`;
  return { id: qid(signature), signature, type: 'solid', skillId: 'cube-cuboid-grade-3', solid: variant.solid, objectIcon: variant.icon, objectName: variant.name, instruction: `${variant.name} có dạng khối nào?`, answers: shuffle(['Khối lập phương', 'Khối hộp chữ nhật', 'Khối cầu', 'Khối trụ']), correctAnswer: variant.correct, hintSteps: ['Quan sát hình dạng các mặt và độ dài các cạnh.', variant.solid === 'cube' ? 'Khối lập phương có các mặt là hình vuông bằng nhau.' : 'Khối hộp chữ nhật thường có các mặt là hình chữ nhật.', `Đồ vật có dạng ${variant.correct.toLowerCase()}.`], explanation: `${variant.name} có dạng ${variant.correct.toLowerCase()}.` };
}

function multiplyQuestion(): Grade3Stage2Question {
  const factor = ri(2, 9), maxNumber = Math.floor(99 / factor), number = ri(10, Math.max(10, maxNumber)), correct = number * factor;
  if (Math.random() < 0.35) { const signature = `groups-${factor}-${number}`; return { id: qid(signature), signature, type: 'groups', skillId: 'multiply-two-by-one', groups: factor, perGroup: number, icon: pick(ICONS), instruction: `${factor} nhóm, mỗi nhóm có ${number}. Có tất cả bao nhiêu?`, answers: numberAnswers(correct, 0, 100), correctAnswer: correct, hintSteps: [`Có ${factor} nhóm bằng nhau.`, `Lấy ${number} nhân với ${factor}.`, `${number} × ${factor} = ${correct}.`], explanation: `${factor} × ${number} = ${correct}.` }; }
  return expression('multiply-two-by-one', `${number} × ${factor} = □`, correct, `${number} × ${factor} = ${correct}.`, `multiply-${number}-${factor}`, 100, 'Nhân số có hai chữ số với số có một chữ số');
}

function remainderQuestion(): ExpressionQuestion {
  const divisor = ri(2, 9), quotient = ri(2, 10), remainder = ri(0, divisor - 1), dividend = divisor * quotient + remainder;
  const askRemainder = Math.random() < 0.6, correct = askRemainder ? remainder : quotient;
  const shown = askRemainder ? `${dividend} : ${divisor} = ${quotient} (dư □)` : `${dividend} : ${divisor} = □ (dư ${remainder})`;
  return expression('division-remainder', shown, correct, `${dividend} = ${divisor} × ${quotient} + ${remainder}.`, `remainder-${dividend}-${divisor}-${askRemainder}`, 100, remainder === 0 ? 'Phép chia hết' : 'Phép chia có dư');
}

function divideQuestion(): ExpressionQuestion {
  const divisor = ri(2, 9), quotient = ri(2, 11), dividend = divisor * quotient;
  return expression('divide-two-by-one', `${dividend} : ${divisor} = □`, quotient, `${dividend} : ${divisor} = ${quotient}.`, `divide-${dividend}-${divisor}`, 100, 'Chia số có hai chữ số cho số có một chữ số');
}

function timesQuestion(): BarsQuestion {
  const small = ri(2, 12), times = ri(2, 5), large = small * times, reduced = Math.random() < 0.5;
  const correct = reduced ? small : large, signature = `times-${small}-${times}-${reduced}`;
  return { id: qid(signature), signature, type: 'bars', skillId: 'times-as-many', first: small, second: large, relation: reduced ? 'reduced' : 'times', instruction: reduced ? `${large} giảm đi ${times} lần được bao nhiêu?` : `${small} gấp lên ${times} lần được bao nhiêu?`, answers: numberAnswers(correct, 0, 100), correctAnswer: correct, hintSteps: [reduced ? 'Giảm một số đi nhiều lần dùng phép chia.' : 'Gấp một số lên nhiều lần dùng phép nhân.', reduced ? `Lấy ${large} chia cho ${times}.` : `Lấy ${small} nhân với ${times}.`, reduced ? `${large} : ${times} = ${small}.` : `${small} × ${times} = ${large}.`], explanation: reduced ? `${large} : ${times} = ${small}.` : `${small} × ${times} = ${large}.` };
}

function twoStepQuestion(): ContextQuestion {
  const groups = ri(2, 5), perGroup = ri(4, 9), extra = ri(2, 12), add = Math.random() < 0.5;
  const subtotal = groups * perGroup, correct = add ? subtotal + extra : subtotal - extra;
  const signature = `two-step-${groups}-${perGroup}-${extra}-${add}`;
  return { id: qid(signature), signature, type: 'context', skillId: 'two-step-problems-grade-3', icon: add ? '🧁' : '🍎', visualTitle: `${groups} hộp × ${perGroup}`, visualText: add ? `Thêm ${extra} món rời` : `Đã dùng ${extra} món`, instruction: add ? `Có ${groups} hộp, mỗi hộp ${perGroup} chiếc bánh, rồi thêm ${extra} chiếc. Có tất cả bao nhiêu chiếc?` : `Có ${groups} túi, mỗi túi ${perGroup} quả táo, đã dùng ${extra} quả. Còn lại bao nhiêu quả?`, answers: numberAnswers(correct, 0, 100), correctAnswer: correct, hintSteps: [`Bước 1: tính ${groups} nhóm có tất cả bao nhiêu.`, `Bước 2: ${add ? 'cộng thêm' : 'trừ đi'} ${extra}.`, `${groups} × ${perGroup} = ${subtotal}; ${subtotal} ${add ? '+' : '−'} ${extra} = ${correct}.`], explanation: `Thực hiện hai bước: ${groups} × ${perGroup} = ${subtotal}; ${subtotal} ${add ? '+' : '−'} ${extra} = ${correct}.` };
}

function millimeterQuestion(): Grade3Stage2Question {
  const mode = pick(['convert', 'read'] as const), centimeters = ri(1, 9), millimeters = centimeters * 10;
  if (mode === 'convert') return expression('millimeter', `${centimeters} cm = □ mm`, millimeters, `1 cm = 10 mm nên ${centimeters} cm = ${millimeters} mm.`, `mm-convert-${centimeters}`, 100, 'Đổi xăng-ti-mét sang mi-li-mét');
  const value = ri(12, 85), signature = `ruler-${value}`;
  return { id: qid(signature), signature, type: 'measurement', skillId: 'millimeter', measure: 'ruler', value, unit: 'mm', max: 100, instruction: 'Đoạn màu trên thước dài bao nhiêu mi-li-mét?', answers: numberAnswers(value, 0, 100), correctAnswer: value, hintSteps: ['Mỗi vạch nhỏ ứng với 1 mm.', 'Đọc vị trí đầu và cuối đoạn màu.', `Đoạn màu kết thúc ở vạch ${value} mm.`], explanation: `Đoạn màu dài ${value} mm.` };
}

function gramQuestion(): Grade3Stage2Question {
  if (Math.random() < 0.35) { const kilograms = ri(1, 4), correct = kilograms * 1000; return expression('gram', `${kilograms} kg = □ g`, correct, `1 kg = 1 000 g nên ${kilograms} kg = ${correct} g.`, `gram-convert-${kilograms}`, 5000, 'Đổi ki-lô-gam sang gam'); }
  const value = ri(1, 18) * 50, signature = `scale-${value}`;
  return { id: qid(signature), signature, type: 'measurement', skillId: 'gram', measure: 'scale', value, unit: 'g', max: 1000, instruction: 'Cân chỉ khối lượng bao nhiêu gam?', answers: numberAnswers(value, 0, 1000, [50, -50, 100, -100, 200, -200]), correctAnswer: value, hintSteps: ['Quan sát vị trí kim trên mặt cân.', 'Các vạch lớn cách nhau 100 g.', `Kim chỉ ${value} g.`], explanation: `Vật nặng ${value} g.` };
}

function milliliterQuestion(): Grade3Stage2Question {
  if (Math.random() < 0.35) { const liters = ri(1, 4), correct = liters * 1000; return expression('milliliter', `${liters} l = □ ml`, correct, `1 l = 1 000 ml nên ${liters} l = ${correct} ml.`, `ml-convert-${liters}`, 5000, 'Đổi lít sang mi-li-lít'); }
  const value = ri(1, 9) * 100, signature = `jug-${value}`;
  return { id: qid(signature), signature, type: 'measurement', skillId: 'milliliter', measure: 'jug', value, unit: 'ml', max: 1000, instruction: 'Bình đang có bao nhiêu mi-li-lít nước?', answers: numberAnswers(value, 0, 1000, [100, -100, 200, -200]), correctAnswer: value, hintSteps: ['Đọc các vạch chia trên bình.', 'Mỗi vạch lớn ứng với 100 ml.', `Mực nước ở vạch ${value} ml.`], explanation: `Bình có ${value} ml nước.` };
}

function temperatureQuestion(): ThermometerQuestion {
  const temperature = ri(0, 8) * 5, signature = `temperature-${temperature}`;
  return { id: qid(signature), signature, type: 'thermometer', skillId: 'temperature-celsius', temperature, instruction: 'Nhiệt kế đang chỉ bao nhiêu độ C?', answers: numberAnswers(temperature, 0, 50, [5, -5, 10, -10]), correctAnswer: temperature, hintSteps: ['Quan sát đỉnh cột màu đỏ.', 'Mỗi vạch lớn tăng thêm 5 độ C.', `Cột đỏ dừng ở ${temperature}°C.`], explanation: `Nhiệt kế chỉ ${temperature}°C.` };
}

type Factory = () => Grade3Stage2Question;
function unique(plan: Factory[], total: 5 | 10 | 15) { const result: Grade3Stage2Question[] = [], seen = new Set<string>(); let attempts = 0; while (result.length < total && attempts < total * 40) { const question = plan[result.length % plan.length](); attempts++; if (seen.has(question.signature)) continue; seen.add(question.signature); result.push(question); } return shuffle(result); }
export function generateGrade3Stage2Questions(module: Grade3Stage2Module, total: 5 | 10 | 15 = 10) {
  const plans: Record<Grade3Stage2Module, Factory[]> = {
    geometry: [midpointQuestion, circleQuestion, angleQuestion, shapeQuestion, solidQuestion],
    multiply100: [multiplyQuestion, remainderQuestion, divideQuestion, timesQuestion, twoStepQuestion],
    measurement: [millimeterQuestion, gramQuestion, milliliterQuestion, temperatureQuestion, () => pick([millimeterQuestion, gramQuestion, milliliterQuestion, temperatureQuestion])()],
  };
  return unique(plans[module], total);
}
