export type Grade4Semester = 1 | 2;
export type Grade4DevelopmentStatus = 'ready' | 'building' | 'planned';

export type Grade4Skill = {
  id: string;
  title: string;
  description: string;
  icon: string;
  questionTypes: string[];
  defaultWeight: number;
};

export type Grade4Module = {
  id: string;
  grade: 4;
  number: number;
  title: string;
  shortTitle: string;
  slug: string;
  description: string;
  semester: Grade4Semester;
  textbookLessons: number[];
  icon: string;
  color: string;
  backgroundColor: string;
  developmentStatus: Grade4DevelopmentStatus;
  skills: Grade4Skill[];
};

export const grade4PracticeModes = [
  { id: 'quick', title: 'Luyện nhanh', questionCount: 5, estimatedMinutes: 4, icon: '⚡' },
  { id: 'standard', title: 'Luyện chuẩn', questionCount: 10, estimatedMinutes: 8, icon: '🎯' },
  { id: 'challenge', title: 'Thử thách', questionCount: 15, estimatedMinutes: 13, icon: '🏆' },
  { id: 'review', title: 'Ôn câu sai', questionCount: 10, estimatedMinutes: 8, icon: '🔁' },
] as const;

export const grade4PracticeModules: Grade4Module[] = [
  {
    id: 'grade-4-review-and-extend', grade: 4, number: 1,
    title: 'Ôn tập và bổ sung', shortTitle: 'Ôn tập đầu năm', slug: 'on-tap-va-bo-sung',
    description: 'Ôn số và phép tính đến 100 000, số chẵn – số lẻ, biểu thức chứa chữ và bài toán ba bước.',
    semester: 1, textbookLessons: [1, 2, 3, 4, 5, 6], icon: '🔄', color: 'from-orange-400 to-amber-500', backgroundColor: 'bg-orange-50', developmentStatus: 'ready',
    skills: [
      { id: 'review-numbers-100000', title: 'Số đến 100 000', description: 'Đọc, viết, phân tích và so sánh số.', icon: '🔢', questionTypes: ['review-numbers-100000'], defaultWeight: 20 },
      { id: 'review-operations-100000', title: 'Phép tính đến 100 000', description: 'Ôn cộng, trừ, nhân và chia.', icon: '🧮', questionTypes: ['review-operations-100000'], defaultWeight: 25 },
      { id: 'odd-even-numbers', title: 'Số chẵn và số lẻ', description: 'Nhận biết qua chữ số tận cùng.', icon: '⚖️', questionTypes: ['odd-even-number'], defaultWeight: 15 },
      { id: 'letter-expressions', title: 'Biểu thức chứa chữ', description: 'Thay giá trị và tính biểu thức.', icon: '📝', questionTypes: ['letter-expression'], defaultWeight: 20 },
      { id: 'three-step-problems', title: 'Bài toán ba bước', description: 'Lập kế hoạch và giải theo ba phép tính.', icon: '📖', questionTypes: ['three-step-word-problem'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-4-angles', grade: 4, number: 2,
    title: 'Góc và đơn vị đo góc', shortTitle: 'Góc và độ', slug: 'goc-va-don-vi-do-goc',
    description: 'Làm quen độ, đo góc và nhận biết góc nhọn, góc vuông, góc tù, góc bẹt.',
    semester: 1, textbookLessons: [7, 8, 9], icon: '📐', color: 'from-cyan-500 to-blue-600', backgroundColor: 'bg-cyan-50', developmentStatus: 'ready',
    skills: [
      { id: 'angle-measure', title: 'Độ và số đo góc', description: 'Đọc số đo và liên hệ với góc vuông, góc bẹt.', icon: '📏', questionTypes: ['angle-measure'], defaultWeight: 40 },
      { id: 'angle-classification', title: 'Phân loại góc', description: 'Nhận biết góc nhọn, vuông, tù và bẹt.', icon: '📐', questionTypes: ['classify-angle'], defaultWeight: 60 },
    ],
  },
  {
    id: 'grade-4-large-numbers', grade: 4, number: 3,
    title: 'Số có nhiều chữ số', shortTitle: 'Số lớn', slug: 'so-co-nhieu-chu-so',
    description: 'Đọc, viết, phân tích, làm tròn và so sánh các số đến lớp triệu; làm quen dãy số tự nhiên.',
    semester: 1, textbookLessons: [10, 11, 12, 13, 14, 15, 16], icon: '🔢', color: 'from-indigo-500 to-violet-600', backgroundColor: 'bg-indigo-50', developmentStatus: 'ready',
    skills: [
      { id: 'numbers-to-million', title: 'Số đến lớp triệu', description: 'Đọc, viết và phân tích số nhiều chữ số.', icon: '💯', questionTypes: ['read-write-large-number', 'place-value-large-number'], defaultWeight: 40 },
      { id: 'round-large-numbers', title: 'Làm tròn số lớn', description: 'Làm tròn đến hàng nghìn và hàng trăm nghìn.', icon: '🎯', questionTypes: ['round-large-number'], defaultWeight: 25 },
      { id: 'compare-large-numbers', title: 'So sánh số lớn', description: 'So sánh và sắp xếp số có nhiều chữ số.', icon: '⚖️', questionTypes: ['compare-large-number'], defaultWeight: 20 },
      { id: 'natural-number-sequence', title: 'Dãy số tự nhiên', description: 'Tìm số liền trước, liền sau và quy luật đơn giản.', icon: '➡️', questionTypes: ['natural-number-sequence'], defaultWeight: 15 },
    ],
  },
  {
    id: 'grade-4-measurement-units', grade: 4, number: 4,
    title: 'Một số đơn vị đo đại lượng', shortTitle: 'Đơn vị đo', slug: 'mot-so-don-vi-do-dai-luong',
    description: 'Luyện yến, tạ, tấn; đơn vị đo diện tích; giây và thế kỉ trong các tình huống thực tế.',
    semester: 1, textbookLessons: [17, 18, 19, 20, 21], icon: '⚖️', color: 'from-rose-400 to-pink-500', backgroundColor: 'bg-rose-50', developmentStatus: 'ready',
    skills: [
      { id: 'mass-units-grade-4', title: 'Yến, tạ và tấn', description: 'Đổi và so sánh đơn vị khối lượng.', icon: '⚖️', questionTypes: ['convert-yen-ta-ton'], defaultWeight: 35 },
      { id: 'area-units-grade-4', title: 'Đơn vị đo diện tích', description: 'Đổi đề-xi-mét, mét và mi-li-mét vuông.', icon: '🔲', questionTypes: ['convert-square-units'], defaultWeight: 35 },
      { id: 'second-century', title: 'Giây và thế kỉ', description: 'Đổi đơn vị và xác định thế kỉ.', icon: '⏱️', questionTypes: ['seconds-centuries'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-4-addition-subtraction', grade: 4, number: 5,
    title: 'Phép cộng và phép trừ', shortTitle: 'Cộng và trừ', slug: 'phep-cong-va-phep-tru',
    description: 'Cộng, trừ số có nhiều chữ số; vận dụng tính chất và tìm hai số khi biết tổng và hiệu.',
    semester: 1, textbookLessons: [22, 23, 24, 25, 26], icon: '➕', color: 'from-emerald-500 to-teal-600', backgroundColor: 'bg-emerald-50', developmentStatus: 'ready',
    skills: [
      { id: 'large-add-subtract', title: 'Cộng và trừ số lớn', description: 'Đặt tính và tính chính xác.', icon: '🧮', questionTypes: ['large-addition', 'large-subtraction'], defaultWeight: 45 },
      { id: 'addition-properties', title: 'Tính chất phép cộng', description: 'Vận dụng giao hoán và kết hợp để tính thuận tiện.', icon: '🔁', questionTypes: ['addition-properties'], defaultWeight: 25 },
      { id: 'sum-difference-problems', title: 'Tìm hai số', description: 'Tìm hai số khi biết tổng và hiệu.', icon: '🧩', questionTypes: ['find-numbers-sum-difference'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-4-lines-and-quadrilaterals', grade: 4, number: 6,
    title: 'Đường thẳng vuông góc, đường thẳng song song', shortTitle: 'Đường thẳng và tứ giác', slug: 'duong-thang-va-tu-giac',
    description: 'Nhận biết, vẽ đường thẳng vuông góc, song song; làm quen hình bình hành và hình thoi.',
    semester: 1, textbookLessons: [27, 28, 29, 30, 31, 32], icon: '📏', color: 'from-sky-500 to-cyan-600', backgroundColor: 'bg-sky-50', developmentStatus: 'ready',
    skills: [
      { id: 'perpendicular-lines', title: 'Đường thẳng vuông góc', description: 'Nhận biết và xác định cặp đường vuông góc.', icon: '⊥', questionTypes: ['perpendicular-lines'], defaultWeight: 35 },
      { id: 'parallel-lines', title: 'Đường thẳng song song', description: 'Nhận biết và xác định cặp đường song song.', icon: '∥', questionTypes: ['parallel-lines'], defaultWeight: 35 },
      { id: 'parallelogram-rhombus', title: 'Bình hành và hình thoi', description: 'Nhận biết đặc điểm các cạnh của hình.', icon: '🔷', questionTypes: ['parallelogram-rhombus'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-4-semester-1-review', grade: 4, number: 7,
    title: 'Ôn tập học kỳ I', shortTitle: 'Ôn tập học kỳ I', slug: 'on-tap-hoc-ky-1',
    description: 'Ôn số đến lớp triệu, cộng trừ, hình học, đo lường và giải bài toán tổng hợp.',
    semester: 1, textbookLessons: [33, 34, 35, 36, 37], icon: '📚', color: 'from-fuchsia-500 to-purple-600', backgroundColor: 'bg-fuchsia-50', developmentStatus: 'planned',
    skills: [
      { id: 'semester-1-large-numbers', title: 'Ôn số đến lớp triệu', description: 'Đọc, viết, so sánh và làm tròn số.', icon: '🔢', questionTypes: ['review-large-numbers'], defaultWeight: 25 },
      { id: 'semester-1-add-subtract', title: 'Ôn cộng và trừ', description: 'Tính và vận dụng vào bài toán.', icon: '➕', questionTypes: ['review-add-subtract-grade-4'], defaultWeight: 25 },
      { id: 'semester-1-geometry-grade-4', title: 'Ôn hình học', description: 'Góc, đường thẳng và tứ giác.', icon: '📐', questionTypes: ['review-geometry-grade-4'], defaultWeight: 25 },
      { id: 'semester-1-measurement-grade-4', title: 'Ôn đo lường', description: 'Đổi và tính với các đơn vị đo.', icon: '⚖️', questionTypes: ['review-measurement-grade-4'], defaultWeight: 25 },
    ],
  },
  {
    id: 'grade-4-multiplication-division', grade: 4, number: 8,
    title: 'Phép nhân và phép chia', shortTitle: 'Nhân và chia', slug: 'phep-nhan-va-phep-chia',
    description: 'Nhân, chia số tự nhiên; vận dụng tính chất, ước lượng, số trung bình cộng và rút về đơn vị.',
    semester: 2, textbookLessons: [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48], icon: '✖️', color: 'from-blue-500 to-indigo-600', backgroundColor: 'bg-blue-50', developmentStatus: 'planned',
    skills: [
      { id: 'multiply-divide-natural', title: 'Nhân và chia số tự nhiên', description: 'Nhân, chia với số có một hoặc hai chữ số.', icon: '✖️', questionTypes: ['multiply-divide-natural-grade-4'], defaultWeight: 40 },
      { id: 'multiplication-properties', title: 'Tính chất phép nhân', description: 'Vận dụng giao hoán, kết hợp và phân phối.', icon: '🔁', questionTypes: ['multiplication-properties'], defaultWeight: 20 },
      { id: 'estimation-calculation', title: 'Ước lượng', description: 'Ước lượng và kiểm tra tính hợp lí của kết quả.', icon: '🎯', questionTypes: ['estimation-calculation'], defaultWeight: 15 },
      { id: 'average-unit-rate', title: 'Trung bình cộng và rút về đơn vị', description: 'Giải các bài toán thực tế.', icon: '📊', questionTypes: ['average-unit-rate'], defaultWeight: 25 },
    ],
  },
  {
    id: 'grade-4-statistics-probability', grade: 4, number: 9,
    title: 'Thống kê và xác suất', shortTitle: 'Dữ liệu và xác suất', slug: 'thong-ke-va-xac-suat',
    description: 'Đọc dãy số liệu, biểu đồ cột và nhận biết số lần xuất hiện của một sự kiện.',
    semester: 2, textbookLessons: [49, 50, 51, 52], icon: '📊', color: 'from-teal-500 to-emerald-600', backgroundColor: 'bg-teal-50', developmentStatus: 'planned',
    skills: [
      { id: 'data-series', title: 'Dãy số liệu', description: 'Đọc, phân tích và trả lời câu hỏi từ số liệu.', icon: '🔢', questionTypes: ['data-series-grade-4'], defaultWeight: 35 },
      { id: 'column-chart', title: 'Biểu đồ cột', description: 'Đọc và so sánh dữ liệu trên biểu đồ.', icon: '📊', questionTypes: ['column-chart-grade-4'], defaultWeight: 35 },
      { id: 'event-frequency', title: 'Số lần xuất hiện', description: 'Kiểm đếm kết quả của một sự kiện.', icon: '🎲', questionTypes: ['event-frequency'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-4-fractions', grade: 4, number: 10,
    title: 'Phân số', shortTitle: 'Phân số', slug: 'phan-so',
    description: 'Hiểu khái niệm, tính chất cơ bản, rút gọn, quy đồng và so sánh phân số.',
    semester: 2, textbookLessons: [53, 54, 55, 56, 57, 58, 59], icon: '🍕', color: 'from-amber-400 to-orange-500', backgroundColor: 'bg-amber-50', developmentStatus: 'planned',
    skills: [
      { id: 'fraction-concept', title: 'Khái niệm phân số', description: 'Đọc, viết và biểu diễn phân số.', icon: '🍕', questionTypes: ['fraction-concept-grade-4'], defaultWeight: 25 },
      { id: 'fraction-properties', title: 'Tính chất cơ bản', description: 'Nhận biết các phân số bằng nhau.', icon: '🧩', questionTypes: ['equivalent-fractions'], defaultWeight: 25 },
      { id: 'simplify-common-denominator', title: 'Rút gọn và quy đồng', description: 'Rút gọn, quy đồng mẫu số.', icon: '✂️', questionTypes: ['simplify-common-denominator'], defaultWeight: 30 },
      { id: 'compare-fractions', title: 'So sánh phân số', description: 'So sánh phân số cùng hoặc khác mẫu.', icon: '⚖️', questionTypes: ['compare-fractions-grade-4'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-4-fraction-add-subtract', grade: 4, number: 11,
    title: 'Phép cộng, phép trừ phân số', shortTitle: 'Cộng trừ phân số', slug: 'cong-tru-phan-so',
    description: 'Cộng, trừ phân số cùng mẫu hoặc khác mẫu và vận dụng trong bài toán.',
    semester: 2, textbookLessons: [60, 61, 62], icon: '➕', color: 'from-violet-500 to-purple-600', backgroundColor: 'bg-violet-50', developmentStatus: 'planned',
    skills: [
      { id: 'fraction-addition', title: 'Cộng phân số', description: 'Quy đồng khi cần rồi cộng tử số.', icon: '➕', questionTypes: ['fraction-addition-grade-4'], defaultWeight: 50 },
      { id: 'fraction-subtraction', title: 'Trừ phân số', description: 'Quy đồng khi cần rồi trừ tử số.', icon: '➖', questionTypes: ['fraction-subtraction-grade-4'], defaultWeight: 50 },
    ],
  },
  {
    id: 'grade-4-fraction-multiply-divide', grade: 4, number: 12,
    title: 'Phép nhân, phép chia phân số', shortTitle: 'Nhân chia phân số', slug: 'nhan-chia-phan-so',
    description: 'Nhân, chia phân số và tìm phân số của một số trong tình huống thực tế.',
    semester: 2, textbookLessons: [63, 64, 65, 66], icon: '➗', color: 'from-pink-500 to-rose-600', backgroundColor: 'bg-pink-50', developmentStatus: 'planned',
    skills: [
      { id: 'fraction-multiplication', title: 'Nhân phân số', description: 'Nhân tử với tử, mẫu với mẫu và rút gọn.', icon: '✖️', questionTypes: ['fraction-multiplication-grade-4'], defaultWeight: 35 },
      { id: 'fraction-division', title: 'Chia phân số', description: 'Nhân với phân số đảo ngược.', icon: '➗', questionTypes: ['fraction-division-grade-4'], defaultWeight: 35 },
      { id: 'fraction-of-number', title: 'Phân số của một số', description: 'Tìm một phần của số lượng đã cho.', icon: '🧮', questionTypes: ['fraction-of-number-grade-4'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-4-final-review', grade: 4, number: 13,
    title: 'Ôn tập cuối năm', shortTitle: 'Ôn tập cuối năm', slug: 'on-tap-cuoi-nam',
    description: 'Ôn số tự nhiên, các phép tính, phân số, hình học, đo lường, thống kê và xác suất.',
    semester: 2, textbookLessons: [67, 68, 69, 70, 71, 72, 73], icon: '🏆', color: 'from-red-400 to-orange-500', backgroundColor: 'bg-red-50', developmentStatus: 'planned',
    skills: [
      { id: 'final-natural-numbers', title: 'Ôn số tự nhiên', description: 'Số lớn và bốn phép tính.', icon: '🔢', questionTypes: ['final-natural-numbers-grade-4'], defaultWeight: 25 },
      { id: 'final-fractions', title: 'Ôn phân số', description: 'So sánh và tính với phân số.', icon: '🍕', questionTypes: ['final-fractions-grade-4'], defaultWeight: 25 },
      { id: 'final-geometry-measurement', title: 'Ôn hình học và đo lường', description: 'Góc, hình, đơn vị đo và bài toán thực tế.', icon: '📐', questionTypes: ['final-geometry-measurement-grade-4'], defaultWeight: 25 },
      { id: 'final-data-probability', title: 'Ôn thống kê và xác suất', description: 'Đọc dữ liệu và nhận xét khả năng xảy ra.', icon: '📊', questionTypes: ['final-data-probability-grade-4'], defaultWeight: 25 },
    ],
  },
];

export function getGrade4ModulesBySemester(semester: Grade4Semester) {
  return grade4PracticeModules.filter((practiceModule) => practiceModule.semester === semester);
}

export function getGrade4ReadyModules() {
  return grade4PracticeModules.filter((practiceModule) => practiceModule.developmentStatus === 'ready');
}
