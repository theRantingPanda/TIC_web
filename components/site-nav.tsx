import Link from 'next/link'
import { ctaLink, flatNav, primaryNav } from '@/lib/site'

/**
 * Primary navigation, mirroring the live Wix nav: top-level entries, two of which
 * (Services, Members) open a dropdown. "Services" is both a link and a dropdown parent,
 * which is why a group can carry an href and items at once.
 *
 * Dropdowns and the small-screen menu are built on <details>/<summary> so they work
 * with zero JavaScript. That matters here: the site is a static export and nav must not
 * depend on hydration.
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
          {flatNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2 text-sm text-ink no-underline hover:bg-brand-green-50 hover:text-brand-green-700"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {/*
            The header's CTA button is hidden below md, so it lives here instead. It is
            not part of flatNav because it is not a nav destination.
          */}
          <li className="mt-1 border-t border-border pt-1">
            <Link
              href={ctaLink.href}
              className="block px-4 py-2 text-sm font-medium text-brand-green-700 no-underline hover:bg-brand-green-50"
            >
              {ctaLink.label}
            </Link>
          </li>
        </ul>
      </details>

      {/* Medium and up: inline entries, with a disclosure for those that have children. */}
      <ul className="hidden items-center gap-1 md:flex">
        {primaryNav.map((group) =>
          group.items ? (
            <li key={group.label}>
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-ink marker:content-none">
                  {group.label}
                  <span
                    aria-hidden="true"
                    className="text-xs transition-transform group-open:rotate-180"
                  >
                    ▾
                  </span>
                </summary>
                <ul className="absolute left-0 z-20 mt-2 w-64 rounded-(--radius-card) border border-border bg-surface py-2 shadow-lg">
                  {/*
                   * A group that is also a link (Services -> /blog) needs its own entry
                   * here: on a touch screen the summary opens the menu rather than
                   * following the link, so without this the landing page is unreachable.
                   */}
                  {group.href ? (
                    <li>
                      <Link
                        href={group.href}
                        className="block px-4 py-2 text-sm font-medium text-ink no-underline hover:bg-brand-green-50 hover:text-brand-green-700"
                      >
                        {group.label} overview
                      </Link>
                    </li>
                  ) : null}
                  {group.items.map((item) => (
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
          ) : (
            <li key={group.label}>
              <Link
                href={group.href ?? '/'}
                className="rounded-md px-3 py-2 text-sm font-medium text-ink no-underline hover:bg-brand-green-50 hover:text-brand-green-700"
              >
                {group.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </nav>
  )
}
