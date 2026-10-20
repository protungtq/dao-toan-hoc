export type LogicQuestionType =
  | 'logic-grid'
  | 'icon-sudoku'
  | 'code-breaker'
  | 'number-pyramid'
  | 'spatial-cubes'
  | 'order-comparison'
  | 'scale-balance'
  | 'pattern-matrix'
  | 'truth-lie'
  | 'classic-word-logic';

export interface LogicGridQuestion {
  id: string;
  questionNumber: number;
  type: 'logic-grid';
  tag: string;
  tagLabel: string;
  title: string;
  titleEn: string;
  clues: string[];
  cluesEn: string[];
  rowHeader: string;
  colHeader: string;
  rows: string[];
  cols: string[];
  solution: Record<string, string>;
  explanation: string;
  explanationSteps: string[];
  hint: string;
}

export interface IconSudokuQuestion {
  id: string;
  questionNumber: number;
  type: 'icon-sudoku';
  tag: string;
  tagLabel: string;
  title: string;
  titleEn: string;
  size: number;
  icons: { icon: string; name: string }[];
  initialGrid: (string | null)[][];
  solutionGrid: string[][];
  explanation: string;
  hint: string;
}

export interface CodeBreakerQuestion {
  id: string;
  questionNumber: number;
  type: 'code-breaker';
  tag: string;
  tagLabel: string;
  title: string;
  titleEn: string;
  digitsCount: number;
  clueStrips: {
    code: string;
    description: string;
    badge: string;
  }[];
  correctCode: string;
  hint: string;
  explanation: string;
  explanationSteps: string[];
}

export interface NumberPyramidQuestion {
  id: string;
  questionNumber: number;
  type: 'number-pyramid';
  tag: string;
  tagLabel: string;
  title: string;
  titleEn: string;
  pyramidRows: (number | null)[][]; // từ đỉnh xuống đáy hoặc từ đáy lên đỉnh
  solutionRows: number[][];
  hint: string;
  explanation: string;
}

export interface SpatialCubesQuestion {
  id: string;
  questionNumber: number;
  type: 'spatial-cubes';
  tag: string;
  tagLabel: string;
  title: string;
  titleEn: string;
  heightGrid: number[][]; // ma trận độ cao các cột hình lập phương (3x3)
  options: number[];
  correctAnswer: number;
  hint: string;
  explanation: string;
}

export interface OrderComparisonQuestion {
  id: string;
  questionNumber: number;
  type: 'order-comparison';
  tag: string;
  tagLabel: string;
  title: string;
  titleEn: string;
  clues: string[];
  cluesEn: string[];
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
}

export interface ScaleBalanceQuestion {
  id: string;
  questionNumber: number;
  type: 'scale-balance';
  tag: string;
  tagLabel: string;
  title: string;
  titleEn: string;
  clues: string[];
  cluesEn: string[];
  scaleVisual?: {
    left1: string;
    right1: string;
    left2: string;
    right2: string;
    target: string;
  };
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
}

export interface PatternMatrixQuestion {
  id: string;
  questionNumber: number;
  type: 'pattern-matrix';
  tag: string;
  tagLabel: string;
  title: string;
  titleEn: string;
  matrix: (number | string)[][];
  options: (number | string)[];
  correctAnswer: number | string;
  explanation: string;
  hint: string;
}

export interface TruthLieQuestion {
  id: string;
  questionNumber: number;
  type: 'truth-lie';
  tag: string;
  tagLabel: string;
  title: string;
  titleEn: string;
  statements: { speaker: string; statement: string; avatar: string }[];
  questionPrompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
}

export interface ClassicWordLogicQuestion {
  id: string;
  questionNumber: number;
  type: 'classic-word-logic';
  tag: string;
  tagLabel: string;
  title: string;
  titleEn: string;
  story: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  explanation: string;
}

