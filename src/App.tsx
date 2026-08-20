import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { GameScreen } from './components/GameScreen'
import { MainMenu } from './components/MainMenu'
import { ModeSelection } from './components/ModeSelection'
import { SettingsPanel } from './components/SettingsPanel'
import { getAudioManager } from './game/AudioManager'
import { useLocalStorageSettings } from './hooks/useLocalStorageSettings'
import { enterFullscreen, exitFullscreen } from './utils/fullscreen'
import type { AppScreen } from './game/types'

export default function App() {
  const { settings, setSettings } = useLocalStorageSettings()
  const [screen, setScreen] = useState<AppScreen>('menu')
  const [settingsReturn, setSettingsReturn] = useState<AppScreen>('menu')

  useEffect(() => {
    getAudioManager().setEnabled(settings.soundEnabled)
  }, [settings.soundEnabled])

  const unlockAudio = () => {
    const audio = getAudioManager()
    audio.setEnabled(settings.soundEnabled)
    void audio.unlock()
  }

  const playUi = () => {
    unlockAudio()
    if (settings.soundEnabled) getAudioManager().play('ui')
  }

  return (
    <Box
      sx={{
        minHeight: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding:
          'calc(1rem + var(--safe-top)) calc(1rem + var(--safe-right)) calc(1rem + var(--safe-bottom)) calc(1rem + var(--safe-left))',
        '@media (orientation: landscape) and (max-height: 480px)': {
          padding:
            'calc(0.25rem + var(--safe-top)) calc(0.5rem + var(--safe-right)) calc(0.25rem + var(--safe-bottom)) calc(0.5rem + var(--safe-left))',
        },
      }}
      onPointerDown={unlockAudio}
      onKeyDown={unlockAudio}
    >
      {screen === 'menu' && (
        <MainMenu
          onPlay={() => {
            playUi()
            setScreen('mode')
          }}
          onSettings={() => {
            playUi()
            setSettingsReturn('menu')
            setScreen('settings')
          }}
        />
      )}

      {screen === 'mode' && (
        <ModeSelection
          settings={settings}
          onChange={(partial) => setSettings(partial)}
          onBack={() => {
            playUi()
            setScreen('menu')
          }}
          onStart={() => {
            unlockAudio()
            // Must run inside the tap gesture for the browser to allow it.
            if (window.matchMedia('(pointer: coarse)').matches) {
              void enterFullscreen()
            }
            setScreen('playing')
          }}
          onOpenSettings={() => {
            playUi()
            setSettingsReturn('mode')
            setScreen('settings')
          }}
        />
      )}

      {screen === 'settings' && (
        <SettingsPanel
          settings={settings}
          onChange={(partial) => {
            setSettings(partial)
            if (partial.soundEnabled === true) {
              void getAudioManager().unlock()
              getAudioManager().setEnabled(true)
              getAudioManager().play('ui')
            }
          }}
          onBack={() => {
            playUi()
            setScreen(settingsReturn)
          }}
        />
      )}

      {screen === 'playing' && (
        <GameScreen
          settings={settings}
          onExitToMenu={() => {
            exitFullscreen()
            setScreen('menu')
          }}
        />
      )}
    </Box>
  )
}
