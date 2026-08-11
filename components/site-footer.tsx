import Link from 'next/link'
import { Container } from '@/components/container'
import { contact, footerNav, siteConfig } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="mt-(--spacing-section) border-t border-border bg-surface-subtle">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold tracking-tight text-ink">
              {siteConfig.name}
            </p>
            <p className="mt-2 max-w-xs text-sm text-ink-muted">
              {siteConfig.description}
            </p>
            <p className="mt-4 text-sm">
              <a
                href={`mailto:${contact.email}`}
                className="text-ink no-underline hover:text-brand-blue"
              >
                {contact.email}
              </a>
            </p>
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

          {footerNav.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                {group.heading}
              </h2>
              <ul className="mt-3 space-y-2">
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
            </nav>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-ink-muted">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}
