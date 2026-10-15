# Implementation Plan - Minigames Overhaul & Fullscreen Mode

## User Requests Addressed
1. Fix "Đàn Piano Số Học" (Math Piano) so it's fully playable with correct touch/click handlers and audio/visual feedback.
2. Overhaul "Bắn Bóng Ghép Số" (Bubble Shooter) into an authentic, rich bubble shooter game with proper mechanics.
3. Add a Fullscreen feature (`⛶`) to all minigames in the Arcade.
4. Polish and refine all minigames to ensure high quality, engaging UX, and zero broken states.

## Proposed Changes

### 1. Math Piano (`src/components/minigames/MathPianoGame.tsx`)
- Implement interactive touch/click piano keys corresponding to numbers/notes.
- Add falling number notes matching math equation targets.
- Play correct audio tones/chimes and show glowing score animations on correct key presses.

### 2. Bubble Shooter (`src/components/minigames/BallShooterGame.tsx`)
- Overhaul into an authentic Bubble Shooter game board where bubbles cluster, match numbers/colors, and pop in groups.
- Add smooth aiming and shooting mechanics with trajectory preview or direct tap-to-shoot.

### 3. Fullscreen Feature (`src/components/MiniGameArcade.tsx`)
- Add a dedicated Fullscreen toggle button (`⛶ Toàn màn hình`) in the active game header.
- Use CSS `requestFullscreen()` or responsive full-viewport overlay mode for immersive gameplay.

### 4. General Arcade Polish
- Audit all minigames for smooth performance, touch responsiveness, and zero bugs.
