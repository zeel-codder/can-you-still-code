import type { Totals } from '../engine/scoring'

export interface Rank {
  min: number
  title: string
  emoji: string
  /** One is picked at random per results screen, so replays feel fresh. */
  roasts: string[]
  color: string
}

/** Ordered from best to worst; the first rank whose `min` the score reaches wins. */
export const RANKS: Rank[] = [
  {
    min: 90,
    title: 'Built Different',
    emoji: '🗿',
    roasts: [
      "You don't need AI. AI needs you. Aura +1000.",
      'Somewhere, an AI just quietly updated its résumé.',
      "Hand-crafted, small-batch, artisanal code. Chef's kiss. 🤌",
    ],
    color: '#4ade80',
  },
  {
    min: 70,
    title: 'Still Got Rizz',
    emoji: '😎',
    roasts: [
      'A little rusty, but the brain still boots. Respect.',
      'Your code still slaps. Just at 0.9× speed.',
      'The muscle memory is in there. It just took the scenic route.',
    ],
    color: '#a3e635',
  },
  {
    min: 50,
    title: 'Shaking Off Rust',
    emoji: '🛠️',
    roasts: [
      'Your brain is buffering, but the video looks great.',
      'Like riding a bike. A bike that has been in the garage for a while.',
      'Solid base. A few more reps without AI and you’re dangerous.',
    ],
    color: '#facc15',
  },
  {
    min: 25,
    title: 'Autocomplete Enjoyer',
    emoji: '⌨️',
    roasts: [
      'You typed code by hand today. Your keyboard is so proud. 🥹',
      'Your fingers kept reaching for Tab. They’ll get over it.',
      'Somewhere, a lonely semicolon is cheering for you.',
    ],
    color: '#fb923c',
  },
  {
    min: 0,
    title: 'Rebooting…',
    emoji: '💀',
    roasts: [
      'Have you tried turning your brain off and on again?',
      'Your coding brain is still loading. Please do not unplug.',
      'Plot twist: the real level was the friends we made along the way.',
    ],
    color: '#f87171',
  },
]

export const PASTE_ROASTS = [
  'Ctrl+V? In this economy? 😄',
  'Nice try! Paste is off for this one.',
  'Clipboard? Never heard of her.',
  'Paste is on a break. Your keyboard isn’t.',
  'Hand-typed only, friend. You’ve got this.',
]

export const LEAVE_ROASTS = [
  'Welcome back! Tab switch noted. (-5)',
  '"Just checking the docs"? We believe you. Mostly. (-5)',
  'We noticed you stepped out. Aura -5.',
  'The AI misses you, but stay here. (-5)',
]

export const FAIL_LINES = [
  'Not quite yet. Keep going!',
  'Works on your machine, I’m sure. 😉',
  'Plot twist: the tests disagree.',
  'This is fine. 🔥🐶🔥',
  'Bugs happen. Squash and retry. 🐛',
]

export const PASS_LINES = [
  'LGTM 👍 Ship it.',
  'No AI. In this economy? Absolute legend.',
  'Clean. Aura +100.',
  'Your CS professor just felt a disturbance.',
  'Hand-written code? Vintage. Artisanal. Organic.',
]

export const WRONG_PREDICT_LINES = [
  'Not quite. Run it in your head one more time.',
  "That's not what it logs, but nice try!",
  'Wrong, but with so much confidence. Respect.',
]

export const FAKE_HEADLINES = [
  'BREAKING: Local dev forgets how to write a for loop',
  'Stack Overflow now just a museum, curators confirm',
  'Junior asks AI what a semicolon is, AI also unsure',
  'Senior engineer caught typing code by hand, HR investigating',
  '"Vibe coding" added to dictionary, "debugging" removed',
  'Man spends 3 hours prompting to avoid 10 minutes of coding',
  'Study: 9 out of 10 devs can no longer exit vim OR write FizzBuzz',
  'Interviewer asks candidate to reverse a string, candidate asks for Wi-Fi',
]

export const TIMEOUT_LINE =
  '⏱️ Infinite loop detected! Your code got a little too excited, so we stopped it after 2s.'

export function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

/** Extra stat-based roast lines for the results screen. */
export function statRoasts(t: Totals, levelCount: number, totalParSeconds: number): string[] {
  const lines: string[] = []
  if (t.tabSwitches >= 3) lines.push(`Left the tab ${t.tabSwitches} times. Hope the docs were lovely this time of year. 🏖️`)
  else if (t.tabSwitches > 0) lines.push(`Left the tab ${t.tabSwitches === 1 ? 'once' : 'twice'}. We'll call it a snack break. 🍪`)
  if (t.pasteAttempts >= 1)
    lines.push(`Tried to paste ${t.pasteAttempts} time${t.pasteAttempts === 1 ? '' : 's'}. Ctrl+V withdrawal is real. Stay strong. 💪`)
  if (t.hints >= 3) lines.push(`Used ${t.hints} hints. The hints would like co-author credit.`)
  if (t.failedRuns >= 5) lines.push(`${t.failedRuns} failed runs. Not failures, just very confident experiments. 🧪`)
  if (t.cleared === 0) lines.push('No levels cleared. FizzBuzz remains undefeated… for now. 🥊')
  else if (t.cleared === levelCount && t.hints === 0) lines.push('Every level, zero hints. Are you sure you’re not an AI? 🤨')
  if (t.cleared === levelCount && t.seconds < totalParSeconds / 2) lines.push('Speedrun energy. Did you even read the prompts? ⚡')
  else if (t.cleared > 0 && t.seconds > totalParSeconds * 3) lines.push('Took your time. Slow-cooked code is the tastiest. 🍲')
  return lines
}

/** Silly, totally unscientific bonus stats for the results screen. */
export function bonusStats(t: Totals): string[] {
  return [
    // Never below 42: even a 0-second run deserves the answer to everything.
    `🌱 ~${Math.max(42, t.seconds * 37 + t.cleared * 420).toLocaleString()} AI tokens saved`,
    `🧠 ${t.cleared === 0 ? 'neurons: warming up' : `${t.cleared * 3} neurons reactivated`}`,
    '🤖 prompts written: 0',
  ]
}

export const FINE_PRINT =
  '*Results certified by absolutely no one. Side effects may include confidence, nostalgia and the urge to write a for loop.'
