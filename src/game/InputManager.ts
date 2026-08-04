import type { InputAction } from './types'

type ActionListener = (action: InputAction, pressed: boolean) => void

/**
 * Action-based input: merges keyboard, touch, and external (AI) sources.
 * Keyboard/touch set held actions; AI writes paddle intents separately each frame.
 */
export class InputManager {
  private held = new Set<InputAction>()
  private keysDown = new Set<string>()
  private pointerActions = new Map<number, InputAction>()
  private listeners = new Set<ActionListener>()
  private enabled = false
  private preventDefaults = false

  /** AI paddle intents: -1 / 0 / 1 per side */
  aiLeftIntent = 0
  aiRightIntent = 0

  /** Drag targets in logical court Y (center of paddle); null = unused */
  dragLeftY: number | null = null
  dragRightY: number | null = null

  enable(preventDefaults = true): void {
    if (this.enabled) return
    this.enabled = true
    this.preventDefaults = preventDefaults
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('blur', this.clearAll)
  }

  disable(): void {
    if (!this.enabled) return
    this.enabled = false
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('blur', this.clearAll)
    this.clearAll()
  }

  on(listener: ActionListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(action: InputAction, pressed: boolean): void {
    for (const l of this.listeners) l(action, pressed)
  }

  private setHeld(action: InputAction, pressed: boolean): void {
    const was = this.held.has(action)
    if (pressed && !was) {
      this.held.add(action)
      this.emit(action, true)
    } else if (!pressed && was) {
      this.held.delete(action)
      this.emit(action, false)
    }
  }

  isHeld(action: InputAction): boolean {
    return this.held.has(action)
  }

  /** Combined human intent for a paddle (-1, 0, 1). */
  getHumanIntent(side: 'left' | 'right'): number {
    const up = side === 'left' ? 'LEFT_UP' : 'RIGHT_UP'
    const down = side === 'left' ? 'LEFT_DOWN' : 'RIGHT_DOWN'
    let intent = 0
    if (this.held.has(up)) intent -= 1
    if (this.held.has(down)) intent += 1
    return intent
  }

  setPointerAction(pointerId: number, action: InputAction | null): void {
    const prev = this.pointerActions.get(pointerId)
    if (prev && prev !== action) {
      this.pointerActions.delete(pointerId)
      // Only release if no other pointer holds same action
      if (![...this.pointerActions.values()].includes(prev)) {
        this.setHeld(prev, false)
      }
    }
    if (action) {
      this.pointerActions.set(pointerId, action)
      this.setHeld(action, true)
    } else {
      this.pointerActions.delete(pointerId)
    }
  }

  clearPointer(pointerId: number): void {
    this.setPointerAction(pointerId, null)
  }

  clearAll = (): void => {
    this.keysDown.clear()
    this.pointerActions.clear()
    this.dragLeftY = null
    this.dragRightY = null
    this.aiLeftIntent = 0
    this.aiRightIntent = 0
    const actions = [...this.held]
    this.held.clear()
    for (const a of actions) this.emit(a, false)
  }

  clearGameplayInputs(): void {
    const gameplay: InputAction[] = [
      'LEFT_UP',
      'LEFT_DOWN',
      'RIGHT_UP',
      'RIGHT_DOWN',
    ]
    for (const a of gameplay) {
      if (this.held.has(a)) {
        this.held.delete(a)
        this.emit(a, false)
      }
    }
    this.pointerActions.clear()
    this.dragLeftY = null
    this.dragRightY = null
    this.aiLeftIntent = 0
    this.aiRightIntent = 0
    // Keep keysDown so release still works; remove paddle keys
    for (const key of [...this.keysDown]) {
      const action = this.mapKey(key)
      if (action && gameplay.includes(action)) this.keysDown.delete(key)
    }
  }

  /** Key map set by React based on mode/scheme. */
  keyMap: Record<string, InputAction> = {}

  setKeyMap(map: Record<string, InputAction>): void {
    this.keyMap = map
  }

  private mapKey(code: string): InputAction | undefined {
    return this.keyMap[code]
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.repeat) return
    const action = this.mapKey(e.code)
    if (!action) return
    if (this.preventDefaults) {
      e.preventDefault()
    }
    this.keysDown.add(e.code)
    this.setHeld(action, true)
  }

  private onKeyUp = (e: KeyboardEvent): void => {
    const action = this.mapKey(e.code)
    this.keysDown.delete(e.code)
    if (!action) return
    // Only release if no other key maps to same action
    const stillHeld = [...this.keysDown].some((k) => this.mapKey(k) === action)
    const pointerHeld = [...this.pointerActions.values()].includes(action)
    if (!stillHeld && !pointerHeld) {
      this.setHeld(action, false)
    }
  }
}

export function buildKeyMap(options: {
  mode: 'onePlayer' | 'twoPlayer'
  scheme: 'arrows' | 'wasd'
  humanSide: 'left' | 'right'
}): Record<string, InputAction> {
  const map: Record<string, InputAction> = {
    Escape: 'PAUSE',
    KeyP: 'PAUSE',
    Enter: 'CONFIRM',
    Space: 'CONFIRM',
    Backspace: 'BACK',
  }

  if (options.mode === 'twoPlayer') {
    map.KeyW = 'LEFT_UP'
    map.KeyS = 'LEFT_DOWN'
    map.ArrowUp = 'RIGHT_UP'
    map.ArrowDown = 'RIGHT_DOWN'
    return map
  }

  const humanUp = options.humanSide === 'left' ? 'LEFT_UP' : 'RIGHT_UP'
  const humanDown = options.humanSide === 'left' ? 'LEFT_DOWN' : 'RIGHT_DOWN'

  if (options.scheme === 'wasd') {
    map.KeyW = humanUp
    map.KeyS = humanDown
  } else {
    map.ArrowUp = humanUp
    map.ArrowDown = humanDown
  }

  return map
}
