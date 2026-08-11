import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/container'
import { getPublishedPosts } from '@/lib/content'

/**
 * NOT a port — there was nothing to port.
 *
 * Wix renders this page client-side and its bundles could not be reached, so the
 * capture is empty (see content/_inventory/_capture-status.md). No original copy exists
 * in this repo, and none has been invented for it.
 *
 * What is here is the firm's own maternity copy, reused rather than written: the two
 * maternity-related cards from the homepage, and the maternity posts that were ported.
 * That keeps an indexed, nav-linked page from being a blank, and every sentence on it
 * is one the firm already publishes elsewhere.
 *
 * Replace this the moment the real page can be captured or its copy supplied.
 */
export const metadata: Metadata = {
  title: 'Maternity Insurance',
  description:
    'Maternity and newborn cover — for unexpected cesareans, complications, congenital issues, vaccinations and direct access to paediatricians.',
}

const cards = [
  {
    title: 'Maternity',
    body: 'Unexpected cesarean, complications and congenital issues. We hope not but money should be the last concern then.',
    image: '/images/50b90fb3dac547b58b92ffce7e9c2e6a-2e95b71a.jpg',
    alt: 'Pregnant Belly',
    width: 2000,
    height: 1333,
  },
  {
    title: 'Newborns',
    body: 'Vaccinations and Direct access to Pediatricians. Least we can do while you undertake sleepless nights and dirty diapers.',
    image: '/images/nsplsh-496637654d2d6637456867-mv2-d-3712-5568-s-4-2-30ef3791.jpg',
    alt: 'Image by Kelly Sikkema',
    width: 1333,
    height: 1999,
  },
] as const

export default function Page() {
  const related = getPublishedPosts().filter((post) =>
    /maternity|newborn|pre-existing/i.test(
      `${post.frontmatter.title} ${post.frontmatter.summary}`,
    ),
  )

  return (
    <Container className="py-(--spacing-section)">
      <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Maternity Insurance
      </h1>

      <ul className="mt-12 grid gap-8 sm:grid-cols-2">
        {cards.map((card) => (
          <li key={card.title}>
            <Image
              src={card.image}
              alt={card.alt}
              width={card.width}
              height={card.height}
              sizes="(min-width: 640px) 32rem, 100vw"
              className="h-56 w-full rounded-(--radius-card) object-cover"
            />
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">
              {card.title}
            </h2>
            <p className="mt-2 text-base/7 text-ink-muted">{card.body}</p>
          </li>
        ))}
      </ul>

      {related.length > 0 ? (
        <section className="mt-(--spacing-section) border-t border-border pt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Common questions
          </h2>
          <ul className="mt-8 space-y-8">
            {related.map((post) => (
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
