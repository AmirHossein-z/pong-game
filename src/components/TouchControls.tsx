import { useCallback, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
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
    <Button
      variant="contained"
      color="inherit"
      aria-label={ariaLabel}
      data-pressed={pressed ? 'true' : 'false'}
      sx={{
        flex: '0 0 auto',
        minWidth: 0,
        height: 'clamp(72px, 22vh, 120px)',
        borderRadius: '14px',
        background: 'rgba(15, 23, 42, 0.9)',
        fontSize: '1.4rem',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        '&[data-pressed="true"]': {
          background: 'rgba(94, 234, 212, 0.22)',
          borderColor: 'rgba(94, 234, 212, 0.55)',
          transform: 'scale(0.98)',
        },
      }}
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
    </Button>
  )
}

const touchColSx = {
  justifyContent: 'center',
  gap: '0.6rem',
  width: 'clamp(56px, 12vw, 72px)',
  pb: 'var(--safe-bottom)',
} as const

export function LeftTouchControls({ input, show }: TouchControlsProps) {
  if (!show) return <Box aria-hidden sx={{ width: 0 }} />
  return (
    <Stack sx={touchColSx} aria-label="Left player controls">
      <TouchButton action="LEFT_UP" input={input} label="▲" ariaLabel="Left paddle up" />
      <TouchButton action="LEFT_DOWN" input={input} label="▼" ariaLabel="Left paddle down" />
    </Stack>
  )
}

export function RightTouchControls({ input, show }: TouchControlsProps) {
  if (!show) return <Box aria-hidden sx={{ width: 0 }} />
  return (
    <Stack sx={touchColSx} aria-label="Right player controls">
      <TouchButton action="RIGHT_UP" input={input} label="▲" ariaLabel="Right paddle up" />
      <TouchButton action="RIGHT_DOWN" input={input} label="▼" ariaLabel="Right paddle down" />
    </Stack>
  )
}
