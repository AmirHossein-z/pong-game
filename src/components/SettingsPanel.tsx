import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { centerSx, panelSx } from '../theme'
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

function SliderField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', mb: '0.75rem' }}>
      <Typography
        component="label"
        htmlFor={id}
        sx={{ fontSize: '0.85rem', color: 'text.secondary' }}
      >
        {label}{' '}
        <Box component="span" sx={{ fontSize: '0.8rem', color: 'primary.main' }}>
          {Math.round(value)}
        </Box>
      </Typography>
      <Slider
        id={id}
        size="small"
        min={min}
        max={max}
        value={value}
        onChange={(_, v) => onChange(v as number)}
      />
    </Box>
  )
}

type BooleanSettingKey =
  | 'soundEnabled'
  | 'reducedMotion'
  | 'touchControlsVisible'
  | 'screenShake'
  | 'showCenterLine'

export function SettingsPanel({ settings, onChange, onBack }: SettingsPanelProps) {
  const toggles: Array<{ key: BooleanSettingKey; label: string }> = [
    { key: 'soundEnabled', label: 'Sound' },
    { key: 'reducedMotion', label: 'Reduced motion' },
    { key: 'touchControlsVisible', label: 'Show touch controls when available' },
    { key: 'screenShake', label: 'Screen shake on hits' },
    { key: 'showCenterLine', label: 'Show center line' },
  ]

  return (
    <Box sx={centerSx}>
      <Paper
        elevation={0}
        sx={{
          ...panelSx,
          width: 'min(520px, 100%)',
          maxHeight: 'min(90vh, 900px)',
          overflow: 'auto',
        }}
      >
        <Typography variant="h5" component="h2" sx={{ mb: '0.5rem', letterSpacing: '0.04em' }}>
          Settings
        </Typography>
        <Typography sx={{ mb: '1.25rem', color: 'text.secondary', fontSize: '0.92rem' }}>
          Preferences are saved on this device.
        </Typography>

        <Stack sx={{ mb: '1rem' }}>
          {toggles.map(({ key, label }) => (
            <FormControlLabel
              key={key}
              sx={{ minHeight: 44, ml: 0 }}
              control={
                <Checkbox
                  checked={settings[key]}
                  onChange={(e) => onChange({ [key]: e.target.checked })}
                />
              }
              label={label}
            />
          ))}
        </Stack>

        <SliderField
          id="ball-speed"
          label="Ball starting speed"
          value={settings.ballBaseSpeed}
          min={BALL_SPEED_MIN}
          max={BALL_SPEED_MAX}
          onChange={(v) => onChange({ ballBaseSpeed: v })}
        />
        <SliderField
          id="paddle-speed"
          label="Paddle speed"
          value={settings.paddleSpeed}
          min={PADDLE_SPEED_MIN}
          max={PADDLE_SPEED_MAX}
          onChange={(v) => onChange({ paddleSpeed: v })}
        />
        <SliderField
          id="accel"
          label="Ball acceleration"
          value={settings.ballAcceleration}
          min={ACCEL_MIN}
          max={ACCEL_MAX}
          onChange={(v) => onChange({ ballAcceleration: v })}
        />

        <Stack sx={{ mt: '1rem' }}>
          <Button variant="contained" color="primary" onClick={onBack}>
            Done
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
