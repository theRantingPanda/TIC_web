import { z } from 'zod'
import { isoDate } from '@/lib/frontmatter'

/**
 * Frontmatter schema for knowledge-base articles (content/kb/*.mdx).
 *
 * Two fields decide whether an article reaches the public build:
 *
 *   audience === 'public'    — 'operator' articles belong to the CRM-side KB, not here
 *   status   === 'published' — Freshdesk drafts must never ship
 *
 * Both are enforced in lib/content.ts. Widening that filter is a deliberate act, not
 * something to do casually.
 */

export const kbStatus = z.enum(['published', 'draft', 'archived'])
export const kbAudience = z.enum(['public', 'operator'])

export const kbFrontmatterSchema = z.object({
  /** URL segment under /knowledge. Must match the filename. */
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'),
  title: z.string().min(1),
  summary: z.string().min(1),
  /**
   * Internal filing only. Null for carrier-agnostic articles.
   *
   * Deliberately NOT documented with real carrier slugs: this comment is the field's
   * only documentation, and naming one here teaches the next author to type it into
   * frontmatter. This value must never reach a rendered knowledge-base page — nothing
   * renders it today, and `npm run verify:copy` fails the build if anything starts to.
   *
   * The rule is unchanged for the KB. There is now exactly one route that names insurers,
   * /forms, the member file library, which is grouped by insurer so a member can find the
   * form for the plan they are actually on. That exemption is scoped to that path in
   * scripts/verify-copy.ts and has no bearing here — a knowledge-base article that names
   * a carrier still fails the build.
   */
  carrier: z.string().nullable(),
  /** e.g. 'international-health', 'employee-benefits', 'maternity'. */
  productLine: z.string().nullable(),
  audience: kbAudience,
  topic: z.string(),
  /** ISO 3166-1 alpha-2, or 'GLOBAL'. */
  jurisdiction: z.string(),
  lastReviewed: isoDate,
  reviewDue: isoDate,
  status: kbStatus,
  /** Original Freshdesk article URL — this is what the per-article 301 map keys on. */
  sourceUrl: z.string().url(),
})

export type KbFrontmatter = z.infer<typeof kbFrontmatterSchema>
export type KbStatus = z.infer<typeof kbStatus>
export type KbAudience = z.infer<typeof kbAudience>

/** Freshdesk Solutions API encodes article status numerically. */
export function freshdeskStatusToKbStatus(status: number): KbStatus {
  switch (status) {
    case 1:
      return 'draft'
    case 2:
      return 'published'
    default:
      // Unknown values are treated as drafts — fail closed, never publish by accident.
      return 'draft'
  }
}
