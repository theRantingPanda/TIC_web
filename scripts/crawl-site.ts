/**
 * Phase 1 — capture the Wix site.
 *
 * Enumerates every page from https://www.asktic.com/sitemap.xml (following a sitemap
 * index if present, which is how Wix exposes pages hidden behind the "More" nav menu),
 * then archives the pages the URL contract preserves to content/_inventory/pages/.
 *
 * Read-only against the live site. Writes only into content/_inventory/.
 *
 * Stop conditions (hard gates — the script halts and exits 2):
 *   1. the sitemap contains a path the URL contract does not classify
 *   2. any page trips the client-identifying content scan
 *   3. /projects carries substantial content
 *
 * Usage: npm run capture:site
 */
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { XMLParser } from 'fast-xml-parser'
import { delay, fetchText } from './lib/net.ts'
import {
  INVENTORY_DIR,
  PAGES_DIR,
  ROOT,
  URL_CONTRACT,
  ensureDir,
  pathToSlug,
  readJson,
  stopAndReport,
  writeJson,
} from './lib/paths.ts'

const SITEMAP_URL = 'https://www.asktic.com/sitemap.xml'
const ORIGIN = 'https://www.asktic.com'
/** Blocks on /projects above this count count as "substantial". */
const SUBSTANTIAL_BLOCK_COUNT = 12

type UrlContract = {
  preserved: { path: string; source: string; note?: string }[]
  redirectOnly: { path: string; destination: string }[]
  dropped: { groups: { reason: string; paths: string[] }[] }
}

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | {
      type: 'image'
      src: string
      localPath: string | null
      alt: string
      width: number
      height: number
    }

type PageCapture = {
  path: string
  url: string
  capturedAt: string
  title: string
  metaDescription: string
  h1: string
  blocks: Block[]
  links: { href: string; text: string; external: boolean }[]
  flags: {
    possibleClientContent: string[]
    hasTestimonialMarkup: boolean
    logoGridCandidate: boolean
  }
}

// ---------------------------------------------------------------- sitemap

async function collectSitemapUrls(url: string, seen = new Set<string>()): Promise<string[]> {
  const xml = await fetchText(url)
  const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml)
  const urls: string[] = []

  const asArray = <T,>(value: T | T[] | undefined): T[] =>
    value === undefined ? [] : Array.isArray(value) ? value : [value]

  // Sitemap index: recurse into children.
  for (const child of asArray(parsed?.sitemapindex?.sitemap)) {
    const loc = String(child.loc)
    if (!seen.has(loc)) {
      seen.add(loc)
      urls.push(...(await collectSitemapUrls(loc, seen)))
    }
  }

  for (const entry of asArray(parsed?.urlset?.url)) {
    urls.push(String(entry.loc))
  }

  return [...new Set(urls)]
}

// ------------------------------------------------------- content extraction

function extractBlocks($: cheerio.CheerioAPI): Block[] {
  const blocks: Block[] = []
  const scope = $('main').length ? $('main') : $('body')

  scope
    .find('h1, h2, h3, h4, h5, h6, p, ul, ol, img')
    // Chrome/Wix chrome we never want in the archive.
    .filter((_, el) => $(el).closest('header, footer, nav, script, style').length === 0)
    .each((_, el) => {
      const $el = $(el)
      const tag = (el as { tagName?: string }).tagName?.toLowerCase() ?? ''

      if (/^h[1-6]$/.test(tag)) {
        const text = $el.text().trim()
        if (text) blocks.push({ type: 'heading', level: Number(tag[1]), text })
        return
      }

      if (tag === 'p') {
        const text = $el.text().trim()
        if (text) blocks.push({ type: 'paragraph', text })
        return
      }

      if (tag === 'ul' || tag === 'ol') {
        const items = $el
          .children('li')
          .map((__, li) => $(li).text().trim())
          .get()
          .filter(Boolean)
        if (items.length) blocks.push({ type: 'list', ordered: tag === 'ol', items })
        return
      }

      if (tag === 'img') {
        const src = $el.attr('src') ?? $el.attr('data-src') ?? ''
        if (src) {
          blocks.push({
            type: 'image',
            src: new URL(src, ORIGIN).toString(),
            localPath: null, // filled in by capture:assets
            alt: $el.attr('alt') ?? '',
            width: 0,
            height: 0,
          })
        }
      }
    })

  return blocks
}

/**
 * Keyword-and-structure scan for named clients, client logos and testimonials.
 *
 * This produces SUSPICIONS, not a clearance. An empty result does not mean a page is
 * free of client-identifying content — the scan cannot know that. Nothing goes public
 * without a human reading the capture.
 */
