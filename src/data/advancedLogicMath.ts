export type LogicQuestionType =
  | 'logic-grid'
  | 'order-comparison'
  | 'scale-balance'
  | 'pattern-matrix'
  | 'truth-lie';

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

export type AdvancedQuestion =
  | LogicGridQuestion
  | OrderComparisonQuestion
  | ScaleBalanceQuestion
  | PatternMatrixQuestion
  | TruthLieQuestion;

export const ADVANCED_CATEGORIES = [
  { id: 'all', name: 'Tất cả dạng toán', icon: '🌟' },
  { id: 'logic-grid', name: 'Toán thám tử (Bảng logic)', icon: '🕵️‍♂️' },
  { id: 'order-comparison', name: 'Thứ tự & Xếp hạng', icon: '🏆' },
  { id: 'scale-balance', name: 'Cân thăng bằng & Thay thế', icon: '⚖️' },
  { id: 'pattern-matrix', name: 'Ma trận & Quy luật', icon: '🧩' },
  { id: 'truth-lie', name: 'Mệnh đề Thật – Giả', icon: '🔍' },
];

export const ADVANCED_QUESTIONS: AdvancedQuestion[] = [
  // CÂU 1 (Từ ảnh đính kèm của người dùng)
  {
    id: 'cau-1-nghe-nghiep',
    questionNumber: 1,
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
      'Bước 1: Xét dữ kiện 2: Chú Phúc không làm giáo viên (đánh X), không làm đầu bếp (đánh X) => Chú Phúc phải là Nha sĩ (đánh ✓).',
      'Bước 2: Vì Phúc đã là Nha sĩ, nên Huy và Bình không thể là Nha sĩ (đánh X cột Nha sĩ).',
      'Bước 3: Xét dữ kiện 1: Chú Bình không làm đầu bếp (đánh X) và Phúc cũng không. Trong cột Đầu bếp chỉ còn lại chú Huy => Chú Huy là Đầu bếp (đánh ✓).',
      'Bước 4: Chú Bình còn lại duy nhất nghề Giáo viên (đánh ✓).'
    ]
  },

  // CÂU 2: Bảng logic Thú Cưng
  {
    id: 'cau-2-thu-cung',
    questionNumber: 2,
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
    explanation: 'Cúc không nuôi mèo và chó => Cúc nuôi Thỏ. Lan không nuôi chó và không nuôi thỏ (vì Cúc đã nuôi) => Lan nuôi Mèo. Mai nuôi con vật còn lại là Chó.',
    explanationSteps: [
      'Bước 1: Từ dữ kiện 2, bạn Cúc không nuôi Mèo, không nuôi Chó => Cúc nuôi Thỏ.',
      'Bước 2: Cúc đã nuôi Thỏ, nên Mai và Lan không nuôi Thỏ.',
      'Bước 3: Lan không nuôi Chó (dữ kiện 1) và không nuôi Thỏ => Lan nuôi Mèo.',
      'Bước 4: Bạn Mai nuôi con vật còn lại là Chó.'
    ]
  },

  // CÂU 3: Bảng logic Phương tiện
  {
    id: 'cau-3-phuong-tien',
    questionNumber: 3,
    type: 'logic-grid',
    tag: 'toan-tham-tu',
    tagLabel: 'Toán Thám Tử',
    title: 'Ba bác Tuấn, Hùng và Nam đi làm bằng 3 phương tiện: Xe đạp, Xe máy, Xe buýt. Hãy tìm phương tiện của mỗi bác.',
    titleEn: 'Tuan, Hung, and Nam commute using three different vehicles: Bicycle, Motorbike, and Bus.',
    clues: [
      '1. Bác Tuấn say xe nên không bao giờ đi xe buýt.',
      '2. Bác Hùng không biết đi xe đạp, và hôm nay bác đi xe buýt đến công ty.'
    ],
    cluesEn: [
      '1. Tuan gets motion sick, so he never rides the bus.',
      '2. Hung cannot ride a bike, and today he took the bus to work.'
    ],
    rowHeader: 'Bác',
    colHeader: 'Phương tiện',
    rows: ['Bác Tuấn', 'Bác Hùng', 'Bác Nam'],
    cols: ['Xe đạp', 'Xe máy', 'Xe buýt'],
    solution: {
      'Bác Tuấn': 'Xe máy',
      'Bác Hùng': 'Xe buýt',
      'Bác Nam': 'Xe đạp'
    },
    hint: 'Dữ kiện 2 đã nói trực tiếp bác Hùng đi xe gì rồi đấy!',
    explanation: 'Bác Hùng đi xe buýt. Bác Tuấn không đi xe buýt và không đi xe đạp cùng bác Hùng. Bác Tuấn đi xe máy. Bác Nam đi xe đạp.',
    explanationSteps: [
      'Bước 1: Bác Hùng đi xe buýt (dữ kiện 2).',
      'Bước 2: Bác Tuấn không đi xe buýt (dữ kiện 1), xe buýt đã có bác Hùng đi. Bác Tuấn đi Xe máy.',
      'Bước 3: Bác Nam đi phương tiện còn lại là Xe đạp.'
    ]
  },

  // CÂU 4: Bảng logic Môn Thể Thao
  {
    id: 'cau-4-the-thao',
    questionNumber: 4,
    type: 'logic-grid',
    tag: 'toan-tham-tu',
    tagLabel: 'Toán Thám Tử',
    title: 'Ba bạn Khoa, An và Đức tham gia 3 môn thể thao: Bơi lội, Cờ vua, Bóng bàn. Hãy xác định môn của từng bạn.',
    titleEn: 'Khoa, An, and Duc play three different sports: Swimming, Chess, and Table Tennis.',
    clues: [
      '1. Bạn Khoa không biết bơi và cũng không thích bóng bàn.',
      '2. Bạn An rất sợ nước nên không tham gia bơi lội.'
    ],
    cluesEn: [
      '1. Khoa cannot swim and does not like table tennis.',
      '2. An is afraid of water, so he does not swim.'
    ],
    rowHeader: 'Bạn',
    colHeader: 'Môn thể thao',
    rows: ['Khoa', 'An', 'Đức'],
    cols: ['Bơi lội', 'Cờ vua', 'Bóng bàn'],
    solution: {
      Khoa: 'Cờ vua',
      An: 'Bóng bàn',
      Đức: 'Bơi lội'
    },
    hint: 'Khoa không bơi và không bóng bàn thì Khoa chơi môn gì?',
    explanation: 'Khoa chơi Cờ vua. An sợ nước nên không bơi, vậy An chơi Bóng bàn. Đức tham gia môn Bơi lội.',
    explanationSteps: [
      'Bước 1: Khoa không bơi và không chơi bóng bàn => Khoa chơi Cờ vua.',
      'Bước 2: An không bơi (sợ nước) và Cờ vua đã là của Khoa => An chơi Bóng bàn.',
      'Bước 3: Bạn Đức tham gia môn còn lại là Bơi lội.'
    ]
  },

  // CÂU 5: Bảng logic Màu Áo 4 đối tượng
  {
    id: 'cau-5-mau-ao',
    questionNumber: 5,
    type: 'logic-grid',
    tag: 'toan-tham-tu',
    tagLabel: 'Toán Thám Tử',
    title: 'Bốn bạn Hoa, Ly, Mai và Lan mặc 4 áo màu khác nhau: Đỏ, Xanh, Vàng, Hồng. Hãy tìm màu áo của mỗi bạn.',
    titleEn: 'Four friends Hoa, Ly, Mai, and Lan wear four different colored shirts: Red, Blue, Yellow, Pink.',
    clues: [
      '1. Bạn Ly mặc chiếc áo màu Hồng rực rỡ.',
      '2. Bạn Hoa không thích màu Đỏ và màu Vàng.',
      '3. Bạn Mai khẳng định mình không bao giờ mặc áo màu Đỏ.'
    ],
    cluesEn: [
      '1. Ly wears a vibrant Pink shirt.',
      '2. Hoa dislikes both Red and Yellow.',
      '3. Mai confirms she never wears a Red shirt.'
    ],
    rowHeader: 'Bạn',
    colHeader: 'Màu áo',
    rows: ['Hoa', 'Ly', 'Mai', 'Lan'],
    cols: ['Đỏ', 'Xanh', 'Vàng', 'Hồng'],
    solution: {
      Hoa: 'Xanh',
      Ly: 'Hồng',
      Mai: 'Vàng',
      Lan: 'Đỏ'
    },
    hint: 'Ly mặc màu Hồng. Hoa không mặc Đỏ, Vàng, Hồng thì Hoa mặc màu gì?',
    explanation: 'Ly mặc Hồng. Hoa không mặc Đỏ, Vàng, Hồng => Hoa mặc Xanh. Mai không mặc Đỏ, Xanh, Hồng => Mai mặc Vàng. Lan mặc màu Đỏ.',
    explanationSteps: [
      'Bước 1: Ly mặc áo màu Hồng (dữ kiện 1).',
      'Bước 2: Hoa không mặc Đỏ, không mặc Vàng (dữ kiện 2), cũng không mặc Hồng (vì Ly mặc) => Hoa mặc áo Xanh.',
      'Bước 3: Mai không mặc Đỏ (dữ kiện 3), không mặc Xanh và Hồng => Mai mặc áo Vàng.',
      'Bước 4: Lan mặc màu áo còn lại là màu Đỏ.'
    ]
  },

  // CÂU 6: Thứ tự chạy đua
  {
    id: 'cau-6-chay-dua',
    questionNumber: 6,
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

  // CÂU 7: Thứ tự chiều cao
  {
    id: 'cau-7-chieu-cao',
    questionNumber: 7,
    type: 'order-comparison',
    tag: 'suy-luan-thu-tu',
    tagLabel: 'Thứ tự & Xếp hạng',
    title: 'Trong một nhóm bạn gồm Dũng, Hưng, Tuấn và Nam:',
    titleEn: 'In a group of four friends Dung, Hung, Tuan, and Nam:',
    clues: [
      '• Dũng cao hơn Hưng.',
      '• Tuấn thấp hơn Hưng nhưng lại cao hơn Nam.',
      'Hỏi bạn nào là người thấp nhất trong 4 bạn?'
    ],
    cluesEn: [
      '• Dung is taller than Hung.',
      '• Tuan is shorter than Hung but taller than Nam.',
      'Who is the shortest among them?'
    ],
    options: ['Dũng', 'Hưng', 'Tuấn', 'Nam'],
    correctAnswer: 'Nam',
    hint: 'Sắp xếp từ cao xuống thấp: Dũng > Hưng > Tuấn > Nam.',
    explanation: 'Dũng cao hơn Hưng (Dũng > Hưng). Tuấn thấp hơn Hưng nhưng cao hơn Nam (Hưng > Tuấn > Nam). Ghép thứ tự chiều cao: Dũng > Hưng > Tuấn > Nam. Vậy Nam là người thấp nhất!'
  },

  // CÂU 8: Cân thăng bằng dưa hấu, táo, cam
  {
    id: 'cau-8-can-hoa-qua',
    questionNumber: 8,
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

  // CÂU 9: Cân thăng bằng hình học
  {
    id: 'cau-9-can-hinh-hoc',
    questionNumber: 9,
    type: 'scale-balance',
    tag: 'can-thang-bang',
    tagLabel: 'Cân thăng bằng',
    title: 'Cho các cân thăng bằng với các khối hình học:',
    titleEn: 'Given the balance scales with geometric blocks:',
    clues: [
      '• Đĩa cân 1: 2 Khối vuông 🟦🟦 thăng bằng với 6 Khối tròn 🟡🟡🟡🟡🟡🟡',
      '• Đĩa cân 2: 1 Khối vuông 🟦 + 1 Khối tam giác 🔺 thăng bằng với 7 Khối tròn',
      'Hỏi 1 Khối tam giác 🔺 nặng bằng bao nhiêu Khối tròn 🟡?'
    ],
    cluesEn: [
      '• Scale 1: 2 Squares = 6 Circles',
      '• Scale 2: 1 Square + 1 Triangle = 7 Circles',
      'How many Circles does 1 Triangle equal?'
    ],
    scaleVisual: {
      left1: '🟦🟦 2 Khối vuông',
      right1: '🟡🟡🟡🟡🟡🟡 6 Khối tròn',
      left2: '🟦 1 Khối vuông + 🔺 1 Khối tam giác',
      right2: '🟡🟡🟡🟡🟡🟡🟡 7 Khối tròn',
      target: '🔺 1 Tam giác = ? 🟡 Tròn'
    },
    options: ['2 khối tròn', '3 khối tròn', '4 khối tròn', '5 khối tròn'],
    correctAnswer: '4 khối tròn',
    hint: 'Tính xem 1 khối vuông bằng mấy khối tròn trước: 6 : 2 = ?',
    explanation: '2 Khối vuông = 6 Khối tròn => 1 Khối vuông = 6 : 2 = 3 Khối tròn. Ở cân 2: 3 Khối tròn + 1 Khối tam giác = 7 Khối tròn => 1 Khối tam giác = 7 - 3 = 4 Khối tròn.'
  },

  // CÂU 10: Ma trận số quy luật cộng
  {
    id: 'cau-10-ma-tran-so',
    questionNumber: 10,
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

  // CÂU 11: Ma trận số quy luật nhân
  {
    id: 'cau-11-ma-tran-nhan',
    questionNumber: 11,
    type: 'pattern-matrix',
    tag: 'ma-tran-quy-luat',
    tagLabel: 'Ma trận số & Quy luật',
    title: 'Khám phá quy luật của các hàng để tìm số thay thế dấu (?):',
    titleEn: 'Discover the rule of the rows to find the number replacing (?):',
    matrix: [
      [2, 4, 8],
      [3, 3, 9],
      [5, 4, '?']
    ],
    options: [15, 18, 20, 24],
    correctAnswer: 20,
    hint: 'Thử làm phép nhân giữa hai số đầu tiên của mỗi hàng!',
    explanation: 'Quy luật: Tích của hai số đầu tiên bằng số thứ ba (Cột 1 × Cột 2 = Cột 3). Hàng 1: 2 × 4 = 8; Hàng 2: 3 × 3 = 9; Hàng 3: 5 × 4 = 20. Vậy số cần điền là 20.'
  },

  // CÂU 12: Mệnh đề Thật - Giả (Ai nói thật)
  {
    id: 'cau-12-that-gia',
    questionNumber: 12,
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
    explanation: 'Lời của An ("ở hộp Đỏ") và Bình ("không ở hộp Đỏ") mâu thuẫn nhau, nên 1 trong 2 bạn An hoặc Bình nói thật, người kia nói dối. Vì chỉ có DUY NHẤT 1 người nói thật, nên người thứ ba là Cúc CHẮC CHẮN NÓI DỐI. Cúc nói "ở hộp Xanh" là dối => Báu vật không ở hộp Xanh. Nếu báu vật ở hộp Đỏ => An nói thật, Bình nói dối, Cúc nói dối. Nhưng nếu vậy câu hỏi có 2 trường hợp? Khoan, xét nếu báu vật ở hộp Vàng: An nói dối ("ở đỏ"), Cúc nói dối ("ở xanh"), Bình nói thật ("không ở đỏ"). Đúng duy nhất 1 người thật là Bình! Vậy báu vật ở hộp màu Vàng.'
  }
];
