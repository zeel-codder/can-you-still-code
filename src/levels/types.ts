export type Tier = 1 | 2 | 3
export type LevelType = 'write' | 'fix' | 'predict'

export interface TestCase {
  /** Arguments passed to the player's function. */
  args: unknown[]
  expected: unknown
}

export interface BannedPattern {
  pattern: RegExp
  message: string
}

interface BaseLevel {
  id: string
  tier: Tier
  title: string
  prompt: string
  parSeconds: number
  hints: string[]
}

export interface CodeLevel extends BaseLevel {
  type: 'write' | 'fix'
  fnName: string
  starterCode: string
  tests: TestCase[]
  banned?: BannedPattern[]
  /** Reference solution, used by the test suite to prove the level is solvable. */
  solution: string
}

export interface PredictLevel extends BaseLevel {
  type: 'predict'
  /** Read-only snippet the player has to run in their head. */
  snippet: string
  expectedOutput: string
}

/** A predict level whose values are generated per run, so the answer can't be memorised or shared. */
export interface PredictTemplate extends BaseLevel {
  type: 'predict'
  generate: (rand: () => number) => { snippet: string; expectedOutput: string }
}

/** What the pool holds: fixed code levels plus predict templates. */
export type PoolEntry = CodeLevel | PredictTemplate

/** What a run plays: code levels as-is, predict templates turned into concrete snippets. */
export type Level = CodeLevel | PredictLevel

export const TIER_NAMES: Record<Tier, string> = {
  1: 'Tutorial Island',
  2: 'AI Withdrawal',
  3: 'Senior or Pretender',
}
