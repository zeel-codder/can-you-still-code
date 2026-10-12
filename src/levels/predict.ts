import type { PredictTemplate } from './types'
import { distinctInts, pickOne, randInt, shuffle } from './random'

const PROMPT_SUFFIX = 'The values change every run, so no copying your friend’s answer. 👀'

/** Tier 3 final bosses: read code, predict the output. Values are generated per run. */
export const PREDICT_TEMPLATES: PredictTemplate[] = [
  {
    id: 'predict-event-loop',
    tier: 3,
    type: 'predict',
    title: 'Final Boss: The Event Loop',
    prompt: `The thing every "senior" dev nods along to in meetings. No Run button. Type what gets logged, in order. ${PROMPT_SUFFIX}`,
    parSeconds: 120,
    hints: [
      'Sync code first. Then ALL microtasks (promises, queueMicrotask, code after await) in the order they were queued. Timers dead last.',
      'An async function runs synchronously until its first await. Plot twist.',
    ],
    generate(rand) {
      // Every statement kind shows up, in a random order, with random labels.
      const kinds = shuffle(rand, ['sync', 'sync', 'timeout', 'then', 'micro', 'async', pickOne(rand, ['sync', 'timeout', 'then'])])
      const labels = distinctInts(rand, 8, 10, 99)
      const next = () => labels.shift()!
      const lines: string[] = []
      const sync: number[] = []
      const micro: number[] = []
      const timers: number[] = []
      for (const kind of kinds) {
        if (kind === 'sync') {
          const v = next()
          lines.push(`console.log(${v});`)
          sync.push(v)
        } else if (kind === 'timeout') {
          const v = next()
          lines.push(`setTimeout(() => console.log(${v}), 0);`)
          timers.push(v)
        } else if (kind === 'then') {
          const v = next()
          lines.push(`Promise.resolve().then(() => console.log(${v}));`)
          micro.push(v)
        } else if (kind === 'micro') {
          const v = next()
          lines.push(`queueMicrotask(() => console.log(${v}));`)
          micro.push(v)
        } else {
          const before = next()
          const after = next()
          lines.push('(async () => {', `  console.log(${before});`, '  await null;', `  console.log(${after});`, '})();')
          sync.push(before)
          micro.push(after)
        }
      }
      return { snippet: lines.join('\n') + '\n', expectedOutput: [...sync, ...micro, ...timers].join('\n') }
    },
  },
  {
    id: 'predict-var-let',
    tier: 3,
    type: 'predict',
    title: 'Final Boss: var vs let 🤨',
    prompt: `Two loops, a bunch of timeouts, one very confused variable. No Run button. Type what gets logged, one line per log. ${PROMPT_SUFFIX}`,
    parSeconds: 90,
    hints: [
      'Every timeout runs AFTER both loops have finished. Patience, young padawan.',
      '`var` is one shared variable for the whole loop, so every callback sees its final value. `let` gets a fresh copy per iteration.',
    ],
    generate(rand) {
      const varStart = randInt(rand, 0, 3)
      const varStep = pickOne(rand, [1, 2])
      const varCount = randInt(rand, 2, 3)
      const varEnd = varStart + varCount * varStep
      const letStart = randInt(rand, 0, 5)
      const letCount = randInt(rand, 2, 3)

      const varLoop = [
        `for (var i = ${varStart}; i < ${varEnd}; ${varStep === 1 ? 'i++' : 'i += 2'}) {`,
        '  setTimeout(() => console.log("var", i));',
        '}',
      ]
      const letLoop = [
        `for (let j = ${letStart}; j < ${letStart + letCount}; j++) {`,
        '  setTimeout(() => console.log("let", j));',
        '}',
      ]
      const varLogs = Array.from({ length: varCount }, () => `var ${varEnd}`)
      const letLogs = Array.from({ length: letCount }, (_, k) => `let ${letStart + k}`)
      const varFirst = rand() < 0.5
      return {
        snippet: (varFirst ? [...varLoop, ...letLoop] : [...letLoop, ...varLoop]).join('\n') + '\n',
        expectedOutput: (varFirst ? [...varLogs, ...letLogs] : [...letLogs, ...varLogs]).join('\n'),
      }
    },
  },
  {
    id: 'predict-references',
    tier: 3,
    type: 'predict',
    title: 'Final Boss: Who Owns This Array? 🧳',
    prompt: `Copies, references and one sneaky shallow copy. No Run button. Type what gets logged, one line per log. ${PROMPT_SUFFIX}`,
    parSeconds: 120,
    hints: [
      '`const b = a` copies the reference, not the array. `[...a]` and `{ ...user }` make NEW containers.',
      'Spread is shallow: the copy gets the SAME inner tags array, so pushing to one pushes to both.',
    ],
    generate(rand) {
      const [x, y, ...pushes] = distinctInts(rand, 2 + randInt(rand, 1, 2), 1, 9)
      const extra = randInt(rand, 10, 99)
      const [name, newName] = shuffle(rand, ['Ada', 'Linus', 'Grace', 'Alan', 'Margaret', 'Dennis']).slice(0, 2)
      const [tag, newTag] = shuffle(rand, ['js', 'css', 'html', 'sql', 'git', 'bash']).slice(0, 2)
      const a = [x, y, ...pushes]
      const snippet = [
        `const a = [${x}, ${y}];`,
        'const b = a;',
        ...pushes.map((p) => `b.push(${p});`),
        'const c = [...a];',
        `c.push(${extra});`,
        'console.log(a.length, c.length);',
        'console.log(a === b, a === c);',
        'console.log(a.join("-"));',
        '',
        `const user = { name: "${name}", tags: ["${tag}"] };`,
        'const copy = { ...user };',
        `copy.name = "${newName}";`,
        `copy.tags.push("${newTag}");`,
        'console.log(user.name, copy.name);',
        'console.log(user.tags.length);',
      ]
      return {
        snippet: snippet.join('\n') + '\n',
        expectedOutput: [`${a.length} ${a.length + 1}`, 'true false', a.join('-'), `${name} ${newName}`, '2'].join('\n'),
      }
    },
  },
]
