import {
  BALL_RADIUS,
  COURT_HEIGHT,
  COURT_WIDTH,
  MIN_SERVE_HORIZONTAL_RATIO,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_WIDTH,
  PHYSICS_SUBSTEP_DISTANCE,
} from './constants'
import {
  bounceWalls,
  resolvePaddleCollision,
} from './Collision'
import type { BallState, GameSettings, MatchState, PaddleState, Side } from './types'
import { clamp } from '../utils/clamp'

export function createPaddle(side: Side, height = PADDLE_HEIGHT): PaddleState {
  const x =
    side === 'left' ? PADDLE_MARGIN : COURT_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH
  return {
    x,
    y: (COURT_HEIGHT - height) / 2,
    width: PADDLE_WIDTH,
    height,
    intent: 0,
    vy: 0,
  }
}

export function createServeBall(baseSpeed: number, toward: Side | null = null): BallState {
  // Random angle but keep strong horizontal component
  let angle = (Math.random() * Math.PI) / 2 - Math.PI / 4 // -45..45 deg
  let dir = Math.random() < 0.5 ? -1 : 1
  if (toward === 'left') dir = -1
  if (toward === 'right') dir = 1

  let vx = Math.cos(angle) * baseSpeed * dir
  let vy = Math.sin(angle) * baseSpeed

  const minVx = baseSpeed * MIN_SERVE_HORIZONTAL_RATIO
  if (Math.abs(vx) < minVx) {
    vx = minVx * dir
    const mag = Math.hypot(vx, vy) || 1
    vx = (vx / mag) * baseSpeed
    vy = (vy / mag) * baseSpeed
  }

  return {
    x: COURT_WIDTH / 2,
    y: COURT_HEIGHT / 2,
    vx,
    vy,
    speed: baseSpeed,
    radius: BALL_RADIUS,
  }
}

export function createInitialMatch(settings: GameSettings): MatchState {
  return {
    status: 'countdown',
    ball: createServeBall(settings.ballBaseSpeed),
    left: createPaddle('left'),
    right: createPaddle('right'),
    score: { left: 0, right: 0 },
    countdown: 3,
    winner: null,
    lastHitSide: null,
    shake: 0,
  }
}

export function updatePaddle(
  paddle: PaddleState,
  dt: number,
  speed: number,
): PaddleState {
  const prevY = paddle.y
  const nextY = clamp(
    paddle.y + paddle.intent * speed * dt,
    0,
    COURT_HEIGHT - paddle.height,
  )
  return {
    ...paddle,
    y: nextY,
    vy: dt > 0 ? (nextY - prevY) / dt : 0,
  }
}

export interface PhysicsStepResult {
  state: MatchState
  wallHit: boolean
  paddleHit: Side | null
  scoredBy: Side | null
}

function stepBallOnce(
  state: MatchState,
  dt: number,
  settings: GameSettings,
): PhysicsStepResult {
  let ball = { ...state.ball }
  ball.x += ball.vx * dt
  ball.y += ball.vy * dt

  const beforeVy = ball.vy
  ball = bounceWalls(ball)
  const wallHit = Math.sign(beforeVy) !== 0 && Math.sign(beforeVy) !== Math.sign(ball.vy)

  // Clear lastHitSide when ball leaves paddle vicinity
  let lastHitSide = state.lastHitSide
  if (lastHitSide === 'left' && ball.vx > 0 && ball.x > COURT_WIDTH * 0.35) {
    lastHitSide = null
  }
  if (lastHitSide === 'right' && ball.vx < 0 && ball.x < COURT_WIDTH * 0.65) {
    lastHitSide = null
  }

  let paddleHit: Side | null = null
  let leftHit = resolvePaddleCollision(
    ball,
    state.left,
    'left',
    settings.ballAcceleration,
    lastHitSide,
  )
  if (leftHit.hit) {
    ball = leftHit.ball
    paddleHit = 'left'
    lastHitSide = 'left'
  } else {
    const rightHit = resolvePaddleCollision(
      ball,
      state.right,
      'right',
      settings.ballAcceleration,
      lastHitSide,
    )
    if (rightHit.hit) {
      ball = rightHit.ball
      paddleHit = 'right'
      lastHitSide = 'right'
    }
  }

  let scoredBy: Side | null = null
  if (ball.x + ball.radius < 0) {
    scoredBy = 'right'
  } else if (ball.x - ball.radius > COURT_WIDTH) {
    scoredBy = 'left'
  }

  return {
    state: {
      ...state,
      ball,
      lastHitSide,
    },
    wallHit: wallHit && !paddleHit,
    paddleHit,
    scoredBy,
  }
}

/** Accurate wall-hit detection helper used by tests and step. */
export function didBounceWall(prev: BallState, next: BallState): boolean {
  return Math.sign(prev.vy) !== Math.sign(next.vy) && Math.sign(prev.vy) !== 0
}

export function stepPhysics(
  state: MatchState,
  dt: number,
  settings: GameSettings,
): PhysicsStepResult {
  if (state.status !== 'playing') {
    return { state, wallHit: false, paddleHit: null, scoredBy: null }
  }

  const left = updatePaddle(state.left, dt, settings.paddleSpeed)
  const right = updatePaddle(state.right, dt, settings.paddleSpeed)
  let working: MatchState = { ...state, left, right }

  const travel = Math.hypot(working.ball.vx, working.ball.vy) * dt
  const steps = Math.max(1, Math.ceil(travel / PHYSICS_SUBSTEP_DISTANCE))
  const subDt = dt / steps

  let wallHit = false
  let paddleHit: Side | null = null
  let scoredBy: Side | null = null

  for (let i = 0; i < steps; i++) {
    const result = stepBallOnce(working, subDt, settings)
    working = result.state
    wallHit = wallHit || result.wallHit
    if (result.paddleHit) paddleHit = result.paddleHit
    if (result.scoredBy) {
      scoredBy = result.scoredBy
      break
    }
  }

  return { state: working, wallHit, paddleHit, scoredBy }
}

export function applyScore(
  state: MatchState,
  scoredBy: Side,
  settings: GameSettings,
): MatchState {
  const score = {
    left: state.score.left + (scoredBy === 'left' ? 1 : 0),
    right: state.score.right + (scoredBy === 'right' ? 1 : 0),
  }

  const limit = settings.winningScore
  let winner: Side | null = null
  if (limit !== 'endless') {
    if (score.left >= limit) winner = 'left'
    if (score.right >= limit) winner = 'right'
  }

  if (winner) {
    return {
      ...state,
      score,
      winner,
      status: 'over',
      countdown: null,
      ball: createServeBall(settings.ballBaseSpeed),
      left: { ...state.left, intent: 0, vy: 0 },
      right: { ...state.right, intent: 0, vy: 0 },
      lastHitSide: null,
    }
  }

  // Serve toward the player who was scored on
  const toward: Side = scoredBy === 'left' ? 'right' : 'left'
  return {
    ...state,
    score,
    status: 'countdown',
    countdown: 3,
    winner: null,
    ball: createServeBall(settings.ballBaseSpeed, toward),
    left: { ...createPaddle('left'), y: state.left.y },
    right: { ...createPaddle('right'), y: state.right.y },
    lastHitSide: null,
  }
}

export function isWinningScoreReached(
  score: { left: number; right: number },
  winningScore: GameSettings['winningScore'],
): Side | null {
  if (winningScore === 'endless') return null
  if (score.left >= winningScore) return 'left'
  if (score.right >= winningScore) return 'right'
  return null
}
