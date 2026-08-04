export type GameMode = 'onePlayer' | 'twoPlayer'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type KeyboardScheme = 'arrows' | 'wasd'
export type Side = 'left' | 'right'
export type WinningScore = 5 | 7 | 10 | 15 | 'endless'

export type AppScreen =
  | 'menu'
  | 'mode'
  | 'settings'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'gameOver'

export type MatchStatus =
  | 'countdown'
  | 'playing'
  | 'paused'
  | 'point'
  | 'over'

export type InputAction =
  | 'LEFT_UP'
  | 'LEFT_DOWN'
  | 'RIGHT_UP'
  | 'RIGHT_DOWN'
  | 'PAUSE'
  | 'CONFIRM'
  | 'BACK'

export interface Vec2 {
  x: number
  y: number
}

export interface BallState {
  x: number
  y: number
  vx: number
  vy: number
  speed: number
  radius: number
}

export interface PaddleState {
  x: number
  y: number
  width: number
  height: number
  /** -1 up, 0 none, 1 down */
  intent: number
  /** Last frame vertical velocity for bounce bias */
  vy: number
}

export interface ScoreState {
  left: number
  right: number
}

export interface MatchState {
  status: MatchStatus
  ball: BallState
  left: PaddleState
  right: PaddleState
  score: ScoreState
  countdown: number | null
  winner: Side | null
  /** Prevent multi-hit on same paddle contact */
  lastHitSide: Side | null
  shake: number
}

export interface GameSettings {
  mode: GameMode
  difficulty: Difficulty
  keyboardScheme: KeyboardScheme
  humanSide: Side
  winningScore: WinningScore
  soundEnabled: boolean
  reducedMotion: boolean
  touchControlsVisible: boolean
  ballBaseSpeed: number
  paddleSpeed: number
  ballAcceleration: number
  screenShake: boolean
  showCenterLine: boolean
}

export interface EngineConfig {
  settings: GameSettings
}

export type EngineEvent =
  | { type: 'score'; side: Side; score: ScoreState }
  | { type: 'countdown'; value: number | null }
  | { type: 'status'; status: MatchStatus }
  | { type: 'gameOver'; winner: Side; score: ScoreState }
  | { type: 'announce'; message: string }

export type EngineEventHandler = (event: EngineEvent) => void

export interface AiDifficultyConfig {
  reactionTime: number
  maxSpeed: number
  predictionError: number
  mistakeChance: number
  usePrediction: boolean
  wallBounces: number
}
