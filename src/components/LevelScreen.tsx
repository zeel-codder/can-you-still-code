import { useEffect, useRef, useState } from 'react'
import { TIER_NAMES, type Level } from '../levels'
import { runCode } from '../engine/runCode'
import { checkPrediction, type RunResult } from '../engine/evaluate'
import { formatTime, levelScore, HINT_PENALTY, type LevelStat } from '../engine/scoring'
import { useTicker, useWindowLeave } from '../engine/tracking'
import { FAIL_LINES, LEAVE_ROASTS, PASS_LINES, PASTE_ROASTS, WRONG_PREDICT_LINES, pick } from '../data/roasts'
import { celebrate, isMac } from './effects'
import Editor from './Editor'
import Prompt from './Prompt'
import ProgressSquares from './ProgressSquares'
import TestResults from './TestResults'
import ScoreBoard from './ScoreBoard'

interface Props {
  levels: Level[]
  level: Level
  index: number
  stats: LevelStat[]
  code: string | undefined
  onCodeChange: (value: string) => void
  onStat: (patch: (s: LevelStat) => Partial<LevelStat>) => void
  onNext: () => void
  onSkip: () => void
  onGiveUp: () => void
}

const TYPE_BADGE = {
  write: { label: 'WRITE IT', className: 'bg-sky-900 text-sky-200' },
  fix: { label: "FIX THE AI'S MESS", className: 'bg-fuchsia-900 text-fuchsia-200' },
  predict: { label: 'PREDICT THE OUTPUT', className: 'bg-amber-900 text-amber-200' },
}

const RUN_KEY = isMac ? '⌘↵' : 'Ctrl+↵'
/** How long the paste / tab-switch pop-up stays on screen. */
const TOAST_MS = 5000

