import Link from 'next/link'
import type { Metadata } from 'next'
import { Container } from '@/components/container'

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
          className="rounded-md bg-brand-green px-5 py-2.5 text-sm font-medium text-white no-underline hover:bg-brand-green-700 hover:text-white"
        >
          Back to home
        </Link>
        <Link
          href="/knowledge"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-ink no-underline hover:border-brand-blue hover:text-brand-blue"
        >
          Knowledge base
        </Link>
      </div>
    </Container>
  )
}
