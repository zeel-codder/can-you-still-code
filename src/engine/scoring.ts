import type { Level } from '../levels/types'
import { RANKS, type Rank } from '../data/roasts'

export type LevelStatus = 'unplayed' | 'passed' | 'skipped'

export interface LevelStat {
  status: LevelStatus
  seconds: number
  hintsUsed: number
  failedRuns: number
  tabSwitches: number
  pasteAttempts: number
}

export const emptyStat = (): LevelStat => ({
  status: 'unplayed',
  seconds: 0,
  hintsUsed: 0,
  failedRuns: 0,
  tabSwitches: 0,
  pasteAttempts: 0,
})

export const BASE_POINTS = 80
export const MAX_SPEED_BONUS = 20
export const HINT_PENALTY = 10
export const FAILED_RUN_PENALTY = 3
export const MAX_FAILED_RUN_PENALTY = 15
export const TAB_SWITCH_PENALTY = 5

/** Full bonus at or under par, sliding to 0 at 3× par. */
export function speedBonus(seconds: number, parSeconds: number): number {
  if (seconds <= parSeconds) return MAX_SPEED_BONUS
  if (seconds >= parSeconds * 3) return 0
  return Math.round((MAX_SPEED_BONUS * (parSeconds * 3 - seconds)) / (parSeconds * 2))
}

export interface ScoreLine {
  label: string
  points: number
}

/** Itemised score for a level, as if it were solved right now. Drives the live scoreboard. */
export function scoreBreakdown(stat: LevelStat, parSeconds: number): { lines: ScoreLine[]; total: number } {
  const lines: ScoreLine[] = [
    { label: 'Showing up', points: BASE_POINTS },
    { label: 'Speed bonus', points: speedBonus(stat.seconds, parSeconds) },
  ]
  if (stat.hintsUsed) lines.push({ label: `Hints used ×${stat.hintsUsed}`, points: -stat.hintsUsed * HINT_PENALTY })
  if (stat.failedRuns)
    lines.push({
      label: `Failed runs ×${stat.failedRuns}`,
      points: -Math.min(stat.failedRuns * FAILED_RUN_PENALTY, MAX_FAILED_RUN_PENALTY),
    })
  if (stat.tabSwitches) lines.push({ label: `Left the tab ×${stat.tabSwitches}`, points: -stat.tabSwitches * TAB_SWITCH_PENALTY })
  if (stat.pasteAttempts) lines.push({ label: `Paste attempts ×${stat.pasteAttempts} (no penalty)`, points: 0 })
  const sum = lines.reduce((t, l) => t + l.points, 0)
  return { lines, total: Math.max(0, Math.min(100, sum)) }
}

export function levelScore(stat: LevelStat, parSeconds: number): number {
  return stat.status === 'passed' ? scoreBreakdown(stat, parSeconds).total : 0
}

export function finalScore(stats: LevelStat[], levels: Level[]): number {
  const total = levels.reduce((sum, level, i) => sum + levelScore(stats[i] ?? emptyStat(), level.parSeconds), 0)
  // Round down so a 100 only ever means a flawless run.
  return Math.floor(total / levels.length)
}

export function getRank(score: number): Rank {
  return RANKS.find((r) => score >= r.min) ?? RANKS[RANKS.length - 1]
}

export type Square = 'green' | 'yellow' | 'red' | 'gray'

export function squareFor(stat: LevelStat): Square {
  if (stat.status === 'passed') return stat.hintsUsed === 0 && stat.failedRuns === 0 ? 'green' : 'yellow'
  if (stat.status === 'skipped') return 'red'
  return 'gray'
}

export const SQUARE_EMOJI: Record<Square, string> = { green: '🟩', yellow: '🟨', red: '🟥', gray: '⬛' }

export interface Totals {
  cleared: number
  hints: number
  failedRuns: number
  tabSwitches: number
  pasteAttempts: number
  seconds: number
}

export function totals(stats: LevelStat[]): Totals {
  return stats.reduce<Totals>(
    (t, s) => ({
      cleared: t.cleared + (s.status === 'passed' ? 1 : 0),
      hints: t.hints + s.hintsUsed,
      failedRuns: t.failedRuns + s.failedRuns,
      tabSwitches: t.tabSwitches + s.tabSwitches,
      pasteAttempts: t.pasteAttempts + s.pasteAttempts,
      seconds: t.seconds + s.seconds,
    }),
    { cleared: 0, hints: 0, failedRuns: 0, tabSwitches: 0, pasteAttempts: 0, seconds: 0 },
  )
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
