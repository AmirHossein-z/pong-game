import {
  ACCEL_MAX,
  ACCEL_MIN,
  BALL_SPEED_MAX,
  BALL_SPEED_MIN,
  DEFAULT_BALL_ACCELERATION,
  DEFAULT_BALL_BASE_SPEED,
  DEFAULT_PADDLE_SPEED,
  PADDLE_SPEED_MAX,
  PADDLE_SPEED_MIN,
  SETTINGS_STORAGE_KEY,
} from '../game/constants'
import type {
  Difficulty,
  GameMode,
  GameSettings,
  KeyboardScheme,
  Side,
  WinningScore,
} from '../game/types'
import { clamp } from '../utils/clamp'
import { readStorage, writeStorage } from '../utils/storage'

export const DEFAULT_SETTINGS: GameSettings = {
  mode: 'onePlayer',
  difficulty: 'medium',
  keyboardScheme: 'arrows',
  humanSide: 'left',
  winningScore: 7,
  soundEnabled: true,
  reducedMotion: false,
  touchControlsVisible: true,
  ballBaseSpeed: DEFAULT_BALL_BASE_SPEED,
  paddleSpeed: DEFAULT_PADDLE_SPEED,
  ballAcceleration: DEFAULT_BALL_ACCELERATION,
  screenShake: true,
  showCenterLine: true,
}

function isGameMode(v: unknown): v is GameMode {
  return v === 'onePlayer' || v === 'twoPlayer'
}

function isDifficulty(v: unknown): v is Difficulty {
  return v === 'easy' || v === 'medium' || v === 'hard'
}

function isKeyboardScheme(v: unknown): v is KeyboardScheme {
  return v === 'arrows' || v === 'wasd'
}

function isSide(v: unknown): v is Side {
  return v === 'left' || v === 'right'
}

function isWinningScore(v: unknown): v is WinningScore {
  return v === 5 || v === 7 || v === 10 || v === 15 || v === 'endless'
}

function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === 'boolean' ? v : fallback
}

function asNumber(v: unknown, fallback: number, min: number, max: number): number {
  if (typeof v !== 'number' || Number.isNaN(v)) return fallback
  return clamp(v, min, max)
}

/** Safely parse saved settings; malformed data falls back to defaults. */
export function parseSettings(raw: unknown): GameSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_SETTINGS }
  }

  const o = raw as Record<string, unknown>
  const base = { ...DEFAULT_SETTINGS }

  return {
    mode: isGameMode(o.mode) ? o.mode : base.mode,
    difficulty: isDifficulty(o.difficulty) ? o.difficulty : base.difficulty,
    keyboardScheme: isKeyboardScheme(o.keyboardScheme)
      ? o.keyboardScheme
      : base.keyboardScheme,
    humanSide: isSide(o.humanSide) ? o.humanSide : base.humanSide,
    winningScore: isWinningScore(o.winningScore) ? o.winningScore : base.winningScore,
    soundEnabled: asBool(o.soundEnabled, base.soundEnabled),
    reducedMotion: asBool(o.reducedMotion, base.reducedMotion),
    touchControlsVisible: asBool(o.touchControlsVisible, base.touchControlsVisible),
    ballBaseSpeed: asNumber(o.ballBaseSpeed, base.ballBaseSpeed, BALL_SPEED_MIN, BALL_SPEED_MAX),
    paddleSpeed: asNumber(o.paddleSpeed, base.paddleSpeed, PADDLE_SPEED_MIN, PADDLE_SPEED_MAX),
    ballAcceleration: asNumber(
      o.ballAcceleration,
      base.ballAcceleration,
      ACCEL_MIN,
      ACCEL_MAX,
    ),
    screenShake: asBool(o.screenShake, base.screenShake),
    showCenterLine: asBool(o.showCenterLine, base.showCenterLine),
  }
}

export function loadSettings(): GameSettings {
  const raw = readStorage(SETTINGS_STORAGE_KEY)
  if (!raw) return { ...DEFAULT_SETTINGS }
  try {
    return parseSettings(JSON.parse(raw))
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: GameSettings): void {
  writeStorage(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}
