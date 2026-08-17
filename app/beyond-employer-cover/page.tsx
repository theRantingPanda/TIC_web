import type { Metadata } from 'next'
import { ConcernPage, metadataFor } from '@/components/concern-page'

/**
 * New route. It carried the one real, permission-cleared case study until 2026-08-17,
 * when that case moved to /maternity-insurance: it is an individual policy and had been
 * written here as a company scheme. This page's case section is a placeholder again, and
 * the note in the content module explains why refilling it with that case is not the fix.
 *
 * Everything on this page comes from content/concerns/index.ts, which the homepage flow
 * reads too. That is the point: the panel a visitor sees revealed inline on the homepage
 * and the panel they see here are the same markup from the same source, so neither can
 * drift from the other. Copy edits go in the content module, never here.
 *
 * Do not add sections to this file. If a concern needs something the others do not, it
 * belongs in the content module as an optional field, so all eight pages keep the shape
 * the flow promises.
 */
const PATH = '/beyond-employer-cover'

export const metadata: Metadata = metadataFor(PATH)

export default function Page() {
  return <ConcernPage path={PATH} />
}
