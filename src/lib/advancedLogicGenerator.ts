import type {
  AdvancedQuestion,
  ChoiceQuestion,
  LogicGridQuestion,
  CodeBreakerQuestion,
  NumberPyramidQuestion,
} from '../data/advancedLogicMath';

const VIETNAMESE_NAMES = [
  'An', 'Bình', 'Cúc', 'Dũng', 'Hà', 'Huy', 'Khoa', 'Khang', 'Lan', 'Linh',
  'Mai', 'Minh', 'Nam', 'Nga', 'Peter', 'Phúc', 'Quân', 'Sơn', 'Tuấn', 'Vy'
];

const TREE_ITEMS = [
  { item: 'cây táo', unit: 'cây', icon: '🍎' },
  { item: 'cây cam', unit: 'cây', icon: '🍊' },
  { item: 'cây xoài', unit: 'cây', icon: '🥭' },
  { item: 'cây dâu tây', unit: 'cây', icon: '🍓' },
  { item: 'chậu hoa cúc', unit: 'chậu', icon: '🌼' },
  { item: 'chậu hoa hồng', unit: 'chậu', icon: '🌹' },
  { item: 'cọc tiêu giao thông', unit: 'cọc', icon: '🔺' },
  { item: 'cột đèn đường', unit: 'cột', icon: '💡' },
];

const DAYS_OF_WEEK = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 1. Máy tạo câu hỏi Toán Que Diêm
function makeMatchstickQuestion(id: string, qNum: number): ChoiceQuestion {
  const puzzles = [
    {
      eq: '6 + 4 = 4',
      correct: '0 + 4 = 4',
      distractors: ['5 + 4 = 9', '6 - 4 = 2', '8 - 4 = 4'],
      clue: 'Nhấc thanh ngang ở giữa số 6 biến số 6 thành số 0!',
      hint: 'Nhấc que diêm nằm ngang ở giữa số 6 để biến số 6 thành số 0 tròn trĩnh!',
      expl: 'Nhấc que diêm nằm ngang ở giữa số 6, biến số 6 thành số 0. Ta được phép tính đúng: 0 + 4 = 4!'
    },
    {
      eq: '6 - 1 = 7',
      correct: '6 + 1 = 7',
      distractors: ['8 - 1 = 7', '5 + 2 = 7', '7 - 1 = 6'],
      clue: 'Di chuyển 1 que diêm ở số 6 hoặc phép tính!',
      hint: 'Lấy 1 que ở số 6 hoặc chuyển que để đổi dấu trừ thành dấu cộng!',
      expl: 'Có thể lấy 1 que ở số 6 chuyển vào dấu trừ để thành phép cộng: 6 + 1 = 7 (hoặc 8 - 1 = 7).'
    },
    {
      eq: '9 - 5 = 2',
      correct: '9 - 7 = 2',
      distractors: ['8 - 6 = 2', '7 - 5 = 2', '9 - 5 = 4'],
      clue: 'Di chuyển 1 que diêm ở số 5!',
      hint: 'Đổi que diêm ở số 5 để biến thành số 7!',
      expl: 'Chuyển que diêm ở số 5 để tạo thành số 7, ta có phép tính đúng: 9 - 7 = 2.'
    },
    {
      eq: '8 - 4 = 6',
      correct: '8 - 4 = 4',
      distractors: ['6 - 4 = 2', '8 - 2 = 6', '9 - 3 = 6'],
      clue: 'Di chuyển 1 que diêm ở số 6 để thành số 4!',
      hint: 'Bỏ 1 que ở đáy số 6 dời lên để số 6 biến thành số 4!',
      expl: 'Chuyển 1 que diêm ở số 6 để tạo thành số 4, ta được đẳng thức đúng: 8 - 4 = 4.'
    },
    {
      eq: '3 + 5 = 9',
      correct: '3 + 6 = 9',
      distractors: ['5 + 4 = 9', '4 + 5 = 9', '3 + 5 = 8'],
      clue: 'Đổi chỗ 1 que diêm ở số 5 để thành số 6!',
      hint: 'Nhấc 1 que của số 5 dời sang bên trái dưới để thành số 6!',
      expl: 'Chuyển 1 que diêm trong số 5 để tạo thành số 6: 3 + 6 = 9!'
    },
    {
      eq: '5 + 7 = 2',
      correct: '9 - 7 = 2',
      distractors: ['8 - 6 = 2', '5 + 2 = 7', '7 - 5 = 2'],
      clue: 'Lấy 1 que từ dấu cộng sang số 5!',
      hint: 'Dấu cộng nhấc 1 que thành dấu trừ, đặt que đó vào số 5 để thành số 9!',
      expl: 'Nhấc thanh dọc ở dấu + (thành dấu -) và đặt vào số 5 để biến thành số 9. Phép tính đúng: 9 - 7 = 2.'
    }
  ];

  const p = pickRandom(puzzles);
  return {
    id,
    questionNumber: qNum,
    type: 'matchstick',
    categoryTitle: 'Toán Que Diêm',
    title: `Phép tính que diêm: ${p.eq}. Chỉ được di chuyển ĐÚNG 1 QUE DIÊM để được phép tính đúng. Đó là phép tính nào?`,
    visualContent: {
      type: 'matchstick',
      data: {
        equation: p.eq,
        moveClue: p.clue,
      }
    },
    options: shuffle([p.correct, ...p.distractors]),
    correctAnswer: p.correct,
    hint: p.hint,
    explanation: p.expl
  };
}

