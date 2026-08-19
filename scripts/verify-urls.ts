/**
 * URL contract guard.
 *
 * The hard constraint on this rebuild is that every indexed path keeps working. This
 * script asserts, against the real build output, that:
 *
 *   0. out/ was produced by the CURRENT source — see the staleness check below
 *   1. every path in content/url-contract.json -> preserved emits an artifact in out/
 *   2. every path in -> redirectOnly emits NO artifact (those are render.yaml redirects;
 *      shipping a real page at /file-access would silently shadow the redirect)
 *   3. every path in -> tombstoned emits a TOMBSTONE, and every other dropped path emits
 *      nothing. The two are opposite requirements on the same list, which is the point:
 *      a tombstoned path is one the live disk is still serving, so the only way to retire
 *      it is to overwrite it. Losing the artifact does not restore a 404 there — it
 *      restores the 17 August page.
 *   4. every nav href in lib/site.ts points at a preserved path
 *
 * Run after `npm run build`. Exits non-zero on any violation.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { STAMP_FILE, computeInputHash } from './lib/build-stamp.ts'
import { TOMBSTONE_MARKER } from './lib/tombstone.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'out')

type Contract = {
  preserved: { path: string; note?: string }[]
  redirectOnly: { path: string; destination: string; status: number }[]
  dropped?: { groups: { reason: string; paths: string[] }[] }
  tombstoned?: { paths: { path: string; destination: string; note?: string }[] }
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

/**
 * ---- Check 0: is out/ actually the current build? ----
 *
 * Everything below asserts against files in out/. If those files came from an earlier
 * build, a green result means nothing — which is exactly what happened on 2026-08-11: a
 * build failed, out/ still held the previous good export, and this script reported the
 * contract holding. The stamp is written by the second half of `npm run build`, so a
 * failed build leaves the old one behind and the hashes no longer agree.
 */
console.log('Checking out/ is current…')
const stampPath = path.join(OUT_DIR, STAMP_FILE)

if (!fs.existsSync(stampPath)) {
  console.error(
    `✗ out/${STAMP_FILE} is missing — out/ was not produced by \`npm run build\`.\n` +
      `  Anything checked against it would be meaningless. Run \`npm run build\`.`,
  )
  process.exit(1)
}

const stamp: { inputHash?: string; builtAt?: string } = JSON.parse(
  fs.readFileSync(stampPath, 'utf8'),
)
const { hash: currentHash } = computeInputHash()

if (stamp.inputHash !== currentHash) {
  console.error(
    `✗ out/ is STALE — it does not match the current source.\n` +
      `    built from: ${stamp.inputHash?.slice(0, 12) ?? '(unknown)'}${
        stamp.builtAt ? ` at ${stamp.builtAt}` : ''
      }\n` +
      `    source now: ${currentHash.slice(0, 12)}\n\n` +
      `  Either the build failed and left the previous export in place, or sources\n` +
      `  changed after it. Re-run \`npm run build\` and check that it SUCCEEDS before\n` +
      `  trusting this check — a passing contract against a stale out/ proves nothing.`,
  )
  process.exit(1)
}

console.log(`  ✓ out/ matches the current source (built ${stamp.builtAt ?? 'unknown'})\n`)

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

/*
  Tombstoned paths are dropped paths the live disk is STILL SERVING, so they invert the
  rule below: they must emit, and what they emit must be a tombstone rather than a real
  page. See content/url-contract.json → tombstoned.
*/
const tombstones = contract.tombstoned?.paths ?? []
const tombstonedSet = new Set(tombstones.map((t) => t.path))
if (tombstones.length > 0) {
  console.log(`\nChecking ${tombstones.length} tombstoned path(s) overwrite the stale files…`)
  for (const entry of tombstones) {
    const artifact = artifactFor(entry.path)
    if (!artifact) {
      failures.push(
        `Tombstoned path ${entry.path} emitted nothing. That does not make it a 404 — it ` +
          `leaves the 17 August page in place on Render, because the publish is additive. ` +
          `Check scripts/gen-tombstones.ts still runs in \`npm run build\`.`,
      )
      console.error(`  ✗ ${entry.path.padEnd(52)} MISSING`)
      continue
    }
    const body = fs.readFileSync(path.join(OUT_DIR, artifact), 'utf8')
    if (!body.includes(TOMBSTONE_MARKER)) {
      failures.push(
        `Tombstoned path ${entry.path} emitted out/${artifact}, but it is not a tombstone. ` +
          `A real page here would be published over the stale one, which is fine, but the ` +
          `contract says this path is retired — reconcile the two before shipping.`,
      )
      console.error(`  ✗ ${entry.path.padEnd(52)} NOT A TOMBSTONE`)
    } else if (!body.includes('name="robots" content="noindex"')) {
      failures.push(
        `Tombstone for ${entry.path} is missing its noindex. Without it the path stays in ` +
          `the index indefinitely, which is the only thing this file is for.`,
      )
      console.error(`  ✗ ${entry.path.padEnd(52)} NO NOINDEX`)
    } else {
      console.log(`  ✓ ${entry.path.padEnd(52)} -> ${entry.destination}`)
    }
  }
}

// Deliberately dropped paths are a signed-off exception to URL preservation. Assert
// they stay dropped, so nobody restores them later on the strength of the old sitemap.
// Tombstoned paths are excluded: they are checked above, under the opposite rule.
const droppedPaths = (contract.dropped?.groups ?? [])
  .flatMap((g) => g.paths)
  .filter((p) => !tombstonedSet.has(p))
if (droppedPaths.length > 0) {
  console.log(`\nChecking ${droppedPaths.length} dropped path(s) emit nothing…`)
  let restored = 0
  for (const path of droppedPaths) {
    const artifact = artifactFor(path)
    if (artifact) {
      restored++
      failures.push(
        `Dropped path ${path} emitted out/${artifact} — it was deliberately not ` +
          `preserved (see content/url-contract.json → dropped).`,
      )
      console.error(`  ✗ ${path.padEnd(36)} UNEXPECTED out/${artifact}`)
    }
  }
  if (restored === 0) console.log('  ✓ all dropped paths absent')
}

console.log('\nChecking nav links resolve to preserved paths…')
const siteSource = fs.readFileSync(path.join(ROOT, 'lib', 'site.ts'), 'utf8')
const preservedSet = new Set(contract.preserved.map((p) => p.path))
const navHrefs = [...siteSource.matchAll(/href:\s*'([^']+)'/g)]
  .map((m) => m[1])
  // The contract governs this site's own paths. Off-site links (the footer's social
  // profiles, mailto:) have no entry and never will — checking them would force every
  // external link to be added to the contract as a fiction.
  .filter((href) => href.startsWith('/'))
  // An in-page anchor resolves to the page it hangs off, and it is that page the
  // contract governs. `/#talk-to-us` is the header's CTA, which scrolls to the enquiry
  // form on the homepage; it must check as `/`. Without this the guard would reject
  // every anchor link and the only way to ship one would be to move it out of this
  // file, which is exactly where it should not go.
  .map((href) => href.split('#')[0] || '/')
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
