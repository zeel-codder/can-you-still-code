/** Small seeded PRNG (mulberry32): the same seed always gives the same run, so a refresh keeps your problems. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 32)

/** Integer in [min, max], inclusive. */
export const randInt = (rand: () => number, min: number, max: number) => min + Math.floor(rand() * (max - min + 1))

export const pickOne = <T>(rand: () => number, items: readonly T[]): T => items[Math.floor(rand() * items.length)]

export function shuffle<T>(rand: () => number, items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** `count` different integers from [min, max]. */
export function distinctInts(rand: () => number, count: number, min: number, max: number): number[] {
  return shuffle(rand, Array.from({ length: max - min + 1 }, (_, i) => min + i)).slice(0, count)
}
