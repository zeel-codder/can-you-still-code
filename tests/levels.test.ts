import { describe, expect, it } from 'vitest'
import { POOL, TIERS, buildRun, getCodeLevel, nextSeed, type CodeLevel, type PredictLevel, type PredictTemplate } from '../src/levels'
import { seededRandom } from '../src/levels/random'
import { checkPrediction, evaluateCode, normalizeOutput } from '../src/engine/evaluate'

const codeLevels = POOL.filter((l): l is CodeLevel => l.type !== 'predict')
const templates = POOL.filter((l): l is PredictTemplate => l.type === 'predict')

/** Runs a snippet for real (timers and all) and returns what it logged. */
async function realOutput(snippet: string): Promise<string> {
  const logs: string[] = []
  new Function('console', snippet)({ log: (...args: unknown[]) => logs.push(args.join(' ')) })
  await new Promise((r) => setTimeout(r, 0))
  await new Promise((r) => setTimeout(r, 0))
  return logs.join('\n')
}

describe('pool', () => {
  it('has 10 problems with unique ids: 4 warm-ups, 3 fixes, 3 bosses', () => {
    expect(POOL).toHaveLength(10)
    expect(new Set(POOL.map((l) => l.id)).size).toBe(10)
    expect(TIERS.map((t) => POOL.filter((l) => l.tier === t).length)).toEqual([4, 3, 3])
    expect(POOL.filter((l) => l.tier === 1).every((l) => l.type === 'write')).toBe(true)
    expect(POOL.filter((l) => l.tier === 2).every((l) => l.type === 'fix')).toBe(true)
    expect(POOL.filter((l) => l.tier === 3).every((l) => l.type === 'predict')).toBe(true)
  })

  it.each(codeLevels.map((l) => [l.id, l] as const))('%s: reference solution passes every test', (_, level) => {
    const result = evaluateCode(level, level.solution)
    expect(result.error).toBeUndefined()
    expect(result.results.filter((r) => !r.passed)).toEqual([])
    expect(result.passed).toBe(true)
  })

  it.each(codeLevels.map((l) => [l.id, l] as const))('%s: starter code does not pass', (_, level) => {
    expect(evaluateCode(level, level.starterCode).passed).toBe(false)
  })

  it.each(templates.map((t) => [t.id, t] as const))('%s: expected output matches real JS for 300 random seeds', async (_, template) => {
    for (let seed = 1; seed <= 300; seed++) {
      const { snippet, expectedOutput } = template.generate(seededRandom(seed))
      expect(await realOutput(snippet), `seed ${seed}:\n${snippet}`).toBe(expectedOutput)
    }
  })

  it.each(templates.map((t) => [t.id, t] as const))('%s: values really change between runs', (_, template) => {
    const outputs = new Set(Array.from({ length: 30 }, (_, seed) => template.generate(seededRandom(seed)).expectedOutput))
    expect(outputs.size).toBeGreaterThan(10)
  })

  it('every problem has hints and a positive par time', () => {
    for (const level of POOL) {
      expect(level.hints.length).toBeGreaterThan(0)
      expect(level.parSeconds).toBeGreaterThan(0)
    }
  })
})

describe('buildRun', () => {
  it('plays one problem per tier, in tier order', () => {
    for (let seed = 0; seed < 50; seed++) expect(buildRun(seed).map((l) => l.tier)).toEqual([1, 2, 3])
  })

  it('is stable for a seed, so a refresh keeps the same problems and values', () => {
    expect(buildRun(1234)).toEqual(buildRun(1234))
  })

  it('reaches every problem in the pool across seeds', () => {
    const seen = new Set(Array.from({ length: 300 }, (_, seed) => buildRun(seed).map((l) => l.id)).flat())
    expect(seen).toEqual(new Set(POOL.map((l) => l.id)))
  })

  it('never repeats a problem from the previous run in any tier', () => {
    let seed = nextSeed()
    for (let i = 0; i < 200; i++) {
      const next = nextSeed(seed)
      const [before, after] = [buildRun(seed), buildRun(next)]
      after.forEach((level, tier) => expect(level.id).not.toBe(before[tier].id))
      seed = next
    }
  })

  it('turns the boss into a concrete snippet with an answer', () => {
    const boss = buildRun(7)[2] as PredictLevel
    expect(boss.snippet.length).toBeGreaterThan(0)
    expect(boss.expectedOutput.length).toBeGreaterThan(0)
    expect(checkPrediction(boss, boss.expectedOutput)).toBe(true)
  })

  it('fits in about 10 minutes of par time for any run', () => {
    for (let seed = 0; seed < 100; seed++) {
      expect(buildRun(seed).reduce((sum, l) => sum + l.parSeconds, 0)).toBeLessThanOrEqual(10 * 60)
    }
  })
})

describe('evaluateCode', () => {
  const fizz = getCodeLevel('fizzbuzz')

  it('rejects banned built-ins', () => {
    const max = evaluateCode(getCodeLevel('fix-find-max'), 'function findMax(n) { return Math.max(...n) }')
    expect(max.passed).toBe(false)
    expect(max.error).toMatch(/off-limits/)
  })

  it('reports syntax errors, missing functions and runtime errors', () => {
    expect(evaluateCode(fizz, 'function fizzBuzz(n) {').error).toMatch(/SyntaxError/)
    expect(evaluateCode(fizz, 'function total(n) { return [] }').error).toMatch(/Couldn't find a function named `fizzBuzz`/)
    const crash = evaluateCode(fizz, 'function fizzBuzz(n) { return n.foo.bar }')
    expect(crash.passed).toBe(false)
    expect(crash.results[0].error).toMatch(/TypeError/)
  })

  it('explains a missing return instead of just showing undefined', () => {
    const r = evaluateCode(fizz, 'function fizzBuzz(n) { for (let i = 1; i <= n; i++) console.log(i) }')
    expect(r.passed).toBe(false)
    expect(r.error).toMatch(/forget to `return`/)
  })

  it('still bans the loop-replacing shortcuts', () => {
    expect(evaluateCode(getCodeLevel('fix-find-max'), 'function findMax(n) { return Math.max.apply(null, n) }').error).toMatch(/off-limits/)
  })

  it('captures console.log output', () => {
    expect(evaluateCode(fizz, 'function fizzBuzz(n) { console.log("hi", n); return [] }').logs[0]).toBe('hi 1')
  })

  it('does not let one run mutate test inputs for the next', () => {
    const max = getCodeLevel('fix-find-max')
    evaluateCode(max, 'function findMax(nums) { nums.push(1000); return 0 }')
    expect(evaluateCode(max, max.solution).passed).toBe(true)
  })

  it('throws for unknown or non-code level ids', () => {
    expect(() => getCodeLevel('nope')).toThrow()
    expect(() => getCodeLevel('predict-event-loop')).toThrow()
  })
})

describe('normalizeOutput', () => {
  it('ignores extra whitespace and blank lines', () => {
    expect(normalizeOutput('  var   3 \n\nvar 3\n')).toBe('var 3 var 3')
  })
})