// 2. Máy tạo câu hỏi Xếp hàng & Bậc thang
function makeLineupQuestion(id: string, qNum: number): ChoiceQuestion {
  const name1 = pickRandom(VIETNAMESE_NAMES);
  const subType = randInt(1, 4);

  if (subType === 1) {
    // Vị trí từ dưới lên -> vị trí từ trên xuống
    const total = randInt(16, 26);
    const fromBack = randInt(4, 9);
    const fromFront = total - fromBack + 1;
    const correct = `Thứ ${fromFront}`;

    return {
      id,
      questionNumber: qNum,
      type: 'lineup-logic',
      categoryTitle: 'Xếp Hàng & Bậc Thang',
      title: `Trong một hàng có ${total} bạn học sinh. Bạn ${name1} là người đứng thứ ${fromBack} tính từ dưới lên. Hỏi bạn ${name1} đứng thứ bao nhiêu nếu tính từ trên xuống?`,
      titleEn: `In a line of ${total} students, ${name1} is ${fromBack}th from the back. What is their position from the front?`,
      visualContent: {
        type: 'lineup',
        data: { total, fromBack, person: name1 }
      },
      options: shuffle([correct, `Thứ ${fromFront - 1}`, `Thứ ${fromFront + 1}`, `Thứ ${fromFront + 2}`]),
      correctAnswer: correct,
      hint: `Công thức: Vị trí từ trên xuống = Tổng số bạn - Vị trí từ dưới lên + 1 (${total} - ${fromBack} + 1).`,
      explanation: `Bạn ${name1} đứng thứ ${fromBack} từ dưới lên nghĩa là sau lưng bạn có ${fromBack - 1} bạn. Vị trí của bạn ${name1} từ trên xuống là: ${total} - ${fromBack - 1} = ${fromFront}.`
    };
  }

  if (subType === 2) {
    // Đứng trước có A bạn, đứng sau có B bạn
    const before = randInt(4, 9);
    const after = randInt(3, 8);
    const total = before + 1 + after;
    const correct = `${total} bạn`;

    return {
      id,
      questionNumber: qNum,
      type: 'lineup-logic',
      categoryTitle: 'Xếp Hàng & Bậc Thang',
      title: `Trong một hàng, đứng trước bạn ${name1} có ${before} bạn, đứng sau bạn ${name1} có ${after} bạn. Hỏi hàng đó có tất cả bao nhiêu bạn?`,
      titleEn: `In a line, ${before} students are in front of ${name1} and ${after} students are behind ${name1}. How many students in total?`,
      visualContent: {
        type: 'lineup',
        data: { before, person: name1, after }
      },
      options: shuffle([correct, `${total - 1} bạn`, `${total + 1} bạn`, `${total + 2} bạn`]),
      correctAnswer: correct,
      hint: `Lấy số bạn đứng trước cộng với bạn ${name1} (1 bạn) cộng số bạn đứng sau!`,
      explanation: `Tổng số bạn trong hàng là: ${before} (đứng trước) + 1 (bạn ${name1}) + ${after} (đứng sau) = ${total} bạn.`
    };
  }

  if (subType === 3) {
    // Xếp hàng lên xe buýt: có A người đứng trước, đứng thứ K từ cuối lên
    const before = randInt(3, 7);
    const fromBack = randInt(3, 6);
    const after = fromBack - 1;
    const total = before + 1 + after;
    const correct = `${total} người`;

    return {
      id,
      questionNumber: qNum,
      type: 'lineup-logic',
      categoryTitle: 'Xếp Hàng & Bậc Thang',
      title: `Có ${before} người đứng trước cô ${name1} khi cô đang xếp hàng lên xe buýt. Cô ${name1} lại đứng thứ ${fromBack} từ cuối hàng lên. Hỏi có tất cả bao nhiêu người cùng xếp hàng?`,
      titleEn: `There are ${before} people in front of Ms. ${name1} in a queue. She is ${fromBack}th from the back. How many people in the queue?`,
      options: shuffle([correct, `${total - 1} người`, `${total + 1} người`, `${total + 2} người`]),
      correctAnswer: correct,
      hint: `Cô ${name1} đứng thứ ${fromBack} từ cuối lên tức là sau cô có ${after} người. Tổng = ${before} + 1 + ${after}.`,
      explanation: `Đứng trước cô ${name1} có ${before} người. Cô ${name1} đứng thứ ${fromBack} từ dưới lên nên phía sau cô có ${after} người. Tổng số người trong hàng là: ${before} + 1 + ${after} = ${total} người.`
    };
  }

  // Bậc thang lầu nhà
  const floors = randInt(2, 4);
  const stepsPerFloor = pickRandom([10, 12, 14, 15]);
  const totalSteps = floors * stepsPerFloor;
  const correct = `${totalSteps} bậc`;

  return {
    id,
    questionNumber: qNum,
    type: 'lineup-logic',
    categoryTitle: 'Xếp Hàng & Bậc Thang',
    title: `Nhà bạn ${name1} có ${floors} tầng lầu. Cầu thang dẫn lên mỗi tầng có đúng ${stepsPerFloor} bậc thang. Hỏi để đi từ tầng trệt lên lầu ${floors}, bạn ${name1} phải bước qua tất cả bao nhiêu bậc thang?`,
    titleEn: `${name1}'s house has ${floors} upper floors. Each floor has ${stepsPerFloor} steps. How many steps to floor ${floors}?`,
    options: shuffle([correct, `${totalSteps - stepsPerFloor} bậc`, `${totalSteps + stepsPerFloor} bậc`, `${totalSteps + 5} bậc`]),
    correctAnswer: correct,
    hint: `Có ${floors} nhịp cầu thang, mỗi nhịp có ${stepsPerFloor} bậc thang!`,
    explanation: `Để lên lầu ${floors}, bạn ${name1} phải bước qua ${floors} nhịp cầu thang: ${Array(floors).fill(stepsPerFloor).join(' + ')} = ${totalSteps} bậc thang.`
  };
}

