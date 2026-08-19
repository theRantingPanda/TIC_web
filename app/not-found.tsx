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
      {/*
        The second button pointed at /knowledge until 2026-08-17, when the knowledge base
        and every article were retired from the public site. A 404 page offering a link to
        a page that is also gone is the worst place in the site to leave a dead link, since
        this is where people land precisely because something has already failed them.

        What replaced it goes somewhere that will still exist: what we do. Do not put a
        second destination here for the sake of symmetry.

        The knowledge base returned at /kb on 2026-08-18, and it is still NOT offered here
        (owner's ruling, 2026-08-19). This site addresses prospects; the knowledge base
        addresses members. Someone who has mistyped a marketing URL is not who it is for.
        Full reasoning beside `primaryNav` in lib/site.ts, which is where that call is made
        once rather than twice.
      */}
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">
        The page may have moved. Head back to the homepage, or see what we do.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className={ctaClassName()}
        >
          Back to home
        </Link>
        <Link
          href="/services"
          className={ctaClassName('secondary')}
        >
          What we do
        </Link>
      </div>
    </Container>
  )
}
