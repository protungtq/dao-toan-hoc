export type Grade2Semester = 1 | 2;
export type Grade2DevelopmentStatus = 'ready' | 'building' | 'planned';

export type Grade2Skill = {
  id: string;
  title: string;
  description: string;
  icon: string;
  questionTypes: string[];
  defaultWeight: number;
};

export type Grade2Module = {
  id: string;
  grade: 2;
  number: number;
  title: string;
  shortTitle: string;
  slug: string;
  description: string;
  semester: Grade2Semester;
  textbookLessons: number[];
  icon: string;
  color: string;
  backgroundColor: string;
  developmentStatus: Grade2DevelopmentStatus;
  skills: Grade2Skill[];
};

export const grade2PracticeModes = [
  { id: 'quick', title: 'Luyện nhanh', questionCount: 5, estimatedMinutes: 3, icon: '⚡' },
  { id: 'standard', title: 'Luyện chuẩn', questionCount: 10, estimatedMinutes: 6, icon: '🎯' },
  { id: 'challenge', title: 'Thử thách', questionCount: 15, estimatedMinutes: 10, icon: '🏆' },
  { id: 'review', title: 'Ôn câu sai', questionCount: 10, estimatedMinutes: 6, icon: '🔁' },
] as const;

export const grade2PracticeModules: Grade2Module[] = [
  {
    id: 'grade-2-review-and-extend', grade: 2, number: 1,
    title: 'Ôn tập và bổ sung', shortTitle: 'Ôn tập đầu năm', slug: 'on-tap-va-bo-sung',
    description: 'Ôn số đến 100, tia số, thành phần phép tính và cộng trừ không nhớ.',
    semester: 1, textbookLessons: [1, 2, 3, 4, 5, 6], icon: '🔢', color: 'from-cyan-400 to-sky-500', backgroundColor: 'bg-cyan-50', developmentStatus: 'ready',
    skills: [
      { id: 'review-numbers-to-100', title: 'Số đến 100', description: 'Đọc, viết, so sánh và phân tích số.', icon: '💯', questionTypes: ['read-number', 'compare-number', 'place-value'], defaultWeight: 25 },
      { id: 'number-line-neighbors', title: 'Tia số và số liền kề', description: 'Tìm số liền trước, liền sau trên tia số.', icon: '➡️', questionTypes: ['number-line', 'previous-next-number'], defaultWeight: 20 },
      { id: 'operation-components', title: 'Thành phần phép tính', description: 'Nhận biết số hạng, tổng, số bị trừ, số trừ và hiệu.', icon: '🧩', questionTypes: ['addition-components', 'subtraction-components'], defaultWeight: 20 },
      { id: 'more-less-difference', title: 'Hơn, kém bao nhiêu', description: 'So sánh và tìm phần hơn hoặc kém.', icon: '⚖️', questionTypes: ['how-many-more', 'how-many-less'], defaultWeight: 15 },
      { id: 'review-no-carry-calculation', title: 'Cộng trừ không nhớ', description: 'Ôn cộng và trừ không nhớ trong phạm vi 100.', icon: '➕', questionTypes: ['addition-no-carry-100', 'subtraction-no-borrow-100'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-2-add-subtract-to-20', grade: 2, number: 2,
    title: 'Phép cộng, phép trừ trong phạm vi 20', shortTitle: 'Cộng trừ đến 20', slug: 'cong-tru-trong-pham-vi-20',
    description: 'Luyện cộng, trừ qua 10 và giải bài toán thêm – bớt trong phạm vi 20.',
    semester: 1, textbookLessons: [7, 8, 9, 10, 11, 12, 13, 14], icon: '➕', color: 'from-violet-400 to-indigo-500', backgroundColor: 'bg-violet-50', developmentStatus: 'ready',
    skills: [
      { id: 'addition-over-10-to-20', title: 'Cộng qua 10', description: 'Tính tổng bằng cách làm tròn 10.', icon: '➕', questionTypes: ['addition-over-10', 'make-ten-addition'], defaultWeight: 25 },
      { id: 'addition-table-to-20', title: 'Bảng cộng', description: 'Ghi nhớ và hoàn thành các phép cộng trong phạm vi 20.', icon: '🔢', questionTypes: ['addition-table', 'missing-addend'], defaultWeight: 15 },
      { id: 'subtraction-over-10-to-20', title: 'Trừ qua 10', description: 'Thực hiện phép trừ qua 10.', icon: '➖', questionTypes: ['subtraction-over-10', 'subtract-through-ten'], defaultWeight: 25 },
      { id: 'subtraction-table-to-20', title: 'Bảng trừ', description: 'Ghi nhớ và hoàn thành các phép trừ trong phạm vi 20.', icon: '🧮', questionTypes: ['subtraction-table', 'missing-subtrahend'], defaultWeight: 15 },
      { id: 'word-problems-to-20', title: 'Bài toán thêm – bớt', description: 'Giải tình huống thêm hoặc bớt một số đơn vị.', icon: '📖', questionTypes: ['add-word-problem', 'subtract-word-problem'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-2-mass-capacity', grade: 2, number: 3,
    title: 'Khối lượng và dung tích', shortTitle: 'Ki-lô-gam và lít', slug: 'khoi-luong-va-dung-tich',
    description: 'Làm quen với ki-lô-gam, lít và các tình huống đo lường thực tế.',
    semester: 1, textbookLessons: [15, 16, 17, 18], icon: '⚖️', color: 'from-emerald-400 to-teal-500', backgroundColor: 'bg-emerald-50', developmentStatus: 'ready',
    skills: [
      { id: 'kilogram', title: 'Đơn vị ki-lô-gam', description: 'Nhận biết và sử dụng đơn vị ki-lô-gam.', icon: '⚖️', questionTypes: ['choose-kilogram', 'kilogram-symbol'], defaultWeight: 20 },
      { id: 'compare-mass', title: 'Cân và so sánh khối lượng', description: 'Đọc cân thăng bằng, tìm vật nặng hơn hoặc nhẹ hơn.', icon: '🏋️', questionTypes: ['read-balance', 'compare-mass'], defaultWeight: 20 },
      { id: 'liter', title: 'Đơn vị lít', description: 'Nhận biết và sử dụng đơn vị lít.', icon: '🫗', questionTypes: ['choose-liter', 'liter-symbol'], defaultWeight: 20 },
      { id: 'compare-capacity', title: 'So sánh dung tích', description: 'So sánh lượng chất lỏng và sức chứa của các bình.', icon: '🪣', questionTypes: ['compare-capacity', 'read-container'], defaultWeight: 20 },
      { id: 'mass-capacity-problems', title: 'Bài toán đo lường', description: 'Giải bài toán với ki-lô-gam và lít.', icon: '📖', questionTypes: ['kilogram-problem', 'liter-problem'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-2-carry-to-100', grade: 2, number: 4,
    title: 'Phép cộng, phép trừ có nhớ trong phạm vi 100', shortTitle: 'Cộng trừ có nhớ', slug: 'cong-tru-co-nho-trong-pham-vi-100',
    description: 'Luyện đặt tính và cộng, trừ có nhớ với các số trong phạm vi 100.',
    semester: 1, textbookLessons: [19, 20, 21, 22, 23, 24], icon: '🧮', color: 'from-blue-500 to-indigo-600', backgroundColor: 'bg-blue-50', developmentStatus: 'ready',
    skills: [
      { id: 'carry-add-one-digit', title: 'Cộng có nhớ với một chữ số', description: 'Cộng số có hai chữ số với số có một chữ số.', icon: '➕', questionTypes: ['carry-add-one-digit'], defaultWeight: 25 },
      { id: 'carry-add-two-digit', title: 'Cộng hai số có hai chữ số', description: 'Đặt tính và cộng có nhớ.', icon: '🧮', questionTypes: ['carry-add-two-digit'], defaultWeight: 25 },
      { id: 'borrow-subtract-one-digit', title: 'Trừ có nhớ với một chữ số', description: 'Trừ số có một chữ số khỏi số có hai chữ số.', icon: '➖', questionTypes: ['borrow-subtract-one-digit'], defaultWeight: 25 },
      { id: 'borrow-subtract-two-digit', title: 'Trừ hai số có hai chữ số', description: 'Đặt tính và trừ có nhớ.', icon: '📝', questionTypes: ['borrow-subtract-two-digit'], defaultWeight: 25 },
    ],
  },
  {
    id: 'grade-2-flat-geometry', grade: 2, number: 5,
    title: 'Điểm, đường và hình phẳng', shortTitle: 'Hình phẳng', slug: 'diem-duong-va-hinh-phang',
    description: 'Nhận biết điểm, các loại đường, đường gấp khúc và hình tứ giác.',
    semester: 1, textbookLessons: [25, 26, 27, 28], icon: '📐', color: 'from-orange-400 to-amber-500', backgroundColor: 'bg-orange-50', developmentStatus: 'ready',
    skills: [
      { id: 'points-and-lines', title: 'Điểm và các loại đường', description: 'Nhận biết điểm, đoạn thẳng, đường thẳng và đường cong.', icon: '📍', questionTypes: ['identify-point-line', 'collinear-points'], defaultWeight: 35 },
      { id: 'broken-line', title: 'Đường gấp khúc', description: 'Nhận biết và tính độ dài đường gấp khúc.', icon: '〽️', questionTypes: ['identify-broken-line', 'broken-line-length'], defaultWeight: 35 },
      { id: 'quadrilateral', title: 'Hình tứ giác', description: 'Nhận biết hình có bốn cạnh.', icon: '🔷', questionTypes: ['recognize-quadrilateral', 'count-quadrilaterals'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-2-time-calendar', grade: 2, number: 6,
    title: 'Ngày, giờ, phút và tháng', shortTitle: 'Thời gian và lịch', slug: 'ngay-gio-phut-va-thang',
    description: 'Đọc đồng hồ, xem lịch và nhận biết quan hệ giữa các đơn vị thời gian.',
    semester: 1, textbookLessons: [29, 30, 31, 32], icon: '🕐', color: 'from-yellow-400 to-orange-500', backgroundColor: 'bg-yellow-50', developmentStatus: 'ready',
    skills: [
      { id: 'hours-minutes', title: 'Giờ và phút', description: 'Đọc giờ hơn, giờ kém trên đồng hồ.', icon: '🕐', questionTypes: ['read-clock-five-minutes', 'match-digital-time'], defaultWeight: 40 },
      { id: 'days-months', title: 'Ngày và tháng', description: 'Nhận biết số ngày và thứ tự các tháng.', icon: '📅', questionTypes: ['days-in-month', 'month-order'], defaultWeight: 30 },
      { id: 'read-calendar-grade-2', title: 'Xem lịch', description: 'Tìm ngày, thứ và sự kiện trên lịch.', icon: '🗓️', questionTypes: ['calendar-date', 'calendar-distance'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-2-semester-1-review', grade: 2, number: 7,
    title: 'Ôn tập học kỳ I', shortTitle: 'Ôn tập học kỳ I', slug: 'on-tap-hoc-ky-1',
    description: 'Ôn phép tính, hình phẳng, đo lường, giờ lịch và bài toán tổng hợp.',
    semester: 1, textbookLessons: [33, 34, 35, 36], icon: '📚', color: 'from-pink-400 to-rose-500', backgroundColor: 'bg-pink-50', developmentStatus: 'ready',
    skills: [
      { id: 'semester-1-arithmetic', title: 'Ôn phép tính', description: 'Ôn cộng trừ trong phạm vi 20 và 100.', icon: '➕', questionTypes: ['review-add-subtract'], defaultWeight: 25 },
      { id: 'semester-1-geometry', title: 'Ôn hình phẳng', description: 'Ôn điểm, đường và hình tứ giác.', icon: '📐', questionTypes: ['review-flat-geometry'], defaultWeight: 20 },
      { id: 'semester-1-measurement', title: 'Ôn đo lường', description: 'Ôn ki-lô-gam và lít.', icon: '⚖️', questionTypes: ['review-measurement'], defaultWeight: 15 },
      { id: 'semester-1-time-calendar', title: 'Ôn giờ và lịch', description: 'Ôn đọc đồng hồ và xem lịch.', icon: '🕐', questionTypes: ['review-time-calendar'], defaultWeight: 20 },
      { id: 'semester-1-word-problems', title: 'Ôn bài toán', description: 'Giải bài toán thực tế tổng hợp.', icon: '📖', questionTypes: ['review-word-problem'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-2-multiplication-division', grade: 2, number: 8,
    title: 'Phép nhân và phép chia', shortTitle: 'Nhân và chia', slug: 'phep-nhan-va-phep-chia',
    description: 'Làm quen phép nhân, phép chia và luyện bảng nhân, bảng chia 2 và 5.',
    semester: 2, textbookLessons: [37, 38, 39, 40, 41, 42, 43, 44, 45], icon: '✖️', color: 'from-purple-500 to-violet-600', backgroundColor: 'bg-purple-50', developmentStatus: 'building',
    skills: [
      { id: 'multiplication-concept', title: 'Phép nhân', description: 'Chuyển tổng các số hạng bằng nhau thành phép nhân.', icon: '✖️', questionTypes: ['equal-groups', 'repeated-addition'], defaultWeight: 20 },
      { id: 'tables-2-5', title: 'Bảng nhân 2 và 5', description: 'Tính và vận dụng bảng nhân 2, bảng nhân 5.', icon: '🔢', questionTypes: ['times-table-2', 'times-table-5'], defaultWeight: 30 },
      { id: 'division-concept', title: 'Phép chia', description: 'Chia đều và chia theo nhóm.', icon: '➗', questionTypes: ['share-equally', 'grouping-division'], defaultWeight: 20 },
      { id: 'division-tables-2-5', title: 'Bảng chia 2 và 5', description: 'Tính và vận dụng bảng chia 2, bảng chia 5.', icon: '🧮', questionTypes: ['division-table-2', 'division-table-5'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-2-solids', grade: 2, number: 9,
    title: 'Khối trụ và khối cầu', shortTitle: 'Hình khối', slug: 'khoi-tru-va-khoi-cau',
    description: 'Nhận biết khối trụ, khối cầu và liên hệ với đồ vật thực tế.',
    semester: 2, textbookLessons: [46, 47], icon: '⚽', color: 'from-rose-400 to-pink-500', backgroundColor: 'bg-rose-50', developmentStatus: 'building',
    skills: [
      { id: 'recognize-cylinder', title: 'Khối trụ', description: 'Nhận biết đặc điểm và đồ vật dạng khối trụ.', icon: '🥫', questionTypes: ['identify-cylinder', 'cylinder-object'], defaultWeight: 45 },
      { id: 'recognize-sphere', title: 'Khối cầu', description: 'Nhận biết đặc điểm và đồ vật dạng khối cầu.', icon: '⚽', questionTypes: ['identify-sphere', 'sphere-object'], defaultWeight: 45 },
      { id: 'compare-solids', title: 'Phân loại hình khối', description: 'So sánh và phân loại khối trụ, khối cầu.', icon: '🧩', questionTypes: ['sort-solids'], defaultWeight: 10 },
    ],
  },
  {
    id: 'grade-2-numbers-to-1000', grade: 2, number: 10,
    title: 'Các số trong phạm vi 1 000', shortTitle: 'Số đến 1 000', slug: 'cac-so-trong-pham-vi-1000',
    description: 'Đọc, viết, phân tích và so sánh các số có ba chữ số.',
    semester: 2, textbookLessons: [48, 49, 50, 51, 52, 53, 54], icon: '🔟', color: 'from-sky-500 to-blue-600', backgroundColor: 'bg-sky-50', developmentStatus: 'building',
    skills: [
      { id: 'hundreds-tens-ones', title: 'Trăm, chục và đơn vị', description: 'Nhận biết cấu tạo số có ba chữ số.', icon: '🧱', questionTypes: ['base-ten-blocks', 'place-value-1000'], defaultWeight: 30 },
      { id: 'read-write-1000', title: 'Đọc và viết số', description: 'Đọc, viết số và viết số thành tổng.', icon: '✍️', questionTypes: ['read-number-1000', 'expanded-form'], defaultWeight: 30 },
      { id: 'compare-1000', title: 'So sánh số', description: 'So sánh và sắp xếp các số có ba chữ số.', icon: '⚖️', questionTypes: ['compare-number-1000', 'order-number-1000'], defaultWeight: 25 },
      { id: 'round-hundreds-tens', title: 'Số tròn trăm, tròn chục', description: 'Nhận biết và hoàn thành dãy số tròn.', icon: '🎯', questionTypes: ['round-hundred', 'round-ten-sequence'], defaultWeight: 15 },
    ],
  },
  {
    id: 'grade-2-length-money', grade: 2, number: 11,
    title: 'Độ dài và tiền Việt Nam', shortTitle: 'Độ dài và tiền', slug: 'do-dai-va-tien-viet-nam',
    description: 'Luyện đơn vị đề-xi-mét, mét, ki-lô-mét và nhận biết tiền Việt Nam.',
    semester: 2, textbookLessons: [55, 56, 57, 58], icon: '📏', color: 'from-lime-400 to-green-500', backgroundColor: 'bg-lime-50', developmentStatus: 'building',
    skills: [
      { id: 'length-units-grade-2', title: 'Đề-xi-mét, mét, ki-lô-mét', description: 'Chọn và đổi đơn vị độ dài phù hợp.', icon: '📏', questionTypes: ['choose-length-unit', 'convert-simple-length'], defaultWeight: 35 },
      { id: 'measure-length-grade-2', title: 'Đo và ước lượng', description: 'Đo, ước lượng và so sánh độ dài.', icon: '📐', questionTypes: ['measure-length', 'estimate-length'], defaultWeight: 30 },
      { id: 'vietnamese-money', title: 'Tiền Việt Nam', description: 'Nhận biết mệnh giá và tính số tiền đơn giản.', icon: '💵', questionTypes: ['recognize-money', 'count-money', 'buying-problem'], defaultWeight: 35 },
    ],
  },
  {
    id: 'grade-2-add-subtract-to-1000', grade: 2, number: 12,
    title: 'Phép cộng, phép trừ trong phạm vi 1 000', shortTitle: 'Cộng trừ đến 1 000', slug: 'cong-tru-trong-pham-vi-1000',
    description: 'Luyện đặt tính và cộng, trừ có nhớ hoặc không nhớ trong phạm vi 1 000.',
    semester: 2, textbookLessons: [59, 60, 61, 62, 63], icon: '🧮', color: 'from-indigo-500 to-blue-600', backgroundColor: 'bg-indigo-50', developmentStatus: 'building',
    skills: [
      { id: 'addition-no-carry-1000', title: 'Cộng không nhớ', description: 'Cộng các số trong phạm vi 1 000 không nhớ.', icon: '➕', questionTypes: ['addition-no-carry-1000'], defaultWeight: 20 },
      { id: 'addition-carry-1000', title: 'Cộng có nhớ', description: 'Cộng các số trong phạm vi 1 000 có nhớ.', icon: '🧮', questionTypes: ['addition-carry-1000'], defaultWeight: 30 },
      { id: 'subtraction-no-borrow-1000', title: 'Trừ không nhớ', description: 'Trừ các số trong phạm vi 1 000 không nhớ.', icon: '➖', questionTypes: ['subtraction-no-borrow-1000'], defaultWeight: 20 },
      { id: 'subtraction-borrow-1000', title: 'Trừ có nhớ', description: 'Trừ các số trong phạm vi 1 000 có nhớ.', icon: '📝', questionTypes: ['subtraction-borrow-1000'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-2-statistics-probability', grade: 2, number: 13,
    title: 'Thống kê và xác suất đơn giản', shortTitle: 'Thống kê và xác suất', slug: 'thong-ke-va-xac-suat-don-gian',
    description: 'Thu thập, phân loại, kiểm đếm dữ liệu và nhận biết khả năng xảy ra.',
    semester: 2, textbookLessons: [64, 65, 66, 67], icon: '📊', color: 'from-teal-400 to-cyan-500', backgroundColor: 'bg-teal-50', developmentStatus: 'building',
    skills: [
      { id: 'collect-classify-data', title: 'Thu thập và phân loại', description: 'Phân nhóm và kiểm đếm dữ liệu.', icon: '🗂️', questionTypes: ['classify-data', 'count-data'], defaultWeight: 35 },
      { id: 'picture-chart', title: 'Biểu đồ tranh', description: 'Đọc, hoàn thành và trả lời câu hỏi từ biểu đồ tranh.', icon: '📊', questionTypes: ['read-picture-chart', 'complete-picture-chart'], defaultWeight: 35 },
      { id: 'simple-probability', title: 'Khả năng xảy ra', description: 'Nhận biết chắc chắn, có thể và không thể.', icon: '🎲', questionTypes: ['certain-possible-impossible'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-2-final-review', grade: 2, number: 14,
    title: 'Ôn tập cuối năm', shortTitle: 'Ôn tập cuối năm', slug: 'on-tap-cuoi-nam',
    description: 'Ôn tổng hợp số, phép tính, hình học, đo lường, thống kê và xác suất.',
    semester: 2, textbookLessons: [68, 69, 70, 71, 72, 73, 74, 75], icon: '🏆', color: 'from-fuchsia-500 to-purple-600', backgroundColor: 'bg-fuchsia-50', developmentStatus: 'building',
    skills: [
      { id: 'final-numbers-arithmetic', title: 'Số và phép tính', description: 'Ôn số đến 1 000 và các phép tính đã học.', icon: '🔢', questionTypes: ['final-number', 'final-add-subtract'], defaultWeight: 30 },
      { id: 'final-multiply-divide', title: 'Nhân và chia', description: 'Ôn bảng nhân, bảng chia 2 và 5.', icon: '✖️', questionTypes: ['final-multiply-divide'], defaultWeight: 20 },
      { id: 'final-geometry', title: 'Hình học', description: 'Ôn hình phẳng, hình khối và đường gấp khúc.', icon: '📐', questionTypes: ['final-geometry'], defaultWeight: 15 },
      { id: 'final-measurement', title: 'Đo lường', description: 'Ôn độ dài, khối lượng, dung tích, thời gian và tiền.', icon: '📏', questionTypes: ['final-measurement'], defaultWeight: 20 },
      { id: 'final-data-probability', title: 'Dữ liệu và xác suất', description: 'Ôn biểu đồ tranh và khả năng xảy ra.', icon: '📊', questionTypes: ['final-data-probability'], defaultWeight: 15 },
    ],
  },
];

export function getGrade2ModulesBySemester(semester: Grade2Semester) {
  return grade2PracticeModules.filter((practiceModule) => practiceModule.semester === semester);
}

export function getGrade2Module(slug: string) {
  return grade2PracticeModules.find((practiceModule) => practiceModule.slug === slug);
}

export function validateGrade2ModuleWeights(practiceModule: Grade2Module) {
  const totalWeight = practiceModule.skills.reduce((total, skill) => total + skill.defaultWeight, 0);
  return { valid: totalWeight === 100, totalWeight };
}
