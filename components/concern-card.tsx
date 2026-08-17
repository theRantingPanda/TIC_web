import Link from 'next/link'
import type { ComponentType, SVGProps } from 'react'
import {
  ArriveIcon,
  BriefcaseIcon,
  CeilingIcon,
  DepartIcon,
  HardHatIcon,
  HourglassIcon,
  PulseIcon,
  SproutIcon,
  TrendUpIcon,
} from '@/components/icons'
import type { Concern, ConcernIconKey } from '@/content/concerns'

/**
 * A concern, as a card.
 *
 * Extracted 2026-08-16. Four files were rendering the same title-and-hook pair with
 * their own copy of the markup — the homepage grid, /services, the /employee-benefits
 * hub and the sibling list on every concern page — so a change to the card had to be
 * made four times and could drift three ways. It is one component now.
 *
 * THE MARK. A design review found the grid read as "five identical white rectangles":
 * everything above the drill-down carried the same visual weight, so nothing invited the
 * visitor to continue. The icon is the cheapest fix that does not compromise the flow's
 * central rule — selection steps stay lean, and imagery is earned at the drill-down.
 * It is a wayfinding mark, not an illustration, and NOT a photograph. Do not put
 * photographs on these cards; that turns the page into a generic insurance landing page,
 * which is the thing the whole design is avoiding.
 *
 * The grid span is deliberately NOT decided here. `spansFullWidth` in the content module
 * owns that, because it is a property of the set rather than of any one card.
 */
const icons: Record<ConcernIconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  hourglass: HourglassIcon,
  arrive: ArriveIcon,
  ceiling: CeilingIcon,
  pulse: PulseIcon,
  depart: DepartIcon,
  'trend-up': TrendUpIcon,
  briefcase: BriefcaseIcon,
  'hard-hat': HardHatIcon,
  sprout: SproutIcon,
}

export function ConcernCard({
  concern,
  interactive = false,
}: {
  concern: Concern
  /**
   * The homepage variant.
   *
   * Adds the hooks components/home-flow.tsx needs to enhance the link into an inline
   * reveal, and the selected-state tint. Everywhere else these are plain links and must
   * stay plain: `data-concern-card` outside the flow would be a selector matching
   * something with no panel behind it.
   *
   * It is a real `<a>` either way. With scripting off, the homepage card navigates to
   * the concern's own page, which renders the identical panel.
   */
  interactive?: boolean
}) {
  const Icon = icons[concern.icon]
  const company = concern.audience === 'company'

  // Selected state only exists on the homepage. Green is the individual path, blue the
  // company path, matching the fork and the panel.
  const selected = company
    ? 'aria-[current]:border-brand-blue-600 aria-[current]:bg-brand-blue-50'
    : 'aria-[current]:border-brand-green-600 aria-[current]:bg-brand-green-50'

  return (
    <Link
      href={concern.path}
      data-concern-card={interactive ? concern.key : undefined}
      className={`flex h-full gap-4 rounded-(--radius-panel) border border-border bg-surface p-5 no-underline transition-colors hover:border-ink-muted sm:p-6 ${
        interactive ? selected : ''
      }`}
    >
      {/*
        aria-hidden because the heading beside it already names the thing, and announcing
        it twice is noise. Sized to sit on the cap height of the title next to it.
      */}
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" />
      <span className="block">
        <span className="block font-serif text-lg text-ink">{concern.cardTitle}</span>
        <span className="mt-1 block text-sm text-ink-muted">{concern.hook}</span>
      </span>
    </Link>
  )
}
