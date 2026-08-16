import Link from 'next/link'
import { ChevronDownIcon } from '@/components/icons'

export type FaqItem = {
  question: string
  /** Shown when the item is open. The article's own summary, never a rewrite of it. */
  answer: string
  href: string
}

/**
 * The questions band.
 *
 * Built on <details>/<summary>, like components/site-nav.tsx, so it works with zero
 * JavaScript. The reference design's accordion animates height, icon rotation and a
 * blur-in reveal entirely in GSAP, and sets the panel to height 0 on mount — without
 * the script nothing opens at all. On a static export that is the wrong trade.
 *
 * No FAQPage JSON-LD here, deliberately. The copy deck scopes FAQ structured data to
 * the knowledge base entries themselves ("FAQ schema on knowledge base entries"), and
 * declaring the same question and answer as an FAQPage on both the homepage and the
 * article would be duplicate structured data for one Q&A. Add it on the answer pages.
 */
export function Faq({
  items,
  allAnswersHref,
  allAnswersLabel,
}: {
  items: readonly FaqItem[]
  allAnswersHref: string
  allAnswersLabel: string
}) {
  return (
    <div>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.href}>
            <details className="group rounded-(--radius-card) border border-border bg-surface px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-ink marker:content-none">
                {item.question}
                <ChevronDownIcon className="h-5 w-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
              </summary>
              <div className="pb-6">
                <p className="text-base/7 text-ink-muted">{item.answer}</p>
                <p className="mt-3">
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-brand-blue no-underline hover:text-brand-blue-700"
                  >
                    Read the full answer
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </p>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <p className="mt-8">
        <Link
          href={allAnswersHref}
          className="text-sm font-medium text-brand-blue no-underline hover:text-brand-blue-700"
        >
          {allAnswersLabel}
          <span aria-hidden="true"> &rarr;</span>
        </Link>
      </p>
    </div>
  )
}
