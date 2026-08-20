import type { MetadataRoute } from 'next'

import { preservedPaths, siteConfig } from '@/lib/site'

/**
 * The marketing site's sitemap. There was none before 2026-08-20 — app/robots.ts
 * announced only the knowledge base's and recorded the gap.
 *
 * ---- The list is DERIVED, not written ----
 *
 * It comes from `preservedPaths` in lib/site.ts — the contract's `preserved` list, which
 * that module already reads and exports. Going through it rather than re-reading the JSON
 * keeps the contract's shape known in one place.
 *
 * That list is already the set of
 * paths this site promises to keep working and which `verify:urls` already asserts emit an
 * artifact in out/. A hardcoded list here would be a second copy of that set and would go
 * stale the first time a page was added — the failure this repo has now had three times in
 * other forms. Deriving it means a new page cannot be missing from the sitemap, and a page
 * in the sitemap cannot 404, without the existing guard failing first.
 *
 * So the decision robots.ts deferred — "which of these 14 pages should be in it" — is
 * answered: all of them, because `preserved` is exactly the indexable set. /404 and
 * /_not-found are not in it and must never be; they carry `noindex` and are the one place
 * a wrong entry actively misleads a crawler.
 *
 * /privacy IS included. A sitemap is a list of a site's pages, not a ranking of them, and
 * it is linked from every page's footer so it will be crawled regardless. Leaving it out
 * would say something about it that is not true.
 *
 * ---- What this deliberately does NOT carry ----
 *
 * NO `lastModified`. There is no honest value for it here. A static export has no per-page
 * date; the build time would claim every page changed whenever any one did; and nine of
 * the fourteen are rendered from a single content module, so even a git-derived date would
 * be identical across them and wrong for most. Google treats an unreliable lastmod as
 * noise and discounts it — an absent field is better than a confident lie, which is the
 * same reasoning that kept a "day / month / year" hint off a browser-localised date input.
 *
 * NO `priority` or `changeFrequency`. Google has stated it ignores both. They would be
 * decoration that a future reader might mistake for a lever.
 *
 * ⚠ REQUIRED under `output: 'export'`, for the same reason as app/robots.ts: this compiles
 * to a Route Handler and a static export refuses to collect one without an explicit static
 * hint. Nothing here is request-dependent.
 */
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return preservedPaths.map((path) => ({
    // The origin already carries no trailing slash, so "/" must contribute nothing.
    url: `${siteConfig.url}${path === '/' ? '' : path}`,
  }))
}
