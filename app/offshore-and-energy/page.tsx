import type { Metadata } from 'next'
import { ConcernPage, metadataFor } from '@/components/concern-page'

/**
 * Offshore and deployed teams, absorbed into the concern pattern on 2026-08-16.
 *
 * This is the "A workforce that does not sit in one country" concern. It keeps its
 * path because that path is the 301 destination for the retired /speciality-insurance,
 * so the search equity that deliberately followed the audience rather than the product
 * stays where it was pointed.
 *
 * The page this replaces carried an image, three points and a closing line. All four are
 * now in content/concerns/index.ts — the three points became the concern's three things
 * to consider, and the closing line is the second paragraph of its situation. Nothing was
 * dropped, which is why there is no children slot here.
 *
 * THE ONE RULE THAT SURVIVES FROM THE OLD PAGE: this is NOT the old speciality page
 * renamed and it must never become that. The marine and oil and gas specialty product
 * was dropped; what survived is the audience, whose need is a flexibility requirement on
 * ordinary international cover. Nothing here may imply a separate marine policy, which
 * is why the concern's situation says so in as many words and why the lead image is the
 * platform rather than the container ship. The retired page's copy and imagery are
 * archived at content/_inventory/pages/speciality-insurance.json. Do not reinstate
 * either: the container ship, the oil rig and the classroom all sell the dropped product.
 */
const PATH = '/offshore-and-energy'

export const metadata: Metadata = metadataFor(PATH)

export default function Page() {
  return <ConcernPage path={PATH} />
}
