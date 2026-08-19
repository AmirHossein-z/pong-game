import Typography from '@mui/material/Typography'

interface CountdownOverlayProps {
  value: number | null
}

export function CountdownOverlay({ value }: CountdownOverlayProps) {
  if (value == null || value <= 0) return null
  return (
    <Typography
      aria-live="polite"
      sx={{
        fontSize: 'clamp(3rem, 12vw, 5rem)',
        fontWeight: 800,
        color: 'info.main',
        textShadow: '0 0 30px rgba(125, 211, 252, 0.45)',
      }}
    >
      {value}
    </Typography>
  )
}