// 3. Máy tạo câu hỏi Trồng cây & Khoảng cách
function makeTreeIntervalQuestion(id: string, qNum: number): ChoiceQuestion {
  const tree = pickRandom(TREE_ITEMS);
  const subType = randInt(1, 3);

  if (subType === 1) {
    // Đếm số khoảng cách
    const count = randInt(4, 9);
    const intervals = count - 1;
    const correct = `${intervals} khoảng cách`;

    return {
      id,
      questionNumber: qNum,
      type: 'tree-interval',
      categoryTitle: 'Bài Toán Trồng Cây',
      title: `Trên một đoạn đường thẳng có ${count} ${tree.unit} ${tree.item} được trồng cách đều nhau. Hỏi có bao nhiêu khoảng cách giữa ${count} ${tree.unit} đó?`,
      titleEn: `Along a straight row, ${count} ${tree.item} are placed evenly. How many intervals are between them?`,
      visualContent: {
        type: 'tree',
        data: { count, icon: tree.icon }
      },
      options: shuffle([correct, `${count} khoảng cách`, `${intervals - 1} khoảng cách`, `${count + 1} khoảng cách`]),
      correctAnswer: correct,
      hint: 'Quy luật khoảng cách: Số khoảng cách = Số vật - 1.',
      explanation: `Giữa ${count} ${tree.unit} ${tree.item} trồng liên tiếp có: ${count} - 1 = ${intervals} khoảng cách.`
    };
  }

  if (subType === 2) {
    // Tính tổng chiều dài
    const count = randInt(4, 7);
    const gap = randInt(2, 5);
    const totalDist = (count - 1) * gap;
    const correct = `${totalDist} mét`;

    return {
      id,
      questionNumber: qNum,
      type: 'tree-interval',
      categoryTitle: 'Bài Toán Trồng Cây',
      title: `Bác làm vườn trồng ${count} ${tree.unit} ${tree.item} thành một hàng thẳng. Mỗi ${tree.unit} cách nhau ${gap} mét (m). Hỏi khoảng cách từ ${tree.unit} đầu tiên đến ${tree.unit} cuối cùng là bao nhiêu mét?`,
      titleEn: `A gardener plants ${count} ${tree.item} in a row, ${gap}m apart each. What is the distance from the 1st to the last?`,
      options: shuffle([correct, `${count * gap} mét`, `${totalDist - gap} mét`, `${totalDist + gap * 2} mét`]),
      correctAnswer: correct,
      hint: `Tìm số khoảng cách trước: ${count} ${tree.unit} có ${count - 1} khoảng cách. Mỗi khoảng cách dài ${gap}m!`,
      explanation: `Giữa ${count} ${tree.unit} có ${count - 1} khoảng cách. Khoảng cách từ ${tree.unit} đầu tiên đến ${tree.unit} cuối cùng là: ${count - 1} × ${gap}m = ${totalDist} mét.`
    };
  }

  // Biết tổng khoảng cách, tìm độ dài mỗi khoảng
  const intervals = randInt(4, 8);
  const count = intervals + 1;
  const gap = randInt(1, 4);
  const totalDist = intervals * gap;
  const correct = `${gap} mét`;

  return {
    id,
    questionNumber: qNum,
    type: 'tree-interval',
    categoryTitle: 'Bài Toán Trồng Cây',
    title: `Trên một luống đất, người ta trồng ${count} ${tree.unit} ${tree.item} cách đều nhau. Khoảng cách từ ${tree.unit} thứ nhất đến ${tree.unit} thứ ${count} đo được là ${totalDist}m. Hỏi khoảng cách giữa hai ${tree.unit} liên tiếp là bao nhiêu mét?`,
    titleEn: `${count} plants are spaced evenly along a ${totalDist}m row. How long is each interval?`,
    options: shuffle([correct, `${gap + 1} mét`, `${gap + 2} mét`, `${gap > 1 ? gap - 1 : gap + 3} mét`]),
    correctAnswer: correct,
    hint: `Từ ${tree.unit} thứ nhất đến thứ ${count} có đúng ${intervals} khoảng cách. Lấy tổng độ dài chia cho số khoảng cách!`,
    explanation: `Giữa ${count} ${tree.unit} có: ${count} - 1 = ${intervals} khoảng cách. Khoảng cách giữa hai ${tree.unit} liên tiếp là: ${totalDist}m : ${intervals} = ${gap} mét.`
  };
}

