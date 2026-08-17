import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/container'
import { CtaButton } from '@/components/cta-button'
import { SiteNav } from '@/components/site-nav'
import { ctaLink, siteConfig } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface-subtle/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center no-underline">
          {/*
            The real logo, replacing the gradient-square placeholder that stood here
            from the scaffold until 2026-08-16.

            Pulled from Wix at its original resolution — `Logo-v1Apr19.png`, 508x114,
            palette PNG with a tRNS chunk, so the ground is genuinely transparent and it
            sits on the stone paper without a white box behind it. The roundel alone is
            in public/images/logo-mark.png at 130x132 if a square mark is ever needed.

            Sized explicitly because images.unoptimized is mandatory under static export,
            so the intrinsic dimensions are the only thing preventing layout shift. Height
            is capped at 32px and width follows the 508:114 ratio.

            The wordmark reads "InsuranceConcierge", so the accessible name on the link is
            the firm's full name rather than the alt text being left to carry it.
          */}
          <Image
            src="/images/logo-wordmark.png"
            alt={siteConfig.name}
            width={508}
            height={114}
            priority
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2">
          <SiteNav />
          {/*
            Hidden below md because the small-screen disclosure in SiteNav carries it as
            its last entry — two CTAs on a 375px header is one too many.
          */}
          <CtaButton
            href={ctaLink.href}
            size="compact"
            className="hidden md:inline-block"
          >
            {ctaLink.label}
          </CtaButton>
        </div>
      </Container>
    </header>
  )
}
