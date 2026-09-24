export type Grade5Semester = 1 | 2;

export type Grade5Skill = {
  id: string;
  title: string;
  description: string;
  icon: string;
  questionTypes: string[];
  defaultWeight: number;
};

export type Grade5Module = {
  id: string;
  grade: 5;
  number: number;
  title: string;
  shortTitle: string;
  slug: string;
  description: string;
  semester: Grade5Semester;
  textbookLessons: number[];
  icon: string;
  color: string;
  backgroundColor: string;
  developmentStatus: 'ready';
  skills: Grade5Skill[];
};

export const grade5PracticeModes = [
  { id: 'quick', title: 'Luyện nhanh', questionCount: 5, estimatedMinutes: 4, icon: '⚡' },
  { id: 'standard', title: 'Luyện chuẩn', questionCount: 10, estimatedMinutes: 8, icon: '🎯' },
  { id: 'challenge', title: 'Thử thách', questionCount: 15, estimatedMinutes: 13, icon: '🏆' },
  { id: 'review', title: 'Ôn câu sai', questionCount: 10, estimatedMinutes: 8, icon: '🔁' },
] as const;

export const grade5PracticeModules: Grade5Module[] = [
  {
    id: 'grade-5-review', grade: 5, number: 1, title: 'Ôn tập và bổ sung', shortTitle: 'Ôn tập đầu năm', slug: 'on-tap-va-bo-sung',
    description: 'Ôn số tự nhiên, phân số, hỗn số, hình học, đo lường và các phép tính.', semester: 1, textbookLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    icon: '🔄', color: 'from-orange-400 to-amber-500', backgroundColor: 'bg-orange-50', developmentStatus: 'ready',
    skills: [
      { id: 'review-natural-fraction', title: 'Số tự nhiên và phân số', description: 'Ôn cấu tạo số, phân số và hỗn số.', icon: '🔢', questionTypes: ['review-natural-fraction'], defaultWeight: 35 },
      { id: 'review-operations', title: 'Các phép tính', description: 'Tính với số tự nhiên và phân số.', icon: '🧮', questionTypes: ['review-operations'], defaultWeight: 35 },
      { id: 'review-geometry-measurement', title: 'Hình học và đo lường', description: 'Ôn chu vi, diện tích và đơn vị đo.', icon: '📐', questionTypes: ['review-geometry-measurement'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-5-decimals', grade: 5, number: 2, title: 'Số thập phân', shortTitle: 'Số thập phân', slug: 'so-thap-phan',
    description: 'Nhận biết, đọc, viết, so sánh và làm tròn số thập phân.', semester: 1, textbookLessons: [10, 11, 12, 13, 14],
    icon: '🔢', color: 'from-cyan-500 to-blue-600', backgroundColor: 'bg-cyan-50', developmentStatus: 'ready',
    skills: [
      { id: 'decimal-concept', title: 'Khái niệm và cấu tạo', description: 'Đọc, viết và xác định giá trị hàng.', icon: '🔎', questionTypes: ['decimal-concept'], defaultWeight: 35 },
      { id: 'decimal-compare', title: 'So sánh số thập phân', description: 'So sánh phần nguyên và từng hàng thập phân.', icon: '⚖️', questionTypes: ['decimal-compare'], defaultWeight: 30 },
      { id: 'decimal-round', title: 'Làm tròn số thập phân', description: 'Làm tròn đến hàng đơn vị, phần mười hoặc phần trăm.', icon: '🎯', questionTypes: ['decimal-round'], defaultWeight: 35 },
    ],
  },
  {
    id: 'grade-5-area-units', grade: 5, number: 3, title: 'Một số đơn vị đo diện tích', shortTitle: 'Đơn vị diện tích', slug: 'don-vi-do-dien-tich',
    description: 'Luyện ki-lô-mét vuông, héc-ta và quan hệ giữa các đơn vị diện tích.', semester: 1, textbookLessons: [15, 16, 17, 18],
    icon: '🗺️', color: 'from-emerald-500 to-teal-600', backgroundColor: 'bg-emerald-50', developmentStatus: 'ready',
    skills: [
      { id: 'hectare-square-kilometre', title: 'Héc-ta và ki-lô-mét vuông', description: 'Đổi ha, km² và m².', icon: '🗺️', questionTypes: ['hectare-square-kilometre'], defaultWeight: 55 },
      { id: 'area-unit-relations', title: 'Quan hệ đơn vị diện tích', description: 'Đổi và so sánh các đơn vị.', icon: '🔄', questionTypes: ['area-unit-relations'], defaultWeight: 45 },
    ],
  },
  {
    id: 'grade-5-decimal-operations', grade: 5, number: 4, title: 'Các phép tính với số thập phân', shortTitle: 'Tính với số thập phân', slug: 'phep-tinh-voi-so-thap-phan',
    description: 'Cộng, trừ, nhân, chia số thập phân và nhân chia nhẩm với 10, 100, 1 000.', semester: 1, textbookLessons: [19, 20, 21, 22, 23, 24],
    icon: '🧮', color: 'from-indigo-500 to-violet-600', backgroundColor: 'bg-indigo-50', developmentStatus: 'ready',
    skills: [
      { id: 'decimal-add-subtract', title: 'Cộng và trừ', description: 'Đặt dấu phẩy thẳng cột rồi tính.', icon: '➕', questionTypes: ['decimal-add-subtract'], defaultWeight: 35 },
      { id: 'decimal-multiply-divide', title: 'Nhân và chia', description: 'Tính với số thập phân.', icon: '✖️', questionTypes: ['decimal-multiply-divide'], defaultWeight: 40 },
      { id: 'decimal-powers-ten', title: 'Nhân chia nhẩm', description: 'Dịch chuyển dấu phẩy với 10, 100, 1 000.', icon: '⚡', questionTypes: ['decimal-powers-ten'], defaultWeight: 25 },
    ],
  },
  {
    id: 'grade-5-plane-geometry', grade: 5, number: 5, title: 'Một số hình phẳng, chu vi và diện tích', shortTitle: 'Hình phẳng', slug: 'hinh-phang-chu-vi-dien-tich',
    description: 'Tính diện tích tam giác, hình thang; chu vi, diện tích hình tròn và thực hành vẽ hình.', semester: 1, textbookLessons: [25, 26, 27, 28, 29],
    icon: '📐', color: 'from-rose-500 to-pink-600', backgroundColor: 'bg-rose-50', developmentStatus: 'ready',
    skills: [
      { id: 'triangle-area', title: 'Diện tích tam giác', description: 'Lấy đáy nhân chiều cao rồi chia 2.', icon: '🔺', questionTypes: ['triangle-area'], defaultWeight: 30 },
      { id: 'trapezoid-area', title: 'Diện tích hình thang', description: 'Tổng hai đáy nhân chiều cao rồi chia 2.', icon: '⏢', questionTypes: ['trapezoid-area'], defaultWeight: 30 },
      { id: 'circle-perimeter-area', title: 'Hình tròn', description: 'Tính chu vi và diện tích với 3,14.', icon: '⭕', questionTypes: ['circle-perimeter-area'], defaultWeight: 40 },
    ],
  },
  {
    id: 'grade-5-semester-1-review', grade: 5, number: 6, title: 'Ôn tập học kỳ I', shortTitle: 'Ôn tập học kỳ I', slug: 'on-tap-hoc-ky-1',
    description: 'Ôn số thập phân, các phép tính, hình phẳng và đo lường.', semester: 1, textbookLessons: [30, 31, 32, 33, 34, 35],
    icon: '📚', color: 'from-fuchsia-500 to-purple-600', backgroundColor: 'bg-fuchsia-50', developmentStatus: 'ready',
    skills: [
      { id: 'semester-1-decimals', title: 'Ôn số thập phân', description: 'Đọc, so sánh, làm tròn và tính.', icon: '🔢', questionTypes: ['semester-1-decimals'], defaultWeight: 40 },
      { id: 'semester-1-geometry', title: 'Ôn hình phẳng', description: 'Diện tích tam giác, hình thang và hình tròn.', icon: '📐', questionTypes: ['semester-1-geometry'], defaultWeight: 35 },
      { id: 'semester-1-measurement', title: 'Ôn đo lường', description: 'Đổi và vận dụng các đơn vị đo.', icon: '📏', questionTypes: ['semester-1-measurement'], defaultWeight: 25 },
    ],
  },
  {
    id: 'grade-5-ratio-percent', grade: 5, number: 7, title: 'Tỉ số và các bài toán liên quan', shortTitle: 'Tỉ số và phần trăm', slug: 'ti-so-va-bai-toan-lien-quan',
    description: 'Luyện tỉ số, tỉ lệ bản đồ, bài toán tổng – tỉ, hiệu – tỉ và tỉ số phần trăm.', semester: 2, textbookLessons: [36, 37, 38, 39, 40, 41, 42, 43, 44],
    icon: '💯', color: 'from-amber-500 to-orange-600', backgroundColor: 'bg-amber-50', developmentStatus: 'ready',
    skills: [
      { id: 'ratio-map-scale', title: 'Tỉ số và tỉ lệ bản đồ', description: 'Lập tỉ số và tính độ dài thực.', icon: '🗺️', questionTypes: ['ratio-map-scale'], defaultWeight: 25 },
      { id: 'sum-difference-ratio', title: 'Tổng – tỉ và hiệu – tỉ', description: 'Giải bài toán bằng sơ đồ phần.', icon: '🧩', questionTypes: ['sum-difference-ratio'], defaultWeight: 30 },
      { id: 'percent-problems', title: 'Tỉ số phần trăm', description: 'Tìm tỉ số phần trăm và giá trị phần trăm.', icon: '💯', questionTypes: ['percent-problems'], defaultWeight: 45 },
    ],
  },
  {
    id: 'grade-5-volume-units', grade: 5, number: 8, title: 'Thể tích, đơn vị đo thể tích', shortTitle: 'Đơn vị thể tích', slug: 'the-tich-va-don-vi-do',
    description: 'Nhận biết thể tích và đổi xăng-ti-mét khối, đề-xi-mét khối, mét khối.', semester: 2, textbookLessons: [45, 46, 47, 48],
    icon: '🧱', color: 'from-sky-500 to-cyan-600', backgroundColor: 'bg-sky-50', developmentStatus: 'ready',
    skills: [
      { id: 'volume-concept', title: 'Khái niệm thể tích', description: 'So sánh và đếm khối lập phương đơn vị.', icon: '🧱', questionTypes: ['volume-concept'], defaultWeight: 35 },
      { id: 'volume-unit-conversion', title: 'Đơn vị thể tích', description: 'Đổi cm³, dm³ và m³.', icon: '🔄', questionTypes: ['volume-unit-conversion'], defaultWeight: 65 },
    ],
  },
  {
    id: 'grade-5-solid-area-volume', grade: 5, number: 9, title: 'Diện tích và thể tích của một số hình khối', shortTitle: 'Hình hộp và lập phương', slug: 'dien-tich-the-tich-hinh-khoi',
    description: 'Tính diện tích xung quanh, toàn phần và thể tích hình hộp chữ nhật, hình lập phương.', semester: 2, textbookLessons: [49, 50, 51, 52, 53, 54, 55],
    icon: '📦', color: 'from-blue-500 to-indigo-600', backgroundColor: 'bg-blue-50', developmentStatus: 'ready',
    skills: [
      { id: 'cuboid-surface-area', title: 'Diện tích hình hộp', description: 'Tính diện tích xung quanh và toàn phần.', icon: '📦', questionTypes: ['cuboid-surface-area'], defaultWeight: 35 },
      { id: 'cube-surface-area', title: 'Diện tích hình lập phương', description: 'Vận dụng diện tích một mặt.', icon: '🎲', questionTypes: ['cube-surface-area'], defaultWeight: 25 },
      { id: 'solid-volume', title: 'Thể tích hình khối', description: 'Tính thể tích hình hộp và lập phương.', icon: '🧱', questionTypes: ['solid-volume'], defaultWeight: 40 },
    ],
  },
  {
    id: 'grade-5-time-speed', grade: 5, number: 10, title: 'Số đo thời gian, vận tốc và chuyển động đều', shortTitle: 'Thời gian và vận tốc', slug: 'thoi-gian-van-toc-chuyen-dong',
    description: 'Tính với số đo thời gian và giải bài toán vận tốc, quãng đường, thời gian.', semester: 2, textbookLessons: [56, 57, 58, 59, 60, 61, 62],
    icon: '🚗', color: 'from-red-500 to-orange-600', backgroundColor: 'bg-red-50', developmentStatus: 'ready',
    skills: [
      { id: 'time-calculation', title: 'Tính với thời gian', description: 'Đổi, cộng, trừ, nhân và chia số đo thời gian.', icon: '⏱️', questionTypes: ['time-calculation'], defaultWeight: 35 },
      { id: 'speed-distance-time', title: 'Chuyển động đều', description: 'Vận dụng v = s : t, s = v × t, t = s : v.', icon: '🚗', questionTypes: ['speed-distance-time'], defaultWeight: 65 },
    ],
  },
  {
    id: 'grade-5-statistics-probability', grade: 5, number: 11, title: 'Một số yếu tố thống kê và xác suất', shortTitle: 'Thống kê và xác suất', slug: 'thong-ke-va-xac-suat',
    description: 'Thu thập, phân loại dữ liệu, đọc biểu đồ hình quạt tròn và tính tỉ số số lần lặp lại.', semester: 2, textbookLessons: [63, 64, 65, 66, 67],
    icon: '📊', color: 'from-teal-500 to-emerald-600', backgroundColor: 'bg-teal-50', developmentStatus: 'ready',
    skills: [
      { id: 'data-analysis', title: 'Thu thập và phân loại', description: 'Đọc, sắp xếp và nhận xét dữ liệu.', icon: '🔢', questionTypes: ['data-analysis'], defaultWeight: 35 },
      { id: 'pie-chart', title: 'Biểu đồ hình quạt tròn', description: 'Đọc tỉ lệ phần trăm trên biểu đồ.', icon: '🥧', questionTypes: ['pie-chart'], defaultWeight: 35 },
      { id: 'relative-frequency', title: 'Tỉ số lặp lại', description: 'So sánh số lần xuất hiện với tổng số lần thực hiện.', icon: '🎲', questionTypes: ['relative-frequency'], defaultWeight: 30 },
    ],
  },
  {
    id: 'grade-5-final-review', grade: 5, number: 12, title: 'Ôn tập cuối năm', shortTitle: 'Ôn tập cuối năm', slug: 'on-tap-cuoi-nam',
    description: 'Ôn số, phép tính, tỉ số phần trăm, hình học, đo lường, chuyển động, thống kê và xác suất.', semester: 2, textbookLessons: [68, 69, 70, 71, 72, 73, 74, 75],
    icon: '🏆', color: 'from-pink-500 to-rose-600', backgroundColor: 'bg-pink-50', developmentStatus: 'ready',
    skills: [
      { id: 'final-number-operations', title: 'Ôn số và phép tính', description: 'Số tự nhiên, phân số và số thập phân.', icon: '🧮', questionTypes: ['final-number-operations'], defaultWeight: 30 },
      { id: 'final-ratio-geometry', title: 'Ôn tỉ số và hình học', description: 'Phần trăm, diện tích và thể tích.', icon: '📐', questionTypes: ['final-ratio-geometry'], defaultWeight: 30 },
      { id: 'final-motion-data', title: 'Ôn chuyển động và dữ liệu', description: 'Vận tốc, thời gian, thống kê và xác suất.', icon: '📊', questionTypes: ['final-motion-data'], defaultWeight: 40 },
    ],
  },
];

export function getGrade5ModulesBySemester(semester: Grade5Semester) {
  return grade5PracticeModules.filter((practiceModule) => practiceModule.semester === semester);
}

export function getGrade5ReadyModules() {
  return grade5PracticeModules;
}
