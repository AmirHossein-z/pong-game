import { COURT_HEIGHT, MAX_BOUNCE_ANGLE, MAX_BALL_SPEED } from './constants'
import type { BallState, PaddleState, Side } from './types'
import { clamp } from '../utils/clamp'

export interface BounceResult {
  ball: BallState
  hit: boolean
  side: Side | null
}

/** Reflect ball off top/bottom walls; keeps ball inside court. */
export function bounceWalls(ball: BallState): BallState {
  const next = { ...ball }
  if (next.y - next.radius <= 0) {
    next.y = next.radius
    next.vy = Math.abs(next.vy)
  } else if (next.y + next.radius >= COURT_HEIGHT) {
    next.y = COURT_HEIGHT - next.radius
    next.vy = -Math.abs(next.vy)
  }
  return next
}

/**
 * Compute outgoing velocity from paddle impact offset (-1 top .. 1 bottom).
 */
export function bounceVelocityFromImpact(
  impact: number,
  goingRight: boolean,
  speed: number,
  paddleVy: number,
): { vx: number; vy: number } {
  const clampedImpact = clamp(impact, -1, 1)
  const angle = clampedImpact * MAX_BOUNCE_ANGLE
  const dir = goingRight ? 1 : -1
  let vx = Math.cos(angle) * speed * dir
  let vy = Math.sin(angle) * speed

  // Slight paddle movement influence
  vy += paddleVy * 0.15

  // Prevent near-vertical trajectories
  const minVx = speed * 0.45
  if (Math.abs(vx) < minVx) {
    vx = minVx * dir
  }

  // Renormalize to current speed
  const mag = Math.hypot(vx, vy) || 1
  vx = (vx / mag) * speed
  vy = (vy / mag) * speed

  return { vx, vy }
}

export function paddleOverlapsBall(paddle: PaddleState, ball: BallState): boolean {
  const closestX = clamp(ball.x, paddle.x, paddle.x + paddle.width)
  const closestY = clamp(ball.y, paddle.y, paddle.y + paddle.height)
  const dx = ball.x - closestX
  const dy = ball.y - closestY
  return dx * dx + dy * dy <= ball.radius * ball.radius
}

export function resolvePaddleCollision(
  ball: BallState,
  paddle: PaddleState,
  side: Side,
  acceleration: number,
  lastHitSide: Side | null,
): BounceResult {
  if (lastHitSide === side) {
    return { ball, hit: false, side: null }
  }
  if (!paddleOverlapsBall(paddle, ball)) {
    return { ball, hit: false, side: null }
  }

  const paddleCenter = paddle.y + paddle.height / 2
  const impact = (ball.y - paddleCenter) / (paddle.height / 2)
  const goingRight = side === 'left'
  const nextSpeed = Math.min(ball.speed + acceleration, MAX_BALL_SPEED)
  const { vx, vy } = bounceVelocityFromImpact(impact, goingRight, nextSpeed, paddle.vy)

  const next: BallState = {
    ...ball,
    speed: nextSpeed,
    vx,
    vy,
  }

  // Push ball outside paddle to avoid sticking
  if (side === 'left') {
    next.x = paddle.x + paddle.width + ball.radius + 0.5
  } else {
    next.x = paddle.x - ball.radius - 0.5
  }

  return { ball: next, hit: true, side }
}