// 4. Máy tạo câu hỏi Biểu đồ Venn & Phân loại
function makeVennQuestion(id: string, qNum: number): ChoiceQuestion {
  const name1 = pickRandom(VIETNAMESE_NAMES);
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Con vật lưỡng cư (sống dưới nước và trên cạn)
    const water = randInt(4, 7);
    const land = randInt(4, 7);
    const overlap = randInt(2, 4);
    const total = water + land - overlap;
    const correct = `${overlap} con vật`;

    return {
      id,
      questionNumber: qNum,
      type: 'venn-diagram',
      categoryTitle: 'Biểu Đồ Venn',
      title: `Trong tiết Khoa học, bạn ${name1} đếm được tất cả ${total} con vật. Trong đó có ${water} con có thể sống dưới nước và ${land} con có thể sống trên cạn. Hỏi có bao nhiêu con vật vừa sống dưới nước vừa sống trên cạn (lưỡng cư)?`,
      titleEn: `${name1} counted ${total} animals: ${water} can live in water and ${land} can live on land. How many live in both?`,
      visualContent: {
        type: 'venn',
        data: {
          circleA: `Dưới nước (${water})`,
          circleB: `Trên cạn (${land})`,
          total: `${total} con`
        }
      },
      options: shuffle([correct, `${overlap - 1} con vật`, `${overlap + 1} con vật`, `${overlap + 2} con vật`]),
      correctAnswer: correct,
      hint: `Cộng số lượt: ${water} + ${land} = ${water + land} lượt. Trừ đi tổng số con vật thực tế: ${water + land} - ${total} = ?`,
      explanation: `Tổng số lượt tính con vật là: ${water} + ${land} = ${water + land}. Vì thực tế chỉ có ${total} con vật, nên số con vật thuộc phần giao nhau (vừa sống dưới nước vừa sống trên cạn) là: ${water + land} - ${total} = ${overlap} con vật.`
    };
  }

  // Số chẵn và số lớn hơn ngưỡng K
  const threshold = pickRandom([20, 30, 40]);
  const correct = '3 số';

  return {
    id,
    questionNumber: qNum,
    type: 'venn-diagram',
    categoryTitle: 'Biểu Đồ Venn',
    title: `Quan sát sơ đồ Venn: Vòng bên trái chứa "Số chẵn", vòng bên phải chứa "Số lớn hơn ${threshold}". Các số nằm trong phần giao nhau là: ${threshold + 2}, ${threshold + 8}, ${threshold + 14}, ${threshold}. Hỏi có bao nhiêu số vừa là số chẵn vừa LỚN HƠN ${threshold}?`,
    titleEn: `In a Venn diagram of "Even" and "> ${threshold}", intersection has: ${threshold + 2}, ${threshold + 8}, ${threshold + 14}, ${threshold}. How many are strictly > ${threshold}?`,
    options: shuffle([correct, '4 số', '2 số', '5 số']),
    correctAnswer: correct,
    hint: `Chú ý: Số ${threshold} bằng ${threshold}, không lớn hơn ${threshold}!`,
    explanation: `Số ${threshold} bằng ${threshold} nên không lớn hơn ${threshold}. Các số chẵn vừa lớn hơn ${threshold} là: ${threshold + 2}, ${threshold + 8}, ${threshold + 14} (có đúng 3 số).`
  };
}