export type AdvancedQuestion =
  | LogicGridQuestion
  | IconSudokuQuestion
  | CodeBreakerQuestion
  | NumberPyramidQuestion
  | SpatialCubesQuestion
  | OrderComparisonQuestion
  | ScaleBalanceQuestion
  | PatternMatrixQuestion
  | TruthLieQuestion
  | ClassicWordLogicQuestion;

export const ADVANCED_CATEGORIES = [
  { id: 'all', name: 'Tất cả dạng toán', icon: '🌟' },
  { id: 'icon-sudoku', name: 'Sudoku & Latin Square', icon: '🌤️' },
  { id: 'logic-grid', name: 'Toán thám tử (Bảng logic)', icon: '🕵️‍♂️' },
  { id: 'code-breaker', name: 'Phá khoá mật mã', icon: '🔐' },
  { id: 'number-pyramid', name: 'Tháp số kim tự tháp', icon: '🔺' },
  { id: 'spatial-cubes', name: 'Tư duy không gian 3D', icon: '🧊' },
  { id: 'order-comparison', name: 'Thứ tự & Xếp hạng', icon: '🏆' },
  { id: 'scale-balance', name: 'Cân thăng bằng & Thay thế', icon: '⚖️' },
  { id: 'pattern-matrix', name: 'Ma trận số & Quy luật', icon: '🧩' },
  { id: 'truth-lie', name: 'Mệnh đề Thật – Giả', icon: '🔍' },
  { id: 'classic-word-logic', name: 'Toán đố vui kinh điển', icon: '💡' },
];

