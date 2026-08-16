import type { ReactNode } from 'react'
import { Reveal } from '@/components/reveal'

/**
 * A section's heading block: optional eyebrow, an h2, optional lede.
 *
 * Wraps its own Reveal, which is how the "eight or so instances, heading blocks only"
 * budget stays honest — nothing else on the page needs to opt in, and nothing else
 * should.
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
