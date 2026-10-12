import { describe, expect, it } from 'vitest'
import { buildRun, getCodeLevel, type PredictLevel } from '../src/levels'
import { checkPrediction, evaluateCode } from '../src/engine/evaluate'

/** Many ways a player might correctly solve each level. Every one of these must pass. */
const CORRECT: Record<string, Record<string, string>> = {
  fizzbuzz: {
    'classic for loop': `function fizzBuzz(n) {
  const out = []
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) out.push('FizzBuzz')
    else if (i % 3 === 0) out.push('Fizz')
    else if (i % 5 === 0) out.push('Buzz')
    else out.push(String(i))
  }
  return out
}`,
    'arrow function': `const fizzBuzz = (n) => {
  const out = [];
  for (let i = 1; i <= n; i++) {
    let s = '';
    if (i % 3 === 0) s += 'Fizz';
    if (i % 5 === 0) s += 'Buzz';
    out.push(s || i.toString());
  }
  return out;
};`,
    'function expression with var': `var fizzBuzz = function (n) {
  var res = [];
  for (var i = 1; i <= n; i++) res.push(i % 15 == 0 ? "FizzBuzz" : i % 3 == 0 ? "Fizz" : i % 5 == 0 ? "Buzz" : "" + i);
  return res;
}`,
    'Array.from one-liner': `const fizzBuzz = n => Array.from({ length: n }, (_, i) => ((i + 1) % 3 ? '' : 'Fizz') + ((i + 1) % 5 ? '' : 'Buzz') || String(i + 1))`,
    'export keyword': `export function fizzBuzz(n) {
  const out = []
  for (let i = 1; i <= n; i++) out.push(i % 15 === 0 ? 'FizzBuzz' : i % 3 === 0 ? 'Fizz' : i % 5 === 0 ? 'Buzz' : \`\${i}\`)
  return out
}`,
    'with a test call and console.log at the bottom': `function fizzBuzz(n) {
  const out = []
  for (let i = 1; i <= n; i++) out.push(i % 15 === 0 ? 'FizzBuzz' : i % 3 === 0 ? 'Fizz' : i % 5 === 0 ? 'Buzz' : String(i))
  return out
}
console.log(fizzBuzz(15))`,
  },
  'fix-find-max': {
    'starts at nums[0]': `function findMax(nums) {
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > max) max = nums[i];
  }
  return max;
}`,
    'starts at -Infinity': `function findMax(nums) {
  let max = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > max) max = nums[i];
  }
  return max;
}`,
    'Math.max of two values inside the loop': `function findMax(nums) {
  let max = nums[0];
  for (let i = 1; i < nums.length; i++) {
    max = Math.max(max, nums[i]);
  }
  return max;
}`,
    'for...of loop': `function findMax(nums) {
  let max = nums[0];
  for (const n of nums) if (n > max) max = n;
  return max;
}`,
    '<= nums.length - 1': `function findMax(nums) {
  let max = nums[0];
  for (let i = 1; i <= nums.length - 1; i++) {
    if (nums[i] > max) max = nums[i];
  }
  return max;
}`,
  },
}

describe.each(Object.entries(CORRECT))('%s accepts correct variants', (id, variants) => {
  const level = getCodeLevel(id)
  it.each(Object.entries(variants))('%s', (_, code) => {
    const r = evaluateCode(level, code)
    expect({ error: r.error, failing: r.results.filter((t) => !t.passed) }).toEqual({ error: undefined, failing: [] })
  })
})

describe('predictions accept reasonable formatting', () => {
  // Any run's boss works; its answer is a list of logged lines.
  const level = buildRun(2024)[2] as PredictLevel
  const lines = level.expectedOutput.split('\n')
  it.each([
    ['one per line', lines.join('\n')],
    ['trailing newline and spaces', lines.map((l) => ` ${l} `).join('\n') + '\n\n'],
    ['space separated', lines.join(' ')],
    ['comma separated', lines.join(', ')],
    ['quoted', lines.map((l) => `"${l}"`).join('\n')],
  ])('%s', (_, answer) => {
    expect(checkPrediction(level, answer)).toBe(true)
  })

  it('still rejects the wrong order', () => {
    expect(checkPrediction(level, [...lines].reverse().join('\n'))).toBe(false)
  })
})
