import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { siteConfig } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  /**
   * Sitewide canonical URLs.
   *
   * `'./'` resolves per route against metadataBase, so every page declares itself
   * canonical at https://www.asktic.com/<its own path>. Routes that set their own
   * `alternates.canonical` — the blog posts, /privacy — override this, which is the
   * intended precedence.
   *
   * This matters more than usual here. The site answers on both asktic.com and
   * www.asktic.com, so every page is reachable at two hostnames; without a canonical,
   * search engines split the signal between them. That is a direct tax on the one
   * asset this whole migration exists to protect. Ideally the apex 301s to www as
   * well — see the note in render.yaml — but the canonical is what makes the
   * duplication harmless in the meantime.
   */
  alternates: { canonical: './' },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    url: siteConfig.url,
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-SG">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only rounded-md bg-brand-blue px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
