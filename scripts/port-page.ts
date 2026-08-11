/**
 * Phase 3 — port a captured long-form page into content/pages/ as MDX.
 *
 * For pages that are essentially a document: a title and a long run of prose, headings
 * and lists, with no bespoke layout. `/privacy` is the case this exists for — 9,500
 * characters of legal text that would be unreadable and unmaintainable as JSX.
 *
 * Pages with a real layout (cards, grids, image/heading/copy groups) are NOT this:
 * those are ported as route components, where the structure lives in the markup.
 *
 * REFUSES TO OVERWRITE by default; pass --force to overwrite deliberately.
 *
 * Usage: npm run port:page -- /privacy [--force]
 */
import fs from 'node:fs'
import path from 'node:path'
import {
  blocksToMarkdown,
  dropListEchoes,
  isBlankBlock,
  unnestListItems,
  type Block,
} from './lib/blocks.ts'
import { PAGES_DIR, ROOT, ensureDir, pathToSlug } from './lib/paths.ts'

const PAGES_CONTENT_DIR = path.join(ROOT, 'content', 'pages')

type Capture = {
  path: string
  url: string
  title: string
  metaDescription: string
  h1: string
  blocks: Block[]
}

function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

function main(): void {
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const targets = args.filter((a) => !a.startsWith('--'))

  if (targets.length === 0) {
    console.error('Usage: npm run port:page -- /privacy [--force]')
    process.exit(1)
  }

  for (const pagePath of targets) {
    const slug = pathToSlug(pagePath)
    const capturePath = path.join(PAGES_DIR, `${slug}.json`)

    if (!fs.existsSync(capturePath)) {
      console.error(`No capture for ${pagePath} — expected ${capturePath}`)
      process.exit(1)
    }

    const capture: Capture = JSON.parse(fs.readFileSync(capturePath, 'utf8'))
    const destination = path.join(PAGES_CONTENT_DIR, `${slug}.mdx`)

    if (fs.existsSync(destination) && !force) {
      console.log(`  skip   ${pagePath} (already ported — pass --force to overwrite)`)
      continue
    }

    // The h1 is rendered by the route from frontmatter, so drop it from the body.
    const [first, ...rest] = capture.blocks
    const body = first?.type === 'heading' && first.level === 1 ? rest : capture.blocks

    // Order matters: echo removal compares against the ORIGINAL item text, so it has to
    // run before unnesting rewrites any of it.
    const prepared = unnestListItems(dropListEchoes(body)).filter((b) => !isBlankBlock(b))
    const markdown = blocksToMarkdown(prepared)

    const frontmatter = [
      `slug: ${quote(slug)}`,
      `title: ${quote(capture.h1 || capture.title)}`,
      `sourceUrl: ${quote(capture.url)}`,
    ]

    ensureDir(path.dirname(destination))
    fs.writeFileSync(
      destination,
      `---\n${frontmatter.join('\n')}\n---\n\n${markdown}\n`,
      'utf8',
    )
    console.log(`  write  ${pagePath} -> ${path.relative(ROOT, destination)}`)
  }
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
