import { useEffect, useMemo, useState } from 'react'
import { TIERS, buildRun, nextSeed } from './levels'
import { emptyStat, type LevelStat } from './engine/scoring'
import Landing from './components/Landing'
import LevelScreen from './components/LevelScreen'
import Results from './components/Results'
import Backdrop from './components/Backdrop'

type Phase = 'landing' | 'playing' | 'results'

interface RunState {
  phase: Phase
  /** Picks this run's problems and generates the final boss's values. */
  seed: number
  index: number
  stats: LevelStat[]
  /** Player code (or predicted output) per level id. */
  code: Record<string, string>
}

const STORAGE_KEY = 'can-you-still-code:run:v5'

/** A new run; pass the previous seed to guarantee different problems from last time. */
const freshRun = (phase: Phase = 'landing', previousSeed?: number): RunState => ({
  phase,
  seed: nextSeed(previousSeed),
  index: 0,
  stats: TIERS.map(emptyStat),
  code: {},
})

function loadRun(): RunState {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as RunState | null
    if (saved && typeof saved.seed === 'number' && saved.stats?.length === TIERS.length) return saved
  } catch {
    // corrupted save: start over
  }
  return freshRun()
}

export default function App() {
  const [run, setRun] = useState<RunState>(loadRun)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(run))
  }, [run])

  const updateStat = (patch: (s: LevelStat) => Partial<LevelStat>) =>
    setRun((r) => ({
      ...r,
      stats: r.stats.map((s, i) => (i === r.index ? { ...s, ...patch(s) } : s)),
    }))

  const levels = useMemo(() => buildRun(run.seed), [run.seed])
  const advance = (r: RunState): RunState =>
    r.index + 1 >= TIERS.length ? { ...r, phase: 'results' } : { ...r, index: r.index + 1 }

  let screen
  if (run.phase === 'landing') {
    screen = (
      <Landing
        hasProgress={run.stats.some((s) => s.status !== 'unplayed' || s.seconds > 0)}
        onStart={() => setRun((r) => freshRun('playing', r.seed))}
        onResume={() => setRun((r) => ({ ...r, phase: 'playing' }))}
      />
    )
  } else if (run.phase === 'results') {
    screen = <Results levels={levels} stats={run.stats} onRestart={() => setRun((r) => freshRun('playing', r.seed))} onHome={() => setRun((r) => freshRun('landing', r.seed))} />
  } else {
    const level = levels[run.index]
    screen = (
      <LevelScreen
        key={level.id}
        levels={levels}
        level={level}
        index={run.index}
        stats={run.stats}
        code={run.code[level.id]}
        onCodeChange={(value) => setRun((r) => ({ ...r, code: { ...r.code, [level.id]: value } }))}
        onStat={updateStat}
        onNext={() => setRun(advance)}
        onSkip={() => {
          updateStat(() => ({ status: 'skipped' }))
          setRun(advance)
        }}
        onGiveUp={() =>
          setRun((r) => ({
            ...r,
            phase: 'results',
            stats: r.stats.map((s, i) => (i === r.index && s.status !== 'passed' ? { ...s, status: 'skipped' } : s)),
          }))
        }
      />
    )
  }

  return (
    <>
      <Backdrop />
      {screen}
    </>
  )
}
