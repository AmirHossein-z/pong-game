import { createTheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

/**
 * MUI theme built from the original CSS-variable palette in styles/global.css.
 * Colors are kept identical; only the component library changed.
 */

const colors = {
  bgDeep: '#060a12',
  bgPanel: '#0f172a',
  court: '#0b1220',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  accent: '#5eead4',
  accent2: '#f472b6',
  accent3: '#7dd3fc',
  danger: '#fb7185',
  border: 'rgba(148, 163, 184, 0.22)',
  glow: 'rgba(94, 234, 212, 0.35)',
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: colors.accent },
    secondary: { main: colors.accent2 },
    info: { main: colors.accent3 },
    error: { main: colors.danger },
    background: { default: colors.bgDeep, paper: colors.bgPanel },
    text: { primary: colors.text, secondary: colors.textMuted },
    divider: colors.border,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 600, fontSize: '1rem' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 12,
          padding: '0.75rem 1.1rem',
        },
      },
      variants: [
        {
          // Old .btnPrimary: teal→sky gradient
          props: { variant: 'contained', color: 'primary' },
          style: {
            border: '1px solid rgba(94, 234, 212, 0.55)',
            background:
              'linear-gradient(135deg, rgba(94, 234, 212, 0.25), rgba(125, 211, 252, 0.15))',
            color: '#ecfeff',
            '&:hover': {
              background:
                'linear-gradient(135deg, rgba(94, 234, 212, 0.35), rgba(125, 211, 252, 0.22))',
            },
          },
        },
        {
          // Old .btn: neutral filled slate
          props: { variant: 'contained', color: 'inherit' },
          style: {
            border: `1px solid ${colors.border}`,
            background: 'rgba(30, 41, 59, 0.85)',
            color: colors.text,
            '&:hover': {
              background: 'rgba(51, 65, 85, 0.9)',
              borderColor: 'rgba(94, 234, 212, 0.4)',
            },
          },
        },
        {
          // Old .btnGhost: transparent outline
          props: { variant: 'outlined', color: 'inherit' },
          style: {
            border: `1px solid ${colors.border}`,
            color: colors.text,
            '&:hover': {
              background: 'rgba(51, 65, 85, 0.4)',
              borderColor: 'rgba(94, 234, 212, 0.4)',
            },
          },
        },
        {
          // Old .btnDanger
          props: { variant: 'outlined', color: 'error' },
          style: {
            border: '1px solid rgba(251, 113, 133, 0.45)',
            background: 'rgba(30, 41, 59, 0.85)',
            color: '#fecdd3',
            '&:hover': {
              background: 'rgba(51, 65, 85, 0.9)',
              borderColor: 'rgba(251, 113, 133, 0.7)',
            },
          },
        },
      ],
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 10,
          border: `1px solid ${colors.border}`,
          background: colors.court,
          color: colors.text,
          textTransform: 'none',
          fontSize: '1rem',
          '&.Mui-selected': {
            borderColor: 'rgba(94, 234, 212, 0.65)',
            background: 'rgba(94, 234, 212, 0.15)',
            color: '#ecfeff',
            '&:hover': {
              background: 'rgba(94, 234, 212, 0.22)',
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: colors.court,
          borderRadius: 10,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.border,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: colors.bgPanel,
          border: `1px solid ${colors.border}`,
          borderRadius: 14,
          backgroundImage: 'none',
        },
      },
    },
  },
})

/** Shared look of the old .panel class (menus and settings). */
export const panelSx: SxProps<Theme> = {
  width: 'min(440px, 100%)',
  background:
    'linear-gradient(180deg, rgba(17, 24, 39, 0.92), rgba(15, 23, 42, 0.88))',
  border: `1px solid ${colors.border}`,
  borderRadius: '14px',
  p: '1.75rem 1.5rem',
  boxShadow:
    '0 0 0 1px rgba(94, 234, 212, 0.05), 0 20px 50px rgba(0, 0, 0, 0.45)',
  backdropFilter: 'blur(8px)',
}

/** Card floating over the court during pause / game over (old .overlayCard). */
export const overlayCardSx: SxProps<Theme> = {
  pointerEvents: 'auto',
  textAlign: 'center',
  p: '1.25rem 1.5rem',
  borderRadius: '14px',
  background: 'rgba(6, 10, 18, 0.82)',
  border: `1px solid ${colors.border}`,
  backdropFilter: 'blur(6px)',
  maxWidth: 'min(360px, 92%)',
}

export const overlayTitleSx: SxProps<Theme> = {
  mb: '0.5rem',
  fontSize: 'clamp(1.4rem, 4vw, 2rem)',
  letterSpacing: '0.08em',
  color: 'primary.main',
}

export const overlayTextSx: SxProps<Theme> = {
  mb: '1rem',
  color: 'text.secondary',
}

/** Centers a panel in the remaining space (old .center class). */
export const centerSx: SxProps<Theme> = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export { colors }
