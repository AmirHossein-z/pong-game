import { AI_CONFIG } from './aiConfig'
import { COURT_HEIGHT, COURT_WIDTH } from './constants'
import type { BallState, Difficulty, PaddleState, Side } from './types'
import { clamp } from '../utils/clamp'

/**
 * Predict Y where ball crosses targetX, reflecting off top/bottom walls.
 */
export function predictBallY(
  ball: BallState,
  targetX: number,
  maxBounces: number,
): number {
  if (ball.vx === 0) return ball.y

  let x = ball.x
  let y = ball.y
  let vx = ball.vx
  let vy = ball.vy
  let bounces = 0

  // Iterate until we reach/pass targetX or run out of bounces
  while (bounces <= maxBounces) {
    if (vx === 0) break

    const goingRight = vx > 0
    const willCross =
      (goingRight && x < targetX && targetX <= x + vx * 10) ||
      (!goingRight && x > targetX && targetX >= x + vx * 10) ||
      (goingRight && targetX >= x) ||
      (!goingRight && targetX <= x)

    if (!willCross && bounces > 0) break

    const dtToTarget = (targetX - x) / vx
    if (dtToTarget > 0) {
      const yAtTarget = y + vy * dtToTarget
      // Check if wall hit before target
      let dtToWall = Infinity
      if (vy < 0) dtToWall = (ball.radius - y) / vy
      else if (vy > 0) dtToWall = (COURT_HEIGHT - ball.radius - y) / vy

      if (dtToWall < dtToTarget && dtToWall > 0 && bounces < maxBounces) {
        x += vx * dtToWall
        y += vy * dtToWall
        vy = -vy
        y = clamp(y, ball.radius, COURT_HEIGHT - ball.radius)
        bounces++
        continue
      }

      // Reflect Y into court via mirror method for leftover wall crossings
      return reflectYIntoCourt(yAtTarget, ball.radius)
    }

    break
  }

  return clamp(ball.y, ball.radius, COURT_HEIGHT - ball.radius)
}

export function reflectYIntoCourt(y: number, radius: number): number {
  const min = radius
  const max = COURT_HEIGHT - radius
  const span = max - min
  if (span <= 0) return min

  // Mirror fold into [min, max]
  let t = y - min
  const period = span * 2
  t = ((t % period) + period) % period
  if (t > span) t = period - t
  return min + t
}

export class AIController {
  private targetY: number
  private reactionTimer = 0
  private side: Side
  private difficulty: Difficulty

  constructor(side: Side, difficulty: Difficulty, paddleY: number, paddleHeight: number) {
    this.side = side
    this.difficulty = difficulty
    this.targetY = paddleY + paddleHeight / 2
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty
  }

  setSide(side: Side): void {
    this.side = side
  }

  reset(paddleY: number, paddleHeight: number): void {
    this.targetY = paddleY + paddleHeight / 2
    this.reactionTimer = 0
  }

  /**
   * Returns movement intent -1 / 0 / 1 and updates internal target.
   */
  update(
    dt: number,
    ball: BallState,
    paddle: PaddleState,
    paddleSpeedCap: number,
  ): number {
    const cfg = AI_CONFIG[this.difficulty]
    this.reactionTimer -= dt

    const paddleCenter = paddle.y + paddle.height / 2
    const approaching =
      (this.side === 'right' && ball.vx > 0) ||
      (this.side === 'left' && ball.vx < 0)

    if (this.reactionTimer <= 0) {
      this.reactionTimer = cfg.reactionTime * (0.85 + Math.random() * 0.3)

      if (Math.random() < cfg.mistakeChance) {
        // Intentional mistake: aim away from ball
        this.targetY = clamp(
          paddleCenter + (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 80),
          paddle.height / 2,
          COURT_HEIGHT - paddle.height / 2,
        )
      } else if (!approaching) {
        // Drift toward center / slight lead
        const center = COURT_HEIGHT / 2
        this.targetY = lerp(paddleCenter, center, 0.35)
      } else if (!cfg.usePrediction) {
        this.targetY = ball.y + (Math.random() * 2 - 1) * cfg.predictionError
      } else {
        const targetX =
          this.side === 'right'
            ? COURT_WIDTH - paddle.x // approximate paddle face
            : paddle.x + paddle.width
        // Use paddle face x
        const faceX =
          this.side === 'right' ? paddle.x : paddle.x + paddle.width
        let predicted = predictBallY(ball, faceX, cfg.wallBounces)
        predicted += (Math.random() * 2 - 1) * cfg.predictionError
        this.targetY = predicted
        void targetX
      }

      this.targetY = clamp(
        this.targetY,
        paddle.height / 2,
        COURT_HEIGHT - paddle.height / 2,
      )
    }

    const maxSpeed = Math.min(cfg.maxSpeed, paddleSpeedCap)
    const dy = this.targetY - paddleCenter
    const deadzone = 6
    if (Math.abs(dy) < deadzone) return 0

    // Scale intent: full speed if far, else proportional — engine uses ±1 * speed
    // Use discrete intent but AI maxSpeed is applied by scaling intent magnitude via
    // returning ±1 and letting engine use min(aiMax, paddleSpeed) — handled in GameEngine
    void maxSpeed
    return dy < 0 ? -1 : 1
  }

  getMaxSpeed(paddleSpeedCap: number): number {
    return Math.min(AI_CONFIG[this.difficulty].maxSpeed, paddleSpeedCap)
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
