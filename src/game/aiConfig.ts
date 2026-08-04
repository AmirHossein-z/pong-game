import type { AiDifficultyConfig, Difficulty } from './types'
import { DEFAULT_PADDLE_SPEED } from './constants'

export const AI_CONFIG: Record<Difficulty, AiDifficultyConfig> = {
  easy: {
    reactionTime: 0.32,
    maxSpeed: DEFAULT_PADDLE_SPEED * 0.55,
    predictionError: 55,
    mistakeChance: 0.18,
    usePrediction: false,
    wallBounces: 0,
  },
  medium: {
    reactionTime: 0.18,
    maxSpeed: DEFAULT_PADDLE_SPEED * 0.82,
    predictionError: 28,
    mistakeChance: 0.08,
    usePrediction: true,
    wallBounces: 1,
  },
  hard: {
    reactionTime: 0.08,
    maxSpeed: DEFAULT_PADDLE_SPEED * 0.98,
    predictionError: 10,
    mistakeChance: 0.025,
    usePrediction: true,
    wallBounces: 4,
  },
}
