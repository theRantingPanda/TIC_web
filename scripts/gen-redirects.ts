/**
 * Splices the per-article Freshdesk 301 map into render.yaml.
 *
 * Source:      content/_inventory/freshdesk/redirects.json  (written by ingest:freshdesk)
 * Destination: the BEGIN/END GENERATED block in render.yaml
 *
 * Idempotent — safe to re-run after every capture.
 * Usage: npm run gen:redirects
 */
import fs from 'node:fs'
import path from 'node:path'
import { FRESHDESK_DIR, ROOT, readJson } from './lib/paths.ts'

const BEGIN = '# BEGIN GENERATED freshdesk-article-map'
const END = '# END GENERATED freshdesk-article-map'
const INDENT = ' '.repeat(6)

type RedirectMap = {
  generatedAt: string | null
  articles: {
    articleId: number
    title: string
    sourcePath: string
    destination: string
    status: string
  }[]
}

const renderYamlPath = path.join(ROOT, 'render.yaml')
const redirectsPath = path.join(FRESHDESK_DIR, 'redirects.json')

const map = readJson<RedirectMap>(redirectsPath)
const yaml = fs.readFileSync(renderYamlPath, 'utf8')

const beginIndex = yaml.indexOf(BEGIN)
const endIndex = yaml.indexOf(END)
if (beginIndex === -1 || endIndex === -1) {
  console.error(`Could not find the generated block markers in render.yaml.`)
  process.exit(1)
}

const lines: string[] = []
if (map.articles.length === 0) {
  lines.push(`${INDENT}# (empty until \`npm run ingest:freshdesk\` has run)`)
} else {
  lines.push(
    `${INDENT}# ${map.articles.length} article(s), generated ${map.generatedAt ?? 'unknown'}`,
  )
  for (const article of map.articles) {
    // Draft and archived articles have no public destination — they are excluded from
    // the build by lib/content.ts, so redirecting to them would 404.
    const note = article.status === 'published' ? '' : `  # ${article.status}: skipped`
    if (article.status !== 'published') {
      lines.push(`${INDENT}# ${article.sourcePath} -> not published${note}`)
      continue
    }
    lines.push(`${INDENT}- type: redirect`)
    lines.push(`${INDENT}  source: ${article.sourcePath}`)
    lines.push(`${INDENT}  destination: ${article.destination}`)
  }
}

const before = yaml.slice(0, beginIndex + BEGIN.length)
const after = yaml.slice(endIndex)
const updated = `${before}\n${lines.join('\n')}\n${INDENT}${after.trimStart()}`

fs.writeFileSync(renderYamlPath, updated, 'utf8')

const published = map.articles.filter((a) => a.status === 'published').length
console.log(
  `✓ render.yaml updated — ${published} published article redirect(s)` +
    `${map.articles.length - published > 0 ? `, ${map.articles.length - published} skipped as not published` : ''}.`,
)