// 5. Máy tạo câu hỏi Đồng hồ & Lịch tuần
function makeCalendarClockQuestion(id: string, qNum: number): ChoiceQuestion {
  const subType = randInt(1, 4);

  if (subType === 1) {
    // "Ngày hôm sau của ngày mai là thứ X"
    const targetIdx = randInt(0, 6);
    const targetDay = DAYS_OF_WEEK[targetIdx];
    // Hôm nay = targetDay lùi 2 ngày
    const todayIdx = (targetIdx - 2 + 7) % 7;
    const correct = DAYS_OF_WEEK[todayIdx];

    return {
      id,
      questionNumber: qNum,
      type: 'calendar-clock',
      categoryTitle: 'Đồng Hồ & Lịch Tuần',
      title: `Câu đố thời gian: "Ngày hôm sau của ngày mai là ${targetDay}." Hỏi hôm nay đang là thứ mấy trong tuần?`,
      titleEn: `Riddle: "The day after tomorrow is ${targetDay}." What day is today?`,
      options: shuffle([
        correct,
        DAYS_OF_WEEK[(todayIdx + 1) % 7],
        DAYS_OF_WEEK[(todayIdx - 1 + 7) % 7],
        DAYS_OF_WEEK[(todayIdx + 2) % 7]
      ]),
      correctAnswer: correct,
      hint: `Đi lùi từng ngày: Ngày hôm sau của ngày mai là ${targetDay} => Ngày mai là ${DAYS_OF_WEEK[(targetIdx - 1 + 7) % 7]} => Hôm nay là thứ mấy?`,
      explanation: `Ngày hôm sau của ngày mai là ${targetDay} => Ngày mai là ${DAYS_OF_WEEK[(targetIdx - 1 + 7) % 7]} => Hôm nay là ${correct}.`
    };
  }

  if (subType === 2) {
    // "Hôm kia là thứ X -> ngày mốt là thứ mấy?"
    const pastIdx = randInt(0, 6);
    const pastDay = DAYS_OF_WEEK[pastIdx];
    // Hôm nay = past + 2; ngày mốt = hôm nay + 2 = past + 4
    const futureIdx = (pastIdx + 4) % 7;
    const correct = DAYS_OF_WEEK[futureIdx];

    return {
      id,
      questionNumber: qNum,
      type: 'calendar-clock',
      categoryTitle: 'Đồng Hồ & Lịch Tuần',
      title: `Biết rằng "Hôm kia là ${pastDay}". Hỏi "Ngày mốt" (ngày kia) sẽ là thứ mấy trong tuần?`,
      titleEn: `If "the day before yesterday was ${pastDay}", what day will "the day after tomorrow" be?`,
      options: shuffle([
        correct,
        DAYS_OF_WEEK[(futureIdx + 1) % 7],
        DAYS_OF_WEEK[(futureIdx - 1 + 7) % 7],
        DAYS_OF_WEEK[(futureIdx + 2) % 7]
      ]),
      correctAnswer: correct,
      hint: `Hôm kia là ${pastDay} => Hôm qua là ${DAYS_OF_WEEK[(pastIdx + 1) % 7]} => Hôm nay là ${DAYS_OF_WEEK[(pastIdx + 2) % 7]} => Ngày mai là ${DAYS_OF_WEEK[(pastIdx + 3) % 7]} => Ngày mốt là gì?`,
      explanation: `Hôm kia là ${pastDay} => Hôm nay là ${DAYS_OF_WEEK[(pastIdx + 2) % 7]}. Ngày mốt cách hôm nay 2 ngày nên là ${correct}.`
    };
  }

  if (subType === 3) {
    // Đọc đồng hồ kim
    const hour = randInt(7, 11);
    const isHalf = Math.random() > 0.5;

    if (isHalf) {
      const correct = `Kim giờ chỉ giữa số ${hour} và ${hour + 1}, kim phút chỉ số 6`;
      return {
        id,
        questionNumber: qNum,
        type: 'calendar-clock',
        categoryTitle: 'Đồng Hồ & Lịch Tuần',
        title: `Lúc ${hour} giờ rưỡi (${hour} giờ 30 phút), vị trí của kim giờ và kim phút trên mặt đồng hồ như thế nào?`,
        titleEn: `At half past ${hour} (${hour}:30), where do the clock hands point?`,
        options: shuffle([
          correct,
          `Kim giờ chỉ số 6, kim phút chỉ số ${hour}`,
          `Kim giờ chỉ số ${hour}, kim phút chỉ số 5`,
          `Cả hai kim cùng chỉ số ${hour}`
        ]),
        correctAnswer: correct,
        hint: 'Kim phút chỉ số 6 tương ứng với 30 phút; kim giờ nhích về giữa 2 con số!',
        explanation: `Lúc ${hour} giờ rưỡi, kim phút chỉ số 6 (30 phút) và kim giờ di chuyển đến điểm chính giữa số ${hour} và số ${hour + 1}.`
      };
    } else {
      const correct = `${hour} giờ`;
      return {
        id,
        questionNumber: qNum,
        type: 'calendar-clock',
        categoryTitle: 'Đồng Hồ & Lịch Tuần',
        title: `Khi kim ngắn (kim giờ) chỉ vào số ${hour} và kim dài (kim phút) chỉ vào số 12, thì đồng hồ đó đang chỉ mấy giờ?`,
        titleEn: `When hour hand is at ${hour} and minute hand is at 12, what time is it?`,
        options: shuffle([correct, '12 giờ', `${hour} giờ 12 phút`, `${hour - 1} giờ`]),
        correctAnswer: correct,
        hint: 'Kim phút chỉ số 12 là đúng giờ chẵn!',
        explanation: `Kim ngắn chỉ số ${hour} và kim dài chỉ số 12 có nghĩa là đồng hồ đang chỉ đúng ${hour} giờ.`
      };
    }
  }

  // Hôm nay thứ Ba ngày D, hôm qua là thứ mấy ngày mấy
  const date = randInt(10, 25);
  const dayName = 'Thứ Ba';
  const prevDay = 'Thứ Hai';
  const prevDate = date - 1;
  const correct = `${prevDay}, ngày ${prevDate}`;

  return {
    id,
    questionNumber: qNum,
    type: 'calendar-clock',
    categoryTitle: 'Đồng Hồ & Lịch Tuần',
    title: `Nếu hôm nay là ${dayName}, ngày ${date} thì hôm qua là thứ mấy, ngày bao nhiêu?`,
    titleEn: `If today is Tuesday, the ${date}th, what day and date was yesterday?`,
    options: shuffle([correct, `Thứ Tư, ngày ${date + 1}`, `${prevDay}, ngày ${date + 1}`, `Thứ Tư, ngày ${prevDate}`]),
    correctAnswer: correct,
    hint: 'Hôm qua là ngày liền trước: thứ lùi 1 ngày và ngày trong tháng lùi 1 đơn vị!',
    explanation: `Hôm qua là ngày liền trước: ${dayName} lùi 1 ngày là ${prevDay}, ngày ${date} lùi 1 ngày là ngày ${prevDate} => ${correct}.`
  };
}

