import React, { useMemo, useState } from 'react';
import { Play, Search, Sparkles } from 'lucide-react';

import MiniGameHost from './MiniGameHost';
import { NEW_MINIGAMES, type MiniGameDefinition, type MiniGameExtra } from './minigames';

interface MiniGameShelfProps {
  tickets?: number;
  highScores?: Record<string, number>;
  /**
   * Parent gọi callback này để trừ vé theo hệ thống hiện tại.
   * Component không tự ghi localStorage/database để tránh xung đột với kho vé hiện có.
   */
  onConsumeTicket?: (game: MiniGameDefinition) => void;
  onGameOver?: (
    game: MiniGameDefinition,
    score: number,
    extra?: MiniGameExtra
  ) => void;
}

export const MiniGameShelf: React.FC<MiniGameShelfProps> = ({
  tickets,
  highScores = {},
  onConsumeTicket,
  onGameOver,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const games = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return NEW_MINIGAMES.filter((game) => game.enabled);

    return NEW_MINIGAMES.filter(
      (game) =>
        game.enabled &&
        `${game.name} ${game.shortName} ${game.description} ${game.category}`
          .toLowerCase()
          .includes(keyword)
    );
  }, [query]);

  const selectedGame = selectedId
    ? NEW_MINIGAMES.find((game) => game.id === selectedId) ?? null
    : null;

  if (selectedGame) {
    return (
      <MiniGameHost
        game={selectedGame}
        highScore={highScores[selectedGame.id] ?? 0}
        onConsumeTicket={() => onConsumeTicket?.(selectedGame)}
        onGameOver={(score, extra) => onGameOver?.(selectedGame, score, extra)}
        onExit={() => setSelectedId(null)}
      />
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-violet-50 via-white to-amber-50 p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-violet-600 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Kho minigame Trạng Toán
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Chơi một chút, học thêm một chút 🎮
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Các trò chơi ngắn giúp trẻ luyện phản xạ, ghi nhớ, tư duy và khả năng điều khiển.
              Mỗi lượt chơi tối đa 3 phút.
            </p>
          </div>

          {typeof tickets === 'number' && (
            <div className="shrink-0 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
              <div className="text-xs font-bold text-slate-400">Vé chơi</div>
              <div className="mt-0.5 text-2xl font-black text-amber-500">🎟️ {tickets}</div>
            </div>
          )}
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm trò chơi..."
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </div>

      {games.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Không tìm thấy trò chơi phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => {
            const score = highScores[game.id] ?? 0;

            return (
              <article
                key={game.id}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start gap-4 p-5">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-50 text-4xl shadow-inner">
                    {game.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black uppercase tracking-wide text-violet-500">
                      {game.category}
                    </div>
                    <h2 className="mt-1 text-lg font-black text-slate-900">{game.name}</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{game.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                  <div className="text-xs font-bold text-slate-400">
                    Kỷ lục: <span className="text-slate-700">{score}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedId(game.id)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-violet-500 active:scale-95"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Chơi
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default MiniGameShelf;
