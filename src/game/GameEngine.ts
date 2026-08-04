import { AIController } from './AIController'
import { getAudioManager } from './AudioManager'
import { COURT_HEIGHT } from './constants'
import { InputManager } from './InputManager'
import {
  applyScore,
  createInitialMatch,
  stepPhysics,
  updatePaddle,
} from './Physics'
import { GameLoop } from './GameLoop'
import { Renderer } from './Renderer'
import type {
  EngineEventHandler,
  GameSettings,
  MatchState,
  Side,
} from './types'
import { clamp } from '../utils/clamp'

export class GameEngine {
  readonly input = new InputManager()
  readonly audio = getAudioManager()
  readonly renderer = new Renderer()
  private loop = new GameLoop()
  private state: MatchState
  private settings: GameSettings
  private ai: AIController | null = null
  private onEvent: EngineEventHandler | null = null
  private canvas: HTMLCanvasElement | null = null
  private cssWidth = 800
  private cssHeight = 450
  private countdownAcc = 0
  private disposed = false

  constructor(settings: GameSettings) {
    this.settings = settings
    this.state = createInitialMatch(settings)
    this.setupAi()
  }

  private setupAi(): void {
    if (this.settings.mode !== 'onePlayer') {
      this.ai = null
      return
    }
    const aiSide: Side = this.settings.humanSide === 'left' ? 'right' : 'left'
    const paddle = aiSide === 'left' ? this.state.left : this.state.right
    this.ai = new AIController(
      aiSide,
      this.settings.difficulty,
      paddle.y,
      paddle.height,
    )
  }

  setEventHandler(handler: EngineEventHandler | null): void {
    this.onEvent = handler
  }

  getState(): MatchState {
    return this.state
  }

  getSettings(): GameSettings {
    return this.settings
  }

