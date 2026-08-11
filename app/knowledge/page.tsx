import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { getPublicKbArticles, getPublishedPosts } from '@/lib/content'
import { contact } from '@/lib/site'

/**
 * The public knowledge base.
 *
 * content/kb/ is empty and stays empty for now: the Freshdesk Solutions corpus was
 * judged stale and is not being ported, so KB copy will be written by hand. This page
 * renders whatever is in content/kb/ and, while that is nothing, does the useful thing
 * instead of apologising — points at the help centre that IS live, and at the questions
 * the blog already answers.
 *
 * support.asktic.com keeps serving Freshdesk articles: Solutions is parked, not
 * retired, so that link works today and is not a promise about the future.
 */
export const metadata: Metadata = {
  title: 'Knowledge Base',
  description:
    'Answers to common questions about international health insurance — claims, renewals, pre-authorisation, maternity and pre-existing conditions.',
}

const HELP_CENTRE = 'https://support.asktic.com/support/solutions'

export default function Page() {
  const articles = getPublicKbArticles()
  const posts = getPublishedPosts()

  return (
    <Container className="py-(--spacing-section)">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Knowledge Base
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        Answers to the questions we are asked most often. If you cannot find what you
        need,{' '}
        <a href={`mailto:${contact.email}`} className="text-brand-blue">
          email us
        </a>
        .
      </p>

      {articles.length > 0 ? (
        <ul className="mt-12 space-y-8">
          {articles.map((article) => (
            <li key={article.frontmatter.slug}>
              <h2 className="text-lg font-medium text-ink">{article.frontmatter.title}</h2>
              <p className="mt-1 max-w-2xl text-base/7 text-ink-muted">
                {article.frontmatter.summary}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <section className="mt-12 rounded-(--radius-card) border border-border bg-surface-subtle p-6">
          <h2 className="text-lg font-medium text-ink">Member help centre</h2>
          <p className="mt-2 max-w-2xl text-base/7 text-ink-muted">
            Guides for existing members — claims, direct billing, portal access and
            policy administration — are served from our help centre.
          </p>
          <p className="mt-4">
            <a href={HELP_CENTRE} rel="noreferrer" className="text-brand-blue">
              Visit the help centre
            </a>
          </p>
        </section>
      )}

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
