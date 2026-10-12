import { squareFor, type LevelStat, type Square } from '../engine/scoring'

const COLORS: Record<Square, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
  gray: 'bg-zinc-700',
}

export default function ProgressSquares({ stats, current, size = 'sm' }: { stats: LevelStat[]; current?: number; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-6 w-6 sm:h-8 sm:w-8 rounded-md' : 'h-3 w-3 rounded-sm sm:h-3.5 sm:w-3.5'
  return (
    <div className="flip-parent flex gap-1 sm:gap-1.5">
      {stats.map((s, i) => {
        const sq = squareFor(s)
        return (
          <div
            // Re-keying on colour change remounts the square, which replays the flip.
            key={`${i}-${sq}`}
            style={{ animationDelay: size === 'lg' ? `${i * 120}ms` : undefined }}
            className={`${dim} ${COLORS[sq]} ${sq !== 'gray' ? 'animate-flip' : ''} ${i === current ? 'ring-2 ring-zinc-200 ring-offset-2 ring-offset-zinc-950' : ''}`}
          />
        )
      })}
    </div>
  )
}
