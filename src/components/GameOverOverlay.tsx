import app from '../App.module.css'
import styles from './GameScreen.module.css'
import type { ScoreState, Side } from '../game/types'

interface GameOverOverlayProps {
  winner: Side
  score: ScoreState
  leftLabel: string
  rightLabel: string
  onRematch: () => void
  onMenu: () => void
}

export function GameOverOverlay({
  winner,
  score,
  leftLabel,
  rightLabel,
  onRematch,
  onMenu,
}: GameOverOverlayProps) {
  const name = winner === 'left' ? leftLabel : rightLabel
  return (
    <div className={styles.overlayCard} role="dialog" aria-modal="true" aria-label="Game over">
      <h2 className={styles.overlayTitle}>{name} wins</h2>
      <p className={styles.overlayText}>
        Final score {score.left} – {score.right}
      </p>
      <div className={styles.actions}>
        <button type="button" className={app.btnPrimary} onClick={onRematch}>
          Rematch
        </button>
        <button type="button" className={app.btnGhost} onClick={onMenu}>
          Main menu
        </button>
      </div>
    </div>
  )
}
