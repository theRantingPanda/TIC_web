import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const INVENTORY_DIR = path.join(ROOT, 'content', '_inventory')
export const PAGES_DIR = path.join(INVENTORY_DIR, 'pages')
export const FRESHDESK_DIR = path.join(INVENTORY_DIR, 'freshdesk')
export const PUBLIC_IMAGES_DIR = path.join(ROOT, 'public', 'images')
export const URL_CONTRACT = path.join(ROOT, 'content', 'url-contract.json')

/**
 * Script-owned: `stopAndReport` OVERWRITES this file on every halt.
 *
 * Nothing hand-written may live here. The record of closed URL decisions is
 * content/_inventory/url-decisions.md — it used to be this path, and a capture run
 * that tripped any gate would have silently destroyed it.
 */
export const STOP_REPORT = path.join(INVENTORY_DIR, 'STOP-REPORT.md')

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

export function writeJson(filePath: string, value: unknown): void {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

/** '/international-health-insurance' -> 'international-health-insurance'; '/' -> 'index'. */
export function pathToSlug(urlPath: string): string {
  const trimmed = urlPath.replace(/^\/+|\/+$/g, '')
  return trimmed === '' ? 'index' : trimmed.replace(/\//g, '__')
}

/**
 * Writes the stop report and exits non-zero.
 *
 * Stop conditions are hard gates, not warnings — the brief requires a halt and a
 * human decision, so the process must not carry on and must not report success.
 */
export function stopAndReport(title: string, sections: string[]): never {
  ensureDir(INVENTORY_DIR)
  const body = [
    `# STOP — ${title}`,
    '',
    `Generated ${new Date().toISOString()}`,
    '',
    'Capture halted. A human decision is needed before this goes any further.',
    '',
    ...sections,
    '',
  ].join('\n')

  fs.writeFileSync(STOP_REPORT, body, 'utf8')
  console.error(`\n${'='.repeat(70)}`)
  console.error(`STOP: ${title}`)
  console.error(`Report written to ${path.relative(ROOT, STOP_REPORT)}`)
  console.error('='.repeat(70))
  process.exit(2)
}
