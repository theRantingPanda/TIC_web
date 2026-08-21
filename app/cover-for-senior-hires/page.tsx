import type { Metadata } from 'next'
import { ConcernPage, metadataFor } from '@/components/concern-page'

/**
 * New route.
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
const PATH = '/cover-for-senior-hires'

export const metadata: Metadata = metadataFor(PATH)

export default function Page() {
  return <ConcernPage path={PATH} />
}