function scanForClientContent(
  $: cheerio.CheerioAPI,
  blocks: Block[],
): PageCapture['flags'] {
  const reasons: string[] = []
  const text = blocks
    .map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join(' ') : ''))
    .join('\n')

  const testimonialWords =
    /\b(testimonial|what our clients say|client stories|kind words|success stor|case stud)/i
  const hasTestimonialMarkup = testimonialWords.test(text) || $('blockquote').length > 0
  if (testimonialWords.test(text)) reasons.push('Testimonial-style wording in copy')
  if ($('blockquote').length > 0) {
    reasons.push(`${$('blockquote').length} blockquote element(s) — possible testimonial`)
  }

  const companySuffix = /\b[A-Z][\w&.'-]*(?:\s+[A-Z][\w&.'-]*){0,4}\s+(Pte\.?\s*Ltd\.?|Sdn\.?\s*Bhd\.?|Ltd\.?|Inc\.?|LLC|LLP|GmbH|N\.V\.|S\.A\.)\b/g
  const companyMatches = [...new Set(text.match(companySuffix) ?? [])].filter(
    // Our own entity is not a client.
    (name) => !/insurance concierge/i.test(name),
  )
  if (companyMatches.length > 0) {
    reasons.push(`Possible named organisations: ${companyMatches.slice(0, 10).join('; ')}`)
  }

  const logoImages = blocks.filter(
    (b) => b.type === 'image' && /logo|client|partner|brand/i.test(`${b.src} ${b.alt}`),
  )
  const logoGridCandidate = logoImages.length >= 3
  if (logoGridCandidate) {
    reasons.push(`${logoImages.length} logo-ish images — possible client logo grid`)
  }

  return {
    possibleClientContent: reasons,
    hasTestimonialMarkup,
    logoGridCandidate,
  }
}

// ------------------------------------------------------------------- main

