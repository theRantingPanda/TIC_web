import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { getPublishedPosts } from '@/lib/content'

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
 * `/income-preservation-1` is intentionally absent. The copy deck takes it off the
 * homepage grid and out of the footer, leaving the page live and reachable by search
 * only; it stays in url-contract.json -> preserved and keeps emitting.
 */
const services = [
  {
    href: '/international-health-insurance',
    label: 'International health insurance',
  },
  { href: '/maternity-insurance', label: 'Maternity and newborn' },
  { href: '/employee-benefits', label: 'Employee benefits' },
  { href: '/offshore-and-energy', label: 'Offshore and deployed teams' },
] as const

export default function Page() {
  const posts = getPublishedPosts()

  return (
    <Container className="py-(--spacing-section)">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Services
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
