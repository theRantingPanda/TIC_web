import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { Prose } from '@/components/prose'
import { getPublicKbArticles, getPublishedPosts, renderMdx } from '@/lib/content'
import { contact } from '@/lib/site'

/**
 * The public knowledge base.
 *
 * content/kb/ is empty for now: the Freshdesk Solutions corpus was judged stale and is
 * not being ported, so KB copy will be written by hand. While it is empty this page
 * does the useful thing instead of apologising — points at the help centre that IS
 * live, and at the questions the blog already answers.
 *
 * support.asktic.com keeps serving Freshdesk articles: Solutions is parked, not
 * retired, so that link works today and is not a promise about the future.
 *
 * **Articles are rendered in full here, rather than linked to their own pages.** A
 * `/knowledge/[slug]` route is the eventual shape — the Freshdesk 301 map is specified
 * against `/knowledge/{slug}`, and `getPublicKbSlugs` exists for it — but it cannot be
 * added yet: under `output: 'export'` a dynamic route whose `generateStaticParams`
 * returns an empty array is a hard build error, and there is no content to generate
 * from. Add that route in the same change that adds the first articles; until then,
 * rendering bodies here means an article added to content/kb is readable immediately
 * rather than appearing as a title nobody can open.
 */
export const metadata: Metadata = {
  title: 'Knowledge Base',
  description:
    'Answers to common questions about international health insurance — claims, renewals, pre-authorisation, maternity and pre-existing conditions.',
}

const HELP_CENTRE = 'https://support.asktic.com/support/solutions'

export default async function Page() {
  const articles = getPublicKbArticles()
  const posts = getPublishedPosts()

  const rendered = await Promise.all(
    articles.map(async (article) => ({
      frontmatter: article.frontmatter,
      Content: await renderMdx(article.body),
    })),
  )

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

      {rendered.length > 0 ? (
        <div className="mt-12 space-y-16">
          {rendered.map(({ frontmatter, Content }) => (
            <article key={frontmatter.slug} id={frontmatter.slug}>
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {frontmatter.title}
              </h2>
              <p className="mt-2 max-w-2xl text-base/7 text-ink-muted">
                {frontmatter.summary}
              </p>
              {/*
                * Insurance guidance rots, which is why the schema requires a review
                * date. Showing it lets a reader judge how current the answer is.
                */}
              <p className="mt-2 text-sm text-ink-muted">
                Last reviewed{' '}
                <time dateTime={frontmatter.lastReviewed}>{frontmatter.lastReviewed}</time>
              </p>
              <Prose className="mt-6">
                <Content />
              </Prose>
            </article>
          ))}
        </div>
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
