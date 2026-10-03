import type { ComponentType } from 'react';

import { AstroFlapGame } from './games/AstroFlapGame';
import { MemoryGame } from './games/MemoryGame';
import { ReflexMathGame } from './games/ReflexMathGame';
import { SnakeGame } from './games/SnakeGame';
import { SquirrelMazeGame } from './games/SquirrelMazeGame';

export type MiniGameExtra = {
  streak?: number;
  moves?: number;
  reason?: 'timeout' | 'exit' | 'finished';
};

export interface MiniGameProps {
  highScore: number;
  onGameOver: (score: number, extra?: MiniGameExtra) => void;
  onExit: () => void;
}

export interface MiniGameDefinition {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  category: 'phản xạ' | 'tư duy' | 'trí nhớ' | 'điều khiển';
  component: ComponentType<any>;
  durationSeconds: number;
  enabled: boolean;
}

/**
 * Các minigame mới đưa vào kho Trạng Toán.
 *
 * Không xử lý vé ở đây. Hệ thống kho/host bên ngoài quyết định
 * khi nào tiêu vé để tránh làm trùng logic vé hiện tại.
 */
export const NEW_MINIGAMES: MiniGameDefinition[] = [
  {
    id: 'astro-flap',
    name: 'Phi thuyền vượt chướng ngại',
    shortName: 'Astro Flap',
    description: 'Điều khiển phi thuyền bay qua các cột năng lượng và thu sao.',
    icon: '🚀',
    category: 'điều khiển',
    component: AstroFlapGame,
    durationSeconds: 180,
    enabled: true,
  },
  {
    id: 'squirrel-maze',
    name: 'Sóc tìm đường',
    shortName: 'Sóc tìm đường',
    description: 'Giúp Sóc vượt mê cung, nhặt hạt dẻ và tìm đường về đích.',
    icon: '🐿️',
    category: 'tư duy',
    component: SquirrelMazeGame,
    durationSeconds: 180,
    enabled: true,
  },
  {
    id: 'reflex-math',
    name: 'Phản xạ toán học',
    shortName: 'Phản xạ toán',
    description: 'Đọc phép tính thật nhanh và chọn Đúng hoặc Sai.',
    icon: '⚡',
    category: 'phản xạ',
    component: ReflexMathGame,
    durationSeconds: 180,
    enabled: true,
  },
  {
    id: 'snake',
    name: 'Rắn săn mồi',
    shortName: 'Rắn săn mồi',
    description: 'Điều khiển chú rắn ăn thức ăn, thu sao thưởng và tránh va chạm.',
    icon: '🐍',
    category: 'điều khiển',
    component: SnakeGame,
    durationSeconds: 180,
    enabled: true,
  },
  {
    id: 'memory',
    name: 'Lật thẻ ghi nhớ',
    shortName: 'Ghi nhớ',
    description: 'Tìm các cặp thẻ giống nhau bằng khả năng ghi nhớ.',
    icon: '🧠',
    category: 'trí nhớ',
    component: MemoryGame,
    durationSeconds: 180,
    enabled: true,
  },
];

export const MINIGAME_BY_ID = Object.fromEntries(
  NEW_MINIGAMES.map((game) => [game.id, game])
) as Record<string, MiniGameDefinition>;

export default NEW_MINIGAMES;
