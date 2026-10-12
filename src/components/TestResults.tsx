import type { RunResult } from '../engine/evaluate'

export default function TestResults({ result, verdict }: { result: RunResult; verdict: string }) {
  const passing = result.results.filter((r) => r.passed).length
  return (
    <div className="space-y-2 text-sm">
      {!result.passed && (
        <div className="animate-fade-up font-bold text-red-300">
          {result.results.length > 0 && `${passing}/${result.results.length} passing. `}
          {verdict}
        </div>
      )}
      {result.error && (
        <div className="animate-fade-up rounded-lg border border-red-900 bg-red-950/50 p-3 whitespace-pre-wrap text-red-300">
          {result.error}
        </div>
      )}
      {result.results.map((r, i) => (
        <div
          key={i}
          style={{ animationDelay: `${i * 70}ms` }}
          className={`animate-fade-up rounded-lg border p-2 ${r.passed ? 'border-emerald-900 bg-emerald-950/30' : 'border-red-900 bg-red-950/30'}`}
        >
          <div className="break-all">
            {r.passed ? '✅' : '❌'} <span className="text-zinc-300">{r.label}</span>
          </div>
          {!r.passed && (
            <div className="mt-1 pl-6 text-xs break-all text-zinc-400">
              expected <span className="text-emerald-300">{r.expected}</span>, got{' '}
              <span className="text-red-300">{r.actual}</span>
              {r.error && <div className="text-red-300">{r.error}</div>}
            </div>
          )}
        </div>
      ))}
      {result.logs.length > 0 && (
        <div className="animate-fade-up">
          <div className="mb-1 text-xs text-zinc-500">console.log</div>
          <pre className="max-h-40 overflow-auto rounded-lg bg-zinc-900 p-2 text-xs text-zinc-300">{result.logs.join('\n')}</pre>
        </div>
      )}
    </div>
  )
}
