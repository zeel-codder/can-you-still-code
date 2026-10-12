import type { CodeLevel, PredictLevel } from '../levels/types'

export interface TestResult {
  label: string
  passed: boolean
  expected: string
  actual: string
  error?: string
}

export interface RunResult {
  passed: boolean
  results: TestResult[]
  logs: string[]
  error?: string
}

const MAX_LOGS = 50

export function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (typeof value === 'number' && Number.isNaN(value)) return 'NaN'
  if (typeof value === 'function') return '[Function]'
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a === 'number' && typeof b === 'number') return a === b
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => deepEqual(x, b[i]))
  }
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const ka = Object.keys(a)
    const kb = Object.keys(b)
    return ka.length === kb.length && ka.every((k) => deepEqual((a as never)[k], (b as never)[k]))
  }
  return false
}

function fail(error: string, logs: string[] = []): RunResult {
  return { passed: false, results: [], logs, error }
}

export function evaluateCode(level: CodeLevel, code: string): RunResult {
  for (const { pattern, message } of level.banned ?? []) {
    if (pattern.test(code)) return fail(`🚫 ${message}`)
  }

  const logs: string[] = []
  const fakeConsole = {
    log: (...args: unknown[]) => {
      if (logs.length < MAX_LOGS) logs.push(args.map((a) => (typeof a === 'string' ? a : formatValue(a))).join(' '))
    },
  }
  Object.assign(fakeConsole, { info: fakeConsole.log, warn: fakeConsole.log, error: fakeConsole.log })

  // `export function …` is a habit from real projects; it isn't valid inside the runner, so drop the keyword.
  const runnable = code.replace(/^(\s*)export\s+(default\s+)?(?=(async\s+)?function\b|const\b|let\b|var\b|class\b)/gm, '$1')

  let fn: unknown
  try {
    const factory = new Function(
      'console',
      `${runnable}\n;return typeof ${level.fnName} === 'function' ? ${level.fnName} : undefined;`,
    )
    fn = factory(fakeConsole)
  } catch (e) {
    return fail(`${(e as Error).name}: ${(e as Error).message}`, logs)
  }
  if (typeof fn !== 'function') {
    return fail(`Couldn't find a function named \`${level.fnName}\`. Did you rename it?`, logs)
  }

  const results: TestResult[] = level.tests.map((test) => {
    const args = structuredClone(test.args)
    const label = `${level.fnName}(${args.map(formatValue).join(', ')})`
    const expected = formatValue(test.expected)
    try {
      const actualValue = (fn as (...a: unknown[]) => unknown)(...args)
      return { label, passed: deepEqual(actualValue, test.expected), expected, actual: formatValue(actualValue) }
    } catch (e) {
      return { label, passed: false, expected, actual: '💥', error: `${(e as Error).name}: ${(e as Error).message}` }
    }
  })

  const passed = results.every((r) => r.passed)
  // Printing the answer instead of returning it is the most common "but my code is right!" moment.
  const forgotReturn = !passed && results.every((r) => r.actual === 'undefined')
  return {
    passed,
    results,
    logs,
    error: forgotReturn
      ? `🤔 \`${level.fnName}\` returned undefined. Did you forget to \`return\` the result? (console.log doesn't count.)`
      : undefined,
  }
}

/**
 * Turns a predicted output into a plain sequence of tokens, so one-per-line, space- or comma-separated
 * and quoted answers all count, as long as the values and their order are right.
 */
export function normalizeOutput(text: string): string {
  return text
    .split(/[\s,]+/)
    .map((token) => token.replace(/^['"`]+|['"`]+$/g, ''))
    .filter(Boolean)
    .join(' ')
}

export function checkPrediction(level: PredictLevel, answer: string): boolean {
  return normalizeOutput(answer) === normalizeOutput(level.expectedOutput)
}
