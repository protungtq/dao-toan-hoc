import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Clock, Ticket } from 'lucide-react';

import type { MiniGameDefinition, MiniGameExtra } from './minigames';

interface MiniGameHostProps {
  game: MiniGameDefinition;
  highScore?: number;
  /** Gọi khi bắt đầu game. Dùng để trừ 1 vé trong kho hiện tại. */
  onConsumeTicket?: () => void;
  /** Gọi khi game kết thúc hoặc hết 3 phút. */
  onGameOver?: (score: number, extra?: MiniGameExtra) => void;
  /** Quay lại kho minigame. */
  onExit?: () => void;
}

/**
 * Host chuẩn cho các game trong kho Trạng Toán.
 *
 * - Mỗi lượt tối đa 180 giây.
 * - Không tự quản lý số vé; parent quyết định việc trừ vé.
 * - Chuẩn hóa highScore / onGameOver / onExit cho các game.
 */
export const MiniGameHost: React.FC<MiniGameHostProps> = ({
  game,
  highScore = 0,
  onConsumeTicket,
  onGameOver,
  onExit,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(game.durationSeconds);
  const finishedRef = useRef(false);

  useEffect(() => {
    finishedRef.current = false;
    setSecondsLeft(game.durationSeconds);

    // Vé chỉ bị trừ khi thực sự mở một lượt chơi.
    onConsumeTicket?.();

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);

          if (!finishedRef.current) {
            finishedRef.current = true;
            onGameOver?.(0, { reason: 'timeout' });
          }

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [game.id, game.durationSeconds, onConsumeTicket, onGameOver]);

  const handleGameOver = (score: number, extra?: MiniGameExtra) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onGameOver?.(score, extra);
  };

  const handleExit = () => {
    if (!finishedRef.current) {
      finishedRef.current = true;
      onGameOver?.(0, { reason: 'exit' });
    }
    onExit?.();
  };

  const GameComponent = game.component;

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50">
      <div className="sticky top-0 z-50 mx-auto flex w-full max-w-5xl items-center justify-between border-b border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur sm:px-4">
        <button
          type="button"
          onClick={handleExit}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Kho game</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden text-base sm:inline">{game.icon}</span>
          <span className="max-w-[150px] truncate text-sm font-black text-slate-800 sm:max-w-none">
            {game.shortName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-sm font-black text-amber-700">
          <Clock className="h-4 w-4" />
          {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
        </div>
      </div>

      <GameComponent
        highScore={highScore}
        onGameOver={handleGameOver}
        onExit={handleExit}
      />

      <div className="pointer-events-none fixed bottom-2 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-400 shadow sm:flex">
        <Ticket className="h-3.5 w-3.5" />
        Mỗi lượt tối đa 3 phút
      </div>
    </div>
  );
};

export default MiniGameHost;
