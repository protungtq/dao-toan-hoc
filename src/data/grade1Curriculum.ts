export type Semester = 1 | 2;

export type DevelopmentStatus =
  | 'ready'
  | 'building'
  | 'planned';

export type PracticeMode = {
  id: 'quick' | 'standard' | 'challenge' | 'review';
  title: string;
  description: string;
  questionCount: number;
  estimatedMinutes: number;
  icon: string;
};

export type PracticeSkill = {
  id: string;
  title: string;
  description: string;
  icon: string;

  /**
   * Danh sách loại câu hỏi mà bộ sinh câu hỏi có thể sử dụng.
   */
  questionTypes: string[];

  /**
   * Tỷ lệ mặc định của kỹ năng trong một lượt luyện.
   */
  defaultWeight: number;
};

export type TextbookBookDetail = {
  seriesName: string;
  shortName: string;
  volume: 1 | 2;
  lessons: string;
  lessonTitle: string;
  pages: string;
};

export type ModuleTextbookMapping = {
  kntt: TextbookBookDetail;
  pedagogicalFocus: string;
  sgkExerciseForms: string[];
};

export type PracticeModule = {
  id: string;
  grade: 1;
  number: number;
  title: string;
  shortTitle: string;
  slug: string;
  description: string;
  semester: Semester;
  textbookLessons: number[];
  icon: string;
  color: string;
  backgroundColor: string;

  /**
   * Chi tiết đối chiếu SGK Toán 1: Kết nối tri thức với cuộc sống
   */
  textbookMapping?: ModuleTextbookMapping;

  /**
   * Trạng thái phát triển tính năng, không phải trạng thái
   * khóa bài của học sinh.
   */
  developmentStatus: DevelopmentStatus;

  skills: PracticeSkill[];
};

export const grade1PracticeModes: PracticeMode[] = [
  {
    id: 'quick',
    title: 'Luyện nhanh',
    description: 'Một lượt luyện ngắn để ôn bài vừa học.',
    questionCount: 5,
    estimatedMinutes: 3,
    icon: '⚡',
  },
  {
    id: 'standard',
    title: 'Luyện chuẩn',
    description: 'Luyện đầy đủ các kỹ năng trong chủ đề.',
    questionCount: 10,
    estimatedMinutes: 6,
    icon: '🎯',
  },
  {
    id: 'challenge',
    title: 'Thử thách',
    description: 'Nhiều câu hơn và có thêm câu vận dụng.',
    questionCount: 15,
    estimatedMinutes: 10,
    icon: '🏆',
  },
  {
    id: 'review',
    title: 'Ôn câu sai',
    description: 'Tập trung vào những dạng bài bé còn yếu.',
    questionCount: 10,
    estimatedMinutes: 6,
    icon: '🔁',
  },
];

