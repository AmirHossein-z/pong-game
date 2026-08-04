import app from '../App.module.css'
import styles from './GameScreen.module.css'

interface PauseOverlayProps {
  onResume: () => void
  onRestart: () => void
  onMenu: () => void
}

export function PauseOverlay({ onResume, onRestart, onMenu }: PauseOverlayProps) {
  return (
    <div className={styles.overlayCard} role="dialog" aria-modal="true" aria-label="Paused">
      <h2 className={styles.overlayTitle}>Paused</h2>
      <p className={styles.overlayText}>Press Esc or P to resume.</p>
      <div className={styles.actions}>
        <button type="button" className={app.btnPrimary} onClick={onResume}>
          Resume
        </button>
        <button type="button" className={app.btn} onClick={onRestart}>
          Restart
        </button>
        <button type="button" className={app.btnGhost} onClick={onMenu}>
          Main menu
        </button>
      </div>
    </div>
  )
}