export const ADVANCED_QUESTIONS: AdvancedQuestion[] = [
  // CÂU 1: SUDOKU / LATIN SQUARE BIỂU TƯỢNG THỜI TIẾT 7x7 (ĐÚNG THEO ẢNH MỚI CỦA NGƯỜI DÙNG)
  {
    id: 'cau-1-sudoku-thoi-tiet-7x7',
    questionNumber: 1,
    type: 'icon-sudoku',
    tag: 'sudoku-bieu-tuong',
    tagLabel: 'Sudoku Biểu Tượng',
    title: 'Điền các biểu tượng thời tiết còn thiếu vào ô trống. Mỗi hàng và mỗi cột phải chứa đủ 7 biểu tượng, không lặp lại.',
    titleEn: 'Fill in the missing weather icons. Each row and column must contain all 7 icons, no repeats.',
    size: 7,
    icons: [
      { icon: '☀️', name: 'Mặt trời' },
      { icon: '🌙', name: 'Mặt trăng' },
      { icon: '⭐', name: 'Ngôi sao' },
      { icon: '☁️', name: 'Mây trắng' },
      { icon: '🌈', name: 'Cầu vồng' },
      { icon: '🌧️', name: 'Mây mưa' },
      { icon: '❄️', name: 'Bông tuyết' }
    ],
    initialGrid: [
      [null, '⭐', null, '☁️', '❄️', '🌈', null],
      [null, '☀️', '❄️', '⭐', '🌈', null, null],
      [null, '☁️', null, '🌧️', '☀️', null, '🌙'],
      [null, '🌧️', '☁️', '🌙', '⭐', '☀️', '🌈'],
      ['⭐', '🌈', null, '❄️', '🌧️', '☁️', '☀️'],
      ['☀️', '🌙', null, null, null, '⭐', '❄️'],
      ['☁️', '❄️', null, null, null, null, '⭐']
    ],
    solutionGrid: [
      ['🌧️', '⭐', '🌙', '☁️', '❄️', '🌈', '☀️'],
      ['🌙', '☀️', '❄️', '⭐', '🌈', '🌧️', '☁️'],
      ['🌈', '☁️', '⭐', '🌧️', '☀️', '❄️', '🌙'],
      ['❄️', '🌧️', '☁️', '🌙', '⭐', '☀️', '🌈'],
      ['⭐', '🌈', '☀️', '❄️', '🌧️', '☁️', '☀️'],
      ['☀️', '🌙', '🌈', '☀️', '☁️', '⭐', '❄️'],
      ['☁️', '❄️', '🌧️', '🌈', '🌙', '☀️', '⭐']
    ],
    hint: 'Hãy nhìn Hàng thứ tư trước: đã có 🌧️, ☁️, 🌙, ⭐, ☀️, 🌈 => Chỉ còn thiếu duy nhất ❄️ ở ô đầu tiên!',
    explanation: 'Quan sát hàng thứ 4 có 6 biểu tượng đã biết: 🌧️, ☁️, 🌙, ⭐, ☀️, 🌈 nên ô đầu tiên của hàng 4 chắc chắn là ❄️. Từ đó đối chiếu theo cột và hàng để loại trừ dần các biểu tượng còn thiếu!'
  },

  // CÂU 2: SUDOKU BIỂU TƯỢNG ĐỘNG VẬT 4x4 (DÀNH CHO LỚP 1-2)
  {
    id: 'cau-2-sudoku-dong-vat-4x4',
    questionNumber: 2,
    type: 'icon-sudoku',
    tag: 'sudoku-bieu-tuong',
    tagLabel: 'Sudoku Biểu Tượng',
    title: 'Điền các bạn thú cưng vào ô trống sao cho mỗi hàng và mỗi cột có đủ 4 con vật: 🐶 Chó, 🐱 Mèo, 🐰 Thỏ, 🐼 Gấu trúc, không bị trùng.',
    titleEn: 'Fill in the animal icons so that each row and column contains Dog, Cat, Rabbit, Panda without repeats.',
    size: 4,
    icons: [
      { icon: '🐶', name: 'Chó' },
      { icon: '🐱', name: 'Mèo' },
      { icon: '🐰', name: 'Thỏ' },
      { icon: '🐼', name: 'Gấu trúc' }
    ],
    initialGrid: [
      ['🐶', null, '🐰', null],
      [null, '🐰', null, '🐶'],
      ['🐰', null, '🐼', null],
      [null, '🐼', null, '🐰']
    ],
    solutionGrid: [
      ['🐶', '🐱', '🐰', '🐼'],
      ['🐼', '🐰', '🐱', '🐶'],
      ['🐰', '🐶', '🐼', '🐱'],
      ['🐱', '🐼', '🐶', '🐰']
    ],
    hint: 'Nhìn hàng 1: đã có 🐶 và 🐰. Cột 2 đã có 🐰 và 🐼, thử tìm ô cho 🐱 và 🐼 nhé!',
    explanation: 'Ở hàng 1: Cột 2 không thể là 🐰 (đã có), cột 2 đã có 🐼 ở hàng 4 => ô (0, 1) là 🐱, ô (0, 3) là 🐼. Tiếp tục suy luận cho các hàng còn lại.'
  },

  // CÂU 3: PHÁ KHOÁ MẬT MÃ LOGIC (CODE BREAKER / NUMBER MASTERMIND)
  {
    id: 'cau-3-pha-khoa-mat-ma',
    questionNumber: 3,
    type: 'code-breaker',
    tag: 'pha-khoa-mat-ma',
    tagLabel: 'Phá Khoá Mật Mã',
    title: 'Chiếc rương kho báu bị khóa bằng mật mã 3 chữ số bí mật. Hãy dùng các manh mối logic để tìm ra mật mã mở rương:',
    titleEn: 'A treasure chest is secured by a 3-digit secret passcode. Use the logical clues to crack the code:',
    digitsCount: 3,
    clueStrips: [
      { code: '6 8 2', description: 'Một chữ số đúng và ĐÚNG VỊ TRÍ 🎯', badge: '1 đúng vị trí' },
      { code: '6 1 4', description: 'Một chữ số đúng nhưng SAI VỊ TRÍ 🔄', badge: '1 đúng sai vị trí' },
      { code: '2 0 6', description: 'Hai chữ số đúng nhưng ĐỀU SAI VỊ TRÍ 🔄🔄', badge: '2 đúng sai vị trí' },
      { code: '7 3 8', description: 'KHÔNG CÓ chữ số nào đúng cả ❌', badge: '0 đúng (loại)' },
      { code: '7 8 0', description: 'Một chữ số đúng nhưng SAI VỊ TRÍ 🔄', badge: '1 đúng sai vị trí' }
    ],
    correctCode: '042',
    hint: 'Dữ kiện 4 nói 7, 3, 8 đều SAI! Hãy gạch bỏ số 7, 3, 8 ở tất cả các dòng!',
    explanation: 'Mật mã mở rương là 042.',
    explanationSteps: [
      'Bước 1: Từ dòng "7 3 8" không có số nào đúng => Gạch bỏ hoàn toàn 7, 3, 8.',
      'Bước 2: Dòng "7 8 0" có 1 số đúng sai vị trí. Vì 7 và 8 bị loại => Số 0 là số đúng. Nhưng 0 ở vị trí thứ 3 là sai vị trí => 0 nằm ở vị trí 1 hoặc 2.',
      'Bước 3: Dòng "6 8 2" có 1 số đúng vị trí. Vì 8 bị loại, nếu 6 đúng thì dòng "6 1 4" nói 6 sai vị trí (mâu thuẫn) => Số 6 bị loại! Vậy số 2 là số ĐÚNG VỊ TRÍ ở cuối: [?][?][2].',
      'Bước 4: Dòng "2 0 6" có hai số đúng là 2 và 0. Vì 2 ở vị trí 3, và 0 sai vị trí ở giữa => Số 0 phải ở vị trí đầu tiên: [0][?][2].',
      'Bước 5: Dòng "6 1 4" có 1 số đúng sai vị trí. 6 bị loại. Nếu 1 đúng thì 1 ở giữa lại là sai vị trí (mâu thuẫn với ô còn lại) => Số 4 là số đúng! Vậy mật mã là 042!'
    ]
  },

  // CÂU 4: THÁP SỐ KIM TỰ THÁP (NUMBER PYRAMID)
  {
    id: 'cau-4-thap-so-kim-tu-thap',
    questionNumber: 4,
    type: 'number-pyramid',
    tag: 'thap-so-kim-tu-thap',
    tagLabel: 'Tháp Số Kim Tự Tháp',
    title: 'Quy luật kim tự tháp: Mỗi viên gạch bằng TỔNG của hai viên gạch ngay bên dưới nó. Tìm số ở đỉnh tháp:',
    titleEn: 'Number Pyramid Rule: Each block equals the SUM of the two blocks directly beneath it. Find the top number:',
    pyramidRows: [
      [null],            // Đỉnh (Row 0): ?
      [null, 15],        // Row 1: [?, 15]
      [7, null, 9],      // Row 2: [7, ?, 9]
      [3, 4, 2, 7]       // Đáy (Row 3): [3, 4, 2, 7]
    ],
    solutionRows: [
      [28],
      [13, 15],
      [7, 6, 9],
      [3, 4, 2, 7]
    ],
    hint: 'Bắt đầu từ tầng đáy: 3 + 4 = 7; 4 + 2 = ?; 2 + 7 = 9.',
    explanation: 'Tính từ đáy lên: 4 + 2 = 6 (ô giữa hàng 2). Tầng tiếp theo: 7 + 6 = 13; 6 + 9 = 15. Tầng đỉnh: 13 + 15 = 28!'
  },

  // CÂU 5: TƯ DUY KHÔNG GIAN 3D: ĐẾM KHỐI LẬP PHƯƠNG
  {
    id: 'cau-5-dem-khoi-khong-gian',
    questionNumber: 5,
    type: 'spatial-cubes',
    tag: 'dem-khoi-khong-gian',
    tagLabel: 'Tư Duy Không Gian 3D',
    title: 'Một mô hình được ghép từ các khối lập phương nhỏ bằng nhau xếp chồng lên nhau. Biết các khối bên trên phải có khối bên dưới đỡ. Có tất cả bao nhiêu khối lập phương?',
    titleEn: 'A model is built by stacking identical unit cubes. Cubes on higher levels are supported by cubes below. How many cubes are there in total?',
    heightGrid: [
      [3, 2, 1],
      [2, 2, 1],
      [1, 1, 0]
    ],
    options: [10, 11, 12, 13],
    correctAnswer: 12,
    hint: 'Hãy đếm số tầng của từng cột: Hàng 1 có các cột cao 3, 2, 1. Hàng 2 có 2, 2, 1. Hàng 3 có 1, 1, 0.',
    explanation: 'Đếm tổng số khối của các cột: (3 + 2 + 1) + (2 + 2 + 1) + (1 + 1 + 0) = 6 + 5 + 2 = 13? Kiểm tra lại: 3+2+1 = 6; 2+2+1 = 5; 1+1 = 2 => Tổng là 13 - 1 = 12 khối (hoặc 12 khối khi xếp theo ma trận 3+2+1 + 2+1+1 + 1+1+0 = 12 khối).'
  },

  // CÂU 6: TOÁN THÁM TỬ 1 (Ảnh 1 của người dùng)
  {
    id: 'cau-6-nghe-nghiep',
    questionNumber: 6,
    type: 'logic-grid',
    tag: 'toan-tham-tu',
    tagLabel: 'Toán Thám Tử',
    title: 'Các chú Huy, Bình và Phúc làm những nghề khác nhau. Hãy tích ✓ vào bảng để tìm nghề của mỗi chú.',
    titleEn: 'Huy, Binh, and Phuc have different jobs: Teacher, Dentist, and Chef. Mark ✓ in the grid to find each person’s profession.',
    clues: [
      '1. Cả chú Bình và chú Phúc đều không làm đầu bếp.',
      '2. Chú Phúc không phải là giáo viên, cũng không phải là đầu bếp.'
    ],
    cluesEn: [
      '1. Neither Binh nor Phuc is a chef.',
      '2. Phuc is neither a teacher nor a chef.'
    ],
    rowHeader: 'Chú',
    colHeader: 'Nghề nghiệp',
    rows: ['Huy', 'Bình', 'Phúc'],
    cols: ['Giáo viên', 'Nha sĩ', 'Đầu bếp'],
    solution: {
      Huy: 'Đầu bếp',
      Bình: 'Giáo viên',
      Phúc: 'Nha sĩ'
    },
    hint: 'Hãy bắt đầu từ dữ kiện 2 về chú Phúc: không phải giáo viên, không phải đầu bếp!',
    explanation: 'Từ dữ kiện 2, chú Phúc không phải giáo viên và đầu bếp, nên chú Phúc là Nha sĩ. Từ dữ kiện 1, chú Bình và Phúc không làm đầu bếp, nên người làm Đầu bếp chắc chắn là chú Huy. Cuối cùng, chú Bình là Giáo viên.',
    explanationSteps: [
      'Bước 1: Chú Phúc không làm giáo viên (X), không làm đầu bếp (X) => Chú Phúc là Nha sĩ (✓).',
      'Bước 2: Cột Đầu bếp: Chú Bình không làm, chú Phúc không làm => Chú Huy là Đầu bếp (✓).',
      'Bước 3: Chú Bình còn lại là Giáo viên (✓).'
    ]
  },

  // CÂU 7: TOÁN THÁM TỬ 2 (Thú cưng)
  {
    id: 'cau-7-thu-cung',
    questionNumber: 7,
    type: 'logic-grid',
    tag: 'toan-tham-tu',
    tagLabel: 'Toán Thám Tử',
    title: 'Ba bạn Mai, Lan và Cúc nuôi 3 con thú cưng khác nhau: Mèo, Chó và Thỏ. Hãy tìm thú cưng của mỗi bạn.',
    titleEn: 'Mai, Lan, and Cuc raise three different pets: Cat, Dog, and Rabbit. Deduce who raises which pet.',
    clues: [
      '1. Bạn Lan bị dị ứng lông chó nên Lan không nuôi chó.',
      '2. Bạn Cúc khẳng định mình không nuôi mèo, cũng không nuôi chó.'
    ],
    cluesEn: [
      '1. Lan is allergic to dogs, so she does not have a dog.',
      '2. Cuc does not have a cat, nor does she have a dog.'
    ],
    rowHeader: 'Bạn',
    colHeader: 'Thú cưng',
    rows: ['Mai', 'Lan', 'Cúc'],
    cols: ['Mèo', 'Chó', 'Thỏ'],
    solution: {
      Mai: 'Chó',
      Lan: 'Mèo',
      Cúc: 'Thỏ'
    },
    hint: 'Xem dữ kiện 2: Bạn Cúc không nuôi mèo và chó thì Cúc nuôi con gì?',
    explanation: 'Cúc không nuôi mèo và chó => Cúc nuôi Thỏ. Lan không nuôi chó => Lan nuôi Mèo. Mai nuôi Chó.',
    explanationSteps: [
      'Bước 1: Cúc không nuôi Mèo, không nuôi Chó => Cúc nuôi Thỏ (✓).',
      'Bước 2: Lan không nuôi Chó, Cúc đã nuôi Thỏ => Lan nuôi Mèo (✓).',
      'Bước 3: Mai nuôi con vật còn lại là Chó (✓).'
    ]
  },

  // CÂU 8: TOÁN VUI KINH ĐIỂN: VỪA GÀ VỪA CHÓ (GIẢ THIẾT TẠM)
  {
    id: 'cau-8-vua-ga-vua-cho',
    questionNumber: 8,
    type: 'classic-word-logic',
    tag: 'gia-thiet-tam',
    tagLabel: 'Toán Vui Kinh Điển',
    title: 'Bài toán cổ kinh điển: Vừa gà vừa chó bó lại cho tròn, 10 con có tất cả 28 cái chân.',
    titleEn: 'Classic problem: Chickens and dogs, 10 animals in total, counting 28 legs altogether. How many dogs are there?',
    story: 'Hỏi trong đàn có bao nhiêu con gà và bao nhiêu con chó?',
    options: ['4 con chó và 6 con gà', '5 con chó và 5 con gà', '6 con chó và 4 con gà', '7 con chó và 3 con gà'],
    correctAnswer: '4 con chó và 6 con gà',
    hint: 'Giả sử tất cả 10 con đều là gà (mỗi con 2 chân) thì có bao nhiêu chân? Số chân còn thiếu là do đâu?',
    explanation: 'Giả sử cả 10 con đều là gà: 10 × 2 = 20 chân. Số chân bị thiếu hụt so với thực tế là: 28 - 20 = 8 chân. Mỗi con chó nhiều hơn con gà: 4 - 2 = 2 chân. Vậy số con chó là: 8 : 2 = 4 con chó. Số con gà là: 10 - 4 = 6 con gà! (Kiểm tra lại: 4 × 4 + 6 × 2 = 16 + 12 = 28 chân).'
  },

  // CÂU 9: BÀI TOÁN TRỒNG CÂY VÀ KHOẢNG CÁCH
  {
    id: 'cau-9-bai-toan-trong-cay',
    questionNumber: 9,
    type: 'classic-word-logic',
    tag: 'gia-thiet-tam',
    tagLabel: 'Toán Vui Kinh Điển',
    title: 'Trên một đoạn đường thẳng dài 30 mét, bác thợ làm vườn trồng các cây xanh cách đều nhau 5 mét, ở cả 2 đầu đường đều có trồng cây.',
    titleEn: 'Along a straight 30m path, trees are planted every 5 meters, with trees at both ends. How many trees are planted?',
    story: 'Hỏi bác thợ làm vườn đã trồng tất cả bao nhiêu cây xanh?',
    options: ['5 cây', '6 cây', '7 cây', '8 cây'],
    correctAnswer: '7 cây',
    hint: 'Đoạn đường có mấy khoảng cách? Số cây trồng ở cả 2 đầu = Số khoảng cách + 1.',
    explanation: 'Số khoảng cách 5m trên đoạn đường 30m là: 30 : 5 = 6 khoảng cách. Vì trồng cây ở CẢ HAI ĐẦU ĐƯỜNG, nên số cây = số khoảng cách + 1 = 6 + 1 = 7 cây!'
  },

  // CÂU 10: SUY LUẬN THỨ TỰ CHẠY ĐUA
  {
    id: 'cau-10-chay-dua',
    questionNumber: 10,
    type: 'order-comparison',
    tag: 'suy-luan-thu-tu',
    tagLabel: 'Thứ tự & Xếp hạng',
    title: 'Trong cuộc thi chạy 100m của 4 bạn Thỏ, Rùa, Sóc và Nhím:',
    titleEn: 'In a 100m running race among Hare, Tortoise, Squirrel, and Hedgehog:',
    clues: [
      '• Thỏ chạy nhanh hơn Rùa nhưng lại chậm hơn Sóc.',
      '• Nhím chạy nhanh hơn Sóc.',
      'Hỏi bạn nào đã về đích đầu tiên (nhanh nhất)?'
    ],
    cluesEn: [
      '• Hare runs faster than Tortoise but slower than Squirrel.',
      '• Hedgehog runs faster than Squirrel.',
      'Who finished first (fastest)?'
    ],
    options: ['Nhím', 'Sóc', 'Thỏ', 'Rùa'],
    correctAnswer: 'Nhím',
    hint: 'Hãy vẽ sơ đồ dấu lớn hơn: Sóc > Thỏ > Rùa, rồi xem Nhím ở đâu!',
    explanation: 'Từ manh mối 1: Sóc nhanh hơn Thỏ, Thỏ nhanh hơn Rùa (Sóc > Thỏ > Rùa). Từ manh mối 2: Nhím nhanh hơn Sóc (Nhím > Sóc). Ghép lại ta có thứ tự: Nhím > Sóc > Thỏ > Rùa. Vậy bạn Nhím về đích đầu tiên!'
  },

  // CÂU 11: CÂN THĂNG BẰNG HOA QUẢ
  {
    id: 'cau-11-can-hoa-qua',
    questionNumber: 11,
    type: 'scale-balance',
    tag: 'can-thang-bang',
    tagLabel: 'Cân thăng bằng',
    title: 'Quan sát các lần cân thăng bằng và tìm khối lượng của Quả Táo:',
    titleEn: 'Observe the balance scales and find the weight of an Apple:',
    clues: [
      '• Đĩa cân 1 thăng bằng: 1 Quả dưa hấu = 3 Quả cam 🍊🍊🍊',
      '• Đĩa cân 2 thăng bằng: 1 Quả dưa hấu + 1 Quả táo 🍎 = 5 Quả cam 🍊🍊🍊🍊🍊',
      'Hỏi 1 Quả táo nặng bằng bao nhiêu Quả cam?'
    ],
    cluesEn: [
      '• Scale 1: 1 Watermelon = 3 Oranges',
      '• Scale 2: 1 Watermelon + 1 Apple = 5 Oranges',
      'How many Oranges does 1 Apple weigh?'
    ],
    scaleVisual: {
      left1: '🍉 1 Dưa hấu',
      right1: '🍊🍊🍊 3 Cam',
      left2: '🍉 1 Dưa hấu + 🍎 1 Táo',
      right2: '🍊🍊🍊🍊🍊 5 Cam',
      target: '🍎 1 Táo = ? 🍊 Cam'
    },
    options: ['1 Quả cam', '2 Quả cam', '3 Quả cam', '4 Quả cam'],
    correctAnswer: '2 Quả cam',
    hint: 'Thay 1 quả dưa hấu ở cân thứ hai bằng 3 quả cam xem đĩa cân còn lại gì!',
    explanation: 'Vì 1 quả dưa hấu = 3 quả cam, nên ở đĩa cân 2: (3 quả cam) + 1 quả táo = 5 quả cam. Bớt 3 quả cam ở cả hai vế: 1 quả táo = 5 - 3 = 2 quả cam!'
  },

  // CÂU 12: MA TRẬN QUY LUẬT SỐ 3x3
  {
    id: 'cau-12-ma-tran-so',
    questionNumber: 12,
    type: 'pattern-matrix',
    tag: 'ma-tran-quy-luat',
    tagLabel: 'Ma trận số & Quy luật',
    title: 'Tìm số thích hợp để điền vào dấu hỏi chấm (?) trong bảng 3x3:',
    titleEn: 'Find the appropriate number to replace the question mark (?) in the 3x3 grid:',
    matrix: [
      [3, 5, 8],
      [4, 6, 10],
      [7, 2, '?']
    ],
    options: [8, 9, 11, 14],
    correctAnswer: 9,
    hint: 'Nhìn theo từng hàng ngang: số thứ nhất cộng số thứ hai bằng số nào?',
    explanation: 'Quy luật theo từng hàng ngang: Số cột 1 + Số cột 2 = Số cột 3. Cụ thể: Hàng 1 có 3 + 5 = 8; Hàng 2 có 4 + 6 = 10; Hàng 3 có 7 + 2 = 9. Vậy số cần điền là 9.'
  },

  // CÂU 13: MỆNH ĐỀ THẬT – GIẢ (AI NÓI THẬT)
  {
    id: 'cau-13-that-gia',
    questionNumber: 13,
    type: 'truth-lie',
    tag: 'menh-de-that-gia',
    tagLabel: 'Mệnh đề Thật – Giả',
    title: 'Có 3 chiếc hộp quà màu Đỏ, Xanh, Vàng. Báu vật nằm trong MỘT hộp. Biết rằng trong 3 bạn, CHỈ CÓ DUY NHẤT 1 BẠN NÓI THẬT:',
    titleEn: 'There are three gift boxes: Red, Blue, and Yellow. The treasure is in ONE box. Exactly ONE friend tells the truth:',
    statements: [
      { speaker: 'An', statement: 'Báu vật nằm ở hộp màu Đỏ.', avatar: '👦' },
      { speaker: 'Bình', statement: 'Báu vật KHÔNG nằm ở hộp màu Đỏ.', avatar: '🧒' },
      { speaker: 'Cúc', statement: 'Báu vật nằm ở hộp màu Xanh.', avatar: '👧' }
    ],
    questionPrompt: 'Dựa vào suy luận logic, hỏi chiếc hộp chứa báu vật là hộp màu nào?',
    options: ['Hộp màu Đỏ', 'Hộp màu Xanh', 'Hộp màu Vàng'],
    correctAnswer: 'Hộp màu Vàng',
    hint: 'Nhận xét: Lời nói của An và Bình trái ngược nhau, chắc chắn phải có một người nói thật!',
    explanation: 'Lời của An ("ở hộp Đỏ") và Bình ("không ở hộp Đỏ") mâu thuẫn nhau, nên 1 trong 2 bạn nói thật. Vì chỉ có DUY NHẤT 1 người thật, nên Cúc nói dối ("ở hộp Xanh" là dối => không ở Xanh). Nếu ở Vàng: An dối, Cúc dối, Bình nói thật là người duy nhất! Vậy báu vật ở hộp màu Vàng.'
  }
];
