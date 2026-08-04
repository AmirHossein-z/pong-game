import styles from '../App.module.css'
import {
  ACCEL_MAX,
  ACCEL_MIN,
  BALL_SPEED_MAX,
  BALL_SPEED_MIN,
  PADDLE_SPEED_MAX,
  PADDLE_SPEED_MIN,
} from '../game/constants'
import type { GameSettings } from '../game/types'

interface SettingsPanelProps {
  settings: GameSettings
  onChange: (partial: Partial<GameSettings>) => void
  onBack: () => void
}

export function SettingsPanel({ settings, onChange, onBack }: SettingsPanelProps) {
  return (
    <div className={styles.center}>
      <div className={`${styles.panel} ${styles.panelWide}`}>
        <h2 className={styles.title}>Settings</h2>
        <p className={styles.subtitle}>Preferences are saved on this device.</p>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => onChange({ soundEnabled: e.target.checked })}
          />
          Sound
        </label>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(e) => onChange({ reducedMotion: e.target.checked })}
          />
          Reduced motion
        </label>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={settings.touchControlsVisible}
            onChange={(e) => onChange({ touchControlsVisible: e.target.checked })}
          />
          Show touch controls when available
        </label>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={settings.screenShake}
            onChange={(e) => onChange({ screenShake: e.target.checked })}
          />
          Screen shake on hits
        </label>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={settings.showCenterLine}
            onChange={(e) => onChange({ showCenterLine: e.target.checked })}
          />
          Show center line
        </label>

        <div className={styles.field}>
          <label htmlFor="ball-speed">
            Ball starting speed{' '}
            <span className={styles.rangeValue}>{Math.round(settings.ballBaseSpeed)}</span>
          </label>
          <input
            id="ball-speed"
            type="range"
            min={BALL_SPEED_MIN}
            max={BALL_SPEED_MAX}
            value={settings.ballBaseSpeed}
            onChange={(e) => onChange({ ballBaseSpeed: Number(e.target.value) })}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="paddle-speed">
            Paddle speed{' '}
            <span className={styles.rangeValue}>{Math.round(settings.paddleSpeed)}</span>
          </label>
          <input
            id="paddle-speed"
            type="range"
            min={PADDLE_SPEED_MIN}
            max={PADDLE_SPEED_MAX}
            value={settings.paddleSpeed}
            onChange={(e) => onChange({ paddleSpeed: Number(e.target.value) })}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="accel">
            Ball acceleration{' '}
            <span className={styles.rangeValue}>{Math.round(settings.ballAcceleration)}</span>
          </label>
          <input
            id="accel"
            type="range"
            min={ACCEL_MIN}
            max={ACCEL_MAX}
            value={settings.ballAcceleration}
            onChange={(e) => onChange({ ballAcceleration: Number(e.target.value) })}
          />
        </div>

        <div className={styles.stack} style={{ marginTop: '1rem' }}>
          <button type="button" className={styles.btnPrimary} onClick={onBack}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
