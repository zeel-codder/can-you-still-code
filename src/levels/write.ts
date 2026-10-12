import type { CodeLevel } from './types'

/** Tier 1 warm-ups: write a small function from scratch. One is picked per run. */
export const WRITE_LEVELS: CodeLevel[] = [
  {
    id: 'fizzbuzz',
    tier: 1,
    type: 'write',
    title: 'FizzBuzz: The Interview Classic',
    prompt:
      'Filtering devs since forever. Return an array of strings for 1..n: multiples of 3 → `"Fizz"`, multiples of 5 → `"Buzz"`, both → `"FizzBuzz"`, anything else → the number as a string.',
    fnName: 'fizzBuzz',
    starterCode: 'function fizzBuzz(n) {\n  // you have definitely seen this before\n}\n',
    tests: [
      { args: [1], expected: ['1'] },
      { args: [5], expected: ['1', '2', 'Fizz', '4', 'Buzz'] },
      {
        args: [15],
        expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'],
      },
    ],
    parSeconds: 90,
    hints: [
      'Check the "both" case (divisible by 15) FIRST. Order matters, like in a group project.',
      'i % 3 === 0 means i is a multiple of 3. Use String(i) for the boring ones.',
    ],
    solution:
      "function fizzBuzz(n) {\n  const out = []\n  for (let i = 1; i <= n; i++) {\n    if (i % 15 === 0) out.push('FizzBuzz')\n    else if (i % 3 === 0) out.push('Fizz')\n    else if (i % 5 === 0) out.push('Buzz')\n    else out.push(String(i))\n  }\n  return out\n}",
  },
  {
    id: 'reverse-string',
    tier: 1,
    type: 'write',
    title: 'Backwards Day 🔄',
    prompt: 'Return `str` reversed: `"hello"` → `"olleh"`. A gentle warm-up for your typing fingers.',
    fnName: 'reverseString',
    starterCode: 'function reverseString(str) {\n  // .gnitirw dnah yppaH\n}\n',
    tests: [
      { args: ['hello'], expected: 'olleh' },
      { args: [''], expected: '' },
      { args: ['a'], expected: 'a' },
      { args: ['AI is cool'], expected: 'looc si IA' },
    ],
    parSeconds: 60,
    hints: [
      'Strings can become arrays, and arrays know how to flip themselves.',
      "str.split('').reverse().join('') — or a loop from the last character to the first.",
    ],
    solution: "function reverseString(str) {\n  return str.split('').reverse().join('')\n}",
  },
  {
    id: 'count-vowels',
    tier: 1,
    type: 'write',
    title: 'Vowel Hunter 🔍',
    prompt: 'Return how many vowels (`a e i o u`, any case) are in `str`. Y is not invited.',
    fnName: 'countVowels',
    starterCode: 'function countVowels(str) {\n  // aeiou, assemble\n}\n',
    tests: [
      { args: ['hello'], expected: 2 },
      { args: ['AEIOU'], expected: 5 },
      { args: ['rhythm'], expected: 0 },
      { args: [''], expected: 0 },
      { args: ['Programming is fun'], expected: 5 },
    ],
    parSeconds: 75,
    hints: [
      'Loop over each character and check whether "aeiou" includes it.',
      'Uppercase vowels count too, so lowercase the string first.',
    ],
    solution:
      "function countVowels(str) {\n  let count = 0\n  for (const ch of str.toLowerCase()) if ('aeiou'.includes(ch)) count++\n  return count\n}",
  },
  {
    id: 'palindrome',
    tier: 1,
    type: 'write',
    title: 'Palindrome Detector 🪞',
    prompt:
      'Return `true` if `str` reads the same forwards and backwards, ignoring case and anything that isn’t a letter or digit. "Taco cat" says hi.',
    fnName: 'isPalindrome',
    starterCode: 'function isPalindrome(str) {\n  // racecar, but make it code\n}\n',
    tests: [
      { args: ['A man, a plan, a canal: Panama'], expected: true },
      { args: ['hello'], expected: false },
      { args: [''], expected: true },
      { args: ["No 'x' in Nixon"], expected: true },
      { args: ['ab'], expected: false },
    ],
    parSeconds: 90,
    hints: [
      'Clean the string first: lowercase it and remove everything that isn’t a-z or 0-9.',
      "str.toLowerCase().replace(/[^a-z0-9]/g, '') — then compare it with its reverse.",
    ],
    solution:
      "function isPalindrome(str) {\n  const s = str.toLowerCase().replace(/[^a-z0-9]/g, '')\n  return s === s.split('').reverse().join('')\n}",
  },
]
