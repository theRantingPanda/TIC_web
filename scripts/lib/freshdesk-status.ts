/**
 * Freshdesk article status, and the one mapping the capture scripts need.
 *
 * This used to live in `lib/kb-schema.ts`, beside a knowledge-base frontmatter schema
 * this site never built. The knowledge base ships from the CRM instead, served at
 * `www.asktic.com/kb` through a Render rewrite to `rainmaker.asktic.com` — so the schema
 * went, and this moved here, next to its only consumer.
 *
 * The decisions that schema encoded were not lost: the two-field public gate
 * (audience + status) became `visibility` + `status` in the CRM's `KbVisibility`, and
 * the review dates became `last_reviewed_at` / `review_due_at` on `kb_articles`.
 *
 * The Freshdesk capture and its 301 obligation are a separate, still-live story: those
 * URLs are indexed and each published article owes a redirect wherever it lands.
 */

/** Values the capture archive may record. `archived` is set by hand, never mapped. */
export type FreshdeskArticleStatus = 'published' | 'draft' | 'archived'

/** Freshdesk Solutions API encodes article status numerically. */
export function freshdeskStatusToKbStatus(status: number): FreshdeskArticleStatus {
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
