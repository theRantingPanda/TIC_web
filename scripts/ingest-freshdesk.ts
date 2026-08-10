/**
 * Phase 1 — turn a raw Freshdesk Solutions dump into the capture archive.
 *
 * The fetching does NOT happen here. Freshdesk is reached through the n8n workflow
 * "Freshdesk Solutions Read" (id 6bjXz8CZRHY1k2d9), invoked over the n8n MCP
 * connector, so the Freshdesk API key never leaves n8n and no Freshdesk host needs to
 * be allowlisted on the session's network. See content/_inventory/README.md.
 *
 * That leaves this script as the part worth keeping in git: every classification and
 * normalisation decision lives here, reviewable and re-runnable, rather than being
 * hand-applied to JSON by whoever ran the pull.
 *
 * Input:  content/_inventory/freshdesk/_raw.json   (written from the MCP pull)
 * Output: content/_inventory/freshdesk/{public,internal}/<folder>/<id>-<slug>.json
 *         content/_inventory/freshdesk/redirects.json
 *
 * Usage: npm run ingest:freshdesk
 */
import fs from 'node:fs'
import path from 'node:path'
import { FRESHDESK_DIR, ROOT, ensureDir, writeJson } from './lib/paths.ts'
import { freshdeskStatusToKbStatus } from '../lib/kb-schema.ts'

const PUBLIC_HOST = process.env.FRESHDESK_PUBLIC_HOST ?? 'support.asktic.com'
const RAW_PATH = path.join(FRESHDESK_DIR, '_raw.json')

/** Freshdesk folder visibility: 1 = anyone. Everything else is gated. */
const VISIBILITY_ALL = 1

type RawArticle = {
  id: number
  title: string
  description: string
  description_text: string
  status: number
  updated_at: string
}
type RawFolder = {
  id: number
  name: string
  visibility: number
  articles: RawArticle[]
}
type RawCategory = { id: number; name: string; folders: RawFolder[] }
type RawDump = { capturedAt: string; categories: RawCategory[] }

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

if (!fs.existsSync(RAW_PATH)) {
  console.error(
    `No raw dump at ${path.relative(ROOT, RAW_PATH)}.\n\n` +
      `Produce it first by calling the n8n workflow "Freshdesk Solutions Read"\n` +
      `(6bjXz8CZRHY1k2d9) for list_categories -> list_folders -> list_articles, and\n` +
      `writing the result in the shape documented in content/_inventory/README.md.`,
  )
  process.exit(1)
}

const raw: RawDump = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'))

const redirects: {
  articleId: number
  title: string
  sourceUrl: string
  sourcePath: string
  destination: string
  status: string
}[] = []

let publicCount = 0
let internalCount = 0
const draftsInPublicFolders: string[] = []

for (const category of raw.categories) {
  // Two independent reasons an article is not public: the category is INTERNAL, or the
  // folder itself is gated. Either one is disqualifying — fail closed.
  const isInternalCategory = /internal/i.test(category.name)

  for (const folder of category.folders) {
    const scope: 'public' | 'internal' =
      isInternalCategory || folder.visibility !== VISIBILITY_ALL ? 'internal' : 'public'

    for (const article of folder.articles) {
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
          capturedAt: raw.capturedAt,
        },
      )

      if (scope === 'public') {
        publicCount++
        // Internal articles were never publicly indexed, so they get no 301.
        redirects.push({
          articleId: article.id,
          title: article.title,
          sourceUrl,
          sourcePath,
          destination: `/knowledge/${slug}`,
          status,
        })
        if (status !== 'published') {
          draftsInPublicFolders.push(`${article.id} — ${article.title} (${status})`)
        }
      } else {
        internalCount++
      }
    }
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
  `✓ ${publicCount} public + ${internalCount} internal article(s) written to ` +
    `${path.relative(ROOT, FRESHDESK_DIR)}`,
)
console.log(`  ${redirects.length} redirect(s) mapped. Next: npm run gen:redirects`)

if (draftsInPublicFolders.length > 0) {
  console.log(
    `\n  ${draftsInPublicFolders.length} article(s) sit in a public folder but are not ` +
      `published.\n  lib/content.ts excludes them from the build:`,
  )
  for (const entry of draftsInPublicFolders) console.log(`    - ${entry}`)
}
