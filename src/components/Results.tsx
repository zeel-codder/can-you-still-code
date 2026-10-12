import { useEffect, useMemo, useRef, useState } from 'react'
import type { Level } from '../levels'
import {
  finalScore,
  formatTime,
  getRank,
  levelScore,
  squareFor,
  SQUARE_EMOJI,
  totals as sumTotals,
  type LevelStat,
} from '../engine/scoring'
import { FINE_PRINT, bonusStats, pick, statRoasts } from '../data/roasts'
import { drawShareCard } from './ShareCard'
import { celebrate, emojiRain, useCountUp } from './effects'
import ProgressSquares from './ProgressSquares'
import CreatorCredit from './CreatorCredit'

interface Props {
  levels: Level[]
  stats: LevelStat[]
  onRestart: () => void
  onHome: () => void
}

const SITE_URL = window.location.origin

export default function Results({ levels, stats, onRestart, onHome }: Props) {
  const score = finalScore(stats, levels)
  const rank = getRank(score)
  const totals = useMemo(() => sumTotals(stats), [stats])
  const squares = useMemo(() => stats.map(squareFor), [stats])
  const totalPar = levels.reduce((sum, l) => sum + l.parSeconds, 0)
  const extraRoasts = statRoasts(totals, levels.length, totalPar)
  const [roast] = useState(() => pick(rank.roasts))

  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [copied, setCopied] = useState(false)
  const shownScore = useCountUp(score)
  const effectsFired = useRef(false)

  // Fire once, after the count-up lands: confetti for the good ranks, a rain of the rank emoji for everyone.
  useEffect(() => {
    const id = setTimeout(() => {
      if (effectsFired.current) return
      effectsFired.current = true
      if (score >= 70) celebrate()
      emojiRain(rank.emoji)
    }, 1100)
    return () => clearTimeout(id)
  }, [score, rank.emoji])

  useEffect(() => {
    const canvas = document.createElement('canvas')
    drawShareCard(canvas, { score, rank, roast, squares, totals, levelCount: levels.length, url: SITE_URL })
    setImageUrl(canvas.toDataURL('image/png'))
    canvas.toBlob((b) => setImageBlob(b), 'image/png')
  }, [score, rank, roast, squares, totals, levels.length])

  const shareText =
    `I scored ${score}/100 on "Can You Still Code?" ${rank.emoji}\n` +
    `Rank: ${rank.title}\n` +
    `${squares.map((s) => SQUARE_EMOJI[s]).join('')}\n` +
    `No AI. No autocomplete. No paste. Bet you can't beat it 👀\n${SITE_URL}`

  const file = imageBlob ? new File([imageBlob], 'my-coding-score.png', { type: 'image/png' }) : null
  const canShareFile = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

  const share = async () => {
    if (!file) return
    try {
      await navigator.share({ files: [file], text: shareText })
    } catch {
      // user cancelled the share sheet
    }
  }

  const copyText = async () => {
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(shareText)}`

  const btn = 'rounded-xl px-5 py-2.5 font-bold transition active:scale-95 text-center'

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 sm:py-12">
      <div className="text-center">
        <p className="animate-fade-up text-sm text-zinc-500">Your AI-free coding score</p>
        <div className="text-7xl font-bold tabular-nums sm:text-8xl" style={{ color: rank.color }}>
          {shownScore}
          <span className="text-2xl text-zinc-500 sm:text-3xl">/100</span>
        </div>
        <div className="animate-pop mt-2 text-2xl font-bold [animation-delay:1100ms] sm:text-3xl" style={{ color: rank.color }}>
          <span className="animate-wiggle inline-block">{rank.emoji}</span> {rank.title}
        </div>
        <p className="animate-fade-up mt-2 text-base text-zinc-300 [animation-delay:1300ms] sm:text-lg">"{roast}"</p>
        {extraRoasts.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-zinc-400">
            {extraRoasts.map((line, i) => (
              <li key={line} className="animate-fade-up" style={{ animationDelay: `${1500 + i * 150}ms` }}>
                • {line}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex justify-center">
          <ProgressSquares stats={stats} size="lg" />
        </div>
        <ul className="mt-5 flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
          {bonusStats(totals).map((stat, i) => (
            <li
              key={stat}
              style={{ animationDelay: `${1800 + i * 120}ms` }}
              className="animate-pop rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-zinc-300"
            >
              {stat}
            </li>
          ))}
        </ul>
      </div>

      <section className="animate-fade-up space-y-4 [animation-delay:1600ms]">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Your shareable score card"
            className="w-full rounded-xl border border-zinc-800 shadow-2xl shadow-emerald-950/50 transition hover:-rotate-1 hover:scale-[1.01]"
          />
        )}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-center">
          <a href={imageUrl} download="my-coding-score.png" className={`${btn} animate-glow bg-emerald-500 text-zinc-950 hover:bg-emerald-400`}>
            ⬇️ Download
          </a>
          {canShareFile && (
            <button onClick={share} className={`${btn} bg-sky-500 text-zinc-950 hover:bg-sky-400`}>
              📤 Share
            </button>
          )}
          <a href={xUrl} target="_blank" rel="noreferrer" className={`${btn} border border-zinc-600 hover:bg-zinc-900`}>
            𝕏 Post on X
          </a>
          <button onClick={copyText} className={`${btn} border border-zinc-700 font-normal hover:bg-zinc-900`}>
            {copied ? '✅ Copied' : '📋 Copy text'}
          </button>
        </div>
        <p className="text-center text-xs text-zinc-500">
          Download the image, then attach it to your post. X links can't attach images (we tried, X said no).
        </p>
      </section>

      <section className="animate-fade-up [animation-delay:1800ms]">
        <h3 className="mb-3 text-lg font-bold">The receipts 🧾</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="py-1">#</th>
              <th>Level</th>
              <th className="hidden sm:table-cell">Result</th>
              <th className="hidden text-right sm:table-cell">Time</th>
              <th className="text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level, i) => {
              const s = stats[i]
              return (
                <tr key={level.id} className="border-t border-zinc-800">
                  <td className="py-2 pr-2 text-zinc-500">{i + 1}</td>
                  <td className="pr-2">
                    <span className="sm:hidden">{SQUARE_EMOJI[squareFor(s)]} </span>
                    {level.title}
                  </td>
                  <td className="hidden sm:table-cell">
                    {SQUARE_EMOJI[squareFor(s)]}{' '}
                    {s.status === 'passed' ? 'cleared' : s.status === 'skipped' ? 'skipped' : 'not reached'}
                  </td>
                  <td className="hidden text-right text-zinc-400 sm:table-cell">{s.seconds ? formatTime(s.seconds) : '—'}</td>
                  <td className="text-right font-bold">{levelScore(s, level.parSeconds)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <button onClick={onRestart} className={`${btn} bg-zinc-100 text-zinc-950 hover:bg-white`}>
          🔁 Run it back
        </button>
        <button onClick={onHome} className={`${btn} border border-zinc-700 font-normal hover:bg-zinc-900`}>
          Home
        </button>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-xs text-zinc-600">{FINE_PRINT}</p>
        <CreatorCredit />
      </div>
    </main>
  )
}
