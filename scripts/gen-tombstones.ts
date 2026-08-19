/**
 * Overwrite the stale files still being served from the 17 August export.
 *
 * ---- Why this script exists at all ----
 *
 * Render's static publish is ADDITIVE. It writes whatever the build emits and leaves
 * everything else in place, forever. When /knowledge, /forms and the twelve articles were
 * retired from this repo they stopped being emitted — so they stopped being updated, and
 * carried on being served exactly as they were on 17 August: complete, readable, with
 * navigation pointing at /knowledge. The retirement never reached anyone holding a link.
 *
 * Nothing in this repo can delete a published file. But the same additive publish that
 * stranded them will overwrite a file the build DOES emit, and that is the entire
 * mechanism here: emit a small page at each stale path and the retired article is gone on
 * the next deploy.
 *
 * ---- What it deliberately does not do ----
 *
 * NO META REFRESH. These are 200s, not redirects, and bouncing someone who followed a
 * real link to a page they did not ask for is worse than telling them what happened. The
 * destination is offered as a link.
 *
 * NO ROBOTS DISALLOW anywhere for these paths. `noindex` is what gets them out of the
 * index, and a crawler has to fetch the page to see it. See the note in the contract.
 *
 * The list lives in content/url-contract.json under `tombstoned`, not here, so the paths
 * and their destinations sit beside the record of why they are dropped in the first place.
 *
 * Runs after `next build` and before the stamp. Writes into out/ rather than public/:
 * these are generated, and fifteen near-identical files in the source tree is how they
 * end up edited by hand and drifting.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// Shared with scripts/verify-urls.ts. See the note in that module for why it is not here.
import { TOMBSTONE_MARKER } from './lib/tombstone.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'out')


type Tombstone = { path: string; destination: string; note?: string }

const contract: { tombstoned?: { paths: Tombstone[] } } = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'content', 'url-contract.json'), 'utf8'),
)

const entries = contract.tombstoned?.paths ?? []

function page({ destination }: Tombstone): string {
  const home = destination === '/'
  return `<!DOCTYPE html>
<html lang="en-SG" ${TOMBSTONE_MARKER}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<link rel="canonical" href="https://www.asktic.com${destination}">
<title>This page is no longer here | The Insurance Concierge</title>
<style>
  :root { color-scheme: light }
  body {
    margin: 0; padding: 12vh 6vw; background: #f0efea; color: #16231a;
    font: 16px/1.6 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  main { max-width: 34rem }
  h1 { font-size: 1.6rem; line-height: 1.3; margin: 0 0 1rem; font-weight: 600 }
  p { margin: 0 0 1rem; color: #4b5652 }
  a { color: #1f5fa9 }
  .go {
    display: inline-block; margin-top: .5rem; padding: .75rem 1.25rem; border-radius: .5rem;
    background: #16231a; color: #f7f6f3; text-decoration: none; font-weight: 500;
  }
</style>
</head>
<body>
<main>
  <h1>This page is no longer here</h1>
  <p>
    We retired our public articles and forms. If you were sent this link, the answer you
    were after has probably moved, and we are happy to give it to you directly.
  </p>
  <p>
    Email <a href="mailto:hello@asktic.com">hello@asktic.com</a> and tell us what you were
    looking for.
  </p>
  <a class="go" href="${destination}">${home ? 'Go to the homepage' : 'See the page that covers this'}</a>
</main>
</body>
</html>
`
}

if (entries.length === 0) {
  console.log('No tombstoned paths in the contract — nothing to write.')
  process.exit(0)
}

if (!fs.existsSync(OUT_DIR)) {
  console.error('✗ out/ not found — run `next build` first.')
  process.exit(1)
}

console.log(`Writing ${entries.length} tombstone(s) into out/…`)
for (const entry of entries) {
  const relative = `${entry.path.replace(/^\//, '')}.html`
  const full = path.join(OUT_DIR, relative)

  /*
    Refuse to clobber a real page. If a path here ever becomes a live route again, the
    right fix is to take it out of the contract, not to have the build quietly bury it.
  */
  if (fs.existsSync(full) && !fs.readFileSync(full, 'utf8').includes(TOMBSTONE_MARKER)) {
    console.error(`  ✗ ${entry.path} — out/${relative} is a real page. Remove it from`)
    console.error(`    url-contract.json → tombstoned before shipping this.`)
    process.exit(1)
  }

  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, page(entry))
  console.log(`  ✓ ${entry.path.padEnd(52)} -> ${entry.destination}`)
}
