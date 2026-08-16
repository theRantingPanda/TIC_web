/**
 * Phase 1 data for the two-field indicative price check (copy deck section 05).
 *
 * ⚠ THERE ARE NO BANDS YET, AND THAT IS DELIBERATE.
 *
 * The deck's result template is "a single adult your age in [country] is typically
 * looking at [S$X,XXX] to [S$X,XXX] a year on a mid-range deductible" — annual, SGD,
 * mid-range deductible. It supplies no figures for it. Section 07 carried that
 * configuration and has been cut. Section 04's band is a different configuration
 * entirely: monthly, USD, in-patient cover only, on a deductible of USD 8,500 or more,
 * which is a top-up sitting above a company plan.
 *
 * So nothing on the page can feed this component, and inventing numbers to fill it
 * would break the rule this repo has held throughout: no page content is invented to
 * paper over something that could not be sourced.
 *
 * The component is built and works. `hasIndicativePricing` is false while `bands` is
 * empty, and app/page.tsx omits the block entirely — section 05 renders its three
 * points alone, which is a complete section rather than a visibly broken one. Dropping
 * real figures in here is the only change needed to turn it on.
 *
 * TO SHIP THIS, decide and record:
 *
 *   1. The configuration. It must be stated in `footnote` in the same detail as the
 *      section 04 band, for the same reason: a range without its deductible and its
 *      cover scope reads as a quote and is not one.
 *   2. The currency. Section 04 publishes USD because three of the four panel products
 *      price in USD. If this component publishes SGD, the page carries two currencies
 *      and the conversion has to be restated at every refresh. Publishing USD in both
 *      places is simpler and the deck lists this as an open decision.
 *   3. The priced age range. `minAge`/`maxAge` bound what the component will quote at
 *      all. Outside them it says so and routes to the form rather than extrapolating —
 *      the deck is explicit that age 60 was never priced and must not be inferred from
 *      30, 40 and 50.
 *   4. A refresh date. The underlying rate sets run to expiry dates and one of them
 *      expires in September 2026.
 *
 * Phase 2 adds the email step and live rates. Do not block the launch on it.
 */

export type AgeBand = {
  /** Both bounds inclusive. */
  minAge: number
  maxAge: number
  /** Annual premium range, in `currency`, for the configuration described in `footnote`. */
  low: number
  high: number
}

export type ResidenceOption = {
  /** Submitted value, and the key phase 2 will use for a residence factor. */
  value: string
  /** Rendered into the result sentence: "a single adult your age in {label}". */
  label: string
  /**
   * False means the component will not quote for this residence and routes to the form
   * instead. Phase 1 has no residence dimension in the data at all, so this is the
   * honest way to express a gap rather than pretending one country's figure fits all.
   */
  priced: boolean
}

export type IndicativePriceTable = {
  currency: 'SGD' | 'USD'
  /** e.g. 'August 2026'. Rendered with every result, never omitted. */
  pricedAt: string
  /** Verbatim disclosure, rendered in full with every result. Must not be trimmed. */
  footnote: string
  minAge: number
  maxAge: number
  residences: readonly ResidenceOption[]
  bands: readonly AgeBand[]
}

export const indicativePrice: IndicativePriceTable = {
  currency: 'SGD',
  pricedAt: '',
  footnote: '',
  minAge: 18,
  maxAge: 55,
  residences: [
    { value: 'SG', label: 'Singapore', priced: true },
    { value: 'other', label: 'somewhere else', priced: false },
  ],
  bands: [],
}

/**
 * Whether the component has anything to say. Read in a server component so the whole
 * block is omitted from the HTML rather than rendered and then hidden.
 */
export const hasIndicativePricing =
  indicativePrice.bands.length > 0 &&
  indicativePrice.footnote.length > 0 &&
  indicativePrice.pricedAt.length > 0
