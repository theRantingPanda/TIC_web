import type { Metadata } from 'next'
import { Fraunces, Public_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { siteConfig } from '@/lib/site'
import './globals.css'

/**
 * The two faces, self-hosted.
 *
 * next/font downloads these at BUILD time and serves them from this origin, so no
 * request reaches Google from a visitor's browser and there is no layout shift. That
 * also means the build needs network access to fonts.googleapis.com — it has it on
 * Render, and a failure here is a build failure rather than a silent fallback.
 *
 * Both are loaded as VARIABLE fonts — no `weight` array. That is not a preference:
 * next/font rejects `axes` alongside a fixed weight list ("Axes can only be defined for
 * variable fonts"), and `opsz` is the axis that matters here. Fraunces without its
 * optical-size axis is drawn at one size and looks spindly at 44px+. Taking the
 * variable font also means every weight between 400 and 600 is available for the cost
 * of one file rather than three.
 *
 * `SOFT` and `WONK` are deliberately not requested — WONK in particular swaps in the
 * novelty single-storey g and swash l, which is exactly the wrong register here.
 *
 * The variable names end `-src` because app/globals.css maps them into --font-sans and
 * --font-serif, which are the tokens everything else uses. Nothing should reference
 * these two directly.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-fraunces-src',
})

const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans-src',
})

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
    <html lang="en-SG" className={`${fraunces.variable} ${publicSans.variable}`}>
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
