export type Grade3Semester = 1 | 2;
export type Grade3DevelopmentStatus = 'ready' | 'building' | 'planned';

export type Grade3Skill = {
  id: string; title: string; description: string; icon: string;
  questionTypes: string[]; defaultWeight: number;
};

export type Grade3Module = {
  id: string; grade: 3; number: number; title: string; shortTitle: string;
  slug: string; description: string; semester: Grade3Semester;
  textbookLessons: number[]; icon: string; color: string; backgroundColor: string;
  developmentStatus: Grade3DevelopmentStatus; skills: Grade3Skill[];
};

export const grade3PracticeModes = [
  { id: 'quick', title: 'Luyện nhanh', questionCount: 5, estimatedMinutes: 4, icon: '⚡' },
  { id: 'standard', title: 'Luyện chuẩn', questionCount: 10, estimatedMinutes: 7, icon: '🎯' },
  { id: 'challenge', title: 'Thử thách', questionCount: 15, estimatedMinutes: 12, icon: '🏆' },
  { id: 'review', title: 'Ôn câu sai', questionCount: 10, estimatedMinutes: 7, icon: '🔁' },
] as const;

export const grade3PracticeModules: Grade3Module[] = [
  {
    id: 'grade-3-review-and-extend', grade: 3, number: 1,
    title: 'Ôn tập và bổ sung', shortTitle: 'Ôn tập đầu năm', slug: 'on-tap-va-bo-sung',
    description: 'Ôn số và phép tính đến 1 000, các bảng nhân chia đã học, hình học và đo lường.',
    semester: 1, textbookLessons: [1, 2, 3, 4, 5, 6, 7, 8], icon: '🔄', color: 'from-emerald-400 to-teal-500', backgroundColor: 'bg-emerald-50', developmentStatus: 'ready',
    skills: [
      { id: 'review-numbers-1000', title: 'Số và phép tính đến 1 000', description: 'Ôn đọc, viết, so sánh, cộng và trừ.', icon: '🔢', questionTypes: ['review-numbers-1000', 'review-add-subtract-1000'], defaultWeight: 35 },
      { id: 'operation-components-grade-3', title: 'Thành phần phép tính', description: 'Tìm số hạng, số bị trừ, số trừ chưa biết.', icon: '🧩', questionTypes: ['unknown-operation-component'], defaultWeight: 20 },
      { id: 'review-tables-2-to-5', title: 'Bảng nhân chia 2–5', description: 'Ôn các bảng nhân, bảng chia đã học.', icon: '✖️', questionTypes: ['review-times-tables-2-5'], defaultWeight: 25 },
      { id: 'review-geometry-measurement', title: 'Hình học và đo lường', description: 'Ôn hình phẳng, hình khối và các đơn vị đo.', icon: '📐', questionTypes: ['review-geometry-measurement'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-3-multiplication-division-tables', grade: 3, number: 2,
    title: 'Bảng nhân, bảng chia', shortTitle: 'Bảng nhân chia', slug: 'bang-nhan-bang-chia',
    description: 'Luyện bảng nhân, bảng chia 6, 7, 8, 9; thành phần phép tính và một phần mấy.',
    semester: 1, textbookLessons: [9, 10, 11, 12, 13, 14, 15], icon: '✖️', color: 'from-violet-500 to-purple-600', backgroundColor: 'bg-violet-50', developmentStatus: 'ready',
    skills: [
      { id: 'tables-6-to-9', title: 'Bảng nhân chia 6–9', description: 'Tính nhẩm và vận dụng các bảng nhân chia.', icon: '🧮', questionTypes: ['times-tables-6-9', 'division-tables-6-9'], defaultWeight: 50 },
      { id: 'multiply-divide-components', title: 'Thành phần nhân chia', description: 'Tìm thừa số, số bị chia và số chia chưa biết.', icon: '🧩', questionTypes: ['unknown-multiply-divide-component'], defaultWeight: 25 },
      { id: 'unit-fractions', title: 'Một phần mấy', description: 'Nhận biết một phần mấy qua hình ảnh và tình huống chia đều.', icon: '🍕', questionTypes: ['recognize-unit-fraction'], defaultWeight: 25 },
    ],
  },
  {
    id: 'grade-3-plane-and-solid-geometry', grade: 3, number: 3,
    title: 'Hình phẳng và hình khối', shortTitle: 'Hình học', slug: 'hinh-phang-va-hinh-khoi',
    description: 'Nhận biết trung điểm, hình tròn, góc, hình chữ nhật, hình vuông và các khối quen thuộc.',
    semester: 1, textbookLessons: [16, 17, 18, 19, 20, 21, 22], icon: '📐', color: 'from-orange-400 to-amber-500', backgroundColor: 'bg-orange-50', developmentStatus: 'ready',
    skills: [
      { id: 'midpoint', title: 'Điểm ở giữa và trung điểm', description: 'Nhận biết điểm ở giữa và trung điểm đoạn thẳng.', icon: '📍', questionTypes: ['identify-midpoint'], defaultWeight: 20 },
      { id: 'circle-parts', title: 'Hình tròn', description: 'Nhận biết tâm, bán kính và đường kính.', icon: '⭕', questionTypes: ['circle-center-radius-diameter'], defaultWeight: 20 },
      { id: 'angles-grade-3', title: 'Góc vuông và góc không vuông', description: 'Nhận biết, kiểm tra các loại góc.', icon: '📐', questionTypes: ['identify-right-angle'], defaultWeight: 20 },
      { id: 'quadrilaterals-grade-3', title: 'Hình chữ nhật và hình vuông', description: 'Phân loại tam giác, tứ giác, chữ nhật và vuông.', icon: '🔷', questionTypes: ['classify-plane-shapes'], defaultWeight: 20 },
      { id: 'cube-cuboid-grade-3', title: 'Khối lập phương và hộp chữ nhật', description: 'Nhận biết hình khối qua vật thật.', icon: '🧊', questionTypes: ['identify-cube-cuboid'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-3-multiply-divide-to-100', grade: 3, number: 4,
    title: 'Phép nhân, phép chia trong phạm vi 100', shortTitle: 'Nhân chia đến 100', slug: 'nhan-chia-trong-pham-vi-100',
    description: 'Nhân, chia số có hai chữ số; gấp, giảm một số; chia hết, chia có dư và bài toán hai bước.',
    semester: 1, textbookLessons: [23, 24, 25, 26, 27, 28, 29], icon: '➗', color: 'from-cyan-500 to-blue-600', backgroundColor: 'bg-cyan-50', developmentStatus: 'ready',
    skills: [
      { id: 'multiply-two-by-one', title: 'Nhân số có hai chữ số', description: 'Nhân số có hai chữ số với số có một chữ số.', icon: '✖️', questionTypes: ['multiply-2-digit-by-1-digit'], defaultWeight: 20 },
      { id: 'division-remainder', title: 'Chia hết và chia có dư', description: 'Nhận biết số dư và kiểm tra phép chia.', icon: '➗', questionTypes: ['division-with-remainder'], defaultWeight: 25 },
      { id: 'divide-two-by-one', title: 'Chia số có hai chữ số', description: 'Chia số có hai chữ số cho số có một chữ số.', icon: '🧮', questionTypes: ['divide-2-digit-by-1-digit'], defaultWeight: 20 },
      { id: 'times-as-many', title: 'Gấp và giảm một số lần', description: 'Giải tình huống gấp hoặc giảm theo số lần.', icon: '📈', questionTypes: ['times-as-many', 'reduce-times'], defaultWeight: 20 },
      { id: 'two-step-problems-grade-3', title: 'Bài toán hai bước', description: 'Chọn và thực hiện hai phép tính liên tiếp.', icon: '📖', questionTypes: ['two-step-word-problem'], defaultWeight: 15 },
    ],
  },
  {
    id: 'grade-3-measurement-units', grade: 3, number: 5,
    title: 'Độ dài, khối lượng, dung tích và nhiệt độ', shortTitle: 'Đại lượng đo', slug: 'do-luong-va-nhiet-do',
    description: 'Làm quen mi-li-mét, gam, mi-li-lít, độ C và vận dụng trong tình huống thực tế.',
    semester: 1, textbookLessons: [30, 31, 32, 33, 34, 35], icon: '🌡️', color: 'from-rose-400 to-pink-500', backgroundColor: 'bg-rose-50', developmentStatus: 'ready',
    skills: [
      { id: 'millimeter', title: 'Mi-li-mét', description: 'Đọc, đo và đổi đơn vị độ dài đơn giản.', icon: '📏', questionTypes: ['millimeter-measurement'], defaultWeight: 25 },
      { id: 'gram', title: 'Gam', description: 'Đọc cân và giải bài toán khối lượng.', icon: '⚖️', questionTypes: ['gram-mass'], defaultWeight: 25 },
      { id: 'milliliter', title: 'Mi-li-lít', description: 'Đọc vạch chia và so sánh dung tích.', icon: '🧪', questionTypes: ['milliliter-capacity'], defaultWeight: 25 },
      { id: 'temperature-celsius', title: 'Nhiệt độ và độ C', description: 'Đọc nhiệt kế và so sánh nhiệt độ.', icon: '🌡️', questionTypes: ['read-temperature-celsius'], defaultWeight: 25 },
    ],
  },
  {
    id: 'grade-3-multiply-divide-to-1000', grade: 3, number: 6,
    title: 'Phép nhân, phép chia trong phạm vi 1 000', shortTitle: 'Nhân chia đến 1 000', slug: 'nhan-chia-trong-pham-vi-1000',
    description: 'Nhân, chia số có ba chữ số; tính giá trị biểu thức và so sánh số lớn gấp mấy lần số bé.',
    semester: 1, textbookLessons: [36, 37, 38, 39, 40], icon: '🧮', color: 'from-indigo-500 to-blue-600', backgroundColor: 'bg-indigo-50', developmentStatus: 'ready',
    skills: [
      { id: 'multiply-three-by-one', title: 'Nhân số có ba chữ số', description: 'Nhân số có ba chữ số với số có một chữ số.', icon: '✖️', questionTypes: ['multiply-3-digit-by-1-digit'], defaultWeight: 30 },
      { id: 'divide-three-by-one', title: 'Chia số có ba chữ số', description: 'Chia số có ba chữ số cho số có một chữ số.', icon: '➗', questionTypes: ['divide-3-digit-by-1-digit'], defaultWeight: 30 },
      { id: 'numerical-expressions', title: 'Biểu thức số', description: 'Tính đúng thứ tự và giá trị biểu thức.', icon: '📝', questionTypes: ['evaluate-expression'], defaultWeight: 25 },
      { id: 'times-comparison', title: 'So sánh gấp mấy lần', description: 'Tìm số lớn gấp mấy lần số bé.', icon: '⚖️', questionTypes: ['multiplicative-comparison'], defaultWeight: 15 },
    ],
  },
  {
    id: 'grade-3-semester-1-review', grade: 3, number: 7,
    title: 'Ôn tập học kỳ I', shortTitle: 'Ôn tập học kỳ I', slug: 'on-tap-hoc-ky-1',
    description: 'Ôn nhân chia đến 1 000, biểu thức số, hình học, đo lường và bài toán tổng hợp.',
    semester: 1, textbookLessons: [41, 42, 43, 44], icon: '📚', color: 'from-fuchsia-500 to-purple-600', backgroundColor: 'bg-fuchsia-50', developmentStatus: 'ready',
    skills: [
      { id: 'semester-1-multiply-divide', title: 'Ôn nhân và chia', description: 'Ôn phép nhân, phép chia trong phạm vi 100 và 1 000.', icon: '✖️', questionTypes: ['review-multiply-divide-1000'], defaultWeight: 35 },
      { id: 'semester-1-expressions', title: 'Ôn biểu thức số', description: 'Tính giá trị và tìm thành phần chưa biết.', icon: '🧩', questionTypes: ['review-expressions'], defaultWeight: 25 },
      { id: 'semester-1-geometry-measurement', title: 'Ôn hình học và đo lường', description: 'Ôn góc, hình, khối và các đơn vị đo.', icon: '📐', questionTypes: ['review-geometry-measurement-grade-3'], defaultWeight: 25 },
      { id: 'semester-1-mixed-problems', title: 'Bài toán tổng hợp', description: 'Giải bài toán thực tế bằng một hoặc hai bước.', icon: '📖', questionTypes: ['mixed-word-problem-grade-3'], defaultWeight: 15 },
    ],
  },
  {
    id: 'grade-3-numbers-to-10000', grade: 3, number: 8,
    title: 'Các số đến 10 000', shortTitle: 'Số đến 10 000', slug: 'cac-so-den-10000',
    description: 'Đọc, viết, cấu tạo và so sánh số có bốn chữ số; số La Mã và làm tròn số.',
    semester: 2, textbookLessons: [45, 46, 47, 48, 49], icon: '🔟', color: 'from-sky-500 to-cyan-600', backgroundColor: 'bg-sky-50', developmentStatus: 'ready',
    skills: [
      { id: 'four-digit-numbers', title: 'Số có bốn chữ số', description: 'Đọc, viết và phân tích cấu tạo số.', icon: '🔢', questionTypes: ['read-write-10000', 'place-value-10000'], defaultWeight: 35 },
      { id: 'compare-to-10000', title: 'So sánh số', description: 'So sánh và sắp xếp số trong phạm vi 10 000.', icon: '⚖️', questionTypes: ['compare-order-10000'], defaultWeight: 25 },
      { id: 'roman-numerals', title: 'Chữ số La Mã', description: 'Đọc và viết các số La Mã thường gặp.', icon: '🏛️', questionTypes: ['roman-numerals'], defaultWeight: 20 },
      { id: 'round-tens-hundreds', title: 'Làm tròn số', description: 'Làm tròn đến hàng chục và hàng trăm.', icon: '🎯', questionTypes: ['round-to-ten-hundred'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-3-perimeter-area', grade: 3, number: 9,
    title: 'Chu vi, diện tích một số hình phẳng', shortTitle: 'Chu vi và diện tích', slug: 'chu-vi-va-dien-tich',
    description: 'Tính chu vi hình quen thuộc, nhận biết diện tích và tính diện tích hình chữ nhật, hình vuông.',
    semester: 2, textbookLessons: [50, 51, 52, 53], icon: '📏', color: 'from-lime-500 to-green-600', backgroundColor: 'bg-lime-50', developmentStatus: 'ready',
    skills: [
      { id: 'perimeter-plane-shapes', title: 'Chu vi hình phẳng', description: 'Tính chu vi tam giác, tứ giác, chữ nhật và vuông.', icon: '🔲', questionTypes: ['perimeter-plane-shapes'], defaultWeight: 35 },
      { id: 'area-concept', title: 'Diện tích và xăng-ti-mét vuông', description: 'So sánh diện tích và đếm ô vuông.', icon: '🟩', questionTypes: ['area-concept-square-centimeter'], defaultWeight: 25 },
      { id: 'rectangle-square-area', title: 'Diện tích chữ nhật và vuông', description: 'Vận dụng quy tắc tính diện tích.', icon: '📐', questionTypes: ['rectangle-square-area'], defaultWeight: 40 },
    ],
  },
  {
    id: 'grade-3-arithmetic-to-10000', grade: 3, number: 10,
    title: 'Cộng, trừ, nhân, chia trong phạm vi 10 000', shortTitle: 'Bốn phép tính đến 10 000', slug: 'bon-phep-tinh-den-10000',
    description: 'Luyện cộng, trừ đến 10 000 và nhân, chia số có bốn chữ số với số có một chữ số.',
    semester: 2, textbookLessons: [54, 55, 56, 57, 58], icon: '➕', color: 'from-blue-500 to-indigo-600', backgroundColor: 'bg-blue-50', developmentStatus: 'ready',
    skills: [
      { id: 'add-subtract-10000', title: 'Cộng và trừ đến 10 000', description: 'Đặt tính, tính và kiểm tra kết quả.', icon: '➕', questionTypes: ['add-10000', 'subtract-10000'], defaultWeight: 45 },
      { id: 'multiply-four-by-one', title: 'Nhân số có bốn chữ số', description: 'Nhân với số có một chữ số.', icon: '✖️', questionTypes: ['multiply-4-digit-by-1-digit'], defaultWeight: 25 },
      { id: 'divide-four-by-one', title: 'Chia số có bốn chữ số', description: 'Chia cho số có một chữ số.', icon: '➗', questionTypes: ['divide-4-digit-by-1-digit'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-3-numbers-to-100000', grade: 3, number: 11,
    title: 'Các số đến 100 000', shortTitle: 'Số đến 100 000', slug: 'cac-so-den-100000',
    description: 'Đọc, viết, phân tích và so sánh số có năm chữ số; làm tròn đến hàng nghìn, chục nghìn.',
    semester: 2, textbookLessons: [59, 60, 61, 62], icon: '💯', color: 'from-teal-500 to-emerald-600', backgroundColor: 'bg-teal-50', developmentStatus: 'ready',
    skills: [
      { id: 'five-digit-numbers', title: 'Số có năm chữ số', description: 'Đọc, viết và phân tích cấu tạo số.', icon: '🔢', questionTypes: ['read-write-100000', 'place-value-100000'], defaultWeight: 40 },
      { id: 'compare-to-100000', title: 'So sánh số', description: 'So sánh và sắp xếp số trong phạm vi 100 000.', icon: '⚖️', questionTypes: ['compare-order-100000'], defaultWeight: 30 },
      { id: 'round-thousands', title: 'Làm tròn số lớn', description: 'Làm tròn đến hàng nghìn và hàng chục nghìn.', icon: '🎯', questionTypes: ['round-to-thousand-ten-thousand'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-3-add-subtract-to-100000', grade: 3, number: 12,
    title: 'Phép cộng, phép trừ trong phạm vi 100 000', shortTitle: 'Cộng trừ đến 100 000', slug: 'cong-tru-trong-pham-vi-100000',
    description: 'Luyện đặt tính, tính nhẩm, tính viết và giải bài toán cộng trừ trong phạm vi 100 000.',
    semester: 2, textbookLessons: [63, 64, 65], icon: '🧮', color: 'from-purple-500 to-indigo-600', backgroundColor: 'bg-purple-50', developmentStatus: 'ready',
    skills: [
      { id: 'addition-100000', title: 'Phép cộng đến 100 000', description: 'Đặt tính và cộng các số có đến năm chữ số.', icon: '➕', questionTypes: ['addition-100000'], defaultWeight: 40 },
      { id: 'subtraction-100000', title: 'Phép trừ đến 100 000', description: 'Đặt tính và trừ các số có đến năm chữ số.', icon: '➖', questionTypes: ['subtraction-100000'], defaultWeight: 40 },
      { id: 'word-problems-100000', title: 'Bài toán thực tế', description: 'Vận dụng cộng, trừ để giải bài toán.', icon: '📖', questionTypes: ['add-subtract-word-problem-100000'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-3-time-calendar-money', grade: 3, number: 13,
    title: 'Đồng hồ, tháng – năm và tiền Việt Nam', shortTitle: 'Thời gian và tiền', slug: 'dong-ho-thang-nam-va-tien-viet-nam',
    description: 'Xem giờ chính xác đến phút, đọc lịch tháng – năm và giải tình huống với tiền Việt Nam.',
    semester: 2, textbookLessons: [66, 67, 68, 69], icon: '🕰️', color: 'from-amber-400 to-orange-500', backgroundColor: 'bg-amber-50', developmentStatus: 'ready',
    skills: [
      { id: 'clock-to-minute', title: 'Xem đồng hồ', description: 'Đọc giờ đến phút và tính khoảng thời gian.', icon: '🕰️', questionTypes: ['read-clock-to-minute', 'elapsed-time-simple'], defaultWeight: 35 },
      { id: 'months-years-calendar', title: 'Tháng, năm và lịch', description: 'Đọc lịch, xác định ngày tháng và số ngày.', icon: '📅', questionTypes: ['calendar-month-year'], defaultWeight: 30 },
      { id: 'vietnamese-money-grade-3', title: 'Tiền Việt Nam', description: 'Nhận biết mệnh giá, tính tiền và tiền thừa.', icon: '💵', questionTypes: ['money-grade-3'], defaultWeight: 35 },
    ],
  },
  {
    id: 'grade-3-multiply-divide-to-100000', grade: 3, number: 14,
    title: 'Nhân, chia trong phạm vi 100 000', shortTitle: 'Nhân chia đến 100 000', slug: 'nhan-chia-trong-pham-vi-100000',
    description: 'Nhân và chia số có năm chữ số với số có một chữ số, vận dụng vào bài toán thực tế.',
    semester: 2, textbookLessons: [70, 71, 72], icon: '✖️', color: 'from-red-400 to-rose-500', backgroundColor: 'bg-red-50', developmentStatus: 'planned',
    skills: [
      { id: 'multiply-five-by-one', title: 'Nhân số có năm chữ số', description: 'Nhân số có năm chữ số với số có một chữ số.', icon: '✖️', questionTypes: ['multiply-5-digit-by-1-digit'], defaultWeight: 40 },
      { id: 'divide-five-by-one', title: 'Chia số có năm chữ số', description: 'Chia số có năm chữ số cho số có một chữ số.', icon: '➗', questionTypes: ['divide-5-digit-by-1-digit'], defaultWeight: 40 },
      { id: 'large-number-word-problems', title: 'Bài toán thực tế', description: 'Vận dụng nhân chia trong tình huống gần gũi.', icon: '📖', questionTypes: ['multiply-divide-word-problem-100000'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-3-statistics-probability', grade: 3, number: 15,
    title: 'Thống kê và xác suất đơn giản', shortTitle: 'Thống kê và xác suất', slug: 'thong-ke-va-xac-suat-don-gian',
    description: 'Thu thập, phân loại, ghi chép số liệu bằng bảng và nhận biết khả năng xảy ra của sự kiện.',
    semester: 2, textbookLessons: [73, 74, 75], icon: '📊', color: 'from-cyan-400 to-teal-500', backgroundColor: 'bg-cyan-50', developmentStatus: 'planned',
    skills: [
      { id: 'collect-record-data-grade-3', title: 'Thu thập và ghi chép số liệu', description: 'Phân loại, kiểm đếm và lập bảng số liệu.', icon: '📋', questionTypes: ['collect-classify-table-data'], defaultWeight: 50 },
      { id: 'event-likelihood-grade-3', title: 'Khả năng xảy ra', description: 'Mô tả và so sánh khả năng của một sự kiện.', icon: '🎲', questionTypes: ['event-likelihood-grade-3'], defaultWeight: 30 },
      { id: 'read-data-table-grade-3', title: 'Đọc bảng số liệu', description: 'Trả lời câu hỏi và rút nhận xét từ bảng.', icon: '📊', questionTypes: ['read-data-table'], defaultWeight: 20 },
    ],
  },
  {
    id: 'grade-3-final-review', grade: 3, number: 16,
    title: 'Ôn tập cuối năm', shortTitle: 'Ôn tập cuối năm', slug: 'on-tap-cuoi-nam',
    description: 'Ôn tổng hợp số và phép tính đến 100 000, hình học, đo lường, bảng số liệu và xác suất.',
    semester: 2, textbookLessons: [76, 77, 78, 79, 80, 81], icon: '🏆', color: 'from-fuchsia-500 to-purple-600', backgroundColor: 'bg-fuchsia-50', developmentStatus: 'planned',
    skills: [
      { id: 'final-numbers-100000', title: 'Số đến 100 000', description: 'Ôn đọc, viết, so sánh và làm tròn số.', icon: '🔢', questionTypes: ['final-numbers-grade-3'], defaultWeight: 20 },
      { id: 'final-add-subtract-grade-3', title: 'Cộng và trừ', description: 'Ôn cộng, trừ và giải bài toán.', icon: '➕', questionTypes: ['final-add-subtract-grade-3'], defaultWeight: 20 },
      { id: 'final-multiply-divide-grade-3', title: 'Nhân và chia', description: 'Ôn bảng tính và phép nhân chia đã học.', icon: '✖️', questionTypes: ['final-multiply-divide-grade-3'], defaultWeight: 25 },
      { id: 'final-geometry-measurement-grade-3', title: 'Hình học và đo lường', description: 'Ôn chu vi, diện tích và các đại lượng đo.', icon: '📐', questionTypes: ['final-geometry-measurement-grade-3'], defaultWeight: 20 },
      { id: 'final-data-probability-grade-3', title: 'Dữ liệu và xác suất', description: 'Ôn bảng số liệu và khả năng xảy ra.', icon: '📊', questionTypes: ['final-data-probability-grade-3'], defaultWeight: 15 },
    ],
  },
];

export function getGrade3ModulesBySemester(semester: Grade3Semester) {
  return grade3PracticeModules.filter((practiceModule) => practiceModule.semester === semester);
}

export function getGrade3Module(slug: string) {
  return grade3PracticeModules.find((practiceModule) => practiceModule.slug === slug);
}

export function validateGrade3ModuleWeights(practiceModule: Grade3Module) {
  const totalWeight = practiceModule.skills.reduce((total, skill) => total + skill.defaultWeight, 0);
  return { valid: totalWeight === 100, totalWeight };
}