export const grade1PracticeModules: PracticeModule[] = [
  {
    id: 'grade-1-numbers-to-10',
    grade: 1,
    number: 1,
    title: 'Các số từ 0 đến 10',
    shortTitle: 'Số đến 10',
    slug: 'cac-so-tu-0-den-10',
    description:
      'Đếm, nhận biết, so sánh và tách – gộp các số trong phạm vi 10.',
    semester: 1,
    textbookLessons: [1, 2, 3, 4, 5, 6],
    icon: '🔢',
    color: 'from-sky-400 to-blue-500',
    backgroundColor: 'bg-sky-50',
    developmentStatus: 'ready',
    skills: [
      {
        id: 'count-to-10',
        title: 'Đếm số',
        description:
          'Đếm đồ vật và xác định số lượng trong phạm vi 10.',
        icon: '👆',
        questionTypes: [
          'count-objects',
          'choose-number',
          'choose-group',
        ],
        defaultWeight: 20,
      },
      {
        id: 'recognize-number-to-10',
        title: 'Nhận biết số',
        description:
          'Nhận biết chữ số và ghép số với số lượng tương ứng.',
        icon: '🔎',
        questionTypes: [
          'recognize-number',
          'match-number-quantity',
        ],
        defaultWeight: 10,
      },
      {
        id: 'before-after-to-10',
        title: 'Số trước và số sau',
        description:
          'Tìm số đứng trước, đứng sau và số còn thiếu.',
        icon: '➡️',
        questionTypes: [
          'before-number',
          'after-number',
          'missing-number',
        ],
        defaultWeight: 15,
      },
      {
        id: 'compare-quantities-to-10',
        title: 'Nhiều hơn, ít hơn, bằng nhau',
        description:
          'So sánh số lượng của hai nhóm đồ vật.',
        icon: '⚖️',
        questionTypes: [
          'compare-quantity',
          'choose-more',
          'choose-less',
          'choose-equal',
        ],
        defaultWeight: 15,
      },
      {
        id: 'compare-numbers-to-10',
        title: 'So sánh số',
        description:
          'Sử dụng các dấu lớn hơn, nhỏ hơn và bằng nhau.',
        icon: '🔣',
        questionTypes: [
          'compare-number',
          'choose-comparison-sign',
        ],
        defaultWeight: 15,
      },
      {
        id: 'number-bonds-to-10',
        title: 'Tách – gộp số',
        description:
          'Tìm các cách tách một số thành hai phần.',
        icon: '🧩',
        questionTypes: [
          'split-number',
          'complete-number-bond',
          'choose-number-pair',
        ],
        defaultWeight: 25,
      },
    ],
  },
  {
    id: 'grade-1-flat-shapes',
    grade: 1,
    number: 2,
    title: 'Làm quen với hình phẳng',
    shortTitle: 'Hình phẳng',
    slug: 'lam-quen-voi-hinh-phang',
    description:
      'Nhận biết, phân loại và ghép hình vuông, tròn, tam giác, chữ nhật.',
    semester: 1,
    textbookLessons: [7, 8, 9],
    icon: '🔺',
    color: 'from-emerald-400 to-teal-500',
    backgroundColor: 'bg-emerald-50',
    developmentStatus: 'ready',
    skills: [
      {
        id: 'recognize-flat-shapes',
        title: 'Nhận biết hình',
        description:
          'Nhận biết hình vuông, hình tròn, hình tam giác và hình chữ nhật.',
        icon: '🔵',
        questionTypes: [
          'recognize-shape',
          'choose-shape-by-name',
          'choose-shape-by-property',
        ],
        defaultWeight: 35,
      },
      {
        id: 'classify-flat-shapes',
        title: 'Phân loại hình',
        description:
          'Xếp các hình vào đúng nhóm tương ứng.',
        icon: '🗂️',
        questionTypes: [
          'classify-shapes',
          'find-different-shape',
        ],
        defaultWeight: 25,
      },
      {
        id: 'shapes-in-life',
        title: 'Hình trong cuộc sống',
        description:
          'Tìm hình phẳng trong đồ vật quen thuộc.',
        icon: '🏠',
        questionTypes: [
          'match-object-shape',
          'find-shape-in-picture',
        ],
        defaultWeight: 20,
      },
      {
        id: 'compose-flat-shapes',
        title: 'Ghép và xếp hình',
        description:
          'Dùng các hình cơ bản để ghép thành hình mới.',
        icon: '🧱',
        questionTypes: [
          'compose-shape',
          'complete-shape-puzzle',
        ],
        defaultWeight: 20,
      },
    ],
  },
  {
    id: 'grade-1-add-subtract-to-10',
    grade: 1,
    number: 3,
    title: 'Phép cộng, phép trừ trong phạm vi 10',
    shortTitle: 'Cộng, trừ đến 10',
    slug: 'cong-tru-trong-pham-vi-10',
    description:
      'Luyện cộng, trừ, tìm số còn thiếu và giải bài toán bằng hình ảnh.',
    semester: 1,
    textbookLessons: [10, 11, 12, 13],
    icon: '➕',
    color: 'from-violet-400 to-purple-500',
    backgroundColor: 'bg-violet-50',
    developmentStatus: 'ready',
    skills: [
      {
        id: 'addition-to-10',
        title: 'Phép cộng',
        description:
          'Gộp hai nhóm đồ vật và thực hiện phép cộng trong phạm vi 10.',
        icon: '➕',
        questionTypes: [
          'addition-picture',
          'addition-equation',
          'choose-addition-result',
        ],
        defaultWeight: 25,
      },
      {
        id: 'subtraction-to-10',
        title: 'Phép trừ',
        description:
          'Bớt đồ vật và thực hiện phép trừ trong phạm vi 10.',
        icon: '➖',
        questionTypes: [
          'subtraction-picture',
          'subtraction-equation',
          'choose-subtraction-result',
        ],
        defaultWeight: 25,
      },
      {
        id: 'missing-add-subtract-to-10',
        title: 'Tìm số còn thiếu',
        description:
          'Điền số còn thiếu trong phép cộng hoặc phép trừ.',
        icon: '❓',
        questionTypes: [
          'missing-addend',
          'missing-minuend',
          'missing-subtrahend',
        ],
        defaultWeight: 20,
      },
      {
        id: 'fact-family-to-10',
        title: 'Mối quan hệ cộng – trừ',
        description:
          'Nhận biết các phép cộng và phép trừ liên quan.',
        icon: '🔄',
        questionTypes: [
          'fact-family',
          'match-related-equations',
        ],
        defaultWeight: 10,
      },
      {
        id: 'word-problems-to-10',
        title: 'Bài toán thực tế',
        description:
          'Giải tình huống thêm vào hoặc bớt đi.',
        icon: '📖',
        questionTypes: [
          'addition-word-problem',
          'subtraction-word-problem',
        ],
        defaultWeight: 20,
      },
    ],
  },
  {
    id: 'grade-1-solids-and-position',
    grade: 1,
    number: 4,
    title: 'Hình khối và vị trí',
    shortTitle: 'Hình khối, vị trí',
    slug: 'hinh-khoi-va-vi-tri',
    description:
      'Nhận biết hình khối và xác định vị trí của đồ vật trong không gian.',
    semester: 1,
    textbookLessons: [14, 15, 16],
    icon: '🧊',
    color: 'from-orange-400 to-amber-500',
    backgroundColor: 'bg-orange-50',
    developmentStatus: 'ready',
    skills: [
      {
        id: 'recognize-solids',
        title: 'Nhận biết hình khối',
        description:
          'Nhận biết khối lập phương và khối hộp chữ nhật.',
        icon: '📦',
        questionTypes: [
          'recognize-solid',
          'choose-solid-by-name',
        ],
        defaultWeight: 30,
      },
      {
        id: 'classify-solids',
        title: 'Phân loại hình khối',
        description:
          'Phân loại đồ vật theo khối lập phương và khối hộp chữ nhật.',
        icon: '🗃️',
        questionTypes: [
          'classify-solids',
          'match-object-solid',
        ],
        defaultWeight: 25,
      },
      {
        id: 'spatial-position',
        title: 'Vị trí trong không gian',
        description:
          'Xác định trên, dưới, trước, sau, bên trái và bên phải.',
        icon: '🧭',
        questionTypes: [
          'above-below',
          'front-behind',
          'left-right',
        ],
        defaultWeight: 30,
      },
      {
        id: 'follow-direction',
        title: 'Làm theo chỉ dẫn',
        description:
          'Di chuyển hoặc chọn đồ vật theo hướng được yêu cầu.',
        icon: '🗺️',
        questionTypes: [
          'follow-direction',
          'find-position',
        ],
        defaultWeight: 15,
      },
    ],
  },
  {
    id: 'grade-1-semester-1-review',
    grade: 1,
    number: 5,
    title: 'Ôn tập học kỳ I',
    shortTitle: 'Ôn tập kỳ I',
    slug: 'on-tap-hoc-ky-1',
    description:
      'Ôn tổng hợp số đến 10, phép tính, hình phẳng và hình khối.',
    semester: 1,
    textbookLessons: [17, 18, 19, 20],
    icon: '📚',
    color: 'from-pink-400 to-rose-500',
    backgroundColor: 'bg-pink-50',
    developmentStatus: 'ready',
    skills: [
      {
        id: 'review-numbers-to-10',
        title: 'Ôn các số đến 10',
        description:
          'Đếm, nhận biết và so sánh các số trong phạm vi 10.',
        icon: '🔢',
        questionTypes: [
          'count-objects',
          'missing-number',
          'compare-number',
          'number-bond',
        ],
        defaultWeight: 30,
      },
      {
        id: 'review-add-subtract-to-10',
        title: 'Ôn cộng và trừ',
        description:
          'Luyện phép cộng, phép trừ và bài toán thực tế.',
        icon: '➕',
        questionTypes: [
          'addition-equation',
          'subtraction-equation',
          'word-problem-to-10',
        ],
        defaultWeight: 40,
      },
      {
        id: 'review-geometry-semester-1',
        title: 'Ôn hình học',
        description:
          'Ôn hình phẳng, hình khối và vị trí.',
        icon: '🔺',
        questionTypes: [
          'recognize-shape',
          'recognize-solid',
          'spatial-position',
        ],
        defaultWeight: 30,
      },
    ],
  },
  {
    id: 'grade-1-numbers-to-100',
    grade: 1,
    number: 6,
    title: 'Các số đến 100',
    shortTitle: 'Số đến 100',
    slug: 'cac-so-den-100',
    description:
      'Đọc, viết, phân tích và so sánh các số có hai chữ số.',
    semester: 2,
    textbookLessons: [21, 22, 23, 24],
    icon: '💯',
    color: 'from-cyan-400 to-sky-500',
    backgroundColor: 'bg-cyan-50',
    developmentStatus: 'ready',
    skills: [
      {
        id: 'tens-and-ones',
        title: 'Chục và đơn vị',
        description:
          'Phân tích số có hai chữ số thành chục và đơn vị.',
        icon: '🧮',
        questionTypes: [
          'count-tens-ones',
          'compose-two-digit-number',
          'decompose-two-digit-number',
        ],
        defaultWeight: 30,
      },
      {
        id: 'read-write-to-100',
        title: 'Đọc và viết số',
        description:
          'Đọc, viết và ghép số có hai chữ số.',
        icon: '✍️',
        questionTypes: [
          'read-number',
          'write-number',
          'match-number-word',
        ],
        defaultWeight: 20,
      },
      {
        id: 'before-after-to-100',
        title: 'Số trước và số sau',
        description:
          'Tìm số liền trước, số liền sau và số còn thiếu.',
        icon: '➡️',
        questionTypes: [
          'before-number-to-100',
          'after-number-to-100',
          'missing-number-to-100',
        ],
        defaultWeight: 15,
      },
      {
        id: 'compare-to-100',
        title: 'So sánh số',
        description:
          'So sánh các số có hai chữ số.',
        icon: '⚖️',
        questionTypes: [
          'compare-two-digit-number',
          'choose-greater-number',
          'choose-smaller-number',
        ],
        defaultWeight: 20,
      },
      {
        id: 'number-chart-to-100',
        title: 'Bảng số đến 100',
        description:
          'Tìm số và nhận biết quy luật trên bảng số.',
        icon: '▦',
        questionTypes: [
          'find-number-on-chart',
          'complete-number-chart',
          'number-chart-pattern',
        ],
        defaultWeight: 15,
      },
    ],
  },
  {
    id: 'grade-1-length',
    grade: 1,
    number: 7,
    title: 'Độ dài và đo độ dài',
    shortTitle: 'Đo độ dài',
    slug: 'do-dai-va-do-do-dai',
    description:
      'So sánh, ước lượng và đo độ dài bằng đơn vị xăng-ti-mét.',
    semester: 2,
    textbookLessons: [25, 26, 27, 28],
    icon: '📏',
    color: 'from-lime-400 to-green-500',
    backgroundColor: 'bg-lime-50',
    developmentStatus: 'ready',
    skills: [
      {
        id: 'compare-length',
        title: 'Dài hơn, ngắn hơn',
        description:
          'So sánh trực quan độ dài của hai hoặc nhiều đồ vật.',
        icon: '↔️',
        questionTypes: [
          'choose-longer',
          'choose-shorter',
          'order-by-length',
        ],
        defaultWeight: 25,
      },
      {
        id: 'length-unit',
        title: 'Đơn vị xăng-ti-mét',
        description:
          'Làm quen với đơn vị đo xăng-ti-mét.',
        icon: '📐',
        questionTypes: [
          'recognize-centimeter',
          'choose-length-unit',
        ],
        defaultWeight: 20,
      },
      {
        id: 'measure-length',
        title: 'Đo độ dài',
        description:
          'Đọc kết quả đo trên thước và đo đồ vật.',
        icon: '📏',
        questionTypes: [
          'read-ruler',
          'measure-object',
        ],
        defaultWeight: 30,
      },
      {
        id: 'estimate-length',
        title: 'Ước lượng độ dài',
        description:
          'Ước lượng độ dài trước khi đo.',
        icon: '🤔',
        questionTypes: [
          'estimate-length',
          'choose-reasonable-length',
        ],
        defaultWeight: 15,
      },
      {
        id: 'length-word-problem',
        title: 'Bài toán độ dài',
        description:
          'Giải tình huống thực tế liên quan đến độ dài.',
        icon: '📖',
        questionTypes: [
          'length-word-problem',
        ],
        defaultWeight: 10,
      },
    ],
  },
  {
    id: 'grade-1-add-subtract-to-100',
    grade: 1,
    number: 8,
    title: 'Phép cộng, phép trừ trong phạm vi 100',
    shortTitle: 'Cộng, trừ đến 100',
    slug: 'cong-tru-trong-pham-vi-100',
    description:
      'Luyện cộng và trừ không nhớ với các số có hai chữ số.',
    semester: 2,
    textbookLessons: [29, 30, 31, 32, 33],
    icon: '➖',
    color: 'from-indigo-400 to-blue-600',
    backgroundColor: 'bg-indigo-50',
    developmentStatus: 'ready',
    skills: [
      {
        id: 'add-two-one-digit',
        title: 'Cộng với số có một chữ số',
        description:
          'Cộng số có hai chữ số với số có một chữ số, không nhớ.',
        icon: '➕',
        questionTypes: [
          'add-two-one-digit',
          'vertical-add-two-one-digit',
        ],
        defaultWeight: 20,
      },
      {
        id: 'add-two-two-digit',
        title: 'Cộng hai số có hai chữ số',
        description:
          'Cộng hai số có hai chữ số, không nhớ.',
        icon: '🧮',
        questionTypes: [
          'add-two-two-digit',
          'vertical-add-two-two-digit',
        ],
        defaultWeight: 20,
      },
      {
        id: 'subtract-two-one-digit',
        title: 'Trừ số có một chữ số',
        description:
          'Trừ số có một chữ số khỏi số có hai chữ số.',
        icon: '➖',
        questionTypes: [
          'subtract-two-one-digit',
          'vertical-subtract-two-one-digit',
        ],
        defaultWeight: 20,
      },
      {
        id: 'subtract-two-two-digit',
        title: 'Trừ hai số có hai chữ số',
        description:
          'Trừ hai số có hai chữ số, không nhớ.',
        icon: '➖',
        questionTypes: [
          'subtract-two-two-digit',
          'vertical-subtract-two-two-digit',
        ],
        defaultWeight: 20,
      },
      {
        id: 'word-problems-to-100',
        title: 'Bài toán thực tế',
        description:
          'Giải tình huống cộng hoặc trừ trong phạm vi 100.',
        icon: '📖',
        questionTypes: [
          'addition-word-problem-to-100',
          'subtraction-word-problem-to-100',
        ],
        defaultWeight: 20,
      },
    ],
  },
  {
    id: 'grade-1-time-calendar',
    grade: 1,
    number: 9,
    title: 'Thời gian, giờ và lịch',
    shortTitle: 'Giờ và lịch',
    slug: 'thoi-gian-gio-va-lich',
    description:
      'Xem giờ đúng, nhận biết các ngày trong tuần và đọc lịch.',
    semester: 2,
    textbookLessons: [34, 35, 36, 37],
    icon: '🕐',
    color: 'from-yellow-400 to-orange-500',
    backgroundColor: 'bg-yellow-50',
    developmentStatus: 'ready',
    skills: [
      {
        id: 'tell-time',
        title: 'Xem giờ đúng',
        description:
          'Đọc giờ đúng trên đồng hồ kim và đồng hồ điện tử.',
        icon: '🕐',
        questionTypes: [
          'read-analog-clock',
          'match-clock-time',
          'set-clock-hour',
        ],
        defaultWeight: 35,
      },
      {
        id: 'weekdays',
        title: 'Các ngày trong tuần',
        description:
          'Nhận biết thứ tự và mối quan hệ giữa các ngày.',
        icon: '📅',
        questionTypes: [
          'identify-weekday',
          'before-after-weekday',
          'order-weekdays',
        ],
        defaultWeight: 25,
      },
      {
        id: 'read-calendar',
        title: 'Xem lịch',
        description:
          'Tìm ngày, thứ và sự kiện trên tờ lịch.',
        icon: '🗓️',
        questionTypes: [
          'find-date',
          'match-date-weekday',
          'calendar-question',
        ],
        defaultWeight: 20,
      },
      {
        id: 'daily-routine-time',
        title: 'Thời gian trong ngày',
        description:
          'Ghép hoạt động quen thuộc với thời điểm phù hợp.',
        icon: '🌞',
        questionTypes: [
          'match-routine-time',
          'order-daily-events',
        ],
        defaultWeight: 20,
      },
    ],
  },
  {
    id: 'grade-1-final-review',
    grade: 1,
    number: 10,
    title: 'Ôn tập cuối năm',
    shortTitle: 'Ôn tập cuối năm',
    slug: 'on-tap-cuoi-nam',
    description:
      'Luyện tổng hợp những kiến thức và kỹ năng quan trọng của lớp 1.',
    semester: 2,
    textbookLessons: [38, 39, 40, 41],
    icon: '🏆',
    color: 'from-fuchsia-400 to-purple-600',
    backgroundColor: 'bg-fuchsia-50',
    developmentStatus: 'ready',
    skills: [
      {
        id: 'final-review-numbers',
        title: 'Ôn tập số',
        description:
          'Ôn các số, cấu tạo số và so sánh số đến 100.',
        icon: '💯',
        questionTypes: [
          'count-objects',
          'tens-and-ones',
          'compare-to-100',
          'number-sequence',
        ],
        defaultWeight: 25,
      },
      {
        id: 'final-review-calculation',
        title: 'Ôn tập phép tính',
        description:
          'Ôn phép cộng và phép trừ trong phạm vi 100.',
        icon: '➕',
        questionTypes: [
          'addition-to-100',
          'subtraction-to-100',
          'missing-number-equation',
        ],
        defaultWeight: 30,
      },
      {
        id: 'final-review-word-problems',
        title: 'Ôn tập bài toán',
        description:
          'Giải bài toán thực tế bằng phép cộng hoặc phép trừ.',
        icon: '📖',
        questionTypes: [
          'word-problem-to-100',
        ],
        defaultWeight: 20,
      },
      {
        id: 'final-review-geometry',
        title: 'Ôn tập hình học',
        description:
          'Ôn hình phẳng, hình khối và vị trí.',
        icon: '🔺',
        questionTypes: [
          'recognize-shape',
          'recognize-solid',
          'spatial-position',
        ],
        defaultWeight: 15,
      },
      {
        id: 'final-review-measurement',
        title: 'Ôn tập đo lường',
        description:
          'Ôn độ dài, đồng hồ, ngày và lịch.',
        icon: '📏',
        questionTypes: [
          'length-question',
          'clock-question',
          'calendar-question',
        ],
        defaultWeight: 10,
      },
    ],
  },
];

