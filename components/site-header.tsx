import Image from 'next/image'
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
            The real logo, from the firm's own artwork (Logo/Mar19/Artboard 1.png),
            trimmed of its transparent margin and exported at 2x the display width so it
            stays sharp on a retina screen. Images are served unoptimised, so the
            intrinsic dimensions are what prevent layout shift.

            alt is empty and the link carries the accessible name: the wordmark reads
            "InsuranceConcierge", the link means "home", and announcing the brand twice
            on every page is noise.
          */}
          <Image
            src="/images/tic-logo.png"
            alt=""
            width={300}
            height={70}
            priority
            className="h-10 w-auto"
          />
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
