/**
 * Phase 1 — pull the Freshdesk help centre via the n8n webhook.
 *
 * Walks categories -> folders -> articles through the n8n workflow
 * "Freshdesk Solutions Read" (6bjXz8CZRHY1k2d9) and writes
 * content/_inventory/freshdesk/_raw.json with `complete: true`.
 *
 * Why the webhook rather than the n8n MCP connector: over MCP every article body has to
 * travel through the model's context and back out again to reach disk, which does not
 * scale past a handful of articles. Here the bytes go straight to disk. MCP remains the
 * better tool for ad-hoc reads; this is for the bulk migration.
 *
 * The Freshdesk API key still never enters this environment — it lives on the workflow's
 * `Call Freshdesk API` node. What this script needs is the webhook's own shared secret,
 * which opens nothing but that one read-only workflow.
 *
 * Attachments are downloaded in the same pass, deliberately: Freshdesk serves them via
 * signed URLs that expire in roughly five minutes, so they cannot be fetched later from
 * a stored capture.
 *
 * READ-ONLY. Every Freshdesk call behind the webhook is a GET.
 *
 * Requires (see .env.example):
 *   DRIVE_INDEX_WEBHOOK_SECRET   the n8n webhook's X-Drive-Index-Secret value
 * Allowlist required on the environment's network settings:
 *   asktic.app.n8n.cloud         the webhook itself
 *   s3.amazonaws.com             signed attachment downloads
 *
 * Usage: npm run capture:freshdesk
 */
import fs from 'node:fs'
import path from 'node:path'
import { delay, fetchWithRetry } from './lib/net.ts'
import { FRESHDESK_DIR, ROOT, ensureDir, writeJson } from './lib/paths.ts'

const SECRET = process.env.DRIVE_INDEX_WEBHOOK_SECRET
const WEBHOOK_URL =
  process.env.N8N_SOLUTIONS_WEBHOOK ??
  'https://asktic.app.n8n.cloud/webhook/freshdesk-solutions'

if (!SECRET) {
  console.error(
    'DRIVE_INDEX_WEBHOOK_SECRET is not set.\n' +
      'Add it to the environment variables (see .env.example). It gates only the\n' +
      'read-only Freshdesk Solutions Read workflow — the Freshdesk API key itself\n' +
      'stays inside n8n and is never needed here.',
  )
  process.exit(1)
}

type Envelope<T> = {
  success: boolean
  statusCode: number | null
  action: string
  freshdesk_response: T | null
}

type Category = { id: number; name: string }
type Folder = { id: number; name: string; visibility: number; articles_count: number }
type Article = {
  id: number
  title: string
  description: string
  description_text: string
  status: number
  updated_at: string
  attachments?: {
    id: number
    name: string
    content_type: string
    size: number
    attachment_url: string
  }[]
}

/**
 * The workflow runs with `neverError`, so a 401 or 404 from Freshdesk still comes back
 * as a successful-looking HTTP 200 with `success: false`. Checking statusCode is the
 * whole point — treating a 200 at the webhook as a successful fetch is the silent
 * failure mode that retired the old Make scenario.
 */
async function call<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetchWithRetry(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Drive-Index-Secret': SECRET as string,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Webhook returned HTTP ${response.status} ${response.statusText}`)
  }

  const envelope = (await response.json()) as Envelope<T>
  if (!envelope.success || envelope.statusCode === null || envelope.statusCode >= 300) {
    throw new Error(
      `Freshdesk ${body.action} failed: statusCode ${envelope.statusCode}. ` +
        `Payload: ${JSON.stringify(envelope.freshdesk_response)?.slice(0, 300)}`,
    )
  }
  if (envelope.freshdesk_response === null) {
    throw new Error(`Freshdesk ${body.action} returned no payload`)
  }
  return envelope.freshdesk_response
}

async function listArticles(folderId: number): Promise<Article[]> {
  const all: Article[] = []
  for (let page = 1; ; page++) {
    const batch = await call<Article[]>({
      action: 'list_articles',
      folder_id: folderId,
      per_page: 100,
      page,
    })
    all.push(...batch)
    if (batch.length < 100) break
    await delay()
  }
  return all
}

/** Signed URLs expire in minutes — this must run in the same pass as the listing. */
async function downloadAttachments(article: Article): Promise<number> {
  if (!article.attachments?.length) return 0
  const dir = path.join(FRESHDESK_DIR, 'attachments', String(article.id))
  ensureDir(dir)

  let saved = 0
  for (const attachment of article.attachments) {
    const destination = path.join(dir, attachment.name)
    try {
      const response = await fetchWithRetry(attachment.attachment_url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()))
      saved++
    } catch (error) {
      // Do not fail the whole capture for one asset, but never pass it off as saved.
      console.error(
        `    ! attachment "${attachment.name}" (article ${article.id}) failed: ` +
          `${error instanceof Error ? error.message : error}`,
      )
    }
  }
  return saved
}

async function main(): Promise<void> {
  console.log(`Pulling Freshdesk solutions via ${WEBHOOK_URL} (read-only)…`)

  const categories = await call<Category[]>({ action: 'list_categories' })
  const dump = {
    capturedAt: new Date().toISOString(),
    complete: true,
    source: 'n8n workflow 6bjXz8CZRHY1k2d9 (Freshdesk Solutions Read)',
    categories: [] as unknown[],
  }

  let articleTotal = 0
  let attachmentTotal = 0

  for (const category of categories) {
    const folders = await call<Folder[]>({
      action: 'list_folders',
      category_id: category.id,
    })
    console.log(`\n  ${category.name} — ${folders.length} folder(s)`)

    const folderDumps = []
    for (const folder of folders) {
      const articles = await listArticles(folder.id)
      console.log(
        `    ${folder.name} (visibility ${folder.visibility}) — ${articles.length} article(s)`,
      )

      if (articles.length !== folder.articles_count) {
        console.error(
          `    ! expected ${folder.articles_count} article(s), got ${articles.length}`,
        )
      }

      for (const article of articles) {
        attachmentTotal += await downloadAttachments(article)
      }

      folderDumps.push({
        id: folder.id,
        name: folder.name,
        visibility: folder.visibility,
        articles,
      })
      articleTotal += articles.length
      await delay()
    }

    dump.categories.push({ id: category.id, name: category.name, folders: folderDumps })
  }

  ensureDir(FRESHDESK_DIR)
  writeJson(path.join(FRESHDESK_DIR, '_raw.json'), dump)

  console.log(
    `\n✓ ${articleTotal} article(s) and ${attachmentTotal} attachment(s) written to ` +
      `${path.relative(ROOT, FRESHDESK_DIR)}`,
  )
  console.log('  Next: npm run ingest:freshdesk')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
