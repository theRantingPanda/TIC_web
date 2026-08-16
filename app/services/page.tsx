import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { LeadMagnetPanel } from '@/components/lead-magnet-panel'
import { concerns } from '@/content/concerns'
import { getPublishedPosts } from '@/lib/content'
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
 * already knows — the cover pages, and the posts from content/blog. Replace it with real
 * copy when it can be written.
 *
 * Listing the posts here also gives them somewhere to be linked from: the 8 Wix
 * blog-category pages were deliberately dropped, and this is the closest thing the site
 * has to an index.
 *
 * It also lists all eight concern pages, which is this page's second job: the homepage
 * shows four at a time behind a fork, so this is the only place a visitor can see the
 * whole set at once, and the only flat internal link to every one of them.
 */
export const metadata: Metadata = {
  title: 'Services',
  description:
    'What The Insurance Concierge arranges — international health, maternity and newborn, employee benefits, and cover for offshore and deployed teams — plus answers to common questions.',
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
  const posts = getPublishedPosts()

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
          {concerns.map((concern) => (
            <li key={concern.key}>
              <Link
                href={concern.path}
                className="block h-full rounded-(--radius-panel) border border-border bg-surface p-5 no-underline hover:border-ink-muted"
              >
                <span className="block font-serif text-lg text-ink">
                  {concern.cardTitle}
                </span>
                <span className="mt-1 block text-sm text-ink-muted">{concern.hook}</span>
              </Link>
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

      {posts.length > 0 ? (
        <section className="mt-(--spacing-section) border-t border-border pt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Common questions
          </h2>
          <ul className="mt-8 space-y-8">
            {posts.map((post) => (
              <li key={post.frontmatter.slug}>
                <Link
                  href={`/single-post/${post.frontmatter.slug}`}
                  className="text-lg font-medium text-ink no-underline hover:text-brand-blue"
                >
                  {post.frontmatter.title}
                </Link>
                <p className="mt-1 max-w-2xl text-base/7 text-ink-muted">
                  {post.frontmatter.summary}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  )
}
