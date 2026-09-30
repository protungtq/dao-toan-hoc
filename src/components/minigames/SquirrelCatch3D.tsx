type Props = {
  lane: number;
  itemLane: number;
  itemRow: number;
  points: number;
  hit: boolean;
};

export default function SquirrelCatch3D({ lane, itemLane, itemRow, points, hit }: Props) {
  return (
    <div className="catch2d-board catch2d-squirrel" role="img" aria-label="Sóc hứng hạt dẻ">
      <div className="catch2d-lanes" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => <span key={i} />)}
      </div>

      <div
        className="catch2d-item catch2d-acorn"
        style={{ left: `${(itemLane + 0.5) * 20}%`, top: `${8 + itemRow * 13}%` }}
        aria-label="Hạt dẻ"
      >
        🌰
      </div>

      <div
        key={points}
        className={`catch2d-player ${hit ? 'catch2d-player-hit' : ''}`}
        style={{ left: `${(lane + 0.5) * 20}%` }}
        aria-label="Sóc Nâu"
      >
        <img src="/models/mascots/squirrel-poster.webp" alt="" draggable={false} />
      </div>
    </div>
  );
}
