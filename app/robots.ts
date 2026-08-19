import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/site'

/**
 * The site's robots.txt. There was none before 2026-08-19.
 *
 * ITS ONE JOB IS TO ANNOUNCE THE KNOWLEDGE BASE SITEMAP, and it has to be this
 * host that does it. `/member-resources` is served by the CRM (rainmaker.asktic.com) through a
 * Render rewrite, and robots.txt is fetched PER HOST — the CRM's own copy
 * deliberately bans crawlers, so a sitemap announced there would be announced by
 * the one host telling them not to look. The public host is this one.
 *
 * ⚠ NO `Disallow` HERE, AND ESPECIALLY NOT FOR THE TOMBSTONED PATHS.
 * content/url-contract.json → tombstoned explains why in full: those paths serve a
 * `noindex` page, and the whole point of a tombstone is that a crawler FETCHES it
 * and sees the noindex. A Disallow would stop the fetch, so the noindex is never
 * read and the page stays indexed — the opposite of the intent. If a Disallow is
 * ever added here, check that list first.
 *
 * KNOWN GAP, deliberately not filled here: the marketing site has no sitemap of
 * its own (there is no app/sitemap.ts). Only the KB's is announced. Adding one is
 * a separate decision about which of these 14 pages should be in it, not
 * housekeeping.
 */
/**
 * REQUIRED under `output: 'export'`. robots.ts compiles to a Route Handler, and a
 * static export refuses to collect one without an explicit static hint — the build
 * fails with "export const dynamic = force-static not configured on route
 * /robots.txt". Nothing here is request-dependent, so this is a declaration of
 * fact rather than a workaround.
 */
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteConfig.url}/member-resources/sitemap.xml`,
  }
}
