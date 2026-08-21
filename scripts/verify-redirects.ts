/**
 * Live redirect check, driven by render.yaml.
 *
 * ---- Why this is a script and not a line in a comment ----
 *
 * render.yaml carried a `for p in /blog /speciality-insurance …` one-liner for exactly
 * this job. It listed four paths because there were four rules. There are sixteen now, and
 * a check that covers a quarter of them passes while the rest are broken — which is not
 * hypothetical: /file-access and /file were wrong on 2026-08-20 and that command would
 * have reported everything fine. A hardcoded list goes stale the moment a rule is added,
 * silently, in the file whose whole subject is silent drift.
 *
 * So the list comes from render.yaml. Add a rule there and it is checked from then on.
 *
 * ---- Why it is not part of `npm run verify` ----
 *
 * verify:urls and verify:copy read out/ and are deterministic and offline. This one makes
 * sixteen network requests to production and can fail for reasons that have nothing to do
 * with the commit — a deploy in flight, a flaky link. Wiring it into the same gate would
 * teach people to ignore a red build. Run it deliberately: after any change on the Render
 * Redirects or Headers screen, and after a clear-cache deploy.
 *
 * ⚠ IT CHECKS THE LIVE SITE, NOT THE REPO. render.yaml is NOT applied to the service —
 * the routes are configured in the dashboard — so a pass means the two agree, and a
 * failure means either the rule is wrong or this file is out of date. The output does not
 * know which, and cannot; go and look.
 *
 * A 301 alone is not a pass. The space-in-the-destination bug produced a perfectly good
 * 301 to /%20/services, which 404s. Every rule has to land on a 200.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const ORIGIN = 'https://www.asktic.com'

/**
 * Pulled out with a regex rather than a YAML parser, deliberately: this repo has no yaml
 * dependency and adding one to read four lines of our own file would be the larger change.
 * The shape is fixed by the file itself and a malformed block fails loudly below.
 */
function redirectRules(): { source: string; destination: string }[] {
  const yaml = fs.readFileSync(path.join(ROOT, 'render.yaml'), 'utf8')

  /*
    ⚠ SCOPED TO tic-web. The file declares a SECOND service, tic-help-redirect, whose only
    route is a `/*` catch-all — and that service does not exist on Render (this file says
    so and warns against creating it). Scanning the whole file picked it up and reported a
    seventeenth redirect failing, against a hostname the check never asked about.
  */
  const start = yaml.indexOf('name: tic-web')
  if (start === -1) throw new Error('render.yaml no longer declares a service named tic-web')
  const next = yaml.indexOf('  - type: web', start)
  const scope = next === -1 ? yaml.slice(start) : yaml.slice(start, next)

  const rules: { source: string; destination: string }[] = []
  const block = /- type:\s*redirect\s*\n\s*source:\s*(\S+)\s*\n\s*destination:\s*(\S+)/g
  for (const match of scope.matchAll(block)) {
    rules.push({ source: match[1], destination: match[2] })
  }
  return rules
}

/*
  Wrapped in a function because tsx transpiles these scripts to CJS, where top-level await
  is a build error. Every other script here is synchronous, so this is the first to hit it.
*/
async function main() {
  const rules = redirectRules()
  if (rules.length === 0) {
    console.error('✗ No redirect rules found in render.yaml. The parser or the file changed.')
    process.exit(1)
}

console.log(`Checking ${rules.length} redirect(s) from render.yaml against ${ORIGIN}…\n`)

const failures: string[] = []

for (const rule of rules) {
  // Cache-busted, because a stale edge copy would report the previous rule.
  const bust = `?cb=${Math.floor(Math.random() * 1e9)}`
  const url = `${ORIGIN}${rule.source}${bust}`

  let status = 0
  let location: string | null = null
  try {
    const response = await fetch(url, { redirect: 'manual' })
    status = response.status
    location = response.headers.get('location')
  } catch (error) {
    failures.push(`${rule.source} — request failed: ${(error as Error).message}`)
    console.error(`  ✗ ${rule.source.padEnd(88)} request failed`)
    continue
  }

  if (status !== 301) {
    failures.push(
      `${rule.source} returned ${status}, expected 301 to ${rule.destination}. ` +
        `A 200 here usually means a FILE exists at that path and is shadowing the rule; ` +
        `a 404 usually means the rule is missing from the service.`,
    )
    console.error(`  ✗ ${rule.source.padEnd(88)} ${status}`)
    continue
  }

  const target = (location ?? '').replace(ORIGIN, '').split('?')[0]
  if (target !== rule.destination) {
    failures.push(
      `${rule.source} redirects to "${target}", render.yaml says "${rule.destination}".` +
        // Only when it really is the space bug. Saying it every time trains people to
        // skim past the half of the line that matters.
        (target.includes('%20')
          ? ' The %20 is a leading space typed into the dashboard field.'
          : ''),
    )
    console.error(`  ✗ ${rule.source.padEnd(88)} 301 -> ${target}`)
    continue
  }

  // The destination has to be real. A 301 onto a 404 is the failure mode that looks fine.
  const landed = await fetch(url, { redirect: 'follow' }).then((r) => r.status).catch(() => 0)
  if (landed !== 200) {
    failures.push(`${rule.source} 301s correctly to ${rule.destination}, which returns ${landed}.`)
    console.error(`  ✗ ${rule.source.padEnd(88)} 301 -> ${target} lands ${landed}`)
    continue
  }

  console.log(`  ✓ ${rule.source.padEnd(88)} 301 -> ${target}`)
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} of ${rules.length} redirect(s) wrong:`)
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`\n✓ All ${rules.length} redirects serve and land on a 200.`)
}

main()
