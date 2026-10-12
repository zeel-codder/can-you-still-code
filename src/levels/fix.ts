import type { CodeLevel } from './types'

/** Tier 2: an AI wrote it, it's broken, fix it. One is picked per run. */
export const FIX_LEVELS: CodeLevel[] = [
  {
    id: 'fix-find-max',
    tier: 2,
    type: 'fix',
    title: 'The AI Said "LGTM 👍"',
    prompt:
      'An AI wrote `findMax`, called it "production-ready ✨🚀" and moved on. It is not. Fix the loop. `Math.max(...nums)` is off-limits — fix it, don’t replace it.',
    fnName: 'findMax',
    starterCode:
      '// ✨ Production-ready, blazing fast, fully tested 🚀\nfunction findMax(nums) {\n  let max = 0;\n  for (let i = 1; i <= nums.length; i++) {\n    if (nums[i] > max) max = nums[i];\n  }\n  return max;\n}\n',
    tests: [
      { args: [[3, 7, 2]], expected: 7 },
      { args: [[9, 1, 2]], expected: 9 },
      { args: [[-5, -2, -9]], expected: -2 },
      { args: [[42]], expected: 42 },
    ],
    // Only the loop-replacing shortcuts are banned; Math.max(max, nums[i]) inside the loop is a fine fix.
    banned: [
      {
        pattern: /Math\s*\.\s*max\s*(\(\s*\.\.\.|\.\s*(apply|call)\b)/,
        message: 'Math.max(...nums) is off-limits here. Fix the loop instead!',
      },
    ],
    parSeconds: 90,
    hints: [
      'What if every number is negative? What does max start as?',
      'Look at where the loop starts and where it stops. Off-by-one: the oldest bug in the book.',
    ],
    solution:
      'function findMax(nums) {\n  let max = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    if (nums[i] > max) max = nums[i];\n  }\n  return max;\n}',
  },
  {
    id: 'fix-average',
    tier: 2,
    type: 'fix',
    title: 'The AI Did Math 🧮',
    prompt:
      'An AI wrote `average` and called it "enterprise-grade 💼". It returns `NaN` more often than numbers. Fix it: return the average of `nums`, or `0` for an empty array.',
    fnName: 'average',
    starterCode:
      '// 💼 Enterprise-grade averaging. Reviewed by nobody.\nfunction average(nums) {\n  let total = 0;\n  for (let i = 0; i <= nums.length; i++) {\n    total += nums[i];\n  }\n  return total / nums.length - 1;\n}\n',
    tests: [
      { args: [[2, 4, 6]], expected: 4 },
      { args: [[5]], expected: 5 },
      { args: [[1, 2]], expected: 1.5 },
      { args: [[-3, 3]], expected: 0 },
      { args: [[]], expected: 0 },
    ],
    parSeconds: 90,
    hints: [
      'What does nums[nums.length] give you? Adding that to a number is how NaN is born.',
      'total / nums.length - 1 subtracts AFTER dividing. And an empty array needs its own early return.',
    ],
    solution:
      'function average(nums) {\n  if (nums.length === 0) return 0;\n  let total = 0;\n  for (let i = 0; i < nums.length; i++) {\n    total += nums[i];\n  }\n  return total / nums.length;\n}',
  },
  {
    id: 'fix-count-words',
    tier: 2,
    type: 'fix',
    title: 'Words Are Hard 📝',
    prompt:
      'An AI wrote `countWords` and promised it "handles every edge case 🤖". Try an empty string. Or extra spaces. Fix it so it returns how many words are in `str`.',
    fnName: 'countWords',
    starterCode: '// 🤖 Handles every edge case (trust me)\nfunction countWords(str) {\n  return str.split(" ").length;\n}\n',
    tests: [
      { args: ['hello world'], expected: 2 },
      { args: [''], expected: 0 },
      { args: ['  lots   of   space  '], expected: 3 },
      { args: ['one'], expected: 1 },
      { args: ['tabs\tand\nnewlines too'], expected: 4 },
    ],
    parSeconds: 90,
    hints: [
      'Spaces at the start or end create empty "words". trim() is your friend.',
      'Split on any run of whitespace with /\\s+/, and treat an empty string as 0 words.',
    ],
    solution:
      "function countWords(str) {\n  const trimmed = str.trim();\n  return trimmed === '' ? 0 : trimmed.split(/\\s+/).length;\n}",
  },
]
