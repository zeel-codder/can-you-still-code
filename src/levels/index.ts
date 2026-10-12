import { WRITE_LEVELS } from './write'
import { FIX_LEVELS } from './fix'
import { PREDICT_TEMPLATES } from './predict'
import { newSeed, pickOne, seededRandom } from './random'
import type { CodeLevel, Level, PoolEntry, Tier } from './types'

/** Every problem in the game. Each run plays one per tier, picked at random. */
export const POOL: PoolEntry[] = [...WRITE_LEVELS, ...FIX_LEVELS, ...PREDICT_TEMPLATES]
export const TIERS: Tier[] = [1, 2, 3]

/** The 3 levels for a run. Same seed, same levels and values, so a refresh changes nothing. */
export function buildRun(seed: number): Level[] {
  const rand = seededRandom(seed)
  return TIERS.map((tier) => {
    const entry = pickOne(
      rand,
      POOL.filter((e) => e.tier === tier),
    )
    if (entry.type !== 'predict') return entry
    const { generate, ...rest } = entry
    return { ...rest, ...generate(rand) }
  })
}

/**
 * A seed for the next run. After a previous run, it keeps rolling until every tier gets a different
 * problem, so "Run it back" never repeats one (about 3 rolls on average, each just a few array picks).
 */
export function nextSeed(previousSeed?: number): number {
  if (previousSeed === undefined) return newSeed()
  const before = buildRun(previousSeed).map((l) => l.id)
  let seed: number
  do seed = newSeed()
  while (buildRun(seed).some((l, i) => l.id === before[i]))
  return seed
}

/** Looks up a write/fix level by id (the code runner only ever needs these). */
export function getCodeLevel(id: string): CodeLevel {
  const level = POOL.find((l): l is CodeLevel => l.id === id && l.type !== 'predict')
  if (!level) throw new Error(`Unknown code level: ${id}`)
  return level
}

export * from './types'