async function main(): Promise<void> {
  const contract = readJson<UrlContract>(URL_CONTRACT)
  const droppedPaths = new Set(contract.dropped.groups.flatMap((g) => g.paths))
  const classified = new Set([
    ...contract.preserved.map((p) => p.path),
    ...contract.redirectOnly.map((r) => r.path),
    ...droppedPaths,
  ])

  console.log(`Reading sitemap: ${SITEMAP_URL}`)
  const sitemapUrls = await collectSitemapUrls(SITEMAP_URL)

  const sitemapPaths = [
    ...new Set(
      sitemapUrls
        .filter((url) => url.startsWith(ORIGIN))
        .map((url) => new URL(url).pathname.replace(/\/+$/, '') || '/'),
    ),
  ].sort()

  console.log(`Sitemap yielded ${sitemapPaths.length} page(s).`)

  /**
   * ---- Stop condition 1: an unclassified path ----
   *
   * This replaces the brief's raw 20-page ceiling. That gate fired on 2026-08-11 and
   * did its job: the sitemap's real size (50) was reported, the port estimate was
   * revisited, and every one of those URLs now carries a signed-off decision in
   * content/url-contract.json (23 preserved, 25 dropped, 3 redirect-only) with the
   * rationale in content/_inventory/url-decisions.md. Re-firing on a count that has
   * already been adjudicated would only block the capture the same decision asked for.
   *
   * What still warrants a halt is scope the contract has NOT seen — a page published
   * on Wix since that review. Capturing it silently would port a page nobody signed
   * off; dropping it silently would 404 a live URL. Both need a human.
   */
  const unclassified = sitemapPaths.filter((p) => !classified.has(p))
  if (unclassified.length > 0) {
    stopAndReport(`${unclassified.length} sitemap path(s) missing from the URL contract`, [
      `The sitemap contains **${unclassified.length}** path(s) that`,
      '`content/url-contract.json` does not classify as preserved, dropped or',
      'redirect-only. Nothing has been captured.',
      '',
      'The contract was marked authoritative on 2026-08-11 against a 50-URL sitemap, so',
      'a path appearing here means the live site has changed since. Each one needs a',
      'decision — preserving it, dropping it or redirecting it — before the capture runs.',
      '',
      '## Unclassified paths',
      '',
      ...unclassified.map((p) => `- \`${p}\``),
    ])
  }

  // Capture only what the contract preserves and Wix actually serves. `source: 'new'`
  // paths (/knowledge, /forms) have no Wix original to archive.
  const wixPreserved = contract.preserved
    .filter((p) => p.source === 'wix')
    .map((p) => p.path)
  const pagePaths = wixPreserved.filter((p) => sitemapPaths.includes(p)).sort()

  // A preserved path the sitemap no longer lists is not a stop condition — the contract
  // is the authority on what must exist — but it does mean there is nothing to capture.
  const missingFromSitemap = wixPreserved.filter((p) => !sitemapPaths.includes(p))
  if (missingFromSitemap.length > 0) {
    console.warn(
      `\n⚠ ${missingFromSitemap.length} preserved path(s) are not in the sitemap and ` +
        `cannot be captured:\n${missingFromSitemap.map((p) => `    ${p}`).join('\n')}\n`,
    )
  }

  console.log(
    `Capturing ${pagePaths.length} preserved page(s); ` +
      `skipping ${sitemapPaths.length - pagePaths.length} dropped/redirect-only path(s).`,
  )

  ensureDir(PAGES_DIR)
  const captures: PageCapture[] = []

  for (const pagePath of pagePaths) {
    const url = `${ORIGIN}${pagePath === '/' ? '' : pagePath}`
    process.stdout.write(`  capturing ${pagePath} … `)

    const html = await fetchText(url)
    const slug = pathToSlug(pagePath)
    fs.writeFileSync(path.join(PAGES_DIR, `${slug}.html`), html, 'utf8')

    const $ = cheerio.load(html)
    const blocks = extractBlocks($)

    const capture: PageCapture = {
      path: pagePath,
      url,
      capturedAt: new Date().toISOString(),
      title: $('title').first().text().trim(),
      metaDescription: $('meta[name="description"]').attr('content')?.trim() ?? '',
      h1: $('h1').first().text().trim(),
      blocks,
      links: $('a[href]')
        .map((_, el) => {
          const href = $(el).attr('href') ?? ''
          return {
            href,
            text: $(el).text().trim(),
            external: /^https?:\/\//i.test(href) && !href.startsWith(ORIGIN),
          }
        })
        .get(),
      flags: scanForClientContent($, blocks),
    }

    writeJson(path.join(PAGES_DIR, `${slug}.json`), capture)
    captures.push(capture)
    console.log(`${blocks.length} blocks`)
    await delay()
  }

  writeJson(path.join(INVENTORY_DIR, 'inventory.json'), {
    version: 1,
    capturedAt: new Date().toISOString(),
    sitemapUrl: SITEMAP_URL,
    sitemapPathCount: sitemapPaths.length,
    scope: 'url-contract preserved paths with source: wix',
    notCaptured: {
      newPaths: contract.preserved.filter((p) => p.source !== 'wix').map((p) => p.path),
      preservedButMissingFromSitemap: missingFromSitemap,
      droppedOrRedirectOnly: sitemapPaths.filter((p) => !pagePaths.includes(p)),
    },
    pages: captures.map((c) => ({
      path: c.path,
      slug: pathToSlug(c.path),
      title: c.title,
      blockCount: c.blocks.length,
      imageCount: c.blocks.filter((b) => b.type === 'image').length,
      flagged: c.flags.possibleClientContent.length > 0,
    })),
  })

  // ---- Stop condition 2: client-identifying content ----
  const flagged = captures.filter((c) => c.flags.possibleClientContent.length > 0)

  /**
   * ---- Stop condition 3: substantial /projects ----
   *
   * /blog was in this list and has been removed: its size was the subject of the
   * 2026-08-11 review, which resolved it (12 posts preserved at their own
   * /single-post/... paths, 8 category pages dropped). /projects has never been read,
   * so the brief's assumption that it is one thin page is still untested.
   */
  const heavy = captures.filter(
    (c) => c.path === '/projects' && c.blocks.length >= SUBSTANTIAL_BLOCK_COUNT,
  )

  if (flagged.length > 0 || heavy.length > 0) {
    const sections: string[] = []

    if (flagged.length > 0) {
      sections.push(
        '## Possible client-identifying content',
        '',
        'Nothing client-identifying goes public without written permission. These pages',
        'need a human read before any of their content is ported.',
        '',
      )
      for (const capture of flagged) {
        sections.push(`### \`${capture.path}\``, '')
        for (const reason of capture.flags.possibleClientContent) {
          sections.push(`- ${reason}`)
        }
        sections.push('')
      }
      sections.push(
        '> This scan is a heuristic. An **unflagged** page is not cleared — it simply',
        '> did not match a pattern. Review every capture before publishing.',
        '',
      )
    }

    if (heavy.length > 0) {
      sections.push('## Substantial content changes the port estimate', '')
      for (const capture of heavy) {
        sections.push(
          `- \`${capture.path}\` — ${capture.blocks.length} content blocks, ` +
            `${capture.blocks.filter((b) => b.type === 'image').length} images`,
        )
      }
      sections.push('')
    }

    sections.push(
      '## State',
      '',
      `Captures for all ${captures.length} page(s) were written to`,
      '`content/_inventory/pages/` — they are the evidence for this report. No content',
      'has been ported into the site.',
    )

    stopAndReport('Review required before porting', sections)
  }

  console.log(`\n✓ Captured ${captures.length} page(s) to ${path.relative(ROOT, PAGES_DIR)}`)
  console.log('  Next: npm run capture:assets')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
