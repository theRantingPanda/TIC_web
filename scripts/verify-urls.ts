/**
 * URL contract guard.
 *
 * The hard constraint on this rebuild is that every indexed path keeps working. This
 * script asserts, against the real build output, that:
 *
 *   1. every path in content/url-contract.json -> preserved emits an artifact in out/
 *   2. every path in -> redirectOnly emits NO artifact (those are render.yaml redirects;
 *      shipping a real page at /file-access would silently shadow the redirect)
 *   3. every nav href in lib/site.ts points at a preserved path
 *
 * Run after `npm run build`. Exits non-zero on any violation.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'out')

type Contract = {
  preserved: { path: string; note?: string }[]
  redirectOnly: { path: string; destination: string; status: number }[]
}

const contract: Contract = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content', 'url-contract.json'), 'utf8'),
)

/** Static export emits either `<p>.html` or `<p>/index.html` depending on config. */
function artifactFor(urlPath: string): string | null {
  const candidates =
    urlPath === '/'
      ? ['index.html']
      : [`${urlPath.replace(/^\//, '')}.html`, `${urlPath.replace(/^\//, '')}/index.html`]

  for (const candidate of candidates) {
    const full = path.join(OUT_DIR, candidate)
    if (fs.existsSync(full)) return path.relative(OUT_DIR, full)
  }
  return null
}

const failures: string[] = []

if (!fs.existsSync(OUT_DIR)) {
  console.error('✗ out/ not found — run `npm run build` first.')
  process.exit(1)
}

console.log('Checking preserved paths…')
for (const entry of contract.preserved) {
  const artifact = artifactFor(entry.path)
  if (artifact) {
    console.log(`  ✓ ${entry.path.padEnd(36)} -> out/${artifact}`)
  } else {
    failures.push(`Preserved path ${entry.path} emitted no artifact in out/`)
    console.error(`  ✗ ${entry.path.padEnd(36)} MISSING`)
  }
}

console.log('\nChecking redirect-only paths emit nothing…')
for (const entry of contract.redirectOnly) {
  const artifact = artifactFor(entry.path)
  if (artifact) {
    failures.push(
      `Redirect-only path ${entry.path} emitted out/${artifact} — it would shadow the ` +
        `${entry.status} to ${entry.destination} configured in render.yaml.`,
    )
    console.error(`  ✗ ${entry.path.padEnd(36)} UNEXPECTED out/${artifact}`)
  } else {
    console.log(`  ✓ ${entry.path.padEnd(36)} -> ${entry.status} ${entry.destination}`)
  }
}

console.log('\nChecking nav links resolve to preserved paths…')
const siteSource = fs.readFileSync(path.join(ROOT, 'lib', 'site.ts'), 'utf8')
const preservedSet = new Set(contract.preserved.map((p) => p.path))
const navHrefs = [...siteSource.matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1])
for (const href of new Set(navHrefs)) {
  if (preservedSet.has(href)) {
    console.log(`  ✓ ${href}`)
  } else {
    failures.push(`Nav href ${href} in lib/site.ts is not a preserved path`)
    console.error(`  ✗ ${href} not in url-contract.json`)
  }
}

if (failures.length > 0) {
  console.error(`\n✗ URL contract violated (${failures.length}):`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log('\n✓ URL contract holds.')
