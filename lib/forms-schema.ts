import { z } from 'zod'
import { isoDate } from '@/lib/frontmatter'

/**
 * Schema for the file library manifest (public/forms/manifest.json), served at /forms.
 *
 * This is the library members download from rather than emailing to ask: claim forms,
 * enrolment forms, policy documents and product guides, published as the insurer issued
 * them.
 *
 * ⚠ `/forms` IS THE ONE PLACE ON THIS SITE THAT NAMES INSURERS. Everywhere else it is a
 * hard rule, enforced by `npm run verify:copy`, which fails the build on an insurer name
 * anywhere in `out/`. The library is grouped by insurer because a member looking for a
 * form thinks in terms of whoever is on their policy schedule, and a page that refuses to
 * print that name is a page they cannot navigate. The guard is scoped to exempt this one
 * route rather than switched off; see the note at the top of scripts/verify-copy.ts for
 * what remains enforced here. Nothing about this loosens the rule on any other page.
 */
export const formSchema = z.object({
  /** Stable identifier, kebab-case. Used as the React key, never rendered. */
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Id must be kebab-case'),
  /**
   * The document's own name.
   *
   * MUST NOT REPEAT THE INSURER. `carrier` is the group heading directly above it, so
   * "Allianz Telehealth User Guide" under an "Allianz" heading says it twice.
   */
  title: z.string().min(1),
  description: z.string().min(1).optional(),
  /** Path relative to /public, e.g. /forms/files/claim-form.pdf. Must exist on disk. */
  file: z.string().regex(/^\/forms\/files\/[A-Za-z0-9._-]+$/, 'Expected /forms/files/<file>'),
  /** The insurer, as a member would recognise it. This is the grouping key. */
  carrier: z.string().min(1),
  /** The row label: 'Claim form', 'Enrolment', 'Guide', 'Policy document'. */
  category: z.string().min(1),
  /** e.g. 'International Health, Outpatient Plan'. Shown beside the category. */
  productLine: z.string().min(1).optional(),
  /** ISO 3166-1 alpha-2, or 'GLOBAL'. Filing only; not rendered today. */
  jurisdiction: z.string().min(1).optional(),
  /**
   * The DOCUMENT'S own revision date, not the day it was added here.
   *
   * Optional, and left out rather than guessed. A wrong date on a claim form is worse
   * than no date: it tells a member their copy is current when it may not be. If the
   * insurer does not print one, leave this off and the row simply shows no date.
   */
  updatedAt: isoDate.optional(),
})

export const formManifestSchema = z.object({
  $schema: z.string().optional(),
  version: z.literal(1),
  forms: z.array(formSchema),
})

export type FormDocument = z.infer<typeof formSchema>
export type FormManifest = z.infer<typeof formManifestSchema>

/**
 * One document as the page renders it: the manifest entry plus the real file size, read
 * from disk at build time rather than carried in the manifest. See `readFormLibrary`.
 */
export type LibraryDocument = FormDocument & { sizeBytes: number }

/** Documents grouped under one insurer. */
export type LibraryGroup = { carrier: string; documents: readonly LibraryDocument[] }
