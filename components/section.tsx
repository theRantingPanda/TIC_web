import type { ReactNode } from 'react'
import { Container } from '@/components/container'

/**
 * A page band: vertical rhythm, an optional tint, and an anchor target.
 *
 * Exists so section padding is decided once rather than copied between ten sections.
 * The ramp is 56 / 64 / 88 / 100px, which is the reference design's standard step
 * rather than its showcase step (72 / 80 / 96 / 156px) — on a page that has to read
 * calm and rank well, the larger setting mostly buys scroll.
 *
 * `scroll-mt` is not cosmetic. components/site-header.tsx is `sticky top-0` at `h-16`,
 * so without it every in-page anchor lands its heading underneath the header. It is
 * baked in here precisely so it cannot be forgotten on the section that needs it.
 */
export function Section({
  children,
  id,
  tone = 'surface',
  width = 'content',
  className = '',
  labelledBy,
}: {
  children: ReactNode
  id?: string
  tone?: 'surface' | 'subtle'
  width?: 'content' | 'wide'
  className?: string
  /** id of the heading that names this section, for assistive technology. */
  labelledBy?: string
}) {
  const toneClass = tone === 'subtle' ? 'bg-surface-subtle' : 'bg-surface'
  const widthClass = width === 'wide' ? 'max-w-(--container-wide)' : ''

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`scroll-mt-20 ${toneClass} ${className}`}
    >
      <Container
        className={`py-14 md:py-(--spacing-section) lg:py-22 xl:py-(--spacing-section-lg) ${widthClass}`}
      >
        {children}
      </Container>
    </section>
  )
}
