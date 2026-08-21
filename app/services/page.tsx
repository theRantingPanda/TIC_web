import type { Metadata } from 'next'
import Link from 'next/link'
import { ConcernCard } from '@/components/concern-card'
import { Container } from '@/components/container'
import { LeadMagnetPanel } from '@/components/lead-magnet-panel'
import { concerns, spansFullWidth } from '@/content/concerns'
import { contact } from '@/lib/site'

/**
 * The services landing page.
 *
 * Moved here from `/blog` on 2026-08-16. That path was what the live Wix nav labelled
 * "Services" — its Wix title was "Resource | The Insurance Concierge" and it was never a
 * blog index. The homepage copy deck puts Services at `/services`, so `/blog` is now a
 * 301 to this page and the search equity follows. See content/url-contract.json.
 *
 * NOT a port: Wix rendered the original client-side and its content could never be
 * captured, so there is no original copy to reproduce. It is built from what the site
 * already knows — the cover pages. Replace it with real copy when it can be written.
 *
 * It listed every post from content/blog until 2026-08-17, which also gave those articles
 * somewhere to be linked from, the 8 Wix blog-category pages having been dropped. The
 * articles have now been retired from the public site and moved to the CRM, so that list
 * went with them and this page is no longer an index of anything but the cover pages.
 *
 * It also lists all eight concern pages, which is this page's second job: the homepage
 * shows four at a time behind a fork, so this is the only place a visitor can see the
 * whole set at once, and the only flat internal link to every one of them.
 */
export const metadata: Metadata = {
  title: 'Services',
  description:
    'What The Insurance Concierge arranges — international health, maternity and newborn, employee benefits, and cover for offshore and deployed teams — plus what happens after a policy is placed.',
}

/**
 * Explicit, deliberately NOT derived from `primaryNav`.
 *
 * The previous version at `/blog` looked this up with
 * `primaryNav.find((g) => g.label === 'Services')`, which returns `[]` the moment that
 * nav group is relabelled — no type error, no build error, an empty grid. The nav group
 * is now called "Cover", so that lookup would already be broken.
 *
 * `/income-preservation-1` is absent because it is retired: it now 301s here. Adding a
 * link to it would point at a redirect source, which is never what you want internally.
 */
const services = [
  {
    href: '/international-health-insurance',
    label: 'International health insurance',
  },
  { href: '/employee-benefits', label: 'Employee benefits' },
] as const

export default function Page() {
  return (
    <Container className="py-(--spacing-section)">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Services
      </h1>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2">
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

      <section className="mt-(--spacing-section) border-t border-border pt-12">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Or start from the situation
        </h2>
        <p className="mt-2 max-w-2xl text-base/7 text-ink-muted">
          The homepage asks which of these is yours and shows four at a time. Here they
          all are.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {concerns.map((concern, index) => (
            <li
              key={concern.key}
              className={
                spansFullWidth(index, concerns.length) ? 'sm:col-span-2' : undefined
              }
            >
              <ConcernCard concern={concern} />
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-(--spacing-section) max-w-2xl">
        {/*
          Rehomed from the old homepage on 2026-08-16, along with its corporate twin,
          which went to /employee-benefits. The two lists stay separate and so do the
          follow-up sequences: do not merge them into one panel on one page.
        */}
        <LeadMagnetPanel
          audience="For individuals and families"
          intro="Moving here, having a baby, coming off a company scheme, or just tired of not understanding what you bought."
          magnetTitle="The maternity and newborn timeline"
          magnetBody="When to buy, what the waiting periods actually mean, and the point after which it is too late. One page, no jargon."
          buttonLabel="Send me the timeline"
          source="services-individual-timeline"
          list="individual"
          contactEmail={contact.email}
        />
      </div>

      {/*
        A "Common questions" list of every published article stood here until 2026-08-17,
        each item linking to /single-post/…. The articles were retired from the public site
        that day and moved to the CRM, so the list had nothing left to link to.

        It was also the last thing on this page, which is the slot the enquiry route wants.
        If something returns here it should not be a list of links away from the page.
      */}
    </Container>
  )
}
