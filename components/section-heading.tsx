import type { ReactNode } from 'react'
import { Reveal } from '@/components/reveal'

/**
 * A section's heading block: optional eyebrow, an h2, optional lede.
 *
 * Wraps its own Reveal, so a heading never has to remember to opt in.
 *
 * This used to be the whole of the site's reveal budget. It is not any more: the concern
 * pages reveal their major bands too, as of 2026-08-18. See the note in
 * components/reveal.tsx for what widened and, more usefully, for what did not.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lede,
  align = 'left',
}: {
  id?: string
  eyebrow?: string
  title: ReactNode
  lede?: ReactNode
  align?: 'left' | 'center'
}) {
  const centred = align === 'center'

  return (
    <Reveal className={centred ? 'mx-auto max-w-[46rem] text-center' : 'max-w-[46rem]'}>
      {eyebrow ? (
        <p className="text-eyebrow font-medium uppercase text-brand-green-700">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className={`text-display-sm sm:text-display-md lg:text-display-lg text-ink ${
          eyebrow ? 'mt-3' : ''
        }`}
      >
        {title}
      </h2>
      {lede ? (
        <p
          className={`mt-3 text-lg/8 text-ink-muted ${centred ? 'mx-auto max-w-[34rem]' : 'max-w-[34rem]'}`}
        >
          {lede}
        </p>
      ) : null}
    </Reveal>
  )
}
