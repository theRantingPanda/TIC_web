import Link from 'next/link'
import { moreNav, primaryNav } from '@/lib/site'

/**
 * Primary navigation with a "More" overflow group, mirroring the current Wix nav.
 *
 * Both the overflow group and the small-screen menu are built on <details>/<summary>
 * so they work with zero JavaScript. That matters here: the site is a static export
 * and nav must not depend on hydration.
 */
export function SiteNav() {
  return (
    <nav aria-label="Primary">
      {/* Small screens: whole nav collapses into one disclosure. */}
      <details className="group relative md:hidden">
        <summary
          className="flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink marker:content-none"
          aria-label="Toggle navigation menu"
        >
          <span
            aria-hidden="true"
            className="inline-block h-0.5 w-5 bg-current shadow-[0_6px_0_currentColor,0_-6px_0_currentColor]"
          />
          Menu
        </summary>
        <ul className="absolute right-0 z-20 mt-2 w-64 rounded-(--radius-card) border border-border bg-surface py-2 shadow-lg">
          {[...primaryNav, ...moreNav].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2 text-sm text-ink no-underline hover:bg-brand-green-50 hover:text-brand-green-700"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </details>

      {/* Medium and up: inline links plus a "More" disclosure. */}
      <ul className="hidden items-center gap-1 md:flex">
        {primaryNav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink no-underline hover:bg-brand-green-50 hover:text-brand-green-700"
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink marker:content-none">
              More
              <span
                aria-hidden="true"
                className="text-xs transition-transform group-open:rotate-180"
              >
                ▾
              </span>
            </summary>
            <ul className="absolute right-0 z-20 mt-2 w-56 rounded-(--radius-card) border border-border bg-surface py-2 shadow-lg">
              {moreNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-4 py-2 text-sm text-ink no-underline hover:bg-brand-green-50 hover:text-brand-green-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        </li>
      </ul>
    </nav>
  )
}
