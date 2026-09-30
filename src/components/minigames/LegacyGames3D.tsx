export function BearCatch3D({ lane, itemLane, itemRow, points, hit }: { lane: number; itemLane: number; itemRow: number; points: number; hit: boolean }) {
  return (
    <div className="catch2d-board catch2d-bear" role="img" aria-label="Gấu hứng mật ong">
      <div className="catch2d-lanes" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => <span key={i} />)}
      </div>

      <div
        className="catch2d-item catch2d-honey"
        style={{ left: `${(itemLane + 0.5) * 20}%`, top: `${8 + itemRow * 13}%` }}
        aria-label="Hũ mật"
      >
        🍯
      </div>

      <div
        key={points}
        className={`catch2d-player ${hit ? 'catch2d-player-hit' : ''}`}
        style={{ left: `${(lane + 0.5) * 20}%` }}
        aria-label="Gấu Mật"
      >
        <img src="/models/mascots/bear-poster.webp" alt="" draggable={false} />
      </div>
    </div>
  );
}

export function SquirrelMaze3D({ maze, position }: { maze: string[]; position: number[] }) {
  return (
    <div className="maze2d-board" role="img" aria-label="Mê cung Sóc tìm đường về nhà">
      {maze.flatMap((row, y) => [...row].map((tile, x) => {
        const player = position[0] === x && position[1] === y;
        return (
          <div
            key={`${x}-${y}`}
            className={`maze2d-cell ${tile === '#' ? 'maze2d-wall' : 'maze2d-path'} ${tile === 'H' ? 'maze2d-home-cell' : ''}`}
          >
            {tile === 'H' && <span className="maze2d-home" aria-label="Nhà">🏠</span>}
            {player && <img className="maze2d-squirrel" src="/models/mascots/squirrel-poster.webp" alt="Sóc Nâu" draggable={false} />}
          </div>
        );
      }))}
    </div>
  );
}
