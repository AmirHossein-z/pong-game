import {
  bounceVelocityFromImpact,
  bounceWalls,
  paddleOverlapsBall,
  resolvePaddleCollision,
} from '../game/Collision'
import {
  BALL_RADIUS,
  COURT_HEIGHT,
  COURT_WIDTH,
  MAX_BALL_SPEED,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_WIDTH,
} from '../game/constants'
import {
  createPaddle,
  createServeBall,
  isWinningScoreReached,
  updatePaddle,
} from '../game/Physics'
import { predictBallY, reflectYIntoCourt } from '../game/AIController'
import { parseSettings, DEFAULT_SETTINGS } from '../store/settings'
import { describe, expect, it } from 'vitest'
import type { BallState, PaddleState } from '../game/types'

describe('bounceWalls', () => {
  it('bounces off the top wall', () => {
    const ball: BallState = {
      x: 100,
      y: 4,
      vx: 10,
      vy: -50,
      speed: 50,
      radius: BALL_RADIUS,
    }
    const next = bounceWalls(ball)
    expect(next.y).toBeGreaterThanOrEqual(BALL_RADIUS)
    expect(next.vy).toBeGreaterThan(0)
  })

  it('bounces off the bottom wall', () => {
    const ball: BallState = {
      x: 100,
      y: COURT_HEIGHT - 4,
      vx: 10,
      vy: 50,
      speed: 50,
      radius: BALL_RADIUS,
    }
    const next = bounceWalls(ball)
    expect(next.y).toBeLessThanOrEqual(COURT_HEIGHT - BALL_RADIUS)
    expect(next.vy).toBeLessThan(0)
  })
})

describe('paddle bounce angle', () => {
  it('sends flatter angles near center', () => {
    const center = bounceVelocityFromImpact(0, true, 300, 0)
    const edge = bounceVelocityFromImpact(1, true, 300, 0)
    expect(Math.abs(center.vy)).toBeLessThan(Math.abs(edge.vy))
    expect(center.vx).toBeGreaterThan(0)
  })

  it('increases speed on paddle hit up to max', () => {
    const paddle: PaddleState = {
      x: PADDLE_MARGIN,
      y: COURT_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      intent: 0,
      vy: 0,
    }
    const ball: BallState = {
      x: paddle.x + paddle.width + BALL_RADIUS - 1,
      y: paddle.y + paddle.height / 2,
      vx: -200,
      vy: 0,
      speed: 300,
      radius: BALL_RADIUS,
    }
    expect(paddleOverlapsBall(paddle, ball)).toBe(true)
    const result = resolvePaddleCollision(ball, paddle, 'left', 40, null)
    expect(result.hit).toBe(true)
    expect(result.ball.speed).toBe(340)
    expect(result.ball.vx).toBeGreaterThan(0)

    const fast: BallState = { ...ball, speed: MAX_BALL_SPEED }
    const capped = resolvePaddleCollision(fast, paddle, 'left', 40, null)
    expect(capped.ball.speed).toBe(MAX_BALL_SPEED)
  })

  it('ignores second hit on same side without clearing', () => {
    const paddle = createPaddle('left')
    const ball: BallState = {
      x: paddle.x + paddle.width + BALL_RADIUS - 1,
      y: paddle.y + paddle.height / 2,
      vx: -200,
      vy: 0,
      speed: 300,
      radius: BALL_RADIUS,
    }
    const second = resolvePaddleCollision(ball, paddle, 'left', 20, 'left')
    expect(second.hit).toBe(false)
  })
})

describe('paddle bounds', () => {
  it('clamps paddle inside the court', () => {
    const paddle = { ...createPaddle('left'), y: -40, intent: -1 }
    const next = updatePaddle(paddle, 1 / 60, 400)
    expect(next.y).toBe(0)

    const bottom = {
      ...createPaddle('right'),
      y: COURT_HEIGHT,
      intent: 1,
    }
    const nextBottom = updatePaddle(bottom, 1 / 60, 400)
    expect(nextBottom.y).toBe(COURT_HEIGHT - PADDLE_HEIGHT)
  })
})

describe('scoring / win detection', () => {
  it('detects winners at the limit', () => {
    expect(isWinningScoreReached({ left: 7, right: 3 }, 7)).toBe('left')
    expect(isWinningScoreReached({ left: 2, right: 10 }, 10)).toBe('right')
    expect(isWinningScoreReached({ left: 99, right: 99 }, 'endless')).toBeNull()
  })
})

describe('serve ball', () => {
  it('never starts nearly vertical', () => {
    for (let i = 0; i < 40; i++) {
      const ball = createServeBall(320)
      expect(Math.abs(ball.vx)).toBeGreaterThan(Math.abs(ball.vy) * 0.4)
    }
  })
})

describe('AI prediction', () => {
  it('predicts intersection Y with wall reflection fold', () => {
    expect(reflectYIntoCourt(COURT_HEIGHT + 20, BALL_RADIUS)).toBeLessThan(
      COURT_HEIGHT,
    )
    const ball: BallState = {
      x: 100,
      y: 100,
      vx: 200,
      vy: 100,
      speed: 220,
      radius: BALL_RADIUS,
    }
    const y = predictBallY(ball, COURT_WIDTH - 40, 2)
    expect(y).toBeGreaterThanOrEqual(BALL_RADIUS)
    expect(y).toBeLessThanOrEqual(COURT_HEIGHT - BALL_RADIUS)
  })
})

describe('settings parsing', () => {
  it('returns defaults for null/invalid', () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS)
    expect(parseSettings('nope')).toEqual(DEFAULT_SETTINGS)
  })

  it('merges valid fields and ignores bad ones', () => {
    const parsed = parseSettings({
      mode: 'twoPlayer',
      difficulty: 'nope',
      winningScore: 10,
      soundEnabled: false,
      ballBaseSpeed: 99999,
    })
    expect(parsed.mode).toBe('twoPlayer')
    expect(parsed.difficulty).toBe(DEFAULT_SETTINGS.difficulty)
    expect(parsed.winningScore).toBe(10)
    expect(parsed.soundEnabled).toBe(false)
    expect(parsed.ballBaseSpeed).toBeLessThanOrEqual(480)
  })
})
