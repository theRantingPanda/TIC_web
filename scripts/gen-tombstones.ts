/**
 * Emit a short "this page has moved" page at each retired path that has somewhere to send
 * people.
 *
 * ---- Why this script exists ----
 *
 * It was born as a workaround and is now a deliberate choice, which is worth keeping
 * straight because the two want different lists.
 *
 * THE WORKAROUND (2026-08-19, superseded): the 17 August export was still being served at
 * these paths after the build stopped emitting them, and nothing in the repo appeared able
 * to delete a published file — so overwriting one was the only way to retire it. That
 * diagnosis was wrong. A clear-cache deploy DOES remove files the build no longer emits
 * (measured the same day: /blog.html went 200 to 404 across one, same commit, identical
 * build inputs), so a path can now be genuinely emptied and a missing artifact really is
 * a 404 — PROVIDED the deploy that drops it clears the build cache. The cache is
 * repopulated every build, so an ordinary deploy re-strands whatever it stopped emitting;
 * measured the same day on the seven paths this list shed.
 *
 * THE CHOICE (what the list means now): a 404 tells a visitor the page is gone. A
 * tombstone tells them where its subject went. So a path earns a tombstone when there is
 * a SPECIFIC page that covers what they came for — and does not when the only thing on
 * offer is the homepage, because app/not-found.tsx already says that, in the site's own
 * design, with the right status code. Five paths were dropped from this list on that
 * test.
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
type StrandedAsset = { path: string; kind: 'json' | 'pdf'; was?: string }

const contract: {
  tombstoned?: { paths: Tombstone[] }
  strandedAssets?: { paths: StrandedAsset[] }
} = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'url-contract.json'), 'utf8'))

const entries = contract.tombstoned?.paths ?? []
const assets = contract.strandedAssets?.paths ?? []

const RETIRED_LINE = 'This file was retired from the public site and is no longer distributed here.'

/**
 * A complete, valid one-page PDF, written byte by byte.
 *
 * Needed because the only way to stop serving a stranded PDF is to publish a different
 * one at the same path, and shipping a broken file would trade a real document for a
 * download error. Offsets are computed rather than hand-counted: an xref table with the
 * wrong byte positions is exactly the kind of thing that works in one reader and not in
 * the next.
 */
function stubPdf(): Buffer {
  const text = `BT /F1 12 Tf 60 780 Td (${RETIRED_LINE}) Tj ET`
  const objects = [
    '<</Type/Catalog/Pages 2 0 R>>',
    '<</Type/Pages/Kids[3 0 R]/Count 1>>',
    '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>',
    '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
    `<</Length ${text.length}>>\nstream\n${text}\nendstream`,
  ]

  let body = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((object, index) => {
    offsets.push(body.length)
    body += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const startxref = body.length
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (const offset of offsets) body += `${String(offset).padStart(10, '0')} 00000 n \n`
  body += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${startxref}\n%%EOF\n`

  return Buffer.from(body, 'latin1')
}

/** The manifest keeps its shape so anything still parsing it gets an empty list, not a crash. */
function stubJson(asset: StrandedAsset): string {
  return `${JSON.stringify({ version: 1, retired: true, note: RETIRED_LINE, forms: [] }, null, 2)}\n`
}

/*
  Two pages, chosen by the destination.

  Every path on the list now points at a real replacement, so in practice only the second
  wording is reachable. The `/`-destination branch is kept anyway: it costs nothing, and
  it is what makes adding a homepage-destination entry safe rather than silently wrong.
  Prefer dropping such a path from the contract entirely — see the header.

  The copy branches on the same condition the button already did, rather than one wording
  covering both. The heading carries it: a person who has landed somewhere unexpected
  reads that first and often nothing else.
*/
function page({ destination }: Tombstone): string {
  const home = destination === '/'
  const title = home ? 'This page is no longer here' : 'This page has moved'
  const lead = home
    ? `We retired this page. If you were sent this link, the answer you were after has
    probably moved, and we are happy to give it to you directly.`
    : `The page you followed is not at this address any more. What it covered is here:`
  const tail = home
    ? `Email <a href="mailto:hello@asktic.com">hello@asktic.com</a> and tell us what you were
    looking for.`
    : `If that is not what you were after, email
    <a href="mailto:hello@asktic.com">hello@asktic.com</a> and tell us what you were looking for.`
  return `<!DOCTYPE html>
<html lang="en-SG" ${TOMBSTONE_MARKER}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<link rel="canonical" href="https://www.asktic.com${destination}">
<title>${title} | The Insurance Concierge</title>
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
  <h1>${title}</h1>
  <p>${lead}</p>
  <a class="go" href="${destination}">${home ? 'Go to the homepage' : 'Continue'}</a>
  <p style="margin-top:1.5rem">${tail}</p>
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

/*
  Stranded non-HTML files. The list is EMPTY as of 2026-08-19 and the machinery is kept
  for the shape of the problem, not for a current case: a JSON index and a PDF cannot
  carry a noindex or a link, so if one ever has to be neutralised in place, each is
  replaced by the smallest valid file of its own type that says so.

  The two original entries were removed once a clear-cache deploy was proven to empty a
  path. A 404 beats a stub for both: nothing "moves onward" from a manifest, and a
  617-byte PDF reading "retired" is a worse answer than the file not being there.
*/
if (assets.length > 0) {
  console.log(`\nOverwriting ${assets.length} stranded asset(s)…`)
  for (const asset of assets) {
    const relative = asset.path.replace(/^\//, '')
    const full = path.join(OUT_DIR, relative)

    if (fs.existsSync(full)) {
      console.error(`  ✗ ${asset.path} — the build already emits this. Remove it from`)
      console.error(`    url-contract.json → strandedAssets rather than burying it.`)
      process.exit(1)
    }

    fs.mkdirSync(path.dirname(full), { recursive: true })
    fs.writeFileSync(full, asset.kind === 'pdf' ? stubPdf() : stubJson(asset))
    const size = fs.statSync(full).size
    console.log(`  ✓ ${asset.path.padEnd(52)} ${asset.kind}, ${size} bytes`)
  }
}
