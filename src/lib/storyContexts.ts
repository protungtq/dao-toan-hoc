export type StoryContext = { story: string; unit: string; clue: string; icon: string };

const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

export function additionStory(first: number, change: number, fallbackName = 'đồ vật', fallbackIcon = '🧩'): StoryContext {
  const total = first + change;
  return pick([
    { story: `Mai có ${first} ${fallbackName}, được tặng thêm ${change} ${fallbackName}. Mai có tất cả bao nhiêu ${fallbackName}?`, unit: fallbackName, clue: 'được tặng thêm và tất cả', icon: fallbackIcon },
    { story: `Cửa hàng đã xếp ${first} hộp sữa lên kệ, sau đó xếp thêm ${change} hộp. Trên kệ có tất cả bao nhiêu hộp sữa?`, unit: 'hộp sữa', clue: 'xếp thêm và tất cả', icon: '🥛' },
    { story: `Trong trò chơi, bé nhận ${first} ngôi sao ở màn đầu và ${change} ngôi sao ở màn sau. Bé nhận được tất cả bao nhiêu ngôi sao?`, unit: 'ngôi sao', clue: 'hai màn và tất cả', icon: '⭐' },
    { story: `Buổi sáng lớp đọc sách ${first} phút, buổi chiều đọc thêm ${change} phút. Cả ngày lớp đọc sách bao nhiêu phút?`, unit: 'phút', clue: 'buổi sáng, buổi chiều và cả ngày', icon: '📚' },
    { story: `Một bàn học dài ${first} xăng-ti-mét, ghép thêm một tấm dài ${change} xăng-ti-mét. Tổng chiều dài là bao nhiêu xăng-ti-mét?`, unit: 'xăng-ti-mét', clue: 'ghép thêm và tổng chiều dài', icon: '📏' },
    { story: `Bé mua món đồ giá ${first} nghìn đồng và một món giá ${change} nghìn đồng. Bé trả tất cả bao nhiêu nghìn đồng?`, unit: 'nghìn đồng', clue: 'mua hai món và tất cả', icon: '🛍️' },
  ].filter((item) => total >= 0));
}

export function subtractionStory(first: number, change: number, fallbackName = 'đồ vật', fallbackIcon = '🧩'): StoryContext {
  return pick([
    { story: `Có ${first} ${fallbackName}, đã dùng ${change} ${fallbackName}. Còn lại bao nhiêu ${fallbackName}?`, unit: fallbackName, clue: 'đã dùng và còn lại', icon: fallbackIcon },
    { story: `Cửa hàng có ${first} hộp bánh, đã bán ${change} hộp. Cửa hàng còn bao nhiêu hộp bánh?`, unit: 'hộp bánh', clue: 'đã bán và còn', icon: '🧁' },
    { story: `Bé có ${first} điểm năng lượng trong trò chơi và đã dùng ${change} điểm. Bé còn bao nhiêu điểm năng lượng?`, unit: 'điểm năng lượng', clue: 'đã dùng và còn', icon: '🎮' },
    { story: `Tiết học có ${first} phút, cô dành ${change} phút để khởi động. Thời gian học chính còn bao nhiêu phút?`, unit: 'phút', clue: 'dành ra và còn', icon: '🕐' },
    { story: `Một dải giấy dài ${first} xăng-ti-mét, cắt đi ${change} xăng-ti-mét. Dải giấy còn dài bao nhiêu xăng-ti-mét?`, unit: 'xăng-ti-mét', clue: 'cắt đi và còn', icon: '📐' },
    { story: `Bé có ${first} nghìn đồng và mua bút hết ${change} nghìn đồng. Bé còn bao nhiêu nghìn đồng?`, unit: 'nghìn đồng', clue: 'mua hết và còn', icon: '💵' },
  ]);
}
