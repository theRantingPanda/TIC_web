import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/container'
import { ctaClassName } from '@/components/cta-button'

export const metadata: Metadata = {
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <Container className="py-(--spacing-section)">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-green">
        404
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        We couldn&rsquo;t find that page
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        The page may have moved. Try the knowledge base, or head back to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className={ctaClassName()}
        >
          Back to home
        </Link>
        <Link
          href="/knowledge"
          className={ctaClassName('secondary')}
        >
          Knowledge base
        </Link>
      </div>
    </Container>
  )
}
