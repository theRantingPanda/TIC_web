import Link from 'next/link'
import type { ComponentType, SVGProps } from 'react'

/**
 * A card in a CardGrid.
 *
 * The whole card is deliberately NOT a link. The copy deck gives each card a named link
 * ("How this works", "The maternity timeline"), and that phrase has to be the link's
 * accessible name — a card-sized hit area announced as its entire body is worse for
 * anyone navigating by link, and it makes the body text unselectable.
 */
export function FeatureCard({
  icon: Icon,
  title,
  body,
  link,
}: {
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  body: string
  link?: { href: string; label: string }
}) {
  return (
    <div className="flex h-full flex-col rounded-(--radius-panel) border border-border bg-surface p-6 sm:p-8">
      {Icon ? <Icon className="h-9 w-9 text-brand-green-600" /> : null}
      <h3 className={`text-display-xs text-ink ${Icon ? 'mt-6' : ''}`}>{title}</h3>
      <p className="mt-2 text-base/7 text-ink-muted">{body}</p>
      {link ? (
        <p className="mt-6">
          <Link
            href={link.href}
            className="text-sm font-medium text-brand-blue no-underline hover:text-brand-blue-700"
          >
            {link.label}
            <span aria-hidden="true"> &rarr;</span>
          </Link>
        </p>
      ) : null}
    </div>
  )
}
