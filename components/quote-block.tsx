import { Reveal } from '@/components/reveal'

/**
 * The case study block.
 *
 * A static blockquote, deliberately not a carousel. Every testimonial pattern in the
 * reference design is either a Swiper or a fan of rotated cards; both say "we have many
 * of these" and both bury the one that matters. This page has one case and it carries
 * most of the persuasive weight, so it gets the whole width and stands still.
 *
 * No avatar, no star rating, no employer logo. The case is anonymised on purpose and a
 * stock face attached to a real family's worst week would be worse than no face.
 */
export function QuoteBlock({
  paragraphs,
  footer,
}: {
  paragraphs: readonly string[]
  /** The closing line. Set apart because it is the case's verdict, not more narrative. */
  footer?: string
}) {
  return (
    <Reveal className="mx-auto max-w-[59rem]">
      <blockquote className="rounded-(--radius-panel) border border-border bg-surface-subtle p-8 sm:p-10">
        {paragraphs.map((paragraph, index) => (
          <p
            key={paragraph.slice(0, 40)}
            className={`text-base/8 text-ink ${index > 0 ? 'mt-5' : ''}`}
          >
            {paragraph}
          </p>
        ))}
        {footer ? (
          <p className="mt-6 border-t border-border pt-6 text-base/8 font-medium text-ink">
            {footer}
          </p>
        ) : null}
      </blockquote>
    </Reveal>
  )
}
