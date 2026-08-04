import { COURT_HEIGHT, COURT_WIDTH } from './constants'
import type { GameSettings, MatchState } from './types'

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

export class Renderer {
  private particles: Particle[] = []
  private trail: { x: number; y: number; a: number }[] = []

  resize(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(cssWidth * dpr)
    canvas.height = Math.round(cssHeight * dpr)
    canvas.style.width = `${cssWidth}px`
    canvas.style.height = `${cssHeight}px`
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }

  spawnHitParticles(x: number, y: number, reduced: boolean): void {
    if (reduced) return
    const count = 8
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4
      const speed = 60 + Math.random() * 120
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.45,
      })
    }
  }

  updateEffects(dt: number, state: MatchState, settings: GameSettings): void {
    if (settings.reducedMotion) {
      this.particles.length = 0
      this.trail.length = 0
      return
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.life -= dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.life <= 0) this.particles.splice(i, 1)
    }

    if (state.status === 'playing') {
      this.trail.push({ x: state.ball.x, y: state.ball.y, a: 1 })
      if (this.trail.length > 12) this.trail.shift()
      for (const t of this.trail) t.a *= 0.88
    } else {
      this.trail.length = 0
    }
  }

  clearEffects(): void {
    this.particles.length = 0
    this.trail.length = 0
  }

  draw(
    ctx: CanvasRenderingContext2D,
    cssWidth: number,
    cssHeight: number,
    state: MatchState,
    settings: GameSettings,
  ): void {
    const sx = cssWidth / COURT_WIDTH
    const sy = cssHeight / COURT_HEIGHT

    ctx.save()
    ctx.scale(sx, sy)

    let shakeX = 0
    let shakeY = 0
    if (settings.screenShake && !settings.reducedMotion && state.shake > 0) {
      shakeX = (Math.random() * 2 - 1) * state.shake
      shakeY = (Math.random() * 2 - 1) * state.shake
    }
    ctx.translate(shakeX, shakeY)

    // Court background
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, COURT_WIDTH, COURT_HEIGHT)

    // Soft vignette border
    ctx.strokeStyle = 'rgba(94, 234, 212, 0.35)'
    ctx.lineWidth = 3
    ctx.strokeRect(1.5, 1.5, COURT_WIDTH - 3, COURT_HEIGHT - 3)

    if (settings.showCenterLine) {
      ctx.setLineDash([10, 14])
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(COURT_WIDTH / 2, 12)
      ctx.lineTo(COURT_WIDTH / 2, COURT_HEIGHT - 12)
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Trail
    for (const t of this.trail) {
      ctx.beginPath()
      ctx.fillStyle = `rgba(125, 211, 252, ${0.25 * t.a})`
      ctx.arc(t.x, t.y, state.ball.radius * 0.7, 0, Math.PI * 2)
      ctx.fill()
    }

    // Paddles
    this.drawPaddle(ctx, state.left, '#5eead4')
    this.drawPaddle(ctx, state.right, '#f472b6')

    // Ball
    ctx.shadowColor = '#7dd3fc'
    ctx.shadowBlur = settings.reducedMotion ? 0 : 16
    ctx.fillStyle = '#e0f2fe'
    ctx.beginPath()
    ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    // Particles
    for (const p of this.particles) {
      const a = p.life / p.maxLife
      ctx.fillStyle = `rgba(94, 234, 212, ${a})`
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4)
    }

    ctx.restore()
  }

  private drawPaddle(
    ctx: CanvasRenderingContext2D,
    paddle: { x: number; y: number; width: number; height: number },
    color: string,
  ): void {
    ctx.shadowColor = color
    ctx.shadowBlur = 12
    ctx.fillStyle = color
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
    ctx.shadowBlur = 0
  }
}
