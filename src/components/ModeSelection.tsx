import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { centerSx, panelSx } from '../theme'
import type { Difficulty, GameSettings, WinningScore } from '../game/types'

interface ModeSelectionProps {
  settings: GameSettings
  onChange: (partial: Partial<GameSettings>) => void
  onBack: () => void
  onStart: () => void
  onOpenSettings: () => void
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', mb: '1rem' }}>
      <Typography id={id} sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
        {label}
      </Typography>
      {children}
    </Box>
  )
}

export function ModeSelection({
  settings,
  onChange,
  onBack,
  onStart,
  onOpenSettings,
}: ModeSelectionProps) {
  return (
    <Box sx={centerSx}>
      <Paper elevation={0} sx={panelSx}>
        <Typography variant="h5" component="h2" sx={{ mb: '0.5rem', letterSpacing: '0.04em' }}>
          Choose mode
        </Typography>
        <Typography sx={{ mb: '1.25rem', color: 'text.secondary', fontSize: '0.92rem' }}>
          Pick how you want to play, then start the match.
        </Typography>

        <Field label="Game mode" id="mode-label">
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={settings.mode}
            aria-labelledby="mode-label"
            onChange={(_, v) => v != null && onChange({ mode: v })}
          >
            <ToggleButton value="onePlayer">1 Player</ToggleButton>
            <ToggleButton value="twoPlayer">2 Players</ToggleButton>
          </ToggleButtonGroup>
        </Field>

        {settings.mode === 'onePlayer' && (
          <>
            <Field label="Computer difficulty" id="diff-label">
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={settings.difficulty}
                aria-labelledby="diff-label"
                onChange={(_, v) => v != null && onChange({ difficulty: v })}
              >
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <ToggleButton key={d} value={d}>
                    {d[0]!.toUpperCase() + d.slice(1)}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Field>

            <Field label="Your keyboard" id="scheme-label">
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={settings.keyboardScheme}
                aria-labelledby="scheme-label"
                onChange={(_, v) => v != null && onChange({ keyboardScheme: v })}
              >
                <ToggleButton value="arrows">↑ ↓</ToggleButton>
                <ToggleButton value="wasd">W S</ToggleButton>
              </ToggleButtonGroup>
            </Field>

            <Field label="Your side" id="side-label">
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={settings.humanSide}
                aria-labelledby="side-label"
                onChange={(_, v) => v != null && onChange({ humanSide: v })}
              >
                <ToggleButton value="left">Left</ToggleButton>
                <ToggleButton value="right">Right</ToggleButton>
              </ToggleButtonGroup>
            </Field>
          </>
        )}

        <FormControl fullWidth sx={{ mb: '1rem' }}>
          <InputLabel id="winning-score-label">Winning score</InputLabel>
          <Select
            labelId="winning-score-label"
            id="winning-score"
            label="Winning score"
            value={String(settings.winningScore)}
            onChange={(e) => {
              const v = e.target.value
              const winningScore = (v === 'endless' ? 'endless' : Number(v)) as WinningScore
              onChange({ winningScore })
            }}
          >
            <MenuItem value="5">5</MenuItem>
            <MenuItem value="7">7</MenuItem>
            <MenuItem value="10">10</MenuItem>
            <MenuItem value="15">15</MenuItem>
            <MenuItem value="endless">Endless</MenuItem>
          </Select>
        </FormControl>

        {settings.mode === 'twoPlayer' && (
          <Alert
            icon={false}
            severity="info"
            sx={{
              background: 'rgba(125, 211, 252, 0.08)',
              border: '1px solid rgba(125, 211, 252, 0.2)',
              color: 'text.secondary',
              fontSize: '0.85rem',
              borderRadius: '10px',
            }}
          >
            Desktop: Left player uses W/S, Right player uses Arrow keys. On touch devices, each
            side gets Up/Down buttons — landscape works best.
          </Alert>
        )}

        <Stack spacing={1.5} sx={{ mt: '1.25rem' }}>
          <Button variant="contained" color="primary" onClick={onStart}>
            Start match
          </Button>
          <Button variant="contained" color="inherit" onClick={onOpenSettings}>
            More settings
          </Button>
          <Button variant="outlined" color="inherit" onClick={onBack}>
            Back
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
