import Link from 'next/link'
import { Container } from '@/components/container'
import { about, contact, regulatory, siteConfig } from '@/lib/site'

/**
 * The footer, which carries no navigation.
 *
 * It held a four-column sitemap of 15 links until 2026-08-17, along with the <details>
 * accordions that folded it down on small screens. Both are gone: 12 of the 15 links
 * duplicated the sticky header, so a visitor at the footer already had them 64px above.
 * See the note above `primaryNav` in lib/site.ts for the count and the reasoning, and
 * for the test to apply before putting one back.
 *
 * The accordion machinery went with the columns. It existed only to manage bulk that
 * should not have been here, it cost about thirty lines of CSS in app/globals.css, and it
 * shipped one real bug on the way — the desktop footer rendered with no links at all,
 * because `display: block` does not override Chromium's `::details-content`. Removing the
 * columns removed the reason any of it existed.
 *
 * What is left is what a footer on this site is actually for: who we are, how to reach
 * us, and the disclosures that have to appear on every page — the licensing sentence, the
 * GST registration, and a privacy link. The privacy link is the one survivor of the
 * sitemap and it is not navigation; see the note at its call site below.
 */
export function SiteFooter() {
  return (
    <footer className="mt-(--spacing-section) border-t border-border bg-surface-subtle">
      <Container className="py-12">
        <div>
          <p className="text-lg font-semibold tracking-tight text-ink">{siteConfig.name}</p>
          {/*
            No `max-w-xs` here. It was needed when `about` was a 44-word paragraph; at eight
            words that cap only forces a break mid-tagline on desktop. See lib/site.ts.
          */}
          <p className="mt-2 text-sm text-ink-muted">{about}</p>
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
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-ink-muted">
          {/* Licensing disclosure — on every page of the live site, and required to be. */}
          <p className="max-w-3xl">{regulatory}</p>
          {/*
            The GST registration sits on the copyright line rather than being appended to
            the compliance sentence above. That is the conventional placement for a
            registration number on a Singapore business site, and it keeps the licensing
            statement to the one thing it asserts. New here — it is not on the live site.

            The number is siteConfig.uen, because in Singapore the GST registration number
            is the UEN, and the privacy policy already publishes it as the UEN.
          */}
          <p className="mt-4">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved. GST Reg.{' '}
            {siteConfig.uen}
            {' · '}
            {/*
              THE ONLY NAV LINK LEFT IN THE FOOTER, and it is here rather than in a column
              because it is a disclosure, not navigation — which is why it sits on the
              legal line beside the registration number.

              It nearly went entirely. The plan was to move it to the forms, at the point
              of collection, which is the better place for it. THE FORMS DO NOT RENDER:
              `captureEnabled` in lib/capture.ts is false unless
              NEXT_PUBLIC_N8N_CONTACT_WEBHOOK is set, render.yaml only documents that
              variable rather than setting it, and every capture point currently falls
              back to a mailto. Shipping the move on its own would have taken the live
              site from a privacy link on every page to a privacy link nowhere, on a firm
              that collects personal data and handles health data.

              So both exist. components/capture-form.tsx carries the point-of-collection
              line for when the webhook is configured; this carries the every-page
              obligation regardless. REMOVING THIS IS NOT A TIDY-UP — check that the forms
              actually render in `out/` first.
            */}
            <Link href="/privacy" className="text-ink-muted underline hover:text-brand-blue">
              Privacy
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  )
}
