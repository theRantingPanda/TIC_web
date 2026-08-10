import Link from 'next/link'
import { Container } from '@/components/container'
import { SiteNav } from '@/components/site-nav'
import { siteConfig } from '@/lib/site'

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
        <SiteNav />
      </Container>
    </header>
  )
}
