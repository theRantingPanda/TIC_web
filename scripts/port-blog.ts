/**
 * Phase 3 — port the captured Wix blog posts into content/blog/ as MDX.
 *
 * Reads the captures in content/_inventory/pages/, strips the Wix chrome, converts the
 * remaining blocks to Markdown, and writes one .mdx per post with frontmatter drawn
 * from the page's JSON-LD.
 *
 * REFUSES TO OVERWRITE by default. Once a post is ported it is expected to be edited by
 * hand — the defects in the original copy are meant to be fixed, not preserved — and a
 * re-run must not silently discard that. Pass --force to overwrite deliberately.
 *
 * Usage: npm run port:blog [-- --force]
 */
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { postFrontmatterSchema, type PostFrontmatter } from '../lib/blog-schema.ts'
import {
  blocksToMarkdown,
  dropListEchoes,
  unnestListItems,
  type Block,
} from './lib/blocks.ts'
import { PAGES_DIR, ROOT, ensureDir } from './lib/paths.ts'

const BLOG_DIR = path.join(ROOT, 'content', 'blog')
const SOURCE_PREFIX = '/single-post/'

/**
 * Wix renders a sidebar ahead of the post body: an "Our Recent Posts" label, three
 * related-post headings, then a "Tags" label. Verified identical across all 12 captures
 * — the body begins immediately after "Tags".
 *
 * This is asserted rather than assumed. If Wix ever changes the sidebar, the port must
 * fail loudly instead of quietly publishing three unrelated headings as body content.
 */
const CHROME_START = 'Our Recent Posts'
const CHROME_END = 'Tags'

type Capture = {
  path: string
  url: string
  title: string
  h1: string
  blocks: Block[]
}

function slugFromPath(pagePath: string): string {
  return pagePath.slice(SOURCE_PREFIX.length)
}

/** Days between spaced posts in a bulk-save group. */
const SPACING_DAYS = 7

function addDays(isoDay: string, days: number): string {
  const date = new Date(`${isoDay}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Decides the date each post displays.
 *
 * Ten of the twelve posts carry `datePublished` values inside one 2.5-minute window on
 * 2026-06-18 — 02:07:32 through 02:10:08, sequential. That is Wix writing a timestamp
 * when content was saved, not ten posts published in one sitting, and showing ten
 * identical dates advertises a content dump.
 *
 * So a group of posts sharing a creation date is spaced a week apart, in the order Wix
 * created them, ENDING on the real date. The last post keeps its true date, none is
 * dated into the future, and the ordering is the genuine one. The Wix timestamp is
 * preserved on every post as `sourceCreatedAt`, so this is a presentation choice that
 * can be reversed, not a loss of information.
 *
 * Posts with a unique creation date — the two from 2018 — are left exactly as they are.
 */
function assignDisplayDates(
  posts: { slug: string; createdAt: string }[],
): Map<string, string> {
  const byDay = new Map<string, { slug: string; createdAt: string }[]>()
  for (const post of posts) {
    const day = post.createdAt.slice(0, 10)
    byDay.set(day, [...(byDay.get(day) ?? []), post])
  }

  const display = new Map<string, string>()
  for (const [day, group] of byDay) {
    if (group.length === 1) {
      display.set(group[0].slug, day)
      continue
    }

    const ordered = [...group].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    ordered.forEach((post, i) => {
      const stepsBack = (ordered.length - 1 - i) * SPACING_DAYS
      display.set(post.slug, addDays(day, -stepsBack))
    })
  }

  return display
}

/** Drops the Wix sidebar. Throws if the capture is not the shape we verified. */
function stripChrome(capture: Capture): Block[] {
  const texts = capture.blocks.map((b) => (b.text ?? '').trim())
  const start = texts.indexOf(CHROME_START)
  const end = texts.indexOf(CHROME_END)

  if (start !== 0 || end === -1 || end < start) {
    throw new Error(
      `${capture.path}: expected the Wix sidebar ("${CHROME_START}" … "${CHROME_END}") ` +
        `at the head of the capture, found ${JSON.stringify(texts.slice(0, 6))}. ` +
        `Re-check the capture before porting — the chrome boundary is what separates ` +
        `sidebar from body.`,
    )
  }

  return capture.blocks.slice(end + 1)
}

/** Trailing "#tag #tag" paragraphs are the post's tags, not prose. */
function extractTags(blocks: Block[]): { tags: string[]; body: Block[] } {
  const body = [...blocks]
  const tags: string[] = []

  while (body.length > 0) {
    const last = body[body.length - 1]
    const text = (last.text ?? '').trim()
    if (last.type !== 'paragraph' || !/^#[^\s#]+(\s+#[^\s#]+)*$/.test(text)) break
    tags.unshift(...text.split(/\s+/).map((t) => t.replace(/^#/, '')))
    body.pop()
  }

  // The original carries a duplicate ("#travelinsurance #travelinsurance").
  return { tags: [...new Set(tags)], body }
}

/** Reads the BlogPosting JSON-LD, which carries the real metadata. */
function readJsonLd(slug: string, captureFile: string): Record<string, unknown> {
  const htmlPath = path.join(PAGES_DIR, captureFile.replace(/\.json$/, '.html'))
  const $ = cheerio.load(fs.readFileSync(htmlPath, 'utf8'))
  let posting: Record<string, unknown> | null = null

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).text())
      const entries = Array.isArray(parsed) ? parsed : [parsed]
      for (const entry of entries) {
        if (entry?.['@type'] === 'BlogPosting') posting = entry
      }
    } catch {
      // A malformed block is not fatal; the required fields are checked below.
    }
  })

  if (!posting) throw new Error(`${slug}: no BlogPosting JSON-LD found in the capture.`)
  return posting
}

function frontmatterYaml(frontmatter: PostFrontmatter): string {
  const quote = (value: string) => `'${value.replace(/'/g, "''")}'`
  const lines = [
    `slug: ${quote(frontmatter.slug)}`,
    `title: ${quote(frontmatter.title)}`,
    `summary: ${quote(frontmatter.summary)}`,
    // Quoted so YAML yields a string rather than a Date. The schema accepts both, but
    // emitting the unambiguous form keeps hand-edited files consistent with generated ones.
    `publishedAt: ${quote(frontmatter.publishedAt)}`,
    `sourceCreatedAt: ${quote(frontmatter.sourceCreatedAt)}`,
    `author: ${quote(frontmatter.author)}`,
    `status: ${frontmatter.status}`,
    frontmatter.tags.length
      ? `tags:\n${frontmatter.tags.map((t) => `  - ${quote(t)}`).join('\n')}`
      : 'tags: []',
    `heroImage: ${frontmatter.heroImage ? quote(frontmatter.heroImage) : 'null'}`,
    `heroAlt: ${frontmatter.heroAlt ? quote(frontmatter.heroAlt) : 'null'}`,
    `sourceUrl: ${quote(frontmatter.sourceUrl)}`,
  ]
  return `---\n${lines.join('\n')}\n---\n`
}

