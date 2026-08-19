# Pong

A polished, fully client-side Pong game built with React, Vite, TypeScript, and HTML Canvas.

## Features

- One-player mode with Easy / Medium / Hard AI
- Local two-player mode
- Desktop keyboard controls
- Mobile / tablet touch controls (multi-touch)
- Configurable winning score (including endless)
- Settings persisted in `localStorage`
- Frame-rate-independent physics (`requestAnimationFrame` + clamped delta time)
- Web Audio sound effects: paddle/wall hits, score, point lost, countdown, serve, win (muteable in Settings)
- Accessibility: keyboard menus, focus styles, score announcements

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Tests

```bash
npm run test
```

## Controls

### One player

- Keyboard: Arrow Up/Down **or** W/S (chosen before the match)
- Touch: Up/Down buttons on your side, or drag vertically on your half of the court
- Choose left or right side in mode setup

### Two players (same device)

| Player | Keyboard | Touch |
|--------|----------|-------|
| Left (Player 1) | W / S | Left Up/Down buttons |
| Right (Player 2) | ↑ / ↓ | Right Up/Down buttons |

### General

| Action | Input |
|--------|--------|
| Pause / resume | Esc or P, or on-screen pause |
| Restart | R (asks for confirmation during a match) |
| Rematch | After game over, or R on the game-over screen |

On phones/tablets, landscape orientation is recommended for two-player touch play. Portrait still works; a notice is shown.

## Game modes

1. **One player** — human vs computer. AI uses reaction delay, prediction error, and capped paddle speed (never teleports).
2. **Two players** — local hot-seat / couch play with simultaneous keyboard or multi-touch.

First to the selected score wins (5 / 7 / 10 / 15), or play endless until you exit.

## Mobile usage

- Touch buttons support press-and-hold and simultaneous pointers
- Page scroll / pull-to-refresh blocked while playing (`touch-action: none`)
- Drag a paddle by touching your half of the canvas
- Match auto-pauses when the tab is hidden or the window loses focus

## Architecture summary

```
src/
  components/   # Menus, overlays, touch UI, game screen
  game/         # Engine, loop, physics, collision, AI, input, audio, renderer
  hooks/        # Engine bridge, settings, visibility, orientation
  store/        # Settings defaults + safe localStorage parse
  styles/       # Global tokens
```

- **React** owns navigation, settings, and discrete events (score, pause, game over).
- **GameEngine** owns the rAF loop, physics state (refs/mutable objects), and canvas drawing.
- React does **not** re-render every frame.
- Input is action-based (`LEFT_UP`, `RIGHT_DOWN`, `PAUSE`, …) so keyboard, touch, and AI share one interface.
- Logical court is fixed **800×450**; the canvas scales with DPR for sharpness without changing physics units.

### Physics notes

- Paddle bounce angle depends on hit offset (center → flat, edge → steep).
- Ball speed rises on each paddle hit up to a maximum, then resets after a point.
- Motion uses substeps when the ball travels far in one frame to reduce tunneling.

### AI notes

- AI aims at a **target Y**, updated on a difficulty-dependent reaction timer.
- Easy mostly tracks the live ball; Medium/Hard predict trajectory (with wall folds) and add error/mistakes.
- AI paddle speed is capped by difficulty and never exceeds the shared physical max.

## License

Hobby project — free to use and modify.
