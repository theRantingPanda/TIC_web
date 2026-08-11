import { z } from 'zod'

/**
 * An ISO calendar date (YYYY-MM-DD) in frontmatter.
 *
 * YAML parses an unquoted `2026-06-18` into a Date, so a plain string schema rejects
 * perfectly valid frontmatter — and the failure only appears once a file exists, which
 * is a nasty way to find out. Both forms are accepted and normalised to the string.
 *
 * Times are deliberately dropped: these are publication and review dates, and carrying
 * a UTC timestamp invites a date that renders as the day before in Singapore.
 */
export const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected an ISO date (YYYY-MM-DD)'),
)
