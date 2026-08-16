/**
 * Resize a hand-supplied image to the size this site actually serves.
 *
 * WHY THIS EXISTS. `next.config.ts` sets `images.unoptimized: true`, which is mandatory
 * under static export. There is no image pipeline at request time, so **the committed
 * file is exactly what every visitor downloads.** An 11 MB photograph in public/images is
 * an 11 MB download on a phone.
 *
 * `scripts/pull-assets.ts` already handles this for anything pulled from Wix: it asks
 * wixstatic for a 2000px rendition and never sees the original. An image dropped into the
 * repository by hand bypasses that entirely, which is how a 7030x3787 / 11.3 MB file
 * reached public/images on 2026-08-16. This script is the missing half.
 *
 *   npm run resize:image -- public/images/Big.jpg
 *   npm run resize:image -- public/images/Big.png --width 1600 --quality 0.8
 *
 * It writes a `.jpg` beside the source — photographs are never PNG here, since the same
 * picture was 1.7 MB as a PNG and a fraction of that as a JPEG. A non-JPEG source is left
 * alone, so removing it is a deliberate `git rm` rather than something this script does
 * behind you.
 *
 * ⚠ A `.jpg` SOURCE IS OVERWRITTEN IN PLACE, because the output path is the input path.
 * That is usually what you want for a file already committed at the wrong size, but it
 * means the original is only recoverable from git. Copy it elsewhere first if it is not
 * committed yet.
 *
 * HOW. There is no ImageMagick, libvips, sharp or Pillow in this environment, and adding
 * one for occasional use is a poor trade. Playwright is already a devDependency for the
 * capture scripts, so the resize runs through the headless Chromium it ships with: draw
 * the image to a canvas at the target size and read it back as a JPEG.
 *
 * The image is served over a short-lived localhost server rather than inlined as a data
 * URL, because base64ing a 12 MB buffer through `page.evaluate` is both slower and prone
 * to blowing the serialisation limit. The page is served from THAT SAME ORIGIN, which is
 * not incidental: a canvas that has drawn a cross-origin image is tainted and
 * `toDataURL` throws a SecurityError on it. Same origin, no taint, no CORS headers
 * needed.
 */
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * The long-edge cap, matching scripts/pull-assets.ts. Do not raise it without working out
 * what the extra bytes buy: the widest slot any image occupies on this site is the 56rem
 * concern panel, so 2000px already covers a 2x display.
 */
const DEFAULT_WIDTH = 2000
const DEFAULT_QUALITY = 0.82

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
}

function parseArgs() {
  const argv = process.argv.slice(2)
  const positional = argv.filter((arg) => !arg.startsWith('--'))
  const flag = (name: string) => {
    const index = argv.indexOf(`--${name}`)
    return index === -1 ? undefined : argv[index + 1]
  }

  if (positional.length === 0) {
    console.error('Usage: npm run resize:image -- <file> [--width 2000] [--quality 0.82]')
    process.exit(1)
  }

  return {
    source: path.resolve(ROOT, positional[0]),
    width: Number(flag('width') ?? DEFAULT_WIDTH),
    quality: Number(flag('quality') ?? DEFAULT_QUALITY),
  }
}

/**
 * The preinstalled Chromium in this environment may not be the revision `playwright`
 * expects, so the executable is resolved by hand when the default launch cannot find one.
 * `npx playwright install` is explicitly not the answer — the browser is already on disk.
 */
async function launch() {
  try {
    return await chromium.launch()
  } catch {
    const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers'
    const candidate = fs
      .readdirSync(root)
      .filter((entry) => entry.startsWith('chromium-'))
      .map((entry) => path.join(root, entry, 'chrome-linux', 'chrome'))
      .find((binary) => fs.existsSync(binary))
    if (!candidate) throw new Error(`No Chromium binary found under ${root}`)
    return await chromium.launch({ executablePath: candidate })
  }
}

async function main(): Promise<void> {
  const { source, width: maxWidth, quality } = parseArgs()

  if (!fs.existsSync(source)) {
    console.error(`✗ ${path.relative(ROOT, source)} does not exist.`)
    process.exit(1)
  }

  const extension = path.extname(source).toLowerCase()
  const mime = MIME[extension]
  if (!mime) {
    console.error(`✗ ${extension} is not an image this script can read.`)
    process.exit(1)
  }

  const buffer = fs.readFileSync(source)

  // Two routes on one origin: the page, and the image it draws. Port 0 lets the OS pick a
  // free one, which matters because this may run alongside `npm start`.
  const server = http.createServer((request, response) => {
    if (request.url === '/image') {
      response.writeHead(200, { 'Content-Type': mime, 'Content-Length': buffer.length })
      response.end(buffer)
      return
    }
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end('<!doctype html><meta charset="utf-8"><title>resize</title>')
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))

  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('No server address')
  const origin = `http://127.0.0.1:${address.port}`

  const browser = await launch()
  const page = await browser.newPage()
  await page.goto(origin, { waitUntil: 'load' })

  const result = await page.evaluate(
    async ({ maxWidth, quality }) => {
      const image = new Image()
      image.src = '/image'
      await image.decode()

      const scale = Math.min(1, maxWidth / image.naturalWidth)
      const width = Math.round(image.naturalWidth * scale)
      const height = Math.round(image.naturalHeight * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('No 2d context')

      // Photographs, so smoothing quality is worth the cost on the downscale.
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      // JPEG has no alpha. Flatten onto white first, or a transparent PNG's transparent
      // pixels come through as black.
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.drawImage(image, 0, 0, width, height)

      return {
        dataUrl: canvas.toDataURL('image/jpeg', quality),
        sourceWidth: image.naturalWidth,
        sourceHeight: image.naturalHeight,
        width,
        height,
      }
    },
    { maxWidth, quality },
  )

  await browser.close()
  server.close()

  const target = source.replace(/\.[^.]+$/, '.jpg')
  const output = Buffer.from(result.dataUrl.split(',')[1], 'base64')
  fs.writeFileSync(target, output)

  const mb = (bytes: number) => `${(bytes / 1048576).toFixed(2)} MB`
  console.log(`  in  ${path.relative(ROOT, source)}`)
  console.log(`      ${result.sourceWidth}x${result.sourceHeight}, ${mb(buffer.length)}`)
  console.log(`  out ${path.relative(ROOT, target)}`)
  console.log(`      ${result.width}x${result.height}, ${mb(output.length)}`)
  if (target !== source) {
    console.log('\n  The original is untouched. Remove it once you are happy:')
    console.log(`      git rm ${path.relative(ROOT, source)}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
