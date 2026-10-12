import type { Rank } from '../data/roasts'
import type { Square, Totals } from '../engine/scoring'
import { formatTime } from '../engine/scoring'

export const CARD_WIDTH = 1200
export const CARD_HEIGHT = 675

export interface CardData {
  score: number
  rank: Rank
  roast: string
  squares: Square[]
  totals: Totals
  levelCount: number
  url: string
}

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace'
const SQUARE_COLORS: Record<Square, string> = {
  green: '#22c55e',
  yellow: '#facc15',
  red: '#ef4444',
  gray: '#3f3f46',
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

/** Largest font size (down to `min`) at which `text` fits in `maxWidth`. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, max: number, min: number, weight = 'bold') {
  let size = max
  for (; size > min; size -= 2) {
    ctx.font = `${weight} ${size}px ${MONO}`
    if (ctx.measureText(text).width <= maxWidth) break
  }
  ctx.font = `${weight} ${size}px ${MONO}`
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

/** Draws the shareable result card (1200×675, the X / Twitter large-image size). */
export function drawShareCard(canvas: HTMLCanvasElement, d: CardData) {
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext('2d')!
  const pad = 64

  // Background + faint grid
  ctx.fillStyle = '#09090b'
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1
  for (let x = 0; x <= CARD_WIDTH; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 56)
    ctx.lineTo(x, CARD_HEIGHT)
    ctx.stroke()
  }
  for (let y = 56; y <= CARD_HEIGHT; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(CARD_WIDTH, y)
    ctx.stroke()
  }

  // Terminal title bar
  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, CARD_WIDTH, 56)
  ;['#ef4444', '#facc15', '#22c55e'].forEach((c, i) => {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(32 + i * 26, 28, 8, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#71717a'
  ctx.font = `20px ${MONO}`
  ctx.textAlign = 'center'
  ctx.fillText('can-you-still-code — no AI allowed', CARD_WIDTH / 2, 35)
  ctx.textAlign = 'left'

  // Prompt line
  ctx.fillStyle = '#4ade80'
  ctx.font = `22px ${MONO}`
  ctx.fillText('$ ./brain --no-ai --no-autocomplete --no-paste', pad, 118)

  // Big score
  ctx.fillStyle = d.rank.color
  ctx.font = `bold 190px ${MONO}`
  const scoreText = String(d.score)
  ctx.fillText(scoreText, pad - 8, 330)
  const scoreWidth = ctx.measureText(scoreText).width
  ctx.fillStyle = '#71717a'
  ctx.font = `bold 52px ${MONO}`
  ctx.fillText('/100', pad + scoreWidth, 330)
  ctx.font = `20px ${MONO}`
  ctx.fillText('AI-FREE CODING SCORE', pad, 372)

  // Rank + roast
  const colX = 640
  const rankText = `${d.rank.emoji} ${d.rank.title}`
  fitFont(ctx, rankText, CARD_WIDTH - colX - pad, 50, 28)
  ctx.fillStyle = d.rank.color
  ctx.fillText(rankText, colX, 210)
  ctx.fillStyle = '#e4e4e7'
  ctx.font = `28px ${MONO}`
  wrapText(ctx, `"${d.roast}"`, CARD_WIDTH - colX - pad).forEach((line, i) => {
    ctx.fillText(line, colX, 262 + i * 38)
  })

  // Wordle-style level squares
  const size = 64
  const gap = 14
  d.squares.forEach((sq, i) => {
    ctx.fillStyle = SQUARE_COLORS[sq]
    roundRect(ctx, pad + i * (size + gap), 412, size, size, 10)
  })
  ctx.fillStyle = '#a1a1aa'
  ctx.font = `22px ${MONO}`
  ctx.fillText(`${d.totals.cleared}/${d.levelCount} levels cleared`, pad + d.squares.length * (size + gap) + 14, 452)

  // Stat chips
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`
  const chips = [
    `💡 ${plural(d.totals.hints, 'hint')}`,
    `👀 left tab ${d.totals.tabSwitches}×`,
    `📋 ${plural(d.totals.pasteAttempts, 'paste attempt')}`,
    `⏱️ ${formatTime(d.totals.seconds)}`,
  ]
  ctx.font = `22px ${MONO}`
  let chipX = pad
  for (const chip of chips) {
    const w = ctx.measureText(chip).width + 32
    ctx.fillStyle = '#18181b'
    roundRect(ctx, chipX, 510, w, 48, 24)
    ctx.fillStyle = '#d4d4d8'
    ctx.fillText(chip, chipX + 16, 542)
    chipX += w + 12
  }

  // Footer
  ctx.fillStyle = '#52525b'
  ctx.font = `20px ${MONO}`
  ctx.fillText(d.url.replace(/^https?:\/\//, ''), pad, 630)
  ctx.textAlign = 'right'
  ctx.fillText('Can YOU still code? No AI. No cap.', CARD_WIDTH - pad, 630)
  ctx.textAlign = 'left'
}
