import { useCallback, useEffect, useRef, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import styles from './GameScreen.module.css'
import { ConfirmDialog } from './ConfirmDialog'
import { CountdownOverlay } from './CountdownOverlay'
import { GameOverOverlay } from './GameOverOverlay'
import { OrientationNotice } from './OrientationNotice'
import { PauseOverlay } from './PauseOverlay'
import { Scoreboard } from './Scoreboard'
import { LeftTouchControls, RightTouchControls } from './TouchControls'
import { useGameEngine } from '../hooks/useGameEngine'
import { useOrientation } from '../hooks/useOrientation'
import { usePageVisibility } from '../hooks/usePageVisibility'
import { COURT_HEIGHT, COURT_WIDTH } from '../game/constants'
import type { GameSettings, InputAction } from '../game/types'
import type { GameEngine } from '../game/GameEngine'

interface GameScreenProps {
  settings: GameSettings
  onExitToMenu: () => void
}

const iconBtnSx = {
  minWidth: 48,
  minHeight: 48,
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  background: 'rgba(15, 23, 42, 0.85)',
  color: 'text.primary',
  fontSize: '1.1rem',
} as const

export function GameScreen({ settings, onExitToMenu }: GameScreenProps) {
  const { engineRef, ui, setUi } = useGameEngine(settings, true)
  const { isPortrait, isCoarsePointer } = useOrientation()
  const [confirmRestart, setConfirmRestart] = useState(false)
  const [engineEpoch, setEngineEpoch] = useState(0)

  // Re-render once engine exists so canvas/touch bind to InputManager
  useEffect(() => {
    let frames = 0
    let raf = 0
    const wait = () => {
      frames++
      if (engineRef.current || frames > 30) {
        setEngineEpoch((n) => n + 1)
        return
      }
      raf = requestAnimationFrame(wait)
    }
    raf = requestAnimationFrame(wait)
    return () => cancelAnimationFrame(raf)
  }, [engineRef])

  const leftLabel =
    settings.mode === 'onePlayer'
      ? settings.humanSide === 'left'
        ? 'You'
        : 'Computer'
      : 'Player 1'
  const rightLabel =
    settings.mode === 'onePlayer'
      ? settings.humanSide === 'right'
        ? 'You'
        : 'Computer'
      : 'Player 2'

  const showTouch =
    settings.touchControlsVisible &&
    (isCoarsePointer || settings.mode === 'twoPlayer')

  const showLeftTouch =
    showTouch && (settings.mode === 'twoPlayer' || settings.humanSide === 'left')
  const showRightTouch =
    showTouch && (settings.mode === 'twoPlayer' || settings.humanSide === 'right')

  const onHidden = useCallback(() => {
    const eng = engineRef.current
    if (!eng) return
    const st = eng.getState().status
    if (st === 'playing' || st === 'countdown') {
      eng.pause()
      setUi((prev) => ({ ...prev, status: 'paused' }))
    }
  }, [engineRef, setUi])

  usePageVisibility(onHidden, true)

  const syncStatus = useCallback(() => {
    const eng = engineRef.current
    if (!eng) return
    setUi((prev) => ({ ...prev, status: eng.getState().status }))
  }, [engineRef, setUi])

  const togglePause = useCallback(() => {
    const eng = engineRef.current
    if (!eng) return
    if (eng.getState().status === 'over') return
    eng.togglePause()
    syncStatus()
  }, [engineRef, syncStatus])

  const doRematch = useCallback(() => {
    engineRef.current?.rematch()
    setUi({
      status: 'countdown',
      score: { left: 0, right: 0 },
      countdown: 3,
      winner: null,
      announcement: '',
    })
  }, [engineRef, setUi])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault()
        togglePause()
      }
      if (e.code === 'KeyR') {
        const status = engineRef.current?.getState().status
        if (status === 'over') doRematch()
        else if (status) setConfirmRestart(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [togglePause, doRematch, engineRef])

  // Also listen via InputManager pause action
  useEffect(() => {
    const eng = engineRef.current
    if (!eng) return
    return eng.input.on((action: InputAction, pressed: boolean) => {
      if (pressed && action === 'PAUSE') togglePause()
    })
  }, [engineRef, engineEpoch, togglePause])

  const input = engineEpoch > 0 ? engineRef.current?.input ?? null : null

  return (
    <div
      className={styles.screen}
      onPointerDown={() => {
        void engineRef.current?.audio.unlock()
      }}
    >
      <OrientationNotice
        show={isPortrait && (isCoarsePointer || settings.mode === 'twoPlayer')}
      />

      <div className={styles.topBar}>
        <IconButton
          sx={iconBtnSx}
          aria-label={ui.status === 'paused' ? 'Resume game' : 'Pause game'}
          onClick={togglePause}
        >
          {ui.status === 'paused' ? '▶' : '❚❚'}
        </IconButton>
        <Scoreboard score={ui.score} leftLabel={leftLabel} rightLabel={rightLabel} />
        <IconButton
          sx={iconBtnSx}
          aria-label="Pause and open menu"
          onClick={() => {
            engineRef.current?.pause()
            setUi((prev) => ({ ...prev, status: 'paused' }))
          }}
        >
          ☰
        </IconButton>
      </div>

      <div className={styles.playArea}>
        <LeftTouchControls input={input} show={showLeftTouch} />

        <Court
          engineRef={engineRef}
          engineEpoch={engineEpoch}
          ui={ui}
          leftLabel={leftLabel}
          rightLabel={rightLabel}
          onResume={() => {
            engineRef.current?.resume()
            syncStatus()
          }}
          onRestart={() => setConfirmRestart(true)}
          onMenu={onExitToMenu}
          onRematch={doRematch}
        />

        <RightTouchControls input={input} show={showRightTouch} />
      </div>

      {ui.status === 'countdown' && (
        <Typography
          sx={{
            p: '0.75rem 0.85rem',
            borderRadius: '10px',
            background: 'rgba(125, 211, 252, 0.08)',
            border: '1px solid rgba(125, 211, 252, 0.2)',
            color: 'text.secondary',
            fontSize: '0.85rem',
            lineHeight: 1.4,
            textAlign: 'center',
            // In compact landscape the court gets every pixel of height;
            // this hint would shrink it and cause a jump after countdown.
            '@media (orientation: landscape) and (max-height: 480px)': {
              display: 'none',
            },
          }}
        >
          {settings.mode === 'twoPlayer'
            ? 'Left: W/S or touch · Right: Arrows or touch · Esc/P pause'
            : `Controls: ${settings.keyboardScheme === 'wasd' ? 'W/S' : 'Arrow keys'} · Esc/P pause`}
        </Typography>
      )}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {ui.announcement}
      </div>

      {confirmRestart && (
        <ConfirmDialog
          title="Restart match?"
          message="Current scores will be reset."
          confirmLabel="Restart"
          onCancel={() => setConfirmRestart(false)}
          onConfirm={() => {
            setConfirmRestart(false)
            doRematch()
          }}
        />
      )}
    </div>
  )
}

function Court({
  engineRef,
  engineEpoch,
  ui,
  leftLabel,
  rightLabel,
  onResume,
  onRestart,
  onMenu,
  onRematch,
}: {
  engineRef: React.RefObject<GameEngine | null>
  engineEpoch: number
  ui: {
    status: string
    countdown: number | null
    winner: 'left' | 'right' | null
    score: { left: number; right: number }
  }
  leftLabel: string
  rightLabel: string
  onResume: () => void
  onRestart: () => void
  onMenu: () => void
  onRematch: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const engine = engineRef.current
    if (!canvas || !wrap || !engine) return

    const fit = () => {
      const availW = wrap.clientWidth
      const availH = wrap.clientHeight
      if (availW <= 0 || availH <= 0) return
      const scale = Math.min(availW / COURT_WIDTH, availH / COURT_HEIGHT)
      const w = Math.max(1, Math.floor(COURT_WIDTH * scale))
      const h = Math.max(1, Math.floor(COURT_HEIGHT * scale))
      engine.attachCanvas(canvas, w, h)
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)

    const pointers = new Map<number, 'left' | 'right'>()

    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const relX = (e.clientX - rect.left) / rect.width
      const side = relX < 0.5 ? 'left' : 'right'
      pointers.set(e.pointerId, side)
      canvas.setPointerCapture(e.pointerId)
      const y = engine.clientToCourtY(e.clientY, rect)
      if (side === 'left') engine.input.dragLeftY = y
      else engine.input.dragRightY = y
    }

    const onPointerMove = (e: PointerEvent) => {
      const side = pointers.get(e.pointerId)
      if (!side) return
      const rect = canvas.getBoundingClientRect()
      const y = engine.clientToCourtY(e.clientY, rect)
      if (side === 'left') engine.input.dragLeftY = y
      else engine.input.dragRightY = y
    }

    const onPointerEnd = (e: PointerEvent) => {
      const side = pointers.get(e.pointerId)
      pointers.delete(e.pointerId)
      if (side === 'left') engine.input.dragLeftY = null
      if (side === 'right') engine.input.dragRightY = null
    }

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerEnd)
    canvas.addEventListener('pointercancel', onPointerEnd)

    return () => {
      ro.disconnect()
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerEnd)
      canvas.removeEventListener('pointercancel', onPointerEnd)
    }
  }, [engineRef, engineEpoch])

  return (
    <div className={styles.courtWrap} ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label="Pong game court"
      >
        Pong game canvas. Scores and status are announced separately.
      </canvas>

      {ui.status === 'countdown' && (
        <div className={styles.overlay}>
          <CountdownOverlay value={ui.countdown} />
        </div>
      )}
      {ui.status === 'paused' && (
        <div className={styles.overlay} style={{ pointerEvents: 'auto' }}>
          <PauseOverlay onResume={onResume} onRestart={onRestart} onMenu={onMenu} />
        </div>
      )}
      {ui.status === 'over' && ui.winner && (
        <div className={styles.overlay} style={{ pointerEvents: 'auto' }}>
          <GameOverOverlay
            winner={ui.winner}
            score={ui.score}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            onRematch={onRematch}
            onMenu={onMenu}
          />
        </div>
      )}
    </div>
  )
}
