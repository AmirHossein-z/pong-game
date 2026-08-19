import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { centerSx, panelSx } from '../theme'

interface MainMenuProps {
  onPlay: () => void
  onSettings: () => void
}

export function MainMenu({ onPlay, onSettings }: MainMenuProps) {
  return (
    <Box sx={centerSx}>
      <Paper elevation={0} sx={panelSx}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: '"Segoe UI", "Trebuchet MS", "Verdana", sans-serif',
            fontSize: 'clamp(2.8rem, 10vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '0.18em',
            textAlign: 'center',
            mb: '0.35rem',
            color: 'primary.main',
            textShadow: '0 0 24px rgba(94, 234, 212, 0.35)',
          }}
        >
          PONG
        </Typography>
        <Typography
          sx={{ textAlign: 'center', color: 'text.secondary', mb: '1.75rem', fontSize: '0.95rem' }}
        >
          Retro-modern arcade.
        </Typography>
        <Stack spacing={1.5}>
          <Button variant="contained" color="primary" onClick={onPlay}>
            Play
          </Button>
          <Button variant="contained" color="inherit" onClick={onSettings}>
            Settings
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
