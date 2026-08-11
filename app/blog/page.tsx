import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { getPublishedPosts } from '@/lib/content'
import { primaryNav } from '@/lib/site'

/**
 * The services landing page.
 *
 * `/blog` is the path the live nav labels "Services" — its Wix title is "Resource | The
 * Insurance Concierge" and it is not a blog index. The slug is indexed so it stays.
 *
 * NOT a port: Wix renders this page client-side and its content could never be
 * captured, so there is no original copy to reproduce. It is built from what the site
 * already knows — the five service pages from `primaryNav`, and the posts from
 * content/blog. Replace it with the real copy when it can be captured or written.
 *
 * Listing the posts here also gives them somewhere to be linked from: the 8 Wix
 * blog-category pages were deliberately dropped, and this is the closest thing the site
 * has to an index.
 */
export const metadata: Metadata = {
  title: 'Services',
  description:
    'What The Insurance Concierge arranges — international health, maternity, employee benefits, speciality cover and income preservation — plus answers to common questions.',
}

const services = primaryNav.find((group) => group.label === 'Services')?.items ?? []

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