/**
 * Giữ tên export cũ để những component đã sử dụng
 * grade1Curriculum không bị lỗi.
 */
export const grade1Curriculum = grade1PracticeModules;

export function getGrade1Module(slug: string) {
  return grade1PracticeModules.find(
    (practiceModule) => practiceModule.slug === slug
  );
}

export function getGrade1ModuleByNumber(moduleNumber: number) {
  return grade1PracticeModules.find(
    (practiceModule) =>
      practiceModule.number === moduleNumber
  );
}

export function getGrade1Skill(
  moduleSlug: string,
  skillId: string
) {
  const practiceModule = getGrade1Module(moduleSlug);

  if (!practiceModule) return null;

  return practiceModule.skills.find(
    (skill) => skill.id === skillId
  );
}

export function getGrade1ModulesBySemester(
  semester: Semester
) {
  return grade1PracticeModules.filter(
    (practiceModule) =>
      practiceModule.semester === semester
  );
}

export function getPracticeMode(
  modeId: PracticeMode['id']
) {
  return grade1PracticeModes.find(
    (mode) => mode.id === modeId
  );
}

export function validateModuleWeights(
  practiceModule: PracticeModule
) {
  const totalWeight = practiceModule.skills.reduce(
    (total, skill) => total + skill.defaultWeight,
    0
  );

  return {
    valid: totalWeight === 100,
    totalWeight,
  };
}

