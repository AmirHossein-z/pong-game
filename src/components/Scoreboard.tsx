import Box from '@mui/material/Box'
import type { ScoreState } from '../game/types'

const scoreSx = {
  fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
  fontWeight: 800,
  minWidth: '2ch',
  textAlign: 'center',
} as const

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
    <Box
      aria-label={`Score ${leftLabel} ${score.left}, ${rightLabel} ${score.right}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.12em',
      }}
    >
      <Box component="span" sx={{ ...scoreSx, color: 'primary.main' }}>
        {score.left}
      </Box>
      <Box component="span" aria-hidden sx={{ color: 'text.secondary', fontSize: '1.4rem' }}>
        :
      </Box>
      <Box component="span" sx={{ ...scoreSx, color: 'secondary.main' }}>
        {score.right}
      </Box>
    </Box>
  )
}