  updateSettings(partial: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...partial }
    this.audio.setEnabled(this.settings.soundEnabled)
    if (this.ai) {
      this.ai.setDifficulty(this.settings.difficulty)
      const aiSide: Side = this.settings.humanSide === 'left' ? 'right' : 'left'
      this.ai.setSide(aiSide)
    }
  }

  attachCanvas(canvas: HTMLCanvasElement, width: number, height: number): void {
    this.canvas = canvas
    this.cssWidth = width
    this.cssHeight = height
    this.renderer.resize(canvas, width, height)
  }

  resize(width: number, height: number): void {
    this.cssWidth = width
    this.cssHeight = height
    if (this.canvas) this.renderer.resize(this.canvas, width, height)
  }

  start(): void {
    if (this.disposed) return
    this.audio.setEnabled(this.settings.soundEnabled)
    void this.audio.unlock()
    this.input.enable(true)
    if (!this.loop.isRunning()) {
      this.audio.play('countdown')
      this.loop.start(this.frame)
    }
  }

  stop(): void {
    this.loop.stop()
    this.input.disable()
  }

  dispose(): void {
    this.disposed = true
    this.stop()
    this.audio.dispose()
    this.renderer.clearEffects()
    this.onEvent = null
    this.canvas = null
  }

  pause(): void {
    if (this.state.status !== 'playing' && this.state.status !== 'countdown') return
    this.state = { ...this.state, status: 'paused' }
    this.input.clearGameplayInputs()
    this.emit({ type: 'status', status: 'paused' })
  }

  resume(): void {
    if (this.state.status !== 'paused') return
    // Resume into countdown briefly or playing
    if (this.state.countdown != null && this.state.countdown > 0) {
      this.state = { ...this.state, status: 'countdown' }
      this.emit({ type: 'status', status: 'countdown' })
    } else {
      this.state = { ...this.state, status: 'playing', countdown: null }
      this.emit({ type: 'status', status: 'playing' })
    }
  }

  togglePause(): void {
    if (this.state.status === 'paused') this.resume()
    else if (this.state.status === 'playing' || this.state.status === 'countdown') {
      this.pause()
    }
  }

  rematch(): void {
    this.renderer.clearEffects()
    this.input.clearAll()
    this.state = createInitialMatch(this.settings)
    this.setupAi()
    this.countdownAcc = 0
    this.audio.play('countdown')
    this.emit({ type: 'status', status: 'countdown' })
    this.emit({ type: 'countdown', value: this.state.countdown })
    this.emit({
      type: 'score',
      side: 'left',
      score: this.state.score,
    })
  }

  private emit(
    event: Parameters<NonNullable<EngineEventHandler>>[0],
  ): void {
    this.onEvent?.(event)
  }

  private applyIntents(dt: number): void {
    const { settings, input } = this

    let leftIntent = input.getHumanIntent('left')
    let rightIntent = input.getHumanIntent('right')

    // Drag overrides button intent when active
    if (input.dragLeftY != null) {
      const center = this.state.left.y + this.state.left.height / 2
      const dy = input.dragLeftY - center
      leftIntent = Math.abs(dy) < 8 ? 0 : dy < 0 ? -1 : 1
    }
    if (input.dragRightY != null) {
      const center = this.state.right.y + this.state.right.height / 2
      const dy = input.dragRightY - center
      rightIntent = Math.abs(dy) < 8 ? 0 : dy < 0 ? -1 : 1
    }

    if (settings.mode === 'onePlayer' && this.ai) {
      const aiSide: Side = settings.humanSide === 'left' ? 'right' : 'left'
      const paddle = aiSide === 'left' ? this.state.left : this.state.right
      const aiIntent = this.ai.update(
        dt,
        this.state.ball,
        paddle,
        settings.paddleSpeed,
      )
      if (aiSide === 'left') leftIntent = aiIntent
      else rightIntent = aiIntent

      // Apply AI max speed by temporarily scaling — use updatePaddle with capped speed
      const aiSpeed = this.ai.getMaxSpeed(settings.paddleSpeed)
      if (aiSide === 'left') {
        this.state = {
          ...this.state,
          left: { ...this.state.left, intent: leftIntent },
          right: { ...this.state.right, intent: rightIntent },
        }
        // Pre-move AI paddle with capped speed, zero intent for physics step
        const moved = updatePaddle(this.state.left, dt, aiSpeed)
        this.state = {
          ...this.state,
          left: { ...moved, intent: 0 },
          right: { ...this.state.right, intent: rightIntent },
        }
        return
      }
      this.state = {
        ...this.state,
        left: { ...this.state.left, intent: leftIntent },
        right: { ...this.state.right, intent: rightIntent },
      }
      const moved = updatePaddle(this.state.right, dt, aiSpeed)
      this.state = {
        ...this.state,
        left: { ...this.state.left, intent: leftIntent },
        right: { ...moved, intent: 0 },
      }
      return
    }

    this.state = {
      ...this.state,
      left: { ...this.state.left, intent: leftIntent },
      right: { ...this.state.right, intent: rightIntent },
    }
  }

  private frame = (dt: number): void => {
    if (this.disposed) return

    // Decay shake
    if (this.state.shake > 0) {
      this.state = {
        ...this.state,
        shake: Math.max(0, this.state.shake - dt * 20),
      }
    }

    if (this.state.status === 'countdown') {
      this.applyIntents(dt)
      // Still allow paddle movement during countdown
      this.state = {
        ...this.state,
        left: updatePaddle(this.state.left, dt, this.settings.paddleSpeed),
        right: updatePaddle(this.state.right, dt, this.settings.paddleSpeed),
      }
      // Zero ball movement
      this.countdownAcc += dt
      if (this.countdownAcc >= 1) {
        this.countdownAcc = 0
        const next =
          this.state.countdown == null ? 0 : this.state.countdown - 1
        if (next <= 0) {
          this.state = {
            ...this.state,
            countdown: null,
            status: 'playing',
          }
          this.audio.play('serve')
          this.emit({ type: 'countdown', value: null })
          this.emit({ type: 'status', status: 'playing' })
        } else {
          this.state = { ...this.state, countdown: next }
          this.audio.play('countdown')
          this.emit({ type: 'countdown', value: next })
        }
      }
    } else if (this.state.status === 'playing') {
      this.applyIntents(dt)
      const result = stepPhysics(this.state, dt, this.settings)
      this.state = result.state

      if (result.wallHit) {
        this.audio.play('wall')
      }
      if (result.paddleHit) {
        this.audio.play('paddle')
        this.renderer.spawnHitParticles(
          this.state.ball.x,
          this.state.ball.y,
          this.settings.reducedMotion,
        )
        if (this.settings.screenShake && !this.settings.reducedMotion) {
          this.state = { ...this.state, shake: 3.5 }
        }
      }
      if (result.scoredBy) {
        const scorer = result.scoredBy
        this.state = applyScore(this.state, scorer, this.settings)
        this.countdownAcc = 0

        if (this.state.status === 'over' && this.state.winner) {
          this.audio.play('win')
          this.emit({
            type: 'score',
            side: scorer,
            score: this.state.score,
          })
          this.emit({
            type: 'gameOver',
            winner: this.state.winner,
            score: this.state.score,
          })
          this.emit({
            type: 'announce',
            message:
              this.state.winner === 'left'
                ? 'Player 1 wins'
                : 'Player 2 wins',
          })
          this.emit({ type: 'status', status: 'over' })
        } else {
          // 1P: cheerful score vs downbeat lose; 2P: always "score" chirp
          if (this.settings.mode === 'onePlayer') {
            const humanScored = scorer === this.settings.humanSide
            this.audio.play(humanScored ? 'score' : 'lose')
          } else {
            this.audio.play('score')
          }
          this.emit({
            type: 'score',
            side: scorer,
            score: this.state.score,
          })
          this.emit({
            type: 'announce',
            message:
              scorer === 'left' ? 'Player 1 scores' : 'Player 2 scores',
          })
          this.emit({ type: 'status', status: 'countdown' })
          this.emit({ type: 'countdown', value: this.state.countdown })
        }
      }
    }

    this.renderer.updateEffects(dt, this.state, this.settings)
    this.render()
  }

  private render(): void {
    if (!this.canvas) return
    const ctx = this.canvas.getContext('2d')
    if (!ctx) return
    this.renderer.draw(ctx, this.cssWidth, this.cssHeight, this.state, this.settings)
  }

  /** Map a client Y on the canvas to logical court Y. */
  clientToCourtY(clientY: number, canvasRect: DOMRect): number {
    const rel = (clientY - canvasRect.top) / canvasRect.height
    return clamp(rel * COURT_HEIGHT, 0, COURT_HEIGHT)
  }
}