function main(): void {
  const force = process.argv.includes('--force')

  const captureFiles = fs
    .readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith('.json') && f.startsWith('single-post__'))
    .sort()

  if (captureFiles.length === 0) {
    console.error('No blog captures found. Run `npm run capture:site` first.')
    process.exit(1)
  }

  let written = 0
  let skipped = 0

  // Two passes: display dates depend on the whole set, not on one post at a time.
  const loaded = captureFiles.map((file) => {
    const capture: Capture = JSON.parse(
      fs.readFileSync(path.join(PAGES_DIR, file), 'utf8'),
    )
    const slug = slugFromPath(capture.path)
    const posting = readJsonLd(slug, file)
    const createdAt = String(posting.datePublished ?? '')

    if (!/^\d{4}-\d{2}-\d{2}T/.test(createdAt)) {
      throw new Error(`${slug}: JSON-LD datePublished is missing or malformed.`)
    }

    return { file, capture, slug, posting, createdAt }
  })

  const displayDates = assignDisplayDates(loaded)

  for (const { capture, slug, posting, createdAt } of loaded) {
    const destination = path.join(BLOG_DIR, `${slug}.mdx`)

    if (fs.existsSync(destination) && !force) {
      console.log(`  skip   ${slug} (already ported — pass --force to overwrite)`)
      skipped++
      continue
    }

    const body = stripChrome(capture)
    // Echo removal compares against the ORIGINAL item text, so it runs before unnesting.
    const { tags, body: prose } = extractTags(unnestListItems(dropListEchoes(body)))
    const hero = prose.find((b) => b.type === 'image' && b.localPath)

    const sourceCreatedAt = createdAt.slice(0, 10)
    const publishedAt = displayDates.get(slug) ?? sourceCreatedAt

    const frontmatter = postFrontmatterSchema.parse({
      slug,
      title: capture.h1 || capture.title,
      summary: String(posting.description ?? ''),
      publishedAt,
      sourceCreatedAt,
      author:
        (posting.author as { name?: string } | undefined)?.name ?? 'The Insurance Concierge',
      status: 'published',
      tags,
      heroImage: hero?.localPath ?? null,
      heroAlt: hero?.alt ? hero.alt : null,
      sourceUrl: capture.url,
    } satisfies PostFrontmatter)

    // The hero is rendered from frontmatter by the route, so drop it from the body to
    // avoid printing the same image twice.
    const withoutHero = hero ? prose.filter((b) => b !== hero) : prose

    ensureDir(path.dirname(destination))
    fs.writeFileSync(
      destination,
      `${frontmatterYaml(frontmatter)}\n${blocksToMarkdown(withoutHero)}\n`,
      'utf8',
    )
    console.log(`  write  ${slug}`)
    written++
  }

  console.log(
    `\n✓ ${written} post(s) written to ${path.relative(ROOT, BLOG_DIR)}` +
      (skipped ? `, ${skipped} left alone` : ''),
  )
  if (written > 0) {
    console.log(
      '  These are a mechanical conversion of the Wix copy. The original has known ' +
        'defects\n  (see content/_inventory/port-worklist.md) — read each one before ' +
        'treating it as done.',
    )
  }
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
