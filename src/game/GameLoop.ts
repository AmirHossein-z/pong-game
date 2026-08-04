import { MAX_DELTA_SECONDS } from './constants'

export type FrameCallback = (dt: number) => void

/**
 * requestAnimationFrame loop with clamped delta time.
 * Only one loop instance should run at a time per engine.
 */
export class GameLoop {
  private rafId: number | null = null
  private lastTime = 0
  private running = false
  private callback: FrameCallback | null = null

  start(callback: FrameCallback): void {
    this.stop()
    this.callback = callback
    this.running = true
    this.lastTime = 0
    this.rafId = requestAnimationFrame(this.tick)
  }

  stop(): void {
    this.running = false
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.callback = null
  }

  isRunning(): boolean {
    return this.running
  }

  private tick = (time: number): void => {
    if (!this.running || !this.callback) return
    if (this.lastTime === 0) this.lastTime = time
    let dt = (time - this.lastTime) / 1000
    this.lastTime = time
    if (dt > MAX_DELTA_SECONDS) dt = MAX_DELTA_SECONDS
    if (dt < 0) dt = 0
    this.callback(dt)
    this.rafId = requestAnimationFrame(this.tick)
  }
}
