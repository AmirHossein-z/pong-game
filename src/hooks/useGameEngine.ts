import { useCallback, useEffect, useRef, useState } from 'react'
import { GameEngine } from '../game/GameEngine'
import { buildKeyMap } from '../game/InputManager'
import type {
  EngineEvent,
  GameSettings,
  MatchState,
  MatchStatus,
  ScoreState,
  Side,
} from '../game/types'

export interface GameUiState {
  status: MatchStatus
  score: ScoreState
  countdown: number | null
  winner: Side | null
  announcement: string
}

const initialUi = (): GameUiState => ({
  status: 'countdown',
  score: { left: 0, right: 0 },
  countdown: 3,
  winner: null,
  announcement: '',
})

export function useGameEngine(settings: GameSettings, active: boolean) {
  const engineRef = useRef<GameEngine | null>(null)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const [ui, setUi] = useState<GameUiState>(() => initialUi())

  // Create engine once when becoming active
  useEffect(() => {
    if (!active) {
      engineRef.current?.dispose()
      engineRef.current = null
      return
    }

    const engine = new GameEngine(settingsRef.current)
    engineRef.current = engine

    const onEvent = (event: EngineEvent) => {
      setUi((prev) => {
        switch (event.type) {
          case 'score':
            return { ...prev, score: event.score }
          case 'countdown':
            return { ...prev, countdown: event.value }
          case 'status':
            return {
              ...prev,
              status: event.status,
              winner: event.status === 'over' ? prev.winner : event.status === 'countdown' || event.status === 'playing' ? null : prev.winner,
            }
          case 'gameOver':
            return {
              ...prev,
              status: 'over',
              winner: event.winner,
              score: event.score,
            }
          case 'announce':
            return { ...prev, announcement: event.message }
          default:
            return prev
        }
      })
    }

    engine.setEventHandler(onEvent)
    engine.input.setKeyMap(
      buildKeyMap({
        mode: settingsRef.current.mode,
        scheme: settingsRef.current.keyboardScheme,
        humanSide: settingsRef.current.humanSide,
      }),
    )

    setUi(initialUi())
    engine.start()

    return () => {
      engine.dispose()
      if (engineRef.current === engine) engineRef.current = null
    }
    // Only recreate when match session starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // Sync settings + key map while running
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !active) return
    engine.updateSettings(settings)
    engine.input.setKeyMap(
      buildKeyMap({
        mode: settings.mode,
        scheme: settings.keyboardScheme,
        humanSide: settings.humanSide,
      }),
    )
  }, [settings, active])

  const getMatchSnapshot = useCallback((): MatchState | null => {
    return engineRef.current?.getState() ?? null
  }, [])

  return { engineRef, ui, setUi, getMatchSnapshot }
}
