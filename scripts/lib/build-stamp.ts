import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { ROOT } from './paths.ts'

/**
 * Fingerprints the inputs that decide what `next build` emits.
 *
 * `npm run verify:urls` asserts the URL contract against whatever sits in out/. That is
 * only meaningful if out/ was produced by the current source — and on 2026-08-11 it was
 * not: a build failed, out/ still held the previous good export, and verify:urls
 * reported the contract holding. It was checking a stale artifact and had no way to
 * know.
 *
 * So the build writes a stamp of these inputs into out/, and verify:urls recomputes it.
 * A failed build leaves the previous stamp in place, which no longer matches, and the
 * check fails loudly instead of reassuring.
 */

export const STAMP_FILE = '.build-stamp.json'

/** Directories whose contents reach the build. */
const INPUT_DIRS = ['app', 'components', 'lib', 'content', 'public']

/** Files whose contents reach the build. */
const INPUT_FILES = [
  'next.config.ts',
  'package.json',
  'package-lock.json',
  'postcss.config.mjs',
  'tsconfig.json',
]

/**
 * content/_inventory is the capture archive. The build never reads it — it is a record,
 * hand-ported from — so a re-capture must not invalidate a perfectly good export. It is
 * also ~20 MB, which is the difference between a fast check and an annoying one.
 */
const EXCLUDED = [path.join('content', '_inventory')]

function isExcluded(relative: string): boolean {
  return EXCLUDED.some(
    (excluded) => relative === excluded || relative.startsWith(`${excluded}${path.sep}`),
  )
}

function walk(dir: string, relativeBase: string, out: string[]): void {
  if (!fs.existsSync(dir)) return

  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const relative = path.join(relativeBase, entry.name)
    if (isExcluded(relative)) continue

    if (entry.isDirectory()) {
      walk(path.join(dir, entry.name), relative, out)
    } else if (entry.isFile()) {
      out.push(relative)
    }
  }
}

/**
 * A hash of every build input, by path and content.
 *
 * Content rather than mtime on purpose: a fresh clone, a checkout, or a `touch` all
 * change mtimes without changing what gets built, and a guard that cries wolf gets
 * ignored — which would leave us exactly where we started.
 */
export function computeInputHash(): { hash: string; fileCount: number } {
  const files: string[] = []
  for (const dir of INPUT_DIRS) walk(path.join(ROOT, dir), dir, files)
  for (const file of INPUT_FILES) {
    if (fs.existsSync(path.join(ROOT, file))) files.push(file)
  }
  files.sort()

  const hash = createHash('sha256')
  for (const file of files) {
    // Path as well as content: a rename changes what ships even when no byte does.
    hash.update(file)
    hash.update('\0')
    hash.update(fs.readFileSync(path.join(ROOT, file)))
    hash.update('\0')
  }

  return { hash: hash.digest('hex'), fileCount: files.length }
}
