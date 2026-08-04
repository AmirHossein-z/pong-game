export type SoundKind =
  | 'paddle'
  | 'wall'
  | 'score'
  | 'lose'
  | 'win'
  | 'countdown'
  | 'serve'
  | 'ui'

/**
 * Lightweight Web Audio arcade SFX (no external files).
 * Unlock after a user gesture — browsers block autoplay otherwise.
 */
export class AudioManager {
  private ctx: AudioContext | null = null
  private enabled = true
  private master: GainNode | null = null

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    try {
      if (!this.ctx) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext
        this.ctx = new Ctx()
        this.master = this.ctx.createGain()
        this.master.gain.value = 0.7
        this.master.connect(this.ctx.destination)
      }
      return this.ctx
    } catch {
      return null
    }
  }

  /** Call from a click/tap/keydown so playback is allowed. */
  async unlock(): Promise<void> {
    const ctx = this.ensureContext()
    if (!ctx) return
    try {
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }
      // Silent tick proves the graph is alive after gesture
      if (ctx.state === 'running' && this.master) {
        const g = ctx.createGain()
        g.gain.value = 0.0001
        g.connect(this.master)
        const o = ctx.createOscillator()
        o.connect(g)
        o.start()
        o.stop(ctx.currentTime + 0.01)
      }
    } catch {
      // ignore
    }
  }

  play(kind: SoundKind): void {
    if (!this.enabled) return
    const ctx = this.ensureContext()
    if (!ctx || !this.master) return

    if (ctx.state === 'suspended') {
      void ctx.resume().then(() => this.playTone(kind))
      return
    }
    this.playTone(kind)
  }

  private playTone(kind: SoundKind): void {
    const ctx = this.ctx
    const master = this.master
    if (!ctx || !master || ctx.state !== 'running') return

    const now = ctx.currentTime

    const beep = (
      freq: number,
      duration: number,
      type: OscillatorType,
      volume: number,
      slideTo?: number,
      delay = 0,
    ) => {
      const t0 = now + delay
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, t0)
      if (slideTo != null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + duration)
      }
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
      osc.connect(gain)
      gain.connect(master)
      osc.start(t0)
      osc.stop(t0 + duration + 0.02)
    }

    // Soft noise burst for "thock" impacts
    const noiseBurst = (duration: number, volume: number, delay = 0) => {
      const t0 = now + delay
      const frames = Math.max(1, Math.floor(ctx.sampleRate * duration))
      const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < frames; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
      }
      const src = ctx.createBufferSource()
      src.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 900
      filter.Q.value = 0.8
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(volume, t0)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
      src.connect(filter)
      filter.connect(gain)
      gain.connect(master)
      src.start(t0)
      src.stop(t0 + duration + 0.02)
    }

    switch (kind) {
      case 'paddle':
        noiseBurst(0.05, 0.22)
        beep(420, 0.07, 'square', 0.12, 180)
        break
      case 'wall':
        beep(160, 0.05, 'triangle', 0.1, 90)
        noiseBurst(0.03, 0.1)
        break
      case 'score':
        beep(523.25, 0.09, 'sine', 0.14)
        beep(659.25, 0.11, 'sine', 0.12, undefined, 0.09)
        beep(783.99, 0.14, 'sine', 0.1, undefined, 0.18)
        break
      case 'lose':
        beep(320, 0.12, 'sawtooth', 0.1, 120)
        beep(180, 0.18, 'triangle', 0.08, 90, 0.1)
        break
      case 'win':
        beep(523.25, 0.1, 'sine', 0.14)
        beep(659.25, 0.1, 'sine', 0.13, undefined, 0.11)
        beep(783.99, 0.1, 'sine', 0.12, undefined, 0.22)
        beep(1046.5, 0.22, 'sine', 0.11, undefined, 0.33)
        break
      case 'countdown':
        beep(660, 0.07, 'square', 0.08)
        break
      case 'serve':
        beep(880, 0.1, 'sine', 0.11, 440)
        break
      case 'ui':
        beep(640, 0.04, 'sine', 0.07)
        break
    }
  }

  /** Keep context alive across matches; only tear down on full app teardown. */
  dispose(): void {
    // Intentionally no-op for shared singleton — browsers GC on page unload.
  }
}

let sharedAudio: AudioManager | null = null

export function getAudioManager(): AudioManager {
  if (!sharedAudio) sharedAudio = new AudioManager()
  return sharedAudio
}
