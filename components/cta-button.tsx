import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * The one button.
 *
 * Introduced 2026-08-16 with the logo-derived palette, which made the previous pattern
 * unshippable: every call to action on the site was `bg-brand-green` with white text,
 * and the real brand green carries white at 2.80:1. There is no darker green that both
 * clears contrast and still reads as the logo's colour, so the primary button is ink on
 * paper (14.05:1) instead. That is also what the design direction asks for — a calm dark
 * button rather than a coloured one — so this is a fix and a design decision at once.
 *
 * Consolidating them here rather than fixing eighteen inline class strings is the point:
 * the next palette change touches one file. Do NOT reintroduce a coloured button
 * variant without running the contrast maths first.
 *
 * `secondary` is the outlined pair for a two-door hero, and `quiet` is the text-weight
 * link used at the foot of a panel where a filled button would be too loud for a step
 * the visitor has already half-taken.
 */
type Variant = 'primary' | 'secondary' | 'quiet'

export function CtaButton({
  href,
  children,
  variant = 'primary',
  size = 'default',
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: Variant
  /** `compact` is the header's height. Everywhere else uses the default. */
  size?: 'default' | 'compact'
  className?: string
}) {
  return (
    <Link href={href} className={`${ctaClassName(variant, size)} ${className}`}>
      {children}
      {variant === 'quiet' ? <span aria-hidden="true"> &rarr;</span> : null}
    </Link>
  )
}

/**
 * The same classes, for the places a `<Link>` is wrong: a `<button type="submit">` in a
 * form, or an `<a href="mailto:">`. Exported so those cannot drift from the component.
 */
export function ctaClassName(
  variant: Variant = 'primary',
  size: 'default' | 'compact' = 'default',
) {
  const base =
    'inline-block rounded-(--radius-card) text-sm font-medium no-underline transition-colors'

  if (variant === 'quiet') {
    return `${base} text-brand-blue hover:text-brand-blue-700`
  }

  const padding = size === 'compact' ? 'px-4 py-2' : 'px-5 py-3'

  if (variant === 'secondary') {
    return `${base} ${padding} border border-ink/25 bg-transparent text-center text-ink hover:border-ink hover:bg-ink/5`
  }

  return `${base} ${padding} bg-ink text-center text-surface-subtle hover:bg-ink/90 disabled:opacity-60`
}
