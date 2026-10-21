export type LogicQuestionType =
  | 'matchstick'
  | 'lineup-logic'
  | 'tree-interval'
  | 'venn-diagram'
  | 'calendar-clock'
  | 'pattern-matrix'
  | 'number-pyramid'
  | 'shape-counting'
  | 'symbol-substitute'
  | 'logic-grid'
  | 'code-breaker';

export interface LogicGridQuestion {
  id: string;
  questionNumber: number;
  type: 'logic-grid';
  categoryTitle: string;
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

export interface CodeBreakerQuestion {
  id: string;
  questionNumber: number;
  type: 'code-breaker';
  categoryTitle: string;
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
  categoryTitle: string;
  title: string;
  titleEn: string;
  pyramidRows: (number | null)[][];
  solutionRows: number[][];
  hint: string;
  explanation: string;
}

export interface ChoiceQuestion {
  id: string;
  questionNumber: number;
  type:
    | 'matchstick'
    | 'lineup-logic'
    | 'tree-interval'
    | 'venn-diagram'
    | 'calendar-clock'
    | 'pattern-matrix'
    | 'shape-counting'
    | 'symbol-substitute';
  categoryTitle: string;
  title: string;
  titleEn?: string;
  clues?: string[];
  visualContent?: {
    type: 'matchstick' | 'venn' | 'lineup' | 'tree' | 'clock' | 'substitute' | 'matrix' | 'shape';
    data: any;
  };
  options: (string | number)[];
  correctAnswer: string | number;
  hint: string;
  explanation: string;
  explanationSteps?: string[];
}

export type AdvancedQuestion =
  | LogicGridQuestion
  | CodeBreakerQuestion
  | NumberPyramidQuestion
  | ChoiceQuestion;

export const ADVANCED_CATEGORIES = [
  { id: 'all', name: 'Tất cả câu hỏi', icon: '🌟' },
  { id: 'matchstick', name: 'Toán Que Diêm', icon: '🥢' },
  { id: 'lineup-logic', name: 'Xếp Hàng & Bậc Thang', icon: '🚶' },
  { id: 'tree-interval', name: 'Bài Toán Trồng Cây', icon: '🌳' },
  { id: 'venn-diagram', name: 'Biểu Đồ Venn', icon: '⭕' },
  { id: 'calendar-clock', name: 'Đồng Hồ & Lịch Tuần', icon: '⏰' },
  { id: 'pattern-matrix', name: 'Quy Luật Dãy Số & Hình', icon: '🧩' },
  { id: 'number-pyramid', name: 'Tháp Số Kim Tự Tháp', icon: '🔺' },
  { id: 'shape-counting', name: 'Đếm Hình & Khối 3D', icon: '📐' },
  { id: 'symbol-substitute', name: 'Vật Che Chữ Số', icon: '🍎' },
  { id: 'logic-grid', name: 'Toán Thám Tử (Bảng)', icon: '🕵️‍♂️' },
  { id: 'code-breaker', name: 'Phá Khóa Mật Mã', icon: '🔐' },
];

export const ADVANCED_QUESTIONS: AdvancedQuestion[] = [
  // ==================== CHỦ ĐỀ 1: TOÁN QUE DIÊM (EBOOK TRANG 1, 11, 13, 17, 81) ====================
  {
    id: 'cau-1-que-diem-phep-tinh',
    questionNumber: 1,
    type: 'matchstick',
    categoryTitle: 'Toán Que Diêm',
    title: 'Phép tính que diêm: 6 + 4 = 4. Chỉ được di chuyển ĐÚNG 1 QUE DIÊM để được phép tính đúng. Đó là phép tính nào?',
    titleEn: 'Matchstick puzzle: Move exactly 1 matchstick in "6 + 4 = 4" to make a correct equation.',
    clues: [
      '• Phép tính que diêm ban đầu: 6 + 4 = 4 (chưa đúng)',
      '• Yêu cầu: Nhấc 1 que diêm từ một vị trí và đặt sang vị trí khác để tạo thành phép tính đúng.'
    ],
    visualContent: {
      type: 'matchstick',
      data: {
        equation: '6 + 4 = 4',
        moveClue: 'Gợi ý: Nhấc thanh ngang ở giữa số 6 biến số 6 thành số 0!'
      }
    },
    options: ['0 + 4 = 4', '5 + 4 = 9', '6 - 4 = 2', '8 - 4 = 4'],
    correctAnswer: '0 + 4 = 4',
    hint: 'Nhìn vào số 6: nhấc que diêm nằm ngang ở giữa số 6 bỏ ra ngoài hoặc dời đi, số 6 sẽ biến thành số 0 tròn trĩnh!',
    explanation: 'Nhấc que diêm nằm ngang ở giữa số 6 biến số 6 thành số 0. Ta được phép tính đúng: 0 + 4 = 4! (Hoặc lấy que từ dấu + sang số 4 để thành 6 - 4 = 2).'
  },
  {
    id: 'cau-2-que-diem-doi-cho-so-0',
    questionNumber: 2,
    type: 'matchstick',
    categoryTitle: 'Toán Que Diêm',
    title: 'Số 0 được ghép từ 6 que diêm. Nếu chỉ đổi chỗ ĐÚNG 1 que diêm trong số 0 thì có thể tạo thành các số nào?',
    titleEn: 'Number 0 is formed by 6 matches. Moving 1 matchstick can turn 0 into which numbers?',
    visualContent: {
      type: 'matchstick',
      data: {
        equation: 'Số 0 (gồm 6 que diêm)',
        moveClue: 'Nhấc 1 que ở cạnh đứng đặt vào giữa!'
      }
    },
    options: ['Số 6 và Số 9', 'Số 2 và Số 3', 'Số 4 và Số 7', 'Số 1 và Số 8'],
    correctAnswer: 'Số 6 và Số 9',
    hint: 'Nhấc que bên phải trên của số 0 đưa vào giữa ta được số 6; hoặc nhấc que bên trái dưới đưa vào giữa ta được số 9!',
    explanation: 'Từ số 0 (6 que diêm), khi nhấc 1 que dọc ở thành bên đặt vào thanh ngang giữa, ta có thể tạo thành số 6 hoặc số 9!'
  },
  {
    id: 'cau-3-que-diem-tim-so-9',
    questionNumber: 3,
    type: 'matchstick',
    categoryTitle: 'Toán Que Diêm',
    title: 'Đâu là cách xếp đúng số 9 từ các que diêm?',
    titleEn: 'Which configuration correctly forms digit 9 using matchsticks?',
    visualContent: {
      type: 'matchstick',
      data: {
        equation: 'Ghép que diêm thành số 9',
        moveClue: 'Số 9 điện tử gồm 6 que diêm: 3 que ngang (trên, giữa, dưới) và 3 que dọc (2 que trên, 1 que dưới phải)'
      }
    },
    options: ['Gồm 6 que diêm hoàn chỉnh', 'Gồm 4 que diêm', 'Gồm 5 que diêm khuyết', 'Gồm 7 que diêm'],
    correctAnswer: 'Gồm 6 que diêm hoàn chỉnh',
    hint: 'Số 9 có vòng tròn trên (4 que) và thêm 1 thanh dọc cùng 1 thanh đáy (2 que) = tổng 6 que diêm.',
    explanation: 'Số 9 hiển thị bằng que diêm chuẩn gồm 6 que diêm (khuyết thanh dọc dưới bên trái).'
  },
  {
    id: 'cau-4-que-diem-so-5-thanh-so-3',
    questionNumber: 4,
    type: 'matchstick',
    categoryTitle: 'Toán Que Diêm',
    title: 'Số 5 được ghép từ 5 que diêm (que 1: ngang trên, que 2: dọc trên trái, que 3: ngang giữa, que 4: dọc dưới phải, que 5: ngang đáy). Đổi chỗ que diêm thứ mấy để được số 3?',
    titleEn: 'Digit 5 has 5 matches. Which matchstick must be moved to turn 5 into 3?',
    visualContent: {
      type: 'matchstick',
      data: {
        equation: 'Số 5 -> Số 3',
        moveClue: 'Que 2 đang nằm ở phía trên bên trái!'
      }
    },
    options: ['Que diêm thứ 2', 'Que diêm thứ 3', 'Que diêm thứ 4', 'Que diêm thứ 5'],
    correctAnswer: 'Que diêm thứ 2',
    hint: 'Số 3 có 3 que ngang và 2 que dọc đều nằm ở BÊN PHẢI. Cần nhấc que dọc bên trái sang bên phải!',
    explanation: 'Nhấc que diêm thứ 2 (dọc trên bên trái) dời sang vị trí dọc trên bên phải, số 5 sẽ lập tức biến thành số 3!'
  },
  {
    id: 'cau-5-que-diem-xep-tu-3-que',
    questionNumber: 5,
    type: 'matchstick',
    categoryTitle: 'Toán Que Diêm',
    title: 'Có thể xếp được các chữ số nào chỉ từ đúng 3 que tính (que diêm)?',
    titleEn: 'Which numbers can be formed using exactly 3 matches?',
    visualContent: {
      type: 'matchstick',
      data: {
        equation: '3 que tính = ?',
        moveClue: 'Số 7: 1 que ngang + 2 que dọc (hoặc 1 que ngang + 1 que chéo + que gạch ngang); số 1: có thể cần 2 que; số 4: 1 que dọc dài + 1 que ngang + 1 que dọc'
      }
    },
    options: ['Số 1, 4, 7', 'Số 2, 4', 'Số 3, 5', 'Số 6, 9'],
    correctAnswer: 'Số 1, 4, 7',
    hint: 'Số 4 gồm 3 que (hoặc 4 que), số 7 gồm 3 que. Quan sát kỹ cấu tạo từng que tính nhé!',
    explanation: 'Các chữ số 1, 4, 7 có thể tạo thành từ đúng 3 que tính đơn giản.'
  },

  // ==================== CHỦ ĐỀ 2: BÀI TOÁN XẾP HÀNG & BẬC THANG (EBOOK TRANG 47, 48, 49, 67, 69) ====================
  {
    id: 'cau-6-xep-hang-xe-buyt',
    questionNumber: 6,
    type: 'lineup-logic',
    categoryTitle: 'Xếp Hàng & Bậc Thang',
    title: 'Có 3 người đứng trước cô Nga khi cô đang xếp hàng đi lên xe buýt. Cô Nga lại đứng thứ 4 từ cuối hàng lên. Hỏi có tất cả bao nhiêu người cùng xếp hàng?',
    titleEn: 'There are 3 people standing in front of Ms. Nga in a bus queue. Ms. Nga is the 4th person from the back. How many people are in the queue?',
    clues: [
      '• Đứng trước cô Nga: có 3 người.',
      '• Bản thân cô Nga: 1 người.',
      '• Đứng thứ 4 từ cuối hàng lên => có 3 người đứng sau cô Nga.'
    ],
    visualContent: {
      type: 'lineup',
      data: {
        before: 3,
        person: 'Cô Nga',
        after: 3
      }
    },
    options: ['6 người', '7 người', '8 người', '9 người'],
    correctAnswer: '7 người',
    hint: 'Số người = (Người đứng trước) + (Cô Nga) + (Người đứng sau). Đứng thứ 4 từ dưới lên tức là sau cô có 3 người!',
    explanation: 'Đứng trước cô Nga có 3 người. Cô Nga đứng thứ 4 từ cuối hàng lên => sau cô Nga có 3 người. Tổng số người trong hàng là: 3 + 1 (cô Nga) + 3 = 7 người.'
  },
  {
    id: 'cau-7-xep-hang-ban-nam',
    questionNumber: 7,
    type: 'lineup-logic',
    categoryTitle: 'Xếp Hàng & Bậc Thang',
    title: 'Trong một hàng có 20 bạn học sinh. Bạn Nam là người đứng thứ 6 tính từ dưới lên. Hỏi bạn Nam đứng thứ bao nhiêu nếu tính từ trên xuống?',
    titleEn: 'In a line of 20 students, Nam is 6th from the back. What is his position counting from the front?',
    visualContent: {
      type: 'lineup',
      data: {
        total: 20,
        fromBack: 6,
        target: 'Nam đứng thứ mấy từ trên xuống?'
      }
    },
    options: ['Thứ 14', 'Thứ 15', 'Thứ 16', 'Thứ 17'],
    correctAnswer: 'Thứ 15',
    hint: 'Công thức: Vị trí từ trên xuống = Tổng số bạn - Vị trí từ dưới lên + 1.',
    explanation: 'Bạn Nam đứng thứ 6 từ dưới lên => sau lưng Nam có 5 bạn. Vị trí của Nam từ trên xuống là: 20 - 5 = 15.'
  },
  {
    id: 'cau-8-xep-hang-ban-min',
    questionNumber: 8,
    type: 'lineup-logic',
    categoryTitle: 'Xếp Hàng & Bậc Thang',
    title: 'Trong một hàng, đứng trước bạn Min có 6 bạn, đứng sau bạn Min có 3 bạn. Hỏi hàng đó có tất cả bao nhiêu bạn?',
    titleEn: 'In a line, there are 6 students in front of Min and 3 students behind Min. How many students are in the line?',
    visualContent: {
      type: 'lineup',
      data: {
        before: 6,
        person: 'Bạn Min',
        after: 3
      }
    },
    options: ['9 bạn', '10 bạn', '11 bạn', '8 bạn'],
    correctAnswer: '10 bạn',
    hint: 'Đừng quên cộng chính bạn Min vào hàng nhé!',
    explanation: 'Tổng số bạn trong hàng là: 6 (đứng trước) + 1 (bạn Min) + 3 (đứng sau) = 10 bạn.'
  },
  {
    id: 'cau-9-xep-hang-peter',
    questionNumber: 9,
    type: 'lineup-logic',
    categoryTitle: 'Xếp Hàng & Bậc Thang',
    title: 'Trong một hàng có 15 bạn, bạn Peter là người đứng thứ 7 từ trên xuống. Hỏi sau bạn Peter có bao nhiêu bạn?',
    titleEn: 'In a line of 15 students, Peter is the 7th person from the front. How many students are behind Peter?',
    options: ['8 bạn', '9 bạn', '10 bạn', '7 bạn'],
    correctAnswer: '8 bạn',
    hint: 'Lấy tổng số bạn trong hàng trừ đi số thứ tự của Peter!',
    explanation: 'Số bạn đứng sau Peter là: 15 - 7 = 8 bạn.'
  },
  {
    id: 'cau-10-xep-hang-khang-trai-phai',
    questionNumber: 10,
    type: 'lineup-logic',
    categoryTitle: 'Xếp Hàng & Bậc Thang',
    title: 'Một hàng ngang có 25 bạn, bên phải bạn Khang có 4 bạn. Hỏi số bạn bên trái bạn Khang nhiều hơn số bạn bên phải bao nhiêu bạn?',
    titleEn: 'In a row of 25 students, 4 students are to Khang’s right. How many more students are on his left than on his right?',
    clues: [
      '• Tổng số bạn: 25 bạn.',
      '• Bên phải bạn Khang: 4 bạn.',
      '• Bản thân bạn Khang: 1 bạn.'
    ],
    options: [
      'Bên trái nhiều hơn và nhiều hơn 16 bạn',
      'Bên phải nhiều hơn và nhiều hơn 17 bạn',
      'Bên trái nhiều hơn và nhiều hơn 17 bạn',
      'Bằng nhau'
    ],
    correctAnswer: 'Bên trái nhiều hơn và nhiều hơn 16 bạn',
    hint: 'Tìm số bạn bên trái: 25 - 1 - 4 = 20 bạn. Sau đó so sánh: 20 - 4 = ?',
    explanation: 'Số bạn bên trái Khang là: 25 - 1 (Khang) - 4 = 20 bạn. Số bạn bên trái nhiều hơn bên phải là: 20 - 4 = 16 bạn.'
  },
  {
    id: 'cau-11-bac-thang-nha-kaka',
    questionNumber: 11,
    type: 'lineup-logic',
    categoryTitle: 'Xếp Hàng & Bậc Thang',
    title: 'Nhà KaKa có 2 tầng lầu (tầng trệt, lầu 1 và lầu 2). Cầu thang dẫn lên mỗi tầng lầu có 10 bậc thang. Hỏi nhà KaKa có tổng cộng bao nhiêu bậc thang để lên lầu 2?',
    titleEn: 'KaKa’s house has 2 upper floors. Each flight of stairs has 10 steps. How many steps in total from ground to floor 2?',
    visualContent: {
      type: 'lineup',
      data: {
        floor1: 'Trệt lên Lầu 1: 10 bậc',
        floor2: 'Lầu 1 lên Lầu 2: 10 bậc'
      }
    },
    options: ['10 bậc', '20 bậc', '30 bậc', '15 bậc'],
    correctAnswer: '20 bậc',
    hint: 'Từ tầng trệt lên lầu 1 cần 10 bậc. Từ lầu 1 lên lầu 2 cần thêm 10 bậc nữa!',
    explanation: 'Số bậc thang tổng cộng = 10 (lên lầu 1) + 10 (lên lầu 2) = 20 bậc thang.'
  },
  {
    id: 'cau-12-day-pho-ngoi-nha',
    questionNumber: 12,
    type: 'lineup-logic',
    categoryTitle: 'Xếp Hàng & Bậc Thang',
    title: 'Trong một dãy phố có 20 ngôi nhà được đánh số liên tiếp từ 1 đến 20. Nhà An ở vị trí số 7 và nhà Nam ở vị trí số 12. Hỏi ở giữa nhà An và nhà Nam có bao nhiêu ngôi nhà?',
    titleEn: 'A street has 20 houses numbered 1 to 20. An’s house is #7 and Nam’s house is #12. How many houses are strictly between them?',
    options: ['4 ngôi nhà', '5 ngôi nhà', '6 ngôi nhà', '8 ngôi nhà'],
    correctAnswer: '4 ngôi nhà',
    hint: 'Liệt kê các số nhà ở giữa số 7 và số 12: nhà số 8, 9, 10, 11!',
    explanation: 'Ở giữa số 7 và số 12 có các ngôi nhà mang số: 8, 9, 10, 11 => Đúng 4 ngôi nhà.'
  },

  // ==================== CHỦ ĐỀ 3: BÀI TOÁN TRỒNG CÂY & KHOẢNG CÁCH (EBOOK TRANG 45, 46, 55, 56) ====================
  {
    id: 'cau-13-khoang-cach-4-cay',
    questionNumber: 13,
    type: 'tree-interval',
    categoryTitle: 'Bài Toán Trồng Cây',
    title: 'Trên một đoạn đường thẳng có 4 cái cây được trồng cách đều nhau. Hỏi có bao nhiêu khoảng cách giữa 4 cái cây đó?',
    titleEn: 'Along a straight path, 4 trees are planted at equal distances. How many intervals/spaces are between them?',
    visualContent: {
      type: 'tree',
      data: {
        trees: 4,
        rule: 'Số khoảng cách = Số cây - 1'
      }
    },
    options: ['3 khoảng cách', '4 khoảng cách', '5 khoảng cách', '2 khoảng cách'],
    correctAnswer: '3 khoảng cách',
    hint: 'Vẽ 4 cây ra giấy: Cây 1 [khoảng cách 1] Cây 2 [khoảng cách 2] Cây 3 [khoảng cách 3] Cây 4!',
    explanation: 'Giữa 4 cái cây liên tiếp có đúng: 4 - 1 = 3 khoảng cách.'
  },
  {
    id: 'cau-14-trong-5-cay-tao-2m',
    questionNumber: 14,
    type: 'tree-interval',
    categoryTitle: 'Bài Toán Trồng Cây',
    title: 'Bà nội muốn trồng 5 cây táo ở sau vườn. Mỗi cây cách nhau 2 mét (m). Hỏi khoảng cách từ cây đầu tiên đến cây cuối cùng là bao nhiêu mét?',
    titleEn: 'Grandma plants 5 apple trees in a row, 2 meters apart. How far is it from the 1st tree to the 5th tree?',
    visualContent: {
      type: 'tree',
      data: {
        trees: 5,
        gapMeter: 2
      }
    },
    options: ['8 mét', '10 mét', '6 mét', '12 mét'],
    correctAnswer: '8 mét',
    hint: 'Tìm số khoảng cách trước: 5 cây có 4 khoảng cách. Mỗi khoảng cách dài 2m!',
    explanation: 'Giữa 5 cây táo có: 5 - 1 = 4 khoảng cách. Khoảng cách từ cây đầu tiên đến cây cuối cùng là: 2 + 2 + 2 + 2 = 8 mét.'
  },
  {
    id: 'cau-15-trong-dau-tay-7m',
    questionNumber: 15,
    type: 'tree-interval',
    categoryTitle: 'Bài Toán Trồng Cây',
    title: 'Bác nông dân trồng 8 cây dâu tây cách đều nhau trên một luống đất. Khoảng cách giữa cây đầu tiên với cây thứ tám là 7m. Hỏi khoảng cách giữa hai cây liên tiếp là bao nhiêu mét?',
    titleEn: 'A farmer plants 8 strawberry plants equally spaced. The distance from the 1st to the 8th plant is 7m. What is the spacing between 2 consecutive plants?',
    options: ['1m', '2m', '7m', '0.5m'],
    correctAnswer: '1m',
    hint: '8 cây liên tiếp thì có bao nhiêu khoảng cách? (8 - 1 = 7 khoảng cách). Lấy tổng độ dài chia cho số khoảng cách!',
    explanation: 'Giữa cây thứ nhất đến cây thứ tám có: 8 - 1 = 7 khoảng cách. Khoảng cách giữa hai cây liên tiếp là: 7m : 7 = 1 mét.'
  },
  {
    id: 'cau-16-chau-hoa-khoang-cach',
    questionNumber: 16,
    type: 'tree-interval',
    categoryTitle: 'Bài Toán Trồng Cây',
    title: 'Cứ 2 chậu hoa đặt cạnh nhau tạo thành 1 khoảng cách. Hỏi có bao nhiêu khoảng cách giữa 6 chậu hoa xếp thành một hàng liên tiếp?',
    titleEn: 'Every 2 flower pots create 1 interval. How many intervals are there between 6 pots placed in a row?',
    options: ['5 khoảng cách', '6 khoảng cách', '4 khoảng cách', '3 khoảng cách'],
    correctAnswer: '5 khoảng cách',
    hint: 'Số khoảng cách = Số chậu hoa - 1.',
    explanation: 'Giữa 6 chậu hoa liên tiếp có: 6 - 1 = 5 khoảng cách.'
  },
  {
    id: 'cau-17-coc-giao-thong-khoang-cach',
    questionNumber: 17,
    type: 'tree-interval',
    categoryTitle: 'Bài Toán Trồng Cây',
    title: 'Mỗi buổi sáng đi học, bạn An đi qua 8 cọc giao thông hình nón đặt cách đều nhau ven đường. Hỏi có bao nhiêu khoảng cách giữa 8 cọc giao thông này?',
    titleEn: 'On his way to school, An passes 8 traffic cones placed evenly. How many spaces are there between the 8 cones?',
    options: ['7 khoảng cách', '8 khoảng cách', '6 khoảng cách', '9 khoảng cách'],
    correctAnswer: '7 khoảng cách',
    hint: 'Khoảng cách giữa các vật = Tổng số vật trừ đi 1.',
    explanation: 'Giữa 8 cọc giao thông có: 8 - 1 = 7 khoảng cách.'
  },
  {
    id: 'cau-18-duong-4-cay-cach-4m',
    questionNumber: 18,
    type: 'tree-interval',
    categoryTitle: 'Bài Toán Trồng Cây',
    title: 'Con đường phía trước trường có 4 cái cây. Mỗi cái cây cách nhau 4m. Hỏi cây thứ tư cách cây thứ nhất bao nhiêu mét?',
    titleEn: 'The road in front of school has 4 trees, 4m apart each. How far is the 4th tree from the 1st tree?',
    options: ['12 mét', '16 mét', '8 mét', '10 mét'],
    correctAnswer: '12 mét',
    hint: 'Có bao nhiêu khoảng cách giữa 4 cây? (3 khoảng cách). Mỗi khoảng cách dài 4 mét!',
    explanation: 'Giữa 4 cái cây có: 4 - 1 = 3 khoảng cách. Cây thứ tư cách cây thứ nhất: 3 × 4m = 12 mét.'
  },

  // ==================== CHỦ ĐỀ 4: BIỂU ĐỒ VENN & PHÂN LOẠI TẬP HỢP (EBOOK TRANG 25, 26, 33) ====================
  {
    id: 'cau-19-venn-con-vat-luong-cu',
    questionNumber: 19,
    type: 'venn-diagram',
    categoryTitle: 'Biểu Đồ Venn',
    title: 'Trong tiết Khoa học, bạn Lan đếm được tất cả 8 con vật. Trong đó có 5 con sống dưới nước và 5 con sống trên cạn. Hỏi có bao nhiêu con vật vừa sống dưới nước vừa sống trên cạn (lưỡng cư)?',
    titleEn: 'Lan counted 8 animals: 5 live in water and 5 live on land. How many animals live both in water and on land?',
    clues: [
      '• Tổng số con vật: 8 con.',
      '• Vòng tròn A (Dưới nước): 5 con.',
      '• Vòng tròn B (Trên cạn): 5 con.'
    ],
    visualContent: {
      type: 'venn',
      data: {
        circleA: 'Dưới nước (5 con)',
        circleB: 'Trên cạn (5 con)',
        total: '8 con'
      }
    },
    options: ['2 con vật', '1 con vật', '3 con vật', '4 con vật'],
    correctAnswer: '2 con vật',
    hint: 'Tính tổng: 5 + 5 = 10 lượt con vật. Nhưng thực tế chỉ có 8 con. Lấy 10 - 8 = ?',
    explanation: 'Tổng số lượt con vật là: 5 + 5 = 10. Vì thực tế chỉ có 8 con vật, phần giao nhau (vừa dưới nước vừa trên cạn như ếch, cá sấu) là: 10 - 8 = 2 con vật.'
  },
  {
    id: 'cau-20-venn-so-chan-lon-hon-20',
    questionNumber: 20,
    type: 'venn-diagram',
    categoryTitle: 'Biểu Đồ Venn',
    title: 'Quan sát sơ đồ Venn: Vòng bên trái chứa "Số chẵn", vòng bên phải chứa "Số lớn hơn 20". Các số trong phần giao nhau là: 22, 36, 28, 20. Hỏi có bao nhiêu số vừa là số chẵn vừa LỚN HƠN 20?',
    titleEn: 'In a Venn diagram of "Even numbers" and "Numbers > 20", the intersection shows: 22, 36, 28, 20. How many numbers are strictly greater than 20 and even?',
    options: ['3 số (22, 28, 36)', '4 số', '2 số', '5 số'],
    correctAnswer: '3 số (22, 28, 36)',
    hint: 'Lưu ý: "Lớn hơn 20" phải có giá trị > 20, số 20 bằng 20 nên không lớn hơn 20!',
    explanation: 'Số 20 bằng 20 (không lớn hơn 20). Các số chẵn vừa LỚN HƠN 20 gồm: 22, 28, 36 (có đúng 3 số).'
  },

  // ==================== CHỦ ĐỀ 5: XEM ĐỒNG HỒ & LỊCH CÁC NGÀY TRONG TUẦN (EBOOK TRANG 41, 52, 53, 54, 55, 110, 114) ====================
  {
    id: 'cau-21-ngay-mai-la-thu-bay',
    questionNumber: 21,
    type: 'calendar-clock',
    categoryTitle: 'Đồng Hồ & Lịch Tuần',
    title: 'Câu đố tư duy: "Ngày hôm sau của ngày mai là thứ Bảy." Hỏi hôm nay đang là thứ mấy trong tuần?',
    titleEn: 'Riddle: "The day after tomorrow is Saturday." What day is today?',
    clues: [
      '• Ngày hôm sau của ngày mai = 2 ngày nữa.',
      '• 2 ngày nữa là thứ Bảy.'
    ],
    options: ['Thứ Năm', 'Thứ Tư', 'Thứ Sáu', 'Chủ Nhật'],
    correctAnswer: 'Thứ Năm',
    hint: 'Lùi từng bước: Ngày hôm sau của ngày mai là thứ Bảy => Ngày mai là thứ Sáu => Hôm nay là thứ mấy?',
    explanation: 'Ngày hôm sau của ngày mai là thứ Bảy => Ngày mai là thứ Sáu => Hôm nay chính là thứ Năm.'
  },
  {
    id: 'cau-22-hom-kia-la-thu-bay',
    questionNumber: 22,
    type: 'calendar-clock',
    categoryTitle: 'Đồng Hồ & Lịch Tuần',
    title: 'Biết rằng "Hôm kia là thứ Bảy". Hỏi "Ngày mốt" (ngày kia) sẽ là thứ mấy trong tuần?',
    titleEn: 'If "the day before yesterday was Saturday", what day will "the day after tomorrow" be?',
    options: ['Thứ Tư', 'Thứ Ba', 'Thứ Năm', 'Thứ Hai'],
    correctAnswer: 'Thứ Tư',
    hint: 'Hôm kia là thứ Bảy => Hôm qua là Chủ Nhật => Hôm nay là thứ Hai. Ngày mai là thứ Ba => Ngày mốt là thứ mấy?',
    explanation: 'Hôm kia là thứ Bảy => Hôm qua là Chủ Nhật => Hôm nay là thứ Hai. Vậy ngày mai là thứ Ba, và ngày mốt sẽ là thứ Tư!'
  },
  {
    id: 'cau-23-hom-nay-thu-ba-14',
    questionNumber: 23,
    type: 'calendar-clock',
    categoryTitle: 'Đồng Hồ & Lịch Tuần',
    title: 'Nếu hôm nay là thứ Ba, ngày 14 thì hôm qua là thứ mấy, ngày bao nhiêu?',
    titleEn: 'If today is Tuesday, the 14th, what day and date was yesterday?',
    options: ['Thứ Hai, ngày 13', 'Thứ Tư, ngày 15', 'Thứ Hai, ngày 15', 'Thứ Tư, ngày 13'],
    correctAnswer: 'Thứ Hai, ngày 13',
    hint: 'Hôm qua là ngày liền trước của hôm nay: thứ Ba lùi 1 ngày là thứ Hai, ngày 14 lùi 1 ngày là ngày 13!',
    explanation: 'Hôm qua là ngày liền trước: Thứ Ba lùi 1 ngày là thứ Hai, ngày 14 lùi 1 ngày là ngày 13 => Thứ Hai, ngày 13.'
  },
  {
    id: 'cau-24-dong-ho-9-gio',
    questionNumber: 24,
    type: 'calendar-clock',
    categoryTitle: 'Đồng Hồ & Lịch Tuần',
    title: 'Khi kim ngắn (kim giờ) chỉ vào đúng số 9 và kim dài (kim phút) chỉ vào đúng số 12, thì đồng hồ đó đang chỉ mấy giờ?',
    titleEn: 'When the short hand points to 9 and the long hand points to 12, what time is it?',
    options: ['9 giờ', '12 giờ', '9 giờ 12 phút', '8 giờ'],
    correctAnswer: '9 giờ',
    hint: 'Kim dài chỉ số 12 là đúng giờ chẵn!',
    explanation: 'Kim ngắn chỉ số 9 và kim dài chỉ số 12 nghĩa là đồng hồ đang chỉ đúng 9 giờ.'
  },
  {
    id: 'cau-25-dong-ho-8-gio-ruoi',
    questionNumber: 25,
    type: 'calendar-clock',
    categoryTitle: 'Đồng Hồ & Lịch Tuần',
    title: 'Lúc 8 giờ rưỡi (8 giờ 30 phút), vị trí của kim giờ và kim phút trên mặt đồng hồ như thế nào?',
    titleEn: 'At half past eight (8:30), where do the hour and minute hands point?',
    options: [
      'Kim giờ chỉ giữa số 8 và 9, kim phút chỉ số 6',
      'Kim giờ chỉ số 6, kim phút chỉ số 8',
      'Kim giờ chỉ số 8, kim phút chỉ số 5',
      'Cả hai kim cùng chỉ số 8'
    ],
    correctAnswer: 'Kim giờ chỉ giữa số 8 và 9, kim phút chỉ số 6',
    hint: '"Rưỡi" nghĩa là 30 phút, kim phút quay đến số 6; kim giờ đã đi được nửa đường giữa số 8 và số 9!',
    explanation: 'Lúc 8 giờ rưỡi, kim phút chỉ đúng số 6 (30 phút) và kim giờ di chuyển đến chính giữa số 8 và số 9.'
  },
  {
    id: 'cau-26-minh-an-com-6h30',
    questionNumber: 26,
    type: 'calendar-clock',
    categoryTitle: 'Đồng Hồ & Lịch Tuần',
    title: 'Bạn Minh ăn cơm tối xong lúc 6 giờ 30 phút. Sau 10 phút nữa, Minh sẽ bắt đầu ngồi vào bàn làm bài. Hỏi Minh bắt đầu làm bài lúc mấy giờ?',
    titleEn: 'Minh finishes dinner at 6:30. In 10 minutes, he will study. What time will he start studying?',
    options: ['6 giờ 40 phút', '6 giờ 30 phút', '7 giờ', '6 giờ 20 phút'],
    correctAnswer: '6 giờ 40 phút',
    hint: 'Lấy số phút cộng thêm 10 phút: 30 phút + 10 phút = ?',
    explanation: 'Thời gian Minh bắt đầu làm bài: 6 giờ 30 phút + 10 phút = 6 giờ 40 phút.'
  },

  // ==================== CHỦ ĐỀ 6: QUY LUẬT DÃY SỐ & DÃY HÌNH (EBOOK TRANG 58, 59, 62, 102, 103) ====================
  {
    id: 'cau-27-quy-luat-sao-va-tron',
    questionNumber: 27,
    type: 'pattern-matrix',
    categoryTitle: 'Quy Luật Dãy Số & Hình',
    title: 'Quan sát quy luật dãy hình: ⭐ 🔵 ⭐ 🔵 🔵 ⭐ 🔵 🔵 🔵 ⭐ ... Hỏi sau ngôi sao tiếp theo sẽ có bao nhiêu hình tròn 🔵?',
    titleEn: 'Pattern: ⭐ 🔵 ⭐ 🔵 🔵 ⭐ 🔵 🔵 🔵 ⭐ ... How many circles 🔵 follow the next star?',
    visualContent: {
      type: 'matrix',
      data: {
        pattern: '⭐ 🔵 ⭐ 🔵 🔵 ⭐ 🔵 🔵 🔵 ⭐ [ ? ? ? ? ]'
      }
    },
    options: ['4 hình tròn 🔵', '3 hình tròn 🔵', '5 hình tròn 🔵', '2 hình tròn 🔵'],
    correctAnswer: '4 hình tròn 🔵',
    hint: 'Giữa 2 ngôi sao đầu có 1 hình tròn; cặp sau có 2 hình tròn; cặp tiếp theo có 3 hình tròn... Quy luật tăng dần!',
    explanation: 'Số hình tròn xen giữa các ngôi sao tăng dần theo thứ tự 1, 2, 3, 4... Vậy sau ngôi sao tiếp theo sẽ có đúng 4 hình tròn.'
  },
  {
    id: 'cau-28-day-so-cach-deu-4',
    questionNumber: 28,
    type: 'pattern-matrix',
    categoryTitle: 'Quy Luật Dãy Số & Hình',
    title: 'Tìm hai số còn thiếu trong dãy số sau: 2; 6; 10; ... ; ... ; 22; 26',
    titleEn: 'Find the two missing numbers in the sequence: 2; 6; 10; ... ; ... ; 22; 26',
    options: ['14 và 18', '12 và 16', '14 và 16', '12 và 18'],
    correctAnswer: '14 và 18',
    hint: 'Tìm khoảng cách giữa các số: 6 - 2 = 4; 10 - 6 = 4. Đây là dãy số cộng thêm 4!',
    explanation: 'Quy luật mỗi số bằng số đứng trước cộng thêm 4: 10 + 4 = 14; 14 + 4 = 18; 18 + 4 = 22. Hai số cần điền là 14 và 18.'
  },

  // ==================== CHỦ ĐỀ 7: THÁP SỐ KIM TỰ THÁP (EBOOK TRANG 102) ====================
  {
    id: 'cau-29-thap-so-kim-tu-thap',
    questionNumber: 29,
    type: 'number-pyramid',
    categoryTitle: 'Tháp Số Kim Tự Tháp',
    title: 'Mỗi viên gạch bằng tổng của hai viên gạch ngay dưới nó. Hãy tính nhẩm và điền số còn thiếu vào đỉnh kim tự tháp:',
    titleEn: 'Each brick is the sum of the two bricks below it. Fill in the missing numbers:',
    pyramidRows: [
      [null],
      [null, 15],
      [7, null, 9],
      [3, 4, 2, 7]
    ],
    solutionRows: [
      [28],
      [13, 15],
      [7, 6, 9],
      [3, 4, 2, 7]
    ],
    hint: 'Tính từ tầng đáy lên: 3 + 4 = 7; 4 + 2 = 6; 2 + 7 = 9. Tầng tiếp theo: 7 + 6 = 13. Đỉnh tháp: 13 + 15 = ?',
    explanation: 'Hàng 2: ô giữa là 4 + 2 = 6. Hàng 1: ô trái là 7 + 6 = 13. Đỉnh kim tự tháp là 13 + 15 = 28.'
  },

  // ==================== CHỦ ĐỀ 8: ĐẾM HÌNH & KHỐI 3D (EBOOK TRANG 30, 85, 87, 89, 91) ====================
  {
    id: 'cau-30-dem-hinh-tam-giac',
    questionNumber: 30,
    type: 'shape-counting',
    categoryTitle: 'Đếm Hình & Khối 3D',
    title: 'Một hình tam giác lớn có 1 đường kẻ ngang chia đôi và 1 đường kẻ dọc từ đỉnh xuống đáy. Hỏi có tất cả bao nhiêu hình tam giác trong hình?',
    titleEn: 'A large triangle is divided by a horizontal line and a vertical line from the apex. How many triangles in total?',
    options: ['6 hình tam giác', '4 hình tam giác', '5 hình tam giác', '8 hình tam giác'],
    correctAnswer: '6 hình tam giác',
    hint: 'Đếm tầng trên có: 2 tam giác đơn + 1 tam giác ghép = 3. Đếm cả hình lớn cũng có 3 hình!',
    explanation: 'Tầng trên gồm: 2 tam giác nhỏ + 1 tam giác ghép = 3 hình. Toàn bộ hình lớn gồm: 2 nửa tam giác lớn + 1 tam giác to nhất = 3 hình. Tổng cộng có: 3 + 3 = 6 hình tam giác.'
  },
  {
    id: 'cau-31-dem-khoi-lap-phuong',
    questionNumber: 31,
    type: 'shape-counting',
    categoryTitle: 'Đếm Hình & Khối 3D',
    title: 'Một mô hình gồm các khối lập phương được xếp chồng lên nhau thành các tầng: Tầng 1 (đáy) có 3x3 = 9 khối; Tầng 2 có 2x2 = 4 khối; Tầng 3 (trên cùng) có 1 khối. Hỏi có tất cả bao nhiêu khối lập phương?',
    titleEn: 'A structure is made of stacked unit cubes: Floor 1 (base) has 3x3=9 cubes; Floor 2 has 2x2=4 cubes; Floor 3 (top) has 1 cube. How many cubes in total?',
    options: ['14 khối lập phương', '12 khối lập phương', '15 khối lập phương', '10 khối lập phương'],
    correctAnswer: '14 khối lập phương',
    hint: 'Cộng số khối của từng tầng lại với nhau: 9 + 4 + 1 = ?',
    explanation: 'Tổng số khối lập phương = 9 (tầng 1) + 4 (tầng 2) + 1 (tầng 3) = 14 khối lập phương.'
  },
  {
    id: 'cau-32-cat-giay-tam-giac',
    questionNumber: 32,
    type: 'shape-counting',
    categoryTitle: 'Đếm Hình & Khối 3D',
    title: 'Cắt một tờ giấy hình chữ nhật theo đường nào thì tờ giấy sẽ được chia thành đúng 2 hình tam giác?',
    titleEn: 'Along which cut will a rectangular sheet of paper be divided into exactly 2 triangles?',
    options: [
      'Đường chéo nối hai góc đối diện',
      'Đường thẳng đứng chia đôi chiều dài',
      'Đường nằm ngang chia đôi chiều rộng',
      'Đường gấp khúc'
    ],
    correctAnswer: 'Đường chéo nối hai góc đối diện',
    hint: 'Một đường chéo chia hình chữ nhật thành 2 nửa tam giác vuông bằng nhau!',
    explanation: 'Cắt theo đường chéo nối hai đỉnh đối diện của hình chữ nhật, ta nhận được đúng 2 hình tam giác.'
  },

  // ==================== CHỦ ĐỀ 9: VẬT CHE CHỮ SỐ (EBOOK TRANG 11, 16, 95) ====================
  {
    id: 'cau-33-qua-tao-che-so',
    questionNumber: 33,
    type: 'symbol-substitute',
    categoryTitle: 'Vật Che Chữ Số',
    title: 'Quả táo đỏ đã che đi một chữ số bí mật trong hai phép tính: (10 + 🍎 = 13) và (16 - 🍎 = 13). Hỏi quả táo 🍎 che chữ số nào?',
    titleEn: 'Red apple covers a secret digit: (10 + 🍎 = 13) and (16 - 🍎 = 13). What digit does 🍎 represent?',
    visualContent: {
      type: 'substitute',
      data: {
        line1: '10 + 🍎 = 13',
        line2: '16 - 🍎 = 13',
        target: 'Tìm chữ số 🍎 = ?'
      }
    },
    options: ['3', '2', '4', '5'],
    correctAnswer: '3',
    hint: '10 cộng mấy bằng 13? Và 16 trừ mấy bằng 13?',
    explanation: '10 + 3 = 13 và 16 - 3 = 13. Vậy chữ số bí mật được quả táo 🍎 che là số 3.'
  },
  {
    id: 'cau-34-con-cua-che-so',
    questionNumber: 34,
    type: 'symbol-substitute',
    categoryTitle: 'Vật Che Chữ Số',
    title: 'Con cua màu đỏ 🦀 che mất một chữ số trong biểu thức so sánh: 7 < 🦀 < 9. Hỏi con cua đã che mất chữ số nào?',
    titleEn: 'A red crab 🦀 covers a number such that 7 < 🦀 < 9. What number is covered by 🦀?',
    options: ['8', '6', '9', '10'],
    correctAnswer: '8',
    hint: 'Số tự nhiên nào nằm giữa số 7 và số 9?',
    explanation: 'Số tự nhiên lớn hơn 7 và nhỏ hơn 9 duy nhất là số 8: 7 < 8 < 9.'
  },
  {
    id: 'cau-35-qua-cam-che-so',
    questionNumber: 35,
    type: 'symbol-substitute',
    categoryTitle: 'Vật Che Chữ Số',
    title: 'Điền số thích hợp vào quả cam 🍊 trong phép tính sau: 8 - 🍊 = 6.',
    titleEn: 'Find the number behind the orange 🍊 in: 8 - 🍊 = 6.',
    options: ['2', '3', '4', '1'],
    correctAnswer: '2',
    hint: '8 trừ mấy thì bằng 6? Lấy 8 - 6 = ?',
    explanation: '8 - 2 = 6. Vậy chữ số che sau quả cam là 2.'
  },

  // ==================== CHỦ ĐỀ 10: TOÁN THÁM TỬ (BẢNG LOGIC GRID) ====================
  {
    id: 'cau-36-nghe-nghiep-tham-tu',
    questionNumber: 36,
    type: 'logic-grid',
    categoryTitle: 'Toán Thám Tử (Bảng)',
    title: 'Các chú Huy, Bình và Phúc làm những nghề khác nhau (Giáo viên, Nha sĩ, Đầu bếp). Hãy suy luận và tích ✓ vào bảng để tìm nghề của mỗi chú:',
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
    hint: 'Bắt đầu từ dữ kiện 2: Chú Phúc không phải giáo viên, không phải đầu bếp => Phúc chắc chắn là ai?',
    explanation: 'Từ dữ kiện 2, chú Phúc không phải giáo viên và không phải đầu bếp => chú Phúc là Nha sĩ. Từ dữ kiện 1, chú Bình và chú Phúc không làm đầu bếp => chú Huy là Đầu bếp. Còn lại chú Bình là Giáo viên.',
    explanationSteps: [
      'Bước 1: Chú Phúc không làm giáo viên (✗), không làm đầu bếp (✗) => Chú Phúc là Nha sĩ (✓).',
      'Bước 2: Cột Đầu bếp: Chú Bình không làm, chú Phúc không làm => Chú Huy là Đầu bếp (✓).',
      'Bước 3: Chú Bình còn lại là Giáo viên (✓).'
    ]
  },

  // ==================== CHỦ ĐỀ 11: PHÁ KHÓA MẬT MÃ LOGIC ====================
  {
    id: 'cau-37-pha-khoa-mat-ma',
    questionNumber: 37,
    type: 'code-breaker',
    categoryTitle: 'Phá Khóa Mật Mã',
    title: 'Một chiếc vali mật mã 3 chữ số có các manh mối bảo mật. Hãy giải mã để mở vali:',
    titleEn: 'Crack the 3-digit briefcase lock with the given security hints:',
    digitsCount: 3,
    clueStrips: [
      { code: '6 8 2', description: 'Một chữ số đúng và ĐÚNG VỊ TRÍ 🎯', badge: '1 đúng vị trí' },
      { code: '6 1 4', description: 'Một chữ số đúng nhưng SAI VỊ TRÍ 🔄', badge: '1 đúng sai vị trí' },
      { code: '2 0 6', description: 'Hai chữ số đúng nhưng ĐỀU SAI VỊ TRÍ 🔄🔄', badge: '2 đúng sai vị trí' },
      { code: '7 3 8', description: 'KHÔNG CÓ chữ số nào đúng cả ❌', badge: '0 đúng (loại)' },
      { code: '7 8 0', description: 'Một chữ số đúng nhưng SAI VỊ TRÍ 🔄', badge: '1 đúng sai vị trí' }
    ],
    correctCode: '042',
    hint: 'Gạch bỏ các số 7, 3, 8 trước tiên vì manh mối số 4 khẳng định chúng hoàn toàn sai!',
    explanation: 'Mật mã mở rương là 042.',
    explanationSteps: [
      'Bước 1: Dòng "7 3 8" không có số nào đúng => Loại bỏ 7, 3, 8.',
      'Bước 2: Dòng "7 8 0" loại 7 và 8 => Số 0 đúng nhưng sai vị trí thứ ba => 0 ở vị trí 1 hoặc 2.',
      'Bước 3: Dòng "6 8 2" có 1 số đúng vị trí => Số 2 đúng vị trí ở hàng đơn vị [?][?][2].',
      'Bước 4: Dòng "2 0 6" có hai số đúng là 2 và 0 => Số 0 phải đứng ở hàng trăm: [0][?][2].',
      'Bước 5: Dòng "6 1 4" có 1 số đúng sai vị trí => 4 là số đúng ở hàng chục: 042!'
    ]
  }
];
