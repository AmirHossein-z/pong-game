import Alert from '@mui/material/Alert'

interface OrientationNoticeProps {
  show: boolean
}

export function OrientationNotice({ show }: OrientationNoticeProps) {
  if (!show) return null
  return (
    <Alert
      icon={false}
      role="status"
      severity="warning"
      sx={{
        flexShrink: 0,
        justifyContent: 'center',
        py: '0.15rem',
        borderRadius: '10px',
        background: 'rgba(244, 114, 182, 0.12)',
        border: '1px solid rgba(244, 114, 182, 0.3)',
        color: '#fecdd3',
        fontSize: '0.85rem',
      }}
    >
      Landscape orientation recommended for two-player touch controls.
    </Alert>
  )
}
