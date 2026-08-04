import { useCallback, useRef, useState } from 'react'
import styles from './GameScreen.module.css'
import type { InputManager } from '../game/InputManager'
import type { InputAction } from '../game/types'

interface TouchControlsProps {
  input: InputManager | null
  show: boolean
}

function TouchButton({
  action,
  input,
  label,
  ariaLabel,
}: {
  action: InputAction
  input: InputManager | null
  label: string
  ariaLabel: string
}) {
  const [pressed, setPressed] = useState(false)
  const pointerRef = useRef<number | null>(null)

  const release = useCallback(() => {
    if (pointerRef.current != null && input) {
      input.clearPointer(pointerRef.current)
      pointerRef.current = null
    }
    setPressed(false)
  }, [input])

  return (
    <button
      type="button"
      className={styles.touchBtn}
      aria-label={ariaLabel}
      data-pressed={pressed ? 'true' : 'false'}
      onPointerDown={(e) => {
        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
        pointerRef.current = e.pointerId
        input?.setPointerAction(e.pointerId, action)
        setPressed(true)
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  )
}

export function LeftTouchControls({ input, show }: TouchControlsProps) {
  if (!show) return <div aria-hidden style={{ width: 0 }} />
  return (
    <div className={styles.touchCol} aria-label="Left player controls">
      <TouchButton action="LEFT_UP" input={input} label="▲" ariaLabel="Left paddle up" />
      <TouchButton action="LEFT_DOWN" input={input} label="▼" ariaLabel="Left paddle down" />
    </div>
  )
}

export function RightTouchControls({ input, show }: TouchControlsProps) {
  if (!show) return <div aria-hidden style={{ width: 0 }} />
  return (
    <div className={styles.touchCol} aria-label="Right player controls">
      <TouchButton action="RIGHT_UP" input={input} label="▲" ariaLabel="Right paddle up" />
      <TouchButton action="RIGHT_DOWN" input={input} label="▼" ariaLabel="Right paddle down" />
    </div>
  )
}
