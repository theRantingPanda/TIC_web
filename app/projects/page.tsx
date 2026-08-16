import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { primaryNav } from '@/lib/site'

/**
 * Ported from the Wix capture (content/_inventory/pages/projects.json).
 *
 * The original was an unfinished Wix template: an "Our Services" heading and the
 * literal placeholder "I'm a title. ​Click here to edit me." The placeholder is removed
 * on Steven's instruction 2026-08-11, which leaves the heading and nothing else.
 *
 * A page with only a heading is a dead end, and this one is in the nav and indexed. So
 * it lists the five service pages — NOT captured content, and not invented copy either:
 * the links and labels come from `primaryNav`, so this page cannot drift out of step
 * with the nav. Replace it the moment there is real project content to show.
 */
export const metadata: Metadata = {
  title: 'Projects',
  description:
    'The cover The Insurance Concierge arranges — international health, maternity, employee benefits, speciality and income preservation.',
}

/**
 * Derived from the nav's Cover group, by SHAPE rather than by label.
 *
 * This read `primaryNav.find((g) => g.label === 'Services')` until 2026-08-16, when the
 * nav group was renamed to "Cover" and this silently became `[]` — no type error, no
 * build error, a page rendering a heading above an empty grid. Finding the one group
 * that has children cannot break that way, and there is only ever one.
 */
const services = primaryNav.find((group) => group.items)?.items ?? []

export default function Page() {
  return (
    <Container className="py-(--spacing-section)">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Our Services
      </h1>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service.href}>
            <Link
              href={service.href}
              className="block h-full rounded-(--radius-card) border border-border bg-surface p-6 text-ink no-underline transition-colors hover:border-brand-green-300 hover:bg-brand-green-50"
            >
              <span className="text-lg font-medium">{service.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  )
}
