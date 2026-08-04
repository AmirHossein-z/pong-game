import styles from '../App.module.css'
import type { Difficulty, GameMode, GameSettings, KeyboardScheme, Side, WinningScore } from '../game/types'

interface ModeSelectionProps {
  settings: GameSettings
  onChange: (partial: Partial<GameSettings>) => void
  onBack: () => void
  onStart: () => void
  onOpenSettings: () => void
}

export function ModeSelection({
  settings,
  onChange,
  onBack,
  onStart,
  onOpenSettings,
}: ModeSelectionProps) {
  return (
    <div className={styles.center}>
      <div className={styles.panel}>
        <h2 className={styles.title}>Choose mode</h2>
        <p className={styles.subtitle}>Pick how you want to play, then start the match.</p>

        <div className={styles.field}>
          <span id="mode-label">Game mode</span>
          <div className={styles.segment} role="group" aria-labelledby="mode-label">
            <button
              type="button"
              aria-pressed={settings.mode === 'onePlayer'}
              onClick={() => onChange({ mode: 'onePlayer' satisfies GameMode })}
            >
              1 Player
            </button>
            <button
              type="button"
              aria-pressed={settings.mode === 'twoPlayer'}
              onClick={() => onChange({ mode: 'twoPlayer' })}
            >
              2 Players
            </button>
          </div>
        </div>

        {settings.mode === 'onePlayer' && (
          <>
            <div className={styles.field}>
              <span id="diff-label">Computer difficulty</span>
              <div className={styles.segment} role="group" aria-labelledby="diff-label">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={settings.difficulty === d}
                    onClick={() => onChange({ difficulty: d })}
                  >
                    {d[0]!.toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <span id="scheme-label">Your keyboard</span>
              <div className={styles.segment} role="group" aria-labelledby="scheme-label">
                <button
                  type="button"
                  aria-pressed={settings.keyboardScheme === 'arrows'}
                  onClick={() => onChange({ keyboardScheme: 'arrows' satisfies KeyboardScheme })}
                >
                  ↑ ↓
                </button>
                <button
                  type="button"
                  aria-pressed={settings.keyboardScheme === 'wasd'}
                  onClick={() => onChange({ keyboardScheme: 'wasd' })}
                >
                  W S
                </button>
              </div>
            </div>

            <div className={styles.field}>
              <span id="side-label">Your side</span>
              <div className={styles.segment} role="group" aria-labelledby="side-label">
                <button
                  type="button"
                  aria-pressed={settings.humanSide === 'left'}
                  onClick={() => onChange({ humanSide: 'left' satisfies Side })}
                >
                  Left
                </button>
                <button
                  type="button"
                  aria-pressed={settings.humanSide === 'right'}
                  onClick={() => onChange({ humanSide: 'right' })}
                >
                  Right
                </button>
              </div>
            </div>
          </>
        )}

        <div className={styles.field}>
          <label htmlFor="winning-score">Winning score</label>
          <select
            id="winning-score"
            value={String(settings.winningScore)}
            onChange={(e) => {
              const v = e.target.value
              const winningScore = (v === 'endless' ? 'endless' : Number(v)) as WinningScore
              onChange({ winningScore })
            }}
          >
            <option value="5">5</option>
            <option value="7">7</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="endless">Endless</option>
          </select>
        </div>

        {settings.mode === 'twoPlayer' && (
          <div className={styles.hint}>
            Desktop: Left player uses W/S, Right player uses Arrow keys. On touch devices, each
            side gets Up/Down buttons — landscape works best.
          </div>
        )}

        <div className={styles.stack} style={{ marginTop: '1.25rem' }}>
          <button type="button" className={styles.btnPrimary} onClick={onStart}>
            Start match
          </button>
          <button type="button" className={styles.btn} onClick={onOpenSettings}>
            More settings
          </button>
          <button type="button" className={styles.btnGhost} onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
