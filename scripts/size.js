// Size budgets, enforced. The README and the docs page both make a
// compressed-size claim; this is what stops that claim from quietly rotting.
//
// Budgets are brotli bytes and sit a little above the current numbers, so
// ordinary changes pass and a regression of any real size does not.

import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { fileURLToPath } from 'url'

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist')

// The published 2.0.1 bundle, for reference. Clicking a marker and flying to
// it has to stay under this, which is the whole point of the layer split.
const BASELINE = 5177

const FILES = [
  { file: 'index.esm.js', budget: 5300 },
  { file: 'lite.js', budget: 4100 },
  { file: 'fly.js', budget: 500 },
  { file: 'pick.js', budget: 1200 },
]

const COMBOS = [
  { name: 'lite + fly', parts: ['lite.js', 'fly.js'], budget: 4600 },
  { name: 'lite + pick', parts: ['lite.js', 'pick.js'], budget: BASELINE },
]

const brotli = (file) =>
  zlib.brotliCompressSync(fs.readFileSync(path.join(distDir, file))).length

let failed = false

const line = (name, size, budget) => {
  const over = size > budget
  if (over) failed = true
  console.log(
    `  ${over ? 'OVER' : 'ok  '}  ${name.padEnd(16)}${String(size).padStart(6)} / ${String(budget).padStart(6)} B`,
  )
}

console.log('')
console.log('  brotli sizes against budget')
const sizes = {}
for (const { file, budget } of FILES) {
  sizes[file] = brotli(file)
  line(file, sizes[file], budget)
}

console.log('')
console.log('  configurations')
for (const { name, parts, budget } of COMBOS) {
  line(
    name,
    parts.reduce((a, p) => a + sizes[p], 0),
    budget,
  )
}
console.log('')

if (failed) {
  console.error('  Size budget exceeded. Either trim it or raise the budget')
  console.error('  deliberately - and update the numbers on the docs page.')
  process.exit(1)
}
