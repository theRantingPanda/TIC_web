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
 * No count-up animation. The odometer treatment in the reference design stacks each
 * digit as its own element, which breaks text selection, reads badly to a screen reader,
 * and would need a matchMedia guard to respect reduced motion. A number is more credible
 * standing still.
 */
export function StatBand({
  stats,
  intro,
  footnote,
}: {
  stats: readonly Stat[]
  intro?: string
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
            <div
              key={stat.label}
              className="flex-1 px-6 py-8 not-last:border-b not-last:border-border md:not-last:border-r md:not-last:border-b-0"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="text-display-md lg:text-display-lg block font-semibold text-ink">
                  {stat.figure}
                </span>
                <span className="text-eyebrow mt-2 block uppercase text-ink-muted">
                  {stat.label}
                </span>
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
