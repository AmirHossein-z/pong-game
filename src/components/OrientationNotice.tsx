import styles from './GameScreen.module.css'

interface OrientationNoticeProps {
  show: boolean
}

export function OrientationNotice({ show }: OrientationNoticeProps) {
  if (!show) return null
  return (
    <div className={styles.orientation} role="status">
      Landscape orientation recommended for two-player touch controls.
    </div>
  )
}
