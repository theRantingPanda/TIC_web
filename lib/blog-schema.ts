import { z } from 'zod'
import { isoDate } from '@/lib/frontmatter'

/**
 * Frontmatter schema for blog posts (content/blog/**\/*.mdx).
 *
 * Separate from the KB schema on purpose. KB articles carry review dates, carrier and
 * jurisdiction because stale published guidance is a compliance problem for a licensed
 * firm; these are dated posts, where the publication date is the honesty mechanism
 * instead. Sharing one schema would mean inventing values for whichever fields did not
 * apply.
 *
 * Every field here comes from the Wix capture. Nothing is inferred — a post with no
 * hero image says `null` rather than borrowing one.
 */

/**
 * A kebab-case segment, or several joined by `/`.
 *
 * Two posts carry a Wix `/YYYY/MM/DD/` prefix. Those paths are indexed, so the slash
 * depth is part of the URL contract and is preserved verbatim — see
 * content/url-contract.json.
 */
const postSlug = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/,
    'Slug must be kebab-case segments, optionally separated by /',
  )

export const postStatus = z.enum(['published', 'draft'])

export const postFrontmatterSchema = z.object({
  /** Path under /single-post/. Must match the file's location in content/blog/. */
  slug: postSlug,
  title: z.string().min(1),
  /**
   * Meta description. Taken from the post's JSON-LD, NOT from `<meta name="description">`
   * — every Wix post shares the same template default there ("This is your blog post.
   * Blogs are a great way to connect with your audience…"), which must not ship.
   */
  summary: z.string().min(1),
  publishedAt: isoDate,
  author: z.string().min(1),
  status: postStatus,
  /** Hashtags as they appear at the foot of the original post. */
  tags: z.array(z.string()),
  heroImage: z.string().nullable(),
  heroAlt: z.string().nullable(),
  /** The Wix URL this was ported from. Provenance, and the key for any future 301. */
  sourceUrl: z.url(),
})

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>
export type PostStatus = z.infer<typeof postStatus>
