import styles from './GameScreen.module.css'

interface CountdownOverlayProps {
  value: number | null
}

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  if (value == null || value <= 0) return null
  return (
    <div className={styles.countdown} aria-live="polite">
      {value}
    </div>
  )
}
