/**
 * Phase 1 — pull images off Wix into /public.
 *
 * Reads every capture in content/_inventory/pages/, downloads each referenced image
 * from static.wixstatic.com, and writes it to public/images/. Nothing hotlinks: after
 * this runs, the site serves its own copies.
 *
 * Intrinsic dimensions are measured and written back into the capture JSON. That
 * matters because the build sets `images.unoptimized: true` (required by static
 * export), so Next cannot infer sizes — pages must be pre-sized to avoid layout shift.
 *
 * Usage: npm run capture:assets   (run after capture:site)
 */
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { imageSize } from 'image-size'
import { delay, fetchWithRetry } from './lib/net.ts'
import { PAGES_DIR, PUBLIC_IMAGES_DIR, ROOT, ensureDir, writeJson } from './lib/paths.ts'

type ImageBlock = {
  type: 'image'
  src: string
  localPath: string | null
  alt: string
  width: number
  height: number
}
type Capture = { path: string; blocks: ({ type: string } & Partial<ImageBlock>)[] }

/**
 * Wix serves derivatives like
 *   /media/<id>~mv2.jpg/v1/fill/w_600,h_400,al_c,q_80/<name>.jpg
 * The original is the part before `/v1/`. Fetching that gives full resolution instead
 * of whatever crop the Wix layout happened to request.
 */
function toOriginalUrl(src: string): string {
  const url = new URL(src)
  if (url.hostname.endsWith('wixstatic.com')) {
    const cut = url.pathname.indexOf('/v1/')
    if (cut !== -1) url.pathname = url.pathname.slice(0, cut)
    url.search = ''
  }
  return url.toString()
}

function localFilename(url: string): string {
  const base = path.basename(new URL(url).pathname) || 'image'
  const ext = path.extname(base) || '.jpg'
  const stem = path
    .basename(base, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  // Short hash keeps distinct Wix assets with colliding names apart.
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 8)
  return `${stem || 'image'}-${hash}${ext}`
}

async function main(): Promise<void> {
  if (!fs.existsSync(PAGES_DIR)) {
    console.error('No captures found. Run `npm run capture:site` first.')
    process.exit(1)
  }

  const captureFiles = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.json'))
  if (captureFiles.length === 0) {
    console.error('content/_inventory/pages/ has no captures. Run `npm run capture:site`.')
    process.exit(1)
  }

  ensureDir(PUBLIC_IMAGES_DIR)

  /** Downloaded once, reused across pages that share an asset. */
  const downloaded = new Map<string, { localPath: string; width: number; height: number }>()
  let failures = 0

  for (const file of captureFiles) {
    const capturePath = path.join(PAGES_DIR, file)
    const capture: Capture = JSON.parse(fs.readFileSync(capturePath, 'utf8'))
    let touched = false

    for (const block of capture.blocks) {
      if (block.type !== 'image' || !block.src) continue

      const originalUrl = toOriginalUrl(block.src)
      let asset = downloaded.get(originalUrl)

      if (!asset) {
        const filename = localFilename(originalUrl)
        const destination = path.join(PUBLIC_IMAGES_DIR, filename)
        process.stdout.write(`  ${capture.path} -> ${filename} … `)

        try {
          const response = await fetchWithRetry(originalUrl)
          if (!response.ok) throw new Error(`HTTP ${response.status}`)

          const buffer = Buffer.from(await response.arrayBuffer())
          fs.writeFileSync(destination, buffer)

          const { width, height } = imageSize(buffer)
          asset = { localPath: `/images/${filename}`, width, height }
          downloaded.set(originalUrl, asset)
          console.log(`${width}x${height}`)
        } catch (error) {
          failures++
          console.log(`FAILED (${error instanceof Error ? error.message : error})`)
          continue
        }

        await delay()
      }

      block.localPath = asset.localPath
      block.width = asset.width
      block.height = asset.height
      touched = true
    }

    if (touched) writeJson(capturePath, capture)
  }

  console.log(
    `\n✓ ${downloaded.size} image(s) written to ${path.relative(ROOT, PUBLIC_IMAGES_DIR)}`,
  )
  if (failures > 0) {
    console.error(`✗ ${failures} image(s) failed to download — see the log above.`)
    process.exit(1)
  }
  console.log('  Next: npm run capture:freshdesk')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
