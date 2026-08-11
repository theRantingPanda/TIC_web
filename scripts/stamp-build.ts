/**
 * Writes the build stamp into out/, so `npm run verify:urls` can tell whether the
 * export it is checking was produced by the current source.
 *
 * Runs as the second half of `npm run build`. If `next build` fails, this never runs,
 * the previous stamp stays in out/, and verify:urls sees the mismatch.
 *
 * Usage: npm run build   (not normally run on its own)
 */
import fs from 'node:fs'
import path from 'node:path'
import { STAMP_FILE, computeInputHash } from './lib/build-stamp.ts'
import { ROOT } from './lib/paths.ts'

const OUT_DIR = path.join(ROOT, 'out')

function main(): void {
  if (!fs.existsSync(OUT_DIR)) {
    console.error(
      `✗ out/ does not exist — nothing to stamp. Did \`next build\` actually export?`,
    )
    process.exit(1)
  }

  const { hash, fileCount } = computeInputHash()
  fs.writeFileSync(
    path.join(OUT_DIR, STAMP_FILE),
    `${JSON.stringify({ version: 1, inputHash: hash, inputFileCount: fileCount, builtAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8',
  )

  console.log(`✓ Stamped out/${STAMP_FILE} (${fileCount} input files)`)
}

main()
