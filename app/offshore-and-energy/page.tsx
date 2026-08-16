import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'

/**
 * Offshore and deployed teams.
 *
 * Created 2026-08-16 as the 301 destination for `/speciality-insurance`. The search
 * equity follows the audience rather than the product.
 *
 * This is NOT the old speciality page renamed, and it must never become that. The
 * marine and oil and gas specialty product was dropped; what survived is the audience,
 * whose need is a flexibility requirement on ordinary international cover: onboard a
 * hire wherever they sit, cover treatment wherever they end up, and have an evacuation
 * work when it is the only option. Nothing here may imply a separate marine policy.
 *
 * The retired page's copy and imagery are archived at
 * content/_inventory/pages/speciality-insurance.json. Do not reinstate either: the
 * container ship, the oil rig and the classroom all sell the dropped product.
 *
 * Copy status: the homepage copy deck supplies only the opening paragraph (its card 4).
 * The three points below expand the note attached to that card and are written to state
 * the requirement, not to promise a benefit. They are unratified and should be replaced
 * in the editorial pass.
 *
 * The section 02 numbers band belongs on this page as its proof point, per the deck.
 * It is not here yet because those figures are still awaiting confirmation against the
 * production database; add it when the homepage band goes live, sourced from the same
 * module so the two cannot drift.
 */
export const metadata: Metadata = {
  title: 'Offshore and deployed teams',
  description:
    'Medical cover for teams who are hired in one country, deployed to another and treated in a third, including when an evacuation is the only option.',
}

const points = [
  {
    title: 'Onboarding anywhere',
    body: 'A hire who sits in Kuala Lumpur, Jakarta or Perth should go on cover the same way as one who sits in Singapore. Where the scheme allows it, that is how we set it up.',
  },
  {
    title: 'Treatment where they end up',
    body: 'Deployment moves people, and the cover has to move with them. That is the same portability question every international plan turns on, asked of a workforce that changes location more often than most.',
  },
  {
    title: 'Evacuation when it is the only option',
    body: 'From a remote worksite, getting someone to a hospital is the first problem and paying for it is the second. Evacuation terms differ by plan and are worth reading before you need them, not after.',
  },
] as const

export default function Page() {
  return (
    <Container className="py-(--spacing-section)">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Offshore and deployed teams
      </h1>

      <p className="mt-6 max-w-2xl text-lg/8 text-ink-muted">
        Hire in Kuala Lumpur, deploy offshore, treat in Singapore. Cover that onboards
        anywhere and holds up when an evacuation is the only option.
      </p>

      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {points.map((point) => (
          <li
            key={point.title}
            className="rounded-(--radius-card) border border-border bg-surface p-6"
          >
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              {point.title}
            </h2>
            <p className="mt-2 text-base/7 text-ink-muted">{point.body}</p>
          </li>
        ))}
      </ul>

      <p className="mt-12 max-w-2xl text-base/7 text-ink-muted">
        This is ordinary international health cover, configured for a workforce that does
        not sit in one country. There is no separate offshore policy to buy.
      </p>

      <p className="mt-8">
        <Link
          href="/#talk-to-us"
          className="inline-block rounded-md bg-brand-green px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-brand-green-700"
        >
          Tell us how your team is deployed
        </Link>
      </p>
    </Container>
  )
}
