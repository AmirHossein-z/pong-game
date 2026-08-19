import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { overlayCardSx, overlayTitleSx, overlayTextSx } from '../theme'
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
    <Paper elevation={0} sx={overlayCardSx} role="dialog" aria-modal="true" aria-label="Game over">
      <Typography variant="h4" component="h2" sx={overlayTitleSx}>
        {name} wins
      </Typography>
      <Typography sx={overlayTextSx}>
        Final score {score.left} – {score.right}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <Button variant="contained" color="primary" onClick={onRematch}>
          Rematch
        </Button>
        <Button variant="outlined" color="inherit" onClick={onMenu}>
          Main menu
        </Button>
      </Stack>
    </Paper>
  )
}
