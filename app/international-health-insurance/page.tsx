import type { Metadata } from 'next'
import Image from 'next/image'
import { Container } from '@/components/container'

/**
 * Ported from the Wix capture
 * (content/_inventory/pages/international-health-insurance.json).
 *
 * Copy is verbatim, including the things the port worklist flags: the heading case of
 * "pRE-EXISTING CONDITIONS", the grammar in "Continuous cover even you relocate", and
 * the "INDICATIVE COST FOR A 30 YEAR OLD" heading that has nothing beneath it. Those are
 * Steven's to revise; reproducing them keeps the port predictable and the diff honest.
 *
 * One exception, 2026-08-16: the stray "COVID-19" eyebrow between the h1 and the lede
 * has been removed. It labelled nothing — there was no COVID section beneath it — and
 * the homepage copy deck's build checklist requires COVID-19 references gone sitewide.
 * An orphan label is a defect rather than copy, so removing it is not a revision.
 *
 * The hero is the original's COVID mouth-swab stock photo, and it is small (999x667) —
 * it is the one image on the site Wix never served at a larger size. Worth replacing
 * when photography is sourced; it dates the page.
 */
export const metadata: Metadata = {
  title: 'International Private Health Insurance',
  description:
    'Hedge the risk of hefty treatment bills wherever you go — top-up cover, globetrotter plans, pre-existing conditions and fast access to specialists.',
}

const sections = [
  {
    title: 'top up Work Cover',
    points: [
      'Boost your medical coverage to millions',
      'Choose the medical provider you prefer',
      'Insurer undertakes the hefty bills directly',
    ],
  },
  {
    title: 'Globetrotters',
    points: [
      'Continuous cover even you relocate to another country',
      'Seek treatment anywhere in the world',
      'Medical Tourism',
    ],
  },
  {
    title: 'pRE-EXISTING CONDITIONS',
    points: [
      'Less dismissive towards pre-existing conditions',
      'Seek cover for chronic conditions',
      'Renewal options beyond age 85',
    ],
  },
  {
    title: 'Expert Help Quickly',
    points: [
      '24/7 medical evacuation assistance',
      'Direct access to specialist without need for referral from GP',
      'Seek 2nd opinion from a panel of experts easily',
    ],
  },
] as const

export default function Page() {
  return (
    <Container className="py-(--spacing-section)">
      <Image
        src="/images/119c11-1dbf48c974b44b688b8d9d340bbdb38f-mv2-0e9ce67a.jpg"
        alt=""
        width={999}
        height={667}
        sizes="(min-width: 1024px) 64rem, 100vw"
        priority
        className="h-64 w-full rounded-(--radius-card) object-cover sm:h-80"
      />

      <h1 className="mt-10 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        International Private Health Insurance
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Hedge the risk of hefty treatment bills wherever you go.
      </p>

      <div className="mt-(--spacing-section) grid gap-10 sm:grid-cols-2">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {section.title}
            </h2>
            <ul className="mt-4 space-y-2">
              {section.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 text-base/7 text-ink-muted before:mt-3 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:bg-brand-green-500 before:content-['']"
                >
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <h2 className="mt-(--spacing-section) text-xl font-semibold tracking-tight text-ink">
        INDICATIVE COST FOR A 30 YEAR OLD
      </h2>
    </Container>
  )
}
