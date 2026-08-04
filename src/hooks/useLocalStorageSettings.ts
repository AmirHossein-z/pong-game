import { useCallback, useEffect, useState } from 'react'
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../store/settings'
import type { GameSettings } from '../game/types'

export function useLocalStorageSettings() {
  const [settings, setSettingsState] = useState<GameSettings>(() => loadSettings())

  useEffect(() => {
    // Respect OS reduced motion on first load if user hasn't customized —
    // only apply when still at default false and OS prefers reduced
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      settings.reducedMotion === DEFAULT_SETTINGS.reducedMotion &&
      !sessionStorage.getItem('pong-motion-checked')
    ) {
      try {
        sessionStorage.setItem('pong-motion-checked', '1')
      } catch {
        // ignore
      }
      setSettingsState((s) => {
        const next = { ...s, reducedMotion: true }
        saveSettings(next)
        return next
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setSettings = useCallback((update: Partial<GameSettings> | ((prev: GameSettings) => GameSettings)) => {
    setSettingsState((prev) => {
      const next = typeof update === 'function' ? update(prev) : { ...prev, ...update }
      saveSettings(next)
      return next
    })
  }, [])

  return { settings, setSettings }
}
