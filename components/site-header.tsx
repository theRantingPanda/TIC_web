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

            Pulled from Wix as `Logo-v1Apr19.png` at 508x114 and CROPPED to its ink on
            2026-08-17. The original carried 13% transparent margin vertically, so at any
            given CSS height only 87% of the box was actually logo — the mark rendered
            shorter than the "Talk to us" button beside it, which is the wrong way round
            for a brand mark. The box is now the artwork, so a height class means what it
            says. The roundel alone is in public/images/logo-mark.png if a square mark is
            ever needed.

            SIZED RESPONSIVELY, and the two values are not interchangeable. At 484:99 the
            mark is nearly five times wider than it is tall, so height is really a width
            budget. A 390px header also has to hold the menu toggle and the CTA, which
            leaves roughly 140px for the logo — hence h-8 there. From md there is room for
            h-10, which is 44% more logo than the uncropped 32px it replaced.

            Sized explicitly because images.unoptimized is mandatory under static export,
            so the intrinsic dimensions are the only thing preventing layout shift.

            The wordmark reads "InsuranceConcierge", so the accessible name on the link is
            the firm's full name rather than the alt text being left to carry it.
          */}
          <Image
            src="/images/logo-wordmark.png"
            alt={siteConfig.name}
            width={484}
            height={99}
            priority
            className="h-8 w-auto md:h-10"
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
