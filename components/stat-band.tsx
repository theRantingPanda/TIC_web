import { Reveal } from '@/components/reveal'

export type Stat = {
  /**
   * A string, not a number. The real values are `1,700+`, `39` and
   * `from USD 95 a month` — formatting is part of the copy and is decided in the copy
   * module, not here.
   */
  figure: string
  label: string
}

/**
 * A band of figures separated by rules.
 *
 * One component, two usages: the numbers band and the cost band, which the copy deck
 * specifies as "same visual treatment as section 02". Keeping them one component is
 * what makes that instruction hold as the page is edited.
 *
 * No count-up animation HERE, and note that is now a narrower claim than it was. The
 * homepage trust band does count up, from components/count-up.tsx, added 2026-08-18.
 *
 * The objection this note originally recorded was to the odometer in the reference
 * design, which stacks each digit as its own element: that breaks text selection, reads
 * badly to a screen reader, and needs a matchMedia guard for reduced motion. Those were
 * objections to a technique, not to the idea, and CountUp answers all three — one text
 * node, an sr-only final figure while it rolls, and a reduced-motion guard. If this
 * component ever gets a call site again, it can use CountUp too.
 */
export function StatBand({
  stats,
  intro,
  footnote,
  figureSize = 'default',
}: {
  stats: readonly Stat[]
  intro?: string
  /**
   * `compact` for figures that are a phrase rather than a number.
   *
   * The copy deck asks for the cost band to carry "same visual treatment as section 02",
   * and it does — same rules, same layout, same component. But section 02's figures are
   * `1,700+` and `39`, while the cost band's are `from USD 95 a month`. At the display
   * size that suits a four-character number, a twenty-character phrase wraps to two
   * lines and shouts. Same treatment means the same pattern, not the same type size for
   * strings five times the length.
   */
  figureSize?: 'default' | 'compact'
  /**
   * Rendered under the band. On the cost band this carries the underwriting and
   * configuration disclosure, which is load-bearing: the figures are low precisely
   * because the configuration is narrow, and a reader who sees the number without
   * "in-patient cover only" and the deductible floor has been misled. Never trim it to
   * balance the layout.
   */
  footnote?: string
}) {
  return (
    <div>
      {intro ? (
        <p className="mb-10 max-w-[46rem] text-lg/8 text-ink-muted">{intro}</p>
      ) : null}

      <Reveal>
        <dl className="flex flex-col rounded-(--radius-band) border border-border bg-surface-subtle md:flex-row">
          {stats.map((stat) => (
            /*
             * flex-col-reverse so the figure reads above its label while the DOM keeps
             * <dt> before <dd>, which is what a description list requires. An earlier
             * version had a visually-hidden <dt> duplicating a visible label span, so
             * every figure was announced twice.
             */
            <div
              key={stat.label}
              className="flex flex-1 flex-col-reverse gap-2 px-6 py-8 not-last:border-b not-last:border-border md:not-last:border-r md:not-last:border-b-0"
            >
              <dt className="text-eyebrow uppercase text-ink-muted">{stat.label}</dt>
              <dd
                className={`font-semibold text-ink ${
                  figureSize === 'compact'
                    ? 'text-display-xs sm:text-display-sm'
                    : 'text-display-md lg:text-display-lg'
                }`}
              >
                {stat.figure}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {footnote ? (
        <p className="text-eyebrow mt-4 max-w-[46rem] text-ink-muted">{footnote}</p>
      ) : null}
    </div>
  )
}
