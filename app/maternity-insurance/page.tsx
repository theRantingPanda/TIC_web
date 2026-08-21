import type { Metadata } from 'next'
import { ConcernPage, metadataFor } from '@/components/concern-page'

/**
 * Maternity and newborn. The "Planning for a family" concern.
 *
 * It keeps its indexed path rather than getting a new one, which is the whole reason to
 * absorb it: /maternity-insurance already ranks and already carries the site's search
 * equity for this subject, and a second page competing with it would be a cost with no
 * benefit.
 *
 * ---- This page was three times longer until 2026-08-16 ----
 *
 * It carried four sections after the panel: a timing segmentation ("planning / trying /
 * already pregnant"), the maternity timeline lead magnet, a company-scheme section, and a
 * newborn section. They were kept when the page was absorbed, on the reasoning that the
 * six-part panel had no slot for them. They were then cut, on the reasoning that they sat
 * between the panel's call to action and the enquiry form and so competed with the ask —
 * the same fault that removed the questions band from every concern page the same day.
 *
 * What that cost, recorded honestly so the decision can be revisited with the facts:
 *
 *   - The timing segmentation was genuinely unique advice and has nowhere else to live.
 *     If it comes back, it belongs BELOW the form, not above it.
 *   - The company-scheme section is not really lost. That argument is the whole of
 *     /beyond-employer-cover. Note the real case it linked to is no longer there: it is
 *     an individual policy, was wrongly written as a company scheme, and now sits on this
 *     page as of 2026-08-17.
 *   - The newborn section elaborated the panel's "Newborn provisions" consideration.
 *   - The timeline magnet is still offered, from /services, and still reaches the same
 *     list. Only the second capture point went.
 *   - This is an indexed, ranking page that lost a lot of on-topic copy. Watch its
 *     position. If it slips, the timing segmentation is the piece to restore first,
 *     because it is the most substantial and the most specific to this subject.
 *
 * The page is now structurally identical to the other eight concerns, which is the point:
 * every route renders the same panel from content/concerns/index.ts and adds nothing.
 * Copy edits go in the content module, never here.
 */
const PATH = '/maternity-insurance'

export const metadata: Metadata = metadataFor(PATH)

export default function Page() {
  return <ConcernPage path={PATH} />
}
