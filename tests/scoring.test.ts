import { describe, expect, it } from 'vitest'
import { RANKS, bonusStats, statRoasts } from '../src/data/roasts'
import { buildRun } from '../src/levels'

const LEVELS = buildRun(42)
import { emptyStat, finalScore, getRank, levelScore, scoreBreakdown, speedBonus, squareFor, totals, type LevelStat } from '../src/engine/scoring'

const passed = (patch: Partial<LevelStat> = {}): LevelStat => ({ ...emptyStat(), status: 'passed', ...patch })

describe('speedBonus', () => {
  it('gives full bonus at or under par and slides to 0 at 3x par', () => {
    expect(speedBonus(30, 60)).toBe(20)
    expect(speedBonus(60, 60)).toBe(20)
    expect(speedBonus(120, 60)).toBe(10)
    expect(speedBonus(180, 60)).toBe(0)
    expect(speedBonus(999, 60)).toBe(0)
  })
})

describe('levelScore', () => {
  it('is 100 for a fast, clean pass', () => {
    expect(levelScore(passed({ seconds: 10 }), 60)).toBe(100)
  })

  it('is 0 for skipped or unplayed levels', () => {
    expect(levelScore({ ...emptyStat(), status: 'skipped' }, 60)).toBe(0)
    expect(levelScore(emptyStat(), 60)).toBe(0)
  })

  it('applies hint, failed-run (capped) and tab-switch penalties', () => {
    expect(levelScore(passed({ hintsUsed: 2 }), 60)).toBe(80)
    expect(levelScore(passed({ failedRuns: 2 }), 60)).toBe(94)
    expect(levelScore(passed({ failedRuns: 50 }), 60)).toBe(85)
    expect(levelScore(passed({ tabSwitches: 3 }), 60)).toBe(85)
  })

  it('never goes below 0', () => {
    expect(levelScore(passed({ hintsUsed: 2, failedRuns: 9, tabSwitches: 20, seconds: 999 }), 60)).toBe(0)
  })
})

describe('scoreBreakdown', () => {
  it('itemises every penalty and matches levelScore once passed', () => {
    const stat = passed({ seconds: 120, hintsUsed: 1, failedRuns: 2, tabSwitches: 1, pasteAttempts: 3 })
    const { lines, total } = scoreBreakdown(stat, 60)
    expect(lines.map((l) => l.points)).toEqual([80, 10, -10, -6, -5, 0])
    expect(total).toBe(69)
    expect(levelScore(stat, 60)).toBe(total)
  })

  it('only lists base and speed for a clean run', () => {
    expect(scoreBreakdown(emptyStat(), 60).lines).toHaveLength(2)
  })
})

describe('finalScore and ranks', () => {
  it('averages across all levels', () => {
    expect(finalScore(LEVELS.map(() => passed()), LEVELS)).toBe(100)
    expect(finalScore(LEVELS.map(emptyStat), LEVELS)).toBe(0)
    const oneOfThree = LEVELS.map((_, i) => (i === 0 ? passed() : emptyStat()))
    expect(finalScore(oneOfThree, LEVELS)).toBe(33)
  })

  it('rounds down, so 100 only means flawless', () => {
    const almost = LEVELS.map((_, i) => (i === 0 ? passed({ failedRuns: 1 }) : passed()))
    expect(finalScore(almost, LEVELS)).toBe(99)
  })

  it('maps scores to ranks at the boundaries', () => {
    expect(getRank(100).title).toBe('Built Different')
    expect(getRank(90).title).toBe('Built Different')
    expect(getRank(89).title).toBe('Still Got Rizz')
    expect(getRank(70).title).toBe('Still Got Rizz')
    expect(getRank(69).title).toBe('Shaking Off Rust')
    expect(getRank(50).title).toBe('Shaking Off Rust')
    expect(getRank(49).title).toBe('Autocomplete Enjoyer')
    expect(getRank(25).title).toBe('Autocomplete Enjoyer')
    expect(getRank(24).title).toBe('Rebooting…')
    expect(getRank(0).title).toBe('Rebooting…')
  })
})

describe('squares and totals', () => {
  it('colors levels Wordle-style', () => {
    expect(squareFor(passed())).toBe('green')
    expect(squareFor(passed({ hintsUsed: 1 }))).toBe('yellow')
    expect(squareFor(passed({ failedRuns: 1 }))).toBe('yellow')
    expect(squareFor({ ...emptyStat(), status: 'skipped' })).toBe('red')
    expect(squareFor(emptyStat())).toBe('gray')
  })

  it('sums stats', () => {
    const t = totals([passed({ hintsUsed: 1, seconds: 30 }), { ...emptyStat(), status: 'skipped', tabSwitches: 2, pasteAttempts: 3 }])
    expect(t).toEqual({ cleared: 1, hints: 1, failedRuns: 0, tabSwitches: 2, pasteAttempts: 3, seconds: 30 })
  })
})

describe('results copy', () => {
  it('gives every rank a few roasts to pick from', () => {
    for (const rank of RANKS) expect(rank.roasts.length).toBeGreaterThanOrEqual(3)
  })

  it('picks stat lines from what actually happened', () => {
    const base = { cleared: 3, hints: 0, failedRuns: 0, tabSwitches: 0, pasteAttempts: 0, seconds: 60 }
    expect(statRoasts(base, 3, 300)).toEqual(['Every level, zero hints. Are you sure you’re not an AI? 🤨', 'Speedrun energy. Did you even read the prompts? ⚡'])
    expect(statRoasts({ ...base, tabSwitches: 1, seconds: 200 }, 3, 300)[0]).toMatch(/once.*snack break/)
    expect(statRoasts({ ...base, cleared: 0, seconds: 10 }, 3, 300)).toEqual(['No levels cleared. FizzBuzz remains undefeated… for now. 🥊'])
  })

  it('bonus stats always claim zero prompts', () => {
    expect(bonusStats(totals([]))).toContain('🤖 prompts written: 0')
  })
})
