import Link from 'next/link'
import { Container } from '@/components/container'
import { SiteNav } from '@/components/site-nav'
import { ctaLink, siteConfig } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
          aria-label={`${siteConfig.name} — home`}
        >
          {/*
            Wordmark placeholder. The real logo is a Wix asset and will be pulled into
            /public/images by `npm run capture:assets`, then swapped in here.
          */}
          <span
            aria-hidden="true"
            className="inline-block h-7 w-7 rounded-md bg-linear-to-br from-brand-green to-brand-blue"
          />
          <span className="text-lg font-semibold tracking-tight text-ink">
            {siteConfig.shortName}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <SiteNav />
          {/*
            Hidden below md because the small-screen disclosure in SiteNav carries it as
            its last entry — two CTAs on a 375px header is one too many.
          */}
          <Link
            href={ctaLink.href}
            className="hidden rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white no-underline hover:bg-brand-green-700 md:inline-block"
          >
            {ctaLink.label}
          </Link>
        </div>
      </Container>
    </header>
  )
}