// 6. Máy tạo câu hỏi Quy luật dãy số & Dãy hình
function makePatternQuestion(id: string, qNum: number): ChoiceQuestion {
  const subType = randInt(1, 2);

  if (subType === 1) {
    // Dãy số cách đều
    const start = randInt(2, 6);
    const step = pickRandom([3, 4, 5]);
    const s1 = start;
    const s2 = s1 + step;
    const s3 = s2 + step;
    const missing1 = s3 + step;
    const missing2 = missing1 + step;
    const s6 = missing2 + step;
    const correct = `${missing1} và ${missing2}`;

    return {
      id,
      questionNumber: qNum,
      type: 'pattern-matrix',
      categoryTitle: 'Quy Luật Dãy Số & Hình',
      title: `Tìm hai số còn thiếu trong dãy số sau: ${s1}; ${s2}; ${s3}; ... ; ... ; ${s6}`,
      titleEn: `Find the two missing numbers in the sequence: ${s1}; ${s2}; ${s3}; ... ; ... ; ${s6}`,
      options: shuffle([
        correct,
        `${missing1 - 1} và ${missing2 - 1}`,
        `${missing1 + 1} và ${missing2 + 1}`,
        `${missing1} và ${missing2 + 2}`
      ]),
      correctAnswer: correct,
      hint: `So sánh các số liền nhau: ${s2} - ${s1} = ${step}. Đây là dãy số cộng thêm ${step}!`,
      explanation: `Quy luật của dãy số là số sau bằng số trước cộng thêm ${step}: ${s3} + ${step} = ${missing1}; ${missing1} + ${step} = ${missing2}.`
    };
  }

  // Dãy hình xen kẽ tăng dần
  const icons = [
    { a: '⭐', b: '🔵' },
    { a: '🌸', b: '🍃' },
    { a: '🔶', b: '🔷' },
  ];
  const pair = pickRandom(icons);
  const correct = `4 hình ${pair.b}`;

  return {
    id,
    questionNumber: qNum,
    type: 'pattern-matrix',
    categoryTitle: 'Quy Luật Dãy Số & Hình',
    title: `Quan sát quy luật dãy hình: ${pair.a} ${pair.b} ${pair.a} ${pair.b} ${pair.b} ${pair.a} ${pair.b} ${pair.b} ${pair.b} ${pair.a} ... Hỏi sau hình ${pair.a} tiếp theo sẽ có bao nhiêu hình ${pair.b}?`,
    titleEn: `Pattern: ${pair.a} ${pair.b} ${pair.a} ${pair.b} ${pair.b} ${pair.a}... How many ${pair.b} follow the next ${pair.a}?`,
    options: shuffle([correct, `3 hình ${pair.b}`, `5 hình ${pair.b}`, `2 hình ${pair.b}`]),
    correctAnswer: correct,
    hint: `Số lượng hình ${pair.b} ở mỗi khoảng tăng dần: 1 hình, 2 hình, 3 hình...`,
    explanation: `Số hình ${pair.b} xen kẽ tăng dần theo dãy: 1, 2, 3, 4... Vậy sau hình ${pair.a} tiếp theo sẽ có đúng 4 hình ${pair.b}.`
  };
}

