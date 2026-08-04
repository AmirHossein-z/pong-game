import styles from '../App.module.css'

interface MainMenuProps {
  onPlay: () => void
  onSettings: () => void
}

export function MainMenu({ onPlay, onSettings }: MainMenuProps) {
  return (
    <div className={styles.center}>
      <div className={styles.panel}>
        <h1 className={styles.brand}>PONG</h1>
        <p className={styles.tagline}>Retro-modern arcade. Local play only.</p>
        <div className={styles.stack}>
          <button type="button" className={styles.btnPrimary} onClick={onPlay}>
            Play
          </button>
          <button type="button" className={styles.btn} onClick={onSettings}>
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}
