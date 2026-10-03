# Gói minigame Trạng Toán

Gói này đưa 5 minigame mới vào một registry chung:

- Astro Flap — Phi thuyền vượt chướng ngại
- Squirrel Maze — Sóc tìm đường
- Reflex Math — Phản xạ toán học
- Snake — Rắn săn mồi
- Memory — Lật thẻ ghi nhớ

## Cấu trúc đề xuất

Đặt vào:

`src/components/minigames/`

Kết quả:

```text
src/components/minigames/
├─ MiniGameHost.tsx
├─ MiniGameShelf.tsx
├─ minigames.ts
└─ games/
   ├─ AstroFlapGame.tsx
   ├─ SquirrelMazeGame.tsx
   ├─ ReflexMathGame.tsx
   ├─ SnakeGame.tsx
   └─ MemoryGame.tsx
```

Các game hiện tại giữ nguyên import:

`../../utils/audio`

nên vị trí `games/` bên trong `src/components/minigames/` là cố ý.

## Tích hợp vào kho hiện tại

Nếu kho hiện tại đã có hệ thống vé, chỉ cần truyền callback:

```tsx
<MiniGameShelf
  tickets={tickets}
  highScores={highScores}
  onConsumeTicket={(game) => consumeTicket(game.id)}
  onGameOver={(game, score, extra) => {
    saveHighScore(game.id, score);
  }}
/>
```

`MiniGameHost` không tự ghi vé vào localStorage/database.

Mỗi lượt được giới hạn 180 giây. Hết thời gian, host gọi:

```ts
onGameOver(0, { reason: 'timeout' })
```

Nếu người chơi bấm quay lại:

```ts
onGameOver(0, { reason: 'exit' })
```

## Lưu ý

Gói này không thay thế registry/vé hiện tại của Trạng Toán. Nó là lớp registry + host độc lập để có thể ghép vào kho đang có mà không tự ý thay đổi cơ chế vé.
