/**
 * Public copy guard.
 *
 * Asserts that no insurer is named, and that the firm's panel is not described, anywhere
 * in the built output. Both are standing rules from the homepage copy deck:
 *
 *   - "No insurer names anywhere in public page copy or meta."
 *   - "No claim, stated or implied, about market coverage."
 *
 * This exists for the same reason scripts/verify-urls.ts does. Three published posts
 * carried the panel roster in their body copy for months without anyone noticing, and a
 * rule that lives only in a document is a rule that comes back the next time someone
 * writes a helpful paragraph. Enforced beats documented.
 *
 * It scans `out/`, not source, so it sees whatever a visitor sees regardless of which
 * layer put it there — MDX body, a metadata description, an image alt, a served JSON
 * file. Run after `npm run build`.
 *
 * Formal disclosure of appointments is a real obligation, but it belongs in the advisory
 * documentation, not in marketing copy. This guard is about the public site only.
 *
 * ⚠ THERE IS NO LONGER ANY EXEMPTION. /forms, the member file library, was the single
 * route where an insurer could be named — it was grouped by insurer because that is how a
 * member holds the problem, the name being printed on their schedule. That page was
 * retired from the public site on 2026-08-17 and moved to the CRM, so the carve-out went
 * with it. Every route now fails on an insurer name. Do not reintroduce a path-based
 * exemption without the page that justified it.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'out')

/**
 * Terms that are unambiguous on their own.
 *
 * Matched with word boundaries, which matters more than it looks: a naive substring
 * search for `aig` matches "straightforward" and `axa` matches "maxAge". Both produced
 * false positives during the audit that found the real violations.
 */
const SOLO_TERMS = [
  'Allianz',
  'BUPA',
  'NowHealth',
  'Prudential',
  'Cigna',
  'AXA',
  'AIG',
  'AIA',
  'Manulife',
  'Singlife',
  'MSIG',
  'Chubb',
  'Generali',
]

/**
 * Names whose individual words are ordinary English and must only be flagged as a phrase.
 *
 * `Income` alone would fire on /income-preservation-1 and on any sentence about income.
 * `April` is a month. `Liberty`, `Great` and `Eastern` are all common words.
 */
const PHRASE_TERMS = [
  'BUPA Global',
  'April International',
  'NTUC Income',
  'Raffles Health',
  'Now Health',
  'Great Eastern',
  'Tokio Marine',
  'Liberty Insurance',
]

/**
 * Phrasings that expose the panel without naming anyone.
 *
 * The deck's position is that the reader must not be able to infer panel composition or
 * size, and that nothing may imply the firm surveys the whole market.
 */
const PANEL_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'panel reference', pattern: /\b(our|the)\s+panel\b/gi },
  { label: 'panel reference', pattern: /\binsurers?\s+on\s+our\s+panel\b/gi },
  { label: 'panel reference', pattern: /\bpanel\s+of\s+insurers\b/gi },
  { label: 'panel reference', pattern: /\bour\s+appointed\s+insurers\b/gi },
  { label: 'market-coverage claim', pattern: /\ball\s+(major\s+)?insurers\b/gi },
  { label: 'market-coverage claim', pattern: /\bthe\s+(whole|entire)\s+market\b/gi },
  { label: 'market-coverage claim', pattern: /\bevery\s+(major\s+)?(insurer|provider)\b/gi },
]

/** Government and statutory schemes. Correct to publish, never flagged. */
const ALLOWED = ['MediShield Life', 'Integrated Shield Plan', 'MediSave', 'CareShield']

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const termPatterns = [
  ...SOLO_TERMS.map((t) => ({
    label: 'insurer name',
    pattern: new RegExp(`\\b${escapeRegExp(t)}\\b`, 'gi'),
  })),
  ...PHRASE_TERMS.map((t) => ({
    label: 'insurer name',
    // Tolerate a line break or extra spacing between the words of a phrase.
    pattern: new RegExp(`\\b${escapeRegExp(t).replace(/\s+/g, '\\s+')}\\b`, 'gi'),
  })),
]

/** Files a visitor can actually read. Binary assets are not scanned. */
const SCANNED_EXTENSIONS = new Set(['.html', '.txt', '.json', '.xml', '.svg', '.webmanifest'])

function walk(dir: string): string[] {
  const found: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // Framework chunks are vendor code, not copy.
      if (entry.name === '_next') continue
      found.push(...walk(full))
    } else if (SCANNED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      found.push(full)
    }
  }
  return found
}

/** Strip tags and scripts so we judge what is read, not what is markup. */
function readableText(file: string): string {
  const raw = fs.readFileSync(file, 'utf8')
  if (path.extname(file).toLowerCase() !== '.html') return raw
  return raw
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
}

type Hit = { file: string; label: string; term: string; context: string }

const hits: Hit[] = []

if (!fs.existsSync(OUT_DIR)) {
  console.error('✗ out/ not found — run `npm run build` first.')
  process.exit(1)
}

const files = walk(OUT_DIR)
console.log(`Scanning ${files.length} built file(s) for insurer names and panel references…`)

for (const file of files) {
  const text = readableText(file)
  const relative = path.relative(OUT_DIR, file)

  for (const { label, pattern } of [...termPatterns, ...PANEL_PATTERNS]) {
    pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = pattern.exec(text)) !== null) {
      const start = Math.max(0, match.index - 60)
      const context = text
        .slice(start, match.index + match[0].length + 60)
        .replace(/\s+/g, ' ')
        .trim()

      // A statutory scheme mentioned nearby is not an insurer reference.
      if (ALLOWED.some((allowed) => context.includes(allowed) && !match![0].includes(' '))) {
        const isSchemeWord = ALLOWED.some((allowed) => allowed.includes(match![0]))
        if (isSchemeWord) continue
      }

      hits.push({ file: relative, label, term: match[0], context })
    }
  }
}

if (hits.length > 0) {
  // One line per distinct term+file, so a name repeated in a page does not bury the rest.
  const seen = new Set<string>()
  console.error(`\n✗ Public copy rule violated (${hits.length} occurrence(s)):\n`)
  for (const hit of hits) {
    const key = `${hit.file}::${hit.term.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    console.error(`  ${hit.label}: "${hit.term}"`)
    console.error(`    in out/${hit.file}`)
    console.error(`    …${hit.context}…\n`)
  }
  console.error(
    'The copy deck rules are: no insurer names anywhere in public page copy or meta,\n' +
      'and no claim, stated or implied, about market coverage. Fix the SOURCE, not out/.\n' +
      'Statutory schemes (MediShield Life, Integrated Shield Plans) are fine to name.',
  )
  process.exit(1)
}

console.log('\n✓ No insurer names or panel references in public copy.')
