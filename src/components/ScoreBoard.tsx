import type { Level } from '../levels'
import { finalScore, levelScore, scoreBreakdown, type LevelStat } from '../engine/scoring'

interface Props {
  levels: Level[]
  stats: LevelStat[]
  index: number
}

/** Live scoreboard: this level's itemised points, every level's result, and the running total. */
export default function ScoreBoard({ levels, stats, index }: Props) {
  const level = levels[index]
  const stat = stats[index]
  const passed = stat.status === 'passed'
  const { lines, total } = scoreBreakdown(stat, level.parSeconds)

  return (
    <aside className="animate-fade-up rounded-xl border border-zinc-800 bg-zinc-900/95 p-3 shadow-[0_-12px_24px_rgb(9_9_11/0.9)] text-xs backdrop-blur [animation-delay:200ms] sm:text-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-bold tracking-wider text-zinc-400">🧾 SCOREBOARD</span>
        <span className="text-zinc-500">{passed ? 'locked in' : 'if you solve it now'}</span>
      </div>

      <ul className="space-y-0.5 tabular-nums">
        {lines.map((line) => (
          <li key={line.label} className="flex justify-between gap-3">
            <span className="text-zinc-400">{line.label}</span>
            <span
              // Re-keying on the value replays the pop whenever a penalty lands.
              key={line.points}
              className={`${line.points < 0 ? 'animate-pop text-red-400' : line.points > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}
            >
              {line.points > 0 ? '+' : ''}
              {line.points}
            </span>
          </li>
        ))}
        <li className="mt-1 flex justify-between border-t border-zinc-800 pt-1 font-bold">
          <span>This level</span>
          <span className={passed ? 'text-emerald-300' : 'text-zinc-200'}>{total}</span>
        </li>
      </ul>

      <ul className="mt-3 space-y-0.5 border-t border-zinc-800 pt-2 tabular-nums">
        {levels.map((l, i) => {
          const s = stats[i]
          const current = i === index
          const value =
            s.status === 'passed' ? levelScore(s, l.parSeconds) : s.status === 'skipped' ? '0 🏳️' : current ? '…' : '—'
          return (
            <li key={l.id} className={`flex justify-between gap-3 ${current ? 'text-zinc-100' : 'text-zinc-500'}`}>
              <span className="truncate">
                {current ? '▶ ' : ''}L{i + 1} · {l.title}
              </span>
              <span className={s.status === 'passed' ? 'text-emerald-400' : ''}>{value}</span>
            </li>
          )
        })}
        <li className="mt-1 flex justify-between border-t border-zinc-800 pt-1 font-bold">
          <span>Total so far</span>
          <span>{finalScore(stats, levels)}/100</span>
        </li>
      </ul>
    </aside>
  )
}
