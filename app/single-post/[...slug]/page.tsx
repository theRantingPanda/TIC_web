import type { Metadata } from 'next'
import { PageShell } from '@/components/page-shell'
import { blogPostPaths } from '@/lib/site'

/**
 * Blog posts, preserved at their original Wix `/single-post/...` paths.
 *
 * A catch-all rather than `[slug]` because two posts carry a `/YYYY/MM/DD/` segment
 * (e.g. /single-post/2018/04/30/travel-insurance-tips-i-wished-i-knew). Those are
 * indexed, so the path shape has to survive the migration even though it is a Wix-ism.
 *
 * `dynamicParams = false` matters under static export: without it, a path outside
 * generateStaticParams fails the build rather than 404ing, which would make an
 * unlisted post look like a build error instead of missing content.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return blogPostPaths.map((path) => ({
    slug: path.replace('/single-post/', '').split('/'),
  }))
}

function titleFromSlug(slug: string[]): string {
  const last = slug[slug.length - 1] ?? ''
  return last
    .split('-')
    .map((word) => (word.length > 2 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  return { title: titleFromSlug(slug) }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params
  return (
    <PageShell
      title={titleFromSlug(slug)}
      lede="Post content is ported in Phase 3. The route exists now so the URL contract holds."
    />
  )
}
