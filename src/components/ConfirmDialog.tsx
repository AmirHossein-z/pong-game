import app from '../App.module.css'
import styles from './GameScreen.module.css'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className={styles.dialogBackdrop} role="presentation">
      <div
        className={styles.dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
      >
        <h2 id="confirm-title" className={styles.overlayTitle}>
          {title}
        </h2>
        <p id="confirm-desc" className={styles.overlayText}>
          {message}
        </p>
        <div className={styles.actions}>
          <button type="button" className={app.btnDanger} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className={app.btnGhost} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
