import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/container'
import { Prose } from '@/components/prose'
import {
  getPublishedPostSlugs,
  getPublishedPosts,
  readPost,
  renderMdx,
} from '@/lib/content'

/** How many sibling posts to link at the foot of a post. Matches the Wix sidebar. */
const RELATED_COUNT = 3

/**
 * Blog posts, preserved at their original Wix `/single-post/...` paths.
 *
 * A catch-all rather than `[slug]` because two posts carry a `/YYYY/MM/DD/` segment
 * (e.g. /single-post/2018/04/30/travel-insurance-tips-i-wished-i-knew). Those are
 * indexed, so the path shape has to survive the migration even though it is a Wix-ism.
 *
 * Params come from content/blog — the files are the source of truth for what exists.
 * content/url-contract.json is the assertion that they all still ship, checked against
 * the real build output by `npm run verify:urls`.
 *
 * `dynamicParams = false` matters under static export: without it, a path outside
 * generateStaticParams fails the build rather than 404ing, which would make an
 * unlisted post look like a build error instead of missing content.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return getPublishedPostSlugs().map((slug) => ({ slug: slug.split('/') }))
}

function loadPost(slug: string[]) {
  const joined = slug.join('/')
  return getPublishedPostSlugs().includes(joined) ? readPost(joined) : null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = loadPost(slug)
  if (!post) return {}

  const { title, summary, publishedAt, author, heroImage } = post.frontmatter
  return {
    title,
    description: summary,
    alternates: { canonical: `/single-post/${post.frontmatter.slug}` },
    openGraph: {
      type: 'article',
      title,
      description: summary,
      publishedTime: publishedAt,
      authors: [author],
      ...(heroImage ? { images: [heroImage] } : {}),
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  const post = loadPost(slug)
  if (!post) notFound()

  const Content = await renderMdx(post.body)
  const { title, summary, publishedAt, author, heroImage, heroAlt } = post.frontmatter

  const related = getPublishedPosts()
    .filter((item) => item.frontmatter.slug !== post.frontmatter.slug)
    .slice(0, RELATED_COUNT)

  return (
    <Container className="py-(--spacing-section)">
      <article>
        <header>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-ink-muted">
            <time dateTime={publishedAt}>
              {new Date(`${publishedAt}T00:00:00Z`).toLocaleDateString('en-SG', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              })}
            </time>
            {' · '}
            {author}
          </p>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">{summary}</p>
        </header>

        {heroImage ? (
          <Image
            src={heroImage}
            /*
             * Empty alt where the original had none. Decorative is the honest encoding
             * for "no alt text was written" — inventing a description would be worse.
             * Writing real alt text is on the port worklist.
             */
            alt={heroAlt ?? ''}
            width={2000}
            height={1000}
            sizes="(min-width: 768px) 48rem, 100vw"
            className="mt-10 h-auto w-full rounded-(--radius-card) object-cover"
          />
        ) : null}

        <Prose className="mt-10">
          <Content />
        </Prose>
      </article>

      {related.length > 0 ? (
        /*
         * Internal links between posts. The Wix original carried these as an "Our
         * Recent Posts" sidebar; the only other things linking to posts were the 8
         * blog-category pages, which are deliberately dropped (url-contract.json).
         * Without this the 12 posts would ship orphaned — reachable only from search.
         */
        <aside className="mt-(--spacing-section) border-t border-border pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            More posts
          </h2>
          <ul className="mt-4 space-y-4">
            {related.map((item) => (
              <li key={item.frontmatter.slug}>
                <Link
                  href={`/single-post/${item.frontmatter.slug}`}
                  className="text-base font-medium text-ink no-underline hover:text-brand-blue"
                >
                  {item.frontmatter.title}
                </Link>
                <p className="mt-1 max-w-2xl text-sm text-ink-muted">
                  {item.frontmatter.summary}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </Container>
  )
}
