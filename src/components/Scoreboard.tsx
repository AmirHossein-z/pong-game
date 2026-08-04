import styles from './GameScreen.module.css'
import type { ScoreState } from '../game/types'

interface ScoreboardProps {
  score: ScoreState
  leftLabel?: string
  rightLabel?: string
}

export function Scoreboard({
  score,
  leftLabel = 'Player 1',
  rightLabel = 'Player 2',
}: ScoreboardProps) {
  return (
    <div
      className={styles.scoreboard}
      aria-label={`Score ${leftLabel} ${score.left}, ${rightLabel} ${score.right}`}
    >
      <span className={`${styles.score} ${styles.scoreLeft}`}>{score.left}</span>
      <span className={styles.scoreSep} aria-hidden>
        :
      </span>
      <span className={`${styles.score} ${styles.scoreRight}`}>{score.right}</span>
    </div>
  )
}
