import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

export function celebrate() {
  confetti({ particleCount: 110, spread: 75, startVelocity: 40, origin: { y: 0.75 }, disableForReducedMotion: true })
}

/** Rains the rank's emoji from the top of the screen (💀, 🛠️, 🗿 …). */
export function emojiRain(emoji: string) {
  const shape = confetti.shapeFromText({ text: emoji, scalar: 2.2 })
  for (const x of [0.2, 0.5, 0.8]) {
    confetti({
      shapes: [shape],
      scalar: 2.2,
      particleCount: 12,
      spread: 70,
      startVelocity: 18,
      gravity: 0.7,
      ticks: 260,
      flat: true,
      origin: { x, y: -0.1 },
      angle: 270,
      disableForReducedMotion: true,
    })
  }
}

/** Animates a number from 0 to `target`. */
export function useCountUp(target: number, durationMs = 1200): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])
  return value
}

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
