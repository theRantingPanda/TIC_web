/**
 * Phase 1 — capture the pages Wix does not server-render.
 *
 * `capture:site` fetches raw HTML. That is enough for most of the site, but Wix ships
 * some pages with an EMPTY `<main>` and hydrates them in the browser, so a plain fetch
 * archives a page with zero content blocks and no h1 — indistinguishable, in the
 * capture, from a page that is genuinely empty. `/maternity-insurance` and `/blog` are
 * both in that state as of 2026-08-11.
 *
 * This script re-captures those pages through headless Chromium, after hydration, and
 * rewrites their `pages/<slug>.json` in place. The raw `.html` snapshot from
 * `capture:site` is left untouched — it is the record of what the server actually sent.
 *
 * Chromium is provided by the environment (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers);
 * do not run `playwright install`. Set CHROMIUM_PATH if the binary lives elsewhere.
 *
 * Read-only against the live site. Writes only into content/_inventory/.
 *
 * Usage: npm run capture:render            # every page whose capture has 0 blocks
 *        npm run capture:render /blog …    # or named paths
 */
import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import { chromium } from 'playwright'
import { INVENTORY_DIR, PAGES_DIR, ROOT, pathToSlug, readJson, writeJson } from './lib/paths.ts'

const ORIGIN = 'https://www.asktic.com'
/** Wix hydration is not instant; give the main region a chance to fill. */
const HYDRATION_TIMEOUT_MS = 20_000

/**
 * The npm `playwright` package pins a browser build number and refuses to launch
 * anything else. The environment's pre-installed Chromium is a different build, so
 * point at it explicitly rather than downloading a second copy.
 */
const CHROMIUM_PATH = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium'

type Capture = {
  path: string
  url: string
  capturedAt: string
  renderedAt?: string
  capturedVia?: string
  title: string
  metaDescription: string
  h1: string
  blocks: unknown[]
  links: unknown[]
  flags: {
    possibleClientContent: string[]
    hasTestimonialMarkup: boolean
    logoGridCandidate: boolean
  }
}

type Inventory = {
  pages: { path: string; slug: string; blockCount: number }[]
}

function capturePath(slug: string): string {
  return path.join(PAGES_DIR, `${slug}.json`)
}

/** Same extraction rules as crawl-site.ts, applied to the hydrated DOM. */
function extractBlocks($: cheerio.CheerioAPI): Capture['blocks'] {
  const blocks: Capture['blocks'] = []
  const scope = $('main').length ? $('main') : $('body')

  scope
    .find('h1, h2, h3, h4, h5, h6, p, ul, ol, img')
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
            localPath: null,
            alt: $el.attr('alt') ?? '',
            width: 0,
            height: 0,
          })
        }
      }
    })

  return blocks
}

function targetsFromInventory(): string[] {
  const inventoryPath = path.join(INVENTORY_DIR, 'inventory.json')
  if (!fs.existsSync(inventoryPath)) {
    throw new Error('No inventory.json — run `npm run capture:site` first.')
  }
  return readJson<Inventory>(inventoryPath)
    .pages.filter((p) => p.blockCount === 0)
    .map((p) => p.path)
}

async function main(): Promise<void> {
  const targets = process.argv.slice(2).length
    ? process.argv.slice(2)
    : targetsFromInventory()

  if (targets.length === 0) {
    console.log('Nothing to re-render: every captured page already has content blocks.')
    return
  }

  console.log(`Re-rendering ${targets.length} page(s) through headless Chromium.`)

  // Chromium does not read HTTPS_PROXY from the environment the way fetch does, so an
  // egress-proxied session has to be told explicitly or every navigation resets.
  const proxyServer = process.env.HTTPS_PROXY ?? process.env.https_proxy
  const browser = await chromium.launch({
    ...(fs.existsSync(CHROMIUM_PATH) ? { executablePath: CHROMIUM_PATH } : {}),
    ...(proxyServer ? { proxy: { server: proxyServer } } : {}),
    /**
     * Cap at TLS 1.2. Behind this session's egress proxy the CONNECT tunnel opens and
     * then Chromium's TLS 1.3 handshake is reset mid-flight (ECONNRESET, net_error
     * -101) — verified in a net-log; curl and Node's fetch over the same proxy are
     * unaffected, so it is Chromium's 1.3 ClientHello the path objects to.
     *
     * This is a transport accommodation, NOT a trust one: certificates are still
     * verified normally. Do not "fix" a handshake failure here with
     * ignoreHTTPSErrors or --ignore-certificate-errors.
     */
    args: ['--ssl-version-max=tls1.2'],
  })
  const context = await browser.newContext({
    userAgent: 'TIC-web-capture/1.0 (+https://www.asktic.com; site migration)',
  })
  const results: { path: string; blocks: number; ok: boolean }[] = []

  try {
    for (const pagePath of targets) {
      const slug = pathToSlug(pagePath)
      const file = capturePath(slug)
      if (!fs.existsSync(file)) {
        console.warn(`  ${pagePath} — no capture to update, skipping`)
        results.push({ path: pagePath, blocks: 0, ok: false })
        continue
      }

      const url = `${ORIGIN}${pagePath === '/' ? '' : pagePath}`
      process.stdout.write(`  rendering ${pagePath} … `)

      const page = await context.newPage()
      let html = ''
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: HYDRATION_TIMEOUT_MS })
        // Hydration target: main having any text at all. Not fatal if it never fills —
        // an empty main after hydration is itself a finding worth recording.
        await page
          .waitForFunction(
            () => (document.querySelector('main')?.textContent ?? '').trim().length > 0,
            undefined,
            { timeout: HYDRATION_TIMEOUT_MS },
          )
          .catch(() => undefined)
        html = await page.content()
      } finally {
        await page.close()
      }

      const $ = cheerio.load(html)
      const blocks = extractBlocks($)
      const existing = readJson<Capture>(file)

      const updated: Capture = {
        ...existing,
        renderedAt: new Date().toISOString(),
        capturedVia: 'headless-chromium (page is client-rendered by Wix)',
        title: $('title').first().text().trim() || existing.title,
        metaDescription:
          $('meta[name="description"]').attr('content')?.trim() ?? existing.metaDescription,
        h1: $('h1').first().text().trim() || existing.h1,
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
      }

      writeJson(file, updated)
      fs.writeFileSync(path.join(PAGES_DIR, `${slug}.rendered.html`), html, 'utf8')
      results.push({ path: pagePath, blocks: blocks.length, ok: blocks.length > 0 })
      console.log(`${blocks.length} blocks`)
    }
  } finally {
    await browser.close()
  }

  const empty = results.filter((r) => !r.ok)
  console.log(`\n✓ Re-rendered ${results.length} page(s) in ${path.relative(ROOT, PAGES_DIR)}`)
  if (empty.length > 0) {
    console.log(
      `  ${empty.length} still empty after hydration — treat as genuinely contentless:\n` +
        empty.map((r) => `    ${r.path}`).join('\n'),
    )
  }
  console.log('  Note: inventory.json block counts are from capture:site; re-run it to refresh.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