// 7. Máy tạo câu hỏi Tháp số kim tự tháp
function makeNumberPyramidQuestion(id: string, qNum: number): NumberPyramidQuestion {
  const a = randInt(2, 5);
  const b = randInt(2, 5);
  const c = randInt(1, 4);
  const d = randInt(2, 6);

  const e = a + b;
  const f = b + c;
  const g = c + d;

  const h = e + f;
  const i = f + g;

  const top = h + i;

  return {
    id,
    questionNumber: qNum,
    type: 'number-pyramid',
    categoryTitle: 'Tháp Số Kim Tự Tháp',
    title: 'Mỗi viên gạch bằng tổng của hai viên gạch ngay dưới nó. Hãy tính nhẩm và điền số còn thiếu vào đỉnh kim tự tháp:',
    titleEn: 'Each brick is the sum of the two bricks below it. Find the missing numbers:',
    pyramidRows: [
      [null],
      [null, i],
      [e, null, g],
      [a, b, c, d]
    ],
    solutionRows: [
      [top],
      [h, i],
      [e, f, g],
      [a, b, c, d]
    ],
    hint: `Tính tầng 2: ô giữa = ${b} + ${c} = ${f}. Tầng 3: ô trái = ${e} + ${f} = ${h}. Đỉnh tháp = ${h} + ${i} = ?`,
    explanation: `Tính từ hàng dưới lên: ô giữa hàng 2 là ${b} + ${c} = ${f}. Ô trái hàng 3 là ${e} + ${f} = ${h}. Đỉnh tháp là ${h} + ${i} = ${top}.`
  };
}

// 8. Máy tạo câu hỏi Đếm hình & Khối 3D
function makeShapeCountingQuestion(id: string, qNum: number): ChoiceQuestion {
  const subType = randInt(1, 2);

  if (subType === 1) {
    const correct = '14 khối lập phương';
    return {
      id,
      questionNumber: qNum,
      type: 'shape-counting',
      categoryTitle: 'Đếm Hình & Khối 3D',
      title: 'Một mô hình gồm các khối lập phương được xếp chồng lên nhau thành các tầng: Tầng 1 (đáy) có 3x3 = 9 khối; Tầng 2 có 2x2 = 4 khối; Tầng 3 (trên cùng) có 1 khối. Hỏi có tất cả bao nhiêu khối lập phương?',
      titleEn: 'A model is stacked in layers: Floor 1 (base) has 3x3=9; Floor 2 has 2x2=4; Floor 3 has 1 cube. Total cubes?',
      options: shuffle([correct, '12 khối lập phương', '15 khối lập phương', '10 khối lập phương']),
      correctAnswer: correct,
      hint: 'Cộng số khối của từng tầng: 9 + 4 + 1 = ?',
      explanation: 'Tổng số khối lập phương trong mô hình = 9 (tầng 1) + 4 (tầng 2) + 1 (tầng 3) = 14 khối lập phương.'
    };
  }

  const correct = '6 hình tam giác';
  return {
    id,
    questionNumber: qNum,
    type: 'shape-counting',
    categoryTitle: 'Đếm Hình & Khối 3D',
    title: 'Một hình tam giác lớn có 1 đường kẻ ngang chia đôi chiều cao và 1 đường kẻ dọc từ đỉnh xuống đáy. Hỏi có tất cả bao nhiêu hình tam giác trong hình?',
    titleEn: 'A large triangle is divided by a horizontal line and a vertical line from the apex. How many triangles in total?',
    options: shuffle([correct, '4 hình tam giác', '5 hình tam giác', '8 hình tam giác']),
    correctAnswer: correct,
    hint: 'Tầng trên có 3 tam giác (2 tam giác đơn + 1 ghép). Toàn bộ hình lớn cũng có 3 tam giác!',
    explanation: 'Tầng trên gồm: 2 tam giác nhỏ + 1 tam giác ghép = 3 hình. Cả tam giác lớn gồm: 2 nửa tam giác lớn + 1 tam giác to nhất = 3 hình. Tổng cộng có: 3 + 3 = 6 hình tam giác.'
  };
}

