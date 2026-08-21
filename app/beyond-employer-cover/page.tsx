import type { Metadata } from 'next'
import { ConcernPage, metadataFor } from '@/components/concern-page'

/**
 * New route. Carries a real, permission-cleared case study — a company plan capped at
 * S$100,000 against a first year of treatment over S$200,000.
 *
 * It is not the case this page opened with. That one moved to /maternity-insurance on
 * 2026-08-17, being an individual policy that had been written here as a company scheme;
 * this one is a genuine employer plan whose ceiling was run past, and replaced it the same
 * day. The note in the content module explains why the first must not come back.
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
