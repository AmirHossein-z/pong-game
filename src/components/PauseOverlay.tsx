import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { overlayCardSx, overlayTitleSx, overlayTextSx } from '../theme'

interface PauseOverlayProps {
  onResume: () => void
  onRestart: () => void
  onMenu: () => void
}

export function PauseOverlay({ onResume, onRestart, onMenu }: PauseOverlayProps) {
  return (
    <Paper elevation={0} sx={overlayCardSx} role="dialog" aria-modal="true" aria-label="Paused">
      <Typography variant="h4" component="h2" sx={overlayTitleSx}>
        Paused
      </Typography>
      <Typography sx={overlayTextSx}>Press Esc or P to resume.</Typography>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <Button variant="contained" color="primary" onClick={onResume}>
          Resume
        </Button>
        <Button variant="contained" color="inherit" onClick={onRestart}>
          Restart
        </Button>
        <Button variant="outlined" color="inherit" onClick={onMenu}>
          Main menu
        </Button>
      </Stack>
    </Paper>
  )
}
