import Link from 'next/link'
import { Container } from '@/components/container'
import { ChevronDownIcon } from '@/components/icons'
import { about, contact, footerNav, regulatory, siteConfig } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="mt-(--spacing-section) border-t border-border bg-surface-subtle">
      <Container className="py-12">
        {/*
          Tight vertical rhythm below sm, where the columns are stacked accordion rows and
          a 40px gap between four collapsed headings reads as four orphaned labels rather
          than as a list. From sm up the grid gap is what it always was.
        */}
        <div className="grid gap-x-10 gap-y-1 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
          <div className="mb-6 sm:mb-0">
            <p className="text-lg font-semibold tracking-tight text-ink">
              {siteConfig.name}
            </p>
            <p className="mt-2 max-w-xs text-sm text-ink-muted">{about}</p>
            <p className="mt-4 text-sm">
              <a
                href={`mailto:${contact.email}`}
                className="text-ink no-underline hover:text-brand-blue"
              >
                {contact.email}
              </a>
            </p>
            {/*
              Moved out of the hero on 2026-08-16 per the copy deck. It belongs here or
              in social bios, not above the fold where it competes with the subhead.
            */}
            <p className="mt-2 text-sm text-ink-muted">#askTheInsuranceConcierge</p>
            <ul className="mt-3 flex gap-4">
              {contact.social.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    rel="noreferrer"
                    className="text-sm text-ink-muted no-underline hover:text-brand-blue"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/*
            Accordions below md, plain columns from md up.

            The footer grew from three columns to four when the concern pages landed, each
            with five entries, so mobile ended in a second sitemap longer than the
            decision interface above it. A design review flagged it and was right: it was
            roughly a third of the page.

            Built on <details>, like components/site-nav.tsx and components/faq.tsx, so it
            needs no JavaScript and cannot break on a hydration failure. app/globals.css
            forces every group open from md up and hides the chevron there, so the desktop
            footer is unchanged.

            The <nav> stays outside the <details> so each landmark and its accessible name
            survive whether the group is open or shut.
          */}
          {footerNav.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <details data-footer-group className="group border-b border-border sm:border-0">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted marker:content-none sm:py-0">
                  {group.heading}
                  <ChevronDownIcon
                    data-footer-chevron
                    className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                  />
                </summary>
                <ul className="mt-1 space-y-2 pb-4 sm:mt-3 sm:pb-0">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-ink no-underline hover:text-brand-blue"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-ink-muted">
          {/* Licensing disclosure — on every page of the live site, and required to be. */}
          <p className="max-w-3xl">{regulatory}</p>
          <p className="mt-4">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}