export default function LevelScreen({ levels, level, index, stats, code, onCodeChange, onStat, onNext, onSkip, onGiveUp }: Props) {
  const stat = stats[index]
  const passed = stat.status === 'passed'
  const value = code ?? (level.type === 'predict' ? '' : level.starterCode)
  const totalSeconds = stats.reduce((sum, s) => sum + s.seconds, 0)

  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const [wrongLine, setWrongLine] = useState<string | null>(null)
  const [verdict, setVerdict] = useState('')
  const [passLine] = useState(() => pick(PASS_LINES))
  const [shakeKey, setShakeKey] = useState(0)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), TOAST_MS)
    return () => clearTimeout(id)
  }, [toast])

  const showToast = (text: string) => setToast({ id: Date.now(), text })

  useTicker(!passed, () => onStat((s) => ({ seconds: s.seconds + 1 })))
  useWindowLeave(!passed, () => {
    onStat((s) => ({ tabSwitches: s.tabSwitches + 1 }))
    showToast(pick(LEAVE_ROASTS))
  })

  const onPasteAttempt = () => {
    onStat((s) => ({ pasteAttempts: s.pasteAttempts + 1 }))
    showToast(pick(PASTE_ROASTS))
  }

  /** On phones the feedback sits above the editor, so bring it into view after a run. */
  const revealFeedback = () =>
    requestAnimationFrame(() => {
      if (window.innerWidth < 1024) feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

  const settle = (ok: boolean) => {
    if (ok) {
      onStat(() => ({ status: 'passed' }))
      celebrate()
    } else {
      onStat((s) => ({ failedRuns: s.failedRuns + 1 }))
      setShakeKey((k) => k + 1)
    }
    revealFeedback()
  }

  const submit = async () => {
    if (running || passed) return
    if (level.type === 'predict') {
      const ok = checkPrediction(level, value)
      setWrongLine(ok ? null : pick(WRONG_PREDICT_LINES))
      settle(ok)
      return
    }
    setRunning(true)
    const r = await runCode(level.id, value)
    setRunning(false)
    setResult(r)
    setVerdict(pick(FAIL_LINES))
    settle(r.passed)
  }

  const hintsLeft = level.hints.length - stat.hintsUsed
  const badge = TYPE_BADGE[level.type]
  const isLast = index === levels.length - 1

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-zinc-800 bg-zinc-950/85 px-4 py-2.5 text-xs backdrop-blur sm:text-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-bold">
            Lvl {index + 1}/{levels.length}
          </span>
          <ProgressSquares stats={stats} current={index} />
          <span className="hidden text-zinc-500 md:inline">{TIER_NAMES[level.tier]}</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-400 tabular-nums sm:gap-4">
          <span title="Time on this level">⏱️ {formatTime(stat.seconds)}</span>
          <span title="Total time" className="hidden sm:inline">
            Σ {formatTime(totalSeconds)}
          </span>
          <span title="Times you left the tab">👀 {stat.tabSwitches}</span>
          <span title="Paste attempts">📋 {stat.pasteAttempts}</span>
          <span title="Failed runs">❌ {stat.failedRuns}</span>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:grid lg:min-h-0 lg:grid-cols-[2fr_3fr]">
        <section className="flex flex-col gap-4 border-zinc-800 p-4 sm:p-5 lg:min-h-0 lg:overflow-auto lg:border-r">
          <div className="space-y-4">
            <span className={`animate-pop inline-block rounded px-2 py-0.5 text-xs font-bold ${badge.className}`}>{badge.label}</span>
            <h2 className="animate-fade-up text-xl font-bold sm:text-2xl">{level.title}</h2>
            <div className="animate-fade-up [animation-delay:100ms]">
              <Prompt text={level.prompt} />
            </div>
            <p className="text-xs text-zinc-500">Par time: {formatTime(level.parSeconds)}</p>


            {level.hints.slice(0, stat.hintsUsed).map((hint, i) => (
              <div key={i} className="animate-pop rounded-lg border border-yellow-900 bg-yellow-950/30 p-3 text-sm text-yellow-200">
                💡 {hint}
              </div>
            ))}

            <div ref={feedbackRef} className="scroll-mt-16 space-y-4">
              {passed && (
                <div className="animate-pop rounded-xl border border-emerald-700 bg-emerald-950/60 p-4">
                  <div className="text-lg font-bold text-emerald-300">
                    ✅ +{levelScore(stat, level.parSeconds)} pts. {passLine}
                  </div>
                  <div className="text-sm text-zinc-400">
                    {formatTime(stat.seconds)} · {stat.hintsUsed} hint{stat.hintsUsed === 1 ? '' : 's'} · {stat.failedRuns} fail
                    {stat.failedRuns === 1 ? '' : 's'}
                  </div>
                </div>
              )}

              <div key={shakeKey} className={shakeKey ? 'animate-shake' : ''}>
                {wrongLine && !passed && (
                  <div className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm font-bold text-red-300">❌ {wrongLine}</div>
                )}
                {result && <TestResults result={result} verdict={verdict} />}
              </div>
            </div>
          </div>

          {/* Pinned to the bottom of the left panel: mt-auto when content is short, sticky when it scrolls (desktop) */}
          <div className="mt-auto lg:sticky lg:bottom-0">
            <ScoreBoard levels={levels} stats={stats} index={index} />
          </div>
        </section>

        <section className="flex flex-col border-t border-zinc-800 lg:min-h-0 lg:border-t-0">
          {level.type === 'predict' ? (
            <div className="flex flex-col lg:min-h-0 lg:flex-1">
              <div className="overflow-auto lg:min-h-0 lg:flex-1">
                <Editor value={level.snippet} readOnly />
              </div>
              <div className="border-t border-zinc-800 p-4">
                <label htmlFor="prediction" className="mb-2 block text-sm text-zinc-400">
                  What gets logged? (one line per log)
                </label>
                <textarea
                  id="prediction"
                  value={value}
                  onChange={(e) => onCodeChange(e.target.value)}
                  onPaste={(e) => {
                    e.preventDefault()
                    onPasteAttempt()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    onPasteAttempt()
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
                  }}
                  readOnly={passed}
                  rows={7}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  className={`w-full rounded-lg border bg-zinc-900 p-3 text-base outline-none transition focus:border-emerald-500 lg:text-sm ${wrongLine && !passed ? 'border-red-700' : 'border-zinc-700'}`}
                  placeholder={'first line\nsecond line\n…'}
                />
              </div>
            </div>
          ) : (
            <div
              className={`h-[45vh] min-h-[260px] overflow-auto border-l-2 transition-colors lg:h-auto lg:min-h-0 lg:flex-1 ${
                passed ? 'border-emerald-500' : result && !result.passed ? 'border-red-600' : 'border-transparent'
              }`}
            >
              <Editor value={value} onChange={onCodeChange} onPasteAttempt={onPasteAttempt} onRun={submit} readOnly={passed} />
            </div>
          )}

          <footer className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 border-t border-zinc-800 bg-zinc-950/90 p-3 backdrop-blur">
            {passed ? (
              <button
                onClick={onNext}
                className="animate-pop w-full rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-zinc-950 transition hover:bg-emerald-400 active:scale-95 sm:w-auto"
              >
                {isLast ? 'See my results →' : 'Next level →'}
              </button>
            ) : (
              <>
                <button
                  onClick={submit}
                  disabled={running}
                  className="flex-1 rounded-xl bg-emerald-500 px-5 py-2.5 font-bold text-zinc-950 transition hover:bg-emerald-400 active:scale-95 disabled:opacity-50 sm:flex-none"
                >
                  {running ? (
                    <span className="inline-block animate-spin">⏳</span>
                  ) : level.type === 'predict' ? (
                    'Submit'
                  ) : (
                    'Run tests'
                  )}{' '}
                  <span className="hidden text-xs opacity-70 sm:inline">{RUN_KEY}</span>
                </button>
                <button
                  onClick={() => onStat((s) => ({ hintsUsed: s.hintsUsed + 1 }))}
                  disabled={hintsLeft === 0}
                  className="flex-1 rounded-xl border border-yellow-800 px-4 py-2.5 whitespace-nowrap text-yellow-300 transition hover:bg-yellow-950 active:scale-95 disabled:opacity-40 sm:flex-none"
                >
                  💡 Hint −{HINT_PENALTY} <span className="text-yellow-600">· {hintsLeft} left</span>
                </button>
                <div className="hidden flex-1 sm:block" />
                <div className="flex w-full justify-between gap-2 sm:w-auto">
                  <button onClick={onSkip} className="rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-900 active:scale-95">
                    Skip (0 pts)
                  </button>
                  <button onClick={onGiveUp} className="rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-950 active:scale-95">
                    I give up 🏳️
                  </button>
                </div>
              </>
            )}
          </footer>
        </section>
      </div>

      {toast && (
        <div
          key={toast.id}
          className="animate-toast fixed bottom-24 left-1/2 z-50 w-max max-w-[90vw] rounded-xl border border-red-800 bg-zinc-900 px-5 py-3 text-center font-bold text-red-300 shadow-2xl"
        >
          {toast.text}
        </div>
      )}
    </div>
  )
}
