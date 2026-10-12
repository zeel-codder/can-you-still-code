import { useEffect, useState } from 'react'
import { POOL, TIERS, TIER_NAMES } from '../levels'
import { FAKE_HEADLINES } from '../data/roasts'
import CreatorCredit from './CreatorCredit'

interface Props {
  hasProgress: boolean
  onStart: () => void
  onResume: () => void
}

const RULES = [
  ['🚫', 'No AI', 'Just you and your own brain. Remember that one?'],
  ['⌨️', 'No autocomplete', 'Every character typed by hand. Old school.'],
  ['📋', 'No paste', "Ctrl+V is disabled. We'll know. We always know."],
  ['👀', 'No tab-switching', 'Leave the tab to "check docs" and it costs you.'],
]

const COMMAND = '$ ./brain --no-ai --no-autocomplete --no-paste'
// Rough run length: average par time per tier, one level per tier.
const totalMinutes = Math.ceil(
  TIERS.reduce((sum, t) => {
    const inTier = POOL.filter((l) => l.tier === t)
    return sum + inTier.reduce((s, l) => s + l.parSeconds, 0) / inTier.length
  }, 0) / 60,
)

function useTypewriter(text: string, speedMs = 35) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (n >= text.length) return
    const id = setTimeout(() => setN(n + 1), speedMs)
    return () => clearTimeout(id)
  }, [n, text, speedMs])
  return text.slice(0, n)
}

export default function Landing({ hasProgress, onStart, onResume }: Props) {
  const typed = useTypewriter(COMMAND)

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Fake breaking-news ticker */}
      <div className="overflow-hidden border-b border-red-900/60 bg-red-950/40 py-2 text-xs sm:text-sm">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap text-red-200">
          {[...FAKE_HEADLINES, ...FAKE_HEADLINES].map((h, i) => (
            <span key={i}>
              <span className="mr-2 rounded bg-red-600 px-1.5 py-0.5 font-bold text-white">LIVE</span>
              {h}
            </span>
          ))}
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-5 py-10 sm:gap-10 sm:px-6 sm:py-16">
        <div>
          <p className="mb-3 min-h-[1.5em] text-xs break-all text-emerald-400 sm:text-sm">
            {typed}
            <span className="animate-blink">▋</span>
          </p>
          <h1 className="animate-glitch text-4xl leading-tight font-bold sm:text-6xl">
            Can you still code<span className="text-emerald-400">?</span>
          </h1>
          <p className="animate-fade-up mt-4 text-base text-zinc-400 [animation-delay:200ms] sm:text-lg">
            Everyone ships with AI now. Cool. So what's left when you turn it off? {TIERS.length} random levels from a pool of {POOL.length}, ~{totalMinutes}{' '}
            minutes, zero help. You get a score, a rank, and a friendly roast to share.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {RULES.map(([icon, title, desc], i) => (
            <li
              key={title}
              style={{ animationDelay: `${300 + i * 90}ms` }}
              className="animate-fade-up group rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 backdrop-blur transition hover:-translate-y-1 hover:border-emerald-700"
            >
              <div className="font-bold">
                <span className="inline-block transition group-hover:scale-125">{icon}</span> {title}
              </div>
              <div className="text-sm text-zinc-400">{desc}</div>
            </li>
          ))}
        </ul>

        <div className="animate-fade-up flex flex-wrap gap-2 text-xs [animation-delay:700ms] sm:text-sm">
          {TIERS.map((t) => (
            <span key={t} className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-zinc-400">
              {TIER_NAMES[t]} · 1 of {POOL.filter((l) => l.tier === t).length}
            </span>
          ))}
          <span className="rounded-full border border-emerald-900 bg-emerald-950/50 px-3 py-1 text-emerald-300">
            ⏱️ ~{totalMinutes} min
          </span>
        </div>

        <div className="animate-fade-up flex flex-col gap-3 [animation-delay:800ms] sm:flex-row">
          <button
            onClick={onStart}
            className="animate-glow rounded-xl bg-emerald-500 px-6 py-3.5 font-bold text-zinc-950 transition hover:scale-[1.03] hover:bg-emerald-400 active:scale-95"
          >
            {hasProgress ? 'Start over' : "Let's find out →"}
          </button>
          {hasProgress && (
            <button
              onClick={onResume}
              className="rounded-xl border border-zinc-700 px-6 py-3.5 transition hover:bg-zinc-900 active:scale-95"
            >
              Resume run
            </button>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-zinc-600">No sign-up. No tracking. Your results stay in your browser.</p>
          <CreatorCredit />
        </div>
      </main>
    </div>
  )
}