export const grade1Statistics = {
  grade: 1,
  totalModules: grade1PracticeModules.length,
  totalSkills: grade1PracticeModules.reduce(
    (total, practiceModule) =>
      total + practiceModule.skills.length,
    0
  ),
  semester1Modules: grade1PracticeModules.filter(
    (practiceModule) =>
      practiceModule.semester === 1
  ).length,
  semester2Modules: grade1PracticeModules.filter(
    (practiceModule) =>
      practiceModule.semester === 2
  ).length,
};

export type TextbookComparisonItem = {
  moduleId: string;
  moduleTitle: string;
  shortTitle: string;
  slug: string;
  icon: string;
  semester: Semester;
  kntt: {
    volume: 1 | 2;
    lesson: string;
    lessonTitle: string;
    pages: string;
    description: string;
  };
  pedagogicalFocus: string;
  sgkExerciseForms: string[];
};

export const grade1TextbookComparison: TextbookComparisonItem[] = [
  {
    moduleId: 'grade-1-numbers-to-10',
    moduleTitle: 'Các số từ 0 đến 10',
    shortTitle: 'Số đến 10',
    slug: 'cac-so-tu-0-den-10',
    icon: '🔢',
    semester: 1,
    kntt: {
      volume: 1,
      lesson: 'Bài 1 đến Bài 5',
      lessonTitle: 'Các số 0–10; Nhiều hơn, ít hơn; So sánh số; Tách – gộp số',
      pages: 'Trang 6 – 41',
      description: 'Đếm lượng đồ vật thực tế, lập số từ 1 đến 10, học số 0, so sánh lớn bé bằng, sơ đồ tách – gộp mấy và mấy.',
    },
    pedagogicalFocus: 'Hình thành biểu tượng số qua đồ vật quen thuộc (ngón tay, que tính, khối vuông), rèn tư duy so sánh và tách gộp làm tiền đề cho phép cộng trừ.',
    sgkExerciseForms: [
      'Đếm mẫu vật trực quan (chấm tròn xúc xắc, que tính, con vật)',
      'Nối cặp 1-1 so sánh nhiều hơn – ít hơn – bằng nhau',
      'Điền dấu >, <, = vào ô tròn giữa hai số',
      'Sơ đồ tách – gộp số kinh điển (ví dụ: 5 gồm 3 và mấy?)',
      'Điền số còn thiếu vào toa tàu số và trục số tự nhiên',
    ],
  },
  {
    moduleId: 'grade-1-flat-shapes',
    moduleTitle: 'Làm quen với hình phẳng',
    shortTitle: 'Hình phẳng',
    slug: 'lam-quen-voi-hinh-phang',
    icon: '🔺',
    semester: 1,
    kntt: {
      volume: 1,
      lesson: 'Bài 7 & Bài 8 (và T2 Bài 40-41)',
      lessonTitle: 'Hình vuông, hình tròn, hình tam giác, hình chữ nhật; Thực hành lắp ghép',
      pages: 'Tập 1 Tr. 48–61 & Tập 2 Tr. 100–105',
      description: 'Nhận biết 4 hình phẳng cơ bản qua đường bao và cạnh góc, thực hành lắp ghép tranh hình học và đếm hình ghép.',
    },
    pedagogicalFocus: 'Quan sát trực quan nhận biết đặc điểm hình học, phân biệt rõ hình vuông (4 cạnh bằng nhau) và hình chữ nhật, đếm hình phẳng đơn và hình ghép phức hợp.',
    sgkExerciseForms: [
      'Chọn hình phẳng đúng tên gọi (hình vuông, tròn, tam giác, chữ nhật)',
      'Phân loại hình theo màu sắc và hình dạng',
      'Tìm hình phẳng ẩn trong đồ vật đời sống (biển báo, đồng hồ, bánh chưng)',
      'Đếm số lượng hình phẳng ghép trong tranh (ngôi nhà cửa sổ 4 ô vuông nhỏ + 1 ô vuông lớn bao ngoài = 5 ô vuông)',
      'Tìm hình thích hợp tiếp theo trong dãy hình có quy luật',
    ],
  },
  {
    moduleId: 'grade-1-add-subtract-to-10',
    moduleTitle: 'Phép cộng, phép trừ trong phạm vi 10',
    shortTitle: 'Cộng, trừ đến 10',
    slug: 'cong-tru-trong-pham-vi-10',
    icon: '➕',
    semester: 1,
    kntt: {
      volume: 1,
      lesson: 'Bài 9, 10, 11',
      lessonTitle: 'Phép cộng trong phạm vi 10; Phép trừ trong phạm vi 10; Luyện tập chung',
      pages: 'Trang 62 – 105',
      description: 'Gộp lại là phép cộng (+), bớt đi là phép trừ (-), xây dựng bảng cộng và bảng trừ trong phạm vi 10, giải bài toán bằng tranh.',
    },
    pedagogicalFocus: 'Nắm vững bản chất của phép cộng (gộp) và phép trừ (bớt), rèn kỹ năng tính nhẩm nhanh và vận dụng giải quyết tình huống thực tế.',
    sgkExerciseForms: [
      'Viết phép tính thích hợp theo tranh vẽ (ví dụ: 3 chú chim thêm 2 chú chim)',
      'Tính nhẩm phép cộng, phép trừ trong phạm vi 10',
      'Điền số thích hợp vào ô trống [?] (ví dụ: 4 + [?] = 7)',
      'Nối phép tính với kết quả thích hợp',
      'Bài toán có lời văn tóm tắt bằng tranh vẽ một bước tính',
    ],
  },
  {
    moduleId: 'grade-1-solids-and-position',
    moduleTitle: 'Hình khối và vị trí',
    shortTitle: 'Hình khối, vị trí',
    slug: 'hinh-khoi-va-vi-tri',
    icon: '🧊',
    semester: 1,
    kntt: {
      volume: 1,
      lesson: 'Bài 6 & Bài 12',
      lessonTitle: 'Vị trí và định hướng không gian; Khối lập phương, khối hộp chữ nhật',
      pages: 'Trang 42–47 & Trang 106–113',
      description: 'Xác định vị trí trên – dưới, phải – trái, trước – sau, ở giữa; Nhận biết khối lập phương và khối hộp chữ nhật trong đời sống.',
    },
    pedagogicalFocus: 'Phát triển năng lực không gian hình học thực tế, phân biệt giữa hình phẳng 2D và hình khối 3D trong không gian sống.',
    sgkExerciseForms: [
      'Xác định vị trí của đồ vật và nhân vật (ở trên bàn, dưới gầm ghế, bên trái, bên phải)',
      'Nhận biết đồ vật có dạng khối lập phương (hộp quà, súc sắc)',
      'Nhận biết đồ vật có dạng khối hộp chữ nhật (hộp sữa, cuốn sách, viên gạch)',
      'Đếm số lượng khối gỗ xếp chồng trong mô hình xây dựng',
    ],
  },
  {
    moduleId: 'grade-1-semester-1-review',
    moduleTitle: 'Ôn tập học kỳ I',
    shortTitle: 'Ôn tập kỳ I',
    slug: 'on-tap-hoc-ky-1',
    icon: '📚',
    semester: 1,
    kntt: {
      volume: 1,
      lesson: 'Bài 13 & Bài 14',
      lessonTitle: 'Ôn tập các số đến 10, phép tính và hình học học kì 1',
      pages: 'Trang 114 – 124',
      description: 'Ôn tập toàn diện các mạch kiến thức: Số học đến 10, cộng trừ 10, hình phẳng và hình khối, chuẩn bị kiểm tra học kỳ 1.',
    },
    pedagogicalFocus: 'Hệ thống hóa toàn bộ kiến thức kỳ 1, rèn phản xạ tính toán nhanh, giải quyết các dạng bài tổng hợp chuẩn ma trận đề thi.',
    sgkExerciseForms: [
      'Đếm số và so sánh số lượng',
      'Tính nhẩm nhanh các phép cộng trừ trong phạm vi 10',
      'Điền dấu >, <, = vào ô so sánh hai vế',
      'Nhận diện phân loại hình phẳng và hình khối',
    ],
  },
  {
    moduleId: 'grade-1-numbers-to-100',
    moduleTitle: 'Các số trong phạm vi 100',
    shortTitle: 'Số đến 100',
    slug: 'cac-so-den-100',
    icon: '💯',
    semester: 2,
    kntt: {
      volume: 2,
      lesson: 'Bài 15 đến Bài 18',
      lessonTitle: 'Các số từ 10 đến 20; Các số tròn chục; Các số đến 100; So sánh số phạm vi 100',
      pages: 'Trang 6 – 49',
      description: 'Học đếm bó chục và que tính rời, cấu tạo chục và đơn vị, đọc viết các số từ 1 đến 100, so sánh số có hai chữ số.',
    },
    pedagogicalFocus: 'Nắm vững nguyên lý hệ đếm thập phân, phân tích cấu tạo số thành các chục và đơn vị, thành thạo bảng 100 số.',
    sgkExerciseForms: [
      'Đếm số lượng bó chục và que tính rời để viết số',
      'Phân tích cấu tạo số (ví dụ: Số 47 gồm 4 chục và 7 đơn vị)',
      'Tìm số liền trước, số liền sau trong bảng các số từ 1 đến 100',
      'So sánh hai số có hai chữ số (so sánh chữ số hàng chục trước, nếu bằng nhau so chữ số hàng đơn vị)',
      'Sắp xếp dãy số theo thứ tự từ bé đến lớn và ngược lại',
    ],
  },
  {
    moduleId: 'grade-1-length',
    moduleTitle: 'Độ dài và đo độ dài',
    shortTitle: 'Đo độ dài',
    slug: 'do-dai-va-do-do-dai',
    icon: '📏',
    semester: 2,
    kntt: {
      volume: 2,
      lesson: 'Bài 19 & Bài 20',
      lessonTitle: 'Dài hơn – ngắn hơn; Đơn vị đo độ dài cm (xăng-ti-mét); Thước kẻ vạch cm',
      pages: 'Trang 50 – 65',
      description: 'So sánh độ dài trực tiếp; Làm quen với đơn vị xăng-ti-mét (cm); Đặt thước kẻ từ vạch 0 cm để đo và đọc số đo.',
    },
    pedagogicalFocus: 'Hình thành biểu tượng đại lượng độ dài chuẩn (cm), rèn kỹ năng thao tác chuẩn xác khi đặt thước đo và cộng trừ kèm đơn vị.',
    sgkExerciseForms: [
      'So sánh độ dài trực quan: Bút nào dài hơn, băng giấy nào ngắn hơn',
      'Đọc số đo độ dài của đồ vật trên thước kẻ có vạch chia xăng-ti-mét',
      'Thực hiện phép tính cộng, trừ kèm đơn vị đo (ví dụ: 6 cm + 3 cm = 9 cm)',
      'Ước lượng độ dài của một số đồ vật quen thuộc trong lớp học',
    ],
  },
  {
    moduleId: 'grade-1-add-subtract-to-100',
    moduleTitle: 'Phép cộng, phép trừ trong phạm vi 100',
    shortTitle: 'Cộng, trừ đến 100',
    slug: 'cong-tru-trong-pham-vi-100',
    icon: '➖',
    semester: 2,
    kntt: {
      volume: 2,
      lesson: 'Bài 21 đến Bài 23',
      lessonTitle: 'Phép cộng không nhớ trong phạm vi 100; Phép trừ không nhớ; Luyện tập chung',
      pages: 'Trang 66 – 99',
      description: 'Cộng trừ số tròn chục; Cộng trừ số có 2 chữ số với số có 1 hoặc 2 chữ số không nhớ (dạng 25 + 14, 48 - 12); Bài toán có lời văn.',
    },
    pedagogicalFocus: 'Thành thạo thuật toán đặt tính và tính từ phải sang trái (hàng đơn vị trước, hàng chục sau), trình bày bài giải toán có lời văn chuẩn mực.',
    sgkExerciseForms: [
      'Tính nhẩm số tròn chục (ví dụ: 30 + 20 = 50, 70 - 40 = 30)',
      'Đặt tính rồi tính theo cột dọc (thẳng hàng chục và hàng đơn vị)',
      'Tính giá trị biểu thức gồm hai phép tính liên tiếp (ví dụ: 12 + 3 + 4)',
      'Giải bài toán có lời văn một bước tính kèm câu lời giải, phép tính và đáp số',
    ],
  },
  {
    moduleId: 'grade-1-time-calendar',
    moduleTitle: 'Thời gian – Giờ và lịch',
    shortTitle: 'Giờ và lịch',
    slug: 'thoi-gian-gio-va-lich',
    icon: '⏰',
    semester: 2,
    kntt: {
      volume: 2,
      lesson: 'Bài 24 & Bài 25',
      lessonTitle: 'Xem đồng hồ, xem giờ đúng; Ngày trong tuần, đọc tờ lịch',
      pages: 'Trang 100 – 115',
      description: 'Xem giờ đúng trên mặt đồng hồ kim (kim ngắn chỉ số giờ, kim dài chỉ số 12); Học 7 ngày trong tuần từ Thứ Hai đến Chủ nhật.',
    },
    pedagogicalFocus: 'Hình thành khái niệm thời gian thực tế, biết sắp xếp thời gian biểu sinh hoạt và học tập khoa học, định hướng ngày tháng trong tuần.',
    sgkExerciseForms: [
      'Đọc giờ đúng trên mặt đồng hồ kim (ví dụ: Đồng hồ chỉ 8 giờ)',
      'Nối đồng hồ với hoạt động thích hợp (ví dụ: 7 giờ sáng em đi học, 9 giờ tối em đi ngủ)',
      'Kể tên lần lượt 7 ngày trong tuần từ Thứ Hai đến Chủ nhật',
      'Đọc thứ và ngày trên bloc lịch và lịch tháng',
    ],
  },
  {
    moduleId: 'grade-1-final-review',
    moduleTitle: 'Ôn tập cuối năm',
    shortTitle: 'Ôn tập cuối năm',
    slug: 'on-tap-cuoi-nam',
    icon: '🎓',
    semester: 2,
    kntt: {
      volume: 2,
      lesson: 'Bài 26, 27, 28',
      lessonTitle: 'Ôn tập số và phép tính trong phạm vi 100; Ôn tập hình học và đo lường',
      pages: 'Trang 116 – 128',
      description: 'Tổng kết toàn bộ chương trình Toán lớp 1: Số học 100, cộng trừ 100, đo độ dài cm, xem đồng hồ và phân loại hình học.',
    },
    pedagogicalFocus: 'Đánh giá toàn diện năng lực tư duy toán học, kỹ năng tính toán, giải quyết vấn đề và vận dụng kiến thức lớp 1 vào cuộc sống.',
    sgkExerciseForms: [
      'Tính nhẩm và đặt tính cộng trừ số có hai chữ số',
      'Giải bài toán có lời văn một bước tính kèm lời giải',
      'Đo và ghi số đo độ dài bằng thước kẻ cm',
      'Xem đồng hồ chỉ giờ đúng và đọc tờ lịch',
      'Đếm và phân loại các hình phẳng, hình khối trong tranh',
    ],
  },
];

export function getModuleTextbookComparison(moduleId: string) {
  return grade1TextbookComparison.find((item) => item.moduleId === moduleId);
}

// Gắn tự động textbookMapping chi tiết SGK Kết nối tri thức vào từng module của grade1PracticeModules
grade1PracticeModules.forEach((mod) => {
  const comp = grade1TextbookComparison.find((c) => c.moduleId === mod.id);
  if (comp) {
    mod.textbookMapping = {
      kntt: {
        seriesName: 'Kết nối tri thức với cuộc sống',
        shortName: 'KNTT',
        volume: comp.kntt.volume,
        lessons: comp.kntt.lesson,
        lessonTitle: comp.kntt.lessonTitle,
        pages: comp.kntt.pages,
      },
      pedagogicalFocus: comp.pedagogicalFocus,
      sgkExerciseForms: comp.sgkExerciseForms,
    };
  }
});


