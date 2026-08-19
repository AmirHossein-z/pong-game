import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

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
    <Dialog
      open
      onClose={onCancel}
      role="alertdialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <DialogTitle id="confirm-title" sx={{ letterSpacing: '0.04em' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-desc">{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 0.5, flexWrap: 'wrap' }}>
        <Button variant="outlined" color="error" onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button variant="outlined" color="inherit" onClick={onCancel}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}
