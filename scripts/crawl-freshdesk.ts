/**
 * Phase 1 — capture the Freshdesk help centre.
 *
 * Walks the Solutions API (/api/v2/solutions/*) across every category, folder and
 * article, and archives them under content/_inventory/freshdesk/.
 *
 *   public/    — publicly served articles (Medical Insurance > Allianz, BUPA, FAQ,
 *                the legacy AIG article). These become /knowledge on the new site.
 *   internal/  — the INTERNAL category. Destined for the CRM-side operator KB, NOT
 *                the public site. Captured here only so the port has a source.
 *
 * The `status` field is captured verbatim and mapped through
 * freshdeskStatusToKbStatus() so drafts stay out of the public build.
 *
 * READ-ONLY. Every request is a GET. Nothing here writes to Freshdesk.
 *
 * Requires FRESHDESK_API_KEY (see .env.example).
 * Usage: npm run capture:freshdesk
 */
import path from 'node:path'
import { delay, fetchJson } from './lib/net.ts'
import { FRESHDESK_DIR, ROOT, ensureDir, writeJson } from './lib/paths.ts'
import { freshdeskStatusToKbStatus } from '../lib/kb-schema.ts'

const API_KEY = process.env.FRESHDESK_API_KEY
const DOMAIN = process.env.FRESHDESK_DOMAIN ?? 'asktic.freshdesk.com'
const PUBLIC_HOST = process.env.FRESHDESK_PUBLIC_HOST ?? 'support.asktic.com'

if (!API_KEY) {
  console.error(
    'FRESHDESK_API_KEY is not set.\n' +
      'Add it as an environment secret — see .env.example. It is read from the\n' +
      'environment only and is never written to disk or committed.',
  )
  process.exit(1)
}

const AUTH = `Basic ${Buffer.from(`${API_KEY}:X`).toString('base64')}`
const API = `https://${DOMAIN}/api/v2/solutions`

type Category = { id: number; name: string }
type Folder = { id: number; name: string; visibility: number }
type Article = {
  id: number
  title: string
  description: string
  description_text: string
  status: number
  updated_at: string
  seo_data?: { meta_title?: string }
}

/** Freshdesk folder visibility: 1 = anyone. Everything else is gated. */
const VISIBILITY_ALL = 1

function get<T>(url: string): Promise<T> {
  return fetchJson<T>(url, { headers: { Authorization: AUTH } })
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function getAllArticles(folderId: number): Promise<Article[]> {
  const articles: Article[] = []
  for (let page = 1; ; page++) {
    const batch = await get<Article[]>(
      `${API}/folders/${folderId}/articles?per_page=100&page=${page}`,
    )
    articles.push(...batch)
    if (batch.length < 100) break
    await delay()
  }
  return articles
}

async function main(): Promise<void> {
  console.log(`Reading Freshdesk Solutions API at ${DOMAIN} (read-only)…`)

  const categories = await get<Category[]>(`${API}/categories`)
  console.log(`  ${categories.length} categor(ies)`)

  const redirects: {
    articleId: number
    title: string
    sourceUrl: string
    sourcePath: string
    destination: string
    scope: 'public' | 'internal'
    status: string
  }[] = []

  let publicCount = 0
  let internalCount = 0

  for (const category of categories) {
    const isInternalCategory = /internal/i.test(category.name)
    const folders = await get<Folder[]>(`${API}/categories/${category.id}/folders`)
    console.log(`\n  ${category.name} — ${folders.length} folder(s)`)

    for (const folder of folders) {
      const scope: 'public' | 'internal' =
        isInternalCategory || folder.visibility !== VISIBILITY_ALL ? 'internal' : 'public'

      const articles = await getAllArticles(folder.id)
      console.log(`    ${folder.name} [${scope}] — ${articles.length} article(s)`)

      for (const article of articles) {
        const slug = slugify(article.title)
        const sourcePath = `/support/solutions/articles/${article.id}-${slug}`
        const sourceUrl = `https://${PUBLIC_HOST}${sourcePath}`
        const status = freshdeskStatusToKbStatus(article.status)

        writeJson(
          path.join(FRESHDESK_DIR, scope, slugify(folder.name), `${article.id}-${slug}.json`),
          {
            id: article.id,
            title: article.title,
            slug,
            body: article.description,
            bodyText: article.description_text,
            folder: folder.name,
            folderVisibility: folder.visibility,
            category: category.name,
            scope,
            status,
            freshdeskStatus: article.status,
            sourceUrl,
            updatedAt: article.updated_at,
            capturedAt: new Date().toISOString(),
          },
        )

        // Only publicly-served articles get a 301 — internal ones were never indexed.
        if (scope === 'public') {
          redirects.push({
            articleId: article.id,
            title: article.title,
            sourceUrl,
            sourcePath,
            destination: `/knowledge/${slug}`,
            scope,
            status,
          })
          publicCount++
        } else {
          internalCount++
        }
      }

      await delay()
    }
  }

  ensureDir(FRESHDESK_DIR)
  writeJson(path.join(FRESHDESK_DIR, 'redirects.json'), {
    version: 1,
    generatedAt: new Date().toISOString(),
    $comment:
      'Per-article 301 map for the Freshdesk help centre. Public articles only — ' +
      'internal ones were never publicly indexed. Spliced into render.yaml by ' +
      'scripts/gen-redirects.ts.',
    articles: redirects.sort((a, b) => a.articleId - b.articleId),
  })

  console.log(
    `\n✓ ${publicCount} public + ${internalCount} internal article(s) captured to ` +
      `${path.relative(ROOT, FRESHDESK_DIR)}`,
  )
  console.log(`  ${redirects.length} redirect(s) mapped. Next: npm run gen:redirects`)

  const drafts = redirects.filter((r) => r.status !== 'published')
  if (drafts.length > 0) {
    console.log(
      `\n  Note: ${drafts.length} public-folder article(s) are not published and will ` +
        'be excluded from the build by lib/content.ts.',
    )
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