// 9. Máy tạo câu hỏi Vật che chữ số
function makeSymbolSubstituteQuestion(id: string, qNum: number): ChoiceQuestion {
  const fruits = [
    { emoji: '🍎', name: 'Quả táo' },
    { emoji: '🍊', name: 'Quả cam' },
    { emoji: '🍓', name: 'Quả dâu tây' },
    { emoji: '🥑', name: 'Quả bơ' },
  ];
  const f = pickRandom(fruits);
  const secretNum = randInt(2, 6);
  const base = randInt(5, 12);
  const sum = base + secretNum;
  const diff = base + secretNum + secretNum;

  const correct = String(secretNum);

  return {
    id,
    questionNumber: qNum,
    type: 'symbol-substitute',
    categoryTitle: 'Vật Che Chữ Số',
    title: `${f.name} ${f.emoji} đã che đi một chữ số bí mật trong phép tính: (${base} + ${f.emoji} = ${sum}). Hỏi ${f.name} ${f.emoji} che chữ số nào?`,
    titleEn: `${f.name} ${f.emoji} covers a secret digit in (${base} + ${f.emoji} = ${sum}). Find the secret digit:`,
    visualContent: {
      type: 'substitute',
      data: {
        line1: `${base} + ${f.emoji} = ${sum}`,
        line2: `${sum} - ${f.emoji} = ${base}`,
        target: `Tìm chữ số ${f.emoji} = ?`
      }
    },
    options: shuffle([correct, String(secretNum + 1), String(secretNum > 1 ? secretNum - 1 : secretNum + 2), String(secretNum + 3)]),
    correctAnswer: correct,
    hint: `${base} cộng mấy thì bằng ${sum}? Lấy ${sum} - ${base} = ?`,
    explanation: `Vì ${base} + ${secretNum} = ${sum}, nên chữ số bí mật được ${f.name} ${f.emoji} che là ${secretNum}.`
  };
}

// 10. Máy tạo câu hỏi Toán thám tử (Bảng logic grid)
function makeLogicGridQuestion(id: string, qNum: number): LogicGridQuestion {
  const names = ['Huy', 'Bình', 'Phúc'];
  const jobs = ['Giáo viên', 'Nha sĩ', 'Đầu bếp'];

  return {
    id,
    questionNumber: qNum,
    type: 'logic-grid',
    categoryTitle: 'Toán Thám Tử (Bảng)',
    title: 'Các chú Huy, Bình và Phúc làm những nghề khác nhau (Giáo viên, Nha sĩ, Đầu bếp). Hãy suy luận và tích ✓ vào bảng để tìm nghề của mỗi chú:',
    titleEn: 'Huy, Binh, and Phuc have different jobs: Teacher, Dentist, and Chef. Mark ✓ in the grid:',
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
    rows: names,
    cols: jobs,
    solution: {
      Huy: 'Đầu bếp',
      Bình: 'Giáo viên',
      Phúc: 'Nha sĩ'
    },
    hint: 'Bắt đầu từ chú Phúc: không làm giáo viên, không làm đầu bếp => Phúc là ai?',
    explanation: 'Từ manh mối 2, chú Phúc là Nha sĩ. Từ manh mối 1, chú Huy là Đầu bếp. Chú Bình là Giáo viên.',
    explanationSteps: [
      'Bước 1: Chú Phúc không làm giáo viên (✗), không làm đầu bếp (✗) => Chú Phúc là Nha sĩ (✓).',
      'Bước 2: Cột Đầu bếp: Bình không làm, Phúc không làm => Chú Huy là Đầu bếp (✓).',
      'Bước 3: Chú Bình còn lại là Giáo viên (✓).'
    ]
  };
}

// 11. Máy tạo câu hỏi Phá khóa mật mã
function makeCodeBreakerQuestion(id: string, qNum: number): CodeBreakerQuestion {
  return {
    id,
    questionNumber: qNum,
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
  };
}

/**
 * Tạo một phiên học ngẫu nhiên với count câu hỏi đa dạng (mặc định 10 câu)
 */
export function generateRandomSession(count = 10, category = 'all'): AdvancedQuestion[] {
  const sessionSeed = Date.now().toString(36);
  const generators = [
    makeMatchstickQuestion,
    makeLineupQuestion,
    makeTreeIntervalQuestion,
    makeVennQuestion,
    makeCalendarClockQuestion,
    makePatternQuestion,
    makeNumberPyramidQuestion,
    makeShapeCountingQuestion,
    makeSymbolSubstituteQuestion,
    makeLogicGridQuestion,
    makeCodeBreakerQuestion,
  ];

  let selectedGens = generators;
  if (category !== 'all') {
    if (category === 'matchstick') selectedGens = [makeMatchstickQuestion];
    else if (category === 'lineup-logic') selectedGens = [makeLineupQuestion];
    else if (category === 'tree-interval') selectedGens = [makeTreeIntervalQuestion];
    else if (category === 'venn-diagram') selectedGens = [makeVennQuestion];
    else if (category === 'calendar-clock') selectedGens = [makeCalendarClockQuestion];
    else if (category === 'pattern-matrix') selectedGens = [makePatternQuestion];
    else if (category === 'number-pyramid') selectedGens = [makeNumberPyramidQuestion];
    else if (category === 'shape-counting') selectedGens = [makeShapeCountingQuestion];
    else if (category === 'symbol-substitute') selectedGens = [makeSymbolSubstituteQuestion];
    else if (category === 'logic-grid') selectedGens = [makeLogicGridQuestion];
    else if (category === 'code-breaker') selectedGens = [makeCodeBreakerQuestion];
  }

  const questions: AdvancedQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const gen = selectedGens[i % selectedGens.length] || pickRandom(selectedGens);
    const q = gen(`gen-${sessionSeed}-${i + 1}`, i + 1);
    questions.push(q);
  }

  return questions;
}
