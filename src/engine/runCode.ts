import type { RunResult } from './evaluate'
import { TIMEOUT_LINE } from '../data/roasts'

export const RUN_TIMEOUT_MS = 2000

/** Runs the player's code in a fresh Web Worker so an infinite loop can be killed. */
export function runCode(levelId: string, code: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' })
    const finish = (result: RunResult) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(result)
    }
    const timer = setTimeout(
      () =>
        finish({
          passed: false,
          results: [],
          logs: [],
          error: TIMEOUT_LINE,
        }),
      RUN_TIMEOUT_MS,
    )
    worker.onmessage = (e: MessageEvent<RunResult>) => finish(e.data)
    worker.onerror = (e) => {
      e.preventDefault()
      finish({ passed: false, results: [], logs: [], error: e.message || 'The worker crashed.' })
    }
    worker.postMessage({ levelId, code })
  })
}
